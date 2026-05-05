import { NextResponse } from "next/server";
import { prisma } from "@/server/db";

export async function GET() {
  try {
    const clinicTypes = await prisma.clinic_types.findMany();
    return NextResponse.json({ clinicTypes });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch clinic types" }, { status: 500 });
  }
}
