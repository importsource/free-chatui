# Starter Prompts Guide - N8N Chat Library

## What are Starter Prompts?

Starter prompts (also called quick replies or suggested questions) are clickable buttons that help users start a conversation quickly without typing. They appear after the welcome message and remain visible throughout the conversation, allowing users to click multiple prompts as needed.

## 🎯 Why Use Starter Prompts?

### Benefits:
- ✅ **Reduce friction** - Users don't need to think about what to ask
- ✅ **Faster engagement** - One click to start chatting
- ✅ **Guide conversations** - Direct users to topics you can help with
- ✅ **Lower abandonment** - More users will engage with pre-written prompts
- ✅ **Mobile-friendly** - Much easier than typing on mobile
- ✅ **Professional** - Shows you understand common needs
- ✅ **Reusable** - Prompts stay visible, users can click multiple times

## 🚀 Quick Setup

```javascript
window.N8N_CHAT_CONFIG = {
  chatUrl: 'YOUR_N8N_WEBHOOK_URL',
  welcomeMessage: 'Hello! 👋 How can I help you today?',
  starterPrompts: [
    'What are your hours?',
    'Track my order',
    'Return policy',
    'Contact support'
  ]
};
```

That's it! Prompts will appear automatically after the welcome message.

## 📋 Examples by Use Case

### Customer Support
```javascript
starterPrompts: [
  'What are your hours?',
  'Track my order',
  'Return policy',
  'Contact support'
]
```

### E-Commerce
```javascript
starterPrompts: [
  '🛍️ Browse products',
  '📦 Check order status',
  '💳 Payment options',
  '🚚 Shipping information'
]
```

### SaaS/Product
```javascript
starterPrompts: [
  'How does it work?',
  'See pricing plans',
  'Request a demo',
  'Compare features'
]
```

### Technical Support
```javascript
starterPrompts: [
  '🔧 Troubleshooting help',
  '📱 Setup guide',
  '🔐 Reset password',
  '📞 Talk to an agent'
]
```

### Sales & Lead Generation
```javascript
starterPrompts: [
  'Start free trial',
  'Book a consultation',
  'Get a quote',
  'Download brochure'
]
```

### General Information
```javascript
starterPrompts: [
  'About us',
  'Our services',
  'Pricing',
  'Get started'
]
```

### Restaurant/Food Service
```javascript
starterPrompts: [
  '🍕 View menu',
  '📍 Locations',
  '🕐 Hours & delivery',
  '📞 Place an order'
]
```

### Healthcare/Medical
```javascript
starterPrompts: [
  'Book an appointment',
  'Find a doctor',
  'Insurance accepted',
  'Patient portal'
]
```

### Education
```javascript
starterPrompts: [
  'Course information',
  'Enrollment process',
  'Financial aid',
  'Contact admissions'
]
```

## 🎨 Styling Tips

### With Emojis (More Engaging)
```javascript
starterPrompts: [
  '💬 Ask a question',
  '🎯 Get started',
  '📚 Learn more',
  '👋 Say hello'
]
```

### Without Emojis (Professional)
```javascript
starterPrompts: [
  'Ask a question',
  'Get started',
  'Learn more',
  'Contact us'
]
```

### Question Format (Natural)
```javascript
starterPrompts: [
  'What products do you offer?',
  'How much does it cost?',
  'Can I get a refund?',
  'Do you ship internationally?'
]
```

### Statement Format (Direct)
```javascript
starterPrompts: [
  'Browse products',
  'Check order status',
  'View pricing',
  'Contact support'
]
```

## 📏 Best Practices

### Recommended Count
- **2-3 prompts:** Minimal, perfect for mobile
- **4 prompts:** Balanced, recommended ⭐
- **5-6 prompts:** Maximum before feeling crowded

### Writing Good Prompts

**Do:**
- ✅ Keep them short (under 50 characters)
- ✅ Use clear, simple language
- ✅ Address common questions first
- ✅ Use action verbs ("Track," "Get," "View")
- ✅ Test each prompt with your n8n workflow
- ✅ Consider mobile users (shorter is better)

