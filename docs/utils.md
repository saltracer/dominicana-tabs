# Utils

## bibleNavigation.ts
- From: `utils/bibleNavigation.ts`
- Exports:
  - `navigateToBibleBooks()`
  - `navigateToBibleBook(bookCode)`
  - `navigateToBibleChapter(bookCode, chapter)`
  - `navigateToBibleVerse(bookCode, chapter, verse)`
  - `navigateToBibleSearch(bookCode?)`
  - `navigateBack()`
  - `navigateToStudy()`
  - `parseBibleReference(ref): BibleNavigationParams|null`
  - `navigateToBibleReference(ref)`
  - `getBibleNavigationState(searchParams): BibleNavigationParams|null`

Example:
```ts
import { navigateToBibleReference } from '@/utils/bibleNavigation';

navigateToBibleReference('JHN 3:16');
```

## complineResolver.ts
- Exports:
  - `resolveComplineComponents(data, date): ResolvedComplineData`
  - `resolveComponent(component, date): T`

## provinceBoundaryProcessor.ts
- Exports:
  - `processProvinceBoundaries(province, getProvinceColor, selectedId?)`
  - `processAllProvinceBoundaries(provinces, getProvinceColor, selectedId?)`