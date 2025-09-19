import { StyleSheet } from 'react-native';
import { Colors } from '../constants/Colors';
import { GlobalStyles } from './GlobalStyles';

export const PrayerStyles = StyleSheet.create({
  // Include all GlobalStyles first
  ...GlobalStyles,
  // Prayer-specific containers (overrides)

  // Prayer-specific headers
  header: {
    paddingHorizontal: 16,
    paddingVertical: 24,
    alignItems: 'center',
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    ...GlobalStyles.textHuge,
    ...GlobalStyles.textBold,
    textAlign: 'center',
  },
  subtitle: {
    ...GlobalStyles.textMedium,
    marginTop: 8,
    textAlign: 'center',
  },
  backButton: {
    position: 'absolute',
    left: 16,
    top: 24,
    padding: 8,
    zIndex: 1,
  },

  // Prayer-specific sections
  sectionHeader: {
    ...GlobalStyles.row,
    marginBottom: 16,
  },

  // QUICK ACTIONS
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  quickActionCard: {
    ...GlobalStyles.card,
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
  },
  quickActionText: {
    ...GlobalStyles.textBody,
    ...GlobalStyles.textSemiBold,
    marginLeft: 8,
  },

  // PRAYER HOURS GRID
  prayerHoursGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  prayerHourCard: {
    ...GlobalStyles.card,
    width: '48%',
    borderWidth: 2,
    alignItems: 'center',
    marginBottom: 12,
  },
  prayerHourName: {
    ...GlobalStyles.textBody,
    ...GlobalStyles.textSemiBold,
    textAlign: 'center',
    marginTop: 8,
  },
  prayerHourTime: {
    ...GlobalStyles.textSmall,
    marginTop: 4,
  },
  chevron: {
    position: 'absolute',
    right: 12,
    top: '50%',
    marginTop: -8,
  },

  // ROSARY COMPONENTS
  rosaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  rosaryCard: {
    ...GlobalStyles.card,
    width: '48%',
    position: 'relative',
  },
  mysteryCardContent: {
    padding: 16,
    alignItems: 'center',
    paddingBottom: 50, // Space for play button
  },
  rosaryMysteryName: {
    ...GlobalStyles.textBody,
    ...GlobalStyles.textSemiBold,
    textAlign: 'center',
    marginTop: 8,
  },
  rosaryMysteryDay: {
    ...GlobalStyles.textSmall,
    marginTop: 4,
    textAlign: 'center',
  },
  mysteriesList: {
    marginTop: 12,
    width: '100%',
  },
  mysteryItem: {
    fontSize: 11,
    textAlign: 'center',
    marginTop: 2,
    fontFamily: 'Georgia',
  },
  playButton: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },

  // ROSARY FORM TOGGLE
  toggleAndInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  toggleLabel: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Georgia',
    marginHorizontal: 8,
  },
  infoButton: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    marginLeft: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  closeInstructionsButton: {
    padding: 4,
    marginLeft: 'auto',
  },

  // PRAYER INSTRUCTIONS
  instructionCard: {
    padding: 20,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  instructionDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
    fontFamily: 'Georgia',
    fontStyle: 'italic',
  },
  prayerSteps: {
    gap: 12,
  },
  prayerStep: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  stepNumberText: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'Georgia',
  },
  prayerText: {
    fontSize: 14,
    lineHeight: 20,
    flex: 1,
    fontFamily: 'Georgia',
  },

  // PRAYER INTERFACE
  prayerInterface: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  prayerCard: {
    ...GlobalStyles.cardLarge,
  },
  prayerHeader: {
    ...GlobalStyles.rowSpaceBetween,
    marginBottom: 16,
  },
  exitButton: {
    ...GlobalStyles.iconButton,
  },
  prayerTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  prayerTitle: {
    ...GlobalStyles.textLarge,
    ...GlobalStyles.textBold,
    textAlign: 'center',
    marginBottom: 4,
  },
  mysteryInfoContainer: {
    alignItems: 'center',
    marginTop: 4,
  },
  mysterySetName: {
    ...GlobalStyles.textBody,
    ...GlobalStyles.textSemiBold,
    textAlign: 'center',
  },
  currentMystery: {
    ...GlobalStyles.textSmall,
    textAlign: 'center',
    marginTop: 2,
    fontStyle: 'italic',
  },
  decadeProgress: {
    ...GlobalStyles.row,
    marginTop: 4,
  },
  decadeText: {
    fontSize: 11,
    fontFamily: 'Georgia',
    fontWeight: '500',
  },
  hailMaryText: {
    fontSize: 11,
    fontFamily: 'Georgia',
    fontWeight: '500',
    marginLeft: 4,
  },
  progressContainer: {
    minWidth: 60,
    alignItems: 'flex-end',
  },
  progressText: {
    ...GlobalStyles.textSmall,
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
    marginBottom: 20,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  prayerContent: {
    marginBottom: 24,
    minHeight: 120,
    justifyContent: 'center',
  },
  prayerControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  controlButton: {
    ...GlobalStyles.card,
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    marginBottom: 0,
  },
  prevButton: {
    flexDirection: 'row',
  },
  nextButton: {
    flexDirection: 'row',
  },
  controlButtonText: {
    ...GlobalStyles.textMedium,
    ...GlobalStyles.textSemiBold,
    marginHorizontal: 8,
  },

  // DEVOTIONS SECTION
  devotionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  devotionCard: {
    ...GlobalStyles.card,
    width: '48%',
  },
  devotionHeader: {
    ...GlobalStyles.rowSpaceBetween,
    marginBottom: 8,
  },
  devotionName: {
    ...GlobalStyles.textBody,
    ...GlobalStyles.textSemiBold,
    marginBottom: 4,
  },
  devotionDescription: {
    ...GlobalStyles.textSmall,
    lineHeight: 16,
  },
  duration: {
    ...GlobalStyles.textXSmall,
  },
  comingSoonCard: {
    alignItems: 'center',
    padding: 32,
    borderRadius: 16,
    marginTop: 16,
  },
  comingSoonTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
    fontFamily: 'Georgia',
    textAlign: 'center',
  },
  comingSoonText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    fontFamily: 'Georgia',
  },

  // LITURGY CONTENT CARDS
  contentCard: {
    ...GlobalStyles.card,
    padding: 20,
  },
  contentBody: {
    ...GlobalStyles.bodyText,
    marginBottom: 12,
  },
  contentBodyLast: {
    ...GlobalStyles.bodyText,
  },

  // PSALM COMPONENTS
  psalmHeader: {
    ...GlobalStyles.rowSpaceBetween,
    marginBottom: 16,
  },
  psalmTitle: {
    ...GlobalStyles.textLarge,
    ...GlobalStyles.textSemiBold,
  },
  psalmNumber: {
    ...GlobalStyles.textBody,
  },
  psalmVerse: {
    ...GlobalStyles.bodyText,
    marginBottom: 8,
    textAlign: 'left',
  },
  psalmAntiphon: {
    ...GlobalStyles.bodyText,
    fontStyle: 'italic',
    marginBottom: 16,
    textAlign: 'center',
  },

  // CANTICLE COMPONENTS
  canticleTitle: {
    ...GlobalStyles.textLarge,
    ...GlobalStyles.textSemiBold,
    marginBottom: 12,
    textAlign: 'center',
  },
  canticleVerse: {
    ...GlobalStyles.bodyText,
    marginBottom: 8,
    textAlign: 'left',
  },

  // READING COMPONENTS
  readingTitle: {
    ...GlobalStyles.textLarge,
    ...GlobalStyles.textSemiBold,
    marginBottom: 12,
    textAlign: 'center',
  },
  readingText: {
    ...GlobalStyles.bodyText,
    marginBottom: 12,
    textAlign: 'left',
  },
  readingResponse: {
    ...GlobalStyles.bodyText,
    ...GlobalStyles.textSemiBold,
    textAlign: 'center',
    marginTop: 8,
  },

  // PRAYER COMPONENTS
  prayerTitleComponent: {
    ...GlobalStyles.textLarge,
    ...GlobalStyles.textSemiBold,
    marginBottom: 12,
    textAlign: 'center',
  },
  prayerBodyText: {
    ...GlobalStyles.bodyText,
    marginBottom: 12,
    textAlign: 'left',
  },

  // LANGUAGE SELECTOR
  languageSelector: {
    ...GlobalStyles.row,
    justifyContent: 'center',
    marginBottom: 16,
    gap: 12,
  },
  languageButton: {
    ...GlobalStyles.primaryButton,
  },
  languageButtonText: {
    ...GlobalStyles.textBody,
    ...GlobalStyles.textSemiBold,
  },

  // INTERACTIVE ELEMENTS
  interactiveCard: {
    ...GlobalStyles.card,
    padding: 20,
  },
  cardHeader: {
    ...GlobalStyles.rowSpaceBetween,
    marginBottom: 12,
  },
  cardTitle: {
    ...GlobalStyles.textLarge,
    ...GlobalStyles.textSemiBold,
  },
  cardContent: {
    ...GlobalStyles.bodyText,
  },

  // PRAYER FLOW INTERFACE
  flowContainer: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  flowCard: {
    borderRadius: 16,
    padding: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  flowHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  flowTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  flowTitle: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'Georgia',
    textAlign: 'center',
    marginBottom: 4,
  },
  flowContent: {
    marginBottom: 24,
    minHeight: 120,
    justifyContent: 'center',
  },
  flowControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  flowButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  flowButtonText: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Georgia',
    marginHorizontal: 8,
  },

  // PROGRESS INDICATORS
  progressIndicator: {
    height: 4,
    borderRadius: 2,
    marginBottom: 20,
  },
  progressFillBar: {
    height: '100%',
    borderRadius: 2,
  },
  progressInfo: {
    minWidth: 60,
    alignItems: 'flex-end',
  },
  progressLabel: {
    fontSize: 12,
    fontFamily: 'Georgia',
  },
});

export default PrayerStyles;
