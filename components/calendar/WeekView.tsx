import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { useTheme } from '../ThemeProvider';
import LiturgicalCalendarService from '../../services/LiturgicalCalendar';
import { startOfWeek, endOfWeek, eachDayOfInterval, format, isSameDay, addWeeks, subWeeks } from 'date-fns';

interface WeekViewProps {
  currentDate: Date;
  selectedDate: Date;
  onDayPress: (date: Date) => void;
  onWeekChange?: (newDate: Date) => void;
}

const WeekView: React.FC<WeekViewProps> = ({ currentDate, selectedDate, onDayPress, onWeekChange }) => {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme ?? 'light'];
  const calendarService = LiturgicalCalendarService.getInstance();
  const scrollViewRef = useRef<ScrollView>(null);

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 0 });
  const daysInWeek = eachDayOfInterval({ start: weekStart, end: weekEnd });

  // Auto-scroll to selected date when it changes or when week changes
  useEffect(() => {
    const selectedIndex = daysInWeek.findIndex(day => isSameDay(day, selectedDate));
    if (selectedIndex >= 0 && scrollViewRef.current) {
      // Calculate scroll position: each card is 160 width + 12 margin
      const scrollPosition = selectedIndex * (160 + 12);
      // Use setTimeout to ensure the layout is ready
      setTimeout(() => {
        scrollViewRef.current?.scrollTo({
          x: scrollPosition,
          animated: true,
        });
      }, 100);
    }
  }, [selectedDate, currentDate]);

  const handlePreviousWeek = () => {
    const newDate = subWeeks(currentDate, 1);
    onWeekChange?.(newDate);
  };

  const handleNextWeek = () => {
    const newDate = addWeeks(currentDate, 1);
    onWeekChange?.(newDate);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.card }]}>
      {/* Week Navigation Header */}
      <View style={[styles.weekHeader, { borderBottomColor: colors.border }]}>
        <Pressable
          onPress={handlePreviousWeek}
          style={({ pressed }) => [
            styles.navButton,
            { backgroundColor: pressed ? colors.surface : 'transparent' },
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
            { backgroundColor: pressed ? colors.surface : 'transparent' },
          ]}
        >
          <Ionicons name="chevron-forward" size={24} color={colors.text} />
        </Pressable>
      </View>

      <ScrollView ref={scrollViewRef} horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {daysInWeek.map((day) => {
          const liturgicalDay = calendarService.getLiturgicalDay(day);
          const isSelected = isSameDay(day, selectedDate);
          const isToday = isSameDay(day, new Date());

          return (
            <Pressable
              key={day.toISOString()}
              onPress={() => onDayPress(day)}
              style={({ pressed }) => [
                styles.dayCard,
                {
                  backgroundColor: isSelected ? colors.primary : colors.surface,
                  borderColor: isToday ? colors.primary : colors.border,
                  opacity: pressed ? 0.7 : 1,
                },
              ]}
            >
              <Text
                style={[
                  styles.dayOfWeek,
                  { color: isSelected ? colors.dominicanWhite : colors.textSecondary },
                ]}
              >
                {format(day, 'EEE')}
              </Text>
              <Text
                style={[
                  styles.dayNumber,
                  { color: isSelected ? colors.dominicanWhite : colors.text },
                ]}
              >
                {format(day, 'd')}
              </Text>

              {liturgicalDay.feasts.length > 0 && (
                <View style={styles.feastsContainer}>
                  {liturgicalDay.feasts.slice(0, 2).map((feast, index) => {
                    const hasDominican = feast.isDominican;
                    return (
                      <View key={index} style={styles.feastItem}>
                        {hasDominican && (
                <Text
                  style={[
                    styles.dominicanIndicator,
                    { color: isSelected ? colors.dominicanWhite : colors.primary, marginRight: 4 },
                  ]}
                >
                  ⚫
                </Text>
              )}
              <Text
                style={[
                  styles.feastName,
                  { color: isSelected ? colors.dominicanWhite : colors.text, marginRight: 4 },
                ]}
                numberOfLines={1}
              >
                {feast.name}
              </Text>
              <View
                style={[
                  styles.rankBadge,
                  { backgroundColor: feast.color || colors.textMuted },
                ]}
              >
                          <Text style={styles.rankText}>
                            {feast.rank === 'Optional Memorial'
                              ? 'O'
                              : feast.rank.charAt(0).toUpperCase()}
                          </Text>
                        </View>
                      </View>
                    );
                  })}
                  {liturgicalDay.feasts.length > 2 && (
                    <Text
                      style={[
                        styles.moreFeastsText,
                        { color: isSelected ? colors.dominicanWhite : colors.textMuted },
                      ]}
                    >
                      +{liturgicalDay.feasts.length - 2} more
                    </Text>
                  )}
                </View>
              )}
            </Pressable>
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
  },
  scrollContent: {
    padding: 12,
  },
  dayCard: {
    width: 160,
    minHeight: 120,
    padding: 12,
    borderRadius: 12,
    borderWidth: 2,
    marginRight: 12,
  },
  dayOfWeek: {
    fontSize: 12,
    fontFamily: 'Georgia',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  dayNumber: {
    fontSize: 24,
    fontFamily: 'Georgia',
    fontWeight: '700',
    marginBottom: 8,
  },
  feastsContainer: {
  },
  feastItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  dominicanIndicator: {
    fontSize: 10,
  },
  feastName: {
    flex: 1,
    fontSize: 11,
    fontFamily: 'Georgia',
  },
  rankBadge: {
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: 'Georgia',
  },
  moreFeastsText: {
    fontSize: 10,
    fontFamily: 'Georgia',
    fontStyle: 'italic',
  },
});

export default WeekView;

