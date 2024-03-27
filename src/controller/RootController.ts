/**
 * This is the root controller of the application.
 * It is responsible for handling the root route and everything that is in that scope.
 */

import express from 'express'
import { UserController } from './UserController.js'
import { Hateoas, HateoasLink } from '../models/Hateoas.js'
import { getBaseLink } from '../util/hateoas.js'

export class RootController {
  /**
   * The user controller.
   */
  private userController: UserController

  /**
   * Creates an instance of the RootController class.
   *
   * @param {UserController} userController - The user controller.
   */
  constructor(userController: UserController) {
    this.userController = userController
  }

  /**
   * Returns the API documentation.
   */
  async returnApiDocumentation(req: express.Request, res: express.Response, next: express.NextFunction) {
    const protocol = req.protocol
    const host = req.get('host')
    const documentationURI = `${protocol}://${host}/api-docs`
    const baseLink = getBaseLink(req) // host:port/api/api-version
    const hateoasLinks = new Hateoas(
      [
        new HateoasLink('login', `${baseLink}/user/login`, 'POST'),
        new HateoasLink('register', `${baseLink}/user`, 'POST')
      ]
    )

    try {
      res.status(200).json({
        message: 'Welcome to the Personal Budget API',
        documentation: documentationURI,
        links: hateoasLinks
      })
    } catch (error) {
      res.status(500).json({ message: 'Internal server error' })
    }
  }

}