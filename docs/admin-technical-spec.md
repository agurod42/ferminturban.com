# Admin Content System Technical Spec

## Goal

Add an authenticated admin area so the site owner can create and edit portfolio content without redeploying the site after every content change.

The first release should focus on project CRUD for advertising and documentary work. The public site should remain deployable on Vercel from the existing `website/` app.

## Current State

- The public site is a Vite + React SPA deployed from `website/`
- Project content is static and built from JSON imports in `src/data/projects.ts`
- Public pages read content synchronously at build time
- There is no backend, no auth, and no write path today
- Hero videos and About page content are also hardcoded

Relevant current files:

- `src/data/projects.ts`
- `src/pages/Publicidad.tsx`
- `src/pages/Documental.tsx`
- `src/pages/ProjectDetail.tsx`
- `src/pages/Index.tsx`
- `src/data/heroVideos.ts`
- `src/pages/SobreMi.tsx`

## Scope

### In Scope for v1

- Admin login
- Create, edit, archive, publish, and delete projects
- Upload thumbnail, background, and gallery images
- Edit bilingual slugs and titles
- Edit credits, media URLs, featured flag, and ordering
- Serve project data to the public site from runtime APIs

### Out of Scope for v1

- Editing homepage hero video pools
- Editing About page logos or biography text
- Full multi-user role management
- Full SEO CMS for every page

## Recommended Architecture

Keep the existing Vite SPA and add Vercel Functions in an `api/` directory at the project root.

### Public Site

- Continue serving the public UI from the Vite app
- Replace static JSON imports with client-side fetching from internal APIs
- Keep the existing `BrowserRouter` + SPA rewrite configuration

### Backend

- Use Vercel Functions for both public data endpoints and admin mutations
- Use a SQL database through a Vercel Marketplace Postgres integration
- Use Vercel Blob for public media uploads
- Use cookie-based auth for the admin area

### Why this is the right fit

- It avoids a framework rewrite
- It works with the current Vercel deployment model
- It allows content changes without redeploys
- It keeps the public UI mostly intact while introducing a proper content source

## Vercel Constraints and Decisions

### Functions

Use the documented root-level `api/` directory inside `website/`.

### Database

Do not plan around legacy Vercel Postgres. Vercel’s current documentation states that Vercel Postgres is no longer available for new projects and that new projects should use a Marketplace Postgres integration. The default choice should be Neon via the Vercel Marketplace unless there is a reason to pick another provider.

### Media

Use a public Vercel Blob store for portfolio media. These images are public site assets, so private storage is unnecessary for v1.

### Auth

Use app-level auth implemented in Functions. Do not rely on deployment protection for admin authentication.

### Root Directory

The Vercel project root remains `website/`.

## Data Model

For v1, use a small relational schema.

### `projects`

- `id` UUID primary key
- `category` enum: `publicidad | documental`
- `status` enum: `draft | published | archived`
- `slug_es` text unique not null
- `slug_en` text unique nullable
- `title_es` text not null
- `title_en` text nullable
- `client` text nullable
- `productora` text nullable
- `director` text nullable
- `dop` text nullable
- `media_type` enum: `video | image` nullable
- `media_provider` text nullable
- `video_url` text nullable
- `featured` boolean default false
- `sort_order` integer default 0
- `thumbnail_url` text nullable
- `thumbnail_alt_es` text nullable
- `thumbnail_alt_en` text nullable
- `thumbnail_aspect_ratio` numeric nullable
- `background_url` text nullable
- `gallery_aspect_ratio` numeric nullable
- `canonical_url` text nullable
- `source_url` text nullable
- `credits_text` text nullable
- `created_at` timestamptz not null default now()
- `updated_at` timestamptz not null default now()
- `published_at` timestamptz nullable

### `project_gallery`

- `id` UUID primary key
- `project_id` UUID foreign key references `projects(id)` on delete cascade
- `position` integer not null
- `image_url` text not null
- `alt_es` text nullable
- `alt_en` text nullable
- `aspect_ratio` numeric nullable
- `created_at` timestamptz not null default now()

### Auth Strategy for v1

Avoid building user management unless needed.

Use environment variables to bootstrap a single admin account:

- `ADMIN_EMAIL`
- `ADMIN_PASSWORD_HASH`
- `SESSION_SECRET`

Persist the live credential state in the runtime store so the admin can rotate the password without redeploying. If multi-user admin is needed later, add an `admin_users` table.

## API Surface

Favor explicit, low-risk routes over clever routing.

### Public APIs

- `GET /api/projects`
  - query: `category`, `lang`, `featured`, `status`
- `GET /api/project`
  - query: `slug`, `lang`
- `GET /api/home`
  - initially optional
  - can later provide featured projects and hero configuration

### Admin Auth APIs

- `POST /api/admin/login`
- `POST /api/admin/logout`
- `GET /api/admin/session`
- `POST /api/admin/change-password`

### Admin Project APIs

- `GET /api/admin/projects`
- `POST /api/admin/projects`
- `GET /api/admin/project`
  - query: `id`
- `PATCH /api/admin/project`
  - query: `id`
