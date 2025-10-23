import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  FlatList,
  useWindowDimensions,
  Animated,
  Modal,
  Pressable,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../../constants/Colors';
import { useTheme } from '../../../components/ThemeProvider';
import { useCalendar } from '../../../components/CalendarContext';
import FeastBanner from '../../../components/FeastBanner.web';
import CommunityNavigation from '../../../components/CommunityNavigation';
import SaintDetailPanel from '../../../components/SaintDetailPanel.web';
import { allSaints } from '../../../assets/data/calendar/saints';
import { Saint } from '../../../types/saint-types';
import { CelebrationRank } from '../../../types/celebrations-types';
import { CommunityStyles, getPlatformStyles } from '../../../styles';
import Footer from '../../../components/Footer.web';

type SortOption = 'name' | 'feast_day' | 'birth_year' | 'death_year';
type FilterOption = 'dominican' | 'doctor' | 'martyr' | 'virgin' | 'founder';

export default function SaintsScreen() {
  const { colorScheme } = useTheme();
  const { liturgicalDay } = useCalendar();
  const { width } = useWindowDimensions();
  const isWeb = true;
  const platformStyles = getPlatformStyles(isWeb);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('name');
  const [activeFilters, setActiveFilters] = useState<FilterOption[]>([]);
  const [selectedSaint, setSelectedSaint] = useState<Saint | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [displayedCount, setDisplayedCount] = useState(24);
  const itemsPerPage = 24; // More items per page for web
  const slideAnimation = useRef(new Animated.Value(0)).current;
  
  // Responsive breakpoints (matching calendar page)
  const isMobile = width < 768;
  const isTablet = width >= 768 && width < 1024;
  const isDesktop = width >= 1024;
  const isWide = width >= 1440;

  const filteredAndSortedSaints = useMemo(() => {
    let filtered = allSaints.filter(saint => {
      // Search filter
      const matchesSearch = searchQuery === '' || 
        saint.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        saint.patronage?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        saint.short_bio?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        saint.biography?.some(bio => bio.toLowerCase().includes(searchQuery.toLowerCase()));

      // Category filter - if no filters active, show all
      // If filters are active, saint must match ALL filters (AND logic)
      const matchesFilter = activeFilters.length === 0 || activeFilters.every(filter => {
        switch (filter) {
          case 'dominican':
            return saint.is_dominican;
          case 'doctor':
            return saint.is_doctor;
          case 'martyr':
            return saint.rank === CelebrationRank.MEMORIAL && saint.color?.toLowerCase() === 'red';
          case 'virgin':
            return saint.name.toLowerCase().includes('virgin');
          case 'founder':
            return saint.patronage?.toLowerCase().includes('founder') || saint.short_bio?.toLowerCase().includes('founder');
          default:
            return false;
        }
      });

      return matchesSearch && matchesFilter;
    });

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'feast_day':
          return a.feast_day.localeCompare(b.feast_day);
        case 'birth_year':
          return (b.birth_year || 0) - (a.birth_year || 0);
        case 'death_year':
          return (b.death_year || 0) - (a.death_year || 0);
        default:
          return 0;
      }
    });

    return filtered;
  }, [searchQuery, sortBy, activeFilters]);

  const displayedSaints = useMemo(() => {
    return filteredAndSortedSaints.slice(0, displayedCount);
  }, [filteredAndSortedSaints, displayedCount]);

  // Reset displayed count when filters/search/sort changes
  useEffect(() => {
    setDisplayedCount(24);
  }, [searchQuery, sortBy, activeFilters]);

  const handleLoadMore = () => {
    if (displayedCount < filteredAndSortedSaints.length) {
      setDisplayedCount(prev => prev + itemsPerPage);
    }
  };

  const handleSaintPress = (saint: Saint) => {
    if (selectedSaint === null) {
      // First time opening panel - animate in
      setSelectedSaint(saint);
      Animated.timing(slideAnimation, {
        toValue: 1,
        duration: 300,
        useNativeDriver: false, // Changed to false for width animation
      }).start();
    } else {
      // Panel already open - just update the saint
      setSelectedSaint(saint);
    }
  };

  const closePanel = () => {
    // Animate panel out
    Animated.timing(slideAnimation, {
      toValue: 0,
      duration: 300,
      useNativeDriver: false, // Changed to false for width animation
    }).start(() => {
      setSelectedSaint(null);
    });
  };

  const navigateToPrevious = () => {
    if (!selectedSaint) return;
    const currentIndex = filteredAndSortedSaints.findIndex(saint => saint.id === selectedSaint.id);
    if (currentIndex > 0) {
      setSelectedSaint(filteredAndSortedSaints[currentIndex - 1]);
    }
  };

  const navigateToNext = () => {
    if (!selectedSaint) return;
    const currentIndex = filteredAndSortedSaints.findIndex(saint => saint.id === selectedSaint.id);
    if (currentIndex < filteredAndSortedSaints.length - 1) {
      setSelectedSaint(filteredAndSortedSaints[currentIndex + 1]);
    }
  };

  const getCurrentIndex = () => {
    if (!selectedSaint) return -1;
    return filteredAndSortedSaints.findIndex(saint => saint.id === selectedSaint.id);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (event: any) => {
      if (!selectedSaint) return;
      
      switch (event.key) {
        case 'Escape':
          closePanel();
          break;
        case 'ArrowLeft':
          event.preventDefault();
          navigateToPrevious();
          break;
        case 'ArrowRight':
          event.preventDefault();
          navigateToNext();
          break;
      }
    };

    if (selectedSaint) {
      document.addEventListener('keydown', handleKeyPress);
      return () => document.removeEventListener('keydown', handleKeyPress);
    }
  }, [selectedSaint]);

  const formatFeastDay = (feastDay: string) => {
    const [month, day] = feastDay.split('-');
    const monthNames = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    return `${monthNames[parseInt(month) - 1]} ${parseInt(day)}`;
  };

  const getRankColor = (rank?: CelebrationRank) => {
    switch (rank) {
      case CelebrationRank.SOLEMNITY:
        return Colors[colorScheme ?? 'light'].primary;
      case CelebrationRank.FEAST:
        return Colors[colorScheme ?? 'light'].secondary;
      case CelebrationRank.MEMORIAL:
        return Colors[colorScheme ?? 'light'].accent;
      default:
        return Colors[colorScheme ?? 'light'].textSecondary;
    }
  };

  const getLiturgicalColor = (color?: string) => {
    switch (color?.toLowerCase()) {
      case 'red':
        return '#DC2626';
      case 'white':
        return '#F3F4F6';
      case 'green':
        return '#059669';
      case 'purple':
        return '#7C3AED';
      case 'rose':
        return '#EC4899';
      case 'gold':
        return '#D97706';
      default:
        return Colors[colorScheme ?? 'light'].textSecondary;
    }
  };

  if (!liturgicalDay) {
    return (
      <View style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
        <CommunityNavigation activeTab="saints" />
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: Colors[colorScheme ?? 'light'].text }]}>
            Loading liturgical information...
          </Text>
        </View>
      </View>
    );
  }

  const renderSaintCard = ({ item: saint }: { item: Saint }) => {
    const isSelected = selectedSaint?.id === saint.id;
    const isMobileView = !shouldShowSidebar;
    
    return (
      <TouchableOpacity
        style={[
          styles.enhancedSaintCard, 
          { 
            backgroundColor: Colors[colorScheme ?? 'light'].card,
            borderWidth: isSelected ? 2 : 1,
            borderColor: isSelected ? Colors[colorScheme ?? 'light'].primary : Colors[colorScheme ?? 'light'].border,
            width: getCardWidth(),
            marginHorizontal: numColumns === 1 ? 0 : 8,
            padding: isMobileView ? 12 : 16,
            minHeight: isMobileView ? 180 : 280,
          }
        ]}
        onPress={() => handleSaintPress(saint)}
      >
        <View style={styles.saintHeader}>
          {/* Doctor badge - top left */}
          {saint.is_doctor && (
            <View style={[styles.doctorBadge, styles.topLeftBadge, { backgroundColor: Colors[colorScheme ?? 'light'].accent }]}>
              <Text style={[styles.badgeText, { color: 'black' }]}>
                Doctor
              </Text>
            </View>
          )}
          
          {/* Dominican badge - top right */}
          {saint.is_dominican && (
            <View style={[styles.dominicanBadge, styles.topRightBadge, { backgroundColor: Colors[colorScheme ?? 'light'].primary }]}>
              <Text style={[styles.badgeText, { color: Colors[colorScheme ?? 'light'].dominicanWhite }]}>
                OP
              </Text>
            </View>
          )}
          
          <Ionicons 
            name="person-circle" 
            size={isMobileView ? 40 : 48} 
            color={Colors[colorScheme ?? 'light'].primary} 
          />

          {/* Liturgical color indicator - only on desktop */}
          {!isMobileView && saint.color && (
            <View style={[
              styles.colorIndicator, 
              { backgroundColor: getLiturgicalColor(saint.color) }
            ]} />
          )}
        </View>

        <Text style={[styles.saintName, { color: Colors[colorScheme ?? 'light'].text }]} numberOfLines={2}>
          {saint.name}
        </Text>
        
        <Text style={[styles.saintFeastDay, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
          {formatFeastDay(saint.feast_day)}
        </Text>

        {/* Patronage - simplified on mobile */}
        {saint.patronage && (
          isMobileView ? (
            <Text style={[styles.saintPatronage, { color: Colors[colorScheme ?? 'light'].textMuted }]} numberOfLines={2}>
              {saint.patronage.split(',').slice(0, 2).join(', ')}
            </Text>
          ) : (
            <View style={styles.patronageRow}>
              <Ionicons name="ribbon" size={12} color={Colors[colorScheme ?? 'light'].primary} />
              <Text style={[styles.saintPatronage, { color: Colors[colorScheme ?? 'light'].textSecondary }]} numberOfLines={2}>
                {saint.patronage.split(',').slice(0, 2).join(', ')}
              </Text>
            </View>
          )
        )}

        {/* Birth-Death Years */}
        {saint.birth_year && saint.death_year && (
          <Text style={[styles.saintYears, { color: Colors[colorScheme ?? 'light'].textMuted }]}>
            {saint.birth_year} - {saint.death_year}
          </Text>
        )}

        {/* Short bio preview - only on desktop */}
        {!isMobileView && saint.short_bio && (
          <Text style={[styles.bioPreview, { color: Colors[colorScheme ?? 'light'].textMuted }]} numberOfLines={3}>
            {saint.short_bio}
          </Text>
        )}
      </TouchableOpacity>
    );
  };

  const handleToggleFilter = (filter: FilterOption) => {
    setActiveFilters(prev => 
      prev.includes(filter) 
        ? prev.filter(f => f !== filter) 
        : [...prev, filter]
    );
  };

  const handleClearAllFilters = () => {
    setActiveFilters([]);
    setSearchQuery('');
  };

  const renderFilterButton = (filter: FilterOption, label: string, icon: string) => {
    const isActive = activeFilters.includes(filter);
    const isMobileView = !shouldShowSidebar;
    
    return (
      <TouchableOpacity
        key={filter}
        style={[
          isMobileView ? styles.mobileFilterButton : styles.sidebarFilterButton,
          { 
            backgroundColor: isActive 
              ? Colors[colorScheme ?? 'light'].primary 
              : isMobileView ? Colors[colorScheme ?? 'light'].surface : 'transparent',
            borderColor: isActive
              ? Colors[colorScheme ?? 'light'].primary
              : Colors[colorScheme ?? 'light'].border
          }
        ]}
        onPress={() => handleToggleFilter(filter)}
      >
        <Ionicons 
          name={icon as any} 
          size={isMobileView ? 16 : 18} 
          color={isActive 
            ? Colors[colorScheme ?? 'light'].dominicanWhite 
            : Colors[colorScheme ?? 'light'].textSecondary
          } 
        />
        <Text style={[
          isMobileView ? styles.mobileFilterButtonText : styles.sidebarButtonText,
          { 
            color: isActive 
              ? Colors[colorScheme ?? 'light'].dominicanWhite 
              : Colors[colorScheme ?? 'light'].text
          }
        ]}>
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderSortButton = (sort: SortOption, label: string, icon: string) => {
    const isActive = sortBy === sort;
    const isMobileView = !shouldShowSidebar;
    
    return (
      <TouchableOpacity
        key={sort}
        style={[
          isMobileView ? styles.mobileSortButton : styles.sidebarFilterButton,
          { 
            backgroundColor: isActive 
              ? Colors[colorScheme ?? 'light'].primary 
              : isMobileView ? Colors[colorScheme ?? 'light'].surface : 'transparent',
            borderColor: isActive
              ? Colors[colorScheme ?? 'light'].primary
              : Colors[colorScheme ?? 'light'].border
          }
        ]}
        onPress={() => setSortBy(sort)}
      >
        <Ionicons 
          name={icon as any} 
          size={isMobileView ? 16 : 18} 
          color={isActive 
            ? Colors[colorScheme ?? 'light'].dominicanWhite 
            : Colors[colorScheme ?? 'light'].textSecondary
          } 
        />
        <Text style={[
          isMobileView ? styles.mobileFilterButtonText : styles.sidebarButtonText,
          { 
            color: isActive 
              ? Colors[colorScheme ?? 'light'].dominicanWhite 
              : Colors[colorScheme ?? 'light'].text
          }
        ]}>
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  // Determine responsive layout
  const shouldShowSidebar = isDesktop || isWide; // Only show sidebar on desktop and wider
  const shouldShowSideBySide = isDesktop && selectedSaint !== null;
  const shouldUseModal = (isMobile || isTablet) && selectedSaint !== null;
  
  // Determine number of columns based on screen width
  const numColumns = useMemo(() => {
    if (isMobile) return 1;
    if (isTablet) return 2;
    if (isWide) return 4;
    return 3; // desktop
  }, [isMobile, isTablet, isWide]);

  // Calculate card width based on columns and available space
  const getCardWidth = (): '100%' | `${number}%` | undefined => {
    if (numColumns === 1) return '100%';
    // Use fixed percentages for each column configuration
    if (numColumns === 2) return '48%'; // ~50% with gap
    if (numColumns === 3) return '31%'; // ~33% with gap
    if (numColumns === 4) return '23%'; // ~25% with gap
    return undefined;
  };

  return (
    <View style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background, height: '100vh' as any }]}>
      {/* Main Layout - Sidebar + Content */}
      <View style={[
        styles.mainLayout,
        { flexDirection: shouldShowSidebar ? 'row' : 'column' }
      ]}>
        {/* Left Sidebar - Filters (hidden on mobile/tablet) */}
        {shouldShowSidebar && (
          <View style={[styles.sidebar, { 
            backgroundColor: Colors[colorScheme ?? 'light'].surface,
            borderRightColor: Colors[colorScheme ?? 'light'].border,
            width: isTablet ? 220 : 280, // Narrower sidebar on tablet
          }]}>
            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Sidebar Title */}
              <Text style={[styles.sidebarTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
                Filters
              </Text>

            {/* Search Bar */}
            <View style={styles.sidebarSection}>
              <View style={[styles.searchContainer, { 
                backgroundColor: Colors[colorScheme ?? 'light'].background,
                borderColor: Colors[colorScheme ?? 'light'].border 
              }]}>
                <Ionicons name="search" size={18} color={Colors[colorScheme ?? 'light'].textSecondary} />
                <TextInput
                  style={[styles.searchInput, { color: Colors[colorScheme ?? 'light'].text }]}
                  placeholder="Search saints..."
                  placeholderTextColor={Colors[colorScheme ?? 'light'].textMuted}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
              </View>
            </View>

            {/* Results Count */}
            <View style={styles.sidebarSection}>
              <Text style={[styles.resultsCount, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                {filteredAndSortedSaints.length} saints found
              </Text>
            </View>

            {/* Filter by Category */}
            <View style={styles.sidebarSection}>
              <Text style={[styles.sidebarSectionTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
                Categories {activeFilters.length > 0 && `(${activeFilters.length})`}
              </Text>
              {renderFilterButton('dominican', 'Dominican Order', 'book')}
              {renderFilterButton('doctor', 'Doctors of the Church', 'school')}
              {renderFilterButton('martyr', 'Martyrs', 'flame')}
              {renderFilterButton('virgin', 'Virgins', 'heart')}
              {renderFilterButton('founder', 'Founders', 'build')}
            </View>

            {/* Sort by */}
            <View style={styles.sidebarSection}>
              <Text style={[styles.sidebarSectionTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
                Sort by
              </Text>
              {renderSortButton('name', 'Name', 'text')}
              {renderSortButton('feast_day', 'Feast Day', 'calendar')}
              {renderSortButton('birth_year', 'Birth Year', 'person')}
              {renderSortButton('death_year', 'Death Year', 'time')}
            </View>

            {/* Clear All Filters */}
            {(activeFilters.length > 0 || searchQuery !== '') && (
              <TouchableOpacity
                style={[styles.clearButton, { borderColor: Colors[colorScheme ?? 'light'].border }]}
                onPress={handleClearAllFilters}
              >
                <Ionicons name="close-circle" size={16} color={Colors[colorScheme ?? 'light'].textSecondary} />
                <Text style={[styles.clearButtonText, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                  Clear All
                </Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        </View>
        )}

        {/* Main Content Area */}
        <Animated.View 
          style={[
            styles.mainContent,
            {
              width: shouldShowSideBySide 
                ? slideAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['100%', '60%'],
                  })
                : '100%',
              paddingHorizontal: isMobile ? 12 : isTablet ? 16 : 24,
            }
          ]}
        >
          <Text style={[styles.pageTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
            Saints & Blesseds
          </Text>

          {/* Mobile/Tablet Search and Filter (shown when sidebar is hidden) */}
          {!shouldShowSidebar && (
            <>
              {/* Search Bar with Filter Toggle */}
              <View style={[styles.mobileSearchContainer, { 
                backgroundColor: Colors[colorScheme ?? 'light'].surface,
                borderColor: Colors[colorScheme ?? 'light'].border 
              }]}>
                <Ionicons name="search" size={20} color={Colors[colorScheme ?? 'light'].textSecondary} />
                <TextInput
                  style={[styles.mobileSearchInput, { color: Colors[colorScheme ?? 'light'].text }]}
                  placeholder="Search saints by name, patronage, or biography..."
                  placeholderTextColor={Colors[colorScheme ?? 'light'].textMuted}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
                <TouchableOpacity onPress={() => setShowFilters(!showFilters)}>
                  <Ionicons 
                    name="filter" 
                    size={20} 
                    color={showFilters ? Colors[colorScheme ?? 'light'].primary : Colors[colorScheme ?? 'light'].textSecondary} 
                  />
                </TouchableOpacity>
              </View>

              {/* Results Count */}
              <Text style={[styles.mobileResultsCount, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                {filteredAndSortedSaints.length} saints found
              </Text>

              {/* Expandable Filters and Sort */}
              {showFilters && (
                <View style={styles.mobileFiltersContainer}>
                  <View style={styles.mobileFilterSection}>
                    <View style={styles.mobileFilterHeader}>
                      <Text style={[styles.mobileFilterSectionTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
                        Filter by Category {activeFilters.length > 0 && `(${activeFilters.length})`}
                      </Text>
                      {(activeFilters.length > 0 || searchQuery !== '') && (
                        <TouchableOpacity onPress={handleClearAllFilters}>
                          <Text style={[styles.clearAllText, { color: Colors[colorScheme ?? 'light'].primary }]}>
                            Clear All
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>
                    <ScrollView 
                      horizontal 
                      showsHorizontalScrollIndicator={false} 
                      style={styles.mobileFilterScroll}
                      contentContainerStyle={styles.mobileFilterScrollContent}
                    >
                      {renderFilterButton('dominican', 'Dominican', 'book')}
                      {renderFilterButton('doctor', 'Doctors', 'school')}
                      {renderFilterButton('martyr', 'Martyrs', 'flame')}
                      {renderFilterButton('virgin', 'Virgins', 'heart')}
                      {renderFilterButton('founder', 'Founders', 'build')}
                    </ScrollView>
                  </View>

                  <View style={styles.mobileSortSection}>
                    <Text style={[styles.mobileFilterSectionTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
                      Sort by
                    </Text>
                    <ScrollView 
                      horizontal 
                      showsHorizontalScrollIndicator={false} 
                      style={styles.mobileFilterScroll}
                      contentContainerStyle={styles.mobileFilterScrollContent}
                    >
                      {renderSortButton('name', 'Name', 'text')}
                      {renderSortButton('feast_day', 'Feast Day', 'calendar')}
                      {renderSortButton('birth_year', 'Birth Year', 'person')}
                      {renderSortButton('death_year', 'Death Year', 'time')}
                    </ScrollView>
                  </View>
                </View>
              )}
            </>
          )}

          {/* Saints Grid */}
          <FlatList
            key={numColumns} // Force re-render when columns change
            style={{ flex: 1 }}
            data={displayedSaints}
            renderItem={renderSaintCard}
            keyExtractor={(item) => item.id}
            numColumns={numColumns}
            columnWrapperStyle={numColumns > 1 ? styles.row : undefined}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.saintsGrid}
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.5}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Ionicons name="search" size={48} color={Colors[colorScheme ?? 'light'].textMuted} />
                <Text style={[styles.emptyStateText, { color: Colors[colorScheme ?? 'light'].textMuted }]}>
                  No saints found matching your criteria
                </Text>
              </View>
            }
            ListFooterComponent={
              <>
                {displayedCount < filteredAndSortedSaints.length ? (
                  <View style={styles.loadingMore}>
                    <Text style={[styles.loadingMoreText, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                      Showing {displayedCount} of {filteredAndSortedSaints.length} saints
                    </Text>
                  </View>
                ) : filteredAndSortedSaints.length > 0 ? (
                  <View style={styles.loadingMore}>
                    <Text style={[styles.loadingMoreText, { color: Colors[colorScheme ?? 'light'].textMuted }]}>
                      All {filteredAndSortedSaints.length} saints loaded
                    </Text>
                  </View>
                ) : null}
                <View style={styles.footerWrapper}>
                  <Footer />
                </View>
              </>
            }
          />
        </Animated.View>
      </View>

      {/* Saint Detail Panel - Desktop Side Panel */}
      {shouldShowSideBySide && (
        <Animated.View
          style={[
            styles.detailPanelSide,
            {
              width: slideAnimation.interpolate({
                inputRange: [0, 1],
                outputRange: ['0%', '38%'],
              }),
              opacity: slideAnimation,
              transform: [
                {
                  translateX: slideAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [100, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <SaintDetailPanel
            selectedSaint={selectedSaint}
            isVisible={true}
            onClose={closePanel}
            onPrevious={navigateToPrevious}
            onNext={navigateToNext}
            hasPrevious={getCurrentIndex() > 0}
            hasNext={getCurrentIndex() < filteredAndSortedSaints.length - 1}
            slideAnimation={slideAnimation}
          />
        </Animated.View>
      )}

      {/* Saint Detail Panel - Mobile/Tablet Modal */}
      {shouldUseModal && (
        <Modal
          visible={true}
          animationType="slide"
          transparent={true}
          onRequestClose={closePanel}
        >
          <View style={styles.modalOverlay}>
            <Pressable style={styles.modalBackdrop} onPress={closePanel} />
            <View style={[styles.modalContent, { 
              width: isMobile ? '95%' : isTablet ? '85%' : '80%',
              maxWidth: isMobile ? undefined : 700,
            }]}>
              <SaintDetailPanel
                selectedSaint={selectedSaint}
                isVisible={true}
                onClose={closePanel}
                onPrevious={navigateToPrevious}
                onNext={navigateToNext}
                hasPrevious={getCurrentIndex() > 0}
                hasNext={getCurrentIndex() < filteredAndSortedSaints.length - 1}
                slideAnimation={slideAnimation}
              />
            </View>
          </View>
        </Modal>
      )}

      
    </View>
  );
}

const styles = StyleSheet.create({
  // Include all shared styles
  ...CommunityStyles,
  
  // Main layout structure
  mainLayout: {
    flex: 1,
    // flexDirection set dynamically via inline styles (row for desktop, column for mobile/tablet)
  },

  // Sidebar styles
  sidebar: {
    width: 280,
    borderRightWidth: 1,
    paddingVertical: 20,
    paddingHorizontal: 16,
  },

  sidebarTitle: {
    fontSize: 20,
    fontWeight: '700',
    fontFamily: 'Georgia',
    marginBottom: 20,
  },

  sidebarSection: {
    marginBottom: 24,
  },

  sidebarSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Georgia',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  sidebarFilterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 6,
    borderWidth: 1,
  },

  sidebarButtonText: {
    fontSize: 14,
    fontFamily: 'Georgia',
    marginLeft: 8,
    flex: 1,
  },

  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 8,
  },

  clearButtonText: {
    fontSize: 13,
    fontFamily: 'Georgia',
    marginLeft: 6,
  },

  // Main content area
  mainContent: {
    flex: 1,
    paddingTop: 20,
    // paddingHorizontal set dynamically via inline styles based on screen size
  },

  // Enhanced saint cards (width is now dynamic)
  enhancedSaintCard: {
    // width set dynamically via inline styles
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    minHeight: 280,
    cursor: 'pointer' as any,
  },

  colorIndicator: {
    position: 'absolute',
    bottom: -4,
    width: 24,
    height: 3,
    borderRadius: 2,
  },

  patronageRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 8,
    marginBottom: 8,
    gap: 6,
  },

  bioPreview: {
    fontSize: 12,
    fontFamily: 'Georgia',
    lineHeight: 16,
    marginTop: 8,
  },

  // Override result count for sidebar
  resultsCount: {
    fontSize: 13,
    fontFamily: 'Georgia',
    textAlign: 'left',
  },

  // Override search container for sidebar
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },

  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    fontFamily: 'Georgia',
  },

  footerWrapper: {
    position: 'relative' as any,
    left: -24,
    width: '100vw' as any,
    maxWidth: '100vw' as any,
  },

  loadingMore: {
    paddingVertical: 20,
    alignItems: 'center',
  },

  loadingMoreText: {
    fontSize: 14,
    fontFamily: 'Georgia',
    textAlign: 'center',
  },

  saintsGrid: {
    paddingBottom: 20,
  },

  row: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },

  // Mobile/Tablet search and filters
  mobileSearchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 12,
  },

  mobileSearchInput: {
    flex: 1,
    marginLeft: 8,
    marginRight: 8,
    fontSize: 15,
    fontFamily: 'Georgia',
  },

  mobileResultsCount: {
    fontSize: 13,
    fontFamily: 'Georgia',
    marginBottom: 12,
  },

  mobileFiltersContainer: {
    marginBottom: 16,
  },

  mobileFilterSection: {
    marginBottom: 16,
  },

  mobileSortSection: {
    marginBottom: 8,
  },

  mobileFilterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },

  mobileFilterSectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    fontFamily: 'Georgia',
  },

  clearAllText: {
    fontSize: 13,
    fontWeight: '600',
    fontFamily: 'Georgia',
  },

  mobileFilterScroll: {
    marginBottom: 0,
  },

  mobileFilterScrollContent: {
    paddingRight: 16,
  },

  mobileFilterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
  },

  mobileSortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
  },

  mobileFilterButtonText: {
    fontSize: 13,
    fontFamily: 'Georgia',
    marginLeft: 6,
  },

  // Modal styles for saint detail panel
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },

  modalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },

  modalContent: {
    maxHeight: '90%',
    borderRadius: 20,
    overflow: 'hidden',
  },

  // Desktop side panel
  detailPanelSide: {
    overflow: 'hidden',
    position: 'sticky' as any,
    top: 0,
    alignSelf: 'flex-start',
    maxHeight: '100vh' as any,
  },
});
