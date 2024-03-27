/**
 * Mongoose model User.
 *
 * @author Jimmy Karlsson <jk224jv@student.lnu.se>
 * @version 1.0.0
 */

import bcrypt from 'bcrypt'
import mongoose, { Document, Model } from 'mongoose'
import validator from 'validator'
import { ExtendedError } from '../../lib/types/ExtendedError.js'

const { isEmail } = validator

export interface IUser extends Document {
  username: string
  password: string
  email: string
  userID: string
  id: string
}

export interface IUserModel extends Model<IUser> {
  authenticate(username: string, password: string): Promise<IUser>
}

// Create a schema.
const schema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required.'],
    unique: false,
    // - A valid username should start with an alphabet so, [A-Za-z].
    // - All other characters can be alphabets, numbers or an underscore so, [A-Za-z0-9_-].
    // - Since length constraint is 8-32 and we had already fixed the first character, so we give {7, 31}.
    // - We use ^ and $ to specify the beginning and end of matching.
    match: [/^[A-Za-z][A-Za-z0-9_-]{7,31}$/, 'Please provide a valid username. Alphanumeric characters, underscores and dash only.'],
  },
  password: {
    type: String,
    minLength: [12, 'The password must be of minimum length 12 characters.'],
    maxLength: [256, 'The password must be of maximum length 256 characters.'],
    required: [true, 'Password is required.']
  },
  email: {
    type: String,
    required: [true, 'Email address is required.'],
    unique: true,
    lowercase: true,
    trim: true,
    validate: [isEmail, 'Please provide a valid email address.']
  },
  userID: {
    type: String,
    required: [true, 'User ID is required.'],
    length: [36, 'User ID must be 36 characters long.']
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
 * @param {string} email - ...
 * @param {string} password - ...
 * @returns {Promise<User>} ...
 */
schema.statics.authenticate = async function (email, password) {
  const user = await this.findOne({email})

  if (!user) {
    throw new ExtendedError('Invalid credentials.', 401, new Error('Invalid credentials.'), 'Authentication')
  }
  // If no user found or password is wrong, throw an error.
  if (!(await bcrypt.compare(password, user.password))) {
    throw new ExtendedError('Invalid credentials.', 401, new Error('Invalid credentials.'), 'Authentication')
  }

  // User found and password correct, return the user.
  return user
}

// Create a model using the schema.
export const User = mongoose.model('User', schema)
