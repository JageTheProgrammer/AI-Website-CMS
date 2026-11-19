import { NextRequest, NextResponse } from "next/server";
import { ApiError, request } from "@/lib/api/proxy";

type RouteContext = { params: Promise<{ slug: string }> };

export async function POST(req: NextRequest, { params }: RouteContext) {
  try {
    const body = await req.json().catch(() => null);
    const versionNumber = body?.versionNumber;

    if (!Number.isSafeInteger(versionNumber) || versionNumber < 1) {
      return NextResponse.json(
        {
          error: {
            code: "VALIDATION_ERROR",
            message: "A positive integer versionNumber is required.",
          },
        },
        { status: 400 },
      );
    }

    const { slug } = await params;
    const result = await request(
      `/api/documents/${encodeURIComponent(slug)}/restore`,
      {
        method: "POST",
        body: JSON.stringify({ versionNumber }),
      },
    );

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json(
        { error: { code: error.code, message: error.message } },
        { status: error.status },
      );
    }

    console.error("[Document restore API] Request failed:", error);

    return NextResponse.json(
      {
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to restore the document version.",
        },
      },
      { status: 500 },
    );
  }
}
