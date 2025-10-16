import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../components/ThemeProvider';
import { Colors } from '../../../constants/Colors';
import { AdminUserService, AdminUser } from '../../../services/AdminUserService';

const ROLES = [
  { value: 'admin', label: 'Admin', icon: 'shield-checkmark', color: '#D32F2F' },
  { value: 'subscribed', label: 'Subscribed', icon: 'star', color: '#DAA520' },
  { value: 'authenticated', label: 'Authenticated', icon: 'person', color: '#8C1515' },
];

export default function EditUserScreen() {
  const { colorScheme } = useTheme();
  const { id } = useLocalSearchParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<AdminUser | null>(null);
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [selectedRole, setSelectedRole] = useState('authenticated');
  const [readingProgress, setReadingProgress] = useState<{
    books_started: number;
    books_completed: number;
  } | null>(null);

  useEffect(() => {
    loadUser();
  }, [id]);

  const loadUser = async () => {
    try {
      setLoading(true);
      const userData = await AdminUserService.getUser(id as string);
      setUser(userData);
      setFullName(userData.name);
      setUsername(userData.username);
      setSelectedRole(userData.role);

      // Load reading progress
      const progress = await AdminUserService.getUserReadingProgress(id as string);
      setReadingProgress(progress);
    } catch (error) {
      console.error('Error loading user:', error);
      Alert.alert('Error', 'Failed to load user details');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!fullName.trim()) {
      Alert.alert('Error', 'Please enter a name');
      return;
    }
    if (!username.trim()) {
      Alert.alert('Error', 'Please enter a username');
      return;
    }

    try {
      setSaving(true);

      // Update user profile
      await AdminUserService.updateUser(id as string, {
        full_name: fullName,
        username,
      });

      // Update role if changed
      if (selectedRole !== user?.role) {
        if (selectedRole === 'authenticated') {
          // Remove special role
          await AdminUserService.deleteUserRole(id as string);
        } else {
          // Set new role
          await AdminUserService.changeUserRole(id as string, selectedRole);
        }
      }

      Alert.alert('Success', 'User updated successfully');
      loadUser(); // Reload
    } catch (error) {
      console.error('Error updating user:', error);
      Alert.alert('Error', 'Failed to update user');
    } finally {
      setSaving(false);
    }
  };

  const handleResetPassword = async () => {
    if (!user?.email) return;

    Alert.alert(
      'Reset Password',
      `Send password reset email to ${user.email}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send',
          onPress: async () => {
            try {
              await AdminUserService.resetUserPassword(user.email);
              Alert.alert('Success', 'Password reset email sent');
            } catch (error) {
              Alert.alert('Error', 'Failed to send password reset email');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors[colorScheme ?? 'light'].primary} />
          <Text style={[styles.loadingText, { color: Colors[colorScheme ?? 'light'].text }]}>
            Loading user...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.form}>
          {/* User Avatar */}
          <View style={styles.avatarSection}>
            <View style={[styles.avatar, { backgroundColor: Colors[colorScheme ?? 'light'].primary }]}>
              <Ionicons name="person" size={48} color={Colors[colorScheme ?? 'light'].dominicanWhite} />
            </View>
          </View>

          {/* Email (read-only) */}
          <View style={styles.field}>
            <Text style={[styles.label, { color: Colors[colorScheme ?? 'light'].text }]}>
              Email (Read-only)
            </Text>
            <View style={[styles.readOnlyField, { backgroundColor: Colors[colorScheme ?? 'light'].card }]}>
              <Ionicons name="mail" size={20} color={Colors[colorScheme ?? 'light'].textSecondary} />
              <Text style={[styles.readOnlyText, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                {user?.email}
              </Text>
            </View>
          </View>

          {/* Full Name */}
          <View style={styles.field}>
            <Text style={[styles.label, { color: Colors[colorScheme ?? 'light'].text }]}>
              Full Name *
            </Text>
            <TextInput
              style={[styles.input, { 
                backgroundColor: Colors[colorScheme ?? 'light'].card,
                color: Colors[colorScheme ?? 'light'].text,
              }]}
              value={fullName}
              onChangeText={setFullName}
              placeholder="Enter full name"
              placeholderTextColor={Colors[colorScheme ?? 'light'].textSecondary}
            />
          </View>

          {/* Username */}
          <View style={styles.field}>
            <Text style={[styles.label, { color: Colors[colorScheme ?? 'light'].text }]}>
              Username *
            </Text>
            <TextInput
              style={[styles.input, { 
                backgroundColor: Colors[colorScheme ?? 'light'].card,
                color: Colors[colorScheme ?? 'light'].text,
              }]}
              value={username}
              onChangeText={setUsername}
              placeholder="Enter username"
              placeholderTextColor={Colors[colorScheme ?? 'light'].textSecondary}
            />
          </View>

          {/* Role */}
          <View style={styles.field}>
            <Text style={[styles.label, { color: Colors[colorScheme ?? 'light'].text }]}>
              User Role
            </Text>
            <View style={styles.roleOptions}>
              {ROLES.map((role) => (
                <TouchableOpacity
                  key={role.value}
                  style={[
                    styles.roleOption,
                    {
                      backgroundColor:
                        selectedRole === role.value
                          ? role.color + '20'
                          : Colors[colorScheme ?? 'light'].card,
                      borderColor:
                        selectedRole === role.value
                          ? role.color
                          : Colors[colorScheme ?? 'light'].border,
                    },
                  ]}
                  onPress={() => setSelectedRole(role.value)}
                >
                  <Ionicons
                    name={role.icon as any}
                    size={24}
                    color={selectedRole === role.value ? role.color : Colors[colorScheme ?? 'light'].textSecondary}
                  />
                  <Text
                    style={[
                      styles.roleOptionText,
                      {
                        color:
                          selectedRole === role.value
                            ? role.color
                            : Colors[colorScheme ?? 'light'].text,
                      },
                    ]}
                  >
                    {role.label}
                  </Text>
                  {selectedRole === role.value && (
                    <Ionicons name="checkmark-circle" size={20} color={role.color} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Reading Progress */}
          {readingProgress && (
            <View style={styles.field}>
              <Text style={[styles.label, { color: Colors[colorScheme ?? 'light'].text }]}>
                Reading Activity
              </Text>
              <View style={[styles.statsCard, { backgroundColor: Colors[colorScheme ?? 'light'].card }]}>
                <View style={styles.stat}>
                  <Ionicons name="book" size={24} color={Colors[colorScheme ?? 'light'].primary} />
                  <View style={styles.statInfo}>
                    <Text style={[styles.statValue, { color: Colors[colorScheme ?? 'light'].text }]}>
                      {readingProgress.books_started}
                    </Text>
                    <Text style={[styles.statLabel, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                      Books Started
                    </Text>
                  </View>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.stat}>
                  <Ionicons name="checkmark-circle" size={24} color={Colors[colorScheme ?? 'light'].success} />
                  <View style={styles.statInfo}>
                    <Text style={[styles.statValue, { color: Colors[colorScheme ?? 'light'].text }]}>
                      {readingProgress.books_completed}
                    </Text>
                    <Text style={[styles.statLabel, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                      Completed
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          )}

          {/* Account Dates */}
          <View style={styles.field}>
            <Text style={[styles.label, { color: Colors[colorScheme ?? 'light'].text }]}>
              Account Information
            </Text>
            <View style={[styles.infoCard, { backgroundColor: Colors[colorScheme ?? 'light'].card }]}>
              <View style={styles.infoRow}>
                <Text style={[styles.infoLabel, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                  Created
                </Text>
                <Text style={[styles.infoValue, { color: Colors[colorScheme ?? 'light'].text }]}>
                  {new Date(user?.created_at || '').toLocaleDateString()}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={[styles.infoLabel, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                  Last Updated
                </Text>
                <Text style={[styles.infoValue, { color: Colors[colorScheme ?? 'light'].text }]}>
                  {new Date(user?.updated_at || '').toLocaleDateString()}
                </Text>
              </View>
            </View>
          </View>

          {/* Reset Password Button */}
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: Colors[colorScheme ?? 'light'].card }]}
            onPress={handleResetPassword}
          >
            <Ionicons name="key" size={20} color={Colors[colorScheme ?? 'light'].primary} />
            <Text style={[styles.actionButtonText, { color: Colors[colorScheme ?? 'light'].text }]}>
              Send Password Reset Email
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Action Buttons */}
      <View style={[styles.footer, { backgroundColor: Colors[colorScheme ?? 'light'].surface }]}>
        <TouchableOpacity
          style={[styles.cancelButton, { borderColor: Colors[colorScheme ?? 'light'].border }]}
          onPress={() => router.back()}
          disabled={saving}
        >
          <Text style={[styles.cancelButtonText, { color: Colors[colorScheme ?? 'light'].text }]}>
            Cancel
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.saveButton, { backgroundColor: Colors[colorScheme ?? 'light'].primary }]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color={Colors[colorScheme ?? 'light'].dominicanWhite} />
          ) : (
            <Text style={[styles.saveButtonText, { color: Colors[colorScheme ?? 'light'].dominicanWhite }]}>
              Save Changes
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    fontFamily: 'Georgia',
  },
  form: {
    padding: 16,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  field: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Georgia',
    marginBottom: 8,
  },
  input: {
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    fontFamily: 'Georgia',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  readOnlyField: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  readOnlyText: {
    fontSize: 16,
    fontFamily: 'Georgia',
  },
  roleOptions: {
    gap: 12,
  },
  roleOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    gap: 12,
  },
  roleOptionText: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Georgia',
    fontWeight: '600',
  },
  statsCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  stat: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statDivider: {
    width: 1,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 16,
  },
  statInfo: {
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    fontFamily: 'Georgia',
  },
  statLabel: {
    fontSize: 12,
    fontFamily: 'Georgia',
  },
  infoCard: {
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: 14,
    fontFamily: 'Georgia',
  },
  infoValue: {
    fontSize: 14,
    fontFamily: 'Georgia',
    fontWeight: '600',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
    marginTop: 8,
  },
  actionButtonText: {
    fontSize: 16,
    fontFamily: 'Georgia',
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  cancelButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Georgia',
  },
  saveButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Georgia',
  },
});
