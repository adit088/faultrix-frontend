import { NextRequest, NextResponse } from "next/server"

const BACKEND = process.env.BACKEND_URL ?? "https://faultrix-backend-production.up.railway.app/api/v1"
const API_KEY = process.env.API_KEY ?? ""

export async function GET(req: NextRequest, { params }: { params: { path: string[] } }) {
  return proxy(req, params.path, "GET")
}
export async function POST(req: NextRequest, { params }: { params: { path: string[] } }) {
  return proxy(req, params.path, "POST")
}
export async function PUT(req: NextRequest, { params }: { params: { path: string[] } }) {
  return proxy(req, params.path, "PUT")
}
export async function PATCH(req: NextRequest, { params }: { params: { path: string[] } }) {
  return proxy(req, params.path, "PATCH")
}
export async function DELETE(req: NextRequest, { params }: { params: { path: string[] } }) {
  return proxy(req, params.path, "DELETE")
}

async function proxy(req: NextRequest, pathSegments: string[], method: string) {
  const path = pathSegments.join("/")
  const search = req.nextUrl.search ?? ""
  const url = `${BACKEND}/${path}${search}`

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    "X-API-Key": API_KEY,
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