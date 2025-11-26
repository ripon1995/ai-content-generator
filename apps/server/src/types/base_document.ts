import { Document } from 'mongoose';

// base document : default time stamp field for all instances
interface ITimeStamp {
  createdAt: Date;
  updatedAt: Date;
}
// base document : defautl flag field for all the instances
interface IFlag {
  isActive: boolean;
  isDeleted: boolean;
}

// base document : it will be used by all the models
export interface IBaseDocument extends Document, ITimeStamp, IFlag {}
