// PermitWatch AI — Data Transformer
// Maps raw Apify scraped records into the frontend opportunity schema.
// Handles field normalization, geocoding placeholders, and deduplication.

import { VALID_CONTRACTOR_PERSONAS } from './agentPrompt';

/**
 * Transform a single raw scraped record into a partially-structured opportunity.
 * Fields that need AI analysis (confidence, verification, contractor relevance)
 * get safe defaults — the analysis service fills them in later.
 *
 * @param {object} raw — Raw record from Apify dataset
 * @param {object} meta — { city, sourceName, sourceType }
 * @returns {object} — Partially structured opportunity
 */
export function transformScrapedRecord(raw, meta = {}) {
  const now = new Date().toISOString();
  const city = meta.city || inferCity(raw);

  return {
    // Identity
    id: generateId(raw),
    city,

    // Core fields — best-effort extraction
    title: extractTitle(raw),
    address: extractAddress(raw),
    latitude: raw.latitude || raw.lat || extractLat(raw) || null,
    longitude: raw.longitude || raw.lng || raw.lon || extractLng(raw) || null,

    // Source tracking
    source_type: meta.sourceType || raw.source_type || 'building_permit',
    source_name: meta.sourceName || raw.source_name || 'Unknown Source',
    source_url: raw.source_url || raw.url || raw.pageUrl || '',

    // Project details
    permit_type: normalizePermitType(raw.permit_type || raw.permitType || raw.raw_permit_type || ''),
    project_stage: normalizeProjectStage(raw.permit_status || raw.status || raw.project_stage || ''),
    project_summary: extractSummary(raw),
    contractor_personas_relevant: [], // filled by AI analysis

    // Timeline
    estimated_timeline: raw.estimated_timeline || raw.timeline || '',
    extracted_date: raw.filing_date || raw.date || raw.extractedDate || now.split('T')[0],
    created_at: now,

    // Scoring — defaults, overridden by AI analysis
    confidence_score: computeBaseConfidence(raw),
    verification_status: 'needs_review',
    verification_notes: raw.verification_notes || '',
    risk_flags: [],

    // User state
    saved: false,

    // Raw data preserved for AI analysis
    _raw: raw,
  };
}

/**
 * Transform an entire dataset of raw records, with deduplication.
 *
 * @param {Array<object>} records — Raw Apify dataset items
 * @param {object} meta — { city, sourceName, sourceType }
 * @returns {Array<object>} — Deduplicated, partially structured opportunities
 */
export function transformDataset(records, meta = {}) {
  const seen = new Set();
  const results = [];

  // Flatten: Apify web-scraper wraps pageFunction arrays inside dataset items
  const flatRecords = records.flatMap(item => {
    if (Array.isArray(item)) return item;
    // web-scraper sometimes puts results in a nested array
    if (item && typeof item === 'object' && !item.raw_title && !item.permit_number) {
      const vals = Object.values(item);
      if (vals.length === 1 && Array.isArray(vals[0])) return vals[0];
    }
    return [item];
  }).filter(Boolean);

  for (const raw of flatRecords) {
    // Skip empty or non-object items
    if (!raw || typeof raw !== 'object') continue;
    // Skip items with no useful data
    if (!raw.raw_title && !raw.title && !raw.permit_number && !raw.description && !raw.raw_description) continue;

    const transformed = transformScrapedRecord(raw, meta);

    // Deduplicate by address + title fingerprint
    const fingerprint = `${transformed.address}|${transformed.title}`.toLowerCase().trim();
    if (seen.has(fingerprint)) continue;
    seen.add(fingerprint);

    results.push(transformed);
  }

  return results;
}

/**
 * Merge AI analysis results back into a transformed opportunity.
 * This bridges dataTransformer output with analysisService output.
 *
 * @param {object} opportunity — From transformScrapedRecord()
 * @param {object} analysis   — From analyzeOpportunity()
 * @returns {object} — Fully structured, frontend-ready opportunity
 */
export function mergeAnalysis(opportunity, analysis) {
  return {
    ...opportunity,
    // Overwrite with AI-analyzed values
    title: analysis.title || opportunity.title,
    address: analysis.address || opportunity.address,
    permit_type: analysis.permit_type || opportunity.permit_type,
    project_stage: analysis.project_stage || opportunity.project_stage,
    project_summary: analysis.project_summary || opportunity.project_summary,
    contractor_personas_relevant: analysis.contractor_personas_relevant || [],
    estimated_timeline: analysis.estimated_timeline || opportunity.estimated_timeline,
    confidence_score: analysis.confidence_score ?? opportunity.confidence_score,
    verification_status: analysis.verification_status || opportunity.verification_status,
    verification_notes: analysis.verification_notes
      ? (Array.isArray(analysis.verification_notes)
        ? analysis.verification_notes.join('. ')
        : analysis.verification_notes)
      : opportunity.verification_notes,
    risk_flags: analysis.risk_flags || opportunity.risk_flags,
    // Remove raw data from frontend payload
    _raw: undefined,
  };
}

