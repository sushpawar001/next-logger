# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

FitDose (repo name `next-logger`) — a Next.js 14 App Router health logger for blood glucose, insulin doses, bodyweight and body measurements, plus a set of public fitness calculators. MongoDB via Mongoose, Clerk for auth, pnpm as the package manager.

## Commands

```bash
pnpm dev              # dev server on port 4000 (NOT 3000 — README is stale)
pnpm build            # next build
pnpm lint             # next lint (eslint-config-next)
pnpm typecheck        # tsc --noEmit
pnpm test             # vitest run (both projects)
pnpm test:watch       # vitest in watch mode
pnpm test:api         # node-env project only (lib, helpers, models, api routes)
pnpm test:components  # jsdom project only (components, hooks, pages)
pnpm test:coverage    # vitest run --coverage; fails below the thresholds
pnpm migrate:analyze  # dry-run: report which DB fields would be encrypted
pnpm migrate:encrypt  # encrypt existing plaintext fields in-place (BACKUP FIRST)
pnpm migrate:verify   # decrypt-test existing data, report failures
```

### Testing

**Vitest + React Testing Library**, ~1150 tests across two projects defined in `vitest.config.ts`:

- **`node`** — `src/{lib,helpers,models,dbConfig}`, `src/app/api/**`, `src/middleware.ts`
- **`jsdom`** — `src/components/**`, `src/hooks/**`, `src/app/**/*.test.tsx`, plus `src/lib/**/*.dom.test.ts`

Coverage gates at **90% lines/functions/statements, 85% branches**. Presentational
code is excluded from the denominator (shadcn `ui/`, generated skeletons,
layouts, the superseded Chart.js components, dead files, legacy JWT routes) —
see the `coverage.exclude` list in `vitest.config.ts`.

Shared harness lives in `src/test/`:
- `mongoose.ts` — `createModelMock()` (constructible + statics) and
  `createQuery()`, a chainable thenable standing in for a mongoose Query.
  Always use `createFailingQuery()` rather than an eagerly-rejected promise.
- `setup.node.ts` — globally mocks `@/dbConfig/connectDB` (the real one calls
  `process.exit()`, which would kill the worker) and `@clerk/nextjs/server`.
- `setup.jsdom.tsx` — jsdom gaps: `ResizeObserver`, `matchMedia`,
  `Element.animate`, Pointer Capture, `scrollIntoView`, plus stubs for
  `next/image`, `next/dynamic`, `next/font` and the Chart.js dayjs adapter.
- `render.tsx` — `renderWithProviders`, which wraps in `NuqsTestingAdapter`.
  Note it reports URL writes via `onUrlUpdate` but does **not** feed them back
  as state, so drive calculators from `searchParams` rather than by typing.
- `promises.ts` — `rejectsWith()`, for driving a rejection into code that
  does handle it without tripping Vitest's unhandled-rejection detection.

The highest-value test is
`src/app/api/__tests__/user-scoping.security.test.ts`: a table-driven proof
that every single-row handler filters on `_id` **and** `user` together, plus a
source-level sweep that fails if a new `delete`/`update`/`get-one` route is
added without a matching case.

**`docs/BUGS.md`** lists 28 defects found while writing these tests. None are fixed;
each is pinned by a test asserting current behavior with a
`KNOWN BUG (docs/BUGS.md #n)` comment, so a future fix fails loudly rather than
silently changing behavior.

Calculator maths lives in `src/lib/calculators/` (extracted from the components
so it can be unit-tested); the components import from there and are otherwise
unchanged.

Required env vars (`.env`, gitignored): `MONGO_URI`, `ENCRYPTION_KEY` (**exactly 32 characters** or every model throws), Clerk keys (`NEXT_PUBLIC_CLERK_*`, `CLERK_SECRET_KEY`), `RESEND_API_KEY`, `SEED_TOKEN`, `GA_ID`, `NEXT_PUBLIC_BASE_URL`, Razorpay keys. `TOKEN_SECRET`/`DOMAIN` are leftovers from the pre-Clerk JWT auth.

