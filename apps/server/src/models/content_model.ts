import { Schema, model } from 'mongoose';
import { IContentDocument } from '../types/content_interfaces';
import { baseFlagFields, baseSchemaOptions } from './base_schema_fields';
import { applyBaseQueryManager } from '../middleware/query_manager';

// content schema
const contentSchema = new Schema<IContentDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    contentType: {
      type: String,
      enum: {
        values: ['blog', 'product', 'social', 'custom'],
        message: 'Content type must be one of: blog, product, social, custom',
      },
      required: [true, 'Content type is required'],
      index: true,
    },
    prompt: {
      type: String,
      required: [true, 'Prompt is required'],
      maxlength: [1000, 'Prompt cannot exceed 1000 characters'],
    },
    generatedText: {
      type: String,
      required: [true, 'Generated text is required'],
    },
    status: {
      type: String,
      enum: {
        values: ['draft', 'published'],
        message: 'Status must be either draft or published',
      },
      default: 'draft',
      index: true,
    },
    ...baseFlagFields,
  },
  baseSchemaOptions
);

// compound indexes for efficient queries
contentSchema.index({ userId: 1, contentType: 1 });
contentSchema.index({ userId: 1, status: 1 });

// apply query manager for soft deletes
applyBaseQueryManager(contentSchema);

// create and export model
export const Content = model<IContentDocument>('Content', contentSchema);
