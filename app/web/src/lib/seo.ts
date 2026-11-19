import type { Metadata } from "next";

export const siteUrl = new URL(
  process.env.NEXT_PUBLIC_SITE_URL || "https://cms.polityra.org",
);

const socialImage = {
  url: "/images/polityra-cms-banner.png",
  width: 3428,
  height: 946,
  alt: "Polityra CMS",
};

export const publicPages = {
  home: {
    path: "/",
    title: "Open-source website builder",
    description:
      "Build and refine websites with Polityra CMS, an open-source, AI-assisted website builder maintained by the Polityra organization.",
  },
  features: {
    path: "/features",
    title: "Features",
    description:
      "Explore Polityra CMS features for AI-assisted website creation, project editing, previews, and working with your source code.",
  },
  pricing: {
    path: "/pricing",
    title: "Open source",
    description:
      "Learn about Polityra CMS as an Apache-2.0 licensed open-source project and how to explore and contribute to its code.",
  },
  about: {
    path: "/about",
    title: "About",
    description:
      "Learn about Polityra CMS, the open-source website builder, its guiding principles, and the community behind the project.",
  },
  faq: {
    path: "/faq",
    title: "Frequently asked questions",
    description:
      "Find answers about Polityra CMS, AI-assisted website creation, open-source licensing, hosting, and project data.",
  },
  contact: {
    path: "/contact",
    title: "Contact and contribute",
    description:
      "Find the Polityra CMS community, report issues, explore setup documentation, or learn how to report security concerns.",
  },
  privacy: {
    path: "/privacy",
    title: "Privacy",
    description:
      "Read the Polityra CMS privacy information and learn how data handling depends on the deployment and its configured services.",
  },
  terms: {
    path: "/terms",
    title: "Terms",
    description:
      "Read the terms and project information for using and exploring Polityra CMS.",
  },
  cookies: {
    path: "/cookies",
    title: "Cookies",
    description:
      "Learn about cookies and session storage used by Polityra CMS and how their use can depend on the deployment.",
  },
} as const;

export function pageMetadata(page: (typeof publicPages)[keyof typeof publicPages]): Metadata {
  const title = `${page.title} | Polityra CMS`;

  return {
    title: page.title,
    description: page.description,
    alternates: { canonical: page.path },
    openGraph: {
      type: "website",
      url: page.path,
      siteName: "Polityra CMS",
      title,
      description: page.description,
      images: [socialImage],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: page.description,
      images: [socialImage],
    },
  };
}
