/**
 * Mongoose schema for Budget
 *
 * @Author Jimmy Karlsson <jk224jv@student.lnu.se>
 * @version 1.0.0
 */

import mongoose, { Document, Schema } from 'mongoose'
import { CategorySchema, ICategory } from './CategorySchema.js'
import { UserAccessSchema, IUserAccess } from './UserAccessSchema.js'
import { BudgetIterations } from '../../lib/types/Enums.js'


// TypeScript interface for Budget
export interface IBudget extends Document {
  categories: ICategory[];
  ownerUUID: string;
  userAccess: IUserAccess[];
  budgetName: string;
  budgetDescription: string;
  budgetStartDate: Date;
  budgetIteration: BudgetIterations;
}

// Main schema for Budget
const BudgetSchema: Schema<IBudget> = new Schema({
  ownerUUID: {
    type: String,
    required: [true, 'Owner UUID is required.'],
    length: [36, 'Owner UUID must be 36 characters long.']
  },
  userAccess: [UserAccessSchema],
  categories: [CategorySchema],
  budgetName: {
    type: String,
    required: [true, 'Budget name is required.'],
    maxLength: [128, 'The budget name must be of maximum length 128 characters.']
  },
  budgetDescription: {
    type: String,
    required: [true, 'Budget description is required.'],
    maxLength: [256, 'The budget description must be of maximum length 256 characters.']
  },
  budgetStartDate: {
    type: Date,
    required: [true, 'Budget start date is required.']
  },
  // Budget iterate over fixed time periods, e.g. weekly, monthly, yearly.
  budgetIteration: {
    type: String,
    required: [true, 'Budget iteration is required.'],
    enum: ['weekly', 'monthly', 'yearly', 'event']
  }

}, {
  timestamps: true,
  toJSON: {
    transform: function (doc, ret) {
      delete ret._id;
      delete ret.__v;
    },
    virtuals: true
  }
});

BudgetSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

export const Budget = mongoose.model<IBudget>('Budget', BudgetSchema);