/**
 * This service is responsible for managing the Webhooks.
 * @module WebhookService
 * @author Jimmy Karlsson <jk224jv@student.lnu.se>
 */

import { ExpenseAddedWebhook } from "../models/ExpenseAddedWebhook.js"
import { ExpenseAddedWebhookRepository } from "../repositories/ExpenseAddedWebhookRepository.js"
import { IAddedExpenseWebhook, ExpenseAddedWebhookModel } from "../models/schemas/ExpenseAddedWebhookSchema.js"
import { ExtendedError } from "../lib/types/ExtendedError.js"

/**
 * The WebhookService class.
 */
export class WebhookService {
  private repository: ExpenseAddedWebhookRepository

  /**
   * Creates an instance of the WebhookService class.
   *
   * @param {ExpenseAddedWebhookRepository} webhookRepository - The webhook repository.
   */
  constructor(
    webhookRepository: ExpenseAddedWebhookRepository,
  ) {
    this.repository = webhookRepository
  }

  /**
   * Registers a new webhook.
   */
  async registerWebhook(webhook: IAddedExpenseWebhook, host: string, uuid: string): Promise<ExpenseAddedWebhook> {
    if (!webhook.ownerUUID) {
      throw new ExtendedError('Invalid webhook.', 400, new Error('Invalid webhook.'), 'WebhookService.registerWebhook')
    }
    if (!webhook.url) {
      throw new ExtendedError('Invalid webhook.', 400, new Error('Invalid webhook.'), 'WebhookService.registerWebhook')
    }
    if (!webhook.secret) {
      throw new ExtendedError('Invalid webhook.', 400, new Error('Invalid webhook.'), 'WebhookService.registerWebhook')
    }

    // does the webhook exist?
    const existingWebhook = await this.repository.getOneByQuery({ ownerUUID: webhook.ownerUUID })
    if (existingWebhook) {
      throw new ExtendedError('Webhook already exists.', 409, new Error('Webhook already exists.'), 'WebhookService.registerWebhook')
    }

    // is the owner the same as the user?
    if (webhook.ownerUUID !== uuid) {
      throw new ExtendedError('Invalid webhook.', 401, new Error('Invalid webhook.'), 'WebhookService.registerWebhook')
    }

    // Is the host the same as the host in the webhook?
    if (!webhook.url.includes(host)) {
      throw new ExtendedError('Invalid webhook.', 401, new Error('Invalid webhook.'), 'WebhookService.registerWebhook')
    }

    const webhookReply = await this.repository.create(webhook) as unknown
    const webhookDoc = webhookReply as IAddedExpenseWebhook
    return this.generateWebhookObject(webhookDoc)
  }

  /**
   * Removes a webhook.
   */
  async removeWebhook(uuid: string): Promise<void> {
    if (!uuid) {
      throw new Error('Webhook does not exist.')
    }
    // does the webhook exist?
    try {
      const existingWebhook = await this.repository.getOneByQuery({ ownerUUID: uuid })
      if (!existingWebhook) {
        throw new Error('Webhook does not exist.')
      }
      await this.repository.deleteByDocument(existingWebhook)
    } catch (error) {
      throw new Error('Failed to remove webhook.')
    }
  }

  private generateWebhookObject(webhookDoc: IAddedExpenseWebhook): ExpenseAddedWebhook {
    return new ExpenseAddedWebhook(webhookDoc.ownerUUID, webhookDoc.url,  webhookDoc.secret, webhookDoc.budgetIDtoMonitor, webhookDoc.categoryToMonitor)
  }
}