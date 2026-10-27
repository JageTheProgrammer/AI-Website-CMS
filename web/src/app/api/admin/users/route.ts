import { NextResponse } from "next/server";
import { ApiError, request } from "@/lib/api/proxy";

export async function GET() {
  try {
    const result = await request("/api/admin/users");
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
