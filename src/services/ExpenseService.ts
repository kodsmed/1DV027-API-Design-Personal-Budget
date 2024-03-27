/**
 * ExpenseService - Handles all the business logic for the expense entity, such as creating, updating, and deleting expenses.
 * @Note Expense is a sub-entity of the Category entity, as such the service works with DTO exported from the CategoryService an not directly with the repository.
 *  */
import { Express } from "express"
import { Budget } from "../models/Budget.js"
import { ICategory } from "../models/schemas/CategorySchema.js"
import { BudgetRepository } from "../repositories/BudgetRepository.js"
import { Category } from "../models/Category.js"
import { Expense } from "../models/Expense.js"
import { Pagination } from "../repositories/RepositoryBase.js"
import { ExtendedError } from "../lib/types/ExtendedError.js"
import { UUID } from "../lib/types/UUID.js"
import { checkUserAccess } from "../util/validator.js"

/**
 * The ExpenseService class.
 */
export class ExpenseService {

  /**
   * Creates an instance of the ExpenseService class.
   *
   * @param {Category} category - The category.
   * @param {UUID} currentUser - The current user's UUID.
   */
  constructor() {
  }

  /**
   * Adds an expense to the category.
   *
   * @param {Expense} expense - The expense to add.
   * @returns {Budget} - The updated budget.
   */
  addExpense(budget: Budget, categoryNumber: number, uuid: string, expense: Expense): Budget {
    checkUserAccess(budget, uuid, 'write')
    // check if the index exists
    if (categoryNumber >= budget.categories.length || categoryNumber < 0) {
      const errorMessage = `Category with index ${categoryNumber} does not exist.`
      throw new ExtendedError(errorMessage, 404, new Error(errorMessage), 'ExpenseService.updateExpense')
    }
    budget.categories[categoryNumber].expenses.push(expense)

    return budget
  }

  /**
   * Updates an expense in the category.
   *
   * @param {Expense} expense - The expense to update.
   * @returns {Category} - The updated category.
   */
  updateExpense(budget: Budget, categoryNumber: number, expenseNumber: number, expense: Expense, userId: string): Budget {
    checkUserAccess(budget, userId, 'write')

    // check if the index exists
    if (categoryNumber >= budget.categories.length || categoryNumber < 0) {
      const errorMessage = `Category with index ${categoryNumber} does not exist.`
      throw new ExtendedError(errorMessage, 404, new Error(errorMessage), 'ExpenseService.updateExpense')
    }

    if (expenseNumber >= budget.categories[categoryNumber].expenses.length || expenseNumber < 0) {
      const errorMessage = `Expense with index ${expenseNumber} does not exist.`
      throw new ExtendedError(errorMessage, 404, new Error(errorMessage), 'ExpenseService.updateExpense')
    }

    const category = budget.categories[categoryNumber] as Category
    category.expenses[expenseNumber] as Expense

    // check if the user owns the expense they are trying to update
    if (category.expenses[expenseNumber].ownerUUID !== userId && budget.ownerUUID !== userId) {
      const errorMessage = 'You do not have access to update the expense.'
      throw new ExtendedError(errorMessage, 403, new Error(errorMessage), 'ExpenseService.updateExpense')
    } else {
      category.expenses[expenseNumber] = expense
    }

    return budget
  }

  /**
   * Deletes an expense from the category.
   *
   * @param {number} expenseNumber  - The index of the expense to delete.
   * @returns {Budget} - The updated budget.
   */
  deleteExpense(budget: Budget, categoryNumber: number, expenseNumber: number, userId: string): Budget {
    checkUserAccess(budget, userId, 'write')

    if (expenseNumber < 0 || expenseNumber >= budget.categories[categoryNumber].expenses.length) {
      const errorMessage = `The expense you are trying to delete does not exists.`
      throw new ExtendedError(errorMessage, 404, new Error(errorMessage), 'ExpenseService.deleteExpense')
    }
    budget.categories[categoryNumber].expenses.splice(expenseNumber, 1)
    return budget
  }

  /**
   * Returns all expenses of the category.
   *
   * @param {Budget} budget - The budget.
   * @param {number} categoryNumber - The category number.
   * @param {string} userId - The user's UUID.
   * @param {Pagination} pagination - The pagination options. - Optional.
   * @returns {Expense[]} - The expenses of the category.
   */
  getExpenses(budget: Budget, categoryNumber: number, userId: string, pagination?: Pagination,): Expense[] {
    // No need to check for access, we have retrieved the category from the repository, so we know the user has read access.

    if (categoryNumber >= budget.categories.length || categoryNumber < 0) {
      const errorMessage = `Category with index ${categoryNumber} does not exist.`
      throw new ExtendedError(errorMessage, 404, new Error(errorMessage), 'ExpenseService.getExpenses')
    }

    if (pagination) {
      const { page, perPage } = pagination
      const start = (page - 1) * perPage
      const end = start + perPage
      return budget.categories[categoryNumber].expenses.slice(start, end)
    }
    const allExpenses = budget.categories[categoryNumber].expenses

    return allExpenses
  }


  /**
   * Returns the total amount of expenses in the category.
   *
   * @param {Budget} budget - The budget.
   * @param {number} categoryNumber - The category number.
   *
   * @returns {number} - The total amount of expenses.
   */
  getTotalAmount(budget: Budget, categoryNumber: number): number {
    // No need to check for access, we have retrieved the category from the repository, so we know the user has read access.
    if (categoryNumber >= budget.categories.length || categoryNumber < 0) {
      const errorMessage = `Category with index ${categoryNumber} does not exist.`
      throw new ExtendedError(errorMessage, 404, new Error(errorMessage), 'ExpenseService.getTotalAmount')
    }
    const expenses = budget.categories[categoryNumber].expenses
    let totalAmount = 0
    for (const expense of expenses) {
      totalAmount += expense.amount
    }
    return totalAmount
  }

  /**
   * Returns the total number of expenses in the category.
   *
   * @param {Budget} budget - The budget.
   * @param {number} categoryNumber - The category number.
   * @returns {number} - The total number of expenses.
   */
  getTotalCount(budget: Budget, categoryNumber: number): number {
    // No need to check for access, we have retrieved the category from the repository, so we know the user has read access.
    if (categoryNumber >= budget.categories.length || categoryNumber < 0) {
      const errorMessage = `Category with index ${categoryNumber} does not exist.`
      throw new ExtendedError(errorMessage, 404, new Error(errorMessage), 'ExpenseService.getTotalCount')
    }
    return budget.categories[categoryNumber].expenses.length
  }


  /**
   * Returns an expense by its ID... that is Index in the array.
   *
   * @param {Budget} budget - The budget.
   * @param {number} categoryNumber - The category number.
   * @param {number} expenseIndex - The expense Index.
   */
  getExpenseByIndex(budget: Budget, categoryNumber: number, expenseIndex: number): Expense {
    // No need to check for access, we have retrieved the category from the repository, so we know the user has read access.
    if (categoryNumber >= budget.categories.length || categoryNumber < 0) {
      const errorMessage = `Category with index ${categoryNumber} does not exist.`
      throw new ExtendedError(errorMessage, 404, new Error(errorMessage), 'ExpenseService.getExpenseByIndex')
    }
    return budget.categories[categoryNumber].expenses[expenseIndex]
  }

}