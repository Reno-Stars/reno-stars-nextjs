# Admin Components & Conventions

## Page & Layout Components

- **Navbar**: Unified, no variant props. 8 links + Areas dropdown. Receives `company` and `areas` props from layout.
- **Footer**: 5-column grid + service areas bar. Custom SVG icons for non-lucide platforms. Receives `company`, `socialLinks`, `services`, `areas` props from layout.
- **Page components** (`components/pages/`): All `'use client'`. Receive `locale` and `company` props. Do NOT render Navbar or Footer.
- **Root layout** (`app/layout.tsx`): Pass-through that exports `metadata` and `viewport`. Does not render `<html>/<body>` — delegates to locale layout.
- **Locale layout** (`app/[locale]/layout.tsx`): Server Component with `<html lang={locale}>` and `<body>`, fetches shared data via `Promise.all`, renders Navbar/Footer.
- **Admin** (`app/admin/`): Auth-protected dashboard with CRUD for 14 content types. Mobile-responsive via `admin-responsive.css`.

## Admin Form Components

- **ImagePairEditor** (`components/admin/ImagePairEditor.tsx`): Visual editor for before/after image pairs with collapsible SEO metadata. Shows first 3 pairs (`COLLAPSE_THRESHOLD = 3`) with "Show All (N)" toggle; hidden form inputs always render for ALL pairs. Drag-and-drop upload with gold spinner. Accepts optional `slug` prop for SEO-friendly naming. Uses `pairsRef` pattern for async upload gap. Shared `parseImagePairs()` in `lib/admin/form-utils.ts`.
- **ImageUrlInput** (`components/admin/ImageUrlInput.tsx`): URL input with drag-and-drop upload, image preview. SEO-friendly naming (`{slug}-{imageRole}-{ts}.{ext}`). Detached file picker to bypass `<fieldset disabled>`.
- **VideoUrlInput** (`components/admin/VideoUrlInput.tsx`): Same pattern as ImageUrlInput but for video files. Accepts MP4/WebM/MOV (max 1 GB). Shows `<video controls>` preview. Uses `uploadVideoDirect()`. Used by CompanyForm for hero video.
- **BilingualInput** (`components/admin/BilingualInput.tsx`): Dual-mode bilingual text input with EN/ZH flag labels. Optional `maxLength` with color-coded counter (gray < 80%, gold 80-100%, red at limit). SEO field limits: metaTitle=70, metaDescription=155, focusKeyword=50.
- **BilingualTextarea** (`components/admin/BilingualTextarea.tsx`): Dual-mode bilingual textarea. Controlled mode (`valueEn`/`onChangeEn`) for AI-populated fields, uncontrolled mode (`defaultValueEn`/`defaultValueZh`).
- **SearchableSelect**: Type-to-filter dropdown with keyboard navigation and ARIA — used for related project in BlogPostForm and linked site in ProjectForm.
- **FormField**: Label + input wrapper with optional tooltip.

## Toast & Form State

- **ToastProvider**: Context-based toasts: `'success'` (green), `'error'` (red), `'warning'` (gold). Auto-dismisses 4s. Global `unhandledrejection` listener.
- **useFormToast**: Watches `useActionState` state changes → fires toasts. Shows bilingual warning on `state.renamedSlug`.

## Media Upload (Presigned S3 URL Flow)

All admin uploads use presigned S3 URLs to bypass Vercel body size limit:
1. Client calls `uploadImageDirect()` or `uploadVideoDirect()` (`lib/admin/upload-client.ts`)
2. Requests presigned PUT URL from `POST /admin/api/upload`
3. Uploads directly from browser to S3

API route validates auth, file metadata. Images: max 50 MB, JPEG/PNG/WebP/SVG/GIF. Video: max 1 GB, MP4/WebM/MOV. `customKey` sanitized server-side. Presigned URLs expire after 10 minutes (images) or 60 minutes (video). `ContentLength` is omitted from presigned URLs to avoid R2 signature mismatches.

**S3 client** (`lib/admin/s3.ts`): Singleton with `requestChecksumCalculation: 'WHEN_REQUIRED'` (R2 rejects CRC32 on presigned URLs). Exports `deleteS3Object(publicUrl)` for cleaning up replaced uploads. Shared constants in `lib/admin/upload-constants.ts`.

## Batch Upload

`app/admin/(dashboard)/batch-upload/`: ZIP upload that auto-creates sites, projects, image pairs, external products, and blog posts. Uses a **client-orchestrated** architecture where the browser handles ZIP extraction and image uploads, calling small server endpoints for AI metadata, DB saves, and blog generation. No single server call exceeds ~15s, avoiding Vercel timeout issues.

