import { useEffect } from 'react';
import { router } from 'expo-router';

// Redirect to quick settings as the default
// Note: On native, app/profile.native.tsx takes precedence
// This is mainly a fallback for edge cases
export default function ProfileIndex() {
  useEffect(() => {
    router.replace('/profile/quick');
  }, []);

  return null;
}

