'use server';

import { cookies } from 'next/headers';
export async function loginAction(formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const rememberMe = formData.get('remember-me') === 'on';

  if (!email || !password) {
    return {
      error: 'Email and password are required'
    };
  }

  try {
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
      return {
        error: errorData.message || 'Invalid credentials'
      };
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
    
    // Set the access token in a cookie
    (await cookies()).set('token', data.accessToken, cookieOptions);
    
    // Return success with user data
    return {
      success: true,
      user: data.user
    };
  } catch (error) {
    console.error('Login error:', error);
    return {
      error: 'An error occurred during login'
    };
  }
} 