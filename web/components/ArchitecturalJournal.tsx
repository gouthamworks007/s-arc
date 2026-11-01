"use client";

import React, { useState } from "react";
import Image from "next/image";
import { ArrowRight, Clock, Calendar } from "lucide-react";
import { JournalArticle } from "@/lib/types";

interface ArchitecturalJournalProps {
  articles: JournalArticle[];
}

export default function ArchitecturalJournal({ articles }: ArchitecturalJournalProps) {
  const [selectedArticle, setSelectedArticle] = useState<JournalArticle | null>(null);

  return (
    <section id="inspiration" className="py-20 sm:py-24 bg-warm-grey border-y border-warm-border">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 sm:mb-16 gap-6">
          <div>
            <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-normal font-serif tracking-[-0.01em] text-charcoal mb-3">
              Ideas, Insights and Stories.
            </h2>
            <p className="text-[15px] leading-relaxed text-secondaryText max-w-xl font-light font-sans">
              Explore articles on design trends, materials, land planning and sustainable homes.
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

        {/* 3 Articles Grid matching design.png */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {articles.map((article) => (
            <article
              key={article.id}
              onClick={() => setSelectedArticle(article)}
              className="group cursor-pointer flex flex-col justify-between"
            >
              <div>
                {/* Article Image */}
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-charcoal mb-4 rounded-2xl">
                  <Image
                    src={article.image}
                    alt={article.title}
                    fill
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                </div>

                {/* Category Pill */}
                <div className="text-[10px] tracking-widestExtra text-copper uppercase font-semibold mb-2">
                  {article.category}
                </div>

                {/* Title */}
                <h3 className="text-xl sm:text-[22px] font-normal font-serif leading-snug text-charcoal group-hover:text-copper transition-colors mb-3">
                  {article.title}
                </h3>
              </div>

              {/* Date and Read Time Row */}
              <div className="flex items-center justify-between pt-3 border-t border-warm-border/80 text-[12px] text-mutedText">
                <span>{article.date} • {article.readTime}</span>
                <ArrowRight className="w-3.5 h-3.5 text-charcoal group-hover:text-copper group-hover:translate-x-1 transition-all" />
              </div>
            </article>
          ))}
        </div>

      </div>

      {/* Article Detail Modal */}
      {selectedArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white max-w-2xl w-full p-6 sm:p-8 max-h-[90vh] overflow-y-auto rounded-3xl shadow-card">
            <div className="flex justify-between items-start mb-4">
              <span className="text-xs font-semibold text-copper uppercase tracking-widest">
                {selectedArticle.category}
              </span>
              <button
                onClick={() => setSelectedArticle(null)}
                className="text-mutedText hover:text-charcoal text-sm p-1"
              >
                ✕ Close
              </button>
            </div>
            <h2 className="text-2xl sm:text-3xl font-normal text-charcoal mb-3">
              {selectedArticle.title}
            </h2>
            <div className="text-xs text-mutedText mb-6">
              Published {selectedArticle.date} • {selectedArticle.readTime}
            </div>
            <div className="relative aspect-[16/9] w-full mb-6 rounded-2xl overflow-hidden">
              <Image
                src={selectedArticle.image}
                alt={selectedArticle.title}
                fill
                className="object-cover"
              />
            </div>
            <p className="text-[15px] leading-relaxed text-secondaryText mb-4">
              {selectedArticle.summary}
            </p>
            <p className="text-[15px] leading-relaxed text-secondaryText">
              Southern Indian residential architecture is undergoing a quiet revolution. As homeowners navigate rising thermal indices and urban density, architects are merging indigenous knowledge systems — like inward courtyards and terracotta jaalis — with contemporary engineering and passive bioclimatic modeling.
            </p>
          </div>
        </div>
      )}
    </section>
  );
}

