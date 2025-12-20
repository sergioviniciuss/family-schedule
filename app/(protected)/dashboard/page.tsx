'use client';

import * as React from 'react';
import { Calendar } from '@/components/ui/Calendar';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { DateRangePicker } from '@/components/dashboard/DateRangePicker';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Location, SleepEntryWithLocation } from '@/types';
import { formatDate, getDateRange } from '@/lib/utils';

export default function DashboardPage() {
  const [locations, setLocations] = React.useState<Location[]>([]);
  const [entries, setEntries] = React.useState<SleepEntryWithLocation[]>([]);
  const [selectedDate, setSelectedDate] = React.useState<string>(formatDate(new Date()));
  const [selectedLocationId, setSelectedLocationId] = React.useState<string>('');
  const [dateFrom, setDateFrom] = React.useState<string>('');
  const [dateTo, setDateTo] = React.useState<string>('');
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);

  // Initialize date range
  React.useEffect(() => {
    const range = getDateRange(60);
    setDateFrom(range.from);
    setDateTo(range.to);
  }, []);

  // Fetch locations
  React.useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await fetch('/api/locations');
        if (response.ok) {
          const data = await response.json();
          setLocations(data);
          if (data.length > 0 && !selectedLocationId) {
            setSelectedLocationId(data[0].id);
          }
        }
      } catch (error) {
        console.error('Error fetching locations:', error);
      }
    };

    fetchLocations();
  }, [selectedLocationId]);

  // Fetch sleep entries when date range changes
  React.useEffect(() => {
    if (!dateFrom || !dateTo) return;

    const fetchEntries = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/sleep-entries?from=${dateFrom}&to=${dateTo}`);
        if (response.ok) {
          const data = await response.json();
          setEntries(data);
        }
      } catch (error) {
        console.error('Error fetching entries:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEntries();
  }, [dateFrom, dateTo]);

  // Set selected location when date changes
  React.useEffect(() => {
    const entry = entries.find((e) => e.date === selectedDate);
    if (entry) {
      setSelectedLocationId(entry.locationId);
    }
  }, [selectedDate, entries]);

  const handleSaveEntry = async () => {
    if (!selectedLocationId || !selectedDate) return;

    setSaving(true);
    try {
      const response = await fetch('/api/sleep-entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: selectedDate,
          locationId: selectedLocationId,
        }),
      });

      if (response.ok) {
        const newEntry = await response.json();
        setEntries((prev) => {
          const filtered = prev.filter((e) => e.date !== selectedDate);
          return [newEntry, ...filtered];
        });
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to save entry');
      }
    } catch (error) {
      console.error('Error saving entry:', error);
      alert('Failed to save entry');
    } finally {
      setSaving(false);
    }
  };

  const handleDateRangeChange = (from: string, to: string) => {
    setDateFrom(from);
    setDateTo(to);
  };

  const periodLabel =
    dateFrom && dateTo
      ? `${new Date(dateFrom).toLocaleDateString()} - ${new Date(dateTo).toLocaleDateString()}`
      : 'Selected period';

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Track where you sleep during your trips
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <Calendar
              entries={entries}
              locations={locations}
              selectedDate={selectedDate}
              onDateSelect={setSelectedDate}
            />
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">
              Quick Entry
            </h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="date" className="block text-sm font-medium mb-1">
                  Date
                </label>
                <Input
                  id="date"
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  max={formatDate(new Date())}
                />
              </div>
              <div>
                <label htmlFor="location" className="block text-sm font-medium mb-1">
                  Location
                </label>
                <select
                  id="location"
                  value={selectedLocationId}
                  onChange={(e) => setSelectedLocationId(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  disabled={locations.length === 0}
                >
                  {locations.length === 0 ? (
                    <option>No locations available</option>
                  ) : (
                    locations.map((loc) => (
                      <option key={loc.id} value={loc.id}>
                        {loc.name}
                      </option>
                    ))
                  )}
                </select>
              </div>
              <Button
                onClick={handleSaveEntry}
                disabled={!selectedLocationId || saving || locations.length === 0}
                className="w-full"
              >
                {saving ? 'Saving...' : 'Save Entry'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
          Date Range
        </h2>
        <DateRangePicker onRangeChange={handleDateRangeChange} defaultDays={60} />
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">Statistics</h2>
        {loading ? (
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {locations.map((location) => (
              <StatsCard
                key={location.id}
                location={location}
                entries={entries}
                period={periodLabel}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

