import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Animated,
  useWindowDimensions,
  Modal,
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
import InteractiveLegend, { FeastFilter } from '../../../components/calendar/InteractiveLegend';
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
  const [currentWeekDate, setCurrentWeekDate] = useState<Date>(selectedDate || new Date()); // Track which week is being viewed
  const userClosedPanel = useRef(false); // Track if user explicitly closed the panel
  
  // FAB state for list view
  const [showScrollToTop, setShowScrollToTop] = useState(false);
  const scrollContainerRef = useRef<any>(null);

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

  // Show feast names in month view on large/xlarge cells
  const showFeastNames = cellSize === 'large' || cellSize === 'xlarge';

  // Sync currentWeekDate when selectedDate changes (e.g., when a day is clicked)
  useEffect(() => {
    if (selectedDate) {
      setCurrentWeekDate(selectedDate);
    }
  }, [selectedDate]);

  useEffect(() => {
    generateMarkedDates();

    // Only auto-show feast details on desktop (side panel), not on mobile/tablet (modal)
    // And only if user hasn't explicitly closed it
    if (liturgicalDay && !showFeastDetail && !userClosedPanel.current && isDesktop) {
      setShowFeastDetail(true);
      Animated.timing(feastDetailAnimation, {
        toValue: 1,
        duration: 300,
        useNativeDriver: false,
      }).start();
    }
  }, [colorScheme, liturgicalDay, selectedFilters, dominicanOnly, isDesktop, showFeastDetail, feastDetailAnimation]);

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
            feasts = feasts.filter(feast => {
              const feastColor = feast.color?.toLowerCase() || '';
              return selectedFilters.some(filter => {
                if (filter === 'purple') return feastColor === 'purple' || feastColor === 'violet';
                if (filter === 'rose') return feastColor === 'rose' || feastColor === 'pink';
                return feastColor === filter;
              });
            });
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

      // User intentionally opened the panel, clear the "closed" flag
      userClosedPanel.current = false;
      
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
    // Mark that user explicitly closed the panel
    userClosedPanel.current = true;
    
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
  
  // Handle scroll for FAB in list view
  const handleScroll = useCallback((event: any) => {
    if (viewMode !== 'list') return;
    
    const scrollY = event.nativeEvent?.contentOffset?.y || 0;
    const shouldShow = scrollY > 500;
    
    if (shouldShow !== showScrollToTop) {
      setShowScrollToTop(shouldShow);
    }
  }, [viewMode, showScrollToTop]);
  
  const scrollToTop = useCallback(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ y: 0, animated: true });
    }
  }, []);

  // Create filtered liturgicalDay based on active filters
  const filteredLiturgicalDay = useMemo(() => {
    if (!liturgicalDay) return null;
    
    // If no filters active, return original
    if (!dominicanOnly && selectedFilters.length === 0) {
      return liturgicalDay;
    }
    
    let filteredFeasts = [...liturgicalDay.feasts];
    
    // Apply Dominican filter
    if (dominicanOnly) {
      filteredFeasts = filteredFeasts.filter(feast => feast.isDominican);
    }
    
    // Apply color filters
    if (selectedFilters.length > 0) {
      filteredFeasts = filteredFeasts.filter(feast => {
        const feastColor = feast.color?.toLowerCase() || '';
        return selectedFilters.some(filter => {
          if (filter === 'purple') return feastColor === 'purple' || feastColor === 'violet';
          if (filter === 'rose') return feastColor === 'rose' || feastColor === 'pink';
          return feastColor === filter;
        });
      });
    }
    
    return {
      ...liturgicalDay,
      feasts: filteredFeasts
    };
  }, [liturgicalDay, selectedFilters, dominicanOnly]);

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
  // In week view, always stack vertically (feast panel below calendar)
  const shouldShowSideBySide = isDesktop && showFeastDetail && viewMode !== 'week';
  const shouldStackVertically = (isMobile || isTablet) || !showFeastDetail || viewMode === 'week';

  return (
    <>
      <ScrollView
        ref={scrollContainerRef}
        style={[styles.container, { backgroundColor: colors.background }]}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1 }}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {/* Main Content Container */}
      <View
        style={[
          styles.mainContentContainer,
          shouldShowSideBySide && styles.sideBySideLayout,
          // Reduce padding on very narrow screens
          width < 400 && { padding: 8 },
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

          {/* View Mode Toggle */}
          <View style={styles.viewModeSection}>
            <ViewModeToggle
              currentMode={viewMode}
              onModeChange={setViewMode}
              compact={isMobile}
            />
          </View>

          {/* Calendar View Container */}
          <View style={[
            styles.calendarContainer, 
            { backgroundColor: colors.card }
          ]}>
            {viewMode === 'month' && (
              <CalendarGrid
                currentDate={liturgicalDay?.date || format(new Date(), 'yyyy-MM-dd')}
                markedDates={markedDates}
                onDayPress={handleDayPress}
                cellSize={cellSize}
                showFeastNames={showFeastNames}
                colorFilters={selectedFilters}
                dominicanOnly={dominicanOnly}
              />
            )}

            {viewMode === 'week' && (
              <WeekView
                currentDate={currentWeekDate}
                selectedDate={selectedDate || new Date()}
                onDayPress={handleDayPress}
                onWeekChange={(newDate) => setCurrentWeekDate(newDate)}
                cellSize={cellSize}
                colorFilters={selectedFilters}
                dominicanOnly={dominicanOnly}
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

          {/* Interactive Legend & Filters */}
          <InteractiveLegend
            selectedFilters={selectedFilters}
            onToggleFilter={handleToggleFilter}
            dominicanOnly={dominicanOnly}
            onToggleDominican={() => setDominicanOnly(!dominicanOnly)}
            onClearAll={handleClearFilters}
            compact={isMobile}
          />
        </Animated.View>

        {/* Right Column / Bottom Section - Feast Detail Panel */}
        {shouldShowSideBySide ? (
          // Desktop: Side panel
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
            <FeastDetailPanel
              liturgicalDay={filteredLiturgicalDay || liturgicalDay}
              isVisible={true}
              onClose={closeFeastDetail}
            />
          </Animated.View>
        ) : viewMode === 'list' && shouldStackVertically && showFeastDetail ? (
          // List view on mobile/tablet: Modal
          <Modal
            visible={showFeastDetail}
            animationType="slide"
            transparent={true}
            onRequestClose={closeFeastDetail}
          >
            <View style={styles.modalOverlay}>
              <Pressable style={styles.modalBackdrop} onPress={closeFeastDetail} />
              <View style={styles.modalContent}>
                <FeastDetailPanel
                  liturgicalDay={filteredLiturgicalDay || liturgicalDay}
                  isVisible={true}
                  onClose={closeFeastDetail}
                />
              </View>
            </View>
          </Modal>
        ) : shouldStackVertically && showFeastDetail ? (
          // Month/Week views on mobile/tablet: Stacked
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
              liturgicalDay={filteredLiturgicalDay || liturgicalDay}
              isVisible={true}
              onClose={closeFeastDetail}
            />
          </Animated.View>
        ) : null}
      </View>

        <Footer />
      </ScrollView>
      
      {/* Floating Action Button - List View Only - Fixed to viewport */}
      {viewMode === 'list' && (
        <div
          style={{
            position: 'fixed',
            right: shouldShowSideBySide ? 'calc(40% + 40px)' : '40px',
            bottom: '120px',
            width: '56px',
            height: '56px',
            borderRadius: '28px',
            backgroundColor: colors.primary,
            opacity: showScrollToTop ? 0.5 : 0,
            pointerEvents: showScrollToTop ? 'auto' : 'none',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.3)',
            zIndex: 9999,
            transition: 'opacity 0.2s ease, right 0.3s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
          onClick={scrollToTop}
          onMouseEnter={(e) => (e.currentTarget.style.opacity = '1')}
          onMouseLeave={(e) => (e.currentTarget.style.opacity = showScrollToTop ? '0.5' : '0')}
        >
          <Ionicons name="arrow-up" size={24} color={colors.dominicanWhite} />
        </div>
      )}
    </>
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
    position: 'relative' as any, // For FAB absolute positioning
  },
  sideBySideLayout: {
    flexDirection: 'row',
  },
  calendarSection: {
    flex: 1,
    minWidth: 300, // Reduced from 400 to support 390px screens
    marginRight: 20,
    position: 'relative' as any, // For FAB absolute positioning
  },
  searchSection: {
    marginBottom: 16,
  },
  viewModeSection: {
    alignItems: 'center',
    marginBottom: 16,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'center', // Center the ViewModeToggle
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
    overflow: 'visible' as any,
    position: 'relative' as any,
  },
  feastPanelSide: {
    overflow: 'hidden',
    position: 'sticky' as any,
    top: 0,
    alignSelf: 'flex-start',
    maxHeight: '85vh' as any, // Constrain to viewport height
  },
  feastPanelStacked: {
    marginTop: 20,
    borderRadius: 16,
    overflow: 'hidden',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 20,
  },
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalContent: {
    width: '90%',
    maxWidth: 600,
    maxHeight: '85%',
    borderRadius: 20,
    overflow: 'hidden',
  },
});
