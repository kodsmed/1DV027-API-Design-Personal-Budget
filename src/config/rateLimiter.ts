/**
 * @file This file configures the rate limiter.
 * @module rateLimiter
 * @author Mats Loock
 * @see {@link https://www.npmjs.com/package/express-rate-limit}
 */

// User-land modules.
import rateLimit from 'express-rate-limit'

export const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 100, // Limit each IP to 100 requests per `window` (here, per 10 minutes)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false // Disable the `X-RateLimit-*` headers
})
