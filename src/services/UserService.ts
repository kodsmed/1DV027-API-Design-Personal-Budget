/**
 * This service is responsible for managing the Users.
 * @module UserService
 * @author Jimmy Karlsson <jk224jv@student.lnu.se>
 */

import mongoose, { mongo } from "mongoose"
import { UserData } from "../models/UserData.js"
import { UserRepository } from "../repositories/UserRepository.js"
import { IUser, IUserModel } from "../models/schemas/UserSchema.js"
import { randomUUID } from "crypto"
import bcrypt from 'bcrypt'
import { ExtendedError } from "../lib/types/ExtendedError.js"

/**
 * The BudgetService class.
 */
export class UserService {
  private repository: UserRepository

  /**
   * Creates an instance of the UserService class.
   *
   * @param {UserRepository} userRepository - The user repository.
   */
  constructor(
    userRepository: UserRepository,
  ) {
    this.repository = userRepository
  }

  /**
   * Adds a user to the database.
   */
  async addUser(user: { username: string, email: string, password: string }): Promise<UserData> {
    const fullUser = {
      username: user.username,
      email: user.email,
      password: await this.hashPassword(user.password),
      userID: randomUUID(),
      id: ''
    }
    const userReply = await this.repository.create(fullUser) as unknown
    const userDoc = userReply as IUser

    return this.generateUserDataObject(userDoc)
  }

  /**
   * Remove a user from the database.
   */
  async removeUser(uuid: string): Promise<void> {
    if (!uuid) {
      throw new ExtendedError('User does not exist.', 404, new Error('User does not exist.'), 'UserService.removeUser')
    }
    // does the user exist?
    try {
      console.log (uuid)
      const existingUser = await this.repository.getOneByQuery({ userID: uuid })
      console.log(existingUser)
    if (!existingUser) {
      throw new ExtendedError('User does not exist.', 404, new Error('User does not exist.'), 'UserService.removeUser')
    }
    this.repository.deleteByDocument(existingUser)
    } catch (error: any) {
      throw new ExtendedError('User does not exist.', 404, new Error('User does not exist.'), 'UserService.removeUser')
    }
  }

  /**
   * Log in a user.
   *
   * @param {string} username - The user's username.
   * @param {string} password - The user's password.
   * @returns {UserData} - The authenticated user.
   */
  async getUserPostLogin(username: string, password: string): Promise<UserData> {
    const user = await this.repository.authenticate(username, password)

    return this.generateUserDataObject(user)
  }

  /**
   * Update a user to the new details.
   */
  async updateUser(user: UserData): Promise<UserData> {
    let oldPassword: string = ""
    let oldEmail: string = ""
    let oldUsername: string = ""
    let userDocument = await this.repository.getById(user.id) as IUser
    try {
    oldPassword = userDocument.password
    oldEmail = userDocument.email
    oldUsername = userDocument.username

    // NOTE: This is a placeholder hack to prevent the validator from throwing a unique constraint error if the user does not change their email or username.
    // Since the validator works before the save, we need to temporarily change the email and username to something that will not conflict with the unique constraint.
    // Other options include removing the post, and re-adding it, but that clears timestamps and other data.
    userDocument.username = 'PlaceHolder1234567890'
    userDocument.email = 'placeholder1234567890@placeholderignore.com'
    await this.repository.save(userDocument)
    } catch (error: any) {
      // Revert the changes to the user document.
      userDocument.username = oldUsername
      userDocument.email = oldEmail
      await this.repository.save(userDocument)
      throw error
    }

    try{
      userDocument.username = user.username || oldUsername
      userDocument.email = user.email || oldEmail
      userDocument.password = user.password ? await this.hashPassword(user.password) : oldPassword

      // NOTE: ID and userID should not be updated by the user so they are not included in the update, but if they should be updated, uncomment the following lines.
      // userDocument.userID = user.userID || userDocument.userID
      // userDocument.id = user.id || userDocument.id

      // save the updated user
      const updatedUser = await this.repository.save(userDocument) as IUser
      return this.generateUserDataObject(updatedUser)
    } catch (error: any) {
      // Revert the changes to the user document.
      userDocument.username = oldUsername
      userDocument.email = oldEmail
      userDocument.password = oldPassword
      await this.repository.save(userDocument)
      throw error
    }
  }

  private async hashPassword(password: string): Promise<string> {
    const hashedPassword = await bcrypt.hash(password, 16)
    return hashedPassword
  }

  private generateUserDataObject(user: IUser): UserData {
    const userData = new UserData(
      user.username,
      user.email,
      user.userID,
      //user.password, // Do not return the password to the client... not even hashed.
      '**********',
      user.id
    )
    return userData
  }
}