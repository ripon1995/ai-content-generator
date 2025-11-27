import apiClient from './client';
import { LoginRequest, RegisterRequest, AuthResponse } from '../types/auth.types';
import { ApiResponse } from '../types/api.types';

// Authentication API endpoints
export const authApi = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<ApiResponse<AuthResponse>>('/auth/login', data);
    return response.data.data;
  },

  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<ApiResponse<AuthResponse>>('/auth/register', data);
    return response.data.data;
  },

  logout: async (): Promise<void> => {
    return Promise.resolve();
  },
};
