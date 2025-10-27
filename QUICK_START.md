# Quick Start Guide - N8N Chat Library

Get your n8n chat up and running with just 1 script tag!

## 🚀 Super Simple Setup (No DIV Required!)

Just add this to your HTML and you're done:

```html
<!-- Step 1: Set your configuration -->
<script>
  window.N8N_CHAT_CONFIG = {
    chatUrl: 'YOUR_N8N_WEBHOOK_URL',
    button: {
      enabled: true  // Shows a toggle button (recommended!)
    }
  };
</script>

<!-- Step 2: Include ONE script file -->
<script src="n8n-chat.js"></script>
```

**That's it!** Just ONE file! A chat button appears in the bottom right corner. Click it to open/close the chat!

**Features:**
- 💬 Toggle button - Click to show/hide chat
- 💡 Helpful tips - Guide users with customizable tooltips
- 👋 Welcome messages - Greet users when they open the chat
- ⚡ Starter prompts - Clickable quick reply buttons
- 👤 Custom avatars - Bot and user avatars (emoji or images)
- 📝 Auto-expanding input - Multi-line support with auto-resize
- 🎨 Theme system - Complete color and font customization
- 📱 Mobile responsive - Full-screen on mobile, widget on desktop
- 🚀 Auto-initialization

The chat instance is automatically available as `window.n8nChat` if you need to interact with it programmatically.

### 💡 Enable Tips, Welcome & Starter Prompts (Recommended!)

Tips guide users to start chatting, welcome message greets them, and starter prompts make it easy to start:

```html
<script>
  window.N8N_CHAT_CONFIG = {
    chatUrl: 'YOUR_N8N_WEBHOOK_URL',
    welcomeMessage: 'Hello! 👋 How can I help you today?',
    starterPrompts: [
      'What are your hours?',
      'Track my order',
      'Return policy',
      'Contact support'
    ],
    button: {
      enabled: true
    },
    tip: {
      enabled: true,
      text: 'Need help? Chat with us! 💬',
      delay: 2000  // Show after 2 seconds
    }
  };
</script>
<script src="n8n-chat.js"></script>
```

**Welcome Message Behavior:**
- Shows automatically when chat opens for the first time
- Appears again after conversation reset
- Can be customized with any text and emojis
- Set to `null` or empty string to disable

**Starter Prompts Behavior:**
- Display as clickable buttons after welcome message
- Click to send the prompt instantly (no typing needed)
- Stay visible throughout the conversation
- Users can click multiple prompts as needed
- Re-appear when conversation is reset
- Recommended: 3-5 prompts for best user experience

### Without Button (Always Show Chat)

If you prefer the chat to always be visible:

```html
<script>
  window.N8N_CHAT_CONFIG = {
    chatUrl: 'YOUR_N8N_WEBHOOK_URL',
    button: { enabled: false }  // Chat always visible
  };
</script>
```

## 🎯 Alternative: Manual Setup

If you want more control over where the chat appears:

### Step 1: Include the Library

```html
<script src="https://cdn.jsdelivr.net/gh/importsource/free-chatui@v1.0.0-alpha/n8n-chat.js"></script>
```

### Step 2: (Optional) Add a Container

```html
<!-- Optional - auto-created if not provided -->
<div id="n8n-chat-container"></div>
```

### Step 3: Initialize

```javascript
const chat = new N8NChatUI({
  chatUrl: 'YOUR_N8N_WEBHOOK_URL'
});
chat.init();
```

## 📋 Complete Minimal Example

### Super Simple (Recommended)

```html
<!DOCTYPE html>
<html>
<head>
  <title>My Website</title>
</head>
<body>
  <h1>Welcome to my site</h1>
  
  <!-- Configure and load - chat appears automatically! -->
  <script>
    window.N8N_CHAT_CONFIG = {
      chatUrl: 'https://your-n8n.com/webhook/chat'
    };
  </script>
  <script src="n8n-chat.js"></script>
</body>
</html>
```

