import { Schema, model } from 'mongoose';
import bcrypt from 'bcryptjs';
import { IRefreshTokenDocument } from '../types/refresh_token_interfaces';
import { baseFlagFields, baseSchemaOptions } from './base_schema_fields';
import { applyBaseQueryManager } from '../middleware/query_manager';

// refresh token schema
const refreshTokenSchema = new Schema<IRefreshTokenDocument>(
  {
    userId: {
      type: String,
      required: [true, 'User ID is required'],
      index: true,
    },
    token: {
      type: String,
      required: [true, 'Token is required'],
      select: true,
    },
    expiresAt: {
      type: Date,
      required: [true, 'Expiration date is required'],
    },
    deviceInfo: {
      type: String,
      default: null,
    },
    ipAddress: {
      type: String,
      default: null,
    },
    isRevoked: {
      type: Boolean,
      default: false,
      index: true,
    },
    revokedAt: {
      type: Date,
      default: null,
    },
    lastUsedAt: {
      type: Date,
      default: Date.now,
    },
    ...baseFlagFields,
  },
  baseSchemaOptions
);

// index for efficient queries
refreshTokenSchema.index({ userId: 1, isRevoked: 1 });
refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index for auto-cleanup

// hash token before saving
refreshTokenSchema.pre('save', async function (next) {
  if (!this.isModified('token')) return next();

  const salt = await bcrypt.genSalt(10);
  this.token = await bcrypt.hash(this.token, salt);
  next();
});

// method to compare token
refreshTokenSchema.methods.compareToken = async function (
  candidateToken: string
): Promise<boolean> {
  return await bcrypt.compare(candidateToken, this.token);
};

// apply query manager for soft deletes
applyBaseQueryManager(refreshTokenSchema);

// create and export model
export const RefreshToken = model<IRefreshTokenDocument>('RefreshToken', refreshTokenSchema);
