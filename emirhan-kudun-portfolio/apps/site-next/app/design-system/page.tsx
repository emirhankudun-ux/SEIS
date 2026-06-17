import type { Metadata } from "next";
import Link from "next/link";

import { getDictionary } from "@seis/content";
import { designPrinciples, designTokenGroups } from "@seis/content/design-system";

import { buildPageMetadata } from "../../lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Design System",
  description: "SEIS design system principles, tokens and calm interface direction.",
  path: "/design-system"
});

export default function DesignSystemPage() {
  const dict = getDictionary("tr");

  return (
    <main className="page-shell">
      <nav className="top-nav" aria-label={dict.primaryNavigationLabel}>
        <Link href="/" className="brand">
          Emirhan Kudun
        </Link>
        <div className="nav-links">
          <Link href="/portfolio">{dict.navPortfolio}</Link>
          <Link href="/#behance">{dict.navBehance}</Link>
          <Link href="/drawings">{dict.navDrawings}</Link>
          <Link href="/contact">{dict.navContact}</Link>
        </div>
      </nav>

      <section className="section page-hero">
        <p className="eyebrow">SEIS Design System</p>
        <h1>Calm cinematic rules for a premium Behance-forward portfolio.</h1>
        <p>
          This surface documents the visual and interaction rules that keep the website expressive without becoming noisy.
        </p>

        <div className="card-grid">
          {designPrinciples.map((principle) => (
            <article className="work-card" key={principle.id}>
              <p className="kicker">{principle.id}</p>
              <h2>{principle.title}</h2>
              <p>{principle.summary}</p>
              <span>{principle.signal}</span>
            </article>
          ))}
        </div>

        <div className="runtime-grid design-token-grid">
          {designTokenGroups.map((group) => (
            <article className="runtime-card" data-status="active" key={group.id}>
              <p className="kicker">Token group</p>
              <h2>{group.label}</h2>
              <p>{group.values.join(" / ")}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
