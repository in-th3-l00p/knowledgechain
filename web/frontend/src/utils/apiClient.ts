import { refreshToken } from './tokenRefresh';

// Base API URL from environment variables
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Interface for API request options
interface ApiRequestOptions extends RequestInit {
  requiresAuth?: boolean;
  skipRefresh?: boolean;
}

/**
 * Makes an API request with authentication and token refresh handling
 */
export async function apiRequest(
  endpoint: string,
  options: ApiRequestOptions = {}
): Promise<Response> {
  const { requiresAuth = true, skipRefresh = false, ...fetchOptions } = options;
  
  // Prepare headers
  const headers = new Headers(fetchOptions.headers || {});
  
  if (!headers.has('Content-Type') && !(fetchOptions.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }
  
  // Add authentication if required
  if (requiresAuth) {
    let token = localStorage.getItem('token');
    
    // If token doesn't exist or is expired and we're not skipping refresh
    if (!token && !skipRefresh) {
      token = await refreshToken();
    }
    
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
  }
  
  // Make the request
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...fetchOptions,
    headers,
  });
  
  // Handle 401 Unauthorized errors by refreshing the token and retrying
  if (response.status === 401 && requiresAuth && !skipRefresh) {
    const newToken = await refreshToken();
    
    if (newToken) {
      // Retry the request with the new token
      headers.set('Authorization', `Bearer ${newToken}`);
      
      return fetch(`${API_URL}${endpoint}`, {
        ...fetchOptions,
        headers,
      });
    }
  }
  
  return response;
}

/**
 * Shorthand for GET requests
 */
export function apiGet(endpoint: string, options: ApiRequestOptions = {}) {
  return apiRequest(endpoint, {
    method: 'GET',
    ...options,
  });
}

/**
 * Shorthand for POST requests
 */
export function apiPost(endpoint: string, data: any, options: ApiRequestOptions = {}) {
  return apiRequest(endpoint, {
    method: 'POST',
    body: JSON.stringify(data),
    ...options,
  });
}

/**
 * Shorthand for PUT requests
 */
export function apiPut(endpoint: string, data: any, options: ApiRequestOptions = {}) {
  return apiRequest(endpoint, {
    method: 'PUT',
    body: JSON.stringify(data),
    ...options,
  });
}

/**
 * Shorthand for DELETE requests
 */
export function apiDelete(endpoint: string, options: ApiRequestOptions = {}) {
  return apiRequest(endpoint, {
    method: 'DELETE',
    ...options,
  });
} 