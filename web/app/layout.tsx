import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { SavedProjectsProvider } from "@/lib/savedProjectsContext";
import { ProjectsProvider } from "@/lib/projectsContext";
import { AuthProvider } from "@/lib/authContext";
import CompareModal from "@/components/CompareModal";
import ShortlistFloatingBar from "@/components/ShortlistFloatingBar";
import MobileBottomNav from "@/components/MobileBottomNav";

// Header Font: Cormorant Garamond
const cormorantGaramond = localFont({
  src: [
    {
      path: "./fonts/static/CormorantGaramond-Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/static/CormorantGaramond-Italic.ttf",
      weight: "400",
      style: "italic",
    },
    {
      path: "./fonts/static/CormorantGaramond-Medium.ttf",
      weight: "500",
      style: "normal",
    },
    {
      path: "./fonts/static/CormorantGaramond-MediumItalic.ttf",
      weight: "500",
      style: "italic",
    },
    {
      path: "./fonts/static/CormorantGaramond-SemiBold.ttf",
      weight: "600",
      style: "normal",
    },
    {
      path: "./fonts/static/CormorantGaramond-Bold.ttf",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-serif",
  display: "swap",
});

// Body Font: Space Grotesk
const spaceGrotesk = localFont({
  src: [
    {
      path: "./fonts/static/SpaceGrotesk-Light.ttf",
      weight: "300",
      style: "normal",
    },
    {
      path: "./fonts/static/SpaceGrotesk-Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/static/SpaceGrotesk-Medium.ttf",
      weight: "500",
      style: "normal",
    },
    {
      path: "./fonts/static/SpaceGrotesk-SemiBold.ttf",
      weight: "600",
      style: "normal",
    },
    {
      path: "./fonts/static/SpaceGrotesk-Bold.ttf",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://southernarchitecture.in"),
  title: {
    default: "S-ARC — Southern Architecture | Turn Your Land Into A Home",
    template: "%s | S-ARC — Southern Architecture",
  },
  description:
    "South India's premier multi-vendor architectural marketplace connecting discerning landowners and homeowners with verified COA architects across Kerala, Tamil Nadu, and Karnataka. Download KMBR-compliant CAD blueprints, turnkey house designs, and BIM packages.",
  keywords: [
    "Architecture",
    "Southern Architecture",
    "Kerala Architecture",
    "Architectural Marketplace",
    "House Plans Kerala",
    "Kerala House Design 4 BHK",
    "Courtyard House Plans Kerala",
    "KMBR 2019 Compliant Plans",
    "CAD Drawings Download DWG",
    "Modern Tropical Architecture",
    "Exposed Brick Villa Kerala",
    "Traditional Nalukettu House",
    "COA Verified Architects",
    "Plot Intelligence Kerala",
    "Cent to SqFt Converter Kerala",
    "Eco Friendly Home Designs South India",
    "Architects in Kochi",
    "Architects in Trivandrum",
    "Architects in Bangalore"
  ],
  authors: [{ name: "S-ARC Architectural Advisory", url: "https://southernarchitecture.in" }],
  creator: "S-ARC (Southern Architecture)",
  publisher: "S-ARC Platform",
  alternates: {
    canonical: "https://southernarchitecture.in",
    languages: {
      "en-IN": "https://southernarchitecture.in",
      "x-default": "https://southernarchitecture.in",
    },
  },
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: "S-ARC — Southern Architecture | Turn Your Land Into A Home",
    description:
      "Curated tropical residential architecture, ready-to-build CAD packages, and verified Council of Architecture (COA) licensed studios across South India.",
    url: "https://southernarchitecture.in",
    siteName: "S-ARC — Southern Architecture",
    images: [
      {
        url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&h=630&q=80",
        width: 1200,
        height: 630,
        alt: "S-ARC Architectural Marketplace — South Indian Residential Designs",
      },
    ],
    locale: "en_IN",
    alternateLocale: ["en_US"],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "S-ARC — Southern Architecture",
    description: "Curated architectural blueprints & verified architects across Kerala and South India.",
    images: ["https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&h=630&q=80"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  other: {
    "geo.region": "IN-KL",
    "geo.placename": "Kochi, Kerala, South India",
    "geo.position": "9.9312;76.2673",
    "ICBM": "9.9312, 76.2673",
    "DC.title": "S-ARC — Southern Architecture",
    "DC.coverage": "Kerala, South India, Tamil Nadu, Karnataka, Kochi, Bangalore, Trivandrum, Calicut",
    "classification": "Architecture, House Plans, Civil Engineering, CAD Drawings, Real Estate Planning",
  },
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
};

const structuredDataOrganization = {
  "@context": "https://schema.org",
  "@type": ["Organization", "ProfessionalService", "LocalBusiness"],
  "name": "S-ARC (Southern Architecture)",
  "alternateName": ["Southern Architecture", "S-ARC Platform", "S-ARC Kerala"],
  "url": "https://southernarchitecture.in",
  "logo": "https://southernarchitecture.in/logo.png",
  "image": "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&h=630&q=80",
  "description": "South India's premier curated architectural marketplace connecting discerning landowners and homeowners with verified Council of Architecture (COA) licensed architects. Curated tropical residential blueprints, turnkey CAD drawings, and KMBR 2019 compliance verifications.",
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "Kochi",
    "addressRegion": "Kerala",
    "postalCode": "682001",
    "addressCountry": "IN"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": 9.9312,
    "longitude": 76.2673
  },
  "areaServed": [
    { "@type": "State", "name": "Kerala" },
    { "@type": "State", "name": "Tamil Nadu" },
    { "@type": "State", "name": "Karnataka" },
    { "@type": "State", "name": "Telangana" },
    { "@type": "State", "name": "Andhra Pradesh" },
    { "@type": "Country", "name": "India" }
  ],
  "priceRange": "₹₹₹",
  "currenciesAccepted": "INR",
  "paymentAccepted": "UPI, Net Banking, Credit Card, Escrow",
  "knowsAbout": [
    "Kerala Municipality Building Rules (KMBR 2019)",
    "Tropical Residential Architecture",
    "Courtyard House Plans (Nalukettu)",
    "BIM 3D Architectural Modeling",
    "CAD Construction Drawings (DWG)",
    "Vastu Vidya Architecture",
    "Cent to Square Feet Land Conversion"
  ]
};

const structuredDataWebsite = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "S-ARC (Southern Architecture)",
  "alternateName": ["Southern Architecture", "S-ARC Platform"],
  "url": "https://southernarchitecture.in",
  "potentialAction": {
    "@type": "SearchAction",
    "target": {
      "@type": "EntryPoint",
      "urlTemplate": "https://southernarchitecture.in/designs?q={search_term_string}"
    },
    "query-input": "required name=search_term_string"
  }
};

const structuredDataFAQ = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Are house designs on S-ARC compliant with Kerala Municipality Building Rules (KMBR 2019)?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes. Every architectural blueprint published on S-ARC is vetted against statutory setback rules, coverage limits, Floor Space Index (FSI/FAR), and access width mandates stipulated in KMBR 2019 and KPBR (Panchayat Building Rules)."
      }
    },
    {
      "@type": "Question",
      "name": "What deliverable files are included in an S-ARC blueprint package?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Deliverable tiers include Municipal Permit Sets (sanction drawings, site plans, elevations), Executive Builder Sets (detailed structural drawings, electrical & plumbing schematics), and Turnkey 3D BIM + Bill of Quantities (BOQ) with AutoCAD DWG files."
      }
    },
    {
      "@type": "Question",
      "name": "How does S-ARC verify architects on the platform?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "S-ARC enforces a strict two-tier verification system: a Blue Tick is awarded exclusively to statutory Council of Architecture (COA) licensed architects, and a Grey Tick is granted to independent freelance designers after rigorous portfolio audit and activity analysis by platform administrators."
      }
    },
    {
      "@type": "Question",
      "name": "How is plot size measured in Kerala (Cents to Square Feet)?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "In Kerala, land is traditionally measured in Cents, where 1 Cent equals 435.6 square feet (approximately 40.468 square meters). S-ARC designs are categorised by Cent sizes (e.g., under 10 Cents, 10–15 Cents, and above 15 Cents) with automated dimension calculators."
      }
    }
  ]
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${cormorantGaramond.variable} ${spaceGrotesk.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredDataOrganization) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredDataWebsite) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredDataFAQ) }}
        />
      </head>
      <body className="bg-white text-charcoal font-sans font-light antialiased selection:bg-copper selection:text-white">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999] focus:px-4 focus:py-2.5 focus:bg-charcoal focus:text-white focus:rounded-xl focus:shadow-floating focus:border focus:border-copper font-sans text-xs font-medium transition-all"
        >
          Skip to main content
        </a>
        <AuthProvider>
          <ProjectsProvider>
            <SavedProjectsProvider>
              <div className="pb-16 md:pb-0">
                {children}
              </div>
              <CompareModal />
              <ShortlistFloatingBar />
              <MobileBottomNav />
            </SavedProjectsProvider>
          </ProjectsProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
