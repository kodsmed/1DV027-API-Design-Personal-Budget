/**
 * Category Coltroller - This file contains the logic for the category endpoints.
 */

import Express from 'express'
import { CategoryService } from '../services/CategoryService.js'
import { Budget } from '../models/Budget.js'
import { Category } from '../models/Category.js'
import { BudgetService } from '../services/BudgetService.js'
import { ExtendedError } from '../lib/types/ExtendedError.js'
import { CustomResponse } from '../lib/types/CustomResponse.js'
import { Hateoas } from '../models/Hateoas.js'
import { getBaseLink } from '../util/hateoas.js'
import { StringExpressionOperator } from 'mongoose'

/**
 * The CategoryController class.
 */
export class CategoryController {
  private categoryService: CategoryService
  private budgetService: BudgetService

  /**
   * Creates an instance of the CategoryController class.
   *
   * @param {CategoryService} categoryService - The category service.
   */
  constructor(categoryService: CategoryService, budgetService: BudgetService) {
    this.categoryService = categoryService
    this.budgetService = budgetService
  }

  /**
   * Adds a category to the budget.
   *
   * @see /swagger-docs/categories-post.yaml
   */
  async addCategory(req: Express.Request, res: Express.Response, next: Express.NextFunction) {
    try {
      const budgetId = req.params.budgetid as string
      const userUUID = req.UUID as string
      const category = {categoryName: req.body.categoryName, categoryLimit: req.body.categoryLimit, expenses: req.body.expenses || []} as Category

      const found = await this.budgetService.getBudgetById(budgetId, userUUID)
      this.categoryService.setBudget(found)
      this.categoryService.setCurrentUser(userUUID)
      await this.categoryService.addCategory(category)
      const changedBudget = this.categoryService.getBudget()
      await this.saveBudget(req, res, changedBudget)

      const hateoas = new Hateoas([])
      const baseLink = getBaseLink(req)
      hateoas.addLink('get all categories', `${baseLink}/budgets/${req.params.budgetid}/categories`, 'GET')
      hateoas.addLink('add category', `${baseLink}/budgets/${req.params.budgetid}/categories`, 'POST')
      hateoas.addLink('back to budget', `${baseLink}/budgets/${req.params.budgetid}`, 'GET')
      hateoas.addLink('logout', `${baseLink}/users/logout`, 'POST')
      hateoas.addLink('unregister', `${baseLink}/users`, 'DELETE')
      const customResponse = new CustomResponse(201, 'Created', 'Category added to budget', changedBudget, hateoas,{})
      res.status(201).json(customResponse)
    } catch (error) {
      let code = 500
      let message = 'Internal server error'
      if (error instanceof ExtendedError) {
        code = error.status || 500
        message = error.message || 'Internal server error'
      }
      const hateoas = new Hateoas([])
      const baseLink = getBaseLink(req)
      hateoas.addLink('get all categories', `${baseLink}/budgets/${req.params.budgetid}/categories`, 'GET')
      hateoas.addLink('add category', `${baseLink}/budgets/${req.params.budgetid}/categories`, 'POST')
      hateoas.addLink('back to budget', `${baseLink}/budgets/${req.params.budgetid}`, 'GET')
      hateoas.addLink('logout', `${baseLink}/users/logout`, 'POST')
      hateoas.addLink('unregister', `${baseLink}/users`, 'DELETE')
      const customResponse = new CustomResponse(code, 'Error', message, {}, hateoas,{})
      res.status(code).json(customResponse)
    }
  }

