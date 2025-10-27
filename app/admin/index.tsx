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
import { useTheme } from '../../components/ThemeProvider';
import { Colors } from '../../constants/Colors';
import { AdminUserService, UserStats } from '../../services/AdminUserService';
import { supabase } from '../../lib/supabase';

interface BookStats {
  total: number;
  by_category: Record<string, number>;
  with_epub: number;
}

export default function AdminDashboard() {
  const { colorScheme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [bookStats, setBookStats] = useState<BookStats | null>(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);

      // Load user stats
      const users = await AdminUserService.getUserStats();
      setUserStats(users);

      // Load book stats
      const { data: books, error: booksError } = await supabase
        .from('books')
        .select('id, categories, epub_path');

      if (booksError) throw booksError;

      const by_category: Record<string, number> = {};
      let with_epub = 0;

      books?.forEach(book => {
        // Handle categories array - count each book under each of its categories
        if (book.categories && Array.isArray(book.categories)) {
          book.categories.forEach((category: string) => {
            by_category[category] = (by_category[category] || 0) + 1;
          });
        }
        if (book.epub_path) with_epub++;
      });

      setBookStats({
        total: books?.length || 0,
        by_category,
        with_epub,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
      Alert.alert('Error', 'Failed to load dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors[colorScheme ?? 'light'].primary} />
          <Text style={[styles.loadingText, { color: Colors[colorScheme ?? 'light'].text }]}>
            Loading dashboard...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: Colors[colorScheme ?? 'light'].text }]}>
            Admin Dashboard
          </Text>
          <Text style={[styles.subtitle, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
            Manage your application content and users
          </Text>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
            Quick Actions
          </Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity
              style={[styles.actionCard, { backgroundColor: Colors[colorScheme ?? 'light'].card }]}
              onPress={() => router.push('/admin/books/new')}
            >
              <View style={[styles.actionIcon, { backgroundColor: Colors[colorScheme ?? 'light'].primary + '20' }]}>
                <Ionicons name="add-circle" size={24} color={Colors[colorScheme ?? 'light'].primary} />
              </View>
              <Text style={[styles.actionTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
                Add New Book
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionCard, { backgroundColor: Colors[colorScheme ?? 'light'].card }]}
              onPress={() => router.push('/admin/books')}
            >
              <View style={[styles.actionIcon, { backgroundColor: Colors[colorScheme ?? 'light'].primary + '20' }]}>
                <Ionicons name="book" size={24} color={Colors[colorScheme ?? 'light'].primary} />
              </View>
              <Text style={[styles.actionTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
                Manage Books
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionCard, { backgroundColor: Colors[colorScheme ?? 'light'].card }]}
              onPress={() => router.push('/admin/users')}
            >
              <View style={[styles.actionIcon, { backgroundColor: Colors[colorScheme ?? 'light'].primary + '20' }]}>
                <Ionicons name="people" size={24} color={Colors[colorScheme ?? 'light'].primary} />
              </View>
              <Text style={[styles.actionTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
                Manage Users
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionCard, { backgroundColor: Colors[colorScheme ?? 'light'].card }]}
              onPress={() => router.push('/admin/lists')}
            >
              <View style={[styles.actionIcon, { backgroundColor: Colors[colorScheme ?? 'light'].primary + '20' }]}>
                <Ionicons name="list" size={24} color={Colors[colorScheme ?? 'light'].primary} />
              </View>
              <Text style={[styles.actionTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
                Manage Lists
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionCard, { backgroundColor: Colors[colorScheme ?? 'light'].card }]}
              onPress={() => router.push('/admin/rosary/upload')}
            >
              <View style={[styles.actionIcon, { backgroundColor: Colors[colorScheme ?? 'light'].primary + '20' }]}>
                <Ionicons name="musical-notes" size={24} color={Colors[colorScheme ?? 'light'].primary} />
              </View>
              <Text style={[styles.actionTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
                Upload Audio
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionCard, { backgroundColor: Colors[colorScheme ?? 'light'].card }]}
              onPress={() => router.push('/admin/podcasts')}
            >
              <View style={[styles.actionIcon, { backgroundColor: Colors[colorScheme ?? 'light'].primary + '20' }]}>
                <Ionicons name="radio" size={24} color={Colors[colorScheme ?? 'light'].primary} />
              </View>
              <Text style={[styles.actionTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
                Manage Podcasts
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* User Statistics */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
            User Statistics
          </Text>
          <View style={styles.statsGrid}>
            <View style={[styles.statCard, { backgroundColor: Colors[colorScheme ?? 'light'].card }]}>
              <Ionicons name="people" size={32} color={Colors[colorScheme ?? 'light'].primary} />
              <Text style={[styles.statValue, { color: Colors[colorScheme ?? 'light'].text }]}>
                {userStats?.total_users || 0}
              </Text>
              <Text style={[styles.statLabel, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                Total Users
              </Text>
            </View>

            <View style={[styles.statCard, { backgroundColor: Colors[colorScheme ?? 'light'].card }]}>
              <Ionicons name="person-add" size={32} color={Colors[colorScheme ?? 'light'].accent} />
              <Text style={[styles.statValue, { color: Colors[colorScheme ?? 'light'].text }]}>
                {userStats?.recent_signups || 0}
              </Text>
              <Text style={[styles.statLabel, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                Recent Signups (30d)
              </Text>
            </View>

            <View style={[styles.statCard, { backgroundColor: Colors[colorScheme ?? 'light'].card }]}>
              <Ionicons name="book-outline" size={32} color={Colors[colorScheme ?? 'light'].secondary} />
              <Text style={[styles.statValue, { color: Colors[colorScheme ?? 'light'].text }]}>
                {userStats?.active_readers || 0}
              </Text>
              <Text style={[styles.statLabel, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                Active Readers (7d)
              </Text>
            </View>
          </View>

          {/* Roles Breakdown */}
          {userStats?.users_by_role && (
            <View style={[styles.rolesCard, { backgroundColor: Colors[colorScheme ?? 'light'].card }]}>
              <Text style={[styles.rolesTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
                Users by Role
              </Text>
              {Object.entries(userStats.users_by_role).map(([role, count]) => (
                <View key={role} style={styles.roleRow}>
                  <Text style={[styles.roleLabel, { color: Colors[colorScheme ?? 'light'].text }]}>
                    {role || 'authenticated'}
                  </Text>
                  <Text style={[styles.roleCount, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                    {count}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Book Statistics */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
            Library Statistics
          </Text>
          <View style={styles.statsGrid}>
            <View style={[styles.statCard, { backgroundColor: Colors[colorScheme ?? 'light'].card }]}>
              <Ionicons name="library" size={32} color={Colors[colorScheme ?? 'light'].primary} />
              <Text style={[styles.statValue, { color: Colors[colorScheme ?? 'light'].text }]}>
                {bookStats?.total || 0}
              </Text>
              <Text style={[styles.statLabel, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                Total Books
              </Text>
            </View>

            <View style={[styles.statCard, { backgroundColor: Colors[colorScheme ?? 'light'].card }]}>
              <Ionicons name="document" size={32} color={Colors[colorScheme ?? 'light'].accent} />
              <Text style={[styles.statValue, { color: Colors[colorScheme ?? 'light'].text }]}>
                {bookStats?.with_epub || 0}
              </Text>
              <Text style={[styles.statLabel, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                With EPUB
              </Text>
            </View>
          </View>

          {/* Categories Breakdown */}
          {bookStats?.by_category && (
            <View style={[styles.rolesCard, { backgroundColor: Colors[colorScheme ?? 'light'].card }]}>
              <Text style={[styles.rolesTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
                Books by Category
              </Text>
              {Object.entries(bookStats.by_category).map(([category, count]) => (
                <View key={category} style={styles.roleRow}>
                  <Text style={[styles.roleLabel, { color: Colors[colorScheme ?? 'light'].text }]}>
                    {category}
                  </Text>
                  <Text style={[styles.roleCount, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                    {count}
                  </Text>
                </View>
              ))}
            </View>
          )}
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
  scrollContent: {
    padding: 16,
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
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    fontFamily: 'Georgia',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Georgia',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    fontFamily: 'Georgia',
    marginBottom: 16,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionCard: {
    flex: 1,
    minWidth: 150,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Georgia',
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    minWidth: 150,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statValue: {
    fontSize: 32,
    fontWeight: '700',
    fontFamily: 'Georgia',
    marginTop: 12,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    fontFamily: 'Georgia',
    textAlign: 'center',
  },
  rolesCard: {
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  rolesTitle: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Georgia',
    marginBottom: 12,
  },
  roleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  roleLabel: {
    fontSize: 14,
    fontFamily: 'Georgia',
    textTransform: 'capitalize',
  },
  roleCount: {
    fontSize: 14,
    fontFamily: 'Georgia',
    fontWeight: '600',
  },
});