**Don't:**
- ❌ Use more than 6 prompts
- ❌ Make them too long or complex
- ❌ Use technical jargon
- ❌ Duplicate similar questions
- ❌ Use prompts that need additional context

### Optimization Tips

1. **Analyze data**: Track which prompts get clicked most
2. **A/B test**: Try different prompt variations
3. **Update seasonally**: Change prompts for holidays/seasons
4. **Match intent**: Align prompts with page content
5. **Mobile first**: Test on small screens

## 🔄 How They Work

1. **Display**: Prompts appear after welcome message
2. **Click**: User clicks a prompt button
3. **Send**: Prompt text is automatically sent
4. **Stay visible**: Prompts remain available for users to click again
5. **Multi-use**: Users can click multiple prompts throughout the conversation
6. **Reset**: Prompts persist until conversation is reset

## 🎯 Advanced Usage

### Dynamic Prompts Based on Page

```javascript
// On product page
const productPrompts = [
  'Product details',
  'Pricing',
  'Reviews',
  'Buy now'
];

// On support page
const supportPrompts = [
  'Contact support',
  'Track order',
  'Returns',
  'FAQ'
];

// Set based on current page
window.N8N_CHAT_CONFIG = {
  chatUrl: 'YOUR_URL',
  starterPrompts: window.location.pathname.includes('product') 
    ? productPrompts 
    : supportPrompts
};
```

### Personalized Prompts

```javascript
// For logged-in users
const userPrompts = [
  'View my orders',
  'Update my profile',
  'Payment methods',
  'Support ticket'
];

// For anonymous users
const guestPrompts = [
  'Create account',
  'Browse products',
  'Learn more',
  'Contact us'
];

window.N8N_CHAT_CONFIG = {
  chatUrl: 'YOUR_URL',
  starterPrompts: isLoggedIn ? userPrompts : guestPrompts
};
```

### Multilingual Prompts

```javascript
const prompts = {
  en: ['Help', 'Products', 'Pricing', 'Contact'],
  es: ['Ayuda', 'Productos', 'Precios', 'Contacto'],
  fr: ['Aide', 'Produits', 'Prix', 'Contact']
};

window.N8N_CHAT_CONFIG = {
  chatUrl: 'YOUR_URL',
  starterPrompts: prompts[userLanguage] || prompts.en
};
```

## 📊 Prompt Ideas by Industry

### Retail/E-Commerce
- "What's on sale?"
- "Track my package"
- "Return an item"
- "Gift cards"

### Real Estate
- "Schedule a viewing"
- "Property search"
- "Mortgage info"
- "Contact an agent"

### Travel/Hospitality
- "Book a room"
- "Check availability"
- "Special offers"
- "Cancellation policy"

### Financial Services
- "Open an account"
- "Loan options"
- "Investment advice"
- "Speak to advisor"

### Technology/SaaS
- "Free trial"
- "Product demo"
- "Integration help"
- "Pricing tiers"

## 🎓 Examples to Learn From

See these files for live examples:
- `starter-prompts-example.html` - 9 different configurations
- `complete-example.html` - All features working together
- `simple-example.html` - Recommended setup

## 🔧 Troubleshooting

**Prompts not showing?**
- Check that `starterPrompts` is an array with at least one item
- Ensure `welcomeMessage` is enabled (prompts show after welcome)
- Verify the chat is open

**Prompts not hiding?**
- They should hide automatically after first message
- Check browser console for errors

**Prompts look weird on mobile?**
- Keep prompts short (under 40 characters for mobile)
- Test with fewer prompts (3-4 maximum on mobile)

## 📱 Mobile Considerations

- Use 2-4 prompts on mobile (fewer than desktop)
- Keep text shorter on mobile
- Test in portrait and landscape
- Ensure buttons are easy to tap (good spacing)

---

Starter prompts make your chat more accessible and user-friendly! 🎉

