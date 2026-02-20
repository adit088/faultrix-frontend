import { NextRequest, NextResponse } from "next/server"

const BACKEND = process.env.BACKEND_URL ?? "https://faultrix-backend-production.up.railway.app/api/v1"
const API_KEY = process.env.API_KEY ?? ""

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
  const path = pathSegments.join("/")
  const search = req.nextUrl.search ?? ""
  const url = `${BACKEND}/${path}${search}`

  // Priority: key sent by browser (user's own key) > env var fallback (dev/demo)
  const userKey = req.headers.get("X-Faultrix-Key")
  const resolvedKey = userKey ?? API_KEY

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    "X-API-Key": resolvedKey,
  }

  let body: string | undefined
  if (method !== "GET" && method !== "DELETE") {
    try {
      body = await req.text()
    } catch {
      body = undefined
    }
  }

  const res = await fetch(url, { method, headers, body })
  const data = await res.text()

  return new NextResponse(data, {
    status: res.status,
    headers: { "Content-Type": "application/json" },
  })
}