/**
 * BudgetController class, responsible for handling the budget routes.
 */
import express from 'express'
import { BudgetService } from '../services/BudgetService.js'
import { Budget } from '../models/Budget.js'
import { CustomResponse } from '../lib/types/CustomResponse.js'
import { Hateoas, HateoasLink } from '../models/Hateoas.js'
import { getBaseLink } from '../util/hateoas.js'
import { ExtendedError } from '../lib/types/ExtendedError.js'

export class BudgetController {
  private budgetService: BudgetService

  /**
   * Creates an instance of the BudgetController class.
   *
   * @param {BudgetService} budgetService - The budget service.
   */
  constructor(budgetService: BudgetService) {
    this.budgetService = budgetService
  }

  /**
   * Creates a budget.
   */
  async createBudget(req: express.Request, res: express.Response, next: express.NextFunction) {
    try {
      const budget = req.body as Budget
      if (budget.ownerUUID !== req.UUID) {
        throw new ExtendedError('You are not allowed to create a budget for another user', 403)
      }
      const createdBudget = await this.budgetService.addBudget(budget)

      const baseLink = getBaseLink(req)
      const hateoas = new Hateoas([
        new HateoasLink('get budgets', `${baseLink}/budgets`, 'GET'),
        new HateoasLink('view budget', `${baseLink}/budgets/${createdBudget.id}`, 'GET'),
        new HateoasLink('update budget', `${baseLink}/budgets/${createdBudget.id}`, 'PUT'),
        new HateoasLink('delete budget', `${baseLink}/budgets/${createdBudget.id}`, 'DELETE'),
        new HateoasLink('logout', `${baseLink}/users/logout`, 'POST'),
        new HateoasLink('unregister', `${baseLink}/users`, 'DELETE')
      ])
      const customResponse = new CustomResponse(201, 'Created', 'Budget created successfully', budget, hateoas,{})
      res.status(201).json(customResponse)
    }
    catch (error) {
      const baseLink = getBaseLink(req)
      const hateoas = new Hateoas([
        new HateoasLink('get budgets', `${baseLink}/budgets`, 'GET'),
        new HateoasLink('logout', `${baseLink}/users/logout`, 'POST'),
        new HateoasLink('unregister', `${baseLink}/users`, 'DELETE')
      ])

      let code = 500
      let message = 'Unknown Error'
      if (error instanceof ExtendedError) {
        code = error.status || 500
        message = error.message || 'Internal Server Error'
      }

      const customResponse = new CustomResponse(code, 'Error', message, {}, hateoas,{})
      res.status(code).json(customResponse)
    }

  }

