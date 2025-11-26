export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  statusCode: number;
}

export interface ApiError {
  success: false;
  message: string;
  errors?: ErrorDetail[];
  statusCode: number;
}

export interface ErrorDetail {
  field?: string;
  message: string;
}
