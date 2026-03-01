import type { Metadata } from "next";
import './globals.css'
import { ReactNode } from "react";
import RootLayoutClient from "./layout-client";

export const metadata: Metadata = {
  // Default English metadata (will be the primary version)
  title: "Qibla Finder - Accurate Prayer Direction Locator",
  description: "Find your Qibla direction instantly using GPS and compass. Accurate Islamic prayer direction finder for Muslims worldwide. Get precise Qibla bearing from any location.",
  keywords: ["qibla", "qibla direction", "prayer direction", "Islamic", "compass", "geolocation", "muslim prayer", "kiblah", "qibla compass"],
  
  // This tells Google your site supports multiple languages
  alternates: {
    languages: {
      'en': 'https://qibla-df7.pages.dev',
      'ar': 'https://qibla-df7.pages.dev',
      'fr': 'https://qibla-df7.pages.dev',
      'x-default': 'https://qibla-df7.pages.dev',
    },
  },
  
  openGraph: {
    title: "Qibla Finder - Islamic Prayer Direction",
    description: "Find your Qibla direction using GPS and compass technology",
    url: "https://qibla-df7.pages.dev",
    type: "website",
    locale: "en_US",
  },
  
  twitter: {
    card: "summary_large_image",
    title: "Qibla Finder",
    description: "Find your Qibla direction instantly",
  },
  
  authors: [{ name: "Qibla Finder" }],
  creator: "Qibla Finder",
  
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=Playfair+Display:wght@400;700&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet" />
        
        {/* Schema.org markup for search engines */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              "name": "Qibla Finder",
              "alternateName": ["باحث القبلة", "Localisateur de Qibla"],
              "description": "Find your Qibla direction using GPS and compass. Islamic prayer direction finder for Muslims worldwide.",
              "url": "https://qibla-df7.pages.dev",
              "applicationCategory": "Utilities",
              "inLanguage": ["en", "ar", "fr"],
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD"
              },
              "author": {
                "@type": "Organization",
                "name": "Qibla Finder"
              }
            })
          }}
        />
        
        {/* Favicon */}
        <link rel="icon" href="/favicon.ico" />
        
        {/* Viewport for mobile */}
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        
        {/* Language meta tag */}
        <meta httpEquiv="content-language" content="en-US, ar-SA, fr-FR" />
      </head>
      <body>
        <RootLayoutClient>{children}</RootLayoutClient>
      </body>
    </html>
  );
}