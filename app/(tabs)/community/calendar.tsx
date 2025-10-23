import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Animated,
  Modal,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../../constants/Colors';
import { useTheme } from '../../../components/ThemeProvider';
import { useCalendar } from '../../../components/CalendarContext';
import FeastDetailPanel from '../../../components/FeastDetailPanel';
import CommunityNavigation from '../../../components/CommunityNavigation';
import LiturgicalCalendarService from '../../../services/LiturgicalCalendar';
import { parseISO, format } from 'date-fns';

// New calendar components
import SearchBar from '../../../components/calendar/SearchBar';
import InteractiveLegend, { FeastFilter } from '../../../components/calendar/InteractiveLegend';
import SeasonBanner from '../../../components/calendar/SeasonBanner';
import ViewModeToggle, { ViewMode } from '../../../components/calendar/ViewModeToggle';
import CalendarGrid from '../../../components/calendar/CalendarGrid';
import WeekView from '../../../components/calendar/WeekView';
import ListView from '../../../components/calendar/ListView';

export default function CalendarScreenNative() {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { liturgicalDay, selectedDate, updateCalendarSelection } = useCalendar();
  const { width } = useWindowDimensions();

  // State management
  const [markedDates, setMarkedDates] = useState<any>({});
  const [showFeastDetail, setShowFeastDetail] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [selectedFilters, setSelectedFilters] = useState<FeastFilter[]>([]);
  const [dominicanOnly, setDominicanOnly] = useState(false);
  const [doctorOnly, setDoctorOnly] = useState(false);
  const [currentWeekDate, setCurrentWeekDate] = useState<Date>(selectedDate || new Date()); // Track which week is being viewed
  const userClosedPanel = useRef(false); // Track if user explicitly closed the panel

  // Animations
  const feastDetailAnimation = useRef(new Animated.Value(0)).current;
  const searchModalAnim = useRef(new Animated.Value(0)).current;

  // Responsive breakpoints (for tablets)
  const isTablet = width >= 768;

  // Determine calendar cell size
  const cellSize = isTablet ? 'medium' : 'small';

  // Sync currentWeekDate when selectedDate changes (e.g., when a day is clicked)
  useEffect(() => {
    if (selectedDate) {
      setCurrentWeekDate(selectedDate);
    }
  }, [selectedDate]);

  useEffect(() => {
    generateMarkedDates();
  }, [colorScheme, liturgicalDay, selectedFilters, dominicanOnly, doctorOnly]);

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

          if (doctorOnly) {
            feasts = feasts.filter(feast => feast.isDoctor);
          }

          if (selectedFilters.length > 0) {
            feasts = feasts.filter(feast => {
              const feastColor = feast.color.toLowerCase();
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

      // Show feast detail with animation
      setShowFeastDetail(true);
      Animated.timing(feastDetailAnimation, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    },
    [markedDates, colors, updateCalendarSelection, feastDetailAnimation]
  );

  const closeFeastDetail = useCallback(() => {
    // Mark that user explicitly closed the panel
    userClosedPanel.current = true;
    
    Animated.timing(feastDetailAnimation, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
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
    setDoctorOnly(false);
  };

  const handleSearchSelect = (date: Date) => {
    setShowSearchModal(false);
    handleDayPress({ dateString: format(date, 'yyyy-MM-dd') });
  };

  // Create filtered liturgicalDay based on active filters
  const filteredLiturgicalDay = useMemo(() => {
    if (!liturgicalDay) return null;
    
    // If no filters active, return original
    if (!dominicanOnly && !doctorOnly && selectedFilters.length === 0) {
      return liturgicalDay;
    }
    
    let filteredFeasts = [...liturgicalDay.feasts];
    
    // Apply Dominican filter
    if (dominicanOnly) {
      filteredFeasts = filteredFeasts.filter(feast => feast.isDominican);
    }
    
    // Apply Doctor filter
    if (doctorOnly) {
      filteredFeasts = filteredFeasts.filter(feast => feast.isDoctor);
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
  }, [liturgicalDay, selectedFilters, dominicanOnly, doctorOnly]);

  const openSearchModal = () => {
    setShowSearchModal(true);
    Animated.timing(searchModalAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const closeSearchModal = () => {
    Animated.timing(searchModalAnim, {
      toValue: 0,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      setShowSearchModal(false);
    });
  };

  if (!liturgicalDay) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <CommunityNavigation activeTab="calendar" />
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: colors.text }]}>
            Loading liturgical information...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={['left', 'right']}
    >
      <CommunityNavigation activeTab="calendar" />
      
      {viewMode === 'list' ? (
        // List view: No ScrollView wrapper (AgendaList handles its own scrolling)
        <View style={{ flex: 1 }}>
          <ListView
            currentDate={selectedDate || new Date()}
            selectedDate={selectedDate || new Date()}
            onDayPress={handleDayPress}
            colorFilters={selectedFilters}
            dominicanOnly={dominicanOnly}
            doctorOnly={doctorOnly}
            ListHeaderComponent={
              <View style={styles.contentPadding}>
                <SeasonBanner
                  seasonName={liturgicalDay.season.name}
                  seasonColor={liturgicalDay.season.color}
                  weekString={liturgicalDay.weekString}
                  compact={true}
                />

                {/* Header with Search Button */}
                <View style={styles.header}>
                  <View style={styles.headerLeft}>
                    <Text style={[styles.monthTitle, { color: colors.text }]}>
                      {format(selectedDate || new Date(), 'MMMM yyyy')}
                    </Text>
                  </View>
                  <View style={styles.headerRight}>
                    <Pressable onPress={openSearchModal} style={styles.iconButton}>
                      <Ionicons name="search" size={24} color={colors.text} />
                    </Pressable>
                  </View>
                </View>

                {/* View Mode Toggle */}
                <View style={styles.viewModeSection}>
                  <ViewModeToggle
                    currentMode={viewMode}
                    onModeChange={setViewMode}
                    compact={true}
                  />
                </View>
              </View>
            }
          />

          {/* Feast Detail Panel - Shows as modal in list view */}
          {liturgicalDay && showFeastDetail && (
            <Modal
              visible={showFeastDetail}
              animationType="slide"
              transparent={true}
              onRequestClose={closeFeastDetail}
            >
              <View style={styles.modalOverlay}>
                <Pressable style={styles.modalBackdrop} onPress={closeFeastDetail} />
                <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
                  <FeastDetailPanel
                    liturgicalDay={filteredLiturgicalDay || liturgicalDay}
                    isVisible={true}
                    onClose={closeFeastDetail}
                  />
                </View>
              </View>
            </Modal>
          )}
        </View>
      ) : (
        // Month/Week views: Use ScrollView
        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 120 }}
        >

          {/* Season Banner */}
          <View style={styles.contentPadding}>
            <SeasonBanner
              seasonName={liturgicalDay.season.name}
              seasonColor={liturgicalDay.season.color}
              weekString={liturgicalDay.weekString}
              compact={true}
            />

            {/* Header with Search Button */}
            <View style={styles.header}>
              <View style={styles.headerLeft}>
                <Text style={[styles.monthTitle, { color: colors.text }]}>
                  {format(selectedDate || new Date(), 'MMMM yyyy')}
                </Text>
              </View>
              <View style={styles.headerRight}>
                <Pressable onPress={openSearchModal} style={styles.iconButton}>
                  <Ionicons name="search" size={24} color={colors.text} />
                </Pressable>
              </View>
            </View>

            {/* View Mode Toggle */}
            <View style={styles.viewModeSection}>
              <ViewModeToggle
                currentMode={viewMode}
                onModeChange={setViewMode}
                compact={true}
              />
            </View>

            {/* Calendar View Container (Month/Week only) */}
            <View style={[styles.calendarContainer, { backgroundColor: colors.card }]}>
              {viewMode === 'month' && (
                <CalendarGrid
                  currentDate={liturgicalDay?.date || format(new Date(), 'yyyy-MM-dd')}
                  markedDates={markedDates}
                  onDayPress={handleDayPress}
                  cellSize={cellSize}
                  showFeastNames={false}
                  colorFilters={selectedFilters}
                  dominicanOnly={dominicanOnly}
                  doctorOnly={doctorOnly}
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
                  doctorOnly={doctorOnly}
                />
              )}
            </View>

            {/* Interactive Legend & Filters */}
            <InteractiveLegend
              selectedFilters={selectedFilters}
              onToggleFilter={handleToggleFilter}
              dominicanOnly={dominicanOnly}
              onToggleDominican={() => setDominicanOnly(!dominicanOnly)}
              doctorOnly={doctorOnly}
              onToggleDoctor={() => setDoctorOnly(!doctorOnly)}
              onClearAll={handleClearFilters}
              compact={true}
            />

            {/* Feast Detail Panel - Inline Below Calendar */}
            {liturgicalDay && showFeastDetail && (
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
            )}
          </View>
        </ScrollView>
      )}

      {/* Search Modal */}
      <Modal
        visible={showSearchModal}
        transparent
        animationType="none"
        onRequestClose={closeSearchModal}
      >
        <View style={styles.modalOverlay}>
          <Pressable style={{ flex: 1 }} onPress={closeSearchModal} />
          <Animated.View
            style={[
              styles.searchModal,
              { backgroundColor: colors.card },
              {
                transform: [
                  {
                    translateY: searchModalAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [-400, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <View style={styles.searchModalHeader}>
              <Text style={[styles.searchModalTitle, { color: colors.text }]}>
                Search Feasts
              </Text>
              <Pressable onPress={closeSearchModal} style={styles.closeButton}>
                <Ionicons name="close" size={24} color={colors.text} />
              </Pressable>
            </View>
            <View style={styles.searchModalContent}>
              <SearchBar onSelectDate={handleSearchSelect} />
            </View>
          </Animated.View>
        </View>
      </Modal>
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
  contentPadding: {
    paddingHorizontal: 16,
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    flexDirection: 'row',
  },
  monthTitle: {
    fontSize: 24,
    fontFamily: 'Georgia',
    fontWeight: '700',
  },
  iconButton: {
    padding: 8,
    borderRadius: 20,
  },
  viewModeSection: {
    alignItems: 'center',
    marginBottom: 16,
  },
  calendarContainer: {
    borderRadius: 16,
    padding: 12,
    marginBottom: 16,
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
    maxHeight: '85%',
    borderRadius: 20,
    overflow: 'hidden',
  },
  searchModal: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
    paddingBottom: 20,
  },
  searchModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingTop: 50,
  },
  searchModalTitle: {
    fontSize: 20,
    fontFamily: 'Georgia',
    fontWeight: '700',
  },
  closeButton: {
    padding: 8,
  },
  searchModalContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
});
