# N8N Chat - Single File Guide

## 🎉 Now Just ONE File!

We've combined everything into a single JavaScript file for maximum simplicity.

## ⚡ Before vs After

### ❌ OLD WAY (2 files)
```html
<script src="n8n-chat-client.js"></script>
<script src="n8n-chat-ui.js"></script>
```

### ✅ NEW WAY (1 file)
```html
<script src="https://cdn.jsdelivr.net/gh/importsource/free-chatui@v1.0.0-alpha/n8n-chat.js"></script>
```

## 📦 What's Included in `n8n-chat.js`

The single file contains:
- ✅ **N8NChatClient** - Core client for API communication
- ✅ **N8NChatUI** - Beautiful chat interface
- ✅ **Auto-initialization** - Automatic setup from config
- ✅ **All styles** - Complete CSS injected automatically

## 🚀 Complete Example

This is literally all you need:

```html
<!DOCTYPE html>
<html>
<head>
  <title>My Site</title>
</head>
<body>
  <h1>Welcome!</h1>
  
  <script>
    window.N8N_CHAT_CONFIG = {
      chatUrl: 'YOUR_N8N_WEBHOOK_URL'
    };
  </script>
  <script src="https://cdn.jsdelivr.net/gh/importsource/free-chatui@v1.0.0-alpha/n8n-chat.js"></script>
</body>
</html>
```

**That's it!** Chat button appears, click to start chatting.

## 🎨 With Customization

Still just one file, with all options:

```html
<script>
  window.N8N_CHAT_CONFIG = {
    chatUrl: 'YOUR_URL',
    title: 'Support',
    placeholder: 'Ask anything...',
    button: {
      enabled: true,
      icon: '💬',
      radius: '50%',
      shadow: '0 4px 20px rgba(0,0,0,0.25)'
    }
  };
</script>
<script src="https://cdn.jsdelivr.net/gh/importsource/free-chatui@v1.0.0-alpha/n8n-chat.js"></script>
```

## 🔧 For Advanced Users

If you still want separate files (e.g., using only the client without UI):

**Client Only:**
```html
<script src="n8n-chat-client.js"></script>
<script>
  const client = new N8NChatClient({chatUrl: 'YOUR_URL'});
  // Build your own UI
</script>
```

**Both Files Separately:**
```html
<script src="n8n-chat-client.js"></script>
<script src="n8n-chat-ui.js"></script>
```

## 📊 File Comparison

| File | Size | Contains | Use Case |
|------|------|----------|----------|
| `n8n-chat.js` | ~30KB | Everything | **Recommended** - Complete solution |
| `n8n-chat-client.js` | ~8KB | Client only | Custom UI development |
| `n8n-chat-ui.js` | ~25KB | UI only | Requires client |

## 💡 Migration from 2 Files to 1 File

**Find and Replace:**
```html
<!-- Old -->
<script src="n8n-chat-client.js"></script>
<script src="n8n-chat-ui.js"></script>

<!-- New -->
<script src="https://cdn.jsdelivr.net/gh/importsource/free-chatui@v1.0.0-alpha/n8n-chat.js"></script>
```

That's it! Everything else stays the same.

## 🎯 Why One File?

- ✅ **Simpler**: Less to download and include
- ✅ **Faster**: One HTTP request instead of two
- ✅ **Easier**: Less confusion for users
- ✅ **Cleaner**: Fewer files to manage
- ✅ **Still Flexible**: Separate files available if needed

## 📚 Next Steps

1. Download `n8n-chat.js`
2. Add to your HTML
3. Set your webhook URL
4. Done! 🎉

See `minimal-example.html` for the absolute simplest working example.

