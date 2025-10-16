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
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../components/ThemeProvider';
import { Colors } from '../../../constants/Colors';
import { AdminUserService, UserFilters, AdminUser } from '../../../services/AdminUserService';

const ROLES = ['admin', 'subscribed', 'authenticated'];

export default function UsersListScreen() {
  const { colorScheme } = useTheme();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<string | undefined>();
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadUsers();
  }, [searchQuery, selectedRole, page]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const filters: UserFilters = {};
      
      if (searchQuery) filters.search = searchQuery;
      if (selectedRole) filters.role = selectedRole;

      const result = await AdminUserService.listUsers(filters, { page, limit: 20 });
      setUsers(result.users);
      setTotalPages(result.totalPages);
    } catch (error) {
      console.error('Error loading users:', error);
      Alert.alert('Error', 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return Colors[colorScheme ?? 'light'].error;
      case 'subscribed':
        return Colors[colorScheme ?? 'light'].accent;
      case 'authenticated':
        return Colors[colorScheme ?? 'light'].primary;
      default:
        return Colors[colorScheme ?? 'light'].textSecondary;
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: Colors[colorScheme ?? 'light'].surface }]}>
        <Text style={[styles.title, { color: Colors[colorScheme ?? 'light'].text }]}>
          User Management
        </Text>
        <TouchableOpacity
          style={[styles.rolesButton, { backgroundColor: Colors[colorScheme ?? 'light'].primary }]}
          onPress={() => router.push('/admin/users/roles')}
        >
          <Ionicons name="shield-checkmark" size={20} color={Colors[colorScheme ?? 'light'].dominicanWhite} />
          <Text style={[styles.rolesButtonText, { color: Colors[colorScheme ?? 'light'].dominicanWhite }]}>
            Manage Roles
          </Text>
        </TouchableOpacity>
      </View>

      {/* Filters */}
      <View style={[styles.filters, { backgroundColor: Colors[colorScheme ?? 'light'].surface }]}>
        <View style={[styles.searchContainer, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
          <Ionicons name="search" size={20} color={Colors[colorScheme ?? 'light'].textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: Colors[colorScheme ?? 'light'].text }]}
            placeholder="Search users..."
            placeholderTextColor={Colors[colorScheme ?? 'light'].textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.roleScroll}>
          <TouchableOpacity
            style={[
              styles.roleChip,
              !selectedRole && {
                backgroundColor: Colors[colorScheme ?? 'light'].primary,
              },
            ]}
            onPress={() => setSelectedRole(undefined)}
          >
            <Text
              style={[
                styles.roleChipText,
                {
                  color: !selectedRole
                    ? Colors[colorScheme ?? 'light'].dominicanWhite
                    : Colors[colorScheme ?? 'light'].text,
                },
              ]}
            >
              All Users
            </Text>
          </TouchableOpacity>
          {ROLES.map((role) => (
            <TouchableOpacity
              key={role}
              style={[
                styles.roleChip,
                selectedRole === role && {
                  backgroundColor: Colors[colorScheme ?? 'light'].primary,
                },
              ]}
              onPress={() => setSelectedRole(role)}
            >
              <Text
                style={[
                  styles.roleChipText,
                  {
                    color:
                      selectedRole === role
                        ? Colors[colorScheme ?? 'light'].dominicanWhite
                        : Colors[colorScheme ?? 'light'].text,
                  },
                ]}
              >
                {role.charAt(0).toUpperCase() + role.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Users List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors[colorScheme ?? 'light'].primary} />
        </View>
      ) : (
        <ScrollView style={styles.scrollView}>
          {users.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="people-outline" size={48} color={Colors[colorScheme ?? 'light'].textSecondary} />
              <Text style={[styles.emptyText, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                No users found
              </Text>
            </View>
          ) : (
            users.map((user) => (
              <TouchableOpacity
                key={user.id}
                style={[styles.userCard, { backgroundColor: Colors[colorScheme ?? 'light'].card }]}
                onPress={() => router.push(`/admin/users/${user.id}`)}
              >
                <View style={[styles.userAvatar, { backgroundColor: Colors[colorScheme ?? 'light'].primary }]}>
                  <Ionicons name="person" size={24} color={Colors[colorScheme ?? 'light'].dominicanWhite} />
                </View>
                <View style={styles.userInfo}>
                  <Text style={[styles.userName, { color: Colors[colorScheme ?? 'light'].text }]}>
                    {user.name}
                  </Text>
                  <Text style={[styles.userEmail, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                    {user.email}
                  </Text>
                  <View style={styles.userMeta}>
                    <View style={[styles.roleBadge, { backgroundColor: getRoleBadgeColor(user.role) + '20' }]}>
                      <Text style={[styles.roleBadgeText, { color: getRoleBadgeColor(user.role) }]}>
                        {user.role}
                      </Text>
                    </View>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color={Colors[colorScheme ?? 'light'].textSecondary} />
              </TouchableOpacity>
            ))
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <View style={styles.pagination}>
              <TouchableOpacity
                style={[
                  styles.pageButton,
                  page === 1 && styles.pageButtonDisabled,
                  { backgroundColor: Colors[colorScheme ?? 'light'].card },
                ]}
                onPress={() => setPage(page - 1)}
                disabled={page === 1}
              >
                <Ionicons
                  name="chevron-back"
                  size={20}
                  color={page === 1 ? Colors[colorScheme ?? 'light'].textMuted : Colors[colorScheme ?? 'light'].text}
                />
              </TouchableOpacity>
              <Text style={[styles.pageText, { color: Colors[colorScheme ?? 'light'].text }]}>
                Page {page} of {totalPages}
              </Text>
              <TouchableOpacity
                style={[
                  styles.pageButton,
                  page === totalPages && styles.pageButtonDisabled,
                  { backgroundColor: Colors[colorScheme ?? 'light'].card },
                ]}
                onPress={() => setPage(page + 1)}
                disabled={page === totalPages}
              >
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={
                    page === totalPages
                      ? Colors[colorScheme ?? 'light'].textMuted
                      : Colors[colorScheme ?? 'light'].text
                  }
                />
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    fontFamily: 'Georgia',
  },
  rolesButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 8,
  },
  rolesButtonText: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Georgia',
  },
  filters: {
    padding: 16,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Georgia',
  },
  roleScroll: {
    flexGrow: 0,
  },
  roleChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  roleChipText: {
    fontSize: 14,
    fontFamily: 'Georgia',
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: 'Georgia',
    marginTop: 16,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  userAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Georgia',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    fontFamily: 'Georgia',
    marginBottom: 8,
  },
  userMeta: {
    flexDirection: 'row',
    gap: 8,
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  roleBadgeText: {
    fontSize: 12,
    fontFamily: 'Georgia',
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    gap: 16,
  },
  pageButton: {
    padding: 8,
    borderRadius: 8,
  },
  pageButtonDisabled: {
    opacity: 0.5,
  },
  pageText: {
    fontSize: 14,
    fontFamily: 'Georgia',
  },
});
