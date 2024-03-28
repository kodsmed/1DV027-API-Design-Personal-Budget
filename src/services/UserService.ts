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
      console.log(uuid)
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
    let userDocument: IUser | null = null
    try {
      userDocument = await this.repository.getOneByQuery({ userID: user.uuid }) as IUser
    }
    catch (error: any) {
      throw new ExtendedError('User does not exist.', 404, new Error('User does not exist.'), 'UserService.updateUser')
    }

    if (!userDocument) {
      throw new ExtendedError('User does not exist.', 404, new Error('User does not exist.'), 'UserService.updateUser')
    }
    if (!user.username && !user.email && !user.password) {
      throw new ExtendedError('No changes to user.', 400, new Error('No changes to user.'), 'UserService.updateUser')
    }
    if (user.username) {
      // set up the regex pattern for the username
      const pattern = /^[A-Za-z][A-Za-z0-9_-]{7,31}$/;
      if (!pattern.test(user.username)) {
        throw new ExtendedError('Invalid username.', 400, new Error('Invalid username.'), 'UserService.updateUser');
      }
    }
    if (user.email) {
      // set up the regex pattern for the email
      const pattern = new RegExp('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+.[a-zA-Z]{2,}$')
      if (!pattern.test(user.email)) {
        throw new ExtendedError('Invalid email.', 400, new Error('Invalid email.'), 'UserService.updateUser')
      }
    }

    let otherUser: IUser | null = null
    try {
      otherUser = await this.repository.getOneByQuery({ email: user.email }) as IUser
    }
    catch (error: any) {
    }
    // no user found, so we can continue


    if (otherUser && otherUser.userID !== user.uuid) {
      throw new ExtendedError('Email already in use.', 400, new Error('Email already in use.'), 'UserService.updateUser')
    }

    if (user.email.length > 256) {
      throw new ExtendedError('Email too long.', 400, new Error('Email too long.'), 'UserService.updateUser')
    }
    if (user.password && user.password.length > 256) {
      throw new ExtendedError('Password too long.', 400, new Error('Password too long.'), 'UserService.updateUser')
    }
    userDocument.username = user.username || userDocument.username
    userDocument.email = user.email || userDocument.email
    userDocument.password = user.password ? await this.hashPassword(user.password) : userDocument.password
    const validateBeforeSave = false // Needed to avoid issues with the unique constraint on the email field.
    try {
      const updatedUser = await this.repository.save(userDocument, validateBeforeSave) as IUser
      return this.generateUserDataObject(updatedUser)
    } catch (error: any) {
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