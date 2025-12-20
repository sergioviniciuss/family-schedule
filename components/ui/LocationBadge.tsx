import { Location } from '@/types';
import { cn } from '@/lib/utils';

interface LocationBadgeProps {
  location: Location;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const LocationBadge = ({ location, className, size = 'md' }: LocationBadgeProps) => {
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3 py-1.5',
  };

  const backgroundColor = location.color || '#6b7280';

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-medium text-white',
        sizeClasses[size],
        className
      )}
      style={{ backgroundColor }}
    >
      {location.name}
    </span>
  );
};