// ── Field Extraction Helpers ──

function extractTitle(raw) {
  const title = (
    raw.raw_title ||
    raw.title ||
    raw.name ||
    raw.project_name ||
    raw.description?.slice(0, 80) ||
    'Untitled Permit'
  );
  // Capitalize first letter and clean up
  return title.charAt(0).toUpperCase() + title.slice(1);
}

// Extract lat/lng from SF Open Data location object { latitude, longitude }
function extractLat(raw) {
  if (raw.location && typeof raw.location === 'object') {
    return parseFloat(raw.location.latitude) || null;
  }
  return null;
}

function extractLng(raw) {
  if (raw.location && typeof raw.location === 'object') {
    return parseFloat(raw.location.longitude) || null;
  }
  return null;
}

function extractAddress(raw) {
  return (
    raw.raw_address ||
    raw.address ||
    raw.location ||
    raw.site_address ||
    raw.property_address ||
    ''
  );
}

function extractSummary(raw) {
  const parts = [
    raw.raw_description || raw.description || '',
    raw.raw_text || raw.notes || '',
  ].filter(Boolean);

  const combined = parts.join(' ').trim();
  // Cap at 500 chars for frontend
  return combined.length > 500 ? combined.slice(0, 497) + '...' : combined;
}

// ── Normalizers ──

const PERMIT_TYPE_MAP = {
  'new construction': 'New Construction',
  'new building': 'New Construction',
  'renovation': 'Renovation',
  'alteration': 'Renovation',
  'remodel': 'Interior Remodel',
  'interior remodel': 'Interior Remodel',
  'addition': 'Addition',
  'demolition': 'Demolition',
  'electrical': 'Electrical',
  'plumbing': 'Plumbing',
  'mechanical': 'Mechanical/HVAC',
  'hvac': 'Mechanical/HVAC',
  'mechanical/hvac': 'Mechanical/HVAC',
  'roofing': 'Roofing',
  'roof': 'Roofing',
  'tenant improvement': 'Commercial Tenant Improvement',
  'commercial tenant improvement': 'Commercial Tenant Improvement',
  'ti': 'Commercial Tenant Improvement',
};

function normalizePermitType(raw) {
  if (!raw) return 'Renovation'; // safe default
  const key = raw.toLowerCase().trim();
  return PERMIT_TYPE_MAP[key] || raw;
}

const STAGE_MAP = {
  'pre-application': 'Pre-Application',
  'submitted': 'Application Submitted',
  'application submitted': 'Application Submitted',
  'filed': 'Application Submitted',
  'under review': 'Under Review',
  'in review': 'Under Review',
  'review': 'Under Review',
  'approved': 'Approved',
  'permit issued': 'Permit Issued',
  'issued': 'Permit Issued',
  'active': 'Permit Issued',
  'in progress': 'In Progress',
  'construction': 'In Progress',
  'inspection scheduled': 'Inspection Scheduled',
  'inspection': 'Inspection Scheduled',
};

function normalizeProjectStage(raw) {
  if (!raw) return 'Under Review'; // safe default
  const key = raw.toLowerCase().trim();
  return STAGE_MAP[key] || raw;
}

function inferCity(raw) {
  const text = `${raw.raw_address || ''} ${raw.address || ''} ${raw.city || ''}`.toLowerCase();
  if (text.includes('san francisco') || text.includes('sf')) return 'san-francisco';
  if (text.includes('san jose') || text.includes('san josé')) return 'san-jose';
  return 'san-francisco'; // default
}

function generateId(raw) {
  const permitNum = raw.permit_number || raw.permitNumber || '';
  if (permitNum) return `opp-${permitNum}`;

  // Hash from address + title
  const input = `${raw.raw_address || raw.address || ''}|${raw.raw_title || raw.title || ''}`;
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0; // Convert to 32-bit int
  }
  return `opp-${Math.abs(hash).toString(36)}`;
}

/**
 * Compute a base confidence score from field completeness.
 * This gets overridden by AI analysis, but provides a floor.
 */
function computeBaseConfidence(raw) {
  let score = 30; // baseline

  if (raw.raw_address || raw.address) score += 15;
  if (raw.permit_number || raw.permitNumber) score += 10;
  if (raw.filing_date || raw.date) score += 10;
  if (raw.permit_status || raw.status) score += 10;
  if (raw.raw_description || raw.description) score += 10;
  if (raw.source_url || raw.url) score += 5;
  if (raw.raw_title || raw.title) score += 5;

  // Source trust bonus
  const sourceName = (raw.source_name || '').toLowerCase();
  if (sourceName.includes('dbi') || sourceName.includes('permit center')) score += 5;
  if (sourceName.includes('planning')) score += 3;

  return Math.min(score, 85); // cap — only AI can push above 85
}
