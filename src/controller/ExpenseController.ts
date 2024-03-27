/**
 * ExpenseController
 */
import Express from 'express'
import { Budget } from '../models/Budget.js'
import { ExpenseService } from '../services/ExpenseService.js'
import { BudgetService } from '../services/BudgetService.js'
import { Expense } from '../models/Expense.js'
import { CustomResponse } from '../lib/types/CustomResponse.js'
import { Hateoas, HateoasLink } from '../models/Hateoas.js'
import { getBaseLink } from '../util/hateoas.js'
import { ExtendedError } from '../lib/types/ExtendedError.js'
import { Pagination } from '../repositories/RepositoryBase.js'
import { WebhookController } from './WebhookController.js'

export class ExpenseController {
  private expenseService: ExpenseService;
  private budgetService: BudgetService;
  private webhookController: WebhookController;

  constructor(expenseService: ExpenseService, budgetservice: BudgetService, webhookController: WebhookController) {
    this.expenseService = expenseService,
      this.budgetService = budgetservice,
      this.webhookController = webhookController
  }

  /**
   * Create a new expense.
   * @param req - The request object.
   * @param res - The response object.
   */
  async addExpense(req: Express.Request, res: Express.Response, next: Express.NextFunction) {
    try {
      const userId = req.UUID || ''
      const budgetId = req.params.budgetid || '-1'
      const categoryId = parseInt(req.params.categoryid || '-1')

      const budget = await this.budgetService.getBudgetById(budgetId, userId)
      if (!budget) {
        throw new ExtendedError('Budget not found', 404, new Error('Budget not found'), 'ExpenseController.addExpense')
      }

      let timestamp
      if (req.body.date) {
        timestamp = new Date(req.body.date)
      } else {
        timestamp = new Date()
      }
      const expense = new Expense(userId, timestamp, parseInt(req.body.amount), req.body.note || null)
      const updatedBudget = this.expenseService.addExpense(budget, categoryId, userId, expense)
      const message = 'Expense added successfully'
      const statusCode = 201
      const status = 'Created'
      await this.saveBudget(req, res, updatedBudget)
      const baseLink = getBaseLink(req)
      const newExpenseId = updatedBudget.categories[categoryId].expenses.length - 1
      const hateoas = new Hateoas([
        new HateoasLink('update', `${baseLink}/budget/${budgetId}/category/${categoryId}/expenses/${newExpenseId}`, 'PUT'),
        new HateoasLink('delete', `${baseLink}/budget/${budgetId}/category/${categoryId}/expenses/${newExpenseId}`, 'DELETE'),
        new HateoasLink('all expenses', `${baseLink}/budget/${budgetId}/category/${categoryId}/expenses`, 'GET'),
      ])
      const responseObject = new CustomResponse(statusCode, status, message, updatedBudget, hateoas, {})
      res.status(201).json(responseObject)
      this.webhookController.triggerWebhook(req, expense, budgetId, categoryId)
    } catch (error) {
      let code = 500
      let message = 'Internal server error'
      if (error instanceof ExtendedError) {
        code = error.status || 500
        message = error.message || 'Internal server error'
      }
      res.status(code).json(new CustomResponse(code, 'Error', message, {}, new Hateoas([]), {}))
    }
  }

