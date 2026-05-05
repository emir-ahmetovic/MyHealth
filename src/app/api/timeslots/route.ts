import { NextResponse } from 'next/server';
import { prisma } from '@/server/db';

export async function GET(request: Request) {
  // Filter timeslots by date from query string
  const { searchParams } = new URL(request.url);
  const date = searchParams.get('date');
  let where: any = { is_available: true };
  if (date) {
    where.date = date;
  }
  const timeslots = await prisma.time_slots.findMany({
    where,
    include: { doctors: true },
    orderBy: { start_time: 'asc' },
  });
  return NextResponse.json({ timeslots });
}
