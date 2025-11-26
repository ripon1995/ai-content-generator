import { Response } from 'express';
import { RESPONSE_DEFAULT_MESSAGES, HTTP_STATUS_CODES } from './messages';
import {
  IApiSuccessResponse,
  IApiErrorResponse,
  IErrorDetail,
} from '../types/response_interfaces';

// response structure: general
export const sendSuccess = <T>(
  res: Response,
  data: T,
  message: string = RESPONSE_DEFAULT_MESSAGES.SUCCESS,
  statusCode: number = HTTP_STATUS_CODES.OK
): Response<IApiSuccessResponse<T>> => {
  const response: IApiSuccessResponse<T> = {
    success: true,
    message,
    data,
    statusCode,
  };

  return res.status(statusCode).json(response);
};

// response structure: error api 
export const sendError = (
  res: Response,
  message: string = RESPONSE_DEFAULT_MESSAGES.INTERNAL_ERROR,
  statusCode: number = HTTP_STATUS_CODES.INTERNAL_SERVER_ERROR,
  errors?: IErrorDetail[]
): Response<IApiErrorResponse> => {
  const response: IApiErrorResponse = {
    success: false,
    message,
    statusCode,
    ...(errors && { errors }),
  };

  return res.status(statusCode).json(response);
};

// response structure: not found
export const sendNotFound = (
  res: Response,
  message: string = RESPONSE_DEFAULT_MESSAGES.RESOURCE_NOT_FOUND,
): Response<IApiErrorResponse> => {
  return sendError(res, message, HTTP_STATUS_CODES.NOT_FOUND);
};

// response structure: validation error
export const sendValidationError = (
  res: Response,
  message: string = RESPONSE_DEFAULT_MESSAGES.VALIDATION_FAILED,
  errors: IErrorDetail[]
): Response<IApiErrorResponse> => {
  return sendError(res, message, HTTP_STATUS_CODES.BAD_REQUEST, errors);
};

// response structure: unauthorized
export const sendUnauthorized = (
  res: Response,
  message: string = RESPONSE_DEFAULT_MESSAGES.UNAUTHORIZED,
): Response<IApiErrorResponse> => {
  return sendError(res, message, HTTP_STATUS_CODES.UNAUTHORIZED);
};

// response structure: forbidden
export const sendForbidden = (
  res: Response,
  message: string = RESPONSE_DEFAULT_MESSAGES.FORBIDDEN,
): Response<IApiErrorResponse> => {
  return sendError(res, message, HTTP_STATUS_CODES.FORBIDDEN);
};

// response structure: create
export const sendCreated = <T>(
  res: Response,
  data: T,
  message: string = RESPONSE_DEFAULT_MESSAGES.CREATION_SUCCESSFUL,
): Response<IApiSuccessResponse<T>> => {
  return sendSuccess(res, data, message, HTTP_STATUS_CODES.CREATED);
};
