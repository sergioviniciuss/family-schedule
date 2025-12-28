import '@testing-library/jest-dom';
import { beforeAll, afterEach, afterAll } from 'vitest';
import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';

// Set test database URL BEFORE any other imports
const testDbUrl = process.env.TEST_DATABASE_URL || 'file:./prisma/test.db';
process.env.DATABASE_URL = testDbUrl;
process.env.NEXTAUTH_SECRET = 'test-secret-key-for-testing-only';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: testDbUrl,
    },
  },
});

beforeAll(async () => {
  // Reset database
  try {
    execSync('npx prisma migrate reset --force --skip-seed', {
      env: { ...process.env, DATABASE_URL: testDbUrl },
      stdio: 'ignore',
    });
  } catch (error) {
    // Ignore errors if database doesn't exist yet
  }

  // Run migrations
  try {
    execSync('npx prisma migrate deploy', {
      env: { ...process.env, DATABASE_URL: testDbUrl },
      stdio: 'ignore',
    });
  } catch (error) {
    console.error('Migration error:', error);
  }
});

afterEach(async () => {
  // Clean up database after each test
  // Use try-catch to handle cases where tables might not exist
  try {
    await prisma.sleepEntry.deleteMany().catch(() => {});
    await prisma.location.deleteMany().catch(() => {});
    await prisma.user.deleteMany().catch(() => {});
  } catch (error) {
    // Ignore cleanup errors
  }
});

afterAll(async () => {
  await prisma.$disconnect();
});