### Manual Method

```html
<!DOCTYPE html>
<html>
<head>
  <title>My Chat</title>
</head>
<body>
  <!-- Container (optional - auto-created if not provided) -->
  <div id="n8n-chat-container"></div>

  <!-- Library -->
  <script src="n8n-chat.js"></script>

  <!-- Initialize -->
  <script>
    const chat = new N8NChatUI({
      chatUrl: 'https://your-n8n.com/webhook/chat'
    });
    chat.init();
  </script>
</body>
</html>
```

## 🎨 Customize the Button & Tips

Make the button and tips your own with these options:

```javascript
window.N8N_CHAT_CONFIG = {
  chatUrl: 'YOUR_N8N_WEBHOOK_URL',
  button: {
    enabled: true,
    icon: '<span style="font-size: 32px">💬</span>',  // Emoji icon
    radius: '50%',                                     // Circular
    border: '2px solid white',                         // Border
    shadow: '0 4px 20px rgba(0,0,0,0.25)',           // Shadow
    background: 'linear-gradient(135deg, #667eea, #764ba2)'
  }
};
```

**Common Customizations:**

**Emoji Icon:**
```javascript
icon: '<span style="font-size: 32px">💬</span>'
// Or: 🤖 👋 💡 📧 🎯 ❓
```

**Rounded Square:**
```javascript
radius: '12px'  // Instead of '50%'
```

**Custom Colors:**
```javascript
background: '#ff6b6b'  // Red
background: 'linear-gradient(135deg, #667eea, #764ba2)'  // Gradient
```

**Larger Button:**
Add CSS:
```css
.n8n-chat-toggle-btn {
  width: 80px !important;
  height: 80px !important;
}
```

## 💡 Customize Tips

**Quick tip (500ms):**
```javascript
tip: {
  text: '💬 Chat now!',
  delay: 500
}
```

