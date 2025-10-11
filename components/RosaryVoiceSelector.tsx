/**
 * RosaryVoiceSelector Component
 * Allows users to select their preferred voice for rosary audio playback
 */

import React, { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { UserLiturgyPreferencesService } from '../services/UserLiturgyPreferencesService';
import LiturgyPreferencesDropdown from './LiturgyPreferencesDropdown';

interface VoiceOption {
  label: string;
  value: string;
}

const AVAILABLE_VOICES: VoiceOption[] = [
  {
    label: 'Alphonsus',
    value: 'alphonsus',
  },
  {
    label: 'Catherine',
    value: 'catherine',
  },
  {
    label: 'Teresa',
    value: 'teresa',
  },
];

export default function RosaryVoiceSelector() {
  const { user } = useAuth();
  const [selectedVoice, setSelectedVoice] = useState<string>('alphonsus');

  // Load current voice preference
  useEffect(() => {
    const loadVoice = async () => {
      if (user?.id) {
        try {
          const prefs = await UserLiturgyPreferencesService.getUserPreferences(user.id);
          if (prefs?.rosary_voice) {
            setSelectedVoice(prefs.rosary_voice);
          }
        } catch (error) {
          console.error('Error loading voice preference:', error);
        }
      }
    };

    loadVoice();
  }, [user?.id]);

  const handleVoiceSelect = (value: string | number) => {
    const voiceId = String(value);
    
    if (!user?.id) {
      Alert.alert('Sign In Required', 'Please sign in to save voice preferences.');
      return;
    }

    setSelectedVoice(voiceId);

    // Save asynchronously without awaiting
    UserLiturgyPreferencesService.updateUserPreferences(user.id, {
      rosary_voice: voiceId,
    }).then((result) => {
      if (result.success) {
        console.log('Rosary voice preference saved:', voiceId);
      } else {
        console.error('Failed to save voice preference:', result.error);
        Alert.alert('Error', 'Failed to save voice preference. Please try again.');
      }
    }).catch((error) => {
      console.error('Error saving voice preference:', error);
      Alert.alert('Error', 'An unexpected error occurred.');
    });
  };

  if (!user) {
    return null; // Don't show voice selector if not signed in
  }

  return (
    <LiturgyPreferencesDropdown
      label="Rosary Voice"
      description="Select the narrator voice for audio-guided rosary prayers"
      value={selectedVoice}
      options={AVAILABLE_VOICES}
      onValueChange={handleVoiceSelect}
      icon="mic-outline"
    />
  );
}


