
import { NextRequest, NextResponse } from "next/server";

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
    if (cookie) {
      headers.set("cookie", cookie);
    }

    const backendResponse = await fetch(
      `${BACKEND_URL}/api/auth/login`,
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

    // Preserve the Express session cookie(s).
    for (const setCookie of backendResponse.headers.getSetCookie()) {
      responseHeaders.append("set-cookie", setCookie);
    }

    return new NextResponse(responseBody, {
      status: backendResponse.status,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error("[Login API] Request failed:", error);

    return NextResponse.json(
      {
        error: {
          code: "BACKEND_UNREACHABLE",
          message:
            error instanceof Error
              ? error.message
              : "Could not connect to the API backend.",
        },
      },
      { status: 502 },
    );
  }
}
