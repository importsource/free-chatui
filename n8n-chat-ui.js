/**
 * N8N Chat UI Component
 * A simple, beautiful chat interface for N8N Chat Client
 * @version 1.0.0
 */

class N8NChatUI {
  /**
   * Create a new N8N Chat UI
   * @param {Object} config - Configuration object
   * @param {string} config.chatUrl - The n8n webhook URL for chat
   * @param {string} config.containerId - The ID of the container element (optional)
   * @param {string} config.title - Chat window title (optional, default: "Chat")
   * @param {string} config.placeholder - Input placeholder text (optional)
   * @param {boolean} config.showTimestamp - Show message timestamps (optional, default: false)
   * @param {Object} config.theme - Theme customization (optional)
   * @param {Object} config.button - Toggle button configuration (optional)
   * @param {boolean} config.button.enabled - Enable toggle button (default: true)
   * @param {string} config.button.icon - Custom icon HTML or SVG (optional)
   * @param {string} config.button.radius - Border radius (default: '50%')
   * @param {string} config.button.border - Border style (default: 'none')
   * @param {string} config.button.shadow - Box shadow (default: '0 4px 12px rgba(0,0,0,0.15)')
   */
  constructor(config) {
    if (!config || !config.chatUrl) {
      throw new Error('chatUrl is required in configuration');
    }

    this.config = {
      containerId: config.containerId || 'n8n-chat-container',
      title: config.title || 'Chat',
      placeholder: config.placeholder || 'Type your message...',
      showTimestamp: config.showTimestamp || false,
      theme: config.theme || {},
      button: {
        enabled: config.button?.enabled !== false, // Default true
        icon: config.button?.icon || null,
        radius: config.button?.radius || '50%',
        border: config.button?.border || 'none',
        shadow: config.button?.shadow || '0 4px 12px rgba(0, 0, 0, 0.15)',
        background: config.button?.background || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }
    };

    // Initialize the chat client
    this.client = new N8NChatClient({
      chatUrl: config.chatUrl,
      headers: config.headers,
      timeout: config.timeout,
      onMessage: (data) => this.handleBotMessage(data),
      onError: (error) => this.handleError(error)
    });

    this.isWaitingForResponse = false;
    this.isChatOpen = false;
    this.container = null;
    this.messagesContainer = null;
    this.inputField = null;
    this.toggleButton = null;
    this.chatWidget = null;
  }

  /**
   * Initialize and render the chat UI
   */
  init() {
    this.createChatUI();
    if (this.config.button.enabled) {
      this.createToggleButton();
    }
    this.attachEventListeners();
  }

  /**
   * Create the chat UI HTML structure
   */
  createChatUI() {
    let container = document.getElementById(this.config.containerId);
    
    // Auto-create container if it doesn't exist
    if (!container) {
      container = document.createElement('div');
      container.id = this.config.containerId;
      container.className = 'n8n-chat-auto-container';
      document.body.appendChild(container);
    }

    this.container = container;
    
    // Inject CSS
    this.injectStyles();

    // Create chat UI
    container.innerHTML = `
      <div class="n8n-chat-widget" id="n8n-chat-widget">
        <div class="n8n-chat-header">
          <h3 class="n8n-chat-title">${this.config.title}</h3>
          <div class="n8n-chat-header-actions">
            <button class="n8n-chat-reset" id="n8n-reset-btn" title="Reset conversation">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M13.65 2.35C12.2 0.9 10.21 0 8 0 3.58 0 0.01 3.58 0.01 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L9 7h7V0l-2.35 2.35z" fill="currentColor"/>
              </svg>
            </button>
            ${this.config.button.enabled ? `
            <button class="n8n-chat-close" id="n8n-close-btn" title="Close chat">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12.854 3.146a.5.5 0 0 1 0 .708L8.707 8l4.147 4.146a.5.5 0 0 1-.708.708L8 8.707l-4.146 4.147a.5.5 0 0 1-.708-.708L7.293 8 3.146 3.854a.5.5 0 1 1 .708-.708L8 7.293l4.146-4.147a.5.5 0 0 1 .708 0z" fill="currentColor"/>
              </svg>
            </button>
            ` : ''}
          </div>
        </div>
        <div class="n8n-chat-messages" id="n8n-messages"></div>
        <div class="n8n-chat-input-wrapper">
          <input 
            type="text" 
            class="n8n-chat-input" 
            id="n8n-input" 
            placeholder="${this.config.placeholder}"
            autocomplete="off"
          />
          <button class="n8n-chat-send" id="n8n-send-btn">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M2.01 1L2 8l13 2-13 2 .01 7L19 10 2.01 1z" fill="currentColor"/>
            </svg>
          </button>
        </div>
      </div>
    `;

    this.messagesContainer = document.getElementById('n8n-messages');
    this.inputField = document.getElementById('n8n-input');
    this.chatWidget = document.getElementById('n8n-chat-widget');
    
    // Hide chat widget initially if button is enabled
    if (this.config.button.enabled) {
      this.chatWidget.style.display = 'none';
    }
  }

