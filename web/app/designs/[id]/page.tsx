import type { Metadata } from "next";
import { FEATURED_PROJECTS } from "@/lib/data";
import ProjectDetailClient from "./ProjectDetailClient";

interface PageProps {
  params: { id: string };
}

export function generateStaticParams() {
  return FEATURED_PROJECTS.map((project) => ({
    id: project.id,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const project = FEATURED_PROJECTS.find(
    (p) => p.id === params.id || p.slug === params.id
  );

  if (!project) {
    return {
      title: "Architectural Blueprint | S-ARC",
      description: "Explore curated residential house plans in South India.",
    };
  }

  const centsLabel = project.plotSize || `${project.cents || 10} Cents`;
  const bedrooms = project.bedrooms || 3;
  const area = project.builtUpArea || "2,400 Sq.Ft";
  const architectName = project.architect?.name || "COA Verified Studio";
  const priceNumeric = parseInt(project.price.replace(/[^\d]/g, ""), 10) || 35000;

  const pageTitle = `${project.name} — ${bedrooms} BHK ${project.style} House Plan (${centsLabel})`;
  const pageDescription = `Download ready-to-build CAD & BIM blueprints for ${project.name} in ${project.location}. Features ${centsLabel} plot fit, ${area} built-up area, ${bedrooms} BHK, and KMBR 2019 statutory compliance designed by ${architectName}.`;

  return {
    title: pageTitle,
    description: pageDescription,
    keywords: [
      project.name,
      `${project.style} house plan kerala`,
      `${bedrooms} BHK house design kerala`,
      `${project.cents || 10} cents house plan`,
      "KMBR 2019 compliant house design",
      "AutoCAD DWG drawings download",
      "BIM 3D residential model",
      "South India house plans",
      architectName,
      project.location,
    ],
    alternates: {
      canonical: `https://southernarchitecture.in/designs/${project.id}`,
    },
    openGraph: {
      title: `${pageTitle} | S-ARC`,
      description: pageDescription,
      url: `https://southernarchitecture.in/designs/${project.id}`,
      siteName: "S-ARC — Southern Architecture",
      type: "article",
      images: [
        {
          url: project.image,
          width: 1200,
          height: 630,
          alt: `${project.name} — Architectural Plan Preview`,
        },
      ],
      locale: "en_IN",
    },
    twitter: {
      card: "summary_large_image",
      title: pageTitle,
      description: pageDescription,
      images: [project.image],
    },
    other: {
      "geo.region": "IN-KL",
      "geo.placename": project.location || "Kerala, India",
      "product:price:amount": String(priceNumeric),
      "product:price:currency": "INR",
      "product:availability": "in stock",
    },
  };
}

export default function ProjectDetailPage({ params }: PageProps) {
  const project = FEATURED_PROJECTS.find(
    (p) => p.id === params.id || p.slug === params.id
  );

  const priceNumeric = project
    ? parseInt(project.price.replace(/[^\d]/g, ""), 10) || 35000
    : 35000;

  const productSchema = project
    ? {
        "@context": "https://schema.org",
        "@type": ["Product", "CreativeWork"],
        "name": project.name,
        "description": project.description,
        "image": [project.image, ...(project.gallery || [])],
        "sku": `SARC-PLAN-${project.id.toUpperCase()}`,
        "category": "Architectural Plans & House Designs",
        "brand": {
          "@type": "Brand",
          "name": "S-ARC"
        },
        "creator": {
          "@type": "Person",
          "name": project.architect?.name || "Licensed Architect",
          "jobTitle": "Council of Architecture Licensed Architect",
          "worksFor": {
            "@type": "Organization",
            "name": project.architect?.studio || "S-ARC Partner Studio"
          }
        },
        "offers": {
          "@type": "Offer",
          "url": `https://southernarchitecture.in/designs/${project.id}`,
          "priceCurrency": "INR",
          "price": priceNumeric,
          "priceValidUntil": "2027-12-31",
          "itemCondition": "https://schema.org/NewCondition",
          "availability": "https://schema.org/InStock",
          "seller": {
            "@type": "Organization",
            "name": "S-ARC (Southern Architecture)"
          }
        }
      }
    : null;

  const breadcrumbSchema = project
    ? {
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
          },
          {
            "@type": "ListItem",
            "position": 3,
            "name": project.name,
            "item": `https://southernarchitecture.in/designs/${project.id}`
          }
        ]
      }
    : null;

  return (
    <>
      {productSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
        />
      )}
      {breadcrumbSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
        />
      )}
      <ProjectDetailClient />
    </>
  );
}
