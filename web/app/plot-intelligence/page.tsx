import type { Metadata } from "next";
import PlotMyLandPage from "../plot-my-land/page";

export const metadata: Metadata = {
  title: "Plot Intelligence & KMBR Setback Analyzer | S-ARC Kerala",
  description:
    "Interactive satellite GIS plot boundary mapper for Kerala lands. Calculate Cent-to-SqFt conversions, road access widths, and KMBR 2019 mandatory setbacks automatically.",
  keywords: [
    "Kerala plot calculator",
    "Cent to SqFt converter Kerala",
    "KMBR 2019 setback rules",
    "Plot boundary map Kerala",
    "Land feasibility residential plan",
    "Kerala building permit setbacks",
    "Frontage and depth calculator",
    "10 cent plot dimension Kerala",
  ],
  alternates: {
    canonical: "https://southernarchitecture.in/plot-intelligence",
  },
  openGraph: {
    title: "Plot Intelligence & KMBR Setback Analyzer | S-ARC Kerala",
    description: "Map your plot boundary, calculate Cents to Sq.Ft, and check KMBR 2019 setback compliance instantly.",
    url: "https://southernarchitecture.in/plot-intelligence",
    siteName: "S-ARC — Southern Architecture",
    images: [
      {
        url: "https://southernarchitecture.in/og-image.png",
        width: 1200,
        height: 630,
        alt: "S-ARC Plot Intelligence Tool",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Plot Intelligence & KMBR Setback Analyzer | S-ARC",
    description: "Map your plot boundary, calculate Cents to Sq.Ft, and check KMBR 2019 setback compliance instantly.",
    images: ["https://southernarchitecture.in/og-image.png"],
  },
  other: {
    "geo.region": "IN-KL",
    "geo.placename": "Kerala, South India",
    "geo.position": "9.9312;76.2673",
    "ICBM": "9.9312, 76.2673",
  },
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": "https://southernarchitecture.in"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Plot Intelligence & KMBR Analyzer",
      "item": "https://southernarchitecture.in/plot-intelligence"
    }
  ]
};

export default function PlotIntelligencePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <PlotMyLandPage />
    </>
  );
}
