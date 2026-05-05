import { NextResponse } from 'next/server';
import { prisma } from '@/server/db';

export async function GET(request: Request) {
  try {
    // Get JWT token from cookies
    const cookieHeader = request.headers.get('cookie') || '';
    const tokenMatch = cookieHeader.match(/token=([^;]+)/);
    const token = tokenMatch ? tokenMatch[1] : null;
    // Check for patient dashboard
    let patient_id = null;
    if (token) {
      const jwtPayload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
      if (jwtPayload.role === 'PATIENT') {
        patient_id = jwtPayload.id;
      }
    }
    if (patient_id) {
      // Get all appointments for this patient
      const allAppointments = await prisma.appointments.findMany({
        where: { patient_id },
        include: {
          clinics: true,
          doctors: true,
          appointment_types: true,
        },
        orderBy: { appointment_time: 'asc' },
      });
      // Normalize doctor field for frontend
      const normalizedAllAppointments = (allAppointments || []).map((a: any) => ({ ...a, doctor: a.doctors ?? null }));
      // Group by status
      const pendingRequests = normalizedAllAppointments.filter((a: any) => a.status === 'pending' || a.status === 'cancel_request');
      const actualAppointments = normalizedAllAppointments.filter((a: any) => a.status === 'scheduled' || a.status === 'accepted' || a.status === 'cancel_request');
      return NextResponse.json({
        pendingRequests,
        actualAppointments,
      });
    }
    // Clinic dashboard logic
    let clinic_id = null;
    if (token) {
      // Decode JWT to get user id and role
      const jwtPayload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
      // If user is a clinic, get their clinic id
      if (jwtPayload.role === 'CLINIC') {
        // Find clinic by user id
        const clinic = await prisma.clinics.findFirst({ where: { user_id: jwtPayload.id } });
        clinic_id = clinic?.id || null;
      }
    }
    if (!clinic_id) {
      return NextResponse.json({ appointments: [], stats: {} });
    }
    const appointments = await prisma.appointments.findMany({
      where: {
        clinic_id,
        NOT: [
          { status: "declined" },
          { status: "cancelled" }
        ]
      },
      include: {
        users: true, // patient info
        appointment_types: true, // service info
        doctors: true, // doctor info
      },
      orderBy: { appointment_time: 'asc' },
    });

    // Fetch all doctors for this clinic
    const doctors = await prisma.doctors.findMany({
      where: { clinic_id },
      select: { id: true, full_name: true },
      orderBy: { full_name: 'asc' },
    });
    // Stats
    const totalPatients = await prisma.appointments.count({ where: { clinic_id } });
    const pendingApprovals = await prisma.appointments.count({ where: { clinic_id, status: 'pending' } });
    const todaysAppointments = await prisma.appointments.count({
      where: {
        clinic_id,
        appointment_time: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
          lt: new Date(new Date().setHours(23, 59, 59, 999)),
        },
      },
    });
    // Normalize doctor field on each appointment
    const normalizedAppointments = (appointments || []).map((a: any) => ({ ...a, doctor: a.doctors ?? null }));

    return NextResponse.json({
      appointments: normalizedAppointments,
      stats: {
        todaysAppointments,
        pendingApprovals,
        totalPatients,
      },
      doctors,
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: 500 });
  }
}
