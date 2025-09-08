import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, router } from 'expo-router';
import { Colors } from '../../../../constants/Colors';
import { useTheme } from '../../../../components/ThemeProvider';
import { bibleService, BibleSearchResult } from '../../../../services/BibleService';

export default function BibleSearchScreen() {
  const { bookCode } = useLocalSearchParams();
  const { colorScheme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<BibleSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedBook, setSelectedBook] = useState<string | undefined>(bookCode as string);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      Alert.alert('Empty Search', 'Please enter a search term');
      return;
    }

    try {
      setLoading(true);
      const results = await bibleService.search(searchQuery, selectedBook);
      setSearchResults(results);
    } catch (error) {
      console.error('Search error:', error);
      Alert.alert('Error', 'Search failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResultPress = (result: BibleSearchResult) => {
    router.push(`/(tabs)/study/bible/${result.book}?chapter=${result.chapter}&verse=${result.verse}`);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
  };

  const books = bibleService.getBibleBooks();
  const bookCategories = [
    { type: undefined, name: 'All Books', icon: 'library' },
    { type: 'old-testament', name: 'Old Testament', icon: 'book' },
    { type: 'new-testament', name: 'New Testament', icon: 'bookmark' },
    { type: 'deuterocanonical', name: 'Deuterocanonical', icon: 'star' },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]} edges={['left', 'right']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>

        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color={Colors[colorScheme ?? 'light'].primary} />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={[styles.title, { color: Colors[colorScheme ?? 'light'].text }]}>
              Bible Search
            </Text>
            <Text style={[styles.subtitle, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
              Search the Holy Bible
            </Text>
          </View>
        </View>

        {/* Search Input */}
        <View style={styles.searchContainer}>
          <View style={[styles.searchInputContainer, { backgroundColor: Colors[colorScheme ?? 'light'].surface }]}>
            <Ionicons name="search" size={20} color={Colors[colorScheme ?? 'light'].textSecondary} />
            <TextInput
              style={[styles.searchInput, { color: Colors[colorScheme ?? 'light'].text }]}
              placeholder="Enter search term..."
              placeholderTextColor={Colors[colorScheme ?? 'light'].textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={clearSearch}>
                <Ionicons name="close-circle" size={20} color={Colors[colorScheme ?? 'light'].textSecondary} />
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity
            style={[styles.searchButton, { backgroundColor: Colors[colorScheme ?? 'light'].primary }]}
            onPress={handleSearch}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color={Colors[colorScheme ?? 'light'].dominicanWhite} />
            ) : (
              <Ionicons name="search" size={20} color={Colors[colorScheme ?? 'light'].dominicanWhite} />
            )}
          </TouchableOpacity>
        </View>

        {/* Book Filter */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
            Search In
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesScroll}>
            {bookCategories.map((category) => (
              <TouchableOpacity
                key={category.name}
                style={[
                  styles.categoryCard,
                  { 
                    backgroundColor: selectedBook === category.type 
                      ? Colors[colorScheme ?? 'light'].primary 
                      : Colors[colorScheme ?? 'light'].card,
                  }
                ]}
                onPress={() => setSelectedBook(category.type)}
              >
                <Ionicons 
                  name={category.icon as any} 
                  size={16} 
                  color={selectedBook === category.type 
                    ? Colors[colorScheme ?? 'light'].dominicanWhite 
                    : Colors[colorScheme ?? 'light'].textSecondary
                  } 
                />
                <Text style={[
                  styles.categoryText,
                  { 
                    color: selectedBook === category.type 
                      ? Colors[colorScheme ?? 'light'].dominicanWhite 
                      : Colors[colorScheme ?? 'light'].text
                  }
                ]}>
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
              Search Results
              <Text style={[styles.count, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                {' '}({searchResults.length})
              </Text>
            </Text>
            
            <View style={styles.resultsList}>
              {searchResults.map((result, index) => (
                <TouchableOpacity
                  key={`${result.reference}-${index}`}
                  style={[styles.resultCard, { backgroundColor: Colors[colorScheme ?? 'light'].card }]}
                  onPress={() => handleResultPress(result)}
                >
                  <View style={styles.resultHeader}>
                    <Text style={[styles.resultReference, { color: Colors[colorScheme ?? 'light'].primary }]}>
                      {result.reference}
                    </Text>
                    <Ionicons name="chevron-forward" size={16} color={Colors[colorScheme ?? 'light'].textSecondary} />
                  </View>
                  <Text style={[styles.resultText, { color: Colors[colorScheme ?? 'light'].text }]} numberOfLines={3}>
                    {result.text}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* No Results */}
        {searchQuery.length > 0 && searchResults.length === 0 && !loading && (
          <View style={styles.noResultsContainer}>
            <Ionicons name="search" size={48} color={Colors[colorScheme ?? 'light'].textMuted} />
            <Text style={[styles.noResultsText, { color: Colors[colorScheme ?? 'light'].textMuted }]}>
              No results found for "{searchQuery}"
            </Text>
            <Text style={[styles.noResultsSubtext, { color: Colors[colorScheme ?? 'light'].textMuted }]}>
              Try different keywords or check your spelling
            </Text>
          </View>
        )}

        {/* Search Tips */}
        {searchResults.length === 0 && searchQuery.length === 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
              Search Tips
            </Text>
            <View style={[styles.tipsCard, { backgroundColor: Colors[colorScheme ?? 'light'].card }]}>
              <View style={styles.tipItem}>
                <Ionicons name="bulb" size={20} color={Colors[colorScheme ?? 'light'].primary} />
                <Text style={[styles.tipText, { color: Colors[colorScheme ?? 'light'].text }]}>
                  Use specific words or phrases
                </Text>
              </View>
              <View style={styles.tipItem}>
                <Ionicons name="book" size={20} color={Colors[colorScheme ?? 'light'].primary} />
                <Text style={[styles.tipText, { color: Colors[colorScheme ?? 'light'].text }]}>
                  Search within specific books using the filter
                </Text>
              </View>
              <View style={styles.tipItem}>
                <Ionicons name="text" size={20} color={Colors[colorScheme ?? 'light'].primary} />
                <Text style={[styles.tipText, { color: Colors[colorScheme ?? 'light'].text }]}>
                  Try different translations of words
                </Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  backButton: {
    marginRight: 16,
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    fontFamily: 'Georgia',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Georgia',
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
    gap: 12,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    fontSize: 16,
    fontFamily: 'Georgia',
  },
  searchButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    marginVertical: 16,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
    fontFamily: 'Georgia',
  },
  count: {
    fontSize: 16,
    fontWeight: '400',
  },
  categoriesScroll: {
    marginBottom: 8,
  },
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  categoryText: {
    marginLeft: 4,
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'Georgia',
  },
  resultsList: {
    gap: 8,
  },
  resultCard: {
    padding: 16,
    borderRadius: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  resultReference: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Georgia',
  },
  resultText: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: 'Georgia',
  },
  noResultsContainer: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 32,
  },
  noResultsText: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Georgia',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  noResultsSubtext: {
    fontSize: 14,
    fontFamily: 'Georgia',
    textAlign: 'center',
  },
  tipsCard: {
    padding: 16,
    borderRadius: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  tipText: {
    marginLeft: 12,
    fontSize: 14,
    fontFamily: 'Georgia',
    flex: 1,
  },
});
