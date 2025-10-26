import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { useTheme } from './ThemeProvider';

interface ReadingAnnotationOverlayProps {
  isBookmarked: boolean;
  onAddBookmark: () => void;
  onRemoveBookmark: () => void;
  onAddHighlight: () => void;
  onViewAnnotations: () => void;
  disabled?: boolean;
  visible?: boolean;
}

export const ReadingAnnotationOverlay: React.FC<ReadingAnnotationOverlayProps> = ({
  isBookmarked,
  onAddBookmark,
  onRemoveBookmark,
  onAddHighlight,
  onViewAnnotations,
  disabled = false,
  visible = true,
}) => {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  const handleAction = (action: () => void) => {
    action();
    setIsExpanded(false);
  };

  const cardBg = colorScheme === 'dark' ? 'rgba(32, 29, 29, 0.95)' : 'rgba(255, 255, 255, 0.95)';
  // Primary color with opacity for bookmarked state
  const primaryWithOpacity = colorScheme === 'dark' ? 'rgba(184, 84, 80, 0.95)' : 'rgba(140, 21, 21, 0.95)';
  
  const actionButtons = [
    {
      icon: isBookmarked ? 'bookmark' : 'bookmark-outline',
      action: isBookmarked ? onRemoveBookmark : onAddBookmark,
      color: isBookmarked ? colors.dominicanWhite : colors.primary,
      backgroundColor: isBookmarked ? primaryWithOpacity : cardBg,
    },
    {
      icon: 'color-fill-outline',
      action: onAddHighlight,
      color: colors.accent,
      backgroundColor: cardBg,
    },
    {
      icon: 'list',
      action: onViewAnnotations,
      color: colors.info,
      backgroundColor: cardBg,
    },
  ];

  // Don't render if not visible
  if (!visible) {
    return null;
  }

  return (
    <View style={[styles.container, disabled && styles.disabled]}>
      {/* Action Buttons (shown when expanded) */}
      {isExpanded && (
        <View style={styles.actionsMenu}>
          {actionButtons.map((button, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.actionButton, { backgroundColor: button.backgroundColor }]}
              onPress={() => handleAction(button.action)}
            >
              <Ionicons name={button.icon as any} size={22} color={button.color} />
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Main FAB */}
      <TouchableOpacity
        style={[
          styles.fab,
          { 
            backgroundColor: colorScheme === 'dark' ? 'rgba(184, 84, 80, 0.4)' : 'rgba(140, 21, 21, 0.4)',
          }
        ]}
        onPress={toggleExpanded}
      >
        <Ionicons 
          name={isExpanded ? 'close' : 'add'} 
          size={28} 
          color={colors.dominicanWhite} 
        />
      </TouchableOpacity>

      {/* Backdrop (shown when expanded) */}
      {isExpanded && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 998,
          }}
          onClick={toggleExpanded}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'fixed' as any,
    bottom: 90,
    right: 20,
    zIndex: 999,
  },
  disabled: {
    opacity: 0.5,
    pointerEvents: 'none' as any,
  },
  actionsMenu: {
    position: 'absolute' as any,
    bottom: 64,
    right: 0,
    gap: 8,
    display: 'flex',
    flexDirection: 'column' as any,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.25)',
    cursor: 'pointer',
  },
  actionButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
    cursor: 'pointer',
  },
});

