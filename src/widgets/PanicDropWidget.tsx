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
        backgroundColor: '#FFFFFF',
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
          backgroundColor: '#7C4D2E',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <TextWidget
          text="💩"
          style={{
            fontSize: 28,
          }}
        />
      </FlexWidget>

      <TextWidget
        text="Quick Drop"
        style={{
          fontSize: 12,
          fontWeight: 'bold',
          color: '#1B1B1B',
          marginTop: 6,
        }}
      />
    </FlexWidget>
  );
}
