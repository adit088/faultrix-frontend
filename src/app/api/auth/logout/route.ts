import { NextResponse } from "next/server"
import { cookies } from "next/headers"

const COOKIE_NAME = "fx_session"

/**
 * POST /api/auth/logout
 * 
 * Clears the HttpOnly session cookie server-side.
 * Since the cookie is HttpOnly, client JS cannot clear it directly —
 * this endpoint is required to properly end the session.
 */
export async function POST() {
  const cookieStore = await cookies()
  cookieStore.set(COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 0,    // expires immediately
    path: "/",
  })

  return NextResponse.json({ success: true })
}