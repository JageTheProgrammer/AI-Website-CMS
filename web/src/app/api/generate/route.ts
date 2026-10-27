
import { NextRequest, NextResponse } from "next/server";
import { request, ApiError } from "@/lib/api/proxy";

function handleError(err: unknown) {
  console.error("[Generate API] Request failed:", err);

  if (err instanceof ApiError) {
    return NextResponse.json(
      {
        error: {
          code: err.code,
          message: err.message,
        },
      },
      { status: err.status },
    );
  }

  return NextResponse.json(
    {
      error: {
        code: "INTERNAL_ERROR",
        message: "Failed to process generation request.",
      },
    },
    { status: 500 },
  );
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);

    if (
      !body ||
      typeof body.projectSlug !== "string" ||
      !body.projectSlug.trim() ||
      typeof body.prompt !== "string" ||
      !body.prompt.trim()
    ) {
      return NextResponse.json(
        {
          error: {
            code: "VALIDATION_ERROR",
            message: "A project slug and prompt are required.",
          },
        },
        { status: 400 },
      );
    }

    const result = await request("/api/generation", {
      method: "POST",
      body: JSON.stringify({
        projectSlug: body.projectSlug.trim(),
        prompt: body.prompt.trim(),
      }),
    });

    return NextResponse.json(result, { status: 201 });
  } catch (err) {
    return handleError(err);
  }
}

export async function GET(req: NextRequest) {
  const jobId = req.nextUrl.searchParams.get("jobId");

  if (!jobId || !/^\d+$/.test(jobId) || !Number.isSafeInteger(Number(jobId)) || Number(jobId) <= 0) {
    return NextResponse.json(
      {
        error: {
          code: "VALIDATION_ERROR",
          message: "A valid jobId is required.",
        },
      },
      { status: 400 },
    );
  }

  try {
    const result = await request(
      `/api/generation/${encodeURIComponent(jobId)}`,
      { method: "GET" },
    );

    return NextResponse.json(result);
  } catch (err) {
    return handleError(err);
  }
}
