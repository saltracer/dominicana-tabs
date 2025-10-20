import React from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { Colors } from '../../constants/Colors';
import { useTheme } from '../ThemeProvider';
import LiturgicalCalendarService from '../../services/LiturgicalCalendar';
import { startOfWeek, endOfWeek, eachDayOfInterval, format, isSameDay } from 'date-fns';

interface WeekViewProps {
  currentDate: Date;
  selectedDate: Date;
  onDayPress: (date: Date) => void;
}

const WeekView: React.FC<WeekViewProps> = ({ currentDate, selectedDate, onDayPress }) => {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme ?? 'light'];
  const calendarService = LiturgicalCalendarService.getInstance();

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 0 });
  const daysInWeek = eachDayOfInterval({ start: weekStart, end: weekEnd });

  return (
    <View style={[styles.container, { backgroundColor: colors.card }]}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
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

