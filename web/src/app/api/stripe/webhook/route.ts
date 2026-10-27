import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  return NextResponse.json({ error: { code: "NOT_IMPLEMENTED", message: "Stripe webhook requires API key." } }, { status: 501 });
}
