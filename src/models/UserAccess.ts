/**
 * UserAccess DTO
 */
import { UUID } from '../lib/types/UUID.js'
import { ExtendedError } from '../lib/types/ExtendedError.js'
import { AccessLevel } from '../lib/types/Enums.js'

export class UserAccess {
  userUUID: UUID = ''
  accessLevel: string = ''

  /**
   * Creates an instance of the UserAccess class.
   *
   * @param {string} userUUID - The user's UUID.
   * @param {string} accessLevel - The user's access level.
   */
  constructor(
    userUUID: string,
    accessLevel: string
  ) {
    this.#setUserUUID(userUUID)
    this.#setAccessLevel(accessLevel)
  }

  #setUserUUID(userUUID: string) {
    this.userUUID = new UUID(userUUID)
  }

  #setAccessLevel(accessLevel: string) {
    if (accessLevel.length === 0) {
      const errorMessage = 'Access level is required.'
      throw new ExtendedError(errorMessage, 400, new Error(errorMessage), 'UserAccess constructor')
    }
    // The access level must be one of the enum values.
    if (!Object.values(AccessLevel).includes(accessLevel as AccessLevel)) {
      const errorMessage = `Access level must be one of the following: ${Object.values(AccessLevel).join(', ')}.`
      // replace the last comma with ' or '
      errorMessage.replace(/,([^,]*)$/, ' or ')
      throw new ExtendedError(errorMessage, 400, new Error(errorMessage), 'UserAccess constructor')
    }
    this.accessLevel = accessLevel
  }
}