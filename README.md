# StudySpace — Sprint S2 UI Specs
**Status: Approved by Architect**
Prepared by: UI Designer

---

## Files in this package

| File | Task | Description |
|---|---|---|
| UI-S2-01-profile-page.md | UI-S2-01 | Profile page — header, stats, tabs, mobile layout |
| UI-S2-02-edit-profile-modal.md | UI-S2-02 | Edit profile modal/page — form fields, validation |
| UI-S2-03-followers-following-list.md | UI-S2-03 | Followers/Following modal + skeleton + empty state |
| UI-S2-04-avatar-upload.md | UI-S2-04 | Avatar upload — all states, drag+drop, error, loading |

---

## Design System Reference
All Sprint S2 components build on Sprint 1 approved tokens:
- Colors → UI-01 (tailwind.config.ts)
- Typography → UI-02
- Spacing + Shape → UI-03
- Base components (Button, Input, Modal, Toast) → UI-07

---

## Implementation Priority for Frontend Engineer

1. `UI-S2-04` — Avatar Upload component (used by S2-02, build first)
2. `UI-S2-02` — Edit Profile Modal (depends on S2-04)
3. `UI-S2-03` — Followers/Following List Modal
4. `UI-S2-01` — Profile Page (assembles all above components)

---

## Open Items
- Crop UI for avatar (flagged for future sprint — not in MVP)
- Progress bar on upload (only if backend returns progress events)
- "Show more" expand on bio (>3 lines) — Frontend Engineer to implement
