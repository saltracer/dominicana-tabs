# Types

Key public types live under `types/`.

- `types/index.ts`: App-wide types including `LiturgicalDay`, `Saint`, `Prayer`, `HourType`, `Bible*` types, and navigation param lists.
- `types/bible-version-types.ts`: Multi-version Bible types: `BibleVersion`, `VersionBibleBook`, `BibleParser`, `BibleAssetLoader`.
- `types/usx-types.ts`: USX parsing structures: `USXDocument`, `ParsedBook`, `ParsedChapter`, `ParsedVerse`, `BookMetadata`, parser options and result types.
- `types/compline-types.ts`: Compline domain types including `ComplineData`, `ComplineComponents`, and helpers `getDayOfWeekFromDate`, `getComponentForDay`, `isDayOfWeekVariations`.
- `types/celebrations-types.ts`: Celebration ranks and interfaces for the liturgical calendar.
- `types/liturgy-types.ts`, `types/liturgical-types.ts`, `types/saint-types.ts`: Additional domain types.

Example imports:
```ts
import type { LiturgicalDay, HourType } from '@/types';
import type { BibleVersion } from '@/types/bible-version-types';
```