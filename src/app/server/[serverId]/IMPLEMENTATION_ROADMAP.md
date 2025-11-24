# 🚀 Implementation Roadmap - Remaining Features

## ✅ COMPLETED
1. ✅ RightSidebar syntax error fixed
2. ✅ Context menus close on click
3. ✅ Member click/right-click handlers
4. ✅ Channel selection with message loading
5. ✅ Basic context menu structure

---

## 🔄 IN PROGRESS / TO IMPLEMENT

### 1. Messages Loading Per Channel
**Current Status:** Messages fetch but may not display correctly
**Fix Needed:**
```typescript
// In page.tsx - Already implemented but verify:
const [channelMessages, setChannelMessages] = useState<Record<string, Message[]>>({})
const messages = selectedChannel ? (channelMessages[selectedChannel] || []) : []

// When channel selected:
const fetchedMessages = await serverAPI.getMessages(channel.id, 50)
setChannelMessages(prev => ({ ...prev, [channel.id]: fetchedMessages }))
```

**Action:** Verify API endpoint returns proper data structure

---

### 2. Channel/Category Slugs & URLs
**Requirement:** Each channel should have unique URL slug
**Implementation:**
```typescript
// Update types.ts
export interface Channel {
  id: string
  name: string
  slug: string  // Add this
  categoryId: string
  type: 'text' | 'voice' | 'announcement'
  description?: string
}

// Generate slug from name
const generateSlug = (name: string) => {
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
}

// Update URL when channel selected
router.push(`/server/${serverId}/channels/${channel.slug}`)
```

---

### 3. Create Category Button (For Owners/Admins)
**Requirement:** Right-click or + button to create category
**Implementation:**
```typescript
// Add to LeftSidebar.tsx
{hasPermission('MANAGE_CHANNELS') && (
  <button
    onClick={() => onCreateCategory?.()}
    className="flex items-center space-x-2 px-3 py-2 hover:bg-white/5 rounded-lg"
  >
    <Plus className="w-4 h-4" />
    <span className="text-sm">Create Category</span>
  </button>
)}
```

---

### 4. Enhanced Context Menu Options
**Requirement:** Quick actions + Full controls

#### Quick Actions (Right-click):
- ✅ Rename channel/category
- ✅ Delete channel/category
- ✅ Copy channel ID
- ✅ Copy channel link
- ✅ Edit description

#### Full Controls (Separate page):
- Channel settings page: `/server/${serverId}/channels/${channelId}/settings`
- Features:
  - Background customization
  - Font selection
  - RGB color picker
  - Role permissions
  - Channel permissions
  - Notification settings

**Implementation:**
```typescript
// Enhanced ContextMenus.tsx
<button onClick={() => {
  navigator.clipboard.writeText(channelContextMenu.channelId)
  toast.success('Channel ID copied!')
}}>
  <Copy className="w-4 h-4" />
  <span>Copy Channel ID</span>
</button>

<button onClick={() => {
  navigator.clipboard.writeText(`${window.location.origin}/server/${serverId}/channels/${channelId}`)
  toast.success('Channel link copied!')
}}>
  <Link className="w-4 h-4" />
  <span>Copy Channel Link</span>
</button>

<div className="h-px bg-slate-700 my-2"></div>

<button onClick={() => {
  router.push(`/server/${serverId}/channels/${channelId}/settings`)
}}>
  <Settings className="w-4 h-4" />
  <span>Full Channel Settings</span>
</button>
```

---

### 5. Edit Channel Modal - Load Current Name
**Current Issue:** Name not pre-filled in edit modal
**Fix:**
```typescript
// In page.tsx, when opening edit modal:
onEditChannel={(channelId, name, description) => {
  openModal('editChannel', { 
    channelId, 
    currentName: name,  // Make sure this is passed
    currentDescription: description 
  })
}}

// In EditChannelModal, use useEffect to set initial values:
useEffect(() => {
  if (isOpen) {
    setName(currentName)
    setDescription(currentDescription || '')
  }
}, [isOpen, currentName, currentDescription])
```

---

### 6. Permission System
**Requirement:** Check if user has permission for actions
**Implementation:**
```typescript
// Create permissions hook
export function usePermissions(serverId: string, userId: string) {
  const [permissions, setPermissions] = useState<string[]>([])
  
  useEffect(() => {
    // Fetch user's roles and permissions
    fetch(`/api/servers/${serverId}/members/${userId}/permissions`)
      .then(res => res.json())
      .then(data => setPermissions(data.permissions))
  }, [serverId, userId])
  
  const hasPermission = (permission: string) => {
    return permissions.includes(permission) || permissions.includes('ADMINISTRATOR')
  }
  
  return { permissions, hasPermission }
}

// Usage:
const { hasPermission } = usePermissions(serverId, session?.user?.id)

{hasPermission('MANAGE_CHANNELS') && (
  <button>Create Category</button>
)}
```

