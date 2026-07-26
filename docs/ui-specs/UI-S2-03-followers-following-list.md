# UI-S2-03: Followers / Following List
**StudySpace — Sprint S2**
Prepared by: UI Designer · Approved by: Architect

---

## Pattern
- Desktop: Modal
- Mobile: Bottom Sheet
- Trigger: Clicking Followers or Following stat on Profile page

---

## Desktop Modal Spec

**Container:**
- Background: background.elevated
- radius-lg, shadow-lg
- Max-width: 440px
- Max-height: 600px
- z-index: modal

**Header:**
- Title: "Followers" or "Following" (h3 token)
- Count in brackets: text.muted, caption — e.g. "Followers · 1,243"
- Close icon-button: ghost, top-right
- Border-bottom: 1px border.subtle
- Padding: 20px 24px

**Search Bar (below header):**
- Full-width, height 36px (sm), radius-md
- Placeholder: "Search users..."
- Magnifier icon: left-inside, text.muted
- Filters list in real-time

---

## User List

- Scrollable body, max-height: 480px
- Padding: 8px 0

### User List Item

```
┌────────────────────────────────────────────┐
│ [Avatar 32px]  displayName      [Follow]   │
│                @username                   │
└────────────────────────────────────────────┘
```

- Height: 64px, padding: 0 16px
- Avatar: md size (32px), radius-full
- Name: body-sm/semibold, text.primary
- Handle: caption, text.muted
- Follow button: sm size
  - Not following → Primary "Follow"
  - Following → Secondary "Following"
- Row hover: background.surface bg
- Click name/avatar → navigate to profile, close modal

---

## Empty State

```
┌────────────────────────────────────────────┐
│                                            │
│              👥                            │
│         No followers yet                   │
│   Share your notes to get discovered       │
│        by other students                   │
│                                            │
└────────────────────────────────────────────┘
```

- Icon: 40px, text.muted
- Title: h4 token, text.secondary
- Subtitle: body-sm, text.muted
- All centered, padding: 48px 24px

---

## Loading Skeleton

5 skeleton rows, each 64px height:

```
┌────────────────────────────────────────────┐
│ [●●●●]  [████████████]        [███████]   │
│          [████████]                        │
└────────────────────────────────────────────┘
```

- Avatar: 32px circle, background.elevated
- Name bar: 120px × 14px, radius-sm, background.elevated
- Handle bar: 80px × 12px, radius-sm, background.elevated
- Button: 72px × 28px, radius-md, background.elevated
- Shimmer: gradient sweeps left→right
  primary.500 at 5% opacity, 1.5s infinite

---

## Mobile — Bottom Sheet

- Slides up from bottom
- radius-xl top corners only
- Max-height: 85vh
- Drag-to-dismiss: Framer Motion drag="y"
- Drag handle: 4px × 32px pill, background.elevated, centered top, margin 12px auto
- Search bar sticky below sheet header
- Same list content as modal
