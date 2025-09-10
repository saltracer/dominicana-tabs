import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { useTheme } from './ThemeProvider';
import { Saint } from '../types/saint-types';
import { CelebrationRank } from '../types/celebrations-types';
import SaintContentRenderer from './SaintContentRenderer';

interface SaintDetailPanelProps {
  selectedSaint: Saint | null;
  isVisible: boolean;
  onClose: () => void;
  onPrevious: () => void;
  onNext: () => void;
  hasPrevious: boolean;
  hasNext: boolean;
  slideAnimation: Animated.Value;
}

export default function SaintDetailPanel({
  selectedSaint,
  isVisible,
  onClose,
  onPrevious,
  onNext,
  hasPrevious,
  hasNext,
  slideAnimation,
}: SaintDetailPanelProps) {
  const { colorScheme } = useTheme();


  if (!selectedSaint) return null;

  return (
    <Animated.View
      style={[
        styles.panel,
        {
          backgroundColor: Colors[colorScheme ?? 'light'].background,
          borderLeftColor: Colors[colorScheme ?? 'light'].border,
          transform: [
            {
              translateX: slideAnimation.interpolate({
                inputRange: [0, 1],
                outputRange: [Math.min(500, screenWidth * 0.45), 0],
              }),
            },
          ],
        },
      ]}
    >
      {/* Panel Header */}
      <View style={[styles.panelHeader, { borderBottomColor: Colors[colorScheme ?? 'light'].border }]}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            onPress={onPrevious}
            disabled={!hasPrevious}
            style={[
              styles.navButton,
              {
                backgroundColor: hasPrevious 
                  ? Colors[colorScheme ?? 'light'].primary 
                  : Colors[colorScheme ?? 'light'].border,
              }
            ]}
          >
            <Ionicons 
              name="chevron-back" 
              size={20} 
              color={hasPrevious 
                ? Colors[colorScheme ?? 'light'].dominicanWhite 
                : Colors[colorScheme ?? 'light'].textMuted
              } 
            />
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={onNext}
            disabled={!hasNext}
            style={[
              styles.navButton,
              {
                backgroundColor: hasNext 
                  ? Colors[colorScheme ?? 'light'].primary 
                  : Colors[colorScheme ?? 'light'].border,
              }
            ]}
          >
            <Ionicons 
              name="chevron-forward" 
              size={20} 
              color={hasNext 
                ? Colors[colorScheme ?? 'light'].dominicanWhite 
                : Colors[colorScheme ?? 'light'].textMuted
              } 
            />
          </TouchableOpacity>
        </View>

        <Text style={[styles.panelTitle, { color: Colors[colorScheme ?? 'light'].text }]} numberOfLines={1}>
          {selectedSaint.name}
        </Text>

        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Ionicons name="close" size={24} color={Colors[colorScheme ?? 'light'].text} />
        </TouchableOpacity>
      </View>

      {/* Panel Content */}
      <ScrollView style={styles.panelContent} showsVerticalScrollIndicator={false}>
        <SaintContentRenderer 
          saint={selectedSaint} 
          colorScheme={colorScheme}
          defaultExpanded={true}
        />
      </ScrollView>
    </Animated.View>
  );
}

const { width: screenWidth } = Dimensions.get('window');

const styles = StyleSheet.create({
  panel: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: Math.min(500, screenWidth * 0.45), // Responsive width: max 500px or 45% of screen
    height: '100%',
    borderLeftWidth: 1,
    elevation: 8,
    boxShadow: '-2px 0px 8px rgba(0, 0, 0, 0.25)',
    zIndex: 1000,
  },
  panelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    minHeight: 60,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  navButton: {
    padding: 8,
    borderRadius: 6,
    marginRight: 8,
    cursor: 'pointer',
  },
  panelTitle: {
    fontSize: 24,
    fontWeight: '600',
    fontFamily: 'Georgia',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 16,
  },
  closeButton: {
    padding: 8,
    cursor: 'pointer',
  },
  panelContent: {
    flex: 1,
    paddingHorizontal: 16,
  },
});
