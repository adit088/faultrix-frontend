import { NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

const BACKEND = process.env.BACKEND_URL ?? "https://faultrix-backend-production.up.railway.app/api/v1"
const COOKIE_NAME = "fx_session"

// SECURITY NOTE: The API key flows exclusively through the server:
//   Browser → (cookie) → Next.js proxy route → (X-API-Key header) → Spring backend
//
// The key never appears in:
//   - JavaScript (HttpOnly cookie, invisible to JS)
//   - Client request headers (stripped by the proxy, never forwarded)
//   - Browser localStorage or sessionStorage
//   - Network responses to the browser
//
// The only thing the browser sends is a standard browser cookie (fx_session),
// which is automatically attached by the browser for same-origin requests.

type Params = Promise<{ path: string[] }>

export async function GET(req: NextRequest, { params }: { params: Params }) {
  const { path } = await params
  return proxy(req, path, "GET")
}
export async function POST(req: NextRequest, { params }: { params: Params }) {
  const { path } = await params
  return proxy(req, path, "POST")
}
export async function PUT(req: NextRequest, { params }: { params: Params }) {
  const { path } = await params
  return proxy(req, path, "PUT")
}
export async function PATCH(req: NextRequest, { params }: { params: Params }) {
  const { path } = await params
  return proxy(req, path, "PATCH")
}
export async function DELETE(req: NextRequest, { params }: { params: Params }) {
  const { path } = await params
  return proxy(req, path, "DELETE")
}

async function proxy(req: NextRequest, pathSegments: string[], method: string) {
  // Read the API key from the HttpOnly cookie — only accessible server-side.
  // Client JavaScript cannot read this cookie at all (HttpOnly flag).
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get(COOKIE_NAME)

  if (!sessionCookie?.value) {
    return NextResponse.json(
      { errorCode: "UNAUTHORIZED", message: "No active session", status: 401 },
      { status: 401 }
    )
  }

  const path = pathSegments.join("/")
  const search = req.nextUrl.search ?? ""
  const url = `${BACKEND}/${path}${search}`

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    // The API key is injected server-side from the HttpOnly cookie.
    // The client's request headers are NEVER forwarded — we construct
    // the upstream headers entirely here, preventing header injection.
    "X-API-Key": sessionCookie.value,
  }

  let body: string | undefined
  if (method !== "GET" && method !== "DELETE") {
    try {
      body = await req.text()
    } catch {
      body = undefined
    }
  }

  try {
    const res = await fetch(url, { method, headers, body })
    const data = await res.text()

    // If backend returns 401, the cookie is stale — clear it
    if (res.status === 401) {
      const response = new NextResponse(data, {
        status: 401,
        headers: { "Content-Type": "application/json" },
      })
      response.cookies.set(COOKIE_NAME, "", { maxAge: 0, path: "/" })
      return response
    }

    return new NextResponse(data, {
      status: res.status,
      headers: { "Content-Type": "application/json" },
    })
  } catch {
    return NextResponse.json(
      { errorCode: "PROXY_ERROR", message: "Failed to reach backend", status: 502 },
      { status: 502 }
    )
  }
}