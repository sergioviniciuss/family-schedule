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
  // Push schema to database - this creates/updates tables from schema.prisma
  // This is more reliable for SQLite test databases than migrate deploy
  try {
    execSync('npx prisma db push --force-reset --skip-generate', {
      env: { ...process.env, DATABASE_URL: testDbUrl },
      stdio: 'inherit',
    });
    console.log('Database schema pushed successfully');
  } catch (error) {
    console.error('Database schema push error:', error);
    throw new Error(
      `Failed to push database schema. Make sure the schema is valid and the database is accessible. Error: ${error}`
    );
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

