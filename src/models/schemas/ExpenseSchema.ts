/**
 * Mongoose Schema for Expense.
 *
 * @Author Jimmy Karlsson <jk224jv@student.lnu.se>
 * @version 1.0.0
 */

import { Document, Schema } from 'mongoose';

// TypeScript interface for Expense
export interface IExpense extends Document {
  ownerUUID: string;
  date: Date;
  amount: number;
  note?: string;
}

// Create a schema.
export const ExpenseSchema: Schema<IExpense> = new Schema({
  ownerUUID: {
    type: String,
    required: [true, 'Owner UUID is required.'],
    length: [36, 'Owner UUID must be 36 characters long.']
  },
  date: {
    type: Date,
    required: [true, 'Date is required.'],
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required.'],
  },
  note: {
    type: String,
    maxLength: [128, 'The note must be of maximum length 128 characters.']
  }
}, {
  timestamps: true,
  toJSON: {
    /**
     * Performs a transformation of the resulting object to remove sensitive information.
     *
     * @param {object} doc - The mongoose document which is being converted.
     * @param {object} ret - The plain object representation which has been converted.
     */
    transform: function (doc, ret) {
      delete ret._id
      delete ret.__v
    },
    virtuals: true // ensure virtual fields are serialized
  },
})
