# Theme Customization Guide - N8N Chat Library

## 🎨 What is the Theme System?

The theme system allows you to fully customize the appearance of your chat widget to match your brand colors, create dark mode, or completely change the look and feel.

## 🚀 Quick Theme Setup

### Simple Color Change
```javascript
window.N8N_CHAT_CONFIG = {
  chatUrl: 'YOUR_URL',
  theme: {
    primaryColor: '#4a90e2',    // Your brand color
    secondaryColor: '#357abd'   // Accent color
  }
};
```

That's it! The chat will automatically use your colors for:
- Header background (gradient)
- User message bubbles (gradient)  
- Send button
- Input focus border
- Starter prompt text
- Bot avatar

## 🎯 Theme Properties

### Core Colors

**primaryColor** (Default: `#667eea`)
- Main brand color
- Used for gradients, buttons, and accents
- Example: `'#4a90e2'`, `'#ff6b6b'`, `'#4caf50'`

**secondaryColor** (Default: `#764ba2`)
- Secondary color for gradients
- Pairs with primaryColor
- Example: `'#357abd'`, `'#ee5a6f'`, `'#388e3c'`

### Message Styling

**userMessageBg** (Default: `null`)
- User message bubble background
- `null` = auto-generates gradient from primaryColor + secondaryColor
- Example: `'#4a90e2'`, `null`, `linear-gradient(...)`

**userMessageColor** (Default: `#ffffff`)
- User message text color
- Example: `'#ffffff'`, `'#000000'`

**botMessageBg** (Default: `#ffffff`)
- Bot message bubble background
- Example: `'#ffffff'`, `'#f5f5f5'`, `'#2c2c2c'`

**botMessageColor** (Default: `#333333`)
- Bot message text color
- Example: `'#333333'`, `'#ffffff'`, `'#000000'`

### Header Styling

**headerBg** (Default: `null`)
- Chat header background
- `null` = auto-generates gradient from primaryColor + secondaryColor
- Example: `'#4a90e2'`, `null`, `linear-gradient(...)`

**headerColor** (Default: `#ffffff`)
- Header text color
- Example: `'#ffffff'`, `'#000000'`

### Interface Elements

**chatBg** (Default: `#f7f8fc`)
- Background color of the messages area
- Example: `'#f7f8fc'`, `'#ffffff'`, `'#1e1e1e'`

**inputBorder** (Default: `#e5e7eb`)
- Input field border color
- Example: `'#e5e7eb'`, `'#4a90e2'`, `'#444'`

### Typography

**fontFamily** (Default: System fonts)
- Font family for the entire chat interface
- Example: `'"Inter", sans-serif'`, `'"Roboto", sans-serif'`

## 🎨 Pre-Made Themes

### 1. Blue Professional
```javascript
theme: {
  primaryColor: '#4a90e2',
  secondaryColor: '#357abd',
  chatBg: '#f0f7ff'
}
```

### 2. Green Nature
```javascript
theme: {
  primaryColor: '#4caf50',
  secondaryColor: '#388e3c',
  chatBg: '#f1f8f4'
}
```

### 3. Red/Pink Vibrant
```javascript
theme: {
  primaryColor: '#ff6b6b',
  secondaryColor: '#ee5a6f',
  chatBg: '#fff5f5'
}
```

### 4. Orange Warm
```javascript
theme: {
  primaryColor: '#ff9800',
  secondaryColor: '#f57c00',
  chatBg: '#fff8f0'
}
```

### 5. Teal Modern
```javascript
theme: {
  primaryColor: '#00bcd4',
  secondaryColor: '#0097a7',
  chatBg: '#e0f7fa'
}
```

### 6. Dark Mode
```javascript
theme: {
  primaryColor: '#2c3e50',
  secondaryColor: '#34495e',
  chatBg: '#1e1e1e',
  botMessageBg: '#2c2c2c',
  botMessageColor: '#ffffff',
  userMessageBg: '#4a5568',
  userMessageColor: '#ffffff',
  inputBorder: '#444'
}
```

### 7. Monochrome
```javascript
theme: {
  primaryColor: '#000000',
  secondaryColor: '#333333',
  chatBg: '#f5f5f5',
  headerBg: '#000000',
  userMessageBg: '#333333'
}
```

### 8. Light & Minimal
```javascript
theme: {
  primaryColor: '#6b7280',
  secondaryColor: '#9ca3af',
  chatBg: '#ffffff',
  botMessageBg: '#f9fafb',
  userMessageBg: '#e5e7eb',
  userMessageColor: '#111827'
}
```

### 9. Purple Default
```javascript
theme: {
  primaryColor: '#667eea',
  secondaryColor: '#764ba2',
  chatBg: '#f7f8fc'
}
```

## 🎯 Use Cases by Industry

