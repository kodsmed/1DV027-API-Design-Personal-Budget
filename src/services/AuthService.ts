/**
 * AuthService abstracts the authentication logic from the components to a single service and acts as a facade for the services that are responsible for the authentication.
 * @module AuthService
 */

import { UserService } from './UserService.js'
import { JWTServices } from './JWTServices.js'
import { UserData } from '../models/UserData.js'
import { TokenRepository } from '../repositories/TokenRepository.js'
import { ExtendedError } from '../lib/types/ExtendedError.js'
import { JWTPayload, RefreshPayload } from '../models/JWT.js'

/**
 * The AuthService class.
 */
export class AuthService {
  private userService: UserService
  private jwtServices: JWTServices
  private tokenRepository: TokenRepository

  /**
   * Creates an instance of the AuthService class.
   *
   * @param {UserService} userService - The user service.
   * @param {JWTServices} jwtServices - The JWT service.
   * @param {TokenRepository} tokenRepository - The token repository.
   */
  constructor(
    userService: UserService,
    jwtServices: JWTServices,
    tokenRepository: TokenRepository
  ) {
    this.userService = userService
    this.jwtServices = jwtServices
    this.tokenRepository = tokenRepository
  }

  /**
   * Registers a new user.
   *
   * @param {UserData} user - The user data.
   * @return {Promise<UserData>} - The registered user.
   */
  async register(user: UserData): Promise<UserData> {
    this.userService.addUser(user)
    return this.userService.getUserPostLogin(user.username, user.password)
  }

  /**
   * Authenticates a user.
   *
   * @param {string} username - The user's username.
   * @param {string} password - The user's password.
   * @return {Promise<object>} - {accessToken, refreshToken}.
   */
  async login(username: string, password: string): Promise<object> {
    let user
    try {
      user = await this.userService.getUserPostLogin(username, password)
    } catch (error: any) {
      let errorToPass
      let code = 401
      if (error instanceof ExtendedError) {
        throw error
      } else {
        errorToPass = new Error("Invalid credentials.")
      }
      const err = new ExtendedError("Invalid credentials.", code, errorToPass, "AuthService.authenticate")
      throw err
    }

    // if there is any old whitelist token, remove it
    try {
      if (user) {
        await this.tokenRepository.removeToken(user.uuid)
      }
    } catch (error: any) {
      // allowed to fail, as it might not exist
    }

    const secret = process.env.JWT_SECRET as string || '$2b$16$0Ji7HRlVkCxewoub8etC/.jlXL/I.A.39UgKKglimdag0WpBHrasm'
    const hoursToLive = process.env.JWT_LIFETIME as string || '1'
    const timeToLive = parseInt(hoursToLive) * 60 * 60 * 1000
    const refreshHoursToLive = process.env.REFRESH_HOURS_TTL as string || '24'
    const refreshTimeToLive = parseInt(refreshHoursToLive) * 60 * 60 * 1000
    const tokenDateOfExpiry = new Date(Date.now() + timeToLive)
    const refreshTokenDateOfExpiry = new Date(Date.now() + refreshTimeToLive)
    const payload = {uuid: user.uuid, validTo: tokenDateOfExpiry.getTime().toString()}
    const refreshPayload = {uuid: user.uuid, sequenceNumber: 0, validTo: refreshTokenDateOfExpiry.getTime().toString()}
    const token = await this.jwtServices.createToken(payload, secret, timeToLive.toString())
    const refreshToken = await this.jwtServices.createToken(refreshPayload, secret, refreshTimeToLive.toString())

    // add the refresh token to the whitelist
    try {
      await this.tokenRepository.addToken(user.uuid, 1)
    } catch (error: any) {
      let errorToPass
      let code = 500
      if (error instanceof ExtendedError) {
        throw error
      } else {
        errorToPass = new Error("Failed to add token.")
      }
      const err = new ExtendedError("Failed to add token.", code, errorToPass, "AuthService.authenticate")
      throw err
    }
    return { user: user, accessToken: token, refreshToken: refreshToken }
  }

