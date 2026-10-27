const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "/api";

interface ApiResponse<T = unknown> {
  data?: T;
  error?: {
    code: string;
    message: string;
    requestId: string;
  };
}

class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    public message: string,
    public requestId: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const url = path.startsWith("/") ? `${API_BASE}${path}` : `${API_BASE}/${path}`;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((options?.headers as Record<string, string>) || {}),
  };

  const response = await fetch(url, {
    ...options,
    credentials: "include",
    headers,
  });

  let body: unknown;
  try {
    body = await response.json();
  } catch {
    body = null;
  }

  if (!response.ok) {
    const errorBody = body as ApiResponse<T>;
    throw new ApiError(
      response.status,
      (errorBody.error?.code as string) || "UNKNOWN_ERROR",
      (errorBody.error?.message as string) || `Request failed with status ${response.status}`,
      (errorBody.error?.requestId as string) || "",
    );
  }

  const apiResponse = body as ApiResponse<T>;
  return (apiResponse.data ?? body) as T;
}

export const api = {
  get: <T>(path: string, init?: RequestInit) => request<T>(path, { ...init, method: "GET" }),
  post: <T>(path: string, body?: unknown, init?: RequestInit) =>
    request<T>(path, { ...init, method: "POST", body: JSON.stringify(body) }),
  patch: <T>(path: string, body?: unknown, init?: RequestInit) =>
    request<T>(path, { ...init, method: "PATCH", body: JSON.stringify(body) }),
  put: <T>(path: string, body?: unknown, init?: RequestInit) =>
    request<T>(path, { ...init, method: "PUT", body: JSON.stringify(body) }),
  delete: <T>(path: string, init?: RequestInit) =>
    request<T>(path, { ...init, method: "DELETE" }),
};

export { ApiError };
