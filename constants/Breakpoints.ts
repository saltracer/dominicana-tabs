/**
 * Responsive Breakpoint System
 * 
 * Standard breakpoints for responsive design across the web application.
 * Based on common device sizes and industry standards (Bootstrap-style).
 */

export const breakpoints = {
  xs: 0,      // Extra small devices (portrait phones)
  sm: 576,    // Small devices (landscape phones)
  md: 768,    // Medium devices (tablets)
  lg: 992,    // Large devices (desktops)
  xl: 1200,   // Extra large devices (large desktops)
  xxl: 1400,  // Extra extra large devices (wide screens)
} as const;

export type Breakpoint = keyof typeof breakpoints;

/**
 * Helper function to get breakpoint value
 */
export const getBreakpoint = (key: Breakpoint): number => {
  return breakpoints[key];
};

/**
 * Media query strings for CSS-in-JS
 */
export const mediaQueries = {
  xs: `@media (min-width: ${breakpoints.xs}px)`,
  sm: `@media (min-width: ${breakpoints.sm}px)`,
  md: `@media (min-width: ${breakpoints.md}px)`,
  lg: `@media (min-width: ${breakpoints.lg}px)`,
  xl: `@media (min-width: ${breakpoints.xl}px)`,
  xxl: `@media (min-width: ${breakpoints.xxl}px)`,
} as const;

/**
 * Container max-widths for each breakpoint
 */
export const containerMaxWidths = {
  xs: '100%',
  sm: 540,
  md: 720,
  lg: 960,
  xl: 1140,
  xxl: 1320,
} as const;

export default breakpoints;