## Hosting and infra constraints

Deployed on **Vercel (free/Hobby plan)** with the database on **MongoDB Atlas (free tier)**. There is no infra budget — when proposing architecture changes, stay within what these free tiers provide and prefer free/self-contained options.

Practical implications:
- Everything runs as serverless route handlers with short execution limits and cold starts. No long-running processes, background workers, queues, websockets, or in-memory caches that must survive between requests.
- No local filesystem persistence — uploads or generated files would need a free-tier external store, not disk.
- Hobby cron is very limited; don't design features that assume frequent scheduled jobs.
- Atlas free tier is a small shared cluster with a capped connection count. Serverless invocations each reuse the module-scope `connectDB()` call, so avoid patterns that open new connections per request or fan out many parallel queries.
- Don't introduce paid services (Redis, S3, hosted search, paid APIs, dedicated hosts) as part of a solution. If a feature genuinely needs one, flag the cost and propose a free-tier or in-app alternative instead of assuming the spend.

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
- Pages are `"use client"`. **Server state goes through TanStack Query v5** — never a bare `useEffect` + `axios.get`. Read hooks live in `src/hooks/queries/` (`useEntries`, `useEntryRange`, `useEntry`, `useUserInsulins`, `useInsulinTypes`, `useSubscription`); mutations are `useAddEntry` / `useUpdateEntry` / `useDeleteEntry` plus the insulin pair, and each invalidates via the key factory in `src/lib/query/keys.ts`. Response unwrapping lives in `src/lib/query/fetchers.ts` (three shapes: `{ data }`, the nested `get-range`, and the flat `/api/users/subscription`). The provider is mounted in the `(Dashboard)` layout, not the root, so the cache is dropped when the user leaves the authenticated subtree.
  - **Never add a cache persister.** `src/app/sw.js/route.ts` forbids writing decrypted health data to the device; the query cache is in-memory only.
  - Defaults are tuned for the free tier: `refetchOnWindowFocus: false`, `retry: 1`, `mutations.retry: 0` (the add endpoints are not idempotent). Day-windows use `keepPreviousData`, so narrowing a period selector replays from cache.
  - Fall back to `EMPTY_ROWS` (`src/lib/query/keys.ts`) rather than writing `data ?? []`, which allocates a new array each render and breaks downstream memoisation.
  - Local *draft* state stays in `useState` — the edit forms and the profile insulin chip list. Only committed server state belongs in the cache.
  - Still on raw axios by design: `DashboardPref.tsx` (pinned by a source-reading test), `ContactUsForm`, and the `(Auth)` forms.
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

Other things worth knowing: `tsconfig.json` has `strict: false` and handler params are frequently untyped `any` — match the surrounding style rather than adding strictness piecemeal. Tailwind loads tailgrids and tailwindcss-animate alongside the shadcn theme; the brand color is `primary` `#5E4AE3`. **tailgrids cannot be removed by grepping for imports** — it is consumed purely as class names. `tailgrids/plugin` is load-bearing for layout: it supplies `container: {center, padding}` (15 files use bare `container` with no `mx-auto`), a full `screens` override that replaces Tailwind's default breakpoints app-wide (sm 540 / md 720 / lg 960 / xl 1140 / 2xl 1320, plus `xs` 400), the `boxShadow` scale including `shadow-xs` (which stock Tailwind 3 lacks) and redefined `shadow-sm/md/xl` (~100 usages), and the `stroke` / `body-color` colors (`border-stroke` ×27, `text-body-color` ×5). Dropping it silently breaks styling with no build error. daisyUI was removed; submit-button spinners are Lucide `Loader2` with `animate-spin`. Commit messages follow `type: description` (`feat:`, `refactor:`, `fix:`, `chore:`, `style:`).
