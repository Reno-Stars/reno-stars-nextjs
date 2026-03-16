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
- **BilingualInput** (`components/admin/BilingualInput.tsx`): Dual-mode bilingual text input with EN/ZH flag labels. Optional `maxLength` with color-coded counter (gray < 80%, gold 80-100%, red at limit). SEO field limits: metaTitle=70, metaDescription=155, focusKeyword=50.
- **BilingualTextarea** (`components/admin/BilingualTextarea.tsx`): Dual-mode bilingual textarea. Controlled mode (`valueEn`/`onChangeEn`) for AI-populated fields, uncontrolled mode (`defaultValueEn`/`defaultValueZh`).
- **SearchableSelect**: Type-to-filter dropdown with keyboard navigation and ARIA — used for related project in BlogPostForm and linked site in ProjectForm.
- **FormField**: Label + input wrapper with optional tooltip.

## Toast & Form State

- **ToastProvider**: Context-based toasts: `'success'` (green), `'error'` (red), `'warning'` (gold). Auto-dismisses 4s. Global `unhandledrejection` listener.
- **useFormToast**: Watches `useActionState` state changes → fires toasts. Shows bilingual warning on `state.renamedSlug`.

## Image Upload (Presigned S3 URL Flow)

All admin uploads use presigned S3 URLs to bypass Vercel body size limit:
1. Client calls `uploadImageDirect()` (`lib/admin/upload-client.ts`)
2. Requests presigned PUT URL from `POST /api/admin/upload`
3. Uploads directly from browser to S3

API route validates auth, file metadata (max 50 MB, JPEG/PNG/WebP/SVG/GIF). `customKey` sanitized server-side. Presigned URLs expire after 10 minutes.

**S3 client** (`lib/admin/s3.ts`): Singleton with `requestChecksumCalculation: 'WHEN_REQUIRED'` (R2 rejects CRC32 on presigned URLs). Shared constants in `lib/admin/upload-constants.ts`.

## Batch Upload

`app/admin/(dashboard)/batch-upload/`: ZIP upload that auto-creates sites, projects, image pairs, external products, and blog posts.

**Two modes:**
- **Sites** (whole-house with site containers)
- **Standalone** (individual projects under `STANDALONE_SITE_SLUG`)

ZIP upload uses chunked multipart upload through a server proxy (`api/[jobId]/upload/`), bypassing R2 CORS. File split into 10 MB chunks with per-chunk retry (3 attempts). Processing via `after()` from `next/server`. Client polls for status.

**Sites mode pipeline:** `parseZip()` → upload images (batches of 15) → AI metadata (batches of 10) → save to DB → optional blog generation → cleanup. AI generates `SiteDescription` (with space type) for root folders and `ProjectDescription` (with space type) for sub-folder projects.

**Standalone mode pipeline:** `parseZipStandalone()` → upload → AI metadata → find/create standalone site → save projects → optional blog → cleanup. AI generates `ProjectDescription` (with space type) for each root folder.

**Folder name handling in AI prompts:** Root-level folder names (e.g., "1171-van") are excluded from AI prompts when `notes.txt` exists, since they are often internal codes. Sub-folder names (e.g., "Kitchen", "Bathroom") are always included as useful context for service type detection. Without notes, the folder name is used as the only context.

**ZIP structure:**
- Sites mode: nested (top folder = site, subfolders = projects), single-folder, or flat layout
- Standalone mode: each top-level folder = project (subfolders flattened)
- Before/after pairing: hyphens or spaces, case-insensitive
- `hero.jpg` → hero image; `product-N.jpg` → matched to `products.txt`
- Products files: `URL | Label EN | Label ZH` with `#` comments

**Stale detection:** `STALE_PROCESSING_MS` (2 min), `STALE_PENDING_MS` (30 min). Timeout errors use `__TIMEOUT_*__` markers resolved client-side.

## AI Features

- **AIContentEditor**: Tabbed blog content editor (paste/EN/ZH tabs), AI optimization via GPT-4o, DOMPurify for preview, zod validation.
- **AIFieldGenerator\<T\>**: Generic component (notes textarea + generate button). `AIProjectGenerator` and `AISiteGenerator` are thin wrappers. Generates service type, slug, titles, descriptions, badges, excerpts, PO number, budget, duration, space type, and SEO metadata from freeform notes. Slugs are descriptive. Positioned at top of forms.
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
- **Landing page previews**: FAQs, Services, Areas, Badges, Gallery, Partners, About pages include homepage-mirroring preview sections.
- **CompanyForm sections**: 4 labeled groups (Business Info, Location, Legal, Marketing).
- **Slug validation**: `isValidSlug()` rejects consecutive hyphens. Regex: `/^[a-z0-9]+(-[a-z0-9]+)*$/`.

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
