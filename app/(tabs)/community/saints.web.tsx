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
import { SafeAreaView } from 'react-native-safe-area-context';
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

  const renderSaintCard = ({ item: saint }: { item: Saint }) => {
    const isSelected = selectedSaint?.id === saint.id;
    return (
      <TouchableOpacity
        style={[
          styles.saintCard, 
          { 
            backgroundColor: Colors[colorScheme ?? 'light'].card,
            borderWidth: isSelected ? 2 : 0,
            borderColor: isSelected ? Colors[colorScheme ?? 'light'].primary : 'transparent',
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
  };

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
      {/* <CommunityNavigation activeTab="saints" /> */}
      <Animated.View 
        style={[
          styles.tabContentWeb,
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

        {/* Filters and Sort - Always visible on web */}
        <View style={CommunityStyles.filtersContainer}>
          <View style={CommunityStyles.filterSection}>
            <Text style={[CommunityStyles.filterSectionTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
              Filter by Category
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={CommunityStyles.filterScroll}>
              {renderFilterButton('all', 'All', 'list')}
              {renderFilterButton('dominican', 'Dominican', 'book')}
              {renderFilterButton('doctor', 'Doctors', 'school')}
              {renderFilterButton('martyr', 'Martyrs', 'flame')}
              {renderFilterButton('virgin', 'Virgins', 'heart')}
              {renderFilterButton('founder', 'Founders', 'build')}
            </ScrollView>
          </View>

          <View style={CommunityStyles.sortSection}>
            <Text style={[CommunityStyles.filterSectionTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
              Sort by
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={CommunityStyles.sortScroll}>
              {renderSortButton('name', 'Name', 'text')}
              {renderSortButton('feast_day', 'Feast Day', 'calendar')}
              {renderSortButton('birth_year', 'Birth Year', 'person')}
              {renderSortButton('death_year', 'Death Year', 'time')}
            </ScrollView>
          </View>
        </View>

        {/* Saints Grid */}
        <FlatList
          data={paginatedSaints}
          renderItem={renderSaintCard}
          keyExtractor={(item) => item.id}
          numColumns={4} // More columns for web
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
      
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // Include all shared styles
  ...CommunityStyles,
  
  // Add/override with unique local styles
  tabContentWeb: {
    flex: 1,
    paddingHorizontal: 24,
    alignSelf: 'flex-start',
  },
  footerWrapper: {
    position: 'relative' as any,
    left: -24, // Offset the parent's paddingHorizontal
    width: '100vw' as any, // Full viewport width
    maxWidth: '100vw' as any,
  },
});
