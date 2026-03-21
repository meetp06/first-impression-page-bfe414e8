// PermitWatch AI — Opportunity Analysis Service
// Sends scraped permit/planning data to an LLM for verification and scoring.
// Uses the agent prompt from agentPrompt.js for consistent behavior.
//
// Backend integration:
//   Set VITE_AI_ENDPOINT in .env to your LLM API endpoint.
//   Set VITE_AI_API_KEY in .env to your API key.
//   Supports OpenAI-compatible chat/completions APIs.

import { AGENT_SYSTEM_PROMPT, OPPORTUNITY_SCHEMA, VALID_CONTRACTOR_PERSONAS, VALID_VERIFICATION_STATUSES } from './agentPrompt';

const _AI_ENDPOINT_RAW = import.meta.env.VITE_AI_ENDPOINT || '';
const AI_API_KEY  = import.meta.env.VITE_AI_API_KEY || '';
const AI_MODEL    = import.meta.env.VITE_AI_MODEL || 'gpt-4o';

// In dev, route through Vite proxy to bypass CORS
function getAIEndpoint() {
  if (!_AI_ENDPOINT_RAW) return '';
  if (import.meta.env.DEV && _AI_ENDPOINT_RAW.includes('generativelanguage.googleapis.com')) {
    return _AI_ENDPOINT_RAW.replace('https://generativelanguage.googleapis.com', '/gemini-proxy');
  }
  return _AI_ENDPOINT_RAW;
}
const AI_ENDPOINT = getAIEndpoint();

/**
 * Analyze raw scraped permit/planning data and produce a structured opportunity.
 *
 * @param {object} rawData — The raw scraped record with any available fields:
 *   { source_url, source_name, raw_text, title?, address?, date?, permit_number?, ... }
 * @param {object} [options] — Optional overrides: { model, temperature }
 * @returns {Promise<object>} — Validated opportunity matching OPPORTUNITY_SCHEMA
 */
export async function analyzeOpportunity(rawData, options = {}) {
  if (!AI_ENDPOINT) {
    console.warn('[AnalysisService] No VITE_AI_ENDPOINT configured — returning mock analysis.');
    return getMockAnalysis(rawData);
  }

  const model = options.model || AI_MODEL;
  const temperature = options.temperature ?? 0.2; // Low temp for factual output

  const userMessage = `Analyze the following scraped permit/planning data and return a structured opportunity JSON.

SOURCE DATA:
${JSON.stringify(rawData, null, 2)}

Return ONLY valid JSON matching the required schema. Do not include markdown code fences.`;

  const requestBody = JSON.stringify({
    model,
    temperature,
    messages: [
      { role: 'system', content: AGENT_SYSTEM_PROMPT },
      { role: 'user',   content: userMessage },
    ],
    response_format: { type: 'json_object' },
  });

  // Retry with exponential backoff for 429 rate limits
  const MAX_RETRIES = 3;
  let lastError = null;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    if (attempt > 0) {
      const delay = Math.min(5000 * Math.pow(2, attempt - 1), 30000); // 5s, 10s, 20s
      console.log(`[AnalysisService] Retry ${attempt}/${MAX_RETRIES} after ${delay/1000}s...`);
      await new Promise(r => setTimeout(r, delay));
    }

    const response = await fetch(AI_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(AI_API_KEY ? { Authorization: `Bearer ${AI_API_KEY}` } : {}),
      },
      body: requestBody,
    });

    if (response.status === 429) {
      lastError = new Error(`AI rate limited (429) — attempt ${attempt + 1}/${MAX_RETRIES + 1}`);
      console.warn(`[AnalysisService] Rate limited (429), will retry...`);
      continue;
    }

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`AI analysis failed (${response.status}): ${err}`);
    }

    const result = await response.json();
    const content = result.choices?.[0]?.message?.content;

    if (!content) throw new Error('AI returned empty response');

    const parsed = JSON.parse(content);
    return validateOpportunity(parsed);
  }

  // All retries exhausted
  throw lastError || new Error('AI analysis failed after retries');
}

/**
 * Batch-analyze multiple scraped records.
 *
 * @param {Array<object>} records — Array of raw scraped records
 * @param {object} [options] — Optional overrides
 * @returns {Promise<Array<object>>} — Array of validated opportunities
 */
export async function analyzeOpportunities(records, options = {}) {
  const results = [];

  for (const record of records) {
    try {
      const opportunity = await analyzeOpportunity(record, options);
      results.push({ success: true, data: opportunity });
    } catch (error) {
      results.push({ success: false, error: error.message, source: record });
    }
  }

  return results;
}

/**
 * Validate and sanitize an opportunity object against the schema.
 */
function validateOpportunity(opp) {
  // Clamp confidence score
  if (typeof opp.confidence_score === 'number') {
    opp.confidence_score = Math.max(0, Math.min(100, Math.round(opp.confidence_score)));
  } else {
    opp.confidence_score = 0;
    opp.needs_human_review = true;
  }

  // Normalize verification status
  if (!VALID_VERIFICATION_STATUSES.includes(opp.verification_status)) {
    opp.verification_status = 'needs_review';
  }

  // Filter invalid contractor personas
  if (Array.isArray(opp.contractor_personas_relevant)) {
    opp.contractor_personas_relevant = opp.contractor_personas_relevant.filter(
      (p) => VALID_CONTRACTOR_PERSONAS.includes(p)
    );
  } else {
    opp.contractor_personas_relevant = [];
  }

  // Ensure arrays exist
  opp.verification_notes   = opp.verification_notes   || [];
  opp.risk_flags           = opp.risk_flags           || [];
  opp.top_positive_signals = opp.top_positive_signals || [];
  opp.top_negative_signals = opp.top_negative_signals || [];

  // Auto-flag for human review if confidence is low
  if (opp.confidence_score < 60) {
    opp.needs_human_review = true;
  }

  return opp;
}

/**
 * Mock analysis for development when no AI endpoint is configured.
 * Returns a plausible structure based on the raw data fields.
 */
function getMockAnalysis(rawData) {
  return {
    title: rawData.title || 'Untitled Scraped Opportunity',
    city: rawData.city || '',
    address: rawData.address || 'address not confidently verified',
    permit_type: rawData.permit_type || 'unclear',
    project_stage: rawData.project_stage || 'project stage unclear',
    project_summary: rawData.raw_text
      ? rawData.raw_text.slice(0, 300)
      : 'Insufficient data for summary.',
    contractor_personas_relevant: [],
    estimated_timeline: rawData.date || 'unknown',
    confidence_score: 35,
    verification_status: 'needs_review',
    verification_notes: [
      'Mock analysis — no AI endpoint configured.',
      'All fields require human verification.',
    ],
    risk_flags: ['no AI verification', 'mock data only'],
    why_relevant: 'Unable to determine relevance without AI analysis.',
    top_positive_signals: rawData.source_url ? ['Source URL provided'] : [],
    top_negative_signals: ['No AI analysis performed', 'All fields unverified'],
    needs_human_review: true,
  };
}
