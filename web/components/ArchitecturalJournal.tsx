"use client";

import React, { useState } from "react";
import Image from "next/image";
import { ArrowRight, Clock, Calendar, BookOpen, Plus, Sparkles } from "lucide-react";
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
    <section id="inspiration" className="py-20 sm:py-24 bg-warm-grey border-y border-warm-border">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 sm:mb-12 gap-6">
          <div>
            <div className="text-[11px] font-semibold tracking-widestExtra text-copper uppercase mb-3 font-sans">
              Architectural Journal
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-normal font-serif tracking-[-0.01em] text-charcoal mb-3">
              Ideas, Insights and Stories.
            </h2>
            <p className="text-[15px] leading-relaxed text-secondaryText max-w-xl font-light font-sans">
              Explore curated articles on South Indian design philosophy, vernacular materials, and sustainable construction.
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

        {/* Retractable Expanding Panels (In a Line Side by Side) */}
        <div className="flex flex-row gap-3 sm:gap-5 items-stretch w-full min-h-[480px] md:h-[490px]">
          {articles.map((article) => {
            const isExpanded = activeArticleId === article.id;

            return (
              <div
                key={article.id}
                onMouseEnter={() => setActiveArticleId(article.id)}
                onClick={() => setActiveArticleId(article.id)}
                className={`relative rounded-2xl overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] select-none ${
                  isExpanded
                    ? "flex-[4] sm:flex-[3.2] bg-white border border-copper/50 shadow-card"
                    : "flex-1 bg-charcoal border border-warm-border/60 hover:border-charcoal/50 shadow-subtle cursor-pointer"
                }`}
              >
                {/* EXPANDED VIEW: Image & Content Line Side by Side */}
                {isExpanded ? (
                  <motion.div
                    key={`expanded-${article.id}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="grid grid-cols-1 sm:grid-cols-12 h-full w-full p-4 sm:p-6 gap-4 sm:gap-6 items-stretch"
                  >
                    {/* Left Column: Image with Badge */}
                    <div className="sm:col-span-5 relative h-48 sm:h-full w-full rounded-xl overflow-hidden bg-charcoal shrink-0">
                      <Image
                        src={article.image}
                        alt={article.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 640px) 100vw, 40vw"
                      />
                      <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-sm text-white text-[10px] tracking-widestExtra uppercase px-3 py-1 font-semibold rounded-full font-sans">
                        {article.category}
                      </div>

                      {/* Expand State Pill */}
                      <div className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-sm text-white/90 text-[10px] font-mono px-2.5 py-1 rounded-full hidden sm:block">
                        Active Article
                      </div>
                    </div>

                    {/* Right Column: Editorial Details Side by Side */}
                    <div className="sm:col-span-7 flex flex-col justify-between py-1 sm:py-2">
                      <div>
                        {/* Meta */}
                        <div className="flex items-center gap-2 text-[11px] text-mutedText font-mono uppercase tracking-wider mb-2.5">
                          <Calendar className="w-3 h-3 text-copper" />
                          <span>{article.date}</span>
                          <span>•</span>
                          <Clock className="w-3 h-3 text-copper" />
                          <span>{article.readTime}</span>
                        </div>

                        {/* Title */}
                        <h3 className="text-xl sm:text-2xl lg:text-[25px] font-normal font-serif leading-snug text-charcoal mb-3">
                          {article.title}
                        </h3>

                        {/* Summary */}
                        <p className="text-[13px] sm:text-[14px] leading-relaxed text-secondaryText font-light font-sans line-clamp-4 sm:line-clamp-5 mb-4">
                          {article.summary}
                        </p>

                        {/* Topic Tags */}
                        <div className="flex flex-wrap gap-1.5 mb-4">
                          {getArticleTags(article.category).map((tag, tIdx) => (
                            <span
                              key={tIdx}
                              className="px-2.5 py-0.5 rounded-full bg-warm-grey text-charcoal/80 text-[11px] font-sans font-medium border border-warm-border"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Bottom CTA Bar */}
                      <div className="pt-3 border-t border-warm-border/80 flex items-center justify-between">
                        <button
                          onClick={(e) => handleOpenModal(article, e)}
                          className="inline-flex items-center gap-2 px-5 py-2.5 bg-copper hover:bg-copper-hover text-white text-xs font-medium font-sans tracking-wide rounded-full transition-all shadow-subtle group/btn"
                        >
                          <BookOpen className="w-3.5 h-3.5" />
                          <span>Read Full Story</span>
                          <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover/btn:translate-x-1" />
                        </button>

                        <span className="text-[11px] text-mutedText font-sans hidden md:inline">
                          Tap other cards to switch
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  /* RETRACTED / COLLAPSED VIEW: Sleek Vertical Slice in the Line */
                  <div className="relative w-full h-full min-h-[460px] cursor-pointer group">
                    {/* Background photo */}
                    <Image
                      src={article.image}
                      alt={article.title}
                      fill
                      className="object-cover filter brightness-[0.65] group-hover:brightness-[0.8] group-hover:scale-105 transition-all duration-700"
                      sizes="(max-width: 640px) 25vw, 20vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-black/20" />

                    {/* Top: Category or Plus Icon */}
                    <div className="absolute top-4 inset-x-3 flex justify-between items-center z-10">
                      <span className="bg-white/20 backdrop-blur-md text-white text-[9px] sm:text-[10px] tracking-widestExtra uppercase px-2 py-0.5 rounded-full font-semibold truncate max-w-[85px] sm:max-w-none">
                        {article.category}
                      </span>
                      <span className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-white/20 backdrop-blur-md text-white flex items-center justify-center text-xs font-bold transition-transform group-hover:scale-110">
                        <Plus className="w-3.5 h-3.5" />
                      </span>
                    </div>

                    {/* Bottom: Title & Hint */}
                    <div className="absolute bottom-5 inset-x-3 z-10">
                      <div className="text-[10px] sm:text-[11px] text-white/70 font-mono mb-1 truncate">
                        {article.date}
                      </div>
                      <h4 className="text-sm sm:text-base font-serif text-white font-normal line-clamp-2 leading-snug group-hover:text-copper-light transition-colors">
                        {article.title}
                      </h4>
                      <div className="mt-2 text-[9px] sm:text-[10px] font-sans text-copper-light uppercase tracking-wider font-semibold flex items-center gap-1 opacity-80 group-hover:opacity-100">
                        <span>Expand</span>
                        <ArrowRight className="w-2.5 h-2.5 transition-transform group-hover:translate-x-1" />
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
