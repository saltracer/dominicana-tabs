import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
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

export default function VespersScreen() {
  const { colorScheme } = useTheme();
  const { liturgicalDay } = useCalendar();
  const [showQuickPicker, setShowQuickPicker] = useState(false);

  if (!liturgicalDay) {
    return (
      <View style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: Colors[colorScheme ?? 'light'].text }]}>
            Loading liturgical information...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <SwipeNavigationWrapper currentHour="vespers">
      <ScrollView 
        style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}
        showsVerticalScrollIndicator={false} 
        contentContainerStyle={{ flexGrow: 1 }}
      >
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
              Vespers
            </Text>
            <Text style={[styles.subtitle, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
              Evening Prayer • {liturgicalDay.season.name}
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
              name="moon-outline" 
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
              Evening Hymn
            </Text>
            <Text style={[styles.contentBody, { color: Colors[colorScheme ?? 'light'].text }]}>
              "O radiant Light, O Sun divine, of God the Father's deathless face, 
              O image of the light sublime that fills the heavenly dwelling place."
            </Text>
            <Text style={[styles.contentBody, { color: Colors[colorScheme ?? 'light'].text }]}>
              "Lord Jesus Christ, as daylight fades, as shine the lights of eventide, 
              we praise the Father with the Son, the Spirit blest and with them one."
            </Text>
          </View>
        </View>

        {/* Psalmody */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons 
              name="book-outline" 
              size={24} 
              color={Colors[colorScheme ?? 'light'].primary} 
            />
            <Text style={[styles.sectionTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
              Psalmody
            </Text>
          </View>
          
          <View style={[styles.contentCard, { backgroundColor: Colors[colorScheme ?? 'light'].card }]}>
            <Text style={[styles.contentTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
              Psalm 113: Praise the Lord, you his servants
            </Text>
            <Text style={[styles.antiphon, { color: Colors[colorScheme ?? 'light'].primary }]}>
              Antiphon: From the rising of the sun to its setting, the name of the Lord is to be praised.
            </Text>
            <Text style={[styles.contentBody, { color: Colors[colorScheme ?? 'light'].text }]}>
              Praise the Lord, you his servants, praise the name of the Lord. 
              Let the name of the Lord be praised, both now and forevermore.
            </Text>
            <Text style={[styles.contentBody, { color: Colors[colorScheme ?? 'light'].text }]}>
              From the rising of the sun to the place where it sets, 
              the name of the Lord is to be praised.
            </Text>
            <Text style={[styles.antiphon, { color: Colors[colorScheme ?? 'light'].primary }]}>
              Antiphon: From the rising of the sun to its setting, the name of the Lord is to be praised.
            </Text>
          </View>
        </View>

        {/* Canticle */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons 
              name="star-outline" 
              size={24} 
              color={Colors[colorScheme ?? 'light'].primary} 
            />
            <Text style={[styles.sectionTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
              Canticle of Mary
            </Text>
          </View>
          
          <View style={[styles.contentCard, { backgroundColor: Colors[colorScheme ?? 'light'].card }]}>
            <Text style={[styles.antiphon, { color: Colors[colorScheme ?? 'light'].primary }]}>
              Antiphon: My soul proclaims the greatness of the Lord.
            </Text>
            <Text style={[styles.contentBody, { color: Colors[colorScheme ?? 'light'].text }]}>
              My soul proclaims the greatness of the Lord, my spirit rejoices in God my Savior, 
              for he has looked with favor on his lowly servant. From this day all generations 
              will call me blessed: the Almighty has done great things for me, and holy is his Name.
            </Text>
            <Text style={[styles.contentBody, { color: Colors[colorScheme ?? 'light'].text }]}>
              He has mercy on those who fear him in every generation. He has shown the strength 
              of his arm, he has scattered the proud in their conceit. He has cast down the mighty 
              from their thrones, and has lifted up the lowly.
            </Text>
            <Text style={[styles.antiphon, { color: Colors[colorScheme ?? 'light'].primary }]}>
              Antiphon: My soul proclaims the greatness of the Lord.
            </Text>
          </View>
        </View>

        {/* Intercessions */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons 
              name="heart-outline" 
              size={24} 
              color={Colors[colorScheme ?? 'light'].primary} 
            />
            <Text style={[styles.sectionTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
              Intercessions
            </Text>
          </View>
          
          <View style={[styles.contentCard, { backgroundColor: Colors[colorScheme ?? 'light'].card }]}>
            <Text style={[styles.contentBody, { color: Colors[colorScheme ?? 'light'].text }]}>
              Christ is the light of the nations and the glory of Israel. Let us praise him and call upon him:
            </Text>
            <Text style={[styles.contentBody, { color: Colors[colorScheme ?? 'light'].text }]}>
              ℟. Light of the world, shine on us.
            </Text>
            <Text style={[styles.contentBody, { color: Colors[colorScheme ?? 'light'].text }]}>
              ℣. You came to bring light to those who sit in darkness, — enlighten all who seek you.
            </Text>
            <Text style={[styles.contentBody, { color: Colors[colorScheme ?? 'light'].text }]}>
              ℣. You came to bring peace to the world, — give peace to all nations and peoples.
            </Text>
            <Text style={[styles.contentBody, { color: Colors[colorScheme ?? 'light'].text }]}>
              ℣. You came to save sinners, — have mercy on all who turn to you in repentance.
            </Text>
          </View>
        </View>

        {/* Our Father */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons 
              name="hand-left-outline" 
              size={24} 
              color={Colors[colorScheme ?? 'light'].primary} 
            />
            <Text style={[styles.sectionTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
              Our Father
            </Text>
          </View>
          
          <View style={[styles.contentCard, { backgroundColor: Colors[colorScheme ?? 'light'].card }]}>
            <Text style={[styles.contentBody, { color: Colors[colorScheme ?? 'light'].text }]}>
              Our Father, who art in heaven, hallowed be thy name; thy kingdom come; 
              thy will be done on earth as it is in heaven. Give us this day our daily bread; 
              and forgive us our trespasses as we forgive those who trespass against us; 
              and lead us not into temptation, but deliver us from evil.
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
              Almighty and eternal God, as daylight fades, we give you thanks for the blessings of this day. 
              Grant that as we prepare for the night's rest, we may do so with grateful hearts and peaceful minds. 
              Through our Lord Jesus Christ, your Son, who lives and reigns with you in the unity 
              of the Holy Spirit, one God, for ever and ever.
            </Text>
            <Text style={[styles.amen, { color: Colors[colorScheme ?? 'light'].primary }]}>
              Amen.
            </Text>
          </View>
        </View>
        {/* Prayer Navigation Buttons */}
        <PrayerNavButtons currentHour="vespers" />

        {/* Footer - Web only */}
        <Footer />
      </ScrollView>
      
      {/* Prayer Hour Picker Modal */}
      <PrayerHourPickerModal
        visible={showQuickPicker}
        onClose={() => setShowQuickPicker(false)}
        currentHour="vespers"
      />
      
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
