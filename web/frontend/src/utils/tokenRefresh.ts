// Utility for handling token refresh
let isRefreshing = false;
let refreshSubscribers: Array<(token: string) => void> = [];

// Function to subscribe to the token refresh
export function subscribeToTokenRefresh(callback: (token: string) => void) {
  refreshSubscribers.push(callback);
}

// Function to notify all subscribers with the new token
export function notifyTokenRefreshSubscribers(token: string) {
  refreshSubscribers.forEach((callback) => callback(token));
  refreshSubscribers = [];
}

// Function to refresh the token
export async function refreshToken(): Promise<string | null> {
  // If already refreshing, wait for it to complete
  if (isRefreshing) {
    return new Promise((resolve) => {
      subscribeToTokenRefresh((token) => {
        resolve(token);
      });
    });
  }

  isRefreshing = true;

  try {
    const refreshToken = localStorage.getItem('refreshToken');
    
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await fetch('/api/auth/refresh-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      throw new Error('Failed to refresh token');
    }

    const data = await response.json();
    const newToken = data.accessToken;

    // Update the token in localStorage
    localStorage.setItem('token', newToken);

    // Notify all subscribers about the new token
    notifyTokenRefreshSubscribers(newToken);

    return newToken;
  } catch (error) {
    console.error('Token refresh failed:', error);
    
    // Clear tokens on refresh failure
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    
    // Redirect to login page
    window.location.href = '/login';
    
    return null;
  } finally {
    isRefreshing = false;
  }
} 