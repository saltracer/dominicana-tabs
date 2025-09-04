import React from 'react';
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
import { Colors } from '../constants/Colors';
import { useTheme } from './ThemeProvider';
import { Saint } from '../types/saint-types';
import { CelebrationRank } from '../types/celebrations-types';

interface SaintDetailPanelProps {
  selectedSaint: Saint | null;
  isVisible: boolean;
  onClose: () => void;
  onPrevious: () => void;
  onNext: () => void;
  hasPrevious: boolean;
  hasNext: boolean;
  slideAnimation: Animated.Value;
}

export default function SaintDetailPanel({
  selectedSaint,
  isVisible,
  onClose,
  onPrevious,
  onNext,
  hasPrevious,
  hasNext,
  slideAnimation,
}: SaintDetailPanelProps) {
  const { colorScheme } = useTheme();

  const formatFeastDay = (feastDay: string) => {
    const [month, day] = feastDay.split('-');
    const monthNames = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    return `${monthNames[parseInt(month) - 1]} ${parseInt(day)}`;
  };

  const getRankColor = (rank?: CelebrationRank) => {
    switch (rank) {
      case CelebrationRank.SOLEMNITY:
        return Colors[colorScheme ?? 'light'].primary;
      case CelebrationRank.FEAST:
        return Colors[colorScheme ?? 'light'].secondary;
      case CelebrationRank.MEMORIAL:
        return Colors[colorScheme ?? 'light'].accent;
      default:
        return Colors[colorScheme ?? 'light'].textSecondary;
    }
  };

  const getLiturgicalColor = (color?: string) => {
    switch (color?.toLowerCase()) {
      case 'red':
        return '#DC2626'; // Red for martyrs
      case 'white':
        return '#F3F4F6'; // White for non-martyrs
      case 'green':
        return '#059669'; // Green for ordinary time
      case 'purple':
        return '#7C3AED'; // Purple for penitential seasons
      case 'rose':
        return '#EC4899'; // Rose for Gaudete/Laetare Sunday
      case 'gold':
        return '#D97706'; // Gold for special celebrations
      default:
        return Colors[colorScheme ?? 'light'].textSecondary;
    }
  };

  if (!selectedSaint) return null;

  return (
    <Animated.View
      style={[
        styles.panel,
        {
          backgroundColor: Colors[colorScheme ?? 'light'].background,
          borderLeftColor: Colors[colorScheme ?? 'light'].border,
          transform: [
            {
              translateX: slideAnimation.interpolate({
                inputRange: [0, 1],
                outputRange: [Math.min(500, screenWidth * 0.45), 0],
              }),
            },
          ],
        },
      ]}
    >
      {/* Panel Header */}
      <View style={[styles.panelHeader, { borderBottomColor: Colors[colorScheme ?? 'light'].border }]}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            onPress={onPrevious}
            disabled={!hasPrevious}
            style={[
              styles.navButton,
              {
                backgroundColor: hasPrevious 
                  ? Colors[colorScheme ?? 'light'].primary 
                  : Colors[colorScheme ?? 'light'].border,
              }
            ]}
          >
            <Ionicons 
              name="chevron-back" 
              size={20} 
              color={hasPrevious 
                ? Colors[colorScheme ?? 'light'].dominicanWhite 
                : Colors[colorScheme ?? 'light'].textMuted
              } 
            />
          </TouchableOpacity>
          
          <TouchableOpacity
            onPress={onNext}
            disabled={!hasNext}
            style={[
              styles.navButton,
              {
                backgroundColor: hasNext 
                  ? Colors[colorScheme ?? 'light'].primary 
                  : Colors[colorScheme ?? 'light'].border,
              }
            ]}
          >
            <Ionicons 
              name="chevron-forward" 
              size={20} 
              color={hasNext 
                ? Colors[colorScheme ?? 'light'].dominicanWhite 
                : Colors[colorScheme ?? 'light'].textMuted
              } 
            />
          </TouchableOpacity>
        </View>

        <Text style={[styles.panelTitle, { color: Colors[colorScheme ?? 'light'].text }]} numberOfLines={1}>
          {selectedSaint.name}
        </Text>

        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Ionicons name="close" size={24} color={Colors[colorScheme ?? 'light'].text} />
        </TouchableOpacity>
      </View>

      {/* Panel Content */}
      <ScrollView style={styles.panelContent} showsVerticalScrollIndicator={false}>
        <View style={styles.saintDetailHeader}>
          <Ionicons 
            name="person-circle" 
            size={80} 
            color={Colors[colorScheme ?? 'light'].primary} 
          />
          <View style={styles.saintDetailInfo}>
            <Text style={[styles.saintDetailName, { color: Colors[colorScheme ?? 'light'].text }]}>
              {selectedSaint.name}
            </Text>
            <Text style={[styles.saintDetailFeast, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
              Feast Day: {formatFeastDay(selectedSaint.feast_day)}
            </Text>
            {selectedSaint.birth_year && selectedSaint.death_year && (
              <Text style={[styles.saintDetailYears, { color: Colors[colorScheme ?? 'light'].textMuted }]}>
                {selectedSaint.birth_year} - {selectedSaint.death_year}
              </Text>
            )}
            
            {/* Badges */}
            <View style={styles.badgesContainer}>
              {selectedSaint.is_dominican && (
                <View style={[styles.dominicanBadge, { backgroundColor: Colors[colorScheme ?? 'light'].primary }]}>
                  <Text style={[styles.badgeText, { color: Colors[colorScheme ?? 'light'].dominicanWhite }]}>
                    Dominican
                  </Text>
                </View>
              )}
              {selectedSaint.is_doctor && (
                <View style={[styles.doctorBadge, { backgroundColor: Colors[colorScheme ?? 'light'].accent }]}>
                  <Text style={[styles.badgeText, { color: Colors[colorScheme ?? 'light'].dominicanWhite }]}>
                    Doctor of the Church
                  </Text>
                </View>
              )}
              {selectedSaint.color && (
                <View style={[
                  styles.colorBadge, 
                  { 
                    backgroundColor: getLiturgicalColor(selectedSaint.color),
                    borderWidth: selectedSaint.color === 'White' ? 1 : 0,
                    borderColor: selectedSaint.color === 'White' ? '#666666' : 'transparent',
                  }
                ]}>
                  <Text style={[
                    styles.badgeText, 
                    { 
                      color: selectedSaint.color === 'White' 
                        ? '#000000' 
                        : Colors[colorScheme ?? 'light'].dominicanWhite 
                    }
                  ]}>
                    {selectedSaint.color.charAt(0).toUpperCase() + selectedSaint.color.slice(1)}
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {selectedSaint.short_bio && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
              Biography
            </Text>
            <Text style={[styles.sectionContent, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
              {selectedSaint.short_bio}
            </Text>
          </View>
        )}

        {selectedSaint.patronage && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
              Patronage
            </Text>
            <Text style={[styles.sectionContent, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
              {selectedSaint.patronage}
            </Text>
          </View>
        )}

        {selectedSaint.biography && selectedSaint.biography.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
              Detailed Biography
            </Text>
            {selectedSaint.biography.map((paragraph: string, index: number) => (
              <Text key={index} style={[
                styles.sectionContent, 
                styles.biographyParagraph,
                { color: Colors[colorScheme ?? 'light'].textSecondary }
              ]}>
                {paragraph}
              </Text>
            ))}
          </View>
        )}

        {selectedSaint.prayers && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
              Prayer
            </Text>
            <Text style={[styles.sectionContent, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
              {selectedSaint.prayers}
            </Text>
          </View>
        )}

        {selectedSaint.quotes && selectedSaint.quotes.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
              Quotes
            </Text>
            {selectedSaint.quotes.map((quote: string, index: number) => (
              <View key={index} style={[styles.quoteContainer, { backgroundColor: Colors[colorScheme ?? 'light'].surface }]}>
                <Text style={[styles.quoteText, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                  "{quote}"
                </Text>
              </View>
            ))}
          </View>
        )}

        {selectedSaint.books && selectedSaint.books.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
              Writings & Books
            </Text>
            {selectedSaint.books.map((book: string, index: number) => (
              <View key={index} style={[styles.bookContainer, { backgroundColor: Colors[colorScheme ?? 'light'].surface }]}>
                <Text style={[styles.bookTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
                  {book.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                </Text>
              </View>
            ))}
          </View>
        )}

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
            Additional Information
          </Text>
          <View style={styles.infoGrid}>
            {selectedSaint.birth_place && (
              <View style={styles.infoItem}>
                <Text style={[styles.infoLabel, { color: Colors[colorScheme ?? 'light'].textMuted }]}>
                  Birth Place
                </Text>
                <Text style={[styles.infoValue, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                  {selectedSaint.birth_place}
                </Text>
              </View>
            )}
            {selectedSaint.death_place && (
              <View style={styles.infoItem}>
                <Text style={[styles.infoLabel, { color: Colors[colorScheme ?? 'light'].textMuted }]}>
                  Death Place
                </Text>
                <Text style={[styles.infoValue, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                  {selectedSaint.death_place}
                </Text>
              </View>
            )}
            {selectedSaint.canonization_date && (
              <View style={styles.infoItem}>
                <Text style={[styles.infoLabel, { color: Colors[colorScheme ?? 'light'].textMuted }]}>
                  Canonized
                </Text>
                <Text style={[styles.infoValue, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                  {selectedSaint.canonization_date}
                </Text>
              </View>
            )}
            {selectedSaint.rank && (
              <View style={styles.infoItem}>
                <Text style={[styles.infoLabel, { color: Colors[colorScheme ?? 'light'].textMuted }]}>
                  Rank
                </Text>
                <Text style={[styles.infoValue, { color: getRankColor(selectedSaint.rank) }]}>
                  {selectedSaint.rank.replace('_', ' ').toUpperCase()}
                </Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </Animated.View>
  );
}

const { width: screenWidth } = Dimensions.get('window');

const styles = StyleSheet.create({
  panel: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: Math.min(500, screenWidth * 0.45), // Responsive width: max 500px or 45% of screen
    height: '100%',
    borderLeftWidth: 1,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: -2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    zIndex: 1000,
  },
  panelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    minHeight: 60,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  navButton: {
    padding: 8,
    borderRadius: 6,
    marginRight: 8,
    cursor: 'pointer',
  },
  panelTitle: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Georgia',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 16,
  },
  closeButton: {
    padding: 8,
    cursor: 'pointer',
  },
  panelContent: {
    flex: 1,
    paddingHorizontal: 16,
  },
  saintDetailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    marginBottom: 20,
  },
  saintDetailInfo: {
    flex: 1,
    marginLeft: 16,
  },
  saintDetailName: {
    fontSize: 20,
    fontWeight: '700',
    fontFamily: 'Georgia',
    marginBottom: 4,
  },
  saintDetailFeast: {
    fontSize: 14,
    fontFamily: 'Georgia',
    marginBottom: 4,
  },
  saintDetailYears: {
    fontSize: 12,
    fontFamily: 'Georgia',
    marginBottom: 8,
  },
  badgesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  dominicanBadge: {
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 6,
    marginBottom: 4,
  },
  doctorBadge: {
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 6,
    marginBottom: 4,
  },
  colorBadge: {
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 6,
    marginBottom: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '600',
    fontFamily: 'Georgia',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'Georgia',
    marginBottom: 8,
  },
  sectionContent: {
    fontSize: 14,
    fontFamily: 'Georgia',
    lineHeight: 20,
  },
  biographyParagraph: {
    marginBottom: 12,
  },
  quoteContainer: {
    padding: 12,
    borderRadius: 6,
    marginBottom: 8,
  },
  quoteText: {
    fontSize: 14,
    fontFamily: 'Georgia',
    fontStyle: 'italic',
    lineHeight: 20,
  },
  bookContainer: {
    padding: 12,
    borderRadius: 6,
    marginBottom: 8,
  },
  bookTitle: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'Georgia',
    marginBottom: 4,
  },
  bookDescription: {
    fontSize: 13,
    fontFamily: 'Georgia',
    lineHeight: 18,
    marginBottom: 4,
  },
  bookYear: {
    fontSize: 11,
    fontFamily: 'Georgia',
    fontStyle: 'italic',
  },
  infoGrid: {
    flexDirection: 'column',
  },
  infoItem: {
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 11,
    fontFamily: 'Georgia',
    marginBottom: 2,
    fontWeight: '600',
  },
  infoValue: {
    fontSize: 13,
    fontFamily: 'Georgia',
  },
});
