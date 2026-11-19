import { NextResponse } from "next/server";
import { request, ApiError } from "@/lib/api/proxy";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const res = await request("/api/projects/" + id, { method: "GET" });
    return NextResponse.json(res);
  } catch (err) {
    const apiErr = err as ApiError;
    if (apiErr.status === 404) return NextResponse.json({ error: { code: "NOT_FOUND", message: "Project not found." } }, { status: 404 });
    return NextResponse.json({ error: { code: apiErr.code, message: apiErr.message } }, { status: apiErr.status || 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const res = await request("/api/projects/" + id, { method: "PATCH", body });
    return NextResponse.json(res);
  } catch (err) {
    const apiErr = err as ApiError;
    return NextResponse.json({ error: { code: apiErr.code, message: apiErr.message } }, { status: apiErr.status || 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const res = await request("/api/projects/" + id, { method: "DELETE" });
    return NextResponse.json(res);
  } catch (err) {
    const apiErr = err as ApiError;
    if (apiErr.status === 404) return NextResponse.json({ error: { code: "NOT_FOUND", message: "Project not found." } }, { status: 404 });
    return NextResponse.json({ error: { code: apiErr.code, message: apiErr.message } }, { status: apiErr.status || 500 });
  }
}
