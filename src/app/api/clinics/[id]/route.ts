import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/server/db';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const clinicId = Number(id);
  if (isNaN(clinicId)) {
    return NextResponse.json({ error: 'Invalid clinic ID' }, { status: 400 });
  }
  try {
    const clinic = await prisma.clinics.findUnique({
      where: { id: clinicId },
      include: {
        clinic_specialties: true,
        clinic_gallery: true,
        reviews: true,
        // Add doctors if you have a relation
      },
    });
    if (!clinic) {
      return NextResponse.json({ error: 'Clinic not found' }, { status: 404 });
    }
    return NextResponse.json({ clinic });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch clinic' }, { status: 500 });
  }
}
