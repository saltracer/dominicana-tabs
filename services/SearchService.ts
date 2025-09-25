import AsyncStorage from '@react-native-async-storage/async-storage';

interface SearchResult {
  id: string;
  bookId: string;
  chapter: string;
  position: number;
  text: string;
  context: string;
  relevanceScore: number;
  highlightText: string;
}

interface SearchOptions {
  caseSensitive: boolean;
  wholeWords: boolean;
  fuzzySearch: boolean;
  includeContext: boolean;
  maxResults: number;
  searchIn: ('title' | 'content' | 'annotations' | 'bookmarks')[];
}

interface SearchHistory {
  id: string;
  query: string;
  bookId?: string;
  results: number;
  timestamp: string;
}

interface SearchIndex {
  bookId: string;
  chapters: {
    [chapterId: string]: {
      title: string;
      content: string;
      words: string[];
      positions: { [word: string]: number[] };
    };
  };
  lastUpdated: string;
}

class SearchService {
  private static readonly SEARCH_INDEX_KEY = 'search_index';
  private static readonly SEARCH_HISTORY_KEY = 'search_history';
  private static readonly SEARCH_OPTIONS_KEY = 'search_options';

  private defaultOptions: SearchOptions = {
    caseSensitive: false,
    wholeWords: false,
    fuzzySearch: true,
    includeContext: true,
    maxResults: 100,
    searchIn: ['content', 'title', 'annotations', 'bookmarks']
  };

  /**
   * Search within a book
   */
  async searchInBook(bookId: string, query: string, options?: Partial<SearchOptions>): Promise<SearchResult[]> {
    const searchOptions = { ...this.defaultOptions, ...options };
    const searchIndex = await this.getSearchIndex(bookId);
    
    if (!searchIndex) {
      throw new Error('Search index not found for book');
    }

    const results: SearchResult[] = [];
    const searchTerms = this.preprocessQuery(query, searchOptions);

    // Search in each chapter
    for (const [chapterId, chapter] of Object.entries(searchIndex.chapters)) {
      const chapterResults = this.searchInChapter(
        bookId,
        chapterId,
        chapter,
        searchTerms,
        searchOptions
      );
      results.push(...chapterResults);
    }

    // Sort by relevance score
    results.sort((a, b) => b.relevanceScore - a.relevanceScore);

    // Limit results
    const limitedResults = results.slice(0, searchOptions.maxResults);

    // Save to search history
    await this.saveSearchHistory(bookId, query, limitedResults.length);

    return limitedResults;
  }

  /**
   * Search across all books
   */
  async searchAllBooks(query: string, options?: Partial<SearchOptions>): Promise<SearchResult[]> {
    const searchOptions = { ...this.defaultOptions, ...options };
    const allResults: SearchResult[] = [];

    // Get all book IDs from search index
    const searchIndexes = await this.getAllSearchIndexes();
    
    for (const bookId of Object.keys(searchIndexes)) {
      try {
        const bookResults = await this.searchInBook(bookId, query, searchOptions);
        allResults.push(...bookResults);
      } catch (error) {
        console.error(`Error searching in book ${bookId}:`, error);
      }
    }

    // Sort by relevance score
    allResults.sort((a, b) => b.relevanceScore - a.relevanceScore);

    // Limit results
    return allResults.slice(0, searchOptions.maxResults);
  }

  /**
   * Build search index for a book
   */
  async buildSearchIndex(bookId: string, bookContent: {
    chapters: Array<{
      id: string;
      title: string;
      content: string;
    }>;
  }): Promise<void> {
    const searchIndex: SearchIndex = {
      bookId,
      chapters: {},
      lastUpdated: new Date().toISOString()
    };

    // Process each chapter
    for (const chapter of bookContent.chapters) {
      const words = this.tokenizeText(chapter.content);
      const positions: { [word: string]: number[] } = {};

      // Build word position index
      words.forEach((word, index) => {
        const normalizedWord = word.toLowerCase();
        if (!positions[normalizedWord]) {
          positions[normalizedWord] = [];
        }
        positions[normalizedWord].push(index);
      });

      searchIndex.chapters[chapter.id] = {
        title: chapter.title,
        content: chapter.content,
        words,
        positions
      };
    }

    // Save search index
    await this.saveSearchIndex(bookId, searchIndex);
  }

