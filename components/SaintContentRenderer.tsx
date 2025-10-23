import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import { Saint } from '../types/saint-types';
import { Celebration } from '../types/celebrations-types';
import { CelebrationRank } from '../types/celebrations-types';
import { LiturgicalDay } from '../types';

interface SaintContentRendererProps {
  saint: Saint;
  colorScheme: 'light' | 'dark' | null;
  defaultExpanded?: boolean;
  liturgicalDay?: LiturgicalDay;
}

// Helper function to convert feast data to saint format
export const convertFeastToSaint = (feast: Celebration): Saint => ({
  id: feast.id,
  name: feast.name,
  feast_day: feast.date,
  short_bio: Array.isArray(feast.description) 
    ? feast.description[0] 
    : feast.description || feast.biography?.[0], // Handle both string and array descriptions
  biography: feast.biography || (Array.isArray(feast.description) 
    ? feast.description 
    : feast.description ? [feast.description] : []), // Convert string to array if needed
  patronage: feast.patronage,
  birth_year: feast.birthYear,
  death_year: feast.deathYear,
  prayers: feast.prayers,
  is_dominican: feast.isDominican,
  is_doctor: feast.isDoctor || false,
  color: feast.color as any,
  books: feast.books || [],
  // Default values for missing fields
  birth_place: undefined,
  death_place: undefined,
  canonization_date: undefined,
  rank: feast.rank,
  quotes: undefined,
});

export const formatLiturgicalDay = (liturgicalDay: LiturgicalDay) => {
  // Use the full week string if available (from getLiturgicalWeek)
  if (liturgicalDay.weekString) {
    return liturgicalDay.weekString;
  }
  
  // Fallback to constructed format for backward compatibility
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayName = dayNames[liturgicalDay.dayOfWeek];
  
  return `${dayName} of week ${liturgicalDay.week} in ${liturgicalDay.season.name}`;
};

const formatFeastDay = (feastDay: string | undefined) => {
  if (!feastDay) return 'Unknown Date';
  const [month, day] = feastDay.split('-');
  if (!month || !day) return 'Invalid Date';
  const monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];
  return `${monthNames[parseInt(month) - 1]} ${parseInt(day)}`;
};

const getRankColor = (rank?: CelebrationRank) => {
  switch (rank) {
    case CelebrationRank.SOLEMNITY:
      return Colors.light.primary;
    case CelebrationRank.FEAST:
      return Colors.light.secondary;
    case CelebrationRank.MEMORIAL:
      return Colors.light.accent;
    default:
      return Colors.light.textSecondary;
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
      return Colors.light.textSecondary;
  }
};

