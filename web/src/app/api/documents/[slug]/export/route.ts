import { connection, NextRequest, NextResponse } from "next/server";
import { ApiError, request } from "@/lib/api/proxy";
import { getCmsSessionCookie } from "@/lib/github";

type RouteContext = { params: Promise<{ slug: string }> };

export async function GET(req: NextRequest, { params }: RouteContext) {
  try {
    await connection();
    const { slug } = await params;
    const result = await request(
      `/api/documents/${encodeURIComponent(slug)}/export`,
      {
        method: "GET",
        headers: { cookie: getCmsSessionCookie(req) },
        forwardCookies: false,
      },
    );
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json(
        { error: { code: error.code, message: error.message } },
        { status: error.status },
      );
    }
    console.error("[Document export API] Request failed:", error);
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message: "Failed to export the project." } },
      { status: 500 },
    );
  }
}
