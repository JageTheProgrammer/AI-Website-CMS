import type { Request } from "express";
import { getPool } from "./db";

interface AuditLogInput {
  actorUserId?: number | null;
  projectId?: number | null;
  action: string;
  resourceType?: string | null;
  resourceId?: string | number | null;
  request?: Request;
  metadata?: Record<string, string | number | boolean | null>;
}

export async function recordAuditLog(input: AuditLogInput): Promise<void> {
  try {
    await getPool().execute(
      `INSERT INTO audit_logs
         (actor_user_id, project_id, action, resource_type, resource_id, request_id, ip_address, metadata)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        input.actorUserId ?? null,
        input.projectId ?? null,
        input.action,
        input.resourceType ?? null,
        input.resourceId == null ? null : String(input.resourceId),
        (input.request as (Request & { requestId?: string }) | undefined)?.requestId ?? null,
        input.request?.ip ?? null,
        input.metadata ? JSON.stringify(input.metadata) : null,
      ],
    );
  } catch (error) {
    console.error("[Audit Log] Failed to record event:", {
      action: input.action,
      error,
    });
  }
}
