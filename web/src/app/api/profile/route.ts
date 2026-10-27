import { NextResponse } from "next/server";
import { request, ApiError } from "@/lib/api/proxy";

export async function GET() {
  try {
    const res = await request("/api/auth/me", { method: "GET" });
    return NextResponse.json(res);
  } catch (err) {
    const apiErr = err as ApiError;
    if (apiErr.status === 401) return NextResponse.json({ error: { code: "UNAUTHORIZED", message: "Not authenticated." } }, { status: 401 });
    return NextResponse.json({ error: { code: apiErr.code, message: apiErr.message } }, { status: apiErr.status || 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const res = await request("/api/auth/profile", { method: "PATCH", body });
    return NextResponse.json(res);
  } catch (err) {
    const apiErr = err as ApiError;
    return NextResponse.json({ error: { code: apiErr.code, message: apiErr.message } }, { status: apiErr.status || 500 });
  }
}

export async function DELETE() {
  try {
    const res = await request("/api/auth/profile", { method: "DELETE" });
    return NextResponse.json(res);
  } catch (err) {
    const apiErr = err as ApiError;
    return NextResponse.json({ error: { code: apiErr.code, message: apiErr.message } }, { status: apiErr.status || 500 });
  }
}
