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
  title: "S-ARC — Southern Architecture | Turn Your Land Into A Home",
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
  ],
  icons: {
    icon: "/logo.png",
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
