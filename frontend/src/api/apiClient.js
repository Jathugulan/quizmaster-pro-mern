/**
 * Centralized API Client for QuizMaster Frontend.
 * Standardizes request headers, Bearer JWT token injection, JSON serialization, and error envelopes.
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
const TOKEN_KEY = 'quizmaster.auth.token';

export class ApiError extends Error {
  constructor(message, statusCode = 500, errors = []) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.errors = errors;
  }
}

export const getToken = () => {
  try {
    return window.localStorage.getItem(TOKEN_KEY);
  } catch (e) {
    return null;
  }
};

export const setToken = (token) => {
  try {
    if (token) {
      window.localStorage.setItem(TOKEN_KEY, token);
    } else {
      window.localStorage.removeItem(TOKEN_KEY);
    }
  } catch (e) {
    console.warn('[apiClient] Failed to persist token:', e);
  }
};

export const clearToken = () => {
  try {
    window.localStorage.removeItem(TOKEN_KEY);
  } catch (e) {
    // Ignore
  }
};

async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  const token = getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers,
  };

  if (config.body && typeof config.body === 'object' && !(config.body instanceof FormData)) {
    config.body = JSON.stringify(config.body);
  }

  try {
    const response = await fetch(url, config);

    let json = null;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      json = await response.json();
    }

    if (!response.ok) {
      // Handle 401 Unauthorized globally
      if (response.status === 401) {
        clearToken();
        window.dispatchEvent(new CustomEvent('quizmaster:unauthorized'));
      }

      const errorMessage = json?.message || `Request failed with status ${response.status}`;
      const errors = json?.errors || [];
      throw new ApiError(errorMessage, response.status, errors);
    }

    // Return the payload data from standard envelope
    return json && json.data !== undefined ? json.data : json;
  } catch (err) {
    if (err instanceof ApiError) {
      throw err;
    }
    // Network or parser errors
    throw new ApiError(err.message || 'Network connection error. Please check your connection.', 0);
  }
}

export const apiClient = {
  get: (endpoint, options) => request(endpoint, { ...options, method: 'GET' }),
  post: (endpoint, body, options) => request(endpoint, { ...options, method: 'POST', body }),
  put: (endpoint, body, options) => request(endpoint, { ...options, method: 'PUT', body }),
  patch: (endpoint, body, options) => request(endpoint, { ...options, method: 'PATCH', body }),
  delete: (endpoint, options) => request(endpoint, { ...options, method: 'DELETE' }),
};

export default apiClient;
