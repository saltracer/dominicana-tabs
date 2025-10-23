import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, getLiturgicalColorHex } from '../constants/Colors';
import { useTheme } from './ThemeProvider';
import { LiturgicalDay, Celebration } from '../types';
import { parseISO, format } from 'date-fns';
import SaintContentRenderer, { convertFeastToSaint, formatLiturgicalDay } from './SaintContentRenderer';

interface FeastDetailPanelProps {
  liturgicalDay: LiturgicalDay;
  isVisible: boolean;
  onClose?: () => void;
}



const FeastDetailPanel: React.FC<FeastDetailPanelProps> = ({ 
  liturgicalDay, 
  isVisible, 
  onClose 
}) => {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme ?? 'light'];
  
  if (!isVisible || !liturgicalDay) {
    return null;
  }
  
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Scrollable Content - includes header and feasts */}
      <ScrollView 
        style={styles.panelContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Close Button - only show if onClose is provided */}
        {onClose && (
          <View style={styles.closeButtonContainer}>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
        )}

        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.surface }]}>
          <View style={styles.headerContent}>
            <View style={styles.dateSection}>
              <Text style={[styles.dateText, { color: colors.text }]}>
                {format(parseISO(liturgicalDay.date), 'EEEE, MMMM d, yyyy')}
              </Text>
            </View>
          </View>
          
          {/* Liturgical Season */}
          <View style={[
            styles.seasonInfo, 
            { 
              backgroundColor: getLiturgicalColorHex(liturgicalDay.season.color, colorScheme === 'dark'),
              borderWidth: (liturgicalDay.season.color.toLowerCase() === 'white' || liturgicalDay.season.color.toLowerCase() === 'gold') ? 1 : 0,
              borderColor: (liturgicalDay.season.color.toLowerCase() === 'white' || liturgicalDay.season.color.toLowerCase() === 'gold') ? '#666666' : 'transparent',
            }
          ]}>
            <View style={styles.seasonHeader}>
              <Text style={[styles.seasonName, { 
                color: (liturgicalDay.season.color.toLowerCase() === 'white' || liturgicalDay.season.color.toLowerCase() === 'gold') ? '#000000' : '#FFFFFF' 
              }]}>
                {liturgicalDay.season.name}
              </Text>
            </View>
            <Text style={[styles.seasonWeek, { 
              color: (liturgicalDay.season.color.toLowerCase() === 'white' || liturgicalDay.season.color.toLowerCase() === 'gold') ? '#000000' : '#FFFFFF' 
            }]}>
              {liturgicalDay.weekString || `Week ${liturgicalDay.week}`}
            </Text>
            {/* Show total number of feasts */}
            {/* {liturgicalDay.feasts.length > 0 && (
              <View style={styles.feastCountContainer}>
                <Text style={[styles.feastCount, { color: '#FFFFFF' }]}>
                  {liturgicalDay.feasts.length} {liturgicalDay.feasts.length === 1 ? 'Feast' : 'Feasts'}
                </Text>
              </View>
            )} */}
          </View>
        </View>
        
        {/* Feast Content */}
        {!!liturgicalDay.feasts && liturgicalDay.feasts.length > 0 ? (
          liturgicalDay.feasts.map((feast, index) => (
            <View key={index} style={styles.feastContainer}>
              <SaintContentRenderer 
                saint={convertFeastToSaint(feast)} 
                colorScheme={colorScheme}
                defaultExpanded={false}
                liturgicalDay={liturgicalDay}
              />
            </View>
          ))
        ) : (
          <View style={styles.noFeastsContainer}>
            <Ionicons name="calendar-outline" size={48} color={colors.textMuted} />
            <Text style={[styles.noFeastsText, { color: colors.textMuted }]}>
              No special feasts for this day
            </Text>
            <Text style={[styles.noFeastsSubtext, { color: colors.textSecondary }]}>
              This is a ferial day in {liturgicalDay.season.name}
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: '100%',
    borderRadius: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  closeButtonContainer: {
    alignItems: 'flex-end',
    padding: 0,
    paddingBottom: 0,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    //borderWidth: 1,
  },
  headerContent: {
    flexDirection: 'row',
    //justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  dateSection: {
    flex: 1,
  },
  dateLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  dateText: {
    fontSize: 20,
    fontWeight: '700',
    fontFamily: 'Georgia',
  },
  closeButton: {
    padding: 2,
    // borderRadius: 20,
    // backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  seasonInfo: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  seasonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  seasonName: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'Georgia',
  },
  seasonWeek: {
    fontSize: 14,
    fontFamily: 'Georgia',
    marginBottom: 4,
  },
  feastCountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  feastCount: {
    fontSize: 12,
    fontFamily: 'Georgia',
    fontWeight: '600',
  },
  panelContent: {
    flex: 1,
    paddingHorizontal: 16,
  },
  feastContainer: {
    marginBottom: 20,
  },
  noFeastsContainer: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 40,
  },
  noFeastsText: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Georgia',
    marginTop: 16,
    marginBottom: 8,
  },
  noFeastsSubtext: {
    fontSize: 14,
    fontFamily: 'Georgia',
    textAlign: 'center',
  },
});

export default FeastDetailPanel;
