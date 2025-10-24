import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface ProfilePanelContextType {
  isPanelOpen: boolean;
  activeCategory: string;
  openPanel: (category?: string) => void;
  closePanel: () => void;
  setActiveCategory: (category: string) => void;
}

const ProfilePanelContext = createContext<ProfilePanelContextType | undefined>(undefined);

export const ProfilePanelProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState('quick');

  // Load last active category from storage
  useEffect(() => {
    const loadLastCategory = async () => {
      try {
        const lastCategory = await AsyncStorage.getItem('profilePanel_lastCategory');
        if (lastCategory) {
          setActiveCategory(lastCategory);
        }
      } catch (error) {
        console.error('Error loading last category:', error);
      }
    };
    loadLastCategory();
  }, []);

  // Save active category to storage
  const handleSetActiveCategory = async (category: string) => {
    setActiveCategory(category);
    try {
      await AsyncStorage.setItem('profilePanel_lastCategory', category);
    } catch (error) {
      console.error('Error saving last category:', error);
    }
  };

  const openPanel = (category?: string) => {
    if (category) {
      setActiveCategory(category);
    }
    setIsPanelOpen(true);
  };

  const closePanel = () => {
    setIsPanelOpen(false);
  };

  return (
    <ProfilePanelContext.Provider
      value={{
        isPanelOpen,
        activeCategory,
        openPanel,
        closePanel,
        setActiveCategory: handleSetActiveCategory,
      }}
    >
      {children}
    </ProfilePanelContext.Provider>
  );
};

export const useProfilePanel = () => {
  const context = useContext(ProfilePanelContext);
  if (context === undefined) {
    throw new Error('useProfilePanel must be used within a ProfilePanelProvider');
  }
  return context;
};
