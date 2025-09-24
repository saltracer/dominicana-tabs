# Contexts

## BibleContext
- From: `contexts/BibleContext.tsx`
- Exports: `BibleProvider`, `useBible`
- Purpose: Manage Bible versions across the app

Example:
```tsx
import { BibleProvider } from '@/contexts/BibleContext';

export function Providers({ children }: { children: React.ReactNode }) {
	return <BibleProvider>{children}</BibleProvider>;
}
```

## CalendarContext
- From: `components/CalendarContext.tsx`
- Exports: `CalendarProvider`, `useCalendar`
- Value: `{ selectedDate, liturgicalDay, setSelectedDate(date), updateCalendarSelection(date) }`

Example:
```tsx
import { CalendarProvider, useCalendar } from '@/components/CalendarContext';

function CalendarExample() {
	const { selectedDate, liturgicalDay, updateCalendarSelection } = useCalendar();
	return (
		<View>
			<Text>{selectedDate.toDateString()}</Text>
			<Text>{liturgicalDay?.weekString}</Text>
			<Button title="Tomorrow" onPress={() => updateCalendarSelection(new Date(Date.now() + 86400000))} />
		</View>
	);
}

export function Providers({ children }: { children: React.ReactNode }) {
	return <CalendarProvider>{children}</CalendarProvider>;
}
```