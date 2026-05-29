# Compass Architecture Notes

## Current Runtime

The app is still running as a browser-script React prototype:

- `index.html` loads React, ReactDOM, Babel, CSS, then every `.jsx` file.
- Feature files publish components and data through `Object.assign(window, ...)`.
- `app.jsx` owns app state and route rendering.
- `routes.jsx` now maps browser URLs to app route objects and back.

This is intentionally transitional. It lets us add shareable URLs and production checks before the larger import/export migration.

## Target Runtime

The next architecture milestone is a bundled Vite React app:

- `src/main.jsx` renders `<App />`.
- `src/app/App.jsx` owns shell state.
- `src/app/routes.js` keeps URL mapping and route constants.
- `src/data/mock/*` holds temporary mock data.
- `src/features/*` groups feed, profile, events, spaces, talent, messages, and admin surfaces.
- `src/lib/*` holds shared utilities, data clients, and stores.

## Migration Order

1. Move route helpers into `src/app/routes.js`. Done; `routes.jsx` remains the legacy runtime bridge until `app.jsx` becomes a module.
2. Move pure utilities and shared components first.
3. Move `data.jsx` into mock data modules.
4. Move feature views one section at a time.
5. Replace `window.*` references with imports.
6. Remove Babel standalone and external React scripts from `index.html`.
7. Let Vite bundle the app fully.

## Backend Boundary

Once modules are in place, data access should go through feature-level clients rather than direct arrays. For example:

- `feedClient.listFeed()`
- `profileClient.getProfile(handle)`
- `eventsClient.register(eventId)`
- `notificationsClient.markRead(id)`

Those clients can start on mock data and later switch to Supabase/Postgres without rewriting views.
