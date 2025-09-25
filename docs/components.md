# Components

This document lists public components with props and usage examples.

## ThemeProvider

- Export: `ThemeProvider`, `useTheme`
- From: `components/ThemeProvider.tsx`
- Props: `{ children: React.ReactNode }`

Example:
```tsx
import { ThemeProvider } from '@/components/ThemeProvider';

export default function App() {
	return (
		<ThemeProvider>
			{/* app content */}
		</ThemeProvider>
	);
}
```

## Themed

- Exports: `Text`, `View`, `useThemeColor`
- From: `components/Themed.tsx`

Example:
```tsx
import { Text, View } from '@/components/Themed';

export function Card() {
	return (
		<View style={{ padding: 16 }}>
			<Text>Dominicana</Text>
		</View>
	);
}
```

## BibleVersionSelector

- Default export
- From: `components/BibleVersionSelector.tsx`
- Props:
  - `currentVersion: string`
  - `onVersionChange(versionId: string): void`
  - `style?: any`

Example:
```tsx
import BibleVersionSelector from '@/components/BibleVersionSelector';
import { useBible } from '@/contexts/BibleContext';

export function VersionSwitcher() {
	const { currentVersion, setCurrentVersion } = useBible();
	return (
		<BibleVersionSelector
			currentVersion={currentVersion}
			onVersionChange={setCurrentVersion}
		/>
	);
}
```

## SwipeNavigationWrapper

- Default export
- From: `components/SwipeNavigationWrapper.tsx`
- Props:
  - `children: React.ReactNode`
  - `currentHour: HourType`
  - `onSwipe?(direction: 'left'|'right'): void`

Example:
```tsx
import SwipeNavigationWrapper from '@/components/SwipeNavigationWrapper';
import type { HourType } from '@/types';

export function HourScreen({ hour }: { hour: HourType }) {
	return (
		<SwipeNavigationWrapper currentHour={hour}>
			{/* Hour content */}
		</SwipeNavigationWrapper>
	);
}
```

## FeastBanner / FeastBanner.web
Default exports from `components/FeastBanner.tsx` and `.web.tsx`. Use directly in screens.

## Prayer components
Default exports:
- `PrayerNavigation`, `PrayerNavButtons`, `PrayerHoursNavigation`, `PrayerHourPickerModal`

## ProvincesMap
- Default export via `components/ProvincesMap/index.ts`
- Native/web platform-specific components auto-resolved by bundler

## Misc
Default exports: `ExternalLink`, `EditScreenInfo`, `CommunityNavigation`, `ProvinceDetailsPanel`, `SaintDetailPanel.web`, `Footer.web`.