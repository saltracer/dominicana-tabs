import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  TextInput,
  FlatList,
  Platform,
} from 'react-native';
import { Colors } from '../../constants/Colors';
import { useTheme } from '../ThemeProvider';
import { Province } from '../../types';
import { allProvinces } from '../../assets/data/provinces';

// Import Leaflet for web - only on client side
let MapContainer: any, TileLayer: any, Marker: any, Popup: any, Polygon: any, useMap: any;
let L: any;

// Only import Leaflet on client side to avoid SSR issues
if (typeof window !== 'undefined') {
  const leafletModule = require('react-leaflet');
  const leafletCore = require('leaflet');
  
  MapContainer = leafletModule.MapContainer as any;
  TileLayer = leafletModule.TileLayer as any;
  Marker = leafletModule.Marker as any;
  Popup = leafletModule.Popup as any;
  Polygon = leafletModule.Polygon as any;
  useMap = leafletModule.useMap as any;
  L = leafletCore;

  // Fix Leaflet marker icons for web
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  });
}

interface ProvincesMapProps {
  onProvinceSelect?: (province: Province) => void;
}

// Component to handle map view updates
function MapUpdater({ selectedRegion, filteredProvinces }: { selectedRegion: string | null, filteredProvinces: Province[] }) {
  const map = useMap();
  
  useEffect(() => {
    if (filteredProvinces.length > 0) {
      const coordinates = filteredProvinces
        .filter(province => province.coordinates && province.coordinates.length === 2)
        .map(province => [province.coordinates[0], province.coordinates[1]] as [number, number]);
      
      if (coordinates.length > 0) {
        const bounds = L.latLngBounds(coordinates);
        map.fitBounds(bounds, { padding: [20, 20] });
      }
    }
  }, [selectedRegion, filteredProvinces, map]);
  
  return null;
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

  // Render province boundaries as polygons
  const renderPolygons = () => {
    return filteredProvinces.map((province) => {
      try {
        if (!province.boundaries?.coordinates) {
          return null;
        }

        const boundaries = province.boundaries;
        const regionColor = getProvinceColor(province);

        // Handle MultiPolygon structure
        if (boundaries.type === 'MultiPolygon' && Array.isArray(boundaries.coordinates)) {
          return boundaries.coordinates.map((polygon: any, polygonIndex: number) => {
            if (!Array.isArray(polygon) || polygon.length === 0) {
              return null;
            }

            const ring = polygon[0];
            if (!Array.isArray(ring) || ring.length < 3) {
              return null;
            }

            const coordinates = ring.map((coord: number[]) => [coord[1], coord[0]] as [number, number]); // [lat, lng]

            return (
              <Polygon
                key={`polygon-${province.id}-${polygonIndex}`}
                positions={coordinates as [number, number][]}
                pathOptions={{
                  fillColor: regionColor,
                  fillOpacity: 0.2,
                  color: regionColor,
                  weight: selectedProvince?.id === province.id ? 4 : 1,
                }}
                eventHandlers={{
                  click: () => handleMarkerPress(province),
                }}
              />
            );
          });
        }

        // Handle single Polygon structure
        if (boundaries.type === 'Polygon' && Array.isArray(boundaries.coordinates)) {
          const ring = boundaries.coordinates[0];
          if (!Array.isArray(ring) || ring.length < 3) {
            return null;
          }

          const coordinates = ring.map((coord: number[]) => [coord[1], coord[0]] as [number, number]); // [lat, lng]

          return (
            <Polygon
              key={`polygon-${province.id}`}
              positions={coordinates as [number, number][]}
              pathOptions={{
                fillColor: regionColor,
                fillOpacity: 0.2,
                color: regionColor,
                weight: selectedProvince?.id === province.id ? 4 : 1,
              }}
              eventHandlers={{
                click: () => handleMarkerPress(province),
              }}
            />
          );
        }

        return null;
      } catch (error) {
        console.warn(`Error rendering polygon for province ${province.id}:`, error);
        return null;
      }
    });
  };

  // Custom marker icon
  const createCustomIcon = (color: string) => {
    return L.divIcon({
      className: 'custom-marker',
      html: `<div style="
        width: 20px;
        height: 20px;
        background-color: ${color};
        border: 2px solid white;
        border-radius: 50%;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      "></div>`,
      iconSize: [20, 20],
      iconAnchor: [10, 10],
    });
  };

  return (
    <View style={styles.container}>

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
            ]}>
              {region}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView> 



      {/* Map View */}
      <View style={styles.mapContainer}>
        <MapContainer
          center={[0, 0]}
          zoom={2}
          style={styles.map}
          zoomControl={true}
          scrollWheelZoom={true}
          doubleClickZoom={true}
          boxZoom={true}
          keyboard={true}
          dragging={true}
          touchZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {/* Render province boundaries */}
          {renderPolygons()}
          
          {/* Render province markers */}
          {filteredProvinces.map((province) => {
            try {
              if (!province.coordinates || 
                  typeof province.coordinates[0] !== 'number' || 
                  typeof province.coordinates[1] !== 'number' ||
                  isNaN(province.coordinates[0]) || 
                  isNaN(province.coordinates[1])) {
                return null;
              }

              return (
                <Marker
                  key={province.id}
                  position={[province.coordinates[0], province.coordinates[1]]}
                  icon={createCustomIcon(getProvinceColor(province))}
                  eventHandlers={{
                    click: () => handleMarkerPress(province),
                  }}
                >
                  <Popup>
                    <div>
                      <h3>{province.name}</h3>
                      <p>{province.short_description}</p>
                      <p>{province.countries.join(', ')}</p>
                      <button onClick={() => handleCalloutPress(province)}>
                        View Details
                      </button>
                    </div>
                  </Popup>
                </Marker>
              );
            } catch (error) {
              console.warn(`Error rendering marker for province ${province.id}:`, error);
              return null;
            }
          })}
          
          <MapUpdater selectedRegion={selectedRegion} filteredProvinces={filteredProvinces} />
        </MapContainer>
      </View>



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
                      Description
                    </Text>
                    <Text style={[styles.modalSectionText, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                      {selectedProvince.description}
                    </Text>
                  </View>
                  <View style={[styles.modalSection, { backgroundColor: Colors[colorScheme ?? 'light'].surface }]}>
                    <Text style={[styles.modalSectionTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
                      Formation Date
                    </Text>
                    <Text style={[styles.modalSectionText, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                      {selectedProvince.formation_date}
                    </Text>
                  </View>
                  {selectedProvince.patronSaint && (
                    <View style={[styles.modalSection, { backgroundColor: Colors[colorScheme ?? 'light'].surface }]}>
                      <Text style={[styles.modalSectionTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
                        Patron Saint
                      </Text>
                      <Text style={[styles.modalSectionText, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                        {selectedProvince.patronSaint}
                      </Text>
                    </View>
                  )}
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
    borderRadius: 16,
    padding: 20,
    minHeight: '80vh',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    zIndex: 1,
  },
  header: {
    marginTop: 20,
    marginBottom: 24,
    textAlign: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    fontFamily: 'Georgia',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    fontFamily: 'Georgia',
    textAlign: 'center',
    opacity: 0.7,
  },
  searchContainer: {
    marginBottom: 20,
    borderRadius: 12,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchInput: {
    height: 48,
    fontSize: 16,
    fontFamily: 'Georgia',
    paddingVertical: 12,
  },
  regionFilter: {
    marginBottom: 20,
    paddingHorizontal: 4,
  },
  regionButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 15,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    maxHeight: 50,
  },
  regionButtonActive: {
    //backgroundColor: '#8B0000', //'#007AFF',
    borderColor: '#8B0000', //'#007AFF',
  },
  regionButtonText: {
    fontSize: 15,
    fontFamily: 'Georgia',
    fontWeight: '500',
  },
  regionButtonTextActive: {
    // color: '#fff',
    fontWeight: '700',
  },
  viewToggle: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 12,
    paddingHorizontal: 4,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  toggleButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  toggleButtonText: {
    fontSize: 16,
    fontFamily: 'Georgia',
    fontWeight: '500',
  },
  toggleButtonTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  mapContainer: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    minHeight: '50vh',
    maxHeight: '70vh',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  provincesList: {
    flex: 1,
    paddingHorizontal: 4,
  },
  provinceItem: {
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  provinceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  provinceName: {
    fontSize: 20,
    fontWeight: '600',
    fontFamily: 'Georgia',
    flex: 1,
    marginBottom: 4,
  },
  regionBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
  },
  regionBadgeText: {
    fontSize: 13,
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
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '95%',
    maxWidth: 500,
    borderRadius: 20,
    maxHeight: '85%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
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
