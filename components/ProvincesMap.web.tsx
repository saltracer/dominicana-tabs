import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Platform,
} from 'react-native';
import { Colors } from '../constants/Colors';
import { useTheme } from './ThemeProvider';
import { Province } from '../types';
import { allProvinces } from '../assets/data/provinces';

// Import mock module for web
const Maps = require('./react-native-maps-mock');
const MapView = Maps.default;
const Marker = Maps.Marker;
const Polygon = Maps.Polygon;

interface ProvincesMapProps {
  onProvinceSelect?: (province: Province) => void;
}

export default function ProvincesMap({ onProvinceSelect }: ProvincesMapProps) {
  const { colorScheme } = useTheme();
  const [selectedProvince, setSelectedProvince] = useState<Province | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);
  const mapRef = useRef<any>(null);

  // Debug: Log the provinces being loaded
  useEffect(() => {
    console.log('ProvincesMap: Loading provinces:', allProvinces.length);
    console.log('ProvincesMap: Regions found:', [...new Set(allProvinces.map(p => p.region))]);
    allProvinces.forEach(province => {
      console.log(`Province: ${province.name} - Region: ${province.region} - Coordinates: [${province.coordinates[0]}, ${province.coordinates[1]}]`);
    });
  }, []);

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
  
  // Filter provinces by selected main region
  const filteredProvinces = selectedRegion 
    ? allProvinces.filter(province => getMainRegion(province.region) === selectedRegion)
    : allProvinces;

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

  const handleMapReady = () => {
    setMapReady(true);
  };

  // Web fallback - show list view instead of map
  return (
    <View style={[styles.container, styles.webFallback]}>
      <Text style={[styles.webFallbackText, { color: Colors[colorScheme ?? 'light'].text }]}>
        🌍 Interactive Map
      </Text>
      <Text style={[styles.webFallbackSubtext, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
        Map view is available on mobile devices
      </Text>
      <View style={styles.provincesList}>
        <Text style={[styles.provinceCount, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
          Showing {allProvinces.length} provinces worldwide
        </Text>
        {allProvinces.slice(0, 10).map((province) => (
          <TouchableOpacity
            key={province.id}
            style={[styles.provinceItem, { backgroundColor: Colors[colorScheme ?? 'light'].surface }]}
            onPress={() => handleMarkerPress(province)}
          >
            <Text style={[styles.provinceName, { color: Colors[colorScheme ?? 'light'].text }]}>
              {province.name}
            </Text>
            <Text style={[styles.provinceRegion, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
              {getMainRegion(province.region)} • {province.countries.join(', ')}
            </Text>
          </TouchableOpacity>
        ))}
        {allProvinces.length > 10 && (
          <Text style={[styles.provinceCount, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
            ... and {allProvinces.length - 10} more provinces
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  webFallback: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  webFallbackText: {
    fontSize: 24,
    fontWeight: '700',
    fontFamily: 'Georgia',
    marginBottom: 8,
  },
  webFallbackSubtext: {
    fontSize: 16,
    fontFamily: 'Georgia',
    textAlign: 'center',
    marginBottom: 20,
  },
  provincesList: {
    width: '100%',
    gap: 12,
  },
  provinceItem: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  provinceName: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Georgia',
    marginBottom: 4,
  },
  provinceRegion: {
    fontSize: 14,
    fontFamily: 'Georgia',
  },
  provinceCount: {
    fontSize: 14,
    fontFamily: 'Georgia',
    textAlign: 'center',
    marginBottom: 12,
  },
});
