import { StyleSheet } from 'react-native';

/**
 * Liturgy Styles - Unified styling for Liturgy of the Hours
 * 
 * This file contains consistent styles for all prayer hour screens,
 * ensuring uniform typography and spacing across all liturgy content.
 */

export const LiturgyStyles = StyleSheet.create({
  // =============================================================================
  // LITURGY TYPOGRAPHY SYSTEM
  // =============================================================================
  
  // Base serif font family for all liturgy content
  liturgyFont: {
    fontFamily: 'Georgia',
  },

  // =============================================================================
  // HEADER STYLES
  // =============================================================================
  
  cleanHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  backButton: {
    marginRight: 12,
    padding: 8,
    borderRadius: 20,
  },
  headerContent: {
    flex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    fontFamily: 'Georgia',
  },
  subtitle: {
    fontSize: 13,
    marginTop: 2,
    fontFamily: 'Georgia',
    opacity: 0.8,
  },
  quickPickerButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },

  // =============================================================================
  // SECTION STYLES
  // =============================================================================
  
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
    fontFamily: 'Georgia',
  },

  // =============================================================================
  // CONTENT STYLES
  // =============================================================================

  rubric: {
    fontSize: 14,
    fontStyle: 'italic',
    marginBottom: 12,
    fontFamily: 'Georgia',
  },
  
  contentCard: {
    backgroundColor: 'transparent', // Will be overridden by theme colors
    padding: 10,
    borderRadius: 12,
    // marginBottom: 8,
  },
  
  // Main body text for prayers, psalms, readings
  contentBody: {
    fontSize: 16,
    lineHeight: 24,
    fontFamily: 'Georgia',
    // marginBottom: 5,
  },
  contentBodyLast: {
    fontSize: 16,
    lineHeight: 24,
    fontFamily: 'Georgia',
  },
  
  // Titles within content sections
  contentTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    fontFamily: 'Georgia',
  },
  
  // Secondary text (like "From the Book of Genesis")
  contentText: {
    fontSize: 14,
    fontStyle: 'italic',
    marginBottom: 12,
    fontFamily: 'Georgia',
  },
  
  // Antiphons - italicized serif font
  antiphon: {
    fontSize: 16,
    // fontWeight: '600',
    // fontStyle: 'italic',
    marginBottom: 12,
    fontFamily: 'Georgia',
    // textAlign: 'center',
  },
  
  // Responses and refrains
  response: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Georgia',
    textAlign: 'center',
    marginBottom: 8,
  },
  
  // Amen and concluding texts
  amen: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 8,
    fontFamily: 'Georgia',
  },
  
  // Psalm verses
  psalmVerse: {
    fontSize: 16,
    lineHeight: 24,
    fontFamily: 'Georgia',
    marginBottom: 8,
    textAlign: 'left',
  },
  
  // Canticle verses
  canticleVerse: {
    fontSize: 16,
    lineHeight: 24,
    fontFamily: 'Georgia',
    marginBottom: 8,
    textAlign: 'left',
  },
  
  // Reading text
  readingText: {
    fontSize: 16,
    lineHeight: 24,
    fontFamily: 'Georgia',
    marginBottom: 12,
    textAlign: 'left',
  },
  
  // Prayer text
  prayerText: {
    fontSize: 16,
    lineHeight: 24,
    fontFamily: 'Georgia',
    marginBottom: 12,
    textAlign: 'left',
  },
  
  // Intercessions and petitions
  intercession: {
    fontSize: 16,
    lineHeight: 24,
    fontFamily: 'Georgia',
    marginBottom: 8,
    textAlign: 'left',
  },
  
  // Verse markers (℣, ℟, etc.)
  verseMarker: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Georgia',
    marginRight: 8,
  },
  
  // =============================================================================
  // LOADING STATES
  // =============================================================================
  
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'Georgia',
  },
});

export default LiturgyStyles;
