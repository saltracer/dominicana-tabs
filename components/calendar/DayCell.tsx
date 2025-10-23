import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, StyleSheet, Pressable, Platform } from 'react-native';
import { Colors } from '../../constants/Colors';
import { useTheme } from '../ThemeProvider';
import LiturgicalCalendarService from '../../services/LiturgicalCalendar';
import { parseISO, format } from 'date-fns';

export type FeastColorFilter = 'red' | 'white' | 'green' | 'purple' | 'rose';

interface DayCellProps {
  date?: {
    dateString: string;
    day: number;
  };
  marking?: any;
  onPress?: (date?: any) => void;
  size?: 'small' | 'medium' | 'large' | 'xlarge';
  showFeastName?: boolean;
  colorFilters?: FeastColorFilter[];
  dominicanOnly?: boolean;
}

const DayCell: React.FC<DayCellProps> = ({
  date,
  marking,
  onPress,
  size = 'medium',
  showFeastName = false,
  colorFilters = [],
  dominicanOnly = false,
}) => {
  const { colorScheme } = useTheme();
  const [dayContent, setDayContent] = useState<any>(null);

  useEffect(() => {
    if (date?.dateString) {
      const calendarService = LiturgicalCalendarService.getInstance();
      const selectedDate = parseISO(date.dateString);
      const liturgicalDay = calendarService.getLiturgicalDay(selectedDate);

      if (liturgicalDay.feasts.length > 0) {
        // Apply filters to feasts
        let feasts = [...liturgicalDay.feasts];
        
        // Apply Dominican filter
        if (dominicanOnly) {
          feasts = feasts.filter(feast => feast.isDominican);
        }
        
        // Apply color filters
        if (colorFilters.length > 0) {
          feasts = feasts.filter(feast => {
            const feastColor = feast.color?.toLowerCase() || '';
            return colorFilters.some(filter => {
              if (filter === 'purple') return feastColor === 'purple' || feastColor === 'violet';
              if (filter === 'rose') return feastColor === 'rose' || feastColor === 'pink';
              return feastColor === filter;
            });
          });
        }
        
        // Only show content if there are feasts after filtering
        if (feasts.length > 0) {
          // Get the highest rank feast for this date
          const primaryFeast = feasts.reduce((highest, current) => {
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
          }, feasts[0]);

          const hasDominicanFeast = feasts.some(feast => feast.isDominican);

          setDayContent({
            primaryFeast,
            hasDominicanFeast,
            feastCount: feasts.length,
            isDominican: hasDominicanFeast,
          });
        } else {
          // No feasts after filtering
          setDayContent(null);
        }
      } else {
        setDayContent(null);
      }
    }
  }, [date?.dateString, colorFilters, dominicanOnly]);

  const isToday = date?.dateString === format(new Date(), 'yyyy-MM-dd');
  const isSelected = marking?.selected;
  const hasFeasts = dayContent && dayContent.feastCount > 0;

  const colors = useMemo(() => {
    const currentColors = Colors[colorScheme ?? 'light'];

    // Map liturgical color names to hex codes
    const getLiturgicalColorHex = (colorName: string | undefined): string => {
      if (!colorName) return currentColors.textMuted;
      const color = colorName.toLowerCase();
      switch (color) {
        case 'red':
          return '#DC143C';
        case 'white':
          return '#FFFFFF';
        case 'green':
          return '#2E7D32';
        case 'purple':
        case 'violet':
          return '#8B008B';
        case 'rose':
        case 'pink':
          return '#FFB6C1';
        case 'gold':
          return '#FFD700';
        default:
          return currentColors.textMuted;
      }
    };

    const feastColor = dayContent?.primaryFeast ? getLiturgicalColorHex(dayContent.primaryFeast.color) : currentColors.textMuted;

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
      feastIndicatorColor: feastColor,
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
      {/* Day Number - Top Left */}
      <View style={styles.topLeftSection}>
        <Text style={[styles.dayNumber, dayNumberSize, { color: colors.textColor }]}>
          {date?.day}
        </Text>
      </View>

      {/* Feast Level Indicator - Always Top Right */}
      {hasFeasts && (
        <View style={styles.topRightSection}>
          <View
            style={[
              styles.rankBadge,
              size === 'large' && styles.rankBadgeLarge,
              size === 'xlarge' && styles.rankBadgeXLarge,
              { 
                backgroundColor: colors.feastIndicatorColor,
                borderColor: colors.feastIndicatorColor === '#FFFFFF' || 
                             colors.feastIndicatorColor === '#FFD700' // White or Gold
                  ? '#000000' 
                  : 'rgba(255,255,255,0.3)',
                borderWidth: 1,
              },
            ]}
          >
            <Text
              style={[
                styles.rankText,
                size === 'large' && styles.rankTextLarge,
                size === 'xlarge' && styles.rankTextXLarge,
                {
                  color: colors.feastIndicatorColor === '#FFFFFF' || 
                         colors.feastIndicatorColor === '#FFD700' // White or Gold
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

      {/* Dominican Indicator - Bottom Left */}
      {hasFeasts && dayContent.isDominican && (
        <View style={styles.bottomLeftSection}>
          <View
            style={[
              styles.dominicanBadge,
              size === 'large' && styles.dominicanBadgeLarge,
              size === 'xlarge' && styles.dominicanBadgeXLarge,
              { backgroundColor: Colors[colorScheme ?? 'light'].dominicanBlack },
            ]}
          >
            <Text style={[
              styles.dominicanBadgeText,
              size === 'large' && styles.dominicanBadgeTextLarge,
              size === 'xlarge' && styles.dominicanBadgeTextXLarge,
              { color: Colors[colorScheme ?? 'light'].dominicanWhite }
            ]}>
              OP
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
              size === 'large' && styles.multipleFeastsIndicatorLarge,
              size === 'xlarge' && styles.multipleFeastsIndicatorXLarge,
              { backgroundColor: Colors[colorScheme ?? 'light'].surface },
            ]}
          >
            <Text
              style={[
                styles.multipleFeastsText,
                size === 'large' && styles.multipleFeastsTextLarge,
                size === 'xlarge' && styles.multipleFeastsTextXLarge,
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
  },
  topRightSection: {
    position: 'absolute',
    top: 6,
    right: 4,
  },
  bottomLeftSection: {
    position: 'absolute',
    bottom: 4,
    left: 4,
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
    width: 22,
    height: 22,
    borderRadius: 5,
  },
  rankBadgeXLarge: {
    width: 26,
    height: 26,
    borderRadius: 6,
  },
  rankText: {
    fontSize: 9,
    fontWeight: '700',
    fontFamily: 'Georgia',
  },
  rankTextLarge: {
    fontSize: 12,
  },
  rankTextXLarge: {
    fontSize: 14,
  },
  dominicanBadge: {
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dominicanBadgeLarge: {
    width: 22,
    height: 22,
    borderRadius: 11,
  },
  dominicanBadgeXLarge: {
    width: 26,
    height: 26,
    borderRadius: 13,
  },
  dominicanBadgeText: {
    fontSize: 8,
    fontWeight: '700',
    fontFamily: 'Georgia',
  },
  dominicanBadgeTextLarge: {
    fontSize: 9,
  },
  dominicanBadgeTextXLarge: {
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
    borderColor: 'rgba(0,0,0,0.4)',
  },
  multipleFeastsIndicatorLarge: {
    borderRadius: 7,
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  multipleFeastsIndicatorXLarge: {
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  multipleFeastsText: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'Georgia',
  },
  multipleFeastsTextLarge: {
    fontSize: 14,
  },
  multipleFeastsTextXLarge: {
    fontSize: 16,
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

