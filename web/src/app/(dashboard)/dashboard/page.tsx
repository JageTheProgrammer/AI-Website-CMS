
import { redirect } from "next/navigation";
import { ApiError, request } from "@/lib/api/proxy";

interface AuthUser {
  userId: number;
  email: string;
  displayName?: string;
  role: string;
  status?: string;
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let user: AuthUser | undefined;

  try {
    const result = await request<AuthUser>("/api/auth/me");
    user = result.data;
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      redirect("/login");
    }

    // Do not hide backend errors as authentication failures.
    throw error;
  }

  if (!user?.userId) {
    redirect("/login");
  }

  if (user.status && user.status !== "active") {
    redirect("/login");
  }

  switch (user.role?.toLowerCase()) {
    case "admin":
      redirect("/dashboard/admin");

    case "customer":
      redirect("/dashboard/customer");

    default:
      redirect("/login");
  }
}
