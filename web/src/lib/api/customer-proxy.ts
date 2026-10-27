import { NextResponse } from "next/server";
import { ApiError, request } from "@/lib/api/proxy";

export async function customerProxy(
  endpoint: string,
  method: "GET" | "PATCH" = "GET",
  body?: unknown,
) {
  try {
    const result = await request(endpoint, {
      method,
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    });

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

    console.error(`[Customer API] ${method} ${endpoint} failed:`, error);

    return NextResponse.json(
      {
        error: {
          code: "INTERNAL_ERROR",
          message: "The request could not be completed.",
        },
      },
      { status: 500 },
    );
  }
}
