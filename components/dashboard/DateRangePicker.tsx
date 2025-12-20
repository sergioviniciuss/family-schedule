'use client';

import * as React from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { getDateRange, formatDate } from '@/lib/utils';

interface DateRangePickerProps {
  onRangeChange: (from: string, to: string) => void;
  defaultDays?: number;
}

export const DateRangePicker = ({ onRangeChange, defaultDays = 60 }: DateRangePickerProps) => {
  const [customFrom, setCustomFrom] = React.useState('');
  const [customTo, setCustomTo] = React.useState('');
  const [isCustom, setIsCustom] = React.useState(false);

  React.useEffect(() => {
    if (!isCustom) {
      const range = getDateRange(defaultDays);
      onRangeChange(range.from, range.to);
    }
  }, [defaultDays, isCustom, onRangeChange]);

  const handlePresetClick = (days: number) => {
    setIsCustom(false);
    const range = getDateRange(days);
    onRangeChange(range.from, range.to);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customFrom && customTo) {
      setIsCustom(true);
      onRangeChange(customFrom, customTo);
    }
  };

  const today = formatDate(new Date());

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => handlePresetClick(30)}
        >
          Last 30 days
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => handlePresetClick(60)}
        >
          Last 60 days
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => handlePresetClick(90)}
        >
          Last 90 days
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setIsCustom(!isCustom)}
        >
          Custom Range
        </Button>
      </div>

      {isCustom && (
        <form onSubmit={handleCustomSubmit} className="flex gap-2 items-end">
          <div className="flex-1">
            <label htmlFor="from" className="block text-sm font-medium mb-1">
              From
            </label>
            <Input
              id="from"
              type="date"
              value={customFrom}
              onChange={(e) => setCustomFrom(e.target.value)}
              max={today}
              required
            />
          </div>
          <div className="flex-1">
            <label htmlFor="to" className="block text-sm font-medium mb-1">
              To
            </label>
            <Input
              id="to"
              type="date"
              value={customTo}
              onChange={(e) => setCustomTo(e.target.value)}
              max={today}
              required
            />
          </div>
          <Button type="submit" size="sm">
            Apply
          </Button>
        </form>
      )}
    </div>
  );
};

