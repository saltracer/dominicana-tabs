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
import FilterPanel, { FeastFilter } from '../../../components/calendar/FilterPanel';
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
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [selectedFilters, setSelectedFilters] = useState<FeastFilter[]>([]);
  const [dominicanOnly, setDominicanOnly] = useState(false);

  // Animations
  const feastDetailAnimation = useRef(new Animated.Value(0)).current;
  const searchModalAnim = useRef(new Animated.Value(0)).current;

  // Responsive breakpoints (for tablets)
  const isTablet = width >= 768;

  // Determine calendar cell size
  const cellSize = isTablet ? 'medium' : 'small';

  useEffect(() => {
    generateMarkedDates();
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
  };

  const handleSearchSelect = (date: Date) => {
    setShowSearchModal(false);
    handleDayPress({ dateString: format(date, 'yyyy-MM-dd') });
  };

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
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        <CommunityNavigation activeTab="calendar" />

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

          {/* Collapsible Filters */}
          <Pressable
            onPress={() => setShowFilters(!showFilters)}
            style={[styles.filterToggle, { backgroundColor: colors.surface }]}
          >
            <Ionicons
              name={showFilters ? 'chevron-up' : 'chevron-down'}
              size={20}
              color={colors.text}
              style={{ marginRight: 8 }}
            />
            <Text style={[styles.filterToggleText, { color: colors.text }]}>
              Filters{(selectedFilters.length > 0 || dominicanOnly) ? ` (${selectedFilters.length + (dominicanOnly ? 1 : 0)})` : ''}
            </Text>
          </Pressable>

          {showFilters && (
            <View style={styles.filtersContainer}>
              <FilterPanel
                selectedFilters={selectedFilters}
                onToggleFilter={handleToggleFilter}
                dominicanOnly={dominicanOnly}
                onToggleDominican={() => setDominicanOnly(!dominicanOnly)}
                onClearAll={handleClearFilters}
                compact={true}
              />
            </View>
          )}

          {/* View Mode Toggle */}
          <View style={styles.viewModeSection}>
            <ViewModeToggle
              currentMode={viewMode}
              onModeChange={setViewMode}
              compact={true}
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
                showFeastNames={false}
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
                <View style={[styles.legendDot, { backgroundColor: '#8B0000', marginRight: 6 }]} />
                <Text style={[styles.legendText, { color: colors.text }]}>Solemnity</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#4B0082', marginRight: 6 }]} />
                <Text style={[styles.legendText, { color: colors.text }]}>Feast</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#DAA520', marginRight: 6 }]} />
                <Text style={[styles.legendText, { color: colors.text }]}>Memorial</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#2E7D32', marginRight: 6 }]} />
                <Text style={[styles.legendText, { color: colors.text }]}>Ferial</Text>
              </View>
              <View style={styles.legendItem}>
                <Text style={[styles.dominicanSymbol, { color: colors.primary, marginRight: 6 }]}>⚫</Text>
                <Text style={[styles.legendText, { color: colors.text }]}>Dominican</Text>
              </View>
            </View>
          </View>

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
                liturgicalDay={liturgicalDay}
                isVisible={true}
                onClose={closeFeastDetail}
              />
            </Animated.View>
          )}
        </View>
      </ScrollView>

      {/* Search Modal */}
      <Modal
        visible={showSearchModal}
        transparent
        animationType="none"
        onRequestClose={closeSearchModal}
      >
        <View style={styles.modalOverlay}>
          <Pressable style={styles.backdrop} onPress={closeSearchModal} />
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
  filterToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  filterToggleText: {
    fontSize: 14,
    fontFamily: 'Georgia',
    fontWeight: '600',
  },
  filtersContainer: {
    marginBottom: 16,
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
  calendarLegend: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  legendTitle: {
    fontSize: 14,
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
    width: '45%',
    marginBottom: 8,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    fontSize: 12,
    fontFamily: 'Georgia',
  },
  dominicanSymbol: {
    fontSize: 12,
  },
  feastPanelStacked: {
    marginTop: 20,
    borderRadius: 16,
    overflow: 'hidden',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
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