- `DELETE /api/admin/project`
  - query: `id`

### Upload API

- `POST /api/blob/upload`
  - create signed or validated client upload flow for Vercel Blob

## Frontend Routes

Add a private admin area inside the existing React router.

### Public

Keep existing routes intact.

### Admin

- `/admin/login`
- `/admin`
- `/admin/projects`
- `/admin/projects/new`
- `/admin/projects/:id`
- `/admin/security`

The admin route tree should be lazy-loaded and omitted from the public header/footer navigation.

## Frontend Data Layer

Introduce async hooks that replace direct static imports.

### New hooks

- `useProjects`
- `useProject`
- `useAdminSession`
- `useAdminProjects`

### DTO target

The API response should preserve the current public `Project` shape as much as possible so the UI migration stays shallow.

## Auth Design

### Session model

- On login, validate credentials in a Function
- Set a signed `httpOnly` cookie
- Cookie flags:
  - `httpOnly`
  - `secure`
  - `sameSite=lax`
  - `path=/`
- Session TTL:
  - 7 days is a reasonable default for v1

### Security basics

- Hash password with bcrypt or argon2 before storing in env
- Rate-limit login attempts if abuse appears
- Enforce auth server-side on every `/api/admin/*` route
- Keep Blob upload token generation behind auth

## Blob Strategy

Use public blob storage for public-facing images.

### Folder convention

- `projects/{projectId}/thumbnail/*`
- `projects/{projectId}/background/*`
- `projects/{projectId}/gallery/*`

### Upload behavior

- Upload from the admin UI
- Persist returned blob URLs in SQL
- Deleting a project should optionally queue blob cleanup later
- v1 can accept orphaned blobs if that shortens implementation time

## Rollout Plan

### Phase 1: Foundation

- Add shared content types
- Add database package and migration setup
- Create SQL schema
- Create seed script from existing JSON

### Phase 2: Public Read API

- Implement `GET /api/projects`
- Implement `GET /api/project`
- Add data-fetch hooks
- Migrate public pages off static project imports

### Phase 3: Auth

- Implement login/logout/session APIs
- Add admin route guard
- Add `/admin/login`

### Phase 4: Admin CRUD

- Add list/create/edit/delete APIs
- Build admin project list
- Build project form
- Build gallery management and featured controls

### Phase 5: Uploads

- Add Blob upload endpoint
- Add admin image uploader
- Store returned Blob URLs in the DB

### Phase 6: Cleanup

- Remove static project JSON from the public runtime path
- Keep seed data only for migration or backup purposes
- Document env vars and operational steps

## File-Level Implementation Plan

### New backend files

- `api/_lib/auth.ts`
- `api/_lib/db.ts`
- `api/_lib/projects.ts`
- `api/_lib/http.ts`
- `api/admin/login.ts`
- `api/admin/logout.ts`
- `api/admin/session.ts`
- `api/admin/projects.ts`
- `api/admin/project.ts`
- `api/projects.ts`
- `api/project.ts`
- `api/blob/upload.ts`

### New frontend files

- `src/types/project.ts`
- `src/lib/api.ts`
- `src/hooks/useProjects.ts`
- `src/hooks/useProject.ts`
- `src/hooks/useAdminSession.ts`
- `src/pages/admin/AdminLogin.tsx`
- `src/pages/admin/AdminDashboard.tsx`
- `src/pages/admin/AdminProjects.tsx`
- `src/pages/admin/AdminProjectForm.tsx`
- `src/components/admin/AdminRoute.tsx`

### Supporting scripts

- `scripts/seed-projects.ts`
- `scripts/export-projects.ts` later, optional

## Migration Notes

The current normalized project shape in `src/data/projects.ts` should be treated as the compatibility target for the public UI.

That means:

- Seed the SQL rows using the existing normalization logic or a shared extractor
- Preserve the existing `slug` and `slugEn` behavior
- Preserve `featured`, `gallery`, `thumbnailUrl`, `backgroundUrl`, and credit fields
- Avoid changing UI contracts until the API-backed hooks are in place

## Risks

### Main risk

The public site currently expects synchronous content. Moving to runtime APIs touches several pages at once.

### Mitigation

- Introduce hooks and DTOs before changing visuals
- Migrate one page at a time
- Keep the old JSON source available during the transition

## Open Questions

- Should the owner manage only projects in v1, or also homepage hero videos?
- Should deleted projects be hard-deleted or archived?
- Do we need drafts visible only in admin, or preview links too?
- Does the owner need image cropping or just upload + reorder?
- Is one admin user enough for the foreseeable future?

## Sources

- Vite on Vercel: https://vercel.com/docs/frameworks/frontend/vite
- Vercel Functions: https://vercel.com/docs/functions
- `api/` root directory for Vercel Functions: https://vercel.com/docs/project-configuration/vercel-json
- Blob overview: https://vercel.com/docs/vercel-blob
- Build and Root Directory settings: https://vercel.com/docs/builds/configure-a-build
- Postgres on Vercel note about Marketplace integrations: https://vercel.com/docs/postgres
