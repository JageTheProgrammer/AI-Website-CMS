/** A complete example site. Used by tests, demos and as a seed for new projects. */
export const sampleSite = {
  version: 1,
  meta: { title: "Northlight", description: "Project planning that stays out of your way.", language: "en" },
  theme: { preset: "indigo", mode: "light", fontHeading: "Plus Jakarta Sans", fontBody: "Inter", radius: "lg" },
  pages: [
    {
      path: "/",
      title: "Northlight — Plan projects without the noise",
      root: [
        { type: "announcement-bar", props: { text: "Northlight 2.0 is here — now with timelines.", linkLabel: "See what's new", linkHref: "#features" } },
        { type: "navbar", props: { brand: "Northlight", links: [{ label: "Features", href: "#features" }, { label: "Pricing", href: "#pricing" }, { label: "FAQ", href: "#faq" }, { label: "Contact", href: "#contact" }], ctaLabel: "Start free", ctaHref: "#pricing" } },
        { type: "hero", props: { variant: "centered", eyebrow: "Now with timelines", heading: "Plan projects without the noise", subheading: "Northlight gives small teams one calm place to plan, track and ship work — without the bloat of enterprise tools.", primaryLabel: "Start free", primaryHref: "#pricing", secondaryLabel: "See features", secondaryHref: "#features", note: "No credit card required", image: "placeholder:Dashboard screenshot with a project timeline" } },
        { type: "logos", props: { heading: "Trusted by teams at", items: [{ name: "Northwind" }, { name: "Lumo" }, { name: "Bloom" }, { name: "Vertex" }, { name: "Helio" }, { name: "Orbit" }] } },
        { type: "features", props: { anchor: "features", bg: "surface", heading: "Everything your team needs", subheading: "Powerful where it counts, simple everywhere else.", variant: "cards" } },
        { type: "feature-split", props: { heading: "See the whole project at a glance", text: "Timelines, boards and lists share one source of truth, so everyone always knows what's next.", bullets: ["Drag-and-drop scheduling", "Dependencies that just work", "Share a read-only view with clients"], ctaLabel: "Explore timelines", ctaHref: "#", image: "placeholder:Timeline view" } },
        { type: "feature-split", props: { bg: "surface", reverse: true, eyebrow: "Collaboration", heading: "Built for the way teams talk", text: "Comment on tasks, mention teammates and keep decisions next to the work they affect.", bullets: ["Threaded comments", "Mentions and reminders", "Activity history"], ctaLabel: "", image: "placeholder:Team commenting on a task" } },
        { type: "stats", props: { bg: "primary", items: [{ value: "12k+", label: "Teams" }, { value: "4.9/5", label: "Average rating" }, { value: "99.9%", label: "Uptime" }, { value: "30s", label: "Typical setup" }] } },
        { type: "steps", props: { heading: "Up and running in minutes" } },
        { type: "testimonials", props: { bg: "surface", heading: "Teams love Northlight" } },
        { type: "pricing", props: { anchor: "pricing", bg: "default" } },
        { type: "faq", props: { anchor: "faq", bg: "surface" } },
        { type: "cta", props: { variant: "card", bg: "default", heading: "Ready to plan calmer?", text: "Start free today. Upgrade when your team grows.", primaryLabel: "Start free", primaryHref: "#pricing", secondaryLabel: "Talk to sales", secondaryHref: "#contact" } },
        { type: "contact-form", props: { anchor: "contact", bg: "surface", eyebrow: "Contact", heading: "Talk to the team", subheading: "Questions about plans or migrating? We reply within one business day.", email: "hello@northlight.example", phone: "+358 40 123 4567", address: "Mannerheimintie 10, Helsinki" } },
        { type: "footer", props: { brand: "Northlight", description: "Calm project planning for small teams.", copyright: "© 2026 Northlight Oy", columns: [{ title: "Product", links: [{ label: "Features", href: "#features" }, { label: "Pricing", href: "#pricing" }] }, { title: "Company", links: [{ label: "About", href: "/about" }, { label: "Contact", href: "#contact" }] }], social: [{ icon: "twitter", href: "#" }, { icon: "github", href: "#" }] } },
      ],
    },
    {
      path: "/about",
      title: "About Northlight",
      root: [
        { type: "navbar", props: { brand: "Northlight", links: [{ label: "Home", href: "/" }, { label: "About", href: "/about" }], ctaLabel: "Start free", ctaHref: "/" } },
        { type: "page-header", props: { eyebrow: "About", heading: "We make planning feel light", subheading: "A small team on a mission to remove the noise from work." } },
        { type: "timeline", props: {} },
        { type: "team", props: { bg: "surface" } },
        { type: "footer", props: { brand: "Northlight", copyright: "© 2026 Northlight Oy", columns: [], social: [] } },
      ],
    },
  ],
};
