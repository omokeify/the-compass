# Feature Roadmap

## Build Now
- Finish messaging UI migration to `messageService` and Realtime subscribers.
- Add `compass_messages_refresh` to poller and event bus.
- Write e2e tests for spaces, conferences, and messaging flows.

## MVP Product Features
- Auth and profile persistence.
- Feed creation, comments, reactions, saves, and follows.
- Category/topic pages with moderation controls.
- Events/classes registration and reminders.
- Notifications read/unread state.
- Admin/moderator queue.

## Live Community (In Progress)
- Young backend is live for spaces/conferences/messages.
- Realtime sync is active for spaces and conferences.
- Messaging schema and REST are in place; UI migration pending.
- Missing: notifications backend + realtime, saved/bookmarks backend.

## Revenue Features
- Compass Pro access rules.
- Bounties and applications.
- Talent listings and booking inquiries.
- Partner placements and sponsored content.

## Backend Readiness
- Supabase-backed service layer is active.
- Keep role checks centralized.
- Add moderation/audit tables and custom claims before launch.
