import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, DM_Mono, DM_Sans } from "next/font/google";
import type { ReactNode } from "react";

import { siteMeta } from "@seis/content";

import { StructuredData } from "../components/structured-data";

import "./globals.css";

const display = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400", "500", "600"]
});

const sans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["300", "400", "500", "700"]
});

const mono = DM_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["300", "400"]
});

export const metadata: Metadata = {
  metadataBase: new URL(siteMeta.domain),
  title: {
    default: siteMeta.title,
    template: "%s | Emirhan Kudun"
  },
  description: siteMeta.description,
  authors: [{ name: siteMeta.author }],
  creator: siteMeta.author,
  publisher: siteMeta.author,
  keywords: [
    "Emirhan Kudun",
    "UI UX",
    "Behance portfolio",
    "drawing portfolio",
    "cinematic web",
    "brand design",
    "creative technology"
  ],
  icons: {
    icon: "/favicon.svg",
    apple: "/favicon.svg"
  },
  openGraph: {
    type: "website",
    url: siteMeta.domain,
    title: siteMeta.title,
    description: siteMeta.description,
    siteName: "Emirhan Kudun Portfolio",
    images: [
      {
        url: "/drawings/renk-11.jpg",
        alt: "Emirhan Kudun portfolio drawing preview"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: siteMeta.title,
    description: siteMeta.description,
    images: ["/drawings/renk-11.jpg"]
  },
  alternates: {
    canonical: "/",
    languages: {
      tr: "/?lang=tr",
      en: "/?lang=en",
      fr: "/?lang=fr",
      it: "/?lang=it",
      de: "/?lang=de"
    }
  }
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#d6b16f",
  colorScheme: "dark"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="tr" className={`${display.variable} ${sans.variable} ${mono.variable}`}>
      <body>
        <StructuredData />
        {children}
      </body>
    </html>
  );
}
