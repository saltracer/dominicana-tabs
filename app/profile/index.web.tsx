import { useEffect } from 'react';
import { router } from 'expo-router';

// Redirect to quick settings as the default profile page
export default function ProfileIndex() {
  useEffect(() => {
    router.replace('/profile/quick');
  }, []);

  return null;
}

