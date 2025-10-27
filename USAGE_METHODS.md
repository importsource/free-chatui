# N8N Chat Library - Usage Methods

This library offers two ways to integrate chat into your website. Choose the method that best fits your needs.

## 📌 Method Comparison

| Feature | Auto-Init (Super Simple) | Manual Init |
|---------|-------------------------|-------------|
| **Setup Complexity** | Easiest - 2 script tags | Simple - 3 steps |
| **DIV Required?** | ❌ No | ❌ No (auto-created) |
| **Manual Code?** | ❌ No | ✅ Yes (init call) |
| **Position** | Fixed bottom-right | Flexible (where div is) |
| **Best For** | Quick integration, floating widget | Custom placement, dynamic control |

---

## 🚀 Method 1: Auto-Initialization (Recommended)

**Perfect for:** Quick setup, floating chat widget that appears on every page

### Implementation

```html
<!DOCTYPE html>
<html>
<head>
  <title>My Website</title>
</head>
<body>
  <h1>Welcome!</h1>
  
  <!-- Just configure and load scripts -->
  <script>
    window.N8N_CHAT_CONFIG = {
      chatUrl: 'YOUR_N8N_WEBHOOK_URL',
      title: 'Support Chat',
      placeholder: 'How can we help?'
    };
  </script>
  <script src="n8n-chat-client.js"></script>
  <script src="n8n-chat-ui.js"></script>
</body>
</html>
```

### Features
- ✅ **No div needed** - Container is auto-created
- ✅ **No initialization code** - Starts automatically
- ✅ **Fixed position** - Bottom right corner
- ✅ **Global access** - Available as `window.n8nChat`

### Accessing the Chat Instance

```javascript
// After the scripts load, you can access the chat instance
document.addEventListener('DOMContentLoaded', () => {
  // Get the auto-initialized chat instance
  const chat = window.n8nChat;
  
  // Access the client
  const client = chat.getClient();
  
  // Get session ID
  console.log('Session:', client.getSessionId());
  
  // Get conversation history
  console.log('History:', client.getHistory());
});
```

---

## 🎯 Method 2: Manual Initialization

**Perfect for:** Custom placement, multiple chat instances, dynamic initialization

### Implementation

```html
<!DOCTYPE html>
<html>
<head>
  <title>My Website</title>
</head>
<body>
  <h1>Welcome!</h1>
  
  <!-- Optional: Add container for custom placement -->
  <div id="my-custom-chat"></div>
  
  <!-- Load scripts -->
  <script src="n8n-chat-client.js"></script>
  <script src="n8n-chat-ui.js"></script>
  
  <!-- Initialize manually -->
  <script>
    const chat = new N8NChatUI({
      chatUrl: 'YOUR_N8N_WEBHOOK_URL',
      containerId: 'my-custom-chat', // Optional
      title: 'Support Chat',
      placeholder: 'How can we help?'
    });
    
    chat.init();
  </script>
</body>
</html>
```

### Features
- ✅ **Custom container** - Place it anywhere (optional)
- ✅ **Auto-creates if missing** - Still works without div
- ✅ **Multiple instances** - Create multiple chat widgets
- ✅ **Full control** - Initialize when/where you want

### Without Container DIV

Even with manual initialization, you don't need a div:

```javascript
// This will auto-create a container in the bottom right
const chat = new N8NChatUI({
  chatUrl: 'YOUR_N8N_WEBHOOK_URL'
});
chat.init();
```

### With Custom Container

```javascript
// This will use the existing div for custom placement
const chat = new N8NChatUI({
  chatUrl: 'YOUR_N8N_WEBHOOK_URL',
  containerId: 'my-custom-location'
});
chat.init();
```

---

## 🎨 Configuration Options

Both methods support the same configuration options:

```javascript
{
  chatUrl: 'YOUR_N8N_WEBHOOK_URL',  // Required
  containerId: 'n8n-chat-container', // Optional
  title: 'Chat',                     // Optional
  placeholder: 'Type message...',    // Optional
  showTimestamp: false,              // Optional
  headers: {},                       // Optional
  timeout: 30000                     // Optional
}
```

## 🔄 Switching Between Methods

### From Auto-Init to Manual

If you're using auto-init but want to switch to manual:

```html
<!-- Remove this -->
<script>
  window.N8N_CHAT_CONFIG = { ... };
</script>

<!-- Add this instead -->
<script>
  const chat = new N8NChatUI({ ... });
  chat.init();
</script>
```

### From Manual to Auto-Init

If you're using manual init but want auto-init:

```html
<!-- Remove initialization code and move config to window -->
<script>
  window.N8N_CHAT_CONFIG = {
    chatUrl: 'YOUR_URL',
    // ... other options
  };
</script>
<!-- Scripts will auto-initialize -->
```

---

## 💡 Best Practices

### Use Auto-Init When:
- ✅ You want the simplest possible setup
- ✅ You're fine with bottom-right placement
- ✅ You want the same chat on all pages
- ✅ You're adding to an existing site quickly

### Use Manual Init When:
- ✅ You need custom placement
- ✅ You want multiple chat instances
- ✅ You need to control initialization timing
- ✅ You're building a complex application

---

## 📱 Positioning

### Auto-Init Position
- Fixed bottom-right corner
- 20px from bottom and right edges
- z-index: 9999

### Manual Init Position
- Inline where the container div is placed
- You control the position with CSS
- If no div provided, same as auto-init

### Custom Positioning

Override the auto-container position with CSS:

```css
.n8n-chat-auto-container {
  bottom: 10px;
  right: 10px;
  /* or */
  left: 20px;
  bottom: 20px;
}
```

---

## 🔧 Advanced Examples

### Conditional Loading

```html
<script>
  // Only load chat for logged-in users
  if (userIsLoggedIn) {
    window.N8N_CHAT_CONFIG = {
      chatUrl: 'YOUR_URL',
      title: 'Support for ' + userName
    };
  }
</script>
<script src="n8n-chat-client.js"></script>
<script src="n8n-chat-ui.js"></script>
```

### Dynamic Initialization

```javascript
// Initialize chat when user clicks a button
document.getElementById('openChat').addEventListener('click', () => {
  const chat = new N8NChatUI({
    chatUrl: 'YOUR_URL'
  });
  chat.init();
});
```

### Multiple Chat Instances

```javascript
// Support chat
const supportChat = new N8NChatUI({
  chatUrl: 'https://n8n.com/webhook/support',
  containerId: 'support-chat',
  title: 'Support'
});
supportChat.init();

// Sales chat
const salesChat = new N8NChatUI({
  chatUrl: 'https://n8n.com/webhook/sales',
  containerId: 'sales-chat',
  title: 'Sales'
});
salesChat.init();
```

---

## 📝 Summary

**Simplest possible setup (Recommended for most users):**
```html
<script>window.N8N_CHAT_CONFIG = {chatUrl: 'YOUR_URL'};</script>
<script src="n8n-chat-client.js"></script>
<script src="n8n-chat-ui.js"></script>
```

**Full control:**
```javascript
const chat = new N8NChatUI({chatUrl: 'YOUR_URL'});
chat.init();
```

Both methods are powerful and flexible - choose what works best for you! 🎉

