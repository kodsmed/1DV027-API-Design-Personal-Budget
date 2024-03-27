/**
 * @file BudgetRepository is a repository class for the Budget model.
 * @module repositories/BudgetRepository
 * @author Jimmy Karlsson <jk224jv@student.lnu.se>
 */

import mongoose from 'mongoose'
import { RepositoryBase } from "./RepositoryBase.js"

export class BudgetRepository extends RepositoryBase {
  /**
   * Creates an instance of the BudgetRepository class.
   *
   * @param {mongoose.Model<mongoose.Document>} model - The model to be used by the repository.
   */
  constructor(model: mongoose.Model<mongoose.Document>) {
    super(model)
  }
}