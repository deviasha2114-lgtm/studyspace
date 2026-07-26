# StudySpace Design System v1.0

Dark-mode first · Tailwind CSS · Student-friendly

---

## Files

| File | Purpose |
|------|---------|
| `tailwind.config.js` | All design tokens (colors, type, spacing, shadow, z-index) |
| `globals.css` | CSS variables, base styles, component utilities, Google Fonts import |

---

## UI-01: Color System

### Primary Brand — Indigo-Violet (`primary.*`)
| Token | Hex | Use |
|-------|-----|-----|
| `primary-50` | `#EEF0FF` | Tint backgrounds |
| `primary-100` | `#DDE2FF` | Hover tints |
| `primary-200` | `#C0C8FF` | Light accents |
| `primary-300` | `#9AA3FF` | Subtle highlights |
| `primary-400` | `#7B7EFF` | Muted interactive |
| `primary-500` | `#6366F1` | **Brand core** |
| `primary-600` | `#4F46E5` | Hover on primary |
| `primary-700` | `#4338CA` | Active/pressed |
| `primary-800` | `#3730A3` | Dark tones |
| `primary-900` | `#312E81` | Deepest shade |

### Backgrounds (Dark / Light)
| Token | Dark | Light |
|-------|------|-------|
| `bg.base` | `#0F0F14` | `#F8F8FF` |
| `bg.surface` | `#18181F` | `#FFFFFF` |
| `bg.elevated` | `#222230` | `#F0F0FA` |
| `bg.overlay` | `#2C2C3E` | `#E8E8F5` |

### Text
| Token | Dark | Light |
|-------|------|-------|
| `text.primary` | `#F0F0FF` | `#0F0F1A` |
| `text.secondary` | `#A8A8C0` | `#44445C` |
| `text.muted` | `#646480` | `#8888A8` |

### Borders
| Token | Dark | Light |
|-------|------|-------|
| `border.subtle` | `#1E1E2E` | `#E4E4F0` |
| `border.default` | `#2E2E44` | `#C8C8E0` |
| `border.strong` | `#4A4A6A` | `#8888C0` |

### Status Colors
| Status | bg | text | border | icon |
|--------|----|------|--------|------|
| success | `#052E16` | `#86EFAC` | `#166534` | `#4ADE80` |
| warning | `#2D1B00` | `#FDE68A` | `#92400E` | `#FBBF24` |
| error | `#2D0A0A` | `#FCA5A5` | `#991B1B` | `#F87171` |
| info | `#082040` | `#BAE6FD` | `#075985` | `#38BDF8` |

---

## UI-02: Typography System

### Google Fonts Import
```css
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Inter:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');
```

### Font Families
| Role | Family | Token |
|------|--------|-------|
| Display / Headings | Plus Jakarta Sans | `font-display` |
| Body / UI | Inter | `font-sans` |
| Code / Mono | JetBrains Mono | `font-mono` |

### Type Scale
| Token | Size | Line Height | Letter Spacing | Use |
|-------|------|-------------|----------------|-----|
| `text-xs` | 12px | 1rem | +0.025em | Captions, timestamps |
| `text-sm` | 14px | 1.25rem | +0.01em | Labels, badges |
| `text-base` | 16px | 1.625rem | 0 | Body copy |
| `text-lg` | 18px | 1.75rem | -0.005em | Lead text |
| `text-xl` | 20px | 1.875rem | -0.01em | Subheadings |
| `text-2xl` | 24px | 2rem | -0.015em | Card titles |
| `text-3xl` | 30px | 2.25rem | -0.02em | Section headings |
| `text-4xl` | 36px | 2.5rem | -0.025em | Page titles |
| `text-5xl` | 48px | 1 | -0.03em | Hero text |

### Font Weights
| Token | Value | Use |
|-------|-------|-----|
| `font-light` | 300 | Large display text only |
| `font-regular` | 400 | Body copy |
| `font-medium` | 500 | UI labels, nav items |
| `font-semibold` | 600 | Buttons, subheadings |
| `font-bold` | 700 | Headings |
| `font-extrabold` | 800 | Hero, brand moments |

---

## UI-03: Spacing + Shape System

### Spacing Scale
Base unit: **4px**. All values are multiples.

`1=4px · 2=8px · 3=12px · 4=16px · 6=24px · 8=32px · 10=40px · 12=48px · 16=64px · 20=80px · 24=96px`

### Border Radius
| Token | Value | Use |
|-------|-------|-----|
| `rounded-xs` | 2px | Badges, tags |
| `rounded-sm` | 6px | Buttons, inputs |
| `rounded-md` | 10px | Cards, panels |
| `rounded-lg` | 14px | Modals, sheets |
| `rounded-xl` | 20px | Feature cards |
| `rounded-2xl` | 28px | Large containers |
| `rounded-full` | 9999px | Avatars, pills |

### Shadows
| Token | Use |
|-------|-----|
| `shadow-sm` | Subtle card lift |
| `shadow-md` | Dropdown, popover |
| `shadow-lg` | Modal, sidebar |
| `shadow-xl` | Fullscreen overlays |
| `shadow-glow` | CTA button, active state |
| `shadow-glow-sm` | Input focus |
| `shadow-glow-lg` | Hero element, spotlight |
| `shadow-inner` | Pressed buttons, inputs |

All shadows use violet undertone (`rgba(99,102,241,...)`) for dark-mode cohesion.

### Z-Index Scale
| Token | Value | Use |
|-------|-------|-----|
| `z-base` | 1 | Normal flow |
| `z-raised` | 10 | Cards, inline |
| `z-dropdown` | 100 | Menus |
| `z-sticky` | 200 | Sticky headers |
| `z-overlay` | 300 | Backdrop |
| `z-modal` | 400 | Dialogs |
| `z-toast` | 500 | Notifications |
| `z-tooltip` | 600 | Tooltips |

---

## Usage Examples

```tsx
// Card component
<div className="surface rounded-md border border-[var(--color-border-default)] shadow-md p-6">
  <h2 className="heading-section text-2xl text-primary">Title</h2>
  <p className="body-copy text-secondary mt-2">Description text</p>
</div>

// Primary button
<button className="bg-primary-500 hover:bg-primary-600 text-white
                   font-semibold text-sm rounded-sm px-4 py-2
                   shadow-glow-sm hover:shadow-glow transition-all duration-200">
  Get Started
</button>

// Status banner
<div className="status-success border rounded-sm px-4 py-3 text-sm">
  ✓ Notes uploaded successfully
</div>

// Code block
<code className="code bg-bg-elevated px-2 py-1 rounded-xs">
  npx prisma migrate dev
</code>
```

---

## Dark / Light Mode Toggle

```tsx
// Toggle function
const toggleTheme = () => {
  document.documentElement.classList.toggle('light')
}
```

CSS variables automatically switch — no JS color logic needed.