export const SaintContentRenderer: React.FC<SaintContentRendererProps> = ({ 
  saint, 
  colorScheme,
  defaultExpanded = false,
  liturgicalDay
}) => {
  const colors = Colors[colorScheme ?? 'light'];
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [animationValue] = useState(new Animated.Value(defaultExpanded ? 1 : 0));

  const toggleExpanded = () => {
    const toValue = isExpanded ? 0 : 1;
    setIsExpanded(!isExpanded);
    
    Animated.timing(animationValue, {
      toValue,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  return (
    <>
      {/* Saint Header */}
      <TouchableOpacity 
        style={styles.saintDetailHeader}
        onPress={toggleExpanded}
        activeOpacity={0.7}
      >
        <Ionicons 
          name="person-circle" 
          size={80} 
          color={colors.primary} 
        />
        <View style={styles.saintDetailInfo}>
          <Text style={[styles.saintDetailName, { color: colors.text }]}>
            {saint.name}
          </Text>
          <Text style={[styles.saintDetailFeast, { color: colors.textSecondary }]}>
            {saint.feast_day ? `Feast Day: ${formatFeastDay(saint.feast_day)}` : 
             liturgicalDay ? formatLiturgicalDay(liturgicalDay) : 
             'Feast Day: Unknown'}
          </Text>
          {!!saint.birth_year && !!saint.death_year && (
            <Text style={[styles.saintDetailYears, { color: colors.textMuted }]}>
              {saint.birth_year} - {saint.death_year}
            </Text>
          )}
          
          {/* Badges */}
          <View style={styles.badgesContainer}>
            {saint.rank && (
              <View style={[
                styles.rankBadge, 
                { 
                  backgroundColor: saint.color ? getLiturgicalColor(saint.color) : colors.secondary,
                  borderWidth: saint.color?.toLowerCase() === 'white' ? 1 : 0,
                  borderColor: colors.border,
                }
              ]}>
                <Text style={[
                  styles.badgeText, 
                  { 
                    color: saint.color?.toLowerCase() === 'white' 
                      ? 'black' 
                      : 'white' 
                  }
                ]}>
                  {saint.rank.split(' ')[0]}
                </Text>
              </View>
            )}
            {saint.is_doctor && (
              <View style={[styles.doctorBadge, { backgroundColor: colors.accent }]}>
                <Text style={[styles.badgeText, { color: 'black' }]}>
                  Doctor
                </Text>
              </View>
            )}
            {saint.is_dominican && (
              <View style={[styles.dominicanBadge, { backgroundColor: colors.text }]}>
                <Text style={[styles.badgeText, { color: colors.background }]}>
                  OP
                </Text>
              </View>
            )}
          </View>
        </View>
        {/* Expand/Collapse Icon */}
        { !!saint.feast_day && (
        <Ionicons 
          name={isExpanded ? "chevron-up" : "chevron-down"} 
          size={24} 
          color={colors.textSecondary} 
        />
        )}
      </TouchableOpacity>

      {/* Expandable Content */}
      { !!saint.feast_day && (
      <Animated.View 
        style={[
          styles.expandableContent,
          {
            maxHeight: animationValue.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 4000], // Adjust this value based on your content
            }),
            opacity: animationValue,
          }
        ]}
      >
        {/* Biography Section */}
        {!!saint.short_bio && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Biography
            </Text>
            <Text style={[styles.sectionContent, { color: colors.textSecondary }]}>
              {saint.short_bio}
            </Text>
          </View>
        )}

        {/* Patronage Section */}
        {!!saint.patronage && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Patronage
            </Text>
            <Text style={[styles.sectionContent, { color: colors.textSecondary }]}>
              {saint.patronage}
            </Text>
          </View>
        )}

        {/* Detailed Biography Section */}
        {!!saint.biography && Array.isArray(saint.biography) && saint.biography.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Detailed Biography
            </Text>
            <>
              {saint.biography.map((paragraph: string, index: number) => (
                <Text key={index} style={[
                  styles.sectionContent, 
                  styles.biographyParagraph,
                  { color: colors.textSecondary }
                ]}>
                  {paragraph}
                </Text>
              ))}
            </>
          </View>
        )}

        {/* Prayer Section */}
        {!!saint.prayers && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Prayer
            </Text>
            <Text style={[styles.sectionContent, { color: colors.textSecondary }]}>
              {saint.prayers}
            </Text>
          </View>
        )}

        {/* Quotes Section */}
        {!!saint.quotes && Array.isArray(saint.quotes) && saint.quotes.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Quotes
            </Text>
            <>
              {saint.quotes.map((quote: string, index: number) => (
                <View key={index} style={[styles.quoteContainer, { backgroundColor: colors.surface }]}>
                  <Text style={[styles.quoteText, { color: colors.textSecondary }]}>
                    "{quote}"
                  </Text>
                </View>
              ))}
            </>
          </View>
        )}

        {/* Books Section */}
        {!!saint.books && Array.isArray(saint.books) && saint.books.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Writings & Books
            </Text>
            <>
              {saint.books.map((book: string, index: number) => (
                <View key={index} style={[styles.bookContainer, { backgroundColor: colors.surface }]}>
                  <Text style={[styles.bookTitle, { color: colors.text }]}>
                    {book.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                  </Text>
                </View>
              ))}
            </>
          </View>
        )}

        {/* Additional Information Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Additional Information
          </Text>
          <View style={styles.infoGrid}>
            {!!saint.birth_place && (
              <View style={styles.infoItem}>
                <Text style={[styles.infoLabel, { color: colors.textMuted }]}>
                  Birth Place
                </Text>
                <Text style={[styles.infoValue, { color: colors.textSecondary }]}>
                  {saint.birth_place}
                </Text>
              </View>
            )}
            {!!saint.death_place && (
              <View style={styles.infoItem}>
                <Text style={[styles.infoLabel, { color: colors.textMuted }]}>
                  Death Place
                </Text>
                <Text style={[styles.infoValue, { color: colors.textSecondary }]}>
                  {saint.death_place}
                </Text>
              </View>
            )}
            {!!saint.canonization_date && (
              <View style={styles.infoItem}>
                <Text style={[styles.infoLabel, { color: colors.textMuted }]}>
                  Canonized
                </Text>
                <Text style={[styles.infoValue, { color: colors.textSecondary }]}>
                  {saint.canonization_date}
                </Text>
              </View>
            )}
            {!!saint.rank && (
              <View style={styles.infoItem}>
                <Text style={[styles.infoLabel, { color: colors.textMuted }]}>
                  Rank
                </Text>
                <Text style={[styles.infoValue, { color: colors.textSecondary }]}>
                  {saint.rank ? saint.rank.replace('_', ' ').toUpperCase() : 'Unknown'}
                </Text>
              </View>
            )}
          </View>
        </View>
      </Animated.View>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  saintDetailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    marginBottom: 20,
  },
  expandableContent: {
    overflow: 'hidden',
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
  rankBadge: {
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 6,
    marginBottom: 4,
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
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Georgia',
    marginBottom: 8,
  },
  sectionContent: {
    fontSize: 16,
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

export default SaintContentRenderer;
