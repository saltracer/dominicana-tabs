# Hooks

Public hooks with signatures and examples.

## useTheme
- From: `components/ThemeProvider.tsx`
- Returns: `{ themeMode: 'light'|'dark'|'system', colorScheme: 'light'|'dark', setThemeMode(mode) }`

Example:
```tsx
import { useTheme } from '@/components/ThemeProvider';

function ThemeToggle() {
	const { themeMode, setThemeMode } = useTheme();
	return (
		<Button
			title={`Theme: ${themeMode}`}
			onPress={() => setThemeMode(themeMode === 'dark' ? 'light' : 'dark')}
		/>
	);
}
```

## useBible
- From: `contexts/BibleContext.tsx`
- Returns: `{ currentVersion, availableVersions, setCurrentVersion(id), getCurrentVersionInfo(), loading, error }`

Example:
```tsx
import { useBible } from '@/contexts/BibleContext';

function CurrentVersionLabel() {
	const { currentVersion, getCurrentVersionInfo } = useBible();
	return <Text>{getCurrentVersionInfo()?.shortName ?? currentVersion}</Text>;
}
```

## useCompline
- From: `hooks/useCompline.ts`
- Signature: `useCompline(date: Date, options?: { language?: LanguageCode, preferences?, autoPreload?: boolean })`
- Returns: `{ complineData, loading, error, refresh, preloadData, cacheInfo }`

Example:
```tsx
import { useCompline } from '@/hooks/useCompline';

export function Compline({ date }: { date: Date }) {
	const { complineData, loading, error, refresh } = useCompline(date, { language: 'en', autoPreload: true });
	if (loading) return <Text>Loading…</Text>;
	if (error) return <Text>Error: {error}</Text>;
	return <Text>{complineData?.components.reading.text}</Text>;
}
```

## useComplineData
- From: `hooks/useComplineData.ts`
- Signature: `useComplineData(complineService, { language }?)`
- Returns: `{ complineData, loading, error, loadComplineData(date) }`

## useComplineCache
- From: `hooks/useComplineCache.ts`
- Signature: `useComplineCache(offlineManager)`
- Returns: `{ cacheInfo, refreshCacheInfo, clearCache }`

## useComplineServices
- From: `hooks/useComplineServices.ts`
- Returns: `{ complineService, offlineManager, servicesError }`

## useComplineDate
- From: `hooks/useComplineDate.ts`
- Returns: `{ currentDate, targetDate }`