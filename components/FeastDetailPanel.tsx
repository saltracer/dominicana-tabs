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

interface FeastDetailPanelProps {
  liturgicalDay: LiturgicalDay;
  isVisible: boolean;
  onClose?: () => void;
}

interface FeastCardProps {
  feast: Celebration;
  index: number;
  isExpanded: boolean;
  onToggle: () => void;
  colorScheme: 'light' | 'dark' | null;
}

const FeastCard: React.FC<FeastCardProps> = ({ 
  feast, 
  index, 
  isExpanded, 
  onToggle, 
  colorScheme 
}) => {
  const colors = Colors[colorScheme ?? 'light'];
  
  return (
    <View style={[styles.feastCard, { backgroundColor: colors.card }]}>
      {/* Feast Header */}
      <TouchableOpacity 
        style={styles.feastHeader}
        onPress={onToggle}
        activeOpacity={0.7}
      >
        <View style={styles.feastHeaderContent}>
          {/* Rank Badge */}
          <View style={[
            styles.rankBadge,
            { backgroundColor: getLiturgicalColorHex(feast.color, colorScheme === 'dark') }
          ]}>
            <Text style={[
              styles.rankText,
              { color: feast.color?.toLowerCase() === 'white' ? '#000000' : '#FFFFFF' }
            ]}>
              {feast.rank.charAt(0).toUpperCase()}
            </Text>
          </View>
          
          {/* Feast Name and Info */}
          <View style={styles.feastInfo}>
            <Text style={[styles.feastName, { color: colors.text }]}>
              {feast.name}
            </Text>
            <View style={styles.feastMeta}>
              <Text style={[styles.feastRank, { color: colors.textSecondary }]}>
                {feast.rank}
              </Text>
              {feast.isDominican && (
                <View style={styles.dominicanBadge}>
                  <Ionicons name="star" size={12} color={colors.primary} />
                  <Text style={[styles.dominicanText, { color: colors.primary }]}>
                    Dominican
                  </Text>
                </View>
              )}
              {/* Show if it's a Doctor of the Church */}
              {feast.name.includes('Doctor') && (
                <View style={[styles.doctorBadge, { backgroundColor: colors.primary }]}>
                  <Ionicons name="school" size={12} color={colors.dominicanWhite} />
                  <Text style={[styles.doctorText, { color: colors.dominicanWhite }]}>
                    Doctor
                  </Text>
                </View>
              )}
            </View>
            {/* Short description preview */}
            {feast.description && (
              <Text style={[styles.feastPreview, { color: colors.textSecondary }]} numberOfLines={2}>
                {Array.isArray(feast.description) ? feast.description[0] : feast.description}
              </Text>
            )}
          </View>
          
          {/* Expand/Collapse Icon */}
          <Ionicons 
            name={isExpanded ? "chevron-up" : "chevron-down"} 
            size={20} 
            color={colors.textSecondary} 
          />
        </View>
      </TouchableOpacity>
      
      {/* Expanded Content */}
      {isExpanded && (
        <Animated.View style={styles.expandedContent}>
          {/* Date Range with Enhanced Information */}
          {(feast.birthYear || feast.deathYear) && (
            <View style={styles.dateRangeSection}>
              <View style={styles.dateInfoRow}>
                <Ionicons name="calendar-outline" size={16} color={colors.textSecondary} />
                <Text style={[styles.dateRangeText, { color: colors.textSecondary }]}>
                  {feast.birthYear && feast.deathYear 
                    ? `${feast.birthYear} - ${feast.deathYear}`
                    : feast.deathYear ? `d. ${feast.deathYear}` : `b. ${feast.birthYear}`
                  }
                </Text>
              </View>
            </View>
          )}
          
          {/* Patronage */}
          {feast.patronage && (
            <View style={styles.detailSection}>
              <View style={styles.sectionHeader}>
                <Ionicons name="shield-checkmark-outline" size={18} color={colors.primary} />
                <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
                  Patronage
                </Text>
              </View>
              <View style={styles.patronageContainer}>
                <Text style={[styles.detailValue, { color: colors.text }]}>
                  {feast.patronage}
                </Text>
              </View>
            </View>
          )}
          
          {/* Biography */}
          {feast.biography && (
            <View style={styles.detailSection}>
              <View style={styles.sectionHeader}>
                <Ionicons name="book-outline" size={18} color={colors.primary} />
                <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
                  Biography
                </Text>
              </View>
              {Array.isArray(feast.biography) ? (
                feast.biography.map((paragraph, idx) => (
                  <Text 
                    key={idx} 
                    style={[
                      styles.detailValue, 
                      { color: colors.text },
                      idx > 0 && styles.biographyParagraph
                    ]}
                  >
                    {paragraph}
                  </Text>
                ))
              ) : (
                <Text style={[styles.detailValue, { color: colors.text }]}>
                  {feast.biography}
                </Text>
              )}
            </View>
          )}
          
          {/* Prayers */}
          {feast.prayers && (
            <View style={styles.detailSection}>
              <View style={styles.sectionHeader}>
                <Ionicons name="heart-outline" size={18} color={colors.primary} />
                <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
                  Prayers
                </Text>
              </View>
              <View style={styles.prayerContainer}>
                <Text style={[styles.prayerText, { color: colors.text }]}>
                  {feast.prayers}
                </Text>
              </View>
            </View>
          )}
          
          {/* Books/Resources */}
          {feast.books && feast.books.length > 0 && (
            <View style={styles.detailSection}>
              <View style={styles.sectionHeader}>
                <Ionicons name="library-outline" size={18} color={colors.primary} />
                <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
                  Recommended Reading
                </Text>
              </View>
              <View style={styles.booksContainer}>
                {feast.books.map((book, idx) => (
                  <View key={idx} style={[styles.bookItem, { backgroundColor: colors.surface }]}>
                    <Text style={[styles.bookTitle, { color: colors.text }]}>
                      {typeof book === 'string' ? book : book.title || book.name}
                    </Text>
                    {typeof book === 'object' && book.author && (
                      <Text style={[styles.bookAuthor, { color: colors.textSecondary }]}>
                        by {book.author}
                      </Text>
                    )}
                  </View>
                ))}
              </View>
            </View>
          )}
          
          {/* Description (fallback) */}
          {!feast.patronage && !feast.biography && !feast.prayers && feast.description && (
            <View style={styles.detailSection}>
              <View style={styles.sectionHeader}>
                <Ionicons name="information-circle-outline" size={18} color={colors.primary} />
                <Text style={[styles.detailLabel, { color: colors.textSecondary }]}>
                  Description
                </Text>
              </View>
              {Array.isArray(feast.description) ? (
                feast.description.map((paragraph, idx) => (
                  <Text 
                    key={idx} 
                    style={[
                      styles.detailValue, 
                      { color: colors.text },
                      idx > 0 && styles.biographyParagraph
                    ]}
                  >
                    {paragraph}
                  </Text>
                ))
              ) : (
                <Text style={[styles.detailValue, { color: colors.text }]}>
                  {feast.description}
                </Text>
              )}
            </View>
          )}
        </Animated.View>
      )}
    </View>
  );
};

