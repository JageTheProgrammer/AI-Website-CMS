
import { redirect } from "next/navigation";
import { request } from "@/lib/api/proxy";

interface AuthUser {
  userId: number;
  email: string;
  displayName: string;
  role: string;
  status: string;
}

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  try {
    const result = await request<AuthUser>("/api/auth/me");

    if (result.data?.userId) {
      redirect("/dashboard");
    }
  } catch (error) {
    // redirect() throws internally; don't swallow its redirect signal.
    if (
      error &&
      typeof error === "object" &&
      "digest" in error &&
      typeof error.digest === "string" &&
      error.digest.startsWith("NEXT_REDIRECT")
    ) {
      throw error;
    }

    // Unauthenticated or unavailable API: allow the auth page to render.
  }

  return <>{children}</>;
}
