import { NextRequest, NextResponse } from "next/server";
import { request, ApiError } from "@/lib/api/proxy";

function handleError(error: unknown) {
  console.error("[Projects API] Request failed:", error);

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

  return NextResponse.json(
    {
      error: {
        code: "INTERNAL_ERROR",
        message: "An unexpected error occurred.",
      },
    },
    { status: 500 },
  );
}

// GET /api/projects — list the authenticated user's projects
export async function GET() {
  try {
    const result = await request("/api/projects", {
      method: "GET",
    });

    return NextResponse.json(result);
  } catch (error) {
    return handleError(error);
  }
}

// POST /api/projects — create a project
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const result = await request("/api/projects", {
      method: "POST",
      body: JSON.stringify(body),
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return handleError(error);
  }
}