import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../../components/ThemeProvider';
import { Colors } from '../../../constants/Colors';
import { AdminListsService } from '../../../services/AdminListsService';
import { ListItem, ListType } from '../../../types/lists';

export default function ListItemsScreenWeb() {
  const { colorScheme } = useTheme();
  const { listTypeId } = useLocalSearchParams<{ listTypeId: string }>();
  const [listType, setListType] = useState<ListType | null>(null);
  const [items, setItems] = useState<ListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newItemValue, setNewItemValue] = useState('');
  const [newItemLabel, setNewItemLabel] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editValue, setEditValue] = useState('');
  const [editLabel, setEditLabel] = useState('');

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
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = async () => {
    if (!newItemValue.trim() || !newItemLabel.trim()) {
      alert('Please enter both value and label');
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
      alert('Failed to add item. It may already exist.');
    }
  };

  const handleUpdateItem = async (id: number) => {
    if (!editValue.trim() || !editLabel.trim()) {
      alert('Please enter both value and label');
      return;
    }

    try {
      await AdminListsService.updateListItem(id, {
        value: editValue.trim(),
        label: editLabel.trim(),
      });
      
      setEditingId(null);
      loadData();
    } catch (error) {
      console.error('Error updating item:', error);
      alert('Failed to update item');
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
      alert('Failed to update status');
    }
  };

  const handleDeleteItem = async (item: ListItem) => {
    // Check if item is used
    const usage = await AdminListsService.isListItemUsed(listTypeId as string, item.value);
    
    if (usage.used) {
      const confirmed = window.confirm(
        `This ${item.label} is currently used by ${usage.count} book(s). Deleting it won't affect existing books, but it will be removed from the selection list.\n\nContinue?`
      );
      if (!confirmed) return;
    } else {
      const confirmed = window.confirm(`Delete "${item.label}"?`);
      if (!confirmed) return;
    }

    try {
      await AdminListsService.deleteListItem(item.id);
      loadData();
    } catch (error) {
      console.error('Error deleting item:', error);
      alert('Failed to delete item');
    }
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
      alert('Failed to reorder items');
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
      alert('Failed to reorder items');
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
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.push('/admin/lists')}
        >
          <Ionicons name="arrow-back" size={20} color={Colors[colorScheme ?? 'light'].text} />
          <Text style={[styles.backButtonText, { color: Colors[colorScheme ?? 'light'].text }]}>
            Back to Lists
          </Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
          {listType?.name || 'List Items'}
        </Text>
        {listType?.description && (
          <Text style={[styles.headerSubtitle, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
            {listType.description}
          </Text>
        )}
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Add New Item Button */}
        {!showAddForm && (
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: Colors[colorScheme ?? 'light'].primary }]}
            onPress={() => setShowAddForm(true)}
          >
            <Ionicons name="add" size={20} color={Colors[colorScheme ?? 'light'].dominicanWhite} />
            <Text style={[styles.addButtonText, { color: Colors[colorScheme ?? 'light'].dominicanWhite }]}>
              Add New Item
            </Text>
          </TouchableOpacity>
        )}

        {/* Add Form */}
        {showAddForm && (
          <View style={[styles.addForm, { backgroundColor: Colors[colorScheme ?? 'light'].card }]}>
            <Text style={[styles.formTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
              New Item
            </Text>
            <View style={styles.formRow}>
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
                  Add Item
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Items Table */}
        <View style={[styles.table, { backgroundColor: Colors[colorScheme ?? 'light'].card }]}>
          {/* Table Header */}
          <View style={[styles.tableHeader, { borderBottomColor: Colors[colorScheme ?? 'light'].border }]}>
            <Text style={[styles.headerCell, styles.orderColumn, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
              Order
            </Text>
            <Text style={[styles.headerCell, styles.labelColumn, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
              Label
            </Text>
            <Text style={[styles.headerCell, styles.valueColumn, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
              Value
            </Text>
            <Text style={[styles.headerCell, styles.statusColumn, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
              Status
            </Text>
            <Text style={[styles.headerCell, styles.actionsColumn, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
              Actions
            </Text>
          </View>

          {/* Table Rows */}
          {items.map((item, index) => (
            <View
              key={item.id}
              style={[styles.tableRow, { borderBottomColor: Colors[colorScheme ?? 'light'].border }]}
            >
              {/* Order Column */}
              <View style={[styles.tableCell, styles.orderColumn, styles.orderActions]}>
                <TouchableOpacity
                  onPress={() => handleMoveUp(item, index)}
                  disabled={index === 0}
                  style={styles.orderButton}
                >
                  <Ionicons
                    name="chevron-up"
                    size={16}
                    color={index === 0 ? Colors[colorScheme ?? 'light'].border : Colors[colorScheme ?? 'light'].text}
                  />
                </TouchableOpacity>
                <Text style={[styles.orderText, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                  {item.displayOrder}
                </Text>
                <TouchableOpacity
                  onPress={() => handleMoveDown(item, index)}
                  disabled={index === items.length - 1}
                  style={styles.orderButton}
                >
                  <Ionicons
                    name="chevron-down"
                    size={16}
                    color={index === items.length - 1 ? Colors[colorScheme ?? 'light'].border : Colors[colorScheme ?? 'light'].text}
                  />
                </TouchableOpacity>
              </View>

              {/* Label Column */}
              {editingId === item.id ? (
                <View style={[styles.tableCell, styles.labelColumn]}>
                  <TextInput
                    style={[styles.inlineInput, { backgroundColor: Colors[colorScheme ?? 'light'].background, color: Colors[colorScheme ?? 'light'].text }]}
                    value={editLabel}
                    onChangeText={setEditLabel}
                    placeholder="Label"
                    placeholderTextColor={Colors[colorScheme ?? 'light'].textSecondary}
                  />
                </View>
              ) : (
                <Text style={[styles.tableCell, styles.labelColumn, { color: Colors[colorScheme ?? 'light'].text }]}>
                  {item.label}
                </Text>
              )}

              {/* Value Column */}
              {editingId === item.id ? (
                <View style={[styles.tableCell, styles.valueColumn]}>
                  <TextInput
                    style={[styles.inlineInput, { backgroundColor: Colors[colorScheme ?? 'light'].background, color: Colors[colorScheme ?? 'light'].text }]}
                    value={editValue}
                    onChangeText={setEditValue}
                    placeholder="Value"
                    placeholderTextColor={Colors[colorScheme ?? 'light'].textSecondary}
                  />
                </View>
              ) : (
                <Text style={[styles.tableCell, styles.valueColumn, styles.valueText, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                  {item.value}
                </Text>
              )}

              {/* Status Column */}
              <View style={[styles.tableCell, styles.statusColumn]}>
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
                  <Ionicons
                    name={item.isActive ? 'checkmark-circle' : 'close-circle'}
                    size={14}
                    color={item.isActive ? Colors[colorScheme ?? 'light'].success : Colors[colorScheme ?? 'light'].textMuted}
                  />
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

              {/* Actions Column */}
              <View style={[styles.tableCell, styles.actionsColumn, styles.actionButtons]}>
                {editingId === item.id ? (
                  <>
                    <TouchableOpacity
                      style={[styles.actionButton, { backgroundColor: Colors[colorScheme ?? 'light'].success + '10' }]}
                      onPress={() => handleUpdateItem(item.id)}
                    >
                      <Ionicons name="checkmark" size={16} color={Colors[colorScheme ?? 'light'].success} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.actionButton, { backgroundColor: Colors[colorScheme ?? 'light'].textMuted + '10' }]}
                      onPress={() => setEditingId(null)}
                    >
                      <Ionicons name="close" size={16} color={Colors[colorScheme ?? 'light'].textMuted} />
                    </TouchableOpacity>
                  </>
                ) : (
                  <>
                    <TouchableOpacity
                      style={[styles.actionButton, { backgroundColor: Colors[colorScheme ?? 'light'].primary + '10' }]}
                      onPress={() => {
                        setEditingId(item.id);
                        setEditValue(item.value);
                        setEditLabel(item.label);
                      }}
                    >
                      <Ionicons name="create" size={16} color={Colors[colorScheme ?? 'light'].primary} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.actionButton, { backgroundColor: Colors[colorScheme ?? 'light'].error + '10' }]}
                      onPress={() => handleDeleteItem(item)}
                    >
                      <Ionicons name="trash" size={16} color={Colors[colorScheme ?? 'light'].error} />
                    </TouchableOpacity>
                  </>
                )}
              </View>
            </View>
          ))}

          {items.length === 0 && (
            <View style={styles.emptyTable}>
              <Text style={[styles.emptyTableText, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                No items in this list yet
              </Text>
            </View>
          )}
        </View>
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
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
    alignSelf: 'flex-start',
    cursor: 'pointer',
  },
  backButtonText: {
    fontSize: 14,
    fontFamily: 'Georgia',
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
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    gap: 8,
    alignSelf: 'flex-start',
    marginBottom: 24,
  },
  addButtonText: {
    fontSize: 15,
    fontWeight: '600',
    fontFamily: 'Georgia',
  },
  addForm: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  formTitle: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Georgia',
    marginBottom: 16,
  },
  formRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  formField: {
    flex: 1,
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
    justifyContent: 'flex-end',
  },
  formButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 6,
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
  table: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  tableHeader: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 2,
  },
  headerCell: {
    fontSize: 13,
    fontWeight: '600',
    fontFamily: 'Georgia',
    textTransform: 'uppercase',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  tableCell: {
    justifyContent: 'center',
  },
  orderColumn: {
    width: 120,
  },
  labelColumn: {
    flex: 2,
  },
  valueColumn: {
    flex: 2,
  },
  statusColumn: {
    flex: 1.5,
  },
  actionsColumn: {
    width: 120,
  },
  orderActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  orderButton: {
    padding: 4,
    cursor: 'pointer',
  },
  orderText: {
    fontSize: 14,
    fontFamily: 'Georgia',
    fontWeight: '600',
  },
  valueText: {
    fontFamily: 'Courier New',
    fontSize: 13,
  },
  inlineInput: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 4,
    fontSize: 14,
    fontFamily: 'Georgia',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
    cursor: 'pointer',
    alignSelf: 'flex-start',
  },
  statusBadgeText: {
    fontSize: 12,
    fontFamily: 'Georgia',
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    cursor: 'pointer',
  },
  emptyTable: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyTableText: {
    fontSize: 14,
    fontFamily: 'Georgia',
  },
});

