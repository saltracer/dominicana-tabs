import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  FlatList,
  Dimensions,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../../constants/Colors';
import { useTheme } from '../../../components/ThemeProvider';
import { useCalendar } from '../../../components/CalendarContext';
import FeastBanner from '../../../components/FeastBanner';
import CommunityNavigation from '../../../components/CommunityNavigation';
import { allSaints } from '../../../assets/data/calendar/saints';
import { Saint } from '../../../types/saint-types';
import { CelebrationRank } from '../../../types/celebrations-types';
import { CommunityStyles, getPlatformStyles } from '../../../styles';

type SortOption = 'name' | 'feast_day' | 'birth_year' | 'death_year';
type FilterOption = 'dominican' | 'doctor' | 'martyr' | 'virgin' | 'founder';
type RankFilter = 'solemnity' | 'feast' | 'memorial' | 'optional_memorial';
type EraFilter = 'ancient' | 'medieval' | 'modern' | 'contemporary';

export default function SaintsScreen() {
  const { colorScheme } = useTheme();
  const { liturgicalDay } = useCalendar();
  const isWeb = Platform.OS === 'web';
  const platformStyles = getPlatformStyles(isWeb);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [activeFilters, setActiveFilters] = useState<FilterOption[]>([]);
  const [activeRankFilters, setActiveRankFilters] = useState<RankFilter[]>([]);
  const [activeEraFilters, setActiveEraFilters] = useState<EraFilter[]>([]);
  const [selectedSaint, setSelectedSaint] = useState<Saint | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [displayedCount, setDisplayedCount] = useState(20);
  const itemsPerPage = 20;

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

      // Rank filter - if no rank filters active, show all ranks
      // If rank filters are active, saint must match at least one rank (OR logic within ranks)
      const matchesRank = activeRankFilters.length === 0 || activeRankFilters.some(rankFilter => {
        switch (rankFilter) {
          case 'solemnity':
            return saint.rank === CelebrationRank.SOLEMNITY;
          case 'feast':
            return saint.rank === CelebrationRank.FEAST;
          case 'memorial':
            return saint.rank === CelebrationRank.MEMORIAL;
          case 'optional_memorial':
            return saint.rank === CelebrationRank.OPTIONAL_MEMORIAL;
          default:
            return false;
        }
      });

      // Era filter - if no era filters active, show all eras
      // If era filters are active, saint must match at least one era (OR logic within eras)
      const matchesEra = activeEraFilters.length === 0 || activeEraFilters.some(eraFilter => {
        // Use death_year as primary, fall back to birth_year if available
        const year = saint.death_year || saint.birth_year;
        if (!year) return false;

        switch (eraFilter) {
          case 'ancient':
            return year < 500;
          case 'medieval':
            return year >= 500 && year < 1500;
          case 'modern':
            return year >= 1500 && year < 1800;
          case 'contemporary':
            return year >= 1800;
          default:
            return false;
        }
      });

      return matchesSearch && matchesFilter && matchesRank && matchesEra;
    });

    // Sort
    filtered.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'feast_day':
          comparison = a.feast_day.localeCompare(b.feast_day);
          break;
        case 'birth_year':
          comparison = (a.birth_year || 0) - (b.birth_year || 0);
          break;
        case 'death_year':
          comparison = (a.death_year || 0) - (b.death_year || 0);
          break;
        default:
          return 0;
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [searchQuery, sortBy, sortDirection, activeFilters, activeRankFilters, activeEraFilters]);

  const displayedSaints = useMemo(() => {
    return filteredAndSortedSaints.slice(0, displayedCount);
  }, [filteredAndSortedSaints, displayedCount]);

  // Reset displayed count when filters/search/sort changes
  useEffect(() => {
    setDisplayedCount(20);
  }, [searchQuery, sortBy, activeFilters, activeRankFilters, activeEraFilters]);

  const handleLoadMore = () => {
    if (displayedCount < filteredAndSortedSaints.length) {
      setDisplayedCount(prev => prev + itemsPerPage);
    }
  };

  const handleSaintPress = (saint: Saint) => {
    setSelectedSaint(saint);
  };

  const closeModal = () => {
    setSelectedSaint(null);
  };

  const handleToggleFilter = (filter: FilterOption) => {
    setActiveFilters(prev => 
      prev.includes(filter) 
        ? prev.filter(f => f !== filter) 
        : [...prev, filter]
    );
  };

  const handleToggleRankFilter = (filter: RankFilter) => {
    setActiveRankFilters(prev => 
      prev.includes(filter) 
        ? prev.filter(f => f !== filter) 
        : [...prev, filter]
    );
  };

  const handleToggleEraFilter = (filter: EraFilter) => {
    setActiveEraFilters(prev => 
      prev.includes(filter) 
        ? prev.filter(f => f !== filter) 
        : [...prev, filter]
    );
  };

  const handleClearAllFilters = () => {
    setActiveFilters([]);
    setActiveRankFilters([]);
    setActiveEraFilters([]);
    setSearchQuery('');
  };

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
        return '#DC2626'; // Red for martyrs
      case 'white':
        return '#F3F4F6'; // White for non-martyrs
      case 'green':
        return '#059669'; // Green for ordinary time
      case 'purple':
        return '#7C3AED'; // Purple for penitential seasons
      case 'rose':
        return '#EC4899'; // Rose for Gaudete/Laetare Sunday
      case 'gold':
        return '#D97706'; // Gold for special celebrations
      default:
        return Colors[colorScheme ?? 'light'].textSecondary;
    }
  };



  if (!liturgicalDay) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]} edges={['left', 'right']}>
        <CommunityNavigation activeTab="saints" />
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: Colors[colorScheme ?? 'light'].text }]}>
            Loading liturgical information...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const renderSaintCard = ({ item: saint }: { item: Saint }) => (
    <TouchableOpacity
      style={[platformStyles.saintCard, { backgroundColor: Colors[colorScheme ?? 'light'].card }]}
      onPress={() => handleSaintPress(saint)}
    >
      <View style={styles.saintHeader}>
        {/* Rank badge with liturgical color - top left */}
        {saint.rank && (
          <View style={[styles.rankBadge, styles.topLeftBadge, { 
            backgroundColor: saint.color ? getLiturgicalColor(saint.color) : getRankColor(saint.rank),
            borderWidth: saint.color?.toLowerCase() === 'white' ? 1 : 0,
            borderColor: Colors[colorScheme ?? 'light'].border,
          }]}>
            <Text style={[styles.badgeText, { 
              color: saint.color?.toLowerCase() === 'white' ? 'black' : Colors[colorScheme ?? 'light'].dominicanWhite 
            }]}>
              {saint.rank.split(' ')[0]}
            </Text>
          </View>
        )}
        
        {/* Doctor and Dominican badges - top right (stacked) */}
        <View style={[styles.topRightBadgeContainer]}>
          {saint.is_doctor && (
            <View style={[styles.doctorBadge, { backgroundColor: Colors[colorScheme ?? 'light'].accent }]}>
              <Text style={[styles.badgeText, { color: 'black' }]}>
                Doctor
              </Text>
            </View>
          )}
          {saint.is_dominican && (
            <View style={[styles.dominicanBadge, { 
              backgroundColor: Colors[colorScheme ?? 'light'].text,
            }]}>
              <Text style={[styles.badgeText, { color: Colors[colorScheme ?? 'light'].background }]}>
                OP
              </Text>
            </View>
          )}
        </View>
        
        <Ionicons 
          name="person-circle" 
          size={40} 
          color={Colors[colorScheme ?? 'light'].primary} 
        />
      </View>
      <Text style={[styles.saintName, { color: Colors[colorScheme ?? 'light'].text }]} numberOfLines={2}>
        {saint.name}
      </Text>
      <Text style={[styles.saintFeastDay, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
        {formatFeastDay(saint.feast_day)}
      </Text>

      {saint.patronage && (
        <Text style={[styles.saintPatronage, { color: Colors[colorScheme ?? 'light'].textMuted }]} numberOfLines={2}>
          {saint.patronage.split(',').slice(0, 2).join(', ')}
        </Text>
      )}
      {saint.birth_year && saint.death_year && (
        <Text style={[styles.saintYears, { color: Colors[colorScheme ?? 'light'].textMuted }]}>
          {saint.birth_year} - {saint.death_year}
        </Text>
      )}
    </TouchableOpacity>
  );

  const renderFilterButton = (filter: FilterOption, label: string, icon: string) => {
    const isActive = activeFilters.includes(filter);
    
    return (
      <TouchableOpacity
        key={filter}
        style={[
          styles.filterButton,
          { 
            backgroundColor: isActive 
              ? Colors[colorScheme ?? 'light'].primary 
              : Colors[colorScheme ?? 'light'].surface,
            borderColor: Colors[colorScheme ?? 'light'].border
          }
        ]}
        onPress={() => handleToggleFilter(filter)}
      >
        <Ionicons 
          name={icon as any} 
          size={16} 
          color={isActive 
            ? Colors[colorScheme ?? 'light'].dominicanWhite 
            : Colors[colorScheme ?? 'light'].textSecondary
          } 
        />
        <Text style={[
          styles.filterButtonText,
          { 
            color: isActive 
              ? Colors[colorScheme ?? 'light'].dominicanWhite 
              : Colors[colorScheme ?? 'light'].textSecondary
          }
        ]}>
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  const handleSortPress = (sort: SortOption) => {
    if (sortBy === sort) {
      // Toggle direction if clicking the same sort option
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      // Change sort option and reset to ascending
      setSortBy(sort);
      setSortDirection('asc');
    }
  };

  const renderSortButton = (sort: SortOption, label: string, icon: string) => {
    const isActive = sortBy === sort;
    
    return (
      <TouchableOpacity
        key={sort}
        style={[
          styles.sortButton,
          { 
            backgroundColor: isActive 
              ? Colors[colorScheme ?? 'light'].primary 
              : Colors[colorScheme ?? 'light'].surface,
            borderColor: Colors[colorScheme ?? 'light'].border
          }
        ]}
        onPress={() => handleSortPress(sort)}
      >
        <Ionicons 
          name={icon as any} 
          size={16} 
          color={isActive 
            ? Colors[colorScheme ?? 'light'].dominicanWhite 
            : Colors[colorScheme ?? 'light'].textSecondary
          } 
        />
        <Text style={[
          styles.sortButtonText,
          { 
            color: isActive 
              ? Colors[colorScheme ?? 'light'].dominicanWhite 
              : Colors[colorScheme ?? 'light'].textSecondary
          }
        ]}>
          {label}
        </Text>
        {isActive && (
          <Ionicons 
            name={sortDirection === 'asc' ? 'arrow-up' : 'arrow-down'} 
            size={14} 
            color={Colors[colorScheme ?? 'light'].dominicanWhite}
            style={{ marginLeft: 4 }}
          />
        )}
      </TouchableOpacity>
    );
  };

  const renderRankFilterButton = (filter: RankFilter, label: string, icon: string) => {
    const isActive = activeRankFilters.includes(filter);
    
    return (
      <TouchableOpacity
        key={filter}
        style={[
          styles.filterButton,
          { 
            backgroundColor: isActive 
              ? Colors[colorScheme ?? 'light'].secondary 
              : Colors[colorScheme ?? 'light'].surface,
            borderColor: Colors[colorScheme ?? 'light'].border
          }
        ]}
        onPress={() => handleToggleRankFilter(filter)}
      >
        <Ionicons 
          name={icon as any} 
          size={16} 
          color={isActive 
            ? Colors[colorScheme ?? 'light'].dominicanWhite 
            : Colors[colorScheme ?? 'light'].textSecondary
          } 
        />
        <Text style={[
          styles.filterButtonText,
          { 
            color: isActive 
              ? Colors[colorScheme ?? 'light'].dominicanWhite 
              : Colors[colorScheme ?? 'light'].textSecondary
          }
        ]}>
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderEraFilterButton = (filter: EraFilter, label: string, icon: string) => {
    const isActive = activeEraFilters.includes(filter);
    
    return (
      <TouchableOpacity
        key={filter}
        style={[
          styles.filterButton,
          { 
            backgroundColor: isActive 
              ? '#8B7355' 
              : Colors[colorScheme ?? 'light'].surface,
            borderColor: Colors[colorScheme ?? 'light'].border
          }
        ]}
        onPress={() => handleToggleEraFilter(filter)}
      >
        <Ionicons 
          name={icon as any} 
          size={16} 
          color={isActive 
            ? Colors[colorScheme ?? 'light'].dominicanWhite 
            : Colors[colorScheme ?? 'light'].textSecondary
          } 
        />
        <Text style={[
          styles.filterButtonText,
          { 
            color: isActive 
              ? Colors[colorScheme ?? 'light'].dominicanWhite 
              : Colors[colorScheme ?? 'light'].textSecondary
          }
        ]}>
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]} edges={['left', 'right']}>
      <CommunityNavigation activeTab="saints" />
      
      <View style={[platformStyles.tabContent, { flex: 1 }]}>
        {/* Search Bar */}
        <View style={[styles.searchContainer, { backgroundColor: Colors[colorScheme ?? 'light'].surface, borderColor: Colors[colorScheme ?? 'light'].border, marginTop: 0 }]}>
          <Ionicons name="search" size={20} color={Colors[colorScheme ?? 'light'].textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: Colors[colorScheme ?? 'light'].text }]}
            placeholder="Search saints by name, patronage, or biography..."
            placeholderTextColor={Colors[colorScheme ?? 'light'].textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <TouchableOpacity onPress={() => setShowFilters(!showFilters)}>
            <Ionicons 
              name="filter" 
              size={20} 
              color={Colors[colorScheme ?? 'light'].textSecondary} 
            />
          </TouchableOpacity>
        </View>

        {/* Results Count */}
        <Text style={[styles.resultsCount, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
          {filteredAndSortedSaints.length} saints found
        </Text>

        {/* Filters and Sort */}
        {showFilters && (
          <View style={styles.filtersContainer}>
            <View style={styles.filterSection}>
              <View style={styles.filterHeader}>
                <Text style={[styles.filterSectionTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
                  Filter by Category {activeFilters.length > 0 && `(${activeFilters.length})`}
                </Text>
                {(activeFilters.length > 0 || activeRankFilters.length > 0 || activeEraFilters.length > 0 || searchQuery !== '') && (
                  <TouchableOpacity onPress={handleClearAllFilters}>
                    <Text style={[styles.clearAllText, { color: Colors[colorScheme ?? 'light'].primary }]}>
                      Clear All
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
                {renderFilterButton('dominican', 'Dominican', 'book')}
                {renderFilterButton('doctor', 'Doctors', 'school')}
                {renderFilterButton('martyr', 'Martyrs', 'flame')}
                {renderFilterButton('virgin', 'Virgins', 'heart')}
                {renderFilterButton('founder', 'Founders', 'build')}
              </ScrollView>
            </View>

            <View style={styles.filterSection}>
              <Text style={[styles.filterSectionTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
                Celebration Rank {activeRankFilters.length > 0 && `(${activeRankFilters.length})`}
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
                {renderRankFilterButton('solemnity', 'Solemnity', 'star')}
                {renderRankFilterButton('feast', 'Feast', 'sunny')}
                {renderRankFilterButton('memorial', 'Memorial', 'bookmark')}
                {renderRankFilterButton('optional_memorial', 'Optional', 'bookmark-outline')}
              </ScrollView>
            </View>

            <View style={styles.filterSection}>
              <Text style={[styles.filterSectionTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
                Historical Era {activeEraFilters.length > 0 && `(${activeEraFilters.length})`}
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
                {renderEraFilterButton('ancient', 'Ancient', 'hourglass')}
                {renderEraFilterButton('medieval', 'Medieval', 'shield')}
                {renderEraFilterButton('modern', 'Modern', 'library')}
                {renderEraFilterButton('contemporary', 'Contemporary', 'newspaper')}
              </ScrollView>
            </View>

            <View style={styles.sortSection}>
              <Text style={[styles.filterSectionTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
                Sort by
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.sortScroll}>
                {renderSortButton('name', 'Name', 'text')}
                {renderSortButton('feast_day', 'Feast Day', 'calendar')}
                {renderSortButton('birth_year', 'Birth Year', 'person')}
                {renderSortButton('death_year', 'Death Year', 'time')}
              </ScrollView>
            </View>
          </View>
        )}

        {/* Saints Grid */}
        <FlatList
          data={displayedSaints}
          renderItem={renderSaintCard}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.gridRow}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.gridContainer}
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
            displayedCount < filteredAndSortedSaints.length ? (
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
            ) : null
          }
        />
      </View>

      {/* Saint Detail Modal */}
      <Modal
        visible={selectedSaint !== null}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={closeModal}
      >
        {selectedSaint && (
          <SafeAreaView style={[styles.modalContainer, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
            <View style={[styles.modalHeader, { borderBottomColor: Colors[colorScheme ?? 'light'].border }]}>
              <TouchableOpacity onPress={closeModal} style={styles.closeButton}>
                <Ionicons name="close" size={24} color={Colors[colorScheme ?? 'light'].text} />
              </TouchableOpacity>
              <Text style={[styles.modalTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
                {selectedSaint.name}
              </Text>
              <View style={styles.placeholder} />
            </View>
            
            <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
              <View style={styles.saintDetailHeader}>
                <Ionicons 
                  name="person-circle" 
                  size={80} 
                  color={Colors[colorScheme ?? 'light'].primary} 
                />
                <View style={styles.saintDetailInfo}>
                  <Text style={[styles.saintDetailName, { color: Colors[colorScheme ?? 'light'].text }]}>
                    {selectedSaint.name}
                  </Text>
                  <Text style={[styles.saintDetailFeast, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                    Feast Day: {formatFeastDay(selectedSaint.feast_day)}
                  </Text>
                  {selectedSaint.birth_year && selectedSaint.death_year && (
                    <Text style={[styles.saintDetailYears, { color: Colors[colorScheme ?? 'light'].textMuted }]}>
                      {selectedSaint.birth_year} - {selectedSaint.death_year}
                    </Text>
                  )}
                  
                  {/* All badges under the date */}
                  <View style={styles.dateBadgesContainer}>
                    {selectedSaint.rank && (
                      <View style={[
                        styles.rankBadge, 
                        { 
                          backgroundColor: selectedSaint.color ? getLiturgicalColor(selectedSaint.color) : getRankColor(selectedSaint.rank),
                          borderWidth: selectedSaint.color?.toLowerCase() === 'white' ? 1 : 0,
                          borderColor: Colors[colorScheme ?? 'light'].border,
                        }
                      ]}>
                        <Text style={[
                          styles.badgeText, 
                          { 
                            color: selectedSaint.color?.toLowerCase() === 'white' 
                              ? 'black' 
                              : 'white' 
                          }
                        ]}>
                          {selectedSaint.rank.split(' ')[0]}
                        </Text>
                      </View>
                    )}
                    {selectedSaint.is_doctor && (
                      <View style={[styles.doctorBadge, { backgroundColor: Colors[colorScheme ?? 'light'].accent }]}>
                        <Text style={[styles.badgeText, { color: 'black' }]}>
                          Doctor
                        </Text>
                      </View>
                    )}
                    {selectedSaint.is_dominican && (
                      <View style={[styles.dominicanBadge, { backgroundColor: Colors[colorScheme ?? 'light'].text }]}>
                        <Text style={[styles.badgeText, { color: Colors[colorScheme ?? 'light'].background }]}>
                          OP
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              </View>

              {selectedSaint.short_bio && (
                <View style={styles.section}>
                  <Text style={[styles.sectionTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
                    Biography
                  </Text>
                  <Text style={[styles.sectionContent, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                    {selectedSaint.short_bio}
                  </Text>
                </View>
              )}

              {selectedSaint.patronage && (
                <View style={styles.section}>
                  <Text style={[styles.sectionTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
                    Patronage
                  </Text>
                  <Text style={[styles.sectionContent, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                    {selectedSaint.patronage}
                  </Text>
                </View>
              )}

              {selectedSaint.biography && selectedSaint.biography.length > 0 && (
                <View style={styles.section}>
                  <Text style={[styles.sectionTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
                    Detailed Biography
                  </Text>
                  {selectedSaint.biography.map((paragraph, index) => (
                    <Text key={index} style={[
                      styles.sectionContent, 
                      styles.biographyParagraph,
                      { color: Colors[colorScheme ?? 'light'].textSecondary }
                    ]}>
                      {paragraph}
                    </Text>
                  ))}
                </View>
              )}

              {selectedSaint.prayers && (
                <View style={styles.section}>
                  <Text style={[styles.sectionTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
                    Prayer
                  </Text>
                  <Text style={[styles.sectionContent, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                    {selectedSaint.prayers}
                  </Text>
                </View>
              )}

              {selectedSaint.quotes && selectedSaint.quotes.length > 0 && (
                <View style={styles.section}>
                  <Text style={[styles.sectionTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
                    Quotes
                  </Text>
                  {selectedSaint.quotes.map((quote, index) => (
                    <View key={index} style={[styles.quoteContainer, { backgroundColor: Colors[colorScheme ?? 'light'].surface }]}>
                      <Text style={[styles.quoteText, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                        "{quote}"
                      </Text>
                    </View>
                  ))}
                </View>
              )}

              {selectedSaint.books && selectedSaint.books.length > 0 && (
                <View style={styles.section}>
                  <Text style={[styles.sectionTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
                    Writings & Books
                  </Text>
                  {selectedSaint.books.map((book: string, index: number) => (
                    <View key={index} style={[styles.bookContainer, { backgroundColor: Colors[colorScheme ?? 'light'].surface }]}>
                      <Text style={[styles.bookTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
                        {book.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                      </Text>
                    </View>
                  ))}
                </View>
              )}

              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
                  Additional Information
                </Text>
                <View style={styles.infoGrid}>
                  {selectedSaint.birth_place && (
                    <View style={styles.infoItem}>
                      <Text style={[styles.infoLabel, { color: Colors[colorScheme ?? 'light'].textMuted }]}>
                        Birth Place
                      </Text>
                      <Text style={[styles.infoValue, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                        {selectedSaint.birth_place}
                      </Text>
                    </View>
                  )}
                  {selectedSaint.death_place && (
                    <View style={styles.infoItem}>
                      <Text style={[styles.infoLabel, { color: Colors[colorScheme ?? 'light'].textMuted }]}>
                        Death Place
                      </Text>
                      <Text style={[styles.infoValue, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                        {selectedSaint.death_place}
                      </Text>
                    </View>
                  )}
                  {selectedSaint.canonization_date && (
                    <View style={styles.infoItem}>
                      <Text style={[styles.infoLabel, { color: Colors[colorScheme ?? 'light'].textMuted }]}>
                        Canonized
                      </Text>
                      <Text style={[styles.infoValue, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                        {selectedSaint.canonization_date}
                      </Text>
                    </View>
                  )}
                  {selectedSaint.rank && (
                    <View style={styles.infoItem}>
                      <Text style={[styles.infoLabel, { color: Colors[colorScheme ?? 'light'].textMuted }]}>
                        Rank
                      </Text>
                      <Text style={[styles.infoValue, { color: getRankColor(selectedSaint.rank) }]}>
                        {selectedSaint.rank.replace('_', ' ').toUpperCase()}
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            </ScrollView>
          </SafeAreaView>
        )}
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // Include all shared styles
  ...CommunityStyles,
  
  // Add/override with unique local styles for modal content
  modalContent: {
    flex: 1,
    paddingHorizontal: 16,
  },
  filterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  clearAllText: {
    fontSize: 13,
    fontWeight: '600',
    fontFamily: 'Georgia',
  },
  topRightBadgeContainer: {
    position: 'absolute',
    top: 4,
    right: 4,
    flexDirection: 'column', // Stack vertically on native (always smaller cards)
    alignItems: 'flex-end', // Align to right edge
    gap: 4,
    zIndex: 1,
  },
  rankBadge: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
  },
  saintDetailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    marginBottom: 20,
  },
  saintDetailInfo: {
    flex: 1,
    marginLeft: 16,
  },
  saintDetailName: {
    fontSize: 24,
    fontWeight: '700',
    fontFamily: 'Georgia',
    marginBottom: 4,
  },
  saintDetailFeast: {
    fontSize: 16,
    fontFamily: 'Georgia',
    marginBottom: 4,
  },
  saintDetailYears: {
    fontSize: 14,
    fontFamily: 'Georgia',
    marginBottom: 8,
  },
  dateBadgesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
    gap: 6,
  },
  section: {
    marginBottom: 24,
  },
  sectionContent: {
    fontSize: 16,
    fontFamily: 'Georgia',
    lineHeight: 24,
  },
  biographyParagraph: {
    marginBottom: 12,
  },
  quoteContainer: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  quoteText: {
    fontSize: 16,
    fontFamily: 'Georgia',
    fontStyle: 'italic',
    lineHeight: 24,
  },
  bookContainer: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  bookTitle: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Georgia',
    marginBottom: 4,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  infoItem: {
    width: '48%',
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 12,
    fontFamily: 'Georgia',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 14,
    fontFamily: 'Georgia',
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
});
