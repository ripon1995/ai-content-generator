import { User } from '../types/auth.types';

const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const USER_KEY = 'user';

// Save both access and refresh tokens to localStorage
export const setTokens = (accessToken: string, refreshToken: string): void => {
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
};

//Get access token from localStorage
export const getAccessToken = (): string | null => {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
};

/**
 * Get refresh token from localStorage
 */
export const getRefreshToken = (): string | null => {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
};

// Remove all tokens from localStorage
export const removeTokens = (): void => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

// Check if user is authenticated (has access token)
export const isAuthenticated = (): boolean => {
  return !!getAccessToken();
};

// Save user data to localStorage
export const setUser = (user: User): void => {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

// Get user data from localStorage
export const getUser = (): User | null => {
  const userStr = localStorage.getItem(USER_KEY);
  if (!userStr) return null;

  try {
    return JSON.parse(userStr) as User;
  } catch (error) {
    console.error('Failed to parse user from localStorage:', error);
    return null;
  }
};

// Clear all auth-related data from localStorage
export const clearAuth = (): void => {
  removeTokens();
};
