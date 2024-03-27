/**
 * Expense DTO.
 */

import { ExtendedError } from '../lib/types/ExtendedError.js'

export class Expense {
  ownerUUID: string = ''
  date: Date = new Date()
  amount: number = 0
  note?: string = ''

  /**
   * Creates an instance of the Expense class.
   *
   * @param {string} ownerUUID - The owner's UUID.
   * @param {Date} date - The date of the expense.
   * @param {number} amount - The amount of the expense.
   * @param {string} note - The note of the expense. (optional)
   */
  constructor(
    ownerUUID: string,
    date: Date,
    amount: number,
    note?: string
  ) {
    this.#setOwnerUUID(ownerUUID)
    this.#setDate(date)
    this.#setAmount(amount)
    this.#setNote(note)
  }

  #setOwnerUUID(ownerUUID: string) {
    if (ownerUUID.length === 0) {
      const errorMessage = 'Owner UUID is required.'
      throw new ExtendedError(errorMessage, 400, new Error(errorMessage), 'Expense constructor')
    }
    if (ownerUUID.length !== 36) {
      const errorMessage = 'Owner UUID must be 36 characters long.'
      throw new ExtendedError(errorMessage, 400, new Error(errorMessage), 'Expense constructor')
    }
    this.ownerUUID = ownerUUID
  }

  #setDate(date: Date) {
    if (!date) {
      const errorMessage = 'Date is required.'
      throw new ExtendedError(errorMessage, 400, new Error(errorMessage), 'Expense constructor')
    }
    this.date = date
  }

  #setAmount(amount: number) {
    if (!amount || amount === 0) {
      const errorMessage = 'Amount is required.'
      throw new ExtendedError(errorMessage, 400, new Error(errorMessage), 'Expense constructor')
    }
    if (amount <= 0) {
      const errorMessage = 'Amount must be greater than 0.'
      throw new ExtendedError(errorMessage, 400, new Error(errorMessage), 'Expense constructor')
    }
    this.amount = amount
  }

  #setNote(note: string | undefined) {
    if (note) {
      if (note.length > 128) {
        const errorMessage = 'The note must be of maximum length 128 characters.'
        throw new ExtendedError(errorMessage, 400, new Error(errorMessage), 'Expense constructor')
      }
      this.note = note
    }
  }
}