  /**
   * Refreshes the access token.
   *
   * @param {string} refreshToken - The refresh token.
   * @return {Promise<object>} - {accessToken, refreshToken}.
   */
  async refresh(refreshToken: string): Promise<object> {
    // We are using a very basic RTR (Refresh Token Rotation) strategy with a built in reuse detection to counter Token theft and replay attacks.
    // The sequenceNumber is stored in the refresh token and is incremented each time a new refresh token is issued.
    const payload = await this.jwtServices.verifyToken(refreshToken, process.env.JWT_SECRET as string) as RefreshPayload
    const userUUID = payload.uuid
    const sequenceNumber = payload.sequenceNumber

    // Check if the refresh token is valid
    try {
      await this.tokenRepository.validateToken(userUUID, sequenceNumber)
    } catch (error: any) {
      // it is not valid, so someone is trying to reuse an old token or it has been stolen.
      // remove it from the whitelist and return an error.
      try {
        await this.tokenRepository.removeToken(userUUID)
      } catch (error: any) {
        // allowed to fail, as it might not exist
      }
      const errorMessage = 'Invalid token.'
      throw new ExtendedError(errorMessage, 401, new Error(errorMessage), 'AuthService.refresh')
    }

    // all good, issue a new access token


    const secret = process.env.JWT_SECRET as string || '$2b$16$0Ji7HRlVkCxewoub8etC/.jlXL/I.A.39UgKKglimdag0WpBHrasm'
    const hoursToLive = process.env.JWT_LIFETIME as string || '1'
    const timeToLive = parseInt(hoursToLive) * 60 * 60 * 1000
    const refreshHoursToLive = process.env.REFRESH_HOURS_TTL as string || '24'
    const refreshTimeToLive = parseInt(refreshHoursToLive) * 60 * 60 * 1000
    const tokenDateOfExpiry = new Date(Date.now() + timeToLive)
    const refreshTokenDateOfExpiry = new Date(Date.now() + refreshTimeToLive)
    const newPayload = {uuid: userUUID, validTo: tokenDateOfExpiry.getTime().toString()}
    const token = await this.jwtServices.createToken(newPayload, secret, timeToLive.toString())
    const newRefreshPayload = {uuid: userUUID, sequenceNumber: sequenceNumber + 1, validTo: refreshTokenDateOfExpiry.getTime().toString}
    const newRefreshToken = await this.jwtServices.createToken(newRefreshPayload, secret, timeToLive.toString())

    // advance the sequence number
    try {
      await this.tokenRepository.advanceSequenceNumber(userUUID)
    } catch (error: any) {
      // there is no reason for this to fail... so there is only 500
      const errorMessage = 'Failed to advance sequence number.'
      throw new ExtendedError(errorMessage, 500, new Error(errorMessage), 'AuthService.refresh')
    }

    return { accessToken: token, refreshToken: newRefreshToken }
  }

  /**
   * Logs out a user.
   */
  async logout(userUUID: string): Promise<void> {
    try {
      // check that the token exists
      try {
        const token = await this.tokenRepository.tokenExists(userUUID)
        if (!token) {
          const message = 'Not logged in.'
          throw new ExtendedError(message, 403, new Error(message), 'AuthService.logout')
        }
      } catch (error: any) {
        const message= 'Not logged in.'
        throw new ExtendedError(message, 403, new Error(message), 'AuthService.logout')
      }
      await this.tokenRepository.removeToken(userUUID)
    } catch (error: any) {
      let errorToPass
      let code = 500
      let message = 'Failed to remove token.'
      if (error instanceof ExtendedError) {
        code = error.status || 500
        message = error.message || 'Failed to remove token.'
        throw error
      } else {
        errorToPass = new Error("Failed to remove token.")
      }
      const err = new ExtendedError(message, code, errorToPass, "AuthService.logout")
      throw err
    }
  }

  /**
   * Remove all expired tokens from the whitelist.
   */
  async cleanup(): Promise<void> {
    try {
      await this.tokenRepository.cleanup()
    } catch (error: any) {
      let errorToPass
      let code = 500
      if (error instanceof ExtendedError) {
        throw error
      } else {
        errorToPass = new Error("Failed to cleanup tokens.")
      }
      const err = new ExtendedError("Failed to cleanup tokens.", code, errorToPass, "AuthService.cleanup")
      throw err
    }
  }
}
