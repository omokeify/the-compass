# Compass Launch Plan

## Phase 1 - Product Spine

- Move the prototype into a repeatable dev/build workflow.
- Keep the current visual system intact.
- Replace fragile demo state with small local stores where useful.
- Fix obvious dead-end interactions before backend work.

## Phase 2 - Backend MVP

- Add Supabase or another PostgreSQL-backed service.
- Create tables for profiles, posts, comments, categories, tags, reactions, saves, events, notifications, gigs, bounties, and roles.
- Replace `data.jsx` reads with API/data-client calls.
- Add row-level security and admin/moderator permissions.

## Phase 3 - Live Community

- Ship account creation, posting, comments, feed browsing, profile pages, saves, and notifications.
- Add moderation queue, reports, pinning, verified labels, and role assignment.
- Add analytics and error tracking.

## Phase 4 - Monetization

- Add Compass Pro access rules.
- Add bounties, talent listings, applications/bookings, and partner/sponsor placements.
- Add payments after the core community loop works.

## Near-Term Polish Queue

- Persist auth/session state. Done.
- Make logout functional. Done.
- Make "Start a space" create a user-owned live room instead of joining a sample room. Done.
- Add URL-backed routing for shareable pages. Done.
- Replace demo-only scheduling with a real calendar/event creation flow.
- Persist class registrations, reminders, and post drafts.
- Clean mojibake characters in copied text once the app has a test harness.
