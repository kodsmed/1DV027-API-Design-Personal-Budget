/**
 * @file ExpenseAddedWebhookRepository is a repository class for the ExpenseAddedWebhook model.
 * @module repositories/ExpenseAddedWebhookRepository
 * @author Jimmy Karlsson <jk224jv@student.lnu.se>
 */

import mongoose from 'mongoose'
import { RepositoryBase } from "./RepositoryBase.js"

export class ExpenseAddedWebhookRepository extends RepositoryBase {
  /**
   * Creates an instance of the BudgetRepository class.
   *
   * @param {mongoose.Model<mongoose.Document>} model - The model to be used by the repository.
   */
  constructor(model: mongoose.Model<mongoose.Document>) {
    super(model)
  }
}