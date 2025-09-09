/**
 * Bible Version Selector Component
 * 
 * Allows users to select between different Bible versions
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { useTheme } from './ThemeProvider';
import { multiVersionBibleService } from '../services/MultiVersionBibleService';
import { BibleVersion } from '../types/bible-version-types';

interface BibleVersionSelectorProps {
  currentVersion: string;
  onVersionChange: (versionId: string) => void;
  style?: any;
}

export default function BibleVersionSelector({
  currentVersion,
  onVersionChange,
  style
}: BibleVersionSelectorProps) {
  const { colorScheme } = useTheme();
  const [versions, setVersions] = useState<BibleVersion[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadVersions();
  }, []);

  const loadVersions = async () => {
    try {
      setLoading(true);
      const availableVersions = multiVersionBibleService.getAvailableVersions();
      setVersions(availableVersions);
    } catch (error) {
      console.error('Error loading Bible versions:', error);
      Alert.alert('Error', 'Failed to load Bible versions');
    } finally {
      setLoading(false);
    }
  };

  const handleVersionSelect = (versionId: string) => {
    onVersionChange(versionId);
    setShowModal(false);
  };

  const getCurrentVersionInfo = (): BibleVersion | null => {
    return versions.find(v => v.id === currentVersion) || null;
  };

  const currentVersionInfo = getCurrentVersionInfo();

  if (loading) {
    return (
      <View style={[styles.container, style]}>
        <Text style={[styles.loadingText, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
          Loading versions...
        </Text>
      </View>
    );
  }

  return (
    <>
      <TouchableOpacity
        style={[
          styles.selector,
          { 
            backgroundColor: Colors[colorScheme ?? 'light'].card,
            borderColor: Colors[colorScheme ?? 'light'].border
          }
        ]}
        onPress={() => setShowModal(true)}
      >
        <View style={styles.selectorContent}>
          <View style={styles.versionInfo}>
            <Text style={[styles.versionName, { color: Colors[colorScheme ?? 'light'].text }]}>
              {currentVersionInfo?.shortName || 'Select Version'}
            </Text>
            <Text style={[styles.versionDescription, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
              {currentVersionInfo?.description || ''}
            </Text>
          </View>
          <Ionicons 
            name="chevron-down" 
            size={20} 
            color={Colors[colorScheme ?? 'light'].textSecondary} 
          />
        </View>
      </TouchableOpacity>

      <Modal
        visible={showModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: Colors[colorScheme ?? 'light'].card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
                Select Bible Version
              </Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowModal(false)}
              >
                <Ionicons 
                  name="close" 
                  size={24} 
                  color={Colors[colorScheme ?? 'light'].textSecondary} 
                />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.versionList}>
              {versions.map((version) => (
                <TouchableOpacity
                  key={version.id}
                  style={[
                    styles.versionItem,
                    {
                      backgroundColor: currentVersion === version.id 
                        ? Colors[colorScheme ?? 'light'].primary + '20'
                        : 'transparent',
                      borderLeftColor: currentVersion === version.id 
                        ? Colors[colorScheme ?? 'light'].primary 
                        : 'transparent'
                    }
                  ]}
                  onPress={() => handleVersionSelect(version.id)}
                >
                  <View style={styles.versionItemContent}>
                    <View style={styles.versionItemHeader}>
                      <Text style={[
                        styles.versionItemName,
                        { 
                          color: currentVersion === version.id 
                            ? Colors[colorScheme ?? 'light'].primary 
                            : Colors[colorScheme ?? 'light'].text 
                        }
                      ]}>
                        {version.name}
                      </Text>
                      {version.isDefault && (
                        <View style={[styles.defaultBadge, { backgroundColor: Colors[colorScheme ?? 'light'].primary }]}>
                          <Text style={[styles.defaultBadgeText, { color: Colors[colorScheme ?? 'light'].dominicanWhite }]}>
                            Default
                          </Text>
                        </View>
                      )}
                    </View>
                    <Text style={[styles.versionItemDescription, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                      {version.description}
                    </Text>
                    <View style={styles.versionItemFooter}>
                      <Text style={[styles.versionItemLanguage, { color: Colors[colorScheme ?? 'light'].textMuted }]}>
                        Language: {version.language.toUpperCase()}
                      </Text>
                      <Text style={[styles.versionItemFormat, { color: Colors[colorScheme ?? 'light'].textMuted }]}>
                        Format: {version.format.toUpperCase()}
                      </Text>
                    </View>
                  </View>
                  {currentVersion === version.id && (
                    <Ionicons 
                      name="checkmark-circle" 
                      size={24} 
                      color={Colors[colorScheme ?? 'light'].primary} 
                    />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  loadingText: {
    fontSize: 14,
    fontFamily: 'Georgia',
    textAlign: 'center',
    padding: 16,
  },
  selector: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  selectorContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  versionInfo: {
    flex: 1,
  },
  versionName: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Georgia',
    marginBottom: 2,
  },
  versionDescription: {
    fontSize: 14,
    fontFamily: 'Georgia',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    borderRadius: 16,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    fontFamily: 'Georgia',
  },
  closeButton: {
    padding: 4,
  },
  versionList: {
    maxHeight: 400,
  },
  versionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderLeftWidth: 4,
  },
  versionItemContent: {
    flex: 1,
  },
  versionItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  versionItemName: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Georgia',
    flex: 1,
  },
  defaultBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginLeft: 8,
  },
  defaultBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'Georgia',
  },
  versionItemDescription: {
    fontSize: 14,
    fontFamily: 'Georgia',
    marginBottom: 8,
  },
  versionItemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  versionItemLanguage: {
    fontSize: 12,
    fontFamily: 'Georgia',
  },
  versionItemFormat: {
    fontSize: 12,
    fontFamily: 'Georgia',
  },
});
