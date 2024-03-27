/**
 * This service is responsible for managing the Gitlab sessions.
 * @module BudgetService
 * @author Jimmy Karlsson <jk224jv@student.lnu.se>
 */

import { BudgetRepository } from "../repositories/BudgetRepository.js"
import { Options, Pagination, Result } from "../repositories/RepositoryBase.js"
import { Budget } from "../models/Budget.js"
import { IBudget } from "../models/schemas/BudgetSchema.js"
import { Category } from "../models/Category.js"
import { Expense } from "../models/Expense.js"
import { UserAccess } from "../models/UserAccess.js"
import { UUID } from "../lib/types/UUID.js"
import { ExtendedError } from "../lib/types/ExtendedError.js"
import { checkUserAccess } from "../util/validator.js"
import mongoose from "mongoose"

/**
 * The BudgetService class.
 */
export class BudgetService {
  private repository: BudgetRepository

  /**
   * Creates an instance of the Budgetservice class.
   *
   * @param {BudgetRepository} budgetRepository - The budget repository.
   */
  constructor(
    budgetRepository: BudgetRepository,
  ) {
    this.repository = budgetRepository
  }

  /**
   * Adds a budget to the
   */
  async addBudget(budget: Budget): Promise<Budget> {
    const sanitizedBudget = new Budget(budget.budgetName, budget.budgetDescription, budget.budgetStartDate, budget.budgetIteration, budget.ownerUUID, budget.categories || [], budget.userAccess || [])
    const result = await this.repository.create(sanitizedBudget)
    if (result instanceof Error) {
      throw result
    }
    const id = result.id?.toString()
    if (!id) {
      const errorMessage = 'Failed to create the budget.'
      throw new ExtendedError(errorMessage, 500, new Error(errorMessage), 'BudgetService.addBudget')
    }
    budget.id = id
    return budget
  }

  /**
   * Returns all budgets the user has access to.
   *
   * @param {UUID} userUUID - The requesting user's UUID.
   * @param {Options} pagination - The pagination options. - Optional.
   */
  async getBudgets(userUUID: UUID, pagination?: Pagination): Promise<Budget[]> {

    let options: Options | null = null
    if (pagination) {
      // Convert the pagination to the options object.
      options = {
        limit: pagination.perPage,
        skip: (pagination.page - 1) * pagination.perPage
      } as Options

    }
    // Get the budgets.
    const resultWithRights = await this.repository.getByQuery({ 'userAccess.userUUID': userUUID }) as Result

    const resultAsOwner = await this.repository.getByQuery({ 'ownerUUID': userUUID }) as Result


    const result = {
      data: resultWithRights.data.concat(resultAsOwner.data),
      pagination: {
        totalCount: resultWithRights.data.length + resultAsOwner.data.length,
        totalPages: Math.ceil((resultWithRights.data.length + resultAsOwner.data.length) / 20)
      }
    } as Result

    // It should resoanbly be less than 20 budgets, but we should still check for pagination.
    if (!result || !result.data || result.data.length === 0) {
      return []
    }

    if (options) {
      // Check if the pagination is correct.
      if (result.pagination.totalCount <= options.skip) {
        const errorMessage = 'Invalid pagination.'
        throw new ExtendedError(errorMessage, 400, new Error(errorMessage), 'BudgetService.getBudgets')
      }

      // return the budgets.
      return this.#parseBudgets(result.data)
    }

    if (result.pagination.totalPages > 1) {
      // Get the next page.
      for (let i = 2; i <= result.pagination.totalPages; i++) {
        const nextPage = await this.repository.getByQuery({ 'userAccess.userUUID': userUUID }, null, { limit: 20, skip: 20 * (i - 1) }) as Result
        result.data = result.data.concat(nextPage.data)
      }
    }

    // At this point the length of result.data should be the same as the total number of budgets.
    if (result.data.length !== result.pagination.totalCount) {
      const errorMessage = 'Failed to get all budgets.'
      throw new ExtendedError(errorMessage, 500, new Error(errorMessage), 'BudgetService.getBudgets')
    }

    return this.#parseBudgets(result.data)
  }

  /**
   * Return a budget by its ID.
   *
   * @param {string} budgetId - The budget ID.
   * @param {string} userUUID - The requesting user's UUID.
   */
  async getBudgetById(budgetId: string, userUUID: string): Promise<Budget> {
    const foundBudget = await this.repository.getById(budgetId) as any

    if (!foundBudget) {
      const errorMessage = 'Budget not found.'
      throw new ExtendedError(errorMessage, 404, new Error(errorMessage), 'BudgetService.getBudgetById')
    }

    checkUserAccess(foundBudget, userUUID, 'read')

    return this.#parseBudgets([foundBudget])[0]
  }

