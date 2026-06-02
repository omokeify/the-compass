# Compass Launch Plan

## Phase 1 - Product Spine
- Move the prototype into a repeatable Vite workflow.
- Keep the current visual system intact.
- Replace fragile demo state with Supabase-backed services.

## Phase 2 - Backend MVP (In Progress)
- Supabase auth + profiles wired.
- Posts, comments, reactions, follows, categories, tags backed by Supabase.
- Row-level security and admin/moderator permissions.
- Spaces and Conferences backed by Supabase with host-scoped RLS.
- Messaging schema and REST methods added; realtime subscriptions started.
- 3-second poller refreshes spaces/conferences live.

## Phase 3 - Live Community (Pending)
- Messaging UI still reads local state; needs migration to `messageService`.
- Realtime subscriptions not yet wired into views.
- Unread counts, typing indicators, and optimistic reads need UI work.
- Notifications remain localStorage; need backend and realtime.

## Phase 4 - Monetization (Pending)
- Compass Pro access rules wired but needs payment integration.
- Bounties, talent listings, applications/bookings, and partner/sponsor placements.

## Near-Term Polish Queue
- Persist auth/session state. Done.
- Make logout functional. Done.
- Make "Start a space" create a user-owned live room. Done.
- URL-backed routing. Done.
- Move conversations + messages to full realtime WebSocket sync.
- Move notification flow to realtime WebSocket sync.
- Clean mojibake characters in copied text once the app has a test harness.
- Add end-to-end tests for spaces and messaging.
