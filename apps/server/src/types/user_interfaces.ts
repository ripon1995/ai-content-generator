import { IBaseDocument } from './base_document';

export interface IUserDocument extends IBaseDocument {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

// request body structure : register api
export interface IUserInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

// response structure : register api
export interface IUserResponse {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
}
