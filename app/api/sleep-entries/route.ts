import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { isValidDate } from '@/lib/utils';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const from = searchParams.get('from');
    const to = searchParams.get('to');

    if (!from || !to) {
      return NextResponse.json({ error: 'from and to query parameters are required' }, { status: 400 });
    }

    if (!isValidDate(from) || !isValidDate(to)) {
      return NextResponse.json({ error: 'Invalid date format. Use YYYY-MM-DD' }, { status: 400 });
    }

    const entries = await prisma.sleepEntry.findMany({
      where: {
        userId: session.user.id,
        date: {
          gte: from,
          lte: to,
        },
      },
      include: {
        location: true,
      },
      orderBy: {
        date: 'desc',
      },
    });

    return NextResponse.json(entries);
  } catch (error) {
    console.error('Error fetching sleep entries:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { date, locationId } = body;

    if (!date || typeof date !== 'string') {
      return NextResponse.json({ error: 'Date is required' }, { status: 400 });
    }

    if (!isValidDate(date)) {
      return NextResponse.json({ error: 'Invalid date format. Use YYYY-MM-DD' }, { status: 400 });
    }

    if (!locationId || typeof locationId !== 'string') {
      return NextResponse.json({ error: 'Location ID is required' }, { status: 400 });
    }

    // Verify the location belongs to the user
    const location = await prisma.location.findFirst({
      where: {
        id: locationId,
        userId: session.user.id,
      },
    });

    if (!location) {
      return NextResponse.json({ error: 'Location not found' }, { status: 404 });
    }

    // Upsert: create or update sleep entry for this user and date
    const entry = await prisma.sleepEntry.upsert({
      where: {
        userId_date: {
          userId: session.user.id,
          date,
        },
      },
      update: {
        locationId,
      },
      create: {
        userId: session.user.id,
        locationId,
        date,
      },
      include: {
        location: true,
      },
    });

    return NextResponse.json(entry, { status: 201 });
  } catch (error) {
    console.error('Error creating/updating sleep entry:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');

    if (!date) {
      return NextResponse.json({ error: 'Date is required' }, { status: 400 });
    }

    if (!isValidDate(date)) {
      return NextResponse.json({ error: 'Invalid date format. Use YYYY-MM-DD' }, { status: 400 });
    }

    // Find the entry to ensure it exists and belongs to the user
    const entry = await prisma.sleepEntry.findUnique({
      where: {
        userId_date: {
          userId: session.user.id,
          date,
        },
      },
    });

    if (!entry) {
      return NextResponse.json({ error: 'Entry not found' }, { status: 404 });
    }

    // Delete the entry
    await prisma.sleepEntry.delete({
      where: {
        userId_date: {
          userId: session.user.id,
          date,
        },
      },
    });

    return NextResponse.json({ success: true, date });
  } catch (error) {
    console.error('Error deleting sleep entry:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
