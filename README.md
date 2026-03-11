# Fermin Turban Website

Vite/React portfolio site with a Vercel-native admin CMS. Public pages read runtime project data from Vercel Functions, and the `/admin` area lets the site owner create, edit, publish, archive, and upload project content without redeploying.

## Stack

- Vite + React + TypeScript
- Vercel Functions in `api/`
- Vercel Postgres-compatible `DATABASE_URL` for persistent content
- Vercel Blob for media uploads
- Local file fallback in `.data/admin-projects.json` and `public/uploads/` when `DATABASE_URL` or `BLOB_READ_WRITE_TOKEN` are absent

## Local development

Install dependencies:

```sh
npm install
```

Frontend-only development:

```sh
npm run dev
```

That mode serves the SPA only. Public pages fall back to static seed content if `/api/*` is unavailable.

Full-stack local development with admin/API routes:

```sh
npx vercel dev
```

Run this from `website/` so Vercel serves both `dist` and the `api/` functions locally.

## Admin setup

1. Copy values from `.env.example`.
2. Generate an admin password hash:

```sh
npm run admin:hash -- "your-password"
```

3. Set `ADMIN_EMAIL`, `ADMIN_PASSWORD_HASH`, and `SESSION_SECRET`.
   The email and hash are used to bootstrap the runtime credential store on first run. After that, password changes from `/admin/security` persist in the runtime store.
4. Optional: set `DATABASE_URL` for Postgres-backed content storage.
5. Optional: set `BLOB_READ_WRITE_TOKEN` for Blob uploads.
6. Seed the runtime content store from the current static portfolio:

```sh
npm run admin:seed
```

Reset the runtime store back to the static seed set:

```sh
npm run admin:seed -- --reset
```

## Verification

```sh
npm run typecheck
npm run lint
npm test
npm run build
```

## Vercel deployment

- Connect this repo or set `Root Directory = website` if deploying from the parent repo.
- Keep Node on `20.x`.
- Configure:
  - `ADMIN_EMAIL`
  - `ADMIN_PASSWORD_HASH`
  - `SESSION_SECRET`
  - `DATABASE_URL`
  - `BLOB_READ_WRITE_TOKEN`
  - `IMGPROXY_BASE`
  - `IMGPROXY_KEY`
  - `IMGPROXY_SALT`
  - `IMGPROXY_SIGNATURE_SIZE`

Public SPA routing is handled by `vercel.json`, and API routes under `api/` are deployed as Vercel Functions.

## Admin security

- `POST /api/admin/change-password` rotates the stored admin password and refreshes the current session.
- Older admin cookies are invalidated automatically after a password change.
- On deployments without `DATABASE_URL`, password changes persist to `.data/admin-credentials.json` locally. On read-only deployments, `DATABASE_URL` is required for password changes.
