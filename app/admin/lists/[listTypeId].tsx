import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../components/ThemeProvider';
import { Colors } from '../../../constants/Colors';
import { AdminListsService } from '../../../services/AdminListsService';
import { ListItem, ListType } from '../../../types/lists';

export default function ListItemsScreen() {
  const { colorScheme } = useTheme();
  const { listTypeId } = useLocalSearchParams<{ listTypeId: string }>();
  const [listType, setListType] = useState<ListType | null>(null);
  const [items, setItems] = useState<ListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newItemValue, setNewItemValue] = useState('');
  const [newItemLabel, setNewItemLabel] = useState('');

  useEffect(() => {
    if (listTypeId) {
      loadData();
    }
  }, [listTypeId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const types = await AdminListsService.getListTypes();
      const type = types.find(t => t.id === listTypeId);
      setListType(type || null);
      
      const listItems = await AdminListsService.getListItems(listTypeId as string, true);
      setItems(listItems);
    } catch (error) {
      console.error('Error loading list data:', error);
      Alert.alert('Error', 'Failed to load list data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = async () => {
    if (!newItemValue.trim() || !newItemLabel.trim()) {
      Alert.alert('Error', 'Please enter both value and label');
      return;
    }

    try {
      await AdminListsService.createListItem({
        listTypeId: listTypeId as string,
        value: newItemValue.trim(),
        label: newItemLabel.trim(),
      });
      
      setNewItemValue('');
      setNewItemLabel('');
      setShowAddForm(false);
      loadData();
    } catch (error) {
      console.error('Error adding item:', error);
      Alert.alert('Error', 'Failed to add item. It may already exist.');
    }
  };

  const handleToggleActive = async (item: ListItem) => {
    try {
      await AdminListsService.updateListItem(item.id, {
        isActive: !item.isActive,
      });
      loadData();
    } catch (error) {
      console.error('Error toggling active status:', error);
      Alert.alert('Error', 'Failed to update status');
    }
  };

  const handleDeleteItem = async (item: ListItem) => {
    // Check if item is used
    const usage = await AdminListsService.isListItemUsed(listTypeId as string, item.value);
    
    Alert.alert(
      'Delete Item',
      usage.used
        ? `This ${item.label} is currently used by ${usage.count} book(s). Deleting it won't affect existing books, but it will be removed from the selection list.\n\nContinue?`
        : `Delete "${item.label}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await AdminListsService.deleteListItem(item.id);
              loadData();
            } catch (error) {
              console.error('Error deleting item:', error);
              Alert.alert('Error', 'Failed to delete item');
            }
          },
        },
      ]
    );
  };

  const handleMoveUp = async (item: ListItem, index: number) => {
    if (index === 0) return;
    
    const reordered = [...items];
    [reordered[index - 1], reordered[index]] = [reordered[index], reordered[index - 1]];
    
    try {
      await AdminListsService.reorderItems(
        listTypeId as string,
        reordered.map(i => i.id)
      );
      loadData();
    } catch (error) {
      console.error('Error reordering:', error);
      Alert.alert('Error', 'Failed to reorder items');
    }
  };

  const handleMoveDown = async (item: ListItem, index: number) => {
    if (index === items.length - 1) return;
    
    const reordered = [...items];
    [reordered[index], reordered[index + 1]] = [reordered[index + 1], reordered[index]];
    
    try {
      await AdminListsService.reorderItems(
        listTypeId as string,
        reordered.map(i => i.id)
      );
      loadData();
    } catch (error) {
      console.error('Error reordering:', error);
      Alert.alert('Error', 'Failed to reorder items');
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
      {/* Header */}
      <View style={[styles.header, { backgroundColor: Colors[colorScheme ?? 'light'].surface }]}>
        <Text style={[styles.headerTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
          {listType?.name || 'List Items'}
        </Text>
        {listType?.description && (
          <Text style={[styles.headerSubtitle, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
            {listType.description}
          </Text>
        )}
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Add Button */}
        <View style={styles.addButtonContainer}>
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: Colors[colorScheme ?? 'light'].primary }]}
            onPress={() => setShowAddForm(!showAddForm)}
          >
            <Ionicons name="add" size={20} color={Colors[colorScheme ?? 'light'].dominicanWhite} />
            <Text style={[styles.addButtonText, { color: Colors[colorScheme ?? 'light'].dominicanWhite }]}>
              Add New Item
            </Text>
          </TouchableOpacity>
        </View>

        {/* Add Form */}
        {showAddForm && (
          <View style={[styles.addForm, { backgroundColor: Colors[colorScheme ?? 'light'].card }]}>
            <Text style={[styles.formTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
              New Item
            </Text>
            <View style={styles.formField}>
              <Text style={[styles.formLabel, { color: Colors[colorScheme ?? 'light'].text }]}>
                Value
              </Text>
              <TextInput
                style={[styles.formInput, { backgroundColor: Colors[colorScheme ?? 'light'].background, color: Colors[colorScheme ?? 'light'].text }]}
                value={newItemValue}
                onChangeText={setNewItemValue}
                placeholder="e.g., History"
                placeholderTextColor={Colors[colorScheme ?? 'light'].textSecondary}
              />
            </View>
            <View style={styles.formField}>
              <Text style={[styles.formLabel, { color: Colors[colorScheme ?? 'light'].text }]}>
                Label
              </Text>
              <TextInput
                style={[styles.formInput, { backgroundColor: Colors[colorScheme ?? 'light'].background, color: Colors[colorScheme ?? 'light'].text }]}
                value={newItemLabel}
                onChangeText={setNewItemLabel}
                placeholder="e.g., History"
                placeholderTextColor={Colors[colorScheme ?? 'light'].textSecondary}
              />
            </View>
            <View style={styles.formButtons}>
              <TouchableOpacity
                style={[styles.formButton, styles.formButtonCancel, { borderColor: Colors[colorScheme ?? 'light'].border }]}
                onPress={() => {
                  setShowAddForm(false);
                  setNewItemValue('');
                  setNewItemLabel('');
                }}
              >
                <Text style={[styles.formButtonText, { color: Colors[colorScheme ?? 'light'].text }]}>
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.formButton, styles.formButtonSave, { backgroundColor: Colors[colorScheme ?? 'light'].primary }]}
                onPress={handleAddItem}
              >
                <Text style={[styles.formButtonText, { color: Colors[colorScheme ?? 'light'].dominicanWhite }]}>
                  Add
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Items List */}
        <View style={styles.itemsList}>
          {items.map((item, index) => (
            <View
              key={item.id}
              style={[styles.itemCard, { backgroundColor: Colors[colorScheme ?? 'light'].card }]}
            >
              <View style={styles.itemHeader}>
                <View style={styles.itemInfo}>
                  <Text style={[styles.itemLabel, { color: Colors[colorScheme ?? 'light'].text }]}>
                    {item.label}
                  </Text>
                  <Text style={[styles.itemValue, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                    {item.value}
                  </Text>
                </View>
                <TouchableOpacity
                  style={[
                    styles.statusBadge,
                    {
                      backgroundColor: item.isActive
                        ? Colors[colorScheme ?? 'light'].success + '15'
                        : Colors[colorScheme ?? 'light'].textMuted + '15',
                    },
                  ]}
                  onPress={() => handleToggleActive(item)}
                >
                  <Text
                    style={[
                      styles.statusBadgeText,
                      {
                        color: item.isActive
                          ? Colors[colorScheme ?? 'light'].success
                          : Colors[colorScheme ?? 'light'].textMuted,
                      },
                    ]}
                  >
                    {item.isActive ? 'Active' : 'Inactive'}
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.itemActions}>
                <View style={styles.orderActions}>
                  <TouchableOpacity
                    style={styles.orderButton}
                    onPress={() => handleMoveUp(item, index)}
                    disabled={index === 0}
                  >
                    <Ionicons
                      name="arrow-up"
                      size={20}
                      color={index === 0 ? Colors[colorScheme ?? 'light'].border : Colors[colorScheme ?? 'light'].primary}
                    />
                  </TouchableOpacity>
                  <Text style={[styles.orderText, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                    Order: {item.displayOrder}
                  </Text>
                  <TouchableOpacity
                    style={styles.orderButton}
                    onPress={() => handleMoveDown(item, index)}
                    disabled={index === items.length - 1}
                  >
                    <Ionicons
                      name="arrow-down"
                      size={20}
                      color={index === items.length - 1 ? Colors[colorScheme ?? 'light'].border : Colors[colorScheme ?? 'light'].primary}
                    />
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  style={[styles.deleteButton, { borderColor: Colors[colorScheme ?? 'light'].error }]}
                  onPress={() => handleDeleteItem(item)}
                >
                  <Ionicons name="trash" size={18} color={Colors[colorScheme ?? 'light'].error} />
                  <Text style={[styles.deleteButtonText, { color: Colors[colorScheme ?? 'light'].error }]}>
                    Delete
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}

          {items.length === 0 && (
            <View style={styles.emptyContainer}>
              <Ionicons name="document-text-outline" size={64} color={Colors[colorScheme ?? 'light'].textSecondary} />
              <Text style={[styles.emptyText, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                No items in this list yet
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
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
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
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonContainer: {
    padding: 16,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    gap: 8,
  },
  addButtonText: {
    fontSize: 15,
    fontWeight: '600',
    fontFamily: 'Georgia',
  },
  addForm: {
    margin: 16,
    marginTop: 0,
    padding: 16,
    borderRadius: 12,
  },
  formTitle: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Georgia',
    marginBottom: 16,
  },
  formField: {
    marginBottom: 16,
  },
  formLabel: {
    fontSize: 13,
    fontWeight: '600',
    fontFamily: 'Georgia',
    marginBottom: 6,
  },
  formInput: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 6,
    fontSize: 14,
    fontFamily: 'Georgia',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  formButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  formButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  formButtonCancel: {
    borderWidth: 1,
  },
  formButtonSave: {
    // backgroundColor set inline
  },
  formButtonText: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Georgia',
  },
  itemsList: {
    padding: 16,
  },
  itemCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  itemInfo: {
    flex: 1,
  },
  itemLabel: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Georgia',
    marginBottom: 4,
  },
  itemValue: {
    fontSize: 13,
    fontFamily: 'Courier New',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusBadgeText: {
    fontSize: 12,
    fontFamily: 'Georgia',
    fontWeight: '600',
  },
  itemActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  orderButton: {
    padding: 4,
  },
  orderText: {
    fontSize: 12,
    fontFamily: 'Georgia',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    gap: 6,
  },
  deleteButtonText: {
    fontSize: 13,
    fontWeight: '600',
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

