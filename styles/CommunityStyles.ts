import { StyleSheet, Dimensions } from 'react-native';
import { GlobalStyles } from './GlobalStyles';

const { width: screenWidth } = Dimensions.get('window');

export const CommunityStyles = StyleSheet.create({
  // Include all GlobalStyles first
  ...GlobalStyles,
  
  // Override or add community-specific styles
  tabContentWeb: {
    flex: 1,
    paddingHorizontal: 24,
  },

  // Community-specific containers
  calendarContainer: {
    ...GlobalStyles.card,
    marginHorizontal: 16,
    alignSelf: 'stretch',
  },

  // Community-specific typography (only unique styles)
  calendarTitle: {
    ...GlobalStyles.pageTitle,
  },
  
  subsectionTitle: {
    ...GlobalStyles.textMedium,
    ...GlobalStyles.textSemiBold,
    marginBottom: 8,
  },
  
  label: {
    ...GlobalStyles.textSmall,
    ...GlobalStyles.textSemiBold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },

  resultsCount: {
    ...GlobalStyles.textBody,
    marginBottom: 16,
    textAlign: 'center',
  },

  // Community-specific badges
  dominicanBadge: {
    ...GlobalStyles.badge,
    borderRadius: 12,
  },

  doctorBadge: {
    ...GlobalStyles.badge,
    borderRadius: 12,
  },

  colorBadge: {
    ...GlobalStyles.badge,
    borderRadius: 12,
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

  // Community-specific modal variations
  modalContentLarge: {
    ...GlobalStyles.modalContent,
    width: '85%',
    maxHeight: '80%',
  },

  modalContainer: {
    flex: 1,
  },

  placeholder: {
    width: 40,
  },

  // SAINT CARDS
  saintCard: {
    ...GlobalStyles.card,
    width: '48%',
  },

  saintCardWeb: {
    ...GlobalStyles.card,
    width: '23%', // 4 columns for web
    cursor: 'pointer',
  },

  saintHeader: {
    alignItems: 'center',
    marginBottom: 12,
    position: 'relative',
  },

  saintName: {
    ...GlobalStyles.textMedium,
    ...GlobalStyles.textBold,
    textAlign: 'center',
    marginBottom: 4,
  },

  saintFeastDay: {
    ...GlobalStyles.textSmall,
    textAlign: 'center',
    marginBottom: 4,
  },

  saintPatronage: {
    fontSize: 11,
    textAlign: 'center',
    fontFamily: 'Georgia',
    lineHeight: 14,
    marginBottom: 4,
  },

  saintYears: {
    ...GlobalStyles.textXSmall,
    textAlign: 'center',
  },

  // Community-specific layout
  gridRow: {
    justifyContent: 'space-between',
  },
  
  // PAGINATION
  pagination: {
    ...GlobalStyles.row,
    justifyContent: 'center',
    paddingVertical: 16,
  },
  
  paginationButton: {
    ...GlobalStyles.primaryButton,
    marginHorizontal: 8,
  },

  paginationButtonWeb: {
    ...GlobalStyles.primaryButton,
    marginHorizontal: 8,
    cursor: 'pointer',
  },
  
  paginationText: {
    ...GlobalStyles.textBody,
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
    ...GlobalStyles.textMedium,
    ...GlobalStyles.textSemiBold,
    marginBottom: 8,
  },

  filterScroll: {
    flexDirection: 'row',
  },

  sortScroll: {
    flexDirection: 'row',
  },
  
  filterButton: {
    ...GlobalStyles.row,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  
  filterButtonText: {
    ...GlobalStyles.textSmall,
    marginLeft: 4,
  },

  sortButton: {
    ...GlobalStyles.row,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },

  sortButtonText: {
    ...GlobalStyles.textSmall,
    marginLeft: 4,
  },

  // CALENDAR SPECIFIC
  calendarLegend: {
    ...GlobalStyles.card,
    marginTop: 16,
  },

  legendTitle: {
    ...GlobalStyles.textBody,
    ...GlobalStyles.textBold,
    marginBottom: 12,
  },

  legendItems: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
    marginBottom: 16,
  },

  legendItem: {
    ...GlobalStyles.row,
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
    ...GlobalStyles.textSmall,
  },

  legendSubtitle: {
    ...GlobalStyles.textSmall,
    ...GlobalStyles.textSemiBold,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  dominicanSymbol: {
    ...GlobalStyles.textBody,
    marginRight: 8,
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
    ...GlobalStyles.textMedium,
    ...GlobalStyles.textSemiBold,
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
    ...GlobalStyles.textBody,
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
    ...GlobalStyles.textMedium,
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
