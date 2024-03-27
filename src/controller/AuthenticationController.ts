/**
 * A single service Controller that verifies the JWT token and its payload authenticating the user.
 */

// Import packages

import { Request, Response, NextFunction } from 'express'
import { JWTServices } from '../services/JWTServices.js'
import { JWTPayload } from '../models/JWT.js'
import { Hateoas, HateoasLink } from '../models/Hateoas.js'
import { getBaseLink } from '../util/hateoas.js'

export class AuthenticationController {
  private jwtServices: JWTServices

  /**
   * Creates an instance of the AuthenticationController class.
   *
   * @param {JWTServices} jwtServices - The JWT services.
   */
  constructor(jwtServices: JWTServices) {
    this.jwtServices = jwtServices
  }

  /**
   * Verifies the JWT token and its payload.
   */
  async authenticate(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Get the token from the request
      const token = req.body.token as string || req.query.token as string || req.headers.authorization?.split(' ')[1] || ''
      if (!token) {
        throw new Error('Token not provided')
      }
      const secret = process.env.JWT_SECRET || '$2b$16$0Ji7HRlVkCxewoub8etC/.jlXL/I.A.39UgKKglimdag0WpBHrasm'

      // Verify the token
      const payload = await this.jwtServices.verifyToken(token, secret) as any

      if (!payload) {
        throw new Error('Token not valid')
      }

      // Check if the token is expired
      const dateOfExpiry = new Date(payload.validTo)
      if (dateOfExpiry < new Date()) {
        throw new Error('Token expired')
      }
      req.UUID = payload.uuid

      // Add the payload to the request object
      req.body = { ...req.body, ...payload }
      next()
    } catch (error:any) {
      let reason = ''
      let hateoas
      const baseUrlPath = getBaseLink(req)

      if (error instanceof Error && error.message === 'Token expired') {
        reason = 'Token expired'
        hateoas = new Hateoas([new HateoasLink('login', `${baseUrlPath}/login`, 'POST' ), new HateoasLink('renew', `${baseUrlPath}/renew`, 'POST') ])
      } else {
        reason = 'Token not valid'
        hateoas = new Hateoas([new HateoasLink('login', `${baseUrlPath}/login`, 'POST')])
      }
      res.status(401).json({ error: reason, ...hateoas.toObject() })
    }
  }
}