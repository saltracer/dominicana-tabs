import { StyleSheet } from 'react-native';
import { Colors } from '../constants/Colors';

export const PreachingStyles = StyleSheet.create({
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

  // SUBSCRIPTION BANNER
  subscriptionBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.light.info,
    padding: 12,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 8,
  },
  subscriptionText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    fontFamily: 'Georgia',
  },
  subscribeButton: {
    backgroundColor: Colors.light.surface,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 6,
  },
  subscribeButtonText: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Georgia',
  },

  // TAB NAVIGATION
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  tabText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Georgia',
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
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    fontSize: 16,
    fontFamily: 'Georgia',
  },

  // TYPOGRAPHY
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
    fontFamily: 'Georgia',
  },

  // REFLECTIONS SECTION
  reflectionsList: {
    marginTop: 8,
  },
  reflectionCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  reflectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  reflectionInfo: {
    flex: 1,
  },
  reflectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
    fontFamily: 'Georgia',
  },
  reflectionAuthor: {
    fontSize: 14,
    fontFamily: 'Georgia',
  },
  reflectionExcerpt: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
    fontFamily: 'Georgia',
  },
  reflectionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  reflectionDate: {
    fontSize: 12,
    fontFamily: 'Georgia',
  },

  // BLOG SECTION
  blogList: {
    marginTop: 8,
  },
  blogCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  blogHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  blogInfo: {
    flex: 1,
  },
  blogTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
    fontFamily: 'Georgia',
  },
  blogAuthor: {
    fontSize: 14,
    fontFamily: 'Georgia',
  },
  blogExcerpt: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
    fontFamily: 'Georgia',
  },
  blogFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  blogDate: {
    fontSize: 12,
    fontFamily: 'Georgia',
  },
  blogCategory: {
    backgroundColor: Colors.light.primary + '20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  blogCategoryText: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'Georgia',
  },

  // DOMINICAN BADGES
  dominicanBadge: {
    backgroundColor: Colors.light.primary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  dominicanBadgeText: {
    color: Colors.light.dominicanWhite,
    fontSize: 10,
    fontWeight: '700',
    fontFamily: 'Georgia',
  },

  // SUBSCRIPTION REQUIRED SECTION
  subscriptionRequired: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  subscriptionRequiredTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 8,
    fontFamily: 'Georgia',
  },
  subscriptionRequiredText: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 32,
    fontFamily: 'Georgia',
    lineHeight: 24,
  },
  subscribeButtonLarge: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
  },
  subscribeButtonLargeText: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'Georgia',
  },

  // AUDIO CONTENT SECTION
  audioContent: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  audioContentText: {
    fontSize: 16,
    fontFamily: 'Georgia',
  },
});

export default PreachingStyles;
