import { NextResponse } from "next/server";
import { prisma } from "@/server/db";
import path from "path";
import fs from "fs/promises";

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = Number(searchParams.get("id"));
  if (!id) return NextResponse.json({ error: "Missing image id" }, { status: 400 });
  const image = await prisma.clinic_gallery.findUnique({ where: { id } });
  if (!image) return NextResponse.json({ error: "Image not found" }, { status: 404 });
  if (image.image_url) {
    const filePath = path.join(process.cwd(), "public", image.image_url.replace("/clinic-gallery/", "clinic-gallery/"));
    try {
      await fs.unlink(filePath);
    } catch {
      // Ignore file not found
    }
  }
  await prisma.clinic_gallery.delete({ where: { id } });
  return NextResponse.json({ success: true });
}

export async function POST(req: Request) {
  // Parse multipart form data
  const formData = await req.formData();
  const file = formData.get("file") as File;
  const clinicId = Number(formData.get("clinicId"));
  if (!file || !clinicId) {
    return NextResponse.json({ error: "Missing file or clinicId" }, { status: 400 });
  }

  // Save file locally
  const buffer = Buffer.from(await file.arrayBuffer());
  const fileName = `${Date.now()}_${file.name}`;
  const filePath = path.join(process.cwd(), "public", "clinic-gallery", fileName);
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, buffer);
  const imageUrl = `/clinic-gallery/${fileName}`;

  // Save to DB
  const gallery = await prisma.clinic_gallery.create({
    data: {
      clinic_id: clinicId,
      image_url: imageUrl,
      image_title: file.name,
      uploaded_at: new Date(),
    },
  });

  return NextResponse.json({ success: true, imageUrl, gallery });
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const clinicId = Number(searchParams.get("clinicId"));
  if (!clinicId) return NextResponse.json([]);
  const images = await prisma.clinic_gallery.findMany({
    where: { clinic_id: clinicId },
    orderBy: { uploaded_at: "desc" },
  });
  return NextResponse.json(images);
}
