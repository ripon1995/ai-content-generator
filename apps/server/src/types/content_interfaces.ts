import { IBaseDocument } from './base_document';
import { Types } from 'mongoose';

// content type enum
export type ContentType = 'blog' | 'product' | 'social';

// content status enum
export type ContentStatus = 'draft' | 'published';

// content generation status enum
export type ContentGenerationStatus = 'pending' | 'processing' | 'completed' | 'failed';

// content document interface
export interface IContentDocument extends IBaseDocument {
  userId: Types.ObjectId;
  title: string;
  contentType: ContentType;
  prompt: string;
  generatedText?: string;
  status: ContentStatus;
  jobId?: string;
  generationStatus: ContentGenerationStatus;
  failureReason?: string;
}

// content input interface for creating new content
export interface IContentInput {
  userId: string;
  title: string;
  contentType: ContentType;
  prompt: string;
  generatedText?: string;
  status?: ContentStatus;
  jobId?: string;
  generationStatus?: ContentGenerationStatus;
}

// content update interface
export interface IContentUpdate {
  title?: string;
  contentType?: ContentType;
  prompt?: string;
  generatedText?: string;
  status?: ContentStatus;
  generationStatus?: ContentGenerationStatus;
  failureReason?: string;
}

// content response interface
export interface IContentResponse {
  id: string;
  userId: string;
  title: string;
  contentType: ContentType;
  prompt: string;
  generatedText?: string;
  status: ContentStatus;
  jobId?: string;
  generationStatus: ContentGenerationStatus;
  failureReason?: string;
}
