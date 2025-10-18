/**
 * Blogs Placeholder Page - Native
 * Redirects to main preaching page on native
 */

import { Redirect } from 'expo-router';

export default function BlogsScreen() {
  // Redirect to main preaching page on native
  return <Redirect href="/(tabs)/preaching" />;
}

