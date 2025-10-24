import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { useTheme } from '@/components/ThemeProvider';
import { useAuth } from '@/contexts/AuthContext';

interface ProfileHeaderProps {
  onClose: () => void;
}

export default function ProfileHeader({ onClose }: ProfileHeaderProps) {
  const { colorScheme } = useTheme();
  const { user, profile } = useAuth();

  const displayName = profile?.name || user?.user_metadata?.name || user?.email?.split('@')[0] || 'User';
  const displayEmail = profile?.email || user?.email || '';
  const displayRole = profile?.role || 'user';

  return (
    <View style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].surface }]}>
      {/* Close Button */}
      <TouchableOpacity
        style={styles.closeButton}
        onPress={onClose}
        accessibilityLabel="Close settings"
        accessibilityRole="button"
      >
        <Ionicons name="close" size={24} color={Colors[colorScheme ?? 'light'].text} />
      </TouchableOpacity>

      {/* User Avatar */}
      <View style={[styles.avatarContainer, { backgroundColor: Colors[colorScheme ?? 'light'].primary }]}>
        <Ionicons name="person" size={32} color={Colors[colorScheme ?? 'light'].dominicanWhite} />
      </View>

      {/* User Info */}
      <View style={styles.userInfo}>
        <Text style={[styles.userName, { color: Colors[colorScheme ?? 'light'].text }]}>
          {displayName}
        </Text>
        <Text style={[styles.userEmail, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
          {displayEmail}
        </Text>
        <View style={[styles.roleBadge, { backgroundColor: Colors[colorScheme ?? 'light'].primary + '20' }]}>
          <Text style={[styles.roleText, { color: Colors[colorScheme ?? 'light'].primary }]}>
            {displayRole.charAt(0).toUpperCase() + displayRole.slice(1)}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    alignItems: 'center',
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  avatarContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  userInfo: {
    alignItems: 'center',
  },
  userName: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'Georgia',
    marginBottom: 4,
    textAlign: 'center',
  },
  userEmail: {
    fontSize: 13,
    fontFamily: 'Georgia',
    marginBottom: 8,
    textAlign: 'center',
  },
  roleBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  roleText: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'Georgia',
    textTransform: 'capitalize',
  },
});
