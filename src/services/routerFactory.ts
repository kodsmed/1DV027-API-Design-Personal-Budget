/**
 * Generates all the Express routers for the application.
 */
// Import package modules.
import express from 'express';

// Import the types
import { ServerOptions } from '../lib/types/serverOptions.js';
import { createExpenseRouter } from '../routes/api/v1/budget/categories/expenses/expenseRouter.js'
import { createCategoryRouter } from '../routes/api/v1/budget/categories/categoryRouter.js'
import { createBudgetRouter } from '../routes/api/v1/budget/budgetRouter.js'
import { createUserRouter } from '../routes/api/v1/user/userRouter.js'
import { container, TYPES } from '../config/inversify.config.js'
import { createV1Router } from '../routes/api/v1/v1Router.js';
import { createAPIRouter } from '../routes/api/apiRouter.js';
import { createRootRouter } from '../routes/router.js';

// Import the main router factory


export function createMainRouter(
): express.Router {
  const expenseRouter = createExpenseRouter(container.get(TYPES.ExpenseController))
  const categoryRouter = createCategoryRouter(container.get(TYPES.CategoryController), expenseRouter)
  const budgetRouter = createBudgetRouter(container.get(TYPES.BudgetController), categoryRouter)
  const userRouter = createUserRouter(container.get(TYPES.UserController))
  const v1Router = createV1Router(userRouter, budgetRouter)
  const apiRouter = createAPIRouter(v1Router, container.get(TYPES.AuthenticationController))
  const mainRouter = createRootRouter(apiRouter, container.get(TYPES.RootController))
  return mainRouter;
}