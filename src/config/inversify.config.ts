// User-land modules.
import { Container, decorate, inject, injectable } from 'inversify'
import 'reflect-metadata'

// Application models.
import { IAllowedToken, AllowedToken} from '../models/schemas/AllowedTokenSchema.js'
import { Budget } from '../models/schemas/BudgetSchema.js'
import { ICategory, CategorySchema } from '../models/schemas/CategorySchema.js'
import { IExpense, ExpenseSchema } from '../models/schemas/ExpenseSchema.js'
import { IUserAccess, UserAccessSchema } from '../models/schemas/UserAccessSchema.js'
import { IUser, User } from '../models/schemas/UserSchema.js'
import { ExpenseAddedWebhookModel } from '../models/schemas/ExpenseAddedWebhookSchema.js'

// Application repositories.
import { RepositoryBase } from '../repositories/RepositoryBase.js'
import { TokenRepository } from '../repositories/TokenRepository.js'
import { BudgetRepository } from '../repositories/BudgetRepository.js'
import { UserRepository } from '../repositories/UserRepository.js'
import { ExpenseAddedWebhookRepository } from '../repositories/ExpenseAddedWebhookRepository.js'

// Application services.
import { AuthService } from '../services/AuthService.js'
import { BudgetService } from '../services/BudgetService.js'
import { CategoryService } from '../services/CategoryService.js'
import { ExpenseService } from '../services/ExpenseService.js'
import { JWTServices } from '../services/JWTServices.js'
import { UserService } from '../services/UserService.js'
import { WebhookService } from '../services/WebhookService.js'

// Application controllers
import { AuthenticationController } from '../controller/AuthenticationController.js'
import { RootController } from '../controller/RootController.js'
import { UserController } from '../controller/UserController.js'
import { BudgetController } from '../controller/BudgetController.js'
import { CategoryController } from '../controller/CategoryController.js'
import { ExpenseController } from '../controller/ExpenseController.js'
import { WebhookController } from '../controller/WebhookController.js'

// Router Factory
import { createMainRouter } from '../services/routerFactory.js'

// Routers
import { createBudgetRouter } from '../routes/api/v1/budgets/budgetRouter.js'
import { createCategoryRouter } from '../routes/api/v1/budgets/categories/categoryRouter.js'
import { createExpenseRouter } from '../routes/api/v1/budgets/categories/expenses/expenseRouter.js'
import { createUserRouter } from '../routes/api/v1/users/userRouter.js'
import { createV1Router } from '../routes/api/v1/v1Router.js'
import { createAPIRouter } from '../routes/api/apiRouter.js'
import { createRootRouter } from '../routes/router.js'

// Define the types to be used by the IoC container.
export const TYPES = {
  // Models
  AllowedToken: Symbol.for('AllowedToken'),
  Budget: Symbol.for('Budget'),
  User: Symbol.for('User'),
  ExpenseAddedWebhookModel: Symbol.for('ExpenseAddedWebhookModel'),
  // Repositories
  RepositoryBase: Symbol.for('RepositoryBase'),
  TokenRepository: Symbol.for('TokenRepository'),
  BudgetRepository: Symbol.for('BudgetRepository'),
  UserRepository: Symbol.for('UserRepository'),
  ExpenseAddedWebhookRepository: Symbol.for('ExpenseAddedWebhookRepository'),
  // Services
  AuthService: Symbol.for('AuthService'),
  BudgetService: Symbol.for('BudgetService'),
  CategoryService: Symbol.for('CategoryService'),
  ExpenseService: Symbol.for('ExpenseService'),
  JWTServices: Symbol.for('JWTServices'),
  UserService: Symbol.for('UserService'),
  WebhookService: Symbol.for('WebhookService'),
  // Controllers
  AuthenticationController: Symbol.for('AuthenticationController'),
  RootController: Symbol.for('RootController'),
  UserController: Symbol.for('UserController'),
  BudgetController: Symbol.for('BudgetController'),
  CategoryController: Symbol.for('CategoryController'),
  ExpenseController: Symbol.for('ExpenseController'),
  WebhookController: Symbol.for('WebhookController'),
  // Router Factory
  RouterFactory: Symbol.for('RouterFactory'),
  // Routers
  createBudgetRouter: Symbol.for('createBudgetRouter'),
  createCategoryRouter: Symbol.for('createCategoryRouter'),
  createExpenseRouter: Symbol.for('createExpenseRouter'),
  createUserRouter: Symbol.for('createUserRouter'),
  createV1Router: Symbol.for('createV1Router'),
  createAPIRouter: Symbol.for('createAPIRouter'),
  createRootRouter: Symbol.for('createRootRouter'),
}

