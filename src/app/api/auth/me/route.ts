import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { prisma } from "@/server/db"

const JWT_SECRET = process.env.JWT_SECRET || "changeme"

export async function GET(request: NextRequest) {
  const token = request.cookies.get('token')?.value
  if (!token) {
    return NextResponse.json({ user: null })
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: number }
    const user = await prisma.users.findUnique({ where: { id: decoded.id } })
    if (!user) return NextResponse.json({ user: null })
    return NextResponse.json({ user: { id: user.id, email: user.email, role: user.role } })
  } catch {
    return NextResponse.json({ user: null })
  }
}