**Two modes:**
- **Sites** (whole-house with site containers)
- **Standalone** (individual projects under `STANDALONE_SITE_SLUG`)

**Client-orchestrated pipeline:**
1. **Extract** — Browser extracts ZIP via `extractZipInBrowser()` (`client-zip-extractor.ts`), producing a `ClientManifest` + `imageDataMap`
2. **Upload** — Browser uploads images directly to S3 via presigned URLs (`presign-batch/` endpoint, batches of 20). Per-image retry (3 attempts). S3 keys generated client-side with timestamp + random component
3. **Generate** — Browser calls `generate-metadata/` per entity for AI metadata (`SiteDescription` or `ProjectDescription`). Failures use fallback metadata
4. **Save** — Browser calls `save-site/` (sites mode) or `save-standalone-projects/` (standalone mode, batches of 5) to persist to DB
5. **Blog** (optional) — Browser calls `generate-blog/` per entity

**Pipeline phase decomposition** (`BatchUploadClient.tsx`): `handleSubmit` orchestrates calls to extracted phase functions (`uploadImages()`, `generateMetadata()`, `saveEntities()`, `generateBlogs()`) sharing state via `PipelineCtx` interface. Guarded React state setters prevent updates after unmount. Fire-and-forget `patchJob()` updates server for polling compatibility.

**Folder name handling in AI prompts:** Root-level folder names (e.g., "1171-van") are excluded from AI prompts when `notes.txt` exists, since they are often internal codes. Sub-folder names (e.g., "Kitchen", "Bathroom") are always included as useful context for service type detection. Without notes, the folder name is used as the only context. In standalone mode, the ZIP filename is passed as a `Reference/PO number` hint for single-project ZIPs.

**Unsupported image formats:** HEIC, HEIF, TIFF, BMP, and RAW files are detected during ZIP parsing and tracked in a `skippedFiles` array. A warning is surfaced in the job results listing up to 10 skipped filenames (with "and N more" for overflow).

**ZIP structure:**
- Sites mode: nested (top folder = site, subfolders = projects), single-folder, or flat layout
- Standalone mode: each top-level folder = project (subfolders flattened)
- Before/after pairing: hyphens or spaces, case-insensitive
- `hero.jpg` → hero image; `product-N.jpg` → matched to `products.txt`
- Products files: `URL | Label EN | Label ZH` with `#` comments

**AI schema resilience:** `ProjectDescriptionSchema` and `SiteDescriptionSchema` use `.default('')` for all non-critical fields (SEO, badge, excerpt, etc.). Core fields (`slug`, `titleEn/Zh`, `descriptionEn/Zh`) remain required. This prevents ZodError when GPT-4o-mini omits optional fields from the JSON response. AI metadata failures are logged via `console.error` in `generateProjectMetadata()` / `generateSiteMetadata()`. Empty SEO fields are auto-derived from title/description by `fillMissingSeoFields()` (runs in both `validateProjectDescription` and `optimizeSiteDescription`).

**Stale detection:** `STALE_PROCESSING_MS` (15 min), `STALE_PENDING_MS` (30 min). Stale status is persisted to DB on detection. Timeout errors use `__TIMEOUT_*__` markers resolved client-side.

**API endpoints** (`api/[jobId]/`):
- `presign-batch/` — Batch presigned S3 URLs (up to `PRESIGN_BATCH_SIZE=20`). S3 key validation: character allowlist regex, prefix check, extension check
- `generate-metadata/` — Per-entity AI metadata. Validates `folderName` type/length
- `save-site/` — Save site + child projects. Validates project item shapes. Batched image pair inserts
- `save-standalone-projects/` — Save standalone projects (max 20 items). Uses `ensureStandaloneSite()`
- `generate-blog/` — Per-entity blog generation
- `PATCH [jobId]/` — Client-driven progress updates. Validates numeric fields, dates, UUID arrays

## AI Features

