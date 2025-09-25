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

---

## Implementation Notes (as built)

This section documents what has been implemented in this repository and how the pieces fit together.

### Key files added/edited

- Auth and Providers
  - `contexts/AuthContext.tsx`: Simple auth context providing `isAuthenticated`, `login()`, and `logout()`.
  - `app/_layout.tsx`: Wrapped the app in `AuthProvider` alongside existing providers.

- Supabase
  - `services/supabaseClient.ts`: Supabase JS client using `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY`.
  - `services/EbooksService.ts`:
    - `listBooks()`: `select` from `books` table (metadata only, public).
    - `getBookById(idOrSlug)`: fetch a single book by `id` or `slug`.
    - `getSignedFileUrl(filePath)`: creates a signed URL from `ebooks` bucket for private EPUBs.

- Screens and Components
  - `app/(tabs)/study/book/[bookId].tsx`: Metadata-only screen with Login or Open Reader CTA.
  - `app/(tabs)/study/reader/[bookId].tsx`: Auth-gated reader screen. If logged-in, retrieves a signed URL via `EbooksService` and mounts the native reader.
  - `components/ReadiumReader.tsx`: React wrapper for the native view `ReadiumReaderView` exposing props `source`, `initialLocator`, and event `onLocationChange`.
  - Study navigation (`app/(tabs)/study/index.tsx`): For guests, pressing a book navigates to metadata details; for authed users, it opens the reader.

- Native modules scaffolding
  - iOS: `native/ios/ReadiumReaderViewManager.swift` + `ReadiumReaderViewManager.m`
    - Exposes a `UIView` to RN. Accepts `source` and `initialLocator`, emits `onLocationChange` (currently synthetic) to validate wiring.
    - TODO: Wire `Streamer` + `Navigator` to render EPUBs from signed URL.
  - Android: `native/android/src/main/java/com/dominicana/readium/ReadiumReaderViewManager.kt`
    - Exposes a `View` to RN with `source` and `initialLocator`, and an `onLocationChange` event (currently synthetic).
    - TODO: Wire Kotlin toolkit `Streamer` + `NavigatorFragment` to render EPUBs from signed URL.

- Config plugin (scaffold)
  - `plugins/with-readium-native.ts`: Minimal plugin placeholder ready to be enhanced to add native dependencies.
  - `app.json`: Plugin entry added (will be switched to a relative path when finalizing).

- Tests
  - `components/__tests__/EpubAccess.test.tsx`: Ensures unauthenticated users see the login gate on the reader screen.
  - `components/__tests__/ReadiumReader.test.tsx`: Verifies wrapper renders and props are wired.
  - `services/__tests__/EbooksService.test.ts`: Mocks Supabase and verifies signed URL/list code paths.

### How it works

1) A user opens Study and taps a book card.
   - If not authenticated, they are routed to `book/[bookId]` which shows metadata and a login button.
   - If authenticated, they are routed to `reader/[bookId]`.

2) On `reader/[bookId]`, the screen requests a signed URL from `EbooksService` using the book's `file_path`. The signed URL is passed to `ReadiumReader` via the `source` prop.

3) `ReadiumReader` renders a native view `ReadiumReaderView` (iOS/Android). The native view will load the EPUB (via Readium toolkits) and emit `onLocationChange` with a locator string when navigation occurs. The JS side can persist that locator to Supabase for resuming reading.

4) Supabase tables and access control:
   - `books` is public-readable for metadata. Users can browse titles, authors, descriptions, and covers without authentication.
   - `ebooks` Storage bucket is private for `files/` and public for `covers/`. Authenticated users get a time-limited signed URL for the EPUB file.

### Build and run (expected flow)

- Web: Library UI and metadata screens should run. Reader is native-only.
- Native:
  - Configure env vars: `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`.
  - Add Readium dependencies via the config plugin (see TODO) and run `expo prebuild` to generate native projects.
  - iOS: `cd ios && pod install` (if using CocoaPods); build via Xcode or `expo run:ios`.
  - Android: Ensure Gradle deps for Readium Kotlin; build via Android Studio or `expo run:android`.

### Notes on Readium integration

- iOS: The Readium Swift Toolkit will provide `Streamer` to open publications and `Navigator` to render. The native view should host the navigator view controller and forward locator updates to RN events.
- Android: The Kotlin Toolkit similarly provides `Streamer` and `NavigatorFragment`. The RN view should host the fragment and forward events.
- We avoid `epub.js` entirely, as requested.

### Supabase schema and policies

See the SQL in this document above. Implement in your Supabase project:
- Create `books`, `user_books` with RLS as specified.
- Configure Storage bucket `ebooks` with public `covers/*` and private `files/*`.
- Replace `EbooksService` placeholders to match your actual table/paths.

### Testing strategy

- Unit tests (JS) cover:
  - Access gating for unauthenticated users.
  - Reader wrapper props and event mapping (native mocked).
  - Service interactions (Supabase mocked).
- E2E tests (future):
  - Detox tests can verify navigation to reader on-device and location persistence.

---

## Remaining Work (Backlog and Acceptance)

1) Config plugin to add native dependencies [iOS/Android]
   - iOS: Add Readium Swift Toolkit via SPM or CocoaPods. Acceptance: `pod install` resolves and `ReadiumReaderView` compiles.
   - Android: Add Kotlin Toolkit Gradle dependencies. Acceptance: Gradle sync/build succeeds.

2) Wire toolkits inside native views
   - iOS: Implement `Streamer` open from `source` (signed URL), mount `Navigator`, forward `onLocationChange` with locator JSON. Acceptance: an EPUB renders and page turns emit events.
   - Android: Implement `Streamer` + `NavigatorFragment` with same behavior. Acceptance: EPUB renders and events fire.

3) Supabase SQL and Storage
   - Run migrations to create tables and RLS; set Storage policies. Acceptance: anonymous can list metadata; authenticated can fetch signed URL for file.

4) Auth integration
   - Replace demo `AuthContext` with actual auth (e.g., Supabase Auth), wiring `isAuthenticated` and tokens. Acceptance: Reader access truly gated by real auth state.

5) Persistence
   - Save and restore reading locator per user/book to `user_books.progress`. Acceptance: Returning to a book resumes at last location.

6) UI polish & error states
   - Loading and error handling in details/reader screens; retry flows. Acceptance: graceful UX on network/storage issues.

7) Tests expansion
   - Add more wrapper tests (prop changes, unmount), service error cases, and E2E tests with Detox. Acceptance: green CI on unit + e2e suites.

8) Documentation & Ops
   - Update `README.md` with native build steps, env var usage, and Supabase setup instructions. Acceptance: a new dev can follow docs and run the app with a sample EPUB end-to-end.


