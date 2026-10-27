import { NextResponse } from "next/server";
import { request, ApiError } from "@/lib/api/proxy";

export async function GET() {
  try {
    const res = (await request("/api/auth/me", { method: "GET" })) as {
      data?: { role?: string | null };
    };

    return NextResponse.json({ role: res.data?.role });
  } catch (err) {
    return NextResponse.json({ error: { code: "UNAUTHORIZED", message: "Not authenticated." } }, { status: 401 });
  }
}
