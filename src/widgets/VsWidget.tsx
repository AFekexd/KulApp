"use no memo";
import React from 'react';
import { FlexWidget, TextWidget } from 'react-native-android-widget';

export interface VsWidgetProps {
  userCount: number;
  friendCount: number;
  friendName: string;
}

/**
 * 2x1 "Versus" Widget
 * Compares the user's daily drops against a friend.
 */
export function VsWidget({ userCount, friendCount, friendName }: VsWidgetProps) {
  // Simple logic to show who's winning
  const userWinning = userCount >= friendCount;

  return (
    <FlexWidget
      style={{
        height: 'match_parent',
        width: 'match_parent',
        backgroundColor: '#1E1E1E',
        borderRadius: 24,
        padding: 12,
        justifyContent: 'space-between',
        flexDirection: 'row',
        alignItems: 'center',
      }}
      clickAction="OPEN_APP"
    >
      {/* User Side */}
      <FlexWidget style={{ flex: 1, alignItems: 'center' }}>
        <TextWidget
          text="You"
          style={{ fontSize: 12, color: '#AAAAAA', marginBottom: 4 }}
        />
        <TextWidget
          text={`${userCount}`}
          style={{
            fontSize: 24,
            fontWeight: 'bold',
            color: userWinning ? '#F5A623' : '#FFFFFF',
          }}
        />
      </FlexWidget>

      {/* VS Badge */}
      <FlexWidget
        style={{
          backgroundColor: '#333333',
          borderRadius: 16,
          paddingHorizontal: 8,
          paddingVertical: 4,
        }}
      >
        <TextWidget
          text="VS"
          style={{ fontSize: 10, fontWeight: 'bold', color: '#F5A623' }}
        />
      </FlexWidget>

      {/* Friend Side */}
      <FlexWidget style={{ flex: 1, alignItems: 'center' }}>
        <TextWidget
          text={friendName || 'Friend'}
          style={{ fontSize: 12, color: '#AAAAAA', marginBottom: 4 }}
        />
        <TextWidget
          text={`${friendCount}`}
          style={{
            fontSize: 24,
            fontWeight: 'bold',
            color: !userWinning ? '#F5A623' : '#FFFFFF',
          }}
        />
      </FlexWidget>
    </FlexWidget>
  );
}
