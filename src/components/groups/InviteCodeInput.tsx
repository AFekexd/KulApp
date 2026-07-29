import React, { useRef, useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, Pressable } from 'react-native';
import Animated, { 
  useAnimatedStyle, 
  withTiming, 
  interpolateColor,
  useSharedValue,
} from 'react-native-reanimated';
import { Colors, typography, spacing, borderRadius, timingConfigs, withOpacity } from '@/theme';

interface InviteCodeInputProps {
  value: string;
  onChangeText: (text: string) => void;
}

const CODE_LENGTH = 6;

const CodeBox = ({ char, isActive }: { char: string; isActive: boolean }) => {
  const activeProgress = useSharedValue(isActive ? 1 : 0);

  useEffect(() => {
    activeProgress.value = withTiming(isActive ? 1 : 0, timingConfigs.fast);
  }, [isActive, activeProgress]);

  const animatedStyle = useAnimatedStyle(() => {
    const borderColor = interpolateColor(
      activeProgress.value,
      [0, 1],
      [Colors.dark.borderBright, Colors.accent.mint]
    );

    // withOpacity will generate an rgba string which can be interpolated
    const backgroundColor = interpolateColor(
      activeProgress.value,
      [0, 1],
      ['rgba(0,0,0,0.05)', 'rgba(0, 255, 178, 0.1)'] // Hardcoded mint rgba for safety with interpolateColor
    );

    return {
      borderColor,
      backgroundColor,
    };
  });

  return (
    <Animated.View style={[styles.box, animatedStyle]}>
      <Text style={styles.charText}>{char}</Text>
    </Animated.View>
  );
};

export const InviteCodeInput: React.FC<InviteCodeInputProps> = ({ value, onChangeText }) => {
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<TextInput>(null);

  const handlePress = () => {
    inputRef.current?.focus();
  };

  const handleTextChange = (text: string) => {
    // Only allow alphanumeric, uppercase
    const cleaned = text.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
    if (cleaned.length <= CODE_LENGTH) {
      onChangeText(cleaned);
    }
  };

  const codeArray = Array(CODE_LENGTH).fill('');
  for (let i = 0; i < value.length; i++) {
    codeArray[i] = value[i];
  }

  return (
    <View style={styles.container}>
      <Pressable onPress={handlePress} style={styles.boxesContainer}>
        {codeArray.map((char, index) => {
          const isActive = isFocused && (index === value.length || (index === CODE_LENGTH - 1 && value.length === CODE_LENGTH));
          return <CodeBox key={index} char={char} isActive={isActive} />;
        })}
      </Pressable>
      
      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={handleTextChange}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        keyboardType="default"
        autoCapitalize="characters"
        autoCorrect={false}
        maxLength={CODE_LENGTH}
        style={styles.hiddenInput}
        caretHidden
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: spacing.md,
    alignItems: 'center',
    width: '100%',
  },
  boxesContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    gap: spacing.sm,
  },
  box: {
    flex: 1,
    aspectRatio: 0.8,
    borderWidth: 2,
    borderRadius: borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  charText: {
    ...typography.heading2,
    color: Colors.dark.text,
  },
  hiddenInput: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    opacity: 0,
  },
});

