/**
 * Webhook router.
 */
// Import packages
import express from 'express'
import { WebhookController } from '../../../../controller/WebhookController.js'

export function createWebhookRouter(
  webhookController: WebhookController
) {
  /**
   * The version one router.
   */
  const router = express.Router()

  router.route('/').post(async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    await webhookController.registerWebhook(req, res, next)
  })

  router.route('/').delete(async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    await webhookController.unregisterWebhook(req, res, next)
  })

  return router
}
