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
import { Calendar } from 'react-native-calendars';
import { Colors } from '../../constants/Colors';
import { useTheme } from '../../components/ThemeProvider';
import FeastBanner from '../../components/FeastBanner';
import LiturgicalCalendarService from '../../services/LiturgicalCalendar';
import { LiturgicalDay, Saint, Province } from '../../types';

export default function CommunityScreen() {
  const { colorScheme } = useTheme();
  const [liturgicalDay, setLiturgicalDay] = useState<LiturgicalDay | null>(null);
  const [activeTab, setActiveTab] = useState<'calendar' | 'saints' | 'provinces'>('calendar');
  const [searchQuery, setSearchQuery] = useState('');
  const [saints, setSaints] = useState<Saint[]>([]);
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [markedDates, setMarkedDates] = useState<any>({});

  useEffect(() => {
    const calendarService = LiturgicalCalendarService.getInstance();
    const today = new Date();
    const day = calendarService.getLiturgicalDay(today);
    setLiturgicalDay(day);
    loadSaints();
    loadProvinces();
  }, []);

  useEffect(() => {
    generateMarkedDates();
  }, [colorScheme, liturgicalDay]);

  const generateMarkedDates = () => {
    const calendarService = LiturgicalCalendarService.getInstance();
    const marked: any = {};
    let feastCount = 0;
    
    // Generate feast days for the current year
    const currentYear = new Date().getFullYear();
    for (let month = 0; month < 12; month++) {
      // Get the number of days in each month
      const daysInMonth = new Date(currentYear, month + 1, 0).getDate();
      
      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(currentYear, month, day);
        const liturgicalDay = calendarService.getLiturgicalDay(date);
        
        if (liturgicalDay.feasts.length > 0) {
          feastCount++;
          const dateString = date.toISOString().split('T')[0];
          
          // Check if any feast is Dominican
          const hasDominicanFeast = liturgicalDay.feasts.some(feast => feast.isDominican);
          
          marked[dateString] = {
            marked: true,
            dotColor: hasDominicanFeast ? Colors[colorScheme ?? 'light'].primary : liturgicalDay.feasts[0].color,
            textColor: hasDominicanFeast ? Colors[colorScheme ?? 'light'].primary : Colors[colorScheme ?? 'light'].text,
          };
        }
      }
    }
    
    console.log(`Generated ${feastCount} feast days for calendar`);
    console.log('Marked dates:', Object.keys(marked).length);
    
    // Debug: Check current month for feast days
    const currentMonth = new Date().getMonth();
    const currentDay = new Date().getDate();
    console.log(`Current month: ${currentMonth}, day: ${currentDay}`);
    
    // Test a few specific dates
    const testDates = [
      new Date(currentYear, 0, 1),   // January 1
      new Date(currentYear, 0, 6),   // January 6
      new Date(currentYear, 3, 29),  // April 29 (St. Catherine)
      new Date(currentYear, 7, 8),   // August 8 (St. Dominic)
    ];
    
    testDates.forEach(date => {
      const testLiturgicalDay = calendarService.getLiturgicalDay(date);
      console.log(`${date.toDateString()}: ${testLiturgicalDay.feasts.length} feasts`);
      if (testLiturgicalDay.feasts.length > 0) {
        console.log(`  - ${testLiturgicalDay.feasts[0].name} (Dominican: ${testLiturgicalDay.feasts[0].isDominican})`);
      }
    });
    
    // Mark the selected date
    if (liturgicalDay) {
      const selectedDateString = new Date(liturgicalDay.date).toISOString().split('T')[0];
      marked[selectedDateString] = {
        ...marked[selectedDateString],
        selected: true,
        selectedColor: Colors[colorScheme ?? 'light'].primary,
        selectedTextColor: Colors[colorScheme ?? 'light'].dominicanWhite,
      };
    }
    
    setMarkedDates(marked);
  };

  const handleDayPress = (day: any) => {
    const calendarService = LiturgicalCalendarService.getInstance();
    const selectedDate = new Date(day.timestamp);
    const liturgicalDay = calendarService.getLiturgicalDay(selectedDate);
    setLiturgicalDay(liturgicalDay);
    
    // Update marked dates to show new selection
    const newMarkedDates = { ...markedDates };
    Object.keys(newMarkedDates).forEach(key => {
      if (newMarkedDates[key].selected) {
        delete newMarkedDates[key].selected;
        delete newMarkedDates[key].selectedColor;
        delete newMarkedDates[key].selectedTextColor;
      }
    });
    
    const dateString = day.dateString;
    newMarkedDates[dateString] = {
      ...newMarkedDates[dateString],
      selected: true,
      selectedColor: Colors[colorScheme ?? 'light'].primary,
      selectedTextColor: Colors[colorScheme ?? 'light'].dominicanWhite,
    };
    
    setMarkedDates(newMarkedDates);
  };

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
    const sampleProvinces: Province[] = [
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

  const handleProvincePress = (province: Province) => {
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
        <View style={[styles.tabContainer, { backgroundColor: Colors[colorScheme ?? 'light'].surface }]}>
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
            {/* Liturgical Calendar */}
            <View style={[styles.calendarContainer, { backgroundColor: Colors[colorScheme ?? 'light'].card }]}>
              <Text style={[styles.calendarTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
                Liturgical Calendar
              </Text>
              
              {/* Calendar Component */}
                      <Calendar
          current={new Date(liturgicalDay?.date || Date.now()).toISOString().split('T')[0]}
          onDayPress={handleDayPress}
          markedDates={markedDates}
          theme={{
            backgroundColor: Colors[colorScheme ?? 'light'].card,
            calendarBackground: Colors[colorScheme ?? 'light'].card,
            textSectionTitleColor: Colors[colorScheme ?? 'light'].text,
            selectedDayBackgroundColor: Colors[colorScheme ?? 'light'].primary,
            selectedDayTextColor: Colors[colorScheme ?? 'light'].dominicanWhite,
            todayTextColor: Colors[colorScheme ?? 'light'].primary,
            dayTextColor: Colors[colorScheme ?? 'light'].text,
            textDisabledColor: Colors[colorScheme ?? 'light'].textMuted,
            dotColor: Colors[colorScheme ?? 'light'].primary,
            selectedDotColor: Colors[colorScheme ?? 'light'].dominicanWhite,
            arrowColor: Colors[colorScheme ?? 'light'].primary,
            monthTextColor: Colors[colorScheme ?? 'light'].text,
            indicatorColor: Colors[colorScheme ?? 'light'].primary,
            textDayFontFamily: 'Georgia',
            textMonthFontFamily: 'Georgia',
            textDayHeaderFontFamily: 'Georgia',
            textDayFontSize: 16,
            textMonthFontSize: 18,
            textDayHeaderFontSize: 14,
          }}
          minDate={new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
          maxDate={new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
          key={colorScheme} // Force re-render when theme changes
        />

              {/* Calendar Legend */}
              <View style={[styles.calendarLegend, { backgroundColor: Colors[colorScheme ?? 'light'].surface }]}>
                <Text style={[styles.legendTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
                  Calendar Legend
                </Text>
                <View style={styles.legendItems}>
                  <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: '#8B0000' }]} />
                    <Text style={[styles.legendText, { color: Colors[colorScheme ?? 'light'].text }]}>
                      Regular Feast
                    </Text>
                  </View>
                  <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: Colors[colorScheme ?? 'light'].primary }]} />
                    <Text style={[styles.legendText, { color: Colors[colorScheme ?? 'light'].text }]}>
                      Dominican Feast
                    </Text>
                  </View>
                </View>
              </View>

              {/* Selected Date Info */}
              {liturgicalDay && (
                <View style={[styles.selectedDateInfo, { backgroundColor: Colors[colorScheme ?? 'light'].surface }]}>
                  <Text style={[styles.selectedDateLabel, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                    Selected Date
                  </Text>
                  <Text style={[styles.selectedDateText, { color: Colors[colorScheme ?? 'light'].text }]}>
                    {new Date(liturgicalDay.date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </Text>
                  
                  {/* Liturgical Season */}
                  <View style={[styles.seasonInfo, { backgroundColor: liturgicalDay.color }]}>
                    <Text style={[styles.seasonName, { color: Colors[colorScheme ?? 'light'].dominicanWhite }]}>
                      {liturgicalDay.season.name}
                    </Text>
                    <Text style={[styles.seasonWeek, { color: Colors[colorScheme ?? 'light'].dominicanWhite }]}>
                      Week {liturgicalDay.week}
                    </Text>
                  </View>

                  {/* Feasts for Selected Date */}
                  {liturgicalDay.feasts.length > 0 && (
                    <View style={styles.selectedFeasts}>
                      <Text style={[styles.feastsLabel, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                        Feasts
                      </Text>
                      {liturgicalDay.feasts.map((feast, index) => (
                        <View key={index} style={styles.selectedFeast}>
                          <View style={[styles.feastRank, { backgroundColor: feast.color }]}>
                            <Text style={[styles.feastRankText, { color: Colors[colorScheme ?? 'light'].dominicanWhite }]}>
                              {feast.rank.charAt(0).toUpperCase()}
                            </Text>
                          </View>
                          <Text style={[styles.feastName, { color: Colors[colorScheme ?? 'light'].text }]}>
                            {feast.name}
                          </Text>
                          {feast.isDominican && (
                            <Text style={[styles.dominicanIndicator, { color: Colors[colorScheme ?? 'light'].primary }]}>
                              ⚫⚪
                            </Text>
                          )}
                        </View>
                      ))}
                    </View>
                  )}
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
  },
  // Calendar styles
  calendarContainer: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  calendarTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 20,
    fontFamily: 'Georgia',
  },
  selectedDateCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  selectedDateLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
    fontFamily: 'Georgia',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  selectedDateText: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'Georgia',
  },
  dominicanIndicator: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
  },
  dominicanText: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'Georgia',
  },
  noFeastsCard: {
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  noFeastsText: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 4,
    fontFamily: 'Georgia',
  },
  noFeastsSubtext: {
    fontSize: 14,
    textAlign: 'center',
    fontFamily: 'Georgia',
  },
  // Calendar Grid Styles
  monthNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  monthNavButton: {
    padding: 8,
  },
  monthTitle: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'Georgia',
  },
  calendarGrid: {
    marginBottom: 20,
  },
  dayHeaders: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  dayHeader: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'Georgia',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    padding: 4,
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 8,
    margin: 1,
  },
  dayNumber: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Georgia',
  },
  feastIndicators: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  feastDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginHorizontal: 1,
  },
  moreFeastsText: {
    fontSize: 8,
    fontFamily: 'Georgia',
  },
  selectedDateInfo: {
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
  },
  seasonInfo: {
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
    alignItems: 'center',
  },
  seasonName: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'Georgia',
  },
  seasonWeek: {
    fontSize: 12,
    fontFamily: 'Georgia',
    marginTop: 4,
  },
  selectedFeasts: {
    marginTop: 16,
  },
  feastsLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
    fontFamily: 'Georgia',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  selectedFeast: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  // Calendar Day Component Styles
  dayComponent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 4,
    borderRadius: 8,
  },
  dayComponentText: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Georgia',
  },
  // Calendar Legend Styles
  calendarLegend: {
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
  },
  legendTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 12,
    fontFamily: 'Georgia',
  },
  legendItems: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendText: {
    fontSize: 12,
    fontFamily: 'Georgia',
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
