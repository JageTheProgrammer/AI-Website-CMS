import { NextResponse } from "next/server";
import { request, ApiError } from "@/lib/api/proxy";

export async function POST() {
  try {
    const res = await request("/api/auth/profile", { method: "DELETE" });
    return NextResponse.json(res);
  } catch (err) {
    const apiErr = err as ApiError;
    return NextResponse.json({ error: { code: apiErr.code, message: apiErr.message } }, { status: apiErr.status || 500 });
  }
}
