import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toISOString().split('T')[0];
}

/**
 * Parse a date string (YYYY-MM-DD) to a Date object at local midnight.
 * This avoids timezone issues when comparing dates.
 */
export function parseLocalDate(dateString: string): Date {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);
}

/**
 * Normalize a Date object or date string to local midnight.
 * This ensures consistent date comparisons regardless of timezone.
 * 
 * For Date objects created from ISO strings (UTC midnight), this extracts
 * the UTC year/month/day components to create a local date representing
 * the same calendar day.
 */
export function normalizeToLocalDate(date: Date | string): Date {
  if (typeof date === 'string') {
    // If it looks like an ISO date string (YYYY-MM-DD), parse as local
    if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return parseLocalDate(date);
    }
    // Otherwise, create a Date and extract UTC components
    const d = new Date(date);
    return new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
  }
  // For Date objects, extract UTC components to get the calendar day
  // This handles Date objects created from ISO strings like new Date('2024-01-15')
  return new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
}

export function getDateRange(days: number): { from: string; to: string } {
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - days);
  return {
    from: formatDate(from),
    to: formatDate(to),
  };
}

export function isValidDate(dateString: string): boolean {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateString)) return false;
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date.getTime());
}

