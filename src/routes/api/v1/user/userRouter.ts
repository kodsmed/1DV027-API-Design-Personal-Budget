/**
 * The user router.
 */
import express from 'express'
import { container, TYPES } from '../../../../config/inversify.config.js'
import { UserController } from '../../../../controller/UserController.js'

export function createUserRouter(
  userController: UserController
) {
  /**
   * The user router.
   */
  const router = express.Router()
  const controller = userController

  /**
   * The user login route.
   */
  router.route('/login').post(async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    await controller.login(req, res, next)
  })

  /**
   * The user logout route.
   */
  router.route('/logout').get(async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    await controller.logout(req, res, next)
  })

    /**
     * The user register route.
     */
    router.route('/').post(async (req: express.Request, res: express.Response, next: express.NextFunction) => {
      await controller.registerUser(req, res, next)
    })

    router.route('/').delete(async (req: express.Request, res: express.Response, next: express.NextFunction) => {
      await controller.unregisterUser(req, res, next)
    })

    /**
     * Password change route.
     */
    router.route('/').put(async (req: express.Request, res: express.Response, next: express.NextFunction) => {
      await controller.changeDetails(req, res, next)
    })

  return router
}