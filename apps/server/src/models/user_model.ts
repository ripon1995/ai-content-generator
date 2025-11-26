import { Schema, model } from 'mongoose';
import bcrypt from 'bcryptjs';
import { IUserDocument } from '../types/user_interfaces';
import { USER_SCHEMA_MESSAGES } from '../utils/messages';
import { REGEX_PATTERN, CONSTANT_VALUES } from '../utils/constants';
import { baseFlagFields, baseSchemaOptions } from './base_schema_fields';
import { applyBaseQueryManager } from '../middleware/query_manager';
import logger from '../utils/logger';

// schema definition : user
const userSchema = new Schema<IUserDocument>(
  {
    email: {
      type: String,
      required: [true, USER_SCHEMA_MESSAGES.EMAIL_REQUIRED],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        REGEX_PATTERN.EMAIL,
        USER_SCHEMA_MESSAGES.VALID_EMAIL,
      ],
      index: true,
    },
    password: {
      type: String,
      required: [true, USER_SCHEMA_MESSAGES.PASSWORD_REQUIRED],
      minlength: [CONSTANT_VALUES.PASSWORD_MIN_LENGTH, USER_SCHEMA_MESSAGES.VALID_PASSWORD_MIN_LENGTH],
      select: false, // Don't include password in queries by default
    },
    firstName: {
      type: String,
      required: [true, USER_SCHEMA_MESSAGES.FIRST_NAME_REQUIRED],
      trim: true,
      minlength: [CONSTANT_VALUES.NAME_MIN_LENGTH, USER_SCHEMA_MESSAGES.VALID_FIRST_NAME_MIN_LENGTH],
      maxlength: [CONSTANT_VALUES.NAME_MAX_LENGTH, USER_SCHEMA_MESSAGES.VALID_FIRST_NAME_MAX_LENGTH],
    },
    lastName: {
      type: String,
      required: [true, USER_SCHEMA_MESSAGES.LAST_NAME_REQIRED],
      trim: true,
      minlength: [CONSTANT_VALUES.NAME_MIN_LENGTH, USER_SCHEMA_MESSAGES.VALID_LAST_NAME_MIN_LENGTH],
      maxlength: [CONSTANT_VALUES.NAME_MAX_LENGTH, USER_SCHEMA_MESSAGES.VALID_LAST_NAME_MAX_LENGTH],
    },
    ...baseFlagFields,
  },
  baseSchemaOptions
);


// compound index handler
userSchema.index({ email: 1, isDeleted: 1 });
userSchema.index({ isActive: 1, isDeleted: 1 });

// pre-save middleware to hash password
userSchema.pre('save', async function (next) {
  // only hash password if it's modified or new
  if (!this.isModified('password')) {
    return next();
  }

  try {
    // generate salt and hash password
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    logger.error(error);
    next(error as Error);
  }
});

// instance method to compare password
userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    logger.error(error);
    return false;
  }
};

// schema definition : get full name
userSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

// remove sensitive data
userSchema.set('toJSON', {
  virtuals: true,
  transform: function (_doc, ret: any) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.password;
    return ret;
  },
});

// apply query manager middleware
applyBaseQueryManager(userSchema);

// user model
export const User = model<IUserDocument>('User', userSchema);
