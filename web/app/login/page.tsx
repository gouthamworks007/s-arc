"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { 
  Eye, 
  EyeOff, 
  ArrowRight, 
  ShieldCheck, 
  CheckCircle2, 
  User, 
  Home, 
  ChevronDown, 
  Loader2, 
  Lock 
} from "lucide-react";
import { useAuth } from "@/lib/authContext";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  rememberMe: z.boolean().optional(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { switchRole, login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [loginSuccess, setLoginSuccess] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [showDemoAccess, setShowDemoAccess] = useState(false);

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

  const handleAutofill = (email: string, pass: string) => {
    setValue("email", email);
    setValue("password", pass);
  };

  const handleQuickLogin = (email: string, pass: string) => {
    setValue("email", email);
    setValue("password", pass);
    onSubmit({ email, password: pass, rememberMe: true });
  };

  const onSubmit = async (data: LoginFormValues) => {
    setAuthError(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
          rememberMe: data.rememberMe ?? true,
        }),
      });
      const result = await res.json();

      if (res.ok && result.user) {
        login(result.user);
        setLoginSuccess(true);
        setTimeout(() => {
          router.push("/dashboard");
        }, 500);
      } else {
        setAuthError(result.error || "Invalid email or password. Please verify your credentials.");
      }
    } catch (err) {
      setAuthError("Authentication service connection error. Please verify your internet connection and try again.");
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col justify-between selection:bg-copper selection:text-white">
      {/* Top minimal header */}
      <header className="border-b border-[#EAE5DC] bg-white/80 backdrop-blur-md py-4 px-6 sm:px-12 flex items-center justify-between sticky top-0 z-30">
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
          New to S-ARC?{" "}
          <Link href="/signup" className="text-copper hover:text-copper-hover underline font-medium transition-colors">
            Create an Account
          </Link>
        </div>
      </header>

      {/* Main Split Layout */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 max-w-7xl mx-auto w-full px-6 sm:px-8 py-10 lg:py-16 gap-12 lg:gap-16 items-center">
        
        {/* Left Column: Form (5 cols) */}
        <div className="lg:col-span-5 max-w-md w-full mx-auto space-y-7">
          <div className="space-y-2">
            <span className="text-[11px] tracking-widestExtra uppercase text-copper font-medium font-sans block">
              Architectural Studio Portal
            </span>
            <h1 className="text-3xl sm:text-4xl font-normal font-serif text-charcoal tracking-tight">
              Sign In to S-ARC.
            </h1>
            <p className="text-xs sm:text-sm text-secondaryText font-light font-sans leading-relaxed">
              Access licensed CAD drawing packages, structural BOQs, client inquiries, and verified architect workspaces.
            </p>
          </div>

          {loginSuccess ? (
            <div className="p-8 bg-white border border-[#EAE5DC] text-center space-y-3 animate-fadeIn rounded-2xl shadow-sm">
              <div className="w-12 h-12 rounded-full bg-copper/10 border border-copper flex items-center justify-center mx-auto text-copper">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-serif text-charcoal">Authenticated Successfully</h3>
              <p className="text-xs text-mutedText font-sans">Connecting to your secure architectural dashboard...</p>
            </div>
          ) : (
            <div className="space-y-5">
              {authError && (
                <div className="p-3.5 bg-red-50/80 border border-red-200 text-red-700 text-xs rounded-xl font-sans flex items-start gap-2">
                  <span className="font-semibold shrink-0">Notice:</span>
                  <span>{authError}</span>
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* Email */}
                <div className="space-y-1.5">
                  <label className="block text-[11px] uppercase tracking-wider text-stone-500 font-sans font-medium">
                    Email Address
                  </label>
                  <input
                    {...register("email")}
                    type="email"
                    autoComplete="email"
                    placeholder="name@domain.com"
                    className="w-full border border-[#DDD6CA] focus:border-charcoal p-3.5 text-xs text-charcoal outline-none bg-white font-sans transition-all rounded-xl focus:ring-1 focus:ring-charcoal"
                  />
                  {errors.email && (
                    <span className="text-[11px] text-red-500 font-sans">{errors.email.message}</span>
                  )}
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="text-[11px] uppercase tracking-wider text-stone-500 font-sans font-medium">
                      Password
                    </label>
                    <a href="#forgot" onClick={(e) => { e.preventDefault(); alert("Password reset link has been dispatched to your email address."); }} className="text-[11px] text-copper hover:underline font-sans">
                      Forgot Password?
                    </a>
                  </div>
                  <div className="relative flex items-center">
                    <input
                      {...register("password")}
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      placeholder="••••••••••••"
                      className="w-full border border-[#DDD6CA] focus:border-charcoal p-3.5 pr-10 text-xs text-charcoal outline-none bg-white font-sans transition-all rounded-xl focus:ring-1 focus:ring-charcoal"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 text-stone-400 hover:text-stone-700"
                      aria-label="Toggle password visibility"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.password && (
                    <span className="text-[11px] text-red-500 font-sans">{errors.password.message}</span>
                  )}
                </div>

                {/* Remember Me */}
                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-sans text-stone-600">
                    <input
                      {...register("rememberMe")}
                      type="checkbox"
                      className="accent-copper rounded border-stone-300 w-3.5 h-3.5"
                    />
                    <span>Remember this session</span>
                  </label>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 bg-charcoal hover:bg-copper disabled:bg-charcoal/60 text-white text-xs font-sans font-medium tracking-wide flex items-center justify-center gap-2 transition-all rounded-xl shadow-sm mt-3"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white/80" />
                      <span>Authenticating...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In to Account</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </form>

              {/* Discreet Demo Credentials Drawer */}
              <div className="pt-2 border-t border-[#EAE5DC]">
                <button
                  type="button"
                  onClick={() => setShowDemoAccess(!showDemoAccess)}
                  className="w-full py-2 px-3 flex items-center justify-between text-[11px] font-mono text-stone-500 hover:text-stone-800 transition-colors bg-stone-100/60 rounded-xl hover:bg-stone-100"
                >
                  <div className="flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-copper" />
                    <span>Demo & Verification Credentials</span>
                  </div>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${showDemoAccess ? "rotate-180" : ""}`} />
                </button>

                {showDemoAccess && (
                  <div className="mt-2.5 p-3.5 bg-white border border-[#EAE5DC] rounded-xl space-y-2.5 animate-fadeIn">
                    <span className="text-[10px] uppercase font-mono tracking-wider text-stone-400 block font-semibold">
                      Click below to fill test credentials:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {/* Admin */}
                      <button
                        type="button"
                        onClick={() => handleAutofill("admin@s-arc.in", "admin123")}
                        className="p-2 border border-stone-300 bg-stone-100 hover:bg-stone-200/70 rounded-lg text-left transition-colors sm:col-span-2"
                      >
                        <div className="flex items-center gap-1.5 font-serif font-medium text-charcoal text-xs">
                          <ShieldCheck className="w-3.5 h-3.5 text-copper" />
                          <span>Admin Access</span>
                        </div>
                        <div className="text-[10px] font-mono text-stone-600">admin@s-arc.in / admin123</div>
                      </button>

                      {/* Architect */}
                      <button
                        type="button"
                        onClick={() => handleAutofill("nikhil@studiovayu.arch", "password123")}
                        className="p-2 border border-stone-200 bg-stone-50/60 hover:bg-stone-100 rounded-lg text-left transition-colors"
                      >
                        <div className="flex items-center gap-1.5 font-serif font-medium text-charcoal text-xs">
                          <User className="w-3.5 h-3.5 text-copper" />
                          <span>Architect User</span>
                        </div>
                        <div className="text-[10px] font-mono text-stone-500">nikhil@studiovayu.arch</div>
                      </button>

                      {/* Homeowner */}
                      <button
                        type="button"
                        onClick={() => handleAutofill("ramesh.client@gmail.com", "password123")}
                        className="p-2 border border-stone-200 bg-stone-50/60 hover:bg-stone-100 rounded-lg text-left transition-colors"
                      >
                        <div className="flex items-center gap-1.5 font-serif font-medium text-charcoal text-xs">
                          <Home className="w-3.5 h-3.5 text-stone-500" />
                          <span>Homeowner User</span>
                        </div>
                        <div className="text-[10px] font-mono text-stone-500">ramesh.client@gmail.com</div>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="pt-1 text-[11px] text-stone-400 font-sans flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-copper shrink-0" />
            <span>256-bit encrypted authentication • Council of Architecture India compliance</span>
          </div>
        </div>

        {/* Right Column: Visual Architectural Showcase (7 cols) */}
        <div className="hidden lg:block lg:col-span-7 relative min-h-[620px] bg-charcoal overflow-hidden shadow-card rounded-3xl border border-stone-200/60">
          <Image
            src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=85"
            alt="Contemporary Southern Indian Tropical Architecture"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/20" />

          {/* Architectural Quote Overlay */}
          <div className="absolute bottom-10 left-10 right-10 z-10 text-white space-y-3">
            <span className="text-[10px] tracking-widestExtra uppercase text-copper-light font-sans font-medium">
              Vernacular Modernism • South India
            </span>
            <p className="text-2xl font-serif font-normal leading-snug max-w-lg">
              &ldquo;Less decoration, more architecture. Discover spaces created around the topography and climate of how you live.&rdquo;
            </p>
            <div className="text-xs text-white/60 font-sans">
              Curating 500+ verified residential plans across Kerala, Karnataka, and Tamil Nadu.
            </div>
          </div>
        </div>

      </main>

      {/* Footer minimal bar */}
      <footer className="border-t border-[#EAE5DC] bg-white/60 py-4 px-6 sm:px-12 text-center text-[11px] text-stone-500 font-sans">
        © {new Date().getFullYear()} S-ARC (Southern Architecture Marketplace). All rights reserved. •{" "}
        <Link href="/plot-intelligence" className="hover:text-charcoal transition-colors underline">
          Kerala KMBR & Bylaws
        </Link>
      </footer>
    </div>
  );
}
