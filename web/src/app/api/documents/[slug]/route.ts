import { NextRequest, NextResponse } from "next/server";
import { ApiError, request } from "@/lib/api/proxy";

type RouteContext = { params: Promise<{ slug: string }> };

function handleError(error: unknown) {
  if (error instanceof ApiError) {
    return NextResponse.json(
      { error: { code: error.code, message: error.message } },
      { status: error.status },
    );
  }

  console.error("[Documents API] Request failed:", error);

  return NextResponse.json(
    {
      error: {
        code: "INTERNAL_ERROR",
        message: "Failed to process the document request.",
      },
    },
    { status: 500 },
  );
}

export async function GET(_req: NextRequest, { params }: RouteContext) {
  try {
    const { slug } = await params;
    const result = await request(
      `/api/documents/${encodeURIComponent(slug)}`,
      { method: "GET" },
    );

    return NextResponse.json(result);
  } catch (error) {
    return handleError(error);
  }
}

export async function PUT(req: NextRequest, { params }: RouteContext) {
  try {
    const { slug } = await params;
    const body = await req.json();
    const result = await request(
      `/api/documents/${encodeURIComponent(slug)}`,
      {
        method: "PUT",
        body: JSON.stringify(body),
      },
    );

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        {
          error: {
            code: "VALIDATION_ERROR",
            message: "The request body must be valid JSON.",
          },
        },
        { status: 400 },
      );
    }

    return handleError(error);
  }
}
