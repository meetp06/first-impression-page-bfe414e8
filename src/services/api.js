// PermitWatch AI — API Service Layer
// This file re-exports all service functions for backward compatibility.
// Prefer importing directly from individual service modules:
//   import { getOpportunities } from './opportunityService';
//   import { addToWatchlist } from './watchlistService';
//   import { login } from './authService';

// ── API Client ──
export { apiRequest, isMockMode, ApiError } from './apiClient';

// ── Opportunity Service ──
export {
  getOpportunities,
  getOpportunities as fetchOpportunities,    // legacy alias
  getOpportunityById,
  getOpportunityById as fetchOpportunityById, // legacy alias
  refreshOpportunities,
  refreshOpportunities as triggerRefresh,     // legacy alias
} from './opportunityService';

// ── Watchlist Service ──
export {
  getWatchlist,
  addToWatchlist,
  addToWatchlist as saveToWatchlist,           // legacy alias
  removeFromWatchlist,
} from './watchlistService';

// ── Auth Service ──
export {
  login,
  login as loginUser,       // legacy alias
  signup,
  signup as signupUser,     // legacy alias
  logout,
} from './authService';

// ── Apify / Pipeline ──
export { isApifyConfigured, runAndCollect } from './apifyService';
export { runScrapePipeline, getPipelineStatus } from './scraperPipeline';
export { getScraperConfig, getSupportedCities } from './scraperConfigs';
export { transformDataset, mergeAnalysis } from './dataTransformer';
export { analyzeOpportunity, analyzeOpportunities } from './analysisService';

// ── Bid Intelligence ──
export { generateBidIntelligence, BID_ACTOR_CHAIN } from './bidIntelligenceService';

// ── Contact Intelligence ──
export { discoverContacts, CONTACT_ACTOR_CHAIN } from './contactIntelligenceService';
