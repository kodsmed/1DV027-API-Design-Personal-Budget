/**
 * This file is used to extend the express-session types
 *
 * @module express-session
 */

import { SessionData } from 'express-session';

declare module 'express-session' {
  interface SessionData {
    UUID?: string
  }
}