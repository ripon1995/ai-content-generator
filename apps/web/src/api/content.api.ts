import apiClient from './client';
import {
  Content,
  ContentCreateRequest,
  ContentUpdateRequest,
  JobStatusResponse,
  PaginatedContentResponse,
} from '../types/content.types';
import { ApiResponse } from '../types/api.types';

interface GetAllParams {
  page?: number;
  limit?: number;
  contentType?: string;
  status?: string;
}

export const contentApi = {
  // Get all user content with pagination
  getAll: async (params?: GetAllParams): Promise<PaginatedContentResponse> => {
    const response = await apiClient.get<ApiResponse<PaginatedContentResponse>>('/content', {
      params,
    });
    return response.data.data;
  },

  // Get content by ID
  getById: async (id: string): Promise<Content> => {
    const response = await apiClient.get<ApiResponse<Content>>(`/content/${id}`);
    return response.data.data;
  },

  // Queue content generation
  generate: async (data: ContentCreateRequest): Promise<Content> => {
    const response = await apiClient.post<ApiResponse<Content>>('/content/generate', data);
    return response.data.data;
  },

  // Get job status
  getJobStatus: async (jobId: string): Promise<JobStatusResponse> => {
    const response = await apiClient.get<ApiResponse<JobStatusResponse>>(
      `/content/job/${jobId}/status`
    );
    return response.data.data;
  },

  // Update content
  update: async (id: string, data: ContentUpdateRequest): Promise<Content> => {
    const response = await apiClient.put<ApiResponse<Content>>(`/content/${id}`, data);
    return response.data.data;
  },

  // Delete content
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/content/${id}`);
  },
};
