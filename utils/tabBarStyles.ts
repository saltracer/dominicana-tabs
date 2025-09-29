import { Platform, ViewStyle } from 'react-native';
import { Colors } from '../constants/Colors';

/**
 * Centralized tab bar style utilities to avoid DRY violations
 */

export interface TabBarStyleParams {
  colorScheme?: 'light' | 'dark';
  insets: {
    bottom: number;
  };
  isHidden?: boolean;
}

/**
 * Get the standard tab bar style used throughout the app
 */
export function getTabBarStyle({ 
  colorScheme = 'light', 
  insets, 
  isHidden = false 
}: TabBarStyleParams): ViewStyle {
  if (isHidden) {
    return { display: 'none' };
  }

  return {
    backgroundColor: Colors[colorScheme].surface,
    borderTopColor: Colors[colorScheme].border,
    borderTopWidth: 1,
    paddingBottom: Math.max(insets.bottom, 10),
    paddingTop: 10,
    height: 60 + Math.max(insets.bottom, 10),
    paddingHorizontal: 10,
    zIndex: 1001,
    ...(Platform.OS === 'ios' && {
      marginBottom: -1, // iOS specific positioning fix
    }),
  };
}

/**
 * Get the hidden tab bar style (for prayer/community tabs)
 */
export function getHiddenTabBarStyle(): ViewStyle {
  return { display: 'none' };
}