**Persistent tip (doesn't auto-hide):**
```javascript
tip: {
  text: 'Questions? Ask us!',
  autoHide: false
}
```

**Custom colored tip:**
```javascript
tip: {
  text: 'We\'re online! 🟢',
  background: '#4caf50',
  color: '#ffffff'
}
```

**Disable tip:**
```javascript
tip: { enabled: false }
```

## 👤 Customize Avatars

Add personality with custom bot and user avatars:

**Emoji avatars (recommended):**
```javascript
avatars: {
  bot: '🤖',
  user: '👤',
  enabled: true
}
```

**Custom emojis:**
```javascript
avatars: {
  bot: '💬',  // Chat bubble
  user: '😊',  // Smiling face
  enabled: true
}
```

**Image URLs:**
```javascript
avatars: {
  bot: 'https://yoursite.com/bot-avatar.png',
  user: 'https://yoursite.com/user-avatar.png',
  enabled: true
}
```

**Initials:**
```javascript
avatars: {
  bot: 'AI',
  user: 'U',
  enabled: true
}
```

**Disable avatars:**
```javascript
avatars: { enabled: false }
```

## 💬 Customize Welcome Message

**Friendly greeting:**
```javascript
welcomeMessage: '👋 Welcome! Ask me anything!'
```

**Professional:**
```javascript
welcomeMessage: 'Hello! Our team is ready to assist you.'
```

**With context:**
```javascript
welcomeMessage: 'Hi! I can help you with orders, returns, and questions. What do you need?'
```

**Disable welcome:**
```javascript
welcomeMessage: null  // or false, or ''
```

## ⚡ Starter Prompts (Quick Replies)

Help users start conversations with clickable prompts:

**Customer Support:**
```javascript
starterPrompts: [
  'What are your hours?',
  'Track my order',
  'Return policy',
  'Contact support'
]
```

**With Emojis:**
```javascript
starterPrompts: [
  '🛍️ Browse products',
  '📦 Check order status',
  '💳 Payment options',
  '🚚 Shipping info'
]
```

**Minimal (2-3 prompts):**
```javascript
starterPrompts: [
  'I have a question',
  'I need help'
]
```

**FAQ Style:**
```javascript
starterPrompts: [
  'How does it work?',
  'Is it free?',
  'What\'s included?'
]
```

**Disable prompts:**
```javascript
starterPrompts: []  // Empty array
```

**Best Practices:**
- Use 3-5 prompts (not too many)
- Keep them short (under 50 characters)
- Address common questions
- Use emojis for visual appeal (optional)
- Test on mobile devices

## 👤 Customize Avatars

Add personality with custom bot and user avatars:

**Emoji avatars (recommended):**
```javascript
avatars: {
  bot: '🤖',
  user: '👤',
  enabled: true
}
```

**Custom emojis:**
```javascript
avatars: {
  bot: '💬',  // Chat bubble
  user: '😊',  // Smiling face
  enabled: true
}
```

**Image URLs:**
```javascript
avatars: {
  bot: 'https://yoursite.com/bot-avatar.png',
  user: 'https://yoursite.com/user-avatar.png',
  enabled: true
}
```

**Initials:**
```javascript
avatars: {
  bot: 'AI',
  user: 'U',
  enabled: true
}
```

**Disable avatars:**
```javascript
avatars: { enabled: false }
```

## 📝 Auto-Expanding Input

The input field automatically grows as users type multiple lines!

**How it works:**
- Type normally - input stays single line
- Press **Shift+Enter** - Add a new line, input expands
- Press **Enter** - Send message, input resets to single line
- Max height configurable (default: 120px)
- Scrollbar appears if content exceeds max height

**Customize max height:**
```javascript
maxInputHeight: 120  // Default (about 5-6 lines)
```

**Larger (for long messages):**
```javascript
maxInputHeight: 200  // About 8-10 lines
```

**Smaller (compact):**
```javascript
maxInputHeight: 80   // About 3-4 lines
```

**Keyboard shortcuts:**
- **Enter** → Send message
- **Shift+Enter** → New line (multi-line message)

## 📱 Mobile Responsive Design

The chat **automatically adapts** to different screen sizes - no configuration needed!

**On Desktop (>768px):**
- Appears as a floating widget (400×600px)
- Bottom-right corner positioning
- Rounded corners
- Toggle button to show/hide

**On Mobile/Tablet (≤768px):**
- **Full-screen chat window**
- 100% width and height
- Edge-to-edge (no rounded corners)
- Maximum screen space utilization
- Better mobile typing experience

**On Small Mobile (≤480px):**
- Optimized font sizes (13-14px)
- Compact spacing
- Better touch targets
- Smaller starter prompt buttons

**Key Benefits:**
- ✅ No configuration needed - works automatically
- ✅ Better mobile UX with full-screen chat
- ✅ More space for conversations on mobile
- ✅ Easier typing on mobile keyboards
- ✅ Professional appearance on all devices
- ✅ Toggle button stays accessible

**How to Test:**
1. Open the chat on desktop - see widget
2. Resize browser window below 768px - see full-screen
3. Or open on actual mobile device - automatic full-screen

## ✨ Add Title Icon

Add an icon next to the chat title in the header:

**Emoji icon:**
```javascript
titleIcon: '💬'  // or 🤖, 🎧, 💡, 🏢
```

**Image URL (auto-detected!):**
```javascript
titleIcon: 'https://yoursite.com/logo.png'
titleIcon: '/images/logo.png'
```

**Custom SVG:**
```javascript
titleIcon: '<svg width="20" height="20" fill="white">...</svg>'
```

**No icon (default):**
```javascript
titleIcon: null  // or don't set it
```

**How it works:**
- URLs (http://, https://, /, data:) are **automatically detected** and rendered as images
- Emojis are displayed as-is
- SVG/HTML is rendered directly
- Images are automatically sized to 24x24px

**Popular Icon Examples:**
- 💬 Chat bubble
- 🤖 AI Assistant
- 🎧 Customer Support
- 🏢 Company Chat
- ❓ Help Center
- 💡 Tips & Ideas
- 🎯 Sales Chat
- `https://yoursite.com/logo.png` Your company logo

## 🎨 Customize Theme (Colors & Fonts)

Match your brand with custom colors:

**Blue Theme:**
```javascript
theme: {
  primaryColor: '#4a90e2',
  secondaryColor: '#357abd',
  chatBg: '#f0f7ff'
}
```

**Green Theme:**
```javascript
theme: {
  primaryColor: '#4caf50',
  secondaryColor: '#388e3c',
  chatBg: '#f1f8f4'
}
```

**Dark Theme:**
```javascript
theme: {
  primaryColor: '#2c3e50',
  secondaryColor: '#34495e',
  chatBg: '#1e1e1e',
  botMessageBg: '#2c2c2c',
  botMessageColor: '#ffffff',
  userMessageColor: '#ffffff',
  inputBorder: '#444'
}
```

**Custom Font:**
```javascript
theme: {
  fontFamily: '"Inter", "Roboto", sans-serif'
}
```

**Complete Theme:**
```javascript
theme: {
  primaryColor: '#YOUR_BRAND_COLOR',
  secondaryColor: '#YOUR_ACCENT_COLOR',
  userMessageBg: null,          // null = uses gradient
  userMessageColor: '#ffffff',
  botMessageBg: '#ffffff',
  botMessageColor: '#333333',
  headerBg: null,               // null = uses gradient
  headerColor: '#ffffff',
  chatBg: '#f7f8fc',
  inputBorder: '#e5e7eb',
  fontFamily: '"Your Font", sans-serif'
}
```

## 🎯 Where to Get Your N8N Webhook URL

1. Open your n8n instance
2. Create a new workflow
3. Add a **Webhook** node
4. Set method to **POST**
5. Copy the **Production URL**
6. Use that URL in the `chatUrl` parameter

## 🎨 Optional Customization

Add any of these options:

```javascript
const chat = new N8NChatUI({
  chatUrl: 'YOUR_N8N_WEBHOOK_URL',
  title: 'Support Chat',           // Custom title
  placeholder: 'Ask me anything',   // Custom placeholder
  showTimestamp: true               // Show message times
});
```

## 🔧 N8N Workflow Setup

Your n8n workflow should:

1. **Receive** the message from the webhook
2. **Process** it (with AI, database, etc.)
3. **Return** a response

### Expected Input Format

The library sends:
```json
{
  "chatInput": "User's message",
  "sessionId": "unique-session-id",
  "timestamp": "2024-10-21T10:30:00.000Z"
}
```

### Expected Output Format

Your n8n should return one of:
```json
"Your response message"
```

Or:
```json
{
  "message": "Your response message"
}
```

## 💡 What You Get

- ✅ Beautiful chat UI out of the box
- ✅ Session management automatically handled
- ✅ Conversation history tracked
- ✅ Error handling included
- ✅ Mobile responsive design
- ✅ No configuration needed

## 🆘 Troubleshooting

**Chat not appearing?**
- Check that the container ID matches (`n8n-chat-container` by default)
- Make sure both script files are loaded
- Check browser console for errors

**Connection errors?**
- Verify your n8n webhook URL is correct
- Ensure your n8n workflow is activated
- Check CORS settings on your n8n instance

**Need custom UI?**
- Use just `n8n-chat-client.js` and build your own interface
- See README.md for client-only examples

## 📖 Next Steps

- Check `example.html` for more advanced examples
- Read `README.md` for complete API documentation
- Customize the appearance with CSS overrides

---

That's it! You're ready to chat! 🎉

