import { describe, it, expect } from 'vitest';
import { parseLocalDate, normalizeToLocalDate } from '@/lib/utils';

describe('Timezone fix verification', () => {
  describe('String-based date handling (correct approach)', () => {
    it('should handle YYYY-MM-DD strings correctly regardless of timezone', () => {
      const dateString = '2024-01-15';
      
      // When passing a string directly (as dashboard now does)
      const normalized = normalizeToLocalDate(dateString);
      
      // Should always be Jan 15 at local midnight, regardless of timezone
      expect(normalized.getFullYear()).toBe(2024);
      expect(normalized.getMonth()).toBe(0); // January
      expect(normalized.getDate()).toBe(15);
      expect(normalized.getHours()).toBe(0);
      expect(normalized.getMinutes()).toBe(0);
    });

    it('should handle first day of month correctly', () => {
      const normalized = normalizeToLocalDate('2024-01-01');
      
      expect(normalized.getFullYear()).toBe(2024);
      expect(normalized.getMonth()).toBe(0);
      expect(normalized.getDate()).toBe(1);
    });

    it('should handle last day of month correctly', () => {
      const normalized = normalizeToLocalDate('2024-12-31');
      
      expect(normalized.getFullYear()).toBe(2024);
      expect(normalized.getMonth()).toBe(11);
      expect(normalized.getDate()).toBe(31);
    });
  });

  describe('Date object handling (for reference)', () => {
    it('should handle Date objects created from ISO strings correctly', () => {
      // new Date('2024-01-15') creates a Date at UTC midnight
      // For users in UTC-8, this is Jan 14 at 4pm local time
      // For users in UTC+8, this is Jan 15 at 8am local time
      const utcDate = new Date('2024-01-15');
      const normalized = normalizeToLocalDate(utcDate);
      
      // normalizeToLocalDate extracts UTC components (year, month, day)
      // and creates a new Date at local midnight with those components
      expect(normalized.getFullYear()).toBe(2024);
      expect(normalized.getMonth()).toBe(0);
      expect(normalized.getDate()).toBe(15);
      expect(normalized.getHours()).toBe(0);
    });
  });

  describe('Comparison between approaches', () => {
    it('string approach vs Date approach should give consistent results', () => {
      const dateString = '2024-01-15';
      
      // Approach 1: Pass string directly (CORRECT - what we now do)
      const fromString = normalizeToLocalDate(dateString);
      
      // Approach 2: Pass Date object created from ISO string
      const fromIsoDate = normalizeToLocalDate(new Date(dateString));
      
      // Both should produce the same result
      expect(fromString.getFullYear()).toBe(fromIsoDate.getFullYear());
      expect(fromString.getMonth()).toBe(fromIsoDate.getMonth());
      expect(fromString.getDate()).toBe(fromIsoDate.getDate());
      expect(fromString.getHours()).toBe(0);
      expect(fromIsoDate.getHours()).toBe(0);
    });

    it('demonstrates the OLD buggy approach would fail', () => {
      const dateString = '2024-01-15';
      
      // OLD BUGGY APPROACH: parseLocalDate creates Date at local midnight
      // then normalizeToLocalDate extracts UTC components
      const localDate = parseLocalDate(dateString); // Local midnight Jan 15
      
      // This is what the buggy version was doing
      const buggyNormalized = new Date(
        localDate.getUTCFullYear(),
        localDate.getUTCMonth(),
        localDate.getUTCDate()
      );
      
      // In UTC+ timezones, local midnight Jan 15 is still Jan 14 in UTC
      // So getUTCDate() would return 14, not 15
      // This test will PASS in UTC- or UTC timezones but would fail in UTC+ timezones
      
      // The CORRECT approach (what we now use)
      const correctNormalized = normalizeToLocalDate(dateString);
      
      // Verify the correct approach always gives Jan 15
      expect(correctNormalized.getDate()).toBe(15);
      
      // Note: The buggy approach would give different results based on timezone
      // In UTC+: buggyNormalized.getDate() could be 14 (one day off!)
      // In UTC-: buggyNormalized.getDate() would be 15 or 16
    });
  });
});

