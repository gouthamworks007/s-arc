"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, UserPlus, Info, CheckCircle2, ShieldCheck, Sparkles } from "lucide-react";

const DEMO_GOOGLE_ACCOUNTS = [
  {
    name: "Dr. Ananya Menon",
    email: "ananya.menon.arch@gmail.com",
    roleLabel: "Customer / Landowner",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80",
  },
  {
    name: "Ar. Nikhil Rajan",
    email: "nikhil.studio@gmail.com",
    roleLabel: "Licensed Architect",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
  },
  {
    name: "Manoj Varma",
    email: "manoj.builder@gmail.com",
    roleLabel: "Turnkey Contractor",
    avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&q=80",
  },
];

export default function GoogleDevChooserPage() {
  return (
    <React.Suspense fallback={<div className="min-h-screen bg-[#FDFBF7]" />}>
      <GoogleDevChooserContent />
    </React.Suspense>
  );
}

function GoogleDevChooserContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const intent = searchParams.get("intent") || "login";
  const redirectTarget = searchParams.get("redirect") || "/dashboard";
  const stateParam = searchParams.get("state") || "";

  const [customName, setCustomName] = useState("");
  const [customEmail, setCustomEmail] = useState("");
  const [showCustom, setShowCustom] = useState(false);

  const handleSelectAccount = (account: { name: string; email: string; avatar?: string }) => {
    const simPayload = JSON.stringify({
      name: account.name,
      email: account.email,
      picture: account.avatar || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80",
    });

    const b64 = btoa(simPayload).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
    const callbackUrl = `/api/auth/google/callback?simulated=${encodeURIComponent(b64)}&state=${encodeURIComponent(stateParam)}`;
    window.location.href = callbackUrl;
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customEmail.trim()) return;
    const cleanName = customName.trim() || customEmail.split("@")[0];
    handleSelectAccount({
      name: cleanName,
      email: customEmail.trim().toLowerCase(),
    });
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col justify-between selection:bg-copper selection:text-white">
      {/* Top minimal header */}
      <header className="border-b border-[#EAE5DC] bg-white/85 backdrop-blur-md py-4 px-6 sm:px-12 flex items-center justify-between sticky top-0 z-30 shadow-xs">
        <Link href="/" className="flex items-center group">
          <div className="relative h-9 w-[124px] sm:h-10 sm:w-[138px]">
            <Image
              src="/logo.png"
              alt="S-ARC Southern Architecture"
              fill
              className="object-contain object-left transition-transform group-hover:scale-[1.02]"
              priority
            />
          </div>
        </Link>

        <div className="text-xs font-sans text-stone-500">
          <Link
            href="/login"
            className="text-stone-600 hover:text-charcoal flex items-center gap-1.5 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Cancel and back</span>
          </Link>
        </div>
      </header>

      {/* Main Card */}
      <main className="flex-1 max-w-lg mx-auto w-full px-5 py-10 sm:py-14 flex items-center justify-center">
        <div className="bg-white border border-[#EAE5DC] rounded-3xl p-7 sm:p-9 shadow-card w-full space-y-6">
          {/* Google Header */}
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-white border border-stone-200/80 shadow-xs flex items-center justify-center mx-auto">
              <svg className="w-6 h-6" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
            </div>
            <h1 className="text-xl sm:text-2xl font-serif text-charcoal">
              Sign in with Google
            </h1>
            <p className="text-xs text-secondaryText font-sans">
              Choose an account to continue to{" "}
              <strong className="text-charcoal font-medium">S-ARC Architecture</strong>
            </p>
          </div>

          {/* Quick Account List */}
          <div className="space-y-2.5">
            {DEMO_GOOGLE_ACCOUNTS.map((acc) => (
              <button
                key={acc.email}
                type="button"
                onClick={() => handleSelectAccount(acc)}
                className="w-full p-3.5 rounded-2xl border border-warm-border hover:border-copper/50 bg-[#FAF9F6] hover:bg-white text-left transition-all flex items-center justify-between gap-3 group shadow-2xs"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative w-10 h-10 rounded-full overflow-hidden shrink-0 border border-stone-200">
                    <Image
                      src={acc.avatar}
                      alt={acc.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-serif font-semibold text-charcoal group-hover:text-copper transition-colors truncate">
                      {acc.name}
                    </div>
                    <div className="text-[11px] text-stone-500 font-sans truncate font-mono">
                      {acc.email}
                    </div>
                  </div>
                </div>

                <span className="text-[10px] font-sans px-2.5 py-1 rounded-full bg-stone-100 text-stone-600 group-hover:bg-copper/10 group-hover:text-copper transition-colors shrink-0">
                  {acc.roleLabel}
                </span>
              </button>
            ))}

            {/* Custom Account Toggle */}
            {!showCustom ? (
              <button
                type="button"
                onClick={() => setShowCustom(true)}
                className="w-full p-3.5 rounded-2xl border border-dashed border-stone-300 hover:border-stone-400 bg-white text-xs font-sans text-stone-600 flex items-center justify-center gap-2 transition-all hover:bg-stone-50"
              >
                <UserPlus className="w-4 h-4 text-copper" />
                <span>Use another Google account</span>
              </button>
            ) : (
              <form onSubmit={handleCustomSubmit} className="p-4 bg-stone-50/80 rounded-2xl border border-stone-200 space-y-3 animate-fadeIn">
                <span className="text-xs font-serif font-semibold text-charcoal block">
                  Enter Google Account Details:
                </span>
                <input
                  type="text"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="Your Full Name (e.g. Ramesh Nair)"
                  className="w-full p-2.5 text-xs border border-stone-300 rounded-xl bg-white outline-none focus:border-charcoal"
                />
                <input
                  type="email"
                  required
                  value={customEmail}
                  onChange={(e) => setCustomEmail(e.target.value)}
                  placeholder="your.email@gmail.com"
                  className="w-full p-2.5 text-xs border border-stone-300 rounded-xl bg-white outline-none focus:border-charcoal"
                />
                <div className="flex gap-2">
                  <button
                    type="submit"
                    className="flex-1 py-2.5 bg-charcoal hover:bg-copper text-white text-xs rounded-xl font-sans font-medium transition-colors"
                  >
                    Continue with this Google Account
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCustom(false)}
                    className="px-3 py-2.5 border border-stone-300 text-xs rounded-xl font-sans text-stone-500 hover:text-charcoal transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Developer Instruction Pill */}
          <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200 text-amber-900 text-xs font-sans flex items-start gap-2.5 leading-relaxed">
            <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <strong className="font-semibold">Google OAuth Note:</strong> To route directly through Google Cloud servers in production, set <code className="bg-amber-100/80 px-1 py-0.5 rounded text-[11px] font-mono">GOOGLE_CLIENT_ID</code> and <code className="bg-amber-100/80 px-1 py-0.5 rounded text-[11px] font-mono">GOOGLE_CLIENT_SECRET</code> in your environment.
            </div>
          </div>
        </div>
      </main>

      {/* Footer minimal bar */}
      <footer className="border-t border-[#EAE5DC] bg-white/60 py-4 px-6 sm:px-12 text-center text-[11px] text-stone-500 font-sans">
        © {new Date().getFullYear()} S-ARC. Council of Architecture India verified marketplace.
      </footer>
    </div>
  );
}
