import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../../constants/Colors';
import { useTheme } from '../../../components/ThemeProvider';
import { useCalendar } from '../../../components/CalendarContext';
import FeastBanner from '../../../components/FeastBanner';
import CommunityNavigation from '../../../components/CommunityNavigation';
import LiturgicalCalendarService from '../../../services/LiturgicalCalendar';
import { LiturgicalDay, Saint } from '../../../types';

export default function SaintsScreen() {
  const { colorScheme } = useTheme();
  const { liturgicalDay } = useCalendar();
  const [searchQuery, setSearchQuery] = useState('');
  const [saints, setSaints] = useState<Saint[]>([]);

  useEffect(() => {
    loadSaints();
  }, []);

  const loadSaints = () => {
    const calendarService = LiturgicalCalendarService.getInstance();
    const allSaints = calendarService.getAllSaints();
    setSaints(allSaints);
  };

  const filteredSaints = saints.filter(saint => 
    searchQuery === '' || 
    saint.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    saint.patronages.some(patronage => patronage.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleSaintPress = (saint: Saint) => {
    Alert.alert(
      saint.name,
      `${saint.biography}\n\nPatronages: ${saint.patronages.join(', ')}`,
      [
        { text: 'Close', style: 'default' },
        { 
          text: 'View Details', 
          onPress: () => {
            Alert.alert('Saint Details', 'Detailed saint information would be displayed here.');
          }
        }
      ]
    );
  };



  if (!liturgicalDay) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
        <CommunityNavigation activeTab="saints" />
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
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        <CommunityNavigation activeTab="saints" />
        
        <View style={styles.tabContent}>
          <View style={[styles.searchContainer, { backgroundColor: Colors[colorScheme ?? 'light'].surface, borderColor: Colors[colorScheme ?? 'light'].border }]}>
            <Ionicons name="search" size={20} color={Colors[colorScheme ?? 'light'].textSecondary} />
            <TextInput
              style={[styles.searchInput, { color: Colors[colorScheme ?? 'light'].text }]}
              placeholder="Search saints..."
              placeholderTextColor={Colors[colorScheme ?? 'light'].textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          <View style={styles.saintsGrid}>
            {filteredSaints.map((saint) => (
              <TouchableOpacity
                key={saint.id}
                style={[styles.saintCard, { backgroundColor: Colors[colorScheme ?? 'light'].card }]}
                onPress={() => handleSaintPress(saint)}
              >
                <View style={styles.saintHeader}>
                  <Ionicons 
                    name="person-circle" 
                    size={40} 
                    color={Colors[colorScheme ?? 'light'].primary} 
                  />
                  {saint.isDominican && (
                    <View style={[styles.dominicanBadge, { backgroundColor: Colors[colorScheme ?? 'light'].primary }]}>
                      <Text style={[styles.dominicanBadgeText, { color: Colors[colorScheme ?? 'light'].dominicanWhite }]}>
                        OP
                      </Text>
                    </View>
                  )}
                </View>
                <Text style={[styles.saintName, { color: Colors[colorScheme ?? 'light'].text }]}>
                  {saint.name}
                </Text>
                <Text style={[styles.saintFeastDay, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                  Feast: {new Date(saint.feastDay).toLocaleDateString()}
                </Text>
                <Text style={[styles.saintPatronages, { color: Colors[colorScheme ?? 'light'].textMuted }]} numberOfLines={2}>
                  Patron: {saint.patronages.slice(0, 2).join(', ')}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
      
      {/* Feast Banner at Bottom */}
      <FeastBanner 
        liturgicalDay={liturgicalDay} 
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'Georgia',
  },
  tabContent: {
    paddingHorizontal: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    fontSize: 16,
    fontFamily: 'Georgia',
  },
  saintsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  saintCard: {
    width: '48%',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  saintHeader: {
    alignItems: 'center',
    marginBottom: 12,
    position: 'relative',
  },
  dominicanBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  dominicanBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    fontFamily: 'Georgia',
  },
  saintName: {
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 4,
    fontFamily: 'Georgia',
  },
  saintFeastDay: {
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 4,
    fontFamily: 'Georgia',
  },
  saintPatronages: {
    fontSize: 11,
    textAlign: 'center',
    fontFamily: 'Georgia',
    lineHeight: 14,
  },
});
