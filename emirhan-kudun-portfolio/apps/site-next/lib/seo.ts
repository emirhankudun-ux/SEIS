import type { Metadata } from "next";

import { behanceVisuals, contactQa, siteMeta, socialLinks, works } from "@seis/content";

const siteName = "Emirhan Kudun Portfolio";
const defaultImage = "/drawings/renk-11.jpg";

export function absoluteUrl(path = "/") {
  const base = siteMeta.domain.replace(/\/$/, "");
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${base}${normalizedPath}`;
}

type PageMetadataInput = {
  title: string;
  description: string;
  path: string;
  image?: string;
};

export function buildPageMetadata({
  title,
  description,
  path,
  image = defaultImage
}: PageMetadataInput): Metadata {
  const url = absoluteUrl(path);

  return {
    title,
    description,
    alternates: {
      canonical: path
    },
    openGraph: {
      type: "website",
      url,
      title: `${title} | ${siteMeta.author}`,
      description,
      siteName,
      images: [
        {
          url: image,
          alt: `${siteMeta.author} portfolio preview`
        }
      ]
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | ${siteMeta.author}`,
      description,
      images: [image]
    }
  };
}

export function portfolioStructuredData() {
  const base = siteMeta.domain.replace(/\/$/, "");
  const sameAs = socialLinks
    .map((link) => link.href)
    .filter((href) => href.startsWith("https://"));
  const featuredBehance = behanceVisuals.filter((item) => item.featured).slice(0, 6);
  const faqItems = contactQa.slice(0, 8);

  return [
    {
      "@context": "https://schema.org",
      "@type": "Person",
      name: siteMeta.author,
      url: base,
      email: siteMeta.email,
      sameAs,
      address: {
        "@type": "PostalAddress",
        addressLocality: siteMeta.city,
        addressCountry: siteMeta.country
      },
      jobTitle: "UI/UX designer and creative technologist",
      knowsAbout: [
        "UI/UX design",
        "Brand systems",
        "Editorial design",
        "Three.js",
        "Creative technology",
        "Frontend engineering"
      ]
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: siteName,
      url: base,
      description: siteMeta.description,
      inLanguage: ["tr", "en", "fr", "it", "de"],
      publisher: {
        "@type": "Person",
        name: siteMeta.author
      }
    },
    {
      "@context": "https://schema.org",
      "@type": "CreativeWork",
      name: siteMeta.title,
      url: base,
      description: siteMeta.description,
      creator: {
        "@type": "Person",
        name: siteMeta.author
      },
      image: featuredBehance.map((item) => item.image),
      genre: ["Portfolio", "UI/UX", "Branding", "Drawing", "Cinematic web"]
    },
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: "Selected Behance and portfolio works",
      url: absoluteUrl("/portfolio"),
      numberOfItems: featuredBehance.length + works.length,
      itemListElement: [
        ...featuredBehance.map((item, index) => ({
          "@type": "ListItem",
          position: index + 1,
          url: item.href,
          name: item.title,
          item: {
            "@type": "CreativeWork",
            name: item.title,
            url: item.href,
            image: item.image,
            genre: item.category
          }
        })),
        ...works.map((work, index) => ({
          "@type": "ListItem",
          position: featuredBehance.length + index + 1,
          url: absoluteUrl(`/portfolio/${work.id}`),
          name: work.title,
          item: {
            "@type": "CreativeWork",
            name: work.title,
            url: absoluteUrl(`/portfolio/${work.id}`),
            genre: work.tag,
            abstract: work.summary
          }
        }))
      ]
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqItems.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: item.answer
        }
      }))
    }
  ];
}
