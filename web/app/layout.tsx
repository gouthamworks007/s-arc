import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { SavedProjectsProvider } from "@/lib/savedProjectsContext";
import { ProjectsProvider } from "@/lib/projectsContext";
import { AuthProvider } from "@/lib/authContext";
import CompareModal from "@/components/CompareModal";
import ShortlistFloatingBar from "@/components/ShortlistFloatingBar";

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
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://s-arc.pages.dev"),
  title: {
    default: "S-ARC — Southern Architecture | Turn Your Land Into A Home",
    template: "%s | S-ARC — Southern Architecture",
  },
  description:
    "A multi-vendor architectural marketplace connecting discerning homeowners with verified architects across South India. Curated designs, CAD packages, and verified professionals.",
  keywords: [
    "Architecture",
    "Southern Architecture",
    "Kerala Architecture",
    "Architectural Marketplace",
    "House Plans",
    "CAD Drawings",
    "Modern Tropical",
    "Courtyard House",
    "Tropical Architecture",
    "Eco Friendly Home Designs",
  ],
  authors: [{ name: "S-ARC Architectural Advisory" }],
  creator: "S-ARC",
  publisher: "S-ARC",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: "S-ARC — Southern Architecture | Turn Your Land Into A Home",
    description:
      "Curated tropical residential architecture, ready-to-build CAD packages, and verified architects across South India.",
    url: "https://s-arc.pages.dev",
    siteName: "S-ARC Architecture Platform",
    images: [
      {
        url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&h=630&q=80",
        width: 1200,
        height: 630,
        alt: "S-ARC Architectural Marketplace",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "S-ARC — Southern Architecture",
    description: "Curated architectural blueprints & verified architects across South India.",
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
  icons: {
    icon: "/logo.png",
    apple: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${cormorantGaramond.variable} ${spaceGrotesk.variable}`}>
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
              {children}
              <CompareModal />
              <ShortlistFloatingBar />
            </SavedProjectsProvider>
          </ProjectsProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