  /**
   * Create toggle button
   */
  createToggleButton() {
    const button = document.createElement('button');
    button.id = 'n8n-toggle-btn';
    button.className = 'n8n-chat-toggle-btn';
    button.title = 'Open chat';
    button.setAttribute('aria-label', 'Open chat');
    
    // Apply custom styles
    button.style.borderRadius = this.config.button.radius;
    button.style.border = this.config.button.border;
    button.style.boxShadow = this.config.button.shadow;
    button.style.background = this.config.button.background;
    
    // Use custom icon or default
    const defaultIcon = `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z" fill="white"/>
      </svg>
    `;
    
    button.innerHTML = this.config.button.icon || defaultIcon;
    
    // Add to container or body
    if (this.container.classList.contains('n8n-chat-auto-container')) {
      this.container.appendChild(button);
    } else {
      // If custom container, add button to body at fixed position
      button.classList.add('n8n-chat-toggle-btn-fixed');
      document.body.appendChild(button);
    }
    
    this.toggleButton = button;
    
    // Add click handler
    button.addEventListener('click', () => this.toggleChat());
  }

  /**
   * Inject CSS styles for the chat UI
   */
  injectStyles() {
    const styleId = 'n8n-chat-styles';
    if (document.getElementById(styleId)) {
      return; // Styles already injected
    }

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      .n8n-chat-auto-container {
        position: fixed;
        bottom: 20px;
        right: 20px;
        z-index: 9999;
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        gap: 10px;
      }

      .n8n-chat-widget {
        display: flex;
        flex-direction: column;
        height: 600px;
        max-height: 80vh;
        width: 100%;
        max-width: 400px;
        border-radius: 12px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
        overflow: hidden;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
        background: #fff;
      }

      .n8n-chat-header {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 16px 20px;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .n8n-chat-title {
        margin: 0;
        font-size: 18px;
        font-weight: 600;
      }

      .n8n-chat-header-actions {
        display: flex;
        gap: 8px;
      }

      .n8n-chat-reset,
      .n8n-chat-close {
        background: rgba(255, 255, 255, 0.2);
        border: none;
        color: white;
        padding: 8px;
        border-radius: 6px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background 0.2s;
      }

      .n8n-chat-reset:hover,
      .n8n-chat-close:hover {
        background: rgba(255, 255, 255, 0.3);
      }

      .n8n-chat-messages {
        flex: 1;
        overflow-y: auto;
        padding: 20px;
        background: #f7f8fc;
      }

      .n8n-chat-message {
        margin-bottom: 16px;
        display: flex;
        flex-direction: column;
        animation: slideIn 0.3s ease-out;
      }

      @keyframes slideIn {
        from {
          opacity: 0;
          transform: translateY(10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      .n8n-chat-message.user {
        align-items: flex-end;
      }

      .n8n-chat-message.bot {
        align-items: flex-start;
      }

      .n8n-chat-bubble {
        max-width: 80%;
        padding: 12px 16px;
        border-radius: 18px;
        word-wrap: break-word;
        line-height: 1.4;
      }

      .n8n-chat-message.user .n8n-chat-bubble {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border-bottom-right-radius: 4px;
      }

      .n8n-chat-message.bot .n8n-chat-bubble {
        background: white;
        color: #333;
        border-bottom-left-radius: 4px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      }

      .n8n-chat-timestamp {
        font-size: 11px;
        color: #999;
        margin-top: 4px;
        padding: 0 8px;
      }

      .n8n-chat-typing {
        display: flex;
        gap: 4px;
        padding: 12px 16px;
      }

      .n8n-chat-typing span {
        width: 8px;
        height: 8px;
        background: #999;
        border-radius: 50%;
        animation: typing 1.4s infinite;
      }

      .n8n-chat-typing span:nth-child(2) {
        animation-delay: 0.2s;
      }

      .n8n-chat-typing span:nth-child(3) {
        animation-delay: 0.4s;
      }

      @keyframes typing {
        0%, 60%, 100% {
          transform: translateY(0);
          opacity: 0.5;
        }
        30% {
          transform: translateY(-10px);
          opacity: 1;
        }
      }

      .n8n-chat-input-wrapper {
        display: flex;
        padding: 16px;
        background: white;
        border-top: 1px solid #e5e7eb;
        gap: 8px;
      }

      .n8n-chat-input {
        flex: 1;
        padding: 12px 16px;
        border: 1px solid #e5e7eb;
        border-radius: 24px;
        font-size: 14px;
        outline: none;
        transition: border-color 0.2s;
      }

      .n8n-chat-input:focus {
        border-color: #667eea;
      }

      .n8n-chat-send {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border: none;
        color: white;
        padding: 12px 16px;
        border-radius: 24px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: transform 0.2s, opacity 0.2s;
      }

      .n8n-chat-send:hover:not(:disabled) {
        transform: scale(1.05);
      }

      .n8n-chat-send:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      .n8n-chat-error {
        background: #fee;
        color: #c33;
        padding: 8px 12px;
        border-radius: 8px;
        font-size: 13px;
        margin: 8px;
        text-align: center;
      }

      /* Toggle Button Styles */
      .n8n-chat-toggle-btn {
        width: 60px;
        height: 60px;
        border: none;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: transform 0.3s ease, box-shadow 0.3s ease;
        z-index: 10000;
      }

      .n8n-chat-auto-container .n8n-chat-toggle-btn {
        position: absolute;
        bottom: 0;
        right: 0;
      }

      .n8n-chat-toggle-btn-fixed {
        position: fixed !important;
        bottom: 20px;
        right: 20px;
      }

      .n8n-chat-toggle-btn:hover {
        transform: scale(1.1);
      }

      .n8n-chat-toggle-btn:active {
        transform: scale(0.95);
      }

      .n8n-chat-toggle-btn svg {
        pointer-events: none;
      }

      /* Chat widget visibility and animation */
      .n8n-chat-widget {
        animation: slideUp 0.3s ease-out;
      }

      @keyframes slideUp {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      .n8n-chat-widget.n8n-chat-hiding {
        animation: slideDown 0.3s ease-out;
      }

      @keyframes slideDown {
        from {
          opacity: 1;
          transform: translateY(0);
        }
        to {
          opacity: 0;
          transform: translateY(20px);
        }
      }
    `;

    document.head.appendChild(style);
  }

  /**
   * Attach event listeners
   */
  attachEventListeners() {
    const sendBtn = document.getElementById('n8n-send-btn');
    const resetBtn = document.getElementById('n8n-reset-btn');
    const closeBtn = document.getElementById('n8n-close-btn');

    sendBtn.addEventListener('click', () => this.sendMessage());
    
    this.inputField.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && !this.isWaitingForResponse) {
        this.sendMessage();
      }
    });

    resetBtn.addEventListener('click', () => this.resetConversation());
    
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.closeChat());
    }
  }

  /**
   * Send a message
   */
  async sendMessage() {
    const message = this.inputField.value.trim();
    
    if (!message || this.isWaitingForResponse) {
      return;
    }

    // Clear input
    this.inputField.value = '';
    
    // Add user message to UI
    this.addMessage(message, 'user');
    
    // Show typing indicator
    this.showTypingIndicator();
    
    // Disable input
    this.setInputState(false);

    try {
      await this.client.sendMessage(message);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  }

  /**
   * Handle bot message response
   */
  handleBotMessage(data) {
    this.hideTypingIndicator();
    const message = this.client.extractMessage(data);
    this.addMessage(message, 'bot');
    this.setInputState(true);
  }

  /**
   * Handle error
   */
  handleError(error) {
    this.hideTypingIndicator();
    this.showError('Failed to send message. Please try again.');
    this.setInputState(true);
  }

  /**
   * Add a message to the chat
   */
  addMessage(text, type) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `n8n-chat-message ${type}`;
    
    const bubble = document.createElement('div');
    bubble.className = 'n8n-chat-bubble';
    bubble.textContent = text;
    
    messageDiv.appendChild(bubble);

    if (this.config.showTimestamp) {
      const timestamp = document.createElement('div');
      timestamp.className = 'n8n-chat-timestamp';
      timestamp.textContent = new Date().toLocaleTimeString();
      messageDiv.appendChild(timestamp);
    }

    this.messagesContainer.appendChild(messageDiv);
    this.scrollToBottom();
  }

  /**
   * Show typing indicator
   */
  showTypingIndicator() {
    const typingDiv = document.createElement('div');
    typingDiv.className = 'n8n-chat-message bot';
    typingDiv.id = 'n8n-typing-indicator';
    typingDiv.innerHTML = `
      <div class="n8n-chat-bubble">
        <div class="n8n-chat-typing">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    `;
    this.messagesContainer.appendChild(typingDiv);
    this.scrollToBottom();
  }

  /**
   * Hide typing indicator
   */
  hideTypingIndicator() {
    const typingIndicator = document.getElementById('n8n-typing-indicator');
    if (typingIndicator) {
      typingIndicator.remove();
    }
  }

  /**
   * Show error message
   */
  showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'n8n-chat-error';
    errorDiv.textContent = message;
    this.messagesContainer.appendChild(errorDiv);
    this.scrollToBottom();
    
    // Remove error after 5 seconds
    setTimeout(() => errorDiv.remove(), 5000);
  }

  /**
   * Set input state (enabled/disabled)
   */
  setInputState(enabled) {
    this.isWaitingForResponse = !enabled;
    this.inputField.disabled = !enabled;
    document.getElementById('n8n-send-btn').disabled = !enabled;
    
    if (enabled) {
      this.inputField.focus();
    }
  }

  /**
   * Scroll to bottom of messages
   */
  scrollToBottom() {
    this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
  }

  /**
   * Reset conversation
   */
  resetConversation() {
    if (confirm('Are you sure you want to reset the conversation?')) {
      this.client.resetSession();
      this.messagesContainer.innerHTML = '';
      this.inputField.value = '';
      this.setInputState(true);
    }
  }

  /**
   * Toggle chat visibility
   */
  toggleChat() {
    if (this.isChatOpen) {
      this.closeChat();
    } else {
      this.openChat();
    }
  }

  /**
   * Open chat window
   */
  openChat() {
    if (!this.chatWidget || this.isChatOpen) return;
    
    this.chatWidget.style.display = 'flex';
    this.chatWidget.classList.remove('n8n-chat-hiding');
    this.isChatOpen = true;
    
    // Hide toggle button
    if (this.toggleButton) {
      this.toggleButton.style.display = 'none';
    }
    
    // Focus input
    if (this.inputField) {
      setTimeout(() => this.inputField.focus(), 100);
    }
  }

  /**
   * Close chat window
   */
  closeChat() {
    if (!this.chatWidget || !this.isChatOpen) return;
    
    this.chatWidget.classList.add('n8n-chat-hiding');
    
    // Wait for animation to complete
    setTimeout(() => {
      this.chatWidget.style.display = 'none';
      this.chatWidget.classList.remove('n8n-chat-hiding');
      this.isChatOpen = false;
      
      // Show toggle button
      if (this.toggleButton) {
        this.toggleButton.style.display = 'flex';
      }
    }, 300);
  }

  /**
   * Get chat client instance
   */
  getClient() {
    return this.client;
  }
}

// Export for different module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = N8NChatUI;
}

if (typeof window !== 'undefined') {
  window.N8NChatUI = N8NChatUI;
  
  // Auto-initialization support
  // Users can set window.N8N_CHAT_CONFIG before or after loading the script
  function autoInitChat() {
    if (window.N8N_CHAT_CONFIG && window.N8N_CHAT_CONFIG.chatUrl) {
      const chat = new N8NChatUI(window.N8N_CHAT_CONFIG);
      chat.init();
      window.n8nChat = chat; // Expose instance globally
    }
  }
  
  // Try to auto-initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', autoInitChat);
  } else {
    // DOM already loaded
    autoInitChat();
  }
}

