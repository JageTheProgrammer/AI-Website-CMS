import { NextRequest, NextResponse } from "next/server";
import { ApiError, request } from "@/lib/api/proxy";

export async function GET(req: NextRequest) {
  const cookie = req.headers.get("cookie");

  try {
    const result = await request("/api/documents/components", {
      method: "GET",
      headers: cookie ? { cookie } : undefined,
      forwardCookies: false,
    });

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json(
        { error: { code: error.code, message: error.message } },
        { status: error.status },
      );
    }

    console.error("[Document components API] Request failed:", error);

    return NextResponse.json(
      {
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to load the component registry.",
        },
      },
      { status: 500 },
    );
  }
}
