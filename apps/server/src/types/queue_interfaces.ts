import { ContentType, ContentGenerationStatus } from './content_interfaces';

// job data interface for content generation queue
export interface IContentGenerationJobData {
  userId: string;
  contentId: string;
  contentType: ContentType;
  prompt: string;
  title: string;
}

// job status response interface
export interface IJobStatusResponse {
  jobId: string;
  status: ContentGenerationStatus;
  content?: {
    id: string;
    title: string;
    generatedText?: string;
    contentType: ContentType;
    prompt: string;
  };
  failureReason?: string;
}

// bull job status type (includes all possible Bull statuses)
export type BullJobStatus = 'waiting' | 'active' | 'completed' | 'failed' | 'delayed' | 'paused' | 'stuck';
