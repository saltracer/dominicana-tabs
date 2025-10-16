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
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../components/ThemeProvider';
import { Colors } from '../../../constants/Colors';
import { AdminUserService, UserFilters, AdminUser } from '../../../services/AdminUserService';

const ROLES = ['admin', 'subscribed', 'authenticated'];

export default function UsersListScreenWeb() {
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
    <View style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: Colors[colorScheme ?? 'light'].surface }]}>
        <View>
          <Text style={[styles.title, { color: Colors[colorScheme ?? 'light'].text }]}>
            User Management
          </Text>
          <Text style={[styles.subtitle, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
            {users.length} {users.length === 1 ? 'user' : 'users'}
          </Text>
        </View>
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

        <View style={styles.roleRow}>
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
        </View>
      </View>

      {/* Users Table */}
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
            <View style={[styles.table, { backgroundColor: Colors[colorScheme ?? 'light'].card }]}>
              {/* Table Header */}
              <View style={[styles.tableHeader, { borderBottomColor: Colors[colorScheme ?? 'light'].border }]}>
                <Text style={[styles.headerCell, styles.nameColumn, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                  Name
                </Text>
                <Text style={[styles.headerCell, styles.emailColumn, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                  Email
                </Text>
                <Text style={[styles.headerCell, styles.roleColumn, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                  Role
                </Text>
                <Text style={[styles.headerCell, styles.actionsColumn, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                  Actions
                </Text>
              </View>

              {/* Table Rows */}
              {users.map((user) => (
                <TouchableOpacity
                  key={user.id}
                  style={[styles.tableRow, { borderBottomColor: Colors[colorScheme ?? 'light'].border }]}
                  onPress={() => router.push(`/admin/users/${user.id}`)}
                >
                  <View style={[styles.tableCell, styles.nameColumn, styles.nameCell]}>
                    <View style={[styles.userAvatar, { backgroundColor: getRoleBadgeColor(user.role) }]}>
                      <Ionicons name="person" size={16} color={Colors[colorScheme ?? 'light'].dominicanWhite} />
                    </View>
                    <Text style={[styles.userName, { color: Colors[colorScheme ?? 'light'].text }]}>
                      {user.name}
                    </Text>
                  </View>
                  <Text style={[styles.tableCell, styles.emailColumn, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                    {user.email}
                  </Text>
                  <View style={[styles.tableCell, styles.roleColumn]}>
                    <View style={[styles.roleBadge, { backgroundColor: getRoleBadgeColor(user.role) + '20' }]}>
                      <Text style={[styles.roleBadgeText, { color: getRoleBadgeColor(user.role) }]}>
                        {user.role}
                      </Text>
                    </View>
                  </View>
                  <View style={[styles.tableCell, styles.actionsColumn]}>
                    <TouchableOpacity
                      style={[styles.actionButton, { backgroundColor: Colors[colorScheme ?? 'light'].primary + '10' }]}
                      onPress={(e) => {
                        e.stopPropagation();
                        router.push(`/admin/users/${user.id}`);
                      }}
                    >
                      <Ionicons name="create" size={16} color={Colors[colorScheme ?? 'light'].primary} />
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
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
    </View>
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
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    fontFamily: 'Georgia',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'Georgia',
  },
  rolesButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 8,
  },
  rolesButtonText: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Georgia',
  },
  filters: {
    padding: 24,
    gap: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Georgia',
    outlineStyle: 'none',
  },
  roleRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  roleChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  roleChipText: {
    fontSize: 14,
    fontFamily: 'Georgia',
    fontWeight: '500',
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
    paddingVertical: 64,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: 'Georgia',
    marginTop: 16,
  },
  table: {
    margin: 24,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  tableHeader: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 2,
    backgroundColor: '#F5F5F5',
  },
  headerCell: {
    fontSize: 13,
    fontFamily: 'Georgia',
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  tableRow: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    cursor: 'pointer',
  },
  tableCell: {
    justifyContent: 'center',
  },
  nameColumn: {
    flex: 3,
  },
  emailColumn: {
    flex: 3,
  },
  roleColumn: {
    flex: 2,
  },
  actionsColumn: {
    flex: 1,
  },
  nameCell: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  userAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userName: {
    fontSize: 15,
    fontWeight: '600',
    fontFamily: 'Georgia',
  },
  roleBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  roleBadgeText: {
    fontSize: 12,
    fontFamily: 'Georgia',
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    gap: 16,
  },
  pageButton: {
    padding: 12,
    borderRadius: 8,
    cursor: 'pointer',
  },
  pageButtonDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
  pageText: {
    fontSize: 14,
    fontFamily: 'Georgia',
    fontWeight: '500',
  },
});

