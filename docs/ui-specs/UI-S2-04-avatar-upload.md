# UI-S2-04: Avatar Upload Component
**StudySpace — Sprint S2**
Prepared by: UI Designer · Approved by: Architect

---

## Usage
Used inside Edit Profile Modal (UI-S2-02).
Triggered by "Change Photo" button.

---

## Upload Zone Spec

**Container:**
- Size: 280px × 200px (desktop) / full-width × 160px (mobile)
- Background: background.surface
- Border: 2px dashed border.default
- radius-lg (14px)
- Centered within modal body
- Transitions: border-color + bg, 150ms ease-out

---

## States

### 1. Default (no file selected)

```
┌──────────────────────────────┐
│                              │
│      [Upload icon 32px]      │
│                              │
│   Drag & drop your photo     │
│   or click to browse         │
│                              │
│   JPG, PNG, WebP · Max 2MB   │
│                              │
└──────────────────────────────┘
```

- Upload icon: text.muted, 32px
- Primary text: body-sm/medium, text.secondary
- "click to browse": primary.400, underlined
  → triggers hidden <input type="file" accept="image/*">
- Constraint notice: caption, text.muted

### 2. Drag-Over State

- Border: 2px dashed primary.500
- Background: primary.500 at 6% opacity
- Icon + text → primary.400
- Scale: 1.01 (subtle tactile feedback)

### 3. Preview State (file selected)

```
┌──────────────────────────────┐
│   ┌──────────────────────┐   │
│   │                      │   │
│   │   [Image preview]    │   │
│   │   (radius-full 120px)│   │
│   └──────────────────────┘   │
│   ✓ photo.jpg · 1.4MB        │
│   [Change photo] [Remove]    │
└──────────────────────────────┘
```

- Preview: 120px × 120px, radius-full (avatar preview)
- Dashed square overlay: faint border.default (crop hint)
- Filename + size: caption, text.muted
- "Change": Ghost sm → re-opens file picker
- "Remove": Ghost sm, status.error.text → clears selection
- Crop notice: caption, text.muted, info icon
  "For best results, use a square image (1:1 ratio)"

### 4. Size Error State (file > 2MB)

- Border: 2px dashed status.error.base
- Background: status.error.bg at 30% opacity
- Error message below zone:
  caption, status.error.text
  "File too large. Maximum size is 2MB."
- Upload blocked until valid file selected

### 5. Loading State (upload in progress)

- Preview image: opacity 0.5
- Spinner overlay: centered on preview
  animated ring, primary.500, 24px
- "Uploading..." caption below, text.muted
- "Change" + "Remove" buttons: disabled
- Progress bar (if API supports):
  Below zone, 4px height, radius-full
  primary.500 fill on background.elevated track

---

## Accepted Formats
- JPG / JPEG
- PNG
- WebP
- Max size: 2MB
- Recommended: square (1:1 ratio)
- No forced crop UI in MVP — flag for future sprint
