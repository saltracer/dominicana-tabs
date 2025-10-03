import React from 'react';
import { View, StyleSheet } from 'react-native';
import { MarianHymnWithChant } from './MarianHymnWithChant';
import { getMarianHymnForDate } from '@/assets/data/liturgy/compline/seasonal-marian-hymns';

/**
 * Example component showing how to integrate the new chant system
 * This can be used in your compline or other liturgical components
 */
export const ChantIntegrationExample: React.FC = () => {
  // Get the appropriate Marian hymn for today
  const marianHymn = getMarianHymnForDate(new Date());

  return (
    <View style={styles.container}>
      <MarianHymnWithChant
        marianHymn={marianHymn}
        showChantSelector={true}
        showChantNotation={true}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
});
