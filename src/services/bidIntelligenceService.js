// PermitWatch AI — Bid Intelligence Service
// Uses REAL Apify actor: apify/google-search-scraper
// Searches Google for comparable construction costs, then feeds results to Gemini for bid analysis.

import { isApifyConfigured, runAndCollect } from './apifyService';

const AI_ENDPOINT = import.meta.env.VITE_AI_ENDPOINT || '';
const AI_API_KEY  = import.meta.env.VITE_AI_API_KEY || '';
const AI_MODEL    = import.meta.env.VITE_AI_MODEL || 'gemini-2.0-flash';

// ── Apify Actor Config ──
const BID_SEARCH_ACTOR = 'apify/google-search-scraper';

/**
 * Build Google search queries for construction cost research.
 */
function buildBidQueries(opportunity) {
  const city = opportunity.city === 'san-francisco' ? 'San Francisco' : 'San Jose';
  const permitType = opportunity.permit_type || 'renovation';
  const address = opportunity.address || '';

  return [
    `${permitType} construction cost ${city} 2024 2025 average bid`,
    `contractor bid ${permitType} Bay Area California estimated cost`,
  ].join('\n');
}

/**
 * Generate bid intelligence for an opportunity.
 * Flow: Apify Google Search → Gemini AI analysis → bid recommendation
 *
 * @param {object} opportunity
 * @returns {Promise<object>}
 */
export async function generateBidIntelligence(opportunity) {
  let searchResults = [];

  // Step 1: Run Apify Google Search actor for market data
  if (isApifyConfigured()) {
    try {
      console.log('[BidIntelligence] Running apify/google-search-scraper...');
      const { items } = await runAndCollect(BID_SEARCH_ACTOR, {
        queries: buildBidQueries(opportunity),
        countryCode: 'us',
        languageCode: 'en',
        maxPagesPerQuery: 1,
        resultsPerPage: 10,
        mobileResults: false,
        includeUnfilteredResults: false,
      }, { timeoutMs: 60000 });

      // Extract organic results from SERP data
      searchResults = (items || []).flatMap(page =>
        (page.organicResults || []).map(r => ({
          title: r.title,
          description: r.description,
          url: r.url,
        }))
      );
      console.log(`[BidIntelligence] Got ${searchResults.length} Google results`);
    } catch (err) {
      console.warn('[BidIntelligence] Apify search failed:', err.message);
    }
  }

  // Step 2: Feed search results + opportunity to Gemini for analysis
  if (AI_ENDPOINT && AI_API_KEY) {
    try {
      return await getAIBidIntelligence(opportunity, searchResults);
    } catch (err) {
      console.warn('[BidIntelligence] AI analysis failed, using mock:', err.message);
    }
  }

  // Step 3: Fallback to mock
  return getMockBidIntelligence(opportunity);
}

/**
 * AI-powered bid intelligence using Gemini + real Google search data.
 */
async function getAIBidIntelligence(opportunity, searchResults = []) {
  let endpoint = AI_ENDPOINT;
  if (import.meta.env.DEV && endpoint.includes('generativelanguage.googleapis.com')) {
    endpoint = endpoint.replace('https://generativelanguage.googleapis.com', '/gemini-proxy');
  }

  const searchContext = searchResults.length > 0
    ? `\n\nREAL GOOGLE SEARCH RESULTS FOR COMPARABLE COSTS:\n${JSON.stringify(searchResults.slice(0, 15), null, 2)}`
    : '';

  const prompt = `You are a construction cost estimation expert. Analyze this permit/project and generate an optimal bid recommendation for a contractor.

PROJECT DATA:
${JSON.stringify({
  title: opportunity.title,
  address: opportunity.address,
  permit_type: opportunity.permit_type,
  project_stage: opportunity.project_stage,
  project_summary: opportunity.project_summary,
  source_type: opportunity.source_type,
  city: opportunity.city,
}, null, 2)}
${searchContext}

Based on the project data${searchResults.length > 0 ? ' and the REAL Google search results about comparable costs' : ''}, return ONLY valid JSON matching this exact schema (no markdown):
{
  "recommended_bid_range": { "low": <number>, "mid": <number>, "high": <number> },
  "confidence_score": <0-100>,
  "pricing_factors": [<string>, ...],
  "comparable_projects": [{ "name": <string>, "cost": <string>, "similarity": <string> }, ...],
  "neighborhood_budget_insights": <string>,
  "risk_notes": [<string>, ...],
  "explanation": <string>,
  "strategy": { "conservative": <string>, "balanced": <string>, "aggressive": <string> }
}`;

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(AI_API_KEY ? { Authorization: `Bearer ${AI_API_KEY}` } : {}),
    },
    body: JSON.stringify({
      model: AI_MODEL,
      temperature: 0.3,
      messages: [
        { role: 'system', content: 'You are a construction cost estimation AI. Return only valid JSON.' },
        { role: 'user', content: prompt },
      ],
      response_format: { type: 'json_object' },
    }),
  });

  if (!res.ok) throw new Error(`AI bid analysis failed (${res.status})`);

  const result = await res.json();
  const content = result.choices?.[0]?.message?.content;
  if (!content) throw new Error('Empty AI response');

  const parsed = JSON.parse(content);
  return {
    opportunity_id: opportunity.id,
    ...parsed,
    source: searchResults.length > 0 ? 'apify+gemini' : 'gemini-ai',
    apify_results_used: searchResults.length,
    generated_at: new Date().toISOString(),
  };
}

