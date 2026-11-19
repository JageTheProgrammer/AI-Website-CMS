import type { ReactNode } from "react";
import { verifyDashboardSession } from "./actions";
import { connection } from "next/server";


export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  await connection();
  await verifyDashboardSession();

  return <>{children}</>;
}