/**
 * Extends the Error object to include a status code, cause, message and stack.
 * @property {number} statusCode - The status code of the error.
 * @property {string} message - The error message.
 * @property {string} stack - The error stack.
 * @property {Error} cause - The cause of the error.
 * @module ExtendedError
 */
export class ExtendedError extends Error {
    cause?: Error
    status?: number
    location?: string

    constructor(message?: string, status?: number, cause?: Error, location?: string) {
        if (message === undefined) {
            message = 'An error occurred.'
        }
        super(message)
        this.name = this.constructor.name
        Error.captureStackTrace(this, this.constructor)
        //Note setPrototypeOf restore prototype chain ensures instanceof works.
        Object.setPrototypeOf(this, new.target.prototype)
        this.cause = cause
        this.status = status
        this.location = location
    }
}