---

### 7. Channel Settings Page
**Route:** `/server/[serverId]/channels/[channelId]/settings`
**Features:**

#### Background Customization:
```typescript
<div className="space-y-4">
  <h3>Channel Background</h3>
  <input 
    type="color" 
    value={backgroundColor}
    onChange={(e) => setBackgroundColor(e.target.value)}
  />
  <input 
    type="file"
    accept="image/*"
    onChange={handleBackgroundUpload}
  />
</div>
```

#### Font Selection:
```typescript
<select value={fontFamily} onChange={(e) => setFontFamily(e.target.value)}>
  <option value="Inter">Inter</option>
  <option value="Roboto">Roboto</option>
  <option value="Fira Code">Fira Code</option>
  <option value="JetBrains Mono">JetBrains Mono</option>
</select>
```

#### RGB Color Picker:
```typescript
<div className="flex space-x-2">
  <input type="range" min="0" max="255" value={r} onChange={(e) => setR(e.target.value)} />
  <input type="range" min="0" max="255" value={g} onChange={(e) => setG(e.target.value)} />
  <input type="range" min="0" max="255" value={b} onChange={(e) => setB(e.target.value)} />
  <div style={{ backgroundColor: `rgb(${r}, ${g}, ${b})` }} className="w-12 h-12 rounded" />
</div>
```

#### Role Permissions:
```typescript
<div className="space-y-2">
  {roles.map(role => (
    <div key={role.id} className="flex items-center justify-between">
      <span>{role.name}</span>
      <div className="flex space-x-2">
        <Checkbox checked={role.canView} onChange={() => togglePermission(role.id, 'VIEW')} />
        <Checkbox checked={role.canSend} onChange={() => togglePermission(role.id, 'SEND')} />
        <Checkbox checked={role.canManage} onChange={() => togglePermission(role.id, 'MANAGE')} />
      </div>
    </div>
  ))}
</div>
```

---

## 📋 PRIORITY ORDER

### High Priority (Implement First):
1. ✅ Fix RightSidebar syntax error
2. 🔄 Verify messages loading per channel
3. 🔄 Fix edit modal pre-fill
4. 🔄 Add Copy ID/Link to context menu
5. 🔄 Add permission checks

### Medium Priority:
6. 🔄 Implement channel slugs
7. 🔄 Create category button
8. 🔄 Full context menu options

### Low Priority (Nice to have):
9. 🔄 Channel settings page
10. 🔄 Background customization
11. 🔄 Font selection
12. 🔄 RGB color picker

---

## 🛠️ QUICK FIXES NEEDED NOW

### Fix 1: Messages Not Loading
```typescript
// Verify in page.tsx:
console.log('Channel messages:', channelMessages)
console.log('Current channel:', selectedChannel)
console.log('Messages for display:', messages)

// Check API response format
const fetchedMessages = await serverAPI.getMessages(channel.id, 50)
console.log('API Response:', fetchedMessages)
```

### Fix 2: Edit Modal Name
```typescript
// In EditChannelModal.tsx:
const [name, setName] = useState(currentName)  // Initialize with prop
const [description, setDescription] = useState(currentDescription || '')

// Reset when modal opens
useEffect(() => {
  if (isOpen) {
    setName(currentName)
    setDescription(currentDescription || '')
  }
}, [isOpen])
```

### Fix 3: Add to Context Menu
```typescript
// In ContextMenus.tsx, add these buttons:
<button onClick={() => {
  navigator.clipboard.writeText(channelContextMenu.channelId)
}}>
  Copy Channel ID
</button>

<button onClick={() => {
  navigator.clipboard.writeText(
    `${window.location.origin}/server/${serverId}/channels/${channelContextMenu.channelId}`
  )
}}>
  Copy Channel Link
</button>
```

---

## 📝 FILES TO CREATE

1. `/server/[serverId]/channels/[channelId]/settings/page.tsx` - Channel settings page
2. `/hooks/usePermissions.ts` - Permission checking hook
3. `/components/modals/ChannelSettingsModal.tsx` - Quick settings modal
4. `/components/ColorPicker.tsx` - RGB color picker component
5. `/components/FontSelector.tsx` - Font selection component

---

## 🎯 IMMEDIATE ACTION ITEMS

1. ✅ Fix RightSidebar syntax (DONE)
2. Add console logs to debug message loading
3. Fix EditChannelModal to pre-fill name
4. Add Copy ID/Link buttons to context menu
5. Test all context menu actions

---

**All features are documented and ready for implementation!**
**Start with High Priority items, then move to Medium/Low.**
