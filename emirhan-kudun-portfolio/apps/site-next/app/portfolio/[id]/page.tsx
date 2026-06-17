import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getDictionary, works } from "@seis/content";

import { buildPageMetadata } from "../../../lib/seo";

type WorkDetailPageProps = {
  params: Promise<{ id: string }>;
};

export function generateStaticParams() {
  return works.map((work) => ({ id: work.id }));
}

export async function generateMetadata({ params }: WorkDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const work = works.find((item) => item.id === id);

  if (!work) {
    return {};
  }

  return buildPageMetadata({
    title: work.title,
    description: work.summary,
    path: `/portfolio/${work.id}`
  });
}

export default async function WorkDetailPage({ params }: WorkDetailPageProps) {
  const { id } = await params;
  const work = works.find((item) => item.id === id);
  const dict = getDictionary("tr");

  if (!work) {
    notFound();
  }

  return (
    <main className="page-shell detail-shell" id="page-main-content">
      <a href="#project-detail" className="skip-link">{dict.projectDetailSkip}</a>
      <nav className="top-nav" aria-label={dict.projectNavigationLabel}>
        <Link href="/" className="brand">Emirhan Kudun</Link>
        <div className="nav-links">
          <Link href="/portfolio" aria-current="page">{dict.navPortfolio}</Link>
          <Link href="/#behance">{dict.navBehance}</Link>
          <Link href="/drawings">{dict.navDrawings}</Link>
          <Link href="/contact">{dict.navContact}</Link>
        </div>
      </nav>
      <article className="section page-hero detail-article" id="project-detail">
        <p className="eyebrow">{work.tag} / {dict.projectDetailEyebrow}</p>
        <h1>{work.title}</h1>
        <div className="detail-grid">
          <section>
            <h2>{dict.detailSignalTitle}</h2>
            <p>{work.summary}</p>
          </section>
          <section>
            <h2>{dict.detailImpactTitle}</h2>
            <p>{work.impact}</p>
          </section>
          <section>
            <h2>{dict.detailExecutionTitle}</h2>
            <p>{dict.detailExecutionLead}</p>
          </section>
        </div>
        <Link className="primary-link" href="/contact">{dict.startBrief}</Link>
      </article>
    </main>
  );
}
