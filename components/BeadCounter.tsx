/**
 * BeadCounter Component
 * Visual representation of all rosary beads in a vertical strip
 */

import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Colors } from '../constants/Colors';
import { useTheme } from './ThemeProvider';
import { RosaryBead as RosaryBeadType } from '../types/rosary-types';
import RosaryBead from './RosaryBead';

interface BeadCounterProps {
  beads: RosaryBeadType[];
  currentBeadId: string;
  completedBeadIds: string[];
  onBeadPress: (beadId: string) => void;
}

export default function BeadCounter({ 
  beads, 
  currentBeadId, 
  completedBeadIds,
  onBeadPress 
}: BeadCounterProps) {
  const { colorScheme } = useTheme();
  const scrollViewRef = React.useRef<ScrollView>(null);
  const beadRefs = React.useRef<{ [key: string]: View | null }>({});

  // Group beads by decade for visual separation
  const beadsBySection: { [key: number]: RosaryBeadType[] } = {};
  beads.forEach(bead => {
    const section = bead.decadeNumber || 0;
    if (!beadsBySection[section]) {
      beadsBySection[section] = [];
    }
    beadsBySection[section].push(bead);
  });

  // Auto-scroll to keep current bead visible
  React.useEffect(() => {
    const currentBeadRef = beadRefs.current[currentBeadId];
    if (currentBeadRef && scrollViewRef.current) {
      currentBeadRef.measureLayout(
        scrollViewRef.current as any,
        (_left, top) => {
          scrollViewRef.current?.scrollTo({
            y: top - 250, // Offset to center in view
            animated: true,
          });
        },
        () => {} // Error callback
      );
    }
  }, [currentBeadId]);

  // Helper to check if current prayer is on the chain (Glory Be or Fatima)
  const isChainPrayer = (bead: RosaryBeadType) => {
    return bead.type === 'glory-be' || bead.type === 'fatima';
  };

  // Helper to render chain connector with optional highlight for chain prayers
  // Glory Be and Fatima Prayer are said on the chain (not on beads)
  const renderChainConnector = (decadeNum?: number) => {
    let isActive = false;
    let chainBead: RosaryBeadType | undefined;
    
    if (decadeNum) {
      // Check if Glory Be or Fatima prayer is active for this decade
      const decadeBeads = beadsBySection[decadeNum] || [];
      chainBead = decadeBeads.find(b => isChainPrayer(b) && b.id === currentBeadId);
      isActive = !!chainBead;
    }
    
    return (
      <TouchableOpacity
        onPress={() => chainBead && onBeadPress(chainBead.id)}
        disabled={!chainBead}
        activeOpacity={0.7}
      >
        <View 
          style={[
            styles.connector, 
            { 
              backgroundColor: isActive 
                ? Colors[colorScheme ?? 'light'].primary 
                : Colors[colorScheme ?? 'light'].border,
              width: isActive ? 4 : 2,
              height: isActive ? 20 : 12, // Larger when active to show it's the current prayer
            }
          ]} 
        />
      </TouchableOpacity>
    );
  };

  return (
    <ScrollView 
      ref={scrollViewRef}
      style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].surface }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Opening Prayers */}
      <View style={styles.section}>
        <Text style={[styles.sectionLabel, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
          Opening
        </Text>
        <View style={styles.beadGroup}>
          {beadsBySection[0]?.filter(bead => !isChainPrayer(bead)).map(bead => {
            // Skip Apostles' Creed - it shares the same crucifix as Sign of Cross
            if (bead.type === 'apostles-creed') {
              return null;
            }
            
            // For Sign of Cross (the crucifix), check if either Sign of Cross OR Apostles' Creed is active
            if (bead.type === 'sign-of-cross') {
              const apostlesCreedBead = beadsBySection[0]?.find(b => b.type === 'apostles-creed');
              const crucifixActive = !!(bead.id === currentBeadId || apostlesCreedBead?.id === currentBeadId);
              const crucifixCompleted = !!(completedBeadIds.includes(bead.id) || 
                                       (apostlesCreedBead && completedBeadIds.includes(apostlesCreedBead.id)));
              
              return (
                <View
                  key={bead.id}
                  ref={(ref) => { beadRefs.current[bead.id] = ref; }}
                  collapsable={false}
                >
                  <RosaryBead
                    type={bead.type}
                    isActive={crucifixActive}
                    isCompleted={crucifixCompleted}
                    onPress={() => {
                      // Navigate to Sign of Cross if not completed, otherwise to Apostles' Creed
                      if (!completedBeadIds.includes(bead.id)) {
                        onBeadPress(bead.id);
                      } else if (apostlesCreedBead && !completedBeadIds.includes(apostlesCreedBead.id)) {
                        onBeadPress(apostlesCreedBead.id);
                      } else {
                        onBeadPress(bead.id);
                      }
                    }}
                    size="small"
                  />
                </View>
              );
            }
            
            // For all other opening prayers, render normally
            return (
              <View
                key={bead.id}
                ref={(ref) => { beadRefs.current[bead.id] = ref; }}
                collapsable={false}
              >
                <RosaryBead
                  type={bead.type}
                  isActive={bead.id === currentBeadId}
                  isCompleted={completedBeadIds.includes(bead.id)}
                  onPress={() => onBeadPress(bead.id)}
                  size="small"
                />
              </View>
            );
          })}
        </View>
      </View>

      {/* Connector line - highlights if opening Glory Be is active */}
      {renderChainConnector(0)}

      {/* Decades 1-5 */}
      {[1, 2, 3, 4, 5].map(decadeNum => {
        // Find mystery announcement and Our Father for this decade
        const decadeBeads = beadsBySection[decadeNum] || [];
        const mysteryBead = decadeBeads.find(b => b.type === 'mystery-announcement');
        const ourFatherBead = decadeBeads.find(b => b.type === 'our-father');
        
        // Check if either mystery or Our Father is active (they're the same physical bead)
        const mysteryOrOurFatherActive = mysteryBead?.id === currentBeadId || ourFatherBead?.id === currentBeadId;
        const mysteryOrOurFatherCompleted = (mysteryBead && completedBeadIds.includes(mysteryBead.id)) || 
                                            (ourFatherBead && completedBeadIds.includes(ourFatherBead.id));
        
        return (
          <View key={decadeNum} style={styles.section}>
            <View style={styles.beadGroup}>
              {decadeBeads.map((bead, index) => {
                // Skip Glory Be and Fatima beads - they're shown on the chain
                if (isChainPrayer(bead)) {
                  return null;
                }
                
                // Skip mystery announcement - it shares the same bead as Our Father
                if (bead.type === 'mystery-announcement') {
                  return null;
                }
                
                // For Our Father bead (decade opening), show decade number badge
                // This bead represents BOTH the mystery announcement AND the Our Father prayer
                if (bead.type === 'our-father' && bead.beadNumber === 0) {
                  return (
                    <View
                      key={bead.id}
                      ref={(ref) => { beadRefs.current[bead.id] = ref; }}
                      collapsable={false}
                    >
                      <TouchableOpacity
                        onPress={() => {
                          // Navigate to mystery announcement if that hasn't been completed yet
                          if (mysteryBead && !completedBeadIds.includes(mysteryBead.id)) {
                            onBeadPress(mysteryBead.id);
                          } else {
                            onBeadPress(bead.id);
                          }
                        }}
                        style={[
                          styles.decadeNumberBead,
                          {
                            backgroundColor: mysteryOrOurFatherActive
                              ? Colors[colorScheme ?? 'light'].primary
                              : mysteryOrOurFatherCompleted
                              ? Colors[colorScheme ?? 'light'].dominicanGold
                              : Colors[colorScheme ?? 'light'].card,
                            borderColor: mysteryOrOurFatherActive || mysteryOrOurFatherCompleted
                              ? 'transparent'
                              : Colors[colorScheme ?? 'light'].border,
                          },
                        ]}
                        activeOpacity={0.7}
                      >
                        <Text
                          style={[
                            styles.decadeNumberText,
                            {
                              color: mysteryOrOurFatherActive || mysteryOrOurFatherCompleted
                                ? Colors[colorScheme ?? 'light'].dominicanWhite
                                : Colors[colorScheme ?? 'light'].primary,
                            },
                          ]}
                        >
                          {decadeNum}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  );
                }
                
                // For all other beads (Hail Marys), show normal bead
                return (
                  <View
                    key={bead.id}
                    ref={(ref) => { beadRefs.current[bead.id] = ref; }}
                    collapsable={false}
                  >
                    <RosaryBead
                      type={bead.type}
                      isActive={bead.id === currentBeadId}
                      isCompleted={completedBeadIds.includes(bead.id)}
                      onPress={() => onBeadPress(bead.id)}
                      size="small"
                    />
                  </View>
                );
              })}
            </View>
            {/* Chain connector between decades - highlights when Glory Be/Fatima is active */}
            {decadeNum < 5 && renderChainConnector(decadeNum)}
          </View>
        );
      })}

      {/* Connector line */}
      <View style={[styles.connector, { backgroundColor: Colors[colorScheme ?? 'light'].border }]} />

      {/* Closing Prayers */}
      {beadsBySection[6] && beadsBySection[6].length > 0 && (
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
            Final
          </Text>
          <View style={styles.beadGroup}>
            {beadsBySection[6]?.filter(bead => !isChainPrayer(bead)).map(bead => (
              <View
                key={bead.id}
                ref={(ref) => { beadRefs.current[bead.id] = ref; }}
                collapsable={false}
              >
                <RosaryBead
                  type={bead.type}
                  isActive={bead.id === currentBeadId}
                  isCompleted={completedBeadIds.includes(bead.id)}
                  onPress={() => onBeadPress(bead.id)}
                  size="small"
                />
              </View>
            ))}
          </View>
          {/* Chain connector for closing prayers if any chain prayers exist */}
          {beadsBySection[6]?.some(isChainPrayer) && renderChainConnector(6)}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 4,
    paddingVertical: 8,
    alignItems: 'center',
  },
  section: {
    alignItems: 'center',
    marginVertical: 4,
  },
  sectionLabel: {
    fontSize: 8,
    fontFamily: 'Georgia',
    fontWeight: '600',
    marginBottom: 4,
  },
  beadGroup: {
    alignItems: 'center',
    gap: 4,
  },
  decadeNumberBead: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  decadeNumberText: {
    fontSize: 14,
    fontFamily: 'Georgia',
    fontWeight: '700',
  },
  connector: {
    width: 2,
    height: 12,
    marginVertical: 2,
  },
});

