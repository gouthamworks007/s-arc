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
  Home,
  Compass,
  HardHat,
  FileCheck2,
  BadgeCheck,
  Layers,
  Sparkles,
} from "lucide-react";

type RoleType = "homeowner" | "architect" | "contractor";

const signupSchema = z
  .object({
    role: z.enum(["homeowner", "architect", "contractor"]),
    fullName: z.string().min(2, "Full name must be at least 2 characters"),
    email: z.string().email("Please enter a valid email address"),
    phone: z
      .string()
      .min(10, "Please enter a valid 10-digit mobile number")
      .regex(/^[0-9+\s-]{10,15}$/, "Please enter a valid phone number"),
    studioName: z.string().optional(),
    coaRegNumber: z.string().optional(),
    companyName: z.string().optional(),
    operatingRegion: z.string().optional(),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(6, "Please confirm your password"),
    termsAgreed: z.literal(true, {
      errorMap: () => ({ message: "You must accept the terms and bylaws license agreement" }),
    }),
  })
  .superRefine((data, ctx) => {
    if (data.password !== data.confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["confirmPassword"],
        message: "Passwords do not match",
      });
    }
    if (data.role === "architect") {
      if (!data.studioName || data.studioName.trim().length < 2) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["studioName"],
          message: "Studio / Practice name is required for architects",
        });
      }
      if (!data.coaRegNumber || data.coaRegNumber.trim().length < 6) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["coaRegNumber"],
          message: "Valid Council of Architecture (COA) registration required",
        });
      }
    }
    if (data.role === "contractor") {
      if (!data.companyName || data.companyName.trim().length < 2) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["companyName"],
          message: "Company / Contracting firm name is required",
        });
      }
    }
  });

