# UI-S2-02: Edit Profile Modal / Page
**StudySpace — Sprint S2**
Prepared by: UI Designer · Approved by: Architect

---

## Pattern
- Desktop: Modal (max-width 560px)
- Mobile: Full page (not bottom sheet — too much content)

---

## Desktop Modal Spec

**Container:**
- Background: background.elevated
- radius-lg (14px), shadow-lg
- Max-width: 560px
- z-index: modal

**Header:**
- Title: "Edit Profile" (h3 token)
- Close icon-button: ghost variant, top-right
- Border-bottom: 1px border.subtle
- Padding: 20px 24px

**Body:**
- Padding: 24px
- Scrollable (max-height: 70vh)

---

## Form Fields (top to bottom)

### 1. Avatar Upload
- Shows current avatar (80px, radius-full), centered
- "Change Photo" ghost button below avatar
- Clicking opens UI-S2-04 Avatar Upload component
- Margin-bottom: 24px

### 2. Display Name Input
- Label: "Display Name" (label token, text.secondary)
- Placeholder: "Your full name"
- Max-length: 50 characters
- Character counter: appears at 40+ chars, right-aligned (caption, text.muted) e.g. "43/50"
- Validation: required, min 2 chars, error on blur if empty

### 3. Bio Textarea
- Label: "Bio"
- Placeholder: "Tell students what you study..."
- Min-height: 96px, resize vertical only
- 500 character limit
- Counter always visible, right-aligned below:
  - Default: caption, text.muted — "0/500"
  - Warning (450+): status.warning.text — "456/500"
  - Error (500): status.error.text — "500/500"
- Save button disables if over 500 chars

### 4. Stream Dropdown
- Label: "Stream"
- Options: Science · Commerce · Arts · Engineering
- Placeholder: "Select your stream"
- Custom styled (not native select):
  - Background: background.surface
  - Border: 1px border.default → primary.500 on focus
  - radius-md, body token text
  - Chevron icon right-aligned
- Dropdown popover:
  - background.elevated, shadow-md, radius-md
  - z-index: dropdown
  - Each option: 40px height
  - Hover: background.elevated at 80%

### 5. Class / Year Dropdown
- Label: "Class / Year"
- Options: 11th · 12th · 1st Year · 2nd Year · 3rd Year
- Placeholder: "Select your class"
- Same style as Stream dropdown

---

## Footer

- Border-top: 1px border.subtle
- Padding: 16px 24px
- Buttons: right-aligned, gap 12px
- Cancel: Ghost variant, md size — closes modal, no save
- Save Changes: Primary variant, md size
- Loading state: spinner icon + "Saving..." label, button disabled
- On success: modal closes + success Toast ("Profile updated!")

---

## Mobile — Full Page

```
┌──────────────────────────────┐
│ ✕ Cancel  Edit Profile  Save │  ← sticky top bar
├──────────────────────────────┤
│     [Avatar 80px + Change]   │
│                              │
│  Display Name                │
│  [________________________]  │
│                              │
│  Bio                         │
│  [________________________]  │
│  [________________________]  │
│                     423/500  │
│                              │
│  Stream                      │
│  [Science             ▾ ]   │
│                              │
│  Class / Year                │
│  [2nd Year            ▾ ]   │
│                              │
└──────────────────────────────┘
```

- Save/Cancel in sticky top bar (iOS/Android pattern)
- Body scrolls freely
- Full-width inputs and dropdowns
