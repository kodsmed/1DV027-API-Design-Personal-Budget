import 'dotenv/config'
import { connectToDatabase } from './src/config/mongoose.js';
import { IUser, User } from './src/models/schemas/UserSchema.js'
import { Budget } from './src/models/schemas/BudgetSchema.js'
import { Budget as BudgetObject} from './src/models/Budget.js';
import { Category } from './src/models/Category.js';
import { Expense } from './src/models/Expense.js';
import bcrypt from 'bcrypt'

async function passwordHasher(string:string) {
  const hashedPassword = await bcrypt.hash(string, 16);
  return hashedPassword;
}


async function populateDB() {
  await connectToDatabase(`${process.env.MONGODB_CONNECTION_STRING}`)

  const fakeUUID = '00000000-0000-0000-0000-000000000000';
  const hashedPassword = await passwordHasher('TestTestTest');
  const user = new User({username: 'TesterNo1', email: 'tester@test.com', userID: fakeUUID, password: hashedPassword})

  console.log('saving user');
  try {
    await user.save();
  } catch (error) {
    console.log(error);
  }

  const budget = new BudgetObject('Test budget', 'for testing purposes', new Date(), 'yearly', fakeUUID, [])
  const rent = new Category('Rent', 50000)
  const groceries = new Category('Groceries', 20000)
  const transportation = new Category('Transportation', 20000)
  const utilities = new Category('Utilities', 10000)
  const entertainment = new Category('Entertainment', 20000)
  const savings = new Category('Savings', 20000)
  const other = new Category('Other', 10000)

  budget.categories.push(rent, groceries, transportation, utilities, entertainment, savings, other)

  // populate categories with expenses
  // Rent
  console.log('populating categories with expenses');
  console.log('rent');
  for (let i = 0; i < 12; i++) {
    const expense = new Expense(fakeUUID, new Date(2024, i, 1), 10000, 'Rent payment')
    rent.expenses.push(expense)
  }

  // Groceries once a week
  console.log('groceries');
  for (let i = 0; i < 52; i++) {
    const expense = new Expense(fakeUUID, new Date(2024, 0, 1 + i*7), 400, 'Groceries')
    groceries.expenses.push(expense)
  }

  // Transportation
  console.log('transportation');
  for (let i = 0; i < 12; i++) {
    const expense = new Expense(fakeUUID, new Date(2024, i, 1), 2000, 'Transportation')
    transportation.expenses.push(expense)
  }

  // Utilities
  console.log('utilities');
  for (let i = 0; i < 12; i++) {
    const expense = new Expense(fakeUUID, new Date(2024, i, 1), 1000, 'Utilities')
    utilities.expenses.push(expense)
  }

  // Entertainment
  console.log('entertainment');
  for (let i = 0; i < 12; i++) {
    const expense = new Expense(fakeUUID, new Date(2024, i, 1), 2000, 'Entertainment')
    entertainment.expenses.push(expense)
  }

  // Savings
  console.log('savings');
  for (let i = 0; i < 12; i++) {
    const expense = new Expense(fakeUUID, new Date(2024, i, 1), 2000, 'Savings')
    savings.expenses.push(expense)
  }

  // Other
  console.log('other');
  for (let i = 0; i < 12; i++) {
    const expense = new Expense(fakeUUID, new Date(2024, i, 1), 1000, 'Other')
    other.expenses.push(expense)
  }

  const budgetDoc = new Budget(budget)
  console.log('saving budget');
  try{
    await budgetDoc.save();
  } catch (error) {
    console.log(error);
  }

}



populateDB();