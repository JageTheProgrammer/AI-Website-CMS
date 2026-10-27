import type {
  User,
  Project,
  ProjectVersion,
  GenerationJob,
  Deployment,
  Domain,
  BillingInfo,
  Payment,
  Subscription,
  PricingTier,
  FAQItem,
  SupportTicket,
  UsageLimits,
} from "@/types";

// ─── Auth (Mock) ──────────────────────────────────────────

export async function mockLogin(email: string, _password: string): Promise<{ user: User; token: string }> {
  await delay(600);
  return {
    user: {
      id: "usr_demo_1",
      email,
      displayName: email.split("@")[0].replace(/[.]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
      role: email.includes("admin") ? "admin" : "customer",
      status: "active",
      emailVerifiedAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
      avatarUrl: null,
    },
    token: "demo-token-abc123",
  };
}

export async function mockSignup(email: string, _password: string, displayName: string): Promise<User> {
  await delay(800);
  return {
    id: "usr_demo_2",
    email,
    displayName,
    role: "customer",
    status: "pending",
    emailVerifiedAt: null,
    lastLoginAt: null,
    avatarUrl: null,
  };
}

export async function mockAuthCheck(): Promise<User | null> {
  await delay(300);
  // Demo: always return authenticated user in frontend-only mode
  return {
    id: "usr_demo_1",
    email: "demo@example.com",
    displayName: "Demo User",
    role: "customer",
    status: "active",
    emailVerifiedAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString(),
    avatarUrl: null,
  };
}

export async function mockProfileFetch(): Promise<User> {
  await delay(400);
  return {
    id: "usr_demo_1",
    email: "demo@example.com",
    displayName: "Demo User",
    role: "customer",
    status: "active",
    emailVerifiedAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString(),
    avatarUrl: null,
  };
}

export async function mockProfileUpdate(data: Partial<User>): Promise<User> {
  await delay(500);
  return { id: "usr_demo_1", email: "demo@example.com", displayName: data.displayName ?? "Demo User", role: "customer", status: "active", emailVerifiedAt: null, lastLoginAt: null, avatarUrl: data.avatarUrl ?? null };
}

export async function mockDeleteAccount(): Promise<void> {
  await delay(600);
}

// ─── Projects (Mock) ──────────────────────────────────────

const DEMO_PROJECTS: Project[] = [
  {
    id: "prj_1",
    ownerId: "usr_demo_1",
    name: "Personal Portfolio",
    slug: "personal-portfolio",
    description: "A clean portfolio site to showcase my work and resume.",
    framework: "nextjs",
    status: "ready",
    visibility: "private",
    platformSubdomain: "personal-portfolio.cms.app",
    currentVersionNumber: 3,
    createdAt: "2026-09-15T10:00:00Z",
    updatedAt: "2026-10-20T14:30:00Z",
  },
  {
    id: "prj_2",
    ownerId: "usr_demo_1",
    name: "Coffee Shop Landing",
    slug: "coffee-shop-landing",
    description: "Landing page for a local coffee shop with menu and location.",
    framework: "static",
    status: "published",
    visibility: "public",
    platformSubdomain: "coffee-shop.cms.app",
    currentVersionNumber: 5,
    createdAt: "2026-10-01T08:00:00Z",
    updatedAt: "2026-10-22T09:00:00Z",
  },
];

export async function mockGetProjects(): Promise<Project[]> {
  await delay(400);
  return DEMO_PROJECTS;
}

export async function mockCreateProject(data: { name: string; description: string; framework: Project["framework"] }): Promise<Project> {
  await delay(700);
  const project: Project = {
    ...data,
    id: `prj_${Date.now()}`,
    ownerId: "usr_demo_1",
    slug: data.name.toLowerCase().replace(/\s+/g, "-"),
    status: "generating",
    visibility: "private",
    platformSubdomain: null,
    currentVersionNumber: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  DEMO_PROJECTS.push(project);
  return project;
}

export async function mockDeleteProject(id: string): Promise<void> {
  await delay(500);
  const idx = DEMO_PROJECTS.findIndex((p) => p.id === id);
  if (idx >= 0) DEMO_PROJECTS.splice(idx, 1);
}

// ─── Generation (Mock) ────────────────────────────────────

export async function mockGenerate(prompt: string): Promise<GenerationJob> {
  await delay(2000);
  return {
    id: `job_${Date.now()}`,
    projectId: "prj_demo",
    requestedByUserId: "usr_demo_1",
    provider: "ollama",
    model: "llama3.2",
    prompt,
    status: "succeeded",
    progressPercent: 100,
    resultVersionId: "ver_demo",
    errorCode: null,
    errorMessage: null,
    startedAt: new Date(Date.now() - 300_000).toISOString(),
    finishedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  };
}

// ─── Deployments (Mock) ───────────────────────────────────

export async function mockGetDeployments(projectId: string): Promise<Deployment[]> {
  await delay(400);
  return [
    {
      id: "dep_1",
      projectId,
      projectVersionId: "ver_demo",
      createdByUserId: "usr_demo_1",
      target: "platform",
      status: "succeeded",
      deploymentUrl: `https://${projectId}.cms.app`,
      logExcerpt: null,
      errorCode: null,
      createdAt: "2026-10-22T09:00:00Z",
    },
    {
      id: "dep_2",
      projectId,
      projectVersionId: "ver_demo",
      createdByUserId: "usr_demo_1",
      target: "platform",
      status: "building",
      deploymentUrl: null,
      logExcerpt: "Building assets...\nCompiling TypeScript...",
      errorCode: null,
      createdAt: "2026-10-23T14:00:00Z",
    },
  ];
}

// ─── Domains (Mock) ───────────────────────────────────────

export async function mockGetDomains(projectId: string): Promise<Domain[]> {
  await delay(300);
  return [
    {
      id: "dom_1",
      projectId,
      domainName: `${projectId}.cms.app`,
      status: "active",
      verifiedAt: "2026-10-01T00:00:00Z",
      tlsStatus: "active",
      lastCheckedAt: "2026-10-24T08:00:00Z",
      createdAt: "2026-10-01T00:00:00Z",
    },
  ];
}

// ─── Billing (Mock) ───────────────────────────────────────

const PLANS: Record<string, PricingTier> = {
  free: {
    name: "Free",
    price: 0,
    description: "Perfect for trying things out.",
    features: ["1 project", "5 generations/month", "Platform subdomain", "Basic templates"],
    buttonText: "Current Plan",
    href: "#",
  },
  pro: {
    name: "Pro",
    price: 19,
    description: "For professionals and small teams.",
    features: [
      "Unlimited projects",
      "50 generations/month",
      "Custom domains with TLS",
      "Priority support",
      "Team collaboration",
      "Export source code",
    ],
    highlighted: true,
    buttonText: "Upgrade to Pro",
    href: "/api/stripe/payments",
  },
  enterprise: {
    name: "Enterprise",
    price: 79,
    description: "For organizations at scale.",
    features: [
      "Everything in Pro",
      "Unlimited generations",
      "Dedicated support",
      "Custom SLA",
      "Audit logs",
      "SSO / SAML",
      "On-premise option",
    ],
    buttonText: "Contact Sales",
    href: "/contact",
  },
};

export function mockGetPricingTiers(): PricingTier[] {
  return Object.values(PLANS);
}

export async function mockGetBillingInfo(): Promise<BillingInfo> {
  await delay(500);
  const subscription: Subscription = { id: "sub_demo", userId: "usr_demo_1", planCode: "free", status: "active", currentPeriodEnd: null, cancelAtPeriodEnd: false };
  const payments: Payment[] = [
    { id: "pay_demo_1", amountMinor: 1900, currency: "USD", status: "succeeded", description: "Pro Plan - Monthly", paidAt: "2026-09-01T00:00:00Z", createdAt: "2026-09-01T00:00:00Z" },
    { id: "pay_demo_2", amountMinor: 0, currency: "USD", status: "succeeded", description: "Free Plan", paidAt: null, createdAt: "2026-10-01T00:00:00Z" },
  ];
  const usageLimits: UsageLimits = { maxProjects: 3, maxGenerationsPerMonth: 5, currentGenerationCount: 3, maxDomains: 2, maxDatabaseConnections: 0 };
  return { subscription, payments, usageLimits };
}

// ─── Support (Mock) ───────────────────────────────────────

export async function mockSubmitSupportTicket(subject: string, message: string): Promise<SupportTicket> {
  await delay(600);
  return { id: `stk_${Date.now()}`, subject, message, status: "open", priority: "normal", createdAt: new Date().toISOString() };
}

// ─── Admin (Mock) ────────────────────────────────────────

export async function mockGetAdminStats(): Promise<{
  totalUsers: number;
  totalProjects: number;
  activeSubscriptions: number;
  totalRevenue: number;
}> {
  await delay(500);
  return { totalUsers: 142, totalProjects: 387, activeSubscriptions: 56, totalRevenue: 1_260 };
}

// ─── FAQ Data (Mock) ──────────────────────────────────────

export function mockGetFaqs(): FAQItem[] {
  return [
    { question: "What is AI Website CMS?", answer: "It is a prompt-driven platform where you describe the website you need in natural language and our AI generates a working project you can preview, iterate on, deploy, and export." },
    { question: "How does pricing work?", answer: "We offer a Free tier to get started, a Pro plan at $19/month for individuals and small teams, and an Enterprise plan for larger organizations with custom requirements." },
    { question: "Can I use my own domain?", answer: "Yes. On the Pro and Enterprise plans you can connect a custom domain. We guide you through DNS setup and automatically provision TLS." },
    { question: "Can I export my project?", answer: "Pro and Enterprise users can download the full source code as an archive with dependencies, configuration, and setup instructions." },
    { question: "What frameworks are supported?", answer: "We generate projects in Next.js by default, with React, Node.js, and static site options coming soon." },
    { question: "Is my data secure?", answer: "Your projects are private by default. Generated code runs in isolated environments and we never share your source or secrets with third parties." },
  ];
}

// ─── Helper ───────────────────────────────────────────────

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
