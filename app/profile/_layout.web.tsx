import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Slot, usePathname, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../components/ThemeProvider';
import { useAuth } from '../../contexts/AuthContext';
import { useAdminAuth } from '../../hooks/useAdminAuth';
import { Colors } from '../../constants/Colors';

export default function ProfileLayoutWeb() {
  const { colorScheme } = useTheme();
  const { user, profile, signOut } = useAuth();
  const { isAdmin } = useAdminAuth();
  const pathname = usePathname();

  const navItems = [
    { path: '/profile/quick', label: 'Quick Settings', icon: 'flash' as const },
    { path: '/profile/prayer', label: 'Prayer', icon: 'book' as const },
    { path: '/profile/study', label: 'Study', icon: 'school' as const },
    { path: '/profile/community', label: 'Community', icon: 'people' as const },
    { path: '/profile/preaching', label: 'Preaching', icon: 'megaphone' as const },
    { path: '/profile/application', label: 'Application', icon: 'settings' as const },
    { path: '/profile/account', label: 'Account', icon: 'person' as const },
  ];

  // Check if nav item is active
  const isNavItemActive = (itemPath: string): boolean => {
    return pathname === itemPath;
  };

  // Redirect to quick settings if on base /profile
  React.useEffect(() => {
    if (pathname === '/profile') {
      router.replace('/profile/quick');
    }
  }, [pathname]);

  const displayName = profile?.name || user?.user_metadata?.name || user?.email?.split('@')[0] || 'User';
  const displayEmail = profile?.email || user?.email || '';
  const displayRole = profile?.role || 'user';

  return (
    <View style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
      {/* Sidebar Navigation */}
      <View style={[styles.sidebar, { backgroundColor: Colors[colorScheme ?? 'light'].surface }]}>
        {/* User Profile Section */}
        <View style={styles.sidebarHeader}>
          <View style={[styles.avatarContainer, { backgroundColor: Colors[colorScheme ?? 'light'].primary }]}>
            <Ionicons name="person" size={32} color={Colors[colorScheme ?? 'light'].dominicanWhite} />
          </View>
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

        {/* Admin Link (if admin) */}
        {isAdmin && (
          <View style={[styles.adminSection, { borderTopColor: Colors[colorScheme ?? 'light'].border }]}>
            <TouchableOpacity
              style={styles.adminButton}
              onPress={() => router.push('/admin')}
            >
              <Ionicons name="shield-checkmark" size={20} color={Colors[colorScheme ?? 'light'].primary} />
              <Text style={[styles.adminButtonText, { color: Colors[colorScheme ?? 'light'].primary }]}>
                Admin Console
              </Text>
            </TouchableOpacity>
          </View>
        )}
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
    alignItems: 'center',
  },
  avatarContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  userName: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'Georgia',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 13,
    fontFamily: 'Georgia',
    marginBottom: 8,
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
  navItems: {
    paddingVertical: 16,
    flex: 1,
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
  adminSection: {
    padding: 16,
    borderTopWidth: 1,
    marginTop: 'auto',
  },
  adminButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    gap: 8,
  },
  adminButtonText: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Georgia',
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

