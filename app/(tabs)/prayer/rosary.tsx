import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../../constants/Colors';
import { useTheme } from '../../../components/ThemeProvider';
import { useCalendar } from '../../../components/CalendarContext';
import FeastBanner from '../../../components/FeastBanner';
import PrayerNavigation from '../../../components/PrayerNavigation';
import LiturgicalCalendarService from '../../../services/LiturgicalCalendar';
import { LiturgicalDay } from '../../../types';
import { PrayerStyles } from '../../../styles';

export default function RosaryScreen() {
  const { colorScheme } = useTheme();
  const { liturgicalDay } = useCalendar();
  const [selectedMystery, setSelectedMystery] = useState<string | null>(null);
  const [rosaryForm, setRosaryForm] = useState<'dominican' | 'standard'>('dominican');
  const [isPraying, setIsPraying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [currentDecade, setCurrentDecade] = useState(0);
  const [currentHailMary, setCurrentHailMary] = useState(0);
  const [showInstructions, setShowInstructions] = useState(false);

  // Get today's mystery based on day of week
  const getTodaysMystery = () => {
    const today = new Date().getDay();
    switch (today) {
      case 0: // Sunday
      case 3: // Wednesday
        return 'Glorious Mysteries';
      case 1: // Monday
      case 6: // Saturday
        return 'Joyful Mysteries';
      case 2: // Tuesday
      case 5: // Friday
        return 'Sorrowful Mysteries';
      case 4: // Thursday
        return 'Luminous Mysteries';
      default:
        return 'Joyful Mysteries';
    }
  };

  // Initialize with today's mystery
  useEffect(() => {
    if (!selectedMystery) {
      setSelectedMystery(getTodaysMystery());
    }
  }, []);

  const rosaryMysteries = [
    { 
      name: 'Joyful Mysteries', 
      day: 'Monday & Saturday', 
      icon: 'happy-outline',
      description: 'The Annunciation, Visitation, Nativity, Presentation, and Finding in the Temple',
      mysteries: [
        'The Annunciation',
        'The Visitation',
        'The Nativity',
        'The Presentation',
        'The Finding in the Temple'
      ]
    },
    { 
      name: 'Sorrowful Mysteries', 
      day: 'Tuesday & Friday', 
      icon: 'heart-outline',
      description: 'The Agony in the Garden, Scourging, Crowning with Thorns, Carrying the Cross, and Crucifixion',
      mysteries: [
        'The Agony in the Garden',
        'The Scourging at the Pillar',
        'The Crowning with Thorns',
        'The Carrying of the Cross',
        'The Crucifixion'
      ]
    },
    { 
      name: 'Glorious Mysteries', 
      day: 'Wednesday & Sunday', 
      icon: 'star-outline',
      description: 'The Resurrection, Ascension, Descent of the Holy Spirit, Assumption, and Coronation',
      mysteries: [
        'The Resurrection',
        'The Ascension',
        'The Descent of the Holy Spirit',
        'The Assumption',
        'The Coronation of Mary'
      ]
    },
    { 
      name: 'Luminous Mysteries', 
      day: 'Thursday', 
      icon: 'flash-outline',
      description: 'The Baptism, Wedding at Cana, Proclamation of the Kingdom, Transfiguration, and Institution of the Eucharist',
      mysteries: [
        'The Baptism of Jesus',
        'The Wedding at Cana',
        'The Proclamation of the Kingdom',
        'The Transfiguration',
        'The Institution of the Eucharist'
      ]
    },
  ];

  // Prayer content for different forms
  const prayerContent = {
    dominican: {
      title: 'Dominican Rosary',
      subtitle: 'The prayer of the saints',
      openingPrayers: [
        'In the name of the Father, and of the Son, and of the Holy Spirit. Amen.',
        'V. Hail Mary, full of grace, the Lord is with thee.',
        'R. Blessed art thou among women, and blessed is the fruit of thy womb, Jesus.',
        'V. O Lord, open my lips.',
        'R. And my mouth will proclaim your praise.',
        'V. O God, come to my assistance.',
        'R. O Lord, make haste to help me.',
        'Glory be to the Father, and to the Son, and to the Holy Spirit, as it was in the beginning, is now, and ever shall be, world without end. Amen.',
        'Apostles\' Creed',
        'Our Father',
        'Three Hail Marys (for faith, hope, and charity)',
        'Glory be to the Father...'
      ],
      description: 'The traditional Dominican form begins with versicles and responses, following the pattern of the Liturgy of the Hours.'
    },
    standard: {
      title: 'Standard Rosary',
      subtitle: 'The traditional Catholic rosary',
      openingPrayers: [
        'In the name of the Father, and of the Son, and of the Holy Spirit. Amen.',
        'Apostles\' Creed',
        'Our Father',
        'Three Hail Marys (for faith, hope, and charity)',
        'Glory be to the Father, and to the Son, and to the Holy Spirit, as it was in the beginning, is now, and ever shall be, world without end. Amen.'
      ],
      description: 'The standard form begins directly with the Creed and opening prayers, followed by the mysteries.'
    }
  };

  // Prayer flow logic
  const startPrayer = () => {
    if (!selectedMystery) {
      setSelectedMystery(getTodaysMystery());
    }
    setIsPraying(true);
    setCurrentStep(0);
    setCurrentDecade(0);
    setCurrentHailMary(0);
  };

  const startTodaysMystery = () => {
    setSelectedMystery(getTodaysMystery());
    setIsPraying(true);
    setCurrentStep(0);
    setCurrentDecade(0);
    setCurrentHailMary(0);
  };

  const startSpecificMystery = (mysteryName: string) => {
    setSelectedMystery(mysteryName);
    setIsPraying(true);
    setCurrentStep(0);
    setCurrentDecade(0);
    setCurrentHailMary(0);
  };

  const nextStep = () => {
    const currentPrayerStep = getCurrentPrayerStep();
    
    // If we're at the end of a decade (Glory Be or Fatima Prayer), move to next decade or finish
    if (currentPrayerStep.type === 'glorybe' || currentPrayerStep.type === 'fatima') {
      if (currentDecade < 4) {
        // Move to next decade
        setCurrentDecade(prev => prev + 1);
        setCurrentStep(prayerContent[rosaryForm].openingPrayers.length + 1); // Start with Our Father
      } else {
        // Finished all decades, add final prayers
        setCurrentStep(prev => prev + 1);
      }
    } else {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const nextDecade = () => {
    if (currentDecade < 4) {
      setCurrentDecade(prev => prev + 1);
      setCurrentHailMary(0);
    }
  };

  const prevDecade = () => {
    if (currentDecade > 0) {
      setCurrentDecade(prev => prev - 1);
      setCurrentHailMary(0);
    }
  };

  const nextHailMary = () => {
    if (currentHailMary < 9) {
      setCurrentHailMary(prev => prev + 1);
    } else {
      nextDecade();
    }
  };

  const prevHailMary = () => {
    if (currentHailMary > 0) {
      setCurrentHailMary(prev => prev - 1);
    } else if (currentDecade > 0) {
      prevDecade();
      setCurrentHailMary(9);
    }
  };

  const exitPrayer = () => {
    setIsPraying(false);
    setCurrentStep(0);
    setCurrentDecade(0);
    setCurrentHailMary(0);
  };

  // Get current prayer step
  const getCurrentPrayerStep = () => {
    const selectedMysteryData = rosaryMysteries.find(m => m.name === selectedMystery);
    
    // Calculate total steps: opening prayers + (5 decades × prayers per decade) + final prayers
    const prayersPerDecade = rosaryForm === 'standard' ? 13 : 12; // Standard includes Fatima Prayer, Dominican doesn't
    const totalSteps = prayerContent[rosaryForm].openingPrayers.length + (5 * prayersPerDecade) + 1; // 1 for final prayer
    
    if (currentStep < prayerContent[rosaryForm].openingPrayers.length) {
      return {
        type: 'opening',
        title: 'Opening Prayers',
        content: prayerContent[rosaryForm].openingPrayers[currentStep],
        step: currentStep + 1,
        total: totalSteps,
        mysteryInfo: null
      };
    } else if (currentStep === prayerContent[rosaryForm].openingPrayers.length) {
      return {
        type: 'mystery',
        title: `${selectedMysteryData?.name} - ${selectedMysteryData?.mysteries[currentDecade]}`,
        content: `Let us contemplate the ${selectedMysteryData?.mysteries[currentDecade]?.toLowerCase()}.`,
        step: currentStep + 1,
        total: totalSteps,
        mysteryInfo: {
          mysterySet: selectedMysteryData?.name,
          currentMystery: selectedMysteryData?.mysteries[currentDecade],
          decade: currentDecade + 1,
          totalDecades: 5
        }
      };
    } else if (currentStep === prayerContent[rosaryForm].openingPrayers.length + 1) {
      return {
        type: 'ourfather',
        title: 'Our Father',
        content: 'Our Father, who art in heaven, hallowed be thy name; thy kingdom come; thy will be done on earth as it is in heaven. Give us this day our daily bread; and forgive us our trespasses as we forgive those who trespass against us; and lead us not into temptation, but deliver us from evil. Amen.',
        step: currentStep + 1,
        total: totalSteps,
        mysteryInfo: {
          mysterySet: selectedMysteryData?.name,
          currentMystery: selectedMysteryData?.mysteries[currentDecade],
          decade: currentDecade + 1,
          totalDecades: 5
        }
      };
    } else if (currentStep < prayerContent[rosaryForm].openingPrayers.length + 2 + 10) {
      const hailMaryStep = currentStep - prayerContent[rosaryForm].openingPrayers.length - 2;
      return {
        type: 'hailmary',
        title: `Hail Mary ${hailMaryStep + 1}`,
        content: 'Hail Mary, full of grace, the Lord is with thee; blessed art thou among women, and blessed is the fruit of thy womb, Jesus. Holy Mary, Mother of God, pray for us sinners, now and at the hour of our death. Amen.',
        step: currentStep + 1,
        total: totalSteps,
        mysteryInfo: {
          mysterySet: selectedMysteryData?.name,
          currentMystery: selectedMysteryData?.mysteries[currentDecade],
          decade: currentDecade + 1,
          totalDecades: 5,
          hailMary: hailMaryStep + 1
        }
      };
    } else if (currentStep === prayerContent[rosaryForm].openingPrayers.length + 2 + 10) {
      return {
        type: 'glorybe',
        title: 'Glory Be',
        content: 'Glory be to the Father, and to the Son, and to the Holy Spirit, as it was in the beginning, is now, and ever shall be, world without end. Amen.',
        step: currentStep + 1,
        total: totalSteps,
        mysteryInfo: {
          mysterySet: selectedMysteryData?.name,
          currentMystery: selectedMysteryData?.mysteries[currentDecade],
          decade: currentDecade + 1,
          totalDecades: 5
        }
      };
    } else if (currentStep === prayerContent[rosaryForm].openingPrayers.length + 2 + 10 + 1 && rosaryForm === 'standard') {
      return {
        type: 'fatima',
        title: 'Fatima Prayer',
        content: 'O my Jesus, forgive us our sins, save us from the fires of hell, and lead all souls to heaven, especially those in most need of thy mercy. Amen.',
        step: currentStep + 1,
        total: totalSteps,
        mysteryInfo: {
          mysterySet: selectedMysteryData?.name,
          currentMystery: selectedMysteryData?.mysteries[currentDecade],
          decade: currentDecade + 1,
          totalDecades: 5
        }
      };
    } else {
      return {
        type: 'final',
        title: 'Rosary Complete',
        content: 'The rosary is complete. May the Lord bless you and keep you.',
        step: currentStep + 1,
        total: totalSteps,
        mysteryInfo: null
      };
    }
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
        {/* Prayer Navigation */}
        <PrayerNavigation activeTab="rosary" />
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: Colors[colorScheme ?? 'light'].text }]}>
            {prayerContent[rosaryForm].title}
          </Text>
          <Text style={[styles.subtitle, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
            {prayerContent[rosaryForm].subtitle}
          </Text>
        </View>

        {/* Quick Actions - Moved to top */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={[
              styles.quickActionCard,
              { backgroundColor: Colors[colorScheme ?? 'light'].card,
                borderWidth: 1,
                borderColor: Colors[colorScheme ?? 'light'].primary }
            ]}
            onPress={startPrayer}
          >
            <Ionicons name="play-circle" size={24} color={Colors[colorScheme ?? 'light'].primary} />
            <Text style={[styles.quickActionText, { color: Colors[colorScheme ?? 'light'].primary }]}>
              Start Rosary
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.quickActionCard,
              { backgroundColor: Colors[colorScheme ?? 'light'].card,
                borderWidth: 1,
                borderColor: Colors[colorScheme ?? 'light'].secondary }
            ]}
            onPress={startTodaysMystery}
          >
            <Ionicons name="rose" size={24} color={Colors[colorScheme ?? 'light'].secondary} />
            <Text style={[styles.quickActionText, { color: Colors[colorScheme ?? 'light'].secondary }]}>
              Today's Mystery
            </Text>
          </TouchableOpacity>
        </View>

        {/* Rosary Form Toggle and Info Button */}
        <View style={styles.toggleAndInfoContainer}>
          <View style={styles.toggleContainer}>
            <Text style={[styles.toggleLabel, { color: Colors[colorScheme ?? 'light'].text }]}>
              Dominican
            </Text>
            <Switch
              value={rosaryForm === 'standard'}
              onValueChange={(value) => setRosaryForm(value ? 'standard' : 'dominican')}
              trackColor={{
                false: Colors[colorScheme ?? 'light'].dominicanGold,
                true: Colors[colorScheme ?? 'light'].dominicanGold,
              }}
              thumbColor={
                rosaryForm === 'standard'
                  ? Colors[colorScheme ?? 'light'].dominicanRed
                  : Colors[colorScheme ?? 'light'].dominicanRed
              }
              ios_backgroundColor={Colors[colorScheme ?? 'light'].dominicanBlack}
            />
            <Text style={[styles.toggleLabel, { color: Colors[colorScheme ?? 'light'].text }]}>
              Standard
            </Text>
          </View>
          
          <TouchableOpacity
            style={[
              styles.infoButton,
              { backgroundColor: Colors[colorScheme ?? 'light'].surface }
            ]}
            onPress={() => setShowInstructions(true)}
          >
            <Ionicons name="information-circle-outline" size={20} color={colorScheme === 'dark' ? Colors[colorScheme ?? 'light'].dominicanBlack : Colors[colorScheme ?? 'light'].primary} />
          </TouchableOpacity>
        </View>

        {/* Prayer Instructions - Behind Info Button */}
        {showInstructions && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons 
                name="book-outline" 
                size={24} 
                color={Colors[colorScheme ?? 'light'].primary} 
              />
              <Text style={[styles.sectionTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
                Prayer Instructions
              </Text>
              <TouchableOpacity
                style={styles.closeInstructionsButton}
                onPress={() => setShowInstructions(false)}
              >
                <Ionicons name="close" size={20} color={Colors[colorScheme ?? 'light'].textSecondary} />
              </TouchableOpacity>
            </View>
            
            <View style={[
              styles.instructionCard,
              { backgroundColor: Colors[colorScheme ?? 'light'].card }
            ]}>
              <Text style={[styles.instructionDescription, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                {prayerContent[rosaryForm].description}
              </Text>
              
              <View style={styles.prayerSteps}>
                {prayerContent[rosaryForm].openingPrayers.map((prayer, index) => (
                  <View key={index} style={styles.prayerStep}>
                    <View style={[
                      styles.stepNumber,
                      { backgroundColor: Colors[colorScheme ?? 'light'].primary }
                    ]}>
                      <Text style={[styles.stepNumberText, { color: Colors[colorScheme ?? 'light'].dominicanWhite }]}>
                        {index + 1}
                      </Text>
                    </View>
                    <Text style={[styles.prayerText, { color: Colors[colorScheme ?? 'light'].text }]}>
                      {prayer}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        )}


        {/* Prayer Interface */}
        {isPraying && (
          <View style={styles.prayerInterface}>
            <View style={[
              styles.prayerCard,
              { backgroundColor: Colors[colorScheme ?? 'light'].card }
            ]}>
              {/* Prayer Header */}
              <View style={styles.prayerHeader}>
                <TouchableOpacity
                  style={styles.exitButton}
                  onPress={exitPrayer}
                >
                  <Ionicons name="close" size={24} color={Colors[colorScheme ?? 'light'].textSecondary} />
                </TouchableOpacity>
                <View style={styles.prayerTitleContainer}>
                  <Text style={[styles.prayerTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
                    {getCurrentPrayerStep().title}
                  </Text>
                  {getCurrentPrayerStep().mysteryInfo && (
                    <View style={styles.mysteryInfoContainer}>
                      <Text style={[styles.mysterySetName, { color: Colors[colorScheme ?? 'light'].primary }]}>
                        {getCurrentPrayerStep().mysteryInfo?.mysterySet}
                      </Text>
                      <Text style={[styles.currentMystery, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                        {getCurrentPrayerStep().mysteryInfo?.currentMystery}
                      </Text>
                      <View style={styles.decadeProgress}>
                        <Text style={[styles.decadeText, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                          Decade {getCurrentPrayerStep().mysteryInfo?.decade} of {getCurrentPrayerStep().mysteryInfo?.totalDecades}
                        </Text>
                        {getCurrentPrayerStep().mysteryInfo?.hailMary && (
                          <Text style={[styles.hailMaryText, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                            • Hail Mary {getCurrentPrayerStep().mysteryInfo?.hailMary} of 10
                          </Text>
                        )}
                      </View>
                    </View>
                  )}
                </View>
                <View style={styles.progressContainer}>
                  <Text style={[styles.progressText, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                    {getCurrentPrayerStep().step} / {getCurrentPrayerStep().total}
                  </Text>
                </View>
              </View>

              {/* Progress Bar */}
              <View style={[
                styles.progressBar,
                { backgroundColor: Colors[colorScheme ?? 'light'].border }
              ]}>
                <View style={[
                  styles.progressFill,
                  { 
                    backgroundColor: Colors[colorScheme ?? 'light'].primary,
                    width: `${(getCurrentPrayerStep().step / getCurrentPrayerStep().total) * 100}%`
                  }
                ]} />
              </View>

              {/* Prayer Content */}
              <View style={styles.prayerContent}>
                <Text style={[styles.prayerText, { color: Colors[colorScheme ?? 'light'].text }]}>
                  {getCurrentPrayerStep().content}
                </Text>
              </View>

              {/* Prayer Controls */}
              <View style={styles.prayerControls}>
                <TouchableOpacity
                  style={[
                    styles.controlButton,
                    styles.prevButton,
                    { 
                      backgroundColor: currentStep === 0 ? Colors[colorScheme ?? 'light'].border : Colors[colorScheme ?? 'light'].secondary,
                      opacity: currentStep === 0 ? 0.5 : 1
                    }
                  ]}
                  onPress={prevStep}
                  disabled={currentStep === 0}
                >
                  <Ionicons name="chevron-back" size={20} color={Colors[colorScheme ?? 'light'].dominicanWhite} />
                  <Text style={[styles.controlButtonText, { color: Colors[colorScheme ?? 'light'].dominicanWhite }]}>
                    Previous
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.controlButton,
                    styles.nextButton,
                    { backgroundColor: Colors[colorScheme ?? 'light'].primary }
                  ]}
                  onPress={nextStep}
                >
                  <Text style={[styles.controlButtonText, { color: Colors[colorScheme ?? 'light'].dominicanWhite }]}>
                    Next
                  </Text>
                  <Ionicons name="chevron-forward" size={20} color={Colors[colorScheme ?? 'light'].dominicanWhite} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
        
        {/* Rosary Mysteries Grid */}
        <View style={styles.section}>
          
          <View style={styles.rosaryGrid}>
            {rosaryMysteries.map((mystery, index) => (
              <View
                key={index}
                style={[
                  styles.rosaryCard,
                  { 
                    backgroundColor: Colors[colorScheme ?? 'light'].card,
                    borderColor: selectedMystery === mystery.name 
                      ? Colors[colorScheme ?? 'light'].primary 
                      : Colors[colorScheme ?? 'light'].border,
                    borderWidth: selectedMystery === mystery.name ? 2 : 1,
                  }
                ]}
              >
                <TouchableOpacity
                  style={styles.mysteryCardContent}
                  onPress={() => setSelectedMystery(selectedMystery === mystery.name ? null : mystery.name)}
                  activeOpacity={0.7}
                >
                  <Ionicons 
                    name={mystery.icon as any} 
                    size={28} 
                    color={selectedMystery === mystery.name 
                      ? Colors[colorScheme ?? 'light'].primary 
                      : Colors[colorScheme ?? 'light'].textSecondary
                    } 
                  />
                  <Text style={[
                    styles.rosaryMysteryName,
                    { color: Colors[colorScheme ?? 'light'].text }
                  ]}>
                    {mystery.name}
                  </Text>
                  <Text style={[
                    styles.rosaryMysteryDay,
                    { color: Colors[colorScheme ?? 'light'].textSecondary }
                  ]}>
                    {mystery.day}
                  </Text>
                  
                  {/* Show mysteries when selected */}
                  {selectedMystery === mystery.name && (
                    <View style={styles.mysteriesList}>
                      {mystery.mysteries.map((mysteryName, idx) => (
                        <Text key={idx} style={[styles.mysteryItem, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                          {idx + 1}. {mysteryName}
                        </Text>
                      ))}
                    </View>
                  )}
                </TouchableOpacity>

                {/* Play Button */}
                <TouchableOpacity
                  style={[
                    styles.playButton,
                    { backgroundColor: Colors[colorScheme ?? 'light'].primary }
                  ]}
                  onPress={() => startSpecificMystery(mystery.name)}
                  activeOpacity={0.8}
                >
                  <Ionicons name="play" size={16} color={Colors[colorScheme ?? 'light'].textOnRed} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
      
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  ...PrayerStyles,
  // No unique local styles needed for this component
});
