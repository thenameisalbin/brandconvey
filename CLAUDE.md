# BrandConvey Studios — Project Instructions

## Git Workflow

- Always pull from remote before making local changes (`git pull --rebase origin v2`)
- **Remote CMS content always wins**: if `content.json` has conflicts during rebase, always accept the remote (incoming) version — it represents the latest admin-published content and has higher precedence than any local edits to that file. Use `git checkout --theirs content.json && git add content.json` to resolve.

## Code Style

- Always write **mobile-first** CSS: start with the smallest viewport as the base, then layer `min-width` media queries for larger breakpoints
- Every layout change, new section, or UI component must be fully responsive across mobile (375px), tablet (768px), and desktop (1280px)
- Use `clamp()` for fluid typography and spacing instead of separate breakpoints wherever practical
- Minimum touch target size is 44×44px for all interactive elements on mobile
- Prevent iOS Safari auto-zoom: form inputs must have `font-size: 16px` at `max-width: 767px`