// Declare the injectable and its dependencies.
// Models
decorate(injectable(), AllowedToken)
decorate(injectable(), Budget)
decorate(injectable(), User)
decorate(injectable(), ExpenseAddedWebhookModel)
// Repositories
decorate(injectable(), RepositoryBase)
decorate(injectable(), TokenRepository)
decorate(injectable(), BudgetRepository)
decorate(injectable(), UserRepository)
decorate(injectable(), ExpenseAddedWebhookRepository)
// Services
decorate(injectable(), AuthService)
decorate(injectable(), BudgetService)
decorate(injectable(), CategoryService)
decorate(injectable(), ExpenseService)
decorate(injectable(), JWTServices)
decorate(injectable(), UserService)
decorate(injectable(), WebhookService)
// Controllers
decorate(injectable(), AuthenticationController)
decorate(injectable(), RootController)
decorate(injectable(), UserController)
decorate(injectable(), BudgetController)
decorate(injectable(), CategoryController)
decorate(injectable(), ExpenseController)
decorate(injectable(), WebhookController)
// Router Factory
decorate(injectable(), createMainRouter)
// Routers
decorate(injectable(), createBudgetRouter)
decorate(injectable(), createCategoryRouter)
decorate(injectable(), createExpenseRouter)
decorate(injectable(), createUserRouter)
decorate(injectable(), createV1Router)
decorate(injectable(), createAPIRouter)
decorate(injectable(), createRootRouter)


// Feed the dependencies to the injectable.
// Inject models into repositories.
decorate(inject(TYPES.AllowedToken), TokenRepository, 0)
decorate(inject(TYPES.Budget), BudgetRepository, 0)
decorate(inject(TYPES.User), UserRepository, 0)
decorate(inject(TYPES.TokenRepository), AllowedToken, 0)
decorate(inject(TYPES.ExpenseAddedWebhookModel), ExpenseAddedWebhookRepository, 0)

// Inject repositories into services.
decorate(inject(TYPES.BudgetRepository), BudgetService, 0)
decorate(inject(TYPES.UserRepository), UserService, 0)
decorate(inject(TYPES.UserService), AuthService, 0)
decorate(inject(TYPES.JWTServices), AuthService, 1)
decorate(inject(TYPES.TokenRepository), AuthService, 2)
decorate(inject(TYPES.ExpenseAddedWebhookModel), WebhookService, 0)

// Inject services into controllers.
decorate(inject(TYPES.JWTServices), AuthenticationController, 0)
decorate(inject(TYPES.BudgetService), BudgetController, 0)
decorate(inject(TYPES.CategoryService), CategoryController, 0)
decorate(inject(TYPES.BudgetService), CategoryController, 1)
decorate(inject(TYPES.ExpenseService), ExpenseController, 0)
decorate(inject(TYPES.BudgetService), ExpenseController, 1)
decorate(inject(TYPES.UserService), UserController, 0)
decorate(inject(TYPES.AuthService), UserController, 1)
decorate(inject(TYPES.UserController), RootController, 0)
decorate(inject(TYPES.WebhookService), WebhookController, 0)

// Create the IoC container.
export const container = new Container()

// Declare the bindings.
container.bind(TYPES.AllowedToken).toConstantValue(AllowedToken)
container.bind(TYPES.Budget).toConstantValue(Budget) // The Budget model is used in the BudgetService and have sub-schemas Category, Expense and UserAccess.
container.bind(TYPES.User).toConstantValue(User)
container.bind(TYPES.ExpenseAddedWebhookModel).toConstantValue(ExpenseAddedWebhookModel)
container.bind(TYPES.RepositoryBase).to(RepositoryBase).inSingletonScope()
container.bind(TYPES.TokenRepository).to(TokenRepository).inSingletonScope()
container.bind(TYPES.BudgetRepository).to(BudgetRepository).inSingletonScope()
container.bind(TYPES.UserRepository).to(UserRepository).inSingletonScope()
container.bind(TYPES.ExpenseAddedWebhookRepository).to(ExpenseAddedWebhookRepository).inSingletonScope()
container.bind(TYPES.AuthService).to(AuthService).inSingletonScope()
container.bind(TYPES.BudgetService).to(BudgetService).inSingletonScope()
container.bind(TYPES.CategoryService).to(CategoryService).inSingletonScope()
container.bind(TYPES.ExpenseService).to(ExpenseService).inSingletonScope()
container.bind(TYPES.JWTServices).to(JWTServices).inSingletonScope()
container.bind(TYPES.UserService).to(UserService).inSingletonScope()
container.bind(TYPES.WebhookService).to(WebhookService).inSingletonScope()
container.bind(TYPES.RootController).to(RootController).inSingletonScope()
container.bind(TYPES.UserController).to(UserController).inSingletonScope()
container.bind(TYPES.BudgetController).to(BudgetController).inSingletonScope()
container.bind(TYPES.CategoryController).to(CategoryController).inSingletonScope()
container.bind(TYPES.ExpenseController).to(ExpenseController).inSingletonScope()
container.bind(TYPES.AuthenticationController).to(AuthenticationController).inSingletonScope()
container.bind(TYPES.WebhookController).to(WebhookController).inSingletonScope()