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
  const { user } = useAuth();

  return (
    <View style={[styles.container, { borderBottomColor: Colors[colorScheme ?? 'light'].border }]}>
      {/* Close Button */}
      <TouchableOpacity
        style={styles.closeButton}
        onPress={onClose}
        accessibilityLabel="Close profile panel"
        accessibilityRole="button"
      >
        <Ionicons name="close" size={24} color={Colors[colorScheme ?? 'light'].text} />
      </TouchableOpacity>

      {/* User Profile Card */}
      <View style={styles.profileCard}>
        {/* Avatar */}
        <View style={[styles.avatar, { backgroundColor: Colors[colorScheme ?? 'light'].primary }]}>
          <Text style={[styles.avatarText, { color: 'white' }]}>
            {user?.email?.charAt(0).toUpperCase() || 'U'}
          </Text>
        </View>

        {/* User Info */}
        <View style={styles.userInfo}>
          <Text style={[styles.displayName, { color: Colors[colorScheme ?? 'light'].text }]}>
            {user?.user_metadata?.full_name || user?.email || 'User'}
          </Text>
          <Text style={[styles.email, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
            {user?.email || 'user@example.com'}
          </Text>
          <View style={[styles.roleBadge, { backgroundColor: Colors[colorScheme ?? 'light'].primary + '15' }]}>
            <Text style={[styles.roleText, { color: Colors[colorScheme ?? 'light'].primary }]}>
              Member
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  closeButton: {
    position: 'absolute',
    top: 12,
    right: 16,
    padding: 8,
    zIndex: 1,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 8,
    paddingBottom: 16,
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 28,
    fontWeight: 'bold',
    fontFamily: 'Georgia',
  },
  userInfo: {
    flex: 1,
  },
  displayName: {
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'Georgia',
    marginBottom: 4,
  },
  email: {
    fontSize: 13,
    fontFamily: 'Georgia',
    marginBottom: 8,
  },
  roleBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  roleText: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'Georgia',
  },
});
