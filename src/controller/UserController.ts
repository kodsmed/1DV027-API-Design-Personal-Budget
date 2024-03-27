/**
 * User Controller... Register, Login, Logout, Update, Delete
 */

// Import packages
import express, { request, response, NextFunction } from 'express'

// Import modules
import { ExtendedRequest } from '../lib/types/req-extentions.js'
import { UserData } from '../models/UserData.js'
import { UserService } from '../services/UserService.js'
import { Hateoas, HateoasLink } from '../models/Hateoas.js'
import { getBaseLink } from '../util/hateoas.js'
import mongoose, { MongooseError } from 'mongoose'
import { CustomResponse } from '../lib/types/CustomResponse.js'
import { AuthService } from '../services/AuthService.js'
import { ExtendedError } from '../lib/types/ExtendedError.js'

/**
 * The Gitlab session controller.
 */
export class UserController {
  private userService: UserService
  private authService: AuthService

  constructor(userService: UserService, authService: AuthService) {
    this.userService = userService
    this.authService = authService
  }

  /**
   * Regiseter
   */
  public async registerUser(req: express.Request, res: express.Response, next: NextFunction) {
    try {
      const data = await this.userService.addUser({ username: req.body.username, email: req.body.email, password: req.body.password })

      const message = 'User registered successfully'
      const statusCode = 201
      const status = 'Created'
      const baseLink = getBaseLink(req) // host:port/api/api-version
      const hateoas = new Hateoas([
        new HateoasLink('login', `${baseLink}/users/login`, 'POST'),
        new HateoasLink('update', `${baseLink}/users`, 'PUT'),
        new HateoasLink('delete', `${baseLink}/users`, 'DELETE')
      ])
      const responseObject = new CustomResponse(statusCode, status, message, data, hateoas, {})
      res.status(201).json(responseObject)

    } catch (error) {
      const baseLink = getBaseLink(req) // host:port/api/api-version
      const hateoas = new Hateoas([
        new HateoasLink('register', `${baseLink}/users`, 'POST')
      ])
      let message = 'User registration failed'
      let code = 500
      if (error instanceof MongooseError) {
        // duplicate key error
        if (error.message.includes('duplicate key error')) {
          message = 'User already exists'
          code = 400
        }

        if (error instanceof mongoose.Error.ValidationError || error instanceof mongoose.Error.CastError) {
          message = 'Invalid user data'
          code = 400
        }

        if (error instanceof mongoose.Error) {
          message = 'Internal server error'
          code = 500
        }

      }
      if (error instanceof ExtendedError) {
        code = error.status || 500
        message = error.message || 'Internal server error'
      }
      const responseObject = new CustomResponse(code, 'Error', message, {}, hateoas, {})
      res.status(code).json(responseObject)
    }
  }

  /**
   * Unregister a user from the system.
   */
  public async unregisterUser(req: express.Request, res: express.Response, next: NextFunction) {
    try {
      await this.userService.removeUser(req.UUID || '')

      const message = 'User unregistered successfully'
      const statusCode = 200
      const status = 'OK'
      const baseLink = getBaseLink(req) // host:port/api/api-version
      const hateoas = new Hateoas([
        new HateoasLink('register', `${baseLink}/users/register`, 'POST'),
      ])
      const responseObject = new CustomResponse(statusCode, status, message, {}, hateoas, {})
      res.status(200).json(responseObject)
    } catch (error) {
      const baseLink = getBaseLink(req) // host:port/api/api-version
      const hateoas = new Hateoas([
        new HateoasLink('register', `${baseLink}/users/register`, 'POST')
      ])
      let message = 'User unregistration failed'
      let code = 500
      if (error instanceof MongooseError) {
        if (error instanceof mongoose.Error.ValidationError || error instanceof mongoose.Error.CastError) {
          message = 'Invalid user data'
          code = 400
        }

        if (error instanceof mongoose.Error) {
          message = 'Internal server error'
          code = 500
        }
      }
      if (error instanceof ExtendedError) {
        code = error.status || 500
        message = error.message || 'Internal server error'
      }

      const responseObject = new CustomResponse(code, 'Error', message, {}, hateoas, {})
      res.status(code).json(responseObject)
    }
  }

  /**
   * Change user details.
   */
  public async changeDetails(req: express.Request, res: express.Response, next: NextFunction) {
    try {
    const userData: UserData = req.body
    const data = await this.userService.updateUser(userData) as UserData

    const message = 'User details updated successfully'
    const statusCode = 200
    const status = 'OK'
    const baseLink = getBaseLink(req) // host:port/api/api-version
    const hateoas = new Hateoas([
      new HateoasLink('update', `${baseLink}/users`, 'PUT'),
      new HateoasLink('delete', `${baseLink}/users`, 'DELETE')
    ])
    const responseObject = new CustomResponse(statusCode, status, message, data, hateoas, {})
    res.status(200).json(responseObject)
    } catch (error) {
      const baseLink = getBaseLink(req) // host:port/api/api-version
      const hateoas = new Hateoas([
        new HateoasLink('register', `${baseLink}/users/register`, 'POST')
      ])
      let message = 'User details update failed'
      let code = 500
      if (error instanceof MongooseError) {
        // duplicate key error
        if (error.message.includes('duplicate key error')) {
          message = 'User already exists'
          code = 400
        }

        if (error instanceof mongoose.Error) {
          message = 'Internal server error'
          code = 500
        }

        if (error instanceof mongoose.Error.ValidationError || error instanceof mongoose.Error.CastError) {
          message = 'Invalid user data'
          code = 400
        }

      } if (error instanceof ExtendedError) {
        code = error.status || 500
        message = error.message || 'Internal server error'
      }

      const responseObject = new CustomResponse(code, 'Error', message, {}, hateoas, {})
      res.status(code).json(responseObject)
    }
  }

