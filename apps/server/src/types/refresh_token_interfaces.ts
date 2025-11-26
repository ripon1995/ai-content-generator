import { IBaseDocument } from './base_document';

// refresh token document interface
export interface IRefreshTokenDocument extends IBaseDocument {
  userId: string;
  token: string; // hashed refresh token
  expiresAt: Date;
  deviceInfo?: string;
  ipAddress?: string;
  isRevoked: boolean;
  revokedAt?: Date;
  lastUsedAt: Date;
  compareToken(candidateToken: string): Promise<boolean>;
}

// request body structure : refresh token api
export interface IRefreshTokenInput {
  refresh_token: string;
}
