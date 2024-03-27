/**
 * CategoryService - Handles all the business logic for the category entity, such as creating, updating, and deleting categories.
 * @Note Category is a sub-entity of the Budget entity, as such the service works with DTO exported from the BudgetService an not directly with the repository.
 *
 * @module CategoryService
 */

import { BudgetRepository } from "../repositories/BudgetRepository.js"
import { Budget } from "../models/Budget.js"
import { Category } from "../models/Category.js"
import { ExtendedError } from "../lib/types/ExtendedError.js"
import { Pagination } from "../repositories/RepositoryBase.js"
import { checkUserAccess } from "../util/validator.js"
import { IBudget } from "../models/schemas/BudgetSchema.js"


/**
 * The CategoryService class.
 */
export class CategoryService {
  private budget: Budget | null = null
  private currentUser: string | null = null

  /**
   * Creates an instance of the CategoryService class.
   *
   * @param {Budget} budget - The budget.
   */
  constructor() {
  }

  /**
   * Set the budget.
   * @param {Budget} budget - The budget.
   * @returns {void}
   */
  setBudget(budget: Budget) {
    this.budget = budget
  }

  /**
   * Set the current user.
   * @param {string} currentUser - The current users uuid.
   * @returns {void}
   */
  setCurrentUser(currentUser: string) {
    this.currentUser = currentUser
  }

  /**
   * Get the budget.
   * @returns {Budget} - The budget.
   */
  getBudget(): Budget {
    if (!this.budget) {
      const errorMessage = 'Budget must be set before getting it.'
      throw new ExtendedError(errorMessage, 500, new Error(errorMessage), 'CategoryService.getBudget')
    }
    return this.budget
  }

  /**
   * Adds a category to the budget.
   *
   * @param {Category} category - The category to add.
   * @returns {Budget} - The updated budget.
   * @throws {ExtendedError} - If the category already exists.
   */
  async addCategory(category: Category): Promise<Budget>{
    if(!this.budget || !this.currentUser) {
      const errorMessage = 'Budget and User must be set before adding a category.'
      throw new ExtendedError(errorMessage, 500, new Error(errorMessage), 'CategoryService.addCategory')
    }


    checkUserAccess(this.budget, this.currentUser, 'write')

    // We know its a valid Category, since its a Category DTO, so no need to check name or limit, only if it exists.
    if (this.budget.categories.find((c) => c.categoryName === category.categoryName)) {
      const errorMessage = `The category ${category.categoryName} already exists.`
      throw new ExtendedError(errorMessage, 409, new Error(errorMessage), 'CategoryService.addCategory')
    }
    this.budget.categories.push(category)

    return this.budget
  }

  /**
   * Updates a category in the budget.
   *
   * @param {number} categoryId - The ID of the category to update.
   * @param {Category} category - The category to update.
   * @returns {Budget} - The updated budget.
   */
  overWriteCategory(categoryId: number, category: Category): Budget {
    if (!this.budget || !this.currentUser) {
      const errorMessage = 'Budget and User must be set before updating a category.'
      throw new ExtendedError(errorMessage, 500, new Error(errorMessage), 'CategoryService.updateCategory')
    }

    checkUserAccess(this.budget, this.currentUser, 'write')

    this.budget.categories[categoryId] = category
    return this.budget
  }

  /**
   * Deletes a category from the budget.
   *
   * @param {number} categoryId - The name of the category to delete.
   * @returns {Budget} - The updated budget.
   */
  deleteCategory(categoryId: number): Budget {
    if (!this.budget || !this.currentUser) {
      const errorMessage = 'Budget and User must be set before deleting a category.'
      throw new ExtendedError(errorMessage, 500, new Error(errorMessage), 'CategoryService.deleteCategory')
    }

    checkUserAccess(this.budget, this.currentUser, 'write')
    // Check if the category exists.
    if (categoryId < 0 || categoryId >= this.budget.categories.length) {
      const errorMessage = 'Category not found.'
      throw new ExtendedError(errorMessage, 404, new Error(errorMessage), 'CategoryService.deleteCategory')
    }
    this.budget.categories.splice(categoryId, 1)
    return this.budget
  }

  /**
   * Returns all categories of the budget.
   *
   * @param {Pagination} pagination - The pagination options. - Optional.
   * @throws {ExtendedError} - If the categories are not found.
   * @returns {Category[]} - The categories of the budget.
   */
  getCategories(pagination?: Pagination): Category[] {
    if (!this.budget || !this.currentUser) {
      const errorMessage = 'Budget must be set before getting categories.'
      throw new ExtendedError(errorMessage, 500, new Error(errorMessage), 'CategoryService.getCategories')
    }
    // No need to check for access, we have retrieved the budget from the repository, so we know the user has read access.

    if (!this.budget.categories || this.budget.categories.length === 0) {
      const errorMessage = 'Categories not found.'
      throw new ExtendedError(errorMessage, 404, new Error(errorMessage), 'CategoryService.getCategories')
    }

    if (pagination) {
      const start = pagination.page * pagination.perPage
      const end = start + pagination.perPage
      return this.budget.categories.slice(start, end)
    }

    return this.budget.categories
  }


  /**
   * Return a category by its ID... that is Index in the array.
   *
   * @param {number} categoryIndex - The category Index.
   */
  getCategoryByIndex(categoryIndex: number): Category {
    if (!this.budget || !this.currentUser) {
      const errorMessage = 'Budget must be set before getting a category.'
      throw new ExtendedError(errorMessage, 500, new Error(errorMessage), 'CategoryService.getCategoryByIndex')
    }
    // No need to check for access, we have retrieved the budget from the repository, so we know the user has read access.
    if (categoryIndex < 0 || categoryIndex >= this.budget.categories.length) {
      const errorMessage = 'Category not found.'
      throw new ExtendedError(errorMessage, 404, new Error(errorMessage), 'CategoryService.getCategoryByIndex')
    }
    return this.budget.categories[categoryIndex]
  }

}