  /**
   * Update an existing expense.
   * @param req - The request object.
   * @param res - The response object.
   */
  async updateExpense(req: Express.Request, res: Express.Response, next: Express.NextFunction) {
    try {
      const userId = req.UUID || ''
      const budgetId = req.params.budgetid || '-1'
      const categoryId = parseInt(req.params.categoryid || '-1')
      const expenseId = parseInt(req.params.expenseid || '-1')

      const budget = await this.budgetService.getBudgetById(budgetId, userId)
      if (!budget) {
        throw new ExtendedError('Budget not found', 404, new Error('Budget not found'), 'ExpenseController.updateExpense')
      }

      if (categoryId < 0 || categoryId >= budget.categories.length) {
        throw new ExtendedError('Category not found', 404, new Error('Category not found'), 'ExpenseController.updateExpense')
      }

      if (expenseId < 0 || expenseId >= budget.categories[categoryId].expenses.length) {
        console.log('Expense not found', expenseId, " ", budget.categories[categoryId].expenses.length)
        throw new ExtendedError('Expense not found', 404, new Error('Expense not found'), 'ExpenseController.updateExpense')
      }
      let timestamp
      if (req.body.date) {
        timestamp = new Date(req.body.date)
      } else {
        timestamp = new Date()
      }
      const expense = new Expense(userId, timestamp, parseInt(req.body.amount), req.body.note || null)
      const updatedBudget = this.expenseService.updateExpense(budget, categoryId, expenseId, expense, userId)
      const message = 'Expense updated successfully'
      const statusCode = 200
      const status = 'OK'
      await this.saveBudget(req, res, updatedBudget)
      const baseLink = getBaseLink(req)
      const hateoas = new Hateoas([
        new HateoasLink('update', `${baseLink}/budgets/${budgetId}/categories/${categoryId}/expenses/${expenseId}`, 'PUT'),
        new HateoasLink('delete', `${baseLink}/budgets/${budgetId}/categories/${categoryId}/expenses/${expenseId}`, 'DELETE'),
        new HateoasLink('all expenses', `${baseLink}/budgets/${budgetId}/categories/${categoryId}/expenses`, 'GET'),
      ])
      const responseObject = new CustomResponse(statusCode, status, message, updatedBudget, hateoas, {})
      res.status(200).json(responseObject)
    } catch (error) {
      let code = 500
      let message = 'Internal server error'
      if (error instanceof ExtendedError) {
        code = error.status || 500
        message = error.message || 'Internal server error'
      }
      res.status(code).json(new CustomResponse(code, 'Error', message, {}, new Hateoas([]), {}))
    }
  }

  /**
   * Delete an existing expense.
   * @param req - The request object.
   * @param res - The response object.
   */
  async deleteExpense(req: Express.Request, res: Express.Response, next: Express.NextFunction) {
    try {
      const userId = req.UUID || ''
      const budgetId = req.params.budgetid || '-1'
      const categoryId = parseInt(req.params.categoryid || '-1')
      const expenseId = parseInt(req.params.expenseid || '-1')

      const budget = await this.budgetService.getBudgetById(budgetId, userId)
      if (!budget) {
        throw new ExtendedError('Budget not found', 404, new Error('Budget not found'), 'ExpenseController.deleteExpense')
      }

      if (categoryId < 0 || categoryId >= budget.categories.length) {
        throw new ExtendedError('Category not found', 404, new Error('Category not found'), 'ExpenseController.deleteExpense')
      }

      if (expenseId < 0 || expenseId >= budget.categories[categoryId].expenses.length) {
        throw new ExtendedError('Expense not found', 404, new Error('Expense not found'), 'ExpenseController.deleteExpense')
      }

      const updatedBudget = this.expenseService.deleteExpense(budget, categoryId, expenseId, userId)
      const message = 'Expense deleted successfully'
      const statusCode = 200
      const status = 'OK'
      this.saveBudget(req, res, updatedBudget)
      const baseLink = getBaseLink(req)
      const hateoas = new Hateoas([
        new HateoasLink('all expenses', `${baseLink}/budgets/${budgetId}/categories/${categoryId}/expenses`, 'GET'),
      ])
      const responseObject = new CustomResponse(statusCode, status, message, updatedBudget, hateoas, {})
      res.status(200).json(responseObject)
    } catch (error) {
      let code = 500
      let message = 'Internal server error'
      if (error instanceof ExtendedError) {
        code = error.status || 500
        message = error.message || 'Internal server error'
      }
      res.status(code).json(new CustomResponse(code, 'Error', message, {}, new Hateoas([]), {}))
    }
  }

