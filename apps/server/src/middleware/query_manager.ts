import { Schema } from 'mongoose';
import { IBaseDocument } from '../types/base_document';
import logger from '../utils/logger';

// query manager middle ware to apply basic filters
export function applyBaseQueryManager<T extends IBaseDocument>(
  schema: Schema<T>
): void {
  // returns non deleted and active items
  schema.pre('find', function (next) {
    try {
      this.where({ isDeleted: false, isActive: true });
      next();
    } catch (error) {
      logger.error('Query filter error in find:', error);
      next(error as Error);
    }
  });

  // returns non deleted and active item
  schema.pre('findOne', function (next) {
    try {
      this.where({ isDeleted: false, isActive: true });
      next();
    } catch (error) {
      logger.error('Query filter error in findOne:', error);
      next(error as Error);
    }
  });
}