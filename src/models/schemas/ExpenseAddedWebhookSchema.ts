/**
 * Mongoose schema for Webhook.
 */

import mongoose from 'mongoose'

// Create a schema.

const schema = new mongoose.Schema({
  url: {
    type: String,
    required: [true, 'URL is required.'],
    unique: true,
    match: [/^https?:\/\/.+\..+/, 'Please provide a valid URL.']
  },
  secret: {
    type: String,
    required: [true, 'Secret is required.'],
    minLength: [8, 'The secret must be of minimum length 8 characters.'],
    maxLength: [256, 'The secret must be of maximum length 256 characters.']
  },
  budgetIDtoMonitor: {
    type: String,
    required: [true, 'Budget ID to monitor is required.']
  },
  categoryToMonitor: {
    type: Number,
    required: [true, 'Limit is required.'],
    minimum: [0, 'Limit must be greater than or equal to 0.']
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
export const LimitWebhook = mongoose.model('LimitWebhook', schema)