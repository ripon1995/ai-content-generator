import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, LoginRequest, RegisterRequest } from '../types/auth.types';
import { authApi } from '../api/auth.api';
import { setTokens, getUser, setUser, removeTokens } from '../utils/storage';
import toast from 'react-hot-toast';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

interface AuthContextType extends AuthState {
  login: (credentials: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  // Initialize auth state from localStorage on mount
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const storedUser = getUser();
        if (storedUser) {
          setState({
            user: storedUser,
            isAuthenticated: true,
            isLoading: false,
          });
        } else {
          setState({
            user: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      } catch (error) {
        console.error('Failed to initialize auth:', error);
        setState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        });
      }
    };

    initializeAuth();
  }, []);

  const login = async (credentials: LoginRequest): Promise<void> => {
    try {
      const response = await authApi.login(credentials);

      // Store tokens and user data
      setTokens(response.access_token, response.refresh_token);
      setUser(response.user);

      // Update state
      setState({
        user: response.user,
        isAuthenticated: true,
        isLoading: false,
      });

      toast.success('Login successful!');
    } catch (error) {
      console.error('Login failed:', error);
      toast.error('Login failed. Please check your credentials.');
      throw error;
    }
  };

  const register = async (data: RegisterRequest): Promise<void> => {
    try {
      const response = await authApi.register(data);

      // Store tokens and user data
      setTokens(response.access_token, response.refresh_token);
      setUser(response.user);

      // Update state
      setState({
        user: response.user,
        isAuthenticated: true,
        isLoading: false,
      });

      toast.success('Registration successful!');
    } catch (error) {
      console.error('Registration failed:', error);
      toast.error('Registration failed. Please try again.');
      throw error;
    }
  };

  const logout = (): void => {
    // Clear tokens and user data
    removeTokens();

    // Update state
    setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });

    toast.success('Logged out successfully!');
  };

  const value: AuthContextType = {
    ...state,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
