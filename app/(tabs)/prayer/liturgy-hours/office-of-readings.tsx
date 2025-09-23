import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Colors } from '../../../../constants/Colors';
import { useTheme } from '../../../../components/ThemeProvider';
import { useCalendar } from '../../../../components/CalendarContext';
import FeastBanner from '../../../../components/FeastBanner';
import PrayerNavigation from '../../../../components/PrayerNavigation';
import PrayerNavButtons from '../../../../components/PrayerNavButtons';
import SwipeNavigationWrapper from '../../../../components/SwipeNavigationWrapper';
import PrayerHourPickerModal from '../../../../components/PrayerHourPickerModal';
import { LiturgicalDay, HourType } from '../../../../types';
import { PrayerStyles, LiturgyStyles } from '../../../../styles';

export default function OfficeOfReadingsScreen() {
  const { colorScheme } = useTheme();
  const { liturgicalDay } = useCalendar();
  const [showQuickPicker, setShowQuickPicker] = useState(false);

  if (!liturgicalDay) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: Colors[colorScheme ?? 'light'].text }]}>
            Loading liturgical information...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SwipeNavigationWrapper currentHour="office_of_readings">
      <SafeAreaView style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]} edges={['left', 'right']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Clean Header */}
        <View style={styles.cleanHeader}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.push('/(tabs)/prayer')}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color={Colors[colorScheme ?? 'light'].text} />
          </TouchableOpacity>
          <View style={styles.headerContent}>
            <Text style={[styles.title, { color: Colors[colorScheme ?? 'light'].text }]}>
              Office of Readings
            </Text>
            <Text style={[styles.subtitle, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
              Any Time • {liturgicalDay.season.name}
            </Text>
          </View>
          <TouchableOpacity 
            style={[styles.quickPickerButton, { /* backgroundColor: Colors[colorScheme ?? 'light'].card */ }]}
            onPress={() => setShowQuickPicker(true)}
            activeOpacity={0.7}
          >
            <Ionicons name="list" size={16} color={Colors[colorScheme ?? 'light'].primary} />
          </TouchableOpacity>
        </View>


        {/* Liturgical Information */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons 
              name="book-outline" 
              size={24} 
              color={Colors[colorScheme ?? 'light'].primary} 
            />
            <Text style={[styles.sectionTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
              Today's Readings
            </Text>
          </View>
          
          <View style={[styles.contentCard, { backgroundColor: Colors[colorScheme ?? 'light'].card }]}>
            <Text style={[styles.contentTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
              First Reading
            </Text>
            <Text style={[styles.contentText, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
              From the Book of Genesis
            </Text>
            <Text style={[styles.contentBody, { color: Colors[colorScheme ?? 'light'].text }]}>
              "In the beginning was the Word, and the Word was with God, and the Word was God. 
              He was in the beginning with God. All things came to be through him, and without him 
              nothing came to be. What came to be through him was life, and this life was the light 
              of the human race; the light shines in the darkness, and the darkness has not overcome it."
            </Text>
          </View>

          <View style={[styles.contentCard, { backgroundColor: Colors[colorScheme ?? 'light'].card }]}>
            <Text style={[styles.contentTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
              Responsory
            </Text>
            <Text style={[styles.contentBody, { color: Colors[colorScheme ?? 'light'].text }]}>
              ℟. The Word became flesh and dwelt among us, and we have seen his glory.
            </Text>
            <Text style={[styles.contentBody, { color: Colors[colorScheme ?? 'light'].text }]}>
              ℣. Full of grace and truth, he came from the Father.
            </Text>
            <Text style={[styles.contentBody, { color: Colors[colorScheme ?? 'light'].text }]}>
              ℟. Glory to the Father, and to the Son, and to the Holy Spirit.
            </Text>
          </View>

          <View style={[styles.contentCard, { backgroundColor: Colors[colorScheme ?? 'light'].card }]}>
            <Text style={[styles.contentTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
              Second Reading
            </Text>
            <Text style={[styles.contentText, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
              From a sermon by Saint Augustine
            </Text>
            <Text style={[styles.contentBody, { color: Colors[colorScheme ?? 'light'].text }]}>
              "The Word of God, by whom all things were made, was made flesh and dwelt among us. 
              He was in the world, and the world was made through him, and the world knew him not. 
              He came unto his own, and his own received him not. But as many as received him, 
              to them gave he power to become the sons of God."
            </Text>
          </View>
        </View>

        {/* Prayer */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons 
              name="heart-outline" 
              size={24} 
              color={Colors[colorScheme ?? 'light'].primary} 
            />
            <Text style={[styles.sectionTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
              Concluding Prayer
            </Text>
          </View>
          
          <View style={[styles.contentCard, { backgroundColor: Colors[colorScheme ?? 'light'].card }]}>
            <Text style={[styles.contentBody, { color: Colors[colorScheme ?? 'light'].text }]}>
              Almighty and eternal God, you have revealed the mystery of your Word made flesh 
              through the light of a new star in the heavens. Grant that, as we have known him 
              on earth, we may also have the joy of seeing him in glory. Through our Lord Jesus 
              Christ, your Son, who lives and reigns with you in the unity of the Holy Spirit, 
              one God, for ever and ever.
            </Text>
            <Text style={[styles.amen, { color: Colors[colorScheme ?? 'light'].primary }]}>
              Amen.
            </Text>
          </View>
        </View>

        {/* Prayer Navigation Buttons */}
        <PrayerNavButtons currentHour="office_of_readings" />
      </ScrollView>
      
      {/* Prayer Hour Picker Modal */}
      <PrayerHourPickerModal
        visible={showQuickPicker}
        onClose={() => setShowQuickPicker(false)}
        currentHour="office_of_readings"
      />

      </SafeAreaView>
    </SwipeNavigationWrapper>
  );
}

const styles = StyleSheet.create({
  ...PrayerStyles,
  ...LiturgyStyles,
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
});