  /**
   * Login. Check if the user exists and if the password is correct, then generate a token and return the user data and tokens.
   */
  public async login(req: express.Request, res: express.Response, next: NextFunction) {
    const baseLink = getBaseLink(req) // host:port/api/api-version
    const hateoas = new Hateoas([
      new HateoasLink('update', `${baseLink}/users`, 'PUT'),
      new HateoasLink('unregister', `${baseLink}/users`, 'DELETE'),
      new HateoasLink('logout', `${baseLink}/users/logout`, 'GET'),
      new HateoasLink('get Budgets', `${baseLink}/budgets`, 'GET')
    ])
    if (req.UUID) {
      const message = 'To save power by avoiding unnecessary cyrptographic operations, please logout first.'
      const statusCode = 403
      const status = 'Forbidden'
      const responseObject = new CustomResponse(statusCode, status, message, {}, hateoas, {})
      res.status(403).json(responseObject)
      return
    }
    const email = req.body.email || ''
    const password = req.body.password || ''
    try {
      const data = await this.authService.login(email, password) as { user: UserData, accessToken: string, refreshToken: string }

      const message = 'User logged in successfully'
      const statusCode = 200
      const status = 'OK'

      const responseObject = new CustomResponse(statusCode, status, message, data, hateoas, {})
      res.status(200).json(responseObject)
    } catch (error) {
      const baseLink = getBaseLink(req) // host:port/api/api-version
      const hateoas = new Hateoas([
        new HateoasLink('login', `${baseLink}/users/login`, 'POST'),
        new HateoasLink('register', `${baseLink}/users/register`, 'POST'),
      ])
      let message = 'User login failed'
      let code = 500
      if (error instanceof MongooseError) {
        if (error instanceof mongoose.Error.ValidationError || error instanceof mongoose.Error.CastError) {
          message = 'Invalid user data'
          code = 400
        }
      } else {
        message = 'Internal server error'
        code = 500
      }

      if (error instanceof ExtendedError) {
        code = error.status || 500
        message = error.message || 'Internal server error'
      }
      const errorAsAny = error as any
      if (errorAsAny.message != undefined && errorAsAny.message === "Failed to authenticate user.") {
        code = 401
        message = "Invalid credentials"
      }

      const responseObject = new CustomResponse(code, 'Error', message, {}, hateoas, {})
      res.status(code).json(responseObject)
    }
  }

  /**
   * Logout. Remove the refresh token from the database.
   *
   * WARNING: The access token is not stored in the database, so it is not removed.
   * Consequently, the access token will still be valid until it expires... This is how JWTs are designed to work.
   */
  public async logout(req: express.Request, res: express.Response, next: NextFunction) {
    try {
      const userUUID = req.UUID || ''
      await this.authService.logout(userUUID)

      const message = 'User logged out successfully'
      const statusCode = 200
      const status = 'OK'
      const baseLink = getBaseLink(req) // host:port/api/api-version
      const hateoas = new Hateoas([
        new HateoasLink('login', `${baseLink}/users/login`, 'POST'),
        new HateoasLink('register', `${baseLink}/users/register`, 'POST')
      ])
      const responseObject = new CustomResponse(statusCode, status, message, {}, hateoas, {})
      res.status(200).json(responseObject)

    } catch (error) {
      const baseLink = getBaseLink(req) // host:port/api/api-version
      const hateoas = new Hateoas([
        new HateoasLink('login', `${baseLink}/users/login`, 'POST'),
        new HateoasLink('register', `${baseLink}/users/register`, 'POST')
      ])
      let message = 'User logout failed'
      let code = 500
      if (error instanceof MongooseError) {
        // duplicate key error

        if (error instanceof mongoose.Error.ValidationError || error instanceof mongoose.Error.CastError) {
          message = 'Invalid user data'
          code = 400
        }

        if (error instanceof mongoose.Error) {
          message = 'Internal server error'
          code = 500
        }

      } else {
        message = 'Internal server error'
        code = 500
      }

      if (error instanceof ExtendedError) {
        code = error.status || 500
        message = error.message || 'Internal server error'
      }

      const responseObject = new CustomResponse(code, 'Error', message, {}, hateoas, {})

      res.status(code).json(responseObject)
    }
  }

}