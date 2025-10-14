/**
 * Bible Version Selector Modal (Simplified)
 * Shows version list directly in a modal
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { useTheme } from './ThemeProvider';
import { multiVersionBibleService } from '../services/MultiVersionBibleService';
import { BibleVersion } from '../types/bible-version-types';

interface BibleVersionSelectorModalProps {
  visible: boolean;
  currentVersion: string;
  onVersionChange: (versionId: string) => void;
  onClose: () => void;
}

export default function BibleVersionSelectorModal({
  visible,
  currentVersion,
  onVersionChange,
  onClose,
}: BibleVersionSelectorModalProps) {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [versions, setVersions] = useState<BibleVersion[]>([]);

  useEffect(() => {
    const availableVersions = multiVersionBibleService.getAvailableVersions();
    setVersions(availableVersions);
  }, []);

  const handleVersionSelect = (versionId: string) => {
    onVersionChange(versionId);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity 
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View 
          style={[styles.modalContent, { backgroundColor: colors.card }]}
          onStartShouldSetResponder={() => true}
        >
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Select Bible Version
            </Text>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
            >
              <Ionicons 
                name="close" 
                size={24} 
                color={colors.textSecondary} 
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
                      ? colors.primary + '20'
                      : 'transparent',
                    borderLeftColor: currentVersion === version.id 
                      ? colors.primary 
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
                          ? colors.primary 
                          : colors.text 
                      }
                    ]}>
                      {version.name}
                    </Text>
                    {version.isDefault && (
                      <View style={[styles.defaultBadge, { backgroundColor: colors.primary }]}>
                        <Text style={[styles.defaultBadgeText, { color: colors.dominicanWhite }]}>
                          Default
                        </Text>
                      </View>
                    )}
                  </View>
                  <Text style={[styles.versionItemDescription, { color: colors.textSecondary }]}>
                    {version.description}
                  </Text>
                  <View style={styles.versionItemFooter}>
                    <Text style={[styles.versionItemLanguage, { color: colors.textMuted }]}>
                      Language: {version.language.toUpperCase()}
                    </Text>
                    <Text style={[styles.versionItemFormat, { color: colors.textMuted }]}>
                      Format: {version.format.toUpperCase()}
                    </Text>
                  </View>
                </View>
                {currentVersion === version.id && (
                  <Ionicons 
                    name="checkmark-circle" 
                    size={24} 
                    color={colors.primary} 
                  />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60, // Account for header
  },
  modalContent: {
    width: '90%',
    maxWidth: 500,
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

