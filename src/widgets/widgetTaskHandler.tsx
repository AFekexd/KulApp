import React from 'react';
import type { WidgetTaskHandlerProps } from 'react-native-android-widget';
import { PanicDropWidget } from './PanicDropWidget';
import { DashboardWidget } from './DashboardWidget';
import { storage } from '@/lib/mmkv';

import { StreakWidget } from './StreakWidget';
import { VsWidget } from './VsWidget';

const KEYS = {
  TODAY_COUNT: 'kulapp:today_count',
  STREAK: 'kulapp:streak',
  LAST_DROP: 'kulapp:last_drop_time',
} as const;

export async function widgetTaskHandler(props: WidgetTaskHandlerProps) {
  const { widgetInfo, clickAction, renderWidget } = props;

  let todayCount = storage.getNumber(KEYS.TODAY_COUNT) ?? 0;
  let streak = storage.getNumber(KEYS.STREAK) ?? 7;

  if (clickAction === 'QUICK_DROP_ACTION') {
    todayCount += 1;
    const lastDropTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    storage.set(KEYS.TODAY_COUNT, todayCount);
    storage.set(KEYS.LAST_DROP, lastDropTime);
  }

  if (widgetInfo.widgetName === 'PanicDrop') {
    renderWidget(<PanicDropWidget todayCount={todayCount} />);
  } else if (widgetInfo.widgetName === 'Dashboard') {
    renderWidget(
      <DashboardWidget
        todayCount={todayCount}
        streak={streak}
        xp={1245 + todayCount * 50}
      />
    );
  } else if (widgetInfo.widgetName === 'Streak') {
    renderWidget(<StreakWidget streak={streak} />);
  } else if (widgetInfo.widgetName === 'VsWidget') {
    renderWidget(
      <VsWidget 
        userCount={todayCount} 
        friendCount={2} // Placeholder for demo
        friendName="Rival" // Placeholder for demo
      />
    );
  }
}
