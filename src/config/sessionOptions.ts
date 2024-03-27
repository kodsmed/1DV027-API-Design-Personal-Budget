/**
 * @description Session options
 */

import { SessionOptions } from 'express-session'

if (!process.env.SESSION_SECRET) {
  throw new Error('SESSION_SECRET is not set')
}
const isProduction = process.env.NODE_ENV === 'production' ? true : false
export const sessionOptions: SessionOptions= {
  name: 'API-Design',
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: isProduction,
    httpOnly: true,
    sameSite: 'lax',
    // one hour
    maxAge: 1000 * 60 * 60 * 24,
  }
}