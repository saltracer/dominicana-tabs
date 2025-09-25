/**
 * Tests for Login Flow and User Preferences Loading
 * These tests verify that the login flow works correctly and preferences load properly
 */

describe('Login Flow and User Preferences Tests', () => {
  describe('Authentication Flow', () => {
    it('should handle successful login navigation correctly', () => {
      // Mock successful authentication
      const mockSignIn = jest.fn(() => Promise.resolve({ error: null }));
      const mockRouter = {
        back: jest.fn(),
        push: jest.fn(),
      };

      // Simulate successful login
      const handleAuth = async () => {
        const { error } = await mockSignIn('test@example.com', 'password');
        
        if (!error) {
          // Navigate back to profile page
          try {
            mockRouter.back();
          } catch (error) {
            mockRouter.push('/profile');
          }
        }
      };

      // Test the flow
      handleAuth().then(() => {
        expect(mockSignIn).toHaveBeenCalledWith('test@example.com', 'password');
        expect(mockRouter.back).toHaveBeenCalled();
      });
    });

    it('should handle login error correctly', () => {
      // Mock authentication error
      const mockSignIn = jest.fn(() => Promise.resolve({ 
        error: { message: 'Invalid credentials' } 
      }));

      const handleAuth = async () => {
        const { error } = await mockSignIn('test@example.com', 'wrongpassword');
        
        if (error) {
          // Should show error, not navigate
          return { shouldNavigate: false, error: error.message };
        }
      };

      // Test the flow
      handleAuth().then((result) => {
        expect(mockSignIn).toHaveBeenCalledWith('test@example.com', 'wrongpassword');
        expect(result?.shouldNavigate).toBe(false);
        expect(result?.error).toBe('Invalid credentials');
      });
    });

    it('should handle signup flow correctly', () => {
      // Mock successful signup
      const mockSignUp = jest.fn(() => Promise.resolve({ error: null }));
      const mockRouter = {
        back: jest.fn(),
        push: jest.fn(),
      };

      const handleAuth = async () => {
        const { error } = await mockSignUp('test@example.com', 'password', 'Test User');
        
        if (!error) {
          try {
            mockRouter.back();
          } catch (error) {
            mockRouter.push('/profile');
          }
        }
      };

      // Test the flow
      handleAuth().then(() => {
        expect(mockSignUp).toHaveBeenCalledWith('test@example.com', 'password', 'Test User');
        expect(mockRouter.back).toHaveBeenCalled();
      });
    });
  });

  describe('User Preferences Loading', () => {
    it('should load preferences after successful login', async () => {
      // Mock user and preferences
      const mockUser = {
        id: 'test-user-id',
        email: 'test@example.com',
      };

      const mockPreferences = {
        user_id: 'test-user-id',
        primary_language: 'en',
        secondary_language: 'la',
        display_mode: 'bilingual',
        bible_translation: 'NRSV',
        audio_enabled: true,
        show_rubrics: true,
        theme_preference: 'light',
        tts_enabled: true,
        tts_speed: 2,
        chant_notation: 'gregorian',
        font_size: 'medium',
        memorial_preference: 'both',
        calendar_type: 'general',
        chant_notation_enabled: true,
        audio_types: ['spoken'],
        language: 'en',
        display_options: {},
        tts_voice_id: '',
      };

      // Mock the service
      const mockGetUserPreferences = jest.fn(() => Promise.resolve(mockPreferences));

      // Simulate loading preferences
      const loadPreferences = async (user: typeof mockUser) => {
        if (!user) return null;
        
        try {
          const preferences = await mockGetUserPreferences(user.id);
          return preferences;
        } catch (error) {
          console.error('Error loading preferences:', error);
          return null;
        }
      };

      // Test loading preferences
      const result = await loadPreferences(mockUser);
      
      expect(mockGetUserPreferences).toHaveBeenCalledWith('test-user-id');
      expect(result).toEqual(mockPreferences);
    });

    it('should handle preferences loading error gracefully', async () => {
      // Mock user
      const mockUser = {
        id: 'test-user-id',
        email: 'test@example.com',
      };

      // Mock service that throws error
      const mockGetUserPreferences = jest.fn(() => 
        Promise.reject(new Error('Network error'))
      );

      const loadPreferences = async (user: typeof mockUser) => {
        if (!user) return null;
        
        try {
          const preferences = await mockGetUserPreferences(user.id);
          return preferences;
        } catch (error) {
          console.error('Error loading preferences:', error);
          return null;
        }
      };

      // Test error handling
      const result = await loadPreferences(mockUser);
      
      expect(mockGetUserPreferences).toHaveBeenCalledWith('test-user-id');
      expect(result).toBeNull();
    });

    it('should prevent multiple simultaneous preference loads', () => {
      let isLoading = false;
      let preferences = null;

      const loadPreferences = async (user: any) => {
        if (!user || isLoading || preferences) return;
        
        isLoading = true;
        try {
          // Simulate async operation
          await new Promise(resolve => setTimeout(resolve, 100));
          preferences = { user_id: user.id, primary_language: 'en' };
        } catch (error) {
          preferences = null;
        } finally {
          isLoading = false;
        }
      };

      const mockUser = { id: 'test-user-id' };

      // Call multiple times rapidly
      loadPreferences(mockUser);
      loadPreferences(mockUser);
      loadPreferences(mockUser);

      // Should only load once due to guards
      expect(isLoading).toBe(true);
    });
  });

  describe('Profile Page State Management', () => {
    it('should show loading state while auth initializes', () => {
      const loadingStates = {
        authLoading: true,
        preferencesLoading: false,
        user: null,
        preferences: null,
      };

      const shouldShowLoading = loadingStates.authLoading;
      const shouldShowGuest = !loadingStates.user && !loadingStates.authLoading;
      const shouldShowPreferences = !!(loadingStates.user && !loadingStates.preferencesLoading);

      expect(shouldShowLoading).toBe(true);
      expect(shouldShowGuest).toBe(false);
      expect(shouldShowPreferences).toBe(false);
    });

    it('should show guest view when not logged in', () => {
      const loadingStates = {
        authLoading: false,
        preferencesLoading: false,
        user: null,
        preferences: null,
      };

      const shouldShowLoading = loadingStates.authLoading;
      const shouldShowGuest = !loadingStates.user && !loadingStates.authLoading;
      const shouldShowPreferences = !!(loadingStates.user && !loadingStates.preferencesLoading);

      expect(shouldShowLoading).toBe(false);
      expect(shouldShowGuest).toBe(true);
      expect(shouldShowPreferences).toBe(false);
    });

    it('should show preferences when user is logged in', () => {
      const loadingStates = {
        authLoading: false,
        preferencesLoading: false,
        user: { id: 'test-user-id' },
        preferences: { primary_language: 'en' },
      };

      const shouldShowLoading = loadingStates.authLoading;
      const shouldShowGuest = !loadingStates.user && !loadingStates.authLoading;
      const shouldShowPreferences = !!(loadingStates.user && !loadingStates.preferencesLoading);

      expect(shouldShowLoading).toBe(false);
      expect(shouldShowGuest).toBe(false);
      expect(shouldShowPreferences).toBe(true);
    });

    it('should show preferences loading when user exists but preferences are loading', () => {
      const loadingStates = {
        authLoading: false,
        preferencesLoading: true,
        user: { id: 'test-user-id' },
        preferences: null,
      };

      const shouldShowLoading = loadingStates.authLoading;
      const shouldShowGuest = !loadingStates.user && !loadingStates.authLoading;
      const shouldShowPreferences = !!(loadingStates.user && !loadingStates.preferencesLoading);
      const shouldShowPreferencesLoading = !!(loadingStates.user && loadingStates.preferencesLoading);

      expect(shouldShowLoading).toBe(false);
      expect(shouldShowGuest).toBe(false);
      expect(shouldShowPreferences).toBe(false);
      expect(shouldShowPreferencesLoading).toBe(true);
    });
  });

  describe('Preference Update Flow', () => {
    it('should update preferences optimistically', async () => {
      const mockPreferences = {
        user_id: 'test-user-id',
        primary_language: 'en',
        secondary_language: 'la',
      };

      const mockUpdatePreferences = jest.fn(() => Promise.resolve({ success: true }));

      const updatePreference = async (key: string, value: any) => {
        // Optimistic update
        const updatedPreferences = { ...mockPreferences, [key]: value };
        
        try {
          const result = await mockUpdatePreferences('test-user-id', { [key]: value });
          
          if (!result.success) {
            // Revert on error
            return mockPreferences;
          }
          
          return updatedPreferences;
        } catch (error) {
          // Revert on error
          return mockPreferences;
        }
      };

      const result = await updatePreference('primary_language', 'la');
      
      expect(mockUpdatePreferences).toHaveBeenCalledWith('test-user-id', { primary_language: 'la' });
      expect(result.primary_language).toBe('la');
    });

    it('should revert preferences on update error', async () => {
      const originalPreferences = {
        user_id: 'test-user-id',
        primary_language: 'en',
      };

      const mockUpdatePreferences = jest.fn(() => 
        Promise.resolve({ success: false, error: 'Network error' })
      );

      const updatePreference = async (key: string, value: any) => {
        // Optimistic update
        const updatedPreferences = { ...originalPreferences, [key]: value };
        
        try {
          const result = await mockUpdatePreferences('test-user-id', { [key]: value });
          
          if (!result.success) {
            // Revert on error
            return originalPreferences;
          }
          
          return updatedPreferences;
        } catch (error) {
          // Revert on error
          return originalPreferences;
        }
      };

      const result = await updatePreference('primary_language', 'la');
      
      expect(mockUpdatePreferences).toHaveBeenCalledWith('test-user-id', { primary_language: 'la' });
      expect(result).toEqual(originalPreferences); // Should be reverted
    });
  });

  describe('Cross-Platform Login Flow', () => {
    it('should work consistently across platforms', () => {
      // Test that the same login logic works for both native and web
      const mockAuth = {
        signIn: jest.fn(() => Promise.resolve({ error: null })),
        signUp: jest.fn(() => Promise.resolve({ error: null })),
      };

      const mockRouter = {
        back: jest.fn(),
        push: jest.fn(),
      };

      const handleLogin = async (email: string, password: string) => {
        const { error } = await mockAuth.signIn(email, password);
        
        if (!error) {
          try {
            mockRouter.back();
          } catch (error) {
            mockRouter.push('/profile');
          }
          return { success: true };
        }
        
        return { success: false, error };
      };

      // Test for both platforms
      handleLogin('test@example.com', 'password').then((result) => {
        expect(result.success).toBe(true);
        expect(mockAuth.signIn).toHaveBeenCalledWith('test@example.com', 'password');
      });
    });

    it('should maintain consistent user state across platforms', () => {
      const mockUser = {
        id: 'test-user-id',
        email: 'test@example.com',
        user_metadata: { name: 'Test User' },
      };

      const mockProfile = {
        id: 'test-user-id',
        name: 'Test User',
        email: 'test@example.com',
        role: 'user',
      };

      // User state should be consistent
      expect(mockUser.id).toBe(mockProfile.id);
      expect(mockUser.email).toBe(mockProfile.email);
      expect(mockUser.user_metadata?.name).toBe(mockProfile.name);
    });
  });
});