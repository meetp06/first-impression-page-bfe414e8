// PermitWatch AI — Watchlist Service
// Backend-ready service functions for watchlist management.
// In mock mode, updates local state only.
// When VITE_API_BASE_URL is set, calls real API endpoints.

import { apiRequest, isMockMode } from './apiClient';
import { mockOpportunities } from '../data/mockOpportunities';

const mockDelay = (ms = 200) => new Promise((r) => setTimeout(r, ms));

/**
 * Get all saved (watchlisted) opportunities for the current user.
 *
 * Backend endpoint: GET /api/watchlist
 *
 * @returns {Promise<{ data: Array }>}
 */
export async function getWatchlist() {
  if (!isMockMode()) {
    return apiRequest('/api/watchlist');
  }

  await mockDelay();
  const saved = mockOpportunities.filter((o) => o.saved);
  return { data: saved };
}

/**
 * Save an opportunity to the user's watchlist.
 *
 * Backend endpoint: POST /api/watchlist/:opportunityId
 *
 * @param {string} opportunityId — The opportunity to save
 * @returns {Promise<{ success: boolean }>}
 */
export async function addToWatchlist(opportunityId) {
  if (!isMockMode()) {
    return apiRequest(`/api/watchlist/${opportunityId}`, { method: 'POST' });
  }

  await mockDelay();
  const opp = mockOpportunities.find((o) => o.id === opportunityId);
  if (opp) opp.saved = true;
  return { success: true };
}

/**
 * Remove an opportunity from the user's watchlist.
 *
 * Backend endpoint: DELETE /api/watchlist/:opportunityId
 *
 * @param {string} opportunityId — The opportunity to unsave
 * @returns {Promise<{ success: boolean }>}
 */
export async function removeFromWatchlist(opportunityId) {
  if (!isMockMode()) {
    return apiRequest(`/api/watchlist/${opportunityId}`, { method: 'DELETE' });
  }

  await mockDelay();
  const opp = mockOpportunities.find((o) => o.id === opportunityId);
  if (opp) opp.saved = false;
  return { success: true };
}
