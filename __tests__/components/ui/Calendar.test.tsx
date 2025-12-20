import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Calendar } from '@/components/ui/Calendar';
import { Location, SleepEntryWithLocation } from '@/types';

const mockLocations: Location[] = [
  {
    id: '1',
    userId: 'user1',
    name: 'Parents',
    color: '#3b82f6',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    userId: 'user1',
    name: 'In-laws',
    color: '#10b981',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const mockEntries: SleepEntryWithLocation[] = [
  {
    id: '1',
    userId: 'user1',
    locationId: '1',
    date: '2024-01-15',
    createdAt: new Date(),
    updatedAt: new Date(),
    location: mockLocations[0],
  },
];

describe('Calendar', () => {
  it('should render calendar with month view', () => {
    render(
      <Calendar
        entries={mockEntries}
        locations={mockLocations}
        startDate={new Date('2024-01-01')}
        endDate={new Date('2024-01-31')}
      />
    );

    expect(screen.getByText(/january/i)).toBeInTheDocument();
  });

  it('should display sleep entries on calendar', () => {
    render(
      <Calendar
        entries={mockEntries}
        locations={mockLocations}
        startDate={new Date('2024-01-01')}
        endDate={new Date('2024-01-31')}
      />
    );

    expect(screen.getByText('Parents')).toBeInTheDocument();
  });

  it('should call onDateSelect when date is clicked', async () => {
    const handleDateSelect = vi.fn();
    const user = userEvent.setup();

    render(
      <Calendar
        entries={mockEntries}
        locations={mockLocations}
        onDateSelect={handleDateSelect}
        startDate={new Date('2024-01-01')}
        endDate={new Date('2024-01-31')}
      />
    );

    // Find and click a date button (day 15)
    const dateButton = screen.getByRole('button', { name: /15/i });
    await user.click(dateButton);

    expect(handleDateSelect).toHaveBeenCalled();
  });

  it('should navigate months', async () => {
    const user = userEvent.setup();

    render(
      <Calendar
        entries={mockEntries}
        locations={mockLocations}
        startDate={new Date('2024-01-01')}
        endDate={new Date('2024-12-31')}
      />
    );

    const nextButton = screen.getByRole('button', { name: /→/i });
    await user.click(nextButton);

    // Should show February
    expect(screen.getByText(/february/i)).toBeInTheDocument();
  });
});

