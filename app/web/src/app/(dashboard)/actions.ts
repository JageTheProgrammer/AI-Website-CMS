import "server-only";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";

export async function verifyDashboardSession() {
  const cookieStore = await cookies();
  const requestHeaders = await headers();

  const cookieHeader = cookieStore
    .getAll()
    .map(({ name, value }) => `${name}=${value}`)
    .join("; ");

  if (!cookieHeader) {
    redirect("/login?next=%2Fdashboard%2Fcustomer");
  }

  const appUrl = process.env.APP_URL?.replace(/\/+$/, "");
  const host =
    requestHeaders.get("x-forwarded-host") ??
    requestHeaders.get("host");

  const protocol =
    requestHeaders.get("x-forwarded-proto")?.split(",")[0]?.trim() ??
    (process.env.NODE_ENV === "production" ? "https" : "http");

  const origin = appUrl ?? (host ? `${protocol}://${host}` : null);

  if (!origin) {
    throw new Error("Unable to determine application URL. Set APP_URL.");
  }

  let response: Response;

  try {
    response = await fetch(`${origin}/api/auth/me`, {
      method: "GET",
      headers: {
        Cookie: cookieHeader,
        Accept: "application/json",
      },
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
    });
  } catch (error) {
    console.error("Session verification request failed:", error);

    // Do not treat a server/network failure as a confirmed logged-out state.
    throw new Error("Unable to verify your session. Please try again.");
  }

  if (response.status === 401 || response.status === 403) {
    redirect("/login?next=%2Fdashboard%2Fcustomer");
  }

  if (!response.ok) {
    throw new Error(
      `Session verification failed with HTTP ${response.status}.`,
    );
  }

const data = await response.json();
const user = data?.user ?? data?.data?.user ?? data?.data;

if (
  !user ||
  typeof user !== "object" ||
  (user.userId == null && user.id == null)
) {
  redirect("/login?next=%2Fdashboard%2Fcustomer");
}

return user;
}