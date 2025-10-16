import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../components/ThemeProvider';
import { Colors } from '../../../constants/Colors';
import { AdminUserService, AdminUser } from '../../../services/AdminUserService';

export default function RolesManagementScreen() {
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
      
      // Load admins
      const adminResult = await AdminUserService.listUsers(
        { role: 'admin' },
        { page: 1, limit: 100 }
      );
      setAdmins(adminResult.users);

      // Load subscribed users
      const subscribedResult = await AdminUserService.listUsers(
        { role: 'subscribed' },
        { page: 1, limit: 100 }
      );
      setSubscribedUsers(subscribedResult.users);
    } catch (error) {
      console.error('Error loading roles:', error);
      Alert.alert('Error', 'Failed to load role information');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveRole = (user: AdminUser) => {
    Alert.alert(
      'Remove Special Role',
      `Remove ${user.role} role from ${user.name}? They will become a regular authenticated user.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await AdminUserService.deleteUserRole(user.id);
              Alert.alert('Success', 'Role removed successfully');
              loadRoles(); // Reload
            } catch (error) {
              Alert.alert('Error', 'Failed to remove role');
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
            Loading roles...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
      <ScrollView style={styles.scrollView}>
        {/* Info Card */}
        <View style={[styles.infoBox, { backgroundColor: Colors[colorScheme ?? 'light'].primary + '10' }]}>
          <Ionicons name="information-circle" size={24} color={Colors[colorScheme ?? 'light'].primary} />
          <Text style={[styles.infoText, { color: Colors[colorScheme ?? 'light'].text }]}>
            Manage special roles for users. Admin users have full access to the admin console. 
            Subscribed users have premium features. Go to individual user pages to assign roles.
          </Text>
        </View>

        {/* Administrators Section */}
        <View style={styles.section}>
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
                    style={styles.iconButton}
                    onPress={() => router.push(`/admin/users/${admin.id}`)}
                  >
                    <Ionicons name="create-outline" size={20} color={Colors[colorScheme ?? 'light'].primary} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.iconButton}
                    onPress={() => handleRemoveRole(admin)}
                  >
                    <Ionicons name="remove-circle-outline" size={20} color={Colors[colorScheme ?? 'light'].error} />
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </View>

        {/* Subscribed Users Section */}
        <View style={styles.section}>
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
                    style={styles.iconButton}
                    onPress={() => router.push(`/admin/users/${user.id}`)}
                  >
                    <Ionicons name="create-outline" size={20} color={Colors[colorScheme ?? 'light'].primary} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.iconButton}
                    onPress={() => handleRemoveRole(user)}
                  >
                    <Ionicons name="remove-circle-outline" size={20} color={Colors[colorScheme ?? 'light'].error} />
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
            Quick Actions
          </Text>
          <TouchableOpacity
            style={[styles.actionCard, { backgroundColor: Colors[colorScheme ?? 'light'].card }]}
            onPress={() => router.push('/admin/users')}
          >
            <Ionicons name="people" size={24} color={Colors[colorScheme ?? 'light'].primary} />
            <Text style={[styles.actionCardText, { color: Colors[colorScheme ?? 'light'].text }]}>
              View All Users
            </Text>
            <Ionicons name="chevron-forward" size={20} color={Colors[colorScheme ?? 'light'].textSecondary} />
          </TouchableOpacity>
        </View>
      </ScrollView>
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
  infoBox: {
    flexDirection: 'row',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Georgia',
    lineHeight: 20,
  },
  section: {
    margin: 16,
    marginTop: 8,
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
    gap: 4,
  },
  iconButton: {
    padding: 8,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  actionCardText: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Georgia',
    fontWeight: '600',
  },
});
