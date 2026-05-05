// PATCH: Edit doctor
export async function PATCH(req: Request) {
  const data = await req.json();
  const { doctor_id, full_name, specialization, license_number, bio, clinic_id } = data;
  if (!doctor_id || !clinic_id) {
    return NextResponse.json({ error: "Nedostaju obavezna polja." }, { status: 400 });
  }
  try {
    // Check doctor belongs to clinic
    const doctor = await prisma.doctors.findUnique({ where: { id: doctor_id } });
    if (!doctor || doctor.clinic_id !== clinic_id) {
      return NextResponse.json({ error: "Doktor nije pronađen ili ne pripada klinici." }, { status: 403 });
    }
    const updated = await prisma.doctors.update({
      where: { id: doctor_id },
      data: { full_name, specialization, license_number, bio },
    });
    return NextResponse.json({ doctor: updated });
  } catch (error) {
    return NextResponse.json({ error: "Greška pri uređivanju doktora." }, { status: 500 });
  }
}

// DELETE: Remove doctor
export async function DELETE(req: Request) {
  const data = await req.json();
  const { doctor_id, clinic_id } = data;
  if (!doctor_id || !clinic_id) {
    return NextResponse.json({ error: "Nedostaju obavezna polja." }, { status: 400 });
  }
  try {
    // Check doctor belongs to clinic
    const doctor = await prisma.doctors.findUnique({ where: { id: doctor_id } });
    if (!doctor || doctor.clinic_id !== clinic_id) {
      return NextResponse.json({ error: "Doktor nije pronađen ili ne pripada klinici." }, { status: 403 });
    }
    await prisma.doctors.delete({ where: { id: doctor_id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Greška pri brisanju doktora." }, { status: 500 });
  }
}
import { NextResponse } from "next/server"
import { prisma } from "@/server/db"

export async function POST(req: Request) {
  const data = await req.json()
  const { full_name, specialization, license_number, bio, clinic_id } = data
  if (!full_name || !specialization || !license_number || !clinic_id) {
    return NextResponse.json({ error: "Nedostaju obavezna polja." }, { status: 400 })
  }
  try {
    const doctor = await prisma.doctors.create({
      data: {
        full_name,
        specialization,
        license_number,
        bio,
        clinic_id,
      },
    })
    return NextResponse.json({ doctor })
  } catch (error) {
    return NextResponse.json({ error: "Greška pri dodavanju doktora." }, { status: 500 })
  }
}
