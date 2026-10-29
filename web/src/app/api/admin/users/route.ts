import { NextResponse } from "next/server";
import { ApiError, request } from "@/lib/api/proxy";

export async function GET(incomingRequest: Request) {
  const cookieHeader = incomingRequest.headers.get("cookie");

  try {
    const result = await request("/api/admin/users", {
      headers: cookieHeader ? { cookie: cookieHeader } : undefined,
      forwardCookies: false,
    });
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json(
        {
          error: {
            code: error.code,
            message: error.message,
          },
        },
        { status: error.status },
      );
    }

    console.error("[Admin Users API] Failed to fetch users:", error);

    return NextResponse.json(
      {
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to load users.",
        },
      },
      { status: 500 },
    );
  }
}
