import { ContentType, GenerationStatus } from './content.types';

// socket event names (must match server-side events)
export enum SocketEvents {
  // connection events
  CONNECTION = 'connection',
  DISCONNECT = 'disconnect',
  ERROR = 'error',

  // content generation events
  CONTENT_GENERATION_STARTED = 'content:generation:started',
  CONTENT_GENERATION_COMPLETED = 'content:generation:completed',
  CONTENT_GENERATION_FAILED = 'content:generation:failed',
}

// payload: content generation started
export interface ContentGenerationStartedPayload {
  contentId: string;
  jobId: string;
  status: GenerationStatus;
  timestamp: Date;
}

// payload: content generation completed
export interface ContentGenerationCompletedPayload {
  contentId: string;
  jobId: string;
  status: GenerationStatus;
  title: string;
  contentType: ContentType;
  generatedText: string;
  timestamp: Date;
}

// payload: content generation failed
export interface ContentGenerationFailedPayload {
  contentId: string;
  jobId: string;
  status: GenerationStatus;
  failureReason: string;
  timestamp: Date;
}
