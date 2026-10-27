
import "server-only";

import { cookies } from "next/headers";

const BACKEND_URL = (
  process.env.API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "http://localhost:4000"
).replace(/\/+$/, "");

export interface ApiResponse<T = unknown> {
  data?: T;
  error?: {
    code: string;
    message: string;
    requestId?: string;
  };
}

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

type RequestOptions = RequestInit & {
  forwardCookies?: boolean;
};

export async function request<T = unknown>(
  path: string,
  init: RequestOptions = {},
): Promise<ApiResponse<T>> {
  const url = `${BACKEND_URL}/${path.replace(/^\/+/, "")}`;
  const headers = new Headers(init.headers);

  if (!headers.has("content-type") && init.body != null) {
    headers.set("content-type", "application/json");
  }

  // Server-side fetch does not automatically forward browser cookies.
  if (init.forwardCookies !== false && !headers.has("cookie")) {
    const cookieStore = await cookies();
    const cookieHeader = cookieStore
      .getAll()
      .map(({ name, value }) => `${name}=${value}`)
      .join("; ");

    if (cookieHeader) {
      headers.set("cookie", cookieHeader);
    }
  }

  const { forwardCookies: _forwardCookies, ...fetchOptions } = init;

  let res: Response;

  try {
    res = await fetch(url, {
      ...fetchOptions,
      headers,
      cache: "no-store",
    });
  } catch (error) {
    console.error("[API Proxy] Could not reach Express:", error);

    throw new ApiError(
      502,
      "BACKEND_UNREACHABLE",
      "Could not connect to the API backend. Check that Express is running and API_BASE_URL is correct.",
    );
  }

  const rawBody = await res.text();

  let body: ApiResponse<T>;

  try {
    body = rawBody
      ? (JSON.parse(rawBody) as ApiResponse<T>)
      : {};
  } catch {
    body = {
      error: {
        code: "INVALID_BACKEND_RESPONSE",
        message: "The API backend returned an invalid response.",
      },
    };
  }

  if (!res.ok) {
    throw new ApiError(
      res.status,
      body.error?.code ?? "UNKNOWN_ERROR",
      body.error?.message ?? `Request failed with status ${res.status}`,
    );
  }

  return body;
}
