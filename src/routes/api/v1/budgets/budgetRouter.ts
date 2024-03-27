/**
 * Budget Router, responsible for handling the budget routes.
 */
import express from 'express'
import { container, TYPES } from '../../../../config/inversify.config.js'
import { BudgetController } from '../../../../controller/BudgetController.js'

export function createBudgetRouter(
  budgetController: BudgetController,
  categoryRouter: express.Router
) {
  /**
   * The budget router.
   */
  const router = express.Router()
  const controller = budgetController

  /**
   * The category router.
   */
    router.use('/:budgetid/categories', categoryRouter)


  /**
   * Get a specific budget by ID.
   */
  router.route('/:budgetid').get(async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    controller.getBudgetById(req, res, next)
  })

  /**
   * The budget update route. Updates the budget with the given ID.
   */
  router.route('/:budgetid').put(async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    controller.updateBudget(req, res, next)
  })

  /**
   * The budget delete route. Deletes the budget with the given ID.
   */
  router.route('/:budgetid').delete(async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    controller.deleteBudget(req, res, next)
  })

  /**
   * The budget creation route.
   */
    router.route('/').post(async (req: express.Request, res: express.Response, next: express.NextFunction) => {
      controller.createBudget(req, res, next)
    })
     /**
      * Get All Budgets the user owns or has access to.
      */
    router.route('/').get(async (req: express.Request, res: express.Response, next: express.NextFunction) => {
      controller.getBudgets(req, res, next)
    })

  return router
}