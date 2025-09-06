import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Colors } from '../constants/Colors';
import { useTheme } from './ThemeProvider';

interface SegmentedControlProps {
  values: string[];
  selectedIndex: number;
  onValueChange: (index: number) => void;
}

const SegmentedControl: React.FC<SegmentedControlProps> = ({
  values,
  selectedIndex,
  onValueChange,
}) => {
  const { colorScheme } = useTheme();

  return (
    <View style={[
      styles.container,
      { backgroundColor: Colors[colorScheme ?? 'light'].surface }
    ]}>
      {values.map((value, index) => (
        <TouchableOpacity
          key={index}
          style={[
            styles.segment,
            {
              backgroundColor: selectedIndex === index
                ? Colors[colorScheme ?? 'light'].primary
                : 'transparent',
            },
            index === 0 && styles.firstSegment,
            index === values.length - 1 && styles.lastSegment,
          ]}
          onPress={() => onValueChange(index)}
          activeOpacity={0.7}
        >
          <Text style={[
            styles.segmentText,
            {
              color: selectedIndex === index
                ? Colors[colorScheme ?? 'light'].dominicanWhite
                : Colors[colorScheme ?? 'light'].text,
            }
          ]}>
            {value}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 8,
    padding: 2,
    elevation: 1,
    boxShadow: '0px 1px 2px rgba(0, 0, 0, 0.1)',
  },
  segment: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
  },
  firstSegment: {
    borderTopLeftRadius: 6,
    borderBottomLeftRadius: 6,
  },
  lastSegment: {
    borderTopRightRadius: 6,
    borderBottomRightRadius: 6,
  },
  segmentText: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'System',
  },
});

export default SegmentedControl;
