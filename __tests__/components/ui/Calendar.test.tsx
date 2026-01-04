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
        return text.includes('15') && button.getAttribute('aria-disabled') !== 'true';
      });
      expect(day15Button).toBeDefined();
    });

    const allButtons = screen.getAllByRole('button');
    const day15Button = allButtons.find((button) => {
      const text = button.textContent || '';
      return text.includes('15') && button.getAttribute('aria-disabled') !== 'true';
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

  describe('Timezone handling', () => {
    it('should handle date strings (YYYY-MM-DD format) correctly', async () => {
      // Test with date strings as they would come from the API
      render(
        <Calendar
          entries={mockEntries}
          locations={mockLocations}
          startDate="2024-01-15"
          endDate="2024-01-31"
        />
      );

      await waitFor(() => {
        expect(screen.getByText(/january 2024/i)).toBeInTheDocument();
      });

      // Day 15 should be enabled (first day of range)
      const allButtons = screen.getAllByRole('button');
      const day15Button = allButtons.find((button) => {
        const text = button.textContent || '';
        return text.includes('15') && button.getAttribute('aria-disabled') !== 'true' && !text.includes('→') && !text.includes('←');
      });
      expect(day15Button).toBeDefined();
      expect(day15Button?.getAttribute('aria-disabled')).not.toBe('true');
    });

    it('should handle Date objects created from ISO strings correctly', async () => {
      // Simulate what dashboard does: new Date(dateFrom) where dateFrom is "2024-01-15"
      // This creates a Date at UTC midnight
      const startDate = new Date('2024-01-15');
      const endDate = new Date('2024-01-31');
      
      render(
        <Calendar
          entries={mockEntries}
          locations={mockLocations}
          startDate={startDate}
          endDate={endDate}
        />
      );

      await waitFor(() => {
        expect(screen.getByText(/january 2024/i)).toBeInTheDocument();
      });

      // Day 15 should be enabled, not disabled due to timezone issues
      const allButtons = screen.getAllByRole('button');
      const day15Button = allButtons.find((button) => {
        const text = button.textContent || '';
        return text.includes('15') && button.getAttribute('aria-disabled') !== 'true' && !text.includes('→') && !text.includes('←');
      });
      expect(day15Button).toBeDefined();
      expect(day15Button?.getAttribute('aria-disabled')).not.toBe('true');
    });

    it('should correctly handle first day of month regardless of timezone', async () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-10');
      
      render(
        <Calendar
          entries={[]}
          locations={mockLocations}
          startDate={startDate}
          endDate={endDate}
        />
      );

      await waitFor(() => {
        expect(screen.getByText(/january 2024/i)).toBeInTheDocument();
      });

      // Day 1 should be enabled
      const allButtons = screen.getAllByRole('button');
      const day1Button = allButtons.find((button) => {
        const text = button.textContent || '';
        return text.trim() === '1' && button.getAttribute('aria-disabled') !== 'true';
      });
      expect(day1Button).toBeDefined();
      expect(day1Button?.getAttribute('aria-disabled')).not.toBe('true');

      // Day 11 should be disabled (outside range)
      const day11Buttons = allButtons.filter((button) => {
        const text = button.textContent || '';
        return text.includes('11') && !text.includes('→') && !text.includes('←');
      });
      const day11Button = day11Buttons[0];
      expect(day11Button).toBeDefined();
      expect(day11Button.getAttribute('aria-disabled')).toBe('true');
    });
  });
});