  /**
   * Updates a budget.
   *
   * @param {Budget} budget - The budget to update.
   * @param {string} budgetID - The budget ID.
   * @param {string} userUUID - The requesting user's UUID.
   * @throws {ExtendedError} - If the user does not have access to the budget.
   * @throws {ExtendedError} - If the user does not have permission to update the budget.
   * @throws {ExtendedError} - If the budget is not found.
   *
   * @returns {Promise<Budget>} - The updated budget.
   */
  async updateBudget(budget: Budget, budgetID: string, userUUID: string): Promise<Budget> {
    console.log("Updating budget")
    console.log("input budget: ", budget)
    let foundBudgetDocument
    try {
      foundBudgetDocument = await this.repository.getById(budgetID) as any

      if (!foundBudgetDocument) {
        const errorMessage = 'Budget not found.'
        throw new ExtendedError(errorMessage, 404, new Error(errorMessage), 'BudgetService.updateBudget')
      }

      checkUserAccess(foundBudgetDocument, userUUID, 'write')

      // Update the budget.

      foundBudgetDocument.budgetName = budget.budgetName || foundBudgetDocument.budgetName
      foundBudgetDocument.budgetDescription = budget.budgetDescription || foundBudgetDocument.budgetDescription
      foundBudgetDocument.budgetStartDate = budget.budgetStartDate || foundBudgetDocument.budgetStartDate
      foundBudgetDocument.budgetIteration = budget.budgetIteration || foundBudgetDocument.budgetIteration
      // If the new version of the budget has categories, update them.
      // Its a nested array of objects in there so we need to update them one by one.
      if (budget.categories) {
        foundBudgetDocument.categories = []
        for (const category of budget.categories) {
          let expenses = [] as Expense[]
          if (category.expenses.length > 0) {
           for (const expense of category.expenses) {// add to beginning of array to keep the order
            expenses.unshift(new Expense(expense.ownerUUID, expense.date, expense.amount, expense.note) as Expense)
           }
          }
          foundBudgetDocument.categories.push(new Category(category.categoryName, category.categoryLimit, expenses) as Category)
        }
      }
      // If the new version of the budget has user access, update them. If not keep the old
      if (budget.userAccess) {
        foundBudgetDocument.userAccess = budget.userAccess
      }
      // Do not update the ownerUUID, or ID.

      await this.repository.save(foundBudgetDocument)
    } catch (error) {
      if (error instanceof ExtendedError) {
        throw error
      }
      let errorToThrow
      if (error instanceof Error) {
        errorToThrow = error
      } else {
        errorToThrow = new Error('Failed to update the budget.')
      }
      const errorMessage = 'Failed to update the budget.'
      throw new ExtendedError(errorMessage, 400, errorToThrow, 'BudgetService.updateBudget')
    }

    // Return the updated budget.
    return this.#parseBudgets([foundBudgetDocument])[0]
  }

  /**
   * Deletes a budget by its ID.
   */
  async deleteBudget(budgetId: string, userUUID: UUID): Promise<void> {
    const foundBudget = await this.repository.getById(budgetId) as any

    if (!foundBudget) {
      const errorMessage = 'Budget not found.'
      throw new ExtendedError(errorMessage, 404, new Error(errorMessage), 'BudgetService.deleteBudget')
    }

    // The user needs to be the owner to delete the budget.
    if (foundBudget.ownerUUID !== userUUID) {
      const errorMessage = 'User does not have permission to delete the budget.'
      throw new ExtendedError(errorMessage, 403, new Error(errorMessage), 'BudgetService.deleteBudget')
    }

    try {
      await this.repository.deleteById(budgetId)
    } catch (error) {
      if (error instanceof ExtendedError) {
        throw error
      }
      let errorToThrow
      if (error instanceof Error) {
        errorToThrow = error
      } else {
        errorToThrow = new Error('Failed to delete the budget.')
      }
      const errorMessage = 'Failed to delete the budget.'
      throw new ExtendedError(errorMessage, 500, errorToThrow, 'BudgetService.deleteBudget')
    }
  }

  /**
   * Parses the budgets from the database to the Budget model.
   */
  #parseBudgets(budgets: any[]): Budget[] {
    return budgets.map(budget => {
      return new Budget(
        budget.budgetName,
        budget.budgetDescription,
        budget.budgetStartDate,
        budget.budgetIteration,
        budget.ownerUUID,
        this.#parseCategories(budget.categories) || [],
        this.#parseUserAccess(budget.userAccess) || [],
        budget._id.toString(),
      )
    })
  }

  /**
   * Parses the categories from the database to the Category model.
   */
  #parseCategories(categories: any[]): Category[] {
    if (!categories || categories.length === 0) {
      return []
    }
    return categories.map(category => {
      return new Category(
        category.categoryName,
        category.categoryLimit,
        this.#parseExpenses(category.expenses),
      )
    })
  }

  /**
   * Parses the expenses from the database to the Expense model.
   */
  #parseExpenses(expenses: any[]): Expense[] {
    if (!expenses || expenses.length === 0) {
      return []
    }
    return expenses.map(expense => {
      return new Expense(
        expense.ownerUUID,
        expense.date,
        expense.amount,
        expense.note,
      )
    }).reverse()
  }

  /**
   * Parses the user access from the database to the UserAccess model.
   */
  #parseUserAccess(userAccess: any[]): UserAccess[] {
    if (!userAccess || userAccess.length === 0) {
      return []
    }
    return userAccess.map(access => {
      return new UserAccess(
        access.userUUID,
        access.accessLevel,
      )
    })
  }
}