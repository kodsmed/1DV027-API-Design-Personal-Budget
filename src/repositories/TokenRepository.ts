/**
 * TokenRepository - Repository for AllowedTokensModel
 *
 * @note This repository is used to keep track of the refresh tokens that are allowed to be used,
 * essentially creating a whitelist of tokens that are allowed to be used allowing tokens to be revoked,
 * and thus limiting the damage that can be done if a token is leaked.
 */

import { AllowedToken, IAllowedToken } from '../models/schemas/AllowedTokenSchema.js'
import { ExtendedError } from '../lib/types/ExtendedError.js'
import { RepositoryBase, Result } from './RepositoryBase.js'
import mongoose from 'mongoose'

/**
 * TokenRepository
 */
export class TokenRepository extends RepositoryBase {
  /**
   * Creates an instance of the TokenRepository class.
   *
   * @param {IAllowedToken} model - The extended model for the AllowedToken schema to be used by the repository.
   */
  constructor(model: mongoose.Model<mongoose.Document>) {
    super(model)
  }

  /**
   * Adds a token to the whitelist.
   *
   * @param {string} uuid - The user UUID
   * @param {number} sequenceNumber - The number of issued tokens.
   * @returns {Promise<IAllowedToken>} - The token that was added to the whitelist.
   */
  async addToken(uuid: string, sequenceNumber: number) {
    const permitted = {
      userUUID: uuid,
      sequenceNumber: sequenceNumber,
      expireAt: new Date(Date.now() + parseInt(process.env.REFRESH_HOURS_TTL || '24') * 1000 * 60 * 60)
    }
    try {
      await super.create(permitted)
    } catch (error: any) {
      let errorToPass
      let code = 500
      if (error instanceof mongoose.Error.ValidationError) {
        errorToPass = new Error("Validation failed.")
        code = 400
      }
      else if (error instanceof mongoose.Error) {
        errorToPass = new Error("Failed to add token.")
        code = 500
      }
      else {
        errorToPass = new Error("Unknown error.")
      }
      const err = new ExtendedError("Failed to add token.", code, errorToPass, "TokenRepository.addToken")
      throw err
    }
  }

  /**
   * Advance the sequence number for a user.
   *
   * @param {string} uuid - The user UUID
   */
  async advanceSequenceNumber(uuid: string) {
    try {
      const token = await super.getOneByQuery({ userUUID: uuid }) as IAllowedToken
      token.sequenceNumber++
      token.expireAt = new Date(Date.now() + parseInt(process.env.REFRESH_HOURS_TTL || '24') * 1000 * 60 * 60)
      await token.save()
    } catch (error: any) {
      let errorToPass
      let code = 500
      if (error instanceof mongoose.Error.ValidationError) {
        errorToPass = new Error("Validation failed.")
        code = 400
      }
      else if (error instanceof mongoose.Error) {
        errorToPass = new Error
      }
      else {
        errorToPass = new Error("Unknown error.")
      }
      const err = new ExtendedError("Failed to advance sequence number.", code, errorToPass, "TokenRepository.advanceSequenceNumber")
      throw err
    }
  }

  /**
   * Validates a token.
   *
   * @param {string} uuid - The user UUID
   * @param {number} sequenceNumber - The number of issued tokens.
   * @returns {Promise<IAllowedToken>} - The token that was validated.
   * @throws {ExtendedError} - If the token is not found or the sequence number is incorrect.
   */
  async validateToken(uuid: string, sequenceNumber: number) {
    try {
      const token = await super.getOneByQuery({ userUUID: uuid }) as IAllowedToken
      if (token.sequenceNumber !== sequenceNumber) {
        const errorMessage = 'Invalid token.'
        throw new ExtendedError(errorMessage, 401, new Error(errorMessage), 'TokenRepository.validateToken')
      }
      return token
    } catch (error: any) {
      let errorToPass
      let code = 500
      if (error instanceof mongoose.Error.ValidationError) {
        errorToPass = new Error("Validation failed.")
        code = 400
      }
      else if (error instanceof mongoose.Error) {
        errorToPass = new Error("Failed to validate token.")
      }
      else {
        errorToPass = new Error("Unknown error.")
      }
      const err = new ExtendedError("Failed to validate token.", code, errorToPass, "TokenRepository.validateToken")
      throw err
    }
  }

  /**
   * Check if the token exists.
   */
  async tokenExists(uuid: string): Promise<unknown> {
    try {
      const token = await super.getOneByQuery({ userUUID: uuid })
      if (!token) {
        const errorMessage = 'Token not found.'
        throw new ExtendedError(errorMessage, 401, new Error(errorMessage), 'TokenRepository.tokenExists')
      }
      return token
    } catch (error: any) {
      let errorToPass
      let code = 500
      if (error instanceof mongoose.Error.ValidationError) {
        errorToPass = new Error("Validation failed.")
        code = 400
      }
      else if (error instanceof mongoose.Error) {
        errorToPass = new Error("Failed to validate token.")
      }
      else {
        errorToPass = new Error("Unknown error.")
      }
    }
  }

  /**
   * Removes a token from the whitelist.
   *
   * @param {string} uuid - The user UUID
   * @returns {Promise<void>}
   */
  async removeToken(uuid: string) {
    try {
      const tokenDoc = await super.getOneByQuery({ userUUID: uuid })

      if (!tokenDoc) {
        throw new ExtendedError("Token not found.", 404, new Error("Token not found."), "TokenRepository.removeToken")
      }
      await super.deleteByDocument(tokenDoc)
      return
    } catch (error: any) {
      let errorToPass
      let code = 500
      if (error instanceof mongoose.Error.ValidationError) {
        errorToPass = new Error("Could not remove token.")
        code = 400
      }
      else if (error instanceof mongoose.Error) {
        errorToPass = new Error
      }
      else {
        errorToPass = new Error("Unknown error.")
      }
      const err = new ExtendedError("Failed to remove token.", code, errorToPass, "TokenRepository.removeToken")
      throw err
    }
  }

  /**
   * Remove all expired tokens from the whitelist.
   */
  async cleanup() {
    try {
      const tokens = await super.getAll() as Result

      if (!tokens || tokens.data.length === 0) {
        return
      }

      // if there are less tokens than the total count, there are more tokens to fetch
      if (tokens.data.length < tokens.pagination.totalCount) {
        for (let i = 2; i < tokens.pagination.totalPages; i ++) {
          const moreTokens = await super.getAll({ page: i, perPage: 20 }) as Result
          tokens.data.push(...moreTokens.data)
        }
      }

      for (const token of tokens.data as IAllowedToken[]) {
        if (token.expireAt < new Date()) {
          await super.deleteByDocument(token)
        }
      }
    } catch (error: any) {
      let errorToPass
      let code = 500
      if (error instanceof mongoose.Error.ValidationError) {
        errorToPass = new Error("Could not cleanup tokens.")
        code = 400
      }
      else if (error instanceof mongoose.Error) {
        errorToPass = new Error
      }
      else {
        errorToPass = new Error("Unknown error.")
      }
      const err = new ExtendedError("Failed to cleanup tokens.", code, errorToPass, "TokenRepository.cleanup")
      throw err
    }
  }
}