import { NextResponse } from "next/server";
import { cookies } from "next/headers";
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
