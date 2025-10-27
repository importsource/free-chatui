# N8N Chat Library - Features Overview

A complete guide to all features available in the N8N Chat Library.

## 🎯 Core Features

### 1. 💬 Toggle Button
**What it does:** Floating button to show/hide the chat window

**Configuration:**
```javascript
button: {
  enabled: true,
  icon: '💬',                    // Custom icon (emoji/SVG/HTML)
  radius: '50%',                  // Border radius (circle or rounded square)
  border: '2px solid white',     // Border style
  shadow: '0 4px 12px rgba(0,0,0,0.15)',  // Box shadow
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
}
```

**Examples:**
- Circular button with emoji
- Rounded square with custom SVG
- Minimal white button
- Neon glow effect

**See:** `button-example.html`, `custom-button-example.html`

---

### 2. 💡 Helpful Tips
**What it does:** Tooltip that appears near the button to guide users

**Configuration:**
```javascript
tip: {
  enabled: true,
  text: 'Need help? Chat with us! 💬',
  delay: 2000,                    // Show after 2 seconds
  autoHide: true,                 // Hide on first interaction
  background: '#ffffff',
  color: '#333333',
  shadow: '0 4px 16px rgba(0,0,0,0.15)'
}
```

**Features:**
- Auto-appears after delay
- Dismissible with X button
- Auto-hides on first chat interaction
- Smooth animations
- Fully customizable styling

**See:** `tips-example.html`

---

### 3. 👋 Welcome Message
**What it does:** Greets users when they first open the chat

**Configuration:**
```javascript
welcomeMessage: 'Hello! 👋 How can I help you today?'
```

**Examples:**
- "Hello! 👋 How can I help you today?"
- "Hey there! 😊 What can I do for you?"
- "Welcome! Our team is ready to assist you."
- "Hi! I can help with orders, shipping, and returns."

**Behavior:**
- Shows on first chat open
- Re-appears after conversation reset
- Can be disabled with `null` or empty string

**See:** `welcome-message-example.html`

---

### 4. ⚡ Starter Prompts
**What it does:** Clickable quick reply buttons for common questions

**Configuration:**
```javascript
starterPrompts: [
  'What are your hours?',
  'Track my order',
  'Return policy',
  'Contact support'
]
```

**Features:**
- Click to send instantly (no typing)
- Stay visible throughout conversation
- Users can click multiple prompts
- Reset with conversation
- 3-5 prompts recommended

**Use Cases:**
- Customer support FAQs
- E-commerce navigation
- Product information
- Lead generation
- Technical support

**See:** `starter-prompts-example.html`, `STARTER_PROMPTS_GUIDE.md`

---

### 5. 👤 Custom Avatars
**What it does:** Display custom avatars for bot and user messages

**Configuration:**
```javascript
avatars: {
  bot: '🤖',              // Bot avatar
  user: '👤',             // User avatar
  enabled: true
}
```

**Avatar Types:**
- **Emoji**: `'🤖'`, `'💬'`, `'🎧'`, `'🧠'`
- **Image URL**: `'https://example.com/avatar.png'`
- **Text/Initials**: `'AI'`, `'Bot'`, `'JD'`

**Examples:**
- Default: 🤖 (bot) + 👤 (user)
- Support: 🎧 (bot) + 😊 (user)
- AI: 🧠 (bot) + 👨‍💻 (user)
- E-commerce: 🛍️ (bot) + 🙋 (user)

**See:** `avatars-example.html`

---

### 6. 🎨 Theme System
**What it does:** Customize colors, fonts, and overall appearance

**Configuration:**
```javascript
theme: {
  primaryColor: '#4a90e2',      // Main brand color
  secondaryColor: '#357abd',    // For gradients
  chatBg: '#f0f7ff',            // Chat background
  userMessageBg: null,          // null = gradient
  userMessageColor: '#ffffff',
  botMessageBg: '#ffffff',
  botMessageColor: '#333333',
  headerBg: null,               // null = gradient
  headerColor: '#ffffff',
  inputBorder: '#e5e7eb',
  fontFamily: '"Inter", sans-serif'
}
```

**Features:**
- Complete color customization
- Auto-gradient generation
- Font family control
- Dark mode support
- Brand matching

**Popular Themes:**
- Blue Professional
- Green Nature
- Dark Mode
- Red/Pink Vibrant
- Monochrome
- Custom Brand

**See:** `theme-example.html`

---

### 7. 📝 Auto-Expanding Input
**What it does:** Input field automatically grows as users type multiple lines

**Configuration:**
```javascript
maxInputHeight: 120  // Maximum height in pixels (default)
```

**Features:**
- Auto-expands as user types
- Maximum height configurable
- Scrollbar when max height reached
- Keyboard shortcuts: Enter to send, Shift+Enter for new line
- Auto-resets to single line after sending
- Smooth height transitions

**Common Configurations:**
- Compact: `maxInputHeight: 80` (3-4 lines)
- Default: `maxInputHeight: 120` (5-6 lines)
- Large: `maxInputHeight: 200` (8-10 lines)
- Extra Large: `maxInputHeight: 300` (12-15 lines)

**Use Cases:**
- Technical support (detailed descriptions)
- Feedback collection (longer messages)
- Bug reports
- Customer testimonials
- Any scenario needing multi-line input

**See:** `auto-input-example.html`

---

## 🎨 UI Customization

