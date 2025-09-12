import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  Pressable,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Calendar } from 'react-native-calendars';
import { Colors } from '../../../constants/Colors';
import { useTheme } from '../../../components/ThemeProvider';
import { useCalendar } from '../../../components/CalendarContext';
import FeastBanner from '../../../components/FeastBanner';
import FeastDetailPanel from '../../../components/FeastDetailPanel';
import CommunityNavigation from '../../../components/CommunityNavigation';
import LiturgicalCalendarService from '../../../services/LiturgicalCalendar';
import { LiturgicalDay } from '../../../types';
import { parseISO, format, subDays, addDays } from 'date-fns';

const { width: screenWidth } = Dimensions.get('window');

// Custom Day Component for rich content display (Web version)
interface CustomDayProps {
  date?: {
    dateString: string;
    day: number;
  };
  state?: string;
  marking?: any;
  onPress?: (date?: any) => void;
}

const CustomDayComponent = ({ date, state, marking, onPress }: CustomDayProps) => {
  const { colorScheme } = useTheme();
  const [dayContent, setDayContent] = useState<any>(null);
  
  useEffect(() => {
    if (date?.dateString) {
      const calendarService = LiturgicalCalendarService.getInstance();
      const selectedDate = parseISO(date.dateString);
      const liturgicalDay = calendarService.getLiturgicalDay(selectedDate);
      
      if (liturgicalDay.feasts.length > 0) {
        // Get the highest rank feast for this date
        const primaryFeast = liturgicalDay.feasts.reduce((highest, current) => {
          const rankOrder: { [key: string]: number } = { 'Solemnity': 1, 'Feast': 2, 'Memorial': 3, 'Optional Memorial': 4, 'Ferial': 5 };
          const currentRank = rankOrder[current.rank] || 5;
          const highestRank = rankOrder[highest.rank] || 5;
          return currentRank < highestRank ? current : highest;
        }, liturgicalDay.feasts[0]);
        
        const hasDominicanFeast = liturgicalDay.feasts.some(feast => feast.isDominican);
        
        setDayContent({
          primaryFeast,
          hasDominicanFeast,
          feastCount: liturgicalDay.feasts.length,
          isDominican: hasDominicanFeast
        });
      }
    }
  }, [date?.dateString]);

  const isToday = date?.dateString === format(new Date(), 'yyyy-MM-dd');
  const isSelected = marking?.selected;
  const hasFeasts = dayContent && dayContent.feastCount > 0;
  
  const getDayBackgroundColor = () => {
    if (isSelected) return Colors[colorScheme ?? 'light'].primary;
    if (isToday) return Colors[colorScheme ?? 'light'].surface;
    if (hasFeasts) return Colors[colorScheme ?? 'light'].card;
    return 'transparent';
  };

  const getDayTextColor = () => {
    if (isSelected) return Colors[colorScheme ?? 'light'].dominicanWhite;
    if (isToday) return Colors[colorScheme ?? 'light'].primary;
    if (hasFeasts) return Colors[colorScheme ?? 'light'].text;
    return Colors[colorScheme ?? 'light'].textMuted;
  };

  const getFeastIndicatorColor = () => {
    if (dayContent?.hasDominicanFeast) return Colors[colorScheme ?? 'light'].primary;
    if (dayContent?.primaryFeast) return dayContent.primaryFeast.color;
    return Colors[colorScheme ?? 'light'].textMuted;
  };

  return (
    <Pressable
      style={[
        styles.customDayContainer,
        {
          backgroundColor: getDayBackgroundColor(),
          borderColor: isSelected ? Colors[colorScheme ?? 'light'].primary : Colors[colorScheme ?? 'light'].border,
          borderWidth: isSelected ? 2 : (isToday ? 1 : 0),
        }
      ]}
      onPress={() => onPress?.(date)}
    >

      {/* Day Number */}
      <Text style={[
        styles.dayNumber,
        { color: getDayTextColor() }
      ]}>
        {date?.day}
      </Text>
      
      {/* Feast Indicators */}
      {hasFeasts && (
        <View style={styles.feastIndicatorsContainer}>
          <View style={styles.feastIndicators}>
            {/* Primary Feast Rank Badge */}
            {dayContent.primaryFeast && (
              <View style={[
                styles.rankBadge,
                { backgroundColor: getFeastIndicatorColor() }
              ]}>
                <Text style={styles.rankText}>
                  {dayContent.primaryFeast.rank.charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
            
            {/* Feast Name Preview (for larger screens) */}
            {hasFeasts && screenWidth > 400 && (
              <Text 
                style={[
                  styles.feastNamePreview,
                  { color: getDayTextColor() }
                ]}
                numberOfLines={1}
              >
                {dayContent.primaryFeast.name}
              </Text>
            )}

            {/* Dominican Indicator */}
            {dayContent.isDominican && (
              <View style={styles.dominicanIndicatorContainer}>
                <Text style={[styles.dominicanSymbol, { color: Colors[colorScheme ?? 'light'].primary }]}>
                  ⚫
                </Text>
              </View>
            )}
          </View>
          
          {/* Multiple Feasts Indicator - positioned on its own line on the right */}
          {dayContent.feastCount > 1 && (
            <View style={styles.multipleFeastsContainer}>
              <View style={[styles.multipleFeastsIndicator, { backgroundColor: Colors[colorScheme ?? 'light'].surface }]}>
                <Text style={[styles.multipleFeastsText, { color: Colors[colorScheme ?? 'light'].text  }]}>
                  +{dayContent.feastCount - 1}
                </Text>
              </View>
            </View>
          )}
        </View>
      )}
      
      
    </Pressable>
  );
};

export default function CalendarScreen() {
  const { colorScheme } = useTheme();
  const { liturgicalDay, selectedDate, updateCalendarSelection } = useCalendar();
  const [markedDates, setMarkedDates] = useState<any>({});
  const [showFeastDetail, setShowFeastDetail] = useState(false);
  const [feastDetailAnimation] = useState(new Animated.Value(0));
  const scrollViewRef = useRef<ScrollView>(null);
  const feastDetailRef = useRef<View>(null);



  useEffect(() => {
    generateMarkedDates();
    
    // Show feast details for the initial liturgical day
    if (liturgicalDay && !showFeastDetail) {
      setShowFeastDetail(true);
      Animated.timing(feastDetailAnimation, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [colorScheme, liturgicalDay, showFeastDetail, feastDetailAnimation]);

  const generateMarkedDates = () => {
    const calendarService = LiturgicalCalendarService.getInstance();
    const marked: any = {};
    
    // Generate feast days for the current year
    const currentYear = new Date().getFullYear();
    for (let month = 0; month < 12; month++) {
      const daysInMonth = new Date(currentYear, month + 1, 0).getDate();
      
      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(currentYear, month, day);
        const dayLiturgicalData = calendarService.getLiturgicalDay(date);
        
        if (dayLiturgicalData.feasts.length > 0) {
          const dateString = date.toISOString().split('T')[0];
          
          // Get the highest rank feast for this date
          const primaryFeast = dayLiturgicalData.feasts.reduce((highest, current) => {
            const rankOrder: { [key: string]: number } = { 'Solemnity': 1, 'Feast': 2, 'Memorial': 3, 'Optional Memorial': 4, 'Ferial': 5 };
            const currentRank = rankOrder[current.rank] || 5;
            const highestRank = rankOrder[highest.rank] || 5;
            return currentRank < highestRank ? current : highest;
          }, dayLiturgicalData.feasts[0]);
          
          // Check if any feast is Dominican
          const hasDominicanFeast = dayLiturgicalData.feasts.some(feast => feast.isDominican);
          
          marked[dateString] = {
            marked: true,
            dotColor: hasDominicanFeast ? Colors[colorScheme ?? 'light'].primary : (primaryFeast?.color || '#2E7D32'),
            textColor: hasDominicanFeast ? Colors[colorScheme ?? 'light'].text : Colors[colorScheme ?? 'light'].text,
          };
        }
      }
    }
    
    // Mark the selected date
    if (liturgicalDay) {
      const selectedDateString = new Date(liturgicalDay.date).toISOString().split('T')[0];
      marked[selectedDateString] = {
        ...marked[selectedDateString],
        selected: true,
        selectedColor: Colors[colorScheme ?? 'light'].primary,
        selectedTextColor: Colors[colorScheme ?? 'light'].dominicanWhite,
      };
    }
    
    setMarkedDates(marked);
  };

  const handleDayPress = useCallback((day: any) => {
    // Use date-fns parseISO for clean date parsing
    const selectedDate = parseISO(day.dateString);
    updateCalendarSelection(selectedDate);
    
    // Update marked dates to show new selection
    const newMarkedDates = { ...markedDates };
    Object.keys(newMarkedDates).forEach(key => {
      if (newMarkedDates[key].selected) {
        delete newMarkedDates[key].selected;
        delete newMarkedDates[key].selectedColor;
        delete newMarkedDates[key].selectedTextColor;
      }
    });
    
    const dateString = day.dateString;
    newMarkedDates[dateString] = {
      ...newMarkedDates[dateString],
      selected: true,
      selectedColor: Colors[colorScheme ?? 'light'].primary,
      selectedTextColor: Colors[colorScheme ?? 'light'].dominicanWhite,
    };
    
    setMarkedDates(newMarkedDates);
    
    // Show feast detail panel with animation
    setShowFeastDetail(true);
    Animated.timing(feastDetailAnimation, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [markedDates, colorScheme, updateCalendarSelection, feastDetailAnimation]);

  const closeFeastDetail = useCallback(() => {
    Animated.timing(feastDetailAnimation, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setShowFeastDetail(false);
    });
  }, [feastDetailAnimation]);

  if (!liturgicalDay) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
        <CommunityNavigation activeTab="calendar" />
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: Colors[colorScheme ?? 'light'].text }]}>
            Loading liturgical information...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]} edges={['left', 'right']}>
      <ScrollView 
        ref={scrollViewRef}
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {/* <CommunityNavigation activeTab="calendar" /> */}
        
        {/* Main Content Container - Side by Side Layout */}
        <View style={styles.mainContentContainer}>
          {/* Left Side - Calendar */}
          <View style={styles.calendarSection}>
            <View style={[styles.calendarContainer, { backgroundColor: Colors[colorScheme ?? 'light'].card }]}>
              <Text style={[styles.calendarTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
                Liturgical Calendar
              </Text>
              
              {/* Enhanced Calendar Component */}
              <Calendar
                current={liturgicalDay?.date || format(new Date(), 'yyyy-MM-dd')}
                onDayPress={handleDayPress}
                markedDates={markedDates}
                dayComponent={CustomDayComponent}
                theme={{
                  backgroundColor: Colors[colorScheme ?? 'light'].card,
                  calendarBackground: Colors[colorScheme ?? 'light'].card,
                  textSectionTitleColor: Colors[colorScheme ?? 'light'].text,
                  selectedDayBackgroundColor: Colors[colorScheme ?? 'light'].primary,
                  selectedDayTextColor: Colors[colorScheme ?? 'light'].dominicanWhite,
                  todayTextColor: Colors[colorScheme ?? 'light'].primary,
                  dayTextColor: Colors[colorScheme ?? 'light'].text,
                  textDisabledColor: Colors[colorScheme ?? 'light'].textMuted,
                  dotColor: Colors[colorScheme ?? 'light'].primary,
                  selectedDotColor: Colors[colorScheme ?? 'light'].dominicanWhite,
                  arrowColor: Colors[colorScheme ?? 'light'].primary,
                  monthTextColor: Colors[colorScheme ?? 'light'].text,
                  indicatorColor: Colors[colorScheme ?? 'light'].primary,
                  textDayFontFamily: 'Georgia',
                  textMonthFontFamily: 'Georgia',
                  textDayHeaderFontFamily: 'Georgia',
                  textDayFontSize: 16,
                  textMonthFontSize: 18,
                  textDayHeaderFontSize: 14,
                }}
                minDate={format(subDays(new Date(), 1000), 'yyyy-MM-dd')}
                maxDate={format(addDays(new Date(), 1000), 'yyyy-MM-dd')}
                key={colorScheme}
              />

              {/* Calendar Legend */}
              <View style={[styles.calendarLegend, { backgroundColor: Colors[colorScheme ?? 'light'].surface }]}>
                <Text style={[styles.legendTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
                  Calendar Legend
                </Text>
                <View style={styles.legendItems}>
                  <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: '#8B0000' }]} />
                    <Text style={[styles.legendText, { color: Colors[colorScheme ?? 'light'].text }]}>
                      Solemnity
                    </Text>
                  </View>
                  <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: '#4B0082' }]} />
                    <Text style={[styles.legendText, { color: Colors[colorScheme ?? 'light'].text }]}>
                      Feast
                    </Text>
                  </View>
                  <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: '#DAA520' }]} />
                    <Text style={[styles.legendText, { color: Colors[colorScheme ?? 'light'].text }]}>
                      Memorial
                    </Text>
                  </View>
                  <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: '#2E7D32' }]} />
                    <Text style={[styles.legendText, { color: Colors[colorScheme ?? 'light'].text }]}>
                      Ferial Day
                    </Text>
                  </View>
                </View>
                
                {/* Enhanced Dominican Indicator */}
                <View style={styles.dominicanLegend}>
                  <Text style={[styles.legendSubtitle, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                    Dominican Celebrations
                  </Text>
                  <View style={styles.legendItem}>
                    <Text style={[styles.dominicanSymbol, { color: Colors[colorScheme ?? 'light'].primary }]}>
                      ⚫
                    </Text>
                    <Text style={[styles.legendText, { color: Colors[colorScheme ?? 'light'].text }]}>
                      Dominican Saint/Feast
                    </Text>
                  </View>
                  <View style={styles.legendItem}>
                    <Text style={[styles.legendText, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                      +N = Additional feasts
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>

          {/* Right Side - Feast Detail Panel */}
          <View style={styles.feastSection}>
            {liturgicalDay ? (
              <Animated.View 
                ref={feastDetailRef}
                style={[
                  styles.sideFeastContainer,
                  {
                    opacity: feastDetailAnimation,
                    transform: [{
                      translateX: feastDetailAnimation.interpolate({
                        inputRange: [0, 1],
                        outputRange: [100, 0],
                      })
                    }]
                  }
                ]}
              >
                <FeastDetailPanel
                  liturgicalDay={liturgicalDay}
                  isVisible={true}
                  onClose={closeFeastDetail}
                />
              </Animated.View>
            ) : (
              <View style={[styles.placeholderPanel, { backgroundColor: Colors[colorScheme ?? 'light'].surface }]}>
                <Text style={[styles.placeholderText, { color: Colors[colorScheme ?? 'light'].textMuted }]}>
                  Loading liturgical information...
                </Text>
              </View>
            )}
          </View>
        </View>

        
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'Georgia',
  },
  mainContentContainer: {
    flexDirection: 'row',
    gap: 20,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  calendarSection: {
    flex: 1,
    minWidth: 400,
  },
  feastSection: {
    flex: 1,
    minWidth: 400,
    maxWidth: 500,
  },
  calendarContainer: {
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
  },
  calendarTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 20,
    fontFamily: 'Georgia',
  },
  calendarLegend: {
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
  },
  legendTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 12,
    fontFamily: 'Georgia',
  },
  legendItems: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    minWidth: '45%',
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendText: {
    fontSize: 12,
    fontFamily: 'Georgia',
  },
  dominicanLegend: {
    borderTopWidth: 1,
    borderTopColor: Colors.light.border,
    paddingTop: 16,
  },
  legendSubtitle: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
    fontFamily: 'Georgia',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  dominicanSymbol: {
    fontSize: 14,
    marginRight: 8,
    fontFamily: 'Georgia',
  },
  selectedDateInfo: {
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
  },
  selectedDateLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
    fontFamily: 'Georgia',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  selectedDateText: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'Georgia',
  },
  seasonInfo: {
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
    alignItems: 'center',
  },
  seasonName: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'Georgia',
  },
  seasonWeek: {
    fontSize: 12,
    fontFamily: 'Georgia',
    marginTop: 4,
  },
  selectedFeasts: {
    marginTop: 16,
  },
  feastsLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
    fontFamily: 'Georgia',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  selectedFeast: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  feastRank: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 8,
  },
  feastRankText: {
    fontSize: 10,
    fontWeight: '700',
    fontFamily: 'Georgia',
  },
  feastName: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    fontFamily: 'Georgia',
  },
  dominicanIndicator: {
    fontSize: 12,
    fontFamily: 'Georgia',
  },
  // Custom Day Component Styles (Web version with grid lines)
  customDayContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'flex-start',
    //alignItems: 'center',
    borderRadius: 8,
    position: 'relative',
    margin: 0, // Remove margin to allow grid lines to connect
    paddingTop: 4,
  },
  dayNumber: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Georgia',
    marginBottom: 2,
  },
  feastIndicatorsContainer: {
    width: '100%',
    marginTop: 3,
    marginLeft: 0,
    marginBottom: 10,
  },
  feastIndicators: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 2,
  },
  multipleFeastsContainer: {
    alignItems: 'flex-end',
    marginTop: 5,
  },
  rankBadge: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankText: {
    fontSize: 10,
    fontWeight: '700',
    color: 'white',
    fontFamily: 'Georgia',
  },
  dominicanIndicatorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  multipleFeastsIndicator: {
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 6,
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderWidth: 1,
  },
  multipleFeastsText: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'Georgia',
    color: Colors.light.text,
  },
  feastNamePreview: {
    fontSize: 14,
    fontFamily: 'Georgia',
    textAlign: 'center',
    marginTop: 2,
    paddingHorizontal: 2,
  },
  inlineFeastContainer: {
    marginTop: 20,
    marginHorizontal: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  sideFeastContainer: {
    height: '100%',
    borderRadius: 16,
    overflow: 'hidden',
  },
  placeholderPanel: {
    height: 400,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    elevation: 2,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
  },
  placeholderText: {
    fontSize: 16,
    fontFamily: 'Georgia',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
