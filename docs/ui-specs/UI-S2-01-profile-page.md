# UI-S2-01: Profile Page Design
**StudySpace — Sprint S2**
Prepared by: UI Designer · Approved by: Architect

---

## Desktop Layout

```
┌─────────────────────────────────────────────────────┐
│ SIDEBAR (240px)  │  PROFILE CONTENT AREA            │
│                  │                                   │
│  [Nav - UI-05]   │  ┌─────────────────────────────┐ │
│                  │  │ PROFILE HEADER               │ │
│                  │  │                              │ │
│                  │  │  [Avatar 120px]              │ │
│                  │  │                              │ │
│                  │  │  Alice Sharma    [FollowBtn] │ │
│                  │  │  @alice_codes  [Edit Btn]    │ │
│                  │  │  Bio text here...            │ │
│                  │  │  🎓 Engineering · 2nd Year   │ │
│                  │  │  📅 Joined January 2025      │ │
│                  │  │                              │ │
│                  │  │  ┌──────┬──────┬──────┐     │ │
│                  │  │  │  24  │ 1.2k │ 348  │     │ │
│                  │  │  │Notes │Follws│Followg     │ │
│                  │  │  └──────┴──────┴──────┘     │ │
│                  │  └─────────────────────────────┘ │
│                  │                                   │
│                  │  [Notes][Communities][Sessions]   │
│                  │  ──────────────────────────────  │
│                  │  [Tab content — cards grid]       │
└─────────────────────────────────────────────────────┘
```

---

## Header Section Spec

**Container:**
- Background: `background.surface`
- Border-bottom: 1px `border.subtle`
- Padding: 32px (desktop) / 20px (mobile)

**Avatar:**
- Size: 120px × 120px (desktop) / 96px (mobile)
- radius-full
- Border: 3px `background.base` ring + 3px `primary.500` outer ring
- Position: left-aligned (desktop) / centered (mobile)

**Name + Handle:**
- displayName: h2 token (3xl/bold), text.primary, mb-1
- @username: body-sm, text.muted, mb-3
- bio: body, text.secondary, max-width 480px, 3-line clamp + "show more"
- Stream + Class: caption, text.muted — `🎓 Engineering · 2nd Year`
- Join date: caption, text.muted — `📅 Joined January 2025`

**Action Buttons (other's profile):**
- Follow: Primary, sm size → "Following" (Secondary) when followed
- Unfollow hover: shows "Unfollow" in status.error.text
- Gap: 8px between buttons

**Action Buttons (own profile):**
- Edit Profile: Secondary, sm size, pencil icon
- Follow button hidden

---

## Stats Bar

- Notes count → activates Notes tab on click
- Followers count → opens Followers modal
- Following count → opens Following modal
- Number: h3 token (2xl/bold), text.primary
- Label: caption, text.muted
- Hover: number → primary.400, cursor pointer
- Gap between stats: 32px (desktop) / space-around (mobile)

---

## Tab Bar

- 3 tabs: Notes · Communities · Sessions
- Height: 44px, padding: 0 20px
- Font: label token (sm/medium)
- Active: text.primary + 2px bottom border primary.500
- Inactive: text.muted
- Hover: text.secondary
- Sticky on scroll: top 0, z-index stickyNav, bg background.base
- Animated underline: Framer Motion layoutId shared border

---

## Mobile Layout

```
┌──────────────────────────┐
│ ← Back   @alice_codes  ⋮ │
├──────────────────────────┤
│      [Avatar 96px]       │
│      Alice Sharma        │
│      @alice_codes        │
│  Bio text (centered)     │
│  🎓 Engineering · 2nd Yr  │
│  📅 Joined Jan 2025       │
│  [Follow Button full-w]  │
│  ┌──────┬──────┬───────┐ │
│  │  24  │ 1.2k │  348  │ │
│  │Notes │Follws│Followg│ │
│  └──────┴──────┴───────┘ │
│ [Notes][Communities][Ses]│
│ ─────────────────────── │
│   [Tab content]          │
└──────────────────────────┘
```

- Text: center-aligned on mobile
- Follow/Edit button: full-width on mobile
- Avatar: 96px on mobile
