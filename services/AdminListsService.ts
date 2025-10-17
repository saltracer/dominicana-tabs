import { supabase } from '../lib/supabase';
import { ListType, ListItem, CreateListItemData, UpdateListItemData } from '../types/lists';

/**
 * Admin service for managing dynamic lists
 */
export class AdminListsService {
  /**
   * Get all list types
   */
  static async getListTypes(): Promise<ListType[]> {
    const { data, error } = await supabase
      .from('list_types')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error fetching list types:', error);
      throw new Error(`Failed to fetch list types: ${error.message}`);
    }

    return (data || []).map(this.transformListType);
  }

  /**
   * Get items for a specific list type
   */
  static async getListItems(listTypeId: string, includeInactive = false): Promise<ListItem[]> {
    let query = supabase
      .from('list_items')
      .select('*')
      .eq('list_type_id', listTypeId)
      .order('display_order');

    // Filter to active items only unless specifically requesting all
    if (!includeInactive) {
      query = query.eq('is_active', true);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching list items:', error);
      throw new Error(`Failed to fetch list items: ${error.message}`);
    }

    return (data || []).map(this.transformListItem);
  }

  /**
   * Get a single list item by ID
   */
  static async getListItem(id: number): Promise<ListItem> {
    const { data, error } = await supabase
      .from('list_items')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching list item:', error);
      throw new Error(`Failed to fetch list item: ${error.message}`);
    }

    return this.transformListItem(data);
  }

  /**
   * Create a new list item
   */
  static async createListItem(itemData: CreateListItemData): Promise<ListItem> {
    // Get the current max display_order for this list
    const { data: existingItems } = await supabase
      .from('list_items')
      .select('display_order')
      .eq('list_type_id', itemData.listTypeId)
      .order('display_order', { ascending: false })
      .limit(1);

    const maxOrder = existingItems?.[0]?.display_order ?? 0;

    const { data, error } = await supabase
      .from('list_items')
      .insert({
        list_type_id: itemData.listTypeId,
        value: itemData.value,
        label: itemData.label,
        display_order: itemData.displayOrder ?? maxOrder + 1,
        is_active: itemData.isActive ?? true,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating list item:', error);
      throw new Error(`Failed to create list item: ${error.message}`);
    }

    return this.transformListItem(data);
  }

  /**
   * Update a list item
   */
  static async updateListItem(id: number, updates: UpdateListItemData): Promise<void> {
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (updates.value !== undefined) updateData.value = updates.value;
    if (updates.label !== undefined) updateData.label = updates.label;
    if (updates.displayOrder !== undefined) updateData.display_order = updates.displayOrder;
    if (updates.isActive !== undefined) updateData.is_active = updates.isActive;

    const { error } = await supabase
      .from('list_items')
      .update(updateData)
      .eq('id', id);

    if (error) {
      console.error('Error updating list item:', error);
      throw new Error(`Failed to update list item: ${error.message}`);
    }
  }

  /**
   * Delete a list item
   */
  static async deleteListItem(id: number): Promise<void> {
    const { error } = await supabase
      .from('list_items')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting list item:', error);
      throw new Error(`Failed to delete list item: ${error.message}`);
    }
  }

  /**
   * Reorder list items
   */
  static async reorderItems(listTypeId: string, itemIds: number[]): Promise<void> {
    // Update display_order for each item based on array position
    const updates = itemIds.map((itemId, index) => 
      supabase
        .from('list_items')
        .update({ 
          display_order: index,
          updated_at: new Date().toISOString(),
        })
        .eq('id', itemId)
        .eq('list_type_id', listTypeId)
    );

    const results = await Promise.all(updates);
    
    const errors = results.filter(r => r.error);
    if (errors.length > 0) {
      console.error('Error reordering items:', errors);
      throw new Error('Failed to reorder some items');
    }
  }

  /**
   * Check if a list item value is used (e.g., category used by books)
   */
  static async isListItemUsed(listTypeId: string, value: string): Promise<{ used: boolean; count: number }> {
    // Currently only checks books, but could be extended for other list types
    if (listTypeId === 'book_categories') {
      const { count, error } = await supabase
        .from('books')
        .select('*', { count: 'exact', head: true })
        .eq('category', value);

      if (error) {
        console.error('Error checking item usage:', error);
        return { used: false, count: 0 };
      }

      return { used: (count ?? 0) > 0, count: count ?? 0 };
    }

    return { used: false, count: 0 };
  }

  /**
   * Transform database list type to app format
   */
  private static transformListType(dbListType: any): ListType {
    return {
      id: dbListType.id,
      name: dbListType.name,
      description: dbListType.description,
      createdAt: dbListType.created_at,
      updatedAt: dbListType.updated_at,
    };
  }

  /**
   * Transform database list item to app format
   */
  private static transformListItem(dbItem: any): ListItem {
    return {
      id: dbItem.id,
      listTypeId: dbItem.list_type_id,
      value: dbItem.value,
      label: dbItem.label,
      displayOrder: dbItem.display_order,
      isActive: dbItem.is_active,
      createdAt: dbItem.created_at,
      updatedAt: dbItem.updated_at,
    };
  }
}

