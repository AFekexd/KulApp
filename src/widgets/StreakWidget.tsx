"use no memo";
import React from 'react';
import { FlexWidget, TextWidget } from 'react-native-android-widget';

export interface StreakWidgetProps {
  streak: number;
}

export function StreakWidget({ streak }: StreakWidgetProps) {
  return (
    <FlexWidget
      style={{
        height: 'match_parent',
        width: 'match_parent',
        backgroundColor: '#1E1E1E',
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 8,
      }}
      clickAction="OPEN_APP"
    >
      <FlexWidget
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <TextWidget
          text="🔥"
          style={{
            fontSize: 28,
            marginRight: 8,
          }}
        />
        <FlexWidget style={{ flexDirection: 'column' }}>
          <TextWidget
            text={`${streak} Day${streak !== 1 ? 's' : ''}`}
            style={{
              fontSize: 22,
              fontWeight: 'bold',
              color: '#FFFFFF',
            }}
          />
          <TextWidget
            text="Current Streak"
            style={{
              fontSize: 12,
              color: '#AAAAAA',
            }}
          />
        </FlexWidget>
      </FlexWidget>
    </FlexWidget>
  );
}
