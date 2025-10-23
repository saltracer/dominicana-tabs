import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
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
  const scrollViewRef = useRef<ScrollView>(null);

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

  const sections = React.useMemo(() => generateFeastsList(), [currentDate]);

  // Helper function to check if a color is white or very light
  const isLightColor = (color: string): boolean => {
    if (!color) return false;
    const lowerColor = color.toLowerCase();
    return lowerColor === '#ffffff' || 
           lowerColor === '#fff' || 
           lowerColor === 'white' ||
           lowerColor === 'rgb(255, 255, 255)' ||
           lowerColor === 'rgba(255, 255, 255, 1)';
  };

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
                                { 
                                  backgroundColor: feast.color || colors.textMuted, 
                                  marginRight: 8,
                                  // Add black border for white feasts (always black, even in dark mode)
                                  borderWidth: isLightColor(feast.color) ? 1 : 0,
                                  borderColor: isLightColor(feast.color) ? colors.alwaysBlack : 'transparent',
                                },
                              ]}
                            >
                              <Text 
                                style={[
                                  styles.rankText,
                                  {
                                    // Use black text for white feasts (always black for contrast), white for all others
                                    color: isLightColor(feast.color) ? colors.alwaysBlack : colors.dominicanWhite,
                                  }
                                ]}
                              >
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
    flexWrap: 'wrap', // Allow wrapping on narrow screens
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
    fontSize: 12, // Reduced from 13 for narrow screens
    fontFamily: 'Georgia',
    flexShrink: 1, // Allow text to shrink if needed
  },
});

export default ListView;

