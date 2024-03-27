/**
 * Category Router - This file contains the routes for the category endpoints.
 */

import express from 'express'
import { CategoryController } from '../../../../../controller/CategoryController.js'

export function createCategoryRouter(
  categoryController: CategoryController,
  expenseRouter: express.Router
) {
  /**
   * The category router.
   */
  const router = express.Router({ mergeParams: true })
  const controller = categoryController

    /**
   * The expense router.
   */
    router.use('/:categoryid/expenses', expenseRouter)

  /**
   * Get a specific category by ID.
   */
  router.route('/:categoryid').get(async(req, res, next) => {
    await categoryController.getCategoryById(req, res, next)
  })

  /**
   * The category update route. Updates the category with the given ID.
   */
  router.route('/:categoryid').put(async (req, res, next) => {
    await categoryController.updateCategory(req, res, next)
  })

  /**
   * The category delete route. Deletes the category with the given ID.
   */
  router.route('/:categoryid').delete(async (req, res, next) => {
    await categoryController.deleteCategory(req, res, next)
  })

  /**
   * The category creation route.
   */
    router.route('/').post(async (req, res, next) => {
      await categoryController.addCategory(req, res, next)
    })

    /**
     * Get All Categories the user owns or has access to.
     */
    router.route('/').get(async (req, res, next) => {
      await categoryController.getCategories(req, res, next)
    })

  return router
}