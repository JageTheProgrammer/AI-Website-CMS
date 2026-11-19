import { ApiError, request } from "@/lib/api/proxy";
import { NavbarClient } from "./navbar-client";

export async function Navbar() {
  let authenticated = false;

  try {
    const result = await request<{ userId: number }>("/api/auth/me");
    authenticated = Boolean(result.data?.userId);
  } catch (error) {
    if (!(error instanceof ApiError)) throw error;
  }

  return <NavbarClient authenticated={authenticated} />;
}
