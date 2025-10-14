import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Platform,
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
}

export const ReadingAnnotationOverlay: React.FC<ReadingAnnotationOverlayProps> = ({
  isBookmarked,
  onAddBookmark,
  onRemoveBookmark,
  onAddHighlight,
  onViewAnnotations,
  disabled = false,
}) => {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [isExpanded, setIsExpanded] = useState(false);
  const [animation] = useState(new Animated.Value(0));

  const toggleExpanded = () => {
    console.log('🔄 Toggling FAB menu:', isExpanded ? 'closing' : 'opening');
    const toValue = isExpanded ? 0 : 1;
    
    Animated.spring(animation, {
      toValue,
      useNativeDriver: true,
      friction: 6,
    }).start();
    
    setIsExpanded(!isExpanded);
    console.log('Menu state will be:', !isExpanded);
  };

  const handleAction = (action: () => void, buttonType: string) => {
    console.log('🎯 FAB button pressed:', buttonType);
    console.log('Calling action...');
    action();
    console.log('Action called, closing menu...');
    toggleExpanded();
  };

  const cardBg = colorScheme === 'dark' ? 'rgba(32, 29, 29, 0.95)' : 'rgba(255, 255, 255, 0.95)';
  
  const actionButtons = [
    {
      icon: isBookmarked ? 'bookmark' : 'bookmark-outline',
      action: isBookmarked ? onRemoveBookmark : onAddBookmark,
      color: isBookmarked ? colors.dominicanWhite : colors.primary,
      backgroundColor: isBookmarked ? colors.primary : cardBg,
      label: isBookmarked ? 'Remove Bookmark' : 'Add Bookmark',
    },
    {
      icon: 'color-fill-outline',
      action: onAddHighlight,
      color: colors.accent,
      backgroundColor: cardBg,
      label: 'Highlight',
    },
    {
      icon: 'list',
      action: onViewAnnotations,
      color: colors.info,
      backgroundColor: cardBg,
      label: 'View All',
    },
  ];

  return (
    <View style={[styles.container, disabled && styles.disabled]} pointerEvents={disabled ? 'none' : 'auto'}>
      {/* Backdrop (shown when expanded) - Render FIRST so it's behind buttons */}
      {isExpanded && (
        <TouchableOpacity
          style={styles.backdrop}
          onPress={toggleExpanded}
          activeOpacity={1}
        />
      )}

      {/* Action Buttons (shown when expanded) - Render AFTER backdrop */}
      {isExpanded && actionButtons.map((button, index) => {
        const translateY = animation.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -((index + 1) * 64)],
        });

        const opacity = animation.interpolate({
          inputRange: [0, 0.5, 1],
          outputRange: [0, 0, 1],
        });

        return (
          <Animated.View
            key={index}
            style={[
              styles.actionButton,
              {
                transform: [{ translateY }],
                opacity,
              },
            ]}
            pointerEvents="auto"
          >
            <TouchableOpacity
              style={[
                styles.actionButtonInner, 
                { backgroundColor: button.backgroundColor }
              ]}
              onPress={() => {
                console.log('🔘 Button tapped:', button.label);
                handleAction(button.action, button.label);
              }}
              activeOpacity={0.7}
            >
              <Ionicons name={button.icon as any} size={22} color={button.color} />
            </TouchableOpacity>
          </Animated.View>
        );
      })}

      {/* Main FAB - Render LAST to be on top */}
      <TouchableOpacity
        style={[
          styles.fab,
          { 
            backgroundColor: `${colors.primary}F0`, // 94% opacity (F0 in hex)
            shadowColor: colors.primary,
          }
        ]}
        onPress={toggleExpanded}
        activeOpacity={0.9}
      >
        <Animated.View
          style={{
            transform: [{
              rotate: animation.interpolate({
                inputRange: [0, 1],
                outputRange: ['0deg', '45deg'],
              }),
            }],
          }}
        >
          <Ionicons 
            name={isExpanded ? 'close' : 'add'} 
            size={28} 
            color={colors.dominicanWhite} 
          />
        </Animated.View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 100 : 90,
    right: 20,
    zIndex: 1000,
  },
  disabled: {
    opacity: 0.5,
  },
  backdrop: {
    position: 'absolute',
    top: -1000,
    left: -1000,
    right: -1000,
    bottom: -1000,
    zIndex: 1, // Below action buttons (10) but above everything else
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 20, // Highest z-index
  },
  actionButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    zIndex: 10, // Must be positive to be above backdrop
  },
  actionButtonInner: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 10, // Higher elevation for Android to be above backdrop
  },
});

