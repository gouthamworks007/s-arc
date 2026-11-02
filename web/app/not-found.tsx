import React from "react";
import Link from "next/link";
import { ArrowLeft, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-stone-50 flex flex-col justify-center items-center px-6 text-center">
      <div className="max-w-md w-full space-y-6">
        <span className="text-[11px] tracking-widest uppercase text-copper font-medium font-sans">
          Error 404 • Not Found
        </span>
        <h1 className="text-4xl sm:text-5xl font-serif text-charcoal font-normal">
          Page Beyond the Plot Boundary.
        </h1>
        <p className="text-sm text-secondaryText font-sans leading-relaxed">
          The architectural layout or document you are seeking has been archived or does not exist.
        </p>
        <div className="pt-4 flex items-center justify-center gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-3 bg-charcoal text-white rounded-xl text-xs font-sans hover:bg-copper transition-colors"
          >
            <Home className="w-4 h-4" />
            <span>Return to S-ARC Home</span>
          </Link>
          <Link
            href="/designs"
            className="inline-flex items-center gap-2 px-5 py-3 border border-warm-border text-charcoal rounded-xl text-xs font-sans hover:bg-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Explore Designs</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

