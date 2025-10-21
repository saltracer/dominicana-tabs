import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, SectionList, Pressable } from 'react-native';
import { Colors } from '../../constants/Colors';
import { useTheme } from '../ThemeProvider';
import LiturgicalCalendarService from '../../services/LiturgicalCalendar';
import { format, isSameDay } from 'date-fns';

interface ListViewProps {
  currentDate: Date;
  selectedDate: Date;
  onDayPress: (date: Date) => void;
  ListHeaderComponent?: React.ReactElement;
}

interface FeastListItem {
  date: Date;
  feasts: any[];
}

interface Section {
  title: string;
  data: FeastListItem[];
}

const ListView: React.FC<ListViewProps> = ({ currentDate, selectedDate, onDayPress, ListHeaderComponent }) => {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme ?? 'light'];
  const calendarService = LiturgicalCalendarService.getInstance();
  const sectionListRef = useRef<SectionList>(null);
  const [isContentReady, setIsContentReady] = React.useState(false);
  const pendingScroll = useRef<{ sectionIndex: number; itemIndex: number } | null>(null);
  const lastScrolledDate = useRef<string | null>(null); // Prevent scrolling to same date multiple times

  // Generate list of feasts for the current year
  const generateFeastsList = (): Section[] => {
    const sections: Section[] = [];
    const currentYear = currentDate.getFullYear();

    for (let month = 0; month < 12; month++) {
      const daysInMonth = new Date(currentYear, month + 1, 0).getDate();
      const monthData: FeastListItem[] = [];

      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(currentYear, month, day);
        const liturgicalDay = calendarService.getLiturgicalDay(date);

        if (liturgicalDay.feasts.length > 0) {
          monthData.push({
            date,
            feasts: liturgicalDay.feasts,
          });
        }
      }

      if (monthData.length > 0) {
        sections.push({
          title: format(new Date(currentYear, month, 1), 'MMMM yyyy'),
          data: monthData,
        });
      }
    }

    return sections;
  };

  // Memoize sections to prevent regenerating on every render
  const sections = React.useMemo(() => generateFeastsList(), [currentDate]);

  // Handle content size change (list is measured and ready)
  const handleContentSizeChange = () => {
    if (!isContentReady) {
      setIsContentReady(true);
    }
  };

  // Scroll to selected date when content is ready
  useEffect(() => {
    const currentDateString = format(selectedDate, 'yyyy-MM-dd');
    
    if (!isContentReady) {
      return;
    }

    // Single guard: only scroll if this date hasn't been scrolled to yet
    if (lastScrolledDate.current === currentDateString) {
      return;
    }
    
    // Mark this date as scrolled IMMEDIATELY (before any async operations)
    lastScrolledDate.current = currentDateString;

    if (!sectionListRef.current || sections.length === 0) {
      return;
    }

    // Find the section index for the selected date
    const selectedDateString = format(selectedDate, 'MMMM yyyy');
    const sectionIndex = sections.findIndex(section => section.title === selectedDateString);
    
    if (sectionIndex === -1) {
      return;
    }
    
    // Find the item index within that section
    const section = sections[sectionIndex];
    const itemIndex = section.data.findIndex(item => isSameDay(item.date, selectedDate));
    
    if (itemIndex === -1) {
      return;
    }
    
    // Store pending scroll for retry if needed
    pendingScroll.current = { sectionIndex, itemIndex };
    
    // Native: Use scrollToLocation with buffer to account for rendering
    setTimeout(() => {
      try {
        sectionListRef.current?.scrollToLocation({
          sectionIndex,
          itemIndex,
          animated: true,
          viewPosition: 0.2, // Leave buffer room for items rendering above
        });
      } catch (error: any) {
        console.error('Native: Scroll failed', error?.message);
      }
    }, 300); // Longer delay to let more items render first
  }, [isContentReady, selectedDate, sections]);

  const renderSectionHeader = React.useCallback(({ section }: any) => (
    <View style={[styles.sectionHeader, { backgroundColor: colors.surface }]}>
      <Text style={[styles.sectionHeaderText, { color: colors.text }]}>{section.title}</Text>
    </View>
  ), [colors.surface, colors.text]);

  const renderItem = React.useCallback(({ item }: { item: FeastListItem }) => {
    const isSelected = isSameDay(item.date, selectedDate);
    const isToday = isSameDay(item.date, new Date());

    return (
      <Pressable
        onPress={() => onDayPress(item.date)}
        style={({ pressed }) => [
          styles.listItem,
          {
            backgroundColor: isSelected ? colors.primary : colors.card,
            borderColor: isToday ? colors.primary : colors.border,
            opacity: pressed ? 0.7 : 1,
          },
        ]}
      >
        <View style={styles.dateColumn}>
          <Text
            style={[
              styles.dateDay,
              { color: isSelected ? colors.dominicanWhite : colors.text },
            ]}
          >
            {format(item.date, 'd')}
          </Text>
          <Text
            style={[
              styles.dateDayOfWeek,
              { color: isSelected ? colors.dominicanWhite : colors.textSecondary },
            ]}
          >
            {format(item.date, 'EEE')}
          </Text>
        </View>

        <View style={styles.feastsColumn}>
          {item.feasts.map((feast, index) => (
            <View key={index} style={styles.feastRow}>
              <View style={styles.feastHeader}>
                {feast.isDominican && (
                  <Text
                    style={[
                      styles.dominicanIndicator,
                      { color: isSelected ? colors.dominicanWhite : colors.primary, marginRight: 6 },
                    ]}
                  >
                    ⚫
                  </Text>
                )}
                <Text
                  style={[
                    styles.feastName,
                    { color: isSelected ? colors.dominicanWhite : colors.text },
                  ]}
                  numberOfLines={2}
                >
                  {feast.name}
                </Text>
              </View>
              <View style={styles.feastMeta}>
                <View
                  style={[
                    styles.rankBadge,
                    { backgroundColor: feast.color || colors.textMuted, marginRight: 8 },
                  ]}
                >
                  <Text style={styles.rankText}>
                    {feast.rank === 'Optional Memorial' ? 'OM' : feast.rank.charAt(0)}
                  </Text>
                </View>
                <Text
                  style={[
                    styles.rankLabel,
                    { color: isSelected ? colors.dominicanWhite : colors.textSecondary },
                  ]}
                >
                  {feast.rank}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </Pressable>
    );
  }, [selectedDate, onDayPress, colors.primary, colors.card, colors.border, colors.dominicanWhite, colors.text, colors.textSecondary]);

  // Provide item layout to enable instant scrolling without measuring
  // Calculate height based on number of feasts per day (measured from actual rendering)
  const getItemHeight = React.useCallback((item: FeastListItem) => {
    // Measured: 1 feast = 96px, 2 feasts = 156px, so each additional feast = 60px
    const BASE_HEIGHT = 96; // Includes first feast + padding + borders
    const ADDITIONAL_FEAST_HEIGHT = 60; // Height per additional feast
    return BASE_HEIGHT + ((item.feasts.length - 1) * ADDITIONAL_FEAST_HEIGHT);
  }, []);

  const getItemLayout = React.useCallback((_data: any, index: number) => {
    // Section header: Measured on native at 44.7px
    const SECTION_HEADER_HEIGHT = 45;
    
    // KEY INSIGHT: index is the flat ITEM index (excluding section headers),
    // but offset must INCLUDE section header heights in the calculation
    let offset = 0;
    let itemsSoFar = 0; // Count items only, not headers
    
    for (let sectionIdx = 0; sectionIdx < sections.length; sectionIdx++) {
      const section = sections[sectionIdx];
      const itemsInThisSection = section.data.length;
      
      // Add section header height to offset (but not to item count)
      offset += SECTION_HEADER_HEIGHT;
      
      // Check if the target index is in this section
      if (index < itemsSoFar + itemsInThisSection) {
        // Target item is in this section!
        const itemIndexInSection = index - itemsSoFar;
        
        // Add heights of all items BEFORE the target in this section
        for (let i = 0; i < itemIndexInSection; i++) {
          offset += getItemHeight(section.data[i]);
        }
        
        const targetItem = section.data[itemIndexInSection];
        const itemHeight = getItemHeight(targetItem);
        
        // Removed logging - called too frequently, causes performance issues
        return { length: itemHeight, offset, index };
      }
      
      // Not in this section yet, add all item heights from this section
      for (let i = 0; i < itemsInThisSection; i++) {
        offset += getItemHeight(section.data[i]);
      }
      itemsSoFar += itemsInThisSection;
    }
    
    // Fallback (shouldn't reach here)
    return { length: 100, offset, index };
  }, [sections, getItemHeight]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <SectionList
        ref={sectionListRef}
        sections={sections}
        renderSectionHeader={renderSectionHeader as any}
        renderItem={renderItem}
        keyExtractor={(item) => item.date.toISOString()}
        stickySectionHeadersEnabled={true}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={ListHeaderComponent}
        initialNumToRender={50}
        maxToRenderPerBatch={30}
        windowSize={21}
        removeClippedSubviews={false}
        getItemLayout={getItemLayout}
        onContentSizeChange={handleContentSizeChange}
        onScrollToIndexFailed={(info) => {
          console.log('⚠️  Native: Scroll to index failed, retrying...', {
            targetIndex: info.index,
            highestMeasured: info.highestMeasuredFrameIndex,
            averageItemLength: info.averageItemLength,
          });
          
          // Retry after a short delay if we have a pending scroll
          if (pendingScroll.current) {
            setTimeout(() => {
              console.log('🔄 Native: Retrying scroll...');
              sectionListRef.current?.scrollToLocation({
                sectionIndex: pendingScroll.current!.sectionIndex,
                itemIndex: pendingScroll.current!.itemIndex,
                animated: false, // No animation on retry for speed
                viewPosition: 0.1,
              });
            }, 100);
          }
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderRadius: 12,
  },
  listContent: {
    paddingBottom: 20,
  },
  sectionHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  sectionHeaderText: {
    fontSize: 18,
    fontFamily: 'Georgia',
    fontWeight: '700',
  },
  listItem: {
    flexDirection: 'row',
    padding: 16,
    marginBottom: 8,
    borderRadius: 12,
    borderWidth: 2,
  },
  dateColumn: {
    width: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  dateDay: {
    fontSize: 28,
    fontFamily: 'Georgia',
    fontWeight: '700',
  },
  dateDayOfWeek: {
    fontSize: 12,
    fontFamily: 'Georgia',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  feastsColumn: {
    flex: 1,
  },
  feastRow: {
    marginBottom: 12,
  },
  feastHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  dominicanIndicator: {
    fontSize: 14,
    marginTop: 2,
  },
  feastName: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Georgia',
    fontWeight: '600',
    lineHeight: 22,
  },
  feastMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rankBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: 'Georgia',
  },
  rankLabel: {
    fontSize: 13,
    fontFamily: 'Georgia',
  },
});

export default ListView;

