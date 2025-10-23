import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Platform,
  Dimensions,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../../../constants/Colors';
import { useTheme } from '../../../components/ThemeProvider';
import { useCalendar } from '../../../components/CalendarContext';
import FeastBanner from '../../../components/FeastBanner';
import CommunityNavigation from '../../../components/CommunityNavigation';
import LiturgicalCalendarService from '../../../services/LiturgicalCalendar';
import { LiturgicalDay, Province } from '../../../types';
import { CommunityStyles } from '../../../styles';

// Import ProvincesMap - Metro will automatically choose the right platform-specific file
import ProvincesMap from '../../../components/ProvincesMap';

export default function ProvincesScreen() {
  const { colorScheme } = useTheme();
  const { liturgicalDay } = useCalendar();
  const insets = useSafeAreaInsets();
  const [selectedProvince, setSelectedProvince] = useState<Province | null>(null);



  const handleProvinceSelect = (province: Province) => {
    setSelectedProvince(province);
  };

  // Calculate dynamic margin for feast banner
  // Feast banner position is: bottom: 60 + Math.max(insets.bottom, 10)
  // Plus feast banner height (~75px) = total space needed
  const feastBannerMargin = 45 + Math.max(insets.bottom, 10) + 0; // 15px for feast banner content + padding

  if (!liturgicalDay) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
        <CommunityNavigation activeTab="provinces" />
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: Colors[colorScheme ?? 'light'].text }]}>
            Loading liturgical information...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]} edges={['left', 'right']}>
      <CommunityNavigation activeTab="provinces" />
      
      {/* Map takes full remaining space */}
      <View style={[styles.mapContainer, { marginBottom: feastBannerMargin }]}>
        <ProvincesMap onProvinceSelect={handleProvinceSelect} />
      </View>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // Include all shared styles
  ...CommunityStyles,
  
  // Dynamic margin is applied inline based on safe area insets
  mapContainer: {
    flex: 1,
  },
});
