import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Switch } from 'react-native';
import { ChantType, getChantTypeDisplayName, getChantTypeDescription } from '@/assets/data/liturgy/compline/chant/gabc-mapping';
import { userChantPreferencesService } from '@/services/user-chant-preferences-service';
import { useAuth } from '@/contexts/AuthContext';

interface ChantTypeSelectorProps {
  style?: any;
  onPreferenceChange?: (chantType: ChantType, enabled: boolean) => void;
}

export const ChantTypeSelector: React.FC<ChantTypeSelectorProps> = ({
  style,
  onPreferenceChange
}) => {
  const { user } = useAuth();
  const [selectedType, setSelectedType] = useState<ChantType>('dominican');
  const [chantEnabled, setChantEnabled] = useState(true);
  const [loading, setLoading] = useState(false);

  // Available chant types
  const availableTypes: ChantType[] = ['dominican', 'solesmes', 'simple'];

  useEffect(() => {
    if (user?.id) {
      loadUserPreferences();
    }
  }, [user?.id]);

  const loadUserPreferences = async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      const [preference, enabled] = await Promise.all([
        userChantPreferencesService.getUserChantPreference(user.id),
        userChantPreferencesService.getChantNotationEnabled(user.id)
      ]);
      setSelectedType(preference);
      setChantEnabled(enabled);
    } catch (error) {
      console.error('Error loading user chant preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTypeChange = async (chantType: ChantType) => {
    if (!user?.id) {
      Alert.alert('Error', 'You must be logged in to change preferences');
      return;
    }

    try {
      setLoading(true);
      const success = await userChantPreferencesService.updateUserChantPreference(
        user.id, 
        chantType
      );

      if (success) {
        setSelectedType(chantType);
        onPreferenceChange?.(chantType, chantEnabled);
      } else {
        Alert.alert('Error', 'Failed to update chant preference');
      }
    } catch (error) {
      console.error('Error updating chant preference:', error);
      Alert.alert('Error', 'Failed to update chant preference');
    } finally {
      setLoading(false);
    }
  };

  const handleEnabledToggle = async (enabled: boolean) => {
    if (!user?.id) {
      Alert.alert('Error', 'You must be logged in to change preferences');
      return;
    }

    try {
      setLoading(true);
      const success = await userChantPreferencesService.updateChantNotationEnabled(
        user.id, 
        enabled
      );

      if (success) {
        setChantEnabled(enabled);
        onPreferenceChange?.(selectedType, enabled);
      } else {
        Alert.alert('Error', 'Failed to update chant preference');
      }
    } catch (error) {
      console.error('Error updating chant enabled preference:', error);
      Alert.alert('Error', 'Failed to update chant preference');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !selectedType) {
    return (
      <View style={[styles.container, style]}>
        <Text style={styles.title}>Chant Notation</Text>
        <Text style={styles.loadingText}>Loading preferences...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <Text style={styles.title}>Chant Notation</Text>
      
      {/* Enable/Disable Toggle */}
      <View style={styles.toggleContainer}>
        <View style={styles.toggleHeader}>
          <Text style={styles.toggleTitle}>Show Chant Notation</Text>
          <Switch
            value={chantEnabled}
            onValueChange={handleEnabledToggle}
            disabled={loading}
            trackColor={{ false: '#E5E5E5', true: '#8B4513' }}
            thumbColor={chantEnabled ? '#fff' : '#f4f3f4'}
          />
        </View>
        <Text style={styles.toggleDescription}>
          Display Gregorian chant notation with the liturgical texts
        </Text>
      </View>

      {/* Chant Type Selection (only show if enabled) */}
      {chantEnabled && (
        <>
          <Text style={styles.subtitle}>
            Choose your preferred style of Gregorian chant notation
          </Text>
          
          <View style={styles.optionsContainer}>
            {availableTypes.map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.option,
                  selectedType === type && styles.selectedOption,
                  loading && styles.disabledOption
                ]}
                onPress={() => !loading && handleTypeChange(type)}
                disabled={loading}
              >
                <View style={styles.optionHeader}>
                  <Text style={[
                    styles.optionText,
                    selectedType === type && styles.selectedOptionText
                  ]}>
                    {getChantTypeDisplayName(type)}
                  </Text>
                  {selectedType === type && (
                    <Text style={styles.selectedIndicator}>✓</Text>
                  )}
                </View>
                <Text style={[
                  styles.optionDescription,
                  selectedType === type && styles.selectedOptionDescription
                ]}>
                  {getChantTypeDescription(type)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </>
      )}
      
      {loading && (
        <Text style={styles.savingText}>Saving preference...</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  toggleContainer: {
    marginBottom: 20,
    padding: 16,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  toggleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  toggleTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  toggleDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
    lineHeight: 20,
  },
  optionsContainer: {
    gap: 12,
  },
  option: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E5E5',
    backgroundColor: '#FAFAFA',
  },
  selectedOption: {
    borderColor: '#8B4513', // Dominican brown
    backgroundColor: '#F5F5DC', // Beige
  },
  disabledOption: {
    opacity: 0.6,
  },
  optionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  optionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  selectedOptionText: {
    color: '#8B4513',
  },
  selectedIndicator: {
    fontSize: 18,
    color: '#8B4513',
    fontWeight: 'bold',
  },
  optionDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  selectedOptionDescription: {
    color: '#8B4513',
  },
  loadingText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  savingText: {
    fontSize: 12,
    color: '#8B4513',
    textAlign: 'center',
    marginTop: 8,
    fontStyle: 'italic',
  },
});
