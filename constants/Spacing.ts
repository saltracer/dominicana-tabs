/**
 * Spacing System (8px Grid)
 * 
 * Standardized spacing values based on an 8px grid system.
 * Ensures consistent spacing throughout the application.
 */

export const spacing = {
  xs: 4,    // Tight elements (minimal spacing)
  sm: 8,    // Related items (small spacing)
  md: 16,   // Standard spacing (default)
  lg: 24,   // Section spacing (large)
  xl: 32,   // Major sections (extra large)
  xxl: 48,  // Hero sections (extra extra large)
  xxxl: 64, // Special large sections
} as const;

export type SpacingKey = keyof typeof spacing;

/**
 * Helper function to get spacing value
 */
export const getSpacing = (key: SpacingKey): number => {
  return spacing[key];
};

/**
 * Helper function to get multiple spacing values
 */
export const getSpacingMultiple = (multiplier: number, base: SpacingKey = 'sm'): number => {
  return spacing[base] * multiplier;
};

/**
 * Common spacing patterns
 */
export const spacingPatterns = {
  // Card patterns
  cardPadding: spacing.md,
  cardMargin: spacing.md,
  cardGap: spacing.md,
  
  // Section patterns
  sectionMargin: spacing.lg,
  sectionPadding: spacing.xl,
  
  // Hero patterns
  heroPadding: spacing.xxl,
  heroMargin: spacing.xl,
  
  // Button patterns
  buttonPaddingVertical: spacing.sm,
  buttonPaddingHorizontal: spacing.md,
  buttonMargin: spacing.sm,
  
  // Layout patterns
  contentPadding: spacing.md,
  contentPaddingLarge: spacing.lg,
  contentGap: spacing.md,
} as const;

export default spacing;

