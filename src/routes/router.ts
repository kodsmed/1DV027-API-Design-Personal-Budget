/**
 * @file router.ts - Defines the main router for the application
 * @module router
 * @author Jimmy Karlsson <jk224jv@student.lnu.se>
 * @version 1.0.0
 */
// Import packages
import express, { NextFunction } from 'express'

// Import the Modules
import { RootController } from '../controller/RootController.js'



// Import types
// IMPORTANT: ExtendedRequest is marked as unused by the IDE but is required to make the decorated properties work. Do not remove unless you convert to JS.
import { ExtendedRequest } from '../lib/types/req-extentions.js'


export function createRootRouter(
  apiRouter: express.Router,
  rootController: RootController,
) {
  /**
   * The main router for the application.
   */
  const router = express.Router()


  /**
   * Middleware to ensure that the URL is correctly formatted... depending on the interaction between BaseURL and proxy settings this might be needed.
   * Some reverse proxies might add a double slash to the URL, this middleware will remove that... its is precautionary and should not be needed in most cases.
   */
  router.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
    // replace // with /
    if (req.url.startsWith('//')) {
      req.url = req.url.replace('//', '/')
    }
    // make sure the URL starts with /
    if (!req.url.startsWith('/')) {
      req.url = '/' + req.url
    }
    next()
  })


  /**
   * The root route for the application - returns the API documentation.
   */
  router.route('/').get(async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    rootController.returnApiDocumentation(req, res, next)
  })

  /**
   * The API router.
   * @type {Router}
   */
  router.use('/api', apiRouter)

  /**
   * Pass everything else to the error handler.
   */
  router.use('*', (req, res, next) => {
    next(new Error('404 - Route not found'))
  })

  return router
}