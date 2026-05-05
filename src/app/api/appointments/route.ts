
// POST: Create a new appointment
export async function POST(req: Request) {
  try {
    const data = await req.json();
    const {
      patient_id,
      clinic_id,
      doctor_id,
      appointment_type_id,
      appointment_time,
      duration_minutes,
      price,
      notes,
      status,
      patient_name
    } = data;

    if (!clinic_id || !appointment_time) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // If clinic is creating, allow manual patient name in notes
    let notesToSave = notes || "";
    if (patient_name && !notesToSave.includes('Ime pacijenta:')) {
      notesToSave = notesToSave ? `${notesToSave}\nIme pacijenta: ${patient_name}` : `Ime pacijenta: ${patient_name}`;
    }

    const appointment = await prisma.appointments.create({
      data: {
        patient_id: patient_id ? Number(patient_id) : null,
        clinic_id: Number(clinic_id),
        doctor_id: doctor_id ? Number(doctor_id) : null,
        appointment_type_id: appointment_type_id ? Number(appointment_type_id) : null,
        appointment_time: new Date(appointment_time),
        duration_minutes: duration_minutes ? Number(duration_minutes) : 30,
        price: price ? Number(price) : null,
        notes: notesToSave,
        status: status || "scheduled",
      },
      include: {
        doctors: true,
        users: { select: { full_name: true, email: true, phone: true } },
        clinics: { select: { name: true, address: true } },
      },
    });
    const normalized = { ...appointment, doctor: appointment.doctors ?? null };
    return NextResponse.json(normalized);
  } catch (error) {
    return NextResponse.json({ error: "Failed to create appointment" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { prisma } from "@/server/db";

// PATCH: Update appointment (status, time, notes, etc.)
export async function PATCH(req: Request) {
  const data = await req.json();
  const { id, status, appointment_time, notes, suggested_time, cancel_reason } = data;
  if (!id) {
    return NextResponse.json({ error: "Missing appointment id" }, { status: 400 });
  }
  try {
    const updateData: any = {};
    if (status) updateData.status = status;
    if (appointment_time) updateData.appointment_time = new Date(appointment_time);
    if (notes) updateData.notes = notes;
    if (suggested_time) updateData.suggested_time = new Date(suggested_time);
    if (cancel_reason) updateData.cancelled_reason = cancel_reason;

    // If patient requests cancellation or move, set status accordingly
    if (status === 'cancel_request') {
      updateData.status = 'cancel_request';
      if (cancel_reason) updateData.cancelled_reason = cancel_reason;
    } else if (status === 'move_request') {
      updateData.status = 'move_request';
      if (suggested_time) updateData.suggested_time = new Date(suggested_time);
    }

    const updated = await prisma.appointments.update({
      where: { id: Number(id) },
      data: updateData,
      include: {
        doctors: true,
        users: { select: { full_name: true, email: true, phone: true } },
        clinics: { select: { name: true, address: true } },
      },
    });
    const normalized = { ...updated, doctor: updated.doctors ?? null };
    return NextResponse.json(normalized);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update appointment" }, { status: 500 });
  }
}

// DELETE: Delete appointment by id
export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  // Add visible log for debugging
  console.log("[API/DELETE] Called with id:", id);
  if (!id) {
    console.log("[API/DELETE] No id provided");
    return NextResponse.json({ error: "Missing appointment id" }, { status: 400 });
  }
  try {
    const deleted = await prisma.appointments.delete({ where: { id: Number(id) } });
    console.log("[API/DELETE] Appointment deleted:", deleted);
    return NextResponse.json({ success: true, deleted });
  } catch (error: any) {
    console.error("[API/DELETE] Failed to delete appointment", { id, error });
    return NextResponse.json({ error: "Failed to delete appointment", details: error?.message || String(error) }, { status: 500 });
  }
}



export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const clinic_id = searchParams.get("clinic_id");
  const doctor_id = searchParams.get("doctor_id");
  const start = searchParams.get("start");
  const end = searchParams.get("end");
  const patient_name = searchParams.get("patient_name");
  let where: any = {};
  if (patient_name) {
    where.notes = { contains: patient_name };
  }
  if (clinic_id) where.clinic_id = Number(clinic_id);
  if (doctor_id) where.doctor_id = Number(doctor_id);
  if (start && end) {
    where.appointment_time = {
      gte: new Date(start),
      lt: new Date(end),
    };
  }
  const status = searchParams.get("status");
  if (status) where.status = status;
  const appointments = await prisma.appointments.findMany({
    where,
    include: {
      doctors: true,
      users: { select: { full_name: true, email: true, phone: true } },
      appointment_types: { select: { name: true } },
      clinics: { select: { name: true, address: true } },
    },
  });
  // Normalize to a consistent `doctor` field (frontend expects `doctor`)
  const normalized = (appointments || []).map((a: any) => ({
    ...a,
    doctor: a.doctors ?? null,
  }));
  return NextResponse.json(normalized);
}
