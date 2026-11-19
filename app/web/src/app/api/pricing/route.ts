/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { request } from "@/lib/api/proxy";

export async function GET() {
  try {
    const res = await request("/api/billing/pricing", { method: "GET" });
    return NextResponse.json(res);
  } catch (err: any) {
    return NextResponse.json({ data: [] });
  }
}
