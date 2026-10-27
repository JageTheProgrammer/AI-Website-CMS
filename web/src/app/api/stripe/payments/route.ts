import { NextResponse, NextRequest } from "next/server";
import { request, ApiError } from "@/lib/api/proxy";

export async function GET() {
  try {
    const res = await request("/api/billing/payments", { method: "GET" });
    return NextResponse.json(res);
  } catch (err) {
    const apiErr = err as ApiError;
    return NextResponse.json({ error: { code: apiErr.code, message: apiErr.message } }, { status: apiErr.status || 500 });
  }
}
