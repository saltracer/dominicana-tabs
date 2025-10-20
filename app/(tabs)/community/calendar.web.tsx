import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Animated,
  useWindowDimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../../constants/Colors';
import { useTheme } from '../../../components/ThemeProvider';
import { useCalendar } from '../../../components/CalendarContext';
import FeastDetailPanel from '../../../components/FeastDetailPanel';
import LiturgicalCalendarService from '../../../services/LiturgicalCalendar';
import { parseISO, format } from 'date-fns';
import Footer from '../../../components/Footer.web';

// New calendar components
import SearchBar from '../../../components/calendar/SearchBar';
import FilterPanel, { FeastFilter } from '../../../components/calendar/FilterPanel';
import SeasonBanner from '../../../components/calendar/SeasonBanner';
import ViewModeToggle, { ViewMode } from '../../../components/calendar/ViewModeToggle';
import CalendarGrid from '../../../components/calendar/CalendarGrid';
import WeekView from '../../../components/calendar/WeekView';
import ListView from '../../../components/calendar/ListView';

export default function CalendarScreenWeb() {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { liturgicalDay, selectedDate, updateCalendarSelection } = useCalendar();
  const { width } = useWindowDimensions();

  // State management
  const [markedDates, setMarkedDates] = useState<any>({});
  const [showFeastDetail, setShowFeastDetail] = useState(false);
  const [feastDetailAnimation] = useState(new Animated.Value(0));
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [selectedFilters, setSelectedFilters] = useState<FeastFilter[]>([]);
  const [dominicanOnly, setDominicanOnly] = useState(false);

  // Responsive breakpoints
  const isMobile = width < 768;
  const isTablet = width >= 768 && width < 1024;
  const isDesktop = width >= 1024;
  const isWide = width >= 1440;

  // Determine calendar cell size based on breakpoint
  const cellSize = useMemo(() => {
    if (isMobile) return 'small';
    if (isTablet) return 'medium';
    if (isWide) return 'xlarge';
    return 'large';
  }, [isMobile, isTablet, isWide]);

  // Show feast names on wide desktop
  const showFeastNames = isWide;

  useEffect(() => {
    generateMarkedDates();

    // Show feast details for the initial liturgical day
    if (liturgicalDay && !showFeastDetail) {
      setShowFeastDetail(true);
      Animated.timing(feastDetailAnimation, {
        toValue: 1,
        duration: 300,
        useNativeDriver: false,
      }).start();
    }
  }, [colorScheme, liturgicalDay, selectedFilters, dominicanOnly]);

  const generateMarkedDates = useCallback(() => {
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
          // Filter feasts based on active filters
          let feasts = dayLiturgicalData.feasts;

          if (dominicanOnly) {
            feasts = feasts.filter(feast => feast.isDominican);
          }

          if (selectedFilters.length > 0) {
            feasts = feasts.filter(feast => selectedFilters.includes(feast.rank as FeastFilter));
          }

          if (feasts.length > 0) {
            const dateString = date.toISOString().split('T')[0];

            // Get the highest rank feast for this date
            const primaryFeast = feasts.reduce((highest, current) => {
              const rankOrder: { [key: string]: number } = {
                Solemnity: 1,
                Feast: 2,
                Memorial: 3,
                'Optional Memorial': 4,
                Ferial: 5,
              };
              const currentRank = rankOrder[current.rank] || 5;
              const highestRank = rankOrder[highest.rank] || 5;
              return currentRank < highestRank ? current : highest;
            }, feasts[0]);

            // Check if any feast is Dominican
            const hasDominicanFeast = feasts.some(feast => feast.isDominican);

            marked[dateString] = {
              marked: true,
              dotColor: hasDominicanFeast
                ? colors.primary
                : primaryFeast?.color || '#2E7D32',
              textColor: hasDominicanFeast ? colors.text : colors.text,
            };
          }
        }
      }
    }

    // Mark the selected date
    if (liturgicalDay) {
      const selectedDateString = new Date(liturgicalDay.date).toISOString().split('T')[0];
      marked[selectedDateString] = {
        ...marked[selectedDateString],
        selected: true,
        selectedColor: colors.primary,
        selectedTextColor: colors.dominicanWhite,
      };
    }

    setMarkedDates(marked);
  }, [colorScheme, liturgicalDay, selectedFilters, dominicanOnly, colors]);

  const handleDayPress = useCallback(
    (day: any) => {
      const dateObj = day.dateString ? parseISO(day.dateString) : day;
      updateCalendarSelection(dateObj);

      // Update marked dates to show new selection
      const newMarkedDates = { ...markedDates };
      Object.keys(newMarkedDates).forEach(key => {
        if (newMarkedDates[key].selected) {
          delete newMarkedDates[key].selected;
          delete newMarkedDates[key].selectedColor;
          delete newMarkedDates[key].selectedTextColor;
        }
      });

      const dateString = format(dateObj, 'yyyy-MM-dd');
      newMarkedDates[dateString] = {
        ...newMarkedDates[dateString],
        selected: true,
        selectedColor: colors.primary,
        selectedTextColor: colors.dominicanWhite,
      };

      setMarkedDates(newMarkedDates);

      // Show feast detail panel with animation
      if (!showFeastDetail) {
        setShowFeastDetail(true);
      }
      Animated.timing(feastDetailAnimation, {
        toValue: 1,
        duration: 300,
        useNativeDriver: false,
      }).start();
    },
    [markedDates, colors, updateCalendarSelection, showFeastDetail, feastDetailAnimation]
  );

  const closeFeastDetail = useCallback(() => {
    Animated.timing(feastDetailAnimation, {
      toValue: 0,
      duration: 300,
      useNativeDriver: false,
    }).start(() => {
      setShowFeastDetail(false);
    });
  }, [feastDetailAnimation]);

  const handleToggleFilter = (filter: FeastFilter) => {
    setSelectedFilters(prev =>
      prev.includes(filter) ? prev.filter(f => f !== filter) : [...prev, filter]
    );
  };

  const handleClearFilters = () => {
    setSelectedFilters([]);
    setDominicanOnly(false);
  };

  const handleSearchSelect = (date: Date) => {
    handleDayPress({ dateString: format(date, 'yyyy-MM-dd') });
  };

  if (!liturgicalDay) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: colors.text }]}>
            Loading liturgical information...
          </Text>
        </View>
      </View>
    );
  }

  // Responsive layout logic
  const shouldShowSideBySide = isDesktop && showFeastDetail;
  const shouldStackVertically = (isMobile || isTablet) || !showFeastDetail;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ flexGrow: 1 }}
    >
      {/* Main Content Container */}
      <View
        style={[
          styles.mainContentContainer,
          shouldShowSideBySide && styles.sideBySideLayout,
        ]}
      >
        {/* Left Column / Top Section - Calendar */}
        <Animated.View
          style={[
            styles.calendarSection,
            shouldShowSideBySide && {
              width: feastDetailAnimation.interpolate({
                inputRange: [0, 1],
                outputRange: ['100%', '60%'],
              }),
            },
          ]}
        >
          {/* Season Banner */}
          <SeasonBanner
            seasonName={liturgicalDay.season.name}
            seasonColor={liturgicalDay.season.color}
            weekString={liturgicalDay.weekString}
            compact={isMobile}
          />

          {/* Search Bar */}
          <View style={styles.searchSection}>
            <SearchBar onSelectDate={handleSearchSelect} />
          </View>

          {/* Filters */}
          <FilterPanel
            selectedFilters={selectedFilters}
            onToggleFilter={handleToggleFilter}
            dominicanOnly={dominicanOnly}
            onToggleDominican={() => setDominicanOnly(!dominicanOnly)}
            onClearAll={handleClearFilters}
            compact={isMobile}
          />

          {/* View Mode Toggle & Month Title */}
          <View style={styles.calendarHeader}>
            <Text style={[styles.calendarTitle, { color: colors.text }]}>
              {format(selectedDate || new Date(), 'MMMM yyyy')}
            </Text>
            <ViewModeToggle
              currentMode={viewMode}
              onModeChange={setViewMode}
              compact={isMobile}
            />
          </View>

          {/* Calendar View Container */}
          <View style={[styles.calendarContainer, { backgroundColor: colors.card }]}>
            {viewMode === 'month' && (
              <CalendarGrid
                currentDate={liturgicalDay?.date || format(new Date(), 'yyyy-MM-dd')}
                markedDates={markedDates}
                onDayPress={handleDayPress}
                cellSize={cellSize}
                showFeastNames={showFeastNames}
              />
            )}

            {viewMode === 'week' && (
              <WeekView
                currentDate={selectedDate || new Date()}
                selectedDate={selectedDate || new Date()}
                onDayPress={handleDayPress}
              />
            )}

            {viewMode === 'list' && (
              <ListView
                currentDate={selectedDate || new Date()}
                selectedDate={selectedDate || new Date()}
                onDayPress={handleDayPress}
              />
            )}
          </View>

          {/* Calendar Legend */}
          <View style={[styles.calendarLegend, { backgroundColor: colors.surface }]}>
            <Text style={[styles.legendTitle, { color: colors.text }]}>Legend</Text>
            <View style={styles.legendItems}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#8B0000', marginRight: 8 }]} />
                <Text style={[styles.legendText, { color: colors.text }]}>Solemnity</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#4B0082', marginRight: 8 }]} />
                <Text style={[styles.legendText, { color: colors.text }]}>Feast</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#DAA520', marginRight: 8 }]} />
                <Text style={[styles.legendText, { color: colors.text }]}>Memorial</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#2E7D32', marginRight: 8 }]} />
                <Text style={[styles.legendText, { color: colors.text }]}>Ferial Day</Text>
              </View>
              <View style={styles.legendItem}>
                <Text style={[styles.dominicanSymbol, { color: colors.primary, marginRight: 8 }]}>⚫</Text>
                <Text style={[styles.legendText, { color: colors.text }]}>Dominican</Text>
              </View>
            </View>
          </View>
        </Animated.View>

        {/* Right Column / Bottom Section - Feast Detail Panel */}
        {shouldShowSideBySide ? (
          <Animated.View
            style={[
              styles.feastPanelSide,
              {
                width: feastDetailAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', '38%'],
                }),
                opacity: feastDetailAnimation,
                transform: [
                  {
                    translateX: feastDetailAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [100, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <View style={styles.feastPanelHeader}>
              <Pressable onPress={closeFeastDetail} style={styles.closeButton}>
                <Ionicons name="close" size={24} color={colors.text} />
              </Pressable>
            </View>
            <FeastDetailPanel
              liturgicalDay={liturgicalDay}
              isVisible={true}
              onClose={closeFeastDetail}
            />
          </Animated.View>
        ) : shouldStackVertically && showFeastDetail ? (
            <Animated.View
              style={[
                styles.feastPanelStacked,
                {
                  opacity: feastDetailAnimation,
                  transform: [
                    {
                      translateY: feastDetailAnimation.interpolate({
                        inputRange: [0, 1],
                        outputRange: [50, 0],
                      }),
                    },
                  ],
                },
              ]}
            >
              <FeastDetailPanel
                liturgicalDay={liturgicalDay}
                isVisible={true}
                onClose={closeFeastDetail}
              />
            </Animated.View>
        ) : null}
      </View>

      <Footer />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'Georgia',
  },
  mainContentContainer: {
    flex: 1,
    padding: 16,
  },
  sideBySideLayout: {
    flexDirection: 'row',
  },
  calendarSection: {
    flex: 1,
    minWidth: 400,
    marginRight: 20,
  },
  searchSection: {
    marginBottom: 16,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  calendarTitle: {
    fontSize: 24,
    fontFamily: 'Georgia',
    fontWeight: '700',
  },
  calendarContainer: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  calendarLegend: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  legendTitle: {
    fontSize: 16,
    fontFamily: 'Georgia',
    fontWeight: '700',
    marginBottom: 12,
  },
  legendItems: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 8,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: 14,
    fontFamily: 'Georgia',
  },
  dominicanSymbol: {
    fontSize: 14,
  },
  feastPanelSide: {
    overflow: 'hidden',
  },
  feastPanelHeader: {
    alignItems: 'flex-end',
    marginBottom: 8,
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
  },
  feastPanelStacked: {
    marginTop: 20,
    borderRadius: 16,
    overflow: 'hidden',
  },
});
