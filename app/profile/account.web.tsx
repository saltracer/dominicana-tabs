import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTheme } from '../../components/ThemeProvider';
import { useAuth } from '../../contexts/AuthContext';
import { useAdminAuth } from '../../hooks/useAdminAuth';
import { Colors } from '../../constants/Colors';

export default function AccountScreen() {
  const { colorScheme } = useTheme();
  const { user, profile, signOut } = useAuth();
  const { isAdmin } = useAdminAuth();

  const displayName = profile?.name || user?.user_metadata?.name || user?.email?.split('@')[0] || 'User';
  const displayEmail = profile?.email || user?.email || '';
  const displayRole = profile?.role || 'user';

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          onPress: async () => {
            try {
              await signOut();
              router.replace('/');
            } catch (error) {
              console.error('Logout error:', error);
              Alert.alert('Error', 'Failed to log out. Please try again.');
            }
          }
        }
      ]
    );
  };

  const handlePasswordReset = () => {
    Alert.alert(
      'Password Reset',
      `Send password reset email to ${displayEmail}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send',
          onPress: () => {
            // TODO: Implement password reset
            Alert.alert('Email Sent', 'Password reset email has been sent.');
          },
        },
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: Colors[colorScheme ?? 'light'].text }]}>
          Account Settings
        </Text>
        <Text style={[styles.subtitle, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
          Manage your account information and security
        </Text>
      </View>

      {/* Profile Avatar Section */}
      <View style={[styles.card, { backgroundColor: Colors[colorScheme ?? 'light'].card }]}>
        <View style={styles.avatarSection}>
          <View style={[styles.avatarLarge, { backgroundColor: Colors[colorScheme ?? 'light'].primary }]}>
            <Ionicons name="person" size={48} color={Colors[colorScheme ?? 'light'].dominicanWhite} />
          </View>
          <View style={styles.avatarInfo}>
            <Text style={[styles.avatarName, { color: Colors[colorScheme ?? 'light'].text }]}>
              {displayName}
            </Text>
            <View style={[styles.roleTag, { backgroundColor: Colors[colorScheme ?? 'light'].primary + '20' }]}>
              <Ionicons name="shield-checkmark" size={14} color={Colors[colorScheme ?? 'light'].primary} />
              <Text style={[styles.roleTagText, { color: Colors[colorScheme ?? 'light'].primary }]}>
                {displayRole.charAt(0).toUpperCase() + displayRole.slice(1)}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Account Information */}
      <View style={[styles.card, { backgroundColor: Colors[colorScheme ?? 'light'].card }]}>
        <Text style={[styles.cardTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
          Account Information
        </Text>

        <View style={styles.infoRow}>
          <View style={styles.infoLabel}>
            <Ionicons name="person-outline" size={20} color={Colors[colorScheme ?? 'light'].textSecondary} />
            <Text style={[styles.infoLabelText, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
              Full Name
            </Text>
          </View>
          <Text style={[styles.infoValue, { color: Colors[colorScheme ?? 'light'].text }]}>
            {displayName}
          </Text>
        </View>

        <View style={[styles.infoRow, styles.infoRowBorder, { borderTopColor: Colors[colorScheme ?? 'light'].border }]}>
          <View style={styles.infoLabel}>
            <Ionicons name="mail-outline" size={20} color={Colors[colorScheme ?? 'light'].textSecondary} />
            <Text style={[styles.infoLabelText, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
              Email
            </Text>
          </View>
          <Text style={[styles.infoValue, { color: Colors[colorScheme ?? 'light'].text }]}>
            {displayEmail}
          </Text>
        </View>

        <View style={[styles.infoRow, styles.infoRowBorder, { borderTopColor: Colors[colorScheme ?? 'light'].border }]}>
          <View style={styles.infoLabel}>
            <Ionicons name="calendar-outline" size={20} color={Colors[colorScheme ?? 'light'].textSecondary} />
            <Text style={[styles.infoLabelText, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
              Member Since
            </Text>
          </View>
          <Text style={[styles.infoValue, { color: Colors[colorScheme ?? 'light'].text }]}>
            {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
          </Text>
        </View>
      </View>

      {/* Security */}
      <View style={[styles.card, { backgroundColor: Colors[colorScheme ?? 'light'].card }]}>
        <Text style={[styles.cardTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
          Security
        </Text>

        <TouchableOpacity 
          style={styles.actionButton}
          onPress={handlePasswordReset}
        >
          <View style={styles.actionButtonContent}>
            <Ionicons name="key-outline" size={20} color={Colors[colorScheme ?? 'light'].primary} />
            <Text style={[styles.actionButtonText, { color: Colors[colorScheme ?? 'light'].text }]}>
              Reset Password
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={Colors[colorScheme ?? 'light'].textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Admin Console Link (if admin) */}
      {isAdmin && (
        <View style={[styles.card, { backgroundColor: Colors[colorScheme ?? 'light'].card }]}>
          <Text style={[styles.cardTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
            Administration
          </Text>

          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => router.push('/admin')}
          >
            <View style={styles.actionButtonContent}>
              <Ionicons name="shield-checkmark-outline" size={20} color={Colors[colorScheme ?? 'light'].primary} />
              <Text style={[styles.actionButtonText, { color: Colors[colorScheme ?? 'light'].text }]}>
                Admin Console
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors[colorScheme ?? 'light'].textSecondary} />
          </TouchableOpacity>
        </View>
      )}

      {/* Logout */}
      <TouchableOpacity 
        style={[styles.logoutButton, { backgroundColor: Colors[colorScheme ?? 'light'].error + '10' }]}
        onPress={handleLogout}
      >
        <Ionicons name="log-out-outline" size={20} color={Colors[colorScheme ?? 'light'].error} />
        <Text style={[styles.logoutButtonText, { color: Colors[colorScheme ?? 'light'].error }]}>
          Logout
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    fontFamily: 'Georgia',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Georgia',
  },
  card: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Georgia',
    marginBottom: 16,
  },
  avatarSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  avatarLarge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInfo: {
    flex: 1,
  },
  avatarName: {
    fontSize: 24,
    fontWeight: '700',
    fontFamily: 'Georgia',
    marginBottom: 8,
  },
  roleTag: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
  },
  roleTagText: {
    fontSize: 13,
    fontWeight: '600',
    fontFamily: 'Georgia',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  infoRowBorder: {
    borderTopWidth: 1,
  },
  infoLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoLabelText: {
    fontSize: 15,
    fontFamily: 'Georgia',
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '600',
    fontFamily: 'Georgia',
  },
  actionButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    cursor: 'pointer',
  },
  actionButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  actionButtonText: {
    fontSize: 16,
    fontFamily: 'Georgia',
    fontWeight: '500',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
    cursor: 'pointer',
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Georgia',
  },
});

