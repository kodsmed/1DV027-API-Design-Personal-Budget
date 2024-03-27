/**
 * Middleware to remove expired sessions from the database.
 */
import { container, TYPES } from '../config/inversify.config.js'
import { AuthService } from '../services/AuthService.js'
import express from 'express'
import { ExtendedRequest } from '../lib/types/req-extentions.js'

export const removeExpiredSessions = (req: ExtendedRequest, res: express.Response, next: express.NextFunction) => {
  const authService = container.get<AuthService>(TYPES.AuthService)
  authService.cleanup()
  next()
}