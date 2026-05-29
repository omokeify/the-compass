# Source Migration

This folder is the target Vite module app. The current product still runs through root-level browser scripts while files are migrated safely.

Migration order:

1. Move pure utilities such as route helpers.
2. Move shared components and mock data.
3. Move feature views one at a time.
4. Replace `window.*` globals with imports.
5. Replace the root `index.html` script chain with `src/main.jsx`.

During the transition, root-level `.jsx` files remain the runtime source of truth for the live prototype.
