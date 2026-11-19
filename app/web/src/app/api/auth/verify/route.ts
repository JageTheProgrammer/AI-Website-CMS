import { NextResponse } from "next/server";
import { request, ApiError } from "@/lib/api/proxy";

export async function GET() {
  try {
    const res = await request("/api/auth/me", { method: "GET" });
    return NextResponse.json({ verified: true, user: res.data });
  } catch (err) {
    return NextResponse.json({ verified: false }, { status: 401 });
  }
}
