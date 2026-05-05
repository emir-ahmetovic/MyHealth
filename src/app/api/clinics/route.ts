// PATCH: Edit clinic profile
export async function PATCH(req: Request) {
  const data = await req.json();
  const {
    clinic_id,
    name,
    address,
    postal,
    website,
    description,
    license,
    specializations,
    clinic_type_id,
    user_id,
    phone,
    email,
    working_hours,
  } = data;
  if (!clinic_id || !user_id) {
    return NextResponse.json({ error: "Nedostaju obavezna polja." }, { status: 400 });
  }
  try {
    // Check clinic belongs to user
    const clinic = await prisma.clinics.findUnique({ where: { id: clinic_id } });
    if (!clinic || clinic.user_id !== user_id) {
      return NextResponse.json({ error: "Klinika nije pronađena ili ne pripada korisniku." }, { status: 403 });
    }
    const updated = await prisma.clinics.update({
      where: { id: clinic_id },
      data: {
        name,
        address,
        website,
        description,
        clinic_type_id,
        phone,
        email,
        working_hours,
        clinic_specialties: specializations
          ? {
              deleteMany: {},
              create: specializations.map((spec: string) => ({ specialty_name: spec })),
            }
          : undefined,
      },
      include: { clinic_specialties: true },
    });
    return NextResponse.json({ clinic: updated });
  } catch (error) {
    return NextResponse.json({ error: "Greška pri uređivanju profila klinike." }, { status: 500 });
  }
}

// DELETE: Delete clinic profile
export async function DELETE(req: Request) {
  const data = await req.json();
  const { clinic_id, user_id } = data;
  if (!clinic_id || !user_id) {
    return NextResponse.json({ error: "Nedostaju obavezna polja." }, { status: 400 });
  }
  try {
    // Check clinic belongs to user
    const clinic = await prisma.clinics.findUnique({ where: { id: clinic_id } });
    if (!clinic || clinic.user_id !== user_id) {
      return NextResponse.json({ error: "Klinika nije pronađena ili ne pripada korisniku." }, { status: 403 });
    }
    await prisma.clinics.delete({ where: { id: clinic_id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Greška pri brisanju profila klinike." }, { status: 500 });
  }
}
import { NextResponse } from "next/server"
import { prisma } from "@/server/db"

export async function POST(req: Request) {
  const data = await req.json()
  // TODO: get user from token/cookie
  // For now, assume user_id and clinic_type_id are passed (should be secured in production)
  const {
    name,
    address,
    postal,
    website,
    description,
    license,
    specializations,
    user_id,
    clinic_type_id,
    phone,
    email,
    working_hours,
  } = data

  if (!name || !address || !postal || !description || !license || !user_id || !clinic_type_id) {
    return NextResponse.json({ error: "Nedostaju obavezna polja." }, { status: 400 })
  }

  try {
    // Create clinic
    const clinic = await prisma.clinics.create({
      data: {
        name,
        address,
        website,
        description,
        created_at: new Date(),
        user_id,
        clinic_type_id,
        phone,
        email,
        working_hours,
        clinic_specialties: {
          create: specializations.map((spec: string) => ({ specialty_name: spec }))
        },
      },
      include: {
        clinic_specialties: true,
      },
    })
    return NextResponse.json({ clinic })
  } catch (error) {
    return NextResponse.json({ error: "Greška pri kreiranju profila klinike." }, { status: 500 })
  }
}
import { getAllClinics } from '@/server/data/clinics';

export async function GET() {
  try {
    const clinics = await getAllClinics();
    return NextResponse.json({ clinics });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch clinics' }, { status: 500 });
  }
}
