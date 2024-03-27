/**
 * A service class that provides JWT related services.
 *
 * @class JWTServices
 * @module services/JWTServices
 */

import jwt from 'jsonwebtoken'

export class JWTServices {
  /**
   * Creates a JWT token.
   *
   * @param {object} payload - The payload to be included in the token.
   * @param {string} secret - The secret to be used to sign the token.
   * @param {string} expiresIn - The time in seconds until the token expires.
   * @returns {string} - The JWT token.
   */
  async createToken(payload: object, secret: string, expiresIn: string): Promise<string> {
    return jwt.sign(payload, secret, { expiresIn })
  }

  /**
   * Verifies a JWT token.
   *
   * @param {string} token - The JWT token.
   * @param {string} secret - The secret to be used to verify the token.
   * @returns {object} - The payload of the token.
   */
  async verifyToken(token: string, secret: string): Promise<object> {
    if (!token) {
      throw new Error('Token not provided.')
    }

    if (!secret) {
      throw new Error('Secret not provided.')
    }
    const result = jwt.verify(token, secret)
    if (typeof result !== 'object') {
      throw new Error('Invalid token.')
    }

    return result
  }
}