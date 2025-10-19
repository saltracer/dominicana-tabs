import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  FlatList,
  Dimensions,
  Animated,
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
type FilterOption = 'all' | 'dominican' | 'doctor' | 'martyr' | 'virgin' | 'founder';

export default function SaintsScreen() {
  const { colorScheme } = useTheme();
  const { liturgicalDay } = useCalendar();
  const isWeb = true;
  const platformStyles = getPlatformStyles(isWeb);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('name');
  const [filterBy, setFilterBy] = useState<FilterOption>('all');
  const [selectedSaint, setSelectedSaint] = useState<Saint | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 24; // More items per page for web
  const slideAnimation = useRef(new Animated.Value(0)).current;
  const { width: screenWidth } = Dimensions.get('window');

  const filteredAndSortedSaints = useMemo(() => {
    let filtered = allSaints.filter(saint => {
      // Search filter
      const matchesSearch = searchQuery === '' || 
        saint.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        saint.patronage?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        saint.short_bio?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        saint.biography?.some(bio => bio.toLowerCase().includes(searchQuery.toLowerCase()));

      // Category filter
      const matchesFilter = filterBy === 'all' || 
        (filterBy === 'dominican' && saint.is_dominican) ||
        (filterBy === 'doctor' && saint.is_doctor) ||
        (filterBy === 'martyr' && saint.rank === CelebrationRank.MEMORIAL && saint.color?.toLowerCase() === 'red') ||
        (filterBy === 'virgin' && saint.name.toLowerCase().includes('virgin')) ||
        (filterBy === 'founder' && (saint.patronage?.toLowerCase().includes('founder') || saint.short_bio?.toLowerCase().includes('founder')));

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
  }, [searchQuery, sortBy, filterBy]);

  const paginatedSaints = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredAndSortedSaints.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredAndSortedSaints, currentPage]);

  const totalPages = Math.ceil(filteredAndSortedSaints.length / itemsPerPage);

  const handleSaintPress = (saint: Saint) => {
    if (selectedSaint === null) {
      // First time opening panel - animate in
      setSelectedSaint(saint);
      Animated.timing(slideAnimation, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
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
      useNativeDriver: true,
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
    return (
      <TouchableOpacity
        style={[
          styles.enhancedSaintCard, 
          { 
            backgroundColor: Colors[colorScheme ?? 'light'].card,
            borderWidth: isSelected ? 2 : 1,
            borderColor: isSelected ? Colors[colorScheme ?? 'light'].primary : Colors[colorScheme ?? 'light'].border,
          }
        ]}
        onPress={() => handleSaintPress(saint)}
      >
        <View style={styles.saintHeader}>
          {/* Doctor badge - top left */}
          {saint.is_doctor && (
            <View style={[styles.doctorBadge, styles.topLeftBadge, { backgroundColor: Colors[colorScheme ?? 'light'].accent }]}>
              <Text style={[styles.badgeText, { color: Colors[colorScheme ?? 'light'].dominicanWhite }]}>
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
            size={48} 
            color={Colors[colorScheme ?? 'light'].primary} 
          />

          {/* Liturgical color indicator */}
          {saint.color && (
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

        {/* Birth-Death Years */}
        {saint.birth_year && saint.death_year && (
          <Text style={[styles.saintYears, { color: Colors[colorScheme ?? 'light'].textMuted }]}>
            {saint.birth_year} - {saint.death_year}
          </Text>
        )}

        {/* Patronage with icon */}
        {saint.patronage && (
          <View style={styles.patronageRow}>
            <Ionicons name="ribbon" size={12} color={Colors[colorScheme ?? 'light'].primary} />
            <Text style={[styles.saintPatronage, { color: Colors[colorScheme ?? 'light'].textSecondary }]} numberOfLines={2}>
              {saint.patronage.split(',').slice(0, 2).join(', ')}
            </Text>
          </View>
        )}

        {/* Short bio preview */}
        {saint.short_bio && (
          <Text style={[styles.bioPreview, { color: Colors[colorScheme ?? 'light'].textMuted }]} numberOfLines={3}>
            {saint.short_bio}
          </Text>
        )}
      </TouchableOpacity>
    );
  };

  const renderFilterButton = (filter: FilterOption, label: string, icon: string) => (
    <TouchableOpacity
      key={filter}
      style={[
        styles.sidebarFilterButton,
        { 
          backgroundColor: filterBy === filter 
            ? Colors[colorScheme ?? 'light'].primary 
            : 'transparent',
          borderColor: filterBy === filter
            ? Colors[colorScheme ?? 'light'].primary
            : Colors[colorScheme ?? 'light'].border
        }
      ]}
      onPress={() => setFilterBy(filter)}
    >
      <Ionicons 
        name={icon as any} 
        size={18} 
        color={filterBy === filter 
          ? Colors[colorScheme ?? 'light'].dominicanWhite 
          : Colors[colorScheme ?? 'light'].textSecondary
        } 
      />
      <Text style={[
        styles.sidebarButtonText,
        { 
          color: filterBy === filter 
            ? Colors[colorScheme ?? 'light'].dominicanWhite 
            : Colors[colorScheme ?? 'light'].text
        }
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  const renderSortButton = (sort: SortOption, label: string, icon: string) => (
    <TouchableOpacity
      key={sort}
      style={[
        styles.sidebarFilterButton,
        { 
          backgroundColor: sortBy === sort 
            ? Colors[colorScheme ?? 'light'].primary 
            : 'transparent',
          borderColor: sortBy === sort
            ? Colors[colorScheme ?? 'light'].primary
            : Colors[colorScheme ?? 'light'].border
        }
      ]}
      onPress={() => setSortBy(sort)}
    >
      <Ionicons 
        name={icon as any} 
        size={18} 
        color={sortBy === sort 
          ? Colors[colorScheme ?? 'light'].dominicanWhite 
          : Colors[colorScheme ?? 'light'].textSecondary
        } 
      />
      <Text style={[
        styles.sidebarButtonText,
        { 
          color: sortBy === sort 
            ? Colors[colorScheme ?? 'light'].dominicanWhite 
            : Colors[colorScheme ?? 'light'].text
        }
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
      {/* Main Layout - Sidebar + Content */}
      <View style={styles.mainLayout}>
        {/* Left Sidebar - Filters */}
        <View style={[styles.sidebar, { 
          backgroundColor: Colors[colorScheme ?? 'light'].surface,
          borderRightColor: Colors[colorScheme ?? 'light'].border 
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
                Category
              </Text>
              {renderFilterButton('all', 'All Saints', 'list')}
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

            {/* Clear Filters */}
            {(filterBy !== 'all' || searchQuery !== '') && (
              <TouchableOpacity
                style={[styles.clearButton, { borderColor: Colors[colorScheme ?? 'light'].border }]}
                onPress={() => {
                  setFilterBy('all');
                  setSearchQuery('');
                }}
              >
                <Ionicons name="close-circle" size={16} color={Colors[colorScheme ?? 'light'].textSecondary} />
                <Text style={[styles.clearButtonText, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                  Clear Filters
                </Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        </View>

        {/* Main Content Area */}
        <Animated.View 
          style={[
            styles.mainContent,
            {
              width: slideAnimation.interpolate({
                inputRange: [0, 1],
                outputRange: ['100%', `${100 - (Math.min(500, screenWidth * 0.45) / screenWidth * 100)}%`],
              }),
            }
          ]}
        >
          <Text style={[styles.pageTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
            Saints & Blesseds
          </Text>

          {/* Saints Grid */}
          <FlatList
            data={paginatedSaints}
            renderItem={renderSaintCard}
            keyExtractor={(item) => item.id}
            numColumns={3} // 3 columns for better card sizing
            columnWrapperStyle={styles.row}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[styles.saintsGrid, { flexGrow: 1 }]}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Ionicons name="search" size={48} color={Colors[colorScheme ?? 'light'].textMuted} />
                <Text style={[styles.emptyStateText, { color: Colors[colorScheme ?? 'light'].textMuted }]}>
                  No saints found matching your criteria
                </Text>
              </View>
            }
          />

        {/* Pagination */}
        {totalPages > 1 && (
          <View style={styles.pagination}>
            <TouchableOpacity
              style={[
                styles.paginationButton,
                { 
                  backgroundColor: currentPage === 1 
                    ? Colors[colorScheme ?? 'light'].border 
                    : Colors[colorScheme ?? 'light'].primary,
                  borderColor: Colors[colorScheme ?? 'light'].border
                }
              ]}
              onPress={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
            >
              <Ionicons 
                name="chevron-back" 
                size={20} 
                color={currentPage === 1 
                  ? Colors[colorScheme ?? 'light'].textMuted 
                  : Colors[colorScheme ?? 'light'].dominicanWhite
                } 
              />
            </TouchableOpacity>
            
            <Text style={[styles.paginationText, { color: Colors[colorScheme ?? 'light'].text }]}>
              {currentPage} of {totalPages}
            </Text>
            
            <TouchableOpacity
              style={[
                styles.paginationButton,
                { 
                  backgroundColor: currentPage === totalPages 
                    ? Colors[colorScheme ?? 'light'].border 
                    : Colors[colorScheme ?? 'light'].primary,
                  borderColor: Colors[colorScheme ?? 'light'].border
                }
              ]}
              onPress={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
            >
              <Ionicons 
                name="chevron-forward" 
                size={20} 
                color={currentPage === totalPages 
                  ? Colors[colorScheme ?? 'light'].textMuted 
                  : Colors[colorScheme ?? 'light'].dominicanWhite
                } 
              />
            </TouchableOpacity>
          </View>
        )}

          {/* Footer - After pagination */}
          <View style={styles.footerWrapper}>
            <Footer />
          </View>
        </Animated.View>
      </View>

      {/* Saint Detail Panel */}
      <SaintDetailPanel
        selectedSaint={selectedSaint}
        isVisible={selectedSaint !== null}
        onClose={closePanel}
        onPrevious={navigateToPrevious}
        onNext={navigateToNext}
        hasPrevious={getCurrentIndex() > 0}
        hasNext={getCurrentIndex() < filteredAndSortedSaints.length - 1}
        slideAnimation={slideAnimation}
      />
      
    </View>
  );
}

const styles = StyleSheet.create({
  // Include all shared styles
  ...CommunityStyles,
  
  // Main layout structure
  mainLayout: {
    flex: 1,
    flexDirection: 'row',
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
    paddingHorizontal: 24,
    paddingTop: 20,
  },

  // Enhanced saint cards
  enhancedSaintCard: {
    width: '31%',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    minHeight: 280,
    cursor: 'pointer' as any,
    transition: 'all 0.2s ease' as any,
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
});
