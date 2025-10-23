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
type RankFilter = 'solemnity' | 'feast' | 'memorial' | 'optional_memorial';
type EraFilter = 'ancient' | 'medieval' | 'modern' | 'contemporary';

export default function SaintsScreen() {
  const { colorScheme } = useTheme();
  const { liturgicalDay } = useCalendar();
  const { width } = useWindowDimensions();
  const isWeb = true;
  const platformStyles = getPlatformStyles(isWeb);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [activeFilters, setActiveFilters] = useState<FilterOption[]>([]);
  const [activeRankFilters, setActiveRankFilters] = useState<RankFilter[]>([]);
  const [activeEraFilters, setActiveEraFilters] = useState<EraFilter[]>([]);
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
    setDisplayedCount(24);
  }, [searchQuery, sortBy, activeFilters, activeRankFilters, activeEraFilters]);

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
    // Stack badges if cards are narrow (mobile, or when detail panel is open making cards smaller)
    const shouldStackBadges = isMobileView || shouldShowSideBySide || numColumns > 3;
    
    return (
      <TouchableOpacity
        style={[
          styles.enhancedSaintCard, 
          { 
            backgroundColor: Colors[colorScheme ?? 'light'].card,
            borderWidth: isSelected ? 2 : 1,
            borderColor: isSelected ? Colors[colorScheme ?? 'light'].primary : Colors[colorScheme ?? 'light'].border,
            width: getCardWidth(),
            minWidth: 170, // Prevent cards from getting too narrow and causing badge overlap
            marginHorizontal: numColumns === 1 ? 0 : (shouldShowSideBySide ? 4 : 8),
            padding: isMobileView ? 12 : 16,
            minHeight: isMobileView ? 180 : 280,
          }
        ]}
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
          
          {/* Doctor and Dominican badges - top right */}
          <View style={[
            styles.topRightBadgeContainer,
            { flexDirection: shouldStackBadges ? 'column' : 'row', alignItems: 'flex-end' }
          ]}>
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
            size={isMobileView ? 40 : 48} 
            color={Colors[colorScheme ?? 'light'].primary} 
          />
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
        onPress={() => handleSortPress(sort)}
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
        {isActive && (
          <Ionicons 
            name={sortDirection === 'asc' ? 'arrow-up' : 'arrow-down'} 
            size={isMobileView ? 14 : 16} 
            color={Colors[colorScheme ?? 'light'].dominicanWhite}
            style={{ marginLeft: 4 }}
          />
        )}
      </TouchableOpacity>
    );
  };

  const renderRankFilterButton = (filter: RankFilter, label: string, icon: string) => {
    const isActive = activeRankFilters.includes(filter);
    const isMobileView = !shouldShowSidebar;
    
    return (
      <TouchableOpacity
        key={filter}
        style={[
          isMobileView ? styles.mobileFilterButton : styles.sidebarFilterButton,
          { 
            backgroundColor: isActive 
              ? Colors[colorScheme ?? 'light'].secondary 
              : isMobileView ? Colors[colorScheme ?? 'light'].surface : 'transparent',
            borderColor: isActive
              ? Colors[colorScheme ?? 'light'].secondary
              : Colors[colorScheme ?? 'light'].border
          }
        ]}
        onPress={() => handleToggleRankFilter(filter)}
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

  const renderEraFilterButton = (filter: EraFilter, label: string, icon: string) => {
    const isActive = activeEraFilters.includes(filter);
    const isMobileView = !shouldShowSidebar;
    
    return (
      <TouchableOpacity
        key={filter}
        style={[
          isMobileView ? styles.mobileFilterButton : styles.sidebarFilterButton,
          { 
            backgroundColor: isActive 
              ? '#8B7355' 
              : isMobileView ? Colors[colorScheme ?? 'light'].surface : 'transparent',
            borderColor: isActive
              ? '#8B7355'
              : Colors[colorScheme ?? 'light'].border
          }
        ]}
        onPress={() => handleToggleEraFilter(filter)}
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
  const shouldShowSideBySide = (isDesktop || isWide) && selectedSaint !== null;
  const shouldUseModal = (isMobile || isTablet) && selectedSaint !== null;
  
  // Determine number of columns based on screen width and detail panel state
  const numColumns = useMemo(() => {
    if (isMobile) return 1;
    if (isTablet) return 2;
    
    // Calculate effective width when detail panel is open
    const effectiveWidth = shouldShowSideBySide ? width * 0.6 : width;
    
    // Account for sidebar if present
    const contentWidth = shouldShowSidebar ? effectiveWidth - 280 : effectiveWidth;
    
    // Account for padding
    const paddingTotal = 48; // 24px on each side
    const availableWidth = contentWidth - paddingTotal;
    
    // Minimum card width with margins
    const minCardWidth = 170;
    const cardMargin = shouldShowSideBySide ? 8 : 16; // 4px each side = 8px total, or 8px each = 16px
    
    // Calculate max columns that fit
    if (isWide) {
      const maxCols = Math.floor(availableWidth / (minCardWidth + cardMargin));
      return Math.min(4, Math.max(1, maxCols));
    }
    
    // Desktop
    const maxCols = Math.floor(availableWidth / (minCardWidth + cardMargin));
    return Math.min(3, Math.max(1, maxCols));
  }, [isMobile, isTablet, isWide, shouldShowSideBySide, width, shouldShowSidebar]);

  // Calculate card width based on columns and available space
  const getCardWidth = (): '100%' | `${number}%` | undefined => {
    if (numColumns === 1) return '100%';
    // Use fixed percentages for each column configuration
    // Slightly smaller widths when detail panel is open to account for reduced container width
    if (shouldShowSideBySide) {
      if (numColumns === 2) return '47%'; // ~50% with gap, tighter
      if (numColumns === 3) return '30%'; // ~33% with gap, tighter
      if (numColumns === 4) return '22%'; // ~25% with gap, tighter
    } else {
      if (numColumns === 2) return '48%'; // ~50% with gap
      if (numColumns === 3) return '31%'; // ~33% with gap
      if (numColumns === 4) return '23%'; // ~25% with gap
    }
    return undefined;
  };

  return (
    <>
      <ScrollView
        style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1 }}
      >
      {/* Main Layout - Sidebar + Content */}
      <View style={[
        styles.mainLayout,
        { 
          flexDirection: shouldShowSidebar ? 'row' : 'column',
          minHeight: '100vh' as any,
        }
      ]}>
        {/* Left Sidebar - Filters (hidden on mobile/tablet) */}
        {shouldShowSidebar && (
          <View style={[styles.sidebar, { 
            backgroundColor: Colors[colorScheme ?? 'light'].surface,
            borderRightColor: Colors[colorScheme ?? 'light'].border,
            width: isTablet ? 220 : 280, // Narrower sidebar on tablet
          }]}>
            <ScrollView 
              showsVerticalScrollIndicator={true}
              style={{ flex: 1, height: '100%' as any }}
              contentContainerStyle={styles.sidebarScrollContent}
              nestedScrollEnabled={true}
            >
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

            {/* Filter by Celebration Rank */}
            <View style={styles.sidebarSection}>
              <Text style={[styles.sidebarSectionTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
                Celebration Rank {activeRankFilters.length > 0 && `(${activeRankFilters.length})`}
              </Text>
              {renderRankFilterButton('solemnity', 'Solemnity', 'star')}
              {renderRankFilterButton('feast', 'Feast', 'sunny')}
              {renderRankFilterButton('memorial', 'Memorial', 'bookmark')}
              {renderRankFilterButton('optional_memorial', 'Optional Memorial', 'bookmark-outline')}
            </View>

            {/* Filter by Era */}
            <View style={styles.sidebarSection}>
              <Text style={[styles.sidebarSectionTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
                Historical Era {activeEraFilters.length > 0 && `(${activeEraFilters.length})`}
              </Text>
              {renderEraFilterButton('ancient', 'Ancient (< 500)', 'hourglass')}
              {renderEraFilterButton('medieval', 'Medieval (500-1500)', 'shield')}
              {renderEraFilterButton('modern', 'Modern (1500-1800)', 'library')}
              {renderEraFilterButton('contemporary', 'Contemporary (1800+)', 'newspaper')}
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
            {(activeFilters.length > 0 || activeRankFilters.length > 0 || activeEraFilters.length > 0 || searchQuery !== '') && (
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
              paddingRight: shouldShowSideBySide 
                ? slideAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [isMobile ? 12 : isTablet ? 16 : 24, 32],
                  })
                : (isMobile ? 12 : isTablet ? 16 : 24),
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
                      {(activeFilters.length > 0 || activeRankFilters.length > 0 || activeEraFilters.length > 0 || searchQuery !== '') && (
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

                  <View style={styles.mobileFilterSection}>
                    <Text style={[styles.mobileFilterSectionTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
                      Celebration Rank {activeRankFilters.length > 0 && `(${activeRankFilters.length})`}
                    </Text>
                    <ScrollView 
                      horizontal 
                      showsHorizontalScrollIndicator={false} 
                      style={styles.mobileFilterScroll}
                      contentContainerStyle={styles.mobileFilterScrollContent}
                    >
                      {renderRankFilterButton('solemnity', 'Solemnity', 'star')}
                      {renderRankFilterButton('feast', 'Feast', 'sunny')}
                      {renderRankFilterButton('memorial', 'Memorial', 'bookmark')}
                      {renderRankFilterButton('optional_memorial', 'Optional', 'bookmark-outline')}
                    </ScrollView>
                  </View>

                  <View style={styles.mobileFilterSection}>
                    <Text style={[styles.mobileFilterSectionTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
                      Historical Era {activeEraFilters.length > 0 && `(${activeEraFilters.length})`}
                    </Text>
                    <ScrollView 
                      horizontal 
                      showsHorizontalScrollIndicator={false} 
                      style={styles.mobileFilterScroll}
                      contentContainerStyle={styles.mobileFilterScrollContent}
                    >
                      {renderEraFilterButton('ancient', 'Ancient', 'hourglass')}
                      {renderEraFilterButton('medieval', 'Medieval', 'shield')}
                      {renderEraFilterButton('modern', 'Modern', 'library')}
                      {renderEraFilterButton('contemporary', 'Contemporary', 'newspaper')}
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
            key={`${numColumns}-${shouldShowSideBySide}`} // Force re-render when columns change or panel opens
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
        </Animated.View>

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
              slideAnimation={new Animated.Value(1)} // Always visible in side panel mode
              useRelativePositioning={true}
            />
          </Animated.View>
        )}
      </View>

      <Footer />
      </ScrollView>

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
              backgroundColor: Colors[colorScheme ?? 'light'].background,
            }]}>
              <SaintDetailPanel
                selectedSaint={selectedSaint}
                isVisible={true}
                onClose={closePanel}
                onPrevious={navigateToPrevious}
                onNext={navigateToNext}
                hasPrevious={getCurrentIndex() > 0}
                hasNext={getCurrentIndex() < filteredAndSortedSaints.length - 1}
                slideAnimation={new Animated.Value(1)} // Always visible in modal mode
                useRelativePositioning={true}
                isModal={true}
              />
            </View>
          </View>
        </Modal>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  // Include all shared styles
  ...CommunityStyles,
  
  container: {
    flex: 1,
  },

  // Main layout structure
  mainLayout: {
    flex: 1,
    // flexDirection and minHeight set dynamically via inline styles
  },

  // Sidebar styles
  sidebar: {
    width: 280,
    borderRightWidth: 1,
    overflow: 'hidden' as any,
    height: '100%' as any,
    flexShrink: 0,
  },

  sidebarScrollContent: {
    paddingTop: 20,
    paddingHorizontal: 16,
    paddingBottom: 300, // Extra padding at bottom to ensure all content is scrollable
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

  topRightBadgeContainer: {
    position: 'absolute',
    top: 4,
    right: 4,
    // flexDirection set dynamically via inline styles (column on mobile, row on desktop)
    gap: 4,
    zIndex: 1,
  },

  rankBadge: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
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
    zIndex: 9999,
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
    height: '90%',
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative' as any,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    zIndex: 10000,
  },

  // Desktop side panel
  detailPanelSide: {
    overflow: 'hidden',
    height: '100%' as any,
  },
});
