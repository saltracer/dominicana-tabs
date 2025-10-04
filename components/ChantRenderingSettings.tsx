import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Switch, Alert } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { UserChantPreferencesService } from '@/services/user-chant-preferences-service';

interface ChantRenderingSettingsProps {
  style?: any;
}

export const ChantRenderingSettings: React.FC<ChantRenderingSettingsProps> = ({ style }) => {
  const { user } = useAuth();
  const [webViewEnabled, setWebViewEnabled] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.id) {
      loadSettings();
    }
  }, [user?.id]);

  const loadSettings = async () => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      // For now, we'll use a simple local storage approach
      // In a real app, this would be stored in user preferences
      const saved = await UserChantPreferencesService.getUserChantPreference(user.id);
      setWebViewEnabled(saved === 'webview' || false);
    } catch (error) {
      console.error('Error loading chant rendering settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleWebViewToggle = async (value: boolean) => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      // Update the preference
      await UserChantPreferencesService.updateUserChantPreference(
        user.id, 
        value ? 'webview' : 'text'
      );
      setWebViewEnabled(value);
      
      if (value) {
        Alert.alert(
          'Advanced Rendering Enabled',
          'Chant notation will now render as proper musical notation using exsurge.js. This may use more resources but provides better visual quality.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Error updating chant rendering settings:', error);
      Alert.alert('Error', 'Failed to update settings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, style]}>
      <View style={styles.settingRow}>
        <View style={styles.settingInfo}>
          <Text style={styles.settingTitle}>Advanced Chant Rendering</Text>
          <Text style={styles.settingDescription}>
            Use exsurge.js for proper musical notation rendering. Requires more resources but provides better visual quality.
          </Text>
        </View>
        <Switch
          testID="webview-toggle"
          value={webViewEnabled}
          onValueChange={handleWebViewToggle}
          disabled={loading}
          trackColor={{ false: '#e0e0e0', true: '#8B4513' }}
          thumbColor={webViewEnabled ? '#ffffff' : '#ffffff'}
        />
      </View>
      
      {webViewEnabled && (
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            ✓ Advanced rendering enabled
          </Text>
          <Text style={styles.infoSubtext}>
            Chant notation will display as proper musical notation with SVG graphics
          </Text>
        </View>
      )}
      
      {!webViewEnabled && (
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            Using text-based display
          </Text>
          <Text style={styles.infoSubtext}>
            Chant notation will display as formatted text. Enable advanced rendering for better visual quality.
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginVertical: 8,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  infoBox: {
    backgroundColor: '#f8f8f8',
    borderRadius: 6,
    padding: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#8B4513',
  },
  infoText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  infoSubtext: {
    fontSize: 12,
    color: '#666',
    lineHeight: 16,
  },
});
