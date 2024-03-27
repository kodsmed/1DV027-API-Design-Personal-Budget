/**
 * Budget DTO.
 */
import { Category } from "./Category.js"
import { UserAccess } from "./UserAccess.js"
import { ExtendedError } from "../lib/types/ExtendedError.js";
import { AccessLevel, BudgetIterations } from "../lib/types/Enums.js";

export class Budget {
  categories: Category[] = []
  ownerUUID: string = ''
  userAccess: UserAccess[] = []
  budgetName: string = ''
  budgetDescription: string = ''
  budgetStartDate: Date = new Date()
  budgetIteration: string = ''
  id: string = ''

  /**
   * Creates an instance of the Budget class.
   *
   * @param { string } budgetName - The name of the budget.
   * @param { string } budgetDescription - The description of the budget.
   * @param { Date } budgetStartDate - The start date of the budget.
   * @param { string } budgetIteration - The iteration of the budget. (weekly, monthly, yearly)
   * @param { string } ownerUUID - The owner's UUID.
   * @param { Category[] } categories - The categories of the budget.
   * @param { UserAccess[] } userAccess - The user access of the budget.
   */

  constructor(
    budgetName: string,
    budgetDescription: string,
    budgetStartDate: Date,
    budgetIteration: string,
    ownerUUID: string,
    categories: Category[],
    userAccess?: UserAccess[] | [],
    id: string = ''
  ) {
    this.#setBudgetName(budgetName)
    this.#setBudgetDescription(budgetDescription)
    this.#setBudgetStartDate(budgetStartDate)
    this.#setBudgetIteration(budgetIteration)
    this.#setOwnerUUID(ownerUUID)
    this.#setCategories(categories)
    this.#setUserAccess(userAccess? userAccess : [])
    this.id = id
  }

  #setBudgetName(budgetName: string) {
    if (budgetName.length === 0) {
      const errorMessage = 'Budget name is required.'
      throw new ExtendedError(errorMessage, 400, new Error(errorMessage), 'Budget constructor')
    }
    if (budgetName.length > 128) {
      const errorMessage = 'The budget name must be of maximum length 128 characters.'
      throw new ExtendedError(errorMessage, 400, new Error(errorMessage), 'Budget constructor')
    }
    this.budgetName = budgetName
  }

  #setBudgetDescription(budgetDescription: string) {
    if (budgetDescription.length === 0) {
      const errorMessage = 'Budget description is required.'
      throw new ExtendedError(errorMessage, 400, new Error(errorMessage), 'Budget constructor')
    }
    if (budgetDescription.length > 256) {
      const errorMessage = 'The budget description must be of maximum length 256 characters.'
      throw new ExtendedError(errorMessage, 400, new Error(errorMessage), 'Budget constructor')
    }
    this.budgetDescription = budgetDescription
  }

  #setBudgetStartDate(budgetStartDate: Date) {
    if (!budgetStartDate) {
      const errorMessage = 'Budget start date is required.'
      throw new ExtendedError(errorMessage, 400, new Error(errorMessage), 'Budget constructor')
    }

    // Check if the date is in the future or today.
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    if (budgetStartDate < today) {
      const errorMessage = 'Budget start date must be today or in the future.'
      throw new ExtendedError(errorMessage, 400, new Error(errorMessage), 'Budget constructor')
    }
    this.budgetStartDate = budgetStartDate
  }

  #setBudgetIteration(budgetIteration: string) {
    if (budgetIteration.length === 0) {
      const errorMessage = 'Budget iteration is required.'
      throw new ExtendedError(errorMessage, 400, new Error(errorMessage), 'Budget constructor')
    }
    if (!Object.values(BudgetIterations).includes(budgetIteration as BudgetIterations)){
      const errorMessage = 'Budget iteration must be '
        + Object.values(BudgetIterations).join(', ') + '.'
        // replace the last comma with 'or '
        .replace(/,([^,]*)$/, ' or ')
      throw new ExtendedError(errorMessage, 400, new Error(errorMessage), 'Budget constructor')
    }

    // Convert the string to the enum.
    this.budgetIteration = budgetIteration
  }

  #setOwnerUUID(ownerUUID: string) {
    if (ownerUUID.length === 0) {
      const errorMessage = 'Owner UUID is required.'
      throw new ExtendedError(errorMessage, 400, new Error(errorMessage), 'Budget constructor')
    }
    if (ownerUUID.length !== 36) {
      const errorMessage = 'Owner UUID must be 36 characters long.'
      throw new ExtendedError(errorMessage, 400, new Error(errorMessage), 'Budget constructor')
    }
    this.ownerUUID = ownerUUID
  }

  #setCategories(categories: Category[]) {
    this.categories = categories
  }

  #setUserAccess(userAccess: UserAccess[])
  {
    if (userAccess.length === 0) {
      userAccess.push(new UserAccess(this.ownerUUID, AccessLevel.Owner))
    }

    // Check if there is only one owner.
    const owners = userAccess.filter(access => access.accessLevel === 'owner')
    if (owners.length > 1) {
      const errorMessage = 'There can only be one owner.'
      throw new ExtendedError(errorMessage, 400, new Error(errorMessage), 'Budget constructor')
    }

    // The owner must be the owner of the budget.

    if (owners[0].userUUID.toString() !== this.ownerUUID) {
      const errorMessage = 'Conflict between owner UUID and user access owner UUID.'
      throw new ExtendedError(errorMessage, 400, new Error(errorMessage), 'Budget constructor')
    }

    // Check that no uuid is duplicated.
    const uuids = userAccess.map(access => access.userUUID)
    const uniqueUuids = new Set(uuids)
    if (uuids.length !== uniqueUuids.size) {
      const errorMessage = 'User UUIDs must be unique.'
      throw new ExtendedError(errorMessage, 400, new Error(errorMessage), 'Budget constructor')
    }

    this.userAccess = userAccess
  }
}