# UI Workflow

## Working Agreement

- Keep the current Compass visual language intact unless a screen is being intentionally redesigned.
- Build actual usable views, not landing-page explanations.
- Prefer small, reviewable UI slices: one screen, one flow, or one shared component set at a time.
- Verify desktop and mobile before calling UI work done.

## Component Direction

Shared primitives now begin in `src/components`. Legacy root files still power the current app while migration is underway.

When adding a new UI surface:

1. Add the component to `src/features/<feature>/`.
2. Put reusable visual primitives in `src/components/`.
3. Keep data access behind a `featureClient.js` file.
4. Use `src/data/mock` only while backend tables do not exist.
5. Add route coverage when the surface gets a shareable URL.

## Visual QA Checklist

- Text fits on mobile and desktop.
- Buttons and icon-only controls have clear labels or titles.
- Empty, loading, and error states exist for real backend flows.
- Repeated items use stable dimensions.
- No nested cards unless the inner card is a modal or repeated item.
- Important actions are reachable without opening the Tweaks panel.
