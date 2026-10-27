
import { NextRequest, NextResponse } from "next/server";
import { request, ApiError } from "@/lib/api/proxy";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    if (!id || id === "undefined") {
      return NextResponse.json(
        {
          error: {
            code: "INVALID_PROJECT_SLUG",
            message: "A valid project slug is required.",
          },
        },
        { status: 400 },
      );
    }

    console.log("[Preview API] Project identifier:", id);

    const result = await request(
      `/api/projects/${encodeURIComponent(id)}/preview`,
      { method: "GET" },
    );

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

    console.error("[Preview API] Unexpected error:", error);

    return NextResponse.json(
      {
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to load the website preview.",
        },
      },
      { status: 500 },
    );
  }
}
