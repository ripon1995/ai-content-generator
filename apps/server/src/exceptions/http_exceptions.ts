import { BaseException } from './base_exception';
import { IErrorDetail } from '../types/response_interfaces';
import { HTTP_STATUS_CODES } from '../utils/messages';

// exception: bad request
export class BadRequestException extends BaseException {
  constructor(message: string = 'Bad Request', errors?: IErrorDetail[]) {
    super(message, HTTP_STATUS_CODES.BAD_REQUEST, errors);
  }
}

// exception: unauthorized
export class UnauthorizedException extends BaseException {
  constructor(message: string = 'Unauthorized') {
    super(message, HTTP_STATUS_CODES.UNAUTHORIZED);
  }
}

// exception: forbidden
export class ForbiddenException extends BaseException {
  constructor(message: string = 'Forbidden') {
    super(message, HTTP_STATUS_CODES.FORBIDDEN);
  }
}

// exception: not found
export class NotFoundException extends BaseException {
  constructor(message: string = 'Resource not found') {
    super(message, HTTP_STATUS_CODES.NOT_FOUND);
  }
}

// exception: already exists
export class ConflictException extends BaseException {
  constructor(message: string = 'Resource already exists') {
    super(message, HTTP_STATUS_CODES.CONFLICT);
  }
}

// exception: validation
export class ValidationException extends BaseException {
  constructor(errors?: IErrorDetail[], message: string = 'Validation failed') {
    super(message, HTTP_STATUS_CODES.UNPROCESSABLE_ENTITY, errors);
  }
}

// exception: server side
export class InternalServerException extends BaseException {
  constructor(message: string = 'Internal server error') {
    super(message, HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR);
  }
}

// exception: token generation
export class JWTTOkenGenerationException extends BaseException {
  constructor(message: string = 'Failed to generate token') {
    super(message, HTTP_STATUS_CODES.BAD_REQUEST)
  }
}

// exception: queue service
export class QueueServiceException extends BaseException {
  constructor(message: string = 'Queue service error') {
    super(message, HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR);
  }
}

// exception: AI service
export class AIServiceException extends BaseException {
  constructor(message: string = 'AI service error') {
    super(message, HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR);
  }
}

// exception: content service
export class ContentServiceException extends BaseException {
  constructor(message: string = 'Content service error') {
    super(message, HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR);
  }
}

// exception: job processor
export class JobProcessorException extends BaseException {
  constructor(message: string = 'Job processing error') {
    super(message, HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR);
  }
}