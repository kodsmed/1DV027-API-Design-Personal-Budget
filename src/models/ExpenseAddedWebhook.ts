/**
 * A model class that represents an expense added webhook.
 */
export class ExpenseAddedWebhook {
  ownerUUID: string = ''
  url: string = ''
  secret: string = ''
  budgetIDtoMonitor: string = ''
  categoryToMonitor: number = 0
  /**
   * Creates an instance of the ExpenseAddedWebhook class.
   *
   * @param {string} url - The URL to send the webhook to.
   * @param {string} token - The token to use for the webhook.
   */
  constructor(ownerUUID: string, url: string, token: string, budgetIDtoMonitor: string, categoryToMonitor: number) {
    this.setOwnerUUID(ownerUUID)
    this.setUrl(url)
    this.setSecret(token)
    this.setBudgetIDtoMonitor(budgetIDtoMonitor)
    this.setCategoryToMonitor(categoryToMonitor)
  }

  /**
   * Sets the owner UUID.
   *
   * @param {string} ownerUUID - The owner UUID.
   */
  setOwnerUUID(ownerUUID: string) {
    if (!ownerUUID || typeof ownerUUID !== 'string') {
      throw new Error('ownerUUID must be a string.')
    }
    if (ownerUUID.length !== 36) {
      throw new Error('ownerUUID must be 36 characters long.')
    }
    this.ownerUUID = ownerUUID
  }

  /**
   * Sets the URL.
   *
   * @param {string} url - The URL.
   */
  setUrl(url: string) {
    if (!url || typeof url !== 'string') {
      throw new Error('url must be a string.')
    }
    // check the format of the URL
    const urlRegex = /^(http|https):\/\/[^ "]+$/
    if (!urlRegex.test(url)) {
      throw new Error('url must be a valid URL.')
    }
    this.url = url
  }

  /**
   * Sets the secret.
   *
   * @param {string} secret - The secret.
   */
  setSecret(secret: string) {
    if (!secret || typeof secret !== 'string') {
      throw new Error('secret must be a string.')
    }
    if (secret.length < 8 || secret.length > 256) {
      throw new Error('secret must be between 8 and 256 characters long.')
    }
    this.secret = secret
  }

  /**
   * Sets the budget ID to monitor.
   *
   * @param {string} budgetIDtoMonitor - The budget ID to monitor.
   */
  setBudgetIDtoMonitor(budgetIDtoMonitor: string) {
    if (!budgetIDtoMonitor || typeof budgetIDtoMonitor !== 'string') {
      throw new Error('budgetIDtoMonitor must be a string.')
    }
    this.budgetIDtoMonitor = budgetIDtoMonitor
  }

  /**
   * Sets the category to monitor.
   *
   * @param {number} categoryToMonitor - The category to monitor.
   */
  setCategoryToMonitor(categoryToMonitor: number) {
    if (categoryToMonitor < 0) {
      throw new Error('categoryToMonitor must be greater than or equal to 0.')
    }
    this.categoryToMonitor = categoryToMonitor
  }
}