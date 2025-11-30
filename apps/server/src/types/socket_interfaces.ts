import { ContentType, ContentGenerationStatus } from './content_interfaces';

// todo : could improve with progress payload
// socket event names
export enum SocketEvents {
  // connection events
  CONNECTION = 'connection',
  DISCONNECT = 'disconnect',
  ERROR = 'error',

  // content generation events
  CONTENT_GENERATION_STARTED = 'content:generation:started',
  CONTENT_GENERATION_COMPLETED = 'content:generation:completed',
  CONTENT_GENERATION_FAILED = 'content:generation:failed',

  // user join events
  JOIN_USER_ROOM = 'user:join',
}

// payload: content generation started
export interface IContentGenerationStartedPayload {
  contentId: string;
  jobId: string;
  status: ContentGenerationStatus;
  timestamp: Date;
}

// payload: content generation completed
export interface IContentGenerationCompletedPayload {
  contentId: string;
  jobId: string;
  status: ContentGenerationStatus;
  title: string;
  contentType: ContentType;
  generatedText: string;
  timestamp: Date;
}

// payload: content generation failed
export interface IContentGenerationFailedPayload {
  contentId: string;
  jobId: string;
  status: ContentGenerationStatus;
  failureReason: string;
  timestamp: Date;
}

// interface for authenticated socket
export interface IAuthenticatedSocket {
  userId: string;
  email: string;
}

// interface for socket error
export interface ISocketError {
  message: string;
  code?: string;
  timestamp: Date;
}
