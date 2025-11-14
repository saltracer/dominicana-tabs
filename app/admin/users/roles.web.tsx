import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../components/ThemeProvider';
import { Colors } from '../../../constants/Colors';
import { AdminUserService, AdminUser } from '../../../services/AdminUserService';

export default function RolesManagementScreenWeb() {
  const { colorScheme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [subscribedUsers, setSubscribedUsers] = useState<AdminUser[]>([]);

  useEffect(() => {
    loadRoles();
  }, []);

  const loadRoles = async () => {
    try {
      setLoading(true);
      
      const adminResult = await AdminUserService.listUsers(
        { role: 'admin' },
        { page: 1, limit: 100 }
      );
      setAdmins(adminResult.users);

      const subscribedResult = await AdminUserService.listUsers(
        { role: 'subscribed' },
        { page: 1, limit: 100 }
      );
      setSubscribedUsers(subscribedResult.users);
    } catch (error) {
      console.error('Error loading roles:', error);
      window.alert('Failed to load role information');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveRole = (user: AdminUser) => {
    if (!window.confirm(`Remove ${user.role} role from ${user.name}? They will become a regular authenticated user.`)) {
      return;
    }
    
    (async () => {
      try {
        await AdminUserService.deleteUserRole(user.id);
        window.alert('Role removed successfully');
        loadRoles();
      } catch (error) {
        window.alert('Failed to remove role');
      }
    })();
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors[colorScheme ?? 'light'].primary} />
          <Text style={[styles.loadingText, { color: Colors[colorScheme ?? 'light'].text }]}>
            Loading roles...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
      {/* Back Button */}
      <View style={[styles.topBar, { backgroundColor: Colors[colorScheme ?? 'light'].surface }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.push('/admin/users')}
        >
          <Ionicons name="arrow-back" size={20} color={Colors[colorScheme ?? 'light'].text} />
          <Text style={[styles.backButtonText, { color: Colors[colorScheme ?? 'light'].text }]}>
            Back to Users
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Info Card */}
        <View style={[styles.infoBox, { backgroundColor: Colors[colorScheme ?? 'light'].primary + '10' }]}>
          <Ionicons name="information-circle" size={24} color={Colors[colorScheme ?? 'light'].primary} />
          <Text style={[styles.infoText, { color: Colors[colorScheme ?? 'light'].text }]}>
            Manage special roles for users. Admin users have full access to the admin console. 
            Subscribed users have premium features. Go to individual user pages to assign roles.
          </Text>
        </View>

        {/* Two Column Layout */}
        <View style={styles.columns}>
          {/* Administrators */}
          <View style={styles.column}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleRow}>
                <Ionicons name="shield-checkmark" size={24} color={Colors[colorScheme ?? 'light'].error} />
                <Text style={[styles.sectionTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
                  Administrators
                </Text>
                <View style={[styles.countBadge, { backgroundColor: Colors[colorScheme ?? 'light'].error + '20' }]}>
                  <Text style={[styles.countBadgeText, { color: Colors[colorScheme ?? 'light'].error }]}>
                    {admins.length}
                  </Text>
                </View>
              </View>
              <Text style={[styles.sectionDescription, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                Users with full admin access
              </Text>
            </View>

            {admins.length === 0 ? (
              <View style={[styles.emptyCard, { backgroundColor: Colors[colorScheme ?? 'light'].card }]}>
                <Text style={[styles.emptyText, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                  No administrators found
                </Text>
              </View>
            ) : (
              admins.map((admin) => (
                <View
                  key={admin.id}
                  style={[styles.userCard, { backgroundColor: Colors[colorScheme ?? 'light'].card }]}
                >
                  <View style={[styles.userAvatar, { backgroundColor: Colors[colorScheme ?? 'light'].error }]}>
                    <Ionicons name="shield-checkmark" size={20} color={Colors[colorScheme ?? 'light'].dominicanWhite} />
                  </View>
                  <View style={styles.userInfo}>
                    <Text style={[styles.userName, { color: Colors[colorScheme ?? 'light'].text }]}>
                      {admin.name}
                    </Text>
                    <Text style={[styles.userEmail, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                      {admin.email}
                    </Text>
                  </View>
                  <View style={styles.userActions}>
                    <TouchableOpacity
                      style={[styles.iconButton, { backgroundColor: Colors[colorScheme ?? 'light'].primary + '10' }]}
                      onPress={() => router.push(`/admin/users/${admin.id}`)}
                    >
                      <Ionicons name="create" size={16} color={Colors[colorScheme ?? 'light'].primary} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.iconButton, { backgroundColor: Colors[colorScheme ?? 'light'].error + '10' }]}
                      onPress={() => handleRemoveRole(admin)}
                    >
                      <Ionicons name="remove-circle" size={16} color={Colors[colorScheme ?? 'light'].error} />
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </View>

          {/* Subscribed Users */}
          <View style={styles.column}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleRow}>
                <Ionicons name="star" size={24} color={Colors[colorScheme ?? 'light'].accent} />
                <Text style={[styles.sectionTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
                  Subscribed Users
                </Text>
                <View style={[styles.countBadge, { backgroundColor: Colors[colorScheme ?? 'light'].accent + '20' }]}>
                  <Text style={[styles.countBadgeText, { color: Colors[colorScheme ?? 'light'].accent }]}>
                    {subscribedUsers.length}
                  </Text>
                </View>
              </View>
              <Text style={[styles.sectionDescription, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                Users with premium features
              </Text>
            </View>

            {subscribedUsers.length === 0 ? (
              <View style={[styles.emptyCard, { backgroundColor: Colors[colorScheme ?? 'light'].card }]}>
                <Text style={[styles.emptyText, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                  No subscribed users found
                </Text>
              </View>
            ) : (
              subscribedUsers.map((user) => (
                <View
                  key={user.id}
                  style={[styles.userCard, { backgroundColor: Colors[colorScheme ?? 'light'].card }]}
                >
                  <View style={[styles.userAvatar, { backgroundColor: Colors[colorScheme ?? 'light'].accent }]}>
                    <Ionicons name="star" size={20} color={Colors[colorScheme ?? 'light'].dominicanWhite} />
                  </View>
                  <View style={styles.userInfo}>
                    <Text style={[styles.userName, { color: Colors[colorScheme ?? 'light'].text }]}>
                      {user.name}
                    </Text>
                    <Text style={[styles.userEmail, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                      {user.email}
                    </Text>
                  </View>
                  <View style={styles.userActions}>
                    <TouchableOpacity
                      style={[styles.iconButton, { backgroundColor: Colors[colorScheme ?? 'light'].primary + '10' }]}
                      onPress={() => router.push(`/admin/users/${user.id}`)}
                    >
                      <Ionicons name="create" size={16} color={Colors[colorScheme ?? 'light'].primary} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.iconButton, { backgroundColor: Colors[colorScheme ?? 'light'].error + '10' }]}
                      onPress={() => handleRemoveRole(user)}
                    >
                      <Ionicons name="remove-circle" size={16} color={Colors[colorScheme ?? 'light'].error} />
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topBar: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  backButtonText: {
    fontSize: 16,
    fontFamily: 'Georgia',
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
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
  infoBox: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    gap: 12,
    marginBottom: 32,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Georgia',
    lineHeight: 20,
  },
  columns: {
    flexDirection: 'row',
    gap: 24,
  },
  column: {
    flex: 1,
  },
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    fontFamily: 'Georgia',
  },
  sectionDescription: {
    fontSize: 14,
    fontFamily: 'Georgia',
    marginLeft: 32,
  },
  countBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 32,
    alignItems: 'center',
  },
  countBadgeText: {
    fontSize: 12,
    fontFamily: 'Georgia',
    fontWeight: '700',
  },
  emptyCard: {
    padding: 32,
    borderRadius: 12,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    fontFamily: 'Georgia',
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginBottom: 12,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Georgia',
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 12,
    fontFamily: 'Georgia',
  },
  userActions: {
    flexDirection: 'row',
    gap: 8,
  },
  iconButton: {
    width: 32,
    height: 32,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    cursor: 'pointer',
  },
});