  /**
   * Get search suggestions
   */
  async getSearchSuggestions(query: string, bookId?: string): Promise<string[]> {
    const suggestions: string[] = [];
    
    if (bookId) {
      const searchIndex = await this.getSearchIndex(bookId);
      if (searchIndex) {
        const allWords = new Set<string>();
        Object.values(searchIndex.chapters).forEach(chapter => {
          chapter.words.forEach(word => {
            if (word.toLowerCase().startsWith(query.toLowerCase())) {
              allWords.add(word);
            }
          });
        });
        suggestions.push(...Array.from(allWords).slice(0, 10));
      }
    } else {
      // Get suggestions from search history
      const history = await this.getSearchHistory();
      const historySuggestions = history
        .filter(h => h.query.toLowerCase().includes(query.toLowerCase()))
        .map(h => h.query)
        .slice(0, 10);
      suggestions.push(...historySuggestions);
    }

    return suggestions;
  }

  /**
   * Get search history
   */
  async getSearchHistory(bookId?: string): Promise<SearchHistory[]> {
    try {
      const data = await AsyncStorage.getItem(SearchService.SEARCH_HISTORY_KEY);
      const history = data ? JSON.parse(data) : [];
      
      if (bookId) {
        return history.filter((h: SearchHistory) => h.bookId === bookId);
      }
      
      return history.sort((a: SearchHistory, b: SearchHistory) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
    } catch (error) {
      console.error('Error getting search history:', error);
      return [];
    }
  }

  /**
   * Clear search history
   */
  async clearSearchHistory(): Promise<void> {
    await AsyncStorage.removeItem(SearchService.SEARCH_HISTORY_KEY);
  }

  /**
   * Get search options
   */
  async getSearchOptions(): Promise<SearchOptions> {
    try {
      const data = await AsyncStorage.getItem(SearchService.SEARCH_OPTIONS_KEY);
      return data ? JSON.parse(data) : this.defaultOptions;
    } catch (error) {
      console.error('Error getting search options:', error);
      return this.defaultOptions;
    }
  }

  /**
   * Update search options
   */
  async updateSearchOptions(options: Partial<SearchOptions>): Promise<void> {
    const currentOptions = await this.getSearchOptions();
    const newOptions = { ...currentOptions, ...options };
    
    await AsyncStorage.setItem(
      SearchService.SEARCH_OPTIONS_KEY,
      JSON.stringify(newOptions)
    );
  }

  /**
   * Search in a specific chapter
   */
  private searchInChapter(
    bookId: string,
    chapterId: string,
    chapter: SearchIndex['chapters'][string],
    searchTerms: string[],
    options: SearchOptions
  ): SearchResult[] {
    const results: SearchResult[] = [];
    const content = chapter.content;
    const words = chapter.words;

    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      const normalizedWord = options.caseSensitive ? word : word.toLowerCase();
      
      for (const searchTerm of searchTerms) {
        const normalizedSearchTerm = options.caseSensitive ? searchTerm : searchTerm.toLowerCase();
        
        if (this.matchesSearchTerm(normalizedWord, normalizedSearchTerm, options)) {
          const result: SearchResult = {
            id: `result_${Date.now()}_${Math.random()}`,
            bookId,
            chapter: chapter.title,
            position: i,
            text: word,
            context: this.getContext(words, i, 50),
            relevanceScore: this.calculateRelevanceScore(word, searchTerm, options),
            highlightText: this.highlightText(word, searchTerm, options)
          };
          results.push(result);
        }
      }
    }

    return results;
  }

  /**
   * Check if word matches search term
   */
  private matchesSearchTerm(word: string, searchTerm: string, options: SearchOptions): boolean {
    if (options.wholeWords) {
      return word === searchTerm;
    }
    
    if (options.fuzzySearch) {
      return this.fuzzyMatch(word, searchTerm);
    }
    
    return word.includes(searchTerm);
  }

  /**
   * Fuzzy string matching
   */
  private fuzzyMatch(word: string, searchTerm: string): boolean {
    const threshold = 0.6; // Similarity threshold
    const similarity = this.calculateSimilarity(word, searchTerm);
    return similarity >= threshold;
  }

