"use client";

import React, { useState } from "react";
import Image from "next/image";
import { ArrowRight, Clock, Calendar, BookOpen, Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { JournalArticle } from "@/lib/types";

interface ArchitecturalJournalProps {
  articles: JournalArticle[];
}

export default function ArchitecturalJournal({ articles }: ArchitecturalJournalProps) {
  const [activeArticleId, setActiveArticleId] = useState<string>(
    articles[0]?.id || "article-1"
  );
  const [selectedArticle, setSelectedArticle] = useState<JournalArticle | null>(null);

  const getArticleTags = (category: string) => {
    const cat = category.toLowerCase();
    if (cat.includes("design")) {
      return ["Biophilic Living", "Monsoon Architecture", "Courtyards"];
    }
    if (cat.includes("material")) {
      return ["Compressed Earth", "Lime Mortar", "Thermal Mass"];
    }
    return ["Adaptive Facades", "Spatial Zoning", "Climate Resilience"];
  };

  const handleOpenModal = (article: JournalArticle, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSelectedArticle(article);
  };

  return (
    <section id="inspiration" className="py-12 sm:py-20 md:py-24 bg-warm-grey border-y border-warm-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 sm:mb-12 gap-4 sm:gap-6">
          <div>
            <div className="text-[10px] sm:text-[11px] font-semibold tracking-widestExtra text-copper uppercase mb-2 sm:mb-3 font-sans">
              Architectural Journal
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-[40px] font-normal font-serif tracking-[-0.01em] text-charcoal mb-2 sm:mb-3">
              Ideas, Insights and Stories.
            </h2>
            <p className="text-xs sm:text-[15px] leading-relaxed text-secondaryText max-w-xl font-light font-sans">
              Explore curated articles on South Indian design philosophy, vernacular materials, and sustainable construction.
            </p>
          </div>

          <a
            href="#explore"
            className="inline-flex items-center gap-1.5 sm:gap-2 text-xs sm:text-[13px] font-medium text-charcoal hover:text-copper transition-colors group shrink-0"
          >
            <span>View All Articles</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
          </a>
        </div>

        {/* Retractable Expanding Panels (Compact & Small on Mobile) */}
        <div className="flex flex-row gap-2 sm:gap-4 md:gap-5 items-stretch w-full h-[320px] sm:h-[390px] md:h-[450px]">
          {articles.map((article) => {
            const isExpanded = activeArticleId === article.id;

            return (
              <div
                key={article.id}
                onMouseEnter={() => setActiveArticleId(article.id)}
                onClick={() => setActiveArticleId(article.id)}
                className={`relative rounded-xl sm:rounded-2xl overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] select-none ${
                  isExpanded
                    ? "flex-[5] sm:flex-[3.2] bg-white border border-copper/50 shadow-card"
                    : "flex-1 sm:flex-1 bg-charcoal border border-warm-border/60 hover:border-charcoal/50 shadow-subtle cursor-pointer min-w-[36px] sm:min-w-[50px] md:min-w-0"
                }`}
              >
                {/* EXPANDED VIEW: Compact Side-by-Side on all screens */}
                {isExpanded ? (
                  <motion.div
                    key={`expanded-${article.id}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex flex-row h-full w-full p-2.5 sm:p-4 md:p-6 gap-2.5 sm:gap-4 md:gap-6 items-stretch"
                  >
                    {/* Left Column: Image with Badge */}
                    <div className="w-[38%] sm:w-[40%] md:w-[42%] relative h-full rounded-lg sm:rounded-xl overflow-hidden bg-charcoal shrink-0">
                      <Image
                        src={article.image}
                        alt={article.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 40vw, 35vw"
                      />
                      <div className="absolute top-2 left-2 sm:top-3 sm:left-3 bg-black/75 backdrop-blur-sm text-white text-[8px] sm:text-[10px] tracking-widestExtra uppercase px-2 py-0.5 sm:px-2.5 sm:py-1 font-semibold rounded-full font-sans truncate max-w-[90%]">
                        {article.category}
                      </div>

                      <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-sm text-white/90 text-[9px] font-mono px-2 py-0.5 rounded-full hidden sm:block">
                        Active Article
                      </div>
                    </div>

                    {/* Right Column: Editorial Details */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5 sm:py-1 md:py-2">
                      <div className="min-w-0">
                        {/* Meta */}
                        <div className="flex items-center gap-1.5 sm:gap-2 text-[9px] sm:text-[11px] text-mutedText font-mono uppercase tracking-wider mb-1 sm:mb-2">
                          <span className="truncate">{article.date}</span>
                          <span>•</span>
                          <span className="truncate">{article.readTime}</span>
                        </div>

                        {/* Title */}
                        <h3 className="text-sm sm:text-lg md:text-2xl font-normal font-serif leading-snug text-charcoal mb-1.5 sm:mb-2 line-clamp-2 sm:line-clamp-2">
                          {article.title}
                        </h3>

                        {/* Summary */}
                        <p className="text-[11px] sm:text-xs md:text-[13px] leading-relaxed text-secondaryText font-light font-sans line-clamp-2 sm:line-clamp-3 md:line-clamp-4 mb-2 sm:mb-3">
                          {article.summary}
                        </p>

                        {/* Topic Tags */}
                        <div className="flex flex-wrap gap-1 mb-2 sm:mb-3">
                          {getArticleTags(article.category).slice(0, 2).map((tag, tIdx) => (
                            <span
                              key={tIdx}
                              className="px-2 py-0.5 rounded-full bg-warm-grey text-charcoal/80 text-[9px] sm:text-[10px] font-sans font-medium border border-warm-border"
                            >
                              #{tag}
                            </span>
                          ))}
                          <span className="hidden md:inline px-2 py-0.5 rounded-full bg-warm-grey text-charcoal/80 text-[10px] font-sans font-medium border border-warm-border">
                            #{getArticleTags(article.category)[2]}
                          </span>
                        </div>
                      </div>

                      {/* Bottom CTA Bar */}
                      <div className="pt-2 border-t border-warm-border/80 flex items-center justify-between gap-2">
                        <button
                          onClick={(e) => handleOpenModal(article, e)}
                          className="inline-flex items-center gap-1.5 py-1.5 px-3 sm:py-2 sm:px-4 bg-copper hover:bg-copper-hover text-white text-[10px] sm:text-xs font-medium font-sans tracking-wide rounded-full transition-all shadow-subtle group/btn shrink-0"
                        >
                          <BookOpen className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                          <span>Read Story</span>
                          <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 transition-transform group-hover/btn:translate-x-1" />
                        </button>

                        <span className="text-[10px] text-mutedText font-sans hidden sm:inline truncate">
                          Tap other to switch
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  /* RETRACTED / COLLAPSED VIEW: Slim & Compact tab on mobile */
                  <div className="relative w-full h-full cursor-pointer group flex flex-col items-center justify-between p-2 sm:p-3">
                    {/* Background photo */}
                    <Image
                      src={article.image}
                      alt={article.title}
                      fill
                      className="object-cover filter brightness-[0.65] group-hover:brightness-[0.8] group-hover:scale-105 transition-all duration-700"
                      sizes="(max-width: 640px) 15vw, 20vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/30 pointer-events-none" />

                    {/* Top: Plus Icon */}
                    <div className="relative z-10 w-full flex justify-center sm:justify-between items-center">
                      <span className="hidden sm:inline bg-white/20 backdrop-blur-md text-white text-[9px] tracking-widestExtra uppercase px-2 py-0.5 rounded-full font-semibold truncate max-w-[80px]">
                        {article.category}
                      </span>
                      <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-white/25 backdrop-blur-md text-white flex items-center justify-center text-[10px] sm:text-xs font-bold transition-transform group-hover:scale-110">
                        <Plus className="w-3 h-3" />
                      </span>
                    </div>

                    {/* Middle on mobile: Vertical Category name */}
                    <div className="relative z-10 sm:hidden my-auto">
                      <span className="[writing-mode:vertical-rl] rotate-180 text-[9px] font-mono tracking-widest uppercase text-white/80 font-medium truncate max-h-[140px]">
                        {article.category}
                      </span>
                    </div>

                    {/* Bottom: Title & Hint (desktop/tablet) */}
                    <div className="relative z-10 w-full hidden sm:block">
                      <div className="text-[10px] text-white/70 font-mono mb-1 truncate">
                        {article.date}
                      </div>
                      <h4 className="text-xs sm:text-sm font-serif text-white font-normal line-clamp-2 leading-snug group-hover:text-copper-light transition-colors">
                        {article.title}
                      </h4>
                      <div className="mt-1.5 text-[9px] font-sans text-copper-light uppercase tracking-wider font-semibold flex items-center gap-1 opacity-80 group-hover:opacity-100">
                        <span>Open</span>
                        <ArrowRight className="w-2.5 h-2.5 transition-transform group-hover:translate-x-0.5" />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>

      {/* Article Detail Modal */}
      {selectedArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white max-w-2xl w-full p-5 sm:p-8 max-h-[90vh] overflow-y-auto rounded-2xl sm:rounded-3xl shadow-card">
            <div className="flex justify-between items-start mb-3 sm:mb-4">
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
            <h2 className="text-xl sm:text-3xl font-normal text-charcoal mb-2 sm:mb-3 font-serif">
              {selectedArticle.title}
            </h2>
            <div className="text-xs text-mutedText mb-4 sm:mb-6 font-sans">
              Published {selectedArticle.date} • {selectedArticle.readTime}
            </div>
            <div className="relative aspect-[16/9] w-full mb-4 sm:mb-6 rounded-xl sm:rounded-2xl overflow-hidden bg-charcoal">
              <Image
                src={selectedArticle.image}
                alt={selectedArticle.title}
                fill
                className="object-cover"
              />
            </div>
            <p className="text-xs sm:text-[15px] leading-relaxed text-secondaryText mb-3 sm:mb-4 font-sans font-light">
              {selectedArticle.summary}
            </p>
            <p className="text-xs sm:text-[15px] leading-relaxed text-secondaryText font-sans font-light">
              Southern Indian residential architecture is undergoing a quiet revolution. As homeowners navigate rising thermal indices and urban density, architects are merging indigenous knowledge systems — like inward courtyards and terracotta jaalis — with contemporary engineering and passive bioclimatic modeling.
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
