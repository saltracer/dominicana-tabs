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
import { Colors } from '../../constants/Colors';
import { useTheme } from '../../components/ThemeProvider';
import FeastBanner from '../../components/FeastBanner';
import LiturgicalCalendarService from '../../services/LiturgicalCalendar';
import { LiturgicalDay, Saint, DominicanProvince } from '../../types';

export default function CommunityScreen() {
  const { colorScheme } = useTheme();
  const [liturgicalDay, setLiturgicalDay] = useState<LiturgicalDay | null>(null);
  const [activeTab, setActiveTab] = useState<'calendar' | 'saints' | 'provinces'>('calendar');
  const [searchQuery, setSearchQuery] = useState('');
  const [saints, setSaints] = useState<Saint[]>([]);
  const [provinces, setProvinces] = useState<DominicanProvince[]>([]);

  useEffect(() => {
    const calendarService = LiturgicalCalendarService.getInstance();
    const today = new Date();
    const day = calendarService.getLiturgicalDay(today);
    setLiturgicalDay(day);
    loadSaints();
    loadProvinces();
  }, []);

  const handleDateChange = (date: Date) => {
    const calendarService = LiturgicalCalendarService.getInstance();
    const day = calendarService.getLiturgicalDay(date);
    setLiturgicalDay(day);
  };

  const loadSaints = () => {
    const calendarService = LiturgicalCalendarService.getInstance();
    const allSaints = calendarService.getAllSaints();
    setSaints(allSaints);
  };

  const loadProvinces = () => {
    const sampleProvinces: DominicanProvince[] = [
      {
        id: 'province-st-joseph',
        name: 'Province of St. Joseph',
        country: 'United States',
        region: 'Eastern United States',
        coordinates: { latitude: 40.7128, longitude: -74.0060 },
        founded: '1805',
        description: 'The first Dominican province in the United States, covering the eastern United States.',
        website: 'https://www.opeast.org',
        contact: {
          email: 'provincial@opeast.org',
          phone: '+1-202-529-5300',
          address: '141 East 65th Street, New York, NY 10065'
        },
        communities: [
          {
            id: 'st-catherine-siena-priory',
            name: 'St. Catherine of Siena Priory',
            type: 'priory',
            address: '141 East 65th Street, New York, NY 10065',
            coordinates: { latitude: 40.7128, longitude: -74.0060 },
            contact: {
              email: 'info@stcatherinepriory.org',
              phone: '+1-212-744-2086',
              address: '141 East 65th Street, New York, NY 10065'
            }
          }
        ]
      },
      {
        id: 'province-holy-name',
        name: 'Province of the Holy Name',
        country: 'United States',
        region: 'Western United States',
        coordinates: { latitude: 37.7749, longitude: -122.4194 },
        founded: '1912',
        description: 'Dominican province covering the western United States and Pacific region.',
        website: 'https://www.ophn.org',
        contact: {
          email: 'provincial@ophn.org',
          phone: '+1-510-658-8722',
          address: '5877 Birch Court, Oakland, CA 94618'
        },
        communities: [
          {
            id: 'st-albert-priory',
            name: 'St. Albert the Great Priory',
            type: 'priory',
            address: '5877 Birch Court, Oakland, CA 94618',
            coordinates: { latitude: 37.7749, longitude: -122.4194 },
            contact: {
              email: 'info@stalbertpriory.org',
              phone: '+1-510-658-8722',
              address: '5877 Birch Court, Oakland, CA 94618'
            }
          }
        ]
      }
    ];
    setProvinces(sampleProvinces);
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

  const handleProvincePress = (province: DominicanProvince) => {
    Alert.alert(
      province.name,
      `${province.description}\n\nFounded: ${province.founded}\nRegion: ${province.region}`,
      [
        { text: 'Close', style: 'default' },
        { 
          text: 'View Map', 
          onPress: () => {
            Alert.alert('Map View', 'Interactive map would open showing the province location and communities.');
          }
        }
      ]
    );
  };

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
    <SafeAreaView style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]} edges={['left', 'right']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>

        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[
              styles.tab,
              { 
                backgroundColor: activeTab === 'calendar' 
                  ? Colors[colorScheme ?? 'light'].primary 
                  : Colors[colorScheme ?? 'light'].card,
              }
            ]}
            onPress={() => setActiveTab('calendar')}
          >
            <Ionicons 
              name="calendar" 
              size={20} 
              color={activeTab === 'calendar' 
                ? Colors[colorScheme ?? 'light'].dominicanWhite 
                : Colors[colorScheme ?? 'light'].textSecondary
              } 
            />
            <Text style={[
              styles.tabText,
              { 
                color: activeTab === 'calendar' 
                  ? Colors[colorScheme ?? 'light'].dominicanWhite 
                  : Colors[colorScheme ?? 'light'].text
              }
            ]}>
              Calendar
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tab,
              { 
                backgroundColor: activeTab === 'saints' 
                  ? Colors[colorScheme ?? 'light'].primary 
                  : Colors[colorScheme ?? 'light'].card,
              }
            ]}
            onPress={() => setActiveTab('saints')}
          >
            <Ionicons 
              name="people" 
              size={20} 
              color={activeTab === 'saints' 
                ? Colors[colorScheme ?? 'light'].dominicanWhite 
                : Colors[colorScheme ?? 'light'].textSecondary
              } 
            />
            <Text style={[
              styles.tabText,
              { 
                color: activeTab === 'saints' 
                  ? Colors[colorScheme ?? 'light'].dominicanWhite 
                  : Colors[colorScheme ?? 'light'].text
              }
            ]}>
              Saints
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tab,
              { 
                backgroundColor: activeTab === 'provinces' 
                  ? Colors[colorScheme ?? 'light'].primary 
                  : Colors[colorScheme ?? 'light'].card,
              }
            ]}
            onPress={() => setActiveTab('provinces')}
          >
            <Ionicons 
              name="map" 
              size={20} 
              color={activeTab === 'provinces' 
                ? Colors[colorScheme ?? 'light'].dominicanWhite 
                : Colors[colorScheme ?? 'light'].textSecondary
              } 
            />
            <Text style={[
              styles.tabText,
              { 
                color: activeTab === 'provinces' 
                  ? Colors[colorScheme ?? 'light'].dominicanWhite 
                  : Colors[colorScheme ?? 'light'].text
              }
            ]}>
              Provinces
            </Text>
          </TouchableOpacity>
        </View>

        {/* Calendar Tab */}
        {activeTab === 'calendar' && (
          <View style={styles.tabContent}>
            <View style={styles.calendarInfo}>
              <View style={[styles.seasonCard, { backgroundColor: liturgicalDay.color }]}>
                <Text style={[styles.seasonTitle, { color: Colors[colorScheme ?? 'light'].dominicanWhite }]}>
                  {liturgicalDay.season.name}
                </Text>
                <Text style={[styles.seasonDescription, { color: Colors[colorScheme ?? 'light'].dominicanWhite }]}>
                  {liturgicalDay.season.description}
                </Text>
                <Text style={[styles.weekInfo, { color: Colors[colorScheme ?? 'light'].dominicanWhite }]}>
                  Week {liturgicalDay.week}
                </Text>
              </View>

              {liturgicalDay.feasts.length > 0 && (
                <View style={styles.feastsSection}>
                  <Text style={[styles.sectionTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
                    Today's Feasts
                  </Text>
                  {liturgicalDay.feasts.map((feast, index) => (
                    <View key={index} style={[styles.feastCard, { backgroundColor: Colors[colorScheme ?? 'light'].card }]}>
                      <View style={styles.feastHeader}>
                        <Text style={[styles.feastName, { color: Colors[colorScheme ?? 'light'].text }]}>
                          {feast.name}
                        </Text>
                        <View style={[styles.feastRank, { backgroundColor: feast.color }]}>
                          <Text style={[styles.feastRankText, { color: Colors[colorScheme ?? 'light'].dominicanWhite }]}>
                            {feast.rank.toUpperCase()}
                          </Text>
                        </View>
                      </View>
                      <Text style={[styles.feastDescription, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                        {feast.description}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </View>
        )}

        {/* Saints Tab */}
        {activeTab === 'saints' && (
          <View style={styles.tabContent}>
            <View style={styles.searchContainer}>
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
                      <View style={styles.dominicanBadge}>
                        <Text style={styles.dominicanBadgeText}>OP</Text>
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
        )}

        {/* Provinces Tab */}
        {activeTab === 'provinces' && (
          <View style={styles.tabContent}>
            <View style={styles.provincesList}>
              {provinces.map((province) => (
                <TouchableOpacity
                  key={province.id}
                  style={[styles.provinceCard, { backgroundColor: Colors[colorScheme ?? 'light'].card }]}
                  onPress={() => handleProvincePress(province)}
                >
                  <View style={styles.provinceHeader}>
                    <Ionicons 
                      name="location" 
                      size={24} 
                      color={Colors[colorScheme ?? 'light'].primary} 
                    />
                    <View style={styles.provinceInfo}>
                      <Text style={[styles.provinceName, { color: Colors[colorScheme ?? 'light'].text }]}>
                        {province.name}
                      </Text>
                      <Text style={[styles.provinceRegion, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                        {province.region}
                      </Text>
                    </View>
                    <Ionicons 
                      name="chevron-forward" 
                      size={20} 
                      color={Colors[colorScheme ?? 'light'].textSecondary} 
                    />
                  </View>
                  <Text style={[styles.provinceDescription, { color: Colors[colorScheme ?? 'light'].textMuted }]} numberOfLines={2}>
                    {province.description}
                  </Text>
                  <View style={styles.provinceStats}>
                    <Text style={[styles.provinceStat, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                      Founded: {province.founded}
                    </Text>
                    <Text style={[styles.provinceStat, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                      Communities: {province.communities.length}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
      
      {/* Feast Banner at Bottom */}
      <FeastBanner 
        liturgicalDay={liturgicalDay} 
        onDateChange={handleDateChange}
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
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginVertical: 8,
    backgroundColor: Colors.light.surface,
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  tabText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Georgia',
  },
  tabContent: {
    paddingHorizontal: 16,
  },
  calendarInfo: {
    marginTop: 16,
  },
  seasonCard: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  seasonTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 8,
    fontFamily: 'Georgia',
  },
  seasonDescription: {
    fontSize: 16,
    marginBottom: 12,
    fontFamily: 'Georgia',
    lineHeight: 22,
  },
  weekInfo: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Georgia',
  },
  feastsSection: {
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
    fontFamily: 'Georgia',
  },
  feastCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  feastHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  feastName: {
    fontSize: 18,
    fontWeight: '700',
    flex: 1,
    fontFamily: 'Georgia',
  },
  feastRank: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  feastRankText: {
    fontSize: 10,
    fontWeight: '700',
    fontFamily: 'Georgia',
  },
  feastDescription: {
    fontSize: 14,
    fontFamily: 'Georgia',
    lineHeight: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.surface,
    marginVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.light.border,
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
    backgroundColor: Colors.light.primary,
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  dominicanBadgeText: {
    color: Colors.light.dominicanWhite,
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
  provincesList: {
    marginTop: 16,
  },
  provinceCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  provinceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  provinceInfo: {
    flex: 1,
    marginLeft: 12,
  },
  provinceName: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
    fontFamily: 'Georgia',
  },
  provinceRegion: {
    fontSize: 14,
    fontFamily: 'Georgia',
  },
  provinceDescription: {
    fontSize: 14,
    marginBottom: 12,
    fontFamily: 'Georgia',
    lineHeight: 20,
  },
  provinceStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  provinceStat: {
    fontSize: 12,
    fontFamily: 'Georgia',
  },
});
