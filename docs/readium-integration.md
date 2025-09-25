## Readium EPUB Integration Plan (React Native)

This document proposes adding EPUB reading using the maintained Readium mobile toolkits (Swift for iOS, Kotlin for Android), with auth-gated access: authenticated users can read; unauthenticated users see metadata only. We do not use `epub.js`.

### Library selection (2025)

- Use official Readium mobile toolkits:
  - iOS: Readium Swift Toolkit (`ReadiumShared`, `ReadiumStreamer`, `ReadiumNavigator`)
  - Android: Readium Kotlin Toolkit (shared/streamer/navigator modules)
- There is no officially maintained Readium Web navigator on npm for React/Expo. For Web, we will show metadata for now (no EPUB reading on web).
- We explicitly avoid `epub.js` and any wrappers built on it.

### High-level architecture

- `types/ebooks.ts`: Domain types for `Ebook`, `EbookAccess`, `ReadingProgress`.
- `services/EbooksService.ts`: Book metadata fetch from Supabase; secure asset URL retrieval for authenticated users.
- `native/ios` and `native/android`: React Native bridges to Readium Swift/Kotlin toolkits exposing a `ReadiumReaderView` and control methods/events.
- `components/ReadiumReader.tsx`: JS wrapper around the native view with props like `source`, `initialLocator`, callbacks for location changes, TOC, etc.
- `app/(tabs)/study/reader/[bookId].tsx`: Reader screen. Guards: if not logged in => navigate to book details.
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

### Web platform (current stance)

- No EPUB reading on web at this time. Show metadata and a sign-in CTA. If Readium publishes a maintained Web navigator, we can add a web renderer behind the same `ReadiumReader` interface.

### Native packages and setup

- Add Readium Swift Toolkit via Swift Package Manager to the iOS project.
- Add Readium Kotlin Toolkit dependencies to the Android project (Gradle/MavenCentral/JitPack as per toolkit docs).
- Create RN native modules:
  - iOS: `ReadiumReaderViewManager` exposing a `UIView` hosting `Navigator` and wired to `Streamer` for loading EPUB from a signed URL or local file.
  - Android: `ReadiumReaderViewManager` exposing a `View` hosting `NavigatorFragment` with `Streamer`.
- Expo: use a config plugin and `expo prebuild` to add native dependencies; ship via Dev Client.

### Implementation steps

1. Add domain types and service layer.
2. Create `BookDetails` screen and `Reader` screen with auth gating.
3. Implement `ReadiumReader` JS wrapper and native bridges on iOS/Android.
4. Wire Study list to details/reader and load signed URLs for authenticated users.
5. Tests: unit tests for gating and service calls; JS wrapper mocks for native view; snapshot tests for screens.

### Tests

- Render `BookDetails` logged-out: shows metadata and Login CTA, no reader.
- Render `Reader` logged-in with mocked signed URL: mounts `ReadiumReader` wrapper.
- Service: `getSignedFileUrl` only called when authenticated.
- JS wrapper: verify it forwards props and calls event callbacks when the native module emits events (mocked).

### Future enhancements

- Add bookmarks, annotations, highlights using toolkit features.
- Persist reading location (`locator`) to Supabase per user/book.

