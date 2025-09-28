import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ReadingProgress, ReadingProgressUpdate, ReadingProgressStats } from '../types/ReadingProgress';
import { ReadingProgressService } from '../services/ReadingProgressService';
import { useAuth } from './AuthContext';

interface ReadingProgressContextType {
  // State
  progress: ReadingProgress[];
  stats: ReadingProgressStats | null;
  loading: boolean;
  error: string | null;
  
  // Actions
  saveProgress: (progress: ReadingProgressUpdate) => Promise<void>;
  getBookProgress: (bookId: string) => Promise<ReadingProgress | null>;
  deleteProgress: (bookId: string) => Promise<void>;
  refreshProgress: () => Promise<void>;
  refreshStats: () => Promise<void>;
  
  // Utility
  getBookProgressPercentage: (bookId: string) => number;
  isBookInProgress: (bookId: string) => boolean;
}

const ReadingProgressContext = createContext<ReadingProgressContextType | undefined>(undefined);

export function ReadingProgressProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [progress, setProgress] = useState<ReadingProgress[]>([]);
  const [stats, setStats] = useState<ReadingProgressStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load user's reading progress when user changes
  useEffect(() => {
    if (user) {
      refreshProgress();
      refreshStats();
    } else {
      setProgress([]);
      setStats(null);
    }
  }, [user]);

  const saveProgress = async (progressUpdate: ReadingProgressUpdate) => {
    if (!user) {
      throw new Error('User must be authenticated to save reading progress');
    }

    try {
      setLoading(true);
      setError(null);
      
      const savedProgress = await ReadingProgressService.saveProgress(user.id, progressUpdate);
      
      // Update local state
      setProgress(prev => {
        const existingIndex = prev.findIndex(p => p.book_id === progressUpdate.book_id);
        if (existingIndex >= 0) {
          const updated = [...prev];
          updated[existingIndex] = savedProgress;
          return updated;
        } else {
          return [...prev, savedProgress];
        }
      });
      
      // Refresh stats
      await refreshStats();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save reading progress';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getBookProgress = async (bookId: string): Promise<ReadingProgress | null> => {
    if (!user) {
      return null;
    }

    try {
      return await ReadingProgressService.getBookProgress(user.id, bookId);
    } catch (err) {
      console.error('Error getting book progress:', err);
      return null;
    }
  };

  const deleteProgress = async (bookId: string) => {
    if (!user) {
      throw new Error('User must be authenticated to delete reading progress');
    }

    try {
      setLoading(true);
      setError(null);
      
      await ReadingProgressService.deleteProgress(user.id, bookId);
      
      // Update local state
      setProgress(prev => prev.filter(p => p.book_id !== bookId));
      
      // Refresh stats
      await refreshStats();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete reading progress';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const refreshProgress = async () => {
    if (!user) {
      console.log('📚 ReadingProgressContext: No user, clearing progress');
      setProgress([]);
      return;
    }

    try {
      console.log('📚 ReadingProgressContext: Loading progress for user:', user.id);
      setLoading(true);
      setError(null);
      
      const userProgress = await ReadingProgressService.getUserProgress(user.id);
      console.log('📚 ReadingProgressContext: Loaded progress:', userProgress);
      setProgress(userProgress);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load reading progress';
      setError(errorMessage);
      console.error('Error refreshing progress:', err);
    } finally {
      setLoading(false);
    }
  };

  const refreshStats = async () => {
    if (!user) {
      setStats(null);
      return;
    }

    try {
      const userStats = await ReadingProgressService.getUserStats(user.id);
      setStats(userStats);
    } catch (err) {
      console.error('Error refreshing stats:', err);
    }
  };

  const getBookProgressPercentage = (bookId: string): number => {
    const bookProgress = progress.find(p => p.book_id === bookId);
    return bookProgress?.progress_percentage || 0;
  };

  const isBookInProgress = (bookId: string): boolean => {
    const bookProgress = progress.find(p => p.book_id === bookId);
    return bookProgress !== undefined && bookProgress.progress_percentage > 0;
  };

  const value: ReadingProgressContextType = {
    progress,
    stats,
    loading,
    error,
    saveProgress,
    getBookProgress,
    deleteProgress,
    refreshProgress,
    refreshStats,
    getBookProgressPercentage,
    isBookInProgress,
  };

  return (
    <ReadingProgressContext.Provider value={value}>
      {children}
    </ReadingProgressContext.Provider>
  );
}

export function useReadingProgress() {
  const context = useContext(ReadingProgressContext);
  if (context === undefined) {
    throw new Error('useReadingProgress must be used within a ReadingProgressProvider');
  }
  return context;
}
