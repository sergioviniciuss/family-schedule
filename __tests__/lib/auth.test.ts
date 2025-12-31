import { describe, it, expect } from 'vitest';
import bcrypt from 'bcryptjs';

describe('Authentication', () => {

  describe('Password Hashing', () => {
    it('should hash passwords correctly', async () => {
      const password = 'testpassword123';
      const hashed = await bcrypt.hash(password, 10);

      expect(hashed).not.toBe(password);
      expect(hashed.length).toBeGreaterThan(20);

      const isValid = await bcrypt.compare(password, hashed);
      expect(isValid).toBe(true);
    });

    it('should verify hashed passwords', async () => {
      const password = 'testpassword123';
      const hashed = await bcrypt.hash(password, 10);

      const isValid = await bcrypt.compare(password, hashed);
      expect(isValid).toBe(true);

      const isInvalid = await bcrypt.compare('wrongpassword', hashed);
      expect(isInvalid).toBe(false);
    });
  });
});

