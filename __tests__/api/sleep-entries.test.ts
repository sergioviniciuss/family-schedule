import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { NextRequest } from 'next/server';

// Create prisma instance using hoisted to ensure it's available in the mock factory
const testPrisma = vi.hoisted(() => {
  const { PrismaClient } = require('@prisma/client');
  return new PrismaClient({
    datasources: {
      db: {
        url: process.env.DATABASE_URL || 'file:./prisma/test.db',
      },
    },
  });
});

// Mock prisma to use test database - must be before route imports
vi.mock('@/lib/prisma', () => ({
  prisma: testPrisma,
}));

// Import routes after mocks are set up
import { GET, POST, DELETE } from '@/app/api/sleep-entries/route';

// Mock NextAuth
vi.mock('next-auth', () => ({
  getServerSession: vi.fn(),
}));

vi.mock('@/lib/auth', () => ({
  authOptions: {},
}));

describe('Sleep Entries API', () => {
  let userId: string;
  let locationId: string;
  // Use the same prisma instance from the mock
  const prisma = testPrisma;

  beforeEach(async () => {
    // Clean up before creating new users
    await prisma.sleepEntry.deleteMany();
    await prisma.location.deleteMany();
    await prisma.user.deleteMany();

    // Create test user with unique email per test run
    const hashedPassword = await bcrypt.hash('password123', 10);
    const timestamp = Date.now();
    const user = await prisma.user.create({
      data: {
        email: `test-${timestamp}@example.com`,
        password: hashedPassword,
      },
    });
    userId = user.id;

    // Create test location
    const location = await prisma.location.create({
      data: {
        userId,
        name: 'Parents',
        color: '#3b82f6',
      },
    });
    locationId = location.id;

    // Mock session - reset and set up fresh for each test
    const { getServerSession } = await import('next-auth');
    vi.mocked(getServerSession).mockReset();
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: userId, email: `test-${timestamp}@example.com` },
    } as any);
  });

  describe('GET /api/sleep-entries', () => {
    it('should return sleep entries in date range', async () => {
      await prisma.sleepEntry.create({
        data: {
          userId,
          locationId,
          date: '2024-01-15',
        },
      });

      await prisma.sleepEntry.create({
        data: {
          userId,
          locationId,
          date: '2024-01-20',
        },
      });

      const request = new NextRequest(
        'http://localhost/api/sleep-entries?from=2024-01-01&to=2024-01-31'
      );

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBe(2);
    });

    it('should filter entries by date range', async () => {
      await prisma.sleepEntry.create({
        data: {
          userId,
          locationId,
          date: '2024-01-15',
        },
      });

      await prisma.sleepEntry.create({
        data: {
          userId,
          locationId,
          date: '2024-02-15',
        },
      });

      const request = new NextRequest(
        'http://localhost/api/sleep-entries?from=2024-01-01&to=2024-01-31'
      );

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.length).toBe(1);
      expect(data[0].date).toBe('2024-01-15');
    });

    it('should return 400 if from or to is missing', async () => {
      const request = new NextRequest('http://localhost/api/sleep-entries?from=2024-01-01');

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('from and to query parameters are required');
    });

    it('should return 400 if date format is invalid', async () => {
      const request = new NextRequest(
        'http://localhost/api/sleep-entries?from=invalid&to=2024-01-31'
      );

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('Invalid date format');
    });

    it('should return 401 if not authenticated', async () => {
      const { getServerSession } = await import('next-auth');
      vi.mocked(getServerSession).mockResolvedValue(null);

      const request = new NextRequest(
        'http://localhost/api/sleep-entries?from=2024-01-01&to=2024-01-31'
      );

      const response = await GET(request);
      expect(response.status).toBe(401);
    });
  });

  describe('POST /api/sleep-entries', () => {
    it('should create a new sleep entry', async () => {
      const request = new NextRequest('http://localhost/api/sleep-entries', {
        method: 'POST',
        body: JSON.stringify({
          date: '2024-01-15',
          locationId,
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.date).toBe('2024-01-15');
      expect(data.locationId).toBe(locationId);
      expect(data.location).toBeDefined();
    });

    it('should update existing entry for the same date (upsert)', async () => {
      const otherLocation = await prisma.location.create({
        data: {
          userId,
          name: 'In-laws',
          color: '#10b981',
        },
      });

      // Create initial entry
      await prisma.sleepEntry.create({
        data: {
          userId,
          locationId,
          date: '2024-01-15',
        },
      });

      // Update to different location
      const request = new NextRequest('http://localhost/api/sleep-entries', {
        method: 'POST',
        body: JSON.stringify({
          date: '2024-01-15',
          locationId: otherLocation.id,
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.locationId).toBe(otherLocation.id);

      // Verify only one entry exists (prisma already declared above)
      const entries = await prisma.sleepEntry.findMany({
        where: { userId, date: '2024-01-15' },
      });
      expect(entries.length).toBe(1);
    });

    it('should return 400 if date is missing', async () => {
      const request = new NextRequest('http://localhost/api/sleep-entries', {
        method: 'POST',
        body: JSON.stringify({ locationId }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Date is required');
    });

    it('should return 400 if locationId is missing', async () => {
      const request = new NextRequest('http://localhost/api/sleep-entries', {
        method: 'POST',
        body: JSON.stringify({ date: '2024-01-15' }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Location ID is required');
    });

    it('should return 404 if location does not belong to user', async () => {
      const timestamp = Date.now();
      const otherUser = await prisma.user.create({
        data: {
          email: `other-${timestamp}@example.com`,
          password: await bcrypt.hash('password', 10),
        },
      });

      const otherLocation = await prisma.location.create({
        data: {
          userId: otherUser.id,
          name: 'Other Location',
        },
      });

      const request = new NextRequest('http://localhost/api/sleep-entries', {
        method: 'POST',
        body: JSON.stringify({
          date: '2024-01-15',
          locationId: otherLocation.id,
        }),
      });

      const response = await POST(request);
      expect(response.status).toBe(404);
    });

    it('should return 401 if not authenticated', async () => {
      const { getServerSession } = await import('next-auth');
      vi.mocked(getServerSession).mockResolvedValue(null);

      const request = new NextRequest('http://localhost/api/sleep-entries', {
        method: 'POST',
        body: JSON.stringify({
          date: '2024-01-15',
          locationId,
        }),
      });

      const response = await POST(request);
      expect(response.status).toBe(401);
    });
  });

  describe('DELETE /api/sleep-entries', () => {
    it('should delete an existing sleep entry', async () => {
      // Create a sleep entry
      await prisma.sleepEntry.create({
        data: {
          userId,
          locationId,
          date: '2024-01-15',
        },
      });

      const request = new NextRequest(
        'http://localhost/api/sleep-entries?date=2024-01-15',
        { method: 'DELETE' }
      );

      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.date).toBe('2024-01-15');

      // Verify entry was deleted
      const entry = await prisma.sleepEntry.findUnique({
        where: {
          userId_date: {
            userId,
            date: '2024-01-15',
          },
        },
      });
      expect(entry).toBeNull();
    });

    it('should return 404 if entry does not exist', async () => {
      const request = new NextRequest(
        'http://localhost/api/sleep-entries?date=2024-01-15',
        { method: 'DELETE' }
      );

      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Entry not found');
    });

    it('should return 400 if date is missing', async () => {
      const request = new NextRequest('http://localhost/api/sleep-entries', {
        method: 'DELETE',
      });

      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Date is required');
    });

    it('should return 400 if date format is invalid', async () => {
      const request = new NextRequest(
        'http://localhost/api/sleep-entries?date=invalid-date',
        { method: 'DELETE' }
      );

      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain('Invalid date format');
    });

    it('should not delete entries from other users', async () => {
      // Create another user
      const timestamp = Date.now();
      const otherUser = await prisma.user.create({
        data: {
          email: `other-${timestamp}@example.com`,
          password: await bcrypt.hash('password', 10),
        },
      });

      const otherLocation = await prisma.location.create({
        data: {
          userId: otherUser.id,
          name: 'Other Location',
        },
      });

      await prisma.sleepEntry.create({
        data: {
          userId: otherUser.id,
          locationId: otherLocation.id,
          date: '2024-01-15',
        },
      });

      const request = new NextRequest(
        'http://localhost/api/sleep-entries?date=2024-01-15',
        { method: 'DELETE' }
      );

      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('Entry not found');

      // Verify other user's entry still exists
      const entry = await prisma.sleepEntry.findUnique({
        where: {
          userId_date: {
            userId: otherUser.id,
            date: '2024-01-15',
          },
        },
      });
      expect(entry).not.toBeNull();
    });

    it('should return 401 if not authenticated', async () => {
      const { getServerSession } = await import('next-auth');
      vi.mocked(getServerSession).mockResolvedValue(null);

      const request = new NextRequest(
        'http://localhost/api/sleep-entries?date=2024-01-15',
        { method: 'DELETE' }
      );

      const response = await DELETE(request);
      expect(response.status).toBe(401);
    });
  });
});

