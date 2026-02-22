import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

const BACKEND_BASE = process.env.BACKEND_URL ?? "https://faultrix-backend-production.up.railway.app/api/v1"

// Session cookie config — HttpOnly so JS can NEVER read it.
// This is the core fix for the API key theft vulnerability:
// localStorage is readable by any script on the page (XSS, malicious npm packages, extensions).
// HttpOnly cookies are invisible to JavaScript — only the browser sends them, and only
// to the same origin. The key never touches client-side JS at all.
const COOKIE_NAME = "fx_session"
const COOKIE_OPTIONS = {
  httpOnly: true,                                    // JS cannot read this — ever
  secure: process.env.NODE_ENV === "production",     // HTTPS-only in prod
  sameSite: "strict" as const,                       // no cross-site requests
  maxAge: 60 * 60 * 24 * 7,                         // 7 days
  path: "/",
}

type Params = Promise<{ path: string[] }>

export async function POST(req: NextRequest, { params }: { params: Params }) {
  const { path } = await params
  const endpoint = path.join("/") // "register" or "login"
  const url = `${BACKEND_BASE}/auth/${endpoint}`

  let body: string | undefined
  try {
    body = await req.text()
  } catch {
    body = undefined
  }

  // Auth endpoints are PUBLIC — do NOT inject X-API-Key
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
  })

  const data = await res.text()

  if (!res.ok) {
    // Pass through error responses as-is
    return new NextResponse(data, {
      status: res.status,
      headers: { "Content-Type": "application/json" },
    })
  }

  // On successful login or register, extract the API key and set it as HttpOnly cookie.
  // The raw apiKey is stripped from the response body before sending to the client
  // so that client-side JavaScript never sees it.
  try {
    const json = JSON.parse(data)
    const apiKey: string | undefined = json.apiKey

    if (apiKey) {
      // Set HttpOnly cookie — browser will send it automatically on every proxied request
      const cookieStore = await cookies()
      cookieStore.set(COOKIE_NAME, apiKey, COOKIE_OPTIONS)

      // Strip apiKey from the response body so it never reaches client-side JS.
      // For register: we still return the apiKey so the UI can display it once for the user
      // to copy — but it's never stored in localStorage. Once they leave the page it's gone.
      // The HttpOnly cookie is already set for future requests.
      // We keep the apiKey in the register response (endpoint === "register") because 
      // UX requires showing it once. For login, we strip it entirely.
      if (endpoint === "login") {
        delete json.apiKey
      }

      return NextResponse.json(json, { status: res.status })
    }
  } catch {
    // JSON parse failed — return raw response
  }

  return new NextResponse(data, {
    status: res.status,
    headers: { "Content-Type": "application/json" },
  })
}