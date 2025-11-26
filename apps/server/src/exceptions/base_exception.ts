import { IErrorDetail } from '../types/response_interfaces';

// base class for the custom exceptions
export class BaseException extends Error {
  public readonly statusCode: number;
  public readonly errors?: IErrorDetail[];

  constructor(
    message: string,
    statusCode: number = 500,
    errors?: IErrorDetail[]
  ) {
    super(message);

    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.errors = errors;

    // Set the prototype explicitly (for modern TypeScript)
    Object.setPrototypeOf(this, BaseException.prototype);
  }
}
