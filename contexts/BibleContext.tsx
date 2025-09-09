/**
 * Bible Context
 * 
 * Provides Bible version state management across the app
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { multiVersionBibleService } from '../services/MultiVersionBibleService';
import { BibleVersion } from '../types/bible-version-types';

interface BibleContextType {
  currentVersion: string;
  availableVersions: BibleVersion[];
  setCurrentVersion: (versionId: string) => void;
  getCurrentVersionInfo: () => BibleVersion | null;
  loading: boolean;
  error: string | null;
}

const BibleContext = createContext<BibleContextType | undefined>(undefined);

interface BibleProviderProps {
  children: ReactNode;
}

export function BibleProvider({ children }: BibleProviderProps) {
  const [currentVersion, setCurrentVersionState] = useState<string>('douay-rheims');
  const [availableVersions, setAvailableVersions] = useState<BibleVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    initializeBibleService();
  }, []);

  const initializeBibleService = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get available versions
      const versions = multiVersionBibleService.getAvailableVersions();
      setAvailableVersions(versions);
      
      // Set default version
      const defaultVersion = versions.find(v => v.isDefault);
      if (defaultVersion) {
        setCurrentVersionState(defaultVersion.id);
        multiVersionBibleService.setCurrentVersion(defaultVersion.id);
      }
      
    } catch (err) {
      console.error('Error initializing Bible service:', err);
      setError(err instanceof Error ? err.message : 'Failed to initialize Bible service');
    } finally {
      setLoading(false);
    }
  };

  const setCurrentVersion = (versionId: string) => {
    try {
      multiVersionBibleService.setCurrentVersion(versionId);
      setCurrentVersionState(versionId);
      setError(null);
    } catch (err) {
      console.error('Error setting Bible version:', err);
      setError(err instanceof Error ? err.message : 'Failed to set Bible version');
    }
  };

  const getCurrentVersionInfo = (): BibleVersion | null => {
    return availableVersions.find(v => v.id === currentVersion) || null;
  };

  const value: BibleContextType = {
    currentVersion,
    availableVersions,
    setCurrentVersion,
    getCurrentVersionInfo,
    loading,
    error
  };

  return (
    <BibleContext.Provider value={value}>
      {children}
    </BibleContext.Provider>
  );
}

export function useBible() {
  const context = useContext(BibleContext);
  if (context === undefined) {
    throw new Error('useBible must be used within a BibleProvider');
  }
  return context;
}
