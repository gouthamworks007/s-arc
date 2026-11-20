"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

interface GoogleAuthButtonProps {
  variant?: "signin" | "signup";
  redirectUrl?: string;
  className?: string;
}

export default function GoogleAuthButton({
  variant = "signin",
  redirectUrl,
  className = "",
}: GoogleAuthButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleGoogleClick = () => {
    setLoading(true);
    const params = new URLSearchParams();
    params.set("intent", variant);
    if (redirectUrl) {
      params.set("redirect", redirectUrl);
    }
    window.location.href = `/api/auth/google?${params.toString()}`;
  };

  return (
    <div className={`space-y-4 w-full ${className}`}>
      <button
        type="button"
        onClick={handleGoogleClick}
        disabled={loading}
        className="w-full py-3.5 px-4 bg-white hover:bg-stone-50/90 active:bg-stone-100 disabled:opacity-70 border border-[#DDD6CA] hover:border-stone-400 text-charcoal font-sans text-xs font-medium rounded-xl flex items-center justify-center gap-3 transition-all shadow-xs group cursor-pointer"
        aria-label={variant === "signup" ? "Sign up with Google" : "Continue with Google"}
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin text-copper" />
        ) : (
          <svg
            className="w-4 h-4 shrink-0 transition-transform group-hover:scale-105"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
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
        )}
        <span className="tracking-wide">
          {variant === "signup" ? "Sign up with Google" : "Continue with Google"}
        </span>
      </button>

      {/* Elegant Divider */}
      <div className="relative flex items-center justify-center">
        <div className="border-t border-[#EAE5DC] w-full" />
        <span className="bg-[#FAF9F6] px-3 text-[10px] font-mono uppercase tracking-wider text-stone-400 absolute select-none">
          {variant === "signup" ? "or register with email" : "or continue with email"}
        </span>
      </div>
    </div>
  );
}
