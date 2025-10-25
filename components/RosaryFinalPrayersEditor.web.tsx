import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { useTheme } from './ThemeProvider';
import { FinalPrayerConfig, FinalPrayerMetadata } from '../types/rosary-types';
import { FINAL_PRAYERS } from '../constants/rosaryData';

interface RosaryFinalPrayersEditorProps {
  userId: string;
  initialConfig: FinalPrayerConfig[];
  onSave: (config: FinalPrayerConfig[]) => Promise<void>;
}

interface PrayerItem extends FinalPrayerMetadata {
  enabled: boolean;
  order: number;
}

export default function RosaryFinalPrayersEditor({
  userId,
  initialConfig,
  onSave,
}: RosaryFinalPrayersEditorProps) {
  const { colorScheme } = useTheme();
  const [prayers, setPrayers] = useState<PrayerItem[]>([]);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);


  useEffect(() => {
    // Initialize prayers from FINAL_PRAYERS metadata
    const initialPrayers: PrayerItem[] = FINAL_PRAYERS.map((prayer) => {
      const userConfig = initialConfig.find((config) => config.id === prayer.id);
      return {
        ...prayer,
        enabled: !!userConfig,
        order: userConfig?.order || 999,
      };
    });

    // Sort by order, then by original position
    initialPrayers.sort((a, b) => {
      if (a.enabled !== b.enabled) return a.enabled ? -1 : 1;
      return a.order - b.order;
    });

    setPrayers(initialPrayers);
  }, [initialConfig]);

  const togglePrayer = (id: string) => {
    setPrayers((prev) => {
      const updated = prev.map((prayer) =>
        prayer.id === id
          ? { ...prayer, enabled: !prayer.enabled }
          : prayer
      );
      setHasChanges(true);
      return updated;
    });
  };

  const movePrayer = (id: string, direction: 'up' | 'down') => {
    setPrayers((prev) => {
      const enabledPrayers = prev.filter((prayer) => prayer.enabled);
      const disabledPrayers = prev.filter((prayer) => !prayer.enabled);
      
      const currentIndex = enabledPrayers.findIndex((prayer) => prayer.id === id);
      if (currentIndex === -1) return prev;
      
      const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
      if (newIndex < 0 || newIndex >= enabledPrayers.length) return prev;
      
      // Swap items
      const newEnabledPrayers = [...enabledPrayers];
      [newEnabledPrayers[currentIndex], newEnabledPrayers[newIndex]] = 
      [newEnabledPrayers[newIndex], newEnabledPrayers[currentIndex]];
      
      // Update order
      const updated = [...newEnabledPrayers, ...disabledPrayers].map((prayer, index) => ({
        ...prayer,
        order: prayer.enabled ? index + 1 : 999,
      }));
      
      setHasChanges(true);
      return updated;
    });
  };

  const handleSave = async () => {
    if (!hasChanges) return;

    setSaving(true);
    try {
      const enabledPrayers = prayers
        .filter((prayer) => prayer.enabled)
        .map((prayer, index) => ({
          id: prayer.id,
          order: index + 1,
        }));

      await onSave(enabledPrayers);
      setHasChanges(false);
      Alert.alert('Success', 'Final prayers saved successfully');
    } catch (error) {
      console.error('Error saving final prayers:', error);
      Alert.alert('Error', 'Failed to save final prayers');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    Alert.alert(
      'Reset Final Prayers',
      'This will restore the default final prayers. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            const defaultPrayers: PrayerItem[] = FINAL_PRAYERS.map((prayer) => ({
              ...prayer,
              enabled: ['hail_holy_queen', 'versicle_response', 'rosary_prayer'].includes(prayer.id),
              order: ['hail_holy_queen', 'versicle_response', 'rosary_prayer'].indexOf(prayer.id) + 1,
            }));
            setPrayers(defaultPrayers);
            setHasChanges(true);
          },
        },
      ]
    );
  };

  const renderPrayerItem = (item: PrayerItem, index: number) => {
    const isEnabled = item.enabled;
    const isTraditional = item.traditional;
    const enabledPrayers = prayers.filter((prayer) => prayer.enabled);
    const currentIndex = enabledPrayers.findIndex((prayer) => prayer.id === item.id);

    return (
      <TouchableOpacity
        key={item.id}
        style={[
          styles.prayerItem,
          {
            backgroundColor: Colors[colorScheme ?? 'light'].card,
            borderColor: Colors[colorScheme ?? 'light'].border,
          },
          isEnabled && styles.enabledItem,
        ]}
      >
        <View style={styles.prayerContent}>
          <View style={styles.prayerHeader}>
            <TouchableOpacity
              style={styles.checkbox}
              onPress={() => togglePrayer(item.id)}
            >
              <Ionicons
                name={isEnabled ? 'checkbox' : 'square-outline'}
                size={24}
                color={isEnabled ? Colors[colorScheme ?? 'light'].primary : Colors[colorScheme ?? 'light'].text}
              />
            </TouchableOpacity>

            <View style={styles.prayerInfo}>
              <Text style={[styles.prayerName, { color: Colors[colorScheme ?? 'light'].text }]}>
                {item.name}
              </Text>
              {isTraditional && (
                <View style={[styles.traditionalBadge, { backgroundColor: Colors[colorScheme ?? 'light'].primary }]}>
                  <Text style={[styles.badgeText, { color: Colors[colorScheme ?? 'light'].background }]}>
                    Traditional
                  </Text>
                </View>
              )}
            </View>

            {isEnabled && (
              <View style={styles.orderControls}>
                <TouchableOpacity
                  style={[styles.orderButton, currentIndex === 0 && styles.disabledButton]}
                  onPress={() => movePrayer(item.id, 'up')}
                  disabled={currentIndex === 0}
                >
                  <Ionicons
                    name="chevron-up"
                    size={20}
                    color={currentIndex === 0 ? Colors[colorScheme ?? 'light'].textSecondary : Colors[colorScheme ?? 'light'].text}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.orderButton, currentIndex === enabledPrayers.length - 1 && styles.disabledButton]}
                  onPress={() => movePrayer(item.id, 'down')}
                  disabled={currentIndex === enabledPrayers.length - 1}
                >
                  <Ionicons
                    name="chevron-down"
                    size={20}
                    color={currentIndex === enabledPrayers.length - 1 ? Colors[colorScheme ?? 'light'].textSecondary : Colors[colorScheme ?? 'light'].text}
                  />
                </TouchableOpacity>
              </View>
            )}
          </View>

          {isEnabled && (
            <Text style={[styles.prayerPreview, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
              {item.name} • Use arrows to reorder
            </Text>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const enabledPrayers = prayers.filter((prayer) => prayer.enabled);
  const enabledIds = enabledPrayers.map((prayer) => prayer.id);

  return (
    <View style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: Colors[colorScheme ?? 'light'].text }]}>
          Final Prayers
        </Text>
        <Text style={[styles.description, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
          Select and arrange the prayers to include at the end of your rosary
        </Text>
      </View>

      <ScrollView style={styles.prayerList} showsVerticalScrollIndicator={false}>
        {prayers.map((prayer, index) => renderPrayerItem(prayer, index))}
      </ScrollView>

      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.resetButton, { borderColor: Colors[colorScheme ?? 'light'].border }]}
          onPress={handleReset}
        >
          <Text style={[styles.resetButtonText, { color: Colors[colorScheme ?? 'light'].text }]}>
            Reset to Default
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.saveButton,
            { backgroundColor: Colors[colorScheme ?? 'light'].primary },
            (!hasChanges || saving) && styles.disabledButton,
          ]}
          onPress={handleSave}
          disabled={!hasChanges || saving}
        >
          {saving ? (
            <ActivityIndicator color={Colors[colorScheme ?? 'light'].background} size="small" />
          ) : (
            <Text style={[styles.saveButtonText, { color: Colors[colorScheme ?? 'light'].background }]}>
              Save Changes
            </Text>
          )}
        </TouchableOpacity>
      </View>

      <Text style={[styles.helpText, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
        {enabledPrayers.length} prayer{enabledPrayers.length !== 1 ? 's' : ''} selected
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
    padding: 16,
    borderRadius: 12,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
  },
  prayerList: {
    marginBottom: 16,
  },
  prayerItem: {
    marginBottom: 8,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    cursor: 'grab',
  },
  enabledItem: {
    borderColor: '#007AFF',
    borderWidth: 2,
  },
  prayerContent: {
    flex: 1,
  },
  prayerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    marginRight: 12,
  },
  prayerInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  prayerName: {
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
  },
  traditionalBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  orderControls: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  orderButton: {
    padding: 4,
    marginVertical: 2,
  },
  prayerPreview: {
    fontSize: 12,
    marginTop: 8,
    fontStyle: 'italic',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  resetButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    marginRight: 8,
    alignItems: 'center',
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  saveButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginLeft: 8,
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.5,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  helpText: {
    fontSize: 12,
    textAlign: 'center',
  },
});
