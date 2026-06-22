import { portfolioStructuredData } from "../lib/seo";

function safeJsonLd(payload: unknown) {
  return JSON.stringify(payload).replace(/</g, "\\u003c");
}

export function StructuredData() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: safeJsonLd(portfolioStructuredData()) }}
    />
  );
}