  /**
   * Get all categories for a budget.
   *
   * @see /swagger-docs/categories-get.yaml
   */
  async getCategories(req: Express.Request, res: Express.Response, next: Express.NextFunction) {
    try {
      const budgetId = req.params.budgetid as string || ''
      const userId = req.UUID as string || ''

      const found = await this.budgetService.getBudgetById(budgetId, userId)
      const categories = found.categories

      const hateoas = new Hateoas([])
      const baseLink = getBaseLink(req)
      hateoas.addLink('add category', `${baseLink}/budgets/${req.params.budgetid}/categories`, 'POST')
      hateoas.addLink('get all categories', `${baseLink}/budgets/${req.params.budgetid}/categories`, 'GET')

      // handles pagination
      let paginatedCategories = categories
      let resultingPagination = {}
      if((req.query.page && req.query.perPage) || categories.length > 10) {
        const page = parseInt(req.query.page as string || '1')
        const perPage = Math.min(parseInt(req.query.perPage as string || '10'), 10) // limit to 10 per page
        const totalPages = Math.ceil(categories.length / perPage)
        const start = (page - 1) * perPage
        const end = start + perPage
        paginatedCategories = categories.slice(start, end)
        resultingPagination = {
          page: page,
          perPage: perPage,
          totalPages: totalPages,
          total: categories.length
        }
        hateoas.addLink('first page', `${baseLink}/budgets/${req.params.budgetid}/categories?page=1&perPage=${perPage}`, 'GET')
        hateoas.addLink('last page', `${baseLink}/budgets/${req.params.budgetid}/categories?page=${totalPages}&perPage=${perPage}`, 'GET')
        if(page > 1) {
          hateoas.addLink('prev page', `${baseLink}/budgets/${req.params.budgetid}/categories?page=${page - 1}&perPage=${perPage}`, 'GET')
        }
        if(page < totalPages) {
          hateoas.addLink('next page', `${baseLink}/budgets/${req.params.budgetid}/categories?page=${page + 1}&perPage=${perPage}`, 'GET')
        }
      }

      for (let i = 0; i < paginatedCategories.length; i++) {
        hateoas.addLink(`view category ${i}: ${paginatedCategories[i].categoryName}`, `${baseLink}/budgets/${req.params.budgetid}/categories/${i}`, 'GET')
        hateoas.addLink(`update category ${i}: ${paginatedCategories[i].categoryName}`, `${baseLink}/budgets/${req.params.budgetid}/categories/${i}`, 'PUT')
        hateoas.addLink(`delete category ${i}: ${paginatedCategories[i].categoryName}`, `${baseLink}/budgets/${req.params.budgetid}/categories/${i}`, 'DELETE')
      }

      hateoas.addLink('back to the budget', `${baseLink}/budgets/${req.params.budgetid}`, 'GET')
      hateoas.addLink('logout', `${baseLink}/users/logout`, 'POST')
      hateoas.addLink('unregister', `${baseLink}/users`, 'DELETE')
      const customResponse = new CustomResponse(200, 'OK', 'Categories retrieved', paginatedCategories, hateoas, resultingPagination)
      res.status(200).json(customResponse)
    } catch (error) {
      let code = 500
      let message = 'Internal server error'
      if (error instanceof ExtendedError) {
        code = error.status || 500
        message = error.message || 'Internal server error'
      }
      const hateoas = new Hateoas([])
      const baseLink = getBaseLink(req)
      hateoas.addLink('add category', `${baseLink}/budgets/${req.params.budgetid}/categories`, 'POST')
      hateoas.addLink('get all categories', `${baseLink}/budgets/${req.params.budgetid}/categories`, 'GET')
      hateoas.addLink('back to the budget', `${baseLink}/budgets/${req.params.budgetid}`, 'GET')
      hateoas.addLink('logout', `${baseLink}/users/logout`, 'POST')
      hateoas.addLink('unregister', `${baseLink}/users`, 'DELETE')
      const customResponse = new CustomResponse(code, 'Error', message, {}, hateoas, {})
      res.status(code).json(customResponse)
    }
  }

  /**
   * Get a category by id.
   *
   * @see /swagger-docs/categoryId-get.yaml
   */
  async getCategoryById(req: Express.Request, res: Express.Response, next: Express.NextFunction) {
    try {
      const budgetId = req.params.budgetid as string || ''
      const categoryId = parseInt(req.params.categoryid as string || '-1')
      const userId = req.UUID as string || ''

      const found = await this.budgetService.getBudgetById(budgetId, userId)
      if (categoryId > found.categories.length - 1 || categoryId < 0) {
        throw new ExtendedError('Category not found', 404)
      }
      const category = found.categories[categoryId] || {}
      const hateoas = new Hateoas([])
      const baseLink = getBaseLink(req)
      hateoas.addLink('add category', `${baseLink}/budgets/${req.params.budgetid}/categories`, 'POST')
      hateoas.addLink('get all categories', `${baseLink}/budgets/${req.params.budgetid}/categories`, 'GET')
      hateoas.addLink('back to the budget', `${baseLink}/budgets/${req.params.budgetid}`, 'GET')
      hateoas.addLink('logout', `${baseLink}/users/logout`, 'POST')
      const customResponse = new CustomResponse(200, 'OK', 'Category retrieved', category, hateoas, {})
      res.status(200).json(customResponse)
    } catch (error) {
      let code = 500
      let message = 'Internal server error'
      if (error instanceof ExtendedError) {
        code = error.status || 500
        message = error.message || 'Internal server error'
      }
      const hateoas = new Hateoas([])
      const baseLink = getBaseLink(req)
      hateoas.addLink('add category', `${baseLink}/budgets/${req.params.budgetid}/categories`, 'POST')
      hateoas.addLink('get all categories', `${baseLink}/budgets/${req.params.budgetid}/categories`, 'GET')
      hateoas.addLink('back to the budget', `${baseLink}/budgets/${req.params.budgetid}`, 'GET')
      hateoas.addLink('logout', `${baseLink}/users/logout`, 'POST')
      const customResponse = new CustomResponse(code, 'Error', message, {}, hateoas, {})
      res.status(code).json(customResponse)
    }
  }