  /**
   * Gets all budgets the user has access to.
   */
  async getBudgets(req: express.Request, res: express.Response, next: express.NextFunction) {
    try{
      const userUUID = req.UUID as string
      const page = req.query.page as string | undefined
      const perPage = req.query.perPage as string | undefined

      let pagination
      if (page && perPage) {
        pagination = { page: parseInt(page), perPage: parseInt(perPage) }
      }

      const budgets = await this.budgetService.getBudgets(userUUID, pagination)

      const baseLink = getBaseLink(req)
      let hateoas
      let message = ''
      let resultingPagination = {} as any
      if(budgets.length === 0) {
        hateoas = new Hateoas([
          new HateoasLink('create budget', `${baseLink}/budgets`, 'POST'),
          new HateoasLink('logout', `${baseLink}/users/logout`, 'POST'),
          new HateoasLink('unregister', `${baseLink}/users`, 'DELETE')
        ])
        message = 'No budgets found'
      } else {
        hateoas = new Hateoas([
          new HateoasLink('create budget', `${baseLink}/budgets`, 'POST'),
        ])
        if (budgets.length > 20 || pagination) {
          resultingPagination = { page: pagination?.page || 1, perPage: pagination?.perPage || 20, total: budgets.length, totalPages: Math.ceil(budgets.length / (pagination?.perPage || 20))} as any
          // add pagination links
          hateoas.addLink('first page', `${baseLink}/budgets?page=1&perPage=${pagination?.perPage || 20}`, 'GET')
          hateoas.addLink('last page', `${baseLink}/budgets?page=${resultingPagination.totalPages}&perPage=${pagination?.perPage || 20}`, 'GET')
          if (pagination && pagination.page > 1) {
            hateoas.addLink('prev page', `${baseLink}/budgets?page=${pagination.page - 1}&perPage=${pagination.perPage}`, 'GET')
          }
          if (pagination && pagination.page < resultingPagination.totalPages) {
            hateoas.addLink('next page', `${baseLink}/budgets?page=${pagination.page + 1}&perPage=${pagination.perPage}`, 'GET')
          }
        }
        for (const budget of budgets) {
          hateoas.addLink(`getById`, `${baseLink}/budgets/${budget.id}`, 'GET')
        }
        hateoas.addLink('logout', `${baseLink}/users/logout`, 'POST')
        hateoas.addLink('unregister', `${baseLink}/users`, 'DELETE')
      }


      const customResponse = new CustomResponse(200, 'OK', message, budgets, hateoas, resultingPagination)
      res.status(200).json(customResponse)

    } catch (error) {
      const baseLink = getBaseLink(req)
      const hateoas = new Hateoas([
        new HateoasLink('create budget', `${baseLink}/budgets`, 'POST'),
        new HateoasLink('get budgets', `${baseLink}/budgets`, 'GET'),
        new HateoasLink('logout', `${baseLink}/users/logout`, 'POST'),
        new HateoasLink('unregister', `${baseLink}/users`, 'DELETE')
      ])

      let code = 500
      let message = 'Unknown Error'
      if (error instanceof ExtendedError) {
        code = error.status || 500
        message = error.message || 'Internal Server Error'
      }

      const customResponse = new CustomResponse(code, 'Error', message, {}, hateoas, {})
      res.status(code).json(customResponse)
    }
  }

  /**
   * Gets a budget by its id.
   */
  async getBudgetById(req: express.Request, res: express.Response, next: express.NextFunction) {
    try {
      const userUUID = req.UUID as string
      const budgetId = req.params.budgetid as string


      const budget = await this.budgetService.getBudgetById(budgetId, userUUID)

      const baseLink = getBaseLink(req)
      const hateoas = new Hateoas([
        new HateoasLink('create budget', `${baseLink}/budgets`, 'POST'),
        new HateoasLink('get budgets', `${baseLink}/budgets`, 'GET'),
        new HateoasLink('update', `${baseLink}/budgets/${budgetId}`, 'PUT'),
        new HateoasLink('delete', `${baseLink}/budgets/${budgetId}`, 'DELETE'),
        new HateoasLink('logout', `${baseLink}/users/logout`, 'POST'),
        new HateoasLink('unregister', `${baseLink}/users`, 'DELETE'),
        new HateoasLink('get categories', `${baseLink}/categories`, 'GET'),
        new HateoasLink('create category', `${baseLink}/categories`, 'POST'),
        new HateoasLink('get total budget', `${baseLink}/budgets/${budgetId}/total-funds`, 'GET')
      ])

      const customResponse = new CustomResponse(200, 'OK', 'Budget retrieved successfully', budget, hateoas, {})
      res.status(200).json(customResponse)
    } catch (error) {
      const baseLink = getBaseLink(req)
      const hateoas = new Hateoas([
        new HateoasLink('create budget', `${baseLink}/budgets`, 'POST'),
        new HateoasLink('get budgets', `${baseLink}/budgets`, 'GET'),
        new HateoasLink('logout', `${baseLink}/users/logout`, 'POST'),
        new HateoasLink('unregister', `${baseLink}/users`, 'DELETE'),
        new HateoasLink('get categories', `${baseLink}/categories`, 'GET'),
        new HateoasLink('get category by id', `${baseLink}/categories/:id`, 'GET'),
        new HateoasLink('create category', `${baseLink}/categories`, 'POST'),
      ])

      let code = 500
      let message = 'Unknown Error'
      if (error instanceof ExtendedError) {
        code = error.status || 500
        message = error.message || 'Internal Server Error'
      }

      const customResponse = new CustomResponse(code, 'Error', message, {}, hateoas, {})
      res.status(code).json(customResponse)
    }
  }

