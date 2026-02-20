import { NextRequest, NextResponse } from "next/server"

// Backend base — strip /api/v1 since auth is under /api/v1/auth
const BACKEND_BASE = process.env.BACKEND_URL ?? "https://faultrix-backend-production.up.railway.app/api/v1"

type Params = Promise<{ path: string[] }>

export async function POST(req: NextRequest, { params }: { params: Params }) {
  const { path } = await params
  const endpoint = path.join("/")  // "register" or "login"
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
  return new NextResponse(data, {
    status: res.status,
    headers: { "Content-Type": "application/json" },
  })
}