import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

const BACKEND_BASE = process.env.BACKEND_URL ?? "https://faultrix-backend-production.up.railway.app/api/v1"
const COOKIE_NAME = "fx_session"

/**
 * GET /api/auth/session
 * 
 * Checks if the user has a valid session by:
 * 1. Reading the HttpOnly fx_session cookie (invisible to client JS)
 * 2. Calling the backend /auth/login endpoint to validate the key
 * 3. Returning org metadata (name, slug, plan) WITHOUT the key
 *
 * This lets client components check auth state and display org info
 * without ever touching the actual API key.
 */
export async function GET(_req: NextRequest) {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get(COOKIE_NAME)

  if (!sessionCookie?.value) {
    return NextResponse.json({ authenticated: false }, { status: 401 })
  }

  // Validate the session key against the backend
  try {
    const res = await fetch(`${BACKEND_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ apiKey: sessionCookie.value }),
    })

    if (!res.ok) {
      // Key is invalid/revoked — clear the stale cookie
      const response = NextResponse.json({ authenticated: false }, { status: 401 })
      response.cookies.set(COOKIE_NAME, "", { maxAge: 0, path: "/" })
      return response
    }

    const data = await res.json()
    // Return only safe metadata — never return or forward the key
    return NextResponse.json({
      authenticated: true,
      orgName: data.orgName,
      slug: data.slug,
      plan: data.plan,
      maxRules: data.maxRules,
    })
  } catch {
    return NextResponse.json({ authenticated: false }, { status: 401 })
  }
}