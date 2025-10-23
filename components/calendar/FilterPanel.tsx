import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { useTheme } from '../ThemeProvider';

export type FeastFilter = 'red' | 'white' | 'green' | 'purple' | 'rose';

interface FilterPanelProps {
  selectedFilters: FeastFilter[];
  onToggleFilter: (filter: FeastFilter) => void;
  dominicanOnly: boolean;
  onToggleDominican: () => void;
  onClearAll: () => void;
  compact?: boolean;
}

const FilterPanel: React.FC<FilterPanelProps> = ({
  selectedFilters,
  onToggleFilter,
  dominicanOnly,
  onToggleDominican,
  onClearAll,
  compact = false,
}) => {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme ?? 'light'];

  const colorFilters: { value: FeastFilter; label: string }[] = [
    { value: 'red', label: 'Martyrs' },
    { value: 'white', label: 'White Feasts' },
    { value: 'green', label: 'Ordinary Time' },
    { value: 'purple', label: 'Advent/Lent' },
    { value: 'rose', label: 'Gaudete/Laetare' },
  ];

  const getFeastColor = (type: FeastFilter): string => {
    switch (type) {
      case 'red':
        return '#DC143C';
      case 'white':
        return '#FFFFFF';
      case 'green':
        return '#2E7D32';
      case 'purple':
        return '#8B008B';
      case 'rose':
        return '#FFB6C1';
      default:
        return colors.textMuted;
    }
  };

  const renderFilterChip = (filterItem: { value: FeastFilter; label: string }) => {
    const isSelected = selectedFilters.includes(filterItem.value);
    const feastColor = getFeastColor(filterItem.value);
    const isWhite = filterItem.value === 'white';

    return (
      <Pressable
        key={filterItem.value}
        onPress={() => onToggleFilter(filterItem.value)}
        style={({ pressed }) => [
          styles.filterChip,
          {
            backgroundColor: isSelected ? feastColor : colors.surface,
            borderColor: isSelected ? (isWhite ? '#000000' : feastColor) : colors.border,
            borderWidth: isSelected ? 2 : 1,
            opacity: pressed ? 0.7 : 1,
          },
        ]}
      >
        <View
          style={[
            styles.filterDot,
            { 
              backgroundColor: feastColor,
              borderWidth: isWhite ? 1 : 0,
              borderColor: isWhite ? '#000000' : 'transparent',
              marginRight: 6 
            },
          ]}
        />
        <Text
          style={[
            styles.filterText,
            { 
              color: isSelected && isWhite ? '#000000' : isSelected ? '#FFFFFF' : colors.text,
            },
          ]}
        >
          {filterItem.label}
        </Text>
      </Pressable>
    );
  };

  const hasActiveFilters = selectedFilters.length > 0 || dominicanOnly;

  return (
    <View style={styles.container}>
      {!compact && (
        <View style={styles.header}>
          {/* <Text style={[styles.headerText, { color: colors.text }]}>Filter Feasts</Text> */}
          {hasActiveFilters && (
            <Pressable onPress={onClearAll} style={styles.clearButton}>
              <Text style={[styles.clearText, { color: colors.primary }]}>Clear All</Text>
            </Pressable>
          )}
        </View>
      )}

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filtersScroll}
      >
        {/* Dominican Only Filter */}
        <Pressable
          onPress={onToggleDominican}
          style={({ pressed }) => [
            styles.filterChip,
            styles.dominicanChip,
            {
              backgroundColor: dominicanOnly ? colors.primary : colors.surface,
              borderColor: dominicanOnly ? colors.primary : colors.border,
              opacity: pressed ? 0.7 : 1,
            },
          ]}
        >
          <Text style={[styles.dominicanSymbol, { marginRight: 6 }]}>⚫</Text>
          <Text
            style={[
              styles.filterText,
              { color: dominicanOnly ? '#FFFFFF' : colors.text },
            ]}
          >
            Dominican Only
          </Text>
          {dominicanOnly && (
            <Ionicons name="checkmark" size={16} color="#FFFFFF" />
          )}
        </Pressable>

        {/* Color Filters */}
        {colorFilters.map(renderFilterChip)}
      </ScrollView>

      {compact && hasActiveFilters && (
        <Pressable onPress={onClearAll} style={styles.compactClearButton}>
          <Text style={[styles.clearText, { color: colors.primary }]}>Clear Filters</Text>
        </Pressable>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerText: {
    fontSize: 16,
    fontFamily: 'Georgia',
    fontWeight: '700',
  },
  clearButton: {
    padding: 4,
  },
  clearText: {
    fontSize: 14,
    fontFamily: 'Georgia',
    fontWeight: '600',
  },
  filtersScroll: {
    flexDirection: 'row',
    paddingRight: 16,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  dominicanChip: {
    marginRight: 8,
  },
  filterDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  filterText: {
    fontSize: 13,
    fontFamily: 'Georgia',
    fontWeight: '600',
  },
  dominicanSymbol: {
    fontSize: 14,
  },
  compactClearButton: {
    alignSelf: 'flex-end',
    marginTop: 8,
    padding: 4,
  },
});

export default FilterPanel;

