import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../components/ThemeProvider';
import { Colors } from '../../../constants/Colors';
import { AdminListsService } from '../../../services/AdminListsService';
import { ListType } from '../../../types/lists';

export default function ListsIndexScreen() {
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
      <SafeAreaView style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors[colorScheme ?? 'light'].primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.headerSection}>
            <Text style={[styles.headerTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
              Manage Lists
            </Text>
            <Text style={[styles.headerSubtitle, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
              Lookup lists used throughout the app
            </Text>
          </View>

          {/* List Cards */}
          {listTypes.map((listType) => (
            <TouchableOpacity
              key={listType.id}
              style={[styles.listCard, { backgroundColor: Colors[colorScheme ?? 'light'].card }]}
              onPress={() => router.push(`/admin/lists/${listType.id}`)}
            >
              <View style={styles.listCardHeader}>
                <View style={[styles.iconCircle, { backgroundColor: Colors[colorScheme ?? 'light'].primary + '20' }]}>
                  <Ionicons name="list" size={28} color={Colors[colorScheme ?? 'light'].primary} />
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
                  <View style={styles.listCardMeta}>
                    <Ionicons name="document-text" size={14} color={Colors[colorScheme ?? 'light'].textSecondary} />
                    <Text style={[styles.listCardMetaText, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                      {itemCounts[listType.id] ?? 0} items
                    </Text>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={24} color={Colors[colorScheme ?? 'light'].textSecondary} />
              </View>
            </TouchableOpacity>
          ))}

          {listTypes.length === 0 && (
            <View style={styles.emptyContainer}>
              <Ionicons name="list-outline" size={64} color={Colors[colorScheme ?? 'light'].textSecondary} />
              <Text style={[styles.emptyText, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                No lists configured
              </Text>
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
  content: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerSection: {
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    fontFamily: 'Georgia',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    fontFamily: 'Georgia',
  },
  listCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  listCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
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
    marginBottom: 8,
    lineHeight: 18,
  },
  listCardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  listCardMetaText: {
    fontSize: 12,
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

