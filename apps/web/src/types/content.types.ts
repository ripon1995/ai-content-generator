export type ContentType = 'blog' | 'product' | 'social';
export type ContentStatus = 'draft' | 'published';
export type GenerationStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface Content {
  id: string;
  userId: string;
  title: string;
  contentType: ContentType;
  prompt: string;
  generatedText?: string;
  status: ContentStatus;
  jobId?: string;
  generationStatus: GenerationStatus;
  failureReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ContentCreateRequest {
  title: string;
  contentType: ContentType;
  prompt: string;
}

export interface ContentUpdateRequest {
  title?: string;
  status?: ContentStatus;
  generatedText?: string;
}

export interface JobStatusResponse {
  jobId: string;
  status: GenerationStatus;
  content?: {
    id: string;
    title: string;
    generatedText: string;
    contentType: ContentType;
    prompt: string;
  };
  failureReason?: string;
}

export interface PaginatedContentResponse {
  contents: Content[];
  pagination: {
    total: number;
    page: number;
    totalPages: number;
    limit: number;
  };
}
