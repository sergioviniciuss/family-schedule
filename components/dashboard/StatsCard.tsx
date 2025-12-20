import { Location, SleepEntryWithLocation } from '@/types';
import { LocationBadge } from '@/components/ui/LocationBadge';

interface StatsCardProps {
  location: Location;
  entries: SleepEntryWithLocation[];
  period: string;
}

export const StatsCard = ({ location, entries, period }: StatsCardProps) => {
  const count = entries.filter((entry) => entry.locationId === location.id).length;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-2">
        <LocationBadge location={location} size="md" />
        <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">{count}</span>
      </div>
      <p className="text-sm text-gray-500 dark:text-gray-400">nights in {period}</p>
    </div>
  );
};