  /**
   * Updates a budget by its id with the provided data.
   */
  async updateBudget(req: express.Request, res: express.Response, next: express.NextFunction) {
    try {
      const userUUID = req.UUID as string
      const budgetId = req.params.budgetid as string
      const budget = req.body as Budget

      await this.budgetService.updateBudget(budget, budgetId, userUUID)

      const baseLink = getBaseLink(req)
      const hateoas = new Hateoas([
        new HateoasLink('create budget', `${baseLink}/budgets`, 'POST'),
        new HateoasLink('get budgets', `${baseLink}/budgets`, 'GET'),
        new HateoasLink('getById', `${baseLink}/budgets/${budgetId}`, 'GET'),
        new HateoasLink('delete', `${baseLink}/budgets/${budgetId}`, 'DELETE'),
        new HateoasLink('logout', `${baseLink}/users/logout`, 'POST'),
        new HateoasLink('unregister', `${baseLink}/users`, 'DELETE')
      ])

      const customResponse = new CustomResponse(200, 'OK', 'Budget updated successfully', {}, hateoas, {})
      res.status(200).json(customResponse)
    } catch (error) {
      const baseLink = getBaseLink(req)
      const hateoas = new Hateoas([
        new HateoasLink('create budget', `${baseLink}/budgets`, 'POST'),
        new HateoasLink('get budgets', `${baseLink}/budgets`, 'GET'),
        new HateoasLink('logout', `${baseLink}/users/logout`, 'POST'),
        new HateoasLink('unregister', `${baseLink}/users`, 'DELETE')
      ])

      let code = 500
      let message = 'Unknown Error'
      if (error instanceof ExtendedError) {
        code = error.status || 500
        message = error.message || 'Internal Server Error'
      }

      const customResponse = new CustomResponse(code, 'Error', message, {}, hateoas, {})
      res.status(code).json(customResponse)
    }
  }

  /**
   * Deletes a budget by its id.
   */
  async deleteBudget(req: express.Request, res: express.Response, next: express.NextFunction) {
    try {
      const userUUID = req.UUID as string
      const budgetId = req.params.budgetid as string

      await this.budgetService.deleteBudget(budgetId, userUUID)

      const baseLink = getBaseLink(req)
      const hateoas = new Hateoas([
        new HateoasLink('create budget', `${baseLink}/budgets`, 'POST'),
        new HateoasLink('get budgets', `${baseLink}/budgets`, 'GET'),
        new HateoasLink('logout', `${baseLink}/users/logout`, 'POST'),
        new HateoasLink('unregister', `${baseLink}/users`, 'DELETE')
      ])

      const customResponse = new CustomResponse(200, 'OK', 'Budget deleted successfully', {}, hateoas,{})
      res.status(200).json(customResponse)
    } catch (error) {
      const baseLink = getBaseLink(req)
      const hateoas = new Hateoas([
        new HateoasLink('create budget', `${baseLink}/budgets`, 'POST'),
        new HateoasLink('get budgets', `${baseLink}/budgets`, 'GET'),
        new HateoasLink('logout', `${baseLink}/users/logout`, 'POST'),
        new HateoasLink('unregister', `${baseLink}/users`, 'DELETE')
      ])

      let code = 500
      let message = 'Unknown Error'
      if (error instanceof ExtendedError) {
        code = error.status || 500
        message = error.message || 'Internal Server Error'
      }

      const customResponse = new CustomResponse(code, 'Error', message, {}, hateoas,{})
      res.status(code).json(customResponse)
    }
  }
}