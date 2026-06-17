import {
  behanceEmbeds,
  contactQa,
  locales,
  services,
  siteMeta,
  socialLinks,
  type LocalizedDictionary
} from "@seis/content";

type ContactHubProps = {
  dictionary: LocalizedDictionary;
};

export function ContactHub({ dictionary }: ContactHubProps) {
  const behanceLink = socialLinks.find((link) => link.id === "behance");
  const contactSignals = [
    {
      id: "services",
      value: services.length.toString().padStart(2, "0"),
      title: dictionary.servicesTitle,
      detail: dictionary.servicesEyebrow
    },
    {
      id: "behance",
      value: behanceEmbeds.length.toString().padStart(2, "0"),
      title: dictionary.behanceTitle,
      detail: dictionary.behanceEmbedEyebrow
    },
    {
      id: "qa",
      value: contactQa.length.toString().padStart(2, "0"),
      title: dictionary.qaTitle,
      detail: dictionary.qaEyebrow
    },
    {
      id: "languages",
      value: locales.length.toString().padStart(2, "0"),
      title: dictionary.languagesTitle,
      detail: dictionary.languageSelectorLabel
    }
  ];
  const directLinks = [
    {
      id: "email",
      href: `mailto:${siteMeta.email}`,
      title: siteMeta.email,
      detail: `${siteMeta.city}, ${siteMeta.country}`,
      external: false
    },
    behanceLink ? {
      id: behanceLink.id,
      href: behanceLink.href,
      title: behanceLink.label,
      detail: dictionary.behanceVisualsEyebrow,
      external: true
    } : null,
    {
      id: "brief",
      href: "#brief-form",
      title: dictionary.briefTitle,
      detail: dictionary.briefReady,
      external: false
    }
  ].filter(Boolean) as Array<{
    id: string;
    href: string;
    title: string;
    detail: string;
    external: boolean;
  }>;
  const quickLinks = [
    {
      id: "brief",
      href: "#brief-form",
      title: dictionary.briefTitle,
      external: false
    },
    {
      id: "qa",
      href: "#contact-qa",
      title: dictionary.qaTitle,
      external: false
    },
    {
      id: "social",
      href: "#contact-social",
      title: dictionary.socialTitle,
      external: false
    },
    behanceLink ? {
      id: "behance",
      href: behanceLink.href,
      title: dictionary.behanceTitle,
      external: true
    } : null
  ].filter(Boolean) as Array<{
    id: string;
    href: string;
    title: string;
    external: boolean;
  }>;

  return (
    <div className="contact-hub">
      <div className="contact-direct">
        <p className="eyebrow">{dictionary.contactDirectEyebrow}</p>
        <h3 className="contact-direct-title">{siteMeta.city}, {siteMeta.country}</h3>
        <p className="contact-direct-lead">{dictionary.briefReady}</p>
        <div className="contact-direct-actions">
          <a className="primary-link" href={`mailto:${siteMeta.email}`}>{siteMeta.email}</a>
          <a className="secondary-link" href="#brief-form">{dictionary.briefTitle}</a>
        </div>
        <nav className="contact-route-strip" aria-label={dictionary.contactTitle}>
          {quickLinks.map((item) => (
            <a
              className="contact-route-link"
              data-external={item.external ? "true" : "false"}
              href={item.href}
              key={item.id}
              rel={item.external ? "noopener noreferrer" : undefined}
              target={item.external ? "_blank" : undefined}
            >
              <span>{item.title}</span>
              {item.external ? <span className="external-link-mark" aria-hidden="true">↗</span> : null}
            </a>
          ))}
        </nav>
        <div className="contact-signal-strip" aria-label={dictionary.contactTitle}>
          {contactSignals.map((item) => (
            <article className="contact-signal-card" key={item.id}>
              <strong>{item.value}</strong>
              <span>{item.title}</span>
              <small>{item.detail}</small>
            </article>
          ))}
        </div>
        <ul className="contact-direct-grid" aria-label={dictionary.contactTitle}>
          {directLinks.map((item) => (
            <li key={item.id}>
              <a
                className="contact-direct-card"
                href={item.href}
                rel={item.external ? "noopener noreferrer" : undefined}
                target={item.external ? "_blank" : undefined}
                aria-label={item.external ? `${item.title}. ${dictionary.externalLinkLabel}` : item.title}
              >
                <strong>{item.title}</strong>
                <span>{item.detail}</span>
                {item.external ? <span className="sr-only">{dictionary.externalLinkLabel}</span> : null}
              </a>
            </li>
          ))}
        </ul>
        <div className="social-block" id="contact-social" aria-label={dictionary.socialTitle}>
          <h3>{dictionary.socialTitle}</h3>
          <div className="social-links">
            {socialLinks.map((link) => (
              <a
                className="social-icon-link"
                href={link.href}
                target={link.href.startsWith("mailto:") ? undefined : "_blank"}
                rel={link.href.startsWith("mailto:") ? undefined : "noopener noreferrer"}
                aria-label={link.href.startsWith("mailto:") ? link.label : `${link.label}. ${dictionary.externalLinkLabel}`}
                key={link.id}
              >
                <span className="social-mark" aria-hidden="true">{link.mark}</span>
                <span>{link.label}</span>
                {!link.href.startsWith("mailto:") ? <span className="sr-only">{dictionary.externalLinkLabel}</span> : null}
              </a>
            ))}
          </div>
        </div>
      </div>
      <section className="qa-panel" id="contact-qa" aria-labelledby="contact-qa-title">
        <p className="eyebrow">{dictionary.qaEyebrow}</p>
        <h3 id="contact-qa-title">{dictionary.qaTitle}</h3>
        <p>{dictionary.qaLead}</p>
        <ul className="qa-list">
          {contactQa.map((item, index) => (
            <li key={item.id}>
              <details className="qa-card" open={index === 0} name="contact-qa">
                <summary>
                  <span>{item.question}</span>
                  <span className="qa-toggle" aria-hidden="true" />
                </summary>
                <p>{item.answer}</p>
              </details>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
