import React, { useState, useEffect } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  Pressable,
  Text,
  FlatList,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { useTheme } from '../ThemeProvider';
import LiturgicalCalendarService from '../../services/LiturgicalCalendar';
import { format } from 'date-fns';

interface SearchResult {
  date: Date;
  feastName: string;
  rank: string;
  isDominican: boolean;
}

interface SearchBarProps {
  onSelectDate: (date: Date) => void;
  placeholder?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSelectDate, placeholder = 'Search feasts and saints...' }) => {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    // Search through liturgical calendar
    const calendarService = LiturgicalCalendarService.getInstance();
    const results: SearchResult[] = [];
    const currentYear = new Date().getFullYear();
    
    // Search through the year
    for (let month = 0; month < 12; month++) {
      const daysInMonth = new Date(currentYear, month + 1, 0).getDate();
      
      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(currentYear, month, day);
        const liturgicalDay = calendarService.getLiturgicalDay(date);
        
        if (liturgicalDay.feasts.length > 0) {
          liturgicalDay.feasts.forEach(feast => {
            if (feast.name.toLowerCase().includes(searchQuery.toLowerCase())) {
              results.push({
                date,
                feastName: feast.name,
                rank: feast.rank,
                isDominican: feast.isDominican || false,
              });
            }
          });
        }
      }
    }

    setSearchResults(results.slice(0, 8)); // Limit to 8 results
    setShowResults(true);
  }, [searchQuery]);

  const handleSelectResult = (result: SearchResult) => {
    onSelectDate(result.date);
    setSearchQuery('');
    setShowResults(false);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setShowResults(false);
  };

  return (
    <View style={styles.container}>
      <View style={[styles.searchInputContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Ionicons name="search" size={20} color={colors.textMuted} style={styles.searchIcon} />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder={placeholder}
          placeholderTextColor={colors.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
          onFocus={() => {
            if (searchResults.length > 0) {
              setShowResults(true);
            }
          }}
        />
        {searchQuery.length > 0 && (
          <Pressable onPress={clearSearch} style={styles.clearButton}>
            <Ionicons name="close-circle" size={20} color={colors.textMuted} />
          </Pressable>
        )}
      </View>

      {showResults && searchResults.length > 0 && (
        <View style={[styles.resultsContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <FlatList
            data={searchResults}
            keyExtractor={(item, index) => `${item.date.toISOString()}-${index}`}
            renderItem={({ item }) => (
              <Pressable
                style={({ pressed }) => [
                  styles.resultItem,
                  { backgroundColor: pressed ? colors.surface : 'transparent' },
                ]}
                onPress={() => handleSelectResult(item)}
              >
                <View style={styles.resultContent}>
                  <View style={styles.resultHeader}>
                    <Text style={[styles.resultDate, { color: colors.textSecondary }]}>
                      {format(item.date, 'MMM d')}
                    </Text>
                    {item.isDominican && (
                      <View style={[styles.dominicanBadge, { backgroundColor: colors.primary }]}>
                        <Text style={styles.dominicanBadgeText}>OP</Text>
                      </View>
                    )}
                  </View>
                  <Text style={[styles.resultName, { color: colors.text }]} numberOfLines={1}>
                    {item.feastName}
                  </Text>
                  <Text style={[styles.resultRank, { color: colors.textMuted }]}>
                    {item.rank}
                  </Text>
                </View>
              </Pressable>
            )}
            style={styles.resultsList}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    zIndex: 1000,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === 'web' ? 10 : 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Georgia',
    outlineStyle: 'none',
  } as any,
  clearButton: {
    padding: 4,
  },
  resultsContainer: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    marginTop: 8,
    borderRadius: 12,
    borderWidth: 1,
    maxHeight: 320,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  resultsList: {
    maxHeight: 320,
  },
  resultItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  resultContent: {
    flex: 1,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  resultDate: {
    fontSize: 12,
    fontFamily: 'Georgia',
    fontWeight: '600',
    marginRight: 8,
  },
  dominicanBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  dominicanBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: 'Georgia',
  },
  resultName: {
    fontSize: 15,
    fontFamily: 'Georgia',
    fontWeight: '600',
    marginBottom: 2,
  },
  resultRank: {
    fontSize: 12,
    fontFamily: 'Georgia',
  },
});

export default SearchBar;

