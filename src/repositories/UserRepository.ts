/**
 * @file UserRepository is a repository class for users.
 * @module repositories/UserRepository
 * @author Jimmy Karlsson <jk224jv@student.lnu.se>
 */

import mongoose from 'mongoose'
import { RepositoryBase } from "./RepositoryBase.js"
import { ExtendedError } from "../lib/types/ExtendedError.js"
import { IUserModel } from '../models/schemas/UserSchema.js'

export class UserRepository extends RepositoryBase {
  /**
   * Creates an instance of the UserRepository class.
   *
   * @param {} model - The extended model for the user schema to be used by the repository.
   */
  constructor(model: mongoose.Model<mongoose.Document>) {
    super(model)
  }

  /**
   * Authenticates a user.
   *
   * @param {string} username - The user's username.
   * @param {string} password - The user's password.
   * @returns {Promise<User>} - The authenticated user.
   */
  async authenticate(username: string, password: string) {
    try {
      const model = this.model as any
      return await model.authenticate(username, password)
    } catch (error: any) {
      let errorToPass
      let code = 500
      if (error instanceof mongoose.Error.ValidationError) {
        errorToPass = new Error("Validation failed.")
        code = 400
      }
      else if (error instanceof mongoose.Error) {
        errorToPass = new Error("Failed to authenticate user.")
        code = 401
      }
      else {
        errorToPass = new Error("Unknown error.")
      }
      const err = new ExtendedError("Failed to authenticate user.", code, errorToPass, "UserRepository.authenticate")
      throw err
    }
  }
}