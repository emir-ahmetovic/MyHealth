import { NextResponse } from 'next/server'
import { prisma } from "@/server/db"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "changeme"

export async function POST(request: Request) {
  if (request.method !== "POST") {
    return NextResponse.json({ message: "Method not allowed" }, { status: 405 })
  }

  const { email, password, role } = await request.json()

  if (!email || !password) {
    return NextResponse.json({ message: "Nedostaju obavezna polja." }, { status: 400 })
  }

  try {
    const user = await prisma.users.findUnique({ where: { email } })
    if (!user) {
      return NextResponse.json({ message: "Pogrešan email ili lozinka." }, { status: 401 })
    }
    const valid = await bcrypt.compare(password, user.password_hash)
    if (!valid) {
      return NextResponse.json({ message: "Pogrešan email ili lozinka." }, { status: 401 })
    }
    // Check if user role matches requested role
    if (role && user.role !== role) {
      return NextResponse.json({ message: "Neispravan tip korisnika za prijavu." }, { status: 403 })
    }
    // Create JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: "7d" }
    )
    const response = NextResponse.json(
      { user: { id: user.id, email: user.email, role: user.role } },
      { status: 200 }
    )
    // Set cookie
    response.headers.set(
      "Set-Cookie",
      `token=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=604800`
    )
    return response
  } catch (error) {
    return NextResponse.json({ message: "Greška na serveru." }, { status: 500 })
  }
}

