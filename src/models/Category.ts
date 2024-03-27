/**
 * Category DTO.
 */
import { Expense } from "./Expense.js"
import { ExtendedError } from "../lib/types/ExtendedError.js"

export class Category {
  categoryName: string = ''
  categoryLimit: number = 0
  expenses: Expense[] = []

  /**
   * Creates an instance of the Category class.
   *
   * @param {string} categoryName - The name of the category.
   * @param {number} categoryLimit - The spending limit of the category.
   * @param {Expense[]} expenses - The expenses of the category. (optional)
   */

  constructor(
    categoryName: string,
    categoryLimit: number,
    expenses?: Expense[] | []

  ) {
    this.#setCategoryName(categoryName)
    this.#setCategoryLimit(categoryLimit)
    this.#setExpenses(expenses? expenses : [])
  }

  #setCategoryName(categoryName: string) {
    if (categoryName.length === 0 || categoryName === '' || categoryName === null || categoryName === undefined) {
      const errorMessage = 'Category name is required.'
      throw new ExtendedError(errorMessage, 400, new Error(errorMessage), 'Category constructor')
    }
    if (categoryName.length > 128) {
      const errorMessage = 'The category name must be of maximum length 128 characters.'
      throw new ExtendedError(errorMessage, 400, new Error(errorMessage), 'Category constructor')
    }
    this.categoryName = categoryName
  }

  #setCategoryLimit(categoryLimit: number) {
    if (categoryLimit === null || categoryLimit === undefined || typeof categoryLimit !== 'number' || categoryLimit <= 0) {
      const errorMessage = 'Category limit must be greater than 0.'
      throw new ExtendedError(errorMessage, 400, new Error(errorMessage), 'Category constructor')
    }

    // The category limit can in theory be any number, but to prevent abuse, we set a limit.
    if (categoryLimit > 10_000_000) {
      const errorMessage = 'Category limit must be less than 10000000 (ten million).'
      throw new ExtendedError(errorMessage, 400, new Error(errorMessage), 'Category constructor')
    }
    this.categoryLimit = categoryLimit
  }

  #setExpenses(expenses: Expense[] | []) {
    this.expenses = expenses
  }
}