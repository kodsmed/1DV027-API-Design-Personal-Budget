/**
 * This is the webhook controller of the application.
 * It is responsible for handling the webhook route and everything that is in that scope.
 */

import express from 'express'
import { Hateoas } from '../models/Hateoas.js'
import { WebhookService } from '../services/WebhookService.js'
import { ExtendedError } from '../lib/types/ExtendedError.js'
import { CustomResponse } from '../lib/types/CustomResponse.js'
import { Expense } from '../models/Expense.js'


export class WebhookController {
  private webhookService: WebhookService
  /**
   * Creates an instance of the WebhookController class.
   *
   * @param {WebhookService} webhookService - The user controller.
   */
  constructor(webhookService: WebhookService) {
    this.webhookService = webhookService
  }

  /**
   * Registers a new webhook.
   */
  async registerWebhook(req: express.Request, res: express.Response, next: express.NextFunction) {
    try {
      const uuid = req.UUID || ''
      const host = req.get('host') || ''
      const webhook = await this.webhookService.registerWebhook(req.body, uuid)
      const responseObject = new CustomResponse(201, 'Webhook registered', 'Webhook registration successful', webhook, new Hateoas([]), {})
      res.status(201).json(responseObject)
    } catch (error) {
      let message = 'Could not register webhook'
      let code = 500
      if (error instanceof ExtendedError) {
        message = error.message || 'Could not register webhook'
        code = error.status || 500
      }
      const responseObject = new CustomResponse(code, message, 'Webhook registration failed', {}, new Hateoas([]), {})
      res.status(code).json(responseObject)
    }
  }

  /**
   * Unregisters a webhook.
   */
  async unregisterWebhook(req: express.Request, res: express.Response, next: express.NextFunction) {
    try {
      const uuid = req.UUID || ''
      await this.webhookService.removeWebhook(uuid)
      const responseObject = new CustomResponse(200, 'Webhook unregistered', 'Webhook unregistration successful', {}, new Hateoas([]), {})
      res.status(200).json(responseObject)
    } catch (error) {
      let message = 'Could not unregister webhook'
      let code = 500
      if (error instanceof ExtendedError) {
        message = error.message || 'Could not unregister webhook'
        code = error.status || 500
      }
      const responseObject = new CustomResponse(code, message, 'Webhook unregistration failed', {}, new Hateoas([]), {})
      res.status(code).json(responseObject)
    }
  }

  /**
   * Trigger the webhook.
   */
  async triggerWebhook(req: express.Request, expense: Expense, budgetId: string, categoryId: number) {
    try {
      const uuid = req.UUID || ''

      // get the webhook
      this.webhookService.triggerWebhookIfApplicable(uuid, expense, budgetId, categoryId)

    } catch (error) {
      // do nothing
    }
  }
}