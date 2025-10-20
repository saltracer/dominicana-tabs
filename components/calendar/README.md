# Calendar Components - Developer Guide

## Quick Start

```typescript
// Import all calendar components
import {
  SearchBar,
  FilterPanel,
  SeasonBanner,
  ViewModeToggle,
  DayCell,
  CalendarGrid,
  WeekView,
  ListView,
} from '../../../components/calendar';

// Import types
import type { FeastFilter, ViewMode } from '../../../components/calendar';
```

## Component Usage

### SearchBar

Search for feasts and saints with autocomplete.

```typescript
<SearchBar
  onSelectDate={(date: Date) => {
    // Handle date selection
    console.log('Selected:', date);
  }}
  placeholder="Search feasts and saints..." // Optional
/>
```

**Props:**
- `onSelectDate: (date: Date) => void` - Callback when user selects a search result
- `placeholder?: string` - Custom placeholder text (default: "Search feasts and saints...")

**Features:**
- Autocomplete starts after 2 characters
- Searches through entire year
- Displays up to 8 results
- Shows date, feast name, rank, and Dominican indicator
- Clear button to reset search

---

### FilterPanel

Filter feasts by type and Dominican affiliation.

```typescript
const [selectedFilters, setSelectedFilters] = useState<FeastFilter[]>([]);
const [dominicanOnly, setDominicanOnly] = useState(false);

<FilterPanel
  selectedFilters={selectedFilters}
  onToggleFilter={(filter) => {
    setSelectedFilters(prev =>
      prev.includes(filter) ? prev.filter(f => f !== filter) : [...prev, filter]
    );
  }}
  dominicanOnly={dominicanOnly}
  onToggleDominican={() => setDominicanOnly(!dominicanOnly)}
  onClearAll={() => {
    setSelectedFilters([]);
    setDominicanOnly(false);
  }}
  compact={false} // Set true for mobile
/>
```

**Props:**
- `selectedFilters: FeastFilter[]` - Currently selected feast type filters
- `onToggleFilter: (filter: FeastFilter) => void` - Toggle a feast type filter
- `dominicanOnly: boolean` - Dominican only filter state
- `onToggleDominican: () => void` - Toggle Dominican only filter
- `onClearAll: () => void` - Clear all active filters
- `compact?: boolean` - Use compact mode for mobile (default: false)

**FeastFilter Type:**
```typescript
type FeastFilter = 'Solemnity' | 'Feast' | 'Memorial' | 'Optional Memorial' | 'Ferial';
```

---

### SeasonBanner

Display the current liturgical season with color.

```typescript
<SeasonBanner
  seasonName="Advent"
  seasonColor="Purple"
  weekString="Second Week of Advent"
  compact={false}
/>
```

**Props:**
- `seasonName: string` - Name of liturgical season
- `seasonColor: string` - Color of the season
- `weekString?: string` - Optional week description
- `compact?: boolean` - Use compact mode for mobile (default: false)

**Supported Seasons:**
- Advent (Purple)
- Christmas (White)
- Ordinary Time (Green)
- Lent (Purple)
- Easter (White)

---

### ViewModeToggle

Switch between Month, Week, and List views.

```typescript
const [viewMode, setViewMode] = useState<ViewMode>('month');

<ViewModeToggle
  currentMode={viewMode}
  onModeChange={(mode) => setViewMode(mode)}
  compact={false}
/>
```

**Props:**
- `currentMode: ViewMode` - Current active view mode
- `onModeChange: (mode: ViewMode) => void` - Callback when mode changes
- `compact?: boolean` - Show icons only (default: false)

**ViewMode Type:**
```typescript
type ViewMode = 'month' | 'week' | 'list';
```

---

### DayCell

Individual calendar day cell with feast indicators.

```typescript
<DayCell
  date={{
    dateString: '2025-10-20',
    day: 20
  }}
  marking={{ selected: true }}
  onPress={(date) => console.log('Pressed:', date)}
  size="medium"
  showFeastName={false}
/>
```

**Props:**
- `date?: { dateString: string; day: number }` - Date information
- `marking?: any` - React-native-calendars marking object
- `onPress?: (date?: any) => void` - Tap handler
- `size?: 'small' | 'medium' | 'large' | 'xlarge'` - Cell size (default: 'medium')
- `showFeastName?: boolean` - Show truncated feast name (default: false, recommended for xlarge only)

**Size Guide:**
- `small` (44px): Mobile - number + dot
- `medium` (60px): Tablet - adds badges
- `large` (80px): Desktop - larger badges
- `xlarge` (100px): Wide - includes feast name

---

### CalendarGrid

Month grid view using react-native-calendars.

```typescript
<CalendarGrid
  currentDate="2025-10-20"
  markedDates={{
    '2025-10-20': { selected: true, selectedColor: '#000' },
    '2025-10-25': { marked: true, dotColor: '#8B0000' }
  }}
  onDayPress={(day) => console.log('Day pressed:', day)}
  cellSize="medium"
  showFeastNames={false}
/>
```

**Props:**
- `currentDate: string` - Current date in YYYY-MM-DD format
- `markedDates: any` - Marked dates object from react-native-calendars
- `onDayPress: (day: any) => void` - Day press handler
- `cellSize?: 'small' | 'medium' | 'large' | 'xlarge'` - Size of day cells
- `showFeastNames?: boolean` - Show feast names in cells

---

### WeekView

Horizontal week timeline view.

