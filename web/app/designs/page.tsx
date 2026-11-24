import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import DesignsClient from "./DesignsClient";

export const metadata: Metadata = {
  title: "Architectural House Plans & Blueprints | Kerala & South India",
  description:
    "Explore 50+ curated climate-responsive house designs, courtyard homes (Nalukettu), modern tropical villas, and KMBR 2019 compliant architectural blueprints with ready-to-download AutoCAD DWG & 3D BIM packages across Kerala, Tamil Nadu, and Karnataka.",
  keywords: [
    "Kerala house plans",
    "Contemporary house designs Kerala",
    "Courtyard house plans Kerala",
    "Nalukettu house plan",
    "4 BHK Kerala home design",
    "10 cents house plan Kerala",
    "KMBR 2019 setback compliant",
    "AutoCAD DWG drawings download",
    "Architectural blueprints South India",
    "Tropical residential architecture",
    "COA verified architect plans",
    "Exposed brick villa plans",
  ],
  alternates: {
    canonical: "https://southernarchitecture.in/designs",
  },
  openGraph: {
    title: "Architectural House Plans & Blueprints | Kerala & South India | S-ARC",
    description:
      "Curated residential blueprints, KMBR 2019 compliant CAD packages, and verified architect house plans across South India.",
    url: "https://southernarchitecture.in/designs",
    siteName: "S-ARC — Southern Architecture",
    images: [
      {
        url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&h=630&q=80",
        width: 1200,
        height: 630,
        alt: "S-ARC Architectural Designs Catalog",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Architectural House Plans & Blueprints | S-ARC",
    description: "Curated residential blueprints, KMBR 2019 compliant CAD packages across South India.",
    images: ["https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&h=630&q=80"],
  },
  other: {
    "geo.region": "IN-KL",
    "geo.placename": "Kerala, South India",
    "geo.position": "9.9312;76.2673",
    "ICBM": "9.9312, 76.2673",
  },
};

const collectionSchema = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  "name": "Architectural House Plans & Residential Blueprints",
  "description": "Curated catalog of climate-responsive house designs, courtyard homes, and KMBR 2019 compliant blueprints for Kerala and South India.",
  "url": "https://southernarchitecture.in/designs",
  "isPartOf": {
    "@type": "WebSite",
    "name": "S-ARC (Southern Architecture)",
    "url": "https://southernarchitecture.in"
  },
  "about": {
    "@type": "Thing",
    "name": "Residential Architectural Blueprints"
  }
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
      "name": "Architectural Designs",
      "item": "https://southernarchitecture.in/designs"
    }
  ]
};

export default function DesignsPage() {
  return (
    <main id="main-content" className="min-h-screen bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <Navbar />
      <DesignsClient />
      <Footer />
    </main>
  );
}
