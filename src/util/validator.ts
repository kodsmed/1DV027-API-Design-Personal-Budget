import { IBudget } from '../models/schemas/BudgetSchema.js'
import { UUID } from '../lib/types/UUID.js'
import { Budget } from '../models/Budget.js'
import { ExtendedError } from '../lib/types/ExtendedError.js'

/**
 * A module that provides needed validation functions.
 * @module util/validator
 */
export function isEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

  /**
   * Check if a user has access to a budget.
   *
   * @param {IBudget | Budget} document - The result from the database.
   * @param {UUID} userUUID - The user's UUID.
   * @param {string} accessLevel - The access type to check for.
   * @throws {ExtendedError} - If the user does not have access to the budget.
   * @returns {void}
   */
  export function checkUserAccess(document: IBudget | Budget, userUUID: string, targetAccessLevel: string): void {
    if (document.ownerUUID === userUUID) {
      // Owners have access to everything.
      return
    } else {
    const userAccess = document.userAccess.find((access: any) => access.userUUID === userUUID)
    if (!userAccess) {
      const errorMessage = 'User does not have access to the budget.'
      throw new ExtendedError(errorMessage, 403, new Error(errorMessage), 'BudgetService.getBudgetById')
    }

    // Check if the user has the correct access level.
    if (userAccess.accessLevel == 'owner') {
      // Owners have access to everything.
      return
    }

    // That leaves users with read and write access... we only have to check for write access.
    if (targetAccessLevel === 'write' && userAccess.accessLevel !== 'write') {
      const errorMessage = 'User does not have access to the budget.'
      throw new ExtendedError(errorMessage, 403, new Error(errorMessage), 'BudgetService.getBudgetById')
    }
  }
}