  /**
   * Calculate string similarity
   */
  private calculateSimilarity(str1: string, str2: string): number {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    const distance = this.levenshteinDistance(longer, shorter);
    return (longer.length - distance) / longer.length;
  }

  /**
   * Calculate Levenshtein distance
   */
  private levenshteinDistance(str1: string, str2: string): number {
    const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));
    
    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;
    
    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,
          matrix[j - 1][i] + 1,
          matrix[j - 1][i - 1] + indicator
        );
      }
    }
    
    return matrix[str2.length][str1.length];
  }

  /**
   * Calculate relevance score
   */
  private calculateRelevanceScore(word: string, searchTerm: string, options: SearchOptions): number {
    let score = 0;
    
    // Exact match gets highest score
    if (word === searchTerm) {
      score += 100;
    }
    // Starts with search term
    else if (word.startsWith(searchTerm)) {
      score += 80;
    }
    // Contains search term
    else if (word.includes(searchTerm)) {
      score += 60;
    }
    // Fuzzy match
    else if (options.fuzzySearch) {
      const similarity = this.calculateSimilarity(word, searchTerm);
      score += similarity * 40;
    }
    
    return score;
  }

  /**
   * Get context around a word
   */
  private getContext(words: string[], position: number, contextLength: number): string {
    const start = Math.max(0, position - contextLength);
    const end = Math.min(words.length, position + contextLength + 1);
    return words.slice(start, end).join(' ');
  }

  /**
   * Highlight search term in text
   */
  private highlightText(text: string, searchTerm: string, options: SearchOptions): string {
    if (options.caseSensitive) {
      return text.replace(new RegExp(searchTerm, 'g'), `<mark>${searchTerm}</mark>`);
    } else {
      return text.replace(new RegExp(searchTerm, 'gi'), `<mark>${searchTerm}</mark>`);
    }
  }

  /**
   * Preprocess search query
   */
  private preprocessQuery(query: string, options: SearchOptions): string[] {
    const terms = query.trim().split(/\s+/);
    
    if (options.wholeWords) {
      return terms;
    }
    
    // For partial matching, also include substrings
    const allTerms = [...terms];
    terms.forEach(term => {
      if (term.length > 3) {
        for (let i = 0; i <= term.length - 3; i++) {
          allTerms.push(term.substring(i, i + 3));
        }
      }
    });
    
    return [...new Set(allTerms)];
  }

  /**
   * Tokenize text into words
   */
  private tokenizeText(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 0);
  }

  /**
   * Get search index for a book
   */
  private async getSearchIndex(bookId: string): Promise<SearchIndex | null> {
    try {
      const data = await AsyncStorage.getItem(`${SearchService.SEARCH_INDEX_KEY}_${bookId}`);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error getting search index:', error);
      return null;
    }
  }

  /**
   * Get all search indexes
   */
  private async getAllSearchIndexes(): Promise<Record<string, SearchIndex>> {
    try {
      const data = await AsyncStorage.getItem(SearchService.SEARCH_INDEX_KEY);
      return data ? JSON.parse(data) : {};
    } catch (error) {
      console.error('Error getting all search indexes:', error);
      return {};
    }
  }

  /**
   * Save search index
   */
  private async saveSearchIndex(bookId: string, index: SearchIndex): Promise<void> {
    await AsyncStorage.setItem(
      `${SearchService.SEARCH_INDEX_KEY}_${bookId}`,
      JSON.stringify(index)
    );
  }

  /**
   * Save search history
   */
  private async saveSearchHistory(bookId: string, query: string, resultsCount: number): Promise<void> {
    const history = await this.getSearchHistory();
    const newEntry: SearchHistory = {
      id: `history_${Date.now()}`,
      query,
      bookId,
      results: resultsCount,
      timestamp: new Date().toISOString()
    };
    
    history.unshift(newEntry);
    
    // Keep only last 50 searches
    const limitedHistory = history.slice(0, 50);
    
    await AsyncStorage.setItem(
      SearchService.SEARCH_HISTORY_KEY,
      JSON.stringify(limitedHistory)
    );
  }
}

export default new SearchService();