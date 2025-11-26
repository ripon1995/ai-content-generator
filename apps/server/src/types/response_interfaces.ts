// base api response interface
export interface IApiResponse<T = any> {
  statusCode: number;
  success: boolean;
  message: string;
  data?: T;
}

// error response interface with optional error details
export interface IApiErrorResponse extends IApiResponse {
  success: false;
  errors?: IErrorDetail[];
}

// error response interface with validation error message
export interface IErrorDetail {
  field?: string;
  message: string;
  code?: string;
}

// success response with data
export interface IApiSuccessResponse<T = any> extends IApiResponse<T> {
  success: true;
  data: T;
}
