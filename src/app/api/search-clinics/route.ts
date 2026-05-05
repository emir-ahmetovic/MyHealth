import { searchClinics } from "@/server/data/clinic-queries";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { city, specialization, date } = await req.json();
  const clinics = await searchClinics({ city, specialization, date });
  return NextResponse.json(clinics);
}
