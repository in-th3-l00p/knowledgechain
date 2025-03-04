import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, rememberMe } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Forward the request to the authentication service
    const API_URL = process.env.API_URL || 'http://localhost:5000';
    
    const response = await fetch(`${API_URL}/api/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: errorData.message || 'Invalid credentials' },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    // Set cookie options based on remember me
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict' as const,
      // If remember me is checked, set a longer expiration (30 days)
      // Otherwise, make it a session cookie (expires when browser closes)
      maxAge: rememberMe ? 30 * 24 * 60 * 60 : undefined,
      path: '/',
    };
    
    // Create the response with the access token for client-side storage
    const jsonResponse = NextResponse.json({
      success: true,
      user: {
        ...data.user,
        accessToken: data.accessToken // Include the access token for client-side storage
      }
    });
    
    // Set the access token in a cookie for server-side auth
    jsonResponse.cookies.set('token', data.accessToken, cookieOptions);
    
    return jsonResponse;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'An error occurred during login' },
      { status: 500 }
    );
  }
} 