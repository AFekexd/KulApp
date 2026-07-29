import React from 'react';
import { FlexWidget, TextWidget } from 'react-native-android-widget';

export interface DashboardWidgetProps {
  todayCount: number;
  streak: number;
  xp: number;
  rank: string;
}

/**
 * 2x2 "Stats & Rank" Widget (Section 6)
 * Native iOS 18 / Android Widget in flat light mode style.
 */
export function DashboardWidget({ todayCount, streak, xp, rank }: DashboardWidgetProps) {
  return (
    <FlexWidget
      style={{
        height: 'match_parent',
        width: 'match_parent',
        backgroundColor: '#FFFFFF',
        borderRadius: 24,
        padding: 16,
        justifyContent: 'space-between',
      }}
    >
      {/* Header */}
      <FlexWidget
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          width: 'match_parent',
        }}
      >
        <TextWidget
          text="💩 PoopTracker"
          style={{
            fontSize: 14,
            fontWeight: 'bold',
            color: '#1B1B1B',
          }}
        />

        <TextWidget
          text={rank || '#17'}
          style={{
            fontSize: 12,
            fontWeight: 'bold',
            color: '#7C4D2E',
          }}
        />
      </FlexWidget>

      {/* Stats Row */}
      <FlexWidget
        style={{
          flexDirection: 'row',
          justifyContent: 'space-around',
          alignItems: 'center',
          backgroundColor: '#F7F7F5',
          borderRadius: 16,
          padding: 12,
          marginVertical: 4,
        }}
      >
        <FlexWidget style={{ alignItems: 'center' }}>
          <TextWidget
            text={`${todayCount}`}
            style={{
              fontSize: 20,
              fontWeight: 'bold',
              color: '#1B1B1B',
            }}
          />
          <TextWidget
            text="Today"
            style={{
              fontSize: 10,
              color: '#6B6B6B',
            }}
          />
        </FlexWidget>

        <FlexWidget style={{ alignItems: 'center' }}>
          <TextWidget
            text={`${xp || 1245}`}
            style={{
              fontSize: 18,
              fontWeight: 'bold',
              color: '#7C4D2E',
            }}
          />
          <TextWidget
            text="XP Points"
            style={{
              fontSize: 10,
              color: '#6B6B6B',
            }}
          />
        </FlexWidget>
      </FlexWidget>

      {/* Quick Drop Button */}
      <FlexWidget
        style={{
          backgroundColor: '#7C4D2E',
          borderRadius: 14,
          padding: 10,
          alignItems: 'center',
          justifyContent: 'center',
          width: 'match_parent',
        }}
        clickAction="QUICK_DROP_ACTION"
      >
        <TextWidget
          text="+ Quick Drop"
          style={{
            fontSize: 12,
            fontWeight: 'bold',
            color: '#FFFFFF',
          }}
        />
      </FlexWidget>
    </FlexWidget>
  );
}
