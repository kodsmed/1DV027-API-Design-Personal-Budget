/**
 * Mongoose schema for Webhook.
 */

import mongoose from 'mongoose'

export interface IAddedExpenseWebhook extends mongoose.Document {
  ownerUUID: string
  url: string
  secret: string
  budgetIdToMonitor: string
  categoryToMonitor: number
}

// Create a schema.

const schema = new mongoose.Schema({
  ownerUUID: {
    type: String,
    required: [true, 'Owner UUID is required.'],
    length: [36, 'Owner UUID must be 36 characters long.']
  },
  url: {
    type: String,
    required: [true, 'URL is required.'],
    unique: true,
  },
  secret: {
    type: String,
    required: [true, 'Secret is required.'],
    minLength: [8, 'The secret must be of minimum length 8 characters.'],
    maxLength: [256, 'The secret must be of maximum length 256 characters.']
  },
  budgetIdToMonitor: {
    type: String,
    required: [true, 'Budget ID to monitor is required.']
  },
  categoryToMonitor: {
    type: Number,
    required: [true, 'Category to monitor is required.'],
    minimum: [0, 'Category must be greater than or equal to 0.']
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
  }
})

schema.virtual('id').get(function () {
  return this._id.toHexString()
})

// Create a model using the schema.
export const ExpenseAddedWebhookModel = mongoose.model('ExpenseAddedWebhookModel', schema)