- **AIContentEditor**: Tabbed blog content editor (paste/EN/ZH tabs), AI optimization via GPT-4o, DOMPurify for preview, zod validation.
- **AIFieldGenerator\<T\>**: Generic component (notes textarea + generate button). `AIProjectGenerator` and `AISiteGenerator` are thin wrappers. Generates service type, slug, titles, descriptions, badges, excerpts, PO number, budget, duration, space type, service scopes, and SEO metadata from freeform notes. Slugs are descriptive. Positioned at top of forms. The admin action (`optimizeProjectDescriptionAction`) loads available service types from DB via `getServiceTypeMap()` and passes all deduplicated scopes (`ALL_SCOPES` from `lib/admin/constants.ts`) to `optimizeProjectDescription()`. Output is validated by a hybrid pipeline (programmatic scope/serviceType/slug/SEO-fallback checks + lightweight AI review with dynamic valid-types prompt) inside `optimizeProjectDescription()` — see architecture doc for details. `ProjectForm.handleAIGenerate` applies all AI fields including `selectedScopes` (resolved to en/zh pairs via `SCOPE_EN_TO_ZH`).
- **AI blog generation** (`lib/ai/blog-generator.ts`): Generates bilingual case study blog posts from project/site data via GPT-4o. Validates with Zod, truncates SEO fields, sanitizes/deduplicates slugs. Triggered from admin site detail page.
- **AI social posts** (`lib/ai/social-post-generator.ts`): Bilingual content for Instagram, Facebook, Xiaohongshu. WAI-ARIA Tabs for platform switching. Image picker from source entity. `StatusCell` uses optimistic state with error rollback.

## Reusable Admin Components

- **Tooltip**: Hover help icons.
- **DragHandleIcon**: 6-dot drag indicator SVG.
- **ConfirmDialog**: Native `<dialog>`, focus trap, `variant` prop (`'danger'` or `'warning'`), `items` list prop.
- **AdminPageHeader**: Bilingual title, single/multiple actions, optional `backHref`.
- **ToggleButton**: Bilingual Yes/No toggle with pending state.
- **DataTable**: Sortable/searchable with pagination, `dragReorder` prop for row reordering.

## House Stack UI

Unified site/project management. Roof = site, floors = project layers. Drag-and-drop reordering, keyboard nav (Alt+Up/Down), inline delete. Supports `?project=<id>` deep-linking and `?new`.

## Admin Layout & Navigation

- **AdminLocaleProvider**: Client-side locale + sidebar state. TopBar: EN/ZH switcher, hamburger (mobile), logout with ConfirmDialog. Persists in localStorage.
- **DashboardShell**: Sidebar drawer (slide-out mobile, always visible desktop). `admin-responsive.css` overrides at 768px.
- **Sidebar**: 4 collapsible groups (Portfolio, Content, CRM, Settings) + Dashboard link. State persists in localStorage. Full ARIA accessibility.
- **Dashboard**: 4 grouped stat sections with lucide-react icons. Red notification dot for new contacts.

## Admin Patterns

- **Pre-save warnings**: `ProjectForm`, `SiteForm`, `BlogPostForm` check empty optional fields → `ConfirmDialog` with `variant="warning"`.
- **Collapsible list sections**: First 3 items shown, "Show All (N)" toggle. Hidden inputs always render.
- **List page pattern**: Edit (`GOLD`) + Delete (`ERROR`) actions, `ConfirmDialog` via `deleteId` state.
- **Landing page previews**: FAQs, Services, Areas, Badges, Designs, Partners, About pages include homepage-mirroring preview sections.
- **CompanyForm sections**: 4 labeled groups (Business Info, Location, Legal, Marketing). Includes `VideoUrlInput` for hero video and `ImageUrlInput` for hero poster image below the logo field. Save action deletes replaced S3 objects via `deleteS3Object()` (fire-and-forget).
- **Slug validation**: `isValidSlug()` rejects consecutive hyphens. Regex: `/^[a-z0-9]+(-[a-z0-9]+)*$/`.
- **Nullable select dropdowns**: Service type, location city, and space type dropdowns include an empty `<option value="">` placeholder. Server actions convert empty strings to `null` before DB insert. Service types come from the `services` DB table, not hardcoded lists.

## Custom Hooks

- **useDragReorder**: Drag-and-drop with optimistic UI, server sync, mountedRef cleanup. `DRAG_THRESHOLD_PX` = 5px.
- **useIsMobile**: SSR-safe mobile detection (768px breakpoint).
- **useSaveWarning**: Pre-save warning dialog state. `requestSave(fd, missing)` shows dialog or submits via `startTransition`.
- **useBeforeUnload**: `beforeunload` listener when `dirty` is true. Reset on successful save.
- **useFullscreenModal**: Scroll lock, focus trap, keyboard nav (Escape/Arrow keys), return focus on close.

## Public Components

- **ProductLink**: External product links with hover image preview. `size` prop ('sm'/'md').
- **ProjectModal**: Image-pairs gallery with click-to-toggle before/after. Touch swipe, keyboard nav, slide animation.
- **DisplayProject type** (`lib/types.ts`): Extended project for display. Represents regular projects or sites as "Whole House" with aggregated data.
- **ContactForm**: Reusable with optional `large` prop for elderly users. Server error via `result.message`.
- **Structured data**: Added in server page route files, not client components. Rating from Google Reviews API. 13 schema types. Shared `parseAddress()` utility.
