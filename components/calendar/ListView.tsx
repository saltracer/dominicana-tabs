import React, { useRef, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, SectionList, Pressable, Animated, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { useTheme } from '../ThemeProvider';
import LiturgicalCalendarService from '../../services/LiturgicalCalendar';
import { format, isSameDay } from 'date-fns';

export type FeastColorFilter = 'red' | 'white' | 'green' | 'purple' | 'rose';

interface ListViewProps {
  currentDate: Date;
  selectedDate: Date;
  onDayPress: (date: Date) => void;
  ListHeaderComponent?: React.ReactElement;
  colorFilters?: FeastColorFilter[];
  dominicanOnly?: boolean;
  doctorOnly?: boolean;
}

interface FeastListItem {
  date: Date;
  feasts: any[];
}

interface Section {
  title: string;
  data: FeastListItem[];
}

const ListView: React.FC<ListViewProps> = ({ 
  currentDate, 
  selectedDate, 
  onDayPress, 
  ListHeaderComponent,
  colorFilters = [],
  dominicanOnly = false,
  doctorOnly = false,
}) => {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme ?? 'light'];
  const calendarService = LiturgicalCalendarService.getInstance();
  const sectionListRef = useRef<SectionList>(null);
  const [isContentReady, setIsContentReady] = React.useState(false);
  const pendingScroll = useRef<{ sectionIndex: number; itemIndex: number } | null>(null);
  const lastScrolledDate = useRef<string | null>(null); // Prevent scrolling to same date multiple times
  const lastScrollTimestamp = useRef<number>(0); // Timestamp of last scroll to prevent rapid duplicates
  const scrollRetryCount = useRef<number>(0); // Track retry attempts to prevent infinite loops
  const isFineTuning = useRef<boolean>(false); // Track if we're in fine-tuning phase
  
  // Track loaded years and sections with state for dynamic loading
  const [sections, setSections] = React.useState<Section[]>([]);
  const loadedYears = useRef<Set<number>>(new Set());
  
  // FAB state
  const [showFab, setShowFab] = React.useState(false);
  const fabOpacity = useRef(new Animated.Value(0)).current;
  const scrollY = useRef(0);

  // Generate list of feasts for a specific year
  const generateFeastsForYear = useCallback((year: number): Section[] => {
    const yearSections: Section[] = [];

    for (let month = 0; month < 12; month++) {
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      const monthData: FeastListItem[] = [];

      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        const liturgicalDay = calendarService.getLiturgicalDay(date);

        if (liturgicalDay.feasts.length > 0) {
          // Apply filters to feasts
          let feasts = [...liturgicalDay.feasts];
          
          // Apply Dominican filter
          if (dominicanOnly) {
            feasts = feasts.filter(feast => feast.isDominican);
          }
          
          // Apply Doctor filter
          if (doctorOnly) {
            feasts = feasts.filter(feast => feast.isDoctor);
          }
          
          // Apply color filters
          if (colorFilters.length > 0) {
            feasts = feasts.filter(feast => {
              const feastColor = feast.color?.toLowerCase() || '';
              return colorFilters.some(filter => {
                if (filter === 'purple') return feastColor === 'purple' || feastColor === 'violet';
                if (filter === 'rose') return feastColor === 'rose' || feastColor === 'pink';
                return feastColor === filter;
              });
            });
          }
          
          // Only add if there are feasts after filtering
          if (feasts.length > 0) {
            monthData.push({
              date,
              feasts,
            });
          }
        }
      }

      if (monthData.length > 0) {
        yearSections.push({
          title: format(new Date(year, month, 1), 'MMMM yyyy'),
          data: monthData,
        });
      }
    }

    return yearSections;
  }, [calendarService, colorFilters, dominicanOnly, doctorOnly]);

  // Initialize with current year's data
  useEffect(() => {
    const currentYear = currentDate.getFullYear();
    // Always regenerate when filters change
    const initialSections = generateFeastsForYear(currentYear);
    setSections(initialSections);
    loadedYears.current.clear();
    loadedYears.current.add(currentYear);
    console.log('📅 Loaded initial year with filters:', currentYear, { colorFilters, dominicanOnly, doctorOnly });
  }, [currentDate, generateFeastsForYear, colorFilters, dominicanOnly, doctorOnly]);

  // Handle loading next year when user scrolls to bottom
  const handleEndReached = useCallback(() => {
    // Find the highest year currently loaded
    const years = Array.from(loadedYears.current);
    const maxYear = Math.max(...years);
    const nextYear = maxYear + 1;

    // Check if we've already loaded this year
    if (loadedYears.current.has(nextYear)) {
      return;
    }

    console.log('📅 Loading next year:', nextYear);
    const nextYearSections = generateFeastsForYear(nextYear);
    
    // Append next year's data to existing sections
    setSections(prevSections => [...prevSections, ...nextYearSections]);
    loadedYears.current.add(nextYear);
    console.log('✅ Loaded year:', nextYear);
  }, [generateFeastsForYear]);

  // Handle content size change (list is measured and ready)
  const handleContentSizeChange = () => {
    if (!isContentReady) {
      setIsContentReady(true);
    }
  };

  // Handle scroll position for FAB visibility
  const handleScroll = useCallback((event: any) => {
    const currentScrollY = event.nativeEvent?.contentOffset?.y || 0;
    scrollY.current = currentScrollY;
    
    // Show FAB when scrolled down more than 500px
    const shouldShow = currentScrollY > 500;
    
    if (shouldShow !== showFab) {
      setShowFab(shouldShow);
      Animated.timing(fabOpacity, {
        toValue: shouldShow ? 0.5 : 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [showFab, fabOpacity]);

  // Scroll to top function
  const scrollToTop = useCallback(() => {
    const scrollResponder = (sectionListRef.current as any)?.getScrollResponder?.();
    if (scrollResponder) {
      scrollResponder.scrollTo({ y: 0, animated: true });
    } else if (sectionListRef.current) {
      // Fallback for web
      sectionListRef.current.scrollToLocation({
        sectionIndex: 0,
        itemIndex: 0,
        animated: true,
        viewPosition: 0,
      });
    }
  }, []);

  // Scroll to selected date when content is ready
  useEffect(() => {
    const currentDateString = format(selectedDate, 'yyyy-MM-dd');
    const now = Date.now();
    
    // FIRST: Check if a scroll happened very recently (within 100ms) - prevents batch duplicates
    if (now - lastScrollTimestamp.current < 100) {
      console.log('🚫 Scroll blocked: Too soon after last scroll');
      return;
    }
    
    // SECOND: Check if we already scrolled to this date
    if (lastScrolledDate.current === currentDateString) {
      console.log('🚫 Scroll blocked: Already scrolled to', currentDateString);
      return;
    }
    
    // Update timestamp IMMEDIATELY to block rapid duplicates
    lastScrollTimestamp.current = now;
    
    // Mark this date as scrolled IMMEDIATELY
    lastScrolledDate.current = currentDateString;
    
    if (!isContentReady) {
      console.log('⏳ Scroll deferred: Content not ready yet');
      // Reset flags since we didn't actually scroll
      lastScrolledDate.current = null;
      return;
    }

    if (!sectionListRef.current || sections.length === 0) {
      console.log('⏳ Scroll deferred: SectionList or sections not ready');
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
  }, [isContentReady, selectedDate]); // Removed 'sections' - it's stable for a given currentDate and causes unnecessary re-runs

  const renderSectionHeader = React.useCallback(({ section }: any) => (
    <View style={[styles.sectionHeader, { backgroundColor: colors.surface }]}>
      <Text style={[styles.sectionHeaderText, { color: colors.text }]}>{section.title}</Text>
    </View>
  ), [colors.surface, colors.text]);

  // Map liturgical color names to hex codes (same as DayCell)
  const getLiturgicalColorHex = React.useCallback((colorName: string | undefined): string => {
    if (!colorName) return colors.textMuted;
    const color = colorName.toLowerCase();
    switch (color) {
      case 'red':
        return '#DC143C';
      case 'white':
        return '#FFFFFF';
      case 'green':
        return '#2E7D32';
      case 'purple':
      case 'violet':
        return '#8B008B';
      case 'rose':
      case 'pink':
        return '#FFB6C1';
      case 'gold':
        return '#FFD700';
      default:
        return colors.textMuted;
    }
  }, [colors.textMuted]);

  // Helper function to check if a color is white or very light
  const isLightColor = React.useCallback((colorHex: string): boolean => {
    if (!colorHex) return false;
    return colorHex === '#FFFFFF' || colorHex === '#FFD700';
  }, []);

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
          {item.feasts.length > 1 && (
            <View style={[styles.multipleFeastsIndicator, { backgroundColor: colors.surface }]}>
              <Text style={[styles.multipleFeastsText, { color: colors.text }]}>
                +{item.feasts.length - 1}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.feastsColumn}>
          {item.feasts.map((feast, index) => {
            const feastColorHex = getLiturgicalColorHex(feast.color);
            const isWhiteOrGold = isLightColor(feastColorHex);
            const isLastFeast = index === item.feasts.length - 1;
            
            return (
              <React.Fragment key={index}>
                <View style={styles.feastRow}>
                  <View style={styles.feastHeader}>
                    <View
                      style={[
                        styles.rankBadge,
                        { 
                          backgroundColor: feastColorHex,
                          marginRight: 8,
                          borderWidth: isWhiteOrGold ? 1 : 1,
                          borderColor: isWhiteOrGold ? '#000000' : 'rgba(255,255,255,0.3)',
                        },
                      ]}
                    >
                      <Text 
                        style={[
                          styles.rankText,
                          {
                            color: isWhiteOrGold ? '#000000' : '#FFFFFF',
                          }
                        ]}
                      >
                        {feast.rank === 'Optional Memorial' ? 'O' : feast.rank.charAt(0)}
                      </Text>
                    </View>
                    {feast.isDominican && (
                      <View style={[styles.dominicanBadge, { backgroundColor: colors.dominicanBlack, marginRight: 8 }]}>
                        <Text style={[styles.dominicanBadgeText, { color: colors.dominicanWhite }]}>
                          OP
                        </Text>
                      </View>
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
                  <Text
                    style={[
                      styles.rankLabel,
                      { color: isSelected ? colors.dominicanWhite : colors.textSecondary },
                    ]}
                  >
                    {feast.rank}
                  </Text>
                </View>
                {!isLastFeast && (
                  <View style={[styles.feastDivider, { backgroundColor: isSelected ? 'rgba(255,255,255,0.2)' : colors.border }]} />
                )}
              </React.Fragment>
            );
          })}
        </View>
      </Pressable>
    );
  }, [selectedDate, onDayPress, colors, getLiturgicalColorHex, isLightColor]);

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
        maxToRenderPerBatch={365}
        windowSize={21}
        removeClippedSubviews={false}
        // getItemLayout={getItemLayout} // DISABLED: Let SectionList auto-measure for accurate positioning
        onContentSizeChange={handleContentSizeChange}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.8} // Load next year when user is 80% through the list
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
                  }, 500); // Wait longer for items to render
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
      
      {/* Floating Action Button - Scroll to Top */}
      <Animated.View 
        pointerEvents={showFab ? 'auto' : 'none'}
        style={[
          styles.fab,
          {
            backgroundColor: colors.primary,
            opacity: fabOpacity,
          },
        ]}
      >
        <Pressable
          onPress={scrollToTop}
          disabled={!showFab}
          style={({ pressed }) => [
            styles.fabButton,
            {
              opacity: pressed ? 0.7 : 1,
            },
          ]}
        >
          <Ionicons name="arrow-up" size={24} color={colors.dominicanWhite} />
        </Pressable>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderRadius: 12,
    ...(Platform.OS === 'web' && {
      position: 'relative' as any,
      overflow: 'visible' as any,
    }),
  },
  listContent: {
    paddingBottom: 300, // Ensure last items are fully visible above tab bar
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
    justifyContent: 'center',
  },
  feastRow: {
    paddingVertical: 6,
  },
  feastDivider: {
    height: 1,
    marginVertical: 6,
    opacity: 0.5,
  },
  feastHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  dominicanBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dominicanBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    fontFamily: 'Georgia',
  },
  multipleFeastsIndicator: {
    borderRadius: 6,
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.4)',
    marginTop: 4,
  },
  multipleFeastsText: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'Georgia',
  },
  feastName: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Georgia',
    fontWeight: '600',
    lineHeight: 22,
  },
  rankBadge: {
    width: 22,
    height: 22,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  rankText: {
    fontSize: 10,
    fontWeight: '700',
    fontFamily: 'Georgia',
  },
  rankLabel: {
    fontSize: 13,
    fontFamily: 'Georgia',
  },
  fab: {
    position: 'absolute' as 'absolute',
    right: 20,
    bottom: 100,
    width: 56,
    height: 56,
    borderRadius: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 1000,
  },
  fabButton: {
    width: '100%' as const,
    height: '100%' as const,
    alignItems: 'center' as 'center',
    justifyContent: 'center' as 'center',
    borderRadius: 28,
    ...(Platform.OS === 'web' && {
      cursor: 'pointer',
    } as any),
  },
});

export default ListView;

