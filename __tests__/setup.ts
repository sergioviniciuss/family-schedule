import '@testing-library/jest-dom';
import { beforeAll, afterEach, afterAll } from 'vitest';
import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.TEST_DATABASE_URL || 'file:./test.db',
    },
  },
});

beforeAll(async () => {
  // Set test database URL
  process.env.DATABASE_URL = process.env.TEST_DATABASE_URL || 'file:./test.db';
  process.env.NEXTAUTH_SECRET = 'test-secret-key-for-testing-only';

  // Reset database
  try {
    execSync('npx prisma migrate reset --force --skip-seed', {
      env: { ...process.env, DATABASE_URL: process.env.TEST_DATABASE_URL || 'file:./test.db' },
      stdio: 'ignore',
    });
  } catch (error) {
    // Ignore errors if database doesn't exist yet
  }

  // Run migrations
  try {
    execSync('npx prisma migrate deploy', {
      env: { ...process.env, DATABASE_URL: process.env.TEST_DATABASE_URL || 'file:./test.db' },
      stdio: 'ignore',
    });
  } catch (error) {
    console.error('Migration error:', error);
  }
});

afterEach(async () => {
  // Clean up database after each test
  await prisma.sleepEntry.deleteMany();
  await prisma.location.deleteMany();
  await prisma.user.deleteMany();
});

afterAll(async () => {
  await prisma.$disconnect();
});

