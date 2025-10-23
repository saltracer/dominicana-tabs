import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Platform,
} from 'react-native';
import { Colors } from '../../constants/Colors';
import { useTheme } from '../ThemeProvider';

export type FeastFilter = 'red' | 'white' | 'green' | 'purple' | 'rose';

interface InteractiveLegendProps {
  selectedFilters: FeastFilter[];
  onToggleFilter: (filter: FeastFilter) => void;
  dominicanOnly: boolean;
  onToggleDominican: () => void;
  doctorOnly: boolean;
  onToggleDoctor: () => void;
  onClearAll: () => void;
  compact?: boolean;
}

const InteractiveLegend: React.FC<InteractiveLegendProps> = ({
  selectedFilters,
  onToggleFilter,
  dominicanOnly,
  onToggleDominican,
  doctorOnly,
  onToggleDoctor,
  onClearAll,
  compact = false,
}) => {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme ?? 'light'];

  const hasActiveFilters = selectedFilters.length > 0 || dominicanOnly || doctorOnly;

  const legendItems: Array<{
    id: 'dominican' | 'doctor' | FeastFilter;
    label: string;
    color: string;
    isDominican?: boolean;
    isDoctor?: boolean;
    isWhite?: boolean;
  }> = [
    { id: 'dominican', label: 'Dominican Feast', color: colors.primary, isDominican: true },
    { id: 'doctor', label: 'Doctor of the Church', color: '#FFD700', isDoctor: true },
    { id: 'red', label: 'Martyrs (Red)', color: '#DC143C' },
    { id: 'white', label: 'White Feasts', color: '#FFFFFF', isWhite: true },
    { id: 'green', label: 'Ordinary Time (Green)', color: '#2E7D32' },
    { id: 'purple', label: 'Advent/Lent (Purple)', color: '#8B008B' },
    { id: 'rose', label: 'Gaudete/Laetare (Pink)', color: '#FFB6C1' },
  ];

  const renderLegendItem = (item: typeof legendItems[0]) => {
    const isDominicanItem = item.isDominican;
    const isDoctorItem = item.isDoctor;
    const isSelected = isDominicanItem 
      ? dominicanOnly 
      : isDoctorItem
      ? doctorOnly
      : selectedFilters.includes(item.id as FeastFilter);
    const isWhiteItem = item.isWhite;

    return (
      <Pressable
        key={item.id}
        onPress={() => {
          if (isDominicanItem) {
            onToggleDominican();
          } else if (isDoctorItem) {
            onToggleDoctor();
          } else {
            onToggleFilter(item.id as FeastFilter);
          }
        }}
        style={({ pressed }) => [
          styles.legendItem,
          isSelected && styles.legendItemSelected,
          isSelected && { backgroundColor: colors.surface },
          {
            opacity: pressed ? 0.7 : 1,
            // Always use 2px border to prevent layout shift
            borderWidth: 2,
            // For white items when selected, use dark border; otherwise use the item's color or transparent when not selected
            borderColor: isSelected 
              ? (isWhiteItem ? '#000000' : item.color)
              : 'transparent',
          },
        ]}
      >
        {isDominicanItem ? (
          <Text style={[styles.dominicanSymbol, { color: item.color, marginRight: 8 }]}>
            ⚫
          </Text>
        ) : isDoctorItem ? (
          <Text style={[styles.doctorSymbol, { color: item.color, marginRight: 8 }]}>
            ✦
          </Text>
        ) : (
          <View
            style={[
              styles.legendDot,
              {
                backgroundColor: item.color,
                borderWidth: item.isWhite ? 1 : 0,
                borderColor: item.isWhite ? '#000000' : 'transparent',
                marginRight: 8,
              },
            ]}
          />
        )}
        <Text
          style={[
            styles.legendText,
            compact && styles.legendTextCompact,
            { color: colors.text },
          ]}
        >
          {item.label}
        </Text>
      </Pressable>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      <View style={styles.header}>
        <Text style={[styles.legendTitle, { color: colors.text }]}>
          Legend & Filters
        </Text>
        <Pressable 
          onPress={onClearAll} 
          style={styles.clearButton}
          disabled={!hasActiveFilters}
        >
          <Text style={[
            styles.clearText, 
            { 
              color: colors.primary,
              opacity: hasActiveFilters ? 1 : 0
            }
          ]}>
            Clear All
          </Text>
        </Pressable>
      </View>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
        Tap to filter calendar
      </Text>
      <View style={styles.legendItems}>
        {legendItems.map(renderLegendItem)}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  legendTitle: {
    fontSize: 16,
    fontFamily: 'Georgia',
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 12,
    fontFamily: 'Georgia',
    marginBottom: 12,
  },
  clearButton: {
    padding: 4,
  },
  clearText: {
    fontSize: 14,
    fontFamily: 'Georgia',
    fontWeight: '600',
  },
  legendItems: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 2,
    ...(Platform.OS === 'web' && {
      cursor: 'pointer',
      transition: 'all 0.2s ease',
    } as any),
  },
  legendItemSelected: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: 14,
    fontFamily: 'Georgia',
  },
  legendTextCompact: {
    fontSize: 12,
  },
  dominicanSymbol: {
    fontSize: 14,
  },
  doctorSymbol: {
    fontSize: 14,
  },
});

export default InteractiveLegend;

