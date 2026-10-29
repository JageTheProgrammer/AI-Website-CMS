const RESERVED_SUBDOMAINS = new Set([
  "admin",
  "api",
  "app",
  "assets",
  "mail",
  "static",
  "www",
]);

export function getPublicSiteDomain(): string {
  const domain = (process.env.PUBLIC_SITE_DOMAIN || "maatix.fi")
    .trim()
    .toLowerCase()
    .replace(/\.$/, "");

  if (
    !domain ||
    domain.includes("://") ||
    domain.includes("/") ||
    domain.includes(":") ||
    !/^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/.test(domain)
  ) {
    throw new Error("PUBLIC_SITE_DOMAIN must be a hostname such as maatix.fi.");
  }

  return domain;
}

export function getPublicSiteUrl(subdomain: string): string {
  return `https://${subdomain}.${getPublicSiteDomain()}`;
}

export function subdomainFromName(name: string): string {
  return (
    name
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 63)
      .replace(/-+$/g, "") || "project"
  );
}

export function isReservedSubdomain(subdomain: string): boolean {
  return RESERVED_SUBDOMAINS.has(subdomain.toLowerCase());
}
