import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { MarianHymnComponent } from '@/types/compline-types';
import { ChantType, getChantTypeDisplayName, getChantTypeDescription } from '@/assets/data/liturgy/compline/chant/gabc-mapping';
import { GabcRenderer } from './GabcRenderer';
import { useChantPreferences } from '@/hooks/useChantPreferences';
import { ChantResource } from '@/types/compline-types';
import { useTheme } from './ThemeProvider';

interface MarianHymnWithChantProps {
  marianHymn: MarianHymnComponent;
  showChantSelector?: boolean;
  showChantNotation?: boolean;
  style?: any;
}

export const MarianHymnWithChant: React.FC<MarianHymnWithChantProps> = ({
  marianHymn,
  showChantSelector = true,
  showChantNotation = true,
  style
}) => {
  const { colorScheme } = useTheme();
  const { selectedChantType, chantEnabled, setSelectedChantType, getChantResource, loading, error } = useChantPreferences();
  const [chantResource, setChantResource] = useState<ChantResource | null>(null);
  const [showChant, setShowChant] = useState(false);

  // Load chant resource when chant type changes or when enabled state changes
  useEffect(() => {
    if (showChantNotation && marianHymn.id && chantEnabled) {
      loadChantResource();
    } else {
      setChantResource(null);
    }
  }, [selectedChantType, marianHymn.id, showChantNotation, chantEnabled]);

  const loadChantResource = async () => {
    if (!marianHymn.id) return;
    
    const resource = await getChantResource(marianHymn.id);
    setChantResource(resource);
  };

  const handleChantTypeChange = async (chantType: ChantType) => {
    const success = await setSelectedChantType(chantType);
    if (!success) {
      Alert.alert('Error', 'Failed to update chant preference');
    }
  };

  const toggleChantNotation = () => {
    setShowChant(!showChant);
  };

  const availableChantTypes = marianHymn.chant?.availableTypes || ['dominican', 'solesmes', 'simple'];

  return (
    <ScrollView testID="marian-hymn-container" style={[styles.container, style]}>
      {/* Marian Hymn Content */}
      <View style={styles.hymnContent}>
        <Text style={styles.hymnTitle}>
          {marianHymn.title.en.text}
        </Text>
        <Text style={styles.hymnTitleLatin}>
          {marianHymn.title.la.text}
        </Text>
        
        <View style={styles.textContainer}>
          <Text style={styles.englishText}>
            {marianHymn.content.en.text}
          </Text>
        </View>
        
        <View style={styles.textContainer}>
          <Text style={styles.latinText}>
            {marianHymn.content.la.text}
          </Text>
        </View>
      </View>

      {/* Chant Type Selector */}
      {showChantSelector && (
        <View style={styles.chantSelector}>
          <Text style={styles.selectorTitle}>Chant Type</Text>
          <View style={styles.chantOptions}>
            {availableChantTypes.map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.chantOption,
                  selectedChantType === type && styles.selectedChantOption
                ]}
                onPress={() => handleChantTypeChange(type)}
              >
                <Text style={[
                  styles.chantOptionText,
                  selectedChantType === type && styles.selectedChantOptionText
                ]}>
                  {getChantTypeDisplayName(type)}
                </Text>
                <Text style={[
                  styles.chantOptionDescription,
                  selectedChantType === type && styles.selectedChantOptionDescription
                ]}>
                  {getChantTypeDescription(type)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Chant Notation Toggle */}
      {showChantNotation && chantEnabled && (
        <View style={styles.chantNotationSection}>
          <TouchableOpacity
            style={styles.toggleButton}
            onPress={toggleChantNotation}
          >
            <Text style={styles.toggleButtonText}>
              {showChant ? 'Hide' : 'Show'} Chant Notation
            </Text>
          </TouchableOpacity>

          {showChant && chantResource && (
            <View style={styles.notationContainer}>
              <GabcRenderer
                chantResource={chantResource}
                width={undefined}
                height={400}
                theme={colorScheme === 'dark' ? 'dark' : 'light'}
                enableWebView={true}
              />
            </View>
          )}

          {showChant && loading && (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Loading chant notation...</Text>
            </View>
          )}

          {showChant && error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>
                Unable to load chant notation: {error}
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Show message when chant is disabled */}
      {showChantNotation && !chantEnabled && (
        <View style={styles.disabledContainer}>
          <Text style={styles.disabledText}>
            Chant notation is disabled in your preferences
          </Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  hymnContent: {
    padding: 16,
  },
  hymnTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
    textAlign: 'center',
  },
  hymnTitleLatin: {
    fontSize: 20,
    fontStyle: 'italic',
    color: '#8B4513',
    marginBottom: 16,
    textAlign: 'center',
  },
  textContainer: {
    marginBottom: 16,
  },
  englishText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
    textAlign: 'left',
  },
  latinText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#666',
    fontStyle: 'italic',
    textAlign: 'left',
  },
  chantSelector: {
    padding: 16,
    backgroundColor: '#f8f8f8',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  selectorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  chantOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chantOption: {
    flex: 1,
    minWidth: 100,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
  },
  selectedChantOption: {
    borderColor: '#8B4513',
    backgroundColor: '#F5F5DC',
  },
  chantOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  selectedChantOptionText: {
    color: '#8B4513',
  },
  chantOptionDescription: {
    fontSize: 12,
    color: '#666',
    lineHeight: 16,
  },
  selectedChantOptionDescription: {
    color: '#8B4513',
  },
  chantNotationSection: {
    padding: 16,
  },
  toggleButton: {
    backgroundColor: '#8B4513',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  toggleButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  notationContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    overflow: 'hidden',
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  errorContainer: {
    padding: 20,
    backgroundColor: '#ffebee',
    borderRadius: 8,
  },
  errorText: {
    fontSize: 14,
    color: '#d32f2f',
    textAlign: 'center',
  },
  disabledContainer: {
    padding: 20,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    margin: 16,
    alignItems: 'center',
  },
  disabledText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    textAlign: 'center',
  },
});
