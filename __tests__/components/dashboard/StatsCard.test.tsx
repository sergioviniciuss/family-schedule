import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { Location, SleepEntryWithLocation } from '@/types';

const mockLocation: Location = {
  id: '1',
  userId: 'user1',
  name: 'Parents',
  color: '#3b82f6',
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockEntries: SleepEntryWithLocation[] = [
  {
    id: '1',
    userId: 'user1',
    locationId: '1',
    date: '2024-01-15',
    createdAt: new Date(),
    updatedAt: new Date(),
    location: mockLocation,
  },
  {
    id: '2',
    userId: 'user1',
    locationId: '1',
    date: '2024-01-16',
    createdAt: new Date(),
    updatedAt: new Date(),
    location: mockLocation,
  },
];

describe('StatsCard', () => {
  it('should display location name', () => {
    render(<StatsCard location={mockLocation} entries={mockEntries} period="Last 30 days" />);
    expect(screen.getByText('Parents')).toBeInTheDocument();
  });

  it('should display correct count of entries', () => {
    render(<StatsCard location={mockLocation} entries={mockEntries} period="Last 30 days" />);
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('should display period label', () => {
    render(<StatsCard location={mockLocation} entries={mockEntries} period="Last 30 days" />);
    expect(screen.getByText(/last 30 days/i)).toBeInTheDocument();
  });

  it('should show zero when no entries', () => {
    render(<StatsCard location={mockLocation} entries={[]} period="Last 30 days" />);
    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('should only count entries for the specific location', () => {
    const otherLocation: Location = {
      id: '2',
      userId: 'user1',
      name: 'In-laws',
      color: '#10b981',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const mixedEntries: SleepEntryWithLocation[] = [
      ...mockEntries,
      {
        id: '3',
        userId: 'user1',
        locationId: '2',
        date: '2024-01-17',
        createdAt: new Date(),
        updatedAt: new Date(),
        location: otherLocation,
      },
    ];

    render(<StatsCard location={mockLocation} entries={mixedEntries} period="Last 30 days" />);
    expect(screen.getByText('2')).toBeInTheDocument();
  });
});

