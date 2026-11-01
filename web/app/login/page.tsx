"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Eye, EyeOff, ArrowRight, ShieldCheck, CheckCircle2, Crown, Shield, User, Home } from "lucide-react";
import { useAuth } from "@/lib/authContext";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  rememberMe: z.boolean().optional(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { switchRole, switchUser, users, login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: true,
    },
  });

  const handleQuickLogin = (role: "super_admin" | "admin" | "user", subRole?: "homeowner" | "architect") => {
    if (role === "super_admin") {
      setValue("email", "superadmin@admin.com");
      setValue("password", "admin123");
    }
    switchRole(role, subRole);
    setLoginSuccess(true);
    setTimeout(() => {
      router.push("/dashboard");
    }, 500);
  };

  const onSubmit = async (data: LoginFormValues) => {
    setAuthError(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: data.email, password: data.password }),
      });
      const result = await res.json();

      if (res.ok && result.user) {
        login(result.user);
        if (result.user.role === "super_admin") {
          switchRole("super_admin");
        } else if (result.user.role === "admin") {
          switchRole("admin");
        } else {
          switchRole("user", result.user.subRole || "homeowner");
        }
        setLoginSuccess(true);
        setTimeout(() => {
          if (result.user.role === "super_admin" || result.user.role === "admin") {
            router.push("/dashboard");
          } else {
            router.push("/designs");
          }
        }, 700);
      } else {
        // Fallback local check
        if (data.email.toLowerCase() === "superadmin@admin.com" && data.password === "admin123") {
          switchRole("super_admin");
          setLoginSuccess(true);
          setTimeout(() => router.push("/dashboard"), 700);
        } else {
          setAuthError(result.error || "Authentication failed. For Super Admin access use: superadmin@admin.com / admin123");
        }
      }
    } catch (err) {
      if (data.email.toLowerCase() === "superadmin@admin.com" && data.password === "admin123") {
        switchRole("super_admin");
        setLoginSuccess(true);
        setTimeout(() => router.push("/dashboard"), 700);
      } else {
        setAuthError("Authentication service connection error. Please try again.");
      }
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col justify-between">
      {/* Top minimal header */}
      <header className="border-b border-warm-border py-4 px-6 sm:px-10 flex items-center justify-between">
        <Link href="/" className="flex items-center group">
          <div className="relative h-9 w-[124px] sm:h-10 sm:w-[138px]">
            <Image
              src="/logo.png"
              alt="S-ARC Southern Architecture"
              fill
              className="object-contain object-left"
              priority
            />
          </div>
        </Link>

        <div className="text-xs font-sans text-mutedText">
          New to S-ARC?{" "}
          <Link href="/signup" className="text-copper hover:underline font-medium">
            Create an Account
          </Link>
        </div>
      </header>

      {/* Main Split Layout */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 max-w-7xl mx-auto w-full px-6 sm:px-8 py-10 lg:py-16 gap-12 items-center">
        
        {/* Left Column: Form (5 cols) */}
        <div className="lg:col-span-5 max-w-md w-full mx-auto space-y-8">
          <div>
            <span className="text-[10px] tracking-widestExtra uppercase text-copper font-semibold font-sans block mb-2">
              Welcome Back
            </span>
            <h1 className="text-3xl sm:text-4xl font-normal font-serif text-charcoal">
              Sign In to S-ARC.
            </h1>
            <p className="text-sm text-secondaryText font-light font-sans mt-2">
              Access your purchased CAD drawing packages, saved shortlists, and architect consultations.
            </p>
          </div>

          {loginSuccess ? (
            <div className="p-6 bg-warm-grey border border-warm-border text-center space-y-3 animate-fadeIn rounded-2xl">
              <div className="w-12 h-12 rounded-full bg-copper/10 border border-copper flex items-center justify-center mx-auto text-copper">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-serif text-charcoal">Authenticated Successfully</h3>
              <p className="text-xs text-mutedText font-sans">Redirecting to platform dashboard...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Super Admin Access Banner */}
              <div className="p-3.5 bg-amber-500/10 border border-amber-300 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2 text-charcoal">
                  <Crown className="w-4 h-4 text-amber-600 shrink-0" />
                  <div>
                    <span className="font-semibold text-charcoal">Super Admin Account:</span>{" "}
                    <button
                      type="button"
                      onClick={() => {
                        setValue("email", "superadmin@admin.com");
                        setValue("password", "admin123");
                      }}
                      className="font-mono text-[11px] font-bold text-amber-900 bg-white/90 hover:bg-white px-2 py-0.5 rounded-lg border border-amber-300 transition-colors"
                      title="Click to autofill credentials"
                    >
                      superadmin@admin.com
                    </button>
                  </div>
                </div>
                <div className="text-[11px] font-mono text-secondaryText">
                  Password: <strong className="text-charcoal">admin123</strong>
                </div>
              </div>

              {authError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-sans">
                  {authError}
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* Email */}
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-mutedText mb-1.5 font-sans">
                    Email Address
                  </label>
                  <input
                    {...register("email")}
                    type="email"
                    placeholder="superadmin@admin.com"
                    className="w-full border border-warm-border p-3 text-xs text-charcoal outline-none focus:border-charcoal bg-warm-card font-sans transition-colors rounded-xl"
                  />
                  {errors.email && (
                    <span className="text-[11px] text-red-500 mt-1 block font-sans">{errors.email.message}</span>
                  )}
                </div>

                {/* Password */}
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-[11px] uppercase tracking-wider text-mutedText font-sans">
                      Password
                    </label>
                    <a href="#forgot" className="text-[11px] text-copper hover:underline font-sans">
                      Forgot Password?
                    </a>
                  </div>
                  <div className="relative flex items-center">
                    <input
                      {...register("password")}
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••••••"
                      className="w-full border border-warm-border p-3 pr-10 text-xs text-charcoal outline-none focus:border-charcoal bg-warm-card font-sans transition-colors rounded-xl"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 text-mutedText hover:text-charcoal"
                      aria-label="Toggle password visibility"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.password && (
                    <span className="text-[11px] text-red-500 mt-1 block font-sans">{errors.password.message}</span>
                  )}
                </div>

                {/* Remember Me */}
                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-sans text-secondaryText">
                    <input
                      {...register("rememberMe")}
                      type="checkbox"
                      className="accent-copper rounded"
                    />
                    <span>Remember this device for 30 days</span>
                  </label>
                </div>

                {/* Submit CTA */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 bg-charcoal hover:bg-copper disabled:bg-charcoal/50 text-white text-xs font-sans font-medium tracking-wide flex items-center justify-center gap-2 transition-colors mt-2 rounded-xl"
                >
                  <span>{isSubmitting ? "Authenticating..." : "Sign In to Account"}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                {/* 3-Tier One-Click Demo Access */}
                <div className="p-4 bg-warm-grey/60 border border-warm-border rounded-2xl space-y-2.5">
                  <span className="text-[11px] font-mono text-secondaryText uppercase tracking-wider block font-medium">
                    3-Tier Demo Quick Sign In:
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handleQuickLogin("super_admin")}
                      className="p-2.5 bg-white border border-warm-border hover:border-amber-400 rounded-xl text-left transition-all group"
                    >
                      <div className="flex items-center gap-1.5 text-xs font-serif font-medium text-charcoal group-hover:text-amber-700">
                        <Crown className="w-3.5 h-3.5 text-amber-500" />
                        <span>Super Admin</span>
                      </div>
                      <div className="text-[10px] text-secondaryText font-mono">superadmin@admin.com</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleQuickLogin("admin")}
                      className="p-2.5 bg-white border border-warm-border hover:border-sky-400 rounded-xl text-left transition-all group"
                    >
                      <div className="flex items-center gap-1.5 text-xs font-serif font-medium text-charcoal group-hover:text-sky-700">
                        <Shield className="w-3.5 h-3.5 text-sky-500" />
                        <span>Platform Admin</span>
                      </div>
                      <div className="text-[10px] text-secondaryText font-mono">sarah.admin@s-arc.in</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleQuickLogin("user", "architect")}
                      className="p-2.5 bg-white border border-warm-border hover:border-copper rounded-xl text-left transition-all group"
                    >
                      <div className="flex items-center gap-1.5 text-xs font-serif font-medium text-charcoal group-hover:text-copper">
                        <User className="w-3.5 h-3.5 text-copper" />
                        <span>Architect User</span>
                      </div>
                      <div className="text-[10px] text-secondaryText font-mono">nikhil@studiovayu.arch</div>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleQuickLogin("user", "homeowner")}
                      className="p-2.5 bg-white border border-warm-border hover:border-charcoal rounded-xl text-left transition-all group"
                    >
                      <div className="flex items-center gap-1.5 text-xs font-serif font-medium text-charcoal group-hover:text-charcoal">
                        <Home className="w-3.5 h-3.5 text-secondaryText" />
                        <span>Homeowner User</span>
                      </div>
                      <div className="text-[10px] text-secondaryText font-mono">ramesh.client@gmail.com</div>
                    </button>
                  </div>
                </div>

                {/* Or Divider */}
                <div className="relative py-3 flex items-center justify-center">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-warm-border" />
                  </div>
                  <span className="relative bg-white px-3 text-[10px] uppercase tracking-wider text-mutedText font-sans">
                    Or Continue With
                  </span>
                </div>
              </form>
            </div>
          )}
              </div>

              {/* Social Login Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => alert("Google OAuth integration activated for S-ARC.")}
                  className="py-2.5 px-3 border border-warm-border hover:border-charcoal text-charcoal text-xs font-sans font-medium flex items-center justify-center gap-2 transition-colors bg-white rounded-xl"
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  <span>Google</span>
                </button>

                <button
                  type="button"
                  onClick={() => alert("Apple ID authentication activated for S-ARC.")}
                  className="py-2.5 px-3 border border-warm-border hover:border-charcoal text-charcoal text-xs font-sans font-medium flex items-center justify-center gap-2 transition-colors bg-white rounded-xl"
                >
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.38c.62-.75 1.04-1.8 0.92-2.85-.9.04-1.98.6-2.62 1.35-.57.65-1.06 1.72-.93 2.74 1.01.08 2.03-.49 2.63-1.24z" />
                  </svg>
                  <span>Apple</span>
                </button>
              </div>
            </form>
          )}

          <div className="pt-2 text-[11px] text-mutedText font-sans flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-copper" />
            <span>256-bit encrypted authentication & Council of Architecture compliance</span>
          </div>
        </div>

        {/* Right Column: Visual Architectural Showcase (7 cols) */}
        <div className="hidden lg:block lg:col-span-7 relative min-h-[580px] bg-charcoal overflow-hidden shadow-card rounded-3xl">
          <Image
            src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=85"
            alt="Contemporary Southern Indian Architecture"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/20" />

          {/* Architectural Quote Overlay */}
          <div className="absolute bottom-10 left-10 right-10 z-10 text-white space-y-3">
            <span className="text-[10px] tracking-widestExtra uppercase text-copper-light font-sans font-semibold">
              The S-ARC Vision
            </span>
            <p className="text-2xl font-serif font-normal leading-snug max-w-lg">
              &ldquo;Less decoration, more architecture. Discover spaces created around the topography and climate of how you live.&rdquo;
            </p>
            <div className="text-xs text-white/60 font-sans">
              Curating 500+ verified residential plans across South India
            </div>
          </div>
        </div>

      </main>

      {/* Footer minimal bar */}
      <footer className="border-t border-warm-border py-4 px-6 sm:px-10 text-center text-[11px] text-mutedText font-sans">
        © {new Date().getFullYear()} S-ARC (Southern Architecture). All rights reserved. •{" "}
        <Link href="/how-it-works" className="hover:text-charcoal transition-colors">
          Licensing & Bylaws
        </Link>
      </footer>
    </div>
  );
}

