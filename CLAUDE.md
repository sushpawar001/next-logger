# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

FitDose (repo name `next-logger`) — a Next.js 14 App Router health logger for blood glucose, insulin doses, bodyweight and body measurements, plus a set of public fitness calculators. MongoDB via Mongoose, Clerk for auth, pnpm as the package manager.

## Commands

```bash
pnpm dev              # dev server on port 4000 (NOT 3000 — README is stale)
pnpm build            # next build
pnpm lint             # next lint (eslint-config-next)
pnpm migrate:analyze  # dry-run: report which DB fields would be encrypted
pnpm migrate:encrypt  # encrypt existing plaintext fields in-place (BACKUP FIRST)
pnpm migrate:verify   # decrypt-test existing data, report failures
```

There is no test framework or test suite in this repo. Verification is `pnpm build` + `pnpm lint` + manual checks.

Required env vars (`.env`, gitignored): `MONGO_URI`, `ENCRYPTION_KEY` (**exactly 32 characters** or every model throws), Clerk keys (`NEXT_PUBLIC_CLERK_*`, `CLERK_SECRET_KEY`), `RESEND_API_KEY`, `SEED_TOKEN`, `GA_ID`, `NEXT_PUBLIC_BASE_URL`, Razorpay keys. `TOKEN_SECRET`/`DOMAIN` are leftovers from the pre-Clerk JWT auth.

## Architecture

### Route groups (`src/app`)
- `(Dashboard)` — authenticated app: `/dashboard`, `/glucose`, `/insulin`, `/weight`, `/measurement`, `/charts`, `/stats`, `/profile`, `/load`. Each metric has an `[entryId]` edit page. Its `layout.tsx` wraps everything in `ClerkProvider` + shadcn `SidebarProvider`/`LeftSidebar`/`DashboardHeader`.
- `(Public)` — `/tools/*` calculators (BMI, BMR, ideal weight, WHR, water intake), legal pages, contact. No Clerk, static-friendly, each page exports SEO `metadata`; `robots.ts` and `sitemap.ts` live at `src/app`.
- `(Auth)` — Clerk catch-all sign-in/sign-up routes plus legacy password-reset/verify pages.
- `api` — all backend logic (route handlers only; there are no server actions).

Note the root layout is `src/app/layout.js` (JS, not TS) and holds `NuqsAdapter`, `Toaster`, and GA.

### Auth and user identity
`src/middleware.ts` runs `clerkMiddleware` and protects everything **except** the `isPublicRoute` matcher (`/`, `/login`, `/signup`, `/tools`, legal pages, `/api/webhooks/user`, `/api/seed`, `/sitemap.xml`). Adding a public page means adding it there.

Clerk users are mirrored into Mongo (`users` collection, `userModelClerk.ts`) keyed by `clerkUserId`. **Every data query must be scoped with `await getUserObjectId()`** (`src/helpers/getUserObjectId.ts`), which maps the Clerk session to the Mongo `_id` used as the `user` field on all records. `src/app/api/webhooks/user/route.ts` handles `user.created` (creates the Mongo user, sets a 30-day trial in Clerk publicMetadata) and `user.deleted` (cascade-deletes glucose/insulin/insulinType/measurements/weight, then the user).

`getToken.ts` / `getUserFromToken.ts` are dead JWT-era helpers — don't build on them.

### Field-level encryption (the biggest non-obvious constraint)
Sensitive values are encrypted at rest with AES-256-GCM. Models call `addEncryptionHooks(schema, {...})` from `src/lib/mongooseEncryption.ts` listing the encrypted fields — glucose `value`/`tag`, weight `value`/`tag`, insulin `units`/`name`/`tag`, measurements all seven circumferences + `tag`. Consequences that shape the whole API layer:

- **Encrypted fields are stored as strings** (`storeAsString: true`), so model interfaces type numeric values as `string` even though the API returns numbers. GET handlers run `convertArrayStringToNumber(docs, [...fields])` (`src/helpers/convertStringToNumber.ts`) before responding.
- **Reads** decrypt through `schema.post(/^find/)` hooks — call `.toObject()` on the result before converting.
- **Writes** do not reliably decrypt via hooks, so POST handlers call `decryptDocumentFields(entry.toObject(), [...fields], true, false, false)` manually before echoing the created entry back.
- **You cannot query, sort, filter or aggregate on an encrypted field in MongoDB.** Only `user` and `createdAt` are queryable; anything else (tag filtering, stats, ranges) must happen in JS after decryption — see `filterByTags` in `src/helpers/tagFilterHelpers.ts`.
- `scripts/*.js` are standalone Node migration scripts with their own copy of the crypto code; they are what backfills pre-encryption rows. See `scripts/README.md`.

