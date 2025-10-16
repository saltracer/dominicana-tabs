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
  most_read: Array<{
    id: number;
    title: string;
    author: string;
    reader_count: number;
  }>;
}

export default function AdminDashboardWeb() {
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

      // Load book stats with most read
      const { data: books, error: booksError } = await supabase
        .from('books')
        .select('id, title, author, category, epub_path');

      if (booksError) throw booksError;

      // Get reading progress for popularity
      const { data: progress } = await supabase
        .from('reading_progress')
        .select('book_id');

      const by_category: Record<string, number> = {};
      let with_epub = 0;
      const bookReaderCounts: Record<number, number> = {};

      books?.forEach(book => {
        by_category[book.category] = (by_category[book.category] || 0) + 1;
        if (book.epub_path) with_epub++;
        bookReaderCounts[book.id] = 0;
      });

      progress?.forEach(p => {
        if (bookReaderCounts[p.book_id] !== undefined) {
          bookReaderCounts[p.book_id]++;
        }
      });

      const most_read = books
        ?.map(book => ({
          id: book.id,
          title: book.title,
          author: book.author,
          reader_count: bookReaderCounts[book.id] || 0,
        }))
        .sort((a, b) => b.reader_count - a.reader_count)
        .slice(0, 10) || [];

      setBookStats({
        total: books?.length || 0,
        by_category,
        with_epub,
        most_read,
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
      <View style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors[colorScheme ?? 'light'].primary} />
          <Text style={[styles.loadingText, { color: Colors[colorScheme ?? 'light'].text }]}>
            Loading dashboard...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.title, { color: Colors[colorScheme ?? 'light'].text }]}>
              Admin Dashboard
            </Text>
            <Text style={[styles.subtitle, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
              Manage your application content and users
            </Text>
          </View>
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
                <Ionicons name="add-circle" size={28} color={Colors[colorScheme ?? 'light'].primary} />
              </View>
              <Text style={[styles.actionTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
                Add New Book
              </Text>
              <Text style={[styles.actionDescription, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                Create a new library entry
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionCard, { backgroundColor: Colors[colorScheme ?? 'light'].card }]}
              onPress={() => router.push('/admin/books')}
            >
              <View style={[styles.actionIcon, { backgroundColor: Colors[colorScheme ?? 'light'].primary + '20' }]}>
                <Ionicons name="book" size={28} color={Colors[colorScheme ?? 'light'].primary} />
              </View>
              <Text style={[styles.actionTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
                Manage Books
              </Text>
              <Text style={[styles.actionDescription, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                Edit library content
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionCard, { backgroundColor: Colors[colorScheme ?? 'light'].card }]}
              onPress={() => router.push('/admin/users')}
            >
              <View style={[styles.actionIcon, { backgroundColor: Colors[colorScheme ?? 'light'].accent + '20' }]}>
                <Ionicons name="people" size={28} color={Colors[colorScheme ?? 'light'].accent} />
              </View>
              <Text style={[styles.actionTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
                Manage Users
              </Text>
              <Text style={[styles.actionDescription, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                User accounts and roles
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionCard, { backgroundColor: Colors[colorScheme ?? 'light'].card }]}
              onPress={() => router.push('/admin/rosary/upload')}
            >
              <View style={[styles.actionIcon, { backgroundColor: Colors[colorScheme ?? 'light'].secondary + '20' }]}>
                <Ionicons name="musical-notes" size={28} color={Colors[colorScheme ?? 'light'].secondary} />
              </View>
              <Text style={[styles.actionTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
                Upload Audio
              </Text>
              <Text style={[styles.actionDescription, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                Rosary audio files
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Statistics Grid */}
        <View style={styles.statsRow}>
          {/* User Statistics */}
          <View style={styles.statsColumn}>
            <Text style={[styles.sectionTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
              User Statistics
            </Text>
            <View style={styles.statsGrid}>
              <View style={[styles.statCard, { backgroundColor: Colors[colorScheme ?? 'light'].card }]}>
                <Ionicons name="people" size={36} color={Colors[colorScheme ?? 'light'].primary} />
                <Text style={[styles.statValue, { color: Colors[colorScheme ?? 'light'].text }]}>
                  {userStats?.total_users || 0}
                </Text>
                <Text style={[styles.statLabel, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                  Total Users
                </Text>
              </View>

              <View style={[styles.statCard, { backgroundColor: Colors[colorScheme ?? 'light'].card }]}>
                <Ionicons name="person-add" size={36} color={Colors[colorScheme ?? 'light'].accent} />
                <Text style={[styles.statValue, { color: Colors[colorScheme ?? 'light'].text }]}>
                  {userStats?.recent_signups || 0}
                </Text>
                <Text style={[styles.statLabel, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                  Recent Signups
                </Text>
              </View>

              <View style={[styles.statCard, { backgroundColor: Colors[colorScheme ?? 'light'].card }]}>
                <Ionicons name="book-outline" size={36} color={Colors[colorScheme ?? 'light'].secondary} />
                <Text style={[styles.statValue, { color: Colors[colorScheme ?? 'light'].text }]}>
                  {userStats?.active_readers || 0}
                </Text>
                <Text style={[styles.statLabel, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                  Active Readers
                </Text>
              </View>
            </View>

            {/* Roles Breakdown */}
            {userStats?.users_by_role && (
              <View style={[styles.breakdownCard, { backgroundColor: Colors[colorScheme ?? 'light'].card }]}>
                <Text style={[styles.breakdownTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
                  Users by Role
                </Text>
                {Object.entries(userStats.users_by_role).map(([role, count]) => (
                  <View key={role} style={styles.breakdownRow}>
                    <Text style={[styles.breakdownLabel, { color: Colors[colorScheme ?? 'light'].text }]}>
                      {role || 'authenticated'}
                    </Text>
                    <View style={styles.breakdownValue}>
                      <View style={[
                        styles.breakdownBar,
                        { 
                          width: `${(count / (userStats.total_users || 1)) * 100}%`,
                          backgroundColor: Colors[colorScheme ?? 'light'].primary,
                        }
                      ]} />
                      <Text style={[styles.breakdownCount, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                        {count}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* Book Statistics */}
          <View style={styles.statsColumn}>
            <Text style={[styles.sectionTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
              Library Statistics
            </Text>
            <View style={styles.statsGrid}>
              <View style={[styles.statCard, { backgroundColor: Colors[colorScheme ?? 'light'].card }]}>
                <Ionicons name="library" size={36} color={Colors[colorScheme ?? 'light'].primary} />
                <Text style={[styles.statValue, { color: Colors[colorScheme ?? 'light'].text }]}>
                  {bookStats?.total || 0}
                </Text>
                <Text style={[styles.statLabel, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                  Total Books
                </Text>
              </View>

              <View style={[styles.statCard, { backgroundColor: Colors[colorScheme ?? 'light'].card }]}>
                <Ionicons name="document" size={36} color={Colors[colorScheme ?? 'light'].accent} />
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
              <View style={[styles.breakdownCard, { backgroundColor: Colors[colorScheme ?? 'light'].card }]}>
                <Text style={[styles.breakdownTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
                  Books by Category
                </Text>
                {Object.entries(bookStats.by_category).map(([category, count]) => (
                  <View key={category} style={styles.breakdownRow}>
                    <Text style={[styles.breakdownLabel, { color: Colors[colorScheme ?? 'light'].text }]}>
                      {category}
                    </Text>
                    <View style={styles.breakdownValue}>
                      <View style={[
                        styles.breakdownBar,
                        { 
                          width: `${(count / (bookStats.total || 1)) * 100}%`,
                          backgroundColor: Colors[colorScheme ?? 'light'].accent,
                        }
                      ]} />
                      <Text style={[styles.breakdownCount, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                        {count}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>

        {/* Most Read Books */}
        {bookStats?.most_read && bookStats.most_read.some(b => b.reader_count > 0) && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
              Most Read Books
            </Text>
            <View style={[styles.tableCard, { backgroundColor: Colors[colorScheme ?? 'light'].card }]}>
              {bookStats.most_read
                .filter(book => book.reader_count > 0)
                .map((book, index) => (
                  <TouchableOpacity
                    key={book.id}
                    style={styles.tableRow}
                    onPress={() => router.push(`/admin/books/${book.id}`)}
                  >
                    <View style={[styles.rankBadge, { backgroundColor: Colors[colorScheme ?? 'light'].primary + '20' }]}>
                      <Text style={[styles.rankText, { color: Colors[colorScheme ?? 'light'].primary }]}>
                        #{index + 1}
                      </Text>
                    </View>
                    <View style={styles.tableBookInfo}>
                      <Text style={[styles.tableBookTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
                        {book.title}
                      </Text>
                      <Text style={[styles.tableBookAuthor, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                        {book.author}
                      </Text>
                    </View>
                    <View style={styles.tableReaders}>
                      <Ionicons name="people" size={16} color={Colors[colorScheme ?? 'light'].textSecondary} />
                      <Text style={[styles.tableReaderCount, { color: Colors[colorScheme ?? 'light'].text }]}>
                        {book.reader_count}
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color={Colors[colorScheme ?? 'light'].textSecondary} />
                  </TouchableOpacity>
                ))}
            </View>
          </View>
        )}
      </ScrollView>
    </View>
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
    paddingBottom: 32,
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
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    fontFamily: 'Georgia',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    fontFamily: 'Georgia',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '600',
    fontFamily: 'Georgia',
    marginBottom: 16,
  },
  actionsGrid: {
    flexDirection: 'row',
    gap: 16,
  },
  actionCard: {
    flex: 1,
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    minWidth: 180,
  },
  actionIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Georgia',
    marginBottom: 4,
  },
  actionDescription: {
    fontSize: 13,
    fontFamily: 'Georgia',
    textAlign: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 24,
    marginBottom: 32,
  },
  statsColumn: {
    flex: 1,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  statValue: {
    fontSize: 36,
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
  breakdownCard: {
    padding: 20,
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  breakdownTitle: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Georgia',
    marginBottom: 16,
  },
  breakdownRow: {
    marginBottom: 12,
  },
  breakdownLabel: {
    fontSize: 14,
    fontFamily: 'Georgia',
    textTransform: 'capitalize',
    marginBottom: 6,
  },
  breakdownValue: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  breakdownBar: {
    height: 8,
    borderRadius: 4,
    minWidth: 20,
  },
  breakdownCount: {
    fontSize: 14,
    fontFamily: 'Georgia',
    fontWeight: '600',
    minWidth: 30,
  },
  tableCard: {
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    overflow: 'hidden',
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    gap: 12,
  },
  rankBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rankText: {
    fontSize: 14,
    fontFamily: 'Georgia',
    fontWeight: '700',
  },
  tableBookInfo: {
    flex: 1,
  },
  tableBookTitle: {
    fontSize: 15,
    fontFamily: 'Georgia',
    fontWeight: '600',
    marginBottom: 2,
  },
  tableBookAuthor: {
    fontSize: 13,
    fontFamily: 'Georgia',
  },
  tableReaders: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
  },
  tableReaderCount: {
    fontSize: 14,
    fontFamily: 'Georgia',
    fontWeight: '600',
  },
});