type SignupFormValues = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<RoleType>("homeowner");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [signupSuccess, setSignupSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      role: "homeowner",
      fullName: "",
      email: "",
      phone: "",
      studioName: "",
      coaRegNumber: "",
      companyName: "",
      operatingRegion: "Kerala & Bangalore",
      password: "",
      confirmPassword: "",
      termsAgreed: true,
    },
  });

  const handleRoleChange = (role: RoleType) => {
    setSelectedRole(role);
    setValue("role", role);
  };

  const onSubmit = async (data: SignupFormValues) => {
    // Simulate API registration
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setSignupSuccess(true);
    setTimeout(() => {
      if (data.role === "architect") {
        router.push("/architects");
      } else {
        router.push("/designs");
      }
    }, 1500);
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
          Already have an account?{" "}
          <Link href="/login" className="text-copper hover:underline font-medium">
            Sign In
          </Link>
        </div>
      </header>

      {/* Main Split Layout */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 max-w-7xl mx-auto w-full px-6 sm:px-8 py-10 lg:py-14 gap-12 items-start">
        {/* Left Column: Interactive Form (6 cols) */}
        <div className="lg:col-span-6 w-full space-y-6">
          <div>
            <span className="text-[10px] tracking-widestExtra uppercase text-copper font-semibold font-sans block mb-1">
              Join Southern Architecture
            </span>
            <h1 className="text-3xl sm:text-4xl font-normal font-serif text-charcoal">
              Create Your Account.
            </h1>
            <p className="text-sm text-secondaryText font-light font-sans mt-1.5">
              Select your membership profile to unlock regional architectural blueprints, turnkey BOQs, or publish your practice.
            </p>
          </div>

          {/* Role Segmented Tabs */}
          <div className="space-y-2">
            <label className="block text-[11px] uppercase tracking-wider text-mutedText font-sans">
              I am joining S-ARC as:
            </label>
            <div className="grid grid-cols-3 gap-2 p-1 bg-warm-grey border border-warm-border rounded-xl">
              <button
                type="button"
                onClick={() => handleRoleChange("homeowner")}
                className={`py-2.5 px-3 flex flex-col sm:flex-row items-center justify-center gap-2 text-xs font-sans transition-all rounded-lg ${
                  selectedRole === "homeowner"
                    ? "bg-white text-charcoal font-semibold shadow-sm border border-warm-border"
                    : "text-secondaryText hover:text-charcoal"
                }`}
              >
                <Home className="w-3.5 h-3.5 text-copper flex-shrink-0" />
                <span className="text-center sm:text-left leading-tight">Homeowner</span>
              </button>

              <button
                type="button"
                onClick={() => handleRoleChange("architect")}
                className={`py-2.5 px-3 flex flex-col sm:flex-row items-center justify-center gap-2 text-xs font-sans transition-all rounded-lg ${
                  selectedRole === "architect"
                    ? "bg-white text-charcoal font-semibold shadow-sm border border-warm-border"
                    : "text-secondaryText hover:text-charcoal"
                }`}
              >
                <Compass className="w-3.5 h-3.5 text-copper flex-shrink-0" />
                <span className="text-center sm:text-left leading-tight">Architect</span>
              </button>

              <button
                type="button"
                onClick={() => handleRoleChange("contractor")}
                className={`py-2.5 px-3 flex flex-col sm:flex-row items-center justify-center gap-2 text-xs font-sans transition-all rounded-lg ${
                  selectedRole === "contractor"
                    ? "bg-white text-charcoal font-semibold shadow-sm border border-warm-border"
                    : "text-secondaryText hover:text-charcoal"
                }`}
              >
                <HardHat className="w-3.5 h-3.5 text-copper flex-shrink-0" />
                <span className="text-center sm:text-left leading-tight">Contractor</span>
              </button>
            </div>
          </div>

          {signupSuccess ? (
            <div className="p-8 bg-warm-grey border border-warm-border text-center space-y-4 animate-fadeIn rounded-2xl">
              <div className="w-14 h-14 rounded-full bg-copper/10 border border-copper flex items-center justify-center mx-auto text-copper">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-serif text-charcoal">Account Created Successfully</h3>
              <p className="text-xs text-mutedText font-sans max-w-sm mx-auto">
                Welcome to S-ARC! We are initializing your personal dashboard and architectural drawing vault...
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Row 1: Full Name & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-mutedText mb-1.5 font-sans">
                    Full Name <span className="text-copper">*</span>
                  </label>
                  <input
                    {...register("fullName")}
                    type="text"
                    placeholder="e.g. Anandha Krishnan"
                    className="w-full border border-warm-border p-3 text-xs text-charcoal outline-none focus:border-charcoal bg-warm-card font-sans transition-colors rounded-xl"
                  />
                  {errors.fullName && (
                    <span className="text-[11px] text-red-500 mt-1 block font-sans">
                      {errors.fullName.message}
                    </span>
                  )}
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-mutedText mb-1.5 font-sans">
                    Email Address <span className="text-copper">*</span>
                  </label>
                  <input
                    {...register("email")}
                    type="email"
                    placeholder="name@domain.com"
                    className="w-full border border-warm-border p-3 text-xs text-charcoal outline-none focus:border-charcoal bg-warm-card font-sans transition-colors rounded-xl"
                  />
                  {errors.email && (
                    <span className="text-[11px] text-red-500 mt-1 block font-sans">
                      {errors.email.message}
                    </span>
                  )}
                </div>
              </div>

              {/* Row 2: Phone Number */}
              <div>
                <label className="block text-[11px] uppercase tracking-wider text-mutedText mb-1.5 font-sans">
                  Mobile Number (WhatsApp Enabled) <span className="text-copper">*</span>
                </label>
                <div className="flex">
                  <span className="inline-flex items-center px-3 border border-r-0 border-warm-border bg-warm-grey text-xs text-secondaryText font-mono rounded-l-xl">
                    +91
                  </span>
                  <input
                    {...register("phone")}
                    type="tel"
                    placeholder="98765 43210"
                    className="w-full border border-warm-border p-3 text-xs text-charcoal outline-none focus:border-charcoal bg-warm-card font-sans transition-colors rounded-r-xl"
                  />
                </div>
                {errors.phone && (
                  <span className="text-[11px] text-red-500 mt-1 block font-sans">
                    {errors.phone.message}
                  </span>
                )}
              </div>

              {/* Conditional Fields: Architect Profile */}
              {selectedRole === "architect" && (
                <div className="p-4 bg-warm-grey/60 border border-copper/30 space-y-3.5 animate-fadeIn rounded-2xl">
                  <div className="flex items-center gap-2 text-xs font-semibold text-charcoal font-sans">
                    <BadgeCheck className="w-4 h-4 text-copper" />
                    <span>Council of Architecture (COA) Credentials</span>
                  </div>

                  <div>
                    <label className="block text-[11px] uppercase tracking-wider text-mutedText mb-1 font-sans">
                      Studio / Architectural Practice Name <span className="text-copper">*</span>
                    </label>
                    <input
                      {...register("studioName")}
                      type="text"
                      placeholder="e.g. Monsoon Atelier / Studio Vistar"
                      className="w-full border border-warm-border p-2.5 text-xs text-charcoal outline-none focus:border-charcoal bg-white font-sans rounded-xl"
                    />
                    {errors.studioName && (
                      <span className="text-[11px] text-red-500 mt-1 block font-sans">
                        {errors.studioName.message}
                      </span>
                    )}
                  </div>

                  <div>
                    <label className="block text-[11px] uppercase tracking-wider text-mutedText mb-1 font-sans">
                      COA Registration Number <span className="text-copper">*</span>
                    </label>
                    <input
                      {...register("coaRegNumber")}
                      type="text"
                      placeholder="CA/2018/98765"
                      className="w-full border border-warm-border p-2.5 text-xs text-charcoal outline-none focus:border-charcoal bg-white font-mono uppercase rounded-xl"
                    />
                    {errors.coaRegNumber && (
                      <span className="text-[11px] text-red-500 mt-1 block font-sans">
                        {errors.coaRegNumber.message}
                      </span>
                    )}
                    <span className="text-[10px] text-mutedText mt-1 block font-sans">
                      Verified against the National Council of Architecture gazette within 24 hours.
                    </span>
                  </div>
                </div>
              )}

              {/* Conditional Fields: Contractor Profile */}
              {selectedRole === "contractor" && (
                <div className="p-4 bg-warm-grey/60 border border-copper/30 space-y-3.5 animate-fadeIn rounded-2xl">
                  <div className="flex items-center gap-2 text-xs font-semibold text-charcoal font-sans">
                    <HardHat className="w-4 h-4 text-copper" />
                    <span>Contracting Firm Details</span>
                  </div>

                  <div>
                    <label className="block text-[11px] uppercase tracking-wider text-mutedText mb-1 font-sans">
                      Company / Contracting Entity Name <span className="text-copper">*</span>
                    </label>
                    <input
                      {...register("companyName")}
                      type="text"
                      placeholder="e.g. Travancore Civil & Turnkey Infrastructure"
                      className="w-full border border-warm-border p-2.5 text-xs text-charcoal outline-none focus:border-charcoal bg-white font-sans rounded-xl"
                    />
                    {errors.companyName && (
                      <span className="text-[11px] text-red-500 mt-1 block font-sans">
                        {errors.companyName.message}
                      </span>
                    )}
                  </div>

                  <div>
                    <label className="block text-[11px] uppercase tracking-wider text-mutedText mb-1 font-sans">
                      Primary Operating Region
                    </label>
                    <select
                      {...register("operatingRegion")}
                      className="w-full border border-warm-border p-2.5 text-xs text-charcoal outline-none focus:border-charcoal bg-white font-sans rounded-xl"
                    >
                      <option value="Kerala (All Districts)">Kerala (Kochi, Trivandrum, Calicut)</option>
                      <option value="Karnataka (Bengaluru Urban & Rural)">Karnataka (Bengaluru, Mysuru, Mangaluru)</option>
                      <option value="Tamil Nadu (Chennai, Coimbatore)">Tamil Nadu (Chennai, Coimbatore, Madurai)</option>
                      <option value="Telangana & AP (Hyderabad)">Telangana & AP (Hyderabad, Visakhapatnam)</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Row 3: Passwords */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-mutedText mb-1.5 font-sans">
                    Password <span className="text-copper">*</span>
                  </label>
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
                    <span className="text-[11px] text-red-500 mt-1 block font-sans">
                      {errors.password.message}
                    </span>
                  )}
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-mutedText mb-1.5 font-sans">
                    Confirm Password <span className="text-copper">*</span>
                  </label>
                  <div className="relative flex items-center">
                    <input
                      {...register("confirmPassword")}
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="••••••••••••"
                      className="w-full border border-warm-border p-3 pr-10 text-xs text-charcoal outline-none focus:border-charcoal bg-warm-card font-sans transition-colors rounded-xl"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 text-mutedText hover:text-charcoal"
                      aria-label="Toggle confirm password visibility"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <span className="text-[11px] text-red-500 mt-1 block font-sans">
                      {errors.confirmPassword.message}
                    </span>
                  )}
                </div>
              </div>

              {/* Terms Checkbox */}
              <div className="pt-1">
                <label className="flex items-start gap-2.5 cursor-pointer text-xs font-sans text-secondaryText leading-relaxed">
                  <input
                    {...register("termsAgreed")}
                    type="checkbox"
                    className="accent-copper rounded mt-0.5"
                  />
                  <span>
                    I agree to the{" "}
                    <Link href="/how-it-works" className="text-copper underline hover:text-charcoal">
                      S-ARC Architectural Licensing Terms
                    </Link>
                    , local municipality bylaw disclaimers (KMBR / BBMP), and Privacy Policy.
                  </span>
                </label>
                {errors.termsAgreed && (
                  <span className="text-[11px] text-red-500 mt-1 block font-sans">
                    {errors.termsAgreed.message}
                  </span>
                )}
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 bg-charcoal hover:bg-copper disabled:bg-charcoal/50 text-white text-xs font-sans font-medium tracking-wide flex items-center justify-center gap-2 transition-colors mt-2 rounded-xl"
              >
                <span>
                  {isSubmitting
                    ? "Setting up your account..."
                    : selectedRole === "architect"
                    ? "Apply as Architect Seller"
                    : selectedRole === "contractor"
                    ? "Register as Turnkey Contractor"
                    : "Create Homeowner Account"}
                </span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              {/* Or Divider */}
              <div className="relative py-2 flex items-center justify-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-warm-border" />
                </div>
                <span className="relative bg-white px-3 text-[10px] uppercase tracking-wider text-mutedText font-sans">
                  Or Quick Register With
                </span>
              </div>

              {/* Social Login Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => alert("Google OAuth integration activated for S-ARC.")}
                  className="py-2.5 px-3 border border-warm-border hover:border-charcoal text-charcoal text-xs font-sans font-medium flex items-center justify-center gap-2 transition-colors bg-white rounded-xl"
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
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

        {/* Right Column: Visual Architectural Showcase & Value Prop (6 cols) */}
        <div className="hidden lg:flex flex-col gap-6 lg:col-span-6">
          {/* Main Visual Box */}
          <div className="relative min-h-[420px] bg-charcoal overflow-hidden shadow-card rounded-3xl">
            <Image
              src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1600&q=85"
              alt="Tropical Kerala & Contemporary South Indian Architecture"
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/20" />

            {/* Quote Overlay */}
            <div className="absolute bottom-8 left-8 right-8 z-10 text-white space-y-2.5">
              <span className="text-[10px] tracking-widestExtra uppercase text-copper-light font-sans font-semibold">
                Curated Southern Architecture
              </span>
              <p className="text-xl font-serif font-normal leading-snug">
                &ldquo;Architecture in the South is not just shelter—it is how we capture cross-breezes, buffer the monsoon, and honor the land.&rdquo;
              </p>
              <div className="text-xs text-white/60 font-sans">
                Curating over 500+ site-tested blueprints across South India
              </div>
            </div>
          </div>

          {/* Dynamic Value Prop Cards based on Role */}
          <div className="p-6 bg-warm-grey border border-warm-border space-y-4 rounded-2xl">
            <div className="flex items-center gap-2 text-xs font-semibold text-charcoal font-sans uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-copper" />
              <span>
                {selectedRole === "architect"
                  ? "Architect Seller Advantages"
                  : selectedRole === "contractor"
                  ? "Turnkey Contractor Network"
                  : "Homeowner Membership Inclusions"}
              </span>
            </div>

            {selectedRole === "architect" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-sans text-secondaryText">
                <div className="flex items-start gap-2 bg-white p-3 border border-warm-border rounded-xl">
                  <FileCheck2 className="w-4 h-4 text-copper flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-charcoal block mb-0.5">85% Net Revenue</strong>
                    Keep the vast majority of plan sales with zero recurring listing fees.
                  </div>
                </div>
                <div className="flex items-start gap-2 bg-white p-3 border border-warm-border rounded-xl">
                  <BadgeCheck className="w-4 h-4 text-copper flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-charcoal block mb-0.5">COA Verified Seal</strong>
                    Elevate your studio reputation with verified peer recognition.
                  </div>
                </div>
              </div>
            )}

            {selectedRole === "contractor" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-sans text-secondaryText">
                <div className="flex items-start gap-2 bg-white p-3 border border-warm-border rounded-xl">
                  <Layers className="w-4 h-4 text-copper flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-charcoal block mb-0.5">Complete BOQ & Bar Schedules</strong>
                    Get access to accurate material quantities and BBS drawings.
                  </div>
                </div>
                <div className="flex items-start gap-2 bg-white p-3 border border-warm-border rounded-xl">
                  <HardHat className="w-4 h-4 text-copper flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-charcoal block mb-0.5">Verified Local Bidding</strong>
                    Bid directly on projects whose land bylaws are already cleared.
                  </div>
                </div>
              </div>
            )}

            {selectedRole === "homeowner" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-sans text-secondaryText">
                <div className="flex items-start gap-2 bg-white p-3 border border-warm-border rounded-xl">
                  <FileCheck2 className="w-4 h-4 text-copper flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-charcoal block mb-0.5">42-Sheet Drawing Sets</strong>
                    Full municipal submission, structural, MEP, and 3D architectural plans.
                  </div>
                </div>
                <div className="flex items-start gap-2 bg-white p-3 border border-warm-border rounded-xl">
                  <BadgeCheck className="w-4 h-4 text-copper flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-charcoal block mb-0.5">Bylaw Setback Compliance</strong>
                    Tailored for Kerala (KMBR) & South Indian municipal development codes.
                  </div>
                </div>
              </div>
            )}
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

