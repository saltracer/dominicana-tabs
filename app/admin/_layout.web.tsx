import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Slot, usePathname, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AdminGuard from '../../components/AdminGuard.web';
import { useTheme } from '../../components/ThemeProvider';
import { useAuth } from '../../contexts/AuthContext';
import { Colors } from '../../constants/Colors';

export default function AdminLayoutWeb() {
  const { colorScheme } = useTheme();
  const { user } = useAuth();
  const pathname = usePathname();

  const navItems = [
    { path: '/admin', label: 'Dashboard', icon: 'grid' as const },
    { path: '/admin/users', label: 'Users', icon: 'people' as const },
    { path: '/admin/books', label: 'Books', icon: 'book' as const },
    { path: '/admin/lists', label: 'Lists', icon: 'list' as const },
    { path: '/admin/rosary', label: 'Rosary Audio', icon: 'musical-notes' as const },
    { path: '/admin/podcasts', label: 'Podcasts', icon: 'radio' as const },
  ];

  // Check if nav item is active, with special handling for dashboard
  const isNavItemActive = (itemPath: string): boolean => {
    // Exact match for dashboard
    if (itemPath === '/admin') {
      return pathname === '/admin';
    }
    // For other routes, check if pathname starts with the path
    return pathname === itemPath || pathname?.startsWith(itemPath + '/');
  };

  return (
    <AdminGuard>
      <View style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
        {/* Sidebar Navigation */}
        <View style={[styles.sidebar, { backgroundColor: Colors[colorScheme ?? 'light'].surface }]}>
          {/* Header */}
          <View style={styles.sidebarHeader}>
            <View style={[styles.logoContainer, { backgroundColor: Colors[colorScheme ?? 'light'].primary }]}>
              <Ionicons name="shield-checkmark" size={24} color={Colors[colorScheme ?? 'light'].dominicanWhite} />
            </View>
            <Text style={[styles.sidebarTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
              Admin Console
            </Text>
          </View>

          {/* Navigation Items */}
          <View style={styles.navItems}>
            {navItems.map((item) => {
              const isActive = isNavItemActive(item.path);
              return (
                <TouchableOpacity
                  key={item.path}
                  style={[
                    styles.navItem,
                    isActive && {
                      backgroundColor: Colors[colorScheme ?? 'light'].primary + '15',
                      borderLeftWidth: 3,
                      borderLeftColor: Colors[colorScheme ?? 'light'].primary,
                    },
                  ]}
                  onPress={() => router.push(item.path as any)}
                >
                  <Ionicons
                    name={item.icon}
                    size={20}
                    color={
                      isActive
                        ? Colors[colorScheme ?? 'light'].primary
                        : Colors[colorScheme ?? 'light'].textSecondary
                    }
                  />
                  <Text
                    style={[
                      styles.navItemText,
                      {
                        color: isActive
                          ? Colors[colorScheme ?? 'light'].primary
                          : Colors[colorScheme ?? 'light'].text,
                      },
                    ]}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Footer
          <View style={[styles.sidebarFooter, { borderTopColor: Colors[colorScheme ?? 'light'].border }]}>
            <View style={styles.userInfo}>
              <View style={[styles.avatarSmall, { backgroundColor: Colors[colorScheme ?? 'light'].primary }]}>
                <Ionicons name="person" size={16} color={Colors[colorScheme ?? 'light'].dominicanWhite} />
              </View>
              <Text style={[styles.userEmail, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                {user?.email}
              </Text>
            </View>
            <TouchableOpacity style={styles.logoutButton} onPress={() => router.push('/profile/account' as any)}>
              <Ionicons name="arrow-back" size={20} color={Colors[colorScheme ?? 'light'].textSecondary} />
            </TouchableOpacity>
          </View> */}
        </View>

        {/* Main Content */}
        <View style={styles.content}>
          <ScrollView 
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <Slot />
          </ScrollView>
        </View>
      </View>
    </AdminGuard>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
  },
  sidebar: {
    width: 260,
    borderRightWidth: 1,
    borderRightColor: '#E0E0E0',
  },
  sidebarHeader: {
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  logoContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  sidebarTitle: {
    fontSize: 20,
    fontWeight: '700',
    fontFamily: 'Georgia',
  },
  navItems: {
    paddingVertical: 16,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    gap: 12,
  },
  navItemText: {
    fontSize: 16,
    fontFamily: 'Georgia',
    fontWeight: '500',
  },
  sidebarFooter: {
    marginTop: 'auto',
    padding: 16,
    borderTopWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  avatarSmall: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userEmail: {
    fontSize: 12,
    fontFamily: 'Georgia',
    flex: 1,
  },
  logoutButton: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
  },
});

