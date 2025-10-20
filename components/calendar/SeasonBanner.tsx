import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, getLiturgicalColorHex } from '../../constants/Colors';
import { useTheme } from '../ThemeProvider';

interface SeasonBannerProps {
  seasonName: string;
  seasonColor: string;
  weekString?: string;
  compact?: boolean;
}

const SeasonBanner: React.FC<SeasonBannerProps> = ({
  seasonName,
  seasonColor,
  weekString,
  compact = false,
}) => {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme ?? 'light'];
  const backgroundColor = getLiturgicalColorHex(seasonName, colorScheme === 'dark');
  const isWhite = seasonColor.toLowerCase() === 'white';
  const textColor = isWhite ? '#000000' : '#FFFFFF';

  return (
    <View
      style={[
        compact ? styles.compactContainer : styles.container,
        {
          backgroundColor,
          borderWidth: isWhite ? 1 : 0,
          borderColor: isWhite ? '#CCCCCC' : 'transparent',
        },
      ]}
    >
      <Text style={[compact ? styles.compactSeasonName : styles.seasonName, { color: textColor }]}>
        {seasonName}
      </Text>
      {!!weekString && !compact && (
        <Text style={[styles.weekString, { color: textColor }]}>{weekString}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  compactContainer: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  seasonName: {
    fontSize: 20,
    fontWeight: '700',
    fontFamily: 'Georgia',
    marginBottom: 4,
  },
  compactSeasonName: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'Georgia',
  },
  weekString: {
    fontSize: 14,
    fontFamily: 'Georgia',
  },
});

export default SeasonBanner;

