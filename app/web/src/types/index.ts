export interface User {
  id: string;
  email: string;
  displayName: string;
  role: "customer" | "admin";
  status: "active" | "suspended" | "pending";
  emailVerifiedAt: string | null;
  lastLoginAt: string | null;
  avatarUrl: string | null;
}

export interface Project {
  id: string;
  ownerId: string;
  name: string;
  slug: string;
  description: string | null;
  framework: "nextjs" | "react" | "node" | "static";
  status: "draft" | "generating" | "ready" | "published" | "archived" | "failed";
  visibility: "private" | "public";
  platformSubdomain: string | null;
  currentVersionNumber: number;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectVersion {
  id: string;
  projectId: string;
  versionNumber: number;
  createdByUserId: string | null;
  sourcePrompt: string | null;
  summary: string | null;
  status: "draft" | "ready" | "published" | "failed";
  createdAt: string;
}

export interface ProjectFile {
  id: string;
  projectVersionId: string;
  filePath: string;
  content: string;
  sizeBytes: number;
  updatedAt: string;
}

export interface GenerationJob {
  id: string;
  projectId: string;
  requestedByUserId: string;
  provider: string;
  model: string;
  prompt: string;
  status: "queued" | "running" | "succeeded" | "failed" | "cancelled";
  progressPercent: number;
  resultVersionId: string | null;
  errorCode: string | null;
  errorMessage: string | null;
  startedAt: string | null;
  finishedAt: string | null;
  createdAt: string;
}

export interface Deployment {
  id: string;
  projectId: string;
  projectVersionId: string;
  createdByUserId: string;
  target: "platform" | "custom";
  status: "queued" | "building" | "deploying" | "succeeded" | "failed" | "cancelled";
  deploymentUrl: string | null;
  logExcerpt: string | null;
  errorCode: string | null;
  createdAt: string;
}

export interface Domain {
  id: string;
  projectId: string;
  domainName: string;
  status: "pending" | "verified" | "active" | "failed" | "removed";
  verifiedAt: string | null;
  tlsStatus: "pending" | "active" | "failed" | "not_applicable";
  lastCheckedAt: string | null;
  createdAt: string;
}

export interface Subscription {
  id: string;
  userId: string;
  planCode: string;
  status: "trialing" | "active" | "past_due" | "cancelled" | "incomplete" | "inactive";
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
}

export interface BillingInfo {
  subscription: Subscription | null;
  payments: Payment[];
  usageLimits: UsageLimits;
}

export interface Payment {
  id: string;
  amountMinor: number;
  currency: string;
  status: "pending" | "succeeded" | "failed" | "refunded" | "cancelled";
  description: string;
  paidAt: string | null;
  createdAt: string;
}

export interface UsageLimits {
  maxProjects: number;
  maxGenerationsPerMonth: number;
  currentGenerationCount: number;
  maxDomains: number;
  maxDatabaseConnections: number;
}

export interface SupportTicket {
  id: string;
  subject: string;
  message: string;
  status: "open" | "in_progress" | "waiting_for_user" | "resolved" | "closed";
  priority: "low" | "normal" | "high" | "urgent";
  createdAt: string;
}

export interface AuditLog {
  id: string;
  userId: string | null;
  action: string;
  resourceType: string | null;
  resourceId: string | null;
  ipAddress: string | null;
  createdAt: string;
}

export interface PricingTier {
  name: string;
  price: number;
  description: string;
  features: string[];
  highlighted?: boolean;
  buttonText: string;
  href: string;
}

export interface FAQItem {
  question: string;
  answer: string;
}
