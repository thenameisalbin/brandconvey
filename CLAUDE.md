# BrandConvey Studios — Project Instructions

## Git Workflow

- Always pull from remote before making local changes (`git pull --rebase origin v2`)
- **Remote CMS content always wins**: if `content.json` has conflicts during rebase, always accept the remote (incoming) version — it represents the latest admin-published content and has higher precedence than any local edits to that file. Use `git checkout --theirs content.json && git add content.json` to resolve.
- **Inspect CMS commits before accepting**: when a rebase brings in an "Update site content via admin CMS" commit, check that array counts didn't shrink unexpectedly — run `git show <hash>:content.json | python3 -c "import sys,json; d=json.load(sys.stdin); print('originals:', len(d.get('originals',{}).get('films',[])), 'work:', len(d.get('work',{}).get('cards',[])))"`. If an array shrank and the reason isn't clear, flag it to the user before continuing — deleted items can be recovered from git history with `git show <older-hash>:content.json`.

## Code Style

- Always write **mobile-first** CSS: start with the smallest viewport as the base, then layer `min-width` media queries for larger breakpoints
- Every layout change, new section, or UI component must be fully responsive across mobile (375px), tablet (768px), and desktop (1280px)
- Use `clamp()` for fluid typography and spacing instead of separate breakpoints wherever practical
- Minimum touch target size is 44×44px for all interactive elements on mobile
- Prevent iOS Safari auto-zoom: form inputs must have `font-size: 16px` at `max-width: 767px`
