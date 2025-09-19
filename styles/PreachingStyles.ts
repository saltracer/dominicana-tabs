import { StyleSheet } from 'react-native';
import { Colors } from '../constants/Colors';
import { GlobalStyles } from './GlobalStyles';

export const PreachingStyles = StyleSheet.create({
  // Include all GlobalStyles first
  ...GlobalStyles,
  // Preaching-specific containers (overrides)

  // SUBSCRIPTION BANNER
  subscriptionBanner: {
    ...GlobalStyles.rowSpaceBetween,
    backgroundColor: Colors.light.info,
    padding: 12,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 8,
  },
  subscriptionText: {
    flex: 1,
    marginLeft: 8,
    ...GlobalStyles.textBody,
  },
  subscribeButton: {
    backgroundColor: Colors.light.surface,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 6,
  },
  subscribeButtonText: {
    ...GlobalStyles.textBody,
    ...GlobalStyles.textSemiBold,
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
    ...GlobalStyles.row,
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  tabText: {
    marginLeft: 6,
    ...GlobalStyles.textBody,
    ...GlobalStyles.textSemiBold,
  },

  // Preaching-specific search (uses globals)

  // Preaching-specific typography (uses globals)

  // REFLECTIONS SECTION
  reflectionsList: {
    marginTop: 8,
  },
  reflectionCard: {
    ...GlobalStyles.card,
  },
  reflectionHeader: {
    ...GlobalStyles.rowSpaceBetween,
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  reflectionInfo: {
    flex: 1,
  },
  reflectionTitle: {
    ...GlobalStyles.textLarge,
    ...GlobalStyles.textBold,
    marginBottom: 4,
  },
  reflectionAuthor: {
    ...GlobalStyles.textBody,
  },
  reflectionExcerpt: {
    ...GlobalStyles.textBody,
    lineHeight: 20,
    marginBottom: 12,
  },
  reflectionFooter: {
    ...GlobalStyles.rowSpaceBetween,
  },
  reflectionDate: {
    ...GlobalStyles.textSmall,
  },

  // BLOG SECTION
  blogList: {
    marginTop: 8,
  },
  blogCard: {
    ...GlobalStyles.card,
  },
  blogHeader: {
    ...GlobalStyles.rowSpaceBetween,
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  blogInfo: {
    flex: 1,
  },
  blogTitle: {
    ...GlobalStyles.textLarge,
    ...GlobalStyles.textBold,
    marginBottom: 4,
  },
  blogAuthor: {
    ...GlobalStyles.textBody,
  },
  blogExcerpt: {
    ...GlobalStyles.textBody,
    lineHeight: 20,
    marginBottom: 12,
  },
  blogFooter: {
    ...GlobalStyles.rowSpaceBetween,
  },
  blogDate: {
    ...GlobalStyles.textSmall,
  },
  blogCategory: {
    ...GlobalStyles.badge,
    backgroundColor: Colors.light.primary + '20',
    borderRadius: 6,
  },
  blogCategoryText: {
    ...GlobalStyles.textSmall,
    ...GlobalStyles.textSemiBold,
  },

  // DOMINICAN BADGES
  dominicanBadge: {
    ...GlobalStyles.badgeSmall,
    backgroundColor: Colors.light.primary,
    borderRadius: 6,
  },
  dominicanBadgeText: {
    color: Colors.light.dominicanWhite,
    ...GlobalStyles.textXSmall,
    ...GlobalStyles.textBold,
  },

  // SUBSCRIPTION REQUIRED SECTION
  subscriptionRequired: {
    ...GlobalStyles.centerContent,
    paddingVertical: 40,
  },
  subscriptionRequiredTitle: {
    ...GlobalStyles.sectionTitle,
    marginTop: 16,
    marginBottom: 8,
  },
  subscriptionRequiredText: {
    ...GlobalStyles.textMedium,
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 32,
  },
  subscribeButtonLarge: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
  },
  subscribeButtonLargeText: {
    ...GlobalStyles.textLarge,
    ...GlobalStyles.textBold,
  },

  // AUDIO CONTENT SECTION
  audioContent: {
    ...GlobalStyles.centerContent,
    paddingVertical: 40,
  },
  audioContentText: {
    ...GlobalStyles.textMedium,
  },
});

export default PreachingStyles;
