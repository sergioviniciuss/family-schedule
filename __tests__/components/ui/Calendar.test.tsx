import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
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
  // Helper to create dates in local timezone to avoid timezone issues
  const createLocalDate = (year: number, month: number, day: number) => {
    return new Date(year, month - 1, day);
  };

  it('should render calendar with month view', async () => {
    render(
      <Calendar
        entries={mockEntries}
        locations={mockLocations}
        startDate={createLocalDate(2024, 1, 1)}
        endDate={createLocalDate(2024, 1, 31)}
      />
    );

    // Wait for the calendar to initialize with the correct month
    await waitFor(() => {
      expect(screen.getByText(/january 2024/i)).toBeInTheDocument();
    });
  });

  it('should display sleep entries on calendar', async () => {
    render(
      <Calendar
        entries={mockEntries}
        locations={mockLocations}
        startDate={createLocalDate(2024, 1, 1)}
        endDate={createLocalDate(2024, 1, 31)}
      />
    );

    // Wait for the calendar to render and then check for the entry
    await waitFor(() => {
      expect(screen.getByText(/january 2024/i)).toBeInTheDocument();
    });

    // The entry should be visible on day 15
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
        startDate={createLocalDate(2024, 1, 1)}
        endDate={createLocalDate(2024, 1, 31)}
      />
    );

    // Wait for the calendar to render
    await waitFor(() => {
      expect(screen.getByText(/january 2024/i)).toBeInTheDocument();
    });

    // Find the button containing day 15 - it should be enabled and clickable
    await waitFor(() => {
      const allButtons = screen.getAllByRole('button');
      const day15Button = allButtons.find((button) => {
        const text = button.textContent || '';
        const htmlButton = button as HTMLButtonElement;
        return text.includes('15') && !htmlButton.disabled;
      });
      expect(day15Button).toBeDefined();
    });

    const allButtons = screen.getAllByRole('button');
    const day15Button = allButtons.find((button) => {
      const text = button.textContent || '';
      const htmlButton = button as HTMLButtonElement;
      return text.includes('15') && !htmlButton.disabled;
    });
    
    expect(day15Button).toBeDefined();
    if (day15Button) {
      await user.click(day15Button);
      expect(handleDateSelect).toHaveBeenCalled();
    }
  });

  it('should navigate months', async () => {
    const user = userEvent.setup();

    render(
      <Calendar
        entries={mockEntries}
        locations={mockLocations}
        startDate={createLocalDate(2024, 1, 1)}
        endDate={createLocalDate(2024, 12, 31)}
      />
    );

    // Should start with January (wait for initial render)
    await waitFor(() => {
      expect(screen.getByText(/january 2024/i)).toBeInTheDocument();
    });

    const nextButton = screen.getByRole('button', { name: /→/i });
    await user.click(nextButton);

    // Should show February after clicking next - wait for the state update
    await waitFor(() => {
      expect(screen.getByText(/february 2024/i)).toBeInTheDocument();
    });
  });
});

