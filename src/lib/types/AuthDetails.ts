/**
 * @file AuthDetails.ts - Defines the AuthDetails type
 * @description AuthDetails is a DTO that holds the code, access token and refresh token.
 * The object is immutable after creation.
 *
 * @module AuthDetails
 * @version 1.0.0
 */

export class AuthDetails{
  code: string
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
  createdAt: Date;

  constructor (code: string, accessToken: string, refreshToken: string, expiresIn: number) {
    this.code = code
    this.accessToken = accessToken
    this.refreshToken = refreshToken
    this.expiresAt = new Date(new Date().getTime() + expiresIn * 1000)
    this.createdAt = new Date()

  }

  /**
   * Checks if the access token has expired.
   *
   * @returns {boolean} - True if the access token has expired, otherwise false.
   */
  isExpired(): boolean {
    return this.expiresAt < new Date()
  }
}

/**
 * Specialized AuthDetails object that represents an empty object.
 */
export class NullAuthDetails extends AuthDetails {
  constructor() {
    super("", "", "", 0)
  }
}

