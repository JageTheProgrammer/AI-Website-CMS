import { customerProxy } from "@/lib/api/customer-proxy";

export async function GET(request: Request) {
  return customerProxy(
    "/api/customer/activity",
    "GET",
    undefined,
    request.headers.get("cookie"),
  );
}