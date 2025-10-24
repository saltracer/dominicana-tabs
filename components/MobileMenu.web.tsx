import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { useTheme } from '@/components/ThemeProvider';
import { useAuth } from '@/contexts/AuthContext';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { spacing } from '@/constants/Spacing';
import { useProfilePanel } from '@/contexts/ProfilePanelContext';

interface MobileMenuProps {
  visible: boolean;
  onClose: () => void;
}

interface MenuSection {
  title: string;
  icon: string;
  items: MenuItem[];
}

interface MenuItem {
  label: string;
  route: string;
}

export default function MobileMenu({ visible, onClose }: MobileMenuProps) {
  const { colorScheme } = useTheme();
  const { user, profile, signOut } = useAuth();
  const { isAdmin } = useAdminAuth();
  const { openPanel } = useProfilePanel();
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const slideAnim = React.useRef(new Animated.Value(-100)).current;

  const menuSections: MenuSection[] = [
    {
      title: 'Prayer',
      icon: 'heart-outline',
      items: [
        { label: 'Liturgy of the Hours', route: '/(tabs)/prayer/liturgy' },
        { label: 'Rosary', route: '/(tabs)/prayer/rosary' },
        { label: 'Devotions', route: '/(tabs)/prayer/devotions' },
      ],
    },
    {
      title: 'Study',
      icon: 'library-outline',
      items: [
        { label: 'Bible', route: '/(tabs)/study/bible' },
        { label: 'Library', route: '/(tabs)/study/library' },
      ],
    },
    {
      title: 'Community',
      icon: 'people-outline',
      items: [
        { label: 'Calendar', route: '/(tabs)/community/calendar' },
        { label: 'Saints', route: '/(tabs)/community/saints' },
        { label: 'Provinces', route: '/(tabs)/community/provinces' },
      ],
    },
    {
      title: 'Preaching',
      icon: 'chatbubble-outline',
      items: [
        { label: 'Podcasts', route: '/(tabs)/preaching/podcasts' },
        { label: 'Blog & Reflections', route: '/(tabs)/preaching/blogs' },
      ],
    },
  ];

  // Animate slide-in/out when visibility changes
  useEffect(() => {
    if (visible) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: -100,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, slideAnim]);

  const toggleSection = (title: string) => {
    setExpandedSection(expandedSection === title ? null : title);
  };

  const handleNavigation = (route: string) => {
    onClose();
    router.push(route as any);
  };

  const handleLogout = async () => {
    try {
      await signOut();
      onClose();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      onRequestClose={onClose}
    >
      {/* Backdrop */}
      <TouchableOpacity
        style={styles.backdrop}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={[styles.backdropInner, { backgroundColor: 'rgba(0, 0, 0, 0.5)' }]} />
      </TouchableOpacity>

      {/* Drawer */}
      <Animated.View
        style={[
          styles.drawer,
          {
            backgroundColor: Colors[colorScheme ?? 'light'].surface,
            transform: [
              {
                translateX: slideAnim.interpolate({
                  inputRange: [-100, 0],
                  outputRange: ['-100%', '0%'],
                }),
              },
            ],
          },
        ]}
      >
        {/* Header */}
        <View style={[styles.drawerHeader, { borderBottomColor: Colors[colorScheme ?? 'light'].border }]}>
          <Text style={[styles.drawerTitle, { color: Colors[colorScheme ?? 'light'].primary }]}>
            Menu
          </Text>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
            accessibilityLabel="Close menu"
            accessibilityRole="button"
          >
            <Ionicons name="close" size={28} color={Colors[colorScheme ?? 'light'].text} />
          </TouchableOpacity>
        </View>

        {/* Content */}
        <ScrollView style={styles.drawerContent} showsVerticalScrollIndicator={false}>
          {/* Navigation Sections */}
          {menuSections.map((section) => (
            <View key={section.title} style={styles.section}>
              <TouchableOpacity
                style={[
                  styles.sectionHeader,
                  { borderBottomColor: Colors[colorScheme ?? 'light'].border },
                ]}
                onPress={() => toggleSection(section.title)}
                accessibilityLabel={`${section.title} menu`}
                accessibilityRole="button"
                accessibilityState={{ expanded: expandedSection === section.title }}
              >
                <View style={styles.sectionTitleContainer}>
                  <Ionicons
                    name={section.icon as any}
                    size={24}
                    color={Colors[colorScheme ?? 'light'].primary}
                    style={styles.sectionIcon}
                  />
                  <Text style={[styles.sectionTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
                    {section.title}
                  </Text>
                </View>
                <Ionicons
                  name={expandedSection === section.title ? 'chevron-up' : 'chevron-down'}
                  size={20}
                  color={Colors[colorScheme ?? 'light'].textSecondary}
                />
              </TouchableOpacity>

              {expandedSection === section.title && (
                <View style={styles.sectionItems}>
                  {section.items.map((item) => (
                    <TouchableOpacity
                      key={item.label}
                      style={styles.menuItem}
                      onPress={() => handleNavigation(item.route)}
                      accessibilityLabel={item.label}
                      accessibilityRole="link"
                    >
                      <Text
                        style={[styles.menuItemText, { color: Colors[colorScheme ?? 'light'].textSecondary }]}
                      >
                        {item.label}
                      </Text>
                      <Ionicons
                        name="chevron-forward"
                        size={16}
                        color={Colors[colorScheme ?? 'light'].textSecondary}
                      />
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          ))}

          {/* User Section */}
          {user && (
            <View style={[styles.userSection, { borderTopColor: Colors[colorScheme ?? 'light'].border }]}>
              <View style={styles.userInfo}>
                <Ionicons
                  name="person-circle-outline"
                  size={24}
                  color={Colors[colorScheme ?? 'light'].primary}
                  style={styles.userIcon}
                />
                <Text style={[styles.userName, { color: Colors[colorScheme ?? 'light'].text }]}>
                  {profile?.name || user.email?.split('@')[0] || 'User'}
                </Text>
              </View>

              <TouchableOpacity
                style={styles.userMenuItem}
                onPress={() => {
                  onClose();
                  openPanel('quick');
                }}
                accessibilityLabel="Quick Settings"
                accessibilityRole="button"
              >
                <Ionicons
                  name="settings-outline"
                  size={20}
                  color={Colors[colorScheme ?? 'light'].textSecondary}
                  style={styles.userMenuIcon}
                />
                <Text style={[styles.userMenuText, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                  Quick Settings
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.userMenuItem}
                onPress={() => {
                  onClose();
                  openPanel('account');
                }}
                accessibilityLabel="View Profile"
                accessibilityRole="button"
              >
                <Ionicons
                  name="person-outline"
                  size={20}
                  color={Colors[colorScheme ?? 'light'].textSecondary}
                  style={styles.userMenuIcon}
                />
                <Text style={[styles.userMenuText, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                  View Profile
                </Text>
              </TouchableOpacity>

              {isAdmin && (
                <TouchableOpacity
                  style={styles.userMenuItem}
                  onPress={() => handleNavigation('/admin')}
                  accessibilityLabel="Admin"
                  accessibilityRole="link"
                >
                  <Ionicons
                    name="shield-checkmark-outline"
                    size={20}
                    color={Colors[colorScheme ?? 'light'].textSecondary}
                    style={styles.userMenuIcon}
                  />
                  <Text style={[styles.userMenuText, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                    Admin
                  </Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={[styles.userMenuItem, styles.logoutItem]}
                onPress={handleLogout}
                accessibilityLabel="Logout"
                accessibilityRole="button"
              >
                <Ionicons
                  name="log-out-outline"
                  size={20}
                  color={Colors[colorScheme ?? 'light'].error}
                  style={styles.userMenuIcon}
                />
                <Text style={[styles.userMenuText, { color: Colors[colorScheme ?? 'light'].error }]}>
                  Logout
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  backdropInner: {
    flex: 1,
  },
  drawer: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: '85%',
    maxWidth: 320,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  drawerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    minHeight: 56,
  },
  drawerTitle: {
    fontSize: 24,
    fontWeight: '700',
    fontFamily: 'Georgia',
  },
  closeButton: {
    padding: spacing.sm,
  },
  drawerContent: {
    flex: 1,
  },
  section: {
    borderBottomWidth: 1,
    borderBottomColor: 'transparent',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    minHeight: 56,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionIcon: {
    marginRight: spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Georgia',
  },
  sectionItems: {
    paddingLeft: spacing.xl + spacing.lg,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingRight: spacing.lg,
    minHeight: 44,
  },
  menuItemText: {
    fontSize: 16,
    fontFamily: 'Georgia',
  },
  userSection: {
    borderTopWidth: 2,
    marginTop: spacing.lg,
    paddingTop: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  userIcon: {
    marginRight: spacing.md,
  },
  userName: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Georgia',
  },
  userMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    minHeight: 44,
  },
  userMenuIcon: {
    marginRight: spacing.md,
  },
  userMenuText: {
    fontSize: 16,
    fontFamily: 'Georgia',
  },
  logoutItem: {
    marginTop: spacing.sm,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
  },
});