  /**
   * Get all expenses for a category.
   * @param req - The request object.
   * @param res - The response object.
   */
  async getAllExpenses(req: Express.Request, res: Express.Response, next: Express.NextFunction) {
    try {
      const userId = req.UUID || ''
      const budgetId = req.params.budgetid || '-1'
      const categoryId = parseInt(req.params.categoryid || '-1')

      const budget = await this.budgetService.getBudgetById(budgetId, userId)
      if (!budget) {
        throw new ExtendedError('Budget not found', 404, new Error('Budget not found'), 'ExpenseController.getAllExpenses')
      }


      let pagination = null as Pagination | null
      if (req.query.page && req.query.perPage) {
        const page = parseInt(req.query.page as string)
        const perPage = parseInt(req.query.perPage as string)
        pagination = { page: page, perPage: perPage } as Pagination
      }

      let expenses = [] as Expense[]
      let resultingPagination = {}
      if (!pagination) {
        expenses = this.expenseService.getExpenses(budget, categoryId, userId)
      } else {
        expenses = this.expenseService.getExpenses(budget, categoryId, userId, pagination)
      }
      const baseLink = getBaseLink(req)
      const hateoas = new Hateoas([
        new HateoasLink('add', `${baseLink}/budgets/${budgetId}/categories/${categoryId}/expenses`, 'POST'),
      ])
      let message = 'Expenses retrieved successfully'
      if (expenses.length > 100 || pagination) {
        const page = pagination ? pagination.page : 1
        const perPage = pagination ? pagination.perPage : 100
        const start = (page - 1) * perPage
        const end = start + perPage
        const total = budget.categories[categoryId].expenses.length
        const totalPages = Math.ceil(total / perPage)
        expenses = expenses.slice(start, end)
        resultingPagination = { page: page, perPage: perPage, total: total, totalPages: totalPages }
        message = 'Expenses retrieved successfully. Pagination applied.'

        if (start > 0) {
          hateoas.addLink('first page', `${baseLink}/budgets/${budgetId}/categories/${categoryId}/expenses?page=${1}&perPage=${perPage}`, 'GET')
          hateoas.addLink('prev page', `${baseLink}/budgets/${budgetId}/categories/${categoryId}/expenses?page=${page - 1}&perPage=${perPage}`, 'GET')
        }
        if (end < budget.categories[categoryId].expenses.length) {
          hateoas.addLink('next page', `${baseLink}/budgets/${budgetId}/categories/${categoryId}/expenses?page=${page + 1}&perPage=${perPage}`, 'GET')
          hateoas.addLink('last page', `${baseLink}/budgets/${budgetId}/categories/${categoryId}/expenses?page=${totalPages}&perPage=${perPage}`, 'GET')
        }

      }
      const statusCode = 200
      const status = 'OK'

      const responseObject = new CustomResponse(statusCode, status, message, expenses, hateoas, resultingPagination)
      res.status(200).json(responseObject)
    } catch (error) {
      let code = 500
      let message = 'Internal server error'
      if (error instanceof ExtendedError) {
        code = error.status || 500
        message = error.message || 'Internal server error'
      } else {
        res.status(code).json(new CustomResponse(code, 'Error', message, {}, new Hateoas([]), {}))
      }
    }
  }

  /**
   * Get expense by id.
   */
  async getExpenseById(req: Express.Request, res: Express.Response, next: Express.NextFunction) {
    try {
      const userId = req.UUID || ''
      const budgetId = req.params.budgetid || '-1'
      const categoryId = parseInt(req.params.categoryid || '-1')
      const expenseId = parseInt(req.params.expenseid || '-1')

      const budget = await this.budgetService.getBudgetById(budgetId, userId)
      if (!budget) {
        throw new ExtendedError('Budget not found', 404, new Error('Budget not found'), 'ExpenseController.getExpenseById')
      }

      if (categoryId < 0 || categoryId >= budget.categories.length) {
        throw new ExtendedError('Category not found', 404, new Error('Category not found'), 'ExpenseController.getExpenseById')
      }

      if (expenseId < 0 || expenseId >= budget.categories[categoryId].expenses.length) {
        throw new ExtendedError('Expense not found', 404, new Error('Expense not found'), 'ExpenseController.getExpenseById')
      }

      const expense = budget.categories[categoryId].expenses[expenseId]
      const message = 'Expense retrieved successfully'
      const statusCode = 200
      const status = 'OK'
      const baseLink = getBaseLink(req)
      const hateoas = new Hateoas([
        new HateoasLink('update', `${baseLink}/budgets/${budgetId}/categories/${categoryId}/expenses/${expenseId}`, 'PUT'),
        new HateoasLink('delete', `${baseLink}/budgets/${budgetId}/categories/${categoryId}/expenses/${expenseId}`, 'DELETE'),
        new HateoasLink('all expenses', `${baseLink}/budgets/${budgetId}/categories/${categoryId}/expenses`, 'GET'),
      ])
      const responseObject = new CustomResponse(statusCode, status, message, expense, hateoas, {})
      res.status(200).json(responseObject)
    } catch (error) {
      let code = 500
      let message = 'Internal server error'
      if (error instanceof ExtendedError) {
        code = error.status || 500
        message = error.message || 'Internal server error'
      } else {
        res.status(code).json(new CustomResponse(code, 'Error', message, {}, new Hateoas([]), {}))
      }
    }
  }

  /**
   * Save changes to the budget.
   */
  private async saveBudget(req: Express.Request, res: Express.Response, budget: Budget) {
    await this.budgetService.updateBudget(budget, budget.id, req.UUID as string)
  }
}

