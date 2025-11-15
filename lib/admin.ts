'use client';

import { getToken } from './auth';

// Admin emails (should match backend)
const ADMIN_EMAILS = ['admin@jklu.edu.in', 'admin@caresure.com'];

// Simple JWT decode (base64 decode payload)
const decodeJWT = (token: string): any => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    return null;
  }
};

export const isAdmin = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  const token = getToken();
  if (!token) return false;

  try {
    const decoded = decodeJWT(token);
    if (!decoded || !decoded.email) return false;
    
    return ADMIN_EMAILS.includes(decoded.email.toLowerCase());
  } catch (error) {
    return false;
  }
};

