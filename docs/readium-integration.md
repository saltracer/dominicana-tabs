## Readium EPUB Integration Plan

This document proposes adding EPUB reading using maintained Readium toolkits, with auth-gated access: logged-in users can read; logged-out users see metadata only.

### Library selection (2025)

- Readium has actively maintained mobile toolkits: Swift (iOS) and Kotlin (Android). Historical web modules like `r2-navigator-js`/`r2-streamer-js` appear stale/archived. For Web in a React/Expo environment, a common approach is:
  - Use a lightweight in-app web view for rendering Readium-powered reader from a controlled URL, or
  - Use the mobile toolkits on native (Android/iOS) and a minimal custom web renderer leveraging `readium-css` for typography + a manifest parser.

Given this project is an Expo app with web support, we will:
1) Implement a Web EPUB renderer using a sandboxed `iframe`/`WebView` loading a local reader UI built with standard HTML/CSS/JS and `readium-css` styles, reading from a publication manifest we generate client-side.
2) Encapsulate native platforms for future Readium Swift/Kotlin integration behind a single `EpubReader` interface.

Note: We explicitly avoid `epub.js` per product decision.

### High-level architecture

- `types/ebooks.ts`: Domain types for `Ebook`, `EbookAccess`, `ReadingProgress`.
- `services/EbooksService.ts`: Book metadata fetch from Supabase; secure asset URL retrieval for authenticated users.
- `components/EpubReader.(web|native).tsx`: Platform-specific reader: web uses `react-native-webview` (or `iframe` for web), native later implements Readium Swift/Kotlin.
- `app/(tabs)/study/reader/[bookId].tsx`: Reader screen. Guards: if not logged in => redirect to book details.
- `app/(tabs)/study/book/[bookId].tsx`: Metadata-only view for guests, includes login CTA.

### Supabase schema (proposed)

We use tables focused on metadata; files stored in Supabase Storage bucket `ebooks`.

```sql
-- Books available to everyone to discover (metadata only)
create table if not exists public.books (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  author text,
  description text,
  cover_path text,         -- storage path: ebooks/covers/{slug}.jpg
  file_path text,          -- storage path: ebooks/files/{slug}.epub
  language text,
  tags text[] default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Optional: ownership/entitlements if needed (e.g., purchases or library grants)
create table if not exists public.user_books (
  user_id uuid not null references auth.users(id) on delete cascade,
  book_id uuid not null references public.books(id) on delete cascade,
  can_read boolean not null default true,
  last_read_at timestamptz,
  progress jsonb default '{}',
  primary key (user_id, book_id)
);

alter table public.books enable row level security;
alter table public.user_books enable row level security;

-- Policies: everyone can read books metadata
create policy "books_metadata_select_all"
on public.books for select
to public
using (true);

-- Policies: user_books only visible to the owner
create policy "user_books_owner_select"
on public.user_books for select
to authenticated
using (auth.uid() = user_id);
```

Storage ACL:
- Bucket `ebooks` public for covers only (`ebooks/covers/*`); private for files (`ebooks/files/*`).
- Signed URL or service role required to fetch `file_path` for authenticated users.

### Auth gating

- Logged out: show `BookDetails` from `public.books`; hide/disable read button.
- Logged in: fetch signed download URL for `file_path` via Supabase; open reader.

### Web reader approach

- Generate a minimal publication manifest in memory and load EPUB via `JSZip` + web worker or stream from signed URL, then render reflowable content using `readium-css` classes within an `iframe`. Navigation, TOC, font size, theme toggles implemented in React.
- This provides a maintained and replaceable path for a future official Readium Web module if it becomes available.

### Packages

- `react-native-webview` (already present) for native/web unified API.
- `readium-css` for standard EPUB typography classes.
- `jszip` for EPUB (zip) handling on web.

### Implementation steps

1. Add domain types and service layer.
2. Create `BookDetails` screen and `Reader` screen with auth gating.
3. Implement `EpubReader.web.tsx` using `iframe` + `readium-css`.
4. Wire Study list to details/reader.
5. Tests: unit tests for gating and service calls; snapshot tests for screens.

### Tests

- Render `BookDetails` logged-out: shows metadata and Login CTA, no reader.
- Render `Reader` logged-in with mocked signed URL: mounts `EpubReader`.
- Service: `getSignedFileUrl` only called when authenticated.

### Future native integration

- iOS: integrate Readium Swift (Streamer + Navigator) and map to `EpubReader.native.tsx`.
- Android: integrate Readium Kotlin toolkit similarly.

