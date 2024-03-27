/**
 * Extends (decorates) the request object and by giving the request object a new properties.
 * @property {string} requestUuid - A unique identifier for the request.
 * @property {string} code - The current request's session ID towards gitlab, if available.
 * @property {string} token - The current request's token towards gitlab, if available.
 * @property {string} refreshToken - The current request's refresh token towards gitlab, if available.
 * @class ExtendedRequest
 */
import { request } from 'express';
import 'express-serve-static-core';

declare module 'express-serve-static-core' {
  interface Request {
    requestUuid?: string
    code?: string
    token?: string
    refreshToken?: string
    session?: any
    code?: string
    UUID?: string
    query?: any
    navLinks?: { href: string, text: string }[]
  }
}

export class ExtendedRequest extends 'request' {
  requestUuid?: string
  code?: string
  token?: string
  refreshToken?: string
  session?: any
  code?: string
  UUID?: string
  query?: any
  navLinks?: { href: string, text: string }[]

  constructor() {
    super()
  }
}


