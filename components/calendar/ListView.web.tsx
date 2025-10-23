import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
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
}) => {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme ?? 'light'];
  const calendarService = LiturgicalCalendarService.getInstance();
  const scrollViewRef = useRef<ScrollView>(null);

  // Generate list of feasts for the current year
  const generateFeastsList = React.useCallback((): Section[] => {
    const sections: Section[] = [];
    const currentYear = currentDate.getFullYear();

    for (let month = 0; month < 12; month++) {
      const daysInMonth = new Date(currentYear, month + 1, 0).getDate();
      const monthData: FeastListItem[] = [];

      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(currentYear, month, day);
        const liturgicalDay = calendarService.getLiturgicalDay(date);

        if (liturgicalDay.feasts.length > 0) {
          // Apply filters to feasts
          let feasts = [...liturgicalDay.feasts];
          
          // Apply Dominican filter
          if (dominicanOnly) {
            feasts = feasts.filter(feast => feast.isDominican);
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
        sections.push({
          title: format(new Date(currentYear, month, 1), 'MMMM yyyy'),
          data: monthData,
        });
      }
    }

    return sections;
  }, [currentDate, colorFilters, dominicanOnly, calendarService]);

  const sections = React.useMemo(() => generateFeastsList(), [currentDate, colorFilters, dominicanOnly]);

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

  // Scroll to selected date when it changes
  useEffect(() => {
    if (!selectedDate) return;

    const dateString = format(selectedDate, 'yyyy-MM-dd');
    const elementId = `feast-${dateString}`;
    console.log('🌐 Web ScrollView: Scrolling to', elementId);

    // Use scrollIntoView for perfect accuracy - browser calculates everything!
    setTimeout(() => {
      const element = document.getElementById(elementId);
      
      if (element) {
        console.log(`✅ Web: Found element ${elementId}`);
        element.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
        console.log(`✅ Web: scrollIntoView called`);
      } else {
        console.log(`❌ Web: Element not found: ${elementId}`);
        console.log('Available feast elements:', document.querySelectorAll('[id^="feast-"]').length);
      }
    }, 300);
  }, [selectedDate]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        ref={scrollViewRef}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      >
        {ListHeaderComponent}
        
        {sections.map((section) => (
          <View key={section.title}>
            {/* Section Header */}
            <View style={[styles.sectionHeader, { backgroundColor: colors.surface }]}>
              <Text style={[styles.sectionHeaderText, { color: colors.text }]}>{section.title}</Text>
            </View>

            {/* Section Items */}
            {section.data.map((item) => {
              const isSelected = isSameDay(item.date, selectedDate);
              const isToday = isSameDay(item.date, new Date());
              const dateString = format(item.date, 'yyyy-MM-dd');

              return (
                <View
                  key={dateString}
                  nativeID={`feast-${dateString}`}
                >
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
                </View>
              );
            })}
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderRadius: 12,
    position: 'relative' as any,
  },
  listContent: {
    paddingBottom: 20,
  },
  sectionHeader: {
    paddingHorizontal: 12, // Reduced from 16 for narrow screens
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
    padding: 12, // Reduced from 16 for narrow screens
    marginBottom: 8,
    borderRadius: 12,
    borderWidth: 2,
  },
  dateColumn: {
    width: 50, // Reduced from 60 for narrow screens
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12, // Reduced from 16 for narrow screens
  },
  dateDay: {
    fontSize: 24, // Reduced from 28 for narrow screens
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
    fontSize: 10,
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
    fontSize: 12, // Reduced from 13 for narrow screens
    fontFamily: 'Georgia',
    flexShrink: 1, // Allow text to shrink if needed
  },
});

export default ListView;

