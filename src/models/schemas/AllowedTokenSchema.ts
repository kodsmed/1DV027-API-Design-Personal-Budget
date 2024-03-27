/**
 * Mongoose model currently-permitted.
 *
 * @author Jimmy Karlsson <jk224jv@student.lnu.se>
 * @version 1.0.0
 */

import bcrypt from 'bcrypt'
import mongoose from 'mongoose'

// TypeScript interface for AllowedToken
export interface IAllowedToken extends mongoose.Document {
  userUUID: string
  sequenceNumber: number
  expireAt: Date
}

// Create a schema.
const schema = new mongoose.Schema({
  userUUID: {
    type: String,
    required: [true, 'UUID is required.'],
    unique: true,
    length: [36, 'UUID must be 36 characters long.']
  },
  sequenceNumber: {
    type: Number,
    required: [true, 'Number of issued tokens required.']
  },
  expireAt: {
    type: Date,
    required: [true, 'Expiration date is required.']
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

/**
 * Authenticates a user.
 *
 * @param {string} username - ...
 * @param {string} password - ...
 * @returns {Promise<AllowedToken>} ...
 */
schema.statics.validate = async function (username, password) {
  const user = await this.findOne({ username })

  // If no user found or password is wrong, throw an error.
  if (!(await bcrypt.compare(password, user?.password))) {
    throw new Error('Invalid credentials.')
  }

  // User found and password correct, return the user.
  return user
}

// Create a model using the schema.
export const AllowedToken = mongoose.model<IAllowedToken>('AllowedToken', schema)
