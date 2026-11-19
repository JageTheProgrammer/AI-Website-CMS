import type { ReactNode } from "react";
import type { Metadata } from "next";
import { verifyDashboardSession } from "./actions";
import { connection } from "next/server";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  await connection();
  await verifyDashboardSession();

  return <>{children}</>;
}