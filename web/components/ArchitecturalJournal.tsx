"use client";

import React, { useState } from "react";
import Image from "next/image";
import { ArrowRight, Clock, Calendar, ChevronDown, BookOpen } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { JournalArticle } from "@/lib/types";

interface ArchitecturalJournalProps {
  articles: JournalArticle[];
}

export default function ArchitecturalJournal({ articles }: ArchitecturalJournalProps) {
  const [hoveredArticleId, setHoveredArticleId] = useState<string | null>(null);
  const [selectedMobileArticleId, setSelectedMobileArticleId] = useState<string | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<JournalArticle | null>(null);

  const getArticleTags = (category: string) => {
    const cat = category.toLowerCase();
    if (cat.includes("design")) {
      return ["Biophilic Living", "Monsoon Architecture", "Passive Courtyards"];
    }
    if (cat.includes("material")) {
      return ["Compressed Earth", "Lime Mortar", "Thermal Mass"];
    }
    return ["Adaptive Facades", "Spatial Zoning", "Climate Resilience"];
  };

  const handleCardClick = (article: JournalArticle) => {
    // On mobile / touch, clicking toggles expansion
    setSelectedMobileArticleId((prev) => (prev === article.id ? null : article.id));
  };

  const handleOpenModal = (article: JournalArticle, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSelectedArticle(article);
  };

  return (
    <section id="inspiration" className="py-20 sm:py-24 bg-warm-grey border-y border-warm-border">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 sm:mb-16 gap-6">
          <div>
            <div className="text-[11px] font-semibold tracking-widestExtra text-copper uppercase mb-3 font-sans">
              Architectural Journal
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-normal font-serif tracking-[-0.01em] text-charcoal mb-3">
              Ideas, Insights and Stories.
            </h2>
            <p className="text-[15px] leading-relaxed text-secondaryText max-w-xl font-light font-sans">
              Explore articles on design trends, materials, land planning and sustainable homes across South India.
            </p>
          </div>

          <a
            href="#explore"
            className="inline-flex items-center gap-2 text-[13px] font-medium text-charcoal hover:text-copper transition-colors group shrink-0"
          >
            <span>View All Articles</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
          </a>
        </div>

        {/* Retractable Articles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          {articles.map((article) => {
            const isExpanded =
              hoveredArticleId === article.id || selectedMobileArticleId === article.id;

            return (
              <article
                key={article.id}
                onMouseEnter={() => setHoveredArticleId(article.id)}
                onMouseLeave={() => setHoveredArticleId(null)}
                onClick={() => handleCardClick(article)}
                className={`group cursor-pointer bg-white border rounded-2xl p-5 sm:p-6 flex flex-col justify-between transition-all duration-300 relative ${
                  isExpanded
                    ? "shadow-card border-copper/50 ring-1 ring-copper/30"
                    : "shadow-subtle border-warm-border hover:border-charcoal/30 hover:shadow-card"
                }`}
              >
                <div>
                  {/* Article Image Container */}
                  <div className="relative aspect-[16/10] w-full overflow-hidden bg-charcoal mb-4 rounded-xl">
                    <Image
                      src={article.image}
                      alt={article.title}
                      fill
                      className={`object-cover transition-transform duration-700 ease-out ${
                        isExpanded ? "scale-105" : "group-hover:scale-105"
                      }`}
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />

                    {/* Category Pill */}
                    <div className="absolute top-3 left-3 bg-black/65 backdrop-blur-sm text-white text-[10px] tracking-widestExtra uppercase px-2.5 py-1 font-semibold font-sans rounded-full">
                      {article.category}
                    </div>

                    {/* Retractable Indicator Pill */}
                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-charcoal text-[11px] font-sans px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-sm border border-warm-border/50">
                      <span className="text-[10px] font-medium hidden sm:inline text-secondaryText">
                        {isExpanded ? "Open" : "Preview"}
                      </span>
                      <ChevronDown
                        className={`w-3.5 h-3.5 text-copper transition-transform duration-300 ${
                          isExpanded ? "rotate-180" : ""
                        }`}
                      />
                    </div>
                  </div>

                  {/* Date and Meta */}
                  <div className="flex items-center gap-2 text-[11px] text-mutedText font-mono uppercase tracking-wider mb-2">
                    <Calendar className="w-3 h-3 text-copper" />
                    <span>{article.date}</span>
                    <span>•</span>
                    <Clock className="w-3 h-3 text-copper" />
                    <span>{article.readTime}</span>
                  </div>

                  {/* Title */}
                  <h3 className="text-xl sm:text-[22px] font-normal font-serif leading-snug text-charcoal group-hover:text-copper transition-colors mb-2">
                    {article.title}
                  </h3>

                  {/* Retractable Animated Content Drawer */}
                  <AnimatePresence initial={false}>
                    {isExpanded && (
                      <motion.div
                        key={`drawer-${article.id}`}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
                        className="overflow-hidden"
                      >
                        <div className="pt-3 pb-2 border-t border-warm-border/80 mt-2 space-y-3">
                          <p className="text-[13px] leading-relaxed text-secondaryText font-light font-sans">
                            {article.summary}
                          </p>

                          {/* Quick Topic Badges */}
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {getArticleTags(article.category).map((tag, tIdx) => (
                              <span
                                key={tIdx}
                                className="px-2.5 py-0.5 rounded-full bg-warm-grey text-charcoal/80 text-[10px] font-sans font-medium border border-warm-border"
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>

                          {/* Read Full Article Button */}
                          <div className="pt-2">
                            <button
                              onClick={(e) => handleOpenModal(article, e)}
                              className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 bg-charcoal hover:bg-copper text-white text-xs font-medium font-sans tracking-wide rounded-full transition-colors shadow-sm group/btn"
                            >
                              <BookOpen className="w-3.5 h-3.5" />
                              <span>Read Full Article</span>
                              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover/btn:translate-x-1" />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Date and Read Time Row */}
                <div className="flex items-center justify-between pt-3 mt-3 border-t border-warm-border/80 text-[12px] text-mutedText font-sans">
                  <span className="text-[11px] text-mutedText">
                    {isExpanded ? (
                      <span className="text-copper font-medium">Expanded view</span>
                    ) : (
                      <span>Hover or tap to preview</span>
                    )}
                  </span>
                  <button
                    onClick={(e) => handleOpenModal(article, e)}
                    className="inline-flex items-center gap-1 text-charcoal group-hover:text-copper transition-colors"
                  >
                    <span className="text-xs font-medium font-sans">Full Story</span>
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                  </button>
                </div>
              </article>
            );
          })}
        </div>

      </div>

      {/* Article Detail Modal */}
      {selectedArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white max-w-2xl w-full p-6 sm:p-8 max-h-[90vh] overflow-y-auto rounded-3xl shadow-card">
            <div className="flex justify-between items-start mb-4">
              <span className="text-xs font-semibold text-copper uppercase tracking-widest font-mono">
                {selectedArticle.category}
              </span>
              <button
                onClick={() => setSelectedArticle(null)}
                className="text-mutedText hover:text-charcoal text-sm p-1 rounded-full hover:bg-warm-grey transition-colors"
              >
                ✕ Close
              </button>
            </div>
            <h2 className="text-2xl sm:text-3xl font-normal text-charcoal mb-3 font-serif">
              {selectedArticle.title}
            </h2>
            <div className="text-xs text-mutedText mb-6 font-sans">
              Published {selectedArticle.date} • {selectedArticle.readTime}
            </div>
            <div className="relative aspect-[16/9] w-full mb-6 rounded-2xl overflow-hidden bg-charcoal">
              <Image
                src={selectedArticle.image}
                alt={selectedArticle.title}
                fill
                className="object-cover"
              />
            </div>
            <p className="text-[15px] leading-relaxed text-secondaryText mb-4 font-sans font-light">
              {selectedArticle.summary}
            </p>
            <p className="text-[15px] leading-relaxed text-secondaryText font-sans font-light">
              Southern Indian residential architecture is undergoing a quiet revolution. As homeowners navigate rising thermal indices and urban density, architects are merging indigenous knowledge systems — like inward courtyards and terracotta jaalis — with contemporary engineering and passive bioclimatic modeling.
            </p>
          </div>
        </div>
      )}
    </section>
  );
}

