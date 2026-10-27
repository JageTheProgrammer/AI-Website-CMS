
import { NextResponse } from "next/server";

const BACKEND_URL = (
  process.env.API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "http://localhost:4000"
).replace(/\/+$/, "");

export async function POST(request: Request) {
  try {
    const headers = new Headers();
    const cookie = request.headers.get("cookie");

    if (cookie) {
      headers.set("cookie", cookie);
    }

    const backendResponse = await fetch(
      `${BACKEND_URL}/api/auth/logout`,
      {
        method: "POST",
        headers,
        cache: "no-store",
      },
    );

    const body = await backendResponse.text();
    const responseHeaders = new Headers();
    const contentType = backendResponse.headers.get("content-type");

    if (contentType) {
      responseHeaders.set("content-type", contentType);
    }

    // Forward cookie-clearing headers from Express.
    for (const setCookie of backendResponse.headers.getSetCookie()) {
      responseHeaders.append("set-cookie", setCookie);
    }

    return new NextResponse(body, {
      status: backendResponse.status,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error("[Logout API] Request failed:", error);

    return NextResponse.json(
      {
        error: {
          code: "BACKEND_UNREACHABLE",
          message: "Could not connect to the authentication server.",
        },
      },
      { status: 502 },
    );
  }
}
