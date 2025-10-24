import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

interface ProfilePanelContextType {
  isPanelOpen: boolean;
  activeCategory: string;
  openPanel: (category?: string) => void;
  closePanel: () => void;
  setActiveCategory: (category: string) => void;
}

const ProfilePanelContext = createContext<ProfilePanelContextType | undefined>(undefined);

interface ProfilePanelProviderProps {
  children: ReactNode;
}

const STORAGE_KEY = '@profile_panel_last_category';

export function ProfilePanelProvider({ children }: ProfilePanelProviderProps) {
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState('quick');

  // Load last visited category from storage
  useEffect(() => {
    const loadLastCategory = async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) {
          setActiveCategory(stored);
        }
      } catch (error) {
        console.warn('Failed to load last profile category:', error);
      }
    };

    loadLastCategory();
  }, []);

  // Save category to storage when it changes
  useEffect(() => {
    const saveCategory = async () => {
      try {
        await AsyncStorage.setItem(STORAGE_KEY, activeCategory);
      } catch (error) {
        console.warn('Failed to save profile category:', error);
      }
    };

    if (activeCategory !== 'quick') {
      saveCategory();
    }
  }, [activeCategory]);

  const openPanel = (category?: string) => {
    if (category) {
      setActiveCategory(category);
    }
    setIsPanelOpen(true);
  };

  const closePanel = () => {
    setIsPanelOpen(false);
  };

  const handleSetActiveCategory = (category: string) => {
    setActiveCategory(category);
  };

  // Handle keyboard shortcuts (web only)
  useEffect(() => {
    if (Platform.OS !== 'web') return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Cmd/Ctrl + , to open settings
      if ((event.metaKey || event.ctrlKey) && event.key === ',') {
        event.preventDefault();
        openPanel();
      }
      
      // ESC to close
      if (event.key === 'Escape' && isPanelOpen) {
        event.preventDefault();
        closePanel();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isPanelOpen]);

  const value: ProfilePanelContextType = {
    isPanelOpen,
    activeCategory,
    openPanel,
    closePanel,
    setActiveCategory: handleSetActiveCategory,
  };

  return (
    <ProfilePanelContext.Provider value={value}>
      {children}
    </ProfilePanelContext.Provider>
  );
}

export function useProfilePanel() {
  const context = useContext(ProfilePanelContext);
  if (context === undefined) {
    throw new Error('useProfilePanel must be used within a ProfilePanelProvider');
  }
  return context;
}
