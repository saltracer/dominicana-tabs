import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { useTheme } from './ThemeProvider';

interface AnnotationNoteEditorProps {
  visible: boolean;
  initialNote?: string | null;
  context?: string; // The highlighted text or bookmark location
  onSave: (note: string) => void;
  onClose: () => void;
}

const MAX_NOTE_LENGTH = 500;

export const AnnotationNoteEditor: React.FC<AnnotationNoteEditorProps> = ({
  visible,
  initialNote,
  context,
  onSave,
  onClose,
}) => {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [note, setNote] = useState(initialNote || '');

  useEffect(() => {
    setNote(initialNote || '');
  }, [initialNote, visible]);

  const handleSave = () => {
    onSave(note.trim());
    // Don't close here - let parent handle it
  };

  const handleCancel = () => {
    setNote(initialNote || '');
    onClose();
  };

  const remainingChars = MAX_NOTE_LENGTH - note.length;
  const isOverLimit = remainingChars < 0;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleCancel}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.overlay}
      >
        <TouchableOpacity 
          style={styles.backdrop} 
          activeOpacity={1}
          onPress={handleCancel}
        />
        <SafeAreaView style={styles.container} edges={['bottom']}>
          <View style={[styles.modal, { backgroundColor: colors.card }]}>
            {/* Header */}
            <View style={[styles.header, { borderBottomColor: colors.border }]}>
              <TouchableOpacity onPress={handleCancel} style={styles.headerButton}>
                <Text style={[styles.headerButtonText, { color: colors.textSecondary }]}>
                  Cancel
                </Text>
              </TouchableOpacity>
              <Text style={[styles.title, { color: colors.text }]}>
                Add Note
              </Text>
              <TouchableOpacity 
                onPress={handleSave} 
                style={styles.headerButton}
                disabled={isOverLimit}
              >
                <Text 
                  style={[
                    styles.headerButtonText, 
                    { color: isOverLimit ? colors.textMuted : colors.primary }
                  ]}
                >
                  Save
                </Text>
              </TouchableOpacity>
            </View>

            {/* Context */}
            {context && (
              <View style={[styles.contextContainer, { backgroundColor: colors.surface, borderLeftColor: colors.primary }]}>
                <View style={styles.contextHeader}>
                  <Ionicons name="bookmark" size={16} color={colors.primary} />
                  <Text style={[styles.contextLabel, { color: colors.textSecondary }]}>
                    Location
                  </Text>
                </View>
                <Text 
                  style={[styles.contextText, { color: colors.text }]} 
                  numberOfLines={3}
                >
                  {context}
                </Text>
              </View>
            )}

            {/* Note Input */}
            <ScrollView 
              style={styles.inputContainer}
              showsVerticalScrollIndicator={false}
            >
              <TextInput
                style={[
                  styles.input,
                  { 
                    color: colors.text,
                    borderColor: colors.border,
                  }
                ]}
                value={note}
                onChangeText={setNote}
                placeholder="Add your thoughts, reflections, or notes here..."
                placeholderTextColor={colors.textMuted}
                multiline
                autoFocus
                maxLength={MAX_NOTE_LENGTH}
                textAlignVertical="top"
              />
            </ScrollView>

            {/* Character Counter */}
            <View style={styles.footer}>
              <Text 
                style={[
                  styles.charCounter,
                  { 
                    color: isOverLimit ? colors.error : colors.textMuted 
                  }
                ]}
              >
                {remainingChars} characters remaining
              </Text>
            </View>
          </View>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  container: {
    maxHeight: '80%',
  },
  modal: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  headerButton: {
    minWidth: 60,
  },
  headerButtonText: {
    fontSize: 16,
    fontWeight: '600',
    // fontFamily: 'Georgia',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    // fontFamily: 'Georgia',
  },
  contextContainer: {
    padding: 12,
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 8,
    borderLeftWidth: 3,
  },
  contextHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  contextLabel: {
    fontSize: 12,
    // fontFamily: 'Georgia',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  contextText: {
    fontSize: 14,
    fontFamily: 'Georgia',
    lineHeight: 20,
  },
  inputContainer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    minHeight: 200,
    maxHeight: 400,
  },
  input: {
    fontSize: 15,
    fontFamily: 'Georgia',
    lineHeight: 22,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderRadius: 8,
    minHeight: 120,
    maxHeight: 300,
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    alignItems: 'center',
  },
  charCounter: {
    fontSize: 12,
    fontFamily: 'Georgia',
  },
});

