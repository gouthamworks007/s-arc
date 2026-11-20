"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import SmartSearch from "@/components/SmartSearch";
import NetworkCarousel from "@/components/NetworkCarousel";
import ArchitecturalJournal from "@/components/ArchitecturalJournal";
import PreFooterBanner from "@/components/PreFooterBanner";
import Footer from "@/components/Footer";

import SellerModal from "@/components/SellerModal";
import StoryModal from "@/components/StoryModal";

import { JOURNAL_ARTICLES } from "@/lib/data";

export default function HomePage() {
  const router = useRouter();
  const [isSellerModalOpen, setIsSellerModalOpen] = useState(false);
  const [isStoryModalOpen, setIsStoryModalOpen] = useState(false);

  // Transfer search parameters seamlessly to the /designs page
  const handleSearch = (params: {
    location: string;
    plotSize: string;
    shape: string;
    direction: string;
  }) => {
    const query = new URLSearchParams();
    if (params.location) query.set("location", params.location);
    if (params.plotSize) query.set("plot", params.plotSize);
    if (params.shape) query.set("shape", params.shape);
    if (params.direction) query.set("direction", params.direction);
    router.push(`/designs?${query.toString()}`);
  };

  const handleOpenProject = (id: string) => {
    router.push(`/designs?project=${id}`);
  };

  return (
    <main id="main-content" className="min-h-screen bg-white">
      {/* 1. Header & Navigation */}
      <Navbar
        onOpenSellerModal={() => setIsSellerModalOpen(true)}
        onOpenSearch={() => {
          const el = document.getElementById("search-section");
          if (el) el.scrollIntoView({ behavior: "smooth" });
        }}
      />

      {/* 2. Hero Section */}
      <Hero
        onWatchStory={() => setIsStoryModalOpen(true)}
        onExploreClick={() => router.push("/designs")}
        onProjectClick={handleOpenProject}
      />

      {/* 3. Smart Design Search (What Are We Building On?) */}
      <SmartSearch onSearch={handleSearch} />

      {/* 4. Explore the S-ARC Network Carousel */}
      <NetworkCarousel />

      {/* 5. Architectural Journal (House Typologies) */}
      <ArchitecturalJournal articles={JOURNAL_ARTICLES} />

      {/* 10. Pre-Footer Banner (Design. Build. Belong.) */}
      <PreFooterBanner />

      {/* 11. Footer */}
      <Footer onOpenSellerModal={() => setIsSellerModalOpen(true)} />

      {/* Modals */}
      <SellerModal
        isOpen={isSellerModalOpen}
        onClose={() => setIsSellerModalOpen(false)}
      />

      <StoryModal
        isOpen={isStoryModalOpen}
        onClose={() => setIsStoryModalOpen(false)}
      />
    </main>
  );
}
