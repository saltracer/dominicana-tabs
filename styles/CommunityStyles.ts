import { StyleSheet, Dimensions } from 'react-native';

const { width: screenWidth } = Dimensions.get('window');

export const CommunityStyles = StyleSheet.create({
  // CONTAINERS
  container: {
    flex: 1,
  },
  
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  tabContent: {
    flex: 1,
    paddingHorizontal: 16,
  },
  
  tabContentWeb: {
    flex: 1,
    paddingHorizontal: 24,
  },

  scrollView: {
    flex: 1,
  },

  // CARDS & SURFACES
  card: {
    borderRadius: 12,
    elevation: 2,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
    padding: 16,
    marginBottom: 16,
  },
  
  cardSmall: {
    borderRadius: 8,
    elevation: 1,
    boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.1)',
    padding: 12,
  },
  
  cardLarge: {
    borderRadius: 16,
    elevation: 4,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
    padding: 20,
  },

  calendarContainer: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    marginHorizontal: 16,
    elevation: 2,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
    alignSelf: 'stretch',
  },

  // TYPOGRAPHY
  pageTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 20,
    fontFamily: 'Georgia',
  },
  
  calendarTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 20,
    fontFamily: 'Georgia',
  },
  
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Georgia',
    marginBottom: 12,
  },
  
  subsectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Georgia',
    marginBottom: 8,
  },
  
  label: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'Georgia',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  
  loadingText: {
    fontSize: 16,
    fontFamily: 'Georgia',
  },
  
  bodyText: {
    fontSize: 16,
    fontFamily: 'Georgia',
    lineHeight: 24,
  },
  
  smallText: {
    fontSize: 12,
    fontFamily: 'Georgia',
  },

  resultsCount: {
    fontSize: 14,
    fontFamily: 'Georgia',
    marginBottom: 16,
    textAlign: 'center',
  },

  // INTERACTIVE ELEMENTS
  primaryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  
  secondaryButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
  },
  
  iconButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'transparent',
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

  // BADGES
  badge: {
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 6,
  },
  
  badgeSmall: {
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginRight: 4,
  },
  
  badgeText: {
    fontSize: 8,
    fontWeight: '700',
    fontFamily: 'Georgia',
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

  colorBadge: {
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 6,
  },
  
  // POSITIONING
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

  dateBadgesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 4,
    marginBottom: 8,
  },

  // MODALS
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  modalContent: {
    borderRadius: 16,
    padding: 20,
    width: '90%',
    maxWidth: 400,
  },
  
  modalContentLarge: {
    borderRadius: 16,
    width: '85%',
    maxHeight: '80%',
  },
  
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },

  modalContainer: {
    flex: 1,
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Georgia',
    flex: 1,
    textAlign: 'center',
  },

  closeButton: {
    padding: 8,
  },

  placeholder: {
    width: 40,
  },

  // SAINT CARDS
  saintCard: {
    width: '48%',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
  },

  saintCardWeb: {
    width: '23%', // 4 columns for web
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
    cursor: 'pointer',
  },

  saintHeader: {
    alignItems: 'center',
    marginBottom: 12,
    position: 'relative',
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

  // LAYOUT HELPERS
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  rowSpaceBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },

  gridRow: {
    justifyContent: 'space-between',
  },

  // SPACING
  marginBottomSmall: {
    marginBottom: 8,
  },
  
  marginBottomMedium: {
    marginBottom: 16,
  },
  
  marginBottomLarge: {
    marginBottom: 24,
  },

  // GRID & LISTS
  gridContainer: {
    paddingBottom: 20,
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

  // WEB-SPECIFIC STYLES
  webCursor: {
    cursor: 'pointer',
  },
  
  // PAGINATION
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

  paginationButtonWeb: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    marginHorizontal: 8,
    cursor: 'pointer',
  },
  
  paginationText: {
    fontSize: 14,
    fontFamily: 'Georgia',
    marginHorizontal: 16,
  },

  // FILTER SECTIONS
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

  // CALENDAR SPECIFIC
  calendarLegend: {
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
  },

  legendTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 12,
    fontFamily: 'Georgia',
  },

  legendItems: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
    marginBottom: 16,
  },

  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    minWidth: '45%',
  },

  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },

  legendText: {
    fontSize: 12,
    fontFamily: 'Georgia',
  },

  legendSubtitle: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
    fontFamily: 'Georgia',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  dominicanSymbol: {
    fontSize: 14,
    marginRight: 8,
    fontFamily: 'Georgia',
  },

  // CUSTOM DAY COMPONENTS
  customDayContainer: {
    width: 40,
    height: 50,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 4,
    margin: 2,
    borderRadius: 8,
  },

  customDayContainerWeb: {
    width: '100%',
    height: '100%',
    justifyContent: 'flex-start',
    borderRadius: 8,
    position: 'relative',
    margin: 0,
    paddingTop: 4,
  },

  dayNumber: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Georgia',
    marginBottom: 2,
  },

  feastIndicators: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 2,
  },

  feastIndicatorsContainer: {
    width: '100%',
    marginTop: 3,
    marginLeft: 0,
    marginBottom: 10,
  },

  rankBadge: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  rankText: {
    fontSize: 8,
    fontWeight: '700',
    color: 'white',
    fontFamily: 'Georgia',
  },

  dominicanIndicator: {
    fontSize: 12,
    fontFamily: 'Georgia',
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'black',
    color: 'white',
  },

  dominicanIndicatorContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  multipleFeastsIndicator: {
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 6,
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderWidth: 1,
  },

  multipleFeastsText: {
    fontSize: 8,
    fontWeight: '600',
    fontFamily: 'Georgia',
  },

  multipleFeastsContainer: {
    alignItems: 'flex-end',
    marginTop: 5,
  },

  feastNamePreview: {
    fontSize: 8,
    fontFamily: 'Georgia',
    textAlign: 'center',
    marginTop: 2,
    paddingHorizontal: 2,
  },

  feastNamePreviewWeb: {
    fontSize: 14,
    fontFamily: 'Georgia',
    textAlign: 'center',
    marginTop: 2,
    paddingHorizontal: 2,
  },

  // LAYOUT CONTAINERS FOR WEB
  mainContentContainer: {
    flexDirection: 'row',
    gap: 20,
    paddingHorizontal: 16,
    marginBottom: 16,
  },

  calendarSection: {
    flex: 1,
    minWidth: 400,
  },

  feastSection: {
    flex: 1,
    minWidth: 400,
    maxWidth: 500,
  },

  inlineFeastContainer: {
    marginTop: 20,
    borderRadius: 16,
    overflow: 'hidden',
    alignSelf: 'stretch',
  },

  sideFeastContainer: {
    height: '100%',
    borderRadius: 16,
    overflow: 'hidden',
  },

  placeholderPanel: {
    height: 400,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    elevation: 2,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
  },

  placeholderText: {
    fontSize: 16,
    fontFamily: 'Georgia',
    textAlign: 'center',
    fontStyle: 'italic',
  },

  // MAP CONTAINER
  mapContainer: {
    flex: 1,
    marginHorizontal: 8,
    marginTop: 8,
    borderRadius: 8,
    overflow: 'hidden',
  },
});

// Platform-specific style variants
export const getPlatformStyles = (isWeb: boolean) => ({
  tabContent: isWeb ? CommunityStyles.tabContentWeb : CommunityStyles.tabContent,
  saintCard: isWeb ? CommunityStyles.saintCardWeb : CommunityStyles.saintCard,
  paginationButton: isWeb ? CommunityStyles.paginationButtonWeb : CommunityStyles.paginationButton,
  customDayContainer: isWeb ? CommunityStyles.customDayContainerWeb : CommunityStyles.customDayContainer,
  feastNamePreview: isWeb ? CommunityStyles.feastNamePreviewWeb : CommunityStyles.feastNamePreview,
  cursor: isWeb ? CommunityStyles.webCursor : {},
});

// Utility functions for common style combinations
export const getCombinedStyles = (baseStyle: any, colorScheme: 'light' | 'dark', additionalStyles?: any) => {
  return [baseStyle, additionalStyles].filter(Boolean);
};

export default CommunityStyles;
