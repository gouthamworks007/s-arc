import type { Metadata } from "next";
import ArchitectsClient from "./ArchitectsClient";

export const metadata: Metadata = {
  title: "Verified Architects & Design Studios in Kerala & South India | S-ARC",
  description:
    "Connect with Council of Architecture (COA) licensed architects and vetted freelance residential designers across Kochi, Trivandrum, Calicut, Thrissur, and Bangalore. Explore curated portfolios and commission custom turnkey home plans.",
  keywords: [
    "Kerala architects",
    "COA verified architects",
    "Best architects in Kochi",
    "Architects in Trivandrum",
    "Calicut residential architects",
    "Freelance architects Kerala",
    "Architectural studios South India",
    "Tropical home architects Kerala",
    "Nalukettu restoration architects",
    "KMBR building permit architects",
  ],
  alternates: {
    canonical: "https://southernarchitecture.in/architects",
  },
  openGraph: {
    title: "Verified Architects & Design Studios in Kerala & South India | S-ARC",
    description:
      "Connect with COA licensed architects and vetted freelance residential designers across Kerala and South India.",
    url: "https://southernarchitecture.in/architects",
    siteName: "S-ARC — Southern Architecture",
    images: [
      {
        url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=1200&h=630&q=80",
        width: 1200,
        height: 630,
        alt: "S-ARC Verified Architects Directory",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Verified Architects in Kerala & South India | S-ARC",
    description: "Connect with COA licensed architects across Kochi, Trivandrum, Calicut, and Thrissur.",
    images: ["https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=1200&h=630&q=80"],
  },
  other: {
    "geo.region": "IN-KL",
    "geo.placename": "Kochi, Trivandrum, Calicut, Kerala, South India",
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
      "name": "Architects Directory",
      "item": "https://southernarchitecture.in/architects"
    }
  ]
};

const directorySchema = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  "name": "Verified Architects & Studios Directory in South India",
  "description": "Council of Architecture (COA) qualified architects and vetted freelance designers registered on S-ARC.",
  "url": "https://southernarchitecture.in/architects",
  "numberOfItems": 6,
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "item": {
        "@type": "Person",
        "name": "Ar. Nikhil Rajan",
        "jobTitle": "Principal Architect",
        "worksFor": {
          "@type": "Organization",
          "name": "Studio Vayu"
        },
        "address": {
          "@type": "PostalAddress",
          "addressLocality": "Kochi",
          "addressRegion": "Kerala",
          "addressCountry": "IN"
        }
      }
    },
    {
      "@type": "ListItem",
      "position": 2,
      "item": {
        "@type": "Person",
        "name": "Ar. Meera Suresh",
        "jobTitle": "Founder & Principal Architect",
        "worksFor": {
          "@type": "Organization",
          "name": "Thatch & Clay Studio"
        },
        "address": {
          "@type": "PostalAddress",
          "addressLocality": "Trivandrum",
          "addressRegion": "Kerala",
          "addressCountry": "IN"
        }
      }
    },
    {
      "@type": "ListItem",
      "position": 3,
      "item": {
        "@type": "Person",
        "name": "Ar. Jithin Varghese",
        "jobTitle": "Lead Architect",
        "worksFor": {
          "@type": "Organization",
          "name": "Terra Atelier"
        },
        "address": {
          "@type": "PostalAddress",
          "addressLocality": "Calicut",
          "addressRegion": "Kerala",
          "addressCountry": "IN"
        }
      }
    }
  ]
};

export default function ArchitectsPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(directorySchema) }}
      />
      <ArchitectsClient />
    </>
  );
}
