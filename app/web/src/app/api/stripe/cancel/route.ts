import { NextResponse } from "next/server";
export async function POST() {
  return NextResponse.json({ error: { code: "NOT_IMPLEMENTED", message: "Stripe integration requires API key." } }, { status: 501 });
}
