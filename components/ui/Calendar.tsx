'use client';

import * as React from 'react';
import { SleepEntryWithLocation, Location } from '@/types';
import { formatDate, cn } from '@/lib/utils';
import { LocationBadge } from './LocationBadge';

interface CalendarProps {
  entries: SleepEntryWithLocation[];
  locations: Location[];
  selectedDate?: string;
  onDateSelect?: (date: string) => void;
  startDate?: Date;
  endDate?: Date;
}

export const Calendar = ({
  entries,
  locations,
  selectedDate,
  onDateSelect,
  startDate,
  endDate,
}: CalendarProps) => {
  const today = new Date();
  const start = startDate || new Date(today.getFullYear(), today.getMonth() - 2, 1);
  const end = endDate || new Date(today.getFullYear(), today.getMonth() + 1, 0);
  
  // Initialize currentMonth - always use the same logic for SSR and client to avoid hydration mismatch
  // We'll restore from localStorage after hydration in a useEffect
  const [currentMonth, setCurrentMonth] = React.useState(() => {
    const normalizedStart = new Date(start.getFullYear(), start.getMonth(), 1);
    const normalizedEnd = new Date(end.getFullYear(), end.getMonth(), 1);
    
    if (startDate) {
      const normalizedDate = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
      // Clamp to valid range
      if (normalizedDate < normalizedStart) return normalizedStart;
      if (normalizedDate > normalizedEnd) return normalizedEnd;
      return normalizedDate;
    }
    
    // Default to current month, clamped to valid range
    // Don't use localStorage here to avoid hydration mismatch
    const normalizedToday = new Date(today.getFullYear(), today.getMonth(), 1);
    if (normalizedToday < normalizedStart) return normalizedStart;
    if (normalizedToday > normalizedEnd) return normalizedEnd;
    return normalizedToday;
  });

  // Track if component has mounted (client-side only)
  const [hasMounted, setHasMounted] = React.useState(false);

  // Restore from localStorage after hydration (client-only)
  React.useEffect(() => {
    setHasMounted(true);
    
    // Only restore from localStorage if startDate is not provided
    // This ensures server and client render the same initial value
    if (!startDate && typeof window !== 'undefined') {
      const savedMonth = localStorage.getItem('calendar-current-month');
      if (savedMonth) {
        try {
          const savedDate = new Date(savedMonth);
          if (!isNaN(savedDate.getTime())) {
            const normalizedStart = new Date(start.getFullYear(), start.getMonth(), 1);
            const normalizedEnd = new Date(end.getFullYear(), end.getMonth(), 1);
            const normalizedSaved = new Date(savedDate.getFullYear(), savedDate.getMonth(), 1);
            
            // Only use saved date if it's within the valid range
            if (normalizedSaved >= normalizedStart && normalizedSaved <= normalizedEnd) {
              setCurrentMonth(normalizedSaved);
            }
          }
        } catch (e) {
          // Invalid date in localStorage, ignore it
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount - we intentionally don't include start/end to avoid re-running

  // Save currentMonth to localStorage whenever it changes (but only after mount)
  React.useEffect(() => {
    if (hasMounted && typeof window !== 'undefined') {
      localStorage.setItem('calendar-current-month', currentMonth.toISOString());
    }
  }, [currentMonth, hasMounted]);

  // Update currentMonth when startDate or endDate prop changes
  React.useEffect(() => {
    const normalizedStart = new Date(start.getFullYear(), start.getMonth(), 1);
    const normalizedEnd = new Date(end.getFullYear(), end.getMonth(), 1);
    
    setCurrentMonth((prev) => {
      const normalizedPrev = new Date(prev.getFullYear(), prev.getMonth(), 1);
      
      // If current month is outside the new range, clamp it
      if (normalizedPrev < normalizedStart) {
        return normalizedStart;
      }
      if (normalizedPrev > normalizedEnd) {
        return normalizedEnd;
      }
      
      return prev;
    });
  }, [startDate, endDate, start, end]);

  const entriesMap = React.useMemo(() => {
    const map = new Map<string, SleepEntryWithLocation>();
    entries.forEach((entry) => {
      map.set(entry.date, entry);
    });
    return map;
  }, [entries]);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek, year, month };
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth((prev) => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      
      // Normalize to first day of month for comparison
      const normalizedNew = new Date(newDate.getFullYear(), newDate.getMonth(), 1);
      const normalizedStart = new Date(start.getFullYear(), start.getMonth(), 1);
      const normalizedEnd = new Date(end.getFullYear(), end.getMonth(), 1);
      
      // Clamp to valid range
      if (normalizedNew < normalizedStart) {
        return normalizedStart;
      }
      if (normalizedNew > normalizedEnd) {
        return normalizedEnd;
      }
      
      return normalizedNew;
    });
  };

  const isDateInRange = (date: Date) => {
    return date >= start && date <= end;
  };

  const isToday = (date: Date) => {
    return formatDate(date) === formatDate(today);
  };

  const handleDateClick = (date: Date) => {
    if (!isDateInRange(date)) return;
    const dateStr = formatDate(date);
    onDateSelect?.(dateStr);
  };

  const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(currentMonth);
  const monthName = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  
  // Check if we're at the boundaries
  const normalizedCurrent = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
  const normalizedStart = new Date(start.getFullYear(), start.getMonth(), 1);
  const normalizedEnd = new Date(end.getFullYear(), end.getMonth(), 1);
  const canGoPrev = normalizedCurrent > normalizedStart;
  const canGoNext = normalizedCurrent < normalizedEnd;

  const days = [];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Add empty cells for days before the first day of the month
  for (let i = 0; i < startingDayOfWeek; i++) {
    days.push(null);
  }

  // Add cells for each day of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    days.push(date);
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => navigateMonth('prev')}
          disabled={!canGoPrev}
          className={cn(
            "px-3 py-1 rounded transition-colors",
            canGoPrev
              ? "hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
              : "opacity-30 cursor-not-allowed"
          )}
          type="button"
        >
          ←
        </button>
        <h2 className="text-lg font-semibold">{monthName}</h2>
        <button
          onClick={() => navigateMonth('next')}
          disabled={!canGoNext}
          className={cn(
            "px-3 py-1 rounded transition-colors",
            canGoNext
              ? "hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
              : "opacity-30 cursor-not-allowed"
          )}
          type="button"
        >
          →
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayNames.map((day) => (
          <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((date, index) => {
          if (date === null) {
            return <div key={`empty-${index}`} className="aspect-square" />;
          }

          const dateStr = formatDate(date);
          const entry = entriesMap.get(dateStr);
          const inRange = isDateInRange(date);
          const isSelected = selectedDate === dateStr;
          const isTodayDate = isToday(date);

          return (
            <button
              key={dateStr}
              onClick={() => handleDateClick(date)}
              disabled={!inRange}
              className={cn(
                'aspect-square rounded border text-sm transition-colors',
                inRange
                  ? 'hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer'
                  : 'opacity-30 cursor-not-allowed',
                isSelected && 'ring-2 ring-blue-500 ring-offset-2',
                isTodayDate && 'bg-blue-50 dark:bg-blue-900/20 font-semibold',
                !entry && inRange && 'border-gray-200 dark:border-gray-700'
              )}
              type="button"
            >
              <div className="flex flex-col items-center justify-center h-full p-1">
                <span className="text-xs mb-1">{date.getDate()}</span>
                {entry && (
                  <LocationBadge location={entry.location} size="sm" className="text-[10px]" />
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

