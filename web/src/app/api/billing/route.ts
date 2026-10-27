import { NextRequest, NextResponse } from "next/server";
import { request, ApiError } from "@/lib/api/proxy";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const tier = url.searchParams.get("tier");
  if (tier === "subscription") {
    try {
      const res = await request("/api/billing/subscription", { method: "GET" });
      return NextResponse.json(res);
    } catch (err) {
      const apiErr = err as ApiError;
      return NextResponse.json({ error: { code: apiErr.code, message: apiErr.message } }, { status: apiErr.status || 500 });
    }
  }
  try {
    const res = await request("/api/billing/pricing", { method: "GET" });
    return NextResponse.json(res);
  } catch (err) {
    return NextResponse.json({ data: [] });
  }
}
