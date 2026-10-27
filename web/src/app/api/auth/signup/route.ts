
import { NextRequest, NextResponse } from "next/server";
import { ApiError } from "@/lib/api/proxy";

const BACKEND_URL = (
  process.env.API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "http://localhost:4000"
).replace(/\/+$/, "");

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();

    const headers = new Headers({
      "content-type": req.headers.get("content-type") ?? "application/json",
    });

    const cookie = req.headers.get("cookie");
    if (cookie) headers.set("cookie", cookie);

    const backendResponse = await fetch(
      `${BACKEND_URL}/api/auth/signup`,
      {
        method: "POST",
        headers,
        body,
        cache: "no-store",
      },
    );

    const responseBody = await backendResponse.text();
    const responseHeaders = new Headers();

    const contentType = backendResponse.headers.get("content-type");
    if (contentType) {
      responseHeaders.set("content-type", contentType);
    }

    // Forward all session cookies from Express.
    for (const cookie of backendResponse.headers.getSetCookie()) {
      responseHeaders.append("set-cookie", cookie);
    }

    return new NextResponse(responseBody, {
      status: backendResponse.status,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error("[Signup API] Request failed:", error);

    const apiError =
      error instanceof ApiError
        ? error
        : new ApiError(
            502,
            "BACKEND_UNREACHABLE",
            error instanceof Error
              ? error.message
              : "Could not connect to the API backend.",
          );

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
