import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, router } from 'expo-router';
import { Colors } from '../../../../constants/Colors';
import { useTheme } from '../../../../components/ThemeProvider';
import { bibleService } from '../../../../services/BibleService.web';
import { BibleSearchResult } from '../../../../types';

export default function BibleSearchWebScreen() {
  const { bookCode } = useLocalSearchParams();
  const bookCodeStr = bookCode as string;

  const { colorScheme } = useTheme();
  const [searchText, setSearchText] = useState('');
  const [searchResults, setSearchResults] = useState<BibleSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async () => {
    if (!searchText.trim()) return;

    try {
      setLoading(true);
      setHasSearched(true);
      const results = await bibleService.search(searchText, bookCodeStr);
      setSearchResults(results);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleResultPress = (result: BibleSearchResult) => {
    router.push(`/(tabs)/study/bible/${result.book}?chapter=${result.chapter}&verse=${result.verse}`);
  };

  const handleClearSearch = () => {
    setSearchText('');
    setSearchResults([]);
    setHasSearched(false);
  };

  const renderSearchResult = (result: BibleSearchResult, index: number) => (
    <TouchableOpacity
      key={index}
      style={[styles.resultCard, { backgroundColor: Colors[colorScheme ?? 'light'].card }]}
      onPress={() => handleResultPress(result)}
    >
      <View style={styles.resultHeader}>
        <Text style={[styles.resultReference, { color: Colors[colorScheme ?? 'light'].primary }]}>
          {result.reference}
        </Text>
        <Ionicons 
          name="chevron-forward" 
          size={16} 
          color={Colors[colorScheme ?? 'light'].secondaryText} 
        />
      </View>
      <Text style={[styles.resultText, { color: Colors[colorScheme ?? 'light'].text }]}>
        {result.text}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons 
            name="arrow-back" 
            size={24} 
            color={Colors[colorScheme ?? 'light'].text} 
          />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
          Search Bible
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Search Input */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <TextInput
            style={[styles.searchInput, { 
              backgroundColor: Colors[colorScheme ?? 'light'].card,
              color: Colors[colorScheme ?? 'light'].text,
              borderColor: Colors[colorScheme ?? 'light'].border
            }]}
            placeholder={bookCodeStr ? `Search in ${bookCodeStr}...` : "Search all books..."}
            placeholderTextColor={Colors[colorScheme ?? 'light'].secondaryText}
            value={searchText}
            onChangeText={setSearchText}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
            autoFocus
          />
          {searchText.length > 0 && (
            <TouchableOpacity
              style={styles.clearButton}
              onPress={handleClearSearch}
            >
              <Ionicons 
                name="close-circle" 
                size={20} 
                color={Colors[colorScheme ?? 'light'].secondaryText} 
              />
            </TouchableOpacity>
          )}
        </View>
        
        <TouchableOpacity
          style={[styles.searchButton, { backgroundColor: Colors[colorScheme ?? 'light'].primary }]}
          onPress={handleSearch}
          disabled={!searchText.trim() || loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color={Colors[colorScheme ?? 'light'].dominicanWhite} />
          ) : (
            <Ionicons 
              name="search" 
              size={20} 
              color={Colors[colorScheme ?? 'light'].dominicanWhite} 
            />
          )}
        </TouchableOpacity>
      </View>

      {/* Search Results */}
      <ScrollView style={styles.resultsContainer} showsVerticalScrollIndicator={false}>
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors[colorScheme ?? 'light'].primary} />
            <Text style={[styles.loadingText, { color: Colors[colorScheme ?? 'light'].text }]}>
              Searching...
            </Text>
          </View>
        )}

        {!loading && hasSearched && searchResults.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons 
              name="search-outline" 
              size={64} 
              color={Colors[colorScheme ?? 'light'].secondaryText} 
            />
            <Text style={[styles.emptyTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
              No Results Found
            </Text>
            <Text style={[styles.emptyMessage, { color: Colors[colorScheme ?? 'light'].secondaryText }]}>
              Try different keywords or check your spelling
            </Text>
          </View>
        )}

        {!loading && searchResults.length > 0 && (
          <View style={styles.resultsList}>
            <Text style={[styles.resultsCount, { color: Colors[colorScheme ?? 'light'].secondaryText }]}>
              {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} found
            </Text>
            {searchResults.map(renderSearchResult)}
          </View>
        )}

        {!loading && !hasSearched && (
          <View style={styles.placeholderState}>
            <Ionicons 
              name="search-outline" 
              size={64} 
              color={Colors[colorScheme ?? 'light'].secondaryText} 
            />
            <Text style={[styles.placeholderTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
              Search the Bible
            </Text>
            <Text style={[styles.placeholderMessage, { color: Colors[colorScheme ?? 'light'].secondaryText }]}>
              Enter keywords to search through {bookCodeStr ? bookCodeStr : 'all books'}
            </Text>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    fontFamily: 'Georgia',
  },
  headerSpacer: {
    width: 40,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  searchInputContainer: {
    flex: 1,
    position: 'relative',
  },
  searchInput: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingRight: 40,
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 16,
    fontFamily: 'Georgia',
  },
  clearButton: {
    position: 'absolute',
    right: 12,
    top: 12,
    padding: 4,
  },
  searchButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 48,
    alignItems: 'center',
  },
  resultsContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'Georgia',
    marginTop: 16,
  },
  resultsList: {
    paddingBottom: 20,
  },
  resultsCount: {
    fontSize: 14,
    fontFamily: 'Georgia',
    marginBottom: 16,
  },
  resultCard: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginBottom: 12,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  resultReference: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Georgia',
  },
  resultText: {
    fontSize: 16,
    lineHeight: 22,
    fontFamily: 'Georgia',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Georgia',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 16,
    fontFamily: 'Georgia',
    textAlign: 'center',
  },
  placeholderState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  placeholderTitle: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Georgia',
    marginTop: 16,
    marginBottom: 8,
  },
  placeholderMessage: {
    fontSize: 16,
    fontFamily: 'Georgia',
    textAlign: 'center',
  },
});
