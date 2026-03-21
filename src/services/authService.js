// PermitWatch AI — Auth Service
// Backend-ready service functions for authentication.
// In mock mode, accepts any credentials and returns a demo user.
// When VITE_API_BASE_URL is set, calls real auth endpoints.

import { apiRequest, isMockMode } from './apiClient';

const mockDelay = (ms = 500) => new Promise((r) => setTimeout(r, ms));

/**
 * Log in a user.
 *
 * Backend endpoint: POST /api/auth/login
 * Body: { email, password }
 * Response: { success, user, token }
 *
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{ success: boolean, user: object, token?: string }>}
 */
export async function login(email, password) {
  if (!isMockMode()) {
    const res = await apiRequest('/api/auth/login', {
      method: 'POST',
      body: { email, password },
    });
    // Persist token for subsequent requests
    if (res.token) {
      localStorage.setItem('permitwatch_token', res.token);
    }
    return res;
  }

  await mockDelay();
  if (!email || !password) throw new Error('Email and password are required');
  return {
    success: true,
    user: {
      id: 'user-001',
      name: 'Demo User',
      email,
      avatar: null,
      plan: 'pro',
    },
  };
}

/**
 * Register a new user.
 *
 * Backend endpoint: POST /api/auth/signup
 * Body: { name, email, password }
 * Response: { success, user, token }
 *
 * @param {string} name
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{ success: boolean, user: object, token?: string }>}
 */
export async function signup(name, email, password) {
  if (!isMockMode()) {
    const res = await apiRequest('/api/auth/signup', {
      method: 'POST',
      body: { name, email, password },
    });
    if (res.token) {
      localStorage.setItem('permitwatch_token', res.token);
    }
    return res;
  }

  await mockDelay();
  return {
    success: true,
    user: {
      id: `user-${Date.now()}`,
      name,
      email,
      avatar: null,
      plan: 'free',
    },
  };
}

/**
 * Log out the current user.
 *
 * Backend endpoint: POST /api/auth/logout (optional)
 *
 * @returns {Promise<void>}
 */
export async function logout() {
  if (!isMockMode()) {
    try {
      await apiRequest('/api/auth/logout', { method: 'POST' });
    } catch {
      // Logout should succeed even if server call fails
    }
  }
  localStorage.removeItem('permitwatch_token');
}
