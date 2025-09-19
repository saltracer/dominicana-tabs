import { StyleSheet, Dimensions } from 'react-native';

const { width: screenWidth } = Dimensions.get('window');

export const StudyStyles = StyleSheet.create({
  // CONTAINERS
  container: {
    flex: 1,
  },
  
  scrollView: {
    flex: 1,
  },
  
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // HEADERS
  header: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    alignItems: 'center',
  },

  headerWeb: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },

  headerContent: {
    flex: 1,
    alignItems: 'center',
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    fontFamily: 'Georgia',
  },

  headerSpacer: {
    width: 40,
  },

  backButton: {
    padding: 8,
  },

  backButtonWithMargin: {
    marginRight: 16,
  },

  // TYPOGRAPHY
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

  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
    fontFamily: 'Georgia',
  },

  sectionTitleWeb: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Georgia',
    marginBottom: 12,
  },

  loadingText: {
    fontSize: 16,
    fontFamily: 'Georgia',
    marginTop: 16,
  },

  count: {
    fontSize: 16,
    fontWeight: '400',
  },

  // SEARCH COMPONENTS
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
  },

  searchContainerWeb: {
    position: 'relative',
    marginHorizontal: 20,
    marginVertical: 16,
  },

  searchContainerWithButton: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
    gap: 12,
  },

  searchInput: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    fontSize: 16,
    fontFamily: 'Georgia',
  },

  searchInputWeb: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingRight: 40,
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 16,
    fontFamily: 'Georgia',
  },

  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
  },

  searchInputContainerWeb: {
    flex: 1,
    position: 'relative',
  },

  searchIcon: {
    position: 'absolute',
    right: 12,
    top: 12,
  },

  clearButton: {
    position: 'absolute',
    right: 12,
    top: 12,
    padding: 4,
  },

  searchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 12,
  },

  searchButtonCompact: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },

  searchButtonWeb: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 48,
    alignItems: 'center',
  },

  searchButtonText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Georgia',
  },

  // SECTIONS & LAYOUT
  section: {
    marginVertical: 16,
    paddingHorizontal: 16,
  },

  sectionWeb: {
    marginBottom: 24,
  },

  // CATEGORY COMPONENTS
  categoriesScroll: {
    marginBottom: 8,
  },

  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },

  categoryCardCompact: {
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
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Georgia',
  },

  categoryTextCompact: {
    marginLeft: 4,
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'Georgia',
  },

  // BOOK CARDS
  bookCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },

  bookCardGrid: {
    width: '48%',
    marginBottom: 16,
    borderRadius: 12,
    padding: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },

  bookCardWeb: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },

  bookInfo: {
    flex: 1,
  },

  bookHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },

  bookTitle: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Georgia',
    flex: 1,
  },

  bookTitleGrid: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
    fontFamily: 'Georgia',
  },

  bookSubtitle: {
    fontSize: 14,
    fontFamily: 'Georgia',
    marginBottom: 8,
  },

  bookAbbreviation: {
    fontSize: 14,
    fontFamily: 'Georgia',
    marginLeft: 8,
  },

  bookAuthor: {
    fontSize: 12,
    marginBottom: 4,
    fontFamily: 'Georgia',
  },

  bookCategory: {
    fontSize: 14,
    fontFamily: 'Georgia',
  },

  bookDescription: {
    fontSize: 11,
    fontFamily: 'Georgia',
    lineHeight: 14,
  },

  chapterCount: {
    fontSize: 12,
    fontWeight: '500',
    fontFamily: 'Georgia',
  },

  // GRIDS & LISTS
  booksGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },

  booksGridWeb: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: 12,
  },

  booksList: {
    gap: 8,
  },

  quickAccessGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },

  quickAccessCard: {
    width: '48%',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },

  quickAccessText: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Georgia',
  },

  // SPECIAL CARDS
  bibleCard: {
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },

  bibleCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  bibleIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },

  bibleInfo: {
    flex: 1,
  },

  bibleTitle: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'Georgia',
    marginBottom: 4,
  },

  bibleSubtitle: {
    fontSize: 14,
    fontFamily: 'Georgia',
    marginBottom: 4,
  },

  bibleDescription: {
    fontSize: 12,
    fontFamily: 'Georgia',
    lineHeight: 16,
  },

  // BOOK COVER & BADGES
  bookCover: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 80,
    marginBottom: 8,
    position: 'relative',
  },

  dominicanBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },

  dominicanBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    fontFamily: 'Georgia',
  },

  // PROGRESS & STATUS
  progressCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },

  progressText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    fontFamily: 'Georgia',
  },

  // LOGIN BANNER
  loginBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 8,
  },

  loginText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    fontFamily: 'Georgia',
  },

  loginButton: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 6,
  },

  loginButtonText: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Georgia',
  },

  // SEARCH RESULTS
  resultsList: {
    gap: 8,
  },

  resultsListWeb: {
    paddingBottom: 20,
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

  resultCardWeb: {
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

  resultTextWeb: {
    fontSize: 16,
    lineHeight: 22,
    fontFamily: 'Georgia',
  },

  resultsCount: {
    fontSize: 14,
    fontFamily: 'Georgia',
    marginBottom: 16,
  },

  // EMPTY STATES
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },

  emptyStateWeb: {
    alignItems: 'center',
    paddingVertical: 60,
  },

  emptyText: {
    fontSize: 16,
    fontFamily: 'Georgia',
    marginTop: 16,
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

  // NO RESULTS
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

  // PLACEHOLDER STATES
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

  // TIPS CARD
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

  // VERSION SELECTOR
  versionSelector: {
    marginVertical: 12,
  },

  // BIBLE READER SPECIFIC
  readerContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },

  chapterHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    marginBottom: 16,
  },

  chapterTitle: {
    fontSize: 24,
    fontWeight: '700',
    fontFamily: 'Georgia',
  },

  chapterNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },

  navButton: {
    padding: 8,
    borderRadius: 20,
  },

  chapterNumber: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Georgia',
    minWidth: 60,
    textAlign: 'center',
  },

  verseContainer: {
    marginBottom: 8,
  },

  verseContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 4,
  },

  verseNumber: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'Georgia',
    minWidth: 30,
    marginRight: 8,
  },

  verseText: {
    flex: 1,
    fontSize: 16,
    lineHeight: 24,
    fontFamily: 'Georgia',
  },

  // ERROR STATES
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },

  errorTitle: {
    fontSize: 20,
    fontWeight: '600',
    fontFamily: 'Georgia',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },

  errorMessage: {
    fontSize: 16,
    fontFamily: 'Georgia',
    textAlign: 'center',
    marginBottom: 24,
  },

  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },

  retryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Georgia',
  },

  // CONTROLS
  controlsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },

  fontSizeControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  fontSizeButton: {
    padding: 8,
    borderRadius: 16,
    minWidth: 32,
    alignItems: 'center',
  },

  fontSizeText: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'Georgia',
  },

  // NAVIGATION
  navigationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },

  navigationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },

  navigationText: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Georgia',
    marginHorizontal: 8,
  },

  // MODAL STYLES
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  modalContent: {
    width: '80%',
    maxHeight: '70%',
    borderRadius: 16,
    padding: 20,
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Georgia',
    marginBottom: 16,
    textAlign: 'center',
  },

  modalScrollView: {
    maxHeight: 300,
  },

  modalItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
  },

  modalItemText: {
    fontSize: 16,
    fontFamily: 'Georgia',
    textAlign: 'center',
  },

  modalCloseButton: {
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignSelf: 'center',
  },

  modalCloseButtonText: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Georgia',
  },
});

