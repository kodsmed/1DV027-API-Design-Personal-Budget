/**
 * Sub-schema for category
 *
 * @Author Jimmy Karlsson <jk224jv@student.lnu.se>
 */

import { Document, Schema } from 'mongoose';
import {  ExpenseSchema, IExpense } from './ExpenseSchema.js'

// TypeScript interface for Category
export interface ICategory extends Document {
  categoryName: string;
  categoryLimit: number;
  expenses: IExpense[];
}

// Sub-schema for category
export const CategorySchema: Schema<ICategory> = new Schema({
  categoryName: {
    type: String,
    required: [true, 'Category name is required.'],
    maxLength: [128, 'The category name must be of maximum length 128 characters.']
  },
  categoryLimit: {
    type: Number,
    required: [true, 'Category limit is required.'],
    min: [0, 'Category limit must be greater than or equal to 0.']
  },
  expenses: [ExpenseSchema]
});