  /**
   * Update a category.
   *
   * @see /swagger-docs/categoryId-put.yaml
   */
  async updateCategory(req: Express.Request, res: Express.Response, next: Express.NextFunction) {
    try {
      const budgetId = req.params.budgetid as string || ''
      const categoryId = parseInt(req.params.categoryid as string || '-1')
      const userId = req.UUID as string || ''
      const category = new Category(req.body.categoryName, req.body.categoryLimit, req.body.expenses || [])

      const found = await this.budgetService.getBudgetById(budgetId, userId)
      this.categoryService.setBudget(found)
      this.categoryService.setCurrentUser(userId)
      this.categoryService.overWriteCategory(categoryId, category)
      const changedBudget = this.categoryService.getBudget()
      await this.saveBudget(req, res, changedBudget)

      const hateoas = new Hateoas([])
      const baseLink = getBaseLink(req)
      hateoas.addLink('add category', `${baseLink}/budgets/${req.params.budgetid}/categories`, 'POST')
      hateoas.addLink('get all categories', `${baseLink}/budgets/${req.params.budgetid}/categories`, 'GET')
      hateoas.addLink('back to the budget', `${baseLink}/budgets/${req.params.budgetid}`, 'GET')
      hateoas.addLink('logout', `${baseLink}/users/logout`, 'POST')
      const customResponse = new CustomResponse(200, 'OK', 'Category updated', changedBudget, hateoas, {})
      res.status(200).json(customResponse)
    } catch (error) {
      let code = 500
      let message = 'Internal server error'
      if (error instanceof ExtendedError) {
        code = error.status || 500
        message = error.message || 'Internal server error'
      }
      const hateoas = new Hateoas([])
      const baseLink = getBaseLink(req)
      hateoas.addLink('add category', `${baseLink}/budgets/${req.params.budgetid}/categories`, 'POST')
      hateoas.addLink('get all categories', `${baseLink}/budgets/${req.params.budgetid}/categories`, 'GET')
      hateoas.addLink('back to the budget', `${baseLink}/budgets/${req.params.budgetid}`, 'GET')
      hateoas.addLink('logout', `${baseLink}/users/logout`, 'POST')
      const customResponse = new CustomResponse(code, 'Error', message, {}, hateoas, {})
      res.status(code).json(customResponse)
    }
  }

  /**
   * Delete a category.
   */
  async deleteCategory(req: Express.Request, res: Express.Response, next: Express.NextFunction) {
    try {
      const budgetId = req.params.budgetid as string || ''
      const categoryId = parseInt(req.params.categoryid as string || '-1')
      const userId = req.UUID as string || ''

      const found = await this.budgetService.getBudgetById(budgetId, userId)
      this.categoryService.setBudget(found)
      this.categoryService.setCurrentUser(userId)
      this.categoryService.deleteCategory(categoryId)
      const changedBudget = this.categoryService.getBudget()
      await this.saveBudget(req, res, changedBudget)

      const hateoas = new Hateoas([])
      const baseLink = getBaseLink(req)
      hateoas.addLink('add category', `${baseLink}/budgets/${req.params.budgetid}/categories`, 'POST')
      hateoas.addLink('get all categories', `${baseLink}/budgets/${req.params.budgetid}/categories`, 'GET')
      hateoas.addLink('back to the budget', `${baseLink}/budgets/${req.params.budgetid}`, 'GET')
      hateoas.addLink('logout', `${baseLink}/users/logout`, 'POST')
      const customResponse = new CustomResponse(200, 'OK', 'Category deleted', changedBudget, hateoas, {})
      res.status(200).json(customResponse)

    } catch (error) {
      let code = 500
      let message = 'Internal server error'
      if (error instanceof ExtendedError) {
        code = error.status || 500
        message = error.message || 'Internal server error'
      }
      const hateoas = new Hateoas([])
      const baseLink = getBaseLink(req)
      hateoas.addLink('add category', `${baseLink}/budgets/${req.params.budgetid}/categories`, 'POST')
      hateoas.addLink('get all categories', `${baseLink}/budgets/${req.params.budgetid}/categories`, 'GET')
      hateoas.addLink('back to the budget', `${baseLink}/budgets/${req.params.budgetid}`, 'GET')
      hateoas.addLink('logout', `${baseLink}/users/logout`, 'POST')
      const customResponse = new CustomResponse(code, 'Error', message, {}, hateoas, {})
      res.status(code).json(customResponse)
    }
  }

  /**
   * Save changes to the budget.
   */
  private async saveBudget(req: Express.Request, res: Express.Response, budget: Budget) {
    await this.budgetService.updateBudget(budget, budget.id, req.UUID as string)
  }

}