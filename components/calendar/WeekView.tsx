import React, { useRef, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { useTheme } from '../ThemeProvider';
import DayCell, { FeastColorFilter } from './DayCell';
import { startOfWeek, endOfWeek, eachDayOfInterval, format, addWeeks, subWeeks } from 'date-fns';

interface WeekViewProps {
  currentDate: Date;
  selectedDate: Date;
  onDayPress: (date: Date) => void;
  onWeekChange?: (newDate: Date) => void;
  cellSize?: 'small' | 'medium' | 'large' | 'xlarge';
  colorFilters?: FeastColorFilter[];
  dominicanOnly?: boolean;
}

const WeekView: React.FC<WeekViewProps> = ({ 
  currentDate, 
  selectedDate, 
  onDayPress, 
  onWeekChange, 
  cellSize = 'large',
  colorFilters = [],
  dominicanOnly = false,
}) => {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme ?? 'light'];
  const scrollViewRef = useRef<ScrollView>(null);
  const { width } = useWindowDimensions();

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 0 });
  const daysInWeek = eachDayOfInterval({ start: weekStart, end: weekEnd });

  // Determine cell width based on size
  const cellWidth = useMemo(() => {
    switch (cellSize) {
      case 'small':
        return 80;
      case 'medium':
        return 100;
      case 'large':
        return 120;
      case 'xlarge':
        return 140;
      default:
        return 120;
    }
  }, [cellSize]);

  // Determine if we should show feast name based on size
  const showFeastName = cellSize !== 'small';

  // Auto-scroll to selected date when it changes or when week changes
  useEffect(() => {
    const selectedIndex = daysInWeek.findIndex(day => 
      format(day, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd')
    );
    if (selectedIndex >= 0 && scrollViewRef.current) {
      // Calculate scroll position: each cell is cellWidth + 12 margin
      const scrollPosition = selectedIndex * (cellWidth + 12);
      // Use setTimeout to ensure the layout is ready
      setTimeout(() => {
        scrollViewRef.current?.scrollTo({
          x: scrollPosition,
          animated: true,
        });
      }, 100);
    }
  }, [selectedDate, currentDate, cellWidth]);

  const handlePreviousWeek = () => {
    const newDate = subWeeks(currentDate, 1);
    onWeekChange?.(newDate);
  };

  const handleNextWeek = () => {
    const newDate = addWeeks(currentDate, 1);
    onWeekChange?.(newDate);
  };

  // Create marking for selected date
  const getMarking = (day: Date) => {
    const dateString = format(day, 'yyyy-MM-dd');
    const selectedDateString = format(selectedDate, 'yyyy-MM-dd');
    
    if (dateString === selectedDateString) {
      return { selected: true };
    }
    return undefined;
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.card }]}>
      {/* Week Navigation Header */}
      <View style={[styles.weekHeader, { borderBottomColor: colors.border }]}>
        <Pressable
          onPress={handlePreviousWeek}
          style={({ pressed }) => [
            styles.navButton,
            { opacity: pressed ? 0.6 : 1 }
          ]}
        >
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </Pressable>
        
        <Text style={[styles.weekTitle, { color: colors.text }]}>
          {format(weekStart, 'MMM d')} - {format(weekEnd, 'MMM d, yyyy')}
        </Text>
        
        <Pressable
          onPress={handleNextWeek}
          style={({ pressed }) => [
            styles.navButton,
            { opacity: pressed ? 0.6 : 1 }
          ]}
        >
          <Ionicons name="chevron-forward" size={24} color={colors.text} />
        </Pressable>
      </View>

      <ScrollView ref={scrollViewRef} horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {daysInWeek.map((day) => {
          const dateString = format(day, 'yyyy-MM-dd');
          const dayNumber = parseInt(format(day, 'd'), 10);

          return (
            <View key={day.toISOString()} style={styles.dayCellWrapper}>
              {/* Day of Week Label */}
              <Text style={[styles.dayOfWeek, { color: colors.textSecondary }]}>
                {format(day, 'EEE')}
              </Text>
              
              {/* DayCell Component */}
              <View style={[styles.dayCellContainer, { width: cellWidth, height: cellWidth }]}>
                <DayCell
                  date={{ dateString, day: dayNumber }}
                  marking={getMarking(day)}
                  onPress={() => onDayPress(day)}
                  size={cellSize}
                  showFeastName={showFeastName}
                  colorFilters={colorFilters}
                  dominicanOnly={dominicanOnly}
                />
              </View>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  weekHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  weekTitle: {
    fontSize: 16,
    fontFamily: 'Georgia',
    fontWeight: '600',
  },
  navButton: {
    padding: 8,
    borderRadius: 20,
    cursor: 'pointer',
  } as any,
  scrollContent: {
    padding: 12,
    gap: 12,
    flexDirection: 'row',
  },
  dayCellWrapper: {
    alignItems: 'center',
  },
  dayOfWeek: {
    fontSize: 12,
    fontFamily: 'Georgia',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
    textAlign: 'center',
  },
  dayCellContainer: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    overflow: 'hidden',
  },
});

export default WeekView;

