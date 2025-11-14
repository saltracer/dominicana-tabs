/**
 * Add Custom Podcast Modal - Web
 * Modal for adding custom podcast RSS feeds
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Image,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { useTheme } from './ThemeProvider';
import { useUserPodcasts } from '../hooks/useUserPodcasts';
import { ParsedRssFeed } from '../types/podcast-types';

interface AddCustomPodcastModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function AddCustomPodcastModal({ visible, onClose, onSuccess }: AddCustomPodcastModalProps) {
  const { colorScheme } = useTheme();
  const { validateFeed, addCustomPodcast, loading } = useUserPodcasts();
  
  const [rssUrl, setRssUrl] = useState('');
  const [preview, setPreview] = useState<ParsedRssFeed | null>(null);
  const [validating, setValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<'input' | 'preview'>('input');
  const [duplicateInfo, setDuplicateInfo] = useState<{ podcastId: string; isCurated: boolean } | null>(null);

  const handleValidate = async () => {
    console.log('[AddCustomPodcastModal.handleValidate] Starting validation for:', rssUrl);
    
    if (!rssUrl.trim()) {
      setError('Please enter a podcast RSS URL');
      return;
    }

    setValidating(true);
    setError(null);

    try {
      const result = await validateFeed(rssUrl.trim());
      console.log('[AddCustomPodcastModal.handleValidate] Validation result:', JSON.stringify(result));

      setValidating(false);

      if (!result.isValid) {
        setError(result.error || 'Invalid RSS feed');
        return;
      }

      // If duplicate, store the info and show preview with "Subscribe" button
      if (result.isDuplicate && result.duplicatePodcastId) {
        console.log('[AddCustomPodcastModal.handleValidate] Duplicate detected, showing subscribe button');
        setDuplicateInfo({
          podcastId: result.duplicatePodcastId,
          isCurated: result.isCurated || false,
        });
      } else {
        console.log('[AddCustomPodcastModal.handleValidate] New podcast, showing add button');
        setDuplicateInfo(null);
      }

      if (result.feed) {
        console.log('[AddCustomPodcastModal.handleValidate] Moving to preview step');
        setPreview(result.feed);
        setStep('preview');
      } else {
        console.log('[AddCustomPodcastModal.handleValidate] WARNING: No feed in result');
      }
    } catch (error) {
      console.log('[AddCustomPodcastModal.handleValidate] ERROR:', error);
      setValidating(false);
      setError('An unexpected error occurred');
    }
  };

  const handleAdd = async () => {
    // If it's a duplicate, subscribe directly
    if (duplicateInfo) {
      const result = await addCustomPodcast(rssUrl.trim());
      
      if (result.success) {
        const title = duplicateInfo.isCurated 
          ? 'Subscribed to Curated Podcast'
          : 'Subscribed to Existing Podcast';
        const message = duplicateInfo.isCurated
          ? `"${preview?.title}" was already in our curated library. You've been subscribed to it.`
          : `"${preview?.title}" was already added by another user. You've been subscribed to it.`;
        
        Alert.alert(title, message, [{ text: 'OK' }]);
        handleClose();
        onSuccess?.();
      } else {
        setError(result.error || 'Failed to subscribe');
        setStep('input');
      }
      return;
    }

    // Otherwise, add as a new podcast
    const result = await addCustomPodcast(rssUrl.trim());

    if (result.success) {
      Alert.alert(
        'Podcast Added',
        `"${result.podcast?.title}" has been added to your podcasts.`,
        [{ text: 'OK' }]
      );
      handleClose();
      onSuccess?.();
    } else {
      setError(result.error || 'Failed to add podcast');
      setStep('input');
    }
  };

  const handleClose = () => {
    setRssUrl('');
    setPreview(null);
    setError(null);
    setStep('input');
    setDuplicateInfo(null);
    onClose();
  };

  if (!visible) return null;

  return (
    <View style={styles.overlay}>
      <View style={styles.backdrop} onClick={handleClose as any} />
      <View style={[styles.modal, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
        <View style={[styles.header, { borderBottomColor: Colors[colorScheme ?? 'light'].border }]}>
          <Text style={[styles.title, { color: Colors[colorScheme ?? 'light'].text }]}>
            Add Custom Podcast
          </Text>
          <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
            <Ionicons name="close" size={28} color={Colors[colorScheme ?? 'light'].text} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
          {step === 'input' ? (
            <>
              <Text style={[styles.label, { color: Colors[colorScheme ?? 'light'].text }]}>
                Podcast RSS Feed URL
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: Colors[colorScheme ?? 'light'].card,
                    color: Colors[colorScheme ?? 'light'].text,
                    borderColor: error ? '#f44336' : Colors[colorScheme ?? 'light'].border,
                  },
                ]}
                placeholder="https://example.com/feed.xml"
                placeholderTextColor={Colors[colorScheme ?? 'light'].tabIconDefault}
                value={rssUrl}
                onChangeText={(text) => {
                  setRssUrl(text);
                  setError(null);
                }}
                autoCapitalize="none"
                autoCorrect={false}
              />

              {error && (
                <View style={styles.errorContainer}>
                  <Ionicons name="alert-circle" size={16} color="#f44336" />
                  <Text style={styles.errorText}>{error}</Text>
                </View>
              )}

              <Text style={[styles.helpText, { color: Colors[colorScheme ?? 'light'].tabIconDefault }]}>
                Enter the RSS feed URL of any podcast. We'll validate it and show you a preview before adding it to your library.
              </Text>

              <TouchableOpacity
                style={[
                  styles.button,
                  styles.primaryButton,
                  { backgroundColor: Colors[colorScheme ?? 'light'].primary },
                  (validating || !rssUrl.trim()) && styles.disabledButton,
                ]}
                onPress={handleValidate}
                disabled={validating || !rssUrl.trim()}
              >
                {validating ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Validate Feed</Text>
                )}
              </TouchableOpacity>
            </>
          ) : (
            <>
              {preview && (
                <>
                  <View style={styles.previewContainer}>
                    {preview.artworkUrl && (
                      <Image source={{ uri: preview.artworkUrl }} style={styles.artwork} />
                    )}
                    <View style={styles.previewInfo}>
                      <Text style={[styles.previewTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
                        {preview.title}
                      </Text>
                      {preview.author && (
                        <Text style={[styles.previewAuthor, { color: Colors[colorScheme ?? 'light'].tabIconDefault }]}>
                          by {preview.author}
                        </Text>
                      )}
                      <Text style={[styles.previewEpisodes, { color: Colors[colorScheme ?? 'light'].tabIconDefault }]}>
                        {preview.episodes.length} episodes
                      </Text>
                    </View>
                  </View>

                  {preview.description && (
                    <Text style={[styles.previewDescription, { color: Colors[colorScheme ?? 'light'].text }]}>
                      {preview.description}
                    </Text>
                  )}

                  <View style={styles.buttonRow}>
                    <TouchableOpacity
                      style={[
                        styles.button,
                        styles.secondaryButton,
                        { borderColor: Colors[colorScheme ?? 'light'].border },
                      ]}
                      onPress={() => setStep('input')}
                    >
                      <Text style={[styles.secondaryButtonText, { color: Colors[colorScheme ?? 'light'].text }]}>
                        Back
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.button,
                        styles.primaryButton,
                        { backgroundColor: Colors[colorScheme ?? 'light'].primary },
                        loading && styles.disabledButton,
                      ]}
                      onPress={handleAdd}
                      disabled={loading}
                    >
                      {loading ? (
                        <ActivityIndicator color="#fff" />
                      ) : (
                        <Text style={styles.buttonText}>
                          {duplicateInfo ? 'Subscribe' : 'Add Podcast'}
                        </Text>
                      )}
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </>
          )}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'fixed' as any,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backdrop: {
    position: 'absolute' as any,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modal: {
    width: '90%',
    maxWidth: 600,
    maxHeight: '90%',
    borderRadius: 12,
    overflow: 'hidden',
    zIndex: 1001,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 8,
    outline: 'none' as any,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  errorText: {
    color: '#f44336',
    fontSize: 14,
  },
  helpText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 24,
  },
  button: {
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    cursor: 'pointer' as any,
  },
  primaryButton: {
    marginBottom: 12,
  },
  secondaryButton: {
    borderWidth: 1,
    backgroundColor: 'transparent',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.5,
    cursor: 'not-allowed' as any,
  },
  previewContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  artwork: {
    width: 100,
    height: 100,
    borderRadius: 8,
    marginRight: 16,
  },
  previewInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  previewTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  previewAuthor: {
    fontSize: 14,
    marginBottom: 4,
  },
  previewEpisodes: {
    fontSize: 14,
  },
  previewDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 24,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
});

