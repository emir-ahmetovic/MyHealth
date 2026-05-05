import { prisma } from "@/server/db";
import { NextResponse } from "next/server";

// GET /api/clinics/by-user?id=USER_ID
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = Number(searchParams.get("id"));
  if (!userId) {
    return NextResponse.json({ error: "Missing user id" }, { status: 400 });
  }
  try {
    const clinics = await prisma.clinics.findMany({
      where: { user_id: userId },
      select: {
        id: true,
        name: true,
        address: true,
        city: true,
        phone: true,
        email: true,
        website: true,
        description: true,
        clinic_type_id: true,
      },
    });
    return NextResponse.json({ clinics });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch clinics" }, { status: 500 });
  }
}
