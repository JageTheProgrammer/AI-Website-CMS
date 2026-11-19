import { NextResponse } from "next/server";
export async function POST() {
  return NextResponse.json({ error: { code: "NOT_IMPLEMENTED", message: "Profile upload not yet available." } }, { status: 501 });
}
