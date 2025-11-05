import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User, AuthError } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';
import { User as AppUser, UserPreferences, Subscription } from '../types';
import { UserLiturgyPreferencesService } from '../services/UserLiturgyPreferencesService';
import { clearAllCaches } from '../hooks/useCacheInitialization';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: AppUser | null;
  loading: boolean;
  profileLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signUp: (email: string, password: string, name: string) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<AppUser>) => Promise<{ error: any }>;
  refreshProfile: () => Promise<void>;
  clearAllAuthData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileFetchTimeout, setProfileFetchTimeout] = useState<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          fetchProfileWithDebounce(session.user.id);
        } else {
          setLoading(false);
          setProfileLoading(false);
        }
      })
      .catch((error) => {
        // Handle invalid/expired refresh tokens gracefully
        console.log('AuthContext: Error getting session (treating as signed out):', error.message);
        setSession(null);
        setUser(null);
        setProfile(null);
        setLoading(false);
        setProfileLoading(false);
      });

    // Safety timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      setLoading(false);
    }, 10000); // 10 second timeout

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('AuthContext: Auth state change', { event, session: !!session, user: !!session?.user });
      
      // Handle signOut event specifically
      if (event === 'SIGNED_OUT') {
        console.log('AuthContext: SIGNED_OUT event received');
        // Clear any pending profile fetch
        if (profileFetchTimeout) {
          clearTimeout(profileFetchTimeout);
          setProfileFetchTimeout(null);
        }
        setSession(null);
        setUser(null);
        setProfile(null);
        setLoading(false);
        setProfileLoading(false);
        return;
      }
      
      // Handle different auth events appropriately
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Only fetch profile for SIGNED_IN events, not TOKEN_REFRESHED
          if (event === 'SIGNED_IN') {
            await fetchProfileWithDebounce(session.user.id);
          }
        } else {
          setProfile(null);
          setLoading(false);
          setProfileLoading(false);
        }
      } else {
        // For other events, just update session/user without fetching profile
        setSession(session);
        setUser(session?.user ?? null);
        if (!session?.user) {
          setProfile(null);
          setLoading(false);
          setProfileLoading(false);
        }
      }
    });

    return () => {
      clearTimeout(timeout);
      subscription.unsubscribe();
    };
  }, []);

  const fetchProfileWithDebounce = async (userId: string) => {
    // Clear any existing timeout
    if (profileFetchTimeout) {
      clearTimeout(profileFetchTimeout);
    }

    // Set a timeout to debounce multiple rapid calls
    const timeout = setTimeout(async () => {
      await fetchProfile(userId);
      setProfileFetchTimeout(null);
    }, 100); // 100ms debounce

    setProfileFetchTimeout(timeout);
  };

  const fetchProfile = async (userId: string, retryCount = 0) => {
    if (profileLoading) {
      console.log('AuthContext: Profile fetch already in progress, skipping...');
      return;
    }

    setProfileLoading(true);
    
    try {
      console.log('AuthContext: Fetching profile for user:', userId);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        // If profile doesn't exist, create one
        if (error.code === 'PGRST116') {
          await createProfile(userId);
        } else if (retryCount < 2) {
          // Retry on other errors up to 2 times
          console.log(`AuthContext: Retrying profile fetch (attempt ${retryCount + 1}/3)`);
          setTimeout(() => {
            fetchProfile(userId, retryCount + 1);
          }, 1000 * (retryCount + 1)); // Exponential backoff
          return;
        } else {
          console.error('AuthContext: Profile fetch failed after retries');
        }
      } else {
        console.log('AuthContext: Profile fetched successfully');
        setProfile(data as AppUser);
      }
    } catch (error) {
      console.error('Error in fetchProfile:', error);
      if (retryCount < 2) {
        // Retry on network errors
        console.log(`AuthContext: Retrying profile fetch due to error (attempt ${retryCount + 1}/3)`);
        setTimeout(() => {
          fetchProfile(userId, retryCount + 1);
        }, 1000 * (retryCount + 1));
        return;
      }
    } finally {
      setProfileLoading(false);
      setLoading(false);
    }
  };

  const createProfile = async (userId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const defaultProfile: AppUser = {
        id: userId,
        email: user.email || '',
        name: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
        role: 'user',
        preferences: {
          theme: 'auto',
          language: 'en',
          notifications: {
            enabled: true,
            prayerReminders: true,
            feastDayAlerts: true,
            dailyReadings: false,
            communityUpdates: false,
          },
          liturgicalCalendar: {
            showDominicanFeasts: true,
            showUniversalFeasts: true,
            preferredRite: 'dominican',
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          },
          prayerReminders: [],
        },
        subscription: {
          type: 'free',
          status: 'active',
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year from now
          features: ['basic_prayer', 'liturgical_calendar'],
        },
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('profiles')
        .insert(defaultProfile)
        .select()
        .single();

      if (error) {
        console.error('Error creating profile:', error);
      } else {
        setProfile(data as AppUser);
      }
    } catch (error) {
      console.error('Error in createProfile:', error);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signUp = async (email: string, password: string, name: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
        },
      },
    });
    return { error };
  };

  const signOut = async () => {
    try {
      console.log('AuthContext: Starting signOut...', { user: !!user, session: !!session, profile: !!profile });
      
      // Sign out from Supabase first (this clears the stored session)
      console.log('AuthContext: Calling supabase.auth.signOut()...');
      console.log('AuthContext: Supabase client info:', {
        hasSession: !!session,
        clientType: typeof supabase,
        hasAuth: !!supabase.auth
      });
      
      // Add timeout to prevent hanging
      const signOutPromise = supabase.auth.signOut();
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('SignOut timeout after 3 seconds')), 3000)
      );
      
      let signOutError = null;
      let signOutCompleted = false;
      
      try {
        const result = await Promise.race([signOutPromise, timeoutPromise]) as any;
        console.log('AuthContext: supabase.auth.signOut() completed', { error: !!result?.error });
        signOutError = result?.error;
        signOutCompleted = true;
      } catch (timeoutError) {
        console.error('AuthContext: SignOut timed out:', timeoutError);
        // Continue with local cleanup even if Supabase signOut times out
        console.log('AuthContext: Continuing with local cleanup despite timeout');
        signOutCompleted = false;
      }
      
      if (signOutError) {
        console.error('Sign out error:', signOutError);
        throw signOutError;
      }
      
      if (signOutCompleted) {
        console.log('AuthContext: Supabase signOut successful');
      } else {
        console.log('AuthContext: Supabase signOut timed out, but continuing with local cleanup');
      }
      
      // Clear cached preferences
      try {
        await UserLiturgyPreferencesService.clearAllCachedPreferences();
        console.log('AuthContext: Cached preferences cleared');
      } catch (prefError) {
        console.error('AuthContext: Error clearing preferences:', prefError);
      }
      
      // Clear episode/download caches
      try {
        clearAllCaches();
        console.log('AuthContext: Episode caches cleared');
      } catch (cacheError) {
        console.error('AuthContext: Error clearing caches:', cacheError);
      }

      // Explicitly clear AsyncStorage to ensure session is completely removed
      try {
        // Get all keys and remove any that start with 'sb-' (Supabase keys)
        const keys = await AsyncStorage.getAllKeys();
        const supabaseKeys = keys.filter(key => key.startsWith('sb-'));
        console.log('AuthContext: Found Supabase keys to clear:', supabaseKeys);
        if (supabaseKeys.length > 0) {
          await AsyncStorage.multiRemove(supabaseKeys);
        }
        console.log('AuthContext: AsyncStorage cleared');
      } catch (storageError) {
        console.warn('Error clearing AsyncStorage:', storageError);
      }
      
      // Then clear local state
      console.log('AuthContext: Clearing local state...');
      setUser(null);
      setSession(null);
      setProfile(null);
      setLoading(false);
      console.log('AuthContext: Local state cleared');
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  };

  const updateProfile = async (updates: Partial<AppUser>) => {
    if (!user) return { error: { message: 'No user logged in' } as AuthError };

    const { error } = await supabase
      .from('profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    if (!error) {
      setProfile(prev => prev ? { ...prev, ...updates } : null);
    }

    return { error };
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfileWithDebounce(user.id);
    }
  };

  const clearAllAuthData = async () => {
    try {
      // Clear cached preferences first
      await UserLiturgyPreferencesService.clearAllCachedPreferences();
      
      // Clear all AsyncStorage keys
      await AsyncStorage.clear();
      // Clear local state
      setUser(null);
      setSession(null);
      setProfile(null);
      setLoading(false);
    } catch (error) {
      console.error('Error clearing all auth data:', error);
    }
  };

  const value: AuthContextType = {
    user,
    session,
    profile,
    loading,
    profileLoading,
    signIn,
    signUp,
    signOut,
    updateProfile,
    refreshProfile,
    clearAllAuthData,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
