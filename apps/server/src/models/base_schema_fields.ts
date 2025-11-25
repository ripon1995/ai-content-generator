import { SchemaDefinitionProperty } from 'mongoose';

// base fields for all models
export const baseFlagFields = {
  isActive: {
    type: Boolean,
    default: true,
    index: true,
  } as SchemaDefinitionProperty<boolean>,

  isDeleted: {
    type: Boolean,
    default: false,
    index: true,
  } as SchemaDefinitionProperty<boolean>,
};


export const baseSchemaOptions = {
  // automatically adds createdAt and updatedAt
  timestamps: true, 
  // disable __v field
  versionKey: false as const, 
};
