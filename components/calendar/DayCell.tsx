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
    <View style={{
      //flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 4,
      width: '100%',
      height: '100%',
      aspectRatio: 1,
      // borderRightWidth: 1,
      // borderBottomWidth: 1,
      // borderColor: Colors[colorScheme ?? 'light'].border,
      // borderStyle: 'solid',
      // borderRadius: 8,
      // borderWidth: 1,
      // marginTop: -7,
      // marginBottom: -7,
      overflow: 'hidden',
      // borderWidth: 1,
      backgroundColor: colors.backgroundColor,
    }}>
    <Pressable
      style={({ pressed, hovered }: any) => [
        styles.container,
        { width: '100%', height: '100%', aspectRatio: 1 },
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
      {/* Day Number - Top Left with Dominican Indicator next to it */}
      <View style={styles.topLeftSection}>
        <Text style={[styles.dayNumber, dayNumberSize, { color: colors.textColor }]}>
          {date?.day}
        </Text>
        
        {/* Dominican Indicator - next to day number */}
        {hasFeasts && dayContent.isDominican && (
          <View
            style={[
              styles.dominicanBadge,
              { backgroundColor: Colors[colorScheme ?? 'light'].dominicanBlack },
            ]}
          >
            <Text style={[styles.dominicanBadgeText, { color: Colors[colorScheme ?? 'light'].dominicanWhite }]}>
              OP
            </Text>
          </View>
        )}
      </View>

      {/* Feast Level Indicator - Top Right */}
      {hasFeasts && (
        <View style={styles.topRightSection}>
          <View
            style={[
              styles.rankBadge,
              size === 'xlarge' ? styles.rankBadgeLarge : {},
              { 
                backgroundColor: colors.feastIndicatorColor,
                borderColor: colors.feastIndicatorColor?.toLowerCase() === '#ffffff' || 
                             colors.feastIndicatorColor?.toLowerCase() === 'white' 
                  ? '#000000' 
                  : 'rgba(255,255,255,0.3)',
              },
            ]}
          >
            <Text
              style={[
                styles.rankText,
                size === 'xlarge' ? styles.rankTextLarge : {},
                {
                  color: colors.feastIndicatorColor?.toLowerCase() === '#ffffff' || 
                         colors.feastIndicatorColor?.toLowerCase() === 'white'
                    ? '#000000'
                    : '#FFFFFF',
                },
              ]}
            >
              {getFeastRankLetter()}
            </Text>
          </View>
        </View>
      )}

      {/* Multiple Feasts Indicator - Bottom Right */}
      {hasFeasts && dayContent.feastCount > 1 && (
        <View style={styles.bottomRightSection}>
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
        </View>
      )}

      {/* Center Content - Feast Name */}
      {hasFeasts && size !== 'small' && (size === 'medium' || size === 'large' || size === 'xlarge') && !!dayContent?.primaryFeast && (
        <View style={styles.centerContent}>
          <Text
            style={[
              styles.feastName,
              size === 'medium' && styles.feastNameMedium,
              size === 'large' && styles.feastNameLarge,
              size === 'xlarge' && styles.feastNameXLarge,
              { color: colors.textColor }
            ]}
            numberOfLines={size === 'medium' ? 2 : size === 'large' ? 3 : 4}
          >
            {dayContent.primaryFeast.name}
          </Text>
        </View>
      )}
    </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'flex-start',
    // paddingTop: 4,
    // paddingLeft: 4,
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
  topLeftSection: {
    position: 'absolute',
    // top: 4,
    left: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  topRightSection: {
    position: 'absolute',
    top: 6,
    right: 4,
  },
  bottomRightSection: {
    position: 'absolute',
    bottom: 4,
    right: 4,
  },
  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 16,
  },
  dayNumber: {
    fontFamily: 'Georgia',
    fontWeight: '600',
    marginRight: 4,
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
    marginTop: 2,
  },
  rankBadge: {
    width: 16,
    height: 16,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankBadgeLarge: {
    width: 20,
    height: 20,
    borderRadius: 5,
  },
  rankText: {
    fontSize: 9,
    fontWeight: '700',
    fontFamily: 'Georgia',
  },
  rankTextLarge: {
    fontSize: 11,
  },
  dominicanBadge: {
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    top: 2
  },
  dominicanBadgeText: {
    fontSize: 8,
    fontWeight: '700',
    fontFamily: 'Georgia',
  },
  dominicanSymbol: {
    fontSize: 12,
  },
  multipleFeastsIndicator: {
    borderRadius: 6,
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.4)',
  },
  multipleFeastsText: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'Georgia',
  },
  feastName: {
    fontFamily: 'Georgia',
    textAlign: 'center',
    paddingHorizontal: 6,
    lineHeight: 14,
  },
  feastNameMedium: {
    fontSize: 9,
    fontWeight: '500',
  },
  feastNameLarge: {
    fontSize: 11,
    fontWeight: '500',
    lineHeight: 15,
  },
  feastNameXLarge: {
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 17,
  },
});

export default DayCell;

