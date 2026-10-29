import { NextRequest, NextResponse } from "next/server";
import { ApiError, request } from "@/lib/api/proxy";

export async function GET(req: NextRequest) {
  const name = req.nextUrl.searchParams.get("name");
  if (!name?.trim()) {
    return NextResponse.json(
      { error: { code: "VALIDATION_ERROR", message: "Project name is required." } },
      { status: 400 },
    );
  }

  try {
    const result = await request(
      `/api/projects/subdomain-availability?name=${encodeURIComponent(name.trim())}`,
    );
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json(
        { error: { code: error.code, message: error.message } },
        { status: error.status },
      );
    }

    console.error("[Project Subdomain API] Availability check failed:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Could not check the project address." } },
      { status: 500 },
    );
  }
}
