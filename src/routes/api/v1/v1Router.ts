/**
 * V1 Router
 */
// Import packages
import express from 'express'
import { CustomResponse } from '../../../lib/types/CustomResponse.js'
import { Hateoas, HateoasLink } from '../../../models/Hateoas.js'

export function createV1Router(
  userRouter: express.Router,
  budgetRouter: express.Router
) {
  /**
   * The version one router.
   */
  const router = express.Router()

  router.route('/').get((req, res) => {
    const responseObject = new CustomResponse(200, 'OK', 'API V1', {}, new Hateoas([
      new HateoasLink('register', '/api/v1/user', 'POST'),
      new HateoasLink('login', '/api/v1/user/login', 'POST'),
      new HateoasLink('logout', '/api/v1/user/logout', 'GET'),
      new HateoasLink('unregister', '/api/v1/user', 'DELETE'),
      new HateoasLink('budgets', '/api/v1/budget', 'GET'),
    ]), {})
    res.status(200).json(responseObject)
  })

  /**
   * The user router.
   */
  router.use('/users', userRouter)

  /**
   * The budget router.
   */
  router.use('/budgets', budgetRouter)

  return router
}
