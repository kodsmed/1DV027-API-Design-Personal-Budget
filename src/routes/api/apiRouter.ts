/**
 * @file apiRouter.ts - Defines the api router for the application
 * @module apiRouter
 * @author Jimmy Karlsson <jk224jv@student.lnu.se>
 * @version 1.0.0
 */
// Import packages
import express, { NextFunction } from 'express'

// Import types
// IMPORTANT: ExtendedRequest is marked as unused by the IDE but is required to make the decorated properties work. Do not remove unless you convert to JS.
import { ExtendedRequest } from '../../lib/types/req-extentions.js'
import { ServerOptions } from '../../lib/types/serverOptions.js'
import { AuthenticationController } from '../../controller/AuthenticationController.js'
import e from 'express'


export function createAPIRouter(
  versionOneRouter: express.Router,
  authenticationController: AuthenticationController

) {
  /**
   * The API router for the application.
   */
  const router = express.Router()

  /**
   * The version one router.
   */
  router.use('/v1', versionOneRouter)

  return router
}