const FeastDetailPanel: React.FC<FeastDetailPanelProps> = ({ 
  liturgicalDay, 
  isVisible, 
  onClose 
}) => {
  const { colorScheme } = useTheme();
  const [expandedFeasts, setExpandedFeasts] = useState<Set<number>>(new Set());
  const colors = Colors[colorScheme ?? 'light'];
  
  const toggleFeastExpansion = (index: number) => {
    const newExpanded = new Set(expandedFeasts);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedFeasts(newExpanded);
  };
  
  if (!isVisible || !liturgicalDay) {
    return null;
  }
  
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.surface }]}>
        <View style={styles.headerContent}>
          <View style={styles.dateSection}>
            <Text style={[styles.dateLabel, { color: colors.textSecondary }]}>
              Selected Date
            </Text>
            <Text style={[styles.dateText, { color: colors.text }]}>
              {format(parseISO(liturgicalDay.date), 'EEEE, MMMM d, yyyy')}
            </Text>
          </View>
          
          {/* {onClose && (
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={onClose}
              activeOpacity={0.7}
            >
              <Ionicons name="close" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          )} */}
        </View>
        
        {/* Liturgical Season */}
        <View style={[
          styles.seasonInfo, 
          { backgroundColor: getLiturgicalColorHex(liturgicalDay.season.name, colorScheme === 'dark') }
        ]}>
          <View style={styles.seasonHeader}>
            <Ionicons name="leaf-outline" size={20} color="#FFFFFF" />
            <Text style={[styles.seasonName, { color: '#FFFFFF' }]}>
              {liturgicalDay.season.name}
            </Text>
          </View>
          <Text style={[styles.seasonWeek, { color: '#FFFFFF' }]}>
            Week {liturgicalDay.week}
          </Text>
          {/* Show total number of feasts */}
          {liturgicalDay.feasts.length > 0 && (
            <View style={styles.feastCountContainer}>
              <Ionicons name="star-outline" size={16} color="#FFFFFF" />
              <Text style={[styles.feastCount, { color: '#FFFFFF' }]}>
                {liturgicalDay.feasts.length} {liturgicalDay.feasts.length === 1 ? 'Feast' : 'Feasts'}
              </Text>
            </View>
          )}
        </View>
      </View>
      
      {/* Feast Content */}
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {liturgicalDay.feasts.length > 0 ? (
          <View style={styles.feastsContainer}>
            <Text style={[styles.feastsTitle, { color: colors.text }]}>
              {liturgicalDay.feasts.length === 1 ? 'Feast' : 'Feasts'} for this Day
            </Text>
            
            {liturgicalDay.feasts.map((feast, index) => (
              <FeastCard
                key={index}
                feast={feast}
                index={index}
                isExpanded={expandedFeasts.has(index)}
                onToggle={() => toggleFeastExpansion(index)}
                colorScheme={colorScheme}
              />
            ))}
          </View>
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
    flex: 1,
    borderRadius: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
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
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
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
    gap: 8,
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
    gap: 6,
    marginTop: 4,
  },
  feastCount: {
    fontSize: 12,
    fontFamily: 'Georgia',
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    //paddingHorizontal: 20,
    paddingBottom: 20,
  },
  feastsContainer: {
    paddingTop: 20,
  },
  feastsTitle: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'Georgia',
    marginBottom: 16,
  },
  feastCard: {
    borderRadius: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  feastHeader: {
    padding: 16,
    //borderWidth: 1,
  },
  feastHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rankBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  rankText: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'Georgia',
  },
  feastInfo: {
    flex: 1,
  },
  feastName: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'Georgia',
    marginBottom: 4,
  },
  feastMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  feastRank: {
    fontSize: 14,
    fontFamily: 'Georgia',
    marginRight: 12,
  },
  dominicanBadge: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dominicanText: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'Georgia',
  },
  doctorBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  doctorText: {
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'Georgia',
  },
  feastPreview: {
    fontSize: 14,
    fontFamily: 'Georgia',
    marginTop: 4,
    lineHeight: 18,
  },
  expandedContent: {
    //paddingHorizontal: 16,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
  },
  dateRangeSection: {
    alignItems: 'center',
    marginBottom: 16,
    paddingTop: 16,
  },
  dateInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dateRangeText: {
    fontSize: 16,
    fontFamily: 'Georgia',
    fontStyle: 'italic',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  patronageContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#4CAF50',
  },
  prayerContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#E91E63',
  },
  booksContainer: {
    gap: 8,
  },
  bookItem: {
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#FF9800',
  },
  bookTitle: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Georgia',
    marginBottom: 4,
  },
  bookAuthor: {
    fontSize: 14,
    fontFamily: 'Georgia',
    fontStyle: 'italic',
  },
  detailSection: {
    marginBottom: 16,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  detailValue: {
    fontSize: 16,
    lineHeight: 24,
    fontFamily: 'Georgia',
  },
  biographyParagraph: {
    marginTop: 12,
  },
  prayerText: {
    fontSize: 16,
    lineHeight: 24,
    fontStyle: 'italic',
    fontFamily: 'Georgia',
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
