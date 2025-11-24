# 🚀 Quick Reference Guide - Server/[serverId] Page

## 🖱️ HOW TO USE CONTEXT MENUS

### Right-Click on Channel
```
Right-click any channel → Context menu appears
├─ Edit Channel → Opens edit modal
├─ Copy Channel Link → Copies URL to clipboard
├─ Notification Settings → (Coming soon)
├─ Privacy Settings → (Coming soon)
├─ Mark as Read → (Coming soon)
├─ Mute Channel → (Coming soon)
└─ Delete Channel → Opens confirmation modal
```

### Right-Click on Category
```
Right-click category header → Context menu appears
├─ Create Channel → Opens create channel modal
├─ Edit Category → Opens edit modal
├─ Category Settings → (Coming soon)
└─ Delete Category → Opens confirmation modal
```

### Server Dropdown
```
Click server name → Dropdown opens
├─ Invite People → Opens invite modal (generates link)
├─ Server Boost → Navigates to boost page
└─ Server Settings → Navigates to settings page
```

---

## 💬 CHAT FEATURES

### Send Message
1. Type in the input box at bottom
2. Press Enter to send (Shift+Enter for new line)
3. Message sent via API: `POST /api/channels/{channelId}/messages`

### Reply to Message
1. Hover over any message
2. Click reply icon
3. Reply preview appears above input
4. Type and send - includes `replyTo` parameter

### Mention Someone
1. Type `@` in message input
2. Dropdown appears with online members
3. Use arrow keys to navigate
4. Press Enter/Tab to select
5. Mentioned user gets notification

### Add Emoji
1. Click emoji button (😊) next to send
2. Quick emoji picker appears
3. Click emoji to add to message

---

## 🔔 NOTIFICATIONS

### View Mentions
- Bell icon in top-right shows unread count
- Red badge displays number
- Click bell to clear notifications
- Mentioned messages have yellow highlight

### Toggle Members Sidebar
- Click Users icon in top-right
- Sidebar slides in/out
- Cyan highlight when visible

---

## 📡 API CALLS REFERENCE

### When You Click...

**"Invite People"**
```typescript
POST /api/servers/{serverId}/invites
→ Generates invite code
→ Returns: { code, url, expiresAt }
```

**"Create Channel" (from context menu)**
```typescript
POST /api/servers/{serverId}/categories/{categoryId}/channels
Body: { name, type, description }
→ Creates new channel
```

**"Edit Channel"**
```typescript
PUT /api/channels/{channelId}
Body: { name, description }
→ Updates channel
```

**"Delete Channel"**
```typescript
DELETE /api/channels/{channelId}
→ Permanently deletes channel
```

**Send Message**
```typescript
POST /api/channels/{channelId}/messages
Body: { content, replyTo? }
→ Sends message to channel
```

**Select Channel**
```typescript
GET /api/channels/{channelId}/messages?limit=50
→ Loads last 50 messages
```

---

## 🎨 THEME COLORS

### Copy-Paste Ready Colors

```css
/* Backgrounds */
background: #050406;           /* Main background */
background: #0a0a0c;           /* Modals, inputs */
background: rgba(255,255,255,0.05); /* Hover */
background: rgba(0,255,255,0.1);    /* Active/Selected */

/* Borders */
border-color: rgba(0,255,255,0.1);  /* Subtle */
border-color: rgba(0,255,255,0.2);  /* Medium */
border-color: rgba(0,255,255,0.3);  /* Strong */

/* Text */
color: #ffffff;                     /* Primary */
color: rgba(255,255,255,0.7);       /* Secondary */
color: rgba(255,255,255,0.5);       /* Muted */
color: #00ffff;                     /* Accent */
```

---

## 🔧 TROUBLESHOOTING

### Context Menu Not Appearing?
1. Make sure you're right-clicking on channel/category
2. Browser context menu should be disabled
3. Check console for errors

### Messages Not Loading?
1. Check if channel is selected (cyan highlight)
2. Open browser console - should see "Loaded messages:"
3. Verify API endpoint is accessible

### Modal Not Opening?
1. Check if button has onClick handler
2. Verify modal state in React DevTools
3. Look for console errors

### Emojis Not Showing?
1. Ensure system has emoji font installed
2. Check if using native emoji characters
3. Verify font-family includes emoji support

---

## 📱 RESPONSIVE BREAKPOINTS

```css
/* Mobile */
< 640px  → Compact layout, hidden descriptions

/* Tablet */
640px - 1024px → Medium layout, essential features

/* Desktop */
> 1024px → Full layout, all features visible
```

---

## ⌨️ KEYBOARD SHORTCUTS (Coming Soon)

```
Enter          → Send message
Shift+Enter    → New line
Ctrl+K         → Quick channel switcher
Ctrl+/         → Show shortcuts
Esc            → Close modal/menu
@              → Mention autocomplete
:              → Emoji autocomplete (coming)
```

---

## 🐛 KNOWN ISSUES & SOLUTIONS

### Issue: "Cannot read property 'id' of undefined"
**Solution:** Channel not loaded yet, add null check:
```typescript
if (!currentChannel) return null
```

### Issue: Context menu appears off-screen
**Solution:** Already handled with `transform: translate(-50%, -10px)`

### Issue: Messages don't update after sending
**Solution:** Need to refresh or implement WebSocket for real-time

### Issue: Modal backdrop not clickable
**Solution:** Add `onClick={onClose}` to backdrop div

---

## 🎯 QUICK TIPS

1. **Right-click is your friend** - Most actions via context menus
2. **@ for mentions** - Quick way to notify someone
3. **Bell icon** - Check your mentions anytime
4. **Hover for actions** - Message actions appear on hover
5. **Cyan = Active** - Selected items have cyan tint
6. **Black is beautiful** - Mad black theme throughout

---

## 📞 SUPPORT

If something doesn't work:
1. Check browser console (F12)
2. Verify API endpoints are accessible
3. Check network tab for failed requests
4. Review this guide for proper usage
5. Check INTEGRATION_COMPLETE.md for technical details

---

**Everything is ready to use! Start by right-clicking a channel or category to see the magic! ✨**
