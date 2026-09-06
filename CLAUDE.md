# BrandConvey Studios — Project Instructions

## Code Style

- Always write **mobile-first** CSS: start with the smallest viewport as the base, then layer `min-width` media queries for larger breakpoints
- Every layout change, new section, or UI component must be fully responsive across mobile (375px), tablet (768px), and desktop (1280px)
- Use `clamp()` for fluid typography and spacing instead of separate breakpoints wherever practical
- Minimum touch target size is 44×44px for all interactive elements on mobile
- Prevent iOS Safari auto-zoom: form inputs must have `font-size: 16px` at `max-width: 767px`
