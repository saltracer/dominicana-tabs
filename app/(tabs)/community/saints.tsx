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

type SortOption = 'name' | 'feast_day' | 'birth_year' | 'death_year';
type FilterOption = 'all' | 'dominican' | 'doctor' | 'martyr' | 'virgin' | 'founder';

export default function SaintsScreen() {
  const { colorScheme } = useTheme();
  const { liturgicalDay } = useCalendar();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('name');
  const [filterBy, setFilterBy] = useState<FilterOption>('all');
  const [selectedSaint, setSelectedSaint] = useState<Saint | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

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
    setSelectedSaint(saint);
  };

  const closeModal = () => {
    setSelectedSaint(null);
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
      <SafeAreaView style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
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
      style={[styles.saintCard, { backgroundColor: Colors[colorScheme ?? 'light'].card }]}
      onPress={() => handleSaintPress(saint)}
    >
      <View style={styles.saintHeader}>
        {/* Doctor badge - top left */}
        {saint.is_doctor && (
          <View style={[styles.doctorBadge, styles.topLeftBadge, { backgroundColor: Colors[colorScheme ?? 'light'].accent }]}>
            <Text style={[styles.badgeText, { color: 'black'/* Colors[colorScheme ?? 'light'].dominicanWhite */ }]}>
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

  const renderFilterButton = (filter: FilterOption, label: string, icon: string) => (
    <TouchableOpacity
      key={filter}
      style={[
        styles.filterButton,
        { 
          backgroundColor: filterBy === filter 
            ? Colors[colorScheme ?? 'light'].primary 
            : Colors[colorScheme ?? 'light'].surface,
          borderColor: Colors[colorScheme ?? 'light'].border
        }
      ]}
      onPress={() => setFilterBy(filter)}
    >
      <Ionicons 
        name={icon as any} 
        size={16} 
        color={filterBy === filter 
          ? Colors[colorScheme ?? 'light'].dominicanWhite 
          : Colors[colorScheme ?? 'light'].textSecondary
        } 
      />
      <Text style={[
        styles.filterButtonText,
        { 
          color: filterBy === filter 
            ? Colors[colorScheme ?? 'light'].dominicanWhite 
            : Colors[colorScheme ?? 'light'].textSecondary
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
        styles.sortButton,
        { 
          backgroundColor: sortBy === sort 
            ? Colors[colorScheme ?? 'light'].primary 
            : Colors[colorScheme ?? 'light'].surface,
          borderColor: Colors[colorScheme ?? 'light'].border
        }
      ]}
      onPress={() => setSortBy(sort)}
    >
      <Ionicons 
        name={icon as any} 
        size={16} 
        color={sortBy === sort 
          ? Colors[colorScheme ?? 'light'].dominicanWhite 
          : Colors[colorScheme ?? 'light'].textSecondary
        } 
      />
      <Text style={[
        styles.sortButtonText,
        { 
          color: sortBy === sort 
            ? Colors[colorScheme ?? 'light'].dominicanWhite 
            : Colors[colorScheme ?? 'light'].textSecondary
        }
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]} edges={['left', 'right']}>
      <CommunityNavigation activeTab="saints" />
      
      <View style={styles.tabContent}>
        {/* Search Bar */}
        <View style={[styles.searchContainer, { backgroundColor: Colors[colorScheme ?? 'light'].surface, borderColor: Colors[colorScheme ?? 'light'].border }]}>
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
              <Text style={[styles.filterSectionTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
                Filter by Category
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
                {renderFilterButton('all', 'All', 'list')}
                {renderFilterButton('dominican', 'Dominican', 'book')}
                {renderFilterButton('doctor', 'Doctors', 'school')}
                {renderFilterButton('martyr', 'Martyrs', 'flame')}
                {renderFilterButton('virgin', 'Virgins', 'heart')}
                {renderFilterButton('founder', 'Founders', 'build')}
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
          data={paginatedSaints}
          renderItem={renderSaintCard}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.row}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.saintsGrid}
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
                    {selectedSaint.is_doctor && (
                      <View style={[styles.doctorBadge, { backgroundColor: Colors[colorScheme ?? 'light'].accent }]}>
                        <Text style={[styles.badgeText, { color: 'black'/* Colors[colorScheme ?? 'light'].dominicanBlack */ }]}>
                          Doctor
                        </Text>
                      </View>
                    )}
                    {selectedSaint.is_dominican && (
                      <View style={[styles.dominicanBadge, { backgroundColor: Colors[colorScheme ?? 'light'].primary }]}>
                        <Text style={[styles.badgeText, { color: Colors[colorScheme ?? 'light'].dominicanWhite }]}>
                          Dominican
                        </Text>
                      </View>
                    )}
                    {selectedSaint.color && (
                      <View style={[
                        styles.colorBadge, 
                        { 
                          backgroundColor: getLiturgicalColor(selectedSaint.color),
                          borderWidth: selectedSaint.color === 'White' ? 1 : 0,
                          borderColor: selectedSaint.color === 'White' ? '#666666' : 'transparent',
                        }
                      ]}>
                        <Text style={[
                          styles.badgeText, 
                          { 
                            color: selectedSaint.color === 'White' 
                              ? '#000000' 
                              : Colors[colorScheme ?? 'light'].dominicanWhite 
                          }
                        ]}>
                          {selectedSaint.color.charAt(0).toUpperCase() + selectedSaint.color.slice(1)}
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

              {selectedSaint.biography && selectedSaint.biography.length > 0 && (
                <View style={styles.section}>
                  <Text style={[styles.sectionTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
                    Detailed Biography
                  </Text>
                  {selectedSaint.biography.map((paragraph, index) => (
                    <Text key={index} style={[styles.sectionContent, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                      {paragraph}
                    </Text>
                  ))}
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
      
      {/* Feast Banner at Bottom */}
      <FeastBanner 
        liturgicalDay={liturgicalDay} 
      />
    </SafeAreaView>
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
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'Georgia',
  },
  tabContent: {
    flex: 1,
    paddingHorizontal: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    fontSize: 16,
    fontFamily: 'Georgia',
  },
  resultsCount: {
    fontSize: 14,
    fontFamily: 'Georgia',
    marginBottom: 16,
    textAlign: 'center',
  },
  filtersContainer: {
    marginBottom: 16,
  },
  filterSection: {
    marginBottom: 16,
  },
  sortSection: {
    marginBottom: 16,
  },
  filterSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Georgia',
    marginBottom: 8,
  },
  filterScroll: {
    flexDirection: 'row',
  },
  sortScroll: {
    flexDirection: 'row',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  filterButtonText: {
    fontSize: 12,
    fontFamily: 'Georgia',
    marginLeft: 4,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  sortButtonText: {
    fontSize: 12,
    fontFamily: 'Georgia',
    marginLeft: 4,
  },
  saintsGrid: {
    paddingBottom: 20,
  },
  row: {
    justifyContent: 'space-between',
  },
  saintCard: {
    width: '48%',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  saintHeader: {
    alignItems: 'center',
    marginBottom: 12,
    position: 'relative',
  },
  badgesContainer: {
    position: 'absolute',
    top: 0,
    right: 0,
    flexDirection: 'row',
  },
  colorBadge: {
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 6,
  },
  dominicanBadge: {
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 6,
  },
  doctorBadge: {
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 6,
  },
  badgeText: {
    fontSize: 8,
    fontWeight: '700',
    fontFamily: 'Georgia',
  },
  dateBadgesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
    marginBottom: 8,
  },
  topLeftBadge: {
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 1,
  },
  topRightBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    zIndex: 1,
  },
  saintName: {
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 4,
    fontFamily: 'Georgia',
  },
  saintFeastDay: {
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 4,
    fontFamily: 'Georgia',
  },
  saintPatronage: {
    fontSize: 11,
    textAlign: 'center',
    fontFamily: 'Georgia',
    lineHeight: 14,
    marginBottom: 4,
  },
  saintYears: {
    fontSize: 10,
    textAlign: 'center',
    fontFamily: 'Georgia',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 16,
    fontFamily: 'Georgia',
    marginTop: 16,
    textAlign: 'center',
  },
  pagination: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  paginationButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    marginHorizontal: 8,
  },
  paginationText: {
    fontSize: 14,
    fontFamily: 'Georgia',
    marginHorizontal: 16,
  },
  // Modal styles
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  closeButton: {
    padding: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Georgia',
    flex: 1,
    textAlign: 'center',
  },
  placeholder: {
    width: 40,
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 16,
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
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Georgia',
    marginBottom: 12,
  },
  sectionContent: {
    fontSize: 16,
    fontFamily: 'Georgia',
    lineHeight: 24,
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
  bookDescription: {
    fontSize: 14,
    fontFamily: 'Georgia',
    lineHeight: 20,
    marginBottom: 4,
  },
  bookYear: {
    fontSize: 12,
    fontFamily: 'Georgia',
    fontStyle: 'italic',
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
});
