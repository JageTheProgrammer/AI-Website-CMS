import { customerProxy } from "@/lib/api/customer-proxy";

export async function GET() {
  return customerProxy("/api/customer/settings");
}

export async function PATCH(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return Response.json(
      { error: { code: "INVALID_BODY", message: "Invalid JSON body." } },
      { status: 400 },
    );
  }

  return customerProxy("/api/customer/settings", "PATCH", body);
}