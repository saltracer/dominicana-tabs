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

// Platform-specific imports
let MapView: any = null;
let Marker: any = null;
let Polygon: any = null;

if (Platform.OS !== 'web') {
  const Maps = require('react-native-maps');
  MapView = Maps.default;
  Marker = Maps.Marker;
  Polygon = Maps.Polygon;
}

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
    setShowModal(true);
    onProvinceSelect?.(province);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedProvince(null);
  };

  const getProvinceColor = (province: Province) => {
    // Use the province's own color if available, otherwise fall back to region color
    if (province.color) {
      return province.color;
    }
    
    // Fallback to region-based colors only if province doesn't have its own color
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
    
    // Zoom to fit all provinces after a short delay
    setTimeout(() => {
      if (mapRef.current && allProvinces.length > 0) {
        const coordinates = allProvinces
          .filter(province => province.coordinates && province.coordinates.length === 2)
          .map(province => ({
            latitude: province.coordinates[0],
            longitude: province.coordinates[1],
          }));
        
        if (coordinates.length > 0) {
          mapRef.current.fitToCoordinates(coordinates, {
            edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
            animated: true,
          });
        }
      }
    }, 1000);
  };

  const renderPolygons = () => {
    if (!Polygon) return null;
    
    return filteredProvinces.map((province) => {
      try {
        // Check if boundaries exist and have the correct structure
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

            // Take the first ring of the polygon (outer boundary)
            const ring = polygon[0];
            if (!Array.isArray(ring) || ring.length < 3) {
              return null;
            }

            const coordinates = ring.map((coord: number[]) => ({
              latitude: coord[1],  // GeoJSON format is [longitude, latitude]
              longitude: coord[0], // So we keep this as is for boundaries
            }));

            return (
              <Polygon
                key={`polygon-${province.id}-${polygonIndex}`}
                coordinates={coordinates}
                fillColor={`${regionColor}20`}
                strokeColor={regionColor}
                strokeWidth={1}
                onPress={() => handleMarkerPress(province)}
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

                      const coordinates = ring.map((coord: number[]) => ({
              latitude: coord[1],  // GeoJSON format is [longitude, latitude]
              longitude: coord[0], // So we keep this as is for boundaries
            }));

          return (
            <Polygon
              key={`polygon-${province.id}`}
              coordinates={coordinates}
              fillColor={`${regionColor}20`}
              strokeColor={regionColor}
              strokeWidth={1}
              onPress={() => handleMarkerPress(province)}
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

  // Web fallback
  if (Platform.OS === 'web') {
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

  // Add error boundary for the entire component
  if (!allProvinces || allProvinces.length === 0) {
    return (
      <View style={[styles.container, styles.errorContainer]}>
        <Text style={[styles.errorText, { color: Colors[colorScheme ?? 'light'].text }]}>
          No province data available
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Region Filter */}
      <View style={[styles.filterContainer, { backgroundColor: Colors[colorScheme ?? 'light'].surface }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
          <TouchableOpacity
            style={[
              styles.filterButton,
              { backgroundColor: selectedRegion === null ? Colors[colorScheme ?? 'light'].primary : 'transparent' }
            ]}
            onPress={() => setSelectedRegion(null)}
          >
            <Text style={[
              styles.filterButtonText,
              { color: selectedRegion === null ? Colors[colorScheme ?? 'light'].dominicanWhite : Colors[colorScheme ?? 'light'].text }
            ]}>
              All ({allProvinces.length})
            </Text>
          </TouchableOpacity>
          {mainRegions.map((region) => (
            <TouchableOpacity
              key={region}
              style={[
                styles.filterButton,
                { backgroundColor: selectedRegion === region ? Colors[colorScheme ?? 'light'].primary : 'transparent' }
              ]}
              onPress={() => setSelectedRegion(region)}
            >
              <Text style={[
                styles.filterButtonText,
                { color: selectedRegion === region ? Colors[colorScheme ?? 'light'].dominicanWhite : Colors[colorScheme ?? 'light'].text }
              ]}>
                {region} ({allProvinces.filter(p => getMainRegion(p.region) === region).length})
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={{
          latitude: 20,
          longitude: 0,
          latitudeDelta: 60,
          longitudeDelta: 60,
        }}
        showsUserLocation={false}
        showsMyLocationButton={false}
        showsCompass={true}
        showsScale={true}
        showsZoomControls={true}
        zoomEnabled={true}
        scrollEnabled={true}
        rotateEnabled={true}
        pitchEnabled={true}
        mapType="standard"
        onMapReady={handleMapReady}
      >
        {filteredProvinces.map((province) => {
          try {
            // Validate coordinates exist and are valid numbers
            if (!province.coordinates || 
                typeof province.coordinates[0] !== 'number' || 
                typeof province.coordinates[1] !== 'number' ||
                isNaN(province.coordinates[0]) || 
                isNaN(province.coordinates[1])) {
              console.warn(`Invalid coordinates for province ${province.id}:`, province.coordinates);
              return null;
            }

            return (
              <Marker
                key={province.id}
                coordinate={{
                  latitude: province.coordinates[0],  // First value is latitude
                  longitude: province.coordinates[1], // Second value is longitude
                }}
                title={province.name}
                description={province.short_description}
                onPress={() => handleMarkerPress(province)}
                pinColor={getProvinceColor(province)}
              />
            );
          } catch (error) {
            console.warn(`Error rendering marker for province ${province.id}:`, error);
            return null;
          }
        })}
        
        {/* Render province boundaries as polygons */}
        {mapReady && renderPolygons()}
      </MapView>

      {/* Province Detail Modal */}
      <Modal
        visible={showModal}
        animationType="slide"
        transparent={true}
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={[
            styles.modalContent,
            { backgroundColor: Colors[colorScheme ?? 'light'].card }
          ]}>
            <View style={styles.modalHeader}>
              <Text style={[
                styles.modalTitle,
                { color: Colors[colorScheme ?? 'light'].text }
              ]}>
                {selectedProvince?.name}
              </Text>
              <TouchableOpacity onPress={closeModal} style={styles.closeButton}>
                <Text style={[
                  styles.closeButtonText,
                  { color: Colors[colorScheme ?? 'light'].text }
                ]}>
                  ✕
                </Text>
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              {selectedProvince && (
                <>
                  <View style={styles.provinceInfo}>
                    <Text style={[
                      styles.provinceRegion,
                      { color: Colors[colorScheme ?? 'light'].textSecondary }
                    ]}>
                      {getMainRegion(selectedProvince.region)} • {selectedProvince.region}
                    </Text>
                    
                    <Text style={[
                      styles.provinceDescription,
                      { color: Colors[colorScheme ?? 'light'].text }
                    ]}>
                      {selectedProvince.description}
                    </Text>
                    
                    <View style={styles.provinceDetails}>
                      <Text style={[
                        styles.detailLabel,
                        { color: Colors[colorScheme ?? 'light'].textSecondary }
                      ]}>
                        Countries:
                      </Text>
                      <Text style={[
                        styles.detailValue,
                        { color: Colors[colorScheme ?? 'light'].text }
                      ]}>
                        {selectedProvince.countries.join(', ')}
                      </Text>
                      
                      <Text style={[
                        styles.detailLabel,
                        { color: Colors[colorScheme ?? 'light'].textSecondary }
                      ]}>
                        Formation Date:
                      </Text>
                      <Text style={[
                        styles.detailValue,
                        { color: Colors[colorScheme ?? 'light'].text }
                      ]}>
                        {selectedProvince.formation_date}
                      </Text>
                      
                      {selectedProvince.patronSaint && (
                        <>
                          <Text style={[
                            styles.detailLabel,
                            { color: Colors[colorScheme ?? 'light'].textSecondary }
                          ]}>
                            Patron Saint:
                          </Text>
                          <Text style={[
                            styles.detailValue,
                            { color: Colors[colorScheme ?? 'light'].text }
                          ]}>
                            {selectedProvince.patronSaint}
                          </Text>
                        </>
                      )}
                    </View>
                    
                    <TouchableOpacity
                      style={[
                        styles.websiteButton,
                        { backgroundColor: Colors[colorScheme ?? 'light'].primary }
                      ]}
                      onPress={() => {
                        // Handle website navigation
                        closeModal();
                      }}
                    >
                      <Text style={[
                        styles.websiteButtonText,
                        { color: Colors[colorScheme ?? 'light'].dominicanWhite }
                      ]}>
                        Visit Website
                      </Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </ScrollView>
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
  },
  map: {
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    maxHeight: '80%',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 20,
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
    fontWeight: '700',
    fontFamily: 'Georgia',
    flex: 1,
  },
  closeButton: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    fontWeight: '600',
  },
  modalBody: {
    padding: 20,
  },
  provinceInfo: {
    gap: 16,
  },
  provinceRegion: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Georgia',
  },
  provinceDescription: {
    fontSize: 16,
    lineHeight: 24,
    fontFamily: 'Georgia',
  },
  provinceDetails: {
    gap: 8,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Georgia',
  },
  detailValue: {
    fontSize: 16,
    fontFamily: 'Georgia',
    marginBottom: 12,
  },
  websiteButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  websiteButtonText: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Georgia',
  },
  errorContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  errorText: {
    fontSize: 16,
    fontFamily: 'Georgia',
    textAlign: 'center',
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
  provinceCount: {
    fontSize: 14,
    fontFamily: 'Georgia',
    textAlign: 'center',
    marginBottom: 12,
  },
  filterContainer: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  filterScroll: {
    flexGrow: 0,
  },
  filterButton: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  filterButtonText: {
    fontSize: 11,
    fontWeight: '600',
    fontFamily: 'Georgia',
  },
});
