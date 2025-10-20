import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, Pressable, Platform } from 'react-native';
import { Colors } from '../../constants/Colors';
import { useTheme } from '../ThemeProvider';
import LiturgicalCalendarService from '../../services/LiturgicalCalendar';
import { parseISO, format } from 'date-fns';

interface DayCellProps {
  date?: {
    dateString: string;
    day: number;
  };
  marking?: any;
  onPress?: (date?: any) => void;
  size?: 'small' | 'medium' | 'large' | 'xlarge';
  showFeastName?: boolean;
}

const DayCell: React.FC<DayCellProps> = ({
  date,
  marking,
  onPress,
  size = 'medium',
  showFeastName = false,
}) => {
  const { colorScheme } = useTheme();
  const [dayContent, setDayContent] = useState<any>(null);

  useEffect(() => {
    if (date?.dateString) {
      const calendarService = LiturgicalCalendarService.getInstance();
      const selectedDate = parseISO(date.dateString);
      const liturgicalDay = calendarService.getLiturgicalDay(selectedDate);

      if (liturgicalDay.feasts.length > 0) {
        // Get the highest rank feast for this date
        const primaryFeast = liturgicalDay.feasts.reduce((highest, current) => {
          const rankOrder: { [key: string]: number } = {
            Solemnity: 1,
            Feast: 2,
            Memorial: 3,
            'Optional Memorial': 4,
            Ferial: 5,
          };
          const currentRank = rankOrder[current.rank] || 5;
          const highestRank = rankOrder[highest.rank] || 5;
          return currentRank < highestRank ? current : highest;
        }, liturgicalDay.feasts[0]);

        const hasDominicanFeast = liturgicalDay.feasts.some(feast => feast.isDominican);

        setDayContent({
          primaryFeast,
          hasDominicanFeast,
          feastCount: liturgicalDay.feasts.length,
          isDominican: hasDominicanFeast,
        });
      }
    }
  }, [date?.dateString]);

  const isToday = date?.dateString === format(new Date(), 'yyyy-MM-dd');
  const isSelected = marking?.selected;
  const hasFeasts = dayContent && dayContent.feastCount > 0;

  const colors = useMemo(() => {
    const currentColors = Colors[colorScheme ?? 'light'];

    return {
      backgroundColor: (() => {
        if (isSelected) return currentColors.primary;
        if (isToday) return currentColors.surface;
        if (hasFeasts && size !== 'small') return currentColors.card;
        return 'transparent';
      })(),
      textColor: (() => {
        if (isSelected) return currentColors.dominicanWhite;
        if (isToday) return currentColors.primary;
        if (hasFeasts) return currentColors.text;
        return currentColors.textMuted;
      })(),
      feastIndicatorColor: (() => {
        if (dayContent?.hasDominicanFeast) return currentColors.primary;
        if (dayContent?.primaryFeast) return dayContent.primaryFeast.color;
        return currentColors.textMuted;
      })(),
    };
  }, [isSelected, isToday, hasFeasts, dayContent, colorScheme, size]);

  const getFeastRankLetter = () => {
    if (!dayContent?.primaryFeast) return '';
    const rank = dayContent.primaryFeast.rank;
    if (rank === 'Optional Memorial') return 'O';
    return rank.charAt(0).toUpperCase();
  };

  const containerSize = {
    small: styles.containerSmall,
    medium: styles.containerMedium,
    large: styles.containerLarge,
    xlarge: styles.containerXLarge,
  }[size];

  const dayNumberSize = {
    small: styles.dayNumberSmall,
    medium: styles.dayNumberMedium,
    large: styles.dayNumberLarge,
    xlarge: styles.dayNumberXLarge,
  }[size];

  return (
    <Pressable
      style={({ pressed, hovered }: any) => [
        styles.container,
        containerSize,
        {
          backgroundColor: colors.backgroundColor,
          borderColor: isSelected
            ? Colors[colorScheme ?? 'light'].primary
            : isToday
            ? Colors[colorScheme ?? 'light'].border
            : 'transparent',
          borderWidth: isSelected ? 2 : isToday ? 1 : 0,
          opacity: pressed ? 0.7 : 1,
          ...(Platform.OS === 'web' && hovered && !isSelected
            ? {
                transform: [{ scale: 1.05 }],
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
              }
            : {}),
        },
      ]}
      onPress={() => onPress?.(date)}
    >
      {/* Day Number */}
      <Text style={[styles.dayNumber, dayNumberSize, { color: colors.textColor }]}>
        {date?.day}
      </Text>

      {/* Feast Indicators */}
      {hasFeasts && (
        <>
          {size === 'small' ? (
            // Small: Just a colored dot
            <View style={styles.smallIndicators}>
              <View
                style={[
                  styles.feastDot,
                  { backgroundColor: colors.feastIndicatorColor },
                ]}
              />
              {dayContent.isDominican && (
                <Text style={[styles.dominicanSymbolSmall, { color: Colors[colorScheme ?? 'light'].primary }]}>
                  ⚫
                </Text>
              )}
            </View>
          ) : (
            // Medium/Large/XLarge: Badges and indicators
            <View style={styles.feastIndicators}>
              {/* Rank Badge */}
              <View
                style={[
                  styles.rankBadge,
                  size === 'xlarge' ? styles.rankBadgeLarge : {},
                  { backgroundColor: colors.feastIndicatorColor },
                ]}
              >
                <Text
                  style={[
                    styles.rankText,
                    size === 'xlarge' ? styles.rankTextLarge : {},
                  ]}
                >
                  {getFeastRankLetter()}
                </Text>
              </View>

              {/* Dominican Indicator */}
              {dayContent.isDominican && (
                <Text
                  style={[
                    styles.dominicanSymbol,
                    { color: isSelected ? '#FFFFFF' : Colors[colorScheme ?? 'light'].primary },
                  ]}
                >
                  ⚫
                </Text>
              )}

              {/* Multiple Feasts Indicator */}
              {dayContent.feastCount > 1 && (
                <View
                  style={[
                    styles.multipleFeastsIndicator,
                    { backgroundColor: Colors[colorScheme ?? 'light'].surface },
                  ]}
                >
                  <Text
                    style={[
                      styles.multipleFeastsText,
                      { color: colors.textColor },
                    ]}
                  >
                    +{dayContent.feastCount - 1}
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* Feast Name (only on xlarge) */}
          {showFeastName && size === 'xlarge' && dayContent.primaryFeast && (
            <Text
              style={[styles.feastName, { color: colors.textColor }]}
              numberOfLines={1}
            >
              {dayContent.primaryFeast.name}
            </Text>
          )}
        </>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 4,
    borderRadius: 8,
    ...(Platform.OS === 'web' && {
      transition: 'all 0.15s ease-in-out',
      cursor: 'pointer',
    }),
  } as any,
  containerSmall: {
    width: 44,
    height: 44,
  },
  containerMedium: {
    width: 60,
    height: 60,
  },
  containerLarge: {
    width: 80,
    height: 80,
  },
  containerXLarge: {
    width: 100,
    height: 100,
  },
  dayNumber: {
    fontFamily: 'Georgia',
    fontWeight: '600',
    marginBottom: 2,
  },
  dayNumberSmall: {
    fontSize: 16,
  },
  dayNumberMedium: {
    fontSize: 18,
  },
  dayNumberLarge: {
    fontSize: 20,
  },
  dayNumberXLarge: {
    fontSize: 22,
  },
  smallIndicators: {
    alignItems: 'center',
    gap: 2,
  },
  feastDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  dominicanSymbolSmall: {
    fontSize: 8,
  },
  feastIndicators: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: 3,
    marginTop: 2,
  },
  rankBadge: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankBadgeLarge: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  rankText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: 'Georgia',
  },
  rankTextLarge: {
    fontSize: 11,
  },
  dominicanSymbol: {
    fontSize: 12,
  },
  multipleFeastsIndicator: {
    borderRadius: 6,
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  multipleFeastsText: {
    fontSize: 8,
    fontWeight: '600',
    fontFamily: 'Georgia',
  },
  feastName: {
    fontSize: 10,
    fontFamily: 'Georgia',
    textAlign: 'center',
    marginTop: 4,
    paddingHorizontal: 2,
  },
});

export default DayCell;

