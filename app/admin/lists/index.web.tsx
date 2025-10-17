import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../components/ThemeProvider';
import { Colors } from '../../../constants/Colors';
import { AdminListsService } from '../../../services/AdminListsService';
import { ListType } from '../../../types/lists';

export default function ListsIndexScreenWeb() {
  const { colorScheme } = useTheme();
  const [listTypes, setListTypes] = useState<ListType[]>([]);
  const [loading, setLoading] = useState(true);
  const [itemCounts, setItemCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    loadListTypes();
  }, []);

  const loadListTypes = async () => {
    try {
      setLoading(true);
      const types = await AdminListsService.getListTypes();
      setListTypes(types);

      // Load item counts for each list
      const counts: Record<string, number> = {};
      for (const type of types) {
        const items = await AdminListsService.getListItems(type.id, true);
        counts[type.id] = items.length;
      }
      setItemCounts(counts);
    } catch (error) {
      console.error('Error loading list types:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors[colorScheme ?? 'light'].primary} />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: Colors[colorScheme ?? 'light'].surface }]}>
        <Text style={[styles.headerTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
          Manage Lists
        </Text>
        <Text style={[styles.headerSubtitle, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
          Manage lookup lists used throughout the application
        </Text>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <View style={styles.grid}>
          {listTypes.map((listType) => (
            <TouchableOpacity
              key={listType.id}
              style={[styles.listCard, { backgroundColor: Colors[colorScheme ?? 'light'].card }]}
              onPress={() => router.push(`/admin/lists/${listType.id}`)}
              activeOpacity={0.7}
            >
              <View style={styles.listCardHeader}>
                <View style={[styles.iconCircle, { backgroundColor: Colors[colorScheme ?? 'light'].primary + '20' }]}>
                  <Ionicons name="list" size={24} color={Colors[colorScheme ?? 'light'].primary} />
                </View>
                <View style={styles.listCardInfo}>
                  <Text style={[styles.listCardTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
                    {listType.name}
                  </Text>
                  {listType.description && (
                    <Text style={[styles.listCardDescription, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                      {listType.description}
                    </Text>
                  )}
                </View>
              </View>
              
              <View style={styles.listCardFooter}>
                <View style={styles.listCardStat}>
                  <Ionicons name="document-text" size={16} color={Colors[colorScheme ?? 'light'].textSecondary} />
                  <Text style={[styles.listCardStatText, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                    {itemCounts[listType.id] ?? 0} items
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={Colors[colorScheme ?? 'light'].textSecondary} />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {listTypes.length === 0 && (
          <View style={styles.emptyContainer}>
            <Ionicons name="list-outline" size={64} color={Colors[colorScheme ?? 'light'].textSecondary} />
            <Text style={[styles.emptyText, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
              No lists configured
            </Text>
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
  header: {
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    fontFamily: 'Georgia',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 14,
    fontFamily: 'Georgia',
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
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 20,
  },
  listCard: {
    width: '100%',
    maxWidth: 400,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    cursor: 'pointer',
  },
  listCardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    gap: 16,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listCardInfo: {
    flex: 1,
  },
  listCardTitle: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Georgia',
    marginBottom: 4,
  },
  listCardDescription: {
    fontSize: 13,
    fontFamily: 'Georgia',
    lineHeight: 18,
  },
  listCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  listCardStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  listCardStatText: {
    fontSize: 13,
    fontFamily: 'Georgia',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyText: {
    fontSize: 16,
    fontFamily: 'Georgia',
    marginTop: 16,
  },
});

