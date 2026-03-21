// PermitWatch AI — Scraper Pipeline
// End-to-end orchestration: trigger scrape → poll → fetch → transform → AI analyze → return.
// Falls back to mock data when Apify is not configured.

import { isApifyConfigured, runAndCollect, getMockScrapedData } from './apifyService';
import { getScraperConfig } from './scraperConfigs';
import { transformDataset, mergeAnalysis } from './dataTransformer';
import { analyzeOpportunity } from './analysisService';

/**
 * Run the full scraping pipeline for a city.
 *
 * Flow:
 *   1. Get scraper config for city (actor IDs, inputs)
 *   2. Run Apify actors (or mock) for each source
 *   3. Transform raw records into partial opportunities
 *   4. Run AI analysis on each record (or skip if no AI endpoint)
 *   5. Merge analysis into opportunities
 *   6. Return frontend-ready data
 *
 * @param {string} cityId — e.g. 'san-francisco'
 * @param {object} [options] — { onProgress, maxResults, skipAI }
 * @returns {Promise<{ data: Array, total: number, meta: object }>}
 */
export async function runScrapePipeline(cityId, options = {}) {
  const {
    onProgress = () => {},
    maxResults = 50,
    skipAI = false,
  } = options;

  const startTime = Date.now();
  const config = getScraperConfig(cityId);
  let allRecords = [];

  // ── Step 1: Scrape from each source ──
  onProgress({ stage: 'scraping', message: `Scraping ${config.cityName} sources...`, percent: 10 });

  if (isApifyConfigured()) {
    // Real Apify scraping — run all sources in parallel
    const scrapePromises = config.sources.map(async (source) => {
      try {
        const input = source.getInput({ maxResults });
        const result = await runAndCollect(source.actorId, input, {
          timeoutMs: 90000, // 90 second timeout per actor
          onStatusChange: (status) => {
            onProgress({
              stage: 'scraping',
              message: `${source.name}: ${status}`,
              percent: 20,
            });
          },
        });

        // Tag items with source metadata
        return result.items.map((item) => ({
          ...item,
          source_name: source.name,
          source_type: source.sourceType,
        }));
      } catch (error) {
        console.error(`[Pipeline] Source ${source.name} failed:`, error.message);
        return []; // Don't fail entire pipeline for one source
      }
    });

    const sourceResults = await Promise.all(scrapePromises);
    allRecords = sourceResults.flat();
  } else {
    // Mock fallback
    console.info('[Pipeline] Apify not configured — using mock scraped data.');
    allRecords = await getMockScrapedData(cityId);
  }

  if (allRecords.length === 0) {
    return { data: [], total: 0, meta: { duration: Date.now() - startTime, source: 'none' } };
  }

  // ── Step 2: Transform raw records ──
  onProgress({ stage: 'transforming', message: `Transforming ${allRecords.length} records...`, percent: 50 });

  const transformed = transformDataset(allRecords, { city: cityId });

  // ── Step 3: AI Analysis (optional) ──
  let opportunities;

  if (!skipAI) {
    // Limit AI analysis to top 3 records to avoid Gemini rate limits
    const toAnalyze = transformed.slice(0, 3);
    const rest = transformed.slice(3).map(({ _raw, ...clean }) => clean);

    onProgress({ stage: 'analyzing', message: `AI analyzing ${toAnalyze.length} opportunities...`, percent: 70 });

    const analyzed = [];
    for (const opp of toAnalyze) {
      try {
        const analysis = await analyzeOpportunity(opp._raw || opp);
        analyzed.push(mergeAnalysis(opp, analysis));
      } catch (error) {
        console.warn(`[Pipeline] AI analysis failed for ${opp.id}:`, error.message);
        const { _raw, ...clean } = opp;
        analyzed.push(clean);
      }
      // Rate limit delay — 4s between Gemini calls to avoid 429
      await new Promise(r => setTimeout(r, 4000));
    }

    opportunities = [...analyzed, ...rest];
  } else {
    // Skip AI — use base transformation only
    opportunities = transformed.map(({ _raw, ...clean }) => clean);
  }

  // ── Step 4: Sort by confidence ──
  opportunities.sort((a, b) => b.confidence_score - a.confidence_score);

  onProgress({ stage: 'complete', message: `Found ${opportunities.length} opportunities`, percent: 100 });

  return {
    data: opportunities,
    total: opportunities.length,
    meta: {
      city: cityId,
      duration: Date.now() - startTime,
      rawRecords: allRecords.length,
      afterDedup: transformed.length,
      source: isApifyConfigured() ? 'apify' : 'mock',
    },
  };
}

/**
 * Quick pipeline status check — useful for UI to show whether integration is live.
 */
export function getPipelineStatus() {
  return {
    apifyConfigured: isApifyConfigured(),
    aiConfigured: !!import.meta.env.VITE_AI_ENDPOINT,
    mode: isApifyConfigured() ? 'live' : 'demo',
  };
}
