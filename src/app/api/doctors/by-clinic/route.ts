import { prisma } from "@/server/db";
import { NextResponse } from "next/server";

// GET /api/doctors/by-clinic?id=CLINIC_ID
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const clinicId = Number(searchParams.get("id"));
  if (!clinicId) {
    return NextResponse.json({ error: "Missing clinic id" }, { status: 400 });
  }
  try {
    const doctors = await prisma.doctors.findMany({
      where: { clinic_id: clinicId },
      orderBy: { full_name: "asc" },
      include: { doctor_schedule: true },
    });

    // Map schedule rows to friendly fields the frontend expects
    const weekdayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const normalized = doctors.map((d: any) => {
      const schedule = d.doctor_schedule || [];
      // Derive workingDays as array of weekday names (assumes day_of_week 0=Sunday..6=Saturday)
      const workingDays = schedule.map((s: any) => {
        const dow = Number(s.day_of_week);
        return Number.isNaN(dow) ? null : (weekdayNames[dow] ?? null);
      }).filter(Boolean);

      // Expose raw schedule and a simple workingHoursRaw for frontend parsing
      const workingHoursRaw = schedule.map((s: any) => ({ day_of_week: s.day_of_week, start_time: s.start_time, end_time: s.end_time }));

      return { ...d, workingDays, workingHoursRaw };
    });

    return NextResponse.json({ doctors: normalized });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch doctors" }, { status: 500 });
  }
}
