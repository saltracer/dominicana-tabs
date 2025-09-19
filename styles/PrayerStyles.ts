import { StyleSheet } from 'react-native';
import { Colors } from '../constants/Colors';

export const PrayerStyles = StyleSheet.create({
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
  tabContent: {
    paddingHorizontal: 16,
  },

  // LOADING STATES
  loadingText: {
    fontSize: 16,
    fontFamily: 'Georgia',
  },

  // HEADERS
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
    fontSize: 28,
    fontWeight: '700',
    fontFamily: 'Georgia',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    marginTop: 8,
    fontFamily: 'Georgia',
    textAlign: 'center',
  },
  backButton: {
    position: 'absolute',
    left: 16,
    top: 24,
    padding: 8,
    zIndex: 1,
  },

  // SECTIONS & LAYOUT
  section: {
    marginVertical: 16,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginLeft: 8,
    fontFamily: 'Georgia',
  },

  // QUICK ACTIONS
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  quickActionCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
    fontFamily: 'Georgia',
  },

  // PRAYER HOURS GRID
  prayerHoursGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  prayerHourCard: {
    width: '48%',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  prayerHourName: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 8,
    fontFamily: 'Georgia',
  },
  prayerHourTime: {
    fontSize: 12,
    marginTop: 4,
    fontFamily: 'Georgia',
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
    width: '48%',
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    position: 'relative',
  },
  mysteryCardContent: {
    padding: 16,
    alignItems: 'center',
    paddingBottom: 50, // Space for play button
  },
  rosaryMysteryName: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 8,
    fontFamily: 'Georgia',
  },
  rosaryMysteryDay: {
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
    fontFamily: 'Georgia',
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
    borderRadius: 16,
    padding: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  prayerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  exitButton: {
    padding: 8,
  },
  prayerTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  prayerTitle: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'Georgia',
    textAlign: 'center',
    marginBottom: 4,
  },
  mysteryInfoContainer: {
    alignItems: 'center',
    marginTop: 4,
  },
  mysterySetName: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Georgia',
    textAlign: 'center',
  },
  currentMystery: {
    fontSize: 12,
    fontFamily: 'Georgia',
    textAlign: 'center',
    marginTop: 2,
    fontStyle: 'italic',
  },
  decadeProgress: {
    flexDirection: 'row',
    alignItems: 'center',
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
    fontSize: 12,
    fontFamily: 'Georgia',
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
  prevButton: {
    flexDirection: 'row',
  },
  nextButton: {
    flexDirection: 'row',
  },
  controlButtonText: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Georgia',
    marginHorizontal: 8,
  },

  // DEVOTIONS SECTION
  devotionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  devotionCard: {
    width: '48%',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  devotionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  devotionName: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
    fontFamily: 'Georgia',
  },
  devotionDescription: {
    fontSize: 12,
    lineHeight: 16,
    fontFamily: 'Georgia',
  },
  duration: {
    fontSize: 10,
    fontFamily: 'Georgia',
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
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  contentBody: {
    fontSize: 16,
    lineHeight: 24,
    fontFamily: 'Georgia',
    marginBottom: 12,
  },
  contentBodyLast: {
    fontSize: 16,
    lineHeight: 24,
    fontFamily: 'Georgia',
  },

  // PSALM COMPONENTS
  psalmHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  psalmTitle: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Georgia',
  },
  psalmNumber: {
    fontSize: 14,
    fontFamily: 'Georgia',
  },
  psalmVerse: {
    fontSize: 16,
    lineHeight: 24,
    fontFamily: 'Georgia',
    marginBottom: 8,
    textAlign: 'left',
  },
  psalmAntiphon: {
    fontSize: 16,
    fontStyle: 'italic',
    lineHeight: 24,
    fontFamily: 'Georgia',
    marginBottom: 16,
    textAlign: 'center',
  },

  // CANTICLE COMPONENTS
  canticleTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    fontFamily: 'Georgia',
    textAlign: 'center',
  },
  canticleVerse: {
    fontSize: 16,
    lineHeight: 24,
    fontFamily: 'Georgia',
    marginBottom: 8,
    textAlign: 'left',
  },

  // READING COMPONENTS
  readingTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    fontFamily: 'Georgia',
    textAlign: 'center',
  },
  readingText: {
    fontSize: 16,
    lineHeight: 24,
    fontFamily: 'Georgia',
    marginBottom: 12,
    textAlign: 'left',
  },
  readingResponse: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 24,
    fontFamily: 'Georgia',
    textAlign: 'center',
    marginTop: 8,
  },

  // PRAYER COMPONENTS
  prayerTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    fontFamily: 'Georgia',
    textAlign: 'center',
  },
  prayerBodyText: {
    fontSize: 16,
    lineHeight: 24,
    fontFamily: 'Georgia',
    marginBottom: 12,
    textAlign: 'left',
  },

  // LANGUAGE SELECTOR
  languageSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    gap: 12,
  },
  languageButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  languageButtonText: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Georgia',
  },

  // INTERACTIVE ELEMENTS
  interactiveCard: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Georgia',
  },
  cardContent: {
    fontSize: 16,
    lineHeight: 24,
    fontFamily: 'Georgia',
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
