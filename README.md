# Commonplace Blog Platform

A responsive React blog platform with story discovery, category filtering, search, writing, likes, and threaded-style comments. The included Express API provides JWT authentication and MongoDB persistence endpoints for users, posts, and comments.

## Run locally

```bash
npm install
npm run dev
```

Open the local URL printed by Vite. Use your name and email to enter the demo workspace. Create, edit, complete, search, filter, and delete tasks from the dashboard. Tasks are stored in this browser and separated by email address.

## MongoDB API

Start a local MongoDB server, copy `.env.example` to `.env`, then run:

```bash
npm run server
```

The API is available at `http://localhost:5000`.

- `POST /api/auth/register`, `POST /api/auth/login`
- `GET, POST /api/posts`; `PATCH, DELETE /api/posts/:id`
- `GET, POST /api/posts/:id/comments`

Protected endpoints expect `Authorization: Bearer <token>`.

## Verification

```bash
npm run build
npm run lint
```

## Note

The homepage uses seeded client data to make the interface immediately explorable. Connect its actions to the included API when moving from demo mode to persisted local data.

# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend enabling type-aware lint rules by installing `oxlint-tsgolint` and editing `.oxlintrc.json`:

```json
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "plugins": ["react", "typescript", "oxc"],
  "options": {
    "typeAware": true
  },
  "rules": {
    "react/rules-of-hooks": "error",
    "react/only-export-components": ["warn", { "allowConstantExport": true }]
  }
}
```

See the [Oxlint rules documentation](https://oxc.rs/docs/guide/usage/linter/rules) for the full list of rules and categories.
# blog_platform
