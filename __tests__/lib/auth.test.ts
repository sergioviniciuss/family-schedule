import { describe, it, expect, beforeEach } from 'vitest';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { authOptions } from '@/lib/auth';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.TEST_DATABASE_URL || 'file:./test.db',
    },
  },
});

describe('Authentication', () => {
  beforeEach(async () => {
    await prisma.sleepEntry.deleteMany();
    await prisma.location.deleteMany();
    await prisma.user.deleteMany();
  });

  describe('Credentials Provider', () => {
    it('should authenticate user with correct credentials', async () => {
      const hashedPassword = await bcrypt.hash('password123', 10);
      const user = await prisma.user.create({
        data: {
          email: 'test@example.com',
          password: hashedPassword,
        },
      });

      const provider = authOptions.providers[0];
      if (provider && 'authorize' in provider) {
        const result = await provider.authorize({
          email: 'test@example.com',
          password: 'password123',
        });

        expect(result).not.toBeNull();
        expect(result?.email).toBe('test@example.com');
        expect(result?.id).toBe(user.id);
      }
    });

    it('should reject user with incorrect password', async () => {
      const hashedPassword = await bcrypt.hash('password123', 10);
      await prisma.user.create({
        data: {
          email: 'test@example.com',
          password: hashedPassword,
        },
      });

      const provider = authOptions.providers[0];
      if (provider && 'authorize' in provider) {
        const result = await provider.authorize({
          email: 'test@example.com',
          password: 'wrongpassword',
        });

        expect(result).toBeNull();
      }
    });

    it('should reject non-existent user', async () => {
      const provider = authOptions.providers[0];
      if (provider && 'authorize' in provider) {
        const result = await provider.authorize({
          email: 'nonexistent@example.com',
          password: 'password123',
        });

        expect(result).toBeNull();
      }
    });

    it('should reject request with missing credentials', async () => {
      const provider = authOptions.providers[0];
      if (provider && 'authorize' in provider) {
        const result1 = await provider.authorize({
          email: '',
          password: 'password123',
        });
        expect(result1).toBeNull();

        const result2 = await provider.authorize({
          email: 'test@example.com',
          password: '',
        });
        expect(result2).toBeNull();
      }
    });
  });

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

