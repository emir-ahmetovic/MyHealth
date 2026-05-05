import { NextResponse } from 'next/server'
import { prisma } from "@/server/db"
import bcrypt from "bcryptjs"

export async function POST(request: Request) {
  if (request.method !== "POST") {
    return NextResponse.json({ message: "Method not allowed" }, { status: 405 })
  }

  const { full_name, email, phone, password, role } = await request.json()

  if (!full_name || !email || !password) {
    return NextResponse.json({ message: "Nedostaju obavezna polja." }, { status: 400 })
  }

  try {
    const existing = await prisma.users.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json({ message: "Email je već registrovan." }, { status: 409 })
    }

    const password_hash = await bcrypt.hash(password, 10)
    const user = await prisma.users.create({
      data: {
        full_name,
        email,
        phone,
        password_hash,
        role: role || "PATIENT",
      },
    })

    return NextResponse.json({ user: { id: user.id, email: user.email } }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ message: "Greška pri kreiranju naloga." }, { status: 500 })
  }
}

