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
  Building,
  Loader2,
  FileCheck2,
} from "lucide-react";
import { useAuth } from "@/lib/authContext";

const signupSchema = z
  .object({
    fullName: z.string().min(2, "Full name must be at least 2 characters"),
    email: z.string().email("Please enter a valid email address"),
    phone: z
      .string()
      .min(10, "Please enter a valid 10-digit mobile number")
      .regex(/^[0-9+\s-]{10,15}$/, "Please enter a valid phone number"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(6, "Please confirm your password"),
    termsAgreed: z.literal(true, {
      errorMap: () => ({ message: "You must accept the terms & marketplace license agreement" }),
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type SignupFormValues = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [signupSuccess, setSignupSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
      termsAgreed: true,
    },
  });

  const onSubmit = async (data: SignupFormValues) => {
    setErrorMessage(null);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.fullName,
          email: data.email,
          phone: data.phone,
          password: data.password,
          role: "user",
          subRole: "homeowner",
        }),
      });

      const result = await res.json();

      if (res.ok && result.user) {
        login(result.user);
        setSignupSuccess(true);
        setTimeout(() => {
          router.push("/dashboard");
        }, 800);
      } else {
        setErrorMessage(result.error || "Registration could not be completed. Please try again.");
      }
    } catch (err) {
      setErrorMessage("Service connection error. Please try again.");
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
          Already have an account?{" "}
          <Link href="/login" className="text-copper hover:text-copper-hover underline font-medium transition-colors">
            Sign In
          </Link>
        </div>
      </header>

      {/* Main Split Layout */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 max-w-7xl mx-auto w-full px-6 sm:px-8 py-10 lg:py-16 gap-12 lg:gap-16 items-start">
        
        {/* Left Column: Form (6 cols) */}
        <div className="lg:col-span-6 w-full space-y-6">
          <div className="space-y-2">
            <span className="text-[11px] tracking-widestExtra uppercase text-copper font-medium font-sans block">
              Join S-ARC Marketplace
            </span>
            <h1 className="text-3xl sm:text-4xl font-normal font-serif text-charcoal tracking-tight">
              Create Your Account.
            </h1>
            <p className="text-xs sm:text-sm text-secondaryText font-light font-sans leading-relaxed">
              Create an account to browse construction-ready architectural CAD packages, connect with verified studios, and manage consultations.
            </p>
          </div>

          {/* Architect Notice Pill */}
          <div className="p-3.5 bg-stone-100/70 border border-[#EAE5DC] rounded-2xl flex items-start gap-3 text-xs font-sans">
            <Building className="w-4 h-4 text-copper shrink-0 mt-0.5" />
            <div className="text-secondaryText leading-relaxed">
              <span className="font-semibold text-charcoal">Are you a Freelance Architect or Firm?</span>{" "}
              Create your user account first. Once signed in, you can apply directly for Super Admin verification to publish blueprints.
            </div>
          </div>

          {signupSuccess ? (
            <div className="p-8 bg-white border border-[#EAE5DC] text-center space-y-3 animate-fadeIn rounded-2xl shadow-sm">
              <div className="w-12 h-12 rounded-full bg-copper/10 border border-copper flex items-center justify-center mx-auto text-copper">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-serif text-charcoal">Account Created Successfully</h3>
              <p className="text-xs text-mutedText font-sans">Redirecting to your dashboard...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {errorMessage && (
                <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-sans">
                  {errorMessage}
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 bg-white p-6 sm:p-8 rounded-2xl border border-[#EAE5DC] shadow-sm">
                {/* Full Name */}
                <div className="space-y-1">
                  <label className="block text-[11px] uppercase tracking-wider text-stone-500 font-sans font-medium">
                    Full Name
                  </label>
                  <input
                    {...register("fullName")}
                    type="text"
                    placeholder="e.g. Adv. K. Ramesh or Dr. Ananya Menon"
                    className="w-full border border-[#DDD6CA] focus:border-charcoal p-3 text-xs text-charcoal outline-none bg-[#FAF9F6] font-sans transition-all rounded-xl focus:bg-white"
                  />
                  {errors.fullName && (
                    <span className="text-[11px] text-red-500 font-sans">{errors.fullName.message}</span>
                  )}
                </div>

                {/* Email and Phone Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-[11px] uppercase tracking-wider text-stone-500 font-sans font-medium">
                      Email Address
                    </label>
                    <input
                      {...register("email")}
                      type="email"
                      placeholder="name@domain.com"
                      className="w-full border border-[#DDD6CA] focus:border-charcoal p-3 text-xs text-charcoal outline-none bg-[#FAF9F6] font-sans transition-all rounded-xl focus:bg-white"
                    />
                    {errors.email && (
                      <span className="text-[11px] text-red-500 font-sans">{errors.email.message}</span>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[11px] uppercase tracking-wider text-stone-500 font-sans font-medium">
                      Phone Number
                    </label>
                    <input
                      {...register("phone")}
                      type="tel"
                      placeholder="+91 98470 12345"
                      className="w-full border border-[#DDD6CA] focus:border-charcoal p-3 text-xs text-charcoal outline-none bg-[#FAF9F6] font-sans transition-all rounded-xl focus:bg-white"
                    />
                    {errors.phone && (
                      <span className="text-[11px] text-red-500 font-sans">{errors.phone.message}</span>
                    )}
                  </div>
                </div>

                {/* Password and Confirm Password Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block text-[11px] uppercase tracking-wider text-stone-500 font-sans font-medium">
                      Password
                    </label>
                    <div className="relative flex items-center">
                      <input
                        {...register("password")}
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••••••"
                        className="w-full border border-[#DDD6CA] focus:border-charcoal p-3 pr-9 text-xs text-charcoal outline-none bg-[#FAF9F6] font-sans transition-all rounded-xl focus:bg-white"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 text-stone-400 hover:text-stone-700"
                      >
                        {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                    {errors.password && (
                      <span className="text-[11px] text-red-500 font-sans">{errors.password.message}</span>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[11px] uppercase tracking-wider text-stone-500 font-sans font-medium">
                      Confirm Password
                    </label>
                    <div className="relative flex items-center">
                      <input
                        {...register("confirmPassword")}
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="••••••••••••"
                        className="w-full border border-[#DDD6CA] focus:border-charcoal p-3 pr-9 text-xs text-charcoal outline-none bg-[#FAF9F6] font-sans transition-all rounded-xl focus:bg-white"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 text-stone-400 hover:text-stone-700"
                      >
                        {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <span className="text-[11px] text-red-500 font-sans">{errors.confirmPassword.message}</span>
                    )}
                  </div>
                </div>

                {/* Terms Agreement */}
                <div className="pt-2">
                  <label className="flex items-start gap-2.5 cursor-pointer text-xs font-sans text-stone-600 leading-relaxed">
                    <input
                      {...register("termsAgreed")}
                      type="checkbox"
                      className="accent-copper rounded border-stone-300 w-4 h-4 mt-0.5"
                    />
                    <span>
                      I agree to the S-ARC{" "}
                      <Link href="/how-it-works" className="text-copper hover:underline font-medium">
                        Platform Terms & Single-Build Licensing Bylaws
                      </Link>.
                    </span>
                  </label>
                  {errors.termsAgreed && (
                    <span className="text-[11px] text-red-500 font-sans block mt-1">
                      {errors.termsAgreed.message}
                    </span>
                  )}
                </div>

                {/* Submit CTA */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 bg-charcoal hover:bg-copper disabled:bg-charcoal/60 text-white text-xs font-sans font-medium tracking-wide flex items-center justify-center gap-2 transition-all rounded-xl shadow-sm mt-3"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white/80" />
                      <span>Creating Account...</span>
                    </>
                  ) : (
                    <>
                      <span>Complete Registration</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          <div className="pt-1 text-[11px] text-stone-400 font-sans flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-copper shrink-0" />
            <span>256-bit encrypted authentication • Council of Architecture India compliance</span>
          </div>
        </div>

        {/* Right Column: Information & Trust (6 cols) */}
        <div className="hidden lg:block lg:col-span-6 space-y-6 sticky top-28">
          <div className="relative min-h-[380px] bg-charcoal rounded-3xl overflow-hidden shadow-card border border-stone-200/60">
            <Image
              src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=85"
              alt="Contemporary Vernacular Architecture"
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/10" />
            <div className="absolute bottom-8 left-8 right-8 text-white space-y-2">
              <span className="text-[10px] tracking-widestExtra uppercase text-copper-light font-mono">
                Verified South Indian Blueprints
              </span>
              <h3 className="text-xl font-serif">Curated Regional Living Spaces</h3>
              <p className="text-xs text-white/70 leading-relaxed font-sans">
                Every residential plan includes fully engineered structural schedules, MEP layouts, and Vastu compliance audits designed for Southern climatic zones.
              </p>
            </div>
          </div>

          {/* Benefits Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-white border border-[#EAE5DC] rounded-2xl space-y-1">
              <div className="w-8 h-8 rounded-xl bg-copper/10 text-copper flex items-center justify-center mb-2">
                <FileCheck2 className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-serif font-semibold text-charcoal">42-Sheet CAD Packages</h4>
              <p className="text-[11px] text-stone-500 font-sans">Complete turnkey architectural documentation ready for municipal sanction.</p>
            </div>

            <div className="p-4 bg-white border border-[#EAE5DC] rounded-2xl space-y-1">
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-700 flex items-center justify-center mb-2">
                <Building className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-serif font-semibold text-charcoal">Direct Studio Connect</h4>
              <p className="text-[11px] text-stone-500 font-sans">Apply as an architect or consult directly with certified design studios.</p>
            </div>
          </div>
        </div>

      </main>

      {/* Footer minimal bar */}
      <footer className="border-t border-[#EAE5DC] bg-white/60 py-4 px-6 sm:px-12 text-center text-[11px] text-stone-500 font-sans">
        © {new Date().getFullYear()} S-ARC (Southern Architecture Marketplace). All rights reserved.
      </footer>
    </div>
  );
}
