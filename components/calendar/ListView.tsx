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
  const scrollRetryCount = useRef<number>(0); // Track retry attempts to prevent infinite loops
  const isFineTuning = useRef<boolean>(false); // Track if we're in fine-tuning phase

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
      console.log('❌ Scroll: Section not found for', selectedDateString);
      return;
    }
    
    // Find the item index within that section
    const section = sections[sectionIndex];
    const itemIndex = section.data.findIndex(item => isSameDay(item.date, selectedDate));
    
    if (itemIndex === -1) {
      console.log('❌ Scroll: Item not found in section', selectedDateString);
      return;
    }
    
    console.log('📍 Preparing to scroll to:', {
      date: format(selectedDate, 'MMM d, yyyy'),
      sectionIndex,
      sectionTitle: section.title,
      itemIndex,
      itemsInSection: section.data.length,
      totalSections: sections.length,
      viewPosition: 0.05,
    });
    
    // Store pending scroll for retry if needed
    pendingScroll.current = { sectionIndex, itemIndex };
    scrollRetryCount.current = 0; // Reset retry counter for new scroll attempt
    isFineTuning.current = false; // Reset fine-tuning flag
    
    // Native: Use scrollToLocation to position selected item with breathing room
    // Increased delay since we're not using getItemLayout - need time for items to be measured
    setTimeout(() => {
      try {
        console.log('🎯 Scrolling to location:', {
          sectionIndex,
          itemIndex,
          viewPosition: 0.05,
          animated: true,
          note: 'Using auto-measurement (no getItemLayout)'
        });
        sectionListRef.current?.scrollToLocation({
          sectionIndex,
          itemIndex,
          animated: true,
          viewPosition: 0.05, // Position near top (5% down) to keep visible above bottom menu
        });
        console.log('✅ Scroll command executed successfully');
      } catch (error: any) {
        console.error('❌ Native: Scroll failed', error?.message);
      }
    }, 750); // Increased delay to allow auto-measurement of items
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
        
        // Add logging for the target item (only log occasionally, not for every render)
        if (index % 50 === 0 || index === 0) {
          console.log('📏 getItemLayout calculated:', {
            flatIndex: index,
            sectionIdx,
            itemIndexInSection,
            calculatedOffset: offset,
            itemHeight,
            note: 'This offset does NOT include ListHeaderComponent height'
          });
        }
        
        return { length: itemHeight, offset, index };
      }
      
      // Not in this section yet, add all item heights from this section
      for (let i = 0; i < itemsInThisSection; i++) {
        offset += getItemHeight(section.data[i]);
      }
      itemsSoFar += itemsInThisSection;
    }
    
    // Fallback (shouldn't reach here)
    console.warn('⚠️ getItemLayout fallback reached for index', index);
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
        initialNumToRender={365}
        maxToRenderPerBatch={30}
        windowSize={21}
        removeClippedSubviews={false}
        // getItemLayout={getItemLayout} // DISABLED: Let SectionList auto-measure for accurate positioning
        onContentSizeChange={handleContentSizeChange}
        onScrollToIndexFailed={(info) => {
          const gap = info.index - info.highestMeasuredFrameIndex;
          
          console.log('⚠️  Native: Scroll to index failed', {
            targetIndex: info.index,
            highestMeasured: info.highestMeasuredFrameIndex,
            averageItemLength: info.averageItemLength,
            gap,
            isFineTuning: isFineTuning.current,
          });
          
          // If we're in fine-tuning mode
          if (isFineTuning.current) {
            // Only continue if gap is very small (≤ 10 items)
            if (gap <= 10) {
              console.log('🎯 Fine-tuning: Gap small enough, trying scrollToLocation once more');
              isFineTuning.current = false; // Prevent further fine-tuning attempts
              setTimeout(() => {
                if (pendingScroll.current) {
                  sectionListRef.current?.scrollToLocation({
                    sectionIndex: pendingScroll.current.sectionIndex,
                    itemIndex: pendingScroll.current.itemIndex,
                    animated: true,
                    viewPosition: 0.05,
                  });
                }
              }, 300);
            } else {
              console.log('⚠️ Fine-tuning: Gap still too large, giving up');
              isFineTuning.current = false;
            }
            return;
          }
          
          // Initial scroll attempt failed
          // If target is far away (gap > 20 items), use scrollTo fallback immediately
          // Otherwise, retry once to see if more items have been measured
          if (gap > 30 || scrollRetryCount.current > 0) {
            console.log('📏 Using scrollTo fallback (gap too large or retry exhausted)');
            const estimatedOffset = info.index * info.averageItemLength;
            
            setTimeout(() => {
              const scrollResponder = (sectionListRef.current as any)?.getScrollResponder?.();
              if (scrollResponder) {
                scrollResponder.scrollTo({ y: estimatedOffset, animated: true });
                console.log('✅ Scrolled to estimated offset:', estimatedOffset);
                
                // Only attempt fine-tuning if gap was very large (needed scrollTo)
                // Wait for rendering, then try once more
                if (gap > 20) {
                  setTimeout(() => {
                    if (pendingScroll.current) {
                      console.log('🎯 Starting fine-tuning phase');
                      isFineTuning.current = true;
                      sectionListRef.current?.scrollToLocation({
                        sectionIndex: pendingScroll.current.sectionIndex,
                        itemIndex: pendingScroll.current.itemIndex,
                        animated: true,
                        viewPosition: 0.05,
                      });
                    }
                  }, 1000); // Wait longer for items to render
                }
              } else {
                console.warn('❌ Could not access scroll responder');
              }
            }, 100);
            
            scrollRetryCount.current = 0;
            return;
          }
          
          // First retry - wait for more items to render
          scrollRetryCount.current += 1;
          if (pendingScroll.current) {
            setTimeout(() => {
              console.log('🔄 Retrying scroll to location (attempt 1)');
              sectionListRef.current?.scrollToLocation({
                sectionIndex: pendingScroll.current!.sectionIndex,
                itemIndex: pendingScroll.current!.itemIndex,
                animated: false,
                viewPosition: 0.05,
              });
            }, 500);
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

