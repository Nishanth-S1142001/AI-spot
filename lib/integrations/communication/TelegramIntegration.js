import { BaseIntegration } from '../BaseIntegration'

/**
 * Telegram Bot Integration
 * Free messaging platform with Bot API
 */

export default class TelegramIntegration extends BaseIntegration {
  constructor() {
    super()
    this.baseUrl = 'https://api.telegram.org'
  }

  async testConnection(credentials) {
    try {
      this.initialize(credentials)
      const me = await this.getMe()
      return {
        success: true,
        message: `Connected as @${me.data.username}`,
        botInfo: me.data
      }
    } catch (error) {
      return { success: false, message: error.message }
    }
  }

  getAuthHeaders() {
    return {
      'Content-Type': 'application/json'
    }
  }

  /**
   * Build API endpoint with bot token
   */
  buildEndpoint(method) {
    return `${this.baseUrl}/bot${this.credentials.botToken}/${method}`
  }

  /**
   * Get bot information
   */
  async getMe() {
    const response = await fetch(this.buildEndpoint('getMe'))
    const data = await response.json()

    if (!data.ok) {
      throw new Error(data.description || 'Failed to get bot info')
    }

    return this.formatSuccessResponse(data.result)
  }

  /**
   * Send text message
   */
  async sendMessage(params) {
    this.validateRequiredFields(params, ['chatId', 'text'])

    const {
      chatId,
      text,
      parseMode,
      disableWebPagePreview = false,
      disableNotification = false,
      replyToMessageId,
      replyMarkup
    } = params

    const payload = {
      chat_id: chatId,
      text: text,
      parse_mode: parseMode,
      disable_web_page_preview: disableWebPagePreview,
      disable_notification: disableNotification,
      reply_to_message_id: replyToMessageId,
      reply_markup: replyMarkup
    }

    const response = await fetch(this.buildEndpoint('sendMessage'), {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(payload)
    })

    const data = await response.json()

    if (!data.ok) {
      throw new Error(data.description || 'Failed to send message')
    }

    return this.formatSuccessResponse(data.result)
  }

  /**
   * Send photo
   */
  async sendPhoto(params) {
    this.validateRequiredFields(params, ['chatId', 'photo'])

    const {
      chatId,
      photo,
      caption,
      parseMode,
      disableNotification = false,
      replyToMessageId,
      replyMarkup
    } = params

    const payload = {
      chat_id: chatId,
      photo: photo,
      caption: caption,
      parse_mode: parseMode,
      disable_notification: disableNotification,
      reply_to_message_id: replyToMessageId,
      reply_markup: replyMarkup
    }

    const response = await fetch(this.buildEndpoint('sendPhoto'), {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(payload)
    })

    const data = await response.json()

    if (!data.ok) {
      throw new Error(data.description || 'Failed to send photo')
    }

    return this.formatSuccessResponse(data.result)
  }

  /**
   * Send document
   */
  async sendDocument(params) {
    this.validateRequiredFields(params, ['chatId', 'document'])

    const {
      chatId,
      document,
      caption,
      parseMode,
      disableNotification = false,
      replyToMessageId,
      replyMarkup
    } = params

    const payload = {
      chat_id: chatId,
      document: document,
      caption: caption,
      parse_mode: parseMode,
      disable_notification: disableNotification,
      reply_to_message_id: replyToMessageId,
      reply_markup: replyMarkup
    }

    const response = await fetch(this.buildEndpoint('sendDocument'), {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(payload)
    })

    const data = await response.json()

    if (!data.ok) {
      throw new Error(data.description || 'Failed to send document')
    }

    return this.formatSuccessResponse(data.result)
  }

  /**
   * Send video
   */
  async sendVideo(params) {
    this.validateRequiredFields(params, ['chatId', 'video'])

    const { chatId, video, caption, parseMode } = params

    const payload = {
      chat_id: chatId,
      video: video,
      caption: caption,
      parse_mode: parseMode
    }

    const response = await fetch(this.buildEndpoint('sendVideo'), {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(payload)
    })

    const data = await response.json()

    if (!data.ok) {
      throw new Error(data.description || 'Failed to send video')
    }

    return this.formatSuccessResponse(data.result)
  }

  /**
   * Send location
   */
  async sendLocation(params) {
    this.validateRequiredFields(params, ['chatId', 'latitude', 'longitude'])

    const { chatId, latitude, longitude } = params

    const payload = {
      chat_id: chatId,
      latitude: latitude,
      longitude: longitude
    }

    const response = await fetch(this.buildEndpoint('sendLocation'), {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(payload)
    })

    const data = await response.json()

    if (!data.ok) {
      throw new Error(data.description || 'Failed to send location')
    }

    return this.formatSuccessResponse(data.result)
  }

  /**
   * Send poll
   */
  async sendPoll(params) {
    this.validateRequiredFields(params, ['chatId', 'question', 'options'])

    const {
      chatId,
      question,
      options,
      isAnonymous = true,
      type = 'regular',
      allowsMultipleAnswers = false
    } = params

    const payload = {
      chat_id: chatId,
      question: question,
      options: options,
      is_anonymous: isAnonymous,
      type: type,
      allows_multiple_answers: allowsMultipleAnswers
    }

    const response = await fetch(this.buildEndpoint('sendPoll'), {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(payload)
    })

    const data = await response.json()

    if (!data.ok) {
      throw new Error(data.description || 'Failed to send poll')
    }

    return this.formatSuccessResponse(data.result)
  }

