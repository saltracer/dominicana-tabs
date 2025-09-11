import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Platform,
} from 'react-native';
import { Colors } from '../constants/Colors';
import { useTheme } from './ThemeProvider';
import { Province } from '../types';

interface ProvinceDetailsPanelProps {
  province: Province;
  onClose?: () => void;
  variant?: 'modal' | 'panel';
}

export default function ProvinceDetailsPanel({ 
  province, 
  onClose, 
  variant = 'modal' 
}: ProvinceDetailsPanelProps) {
  const { colorScheme } = useTheme();

  const handleWebsitePress = async (url: string) => {
    try {
      await Linking.openURL(url);
    } catch (error) {
      console.error('Failed to open website:', error);
    }
  };

  const formatFormationDate = (date: string | number) => {
    if (typeof date === 'number') {
      return date.toString();
    }
    return date;
  };

  const getMainRegion = (region: string): string => {
    const regionMapping: { [key: string]: string } = {
      'West Africa': 'Africa',
      'Central Africa': 'Africa', 
      'Southern Africa': 'Africa',
      'Equatorial Africa': 'Africa',
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
      'Asia-Pacific': 'Asia-Pacific',
      'Philippines': 'Asia-Pacific',
      'Vietnam': 'Asia-Pacific',
      'Taiwan': 'Asia-Pacific',
      'India': 'Asia-Pacific',
      'Pakistan': 'Asia-Pacific',
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
      'Oceania': 'Oceania',
    };
    
    return regionMapping[region] || 'Other';
  };

  const containerStyle = variant === 'panel' ? styles.panelContainer : styles.modalContainer;
  const headerStyle = variant === 'panel' ? styles.panelHeader : styles.modalHeader;

  return (
    <View style={[containerStyle, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
      {/* Header */}
      <View style={[headerStyle, { borderBottomColor: Colors[colorScheme ?? 'light'].border }]}>
        <View style={styles.headerContent}>
          <View style={styles.titleSection}>
            <Text style={[styles.provinceName, { color: Colors[colorScheme ?? 'light'].text }]}>
              {province.name}
            </Text>
            {province.latinName && (
              <Text style={[styles.latinName, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                {province.latinName}
              </Text>
            )}
            <View style={styles.regionBadge}>
              <Text style={[styles.regionText, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                {getMainRegion(province.region)} • {province.region}
              </Text>
            </View>
          </View>
          {onClose && (
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={[styles.closeButtonText, { color: Colors[colorScheme ?? 'light'].text }]}>
                ✕
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Content */}
      <ScrollView 
        style={styles.content} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Short Description */}
        <View style={[styles.section, { backgroundColor: Colors[colorScheme ?? 'light'].surface }]}>
          <Text style={[styles.sectionTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
            Overview
          </Text>
          <Text style={[styles.description, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
            {province.short_description}
          </Text>
        </View>

        {/* Basic Information */}
        <View style={[styles.section, { backgroundColor: Colors[colorScheme ?? 'light'].surface }]}>
          <Text style={[styles.sectionTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
            Basic Information
          </Text>
          
          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <Text style={[styles.infoLabel, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                Countries
              </Text>
              <Text style={[styles.infoValue, { color: Colors[colorScheme ?? 'light'].text }]}>
                {province.countries.join(', ')}
              </Text>
            </View>
            
            <View style={styles.infoItem}>
              <Text style={[styles.infoLabel, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                Formation Date
              </Text>
              <Text style={[styles.infoValue, { color: Colors[colorScheme ?? 'light'].text }]}>
                {formatFormationDate(province.formation_date)}
              </Text>
            </View>
            
            {province.patronSaint && (
              <View style={styles.infoItem}>
                <Text style={[styles.infoLabel, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                  Patron Saint
                </Text>
                <Text style={[styles.infoValue, { color: Colors[colorScheme ?? 'light'].text }]}>
                  {province.patronSaint}
                </Text>
              </View>
            )}
            
            {province.province_saint && (
              <View style={styles.infoItem}>
                <Text style={[styles.infoLabel, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                  Province Saint
                </Text>
                <Text style={[styles.infoValue, { color: Colors[colorScheme ?? 'light'].text }]}>
                  {province.province_saint}
                  {province.province_saint_feast_day && ` (${province.province_saint_feast_day})`}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Detailed Description */}
        {province.description && (
          <View style={[styles.section, { backgroundColor: Colors[colorScheme ?? 'light'].surface }]}>
            <Text style={[styles.sectionTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
              History & Mission
            </Text>
            <Text style={[styles.description, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
              {province.description}
            </Text>
          </View>
        )}

        {/* Notable Dominicans */}
        {province.notable_dominicans && province.notable_dominicans.length > 0 && (
          <View style={[styles.section, { backgroundColor: Colors[colorScheme ?? 'light'].surface }]}>
            <Text style={[styles.sectionTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
              Notable Dominicans
            </Text>
            {province.notable_dominicans.map((dominican, index) => (
              <View key={index} style={styles.dominicanItem}>
                <View style={styles.dominicanHeader}>
                  <Text style={[styles.dominicanName, { color: Colors[colorScheme ?? 'light'].text }]}>
                    {dominican.name}
                  </Text>
                  <Text style={[styles.dominicanDates, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                    {dominican.dates}
                  </Text>
                </View>
                <Text style={[styles.dominicanDescription, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                  {dominican.description}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Priories */}
        {province.priories && province.priories.length > 0 && (
          <View style={[styles.section, { backgroundColor: Colors[colorScheme ?? 'light'].surface }]}>
            <Text style={[styles.sectionTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
              Major Priories
            </Text>
            {province.priories.map((priory, index) => (
              <View key={index} style={styles.prioryItem}>
                <View style={styles.prioryHeader}>
                  <Text style={[styles.prioryName, { color: Colors[colorScheme ?? 'light'].text }]}>
                    {priory.name}
                  </Text>
                  {priory.isProvincialHouse && (
                    <View style={[styles.provincialHouseBadge, { backgroundColor: Colors[colorScheme ?? 'light'].primary }]}>
                      <Text style={[styles.provincialHouseText, { color: Colors[colorScheme ?? 'light'].dominicanWhite }]}>
                        Provincial House
                      </Text>
                    </View>
                  )}
                </View>
                <Text style={[styles.prioryLocation, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                  {priory.location}
                  {priory.founded && ` • Founded ${priory.founded}`}
                </Text>
                {priory.description && (
                  <Text style={[styles.prioryDescription, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                    {priory.description}
                  </Text>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Apostolates */}
        {province.apostolates && province.apostolates.length > 0 && (
          <View style={[styles.section, { backgroundColor: Colors[colorScheme ?? 'light'].surface }]}>
            <Text style={[styles.sectionTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
              Apostolates & Ministries
            </Text>
            <View style={styles.apostolatesList}>
              {province.apostolates.map((apostolate, index) => (
                <View key={index} style={styles.apostolateItem}>
                  <Text style={[styles.apostolateBullet, { color: Colors[colorScheme ?? 'light'].primary }]}>
                    •
                  </Text>
                  <Text style={[styles.apostolateText, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                    {apostolate}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Websites */}
        <View style={[styles.section, { backgroundColor: Colors[colorScheme ?? 'light'].surface }]}>
          <Text style={[styles.sectionTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
            Links
          </Text>
          <View style={styles.websiteButtons}>
            {province.website && (
              <TouchableOpacity
                style={[styles.websiteButton, { backgroundColor: Colors[colorScheme ?? 'light'].primary }]}
                onPress={() => handleWebsitePress(province.website)}
              >
                <Text style={[styles.websiteButtonText, { color: Colors[colorScheme ?? 'light'].dominicanWhite }]}>
                  Official Website
                </Text>
              </TouchableOpacity>
            )}
            {province.lay_website && (
              <TouchableOpacity
                style={[styles.websiteButton, { backgroundColor: Colors[colorScheme ?? 'light'].secondary }]}
                onPress={() => handleWebsitePress(province.lay_website)}
              >
                <Text style={[styles.websiteButtonText, { color: Colors[colorScheme ?? 'light'].dominicanWhite }]}>
                  Lay Dominican Website
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  // Container styles
  modalContainer: {
    flex: 1,
    maxHeight: '85%',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  panelContainer: {
    flex: 1,
    borderRadius: 0,
    borderLeftWidth: 1,
    borderLeftColor: '#E0E0E0',
  },
  
  // Header styles
  modalHeader: {
    padding: 24,
    borderBottomWidth: 1,
  },
  panelHeader: {
    padding: 20,
    borderBottomWidth: 1,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  titleSection: {
    flex: 1,
    marginRight: 16,
  },
  provinceName: {
    fontSize: 24,
    fontWeight: '700',
    fontFamily: 'Georgia',
    marginBottom: 4,
  },
  latinName: {
    fontSize: 16,
    fontStyle: 'italic',
    fontFamily: 'Georgia',
    marginBottom: 8,
  },
  regionBadge: {
    alignSelf: 'flex-start',
  },
  regionText: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Georgia',
  },
  closeButton: {
    padding: 4,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 20,
    fontWeight: '600',
  },
  
  // Content styles
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  section: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Georgia',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    fontFamily: 'Georgia',
  },
  
  // Info grid styles
  infoGrid: {
    gap: 16,
  },
  infoItem: {
    gap: 4,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Georgia',
  },
  infoValue: {
    fontSize: 16,
    fontFamily: 'Georgia',
  },
  
  // Notable Dominicans styles
  dominicanItem: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  dominicanHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  dominicanName: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Georgia',
    flex: 1,
  },
  dominicanDates: {
    fontSize: 14,
    fontFamily: 'Georgia',
    fontStyle: 'italic',
  },
  dominicanDescription: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: 'Georgia',
  },
  
  // Priories styles
  prioryItem: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  prioryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  prioryName: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Georgia',
    flex: 1,
    marginRight: 8,
  },
  provincialHouseBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  provincialHouseText: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'Georgia',
  },
  prioryLocation: {
    fontSize: 14,
    fontFamily: 'Georgia',
    marginBottom: 8,
  },
  prioryDescription: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: 'Georgia',
  },
  
  // Apostolates styles
  apostolatesList: {
    gap: 12,
  },
  apostolateItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  apostolateBullet: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 2,
  },
  apostolateText: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: 'Georgia',
    flex: 1,
  },
  
  // Website buttons styles
  websiteButtons: {
    gap: 12,
  },
  websiteButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  websiteButtonText: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Georgia',
  },
});
