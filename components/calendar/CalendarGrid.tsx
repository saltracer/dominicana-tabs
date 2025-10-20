import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { Colors } from '../../constants/Colors';
import { useTheme } from '../ThemeProvider';
import DayCell from './DayCell';
import { format, subDays, addDays } from 'date-fns';

interface CalendarGridProps {
  currentDate: string;
  markedDates: any;
  onDayPress: (day: any) => void;
  cellSize?: 'small' | 'medium' | 'large' | 'xlarge';
  showFeastNames?: boolean;
}

const CalendarGrid: React.FC<CalendarGridProps> = ({
  currentDate,
  markedDates,
  onDayPress,
  cellSize = 'medium',
  showFeastNames = false,
}) => {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <View style={[styles.gridWrapper, { borderColor: colors.border }]}>
      <Calendar
        current={currentDate}
        onDayPress={onDayPress}
        markedDates={markedDates}
        dayComponent={(props) => (
          <DayCell
            {...props}
            size={cellSize}
            showFeastName={showFeastNames}
          />
        )}
        theme={{
        backgroundColor: colors.card,
        calendarBackground: colors.card,
        textSectionTitleColor: colors.text,
        selectedDayBackgroundColor: colors.primary,
        selectedDayTextColor: colors.dominicanWhite,
        todayTextColor: colors.primary,
        dayTextColor: colors.text,
        textDisabledColor: colors.textMuted,
        dotColor: colors.primary,
        selectedDotColor: colors.dominicanWhite,
        arrowColor: colors.primary,
        monthTextColor: colors.text,
        indicatorColor: colors.primary,
        textDayFontFamily: 'Georgia',
        textMonthFontFamily: 'Georgia',
        textDayHeaderFontFamily: 'Georgia',
        textDayFontSize: 16,
        textMonthFontSize: 18,
        textDayHeaderFontSize: 14,
        'stylesheet.calendar.main': {
          dayContainer: {
            flex: 1,
            borderWidth: 1,
            borderColor: colors.border,
            width: '100%',
            height: '100%',
            aspectRatio: 1,
          },
          emptyDayContainer: {
            flex: 1,
            borderWidth: 1,
            width: '100%',
            height: '100%',
            borderColor: colors.border,
            aspectRatio: 1,
          },
          week: {
            marginTop: 0,
            marginBottom: 0,
            paddingTop: 0,
            paddingBottom: 0,
            flexDirection: 'row',
            justifyContent: 'space-around',
            // borderWidth: 1,
            // borderColor: '#FF0000',
          },
        },
        // 'stylesheet.day.basic': {
        //   container: {
        //     borderWidth: 1,
        //     borderColor: '#00FF00',
        //   },
        //   // borderWidth: 1,
        //   // borderColor: '#00FF00',
        // },
      } as any}
      minDate={format(subDays(new Date(), 1000), 'yyyy-MM-dd')}
      maxDate={format(addDays(new Date(), 1000), 'yyyy-MM-dd')}
      key={colorScheme}
      enableSwipeMonths={true}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  gridWrapper: {
    // borderWidth: 1,
    // borderLeftWidth: 1,
    // borderTopWidth: 1,
  },
});

export default CalendarGrid;

