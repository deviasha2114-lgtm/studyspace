import axios from 'axios';
import { useSession, signIn, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

// In a real app, this would be your API endpoint
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

/**
 * Sign in user with email and password
 */
export const signInWithCredentials = async (email: string, password: string) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/login`, {
      email,
      password,
    });

    // Assuming your API returns a token
    if (response.data.token) {
      // Store token in localStorage or cookie
      localStorage.setItem('token', response.data.token);
      return { success: true, user: response.data.user };
    }

    return { success: false, error: 'Invalid response from server' };
  } catch (error: any) {
    return {
      success: false,
      error: error.response?.data?.message || 'Login failed',
    };
  }
};

/**
 * Sign up new user
 */
export const signUp = async (userData: {
  name: string;
  email: string;
  password: string;
}) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/register`, userData);
    return { success: true, user: response.data };
  } catch (error: any) {
    return {
      success: false,
      error: error.response?.data?.message || 'Registration failed',
    };
  }
};

/**
 * Sign out user
 */
export const signOutUser = () => {
  localStorage.removeItem('token');
  // In a real app with NextAuth, you'd use signOut()
  // window.location.href = '/login';
};

/**
 * Get current user from token
 */
export const getCurrentUser = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) return null;

    const response = await axios.get(`${API_BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    return null;
  }
};

/**
 * Refresh token if needed
 */
export const refreshToken = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) return null;

    const response = await axios.post(
      `${API_BASE_URL}/auth/refresh`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      return response.data;
    }
    return null;
  } catch (error) {
    return null;
  }
};

export default {
  signInWithCredentials,
  signUp,
  signOutUser,
  getCurrentUser,
  refreshToken,
};