/**
 * Express router providing expense related routes
 */
import express from 'express'
import { container, TYPES } from '../../../../../../config/inversify.config.js'
import { ExpenseController } from '../../../../../../controller/ExpenseController.js'

export function createExpenseRouter(expenseController: ExpenseController) {

  /**
   * The expense router.
   */
  const router = express.Router({ mergeParams: true })
  const controller = expenseController

  /**
   * Get a specific expense by ID.
   */
  router.route('/:expenseid').get(async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    await controller.getExpenseById(req, res, next)
  })

  /**
   * The expense update route. Updates the expense with the given ID.
   */
  router.route('/:expenseid').put(async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    await controller.updateExpense(req, res, next)
  })

  /**
   * The expense delete route. Deletes the expense with the given ID.
   */
  router.route('/:expenseid').delete(async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    await controller.deleteExpense(req, res, next)
  })

  /**
   * The expense creation route.
   */
  router.route('/').post(async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    await controller.addExpense(req, res, next)
  })

  /**
   * Get All Expenses the user owns or has access to.
   */
  router.route('/').get(async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    await controller.getAllExpenses(req, res, next)
  })

  return router
}