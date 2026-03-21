// PermitWatch AI — Opportunities Service
// Backend-ready service functions for opportunity data.
// In mock mode, filters and returns local mock data.
// When VITE_API_BASE_URL is set, calls real API endpoints.

import { apiRequest, isMockMode } from './apiClient';
import { mockOpportunities } from '../data/mockOpportunities';
import { runScrapePipeline, getPipelineStatus } from './scraperPipeline';

// Re-export pipeline status for UI consumption
export { getPipelineStatus };

// Simulate network delay in mock mode
const mockDelay = (ms = 300) => new Promise((r) => setTimeout(r, ms));

/**
 * Fetch opportunities by city and contractor type.
 *
 * Backend endpoint: GET /api/opportunities
 * Query params: city, contractorType, confidenceThreshold, permitType, projectStage, search
 *
 * @param {string} city               — City ID (e.g. 'san-francisco')
 * @param {string} contractorType     — Contractor type ID (e.g. 'plumber')
 * @param {object} filters            — { confidenceThreshold, permitType, projectStage, searchQuery }
 * @returns {Promise<{ data: Array, total: number }>}
 */
export async function getOpportunities(city, contractorType, filters = {}) {
  if (!isMockMode()) {
    return apiRequest('/api/opportunities', {
      params: {
        city,
        contractorType: contractorType !== 'all' ? contractorType : undefined,
        confidenceThreshold: filters.confidenceThreshold,
        permitType: filters.permitType !== 'all' ? filters.permitType : undefined,
        projectStage: filters.projectStage !== 'all' ? filters.projectStage : undefined,
        search: filters.searchQuery,
      },
    });
  }

  // ——— Mock implementation ———
  await mockDelay();
  let results = [...mockOpportunities];

  if (city) results = results.filter((o) => o.city === city);

  if (contractorType && contractorType !== 'all') {
    results = results.filter((o) =>
      o.contractor_personas_relevant.includes(contractorType)
    );
  }

  if (filters.confidenceThreshold) {
    results = results.filter((o) => o.confidence_score >= filters.confidenceThreshold);
  }

  if (filters.permitType && filters.permitType !== 'all') {
    results = results.filter((o) => o.permit_type === filters.permitType);
  }

  if (filters.projectStage && filters.projectStage !== 'all') {
    results = results.filter((o) => o.project_stage === filters.projectStage);
  }

  if (filters.searchQuery) {
    const q = filters.searchQuery.toLowerCase();
    results = results.filter(
      (o) =>
        o.title.toLowerCase().includes(q) ||
        o.address.toLowerCase().includes(q) ||
        o.project_summary.toLowerCase().includes(q)
    );
  }

  results.sort((a, b) => b.confidence_score - a.confidence_score);
  return { data: results, total: results.length };
}

/**
 * Fetch a single opportunity by ID.
 *
 * Backend endpoint: GET /api/opportunities/:id
 *
 * @param {string} id — Opportunity ID
 * @returns {Promise<{ data: object }>}
 */
export async function getOpportunityById(id) {
  if (!isMockMode()) {
    return apiRequest(`/api/opportunities/${id}`);
  }

  await mockDelay(200);
  const opportunity = mockOpportunities.find((o) => o.id === id);
  if (!opportunity) throw new Error(`Opportunity ${id} not found`);
  return { data: opportunity };
}

/**
 * Trigger a data refresh / import pipeline.
 *
 * When Apify is configured: runs the full pipeline (scrape → transform → analyze).
 * When backend API is set: calls POST /api/opportunities/refresh.
 * Otherwise: mock delay.
 *
 * @param {string} city — City to refresh data for
 * @param {object} [options] — { onProgress, skipAI }
 * @returns {Promise<{ success: boolean, message: string, data?: Array, jobId?: string }>}
 */
export async function refreshOpportunities(city, options = {}) {
  // If backend API is configured, delegate to it
  if (!isMockMode()) {
    return apiRequest('/api/opportunities/refresh', {
      method: 'POST',
      body: { city },
    });
  }

  // Try the Apify pipeline (works in both live and mock Apify modes)
  try {
    const result = await runScrapePipeline(city, {
      onProgress: options.onProgress,
      skipAI: options.skipAI ?? false, // AI enabled — uses Gemini for verification
    });

    return {
      success: true,
      message: `Found ${result.total} opportunities for ${city} (${result.meta.source} mode)`,
      data: result.data,
      meta: result.meta,
    };
  } catch (error) {
    console.error('[Refresh] Pipeline failed:', error);

    // Fallback to existing mock data
    await mockDelay(1000);
    return {
      success: true,
      message: `Refresh triggered for ${city} (fallback)`,
      jobId: `job-${Date.now()}`,
    };
  }
}