### Technology/SaaS
```javascript
theme: {
  primaryColor: '#4a90e2',
  secondaryColor: '#357abd',
  chatBg: '#f0f7ff',
  fontFamily: '"Inter", sans-serif'
}
```

### Healthcare
```javascript
theme: {
  primaryColor: '#4caf50',
  secondaryColor: '#388e3c',
  chatBg: '#f1f8f4'
}
```

### Finance
```javascript
theme: {
  primaryColor: '#1a237e',
  secondaryColor: '#283593',
  chatBg: '#e8eaf6'
}
```

### E-commerce/Retail
```javascript
theme: {
  primaryColor: '#ff6b6b',
  secondaryColor: '#ee5a6f',
  chatBg: '#fff5f5'
}
```

### Education
```javascript
theme: {
  primaryColor: '#ff9800',
  secondaryColor: '#f57c00',
  chatBg: '#fff8f0'
}
```

## 💡 Best Practices

### Do's:
- ✅ Use your brand's primary color for consistency
- ✅ Ensure good contrast (text should be readable)
- ✅ Test on both light and dark backgrounds
- ✅ Keep it simple - just primaryColor and secondaryColor is often enough
- ✅ Use web-safe colors
- ✅ Test on mobile devices

### Don'ts:
- ❌ Don't use low-contrast combinations
- ❌ Don't over-customize (keep defaults when possible)
- ❌ Don't forget to test readability
- ❌ Don't use too many different colors
- ❌ Don't ignore accessibility

## 🔧 Advanced Theming

### Gradient Customization

Set custom gradients:
```javascript
theme: {
  headerBg: 'linear-gradient(135deg, #ff6b6b 0%, #feca57 100%)',
  userMessageBg: 'linear-gradient(to right, #4facfe 0%, #00f2fe 100%)'
}
```

### Complete Custom Theme

```javascript
theme: {
  // Colors
  primaryColor: '#your-brand-color',
  secondaryColor: '#your-accent-color',
  
  // Messages
  userMessageBg: 'linear-gradient(135deg, #color1, #color2)',
  userMessageColor: '#ffffff',
  botMessageBg: '#ffffff',
  botMessageColor: '#333333',
  
  // Header
  headerBg: '#your-header-color',
  headerColor: '#ffffff',
  
  // Interface
  chatBg: '#your-bg-color',
  inputBorder: '#your-border-color',
  
  // Typography
  fontFamily: '"Your Font", -apple-system, sans-serif'
}
```

### Dynamic Themes

```javascript
// Theme based on time of day
const hour = new Date().getHours();
const isDark = hour < 6 || hour > 18;

window.N8N_CHAT_CONFIG = {
  chatUrl: 'YOUR_URL',
  theme: isDark ? {
    primaryColor: '#2c3e50',
    chatBg: '#1e1e1e',
    botMessageBg: '#2c2c2c',
    botMessageColor: '#ffffff'
  } : {
    primaryColor: '#4a90e2',
    chatBg: '#f0f7ff'
  }
};

// Theme based on user preference
const userTheme = localStorage.getItem('theme') || 'light';

window.N8N_CHAT_CONFIG = {
  chatUrl: 'YOUR_URL',
  theme: userTheme === 'dark' ? darkThemeConfig : lightThemeConfig
};
```

## 📊 Theme Testing Checklist

- [ ] Test all colors have good contrast
- [ ] Check on light backgrounds
- [ ] Check on dark backgrounds
- [ ] Verify mobile appearance
- [ ] Test with different screen sizes
- [ ] Ensure text is readable
- [ ] Check avatar visibility
- [ ] Verify button colors
- [ ] Test input field visibility
- [ ] Check timestamps (if enabled)

## 🎨 Accessibility Considerations

### Contrast Ratios
- Text should have at least 4.5:1 contrast ratio
- Large text (18px+) should have at least 3:1 contrast ratio
- Test with tools like WebAIM Contrast Checker

### Color Blindness
- Don't rely solely on color to convey information
- Ensure sufficient brightness difference
- Test with color blindness simulators

## 📖 Examples

See these files for live theme examples:
- `theme-example.html` - 9 different pre-made themes
- `complete-example.html` - All features with theme
- `simple-example.html` - Basic implementation

## 🔗 Quick Reference

**Minimal theme (recommended):**
```javascript
theme: { primaryColor: '#YOUR_COLOR', secondaryColor: '#YOUR_ACCENT' }
```

**Dark mode:**
```javascript
theme: {
  primaryColor: '#2c3e50',
  chatBg: '#1e1e1e',
  botMessageBg: '#2c2c2c',
  botMessageColor: '#ffffff'
}
```

**Brand matching:**
```javascript
theme: {
  primaryColor: '#YOUR_BRAND_COLOR',
  chatBg: '#YOUR_BG_COLOR',
  fontFamily: '"Your Brand Font", sans-serif'
}
```

---

Transform your chat widget to perfectly match your brand! 🎨

