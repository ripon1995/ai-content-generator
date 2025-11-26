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

// request body structure : login api
export interface ILoginInput {
  email: string;
  password: string;
}

// response structure : authentication 
export interface IAuthResponse {
  user: IUserResponse;
  access_token: string;
  refresh_token: string;
}

// responst structure : refresh token
export interface IRefreshResponse {
  user: IUserResponse;
  access_token: string;
}
