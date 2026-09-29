# Atelier Store

Next.js (App Router) + TypeScript + Tailwind CSS v4, with Better Auth, Drizzle ORM and Neon Postgres.

## Setup

1. `npm install`
2. Copy `.env.example` to `.env` and fill in:
   - `DATABASE_URL`: pooled connection string from the Neon console
   - `BETTER_AUTH_SECRET`: e.g. `openssl rand -base64 32`
   - `BETTER_AUTH_URL`: `http://localhost:3000` locally
3. `npm run dev`

`DATABASE_URL` must be set for `npm run build` too, since the auth route imports the database client.

## Structure

- `src/db/index.ts`: Drizzle client (Neon HTTP driver)
- `src/db/schema/`: Drizzle tables, re-exported from `index.ts`
- `src/lib/auth.ts`: Better Auth server instance (Drizzle adapter)
- `src/lib/auth-client.ts`: Better Auth React client
- `src/app/api/auth/[...all]/route.ts`: Better Auth route handler
- `drizzle.config.ts`: drizzle-kit config; migrations go to `drizzle/`

## Database

Better Auth's tables are not defined yet. Generate them with `npx @better-auth/cli generate`, place them in `src/db/schema/`, then:

- `npm run db:generate`: create SQL migrations from the schema
- `npm run db:migrate`: apply migrations
- `npm run db:push`: push schema directly (prototyping)
- `npm run db:studio`: open Drizzle Studio

## Scripts

`dev`, `build`, `start`, `lint`, `typecheck`
