# Compass Community

Compass is a Web3 community hub for African builders: feed, discussions, events, classes, talent, bounties, live spaces, profiles, and member reputation.

## Current State

This repository contains a polished browser-run React prototype. The app uses static `.jsx` files, mock data, and browser `localStorage` for a few demo interactions. The next build phase is to migrate the mock data into a real backend and progressively replace demo-only flows with production flows.

## Run Locally

```bash
npm install
npm run dev
```

Then open the local URL printed by Vite.

You can also open `index.html` directly for quick visual checks, though a dev server is better for production-style testing.

## Launch Direction

The recommended MVP is:

- authentication and profiles
- feed, posts, comments, categories, reactions, and saves
- events/classes registration
- admin/moderation tools
- notifications
- talent/bounties after the community loop is stable

Supabase + Vercel is the fastest practical path for the first live version.

## Repository Notes

Generated folders such as `node_modules/` and `dist/` are ignored. Local pasted upload artifacts are also ignored; keep intentional source assets in a dedicated tracked asset folder as the product architecture matures.
