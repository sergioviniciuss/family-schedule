import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { GET, POST, PATCH, DELETE } from '@/app/api/locations/route';
import { NextRequest } from 'next/server';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.TEST_DATABASE_URL || 'file:./test.db',
    },
  },
});

// Mock NextAuth
vi.mock('next-auth', () => ({
  getServerSession: vi.fn(),
}));

vi.mock('@/lib/auth', () => ({
  authOptions: {},
}));

describe('Locations API', () => {
  let userId: string;
  let otherUserId: string;

  beforeEach(async () => {
    // Create test users
    const hashedPassword = await bcrypt.hash('password123', 10);
    const user = await prisma.user.create({
      data: {
        email: 'test@example.com',
        password: hashedPassword,
      },
    });
    userId = user.id;

    const otherUser = await prisma.user.create({
      data: {
        email: 'other@example.com',
        password: hashedPassword,
      },
    });
    otherUserId = otherUser.id;

    // Mock session
    const { getServerSession } = await import('next-auth');
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: userId, email: 'test@example.com' },
    } as any);
  });

  describe('GET /api/locations', () => {
    it('should return locations for authenticated user', async () => {
      await prisma.location.create({
        data: {
          userId,
          name: 'Parents',
          color: '#3b82f6',
        },
      });

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBe(1);
      expect(data[0].name).toBe('Parents');
    });

    it('should return 401 if not authenticated', async () => {
      const { getServerSession } = await import('next-auth');
      vi.mocked(getServerSession).mockResolvedValue(null);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('should only return locations for the authenticated user', async () => {
      await prisma.location.create({
        data: {
          userId,
          name: 'My Location',
        },
      });

      await prisma.location.create({
        data: {
          userId: otherUserId,
          name: 'Other Location',
        },
      });

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.length).toBe(1);
      expect(data[0].name).toBe('My Location');
    });
  });

  describe('POST /api/locations', () => {
    it('should create a new location', async () => {
      const request = new NextRequest('http://localhost/api/locations', {
        method: 'POST',
        body: JSON.stringify({
          name: 'In-laws',
          color: '#10b981',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.name).toBe('In-laws');
      expect(data.color).toBe('#10b981');
      expect(data.userId).toBe(userId);
    });

    it('should return 400 if name is missing', async () => {
      const request = new NextRequest('http://localhost/api/locations', {
        method: 'POST',
        body: JSON.stringify({ color: '#10b981' }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Name is required');
    });

    it('should return 401 if not authenticated', async () => {
      const { getServerSession } = await import('next-auth');
      vi.mocked(getServerSession).mockResolvedValue(null);

      const request = new NextRequest('http://localhost/api/locations', {
        method: 'POST',
        body: JSON.stringify({ name: 'Test' }),
      });

      const response = await POST(request);
      expect(response.status).toBe(401);
    });
  });

  describe('PATCH /api/locations', () => {
    it('should update location name and color', async () => {
      const location = await prisma.location.create({
        data: {
          userId,
          name: 'Old Name',
          color: '#000000',
        },
      });

      const request = new NextRequest('http://localhost/api/locations', {
        method: 'PATCH',
        body: JSON.stringify({
          id: location.id,
          name: 'New Name',
          color: '#ffffff',
        }),
      });

      const response = await PATCH(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.name).toBe('New Name');
      expect(data.color).toBe('#ffffff');
    });

    it('should return 404 if location not found', async () => {
      const request = new NextRequest('http://localhost/api/locations', {
        method: 'PATCH',
        body: JSON.stringify({
          id: 'non-existent-id',
          name: 'New Name',
        }),
      });

      const response = await PATCH(request);
      expect(response.status).toBe(404);
    });

    it('should not allow updating other user\'s location', async () => {
      const otherLocation = await prisma.location.create({
        data: {
          userId: otherUserId,
          name: 'Other Location',
        },
      });

      const request = new NextRequest('http://localhost/api/locations', {
        method: 'PATCH',
        body: JSON.stringify({
          id: otherLocation.id,
          name: 'Hacked',
        }),
      });

      const response = await PATCH(request);
      expect(response.status).toBe(404);
    });
  });

  describe('DELETE /api/locations', () => {
    it('should delete location if it has no sleep entries', async () => {
      const location = await prisma.location.create({
        data: {
          userId,
          name: 'Test Location',
        },
      });

      const request = new NextRequest(`http://localhost/api/locations?id=${location.id}`, {
        method: 'DELETE',
      });

      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);

      const deleted = await prisma.location.findUnique({ where: { id: location.id } });
      expect(deleted).toBeNull();
    });

    it('should not delete location if it has sleep entries', async () => {
      const location = await prisma.location.create({
        data: {
          userId,
          name: 'Test Location',
        },
      });

      await prisma.sleepEntry.create({
        data: {
          userId,
          locationId: location.id,
          date: '2024-01-01',
        },
      });

      const request = new NextRequest(`http://localhost/api/locations?id=${location.id}`, {
        method: 'DELETE',
      });

      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Cannot delete location that has sleep entries');

      const stillExists = await prisma.location.findUnique({ where: { id: location.id } });
      expect(stillExists).not.toBeNull();
    });

    it('should return 404 if location not found', async () => {
      const request = new NextRequest('http://localhost/api/locations?id=non-existent', {
        method: 'DELETE',
      });

      const response = await DELETE(request);
      expect(response.status).toBe(404);
    });
  });
});

