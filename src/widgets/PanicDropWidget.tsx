"use no memo";
import React from 'react';
import { FlexWidget, TextWidget } from 'react-native-android-widget';

export interface QuickDropWidgetProps {
  todayCount?: number;
}

/**
 * 1x1 "Quick Drop" Home Widget (Section 6)
 * Minimalist white card with a single primary icon & one-tap instant report.
 */
export function PanicDropWidget({ todayCount = 0 }: QuickDropWidgetProps) {
  return (
    <FlexWidget
      style={{
        height: 'match_parent',
        width: 'match_parent',
        backgroundColor: '#7C4D2E',
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 12,
      }}
      clickAction="QUICK_DROP_ACTION"
    >
      <FlexWidget
        style={{
          width: 56,
          height: 56,
          borderRadius: 28,
          backgroundColor: '#FFFFFF',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <TextWidget
          text="💩"
          style={{
            fontSize: 32,
          }}
        />
      </FlexWidget>

      <TextWidget
        text="QUICK DROP"
        style={{
          fontSize: 11,
          fontWeight: 'bold',
          color: '#FFFFFF',
          marginTop: 8,
          letterSpacing: 1.2,
        }}
      />
    </FlexWidget>
  );
}