```typescript
<WeekView
  currentDate={new Date()}
  selectedDate={new Date()}
  onDayPress={(date) => console.log('Day pressed:', date)}
/>
```

**Props:**
- `currentDate: Date` - Current date to show week for
- `selectedDate: Date` - Currently selected date
- `onDayPress: (date: Date) => void` - Day press handler

**Features:**
- Shows 7 days horizontally
- Displays up to 2 feasts per day
- "+N more" indicator for additional feasts
- Current week highlighted
- Scrollable on mobile

---

### ListView

Chronological list of feasts grouped by month.

```typescript
<ListView
  currentDate={new Date()}
  selectedDate={new Date()}
  onDayPress={(date) => console.log('Day pressed:', date)}
/>
```

**Props:**
- `currentDate: Date` - Current date (determines year to show)
- `selectedDate: Date` - Currently selected date
- `onDayPress: (date: Date) => void` - Day press handler

**Features:**
- Grouped by month with sticky headers
- Shows all feasts for each day
- Full feast details visible
- Optimized for browsing and searching

---

## Responsive Design Guidelines

### Breakpoint Usage

```typescript
import { useWindowDimensions } from 'react-native';

const { width } = useWindowDimensions();

const isMobile = width < 768;
const isTablet = width >= 768 && width < 1024;
const isDesktop = width >= 1024;
const isWide = width >= 1440;

// Choose appropriate size
const cellSize = isMobile ? 'small' : isTablet ? 'medium' : isWide ? 'xlarge' : 'large';
```

### Component Sizing

| Breakpoint | SearchBar | FilterPanel | SeasonBanner | ViewModeToggle | DayCell |
|------------|-----------|-------------|--------------|----------------|---------|
| Mobile | Full width | Compact | Compact | Compact (icons) | Small |
| Tablet | Full width | Normal | Normal | Normal | Medium |
| Desktop | 60% width | Normal | Normal | Normal | Large |
| Wide | 60% width | Normal | Normal | Normal | XLarge |

---

## Styling

All components use the app's color scheme from `Colors.ts`:

```typescript
import { useTheme } from '../ThemeProvider';
import { Colors } from '../../constants/Colors';

const { colorScheme } = useTheme();
const colors = Colors[colorScheme ?? 'light'];

// Use colors
backgroundColor: colors.background
textColor: colors.text
primaryColor: colors.primary
// etc.
```

### Feast Colors

Feast rank colors are standardized:

```typescript
const feastColors = {
  'Solemnity': '#8B0000',      // Dark Red
  'Feast': '#4B0082',          // Indigo
  'Memorial': '#DAA520',       // Goldenrod
  'Optional Memorial': '#CD853F', // Peru
  'Ferial': '#2E7D32',         // Forest Green
};
```

---

## Performance Tips

1. **Memoize callbacks**: Use `useCallback` for event handlers
2. **Limit search results**: SearchBar limits to 8 results automatically
3. **Lazy load views**: Only render active view mode
4. **Optimize feast lookup**: Service caches liturgical data

```typescript
// Good
const handleDayPress = useCallback((day: any) => {
  // Handle day press
}, [dependencies]);

// Also good - component handles this internally
<CalendarGrid onDayPress={handleDayPress} />
```

---

## Common Patterns

### Full Calendar Implementation

```typescript
const [viewMode, setViewMode] = useState<ViewMode>('month');
const [selectedFilters, setSelectedFilters] = useState<FeastFilter[]>([]);
const [dominicanOnly, setDominicanOnly] = useState(false);
const { liturgicalDay, selectedDate, updateCalendarSelection } = useCalendar();

return (
  <View>
    <SeasonBanner
      seasonName={liturgicalDay.season.name}
      seasonColor={liturgicalDay.season.color}
      compact={isMobile}
    />
    
    <SearchBar onSelectDate={updateCalendarSelection} />
    
    <FilterPanel
      selectedFilters={selectedFilters}
      onToggleFilter={/* ... */}
      dominicanOnly={dominicanOnly}
      onToggleDominican={/* ... */}
      onClearAll={/* ... */}
    />
    
    <ViewModeToggle
      currentMode={viewMode}
      onModeChange={setViewMode}
    />
    
    {viewMode === 'month' && <CalendarGrid /* ... */ />}
    {viewMode === 'week' && <WeekView /* ... */ />}
    {viewMode === 'list' && <ListView /* ... */ />}
  </View>
);
```

---

## Troubleshooting

### SearchBar not showing results
- Ensure search query is at least 2 characters
- Check that LiturgicalCalendarService is initialized
- Verify feasts exist in the calendar data

### Filters not working
- Ensure you're regenerating `markedDates` when filters change
- Check that feast ranks match filter types exactly
- Verify filter state is being updated

### Animations stuttering
- Use `useNativeDriver: true` when possible (transformations only)
- Avoid animating layout properties on low-end devices
- Reduce animation duration for better performance

### Layout issues on web
- Web uses CSS transitions - check browser compatibility
- Ensure viewport meta tag is set correctly
- Test in different browsers (Chrome, Safari, Firefox)

---

## Additional Resources

- [react-native-calendars Documentation](https://github.com/wix/react-native-calendars)
- [Date-fns Documentation](https://date-fns.org/)
- [React Native Animations](https://reactnative.dev/docs/animations)

---

## Support

For issues or questions about these components, refer to:
- `CALENDAR_REDESIGN_IMPLEMENTATION.md` - Full implementation details
- Main app documentation in `/docs/` folder
- Component source code in `/components/calendar/`

