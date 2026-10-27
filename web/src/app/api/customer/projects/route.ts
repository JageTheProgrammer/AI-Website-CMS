import { customerProxy } from "@/lib/api/customer-proxy";

export async function GET() {
  return customerProxy("/api/customer/projects");
}