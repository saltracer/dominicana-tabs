import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
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
import Footer from '../../../../components/Footer.web';

export default function SextScreen() {
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
    <SwipeNavigationWrapper currentHour="sext">
      <SafeAreaView style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]} edges={['left', 'right', 'top', 'bottom']}>
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
              Sext
            </Text>
            <Text style={[styles.subtitle, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
              Midday Prayer • {liturgicalDay.season.name}
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


        {/* Opening */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons 
              name="sunny" 
              size={24} 
              color={Colors[colorScheme ?? 'light'].primary} 
            />
            <Text style={[styles.sectionTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
              Opening
            </Text>
          </View>
          
          <View style={[styles.contentCard, { backgroundColor: Colors[colorScheme ?? 'light'].card }]}>
            <Text style={[styles.contentBody, { color: Colors[colorScheme ?? 'light'].text }]}>
              O God, come to my assistance.
            </Text>
            <Text style={[styles.contentBody, { color: Colors[colorScheme ?? 'light'].text }]}>
              O Lord, make haste to help me.
            </Text>
            <Text style={[styles.contentBody, { color: Colors[colorScheme ?? 'light'].text }]}>
              Glory to the Father, and to the Son, and to the Holy Spirit, as it was in the beginning, 
              is now, and will be for ever. Amen.
            </Text>
          </View>
        </View>

        {/* Hymn */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons 
              name="musical-notes-outline" 
              size={24} 
              color={Colors[colorScheme ?? 'light'].primary} 
            />
            <Text style={[styles.sectionTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
              Hymn
            </Text>
          </View>
          
          <View style={[styles.contentCard, { backgroundColor: Colors[colorScheme ?? 'light'].card }]}>
            <Text style={[styles.contentTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
              Midday Hymn
            </Text>
            <Text style={[styles.contentBody, { color: Colors[colorScheme ?? 'light'].text }]}>
              "O God of truth, O Lord of might, who orders time and change aright, 
              and sends the morning rays of light, and eases with the rest of night."
            </Text>
            <Text style={[styles.contentBody, { color: Colors[colorScheme ?? 'light'].text }]}>
              "That light may give the weary rest, and shake the sleep from every breast, 
              shout we with keeping voice aloud, and tell the praises of our God."
            </Text>
          </View>
        </View>

        {/* Psalm */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons 
              name="book-outline" 
              size={24} 
              color={Colors[colorScheme ?? 'light'].primary} 
            />
            <Text style={[styles.sectionTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
              Psalm
            </Text>
          </View>
          
          <View style={[styles.contentCard, { backgroundColor: Colors[colorScheme ?? 'light'].card }]}>
            <Text style={[styles.contentTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
              Psalm 121: I lift up my eyes to the mountains
            </Text>
            <Text style={[styles.antiphon, { color: Colors[colorScheme ?? 'light'].primary }]}>
              Antiphon: My help comes from the Lord, who made heaven and earth.
            </Text>
            <Text style={[styles.contentBody, { color: Colors[colorScheme ?? 'light'].text }]}>
              I lift up my eyes to the mountains—where does my help come from? 
              My help comes from the Lord, the Maker of heaven and earth.
            </Text>
            <Text style={[styles.contentBody, { color: Colors[colorScheme ?? 'light'].text }]}>
              He will not let your foot slip—he who watches over you will not slumber; 
              indeed, he who watches over Israel will neither slumber nor sleep.
            </Text>
            <Text style={[styles.antiphon, { color: Colors[colorScheme ?? 'light'].primary }]}>
              Antiphon: My help comes from the Lord, who made heaven and earth.
            </Text>
          </View>
        </View>

        {/* Reading */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons 
              name="library-outline" 
              size={24} 
              color={Colors[colorScheme ?? 'light'].primary} 
            />
            <Text style={[styles.sectionTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
              Short Reading
            </Text>
          </View>
          
          <View style={[styles.contentCard, { backgroundColor: Colors[colorScheme ?? 'light'].card }]}>
            <Text style={[styles.contentText, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
              From the First Letter of John
            </Text>
            <Text style={[styles.contentBody, { color: Colors[colorScheme ?? 'light'].text }]}>
              "This is the message we have heard from him and declare to you: God is light; 
              in him there is no darkness at all. If we claim to have fellowship with him 
              and yet walk in the darkness, we lie and do not live out the truth."
            </Text>
          </View>
        </View>

        {/* Responsory */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons 
              name="repeat-outline" 
              size={24} 
              color={Colors[colorScheme ?? 'light'].primary} 
            />
            <Text style={[styles.sectionTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
              Responsory
            </Text>
          </View>
          
          <View style={[styles.contentCard, { backgroundColor: Colors[colorScheme ?? 'light'].card }]}>
            <Text style={[styles.contentBody, { color: Colors[colorScheme ?? 'light'].text }]}>
              ℟. The Lord is my light and my salvation.
            </Text>
            <Text style={[styles.contentBody, { color: Colors[colorScheme ?? 'light'].text }]}>
              ℣. Whom shall I fear? The Lord is the stronghold of my life.
            </Text>
            <Text style={[styles.contentBody, { color: Colors[colorScheme ?? 'light'].text }]}>
              ℟. Glory to the Father, and to the Son, and to the Holy Spirit.
            </Text>
          </View>
        </View>

        {/* Concluding Prayer */}
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
              Lord God, at midday you sent your Holy Spirit upon the apostles as they prayed. 
              Fill us with that same Spirit, that we may bear witness to your truth and 
              serve you with faithful hearts. Through our Lord Jesus Christ, your Son, 
              who lives and reigns with you in the unity of the Holy Spirit, 
              one God, for ever and ever.
            </Text>
            <Text style={[styles.amen, { color: Colors[colorScheme ?? 'light'].primary }]}>
              Amen.
            </Text>
          </View>
        </View>

        {/* Prayer Navigation Buttons */}
        <PrayerNavButtons currentHour="sext" />

        {/* Footer - Web only */}
        {Platform.OS === 'web' && <Footer />}
      </ScrollView>
      
      {/* Prayer Hour Picker Modal */}
      <PrayerHourPickerModal
        visible={showQuickPicker}
        onClose={() => setShowQuickPicker(false)}
        currentHour="sext"
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
