
import { NextResponse } from "next/server";
import { request, ApiError } from "@/lib/api/proxy";

export async function GET() {
  try {
    const result = await request("/api/admin/stats", {
      method: "GET",
    });

    return NextResponse.json(result);
  } catch (error) {
    const apiError =
      error instanceof ApiError
        ? error
        : new ApiError(500, "INTERNAL_ERROR", "Unable to load admin statistics.");

    return NextResponse.json(
      {
        error: {
          code: apiError.code,
          message: apiError.message,
        },
      },
      { status: apiError.status },
    );
  }
}
