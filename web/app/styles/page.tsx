import type { Metadata } from "next";
import StylesClient from "./StylesClient";

export const metadata: Metadata = {
  title: "South Indian Architectural Styles — Courtyard, Tropical, Vernacular | S-ARC",
  description:
    "Explore climate-responsive architectural movements in South India: Traditional Kerala Courtyard homes (Nalukettu), Modern Tropical concrete, Exposed Brickwork, and Coastal Mediterranean villas.",
  keywords: [
    "South Indian architectural styles",
    "Kerala courtyard architecture",
    "Nalukettu house design",
    "Modern tropical home Kerala",
    "Exposed brick architecture South India",
    "Climate responsive residential design",
    "Passive cooling house plans Kerala",
    "Vernacular architecture Kerala",
  ],
  alternates: {
    canonical: "https://southernarchitecture.in/styles",
  },
  openGraph: {
    title: "South Indian Architectural Styles | S-ARC",
    description: "Explore climate-responsive architectural movements in South India: Courtyards, Tropical, Exposed Brick, and Vernacular.",
    url: "https://southernarchitecture.in/styles",
    siteName: "S-ARC — Southern Architecture",
    images: [
      {
        url: "https://southernarchitecture.in/og-image.png",
        width: 1200,
        height: 630,
        alt: "South Indian Architectural Styles Guide",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "South Indian Architectural Styles | S-ARC",
    description: "Courtyard homes, modern tropical villas, and vernacular architecture across South India.",
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
      "name": "Architectural Styles Guide",
      "item": "https://southernarchitecture.in/styles"
    }
  ]
};

export default function StylesPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <StylesClient />
    </>
  );
}