/**
 * Realistic mock bid intelligence data (fallback).
 */
function getMockBidIntelligence(opportunity) {
  return new Promise((resolve) => {
    setTimeout(() => {
      const baseCost = estimateBaseCost(opportunity);
      resolve({
        opportunity_id: opportunity.id,
        recommended_bid_range: {
          low: Math.round(baseCost * 0.85),
          mid: Math.round(baseCost),
          high: Math.round(baseCost * 1.2),
        },
        confidence_score: 72 + Math.floor(Math.random() * 15),
        pricing_factors: [
          `${opportunity.permit_type || 'Renovation'} in ${opportunity.city === 'san-francisco' ? 'San Francisco' : 'San Jose'}`,
          'Current material cost index: elevated',
          'Labor availability in region: moderate',
          `Project stage: ${opportunity.project_stage || 'Under Review'}`,
          'Seasonal demand factor applied',
        ],
        comparable_projects: [
          { name: 'Similar renovation at 450 Bush St', cost: '$' + (baseCost * 0.9).toLocaleString(), similarity: '87% match' },
          { name: 'Commercial TI at 200 Pine St', cost: '$' + (baseCost * 1.1).toLocaleString(), similarity: '74% match' },
          { name: 'Mixed-use build at 500 Folsom', cost: '$' + (baseCost * 1.3).toLocaleString(), similarity: '68% match' },
        ],
        neighborhood_budget_insights: `Projects in this area average $${Math.round(baseCost / 1000)}K for similar scope. The ${opportunity.city === 'san-francisco' ? 'SF' : 'SJ'} market shows 8% YoY cost increases.`,
        risk_notes: [
          'Material costs may fluctuate — recommend price escalation clause',
          'Permit timeline uncertainty — build 15% buffer',
        ],
        explanation: `Based on ${opportunity.permit_type || 'renovation'}-type projects in this neighborhood, the recommended mid-range bid of $${baseCost.toLocaleString()} reflects current market conditions. Conservative bidding at the low end improves win rate but may compress margins.`,
        strategy: {
          conservative: `Bid $${Math.round(baseCost * 0.85).toLocaleString()} — Higher win probability, tighter margins`,
          balanced: `Bid $${baseCost.toLocaleString()} — Market rate, standard margins`,
          aggressive: `Bid $${Math.round(baseCost * 1.2).toLocaleString()} — Premium positioning, lower win rate`,
        },
        source: 'mock',
        apify_results_used: 0,
        generated_at: new Date().toISOString(),
      });
    }, 1800);
  });
}

function estimateBaseCost(opportunity) {
  const typeMultiplier = {
    'New Construction': 450000,
    'Renovation': 180000,
    'Interior Remodel': 120000,
    'Addition': 200000,
    'Electrical': 45000,
    'Plumbing': 55000,
    'Mechanical/HVAC': 65000,
    'Roofing': 35000,
    'Commercial Tenant Improvement': 250000,
    'Demolition': 80000,
  };
  return typeMultiplier[opportunity.permit_type] || 150000;
}

/**
 * Apify Actor Chain definition.
 */
export const BID_ACTOR_CHAIN = {
  actors: [
    { id: 'apify/google-search-scraper', purpose: 'Search Google for comparable construction costs and market data' },
    { id: 'gemini-ai', purpose: 'Analyze search results and generate bid recommendation' },
  ],
  trigger: 'on-demand',
  estimatedRuntime: '15-30 seconds',
};