### Beautiful Chat Interface
- Modern, responsive design
- Gradient header
- Smooth message animations
- Typing indicators
- Error handling with user-friendly messages

### Mobile Responsive Design
- **Desktop (>768px):** Floating widget (400×600px) in bottom-right
- **Mobile (≤768px):** Full-screen chat for better UX
- **Small Mobile (≤480px):** Optimized fonts and spacing
- **Automatic detection:** No configuration needed
- **Touch-optimized:** Better touch targets on mobile
- **Keyboard-friendly:** More space when mobile keyboard appears

### Auto-Container
- No div required
- Automatically created and positioned
- Fixed bottom-right by default
- Responsive sizing

---

## 🔧 Advanced Features

### Session Management
- Automatic session ID generation
- Conversation history tracking
- Session persistence
- Custom session ID support

### Error Handling
- Network error handling
- Timeout management
- User-friendly error messages
- Retry capabilities

### Callbacks & Hooks
```javascript
const client = new N8NChatClient({
  chatUrl: 'YOUR_URL',
  onMessage: (data) => {
    // Handle incoming message
  },
  onError: (error) => {
    // Handle errors
  }
});
```

### Custom Headers
```javascript
headers: {
  'Authorization': 'Bearer YOUR_TOKEN',
  'X-Custom-Header': 'value'
}
```

### Timeout Configuration
```javascript
timeout: 30000  // 30 seconds
```

---

## 📦 Installation Methods

### Auto-Initialization (Easiest)
```html
<script>
  window.N8N_CHAT_CONFIG = {
    chatUrl: 'YOUR_URL',
    welcomeMessage: 'Hello! 👋',
    starterPrompts: ['Help', 'Info'],
    avatars: { bot: '🤖', user: '👤' }
  };
</script>
<script src="https://cdn.jsdelivr.net/gh/importsource/free-chatui@v1.0.0-alpha/n8n-chat.js"></script>
```

### Manual Initialization
```javascript
const chat = new N8NChatUI({
  chatUrl: 'YOUR_URL',
  welcomeMessage: 'Hello! 👋',
  starterPrompts: ['Help', 'Info'],
  avatars: { bot: '🤖', user: '👤' }
});
chat.init();
```

### Client Only (Custom UI)
```javascript
const client = new N8NChatClient({
  chatUrl: 'YOUR_URL'
});
await client.sendMessage('Hello!');
```

---

## 🚀 Quick Feature Matrix

| Feature | Default | Customizable | Required |
|---------|---------|--------------|----------|
| **Chat Client** | ✅ | ✅ | ✅ |
| **Beautiful UI** | ✅ | ✅ | ❌ |
| **Toggle Button** | ✅ | ✅ | ❌ |
| **Helpful Tips** | ✅ | ✅ | ❌ |
| **Welcome Message** | ✅ | ✅ | ❌ |
| **Starter Prompts** | ❌ | ✅ | ❌ |
| **Avatars** | ✅ | ✅ | ❌ |
| **Session Management** | ✅ | ✅ | ❌ |
| **Error Handling** | ✅ | ❌ | ❌ |
| **Timestamps** | ❌ | ✅ | ❌ |
| **Custom Headers** | ❌ | ✅ | ❌ |

✅ = Enabled by default
❌ = Disabled by default

---

## 📝 Minimal vs Full Configuration

### Minimal (Just Works)
```javascript
window.N8N_CHAT_CONFIG = {
  chatUrl: 'YOUR_URL'
};
```

### Recommended (Best UX)
```javascript
window.N8N_CHAT_CONFIG = {
  chatUrl: 'YOUR_URL',
  welcomeMessage: 'Hello! 👋 How can I help?',
  starterPrompts: ['I have a question', 'I need help'],
  avatars: { bot: '🤖', user: '👤' }
};
```

### Full (All Features)
```javascript
window.N8N_CHAT_CONFIG = {
  chatUrl: 'YOUR_URL',
  title: 'Support Chat',
  placeholder: 'Type your message...',
  welcomeMessage: 'Hello! 👋 How can I help you today?',
  starterPrompts: [
    'What are your hours?',
    'Track my order',
    'Return policy'
  ],
  avatars: {
    bot: '🤖',
    user: '👤',
    enabled: true
  },
  showTimestamp: true,
  button: {
    enabled: true,
    icon: '💬',
    radius: '50%',
    shadow: '0 4px 12px rgba(0,0,0,0.15)'
  },
  tip: {
    enabled: true,
    text: 'Need help? Chat with us! 💬',
    delay: 2000
  },
  headers: {
    'Authorization': 'Bearer TOKEN'
  },
  timeout: 30000
};
```

---

## 📖 Learn More

- **`README.md`** - Complete documentation
- **`QUICK_START.md`** - Quick start guide
- **`complete-example.html`** - See all features in action
- **Individual feature guides** - Detailed guides for each feature

---

## 🎉 Summary

The N8N Chat Library provides:
1. ✅ Single file import
2. ✅ Auto-initialization
3. ✅ Beautiful, modern UI
4. ✅ Toggle button with full customization
5. ✅ Helpful tips to guide users
6. ✅ Welcome messages for friendly greetings
7. ✅ Starter prompts for quick replies
8. ✅ Custom avatars for personalization
9. ✅ Theme system for brand matching
10. ✅ Auto-expanding input field
11. ✅ Session management
12. ✅ Error handling
13. ✅ Mobile responsive
14. ✅ Zero dependencies

**All in ONE JavaScript file!** 🚀

