import { useState, useEffect } from 'react';
import { AdminListsService } from '../services/AdminListsService';

/**
 * Hook to fetch book categories from the database
 * Returns active categories ordered by display_order
 */
export function useBookCategories() {
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch active categories only
      const items = await AdminListsService.getListItems('book_categories', false);
      
      // Extract values in order
      const categoryValues = items
        .sort((a, b) => a.displayOrder - b.displayOrder)
        .map(item => item.value);
      
      setCategories(categoryValues);
    } catch (err) {
      console.error('Error loading book categories:', err);
      setError(err instanceof Error ? err.message : 'Failed to load categories');
      // Fallback to common categories if database fetch fails
      setCategories(['Philosophy', 'Theology', 'Mysticism', 'Science', 'Natural History', 'Spiritual']);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  return { 
    categories, 
    loading, 
    error,
    refresh: loadCategories 
  };
}

