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

  // Group beads by decade for visual separation
  const beadsBySection: { [key: number]: RosaryBeadType[] } = {};
  beads.forEach(bead => {
    const section = bead.decadeNumber || 0;
    if (!beadsBySection[section]) {
      beadsBySection[section] = [];
    }
    beadsBySection[section].push(bead);
  });

  return (
    <ScrollView 
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
          {beadsBySection[0]?.map(bead => (
            <RosaryBead
              key={bead.id}
              type={bead.type}
              isActive={bead.id === currentBeadId}
              isCompleted={completedBeadIds.includes(bead.id)}
              onPress={() => onBeadPress(bead.id)}
              size="small"
            />
          ))}
        </View>
      </View>

      {/* Connector line */}
      <View style={[styles.connector, { backgroundColor: Colors[colorScheme ?? 'light'].border }]} />

      {/* Decades 1-5 */}
      {[1, 2, 3, 4, 5].map(decadeNum => (
        <View key={decadeNum} style={styles.section}>
          <View style={styles.beadGroup}>
            {beadsBySection[decadeNum]?.map((bead, index) => {
              // For the mystery announcement (first bead), show the decade number instead
              if (index === 0 && bead.type === 'mystery-announcement') {
                const isActive = bead.id === currentBeadId;
                const isCompleted = completedBeadIds.includes(bead.id);
                
                return (
                  <TouchableOpacity
                    key={bead.id}
                    onPress={() => onBeadPress(bead.id)}
                    style={[
                      styles.decadeNumberBead,
                      {
                        backgroundColor: isActive
                          ? Colors[colorScheme ?? 'light'].primary
                          : isCompleted
                          ? Colors[colorScheme ?? 'light'].dominicanGold
                          : Colors[colorScheme ?? 'light'].card,
                        borderColor: isActive || isCompleted
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
                          color: isActive || isCompleted
                            ? Colors[colorScheme ?? 'light'].dominicanWhite
                            : Colors[colorScheme ?? 'light'].primary,
                        },
                      ]}
                    >
                      {decadeNum}
                    </Text>
                  </TouchableOpacity>
                );
              }
              
              // For all other beads, show normal bead
              return (
                <RosaryBead
                  key={bead.id}
                  type={bead.type}
                  isActive={bead.id === currentBeadId}
                  isCompleted={completedBeadIds.includes(bead.id)}
                  onPress={() => onBeadPress(bead.id)}
                  size="small"
                />
              );
            })}
          </View>
          {decadeNum < 5 && (
            <View style={[styles.connector, { backgroundColor: Colors[colorScheme ?? 'light'].border }]} />
          )}
        </View>
      ))}

      {/* Connector line */}
      <View style={[styles.connector, { backgroundColor: Colors[colorScheme ?? 'light'].border }]} />

      {/* Closing Prayers */}
      {beadsBySection[6] && beadsBySection[6].length > 0 && (
        <View style={styles.section}>
          <Text style={[styles.sectionLabel, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
            Final
          </Text>
          <View style={styles.beadGroup}>
            {beadsBySection[6]?.map(bead => (
              <RosaryBead
                key={bead.id}
                type={bead.type}
                isActive={bead.id === currentBeadId}
                isCompleted={completedBeadIds.includes(bead.id)}
                onPress={() => onBeadPress(bead.id)}
                size="small"
              />
            ))}
          </View>
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
    padding: 8,
    paddingVertical: 16,
    alignItems: 'center',
  },
  section: {
    alignItems: 'center',
    marginVertical: 4,
  },
  sectionLabel: {
    fontSize: 10,
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

