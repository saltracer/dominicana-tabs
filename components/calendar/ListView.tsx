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
  const [isFullyRendered, setIsFullyRendered] = React.useState(false);

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

  const sections = generateFeastsList();

  // Mark when list is fully rendered
  useEffect(() => {
    // Wait for list to finish rendering all items
    const timer = setTimeout(() => {
      console.log('✅ List marked as fully rendered');
      setIsFullyRendered(true);
    }, 2000); // Give it 2 seconds to render everything

    return () => clearTimeout(timer);
  }, [sections]);

  // Scroll to selected date AFTER list is fully rendered
  useEffect(() => {
    if (!isFullyRendered) {
      console.log('⏳ Waiting for list to fully render before scrolling');
      return;
    }

    console.log('=== SCROLL EFFECT TRIGGERED (List Rendered) ===');
    console.log('Selected date:', format(selectedDate, 'yyyy-MM-dd (EEEE)'));
    console.log('Has ref:', !!sectionListRef.current);
    console.log('Sections count:', sections.length);
    
    if (!sectionListRef.current) {
      console.log('❌ No ref to SectionList yet');
      return;
    }
    
    if (sections.length === 0) {
      console.log('❌ No sections available');
      return;
    }

    // Find the section index for the selected date
    const selectedDateString = format(selectedDate, 'MMMM yyyy');
    console.log('Looking for section:', selectedDateString);
    
    const sectionIndex = sections.findIndex(section => section.title === selectedDateString);
    console.log('Found section at index:', sectionIndex);
    
    if (sectionIndex === -1) {
      console.log('❌ Section not found for date:', selectedDateString);
      return;
    }
    
    // Find the item index within that section
    const section = sections[sectionIndex];
    console.log('Section has', section.data.length, 'items');
    
    const itemIndex = section.data.findIndex(item => isSameDay(item.date, selectedDate));
    console.log('Found item at index:', itemIndex);
    
    if (itemIndex === -1) {
      console.log('❌ Item not found in section');
      return;
    }
    
    console.log(`✅ Native: Scrolling to section ${sectionIndex}, item ${itemIndex} (${format(selectedDate, 'MMMM d, yyyy')})`);
    
    // Native: Use scrollToLocation with getItemLayout for accurate positioning
    setTimeout(() => {
      try {
        sectionListRef.current?.scrollToLocation({
          sectionIndex,
          itemIndex,
          animated: true,
          viewPosition: 0.15,
        });
        console.log(`✅ Native: scrollToLocation called`);
      } catch (error: any) {
        console.log(`❌ Native: Scroll failed -`, error?.message);
      }
    }, 300);
  }, [isFullyRendered, selectedDate, sections]);

  const renderSectionHeader = ({ section }: any) => (
    <View style={[styles.sectionHeader, { backgroundColor: colors.surface }]}>
      <Text style={[styles.sectionHeaderText, { color: colors.text }]}>{section.title}</Text>
    </View>
  );

  const renderItem = ({ item }: { item: FeastListItem }) => {
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
  };

  // Provide item layout to enable instant scrolling without measuring
  // Calculate height based on number of feasts per day (measured from actual rendering)
  const getItemHeight = (item: FeastListItem) => {
    // Measured: 1 feast = 96px, 2 feasts = 156px, so each additional feast = 60px
    const BASE_HEIGHT = 96; // Includes first feast + padding + borders
    const ADDITIONAL_FEAST_HEIGHT = 60; // Height per additional feast
    return BASE_HEIGHT + ((item.feasts.length - 1) * ADDITIONAL_FEAST_HEIGHT);
  };

  const getItemLayout = (_data: any, index: number) => {
    // Section header: paddingVertical (24) + marginBottom (8) + text (~24) = ~60px
    const SECTION_HEADER_HEIGHT = 60;
    
    // Calculate offset based on sections with variable item heights
    let offset = 0;
    let currentFlatIndex = 0;
    
    for (let i = 0; i < sections.length; i++) {
      // Add section header
      if (currentFlatIndex === index) {
        return { length: SECTION_HEADER_HEIGHT, offset, index };
      }
      offset += SECTION_HEADER_HEIGHT;
      currentFlatIndex++;
      
      // Add items in this section with their actual heights
      for (let j = 0; j < sections[i].data.length; j++) {
        const item = sections[i].data[j];
        const itemHeight = getItemHeight(item);
        
        if (currentFlatIndex === index) {
          return { length: itemHeight, offset, index };
        }
        offset += itemHeight;
        currentFlatIndex++;
      }
    }
    
    // Fallback (shouldn't reach here)
    return { length: 100, offset, index };
  };

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
        onScrollToIndexFailed={(info) => {
          console.log('⚠️  onScrollToIndexFailed (should not happen with getItemLayout):', {
            targetIndex: info.index,
            highestMeasured: info.highestMeasuredFrameIndex,
          });
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

