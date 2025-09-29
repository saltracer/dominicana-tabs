import { Tabs } from 'expo-router';
import { useTheme } from '../../../components/ThemeProvider';
import { Colors } from '../../../constants/Colors';
import { getHiddenTabBarStyle } from '../../../utils/tabBarStyles';

export default function CommunityLayout() {
  const { colorScheme } = useTheme();
  
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: getHiddenTabBarStyle(), // Hide the tab bar
        tabBarButton: () => null, // Disable tab bar buttons
      }}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="calendar" />
      <Tabs.Screen name="saints" />
      <Tabs.Screen name="provinces" />
    </Tabs>
  );
}
