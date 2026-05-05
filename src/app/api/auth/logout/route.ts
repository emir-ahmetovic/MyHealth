import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  if (request.method !== "POST") {
    return NextResponse.json({ message: "Method not allowed" }, { status: 405 })
  }

  const response = NextResponse.json({ message: "Logged out" }, { status: 200 })
  response.headers.set(
    "Set-Cookie",
    "token=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0"
  )
  return response
}

