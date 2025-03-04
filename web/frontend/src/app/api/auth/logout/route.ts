import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Get the refresh token from the request body
    const body = await request.json().catch(() => ({}));
    const { refreshToken } = body;

    // Get the access token from cookies
    const token = request.cookies.get('token')?.value;

    if (token && refreshToken) {
      // Call the auth service to logout
      const API_URL = process.env.API_URL || 'http://localhost:5000';
      
      try {
        await fetch(`${API_URL}/api/auth/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ refreshToken }),
        });
      } catch (error) {
        // Continue with local logout even if the API call fails
        console.error('Error calling logout API:', error);
      }
    }

    // Create the response
    const response = NextResponse.json({ success: true });
    
    // Clear the token cookie
    response.cookies.delete('token');
    
    return response;
  } catch (error) {
    console.error('Logout error:', error);
    
    // Even if there's an error, try to clear the cookie
    const response = NextResponse.json(
      { error: 'An error occurred during logout' },
      { status: 500 }
    );
    
    response.cookies.delete('token');
    
    return response;
  }
} 