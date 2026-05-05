import { prisma } from '@/server/db';
import { NextResponse } from 'next/server';

// GET /api/doctor-schedule?doctorId=ID
// POST /api/doctor-schedule  { doctorId, schedules: [{ day_of_week, start_time, end_time }] }
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const doctorId = Number(searchParams.get('doctorId'));
    if (!doctorId) return NextResponse.json({ error: 'Missing doctorId' }, { status: 400 });
    const schedule = await prisma.doctor_schedule.findMany({ where: { doctor_id: doctorId }, orderBy: { day_of_week: 'asc' } });
    return NextResponse.json({ schedule });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to fetch schedule' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const doctorId = Number(body.doctorId ?? body.doctor_id);
    const schedules = Array.isArray(body.schedules) ? body.schedules : [];
    if (!doctorId) return NextResponse.json({ error: 'Missing doctorId' }, { status: 400 });

    // Basic validation and normalization of schedules
    const validSchedules = schedules
      .map((s: any) => {
        const dow = Number(s.day_of_week);
        if (Number.isNaN(dow) || dow < 0 || dow > 6) return null;
        // Normalize time strings to HH:MM:SS if possible
        function norm(t: any) {
          if (!t) return null;
          const parts = String(t).trim().split(':').map((p) => p.padStart(2, '0'));
          if (parts.length === 1) parts.push('00');
          return parts.slice(0, 3).join(':');
        }
        const start_time = norm(s.start_time);
        const end_time = norm(s.end_time);
        if (!start_time || !end_time) return null;
        return { doctor_id: doctorId, day_of_week: dow, start_time, end_time };
      })
      .filter(Boolean);

    // Replace existing schedule for this doctor (simple approach)
    await prisma.doctor_schedule.deleteMany({ where: { doctor_id: doctorId } });
    if (validSchedules.length > 0) {
      await prisma.doctor_schedule.createMany({ data: validSchedules });
    }

    const created = await prisma.doctor_schedule.findMany({ where: { doctor_id: doctorId }, orderBy: { day_of_week: 'asc' } });
    return NextResponse.json({ schedule: created });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to save schedule', detail: String(err) }, { status: 500 });
  }
}
