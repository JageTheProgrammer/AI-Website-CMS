import { NextRequest, NextResponse } from "next/server";
import { request, ApiError } from "@/lib/api/proxy";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const res = await request("/api/support/tickets", { method: "POST", body });
    return NextResponse.json(res, { status: 201 });
  } catch (err) {
    const apiErr = err as ApiError;
    return NextResponse.json({ error: { code: apiErr.code, message: apiErr.message } }, { status: apiErr.status || 500 });
  }
}

export async function GET() {
  try {
    const res = await request("/api/support/tickets", { method: "GET" });
    return NextResponse.json(res);
  } catch (err) {
    const apiErr = err as ApiError;
    return NextResponse.json({ error: { code: apiErr.code, message: apiErr.message } }, { status: apiErr.status || 500 });
  }
}