// Platform-specific style variants
export const getStudyPlatformStyles = (isWeb: boolean) => ({
  header: isWeb ? StudyStyles.headerWeb : StudyStyles.header,
  sectionTitle: isWeb ? StudyStyles.sectionTitleWeb : StudyStyles.sectionTitle,
  section: isWeb ? StudyStyles.sectionWeb : StudyStyles.section,
  searchContainer: isWeb ? StudyStyles.searchContainerWeb : StudyStyles.searchContainer,
  searchInput: isWeb ? StudyStyles.searchInputWeb : StudyStyles.searchInput,
  searchInputContainer: isWeb ? StudyStyles.searchInputContainerWeb : StudyStyles.searchInputContainer,
  searchButton: isWeb ? StudyStyles.searchButtonWeb : StudyStyles.searchButton,
  bookCard: isWeb ? StudyStyles.bookCardWeb : StudyStyles.bookCard,
  booksGrid: isWeb ? StudyStyles.booksGridWeb : StudyStyles.booksGrid,
  categoryCard: isWeb ? StudyStyles.categoryCardCompact : StudyStyles.categoryCard,
  categoryText: isWeb ? StudyStyles.categoryTextCompact : StudyStyles.categoryText,
  resultCard: isWeb ? StudyStyles.resultCardWeb : StudyStyles.resultCard,
  resultText: isWeb ? StudyStyles.resultTextWeb : StudyStyles.resultText,
  resultsList: isWeb ? StudyStyles.resultsListWeb : StudyStyles.resultsList,
  emptyState: isWeb ? StudyStyles.emptyStateWeb : StudyStyles.emptyState,
  webCursor: isWeb ? { cursor: 'pointer' } : {},
});

export default StudyStyles;
