import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Calendar } from 'react-native-calendars';
import { Colors, getLiturgicalColorHex, adjustLiturgicalColorBrightness } from '../constants/Colors';
import { useTheme } from './ThemeProvider';
import { useCalendar } from './CalendarContext';
import { LiturgicalDay } from '../types';
import { Celebration } from '../types/celebrations-types';
import { parseISO, format } from 'date-fns';
import { useIsMobile, useIsTablet } from '@/hooks/useMediaQuery';
import { spacing } from '@/constants/Spacing';
import PodcastMiniPlayer from './PodcastMiniPlayer.web';
import RosaryMiniPlayer from './RosaryMiniPlayer.web';
import { usePodcastPlayer } from '../contexts/PodcastPlayerContext';
import { useRosaryPlayer } from '../contexts/RosaryPlayerContext';

interface FeastBannerProps {
  liturgicalDay: LiturgicalDay;
  showDatePicker?: boolean;
}

export default function FeastBanner({ 
  liturgicalDay, 
  showDatePicker = true 
}: FeastBannerProps) {
  const { colorScheme } = useTheme();
  const { selectedDate, setSelectedDate } = useCalendar();
  const { currentEpisode, isPlaying, isPaused, isLoading, position, duration, seek } = usePodcastPlayer();
  const { 
    isPlaying: rosaryIsPlaying, 
    isPaused: rosaryIsPaused,
    isSessionActive: rosarySessionActive 
  } = useRosaryPlayer();
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();
  const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [carouselIndex, setCarouselIndex] = useState(0); // 0 = date, 1 = feast
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  // Determine if we should show the podcast player
  // Show if there's a current episode (playing, paused, stopped, or loading)
  const showPodcastPlayer = !!currentEpisode;
  
  // Determine if we should show the rosary player
  // Show if there's an active session (playing, paused, or stopped)
  const showRosaryPlayer = rosarySessionActive;
  
  // Debug logging
  console.log('[FeastBanner.web] Podcast player state:', {
    currentEpisode: currentEpisode?.title,
    isPlaying,
    isPaused,
    isLoading,
    showPodcastPlayer
  });

  const navigateToPreviousDay = () => {
    const currentDate = parseISO(liturgicalDay.date);
    const previousDate = new Date(currentDate);
    previousDate.setDate(previousDate.getDate() - 1);
    setSelectedDate(previousDate);
  };

  const navigateToNextDay = () => {
    const currentDate = parseISO(liturgicalDay.date);
    const nextDate = new Date(currentDate);
    nextDate.setDate(nextDate.getDate() + 1);
    setSelectedDate(nextDate);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // const getSeasonEmoji = (season: string) => {
  //   switch (season.toLowerCase()) {
  //     case 'advent':
  //       return '🕯️';
  //     case 'christmas':
  //       return '⭐';
  //     case 'lent':
  //       return '🕊️';
  //     case 'easter':
  //       return '🌅';
  //     case 'pentecost':
  //       return '🔥';
  //     case 'ordinary':
  //       return '🌿';
  //     default:
  //       return '📖';
  //   }
  // };

  // const getFeastEmoji = (feast: Feast) => {
  //   if (feast.isDominican) return '⚫⚪';
  //   if (feast.rank === 'solemnity') return '👑';
  //   if (feast.rank === 'feast') return '⭐';
  //   if (feast.rank === 'memorial') return '🌹';
  //   return '📖';
  // };

  // const getSeasonColor = (season: string) => {
  //   switch (season.toLowerCase()) {
  //     case 'advent':
  //       return '#4B0082'; // Purple
  //     case 'christmas':
  //       return '#FFFFFF'; // White
  //     case 'lent':
  //       return '#800080'; // Purple
  //     case 'easter':
  //       return '#FFFFFF'; // White
  //     case 'pentecost':
  //       return '#FF0000'; // Red
  //     case 'ordinary':
  //       return '#228B22'; // Green
  //     default:
  //       return '#228B22'; // Green
  //   }
  // };

  // Get the primary feast (highest rank feast)
  const primaryFeast = liturgicalDay.feasts.find(f => f.rank === 'Solemnity' || f.rank === 'Feast') || liturgicalDay.feasts[0];
  
  // For the color strip: use feast color if available, otherwise use season color
  const displayColor = primaryFeast?.color 
    ? getLiturgicalColorHex(primaryFeast.color, colorScheme === 'dark')
    : getLiturgicalColorHex(liturgicalDay.season.name, colorScheme === 'dark');

  // Calculate progress percentage for podcast playback
  const progressPercentage = duration > 0 ? (position / duration) * 100 : 0;
  
  // Determine if progress should be shown
  // Show progress when miniplayer is visible (index 0) AND we have valid duration
  const showProgress = showPodcastPlayer && carouselIndex === 0 && duration > 0;

  const handleDateChange = (day: any) => {
    if (day) {
      // Use date-fns parseISO for clean date parsing
      const selectedDate = parseISO(day.dateString);
      setSelectedDate(selectedDate);
      setIsDatePickerVisible(false);
    }
  };

  const showDatePickerModal = () => {
    if (showDatePicker) {
      setIsDatePickerVisible(true);
    }
  };

  const getFeastDisplayName = (feast: Celebration) => {
    if (feast.isDominican) {
      return `${feast.name}, OP`;
    }
    return feast.name;
  };

  const getFeastRankText = (feast: Celebration) => {
    if (feast.isDominican) {
      return 'Dominican Saint';
    }
    return feast.rank;
  };

  // Swipe handlers for mobile carousel
  const handleTouchStart = (e: any) => {
    if (!isMobile) return;
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: any) => {
    if (!isMobile) return;
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!isMobile || !primaryFeast) return;
    if (touchStart - touchEnd > 75) {
      // Swiped left - go to next slide
      setCarouselIndex(1);
    }
    if (touchStart - touchEnd < -75) {
      // Swiped right - go to previous slide
      setCarouselIndex(0);
    }
  };

  return (
    <View style={[
      styles.container, 
      { 
        backgroundColor: Colors[colorScheme ?? 'light'].surface,
        borderColor: Colors[colorScheme ?? 'light'].border,
      }
    ]}>
              {/* Liturgical Day Color Bar with Progress Overlay */}
        {showProgress ? (
          <TouchableOpacity
            style={[
              styles.seasonColorBar, 
              { backgroundColor: displayColor }
            ]}
            onPress={(e) => {
              // Calculate the position based on where the user clicked
              const { locationX, target } = e.nativeEvent;
              const { width } = (target as any).getBoundingClientRect?.() || { width: window.innerWidth };
              const percentage = locationX / width;
              const newPosition = Math.max(0, Math.min(duration, duration * percentage));
              seek(newPosition);
            }}
            activeOpacity={1}
          >
            <View 
              style={[
                styles.progressFill,
                { 
                  width: `${progressPercentage}%`,
                  backgroundColor: Colors[colorScheme ?? 'light'].primary
                }
              ]} 
            />
          </TouchableOpacity>
        ) : (
          <View 
            style={[
              styles.seasonColorBar, 
              { backgroundColor: displayColor }
            ]}
          />
        )}
      
      <View 
        style={[styles.bannerContent, isMobile && styles.bannerContentMobile, isTablet && styles.bannerContentTablet]}
        {...(isMobile && {
          onTouchStart: handleTouchStart,
          onTouchMove: handleTouchMove,
          onTouchEnd: handleTouchEnd,
        } as any)}
      >
        {/* Date/Feast Section with Navigation */}
        <View style={styles.topRow}>
          {/* Date Navigation Section - Hidden on mobile when carousel is on feast view */}
          {(!isMobile || carouselIndex === 0) && (
            <View style={Object.assign({}, styles.leftSection, isMobile ? { flex: 1, justifyContent: 'center' } : {})}>
              <TouchableOpacity
                style={[styles.navButton, isMobile && styles.navButtonMobile]}
                onPress={navigateToPreviousDay}
                activeOpacity={0.7}
                accessibilityLabel="Previous day"
                accessibilityRole="button"
              >
                <Ionicons 
                  name="chevron-back" 
                  size={isMobile ? 24 : 20} 
                  color={Colors[colorScheme ?? 'light'].textSecondary} 
                />
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.dateButton, isMobile && styles.dateButtonMobile]}
                onPress={showDatePickerModal}
                activeOpacity={0.8}
                accessibilityLabel="Select date"
                accessibilityRole="button"
              >
                <Text style={Object.assign(
                  {},
                  styles.dateText,
                  isMobile ? styles.dateTextMobile : {},
                  isTablet ? styles.dateTextTablet : {},
                  { color: Colors[colorScheme ?? 'light'].text }
                )}>
                  {isMobile 
                    ? format(parseISO(liturgicalDay.date), 'MMM d, yyyy')
                    : format(parseISO(liturgicalDay.date), 'EEEE, MMM d, yyyy')
                  }
                </Text>
              </TouchableOpacity>
              
              {/* Reset to Today Button - Only show if not on today's date */}
              {format(parseISO(liturgicalDay.date), 'yyyy-MM-dd') !== format(new Date(), 'yyyy-MM-dd') && (
                <TouchableOpacity
                  style={[styles.resetButton, isMobile && styles.resetButtonMobile]}
                  onPress={() => setSelectedDate(new Date())}
                  activeOpacity={0.7}
                  accessibilityLabel="Reset to today"
                  accessibilityRole="button"
                >
                  <Ionicons 
                    name="arrow-undo" 
                    size={isMobile ? 20 : 16} 
                    color={Colors[colorScheme ?? 'light'].textSecondary} 
                  />
                </TouchableOpacity>
              )}
              
              <TouchableOpacity
                style={[styles.navButton, isMobile && styles.navButtonMobile]}
                onPress={navigateToNextDay}
                activeOpacity={0.7}
                accessibilityLabel="Next day"
                accessibilityRole="button"
              >
                <Ionicons 
                  name="chevron-forward" 
                  size={isMobile ? 24 : 20} 
                  color={Colors[colorScheme ?? 'light'].textSecondary} 
                />
              </TouchableOpacity>
            </View>
          )}
          
          {/* Podcast Player Section - Only on mobile when playing */}
          {isMobile && showPodcastPlayer && carouselIndex === 2 && (
            <View style={Object.assign({}, styles.rightSection, { flex: 1, alignItems: 'center' })}>
              <PodcastMiniPlayer />
            </View>
          )}
          
          {/* Rosary Player Section - Only on mobile when playing */}
          {isMobile && showRosaryPlayer && carouselIndex === 3 && (
            <View style={Object.assign({}, styles.rightSection, { flex: 1, alignItems: 'center' })}>
              <RosaryMiniPlayer />
            </View>
          )}
          
          {/* Feast Section - Hidden on mobile when carousel is on date view */}
          {primaryFeast && (!isMobile || carouselIndex === 1) && (
            <View style={Object.assign({}, styles.rightSection, isMobile ? { flex: 1, alignItems: 'center' } : {})}>
              <View style={styles.feastRow}>
                <View style={Object.assign(
                  {},
                  styles.rankContainer, 
                  { 
                    backgroundColor: getLiturgicalColorHex(primaryFeast.color, colorScheme === 'dark'),
                    borderWidth: (primaryFeast.color?.toLowerCase() === 'white') ? 1 : 0,
                    borderColor: (primaryFeast.color?.toLowerCase() === 'white') ? '#000000' : 'transparent'
                  }
                )}>
                  <Text style={Object.assign(
                    {},
                    styles.rankText, 
                    { 
                      color: (primaryFeast.color?.toLowerCase() === 'white') 
                        ? '#000000' 
                        : Colors[colorScheme ?? 'light'].dominicanWhite 
                    }
                  )}>
                    {primaryFeast.rank.split(' ')[0]}
                  </Text>
                </View>
                <View style={styles.feastTextContainer}>
                  <Text style={Object.assign(
                    {},
                    styles.feastName,
                    isMobile ? styles.feastNameMobile : {},
                    { color: Colors[colorScheme ?? 'light'].text }
                  )} numberOfLines={isMobile ? 2 : 1}>
                    {getFeastDisplayName(primaryFeast)}
                  </Text>
                  {primaryFeast.isDominican && (
                    <Text style={Object.assign({}, styles.dominicanIndicator, { color: Colors[colorScheme ?? 'light'].primary })}>
                      Dominican
                    </Text>
                  )}
                </View>
                <TouchableOpacity 
                  style={[styles.infoButton, isMobile && styles.infoButtonMobile]} 
                  onPress={() => setShowInfoModal(true)}
                  activeOpacity={0.7}
                  accessibilityLabel="View feast information"
                  accessibilityRole="button"
                >
                  <Ionicons 
                    name="information-circle-outline" 
                    size={isMobile ? 24 : 20} 
                    color={Colors[colorScheme ?? 'light'].textSecondary} 
                  />
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {/* Mobile Carousel Indicators */}
        {isMobile && (primaryFeast || showPodcastPlayer || showRosaryPlayer) && (
          <View style={styles.carouselIndicators}>
            <TouchableOpacity
              style={Object.assign(
                {},
                styles.carouselDot,
                carouselIndex === 0 ? { backgroundColor: Colors[colorScheme ?? 'light'].primary, width: 20 } : { backgroundColor: Colors[colorScheme ?? 'light'].border, width: 8 }
              )}
              onPress={() => setCarouselIndex(0)}
              accessibilityLabel="View date navigation"
              accessibilityRole="button"
            />
            {primaryFeast && (
              <TouchableOpacity
                style={Object.assign(
                  {},
                  styles.carouselDot,
                  carouselIndex === 1 ? { backgroundColor: Colors[colorScheme ?? 'light'].primary, width: 20 } : { backgroundColor: Colors[colorScheme ?? 'light'].border, width: 8 }
                )}
                onPress={() => setCarouselIndex(1)}
                accessibilityLabel="View feast information"
                accessibilityRole="button"
              />
            )}
            {showPodcastPlayer && (
              <TouchableOpacity
                style={Object.assign(
                  {},
                  styles.carouselDot,
                  carouselIndex === 2 ? { backgroundColor: Colors[colorScheme ?? 'light'].primary, width: 20 } : { backgroundColor: Colors[colorScheme ?? 'light'].border, width: 8 }
                )}
                onPress={() => setCarouselIndex(2)}
                accessibilityLabel="View podcast player"
                accessibilityRole="button"
              />
            )}
            {showRosaryPlayer && (
              <TouchableOpacity
                style={Object.assign(
                  {},
                  styles.carouselDot,
                  carouselIndex === 3 ? { backgroundColor: Colors[colorScheme ?? 'light'].primary, width: 20 } : { backgroundColor: Colors[colorScheme ?? 'light'].border, width: 8 }
                )}
                onPress={() => setCarouselIndex(3)}
                accessibilityLabel="View rosary player"
                accessibilityRole="button"
              />
            )}
          </View>
        )}
      </View>

      {/* Date Picker Modal */}
      {isDatePickerVisible && (
        <Modal
          visible={isDatePickerVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setIsDatePickerVisible(false)}
        >
          <View style={[
            styles.modalOverlay, 
            { backgroundColor: 'rgba(0, 0, 0, 0.5)' }
          ]}>
            <View style={[
              styles.modalContent, 
              { backgroundColor: Colors[colorScheme ?? 'light'].surface }
            ]}>
              <View style={styles.modalHeader}>
                <Text style={[
                  styles.modalTitle, 
                  { color: Colors[colorScheme ?? 'light'].text }
                ]}>
                  Select Date
                </Text>
                <TouchableOpacity 
                  style={styles.closeButton}
                  onPress={() => setIsDatePickerVisible(false)}
                >
                  <Ionicons 
                    name="close" 
                    size={24} 
                    color={Colors[colorScheme ?? 'light'].text} 
                  />
                </TouchableOpacity>
              </View>
              
              <Calendar
                onDayPress={handleDateChange}
                markedDates={{
                  [format(selectedDate, 'yyyy-MM-dd')]: {
                    selected: true,
                    selectedColor: Colors[colorScheme ?? 'light'].primary,
                  }
                }}
                theme={{
                  backgroundColor: Colors[colorScheme ?? 'light'].surface,
                  calendarBackground: Colors[colorScheme ?? 'light'].surface,
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
                  textDayFontWeight: '300',
                  textMonthFontWeight: 'bold',
                  textDayHeaderFontWeight: '300',
                  textDayFontSize: 16,
                  textMonthFontSize: 16,
                  textDayHeaderFontSize: 13
                }}
              />
            </View>
          </View>
        </Modal>
      )}

      {/* Info Modal */}
      <Modal
        visible={showInfoModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowInfoModal(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity 
            style={styles.modalOverlayTouchable} 
            activeOpacity={1} 
            onPress={() => setShowInfoModal(false)}
          >
            <View style={styles.modalOverlayInner} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.infoModalContent, isMobile && styles.infoModalContentMobile]} 
            activeOpacity={1} 
            onPress={() => {}} // Prevent dismissal when tapping content
          >
            <View style={[
              styles.infoModalContentInner, 
              { backgroundColor: Colors[colorScheme ?? 'light'].surface },
              isMobile && { padding: spacing.md }
            ]}>
            <View style={styles.modalHeader}>
                              <View style={[
                  styles.modalTitleContainer, 
                  { 
                    backgroundColor: getLiturgicalColorHex(primaryFeast?.color, colorScheme === 'dark'),
                    borderWidth: (primaryFeast?.color?.toLowerCase() === 'white') ? 1 : 0,
                    borderColor: (primaryFeast?.color?.toLowerCase() === 'white') ? '#000000' : 'transparent'
                  }
                ]}>
                  <Text style={[styles.modalTitle, { color: (primaryFeast?.color?.toLowerCase() === 'white') ? '#000000' : '#FFFFFF' }]}>
                    {primaryFeast?.name} - {primaryFeast?.rank}
                  </Text>
                </View>
              {/* <TouchableOpacity 
                style={styles.closeButton} 
                onPress={() => setShowInfoModal(false)}
                activeOpacity={0.7}
              >
                <Ionicons name="close" size={24} color={Colors[colorScheme ?? 'light'].textSecondary} />
              </TouchableOpacity> */}
            </View>
            
            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              {/* Saint Dates */}
              {primaryFeast?.birthYear || primaryFeast?.deathYear ? (
                <View style={styles.dateRangeSection}>
                  <Text style={[styles.dateRangeText, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                    {primaryFeast?.birthYear && primaryFeast?.deathYear 
                      ? `${primaryFeast.birthYear} - ${primaryFeast.deathYear}`
                      : `d. ${primaryFeast?.deathYear}` || `b. ${primaryFeast?.birthYear}`
                    }
                  </Text>
                </View>
              ) : (
                /* Fallback to liturgical day if no saint dates */
                <View style={styles.dateRangeSection}>
                  <Text style={[styles.dateRangeText, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                    {format(parseISO(liturgicalDay.date), 'MMMM d, yyyy')}
                  </Text>
                </View>
              )}

              {/* Patronage Section */}
              {primaryFeast?.patronage && (
                <View style={styles.infoSection}>
                  <Text style={[styles.infoLabel, { color: Colors[colorScheme ?? 'light'].text }]}>
                    Patronage
                  </Text>
                  <Text style={[styles.infoValue, { color: Colors[colorScheme ?? 'light'].text }]}>
                    {primaryFeast.patronage}
                  </Text>
                </View>
              )}

              {/* Biography Section */}
              {primaryFeast?.biography && (
                <View style={styles.infoSection}>
                  <Text style={[styles.infoLabel, { color: Colors[colorScheme ?? 'light'].text }]}>
                    Biography
                  </Text>
                  {Array.isArray(primaryFeast.biography) ? (
                    primaryFeast.biography.map((paragraph, index) => (
                      <Text 
                        key={index} 
                        style={[
                          styles.infoValue, 
                          { color: Colors[colorScheme ?? 'light'].text },
                          index > 0 && styles.biographyParagraph
                        ]}
                      >
                        {paragraph}
                      </Text>
                    ))
                  ) : (
                    <Text style={[styles.infoValue, { color: Colors[colorScheme ?? 'light'].text }]}>
                      {primaryFeast.biography}
                    </Text>
                  )}
                </View>
              )}

              {/* Prayers Section */}
              {primaryFeast?.prayers && (
                <View style={styles.infoSection}>
                  <Text style={[styles.infoLabel, { color: Colors[colorScheme ?? 'light'].text }]}>
                    Prayers
                  </Text>
                  <Text style={[styles.prayerText, { color: Colors[colorScheme ?? 'light'].text }]}>
                    {primaryFeast.prayers}
                  </Text>
                </View>
              )}

              {/* Fallback to basic info if no detailed sections */}
              {!primaryFeast?.patronage && !primaryFeast?.biography && !primaryFeast?.prayers && (
                <>
                  {primaryFeast?.isDominican && (
                    <View style={styles.infoSection}>
                      <Text style={[styles.infoLabel, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                        Type
                      </Text>
                      <Text style={[styles.infoValue, { color: Colors[colorScheme ?? 'light'].primary }]}>
                        Dominican Celebration
                      </Text>
                    </View>
                  )}

                  {primaryFeast?.description && (
                    <View style={styles.infoSection}>
                      <Text style={[styles.infoLabel, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                        Description
                      </Text>
                      {Array.isArray(primaryFeast.description) ? (
                        primaryFeast.description.map((paragraph, index) => (
                          <Text 
                            key={index} 
                            style={[
                              styles.infoValue, 
                              { color: Colors[colorScheme ?? 'light'].text },
                              index > 0 && styles.biographyParagraph
                            ]}
                          >
                            {paragraph}
                          </Text>
                        ))
                      ) : (
                        <Text style={[styles.infoValue, { color: Colors[colorScheme ?? 'light'].text }]}>
                          {primaryFeast.description}
                        </Text>
                      )}
                    </View>
                  )}

                  <View style={styles.infoSection}>
                    <Text style={[styles.infoLabel, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                      Liturgical Season
                    </Text>
                    <Text style={[styles.infoValue, { color: Colors[colorScheme ?? 'light'].text }]}>
                      {liturgicalDay.season.name}
                    </Text>
                  </View>

                  <View style={styles.infoSection}>
                    <Text style={[styles.infoLabel, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                      Liturgical Week
                    </Text>
                    <Text style={[styles.infoValue, { color: Colors[colorScheme ?? 'light'].text }]}>
                      {liturgicalDay.weekString || `Week ${liturgicalDay.week}`}
                    </Text>
                  </View>
                </>
              )}
            </ScrollView>
            
            {/* Bottom Close Button */}
            <View style={styles.modalFooter}>
              <TouchableOpacity 
                style={[styles.bottomCloseButton, { backgroundColor: '#FFFFFF', borderColor: '#E0E0E0' }]}
                onPress={() => setShowInfoModal(false)}
                activeOpacity={0.7}
              >
                <Text style={[styles.bottomCloseButtonText, { color: '#000000' }]}>
                  Close
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
  },
  bannerContent: {
    padding: spacing.md,
  },
  bannerContentMobile: {
    padding: spacing.md,
  },
  bannerContentTablet: {
    padding: spacing.md,
  },
  seasonColorBar: {
    height: 4,
    width: '100%',
    position: 'relative',
    overflow: 'hidden',
  },
  progressFill: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    height: '100%',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
    minHeight: 48, // Fixed height to match feast banner content
  },
  topRowMobile: {
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  leftSectionMobile: {
    flex: 'none',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  rightSection: {
    alignItems: 'flex-end',
    flex: 1,
  },
  rightSectionMobile: {
    flex: 'none',
    alignItems: 'center',
    width: '100%',
  },
  navButton: {
    padding: spacing.sm,
    borderRadius: 20,
    backgroundColor: 'transparent',
    minWidth: 40,
    minHeight: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navButtonMobile: {
    minWidth: 44,
    minHeight: 44,
    padding: spacing.md,
  },
  resetButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    marginLeft: spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    minHeight: 40,
  },
  resetButtonMobile: {
    minWidth: 44,
    minHeight: 44,
    paddingVertical: spacing.md,
  },
  centerSection: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 16,
  },
  dateAndFeastRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  dateButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    marginHorizontal: spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
    minHeight: 40,
  },
  dateButtonMobile: {
    minHeight: 44,
    paddingVertical: spacing.md,
  },
  dateSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  seasonEmoji: {
    fontSize: 24,
    marginRight: 12,
  },
  dateTextContainer: {
    flex: 1,
  },
  dateText: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Georgia',
  },
  dateTextMobile: {
    fontSize: 16,
  },
  dateTextTablet: {
    fontSize: 15,
  },
  seasonText: {
    fontSize: 14,
    fontFamily: 'Georgia',
  },
  datePickerButton: {
    padding: 8,
  },
  feastSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  feastInfo: {
    alignItems: 'center',
    marginTop: 4,
  },
  feastRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48, // Fixed height to match content
  },
  feastRowMobile: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  rankContainer: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    marginRight: 12,
    minWidth: 70,
    alignItems: 'center',
  },
  rankText: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'Georgia',
    textAlign: 'center',
  },
  dominicanIndicator: {
    fontSize: 12,
    fontFamily: 'Georgia',
    fontStyle: 'italic',
    marginTop: 2,
  },
  feastEmoji: {
    fontSize: 20,
    marginRight: 12,
  },
  feastTextContainer: {
    flex: 1,
  },
  feastName: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'Georgia',
  },
  feastNameMobile: {
    fontSize: 16,
    textAlign: 'center',
  },
  feastRank: {
    fontSize: 12,
    fontFamily: 'Georgia',
    fontStyle: 'italic',
  },
  additionalFeasts: {
    marginTop: 8,
    alignItems: 'flex-end',
  },
  additionalFeastsText: {
    fontSize: 12,
    fontFamily: 'Georgia',
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlayTouchable: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalOverlayInner: {
    flex: 1,
  },
  modalContent: {
    borderRadius: 16,
    padding: 20,
    width: '90%',
    maxWidth: 400,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    flex: 1,
    marginRight: 10,
  },
  modalTitleContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 16,
  },
  closeButton: {
    padding: 4,
  },
  infoButton: {
    padding: spacing.sm,
    marginLeft: spacing.sm,
    borderRadius: 20,
    backgroundColor: 'transparent',
    minWidth: 40,
    minHeight: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoButtonMobile: {
    minWidth: 44,
    minHeight: 44,
    marginLeft: 0,
    marginTop: spacing.sm,
  },
  infoModalContent: {
    width: '90%',
    maxWidth: 650,
    maxHeight: '80%',
    borderRadius: 16,
    padding: spacing.lg,
    elevation: 5,
    boxShadow: '0px 2px 3.84px rgba(0, 0, 0, 0.25)',
  },
  infoModalContentMobile: {
    width: '95%',
    maxHeight: '90%',
    padding: spacing.md,
  },
  infoModalContentInner: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
    padding: 20,
  },
  modalBody: {
    flex: 1,
  },
  infoSection: {
    marginBottom: 20,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  infoValue: {
    fontSize: 16,
    lineHeight: 24,
  },
  dateRangeSection: {
    marginBottom: 24,
    alignItems: 'center',
  },
  dateRangeText: {
    fontSize: 18,
    fontFamily: 'Georgia',
    fontStyle: 'italic',
  },
  prayerText: {
    fontSize: 16,
    lineHeight: 24,
    fontStyle: 'italic',
    fontFamily: 'Georgia',
  },
  biographyParagraph: {
    marginTop: 16,
  },
  modalFooter: {
    marginTop: 20,
    alignItems: 'center',
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
  },
  bottomCloseButton: {
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 120,
    borderWidth: 1,
  },
  bottomCloseButtonText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  
  // Mobile carousel indicators
  carouselIndicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.md,
  },
  carouselDot: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
});
