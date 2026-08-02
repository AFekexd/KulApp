"use no memo";
import { FlexWidget, TextWidget } from 'react-native-android-widget';

export interface DashboardWidgetProps {
  todayCount: number;
  streak: number;
  xp: number;
}

/**
 * 2x2 "Stats & Rank" Widget (Section 6)
 * Native iOS 18 / Android Widget in flat light mode style.
 */
export function DashboardWidget({ todayCount, streak, xp }: DashboardWidgetProps) {
  return (
    <FlexWidget
      style={{
        height: 'match_parent',
        width: 'match_parent',
        backgroundColor: '#1E1E1E', // Dark mode premium
        borderRadius: 24,
        padding: 10,
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
        <FlexWidget style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TextWidget
            text="💩 "
            style={{
              fontSize: 16,
            }}
          />
          <TextWidget
            text="KulApp"
            style={{
              fontSize: 14,
              fontWeight: 'bold',
              color: '#FFFFFF',
            }}
          />
        </FlexWidget>

      </FlexWidget>

      {/* Stats Row */}
      <FlexWidget
        style={{
          flexDirection: 'row',
          justifyContent: 'space-around',
          alignItems: 'center',
          backgroundColor: '#2A2A2A',
          borderRadius: 16,
          padding: 8,
          marginVertical: 4,
        }}
      >
        <FlexWidget style={{ flex: 1, alignItems: 'center' }}>
          <TextWidget
            text={`${todayCount}`}
            style={{
              fontSize: 18,
              fontWeight: 'bold',
              color: '#FFFFFF',
            }}
          />
          <TextWidget
            text="TODAY"
            style={{
              fontSize: 10,
              color: '#AAAAAA',
              letterSpacing: 1,
            }}
          />
        </FlexWidget>

        <FlexWidget
          style={{
            width: 1,
            height: 30,
            backgroundColor: '#444444',
          }}
        />

        <FlexWidget style={{ flex: 1, alignItems: 'center' }}>
          <TextWidget
            text={`${xp || 1245}`}
            style={{
              fontSize: 18,
              fontWeight: 'bold',
              color: '#F5A623',
            }}
          />
          <TextWidget
            text="XP POINTS"
            style={{
              fontSize: 10,
              color: '#AAAAAA',
              letterSpacing: 1,
            }}
          />
        </FlexWidget>
      </FlexWidget>

      {/* Quick Drop Button */}
      <FlexWidget
        style={{
          backgroundColor: '#7C4D2E',
          borderRadius: 12,
          padding: 8,
          alignItems: 'center',
          justifyContent: 'center',
          width: 'match_parent',
        }}
        clickAction="QUICK_DROP_ACTION"
      >
        <TextWidget
          text="+ LOG QUICK DROP"
          style={{
            fontSize: 12,
            fontWeight: 'bold',
            color: '#FFFFFF',
            letterSpacing: 1,
          }}
        />
      </FlexWidget>
    </FlexWidget>
  );
}
