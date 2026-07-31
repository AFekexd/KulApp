import React from 'react';
import { Image, ImageStyle, StyleProp } from 'react-native';

interface EmojiProps {
  symbol: string;
  size?: number;
  style?: StyleProp<ImageStyle>;
}

/**
 * Converts a native emoji string into a Twemoji image URL for consistent rendering across platforms.
 */
export const Emoji: React.FC<EmojiProps> = ({ symbol, size = 24, style }) => {
  if (!symbol) return null;

  if (symbol === '💩') {
    return (
      <Image 
        source={require('../../../assets/images/pile_of_poo_3d.png')} 
        style={[{ width: size, height: size }, style]} 
        resizeMode="contain"
      />
    );
  }

  // Convert emoji to Twemoji compatible code point
  const codePoint = Array.from(symbol)
    .map(c => c.codePointAt(0)?.toString(16))
    .filter(val => val !== 'fe0f') // Remove variation selector
    .join('-');

  const uri = `https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/72x72/${codePoint}.png`;

  return (
    <Image 
      source={{ uri }} 
      style={[{ width: size, height: size }, style]} 
      resizeMode="contain"
    />
  );
};
