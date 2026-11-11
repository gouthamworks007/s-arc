"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { X, CheckCircle2, ArrowRight, ShieldCheck, AlertCircle, Loader2, Lock } from "lucide-react";
import { useAuth } from "@/lib/authContext";

const sellerSchema = z.object({
  fullName: z.string().min(3, "Full name must be at least 3 characters"),
  coaNumber: z
    .string()
    .min(5, "COA Registration number is required (e.g., CA/2019/12345)")
    .regex(/^CA\/\d{4}\/\d{4,6}$/i, "Format must follow standard COA style: CA/YYYY/XXXXX"),
  studioName: z.string().min(2, "Studio or firm name is required"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().optional(),
  phone: z.string().min(10, "Please enter a valid 10-digit phone number"),
  city: z.string().min(2, "Please enter your city and state"),
  portfolioUrl: z.string().url("Please enter a valid URL (https://...)"),
  styleSpecialty: z.string().min(1, "Please select your primary architectural style"),
  agreedToTerms: z.literal(true, {
    errorMap: () => ({ message: "You must accept the architect code of ethics" }),
  }),
});

type SellerFormValues = z.infer<typeof sellerSchema>;

interface SellerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SellerModal({ isOpen, onClose }: SellerModalProps) {
  const { isLoggedIn, currentUser, applyForArchitectUpgrade } = useAuth();
  const [submitted, setSubmitted] = useState(false);
  const [submittedCoa, setSubmittedCoa] = useState("");
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setError,
    setValue,
  } = useForm<SellerFormValues>({
    resolver: zodResolver(sellerSchema),
    defaultValues: {
      fullName: "",
      coaNumber: "CA/2020/54321",
      studioName: "",
      email: "",
      password: "",
      phone: "",
      city: "Kochi, Kerala",
      portfolioUrl: "https://",
      styleSpecialty: "Contemporary",
    },
  });

  // Prefill logged-in user details if available
  useEffect(() => {
    if (currentUser) {
      if (currentUser.name) setValue("fullName", currentUser.name);
      if (currentUser.email) setValue("email", currentUser.email);
      if (currentUser.phone) setValue("phone", currentUser.phone);
      if (currentUser.location) setValue("city", currentUser.location);
      if (currentUser.studioName) setValue("studioName", currentUser.studioName);
      if (currentUser.coaNumber) setValue("coaNumber", currentUser.coaNumber);
    }
  }, [currentUser, setValue]);

  // Keyboard accessibility and body scroll lock
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const onSubmit = async (data: SellerFormValues) => {
    setServerError(null);

    // If unauthenticated, ensure password was supplied
    if (!isLoggedIn) {
      if (!data.password || data.password.length < 6) {
        setError("password", { message: "Password must be at least 6 characters long." });
        return;
      }
    }

    try {
      if (isLoggedIn && currentUser) {
        // Authenticated user upgrade flow
        const res = await fetch("/api/users/upgrade-request", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            practiceType: "agency",
            studioName: data.studioName.trim(),
            coaNumber: data.coaNumber.trim().toUpperCase(),
            phone: data.phone.trim(),
            location: data.city.trim(),
            portfolioUrl: data.portfolioUrl.trim(),
            bio: `Specialty: ${data.styleSpecialty}. Studio: ${data.studioName}`,
          }),
        });

        const resData = await res.json();
        if (!res.ok) {
          throw new Error(resData.error || "Failed to submit architect verification request.");
        }

        applyForArchitectUpgrade({
          practiceType: "agency",
          studioName: data.studioName.trim(),
          coaNumber: data.coaNumber.trim().toUpperCase(),
          phone: data.phone.trim(),
          location: data.city.trim(),
          portfolioUrl: data.portfolioUrl.trim(),
          bio: `Specialty: ${data.styleSpecialty}. Studio: ${data.studioName}`,
        });

        setSubmittedCoa(data.coaNumber.trim().toUpperCase());
        setSubmitted(true);
      } else {
        // New account registration flow with subRole = 'architect'
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: data.fullName.trim(),
            email: data.email.trim().toLowerCase(),
            password: data.password,
            subRole: "architect",
            coaNumber: data.coaNumber.trim().toUpperCase(),
            studioName: data.studioName.trim(),
            phone: data.phone.trim(),
            location: data.city.trim(),
          }),
        });

        const resData = await res.json();
        if (!res.ok) {
          throw new Error(resData.error || "Registration failed. Please check your details.");
        }

        setSubmittedCoa(data.coaNumber.trim().toUpperCase());
        setSubmitted(true);
      }
    } catch (err: any) {
      console.error("Architect registration error:", err);
      setServerError(err.message || "An unexpected error occurred during submission.");
    }
  };

  const handleClose = () => {
    setSubmitted(false);
    setServerError(null);
    reset();
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="seller-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-md animate-fadeIn"
    >
      <div className="bg-white max-w-2xl w-full max-h-[92vh] overflow-y-auto border border-warm-border shadow-2xl relative rounded-3xl">
        {/* Header */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-warm-border z-30 px-6 py-4 flex items-center justify-between rounded-t-3xl">
          <div>
            <span className="text-[10px] tracking-widestExtra uppercase text-copper font-semibold">
              Partner with S-ARC
            </span>
            <h2 id="seller-modal-title" className="text-xl sm:text-2xl font-normal text-charcoal">
              Become a Contributing Architect
            </h2>
          </div>

          <button
            onClick={handleClose}
            className="w-9 h-9 min-h-[36px] min-w-[36px] rounded-full border border-warm-border hover:bg-warm-grey flex items-center justify-center text-charcoal transition-colors focus-visible:ring-2 focus-visible:ring-copper"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 sm:p-8">
          {submitted ? (
            <div className="text-center py-10 space-y-4">
              <div className="w-16 h-16 rounded-full bg-copper/10 border border-copper text-copper flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8 text-copper" />
              </div>
              <h3 className="text-2xl font-normal text-charcoal">Application Received</h3>
              <p className="text-[14px] text-secondaryText max-w-md mx-auto leading-relaxed">
                Thank you for applying to the S-ARC curated network. Your architect account has been registered with status{" "}
                <span className="font-mono font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  pending_verification
                </span>
                .
              </p>
              <div className="p-4 bg-warm-grey/50 rounded-2xl border border-warm-border max-w-md mx-auto text-left space-y-2 text-xs text-charcoal">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-copper" />
                  <span className="font-semibold">Next Steps:</span>
                </div>
                <p className="text-secondaryText">
                  Our verification committee will review your Council of Architecture credentials (
                  <strong className="text-charcoal font-mono">{submittedCoa}</strong>) within 48 business hours. You will receive an email confirmation once full publishing privileges are unlocked.
                </p>
              </div>
              <div className="pt-4">
                <button
                  onClick={handleClose}
                  className="px-6 py-2.5 rounded-full bg-charcoal hover:bg-copper text-white text-xs font-medium tracking-wide transition-colors"
                >
                  Return to Homepage
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <p className="text-[13px] text-secondaryText mb-2 leading-relaxed">
                Join our curated platform connecting certified architects across South India with homeowners looking for verified architectural plans.
              </p>

              {serverError && (
                <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <span>{serverError}</span>
                </div>
              )}

              {isLoggedIn ? (
                <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl text-xs text-charcoal flex items-center justify-between">
                  <span>
                    Submitting upgrade application for authenticated account: <strong>{currentUser?.email}</strong>
                  </span>
                  <span className="text-[11px] font-mono text-copper font-medium uppercase">Active Session</span>
                </div>
              ) : null}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Full Name */}
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-mutedText mb-1">
                    Full Legal Name *
                  </label>
                  <input
                    {...register("fullName")}
                    type="text"
                    placeholder="Ar. Vikram Menon"
                    className="w-full border border-warm-border p-2.5 text-xs text-charcoal outline-none focus:border-charcoal bg-warm-card rounded-xl"
                  />
                  {errors.fullName && (
                    <span className="text-[11px] text-red-500 mt-1 block">{errors.fullName.message}</span>
                  )}
                </div>

                {/* COA Number */}
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-mutedText mb-1 flex items-center gap-1">
                    <span>COA Reg. Number *</span>
                    <ShieldCheck className="w-3 h-3 text-copper" />
                  </label>
                  <input
                    {...register("coaNumber")}
                    type="text"
                    placeholder="CA/2019/12345"
                    className="w-full border border-warm-border p-2.5 text-xs text-charcoal outline-none focus:border-charcoal bg-warm-card uppercase rounded-xl font-mono"
                  />
                  {errors.coaNumber && (
                    <span className="text-[11px] text-red-500 mt-1 block">{errors.coaNumber.message}</span>
                  )}
                </div>

                {/* Studio Name */}
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-mutedText mb-1">
                    Studio / Firm Name *
                  </label>
                  <input
                    {...register("studioName")}
                    type="text"
                    placeholder="Atelier Vayu"
                    className="w-full border border-warm-border p-2.5 text-xs text-charcoal outline-none focus:border-charcoal bg-warm-card rounded-xl"
                  />
                  {errors.studioName && (
                    <span className="text-[11px] text-red-500 mt-1 block">{errors.studioName.message}</span>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-mutedText mb-1">
                    Official Email *
                  </label>
                  <input
                    {...register("email")}
                    type="email"
                    placeholder="architect@ateliervayu.com"
                    className="w-full border border-warm-border p-2.5 text-xs text-charcoal outline-none focus:border-charcoal bg-warm-card rounded-xl"
                  />
                  {errors.email && (
                    <span className="text-[11px] text-red-500 mt-1 block">{errors.email.message}</span>
                  )}
                </div>

                {/* Password (only if not logged in) */}
                {!isLoggedIn && (
                  <div>
                    <label className="block text-[11px] uppercase tracking-wider text-mutedText mb-1 flex items-center gap-1">
                      <span>Create Account Password *</span>
                      <Lock className="w-3 h-3 text-copper" />
                    </label>
                    <input
                      {...register("password")}
                      type="password"
                      placeholder="At least 6 characters"
                      className="w-full border border-warm-border p-2.5 text-xs text-charcoal outline-none focus:border-charcoal bg-warm-card rounded-xl"
                    />
                    {errors.password && (
                      <span className="text-[11px] text-red-500 mt-1 block">{errors.password.message}</span>
                    )}
                  </div>
                )}

                {/* Phone */}
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-mutedText mb-1">
                    Phone / WhatsApp *
                  </label>
                  <input
                    {...register("phone")}
                    type="tel"
                    placeholder="+91 98765 43210"
                    className="w-full border border-warm-border p-2.5 text-xs text-charcoal outline-none focus:border-charcoal bg-warm-card rounded-xl"
                  />
                  {errors.phone && (
                    <span className="text-[11px] text-red-500 mt-1 block">{errors.phone.message}</span>
                  )}
                </div>

                {/* City */}
                <div className={!isLoggedIn ? "" : "sm:col-span-2"}>
                  <label className="block text-[11px] uppercase tracking-wider text-mutedText mb-1">
                    Primary City / Practice *
                  </label>
                  <input
                    {...register("city")}
                    type="text"
                    placeholder="Kochi, Kerala"
                    className="w-full border border-warm-border p-2.5 text-xs text-charcoal outline-none focus:border-charcoal bg-warm-card rounded-xl"
                  />
                  {errors.city && (
                    <span className="text-[11px] text-red-500 mt-1 block">{errors.city.message}</span>
                  )}
                </div>
              </div>

              {/* Portfolio URL */}
              <div>
                <label className="block text-[11px] uppercase tracking-wider text-mutedText mb-1">
                  Portfolio Website or Behance / ArchDaily Profile *
                </label>
                <input
                  {...register("portfolioUrl")}
                  type="url"
                  placeholder="https://ateliervayu.com"
                  className="w-full border border-warm-border p-2.5 text-xs text-charcoal outline-none focus:border-charcoal bg-warm-card rounded-xl"
                />
                {errors.portfolioUrl && (
                  <span className="text-[11px] text-red-500 mt-1 block">{errors.portfolioUrl.message}</span>
                )}
              </div>

              {/* Style Specialty */}
              <div>
                <label className="block text-[11px] uppercase tracking-wider text-mutedText mb-1">
                  Primary Architectural Specialty *
                </label>
                <select
                  {...register("styleSpecialty")}
                  className="w-full border border-warm-border p-2.5 text-xs text-charcoal outline-none focus:border-charcoal bg-warm-card cursor-pointer rounded-xl"
                >
                  <option value="Contemporary">Contemporary Tropical</option>
                  <option value="Minimalist">Minimalist Modern</option>
                  <option value="Traditional">Traditional Vernacular (Nalukettu)</option>
                  <option value="Exposed Brick">Sustainable / Exposed Brick & Earth</option>
                  <option value="Mediterranean">Mediterranean Coastal</option>
                  <option value="Courtyard">Courtyard Architecture</option>
                </select>
                {errors.styleSpecialty && (
                  <span className="text-[11px] text-red-500 mt-1 block">{errors.styleSpecialty.message}</span>
                )}
              </div>

              {/* Agreement */}
              <div className="pt-2">
                <label className="flex items-start gap-2.5 cursor-pointer text-xs text-secondaryText">
                  <input
                    {...register("agreedToTerms")}
                    type="checkbox"
                    className="mt-0.5 accent-copper rounded"
                  />
                  <span>
                    I confirm that I am a licensed architect registered under the Council of Architecture (India) and agree to uphold S-ARC&apos;s architectural copyright and drawing standards.
                  </span>
                </label>
                {errors.agreedToTerms && (
                  <span className="text-[11px] text-red-500 mt-1 block">{errors.agreedToTerms.message}</span>
                )}
              </div>

              {/* Submit CTA */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 bg-copper hover:bg-copper-hover disabled:bg-copper/50 text-white text-xs font-medium tracking-wide flex items-center justify-center gap-2 transition-colors rounded-xl shadow-sm"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Submitting Application to D1...</span>
                    </>
                  ) : (
                    <>
                      <span>{isLoggedIn ? "Submit Upgrade Application" : "Create Architect Account"}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
