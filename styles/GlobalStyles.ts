import { StyleSheet } from 'react-native';

/**
 * Global Styles - Shared styling patterns extracted from component-specific stylesheets
 * 
 * This file contains commonly used styles that appear across multiple components
 * to reduce duplication and ensure consistency.
 */

const fontFamilies = StyleSheet.create({
  fontFamilySerif: {
    fontFamily: 'Georgia',
  },
  fontFamilySansSerif: {
    fontFamily: 'sans-serif',
  },
});

const textStyles = StyleSheet.create({
  textBase: {
    ...fontFamilies.fontFamilySerif,
  },
});

export const GlobalStyles = StyleSheet.create({
  // =============================================================================
  // TYPOGRAPHY SYSTEM
  // =============================================================================
  
  // Base text styles using Georgia font (used 364+ times across the app)

  
  // Font size variations (most common sizes)
  textXSmall: {
    fontSize: 10,
    ...textStyles.textBase,
  },
  textSmall: {
    fontSize: 12,
    ...textStyles.textBase,
  },
  textBody: {
    fontSize: 14,
    ...textStyles.textBase,
  },
  textMedium: {
    fontSize: 16,
    ...textStyles.textBase,
    lineHeight: 24,
  },
  textLarge: {
    fontSize: 18,
    ...textStyles.textBase,
  },
  textXLarge: {
    fontSize: 20,
    ...textStyles.textBase,
  },
  textXXLarge: {
    fontSize: 24,
    ...textStyles.textBase,
  },
  textHuge: {
    fontSize: 28,
    ...textStyles.textBase,
  },
  
  // Font weight variations
  textRegular: {
    fontWeight: '400',
  },
  textMediumWeight: {
    fontWeight: '500',
  },
  textSemiBold: {
    fontWeight: '600',
  },
  textBold: {
    fontWeight: '700',
  },
  
  // Common text combinations
  bodyText: {
    fontSize: 16,
    ...textStyles.textBase,
    lineHeight: 24,
  },
  loadingText: {
    fontSize: 16,
    ...textStyles.textBase,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    ...textStyles.textBase,
    marginBottom: 16,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: '700',
    ...textStyles.textBase,
    marginBottom: 20,
  },
  
  // =============================================================================
  // LAYOUT CONTAINERS
  // =============================================================================
  
  // Base containers (used across all style files)
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
  
  // Content containers with consistent padding
  tabContent: {
    paddingHorizontal: 16,
  },
  tabContentLarge: {
    paddingHorizontal: 20,
  },
  section: {
    marginVertical: 16,
    paddingHorizontal: 16,
  },
  
  // =============================================================================
  // CARD & SURFACE SYSTEM
  // =============================================================================
  
  // Standard card with common shadow (used 60+ times)
  card: {
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    padding: 16,
    marginBottom: 16,
  },
  
  // Card size variations
  cardSmall: {
    borderRadius: 8,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    padding: 12,
  },
  
  cardLarge: {
    borderRadius: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    padding: 20,
  },
  
  // Content cards without margin
  contentCard: {
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    padding: 16,
  },
  
  // =============================================================================
  // INTERACTIVE ELEMENTS
  // =============================================================================
  
  // Button styles
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
  
  // Search components
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
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
  
  // =============================================================================
  // MODAL SYSTEM
  // =============================================================================
  
  // Common modal patterns
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
    paddingVertical: 12,
    borderBottomWidth: 1,
    marginBottom: 16,
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
  
  // =============================================================================
  // BADGE SYSTEM
  // =============================================================================
  
  // Standard badge
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
  
  // Dominican-specific badge (used across multiple files)
  dominicanBadge: {
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 6,
  },
  
  // =============================================================================
  // LAYOUT UTILITIES
  // =============================================================================
  
  // Flexbox utilities
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
  
  // Spacing utilities
  marginBottomSmall: {
    marginBottom: 8,
  },
  
  marginBottomMedium: {
    marginBottom: 16,
  },
  
  marginBottomLarge: {
    marginBottom: 24,
  },
  
  // =============================================================================
  // EMPTY STATES
  // =============================================================================
  
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
  
  // =============================================================================
  // WEB-SPECIFIC UTILITIES
  // =============================================================================
  
  webCursor: {
    cursor: 'pointer',
  },
  
  // =============================================================================
  // GRID SYSTEMS
  // =============================================================================
  
  gridContainer: {
    paddingBottom: 20,
  },
  
  gridRow: {
    justifyContent: 'space-between',
  },
});

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Combine base text style with additional styles
 */
export const combineTextStyles = (...styles: any[]) => {
  return [textStyles.textBase, ...styles].filter(Boolean);
};

/**
 * Create card style with theme colors
 */
export const createCardStyle = (backgroundColor: string, additionalStyles?: any) => {
  return [
    GlobalStyles.card,
    { backgroundColor },
    additionalStyles
  ].filter(Boolean);
};

/**
 * Create button style with theme colors
 */
export const createButtonStyle = (
  backgroundColor: string, 
  borderColor: string, 
  additionalStyles?: any
) => {
  return [
    GlobalStyles.primaryButton,
    { backgroundColor, borderColor },
    additionalStyles
  ].filter(Boolean);
};

export default GlobalStyles;
