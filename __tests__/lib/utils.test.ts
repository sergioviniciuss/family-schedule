import { describe, it, expect } from 'vitest';
import { formatDate, getDateRange, isValidDate, cn } from '@/lib/utils';

describe('utils', () => {
  describe('formatDate', () => {
    it('should format Date object to YYYY-MM-DD', () => {
      const date = new Date('2024-01-15T10:30:00Z');
      expect(formatDate(date)).toBe('2024-01-15');
    });

    it('should format date string to YYYY-MM-DD', () => {
      expect(formatDate('2024-01-15')).toBe('2024-01-15');
    });

    it('should handle different date formats', () => {
      const date = new Date('2024-12-31');
      expect(formatDate(date)).toBe('2024-12-31');
    });
  });

  describe('getDateRange', () => {
    it('should return date range for last N days', () => {
      const range = getDateRange(30);
      expect(range.from).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(range.to).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it('should have from date N days before to date', () => {
      const range = getDateRange(7);
      const from = new Date(range.from);
      const to = new Date(range.to);
      const diffDays = Math.floor((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24));
      expect(diffDays).toBe(7);
    });
  });

  describe('isValidDate', () => {
    it('should return true for valid YYYY-MM-DD format', () => {
      expect(isValidDate('2024-01-15')).toBe(true);
      expect(isValidDate('2024-12-31')).toBe(true);
      expect(isValidDate('2000-01-01')).toBe(true);
    });

    it('should return false for invalid formats', () => {
      expect(isValidDate('2024/01/15')).toBe(false);
      expect(isValidDate('01-15-2024')).toBe(false);
      expect(isValidDate('2024-1-15')).toBe(false);
      expect(isValidDate('invalid')).toBe(false);
      expect(isValidDate('')).toBe(false);
    });

    it('should return false for invalid dates', () => {
      expect(isValidDate('2024-13-01')).toBe(false);
      expect(isValidDate('2024-02-30')).toBe(false);
    });
  });

  describe('cn', () => {
    it('should merge class names', () => {
      expect(cn('foo', 'bar')).toBe('foo bar');
    });

    it('should handle conditional classes', () => {
      expect(cn('foo', false && 'bar', 'baz')).toBe('foo baz');
    });

    it('should merge Tailwind classes correctly', () => {
      expect(cn('px-2 py-1', 'px-4')).toContain('px-4');
    });
  });
});