### API route conventions
Handlers live at fixed paths per resource: `/api/{glucose|insulin|weight|measurements}/add`, `/get/[days]`, `/get-one/[id]`, `/update/[id]`, `/delete/[id]`, and `/get-range/[days]` (glucose, weight — returns current vs. previous period for stats). Each file calls `connectDB()` at module scope, resolves the user with `getUserObjectId()`, projects out `{ __v: 0, user: 0 }`, sorts `{ createdAt: -1 }`, and returns `NextResponse.json({ data })` or `{ error: error.message }` with status 500. Mutating handlers must match on `{ _id, user }` together so users cannot touch other users' rows.

`/api/seed/[userId]` is a public route gated only by a `seed_token` body field matching `SEED_TOKEN` — it bulk-inserts random data for demos.

### Data model shape
All four metric models share the same shape: value field(s), `user` ObjectId ref to `users`, optional `tag`, and an explicit `createdAt` (`timestamps: false` — the app writes user-chosen entry dates, so never switch these to Mongoose timestamps). `tag` values come from `entryTags` in `src/constants/constants.ts` and are used for both entry tagging and dashboard filtering. Frontend-facing types live in `src/types/models.d.ts` (numbers), model interfaces in `src/models/*.ts` (strings, encrypted) — keep the two in sync when adding a field.

### Frontend patterns
- Pages are `"use client"` and fetch their own data with `axios` against the local API; state stays in `useState` (no zustand/react-query despite zustand being in package.json).
- UI is shadcn/ui (`src/components/ui`, gray base color, CSS variables, `@/lib/utils` `cn`) plus custom cards. Reused building blocks: `DataPeriodSelectCard` (7/14/30/90/365/All day selector), `TagFilterCard` + `filterByTags`, `PopUpModal`, `LoadingSkeleton` / `PageSkeletons`, `InputFormCard`.
- **Charts: `src/components/Charts/RechartComponents/*` (Recharts) are the live components.** The Chart.js components directly under `src/components/Charts/` are the superseded originals, only still referenced by the scratch page `(Dashboard)/try`. New charts go in `RechartComponents`.
- Dates use dayjs (moment was removed); always format via `src/helpers/formatDate.ts` — `formatDate` and `ShortDateformat` do UTC→local conversion with `dayjs.tz.guess()`, and `DatetimeLocalFormat` produces `datetime-local` input values. Timezone drift has been a recurring bug source here.
- Public calculators keep their inputs in the URL via `nuqs` so results are shareable (`CopyUrlButton`).
- Two dashboard variants exist (`DiabetesDashboard`, `FitnessDashboard`) selected by the user's `layoutSettings`; only the diabetes one is currently wired up on `/dashboard`.

## Rules

- **Never push to origin unless the user explicitly asks.** Committing locally is fine when requested; `git push` requires an explicit instruction every time.

## Repo conventions

From `.cursor/rules/main.mdc` (note: `.cursor/` and `docs/` are gitignored, so they exist locally only):
- Reuse existing components in `src/components` or pull from shadcn/ui before writing new ones; use **Lucide** icons.
- Never modify `next.config.js` without being asked (it defines the permissive API CORS headers).
- Before writing frontend API calls or types, read the corresponding route handler and model — match the exact response shape rather than guessing, and extend existing types instead of duplicating them.
- Larger features are planned as markdown in `docs/features/` with a `todo_{feature}.md` checklist.

Other things worth knowing: `tsconfig.json` has `strict: false` and handler params are frequently untyped `any` — match the surrounding style rather than adding strictness piecemeal. Tailwind loads daisyUI, tailgrids and tailwindcss-animate alongside the shadcn theme; the brand color is `primary` `#5E4AE3`. Commit messages follow `type: description` (`feat:`, `refactor:`, `fix:`, `chore:`, `style:`).