  /**
   * Edit message text
   */
  async editMessageText(params) {
    this.validateRequiredFields(params, ['chatId', 'messageId', 'text'])

    const { chatId, messageId, text, parseMode, replyMarkup } = params

    const payload = {
      chat_id: chatId,
      message_id: messageId,
      text: text,
      parse_mode: parseMode,
      reply_markup: replyMarkup
    }

    const response = await fetch(this.buildEndpoint('editMessageText'), {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(payload)
    })

    const data = await response.json()

    if (!data.ok) {
      throw new Error(data.description || 'Failed to edit message')
    }

    return this.formatSuccessResponse(data.result)
  }

  /**
   * Delete message
   */
  async deleteMessage(params) {
    this.validateRequiredFields(params, ['chatId', 'messageId'])

    const { chatId, messageId } = params

    const payload = {
      chat_id: chatId,
      message_id: messageId
    }

    const response = await fetch(this.buildEndpoint('deleteMessage'), {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(payload)
    })

    const data = await response.json()

    if (!data.ok) {
      throw new Error(data.description || 'Failed to delete message')
    }

    return this.formatSuccessResponse(data.result)
  }

  /**
   * Get chat
   */
  async getChat(params) {
    this.validateRequiredFields(params, ['chatId'])

    const { chatId } = params

    const response = await fetch(
      this.buildEndpoint(`getChat?chat_id=${chatId}`)
    )
    const data = await response.json()

    if (!data.ok) {
      throw new Error(data.description || 'Failed to get chat')
    }

    return this.formatSuccessResponse(data.result)
  }

  /**
   * Get chat member
   */
  async getChatMember(params) {
    this.validateRequiredFields(params, ['chatId', 'userId'])

    const { chatId, userId } = params

    const response = await fetch(
      this.buildEndpoint(`getChatMember?chat_id=${chatId}&user_id=${userId}`)
    )
    const data = await response.json()

    if (!data.ok) {
      throw new Error(data.description || 'Failed to get chat member')
    }

    return this.formatSuccessResponse(data.result)
  }

  /**
   * Send inline keyboard
   */
  createInlineKeyboard(buttons) {
    return {
      inline_keyboard: buttons.map((row) =>
        row.map((button) => ({
          text: button.text,
          callback_data: button.callbackData,
          url: button.url
        }))
      )
    }
  }

  /**
   * Send reply keyboard
   */
  createReplyKeyboard(buttons, options = {}) {
    return {
      keyboard: buttons.map((row) =>
        row.map((button) => ({
          text: button.text,
          request_contact: button.requestContact,
          request_location: button.requestLocation
        }))
      ),
      resize_keyboard: options.resizeKeyboard !== false,
      one_time_keyboard: options.oneTime || false,
      selective: options.selective || false
    }
  }

  /**
   * Parse webhook update
   */
  parseWebhookPayload(body, headers) {
    const update = super.parseWebhookPayload(body, headers)

    if (update.message) {
      return {
        eventType: 'message',
        updateId: update.update_id,
        messageId: update.message.message_id,
        from: update.message.from,
        chat: update.message.chat,
        date: update.message.date,
        text: update.message.text,
        photo: update.message.photo,
        document: update.message.document,
        video: update.message.video,
        location: update.message.location,
        rawPayload: update
      }
    }

    if (update.callback_query) {
      return {
        eventType: 'callback_query',
        updateId: update.update_id,
        id: update.callback_query.id,
        from: update.callback_query.from,
        message: update.callback_query.message,
        data: update.callback_query.data,
        rawPayload: update
      }
    }

    return {
      eventType: 'unknown',
      updateId: update.update_id,
      rawPayload: update
    }
  }

  /**
   * Answer callback query
   */
  async answerCallbackQuery(params) {
    this.validateRequiredFields(params, ['callbackQueryId'])

    const { callbackQueryId, text, showAlert = false } = params

    const payload = {
      callback_query_id: callbackQueryId,
      text: text,
      show_alert: showAlert
    }

    const response = await fetch(this.buildEndpoint('answerCallbackQuery'), {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(payload)
    })

    const data = await response.json()

    if (!data.ok) {
      throw new Error(data.description || 'Failed to answer callback query')
    }

    return this.formatSuccessResponse(data.result)
  }

  /**
   * Set webhook
   */
  async setWebhook(params) {
    this.validateRequiredFields(params, ['url'])

    const { url, maxConnections = 40, allowedUpdates } = params

    const payload = {
      url: url,
      max_connections: maxConnections,
      allowed_updates: allowedUpdates
    }

    const response = await fetch(this.buildEndpoint('setWebhook'), {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(payload)
    })

    const data = await response.json()

    if (!data.ok) {
      throw new Error(data.description || 'Failed to set webhook')
    }

    return this.formatSuccessResponse(data.result)
  }

  /**
   * Delete webhook
   */
  async deleteWebhook() {
    const response = await fetch(this.buildEndpoint('deleteWebhook'), {
      method: 'POST'
    })

    const data = await response.json()

    if (!data.ok) {
      throw new Error(data.description || 'Failed to delete webhook')
    }

    return this.formatSuccessResponse(data.result)
  }

  /**
   * Get webhook info
   */
  async getWebhookInfo() {
    const response = await fetch(this.buildEndpoint('getWebhookInfo'))
    const data = await response.json()

    if (!data.ok) {
      throw new Error(data.description || 'Failed to get webhook info')
    }

    return this.formatSuccessResponse(data.result)
  }
}
