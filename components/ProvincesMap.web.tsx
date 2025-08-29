import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  TextInput,
  FlatList,
} from 'react-native';
import { Colors } from '../constants/Colors';
import { useTheme } from './ThemeProvider';
import { Province } from '../types';
import { allProvinces } from '../assets/data/provinces';

interface ProvincesMapProps {
  onProvinceSelect?: (province: Province) => void;
}

export default function ProvincesMap({ onProvinceSelect }: ProvincesMapProps) {
  const { colorScheme } = useTheme();
  const [selectedProvince, setSelectedProvince] = useState<Province | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredProvinces, setFilteredProvinces] = useState<Province[]>(allProvinces);

  // Map all region names to the 5 main regions
  const getMainRegion = (region: string): string => {
    const regionMapping: { [key: string]: string } = {
      // Africa
      'West Africa': 'Africa',
      'Central Africa': 'Africa', 
      'Southern Africa': 'Africa',
      'Equatorial Africa': 'Africa',
      
      // Americas
      'Eastern United States': 'Americas',
      'Western United States': 'Americas',
      'Central United States': 'Americas',
      'Southern United States': 'Americas',
      'Canada': 'Americas',
      'Mexico': 'Americas',
      'Central America': 'Americas',
      'Argentina': 'Americas',
      'Bolivia': 'Americas',
      'Brazil': 'Americas',
      'Colombia': 'Americas',
      'Ecuador': 'Americas',
      'Peru': 'Americas',
      
      // Asia-Pacific
      'Asia-Pacific': 'Asia-Pacific',
      'Philippines': 'Asia-Pacific',
      'Vietnam': 'Asia-Pacific',
      'Taiwan': 'Asia-Pacific',
      'India': 'Asia-Pacific',
      'Pakistan': 'Asia-Pacific',
      
      // Europe
      'Europe': 'Europe',
      'europe': 'Europe',
      'France': 'Europe',
      'England': 'Europe',
      'Spain': 'Europe',
      'Italy': 'Europe',
      'Northern Italy': 'Europe',
      'Central Italy': 'Europe',
      'Southern Italy': 'Europe',
      'Poland': 'Europe',
      'Germany': 'Europe',
      'Czech Republic': 'Europe',
      'Croatia': 'Europe',
      'Portugal': 'Europe',
      'Ireland': 'Europe',
      'Malta': 'Europe',
      'Switzerland': 'Europe',
      'Belgium': 'Europe',
      'Slovakia': 'Europe',
      'Southern France (Toulouse, Bordeaux, Marseille, Montpellier, Nice, The Holy Baume, The Reunion) and Haiti': 'Europe',
      
      // Oceania
      'Oceania': 'Oceania',
    };
    
    return regionMapping[region] || 'Other';
  };

  // Get the 5 main regions
  const mainRegions = ['Africa', 'Americas', 'Asia-Pacific', 'Europe', 'Oceania'];
  
  // Filter and search provinces
  useEffect(() => {
    let filtered = allProvinces;
    
    // Filter by region
    if (selectedRegion) {
      filtered = filtered.filter(province => getMainRegion(province.region) === selectedRegion);
    }
    
    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(province => 
        province.name.toLowerCase().includes(query) ||
        province.countries.some(country => country.toLowerCase().includes(query)) ||
        province.region.toLowerCase().includes(query)
      );
    }
    
    setFilteredProvinces(filtered);
  }, [selectedRegion, searchQuery]);

  const handleMarkerPress = (province: Province) => {
    setSelectedProvince(province);
    onProvinceSelect?.(province);
  };

  const handleCalloutPress = (province: Province) => {
    setSelectedProvince(province);
    setShowModal(true);
    onProvinceSelect?.(province);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedProvince(null);
  };

  const getProvinceColor = (province: Province) => {
    if (province.color) {
      return province.color;
    }
    
    const mainRegion = getMainRegion(province.region);
    const regionColors: { [key: string]: string } = {
      'Africa': '#FF6B6B',
      'Americas': '#4ECDC4',
      'Asia-Pacific': '#45B7D1',
      'Europe': '#96CEB4',
      'Oceania': '#FFEAA7',
    };
    return regionColors[mainRegion] || '#95A5A6';
  };

  // Web interface with search and filtering
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: Colors[colorScheme ?? 'light'].text }]}>
          🌍 Dominican Provinces
        </Text>
        <Text style={[styles.subtitle, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
          {filteredProvinces.length} of {allProvinces.length} provinces
        </Text>
      </View>

      {/* Search Bar */}
      <View style={[styles.searchContainer, { backgroundColor: Colors[colorScheme ?? 'light'].surface }]}>
        <TextInput
          style={[styles.searchInput, { color: Colors[colorScheme ?? 'light'].text }]}
          placeholder="Search provinces, countries, or regions..."
          placeholderTextColor={Colors[colorScheme ?? 'light'].textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Region Filter */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.regionFilter}>
        <TouchableOpacity
          style={[
            styles.regionButton,
            !selectedRegion && styles.regionButtonActive,
            { backgroundColor: Colors[colorScheme ?? 'light'].surface }
          ]}
          onPress={() => setSelectedRegion(null)}
        >
          <Text style={[
            styles.regionButtonText,
            !selectedRegion && styles.regionButtonTextActive,
            { color: !selectedRegion ? '#fff' : Colors[colorScheme ?? 'light'].text }
          ]}>
            All Regions
          </Text>
        </TouchableOpacity>
        {mainRegions.map((region) => (
          <TouchableOpacity
            key={region}
            style={[
              styles.regionButton,
              selectedRegion === region && styles.regionButtonActive,
              { backgroundColor: Colors[colorScheme ?? 'light'].surface }
            ]}
            onPress={() => setSelectedRegion(region)}
          >
            <Text style={[
              styles.regionButtonText,
              selectedRegion === region && styles.regionButtonTextActive,
              { color: selectedRegion === region ? '#fff' : Colors[colorScheme ?? 'light'].text }
            ]}>
              {region}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Provinces List */}
      <FlatList
        data={filteredProvinces}
        keyExtractor={(item) => item.id}
        renderItem={({ item: province }) => (
          <TouchableOpacity
            style={[styles.provinceItem, { backgroundColor: Colors[colorScheme ?? 'light'].surface }]}
            onPress={() => handleMarkerPress(province)}
          >
            <View style={styles.provinceHeader}>
              <Text style={[styles.provinceName, { color: Colors[colorScheme ?? 'light'].text }]}>
                {province.name}
              </Text>
              <View style={[styles.regionBadge, { backgroundColor: getProvinceColor(province) }]}>
                <Text style={styles.regionBadgeText}>
                  {getMainRegion(province.region)}
                </Text>
              </View>
            </View>
            <Text style={[styles.provinceCountries, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
              {province.countries.join(', ')}
            </Text>
            <Text style={[styles.provinceRegion, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
              {province.region}
            </Text>
          </TouchableOpacity>
        )}
        style={styles.provincesList}
        showsVerticalScrollIndicator={false}
      />

      {/* Province Detail Modal */}
      <Modal
        visible={showModal}
        transparent={true}
        animationType="slide"
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
            {selectedProvince && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={[styles.modalTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
                    {selectedProvince.name}
                  </Text>
                  <TouchableOpacity onPress={closeModal} style={styles.closeButton}>
                    <Text style={[styles.closeButtonText, { color: Colors[colorScheme ?? 'light'].text }]}>✕</Text>
                  </TouchableOpacity>
                </View>
                <ScrollView style={styles.modalBody}>
                  <View style={[styles.modalSection, { backgroundColor: Colors[colorScheme ?? 'light'].surface }]}>
                    <Text style={[styles.modalSectionTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
                      Countries
                    </Text>
                    <Text style={[styles.modalSectionText, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                      {selectedProvince.countries.join(', ')}
                    </Text>
                  </View>
                  <View style={[styles.modalSection, { backgroundColor: Colors[colorScheme ?? 'light'].surface }]}>
                    <Text style={[styles.modalSectionTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
                      Region
                    </Text>
                    <Text style={[styles.modalSectionText, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                      {selectedProvince.region}
                    </Text>
                  </View>
                  <View style={[styles.modalSection, { backgroundColor: Colors[colorScheme ?? 'light'].surface }]}>
                    <Text style={[styles.modalSectionTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
                      Coordinates
                    </Text>
                    <Text style={[styles.modalSectionText, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                      {selectedProvince.coordinates[0]}, {selectedProvince.coordinates[1]}
                    </Text>
                  </View>
                </ScrollView>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
    padding: 16,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    fontFamily: 'Georgia',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Georgia',
  },
  searchContainer: {
    marginBottom: 16,
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  searchInput: {
    height: 44,
    fontSize: 16,
    fontFamily: 'Georgia',
  },
  regionFilter: {
    marginBottom: 16,
  },
  regionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  regionButtonActive: {
    backgroundColor: '#007AFF',
  },
  regionButtonText: {
    fontSize: 14,
    fontFamily: 'Georgia',
    fontWeight: '500',
  },
  regionButtonTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  provincesList: {
    flex: 1,
  },
  provinceItem: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginBottom: 12,
  },
  provinceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  provinceName: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Georgia',
    flex: 1,
  },
  regionBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  regionBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
    fontFamily: 'Georgia',
  },
  provinceCountries: {
    fontSize: 14,
    fontFamily: 'Georgia',
    marginBottom: 4,
  },
  provinceRegion: {
    fontSize: 12,
    fontFamily: 'Georgia',
    fontStyle: 'italic',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxWidth: 400,
    borderRadius: 12,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    fontFamily: 'Georgia',
    flex: 1,
  },
  closeButton: {
    padding: 4,
  },
  closeButtonText: {
    fontSize: 20,
    fontWeight: '600',
  },
  modalBody: {
    padding: 20,
  },
  modalSection: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  modalSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Georgia',
    marginBottom: 8,
  },
  modalSectionText: {
    fontSize: 14,
    fontFamily: 'Georgia',
    lineHeight: 20,
  },
});
