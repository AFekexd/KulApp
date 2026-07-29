import { useMemo } from 'react';
import { useDropStore } from '@/stores/dropStore';

/**
 * Custom hook for calculating statistics from drop history.
 * Ideal for rendering charts with victory-native / skia.
 */
export const useStats = () => {
  const { drops } = useDropStore();

  // Last 7 days data
  const useWeeklyData = () => {
    return useMemo(() => {
      const data = new Array(7).fill(0);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      drops.forEach(drop => {
        const dropDate = new Date(drop.created_at);
        dropDate.setHours(0, 0, 0, 0);
        
        const diffTime = Math.abs(today.getTime() - dropDate.getTime());
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays < 7) {
          // Store data in reverse order (index 6 is today, 0 is 6 days ago)
          data[6 - diffDays]++;
        }
      });

      return data;
    }, [drops]);
  };

  // Last 30 days data
  const useMonthlyData = () => {
    return useMemo(() => {
      const data = new Array(30).fill(0);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      drops.forEach(drop => {
        const dropDate = new Date(drop.created_at);
        dropDate.setHours(0, 0, 0, 0);
        
        const diffDays = Math.floor((today.getTime() - dropDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (diffDays < 30) {
          data[29 - diffDays]++;
        }
      });

      return data;
    }, [drops]);
  };

  // Most frequent hour of day
  const useBathroomTimezone = () => {
    return useMemo(() => {
      if (drops.length === 0) return null;

      const hourCounts = new Array(24).fill(0);
      drops.forEach(drop => {
        const hour = new Date(drop.created_at).getHours();
        hourCounts[hour]++;
      });

      const maxCount = Math.max(...hourCounts);
      const mostFrequentHour = hourCounts.indexOf(maxCount);

      // Return a formatted string e.g. "8:00 AM - 9:00 AM"
      const formatHour = (h: number) => {
        const ampm = h >= 12 ? 'PM' : 'AM';
        const display = h % 12 === 0 ? 12 : h % 12;
        return `${display}:00 ${ampm}`;
      };

      return `${formatHour(mostFrequentHour)} - ${formatHour((mostFrequentHour + 1) % 24)}`;
    }, [drops]);
  };

  const useAverages = () => {
    return useMemo(() => {
      if (drops.length === 0) return { daily: 0, weekly: 0 };
      
      const oldestDrop = new Date(drops[drops.length - 1].created_at);
      const now = new Date();
      const daysDiff = Math.max(1, Math.ceil((now.getTime() - oldestDrop.getTime()) / (1000 * 60 * 60 * 24)));
      
      const dailyAverage = drops.length / daysDiff;
      
      return {
        daily: Number(dailyAverage.toFixed(1)),
        weekly: Number((dailyAverage * 7).toFixed(1))
      };
    }, [drops]);
  };

  const useBristolDistribution = () => {
    return useMemo(() => {
      const counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0 };
      
      drops.forEach(drop => {
        const scale = drop.bristol_scale as keyof typeof counts;
        if (scale >= 1 && scale <= 7) {
          counts[scale]++;
        }
      });

      return counts;
    }, [drops]);
  };

  return {
    useWeeklyData,
    useMonthlyData,
    useBathroomTimezone,
    useAverages,
    useBristolDistribution
  };
};
