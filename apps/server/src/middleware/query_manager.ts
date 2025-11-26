import { Schema } from 'mongoose';
import { IBaseDocument } from '../types/base_document';

// query manager middle ware to apply basic filters
export function applyBaseQueryManager<T extends IBaseDocument>(
  schema: Schema<T>
): void {
  // returns non deleted and active items
  schema.pre('find', function (next) {
    this.where({ isDeleted: false, isActive: true });
    next();
  });

  // returns non deleted and active item
  schema.pre('findOne', function (next) {
    this.where({ isDeleted: false, isActive: true });
    next();
  });
}