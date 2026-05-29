# Feature Roadmap

## Build Now

- Finish Vite module migration.
- Add a real app shell in `src/app`.
- Move shared components and mock data into modules.
- Keep the legacy runtime passing build checks until the module runtime replaces it.

## MVP Product Features

- Auth and profile persistence.
- Feed creation, comments, reactions, saves, and follows.
- Category/topic pages with moderation controls.
- Events/classes registration and reminders.
- Notifications read/unread state.
- Admin/moderator queue.

## Revenue Features

- Compass Pro access rules.
- Bounties and applications.
- Talent listings and booking inquiries.
- Partner placements and sponsored content.

## Backend Readiness

- Create `featureClient.js` boundaries before adding Supabase.
- Keep role checks centralized.
- Add moderation/audit tables early, not after launch.
