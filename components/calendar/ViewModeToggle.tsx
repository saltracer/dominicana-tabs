import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { useTheme } from '../ThemeProvider';

export type ViewMode = 'month' | 'week' | 'list';

interface ViewModeToggleProps {
  currentMode: ViewMode;
  onModeChange: (mode: ViewMode) => void;
  compact?: boolean;
}

const ViewModeToggle: React.FC<ViewModeToggleProps> = ({
  currentMode,
  onModeChange,
  compact = false,
}) => {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme ?? 'light'];

  const modes: { mode: ViewMode; icon: keyof typeof Ionicons.glyphMap; label: string }[] = [
    { mode: 'month', icon: 'grid-outline', label: 'Month' },
    { mode: 'week', icon: 'reorder-four-outline', label: 'Week' },
    { mode: 'list', icon: 'list-outline', label: 'List' },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      {modes.map((modeConfig, index) => {
        const isSelected = currentMode === modeConfig.mode;
        const isFirst = index === 0;
        const isLast = index === modes.length - 1;

        return (
          <Pressable
            key={modeConfig.mode}
            onPress={() => onModeChange(modeConfig.mode)}
            style={({ pressed }) => [
              styles.modeButton,
              {
                backgroundColor: isSelected ? colors.primary : 'transparent',
                borderTopLeftRadius: isFirst ? 8 : 0,
                borderBottomLeftRadius: isFirst ? 8 : 0,
                borderTopRightRadius: isLast ? 8 : 0,
                borderBottomRightRadius: isLast ? 8 : 0,
                opacity: pressed ? 0.7 : 1,
              },
            ]}
          >
            <Ionicons
              name={modeConfig.icon}
              size={compact ? 18 : 20}
              color={isSelected ? '#FFFFFF' : colors.text}
              style={{ marginRight: compact ? 0 : 6 }}
            />
            {!compact && (
              <Text
                style={[
                  styles.modeLabel,
                  { color: isSelected ? '#FFFFFF' : colors.text },
                ]}
              >
                {modeConfig.label}
              </Text>
            )}
          </Pressable>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderRadius: 8,
    borderWidth: 1,
    overflow: 'hidden',
  },
  modeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  modeLabel: {
    fontSize: 14,
    fontFamily: 'Georgia',
    fontWeight: '600',
  },
});

export default ViewModeToggle;

