/**
 * N8N Chat Widget - Complete Library
 * A simple JavaScript library to integrate n8n chat workflows into web applications
 * Includes both the chat client and UI components
 * @version 1.0.0
 */

// ============================================================================
// N8N CHAT CLIENT
// ============================================================================

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
   * @param {Array} metadata.files - Array of uploaded file objects (optional)
   * @param {string} metadata.files[].name - File name
   * @param {number} metadata.files[].size - File size in bytes
   * @param {string} metadata.files[].type - File MIME type
   * @param {string} metadata.files[].url - File download URL
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

    // Include file information if files are attached
    if (metadata.files && metadata.files.length > 0) {
      payload.files = metadata.files.map(file => ({
        name: file.name,
        size: file.size,
        type: file.type,
        url: file.url,
        originalName: file.name
      }));
      payload.hasFiles = true;
      payload.fileCount = metadata.files.length;
      
      // Log file information for debugging
      console.log('Sending message with files:', {
        fileCount: payload.fileCount,
        files: payload.files
      });
    }

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

// ============================================================================
// N8N CHAT UI
// ============================================================================

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
   * @param {Object} config.footer - Footer configuration (optional)
   * @param {boolean} config.footer.enabled - Enable footer (default: false)
   * @param {string} config.footer.html - Custom HTML content for footer (optional)
   * @param {string} config.footer.background - Footer background color (optional)
   * @param {string} config.footer.color - Footer text color (optional)
   * @param {string} config.footer.fontSize - Footer font size (optional)
   * @param {string} config.footer.padding - Footer padding (optional)
   * @param {string} config.footer.borderTop - Footer top border (optional)
   * @param {Object} config.voice - Voice input configuration (optional)
   * @param {boolean} config.voice.enabled - Enable voice input (default: false)
   * @param {string} config.voice.language - Speech recognition language (default: 'en-US')
   * @param {boolean} config.voice.continuous - Continuous recognition (default: false)
   * @param {boolean} config.voice.interimResults - Show interim results (default: true)
   * @param {number} config.voice.maxAlternatives - Max alternatives (default: 1)
   * @param {Object} config.fileUpload - File upload configuration (optional)
   * @param {boolean} config.fileUpload.enabled - Enable file upload (default: false)
   * @param {number} config.fileUpload.maxFileSize - Maximum file size in bytes (default: 10MB)
   * @param {Array} config.fileUpload.allowedTypes - Allowed file types (default: ['image/*', 'application/pdf', 'text/*'])
   * @param {number} config.fileUpload.maxFiles - Maximum number of files (default: 5)
   * @param {string} config.fileUpload.uploadUrl - Upload endpoint URL (required if enabled)
   * @param {string} config.fileUpload.downloadUrl - Download base URL (required if enabled)
   * @param {boolean} config.fileUpload.showPreview - Show file previews (default: true)
   * @param {Object} config.window - Chat window configuration (optional)
   * @param {string} config.window.width - Window width (default: '400px')
   * @param {string} config.window.height - Window height (default: '600px')
   * @param {string} config.window.maxWidth - Maximum width (default: '400px')
   * @param {string} config.window.maxHeight - Maximum height (default: '80vh')
   * @param {string} config.window.minWidth - Minimum width (default: '300px')
   * @param {string} config.window.minHeight - Minimum height (default: '400px')
   * @param {string} config.window.borderRadius - Border radius (default: '12px')
   * @param {string} config.window.boxShadow - Box shadow (default: '0 4px 20px rgba(0, 0, 0, 0.15)')
   * @param {string} config.window.border - Border style (default: 'none')
   * @param {string} config.window.position - Position type (default: 'fixed')
   * @param {number} config.window.zIndex - Z-index (default: 9999)
   */
  constructor(config) {
    if (!config || !config.chatUrl) {
      throw new Error('chatUrl is required in configuration');
    }

    this.config = {
      containerId: config.containerId || 'n8n-chat-container',
      title: config.title || 'Chat',
      titleIcon: config.titleIcon || null,
      placeholder: config.placeholder || 'Type your message...',
      maxInputHeight: config.maxInputHeight || 120,
      showTimestamp: config.showTimestamp || false,
      theme: {
        primaryColor: config.theme?.primaryColor || '#667eea',
        secondaryColor: config.theme?.secondaryColor || '#764ba2',
        userMessageBg: config.theme?.userMessageBg || null, // Will use gradient if null
        botMessageBg: config.theme?.botMessageBg || '#ffffff',
        userMessageColor: config.theme?.userMessageColor || '#ffffff',
        botMessageColor: config.theme?.botMessageColor || '#333333',
        headerBg: config.theme?.headerBg || null, // Will use gradient if null
        headerColor: config.theme?.headerColor || '#ffffff',
        chatBg: config.theme?.chatBg || '#f7f8fc',
        inputBorder: config.theme?.inputBorder || '#e5e7eb',
        fontFamily: config.theme?.fontFamily || '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
      },
      welcomeMessage: config.welcomeMessage || 'Hello! How can I help you today? 👋',
      starterPrompts: config.starterPrompts || [],
      avatars: {
        bot: config.avatars?.bot || null,
        user: config.avatars?.user || null,
        enabled: config.avatars?.enabled !== false // Default true
      },
      button: {
        enabled: config.button?.enabled !== false, // Default true
        icon: config.button?.icon || null,
        radius: config.button?.radius || '50%',
        border: config.button?.border || 'none',
        shadow: config.button?.shadow || '0 4px 12px rgba(0, 0, 0, 0.15)',
        background: config.button?.background || 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      },
      tip: {
        enabled: config.tip?.enabled !== false, // Default true
        text: config.tip?.text || 'Need help? Chat with us!',
        delay: config.tip?.delay || 2000,
        autoHide: config.tip?.autoHide !== false, // Default true
        background: config.tip?.background || '#ffffff',
        color: config.tip?.color || '#333333',
        shadow: config.tip?.shadow || '0 4px 16px rgba(0, 0, 0, 0.15)'
      },
      footer: {
        enabled: config.footer?.enabled || false, // Default false
        html: config.footer?.html || '',
        background: config.footer?.background || '#f9fafb',
        color: config.footer?.color || '#6b7280',
        fontSize: config.footer?.fontSize || '12px',
        padding: config.footer?.padding || '12px 16px',
        borderTop: config.footer?.borderTop || '1px solid #e5e7eb'
      },
      voice: {
        enabled: config.voice?.enabled || false, // Default false
        language: config.voice?.language || 'en-US',
        continuous: config.voice?.continuous || false,
        interimResults: config.voice?.interimResults || true,
        maxAlternatives: config.voice?.maxAlternatives || 1
      },
      fileUpload: {
        enabled: config.fileUpload?.enabled || false, // Default false
        maxFileSize: config.fileUpload?.maxFileSize || 10 * 1024 * 1024, // 10MB default
        allowedTypes: config.fileUpload?.allowedTypes || ['image/*', 'application/pdf', 'text/*'],
        maxFiles: config.fileUpload?.maxFiles || 5,
        uploadUrl: config.fileUpload?.uploadUrl || null, // Required if enabled
        downloadUrl: config.fileUpload?.downloadUrl || null, // Required if enabled
        showPreview: config.fileUpload?.showPreview !== false // Default true
      },
      window: {
        width: config.window?.width || '400px',
        height: config.window?.height || '600px',
        maxWidth: config.window?.maxWidth || '400px',
        maxHeight: config.window?.maxHeight || '80vh',
        minWidth: config.window?.minWidth || '300px',
        minHeight: config.window?.minHeight || '400px',
        borderRadius: config.window?.borderRadius || '12px',
        boxShadow: config.window?.boxShadow || '0 4px 20px rgba(0, 0, 0, 0.15)',
        border: config.window?.border || 'none',
        position: config.window?.position || 'fixed', // fixed, absolute, relative
        zIndex: config.window?.zIndex || 9999
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
    this.tipElement = null;
    this.tipShown = false;
    this.welcomeMessageShown = false;
    this.starterPromptsContainer = null;
    this.starterPromptsShown = false;
    this.defaultButtonIcon = null; // Store the default icon
    this.scrollToBottomButton = null; // Scroll to bottom button
    this.voiceInputEnabled = false; // Voice input state
    this.recognition = null; // Speech recognition instance
    this.fileInput = null; // File input element
    this.uploadedFiles = []; // Array to store uploaded files
    this.swipeInitialized = false; // Swipe functionality initialized
    this.currentImageIndex = 0; // Current image index for swiping
    this.mediaRecorder = null; // Media recorder for voice recording
    this.audioChunks = []; // Audio chunks for recording
    this.isRecording = false; // Recording state
  }

  /**
   * Initialize and render the chat UI
   */
  init() {
    this.createChatUI();
    if (this.config.button.enabled) {
      this.createToggleButton();
      if (this.config.tip.enabled) {
        this.createTip();
      }
    } else {
      // If button is disabled, chat is always visible, show welcome message
      this.showWelcomeMessage();
    }
    this.attachEventListeners();
  }

  /**
   * Generate title icon HTML
   */
  generateTitleIconHTML() {
    if (!this.config.titleIcon) return '';
    
    const iconContent = this.config.titleIcon;
    
    // Check if it's an image URL
    if (iconContent.startsWith('http://') || 
        iconContent.startsWith('https://') || 
        iconContent.startsWith('/') || 
        iconContent.startsWith('data:')) {
      // It's an image URL - create img tag
      return `<span class="n8n-chat-title-icon"><img src="${iconContent}" alt="Chat icon" class="n8n-chat-title-icon-img" /></span>`;
    }
    
    // It's emoji or HTML/SVG - use as-is
    return `<span class="n8n-chat-title-icon">${iconContent}</span>`;
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
          <div class="n8n-chat-title-wrapper">
            ${this.generateTitleIconHTML()}
            <h3 class="n8n-chat-title">${this.config.title}</h3>
          </div>
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
        <div class="n8n-chat-messages-wrapper">
          <div class="n8n-chat-messages" id="n8n-messages"></div>
          <button class="n8n-scroll-to-bottom" id="n8n-scroll-to-bottom" title="Scroll to bottom" style="display: none;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M7 10l5 5 5-5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>
        <div class="n8n-chat-input-wrapper">
          <textarea 
            class="n8n-chat-input" 
            id="n8n-input" 
            placeholder="${this.config.placeholder}"
            autocomplete="off"
            rows="1"
          ></textarea>
          ${this.config.voice.enabled ? `
          <button class="n8n-chat-voice" id="n8n-voice-btn" title="Voice message">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" fill="currentColor"/>
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <line x1="12" y1="19" x2="12" y2="23" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              <line x1="8" y1="23" x2="16" y2="23" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </button>
          ` : ''}
          ${this.config.fileUpload.enabled ? `
          <button class="n8n-chat-upload" id="n8n-upload-btn" title="Upload file">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <polyline points="7,10 12,15 17,10" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <line x1="12" y1="15" x2="12" y2="3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </button>
          <input type="file" id="n8n-file-input" style="display: none;" multiple accept="${this.config.fileUpload.allowedTypes.join(',')}">
          ` : ''}
          <button class="n8n-chat-send" id="n8n-send-btn">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M2.01 1L2 8l13 2-13 2 .01 7L19 10 2.01 1z" fill="currentColor"/>
            </svg>
          </button>
        </div>
        ${this.config.footer.enabled ? `
        <div class="n8n-chat-footer" id="n8n-chat-footer">
          ${this.config.footer.html}
        </div>
        ` : ''}
      </div>
    `;

    this.messagesContainer = document.getElementById('n8n-messages');
    this.inputField = document.getElementById('n8n-input');
    this.chatWidget = document.getElementById('n8n-chat-widget');
    this.scrollToBottomButton = document.getElementById('n8n-scroll-to-bottom');
    this.voiceButton = document.getElementById('n8n-voice-btn');
    this.uploadButton = document.getElementById('n8n-upload-btn');
    this.fileInput = document.getElementById('n8n-file-input');
    
    // Initialize voice recognition if enabled
    if (this.config.voice.enabled) {
      this.initializeVoiceRecognition();
    }
    
    // Initialize file upload if enabled
    if (this.config.fileUpload.enabled) {
      this.initializeFileUpload();
    }
    
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
    
    // Store the default icon for later use
    this.defaultButtonIcon = this.config.button.icon || defaultIcon;
    button.innerHTML = this.defaultButtonIcon;
    
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
    button.addEventListener('click', () => {
      this.toggleChat();
      // Hide tip on first interaction if autoHide is enabled
      if (this.config.tip.autoHide && this.tipElement) {
        this.hideTip();
      }
    });
  }

  /**
   * Create tip/tooltip element
   */
  createTip() {
    const tip = document.createElement('div');
    tip.id = 'n8n-chat-tip';
    tip.className = 'n8n-chat-tip';
    tip.style.background = this.config.tip.background;
    tip.style.color = this.config.tip.color;
    tip.style.boxShadow = this.config.tip.shadow;
    tip.style.display = 'none'; // Initially hidden
    
    // Create tip content
    const tipText = document.createElement('span');
    tipText.className = 'n8n-chat-tip-text';
    tipText.textContent = this.config.tip.text;
    tip.appendChild(tipText);
    
    // Create close button
    const closeBtn = document.createElement('button');
    closeBtn.className = 'n8n-chat-tip-close';
    closeBtn.innerHTML = '×';
    closeBtn.title = 'Close';
    closeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.hideTip();
    });
    tip.appendChild(closeBtn);
    
    // Add to container
    if (this.container.classList.contains('n8n-chat-auto-container')) {
      this.container.appendChild(tip);
    } else {
      // If custom container, add tip to body at fixed position
      tip.classList.add('n8n-chat-tip-fixed');
      document.body.appendChild(tip);
    }
    
    this.tipElement = tip;
    
    // Show tip after delay
    setTimeout(() => {
      if (this.tipElement && !this.isChatOpen && !this.tipShown) {
        this.showTip();
      }
    }, this.config.tip.delay);
  }

  /**
   * Show tip
   */
  showTip() {
    if (this.tipElement && !this.tipShown) {
      this.tipElement.style.display = 'flex';
      this.tipElement.classList.add('n8n-chat-tip-show');
      this.tipShown = true;
    }
  }

  /**
   * Hide tip
   */
  hideTip() {
    if (this.tipElement) {
      this.tipElement.classList.remove('n8n-chat-tip-show');
      this.tipElement.classList.add('n8n-chat-tip-hide');
      setTimeout(() => {
        if (this.tipElement) {
          this.tipElement.style.display = 'none';
          this.tipElement.classList.remove('n8n-chat-tip-hide');
        }
      }, 300);
    }
  }

  /**
   * Inject CSS styles for the chat UI
   */
  injectStyles() {
    const styleId = 'n8n-chat-styles';
    if (document.getElementById(styleId)) {
      return; // Styles already injected
    }

    // Generate gradients from theme
    const headerBg = this.config.theme.headerBg || 
      `linear-gradient(135deg, ${this.config.theme.primaryColor} 0%, ${this.config.theme.secondaryColor} 100%)`;
    const userMessageBg = this.config.theme.userMessageBg || 
      `linear-gradient(135deg, ${this.config.theme.primaryColor} 0%, ${this.config.theme.secondaryColor} 100%)`;

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
        justify-content: flex-end;
      }

      /* Ensure chat widget appears above button when open */
      .n8n-chat-auto-container .n8n-chat-widget {
        position: relative;
        margin-bottom: 10px;
      }

      .n8n-chat-widget {
        display: flex;
        flex-direction: column;
        width: ${this.config.window.width};
        height: ${this.config.window.height};
        max-width: ${this.config.window.maxWidth};
        max-height: ${this.config.window.maxHeight};
        min-width: ${this.config.window.minWidth};
        min-height: ${this.config.window.minHeight};
        border-radius: ${this.config.window.borderRadius};
        box-shadow: ${this.config.window.boxShadow};
        border: ${this.config.window.border};
        position: ${this.config.window.position};
        z-index: ${this.config.window.zIndex};
        overflow: hidden;
        font-family: ${this.config.theme.fontFamily};
        background: #fff;
      }

      .n8n-chat-header {
        background: ${headerBg};
        color: ${this.config.theme.headerColor};
        padding: 16px 20px;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .n8n-chat-title-wrapper {
        display: flex;
        align-items: center;
        gap: 10px;
      }

      .n8n-chat-title-icon {
        font-size: 24px;
        line-height: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        min-width: 24px;
        height: 24px;
      }

      .n8n-chat-title-icon-img {
        width: 24px;
        height: 24px;
        object-fit: contain;
        border-radius: 4px;
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

      .n8n-chat-messages-wrapper {
        flex: 1;
        position: relative;
        overflow: hidden;
        background: ${this.config.theme.chatBg};
      }

      .n8n-chat-messages {
        height: 100%;
        overflow-y: auto;
        padding: 20px;
        background: ${this.config.theme.chatBg};
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

      .n8n-chat-message-content {
        display: flex;
        gap: 8px;
        align-items: flex-end;
        max-width: 85%;
      }

      .n8n-chat-message.user .n8n-chat-message-content {
        flex-direction: row-reverse;
      }

      .n8n-chat-message.bot .n8n-chat-message-content {
        flex-direction: row;
      }

      .n8n-chat-bubble-wrapper {
        display: flex;
        flex-direction: column;
      }

      .n8n-chat-bubble {
        padding: 12px 16px;
        border-radius: 18px;
        word-wrap: break-word;
        line-height: 1.4;
      }

      .n8n-chat-message.user .n8n-chat-bubble {
        background: ${userMessageBg};
        color: ${this.config.theme.userMessageColor};
        border-bottom-right-radius: 4px;
      }

      .n8n-chat-message.bot .n8n-chat-bubble {
        background: ${this.config.theme.botMessageBg};
        color: ${this.config.theme.botMessageColor};
        border-bottom-left-radius: 4px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      }

      .n8n-chat-timestamp {
        font-size: 11px;
        color: #999;
        margin-top: 4px;
        padding: 0 8px;
      }

      /* Avatar Styles */
      .n8n-chat-avatar {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        font-size: 18px;
        background: #f0f0f0;
      }

      .n8n-chat-avatar-bot {
        background: ${userMessageBg};
        color: white;
      }

      .n8n-chat-avatar-user {
        background: #e5e7eb;
        color: #666;
      }

      .n8n-chat-avatar-img {
        width: 100%;
        height: 100%;
        border-radius: 50%;
        object-fit: cover;
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
        flex-shrink: 0;
      }

      .n8n-chat-input {
        flex: 1;
        padding: 12px 16px;
        border: 1px solid ${this.config.theme.inputBorder};
        border-radius: 24px;
        font-size: 14px;
        outline: none;
        transition: border-color 0.2s;
        font-family: ${this.config.theme.fontFamily};
        resize: none;
        overflow-y: auto;
        max-height: ${this.config.maxInputHeight}px;
        min-height: 20px;
        line-height: 1.4;
      }

      .n8n-chat-input:focus {
        border-color: ${this.config.theme.primaryColor};
      }

      .n8n-chat-input::-webkit-scrollbar {
        width: 6px;
      }

      .n8n-chat-input::-webkit-scrollbar-track {
        background: transparent;
      }

      .n8n-chat-input::-webkit-scrollbar-thumb {
        background: #ccc;
        border-radius: 3px;
      }

      .n8n-chat-input::-webkit-scrollbar-thumb:hover {
        background: #aaa;
      }

      .n8n-chat-send {
        background: ${userMessageBg};
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

      /* Voice Input Button Styles */
      .n8n-chat-voice {
        background: #6b7280;
        border: none;
        color: white;
        padding: 12px 16px;
        border-radius: 24px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s ease;
        margin-right: 8px;
      }

      .n8n-chat-voice:hover:not(:disabled) {
        background: #4b5563;
        transform: scale(1.05);
      }

      .n8n-chat-voice:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      .n8n-chat-voice.n8n-voice-recording {
        background: #ef4444;
        animation: voicePulse 1.5s infinite;
      }

      .n8n-chat-voice.n8n-voice-recording:hover {
        background: #dc2626;
      }

      @keyframes voicePulse {
        0%, 100% {
          transform: scale(1);
        }
        50% {
          transform: scale(1.1);
        }
      }

      /* File Upload Button Styles */
      .n8n-chat-upload {
        background: #10b981;
        border: none;
        color: white;
        padding: 12px 16px;
        border-radius: 24px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s ease;
        margin-right: 8px;
      }

      .n8n-chat-upload:hover:not(:disabled) {
        background: #059669;
        transform: scale(1.05);
      }

      .n8n-chat-upload:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      /* Drag and Drop Styles */
      .n8n-chat-input.n8n-drag-over {
        border-color: #10b981 !important;
        background-color: #f0fdf4 !important;
      }

      /* File Preview Styles */
      .n8n-file-preview {
        padding: 8px 16px;
        background: #f9fafb;
        border-top: 1px solid #e5e7eb;
        border-bottom: 1px solid #e5e7eb;
        position: relative;
        overflow: hidden;
      }

      .n8n-file-preview-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 8px 12px;
        background: white;
        border: 1px solid #e5e7eb;
        border-radius: 8px;
        margin-bottom: 4px;
        position: relative;
      }

      .n8n-file-preview-item:last-child {
        margin-bottom: 0;
      }

      /* Image preview item */
      .n8n-file-preview-image-item {
        flex-direction: column;
        align-items: flex-start;
      }

      .n8n-file-preview-image-container {
        position: relative;
        width: 100%;
        margin-bottom: 8px;
        border-radius: 8px;
        overflow: hidden;
        background: #f5f5f5;
        min-height: 120px;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .n8n-file-preview-swipe-container {
        position: relative;
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: grab;
        user-select: none;
      }

      .n8n-file-preview-swipe-container:active {
        cursor: grabbing;
      }

      .n8n-file-preview-swipe-controls {
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        width: 100%;
        display: flex;
        justify-content: space-between;
        pointer-events: none;
        z-index: 2;
      }

      .n8n-file-preview-swipe-btn {
        background: rgba(0, 0, 0, 0.6);
        color: white;
        border: none;
        border-radius: 50%;
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 18px;
        font-weight: bold;
        cursor: pointer;
        pointer-events: auto;
        transition: all 0.2s ease;
        opacity: 0.8;
      }

      .n8n-file-preview-swipe-btn:hover {
        background: rgba(0, 0, 0, 0.8);
        opacity: 1;
        transform: scale(1.1);
      }

      .n8n-file-preview-swipe-left {
        margin-left: 8px;
      }

      .n8n-file-preview-swipe-right {
        margin-right: 8px;
      }

      .n8n-file-preview-indicators {
        position: absolute;
        bottom: 8px;
        left: 50%;
        transform: translateX(-50%);
        display: flex;
        gap: 4px;
        z-index: 2;
      }

      .n8n-file-preview-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.5);
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .n8n-file-preview-dot.active {
        background: rgba(255, 255, 255, 0.9);
        transform: scale(1.2);
      }

      .n8n-file-preview-dot:hover {
        background: rgba(255, 255, 255, 0.8);
      }

      .n8n-file-preview-image {
        max-width: 100%;
        max-height: 200px;
        object-fit: contain;
        border-radius: 4px;
      }

      .n8n-file-preview-loading {
        color: #666;
        font-size: 14px;
        text-align: center;
      }

      .n8n-file-preview-icon {
        font-size: 24px;
        margin-right: 12px;
        flex-shrink: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 40px;
        height: 40px;
        background: rgba(0, 0, 0, 0.1);
        border-radius: 8px;
      }

      .n8n-file-preview-info {
        display: flex;
        flex-direction: column;
        flex: 1;
      }

      .n8n-file-preview-name {
        font-size: 14px;
        font-weight: 500;
        color: #374151;
        margin-bottom: 2px;
      }

      .n8n-file-preview-size {
        font-size: 12px;
        color: #6b7280;
      }

      .n8n-file-preview-remove {
        background: #ef4444;
        color: white;
        border: none;
        border-radius: 50%;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        font-size: 16px;
        line-height: 1;
        transition: background 0.2s;
      }

      .n8n-file-preview-remove:hover {
        background: #dc2626;
      }

      /* File Attachment Styles */
      .n8n-chat-files {
        margin-top: 8px;
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .n8n-chat-file-attachment {
        display: flex;
        align-items: center;
        padding: 8px 12px;
        background: rgba(0, 0, 0, 0.05);
        border-radius: 8px;
        border: 1px solid rgba(0, 0, 0, 0.1);
        position: relative;
      }

      .n8n-chat-file-preview-container {
        position: relative;
        margin-right: 12px;
        flex-shrink: 0;
      }

      .n8n-chat-file-preview {
        width: 60px;
        height: 60px;
        object-fit: cover;
        border-radius: 8px;
        border: 1px solid rgba(0, 0, 0, 0.1);
        display: block;
      }

      .n8n-chat-file-icon {
        font-size: 20px;
        margin-right: 12px;
        flex-shrink: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 40px;
        height: 40px;
        background: rgba(0, 0, 0, 0.1);
        border-radius: 8px;
      }

      .n8n-chat-file-info {
        flex: 1;
        min-width: 0;
      }

      .n8n-chat-file-name {
        font-size: 14px;
        font-weight: 500;
        color: inherit;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        margin-bottom: 2px;
      }

      .n8n-chat-file-size {
        font-size: 12px;
        opacity: 0.7;
      }

      .n8n-chat-file-link {
        text-decoration: none;
        color: inherit;
        display: block;
      }

      .n8n-chat-file-link:hover {
        text-decoration: underline;
      }

      /* Voice Message Styles */
      .n8n-voice-bubble {
        background: #007bff;
        color: white;
        padding: 12px 16px;
        border-radius: 18px;
        max-width: 200px;
        min-width: 120px;
      }

      .n8n-voice-message {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .n8n-voice-controls {
        display: flex;
        align-items: center;
        gap: 8px;
        width: 100%;
      }

      .n8n-voice-play-btn {
        background: rgba(255, 255, 255, 0.2);
        border: none;
        border-radius: 50%;
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.2s ease;
        color: white;
        flex-shrink: 0;
      }

      .n8n-voice-play-btn:hover {
        background: rgba(255, 255, 255, 0.3);
        transform: scale(1.05);
      }

      .n8n-voice-play-btn.playing {
        background: rgba(255, 255, 255, 0.3);
      }

      .n8n-voice-waveform {
        display: flex;
        align-items: center;
        gap: 2px;
        flex: 1;
        height: 20px;
        justify-content: center;
      }

      .n8n-voice-wave {
        width: 3px;
        background: rgba(255, 255, 255, 0.6);
        border-radius: 2px;
        animation: voiceWave 1.5s ease-in-out infinite;
      }

      .n8n-voice-wave:nth-child(1) { height: 8px; animation-delay: 0s; }
      .n8n-voice-wave:nth-child(2) { height: 12px; animation-delay: 0.1s; }
      .n8n-voice-wave:nth-child(3) { height: 16px; animation-delay: 0.2s; }
      .n8n-voice-wave:nth-child(4) { height: 12px; animation-delay: 0.3s; }
      .n8n-voice-wave:nth-child(5) { height: 8px; animation-delay: 0.4s; }

      @keyframes voiceWave {
        0%, 100% { height: 8px; opacity: 0.6; }
        50% { height: 16px; opacity: 1; }
      }

      .n8n-voice-duration {
        font-size: 12px;
        color: rgba(255, 255, 255, 0.8);
        font-weight: 500;
        flex-shrink: 0;
      }

      /* Image preview styles */
      .n8n-chat-file-attachment:has(.n8n-chat-file-preview) {
        padding: 8px;
      }

      .n8n-chat-file-attachment:has(.n8n-chat-file-preview) .n8n-chat-file-preview-container {
        margin-right: 12px;
      }

      .n8n-chat-file-attachment:has(.n8n-chat-file-preview) .n8n-chat-file-icon {
        position: absolute;
        top: 4px;
        right: 4px;
        width: 24px;
        height: 24px;
        background: rgba(0, 0, 0, 0.7);
        color: white;
        border-radius: 4px;
        font-size: 12px;
        margin: 0;
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

      /* Footer Styles */
      .n8n-chat-footer {
        background: ${this.config.footer.background};
        color: ${this.config.footer.color};
        font-size: ${this.config.footer.fontSize};
        padding: ${this.config.footer.padding};
        border-top: ${this.config.footer.borderTop};
        text-align: center;
        line-height: 1.5;
        flex-shrink: 0;
      }

      .n8n-chat-footer a {
        color: ${this.config.theme.primaryColor};
        text-decoration: none;
        transition: opacity 0.2s;
      }

      .n8n-chat-footer a:hover {
        opacity: 0.7;
        text-decoration: underline;
      }

      /* Scroll to Bottom Button Styles */
      .n8n-scroll-to-bottom {
        position: absolute;
        bottom: 20px;
        right: 20px;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: ${userMessageBg};
        border: none;
        color: white;
        cursor: pointer;
        display: none;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        transition: all 0.3s ease;
        z-index: 10;
        animation: fadeIn 0.3s ease-out;
      }

      .n8n-scroll-to-bottom:hover {
        transform: scale(1.1);
        box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
      }

      .n8n-scroll-to-bottom:active {
        transform: scale(0.95);
      }

      @keyframes fadeIn {
        from {
          opacity: 0;
          transform: translateY(10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
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
        flex-shrink: 0;
      }

      .n8n-chat-auto-container .n8n-chat-toggle-btn {
        position: relative;
        flex-shrink: 0;
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

      /* Keep button visible when chat is open on desktop */
      .n8n-chat-toggle-btn-open {
        display: flex !important;
        position: relative !important;
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

      /* Tip/Tooltip Styles */
      .n8n-chat-tip {
        position: absolute;
        bottom: 70px;
        right: 0;
        background: white;
        color: #333;
        padding: 12px 40px 12px 16px;
        border-radius: 12px;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
        font-size: 14px;
        max-width: 250px;
        line-height: 1.4;
        display: none;
        align-items: center;
        z-index: 10001;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      }

      .n8n-chat-tip::before {
        content: '';
        position: absolute;
        bottom: -8px;
        right: 20px;
        width: 0;
        height: 0;
        border-left: 8px solid transparent;
        border-right: 8px solid transparent;
        border-top: 8px solid white;
        filter: drop-shadow(0 2px 3px rgba(0, 0, 0, 0.1));
      }

      .n8n-chat-tip-fixed {
        position: fixed !important;
        bottom: 90px;
        right: 20px;
      }

      .n8n-chat-tip-text {
        flex: 1;
      }

      .n8n-chat-tip-close {
        position: absolute;
        top: 8px;
        right: 8px;
        background: transparent;
        border: none;
        color: #999;
        font-size: 20px;
        line-height: 1;
        cursor: pointer;
        padding: 0;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: color 0.2s;
      }

      .n8n-chat-tip-close:hover {
        color: #333;
      }

      .n8n-chat-tip-show {
        animation: tipSlideIn 0.3s ease-out forwards;
      }

      .n8n-chat-tip-hide {
        animation: tipSlideOut 0.3s ease-out forwards;
      }

      @keyframes tipSlideIn {
        from {
          opacity: 0;
          transform: translateY(10px) scale(0.95);
        }
        to {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
      }

      @keyframes tipSlideOut {
        from {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
        to {
          opacity: 0;
          transform: translateY(10px) scale(0.95);
        }
      }

      /* Starter Prompts Styles */
      .n8n-starter-prompts {
        display: flex;
        flex-direction: column;
        gap: 8px;
        padding: 12px 20px;
        animation: slideIn 0.4s ease-out;
      }

      .n8n-starter-prompt-btn {
        background: white;
        border: 1px solid #e5e7eb;
        color: ${this.config.theme.primaryColor};
        padding: 12px 16px;
        border-radius: 20px;
        font-size: 14px;
        cursor: pointer;
        text-align: left;
        transition: all 0.2s ease;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        font-family: ${this.config.theme.fontFamily};
      }

      .n8n-starter-prompt-btn:hover {
        background: ${this.config.theme.chatBg};
        border-color: ${this.config.theme.primaryColor};
        transform: translateX(4px);
        box-shadow: 0 4px 8px rgba(102, 126, 234, 0.15);
      }

      .n8n-starter-prompt-btn:active {
        transform: translateX(2px);
      }

      .n8n-starter-prompts-hiding {
        animation: promptsFadeOut 0.3s ease-out forwards;
      }

      @keyframes promptsFadeOut {
        from {
          opacity: 1;
          transform: translateY(0);
        }
        to {
          opacity: 0;
          transform: translateY(-10px);
        }
      }

      /* Mobile Responsive Styles */
      @media (max-width: 768px) {
        .n8n-chat-auto-container {
          bottom: 0;
          right: 0;
          left: 0;
          top: 0;
          width: 100%;
          height: 100%;
        }

        .n8n-chat-widget {
          width: 100% !important;
          max-width: 100% !important;
          height: 100% !important;
          max-height: 100% !important;
          border-radius: 0;
          /* Override window config for mobile */
          min-width: 100% !important;
          min-height: 100% !important;
        }

        .n8n-chat-auto-container .n8n-chat-toggle-btn {
          position: fixed;
          bottom: 20px;
          right: 20px;
          flex-shrink: 0;
        }

        .n8n-chat-toggle-btn-fixed {
          bottom: 20px !important;
          right: 20px !important;
        }

        /* Hide toggle button when chat is open on mobile */
        .n8n-chat-toggle-btn-open {
          display: none !important;
        }

        .n8n-chat-tip {
          max-width: calc(100vw - 100px);
          right: 10px;
        }

        .n8n-chat-tip-fixed {
          right: 20px;
          bottom: 90px;
          max-width: calc(100vw - 100px);
        }

        .n8n-chat-message-content {
          max-width: 90%;
        }
      }

      /* Small mobile devices */
      @media (max-width: 480px) {
        .n8n-chat-title {
          font-size: 16px;
        }

        .n8n-chat-bubble {
          font-size: 13px;
        }

        .n8n-chat-input {
          font-size: 13px;
        }

        .n8n-starter-prompt-btn {
          font-size: 13px;
          padding: 10px 14px;
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
    
    // Handle Enter key (without Shift for send, with Shift for new line)
    this.inputField.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey && !this.isWaitingForResponse) {
        e.preventDefault();
        this.sendMessage();
      }
    });

    // Auto-resize textarea as user types
    this.inputField.addEventListener('input', () => this.autoResizeInput());

    resetBtn.addEventListener('click', () => this.resetConversation());
    
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.closeChat());
    }

    // Voice input button
    if (this.voiceButton) {
      this.voiceButton.addEventListener('click', () => this.toggleVoiceRecording());
    }

    // File upload button
    if (this.uploadButton) {
      this.uploadButton.addEventListener('click', () => this.triggerFileUpload());
    }

    // File input change
    if (this.fileInput) {
      this.fileInput.addEventListener('change', (e) => this.handleFileUpload(e));
    }

    // Scroll to bottom button
    if (this.scrollToBottomButton) {
      this.scrollToBottomButton.addEventListener('click', () => {
        this.scrollToBottom(true); // Smooth scroll
      });
    }

    // Monitor scroll position to show/hide scroll-to-bottom button
    if (this.messagesContainer) {
      this.messagesContainer.addEventListener('scroll', () => {
        this.handleMessagesScroll();
      });
    }
    
    // Initial resize
    this.autoResizeInput();
  }

  /**
   * Auto-resize input field based on content
   */
  autoResizeInput() {
    if (!this.inputField) return;
    
    // Reset height to recalculate
    this.inputField.style.height = 'auto';
    
    // Calculate new height
    const newHeight = Math.min(this.inputField.scrollHeight, this.config.maxInputHeight);
    
    // Set new height
    this.inputField.style.height = newHeight + 'px';
  }

  /**
   * Send a message
   */
  async sendMessage() {
    const message = this.inputField.value.trim();
    const hasFiles = this.uploadedFiles.length > 0;
    
    if ((!message && !hasFiles) || this.isWaitingForResponse) {
      return;
    }

    // Prepare message with file data
    const messageData = {
      text: message,
      files: hasFiles ? await this.uploadFiles() : []
    };

    // Clear input and files
    this.inputField.value = '';
    this.clearUploadedFiles();
    
    // Reset textarea height after clearing
    this.autoResizeInput();
    
    // Add user message to UI (with file attachments if any)
    // Note: We'll add the message after upload is complete to show the processed files
    if (!hasFiles) {
      this.addMessage(message, 'user');
    }
    
    // Show typing indicator
    this.showTypingIndicator();
    
    // Disable input
    this.setInputState(false);

    try {
      // Send message with file data to n8n
      await this.client.sendMessage(message, messageData);
      
      // If we have files, add the message with processed file data after upload
      if (hasFiles) {
        this.addMessageWithFiles(message, 'user', messageData.files);
      }
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
    this.addMessageWithFiles(text, type, []);
  }

  /**
   * Add a message with files to the chat
   */
  addMessageWithFiles(text, type, files = []) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `n8n-chat-message ${type}`;
    
    // Create message content wrapper
    const messageContent = document.createElement('div');
    messageContent.className = 'n8n-chat-message-content';
    
    // Add avatar if enabled
    if (this.config.avatars.enabled) {
      const avatar = this.createAvatar(type);
      if (avatar) {
        messageContent.appendChild(avatar);
      }
    }
    
    // Create bubble wrapper for text and timestamp
    const bubbleWrapper = document.createElement('div');
    bubbleWrapper.className = 'n8n-chat-bubble-wrapper';
    
    const bubble = document.createElement('div');
    bubble.className = 'n8n-chat-bubble';
    
    // Add text if present
    if (text) {
      const textElement = document.createElement('div');
      textElement.textContent = text;
      bubble.appendChild(textElement);
    }
    
    // Add file attachments if present
    if (files && files.length > 0) {
      const filesContainer = document.createElement('div');
      filesContainer.className = 'n8n-chat-files';
      
      files.forEach(file => {
        const fileElement = this.createFileAttachment(file);
        filesContainer.appendChild(fileElement);
      });
      
      bubble.appendChild(filesContainer);
    }
    
    bubbleWrapper.appendChild(bubble);

    if (this.config.showTimestamp) {
      const timestamp = document.createElement('div');
      timestamp.className = 'n8n-chat-timestamp';
      timestamp.textContent = new Date().toLocaleTimeString();
      bubbleWrapper.appendChild(timestamp);
    }
    
    messageContent.appendChild(bubbleWrapper);
    messageDiv.appendChild(messageContent);

    this.messagesContainer.appendChild(messageDiv);
    this.scrollToBottom();
  }

  /**
   * Create avatar element
   */
  createAvatar(type) {
    const avatarUrl = type === 'bot' ? this.config.avatars.bot : this.config.avatars.user;
    
    if (!avatarUrl) {
      // Use default avatars if no custom avatar provided
      const defaultAvatars = {
        bot: '🤖',
        user: '👤'
      };
      
      const avatar = document.createElement('div');
      avatar.className = `n8n-chat-avatar n8n-chat-avatar-${type}`;
      avatar.textContent = defaultAvatars[type];
      return avatar;
    }
    
    const avatar = document.createElement('div');
    avatar.className = `n8n-chat-avatar n8n-chat-avatar-${type}`;
    
    // Check if it's an emoji or image URL
    if (avatarUrl.startsWith('http') || avatarUrl.startsWith('/') || avatarUrl.startsWith('data:')) {
      // It's an image URL
      const img = document.createElement('img');
      img.src = avatarUrl;
      img.alt = `${type} avatar`;
      img.className = 'n8n-chat-avatar-img';
      avatar.appendChild(img);
    } else {
      // It's emoji or text
      avatar.textContent = avatarUrl;
    }
    
    return avatar;
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
   * @param {boolean} smooth - Use smooth scrolling (default: false)
   */
  scrollToBottom(smooth = false) {
    if (smooth) {
      this.messagesContainer.scrollTo({
        top: this.messagesContainer.scrollHeight,
        behavior: 'smooth'
      });
    } else {
      this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    }
  }

  /**
   * Handle messages scroll event
   * Shows/hides scroll-to-bottom button based on scroll position
   */
  handleMessagesScroll() {
    if (!this.scrollToBottomButton || !this.messagesContainer) return;

    const scrollTop = this.messagesContainer.scrollTop;
    const scrollHeight = this.messagesContainer.scrollHeight;
    const clientHeight = this.messagesContainer.clientHeight;
    
    // Show button if user has scrolled up more than 100px from bottom
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
    
    if (distanceFromBottom > 100) {
      this.scrollToBottomButton.style.display = 'flex';
    } else {
      this.scrollToBottomButton.style.display = 'none';
    }
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
      this.welcomeMessageShown = false;
      this.starterPromptsShown = false;
      this.starterPromptsContainer = null;
      // Show welcome message again after reset (which will also show starter prompts)
      if (this.config.welcomeMessage) {
        this.showWelcomeMessage();
      }
    }
  }

  /**
   * Show welcome message
   */
  showWelcomeMessage() {
    if (!this.welcomeMessageShown && this.config.welcomeMessage) {
      this.addMessage(this.config.welcomeMessage, 'bot');
      this.welcomeMessageShown = true;
      // Show starter prompts after welcome message
      if (this.config.starterPrompts && this.config.starterPrompts.length > 0) {
        this.showStarterPrompts();
      }
    }
  }

  /**
   * Show starter prompts
   */
  showStarterPrompts() {
    if (this.starterPromptsShown || !this.config.starterPrompts || this.config.starterPrompts.length === 0) {
      return;
    }

    const promptsContainer = document.createElement('div');
    promptsContainer.className = 'n8n-starter-prompts';
    promptsContainer.id = 'n8n-starter-prompts';

    this.config.starterPrompts.forEach((prompt, index) => {
      const promptBtn = document.createElement('button');
      promptBtn.className = 'n8n-starter-prompt-btn';
      promptBtn.textContent = prompt;
      promptBtn.addEventListener('click', () => this.handleStarterPromptClick(prompt));
      promptsContainer.appendChild(promptBtn);
    });

    this.messagesContainer.appendChild(promptsContainer);
    this.scrollToBottom();
    this.starterPromptsContainer = promptsContainer;
    this.starterPromptsShown = true;
  }

  /**
   * Handle starter prompt click
   */
  handleStarterPromptClick(prompt) {
    // Keep prompts visible - don't hide them
    // Set the input value and send
    this.inputField.value = prompt;
    this.sendMessage();
  }

  /**
   * Hide starter prompts
   */
  hideStarterPrompts() {
    if (this.starterPromptsContainer) {
      this.starterPromptsContainer.classList.add('n8n-starter-prompts-hiding');
      setTimeout(() => {
        if (this.starterPromptsContainer) {
          this.starterPromptsContainer.remove();
          this.starterPromptsContainer = null;
        }
      }, 300);
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
    
    // On desktop: change button icon to down arrow instead of hiding
    // On mobile: hide the button (handled by CSS)
    if (this.toggleButton) {
      const downArrowIcon = `
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M6 9L12 15L18 9" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      `;
      this.toggleButton.innerHTML = downArrowIcon;
      this.toggleButton.title = 'Minimize chat';
      this.toggleButton.setAttribute('aria-label', 'Minimize chat');
      this.toggleButton.classList.add('n8n-chat-toggle-btn-open');
    }
    
    // Hide tip when chat opens
    if (this.tipElement) {
      this.hideTip();
    }
    
    // Show welcome message on first open
    if (!this.welcomeMessageShown && this.config.welcomeMessage) {
      this.showWelcomeMessage();
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
      
      // Restore original button icon and show button
      if (this.toggleButton) {
        this.toggleButton.innerHTML = this.defaultButtonIcon;
        this.toggleButton.title = 'Open chat';
        this.toggleButton.setAttribute('aria-label', 'Open chat');
        this.toggleButton.classList.remove('n8n-chat-toggle-btn-open');
        this.toggleButton.style.display = 'flex';
      }
    }, 300);
  }

  /**
   * Initialize voice recognition
   */
  initializeVoiceRecognition() {
    // Check if speech recognition is supported
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      console.warn('Speech recognition not supported in this browser');
      if (this.voiceButton) {
        this.voiceButton.style.display = 'none';
      }
      return;
    }

    // Create speech recognition instance
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    this.recognition = new SpeechRecognition();
    
    // Configure recognition
    this.recognition.continuous = this.config.voice.continuous;
    this.recognition.interimResults = this.config.voice.interimResults;
    this.recognition.lang = this.config.voice.language;
    this.recognition.maxAlternatives = this.config.voice.maxAlternatives;

    // Set up event handlers
    this.recognition.onstart = () => {
      this.voiceInputEnabled = true;
      this.updateVoiceButtonState();
    };

    this.recognition.onresult = (event) => {
      let finalTranscript = '';
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        } else {
          interimTranscript += transcript;
        }
      }

      // Update input field with transcript
      if (finalTranscript) {
        this.inputField.value = finalTranscript;
        this.autoResizeInput();
      } else if (interimTranscript) {
        // Show interim results in placeholder or separate indicator
        this.showInterimResults(interimTranscript);
      }
    };

    this.recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      this.voiceInputEnabled = false;
      this.updateVoiceButtonState();
      
      // Show error message to user
      if (event.error === 'not-allowed') {
        this.showError('Microphone access denied. Please allow microphone access to use voice input.');
      } else if (event.error === 'no-speech') {
        this.showError('No speech detected. Please try again.');
      } else {
        this.showError('Voice recognition error. Please try again.');
      }
    };

    this.recognition.onend = () => {
      this.voiceInputEnabled = false;
      this.updateVoiceButtonState();
    };
  }

  /**
   * Toggle voice input
   */
  toggleVoiceInput() {
    if (!this.recognition) {
      this.showError('Voice recognition not available in this browser.');
      return;
    }

    if (this.voiceInputEnabled) {
      this.recognition.stop();
    } else {
      try {
        this.recognition.start();
      } catch (error) {
        console.error('Error starting voice recognition:', error);
        this.showError('Unable to start voice recognition. Please try again.');
      }
    }
  }

  /**
   * Update voice button visual state
   */
  updateVoiceButtonState() {
    if (!this.voiceButton) return;

    if (this.voiceInputEnabled) {
      this.voiceButton.classList.add('n8n-voice-recording');
      this.voiceButton.title = 'Stop recording';
    } else {
      this.voiceButton.classList.remove('n8n-voice-recording');
      this.voiceButton.title = 'Start voice input';
    }
  }

  /**
   * Show interim results
   */
  showInterimResults(text) {
    // You can customize how interim results are displayed
    // For now, we'll just update the input field
    if (text.trim()) {
      this.inputField.value = text;
      this.autoResizeInput();
    }
  }

  /**
   * Create file attachment element
   */
  createFileAttachment(file) {
    const fileElement = document.createElement('div');
    fileElement.className = 'n8n-chat-file-attachment';
    
    console.log('Creating file attachment:', file);
    
    // For images, show a preview
    if (file.type.startsWith('image/')) {
      console.log('Creating image preview with URL:', file.url);
      fileElement.innerHTML = `
        <div class="n8n-chat-file-preview-container">
          <img class="n8n-chat-file-preview" alt="${file.name}" src="${file.url}" onerror="console.log('Image failed to load:', this.src); this.style.display='none'; this.nextElementSibling.style.display='flex';">
          <div class="n8n-chat-file-icon" style="display: none;">🖼️</div>
        </div>
        <div class="n8n-chat-file-info">
          <div class="n8n-chat-file-name">${file.name}</div>
          <div class="n8n-chat-file-size">${this.formatFileSize(file.size)}</div>
        </div>
      `;
    } else {
      // For non-image files, show icon and download link
      const icon = this.getFileIcon(file.type);
      fileElement.innerHTML = `
        <div class="n8n-chat-file-icon">${icon}</div>
        <div class="n8n-chat-file-info">
          <a href="${file.url}" target="_blank" class="n8n-chat-file-link">
            <div class="n8n-chat-file-name">${file.name}</div>
            <div class="n8n-chat-file-size">${this.formatFileSize(file.size)}</div>
          </a>
        </div>
      `;
    }
    
    return fileElement;
  }

  /**
   * Get file icon based on type
   */
  getFileIcon(type) {
    if (type.startsWith('image/')) {
      return '🖼️';
    } else if (type.startsWith('video/')) {
      return '🎥';
    } else if (type.startsWith('audio/')) {
      return '🎵';
    } else if (type.includes('pdf')) {
      return '📄';
    } else if (type.includes('text/')) {
      return '📝';
    } else if (type.includes('zip') || type.includes('rar')) {
      return '📦';
    } else {
      return '📎';
    }
  }

  /**
   * Initialize file upload functionality
   */
  initializeFileUpload() {
    if (!this.fileInput) return;
    
    // Set up drag and drop
    this.inputField.addEventListener('dragover', (e) => {
      e.preventDefault();
      this.inputField.classList.add('n8n-drag-over');
    });

    this.inputField.addEventListener('dragleave', (e) => {
      e.preventDefault();
      this.inputField.classList.remove('n8n-drag-over');
    });

    this.inputField.addEventListener('drop', (e) => {
      e.preventDefault();
      this.inputField.classList.remove('n8n-drag-over');
      
      const files = Array.from(e.dataTransfer.files);
      this.processFiles(files);
    });
  }

  /**
   * Trigger file upload dialog
   */
  triggerFileUpload() {
    if (this.fileInput) {
      this.fileInput.click();
    }
  }

  /**
   * Handle file upload
   */
  handleFileUpload(event) {
    const files = Array.from(event.target.files);
    this.processFiles(files);
    
    // Reset file input
    event.target.value = '';
  }

  /**
   * Process uploaded files
   */
  processFiles(files) {
    if (files.length === 0) return;

    // Check file count limit
    if (this.uploadedFiles.length + files.length > this.config.fileUpload.maxFiles) {
      this.showError(`Maximum ${this.config.fileUpload.maxFiles} files allowed.`);
      return;
    }

    // Process each file
    files.forEach(file => {
      this.validateAndProcessFile(file);
    });
  }

  /**
   * Validate and process a single file
   */
  validateAndProcessFile(file) {
    // Check file size
    if (file.size > this.config.fileUpload.maxFileSize) {
      this.showError(`File "${file.name}" is too large. Maximum size: ${this.formatFileSize(this.config.fileUpload.maxFileSize)}`);
      return;
    }

    // Check file type
    const isAllowedType = this.config.fileUpload.allowedTypes.some(type => {
      if (type.endsWith('/*')) {
        return file.type.startsWith(type.slice(0, -1));
      }
      return file.type === type;
    });

    if (!isAllowedType) {
      this.showError(`File type "${file.type}" is not allowed.`);
      return;
    }

    // Add file to uploaded files
    this.uploadedFiles.push(file);
    
    // Show file preview
    this.showFilePreview(file);
    
    // Update input placeholder
    this.updateInputPlaceholder();
  }

  /**
   * Show file preview
   */
  showFilePreview(file) {
    if (!this.config.fileUpload.showPreview) return;

    // Check if we already have a preview container
    let previewContainer = document.querySelector('.n8n-file-preview');
    
    if (!previewContainer) {
      // Create new preview container
      previewContainer = document.createElement('div');
      previewContainer.className = 'n8n-file-preview';
      
      // Insert before input wrapper
      this.inputField.parentElement.parentElement.insertBefore(previewContainer, this.inputField.parentElement);
    }

    // Create preview content based on file type
    let previewContent = '';
    
    if (file.type.startsWith('image/')) {
      // For images, show image preview with swipe functionality
      const reader = new FileReader();
      reader.onload = (e) => {
        this.updateImagePreview(previewContainer, file, e.target.result);
      };
      reader.readAsDataURL(file);
      
      previewContent = `
        <div class="n8n-file-preview-item n8n-file-preview-image-item" data-file-name="${file.name}">
          <div class="n8n-file-preview-image-container">
            <div class="n8n-file-preview-swipe-container">
              <img class="n8n-file-preview-image" alt="${file.name}" style="display: none;">
              <div class="n8n-file-preview-loading">Loading preview...</div>
            </div>
            <div class="n8n-file-preview-swipe-controls">
              <button class="n8n-file-preview-swipe-btn n8n-file-preview-swipe-left" title="Previous image">‹</button>
              <button class="n8n-file-preview-swipe-btn n8n-file-preview-swipe-right" title="Next image">›</button>
            </div>
            <div class="n8n-file-preview-indicators"></div>
          </div>
          <div class="n8n-file-preview-info">
            <span class="n8n-file-preview-name">${file.name}</span>
            <span class="n8n-file-preview-size">${this.formatFileSize(file.size)}</span>
          </div>
          <button class="n8n-file-preview-remove" data-file-name="${file.name}">×</button>
        </div>
      `;
    } else {
      // For non-images, show file icon
      const icon = this.getFileIcon(file.type);
      previewContent = `
        <div class="n8n-file-preview-item" data-file-name="${file.name}">
          <div class="n8n-file-preview-icon">${icon}</div>
          <div class="n8n-file-preview-info">
            <span class="n8n-file-preview-name">${file.name}</span>
            <span class="n8n-file-preview-size">${this.formatFileSize(file.size)}</span>
          </div>
          <button class="n8n-file-preview-remove" data-file-name="${file.name}">×</button>
        </div>
      `;
    }
    
    // Add the preview item to container
    const previewItem = document.createElement('div');
    previewItem.innerHTML = previewContent;
    previewContainer.appendChild(previewItem.firstElementChild);

    // Add remove functionality - use event delegation
    const removeBtn = previewItem.querySelector('.n8n-file-preview-remove');
    if (removeBtn) {
      removeBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('Remove button clicked for:', file.name);
        this.removeFile(file.name);
      });
    }

    // Add event delegation for remove buttons
    if (!previewContainer.hasAttribute('data-delegation-added')) {
      previewContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('n8n-file-preview-remove')) {
          e.preventDefault();
          e.stopPropagation();
          const fileName = e.target.getAttribute('data-file-name');
          console.log('Remove button clicked via delegation for:', fileName);
          this.removeFile(fileName);
        }
      });
      previewContainer.setAttribute('data-delegation-added', 'true');
    }

    // Add swipe functionality for images
    if (file.type.startsWith('image/')) {
      this.addSwipeFunctionality(previewContainer);
    }

    // Update swipe controls
    this.updateSwipeControls();
  }

  /**
   * Remove file from uploaded files
   */
  removeFile(fileName) {
    console.log('Removing file:', fileName);
    console.log('Current uploaded files:', this.uploadedFiles.map(f => f.name));
    
    // Remove from uploaded files array
    this.uploadedFiles = this.uploadedFiles.filter(file => file.name !== fileName);
    console.log('After removal:', this.uploadedFiles.map(f => f.name));
    
    // Remove the preview element
    const previewItem = document.querySelector(`[data-file-name="${fileName}"]`);
    console.log('Found preview item:', previewItem);
    if (previewItem) {
      previewItem.remove();
      console.log('Preview item removed');
    } else {
      console.log('Preview item not found for:', fileName);
    }
    
    // Update input placeholder
    this.updateInputPlaceholder();
    
    // Update swipe controls after removal
    this.updateSwipeControls();
    
    // If no more images, reset swipe state
    const imageItems = document.querySelectorAll('.n8n-file-preview-image-item');
    if (imageItems.length === 0) {
      this.swipeInitialized = false;
      this.currentImageIndex = 0;
    }
    
    console.log('Remove file completed');
  }

  /**
   * Update input placeholder based on uploaded files
   */
  updateInputPlaceholder() {
    if (this.uploadedFiles.length > 0) {
      this.inputField.placeholder = `Type your message... (${this.uploadedFiles.length} file${this.uploadedFiles.length > 1 ? 's' : ''} attached)`;
    } else {
      this.inputField.placeholder = this.config.placeholder;
    }
  }

  /**
   * Format file size
   */
  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Upload files to server
   */
  async uploadFiles() {
    if (!this.config.fileUpload.uploadUrl) {
      throw new Error('Upload URL not configured');
    }

    const uploadPromises = this.uploadedFiles.map(async (file) => {
      const formData = new FormData();
      formData.append('file', file);
      
      try {
        const response = await fetch(this.config.fileUpload.uploadUrl, {
          method: 'POST',
          body: formData
        });
        
        if (!response.ok) {
          throw new Error(`Upload failed: ${response.statusText}`);
        }
        
        // Try to parse as JSON, fallback to text if it fails
        let result;
        const contentType = response.headers.get('content-type');
        
        if (contentType && contentType.includes('application/json')) {
          result = await response.json();
        } else {
          // If not JSON, try to extract filename from text response
          const textResponse = await response.text();
          console.log('Server response (text):', textResponse);
          
          // Try to extract filename from common response patterns
          let fileName = file.name; // Default to original filename
          
          // Look for filename in various patterns
          const filenameMatch = textResponse.match(/(?:filename|name|file):\s*([^\s\n\r]+)/i);
          if (filenameMatch) {
            fileName = filenameMatch[1];
          } else {
            // If no filename found, use original name
            fileName = file.name;
          }
          
          result = { filename: fileName };
        }
        
        const fileName = result.filename || result.name || result.fileName || file.name;
        
        return {
          name: file.name,
          size: file.size,
          type: file.type,
          url: `${this.config.fileUpload.downloadUrl}/${fileName}`
        };
      } catch (error) {
        console.error('File upload error:', error);
        this.showError(`Failed to upload ${file.name}: ${error.message}`);
        throw error;
      }
    });

    return await Promise.all(uploadPromises);
  }

  /**
   * Update image preview after loading
   */
  updateImagePreview(container, file, imageData) {
    const imageItem = container.querySelector(`[data-file-name="${file.name}"]`);
    if (!imageItem) return;

    const img = imageItem.querySelector('.n8n-file-preview-image');
    const loading = imageItem.querySelector('.n8n-file-preview-loading');
    
    if (img && loading) {
      img.src = imageData;
      img.style.display = 'block';
      loading.style.display = 'none';
    }
  }

  /**
   * Add swipe functionality to image previews
   */
  addSwipeFunctionality(container) {
    if (this.swipeInitialized) return;
    this.swipeInitialized = true;
    this.currentImageIndex = 0;

    // Add touch/swipe event listeners
    const swipeContainer = container.querySelector('.n8n-file-preview-swipe-container');
    if (!swipeContainer) return;

    let startX = 0;
    let startY = 0;
    let isSwipe = false;

    // Touch events
    swipeContainer.addEventListener('touchstart', (e) => {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      isSwipe = false;
    });

    swipeContainer.addEventListener('touchmove', (e) => {
      if (!startX || !startY) return;
      
      const currentX = e.touches[0].clientX;
      const currentY = e.touches[0].clientY;
      const diffX = Math.abs(currentX - startX);
      const diffY = Math.abs(currentY - startY);
      
      if (diffX > diffY && diffX > 10) {
        isSwipe = true;
        e.preventDefault();
      }
    });

    swipeContainer.addEventListener('touchend', (e) => {
      if (!isSwipe || !startX) return;
      
      const endX = e.changedTouches[0].clientX;
      const diffX = startX - endX;
      
      if (Math.abs(diffX) > 50) {
        if (diffX > 0) {
          this.swipeToNext();
        } else {
          this.swipeToPrevious();
        }
      }
      
      startX = 0;
      startY = 0;
      isSwipe = false;
    });

    // Mouse events for desktop
    swipeContainer.addEventListener('mousedown', (e) => {
      startX = e.clientX;
      startY = e.clientY;
      isSwipe = false;
    });

    swipeContainer.addEventListener('mousemove', (e) => {
      if (!startX || !startY) return;
      
      const currentX = e.clientX;
      const currentY = e.clientY;
      const diffX = Math.abs(currentX - startX);
      const diffY = Math.abs(currentY - startY);
      
      if (diffX > diffY && diffX > 10) {
        isSwipe = true;
      }
    });

    swipeContainer.addEventListener('mouseup', (e) => {
      if (!isSwipe || !startX) return;
      
      const endX = e.clientX;
      const diffX = startX - endX;
      
      if (Math.abs(diffX) > 50) {
        if (diffX > 0) {
          this.swipeToNext();
        } else {
          this.swipeToPrevious();
        }
      }
      
      startX = 0;
      startY = 0;
      isSwipe = false;
    });
  }

  /**
   * Swipe to next image
   */
  swipeToNext() {
    const imageItems = document.querySelectorAll('.n8n-file-preview-image-item');
    if (imageItems.length <= 1) return;

    this.currentImageIndex = (this.currentImageIndex + 1) % imageItems.length;
    this.showCurrentImage();
  }

  /**
   * Swipe to previous image
   */
  swipeToPrevious() {
    const imageItems = document.querySelectorAll('.n8n-file-preview-image-item');
    if (imageItems.length <= 1) return;

    this.currentImageIndex = this.currentImageIndex === 0 ? imageItems.length - 1 : this.currentImageIndex - 1;
    this.showCurrentImage();
  }

  /**
   * Show current image in swipe view
   */
  showCurrentImage() {
    const imageItems = document.querySelectorAll('.n8n-file-preview-image-item');
    if (imageItems.length === 0) return;
    
    // Ensure we don't go out of bounds
    if (this.currentImageIndex >= imageItems.length) {
      this.currentImageIndex = imageItems.length - 1;
    }
    if (this.currentImageIndex < 0) {
      this.currentImageIndex = 0;
    }
    
    imageItems.forEach((item, index) => {
      if (index === this.currentImageIndex) {
        item.style.display = 'flex';
        item.style.position = 'relative';
      } else {
        item.style.display = 'none';
      }
    });
    this.updateSwipeControls();
  }

  /**
   * Update swipe controls visibility
   */
  updateSwipeControls() {
    const imageItems = document.querySelectorAll('.n8n-file-preview-image-item');
    const leftBtns = document.querySelectorAll('.n8n-file-preview-swipe-left');
    const rightBtns = document.querySelectorAll('.n8n-file-preview-swipe-right');
    const indicators = document.querySelectorAll('.n8n-file-preview-indicators');

    // Show/hide swipe controls based on number of images
    const hasMultipleImages = imageItems.length > 1;
    leftBtns.forEach(btn => btn.style.display = hasMultipleImages ? 'flex' : 'none');
    rightBtns.forEach(btn => btn.style.display = hasMultipleImages ? 'flex' : 'none');

    // Update indicators
    indicators.forEach(indicator => {
      indicator.innerHTML = '';
      if (hasMultipleImages) {
        for (let i = 0; i < imageItems.length; i++) {
          const dot = document.createElement('span');
          dot.className = `n8n-file-preview-dot ${i === this.currentImageIndex ? 'active' : ''}`;
          dot.addEventListener('click', () => {
            this.currentImageIndex = i;
            this.showCurrentImage();
          });
          indicator.appendChild(dot);
        }
      }
    });

    // Add click handlers for swipe buttons
    leftBtns.forEach(btn => {
      btn.onclick = () => this.swipeToPrevious();
    });
    rightBtns.forEach(btn => {
      btn.onclick = () => this.swipeToNext();
    });

    // If we have images, show the current one
    if (imageItems.length > 0) {
      this.showCurrentImage();
    }
  }

  /**
   * Clear uploaded files
   */
  clearUploadedFiles() {
    this.uploadedFiles = [];
    
    // Remove all file previews
    const previews = document.querySelectorAll('.n8n-file-preview');
    previews.forEach(preview => preview.remove());
    
    this.updateInputPlaceholder();
    this.swipeInitialized = false;
    this.currentImageIndex = 0;
  }

  /**
   * Toggle voice recording
   */
  async toggleVoiceRecording() {
    if (this.isRecording) {
      this.stopVoiceRecording();
    } else {
      await this.startVoiceRecording();
    }
  }

  /**
   * Start voice recording
   */
  async startVoiceRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      this.mediaRecorder = new MediaRecorder(stream);
      this.audioChunks = [];
      
      this.mediaRecorder.ondataavailable = (event) => {
        this.audioChunks.push(event.data);
      };
      
      this.mediaRecorder.onstop = () => {
        this.processVoiceRecording();
        stream.getTracks().forEach(track => track.stop());
      };
      
      this.mediaRecorder.start();
      this.isRecording = true;
      
      // Update button state
      this.voiceButton.classList.add('n8n-voice-recording');
      this.voiceButton.title = 'Stop recording';
      
      console.log('Voice recording started');
    } catch (error) {
      console.error('Error starting voice recording:', error);
      this.showError('Microphone access denied. Please allow microphone access to record voice messages.');
    }
  }

  /**
   * Stop voice recording
   */
  stopVoiceRecording() {
    if (this.mediaRecorder && this.isRecording) {
      this.mediaRecorder.stop();
      this.isRecording = false;
      
      // Update button state
      this.voiceButton.classList.remove('n8n-voice-recording');
      this.voiceButton.title = 'Voice message';
      
      console.log('Voice recording stopped');
    }
  }

  /**
   * Process voice recording
   */
  async processVoiceRecording() {
    const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
    
    // Create a file-like object for the audio
    const audioFile = new File([audioBlob], `voice_${Date.now()}.webm`, {
      type: 'audio/webm',
      lastModified: Date.now()
    });
    
    console.log('Processing voice recording:', audioFile.name, audioFile.size);
    
    // Upload the voice recording
    try {
      const uploadedVoice = await this.uploadVoiceFile(audioFile);
      
      // Add voice message to chat
      this.addVoiceMessage(uploadedVoice);
      
      // Send to n8n
      await this.sendVoiceMessage(uploadedVoice);
      
    } catch (error) {
      console.error('Error processing voice recording:', error);
      this.showError('Failed to upload voice message. Please try again.');
    }
  }

  /**
   * Upload voice file to server
   */
  async uploadVoiceFile(audioFile) {
    if (!this.config.fileUpload.uploadUrl) {
      throw new Error('Upload URL not configured');
    }

    const formData = new FormData();
    formData.append('file', audioFile);
    
    const response = await fetch(this.config.fileUpload.uploadUrl, {
      method: 'POST',
      body: formData
    });
    
    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`);
    }
    
    const result = await response.json();
    const fileName = result.filename || result.name || audioFile.name;
    
    return {
      name: audioFile.name,
      size: audioFile.size,
      type: audioFile.type,
      url: `${this.config.fileUpload.downloadUrl}/${fileName}`,
      duration: await this.getAudioDuration(audioFile)
    };
  }

  /**
   * Get audio duration
   */
  getAudioDuration(audioFile) {
    return new Promise((resolve) => {
      const audio = new Audio();
      audio.onloadedmetadata = () => {
        resolve(Math.round(audio.duration));
      };
      audio.onerror = () => resolve(0);
      audio.src = URL.createObjectURL(audioFile);
    });
  }

  /**
   * Add voice message to chat
   */
  addVoiceMessage(voiceData) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'n8n-chat-message user';
    
    const messageContent = document.createElement('div');
    messageContent.className = 'n8n-chat-message-content';
    
    // Add avatar if enabled
    if (this.config.avatars.enabled) {
      const avatar = this.createAvatar('user');
      if (avatar) {
        messageContent.appendChild(avatar);
      }
    }
    
    const bubbleWrapper = document.createElement('div');
    bubbleWrapper.className = 'n8n-chat-bubble-wrapper';
    
    const bubble = document.createElement('div');
    bubble.className = 'n8n-chat-bubble n8n-voice-bubble';
    
    // Create voice message element
    const voiceElement = this.createVoiceMessage(voiceData);
    bubble.appendChild(voiceElement);
    
    bubbleWrapper.appendChild(bubble);

    if (this.config.showTimestamp) {
      const timestamp = document.createElement('div');
      timestamp.className = 'n8n-chat-timestamp';
      timestamp.textContent = new Date().toLocaleTimeString();
      bubbleWrapper.appendChild(timestamp);
    }
    
    messageContent.appendChild(bubbleWrapper);
    messageDiv.appendChild(messageContent);

    this.messagesContainer.appendChild(messageDiv);
    this.scrollToBottom();
  }

  /**
   * Create voice message element
   */
  createVoiceMessage(voiceData) {
    const voiceContainer = document.createElement('div');
    voiceContainer.className = 'n8n-voice-message';
    
    voiceContainer.innerHTML = `
      <div class="n8n-voice-controls">
        <button class="n8n-voice-play-btn" data-url="${voiceData.url}">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M8 5v14l11-7z" fill="currentColor"/>
          </svg>
        </button>
        <div class="n8n-voice-waveform">
          <div class="n8n-voice-wave"></div>
          <div class="n8n-voice-wave"></div>
          <div class="n8n-voice-wave"></div>
          <div class="n8n-voice-wave"></div>
          <div class="n8n-voice-wave"></div>
        </div>
        <div class="n8n-voice-duration">${voiceData.duration}s</div>
      </div>
    `;
    
    // Add play functionality
    const playBtn = voiceContainer.querySelector('.n8n-voice-play-btn');
    playBtn.addEventListener('click', () => this.playVoiceMessage(playBtn, voiceData.url));
    
    return voiceContainer;
  }

  /**
   * Play voice message
   */
  playVoiceMessage(playBtn, audioUrl) {
    const isPlaying = playBtn.classList.contains('playing');
    
    if (isPlaying) {
      // Stop playing
      playBtn.classList.remove('playing');
      playBtn.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M8 5v14l11-7z" fill="currentColor"/>
        </svg>
      `;
      if (this.currentAudio) {
        this.currentAudio.pause();
        this.currentAudio = null;
      }
    } else {
      // Start playing
      playBtn.classList.add('playing');
      playBtn.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="6" y="4" width="4" height="16"/>
          <rect x="14" y="4" width="4" height="16"/>
        </svg>
      `;
      
      this.currentAudio = new Audio(audioUrl);
      this.currentAudio.onended = () => {
        playBtn.classList.remove('playing');
        playBtn.innerHTML = `
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M8 5v14l11-7z" fill="currentColor"/>
          </svg>
        `;
      };
      this.currentAudio.play();
    }
  }

  /**
   * Send voice message to n8n
   */
  async sendVoiceMessage(voiceData) {
    const messageData = {
      text: '[Voice Message]',
      files: [voiceData]
    };
    
    try {
      await this.client.sendMessage('[Voice Message]', messageData);
    } catch (error) {
      console.error('Error sending voice message:', error);
    }
  }

  /**
   * Get chat client instance
   */
  getClient() {
    return this.client;
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

// Export for different module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { N8NChatClient, N8NChatUI };
}

if (typeof window !== 'undefined') {
  window.N8NChatClient = N8NChatClient;
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

