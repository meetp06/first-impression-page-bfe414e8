// PermitWatch AI — HTTP API Client
// Central HTTP client with configurable base URL.
// When a real backend is ready, set VITE_API_BASE_URL in .env
// and all service functions will route through it automatically.

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

/**
 * Determines if the app is running in mock mode (no backend configured).
 */
export function isMockMode() {
  return !API_BASE_URL;
}

/**
 * Generic HTTP request wrapper.
 * Handles JSON serialization, auth headers, and error normalization.
 *
 * @param {string} endpoint  — e.g. '/api/opportunities'
 * @param {object} options   — { method, body, params, headers }
 * @returns {Promise<any>}   — parsed JSON response
 */
export async function apiRequest(endpoint, options = {}) {
  const { method = 'GET', body, params, headers = {} } = options;

  // Build URL with query params
  const url = new URL(`${API_BASE_URL}${endpoint}`, window.location.origin);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.append(key, String(value));
      }
    });
  }

  // Attach auth token if present
  const token = localStorage.getItem('permitwatch_token');
  const reqHeaders = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...headers,
  };

  const response = await fetch(url.toString(), {
    method,
    headers: reqHeaders,
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: response.statusText }));
    throw new ApiError(response.status, error.message || 'Request failed', error);
  }

  // Handle 204 No Content
  if (response.status === 204) return { success: true };

  return response.json();
}

/**
 * Custom API error class for structured error handling.
 */
export class ApiError extends Error {
  constructor(status, message, data = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}
