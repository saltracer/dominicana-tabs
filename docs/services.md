# Services

## MultiVersionBibleService
- From: `services/MultiVersionBibleService.ts`
- Exports: `MultiVersionBibleService` class, `multiVersionBibleService` singleton
- Key methods:
  - `getAvailableVersions(): BibleVersion[]`
  - `getCurrentVersion(): string`
  - `setCurrentVersion(id: string): void`
  - `getCurrentVersionInfo(): BibleVersion`
  - `getAvailableBooks(): Promise<VersionBibleBook[]>`
  - `loadBook(bookCode, versionId?): Promise<ParsedBook>`
  - `getVerse(bookCode, chapter, verse, versionId?): Promise<BibleVerse|null>`
  - `getChapter(bookCode, chapter, versionId?): Promise<BibleChapter|null>`
  - `search(text, bookCodeOrCategory?, caseSensitive?): Promise<BibleSearchResult[]>`
  - `searchMultipleVersions(text, versionIds?): Promise<MultiVersionSearchResult[]>`

Example:
```ts
import { multiVersionBibleService } from '@/services/MultiVersionBibleService';

async function fetchJohn316() {
	await multiVersionBibleService.setCurrentVersion('douay-rheims');
	return await multiVersionBibleService.getVerse('JHN', 3, 16);
}
```

## BibleService
- From: `services/BibleService.ts`
- Purpose: Single-version USX parsing and book access
- Key methods: `getBibleBooks()`, `getBooksByCategory(category)`, `getBookByCode(code)`, `loadBook(code)`

## USXParser
- From: `services/USXParser.ts`
- Methods:
  - `parseUSXContent(usx: string): USXParseResult`
  - Provides helpers for chapter/verse extraction via parse result

## USFXParser
- From: `services/USFXParser.ts`
- Methods:
  - `parseUSFXContent(usfx: string): USXParseResult`

## ComplineService
- From: `services/ComplineService.ts`
- Singleton: `ComplineService.getInstance(config?)`
- Methods:
  - `getComplineForDate(date, language): Promise<ComplineData>`
  - `preloadComplineData(language, days?): Promise<void>`
  - `clearCache(): Promise<void>`
  - `getCacheSize(): Promise<number>`
  - `getOfflineDataSize(): Promise<number>`

Example:
```ts
import { ComplineService } from '@/services/ComplineService';

const service = ComplineService.getInstance();
const data = await service.getComplineForDate(new Date(), 'en');
```

## OfflineManager
- From: `services/OfflineManager.ts`
- Singleton: `OfflineManager.getInstance()`
- Methods:
  - `preloadComplineData(language, days?)`
  - `preloadAudioFiles(language, days?)`
  - `downloadAndCache(audio)`
  - `getCachedAudio(audio)`
  - `clearAudioCache()`
  - `getCacheInfo()`
  - `isAudioCached(audio)`

## LiturgicalCalendarService
- From: `services/LiturgicalCalendar.ts`
- Singleton: `LiturgicalCalendarService.getInstance()`
- Methods:
  - `getLiturgicalDay(date): LiturgicalDay`
  - `preloadDateRange(start, end)`
  - `clearCache()`, `getCacheStats()`