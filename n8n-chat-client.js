/**
 * N8N Chat Client Library
 * A simple JavaScript library to integrate with n8n chat workflows
 * @version 1.0.0
 */

class N8NChatClient {
  /**
   * Create a new N8N Chat Client
   * @param {Object} config - Configuration object
   * @param {string} config.chatUrl - The n8n webhook URL for chat
   * @param {Object} config.headers - Additional headers to send with requests (optional)
   * @param {number} config.timeout - Request timeout in milliseconds (optional, default: 30000)
   * @param {Function} config.onMessage - Callback when message is received (optional)
   * @param {Function} config.onError - Callback when error occurs (optional)
   */
  constructor(config) {
    if (!config || !config.chatUrl) {
      throw new Error('chatUrl is required in configuration');
    }

    this.chatUrl = config.chatUrl;
    this.headers = config.headers || {};
    this.timeout = config.timeout || 30000;
    this.onMessage = config.onMessage || null;
    this.onError = config.onError || null;
    this.sessionId = this.generateSessionId();
    this.conversationHistory = [];
  }

  /**
   * Generate a unique session ID
   * @returns {string} Session ID
   */
  generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Send a message to n8n chat workflow
   * @param {string} message - The message to send
   * @param {Object} metadata - Additional metadata to send (optional)
   * @returns {Promise<Object>} The response from n8n
   */
  async sendMessage(message, metadata = {}) {
    if (!message || typeof message !== 'string') {
      throw new Error('Message must be a non-empty string');
    }

    const payload = {
      chatInput: message.trim(),
      sessionId: this.sessionId,
      timestamp: new Date().toISOString(),
      ...metadata
    };

    // Add to conversation history
    this.conversationHistory.push({
      role: 'user',
      message: message.trim(),
      timestamp: new Date().toISOString()
    });

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(this.chatUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...this.headers
        },
        body: JSON.stringify(payload),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Add bot response to history
      const botMessage = this.extractMessage(data);
      this.conversationHistory.push({
        role: 'assistant',
        message: botMessage,
        timestamp: new Date().toISOString(),
        rawData: data
      });

      // Trigger callback if provided
      if (this.onMessage) {
        this.onMessage(data);
      }

      return data;
    } catch (error) {
      const errorObj = {
        error: error.message,
        timestamp: new Date().toISOString()
      };

      // Trigger error callback if provided
      if (this.onError) {
        this.onError(errorObj);
      }

      throw error;
    }
  }

  /**
   * Extract message from n8n response
   * Handles different response formats
   * @param {Object} data - The response data
   * @returns {string} The extracted message
   */
  extractMessage(data) {
    // Try common response formats
    if (typeof data === 'string') {
      return data;
    }
    
    if (data.message) {
      return data.message;
    }
    
    if (data.output) {
      return data.output;
    }
    
    if (data.response) {
      return data.response;
    }
    
    if (data.text) {
      return data.text;
    }

    // If array, try to get first item
    if (Array.isArray(data) && data.length > 0) {
      return this.extractMessage(data[0]);
    }

    // Fallback to JSON string
    return JSON.stringify(data);
  }

  /**
   * Get conversation history
   * @returns {Array} Array of conversation messages
   */
  getHistory() {
    return [...this.conversationHistory];
  }

  /**
   * Clear conversation history
   */
  clearHistory() {
    this.conversationHistory = [];
  }

  /**
   * Reset session (generates new session ID and clears history)
   */
  resetSession() {
    this.sessionId = this.generateSessionId();
    this.clearHistory();
  }

  /**
   * Get current session ID
   * @returns {string} Current session ID
   */
  getSessionId() {
    return this.sessionId;
  }

  /**
   * Set a new session ID
   * @param {string} sessionId - New session ID
   */
  setSessionId(sessionId) {
    this.sessionId = sessionId;
  }
}

// Export for different module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = N8NChatClient;
}

if (typeof window !== 'undefined') {
  window.N8NChatClient = N8NChatClient;
}

