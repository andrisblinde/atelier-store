# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Stack

Next.js 16 (App Router) + React 19 + TypeScript (strict), Tailwind CSS v4 (via `@tailwindcss/postcss`), Better Auth, Drizzle ORM on Neon serverless Postgres. The `@/*` import alias maps to `src/*`.

## Commands

- `npm run dev` / `npm run build` / `npm run start`
- `npm run lint`: ESLint 9 flat config (Next core-web-vitals + TypeScript presets)
- `npm run typecheck`: runs `next typegen` first, then `tsc --noEmit`. Typegen generates global route types such as `LayoutProps<"/">` / `PageProps`, so plain `tsc` fails without it.
- `npm run db:generate` / `db:migrate` / `db:push` / `db:studio`: drizzle-kit (schema from `src/db/schema`, migrations written to `drizzle/`)
- `drizzle-kit` is pinned and patched (`patches/`, applied by `patch-package` on `postinstall`) so Studio only accepts requests from `https://local.drizzle.studio`. Upstream allows any origin to run SQL with `.env` credentials. When upgrading drizzle-kit, check whether upstream fixed this, and re-create or drop the patch.
- `npm run db:seed`: loads the sample catalogue into the database (tsx, reads `.env`)

There is no test framework set up yet.

## Environment

Copy `.env.example` to `.env`: `DATABASE_URL` (Neon **pooled** connection string), `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL` (`http://localhost:3000` locally). `src/db/index.ts` throws at import time if `DATABASE_URL` is missing, and because the auth route imports it, `npm run build` needs `DATABASE_URL` set too. drizzle-kit loads `.env` itself via `dotenv/config`.

## Architecture

Request flow for auth: `authClient` (`src/lib/auth-client.ts`, browser, same-origin `/api/auth`) → catch-all route `src/app/api/auth/[...all]/route.ts` (`toNextJsHandler(auth)`) → `auth` (`src/lib/auth.ts`, server only) → `drizzleAdapter(db, { provider: "pg" })` → `db` (`src/db/index.ts`, Drizzle over Neon's HTTP driver `drizzle-orm/neon-http`).

- `db` is created with `schema` imported from `src/db/schema/index.ts`. Every table must be defined under `src/db/schema/` and re-exported from that `index.ts`, both for the relational query API and for drizzle-kit.
- In `auth.ts`, the `nextCookies()` plugin must stay **last** in `plugins` so server actions can set auth cookies.
- The Neon HTTP driver does not support interactive transactions (`db.transaction`); use `db.batch` or switch to the `neon-serverless` (WebSocket) driver if transactions are needed.

## Database conventions

- **The database is the only source of product data.** Never add hard-coded products or a static fallback in app code. A missing product is a `notFound()`. `src/db/seed-data.ts` is input for `npm run db:seed` only and must never be imported by app code.
- Catalogue tables: `categories` 1─< `products` 1─< `product_stock` (`src/db/schema/catalog.ts`).
  - Categories are product types (Outerwear, Bags, ...). The homepage shop-by tiles in `src/lib/catalog.ts` are editorial content, not categories.
  - Money is stored as integer cents. It is converted to whole units only in the mapping in `src/db/queries/products.ts`.
  - Stock is one row per (product, size), and one-size pieces use a single `"One size"` row. This is not a variant model: there is no per-size SKU, price or image.
- Read products only through `src/db/queries/products.ts` (server only, since it imports `db`). It maps rows to the `Product` type in `src/lib/product.ts`. That file holds the client-safe types and helpers, so client components import from there, never from `@/db`.
- Schema changes go through `db:generate` → review the SQL in `drizzle/` → `db:migrate`. Commit the migrations. Don't use `db:push` on the shared database.
- Keep `src/db/seed.ts` idempotent by upserting on natural keys (category and product `slug`, and stock `(product_id, size)`).
- Pages that read products use ISR (`revalidate = 300`), so rendered stock can be up to 5 minutes stale. Anything that commits stock (a cart or checkout) must read it live. `next build` prerenders known product slugs, so it needs a migrated, reachable database.

## Current state

- Better Auth's tables don't exist yet. Generate them with `npx @better-auth/cli generate`, put them in `src/db/schema/`, export them from `index.ts`, then run `db:generate` + `db:migrate`.
- Built: the homepage (`src/app/page.tsx`, sections in `src/components/home/`), the product detail page (`src/app/products/[slug]/page.tsx`, parts in `src/components/product/`) and the site header/footer (rendered from `layout.tsx`). Images are from Unsplash (host allowed in `next.config.ts`).
- Not built yet: listing/category routes (`/women`, `/bags`, `/collections/*`, ...), search, account and cart. "Add to bag" and the newsletter form only confirm client-side.
- Sample photos were checked for visible third-party logos; check any new ones the same way.

## Design system

All of it lives in `src/app/globals.css` (Tailwind v4, CSS-first; there is no `tailwind.config`). Use the tokens and utilities there instead of raw values:

- Colours: `canvas`, `surface`, `ink`, `ink-muted`, `ink-subtle`, `line`, `line-strong`, `sale`, `success` (e.g. `bg-surface`, `text-ink-muted`). The site is light-only by design.
- Type roles: `type-display`, `type-h1`–`type-h3`, `type-body`, `type-small`, `type-label` (uppercase tracked UI text), `type-price`.
- Layout: `container-page` / `container-content` / `container-prose`, `section-space`, `product-grid`, `media-frame` (with `aspect-product` / `aspect-editorial` / `aspect-hero`), `divider`. Fluid spacing tokens: `gutter`, `section`, `header`, `announcement`, `grid-x`, `grid-y` (e.g. `px-gutter`, `h-header`).
- Buttons: `btn` plus one of `btn-primary` / `btn-secondary` / `btn-inverse`, optionally `btn-sm` or `btn-icon`. Links: `link` (inline copy) and `link-quiet` (nav/footer).
- Default border colour is the `line` hairline, and corners are square.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
