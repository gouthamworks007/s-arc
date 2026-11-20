"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  CheckCircle2,
  Building,
  Loader2,
  FileCheck2,
  Home,
  HardHat,
  Compass,
  MapPin,
  Ruler,
  Wallet,
  Calendar,
  Layers,
  Sparkles,
  Check,
  User,
} from "lucide-react";
import { useAuth } from "@/lib/authContext";
import GoogleAuthButton from "@/components/auth/GoogleAuthButton";

type PersonaType = "homeowner" | "architect" | "contractor";

// Districts in Kerala and major South Indian metros
const DISTRICTS = [
  "Ernakulam (Kochi)",
  "Thiruvananthapuram",
  "Thrissur",
  "Kozhikode (Calicut)",
  "Kottayam",
  "Kannur",
  "Palakkad",
  "Kollam",
  "Malappuram",
  "Alappuzha",
  "Pathanamthitta",
  "Wayanad",
  "Idukki",
  "Kasaragod",
  "Bengaluru (Karnataka)",
  "Coimbatore (Tamil Nadu)",
  "Chennai (Tamil Nadu)",
  "Other South India",
];

const PLOT_STATUS_OPTIONS = [
  { id: "owns_land", label: "Already Own Plot", hint: "Ready to design & build" },
  { id: "ancestral", label: "Ancestral Land", hint: "Demolishing or rebuilding" },
  { id: "buying_land", label: "Finalizing Purchase", hint: "Plot in deed registry" },
  { id: "exploring", label: "Looking for Land", hint: "Evaluating plot sizes" },
];

const PLOT_SIZE_PRESETS = [
  { value: "3-6", label: "3 to 6 Cents", sub: "Urban infill / compact" },
  { value: "6-10", label: "6 to 10 Cents", sub: "Standard residential" },
  { value: "10-15", label: "10 to 15 Cents", sub: "Spacious courtyard" },
  { value: "15-25", label: "15 to 25 Cents", sub: "Large villa plot" },
  { value: "25+", label: "25+ Cents", sub: "Estate / Acreage" },
];

const BUDGET_RANGES = [
  { id: "35L-55L", label: "₹35L - ₹55L" },
  { id: "55L-85L", label: "₹55L - ₹85L" },
  { id: "85L-1.5Cr", label: "₹85L - ₹1.5 Cr" },
  { id: "1.5Cr-3Cr", label: "₹1.5 Cr - ₹3 Cr" },
  { id: "3Cr+", label: "₹3 Cr+ (Ultra Luxury)" },
];

const TIMELINE_OPTIONS = [
  { id: "immediate", label: "Immediate (1 - 3 Months)" },
  { id: "medium", label: "3 - 6 Months" },
  { id: "year", label: "Within 1 Year" },
  { id: "researching", label: "Exploring / Researching" },
];

const ARCHITECTURAL_STYLES = [
  "Courtyard & Nalukettu",
  "Modern Tropical",
  "Exposed Brick Brutalism",
  "Contemporary Cantilever",
  "Kerala Heritage Colonial",
  "Urban Infill Minimalist",
];

const ARCH_SPECIALIZATIONS = [
  "Tropical Residential",
  "Modern Courtyard Homes",
  "Cantilever Luxury Villas",
  "Sustainable Bamboo / Earth",
  "Heritage Nalukettu Restoration",
  "Urban Infill & Tight Plots",
];

export default function SignupPage() {
  return (
    <React.Suspense fallback={<div className="min-h-screen bg-[#FDFBF7]" />}>
      <SignupContent />
    </React.Suspense>
  );
}

function SignupContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, currentUser } = useAuth();

  const isGoogleSignup = searchParams.get("google") === "1";
  const stepParam = searchParams.get("step");

  // Wizard Navigation: Step 1 = Basic Signup, Step 2 = Role & Details
  const [currentStep, setCurrentStep] = useState<1 | 2>(() => (stepParam === "2" || isGoogleSignup ? 2 : 1));

  // Step 1: Account Credentials
  const [fullName, setFullName] = useState(currentUser?.name || "");
  const [email, setEmail] = useState(currentUser?.email || "");
  const [phone, setPhone] = useState(currentUser?.phone || "");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [termsAgreed, setTermsAgreed] = useState(true);

  // Synchronize Google OAuth user details if returning from Google callback
  React.useEffect(() => {
    if (isGoogleSignup && currentUser) {
      if (currentUser.name && !fullName) setFullName(currentUser.name);
      if (currentUser.email && !email) setEmail(currentUser.email);
      setCurrentStep(2);
    }
  }, [isGoogleSignup, currentUser]);

  // Step 2: Role Selection (Customer / Homeowner by default)
  const [selectedPersona, setSelectedPersona] = useState<PersonaType>("homeowner");

  // Step 2: Customer / Homeowner Adaptive Fields
  const [plotStatus, setPlotStatus] = useState("owns_land");
  const [district, setDistrict] = useState("Ernakulam (Kochi)");
  const [plotSizePreset, setPlotSizePreset] = useState("6-10");
  const [customCents, setCustomCents] = useState("");
  const [budgetRange, setBudgetRange] = useState("85L-1.5Cr");
  const [timeline, setTimeline] = useState("immediate");
  const [preferredStyle, setPreferredStyle] = useState("Courtyard & Nalukettu");

  // Step 2: Architect Adaptive Fields
  const [practiceType, setPracticeType] = useState<"freelance" | "agency">("freelance");
  const [studioName, setStudioName] = useState("");
  const [coaNumber, setCoaNumber] = useState("");
  const [archBaseCity, setArchBaseCity] = useState("Kochi, Kerala");
  const [archSpecialization, setArchSpecialization] = useState("Tropical Residential");
  const [portfolioUrl, setPortfolioUrl] = useState("");

  // Step 2: Contractor Adaptive Fields
  const [contractorFirm, setContractorFirm] = useState("");
  const [contractorDistricts, setContractorDistricts] = useState("Ernakulam (Kochi)");
  const [contractorCapacity, setContractorCapacity] = useState("4 - 8 Projects / Year");
  const [contractorExperience, setContractorExperience] = useState("5 - 10 Years");
  const [gstNumber, setGstNumber] = useState("");

  // Common submission & error states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [step1Errors, setStep1Errors] = useState<Record<string, string>>({});
  const [signupSuccess, setSignupSuccess] = useState(false);

  // Handle Step 1 Validation & Proceed to Step 2
  const handleProceedToStep2 = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};

    if (!fullName.trim() || fullName.trim().length < 2) {
      errors.fullName = "Please enter your name (minimum 2 characters)";
    }
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      errors.email = "Please enter a valid email address";
    }
    const cleanPhone = phone.trim().replace(/\s+/g, "");
    if (!cleanPhone || cleanPhone.length < 10) {
      errors.phone = "Please enter a valid 10-digit mobile number";
    }
    if (!password || password.length < 6) {
      errors.password = "Password must be at least 6 characters long";
    }
    if (password !== confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }
    if (!termsAgreed) {
      errors.terms = "You must agree to the platform terms and licensing bylaws to create an account.";
    }

    if (Object.keys(errors).length > 0) {
      setStep1Errors(errors);
      return;
    }

    setStep1Errors({});
    setErrorMessage(null);
    setCurrentStep(2);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Final Registration Submission
  const handleFinalSubmit = async (skipDetails = false) => {
    // Role-specific validation on Step 2
    if (!skipDetails) {
      if (selectedPersona === "architect") {
        if (!studioName.trim()) {
          setErrorMessage("Please enter your Studio or Practice Name.");
          return;
        }
        if (!coaNumber.trim() || !coaNumber.toUpperCase().startsWith("CA/")) {
          setErrorMessage("Please enter a valid Council of Architecture registration number (e.g. CA/2018/12345).");
          return;
        }
      } else if (selectedPersona === "contractor") {
        if (!contractorFirm.trim()) {
          setErrorMessage("Please enter your Contracting Firm / Company Name.");
          return;
        }
      }
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      // If user already authenticated via Google OAuth, update their profile directly
      if (isGoogleSignup && currentUser) {
        const updatePayload: any = {
          name: fullName.trim() || currentUser.name,
          phone: phone.trim() || currentUser.phone,
          subRole: selectedPersona,
          location: selectedPersona === "homeowner" ? district : selectedPersona === "architect" ? archBaseCity : contractorDistricts,
        };

        if (selectedPersona === "architect") {
          updatePayload.studioName = studioName.trim();
          updatePayload.coaNumber = coaNumber.trim().toUpperCase();
          updatePayload.bio = `${studioName.trim()} • ${archSpecialization} • Based in ${archBaseCity}`;
          updatePayload.reviewNotes = `Architect Credentials: CoA ${coaNumber.trim().toUpperCase()} submitted.`;
        } else if (selectedPersona === "contractor") {
          updatePayload.studioName = contractorFirm.trim();
          updatePayload.bio = `${contractorFirm.trim()} • Turnkey Construction (${contractorExperience}) • Capacity: ${contractorCapacity}`;
          updatePayload.reviewNotes = `Contractor Firm: ${contractorFirm.trim()} | Capacity: ${contractorCapacity}`;
        } else if (selectedPersona === "homeowner" && !skipDetails) {
          updatePayload.reviewNotes = `Homeowner Profile | Land: ${plotStatus} | Size: ${customCents.trim() || plotSizePreset} Cents | Budget: ${budgetRange}`;
        }

        const updateRes = await fetch(`/api/users/${encodeURIComponent(currentUser.id)}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatePayload),
        });
        const updateData = await updateRes.json();
        if (updateRes.ok && updateData.user) {
          const updated = {
            ...currentUser,
            ...updateData.user,
            subRole: selectedPersona,
            plotDetails: selectedPersona === "homeowner" && !skipDetails ? {
              status: plotStatus,
              district,
              cents: customCents.trim() || plotSizePreset,
              budgetRange,
              timeline,
              preferredStyle,
            } : undefined,
          };
          login(updated);
          setSignupSuccess(true);
          setTimeout(() => {
            router.push("/dashboard");
          }, 850);
          return;
        }
      }

      // Traditional email/password registration payload
      const payload: any = {
        name: fullName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        password,
        role: "user",
        subRole: selectedPersona,
      };

      if (selectedPersona === "homeowner") {
        payload.location = district;
        if (!skipDetails) {
          payload.plotDetails = {
            status: plotStatus,
            district,
            cents: customCents.trim() || plotSizePreset,
            budgetRange,
            timeline,
            preferredStyle,
          };
        }
      } else if (selectedPersona === "architect") {
        payload.location = archBaseCity;
        payload.coaNumber = coaNumber.trim().toUpperCase();
        payload.studioName = studioName.trim();
        payload.practiceType = practiceType;
        payload.portfolioUrl = portfolioUrl.trim();
        payload.bio = `${studioName.trim()} • ${archSpecialization} • Based in ${archBaseCity}`;
      } else if (selectedPersona === "contractor") {
        payload.location = contractorDistricts;
        payload.studioName = contractorFirm.trim();
        payload.contractorDetails = {
          firmName: contractorFirm.trim(),
          operatingDistricts: [contractorDistricts],
          capacityPerYear: contractorCapacity,
          yearsInPractice: contractorExperience,
          gstNumber: gstNumber.trim(),
        };
        payload.bio = `${contractorFirm.trim()} • Turnkey Construction (${contractorExperience}) • Capacity: ${contractorCapacity}`;
      }

      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();

      if (res.ok && result.user) {
        login(result.user);
        setSignupSuccess(true);
        setTimeout(() => {
          router.push("/dashboard");
        }, 850);
      } else {
        setErrorMessage(result.error || "Registration could not be completed. Please try again.");
      }
    } catch (err) {
      setErrorMessage("Service connection error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
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

        <div className="text-xs font-sans text-stone-500 flex items-center gap-2.5">
          <span className="hidden sm:inline">Already have an account?</span>
          <Link
            href="/login"
            className="px-3.5 py-1.5 rounded-full border border-warm-border hover:border-copper text-charcoal hover:text-copper font-medium transition-all text-xs inline-flex items-center"
          >
            Sign In
          </Link>
        </div>
      </header>

      {/* Main Split Layout */}
      <main
        id="main-content"
        className="flex-1 grid grid-cols-1 lg:grid-cols-12 max-w-7xl mx-auto w-full px-5 sm:px-8 py-6 sm:py-10 gap-8 lg:gap-12 items-start"
      >
        {/* Left Column: Form (7 cols on large screens) */}
        <div className="lg:col-span-7 w-full space-y-6">
          {/* Header & Subtitle */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-[11px] tracking-widestExtra uppercase text-copper font-medium font-mono">
                {currentStep === 1
                  ? "S-ARC Marketplace"
                  : selectedPersona === "homeowner"
                  ? "Customer & Landowner Setup"
                  : selectedPersona === "architect"
                  ? "Council of Architecture Network"
                  : "Turnkey Execution Partner"}
              </span>
              <span className="text-stone-300">•</span>
              <span className="text-[11px] font-mono text-stone-400">
                Step {currentStep} of 2
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-normal font-serif text-charcoal tracking-tight">
              {currentStep === 1
                ? "Create Your Account."
                : "Choose Your Role on S-ARC."}
            </h1>

            <p className="text-xs sm:text-sm text-secondaryText font-light font-sans leading-relaxed">
              {currentStep === 1
                ? "Enter your details to create your secure account on South India's architectural blueprint and design network."
                : "Select whether you are joining as a customer/landowner, a licensed architect, or a turnkey contractor to configure your experience."}
            </p>
          </div>

          {/* Stepper Progress Bar */}
          <div className="flex items-center gap-2">
            <div
              className={`flex-1 h-1.5 rounded-full transition-all duration-300 ${
                currentStep >= 1 ? "bg-copper" : "bg-stone-200"
              }`}
            />
            <div
              className={`flex-1 h-1.5 rounded-full transition-all duration-300 ${
                currentStep === 2 ? "bg-copper" : "bg-stone-200"
              }`}
            />
          </div>

          {signupSuccess ? (
            <div className="p-8 sm:p-12 bg-white border border-[#EAE5DC] text-center space-y-4 animate-fadeIn rounded-3xl shadow-sm">
              <div className="w-14 h-14 rounded-2xl bg-copper/10 border border-copper/30 flex items-center justify-center mx-auto text-copper shadow-sm">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h3 className="text-2xl font-serif text-charcoal">
                  Account Created Successfully
                </h3>
                <p className="text-xs text-mutedText font-sans">
                  {selectedPersona === "architect"
                    ? "Your studio profile is registered. Redirecting to your dashboard..."
                    : "Tailoring your matched architectural blueprints. Redirecting..."}
                </p>
              </div>
              <div className="pt-2 flex justify-center">
                <Loader2 className="w-5 h-5 animate-spin text-copper" />
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              {errorMessage && (
                <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs rounded-2xl font-sans flex items-start gap-2.5">
                  <div className="w-2 h-2 rounded-full bg-red-500 mt-1.5 shrink-0" />
                  <div className="leading-relaxed">{errorMessage}</div>
                </div>
              )}

              {/* ============================================================ */}
              {/* STEP 1: JUST BASIC SIGNUP (NO ROLE SELECTION FIRST)           */}
              {/* ============================================================ */}
              {currentStep === 1 && (
                <form
                  onSubmit={handleProceedToStep2}
                  className="space-y-5 bg-white p-6 sm:p-8 rounded-3xl border border-[#EAE5DC] shadow-sm animate-fadeIn"
                >
                  {/* Google Sign Up */}
                  <GoogleAuthButton variant="signup" redirectUrl="/signup?step=2&google=1" />

                  {/* Name */}
                  <div className="space-y-1">
                    <label className="block text-[11px] uppercase tracking-wider text-stone-500 font-sans font-medium">
                      Name
                    </label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Name"
                      className="w-full border border-[#DDD6CA] focus:border-charcoal p-3.5 text-xs text-charcoal outline-none bg-[#FAF9F6] font-sans transition-all rounded-xl focus:bg-white"
                    />
                    {step1Errors.fullName && (
                      <span className="text-[11px] text-red-500 font-sans block mt-1">
                        {step1Errors.fullName}
                      </span>
                    )}
                  </div>

                  {/* Email & Phone Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div className="space-y-1">
                      <label className="block text-[11px] uppercase tracking-wider text-stone-500 font-sans font-medium">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@domain.com"
                        className="w-full border border-[#DDD6CA] focus:border-charcoal p-3.5 text-xs text-charcoal outline-none bg-[#FAF9F6] font-sans transition-all rounded-xl focus:bg-white"
                      />
                      {step1Errors.email && (
                        <span className="text-[11px] text-red-500 font-sans block mt-1">
                          {step1Errors.email}
                        </span>
                      )}
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[11px] uppercase tracking-wider text-stone-500 font-sans font-medium">
                        Phone / WhatsApp
                      </label>
                      <div className="relative flex items-center">
                        <span className="absolute left-3.5 text-xs font-mono text-stone-500 select-none">
                          +91
                        </span>
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="98470 12345"
                          className="w-full border border-[#DDD6CA] focus:border-charcoal p-3.5 pl-12 text-xs text-charcoal outline-none bg-[#FAF9F6] font-sans transition-all rounded-xl focus:bg-white font-mono"
                        />
                      </div>
                      {step1Errors.phone && (
                        <span className="text-[11px] text-red-500 font-sans block mt-1">
                          {step1Errors.phone}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Password & Confirm Password Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div className="space-y-1">
                      <label className="block text-[11px] uppercase tracking-wider text-stone-500 font-sans font-medium">
                        Password
                      </label>
                      <div className="relative flex items-center">
                        <input
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          placeholder="••••••••••••"
                          className="w-full border border-[#DDD6CA] focus:border-charcoal p-3.5 pr-10 text-xs text-charcoal outline-none bg-[#FAF9F6] font-sans transition-all rounded-xl focus:bg-white"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3.5 text-stone-400 hover:text-stone-700"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      {step1Errors.password && (
                        <span className="text-[11px] text-red-500 font-sans block mt-1">
                          {step1Errors.password}
                        </span>
                      )}
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[11px] uppercase tracking-wider text-stone-500 font-sans font-medium">
                        Confirm Password
                      </label>
                      <div className="relative flex items-center">
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="••••••••••••"
                          className="w-full border border-[#DDD6CA] focus:border-charcoal p-3.5 pr-10 text-xs text-charcoal outline-none bg-[#FAF9F6] font-sans transition-all rounded-xl focus:bg-white"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3.5 text-stone-400 hover:text-stone-700"
                        >
                          {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      {step1Errors.confirmPassword && (
                        <span className="text-[11px] text-red-500 font-sans block mt-1">
                          {step1Errors.confirmPassword}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Terms & Licensing Agreement */}
                  <div className="pt-1">
                    <label className="flex items-start gap-2.5 cursor-pointer text-xs font-sans text-stone-600 leading-relaxed">
                      <input
                        type="checkbox"
                        checked={termsAgreed}
                        onChange={(e) => setTermsAgreed(e.target.checked)}
                        className="accent-copper rounded border-stone-300 w-4 h-4 mt-0.5"
                      />
                      <span>
                        I agree to the S-ARC{" "}
                        <span className="text-copper font-medium">
                          Platform Terms & Single-Build Licensing Bylaws
                        </span>
                        .
                      </span>
                    </label>
                    {step1Errors.terms && (
                      <span className="text-[11px] text-red-500 font-sans block mt-1">
                        {step1Errors.terms}
                      </span>
                    )}
                  </div>

                  {/* Step 1 CTA */}
                  <button
                    type="submit"
                    className="w-full py-4 bg-charcoal hover:bg-copper text-white text-xs font-sans font-medium tracking-wide flex items-center justify-center gap-2 transition-all rounded-2xl shadow-sm mt-3 group"
                  >
                    <span>Continue to Profile Setup</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </button>
                </form>
              )}

              {/* ============================================================ */}
              {/* STEP 2: THEN LATER ASK THEM TO BE CUSTOMER, ARCHITECT, ETC.  */}
              {/* ============================================================ */}
              {currentStep === 2 && (
                <div className="space-y-6 bg-white p-6 sm:p-8 rounded-3xl border border-[#EAE5DC] shadow-sm animate-fadeIn">
                  {/* Step 2 Back Navigation */}
                  <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                    <button
                      type="button"
                      onClick={() => {
                        setErrorMessage(null);
                        setCurrentStep(1);
                      }}
                      className="text-xs font-sans text-stone-500 hover:text-charcoal flex items-center gap-1.5 transition-colors"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Back to Account Info</span>
                    </button>

                    <div className="flex items-center gap-1.5 text-[11px] font-mono text-copper bg-copper/10 px-2.5 py-1 rounded-full">
                      <User className="w-3 h-3" />
                      <span>Hello, {fullName.split(" ")[0] || "User"}</span>
                    </div>
                  </div>

                  {/* Google Verified Notice */}
                  {isGoogleSignup && (
                    <div className="p-3.5 bg-blue-50/80 border border-blue-200 text-blue-900 text-xs rounded-2xl font-sans flex items-center justify-between gap-3 animate-fadeIn">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                        <span>
                          Connected Google Account:{" "}
                          <strong className="font-semibold">{currentUser?.email || email}</strong>
                        </span>
                      </div>
                      <span className="text-[10px] font-mono uppercase bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-medium">
                        Google Verified
                      </span>
                    </div>
                  )}

                  {/* Role Selector: Customer vs Architect vs Contractor */}
                  <div className="space-y-2.5">
                    <label className="block text-[11px] uppercase tracking-wider text-stone-500 font-sans font-medium">
                      Select Your Role / Purpose:
                    </label>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      {/* Option 1: Customer / Landowner */}
                      <button
                        type="button"
                        onClick={() => setSelectedPersona("homeowner")}
                        className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between gap-3 ${
                          selectedPersona === "homeowner"
                            ? "border-copper bg-copper/5 shadow-xs ring-1 ring-copper/40"
                            : "border-[#EAE5DC] bg-[#FAF9F6] hover:border-stone-300"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div
                            className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                              selectedPersona === "homeowner"
                                ? "bg-copper text-white"
                                : "bg-stone-200/80 text-stone-600"
                            }`}
                          >
                            <Home className="w-4 h-4" />
                          </div>
                          {selectedPersona === "homeowner" && (
                            <span className="w-2 h-2 rounded-full bg-copper" />
                          )}
                        </div>
                        <div>
                          <span className="text-xs font-serif font-semibold text-charcoal block">
                            Customer / Landowner
                          </span>
                          <span className="text-[10px] text-stone-500 font-sans leading-tight block mt-0.5">
                            Looking to design or build on my plot
                          </span>
                        </div>
                      </button>

                      {/* Option 2: Architect / Studio */}
                      <button
                        type="button"
                        onClick={() => setSelectedPersona("architect")}
                        className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between gap-3 ${
                          selectedPersona === "architect"
                            ? "border-copper bg-copper/5 shadow-xs ring-1 ring-copper/40"
                            : "border-[#EAE5DC] bg-[#FAF9F6] hover:border-stone-300"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div
                            className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                              selectedPersona === "architect"
                                ? "bg-copper text-white"
                                : "bg-stone-200/80 text-stone-600"
                            }`}
                          >
                            <Compass className="w-4 h-4" />
                          </div>
                          {selectedPersona === "architect" && (
                            <span className="w-2 h-2 rounded-full bg-copper" />
                          )}
                        </div>
                        <div>
                          <span className="text-xs font-serif font-semibold text-charcoal block">
                            Architect / Studio
                          </span>
                          <span className="text-[10px] text-stone-500 font-sans leading-tight block mt-0.5">
                            Publish blueprints & consult
                          </span>
                        </div>
                      </button>

                      {/* Option 3: Turnkey Contractor / Other */}
                      <button
                        type="button"
                        onClick={() => setSelectedPersona("contractor")}
                        className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between gap-3 ${
                          selectedPersona === "contractor"
                            ? "border-copper bg-copper/5 shadow-xs ring-1 ring-copper/40"
                            : "border-[#EAE5DC] bg-[#FAF9F6] hover:border-stone-300"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div
                            className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                              selectedPersona === "contractor"
                                ? "bg-copper text-white"
                                : "bg-stone-200/80 text-stone-600"
                            }`}
                          >
                            <HardHat className="w-4 h-4" />
                          </div>
                          {selectedPersona === "contractor" && (
                            <span className="w-2 h-2 rounded-full bg-copper" />
                          )}
                        </div>
                        <div>
                          <span className="text-xs font-serif font-semibold text-charcoal block">
                            Turnkey Contractor
                          </span>
                          <span className="text-[10px] text-stone-500 font-sans leading-tight block mt-0.5">
                            Execute residential construction
                          </span>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* -------------------------------------------------------- */}
                  {/* PERSONA A: CUSTOMER / LANDOWNER ADAPTIVE FIELDS          */}
                  {/* -------------------------------------------------------- */}
                  {selectedPersona === "homeowner" && (
                    <div className="space-y-6 pt-2">
                      <div className="border-t border-stone-100 pt-4 space-y-1">
                        <h4 className="text-sm font-serif font-semibold text-charcoal">
                          Your Building Project Profile (Optional)
                        </h4>
                        <p className="text-xs text-secondaryText font-sans">
                          Tell us about your plot to help architects & GIS calculate setbacks and recommend feasible blueprints.
                        </p>
                      </div>

                      {/* 1. Plot Status */}
                      <div className="space-y-2">
                        <label className="block text-[11px] uppercase tracking-wider text-stone-500 font-sans font-medium">
                          1. Land Ownership Status
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          {PLOT_STATUS_OPTIONS.map((item) => (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => setPlotStatus(item.id)}
                              className={`p-3 rounded-xl border text-left transition-all ${
                                plotStatus === item.id
                                  ? "border-copper bg-copper/5 text-charcoal font-medium ring-1 ring-copper/40"
                                  : "border-warm-border bg-[#FAF9F6] text-secondaryText hover:border-stone-300"
                              }`}
                            >
                              <div className="text-xs font-sans font-medium line-clamp-1">{item.label}</div>
                              <div className="text-[10px] text-mutedText font-sans mt-0.5 line-clamp-1">{item.hint}</div>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* 2. District & Plot Size in Cents */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* District */}
                        <div className="space-y-1.5">
                          <label className="block text-[11px] uppercase tracking-wider text-stone-500 font-sans font-medium flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-copper" />
                            <span>Plot District / Location</span>
                          </label>
                          <select
                            value={district}
                            onChange={(e) => setDistrict(e.target.value)}
                            className="w-full border border-[#DDD6CA] focus:border-charcoal p-3.5 text-xs text-charcoal outline-none bg-[#FAF9F6] font-sans transition-all rounded-xl focus:bg-white"
                          >
                            {DISTRICTS.map((d) => (
                              <option key={d} value={d}>
                                {d}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Custom Cents Input */}
                        <div className="space-y-1.5">
                          <label className="block text-[11px] uppercase tracking-wider text-stone-500 font-sans font-medium flex items-center gap-1">
                            <Ruler className="w-3 h-3 text-copper" />
                            <span>Approx. Plot Area (Cents)</span>
                          </label>
                          <div className="relative flex items-center">
                            <input
                              type="number"
                              step="0.1"
                              value={customCents}
                              onChange={(e) => setCustomCents(e.target.value)}
                              placeholder={`Preset: ${plotSizePreset} Cents`}
                              className="w-full border border-[#DDD6CA] focus:border-charcoal p-3.5 pr-14 text-xs text-charcoal outline-none bg-[#FAF9F6] font-sans transition-all rounded-xl focus:bg-white font-mono"
                            />
                            <span className="absolute right-3.5 text-xs font-mono text-stone-400 select-none">
                              Cents
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Plot Size Preset Chips */}
                      <div className="space-y-1.5">
                        <span className="text-[10px] text-stone-400 font-sans">
                          Or select standard Kerala residential plot ranges:
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {PLOT_SIZE_PRESETS.map((p) => (
                            <button
                              key={p.value}
                              type="button"
                              onClick={() => {
                                setPlotSizePreset(p.value);
                                setCustomCents("");
                              }}
                              className={`px-3 py-2 rounded-xl text-xs font-sans transition-all border ${
                                plotSizePreset === p.value && !customCents
                                  ? "bg-copper text-white border-copper shadow-xs font-medium"
                                  : "bg-[#FAF9F6] text-secondaryText border-warm-border hover:border-copper/40"
                              }`}
                            >
                              <span>{p.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* 3. Budget & Timeline */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Budget */}
                        <div className="space-y-2">
                          <label className="block text-[11px] uppercase tracking-wider text-stone-500 font-sans font-medium flex items-center gap-1">
                            <Wallet className="w-3 h-3 text-copper" />
                            <span>Target Construction Budget</span>
                          </label>
                          <div className="space-y-1.5">
                            {BUDGET_RANGES.map((b) => (
                              <button
                                key={b.id}
                                type="button"
                                onClick={() => setBudgetRange(b.id)}
                                className={`w-full px-3 py-2.5 rounded-xl border text-left text-xs font-sans transition-all flex items-center justify-between ${
                                  budgetRange === b.id
                                    ? "border-copper bg-copper/5 text-charcoal font-medium ring-1 ring-copper/40"
                                    : "border-warm-border bg-[#FAF9F6] text-secondaryText hover:border-stone-300"
                                }`}
                              >
                                <span>{b.label}</span>
                                {budgetRange === b.id && <Check className="w-3.5 h-3.5 text-copper" />}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Timeline */}
                        <div className="space-y-2">
                          <label className="block text-[11px] uppercase tracking-wider text-stone-500 font-sans font-medium flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-copper" />
                            <span>Construction Timeline</span>
                          </label>
                          <div className="space-y-1.5">
                            {TIMELINE_OPTIONS.map((t) => (
                              <button
                                key={t.id}
                                type="button"
                                onClick={() => setTimeline(t.id)}
                                className={`w-full px-3 py-2.5 rounded-xl border text-left text-xs font-sans transition-all flex items-center justify-between ${
                                  timeline === t.id
                                    ? "border-copper bg-copper/5 text-charcoal font-medium ring-1 ring-copper/40"
                                    : "border-warm-border bg-[#FAF9F6] text-secondaryText hover:border-stone-300"
                                }`}
                              >
                                <span>{t.label}</span>
                                {timeline === t.id && <Check className="w-3.5 h-3.5 text-copper" />}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* 4. Preferred Architectural Style */}
                      <div className="space-y-2">
                        <label className="block text-[11px] uppercase tracking-wider text-stone-500 font-sans font-medium flex items-center gap-1">
                          <Layers className="w-3 h-3 text-copper" />
                          <span>Preferred Architectural Style</span>
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {ARCHITECTURAL_STYLES.map((style) => (
                            <button
                              key={style}
                              type="button"
                              onClick={() => setPreferredStyle(style)}
                              className={`p-2.5 rounded-xl border text-center text-xs font-sans transition-all ${
                                preferredStyle === style
                                  ? "border-copper bg-copper/10 text-charcoal font-medium ring-1 ring-copper/40 shadow-xs"
                                  : "border-warm-border bg-[#FAF9F6] text-secondaryText hover:border-stone-300"
                              }`}
                            >
                              <span>{style}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Customer Actions */}
                      <div className="space-y-3 pt-4 border-t border-stone-100">
                        <button
                          type="button"
                          disabled={isSubmitting}
                          onClick={() => handleFinalSubmit(false)}
                          className="w-full py-4 bg-charcoal hover:bg-copper disabled:bg-charcoal/60 text-white text-xs font-sans font-medium tracking-wide flex items-center justify-center gap-2 transition-all rounded-2xl shadow-sm"
                        >
                          {isSubmitting ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin text-white/80" />
                              <span>Creating Customer Account...</span>
                            </>
                          ) : (
                            <>
                              <span>Complete Registration & Explore Plans</span>
                              <ArrowRight className="w-4 h-4" />
                            </>
                          )}
                        </button>

                        <div className="text-center">
                          <button
                            type="button"
                            onClick={() => handleFinalSubmit(true)}
                            disabled={isSubmitting}
                            className="text-xs font-sans text-stone-500 hover:text-charcoal underline transition-colors"
                          >
                            I&apos;m just browsing — continue as Customer without plot details
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* -------------------------------------------------------- */}
                  {/* PERSONA B: ARCHITECT ADAPTIVE FIELDS                     */}
                  {/* -------------------------------------------------------- */}
                  {selectedPersona === "architect" && (
                    <div className="space-y-5 pt-2">
                      <div className="border-t border-stone-100 pt-4 space-y-1">
                        <h4 className="text-sm font-serif font-semibold text-charcoal">
                          Council of Architecture (COA) Verification
                        </h4>
                        <p className="text-xs text-secondaryText font-sans">
                          Publish CAD blueprint packages with 90% licensing revenue retention.
                        </p>
                      </div>

                      {/* Practice Type */}
                      <div className="space-y-2">
                        <label className="block text-[11px] uppercase tracking-wider text-stone-500 font-sans font-medium">
                          Practice Type
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                          <button
                            type="button"
                            onClick={() => setPracticeType("freelance")}
                            className={`p-3 rounded-xl border text-left transition-all ${
                              practiceType === "freelance"
                                ? "border-copper bg-copper/5 text-charcoal font-medium ring-1 ring-copper/40"
                                : "border-warm-border bg-[#FAF9F6] text-secondaryText hover:border-stone-300"
                            }`}
                          >
                            <span className="text-xs font-serif font-semibold block">Independent Architect</span>
                            <span className="text-[10px] text-mutedText font-sans block mt-0.5">Solo practice / Freelance</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setPracticeType("agency")}
                            className={`p-3 rounded-xl border text-left transition-all ${
                              practiceType === "agency"
                                ? "border-copper bg-copper/5 text-charcoal font-medium ring-1 ring-copper/40"
                                : "border-warm-border bg-[#FAF9F6] text-secondaryText hover:border-stone-300"
                            }`}
                          >
                            <span className="text-xs font-serif font-semibold block">Architectural Studio / Firm</span>
                            <span className="text-[10px] text-mutedText font-sans block mt-0.5">Firm or partnership practice</span>
                          </button>
                        </div>
                      </div>

                      {/* Studio Name & COA Number */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="block text-[11px] uppercase tracking-wider text-stone-500 font-sans font-medium">
                            Studio or Practice Name *
                          </label>
                          <input
                            type="text"
                            value={studioName}
                            onChange={(e) => setStudioName(e.target.value)}
                            placeholder="e.g. Studio Vayu Architecture"
                            className="w-full border border-[#DDD6CA] focus:border-charcoal p-3.5 text-xs text-charcoal outline-none bg-[#FAF9F6] font-sans transition-all rounded-xl focus:bg-white"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="block text-[11px] uppercase tracking-wider text-stone-500 font-sans font-medium">
                            COA Registration Number *
                          </label>
                          <input
                            type="text"
                            value={coaNumber}
                            onChange={(e) => setCoaNumber(e.target.value)}
                            placeholder="e.g. CA/2018/89124"
                            className="w-full border border-[#DDD6CA] focus:border-charcoal p-3.5 text-xs text-charcoal outline-none bg-[#FAF9F6] font-sans transition-all rounded-xl focus:bg-white font-mono uppercase"
                          />
                        </div>
                      </div>

                      {/* Base City & Portfolio Link */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="block text-[11px] uppercase tracking-wider text-stone-500 font-sans font-medium">
                            Studio Base Location
                          </label>
                          <input
                            type="text"
                            value={archBaseCity}
                            onChange={(e) => setArchBaseCity(e.target.value)}
                            placeholder="e.g. Kochi, Kerala"
                            className="w-full border border-[#DDD6CA] focus:border-charcoal p-3.5 text-xs text-charcoal outline-none bg-[#FAF9F6] font-sans transition-all rounded-xl focus:bg-white"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="block text-[11px] uppercase tracking-wider text-stone-500 font-sans font-medium">
                            Portfolio / Website URL (Optional)
                          </label>
                          <input
                            type="url"
                            value={portfolioUrl}
                            onChange={(e) => setPortfolioUrl(e.target.value)}
                            placeholder="https://studiovayu.arch"
                            className="w-full border border-[#DDD6CA] focus:border-charcoal p-3.5 text-xs text-charcoal outline-none bg-[#FAF9F6] font-sans transition-all rounded-xl focus:bg-white"
                          />
                        </div>
                      </div>

                      {/* Primary Specialization */}
                      <div className="space-y-2">
                        <label className="block text-[11px] uppercase tracking-wider text-stone-500 font-sans font-medium">
                          Primary Design Specialization
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {ARCH_SPECIALIZATIONS.map((spec) => (
                            <button
                              key={spec}
                              type="button"
                              onClick={() => setArchSpecialization(spec)}
                              className={`p-2.5 rounded-xl border text-center text-xs font-sans transition-all ${
                                archSpecialization === spec
                                  ? "border-copper bg-copper/10 text-charcoal font-medium ring-1 ring-copper/40"
                                  : "border-warm-border bg-[#FAF9F6] text-secondaryText hover:border-stone-300"
                              }`}
                            >
                              <span>{spec}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Architect Actions */}
                      <div className="pt-4 border-t border-stone-100">
                        <button
                          type="button"
                          disabled={isSubmitting}
                          onClick={() => handleFinalSubmit(false)}
                          className="w-full py-4 bg-charcoal hover:bg-copper disabled:bg-charcoal/60 text-white text-xs font-sans font-medium tracking-wide flex items-center justify-center gap-2 transition-all rounded-2xl shadow-sm"
                        >
                          {isSubmitting ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin text-white/80" />
                              <span>Submitting Credentials...</span>
                            </>
                          ) : (
                            <>
                              <span>Submit for Council of Architecture Review</span>
                              <ArrowRight className="w-4 h-4" />
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* -------------------------------------------------------- */}
                  {/* PERSONA C: CONTRACTOR ADAPTIVE FIELDS                    */}
                  {/* -------------------------------------------------------- */}
                  {selectedPersona === "contractor" && (
                    <div className="space-y-5 pt-2">
                      <div className="border-t border-stone-100 pt-4 space-y-1">
                        <h4 className="text-sm font-serif font-semibold text-charcoal">
                          Turnkey Contractor & Builder Profile
                        </h4>
                        <p className="text-xs text-secondaryText font-sans">
                          Receive engineered CAD drawings with rebar BOQ schedules and verified client leads.
                        </p>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[11px] uppercase tracking-wider text-stone-500 font-sans font-medium">
                          Contracting Firm / Company Name *
                        </label>
                        <input
                          type="text"
                          value={contractorFirm}
                          onChange={(e) => setContractorFirm(e.target.value)}
                          placeholder="e.g. Apex Built Turnkey Contracting"
                          className="w-full border border-[#DDD6CA] focus:border-charcoal p-3.5 text-xs text-charcoal outline-none bg-[#FAF9F6] font-sans transition-all rounded-xl focus:bg-white"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="block text-[11px] uppercase tracking-wider text-stone-500 font-sans font-medium">
                            Operating District(s)
                          </label>
                          <select
                            value={contractorDistricts}
                            onChange={(e) => setContractorDistricts(e.target.value)}
                            className="w-full border border-[#DDD6CA] focus:border-charcoal p-3.5 text-xs text-charcoal outline-none bg-[#FAF9F6] font-sans transition-all rounded-xl focus:bg-white"
                          >
                            {DISTRICTS.map((d) => (
                              <option key={d} value={d}>
                                {d}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="block text-[11px] uppercase tracking-wider text-stone-500 font-sans font-medium">
                            Years in Construction Practice
                          </label>
                          <select
                            value={contractorExperience}
                            onChange={(e) => setContractorExperience(e.target.value)}
                            className="w-full border border-[#DDD6CA] focus:border-charcoal p-3.5 text-xs text-charcoal outline-none bg-[#FAF9F6] font-sans transition-all rounded-xl focus:bg-white"
                          >
                            <option value="1 - 3 Years">1 - 3 Years</option>
                            <option value="3 - 5 Years">3 - 5 Years</option>
                            <option value="5 - 10 Years">5 - 10 Years</option>
                            <option value="10+ Years">10+ Years</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="block text-[11px] uppercase tracking-wider text-stone-500 font-sans font-medium">
                            Annual Turnkey Capacity
                          </label>
                          <select
                            value={contractorCapacity}
                            onChange={(e) => setContractorCapacity(e.target.value)}
                            className="w-full border border-[#DDD6CA] focus:border-charcoal p-3.5 text-xs text-charcoal outline-none bg-[#FAF9F6] font-sans transition-all rounded-xl focus:bg-white"
                          >
                            <option value="1 - 3 Projects / Year">1 - 3 Projects / Year</option>
                            <option value="4 - 8 Projects / Year">4 - 8 Projects / Year</option>
                            <option value="8 - 15 Projects / Year">8 - 15 Projects / Year</option>
                            <option value="15+ Projects / Year">15+ Projects / Year</option>
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="block text-[11px] uppercase tracking-wider text-stone-500 font-sans font-medium">
                            GST / Trade License (Optional)
                          </label>
                          <input
                            type="text"
                            value={gstNumber}
                            onChange={(e) => setGstNumber(e.target.value)}
                            placeholder="e.g. 32AAAAA0000A1Z5"
                            className="w-full border border-[#DDD6CA] focus:border-charcoal p-3.5 text-xs text-charcoal outline-none bg-[#FAF9F6] font-sans transition-all rounded-xl focus:bg-white font-mono uppercase"
                          />
                        </div>
                      </div>

                      {/* Contractor Actions */}
                      <div className="pt-4 border-t border-stone-100">
                        <button
                          type="button"
                          disabled={isSubmitting}
                          onClick={() => handleFinalSubmit(false)}
                          className="w-full py-4 bg-charcoal hover:bg-copper disabled:bg-charcoal/60 text-white text-xs font-sans font-medium tracking-wide flex items-center justify-center gap-2 transition-all rounded-2xl shadow-sm"
                        >
                          {isSubmitting ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin text-white/80" />
                              <span>Registering Contractor Profile...</span>
                            </>
                          ) : (
                            <>
                              <span>Complete Contractor Registration</span>
                              <ArrowRight className="w-4 h-4" />
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Trust badge under form */}
          <div className="pt-1 text-[11px] text-stone-400 font-sans flex items-center justify-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5 text-copper shrink-0" />
            <span>256-bit encrypted authentication • Council of Architecture India compliance</span>
          </div>
        </div>

        {/* Right Column: Adaptive Editorial Showcase (5 cols) */}
        <div className="hidden lg:block lg:col-span-5 space-y-6 sticky top-24">
          <div className="relative min-h-[380px] bg-charcoal rounded-3xl overflow-hidden shadow-card border border-stone-200/60">
            <Image
              src={
                currentStep === 1 || selectedPersona === "homeowner"
                  ? "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=85"
                  : selectedPersona === "architect"
                  ? "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=85"
                  : "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=85"
              }
              alt="Architecture Showcase"
              fill
              className="object-cover transition-all duration-700"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/10" />

            <div className="absolute bottom-8 left-8 right-8 text-white space-y-2">
              <span className="text-[10px] tracking-widestExtra uppercase text-copper-light font-mono">
                {currentStep === 1 || selectedPersona === "homeowner"
                  ? "Verified South Indian Blueprints"
                  : selectedPersona === "architect"
                  ? "Architect Licensing Network"
                  : "Turnkey Execution Partner"}
              </span>

              <h3 className="text-xl font-serif">
                {currentStep === 1 || selectedPersona === "homeowner"
                  ? "Curated Regional Living Spaces"
                  : selectedPersona === "architect"
                  ? "Monetize Verified Blueprints"
                  : "Turnkey Execution Pipeline"}
              </h3>

              <p className="text-xs text-white/70 leading-relaxed font-sans">
                {currentStep === 1 || selectedPersona === "homeowner"
                  ? "Every residential plan includes fully engineered structural schedules, MEP layouts, and Vastu compliance audits designed for Southern climatic zones."
                  : selectedPersona === "architect"
                  ? "Sell construction-ready 42-sheet CAD packages to landowners across South India while retaining 90% licensing revenue under single-build copyright."
                  : "Access pre-engineered CAD drawing sets with complete BOQ schedules and connect with pre-screened landowners with sanctioned plots."}
              </p>
            </div>
          </div>

          {/* Benefits Grid */}
          <div className="grid grid-cols-2 gap-3.5">
            <div className="p-4 bg-white border border-[#EAE5DC] rounded-2xl space-y-1.5">
              <div className="w-8 h-8 rounded-xl bg-copper/10 text-copper flex items-center justify-center mb-1">
                <FileCheck2 className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-serif font-semibold text-charcoal">
                {currentStep === 1 || selectedPersona === "homeowner"
                  ? "42-Sheet CAD Packages"
                  : selectedPersona === "architect"
                  ? "90% Royalty Retention"
                  : "Complete Structural BOQ"}
              </h4>
              <p className="text-[11px] text-stone-500 font-sans leading-tight">
                {currentStep === 1 || selectedPersona === "homeowner"
                  ? "Complete turnkey architectural documentation ready for municipal sanction."
                  : selectedPersona === "architect"
                  ? "Retain maximum revenue with automated single-build licensing contracts."
                  : "Accurate rebar and concrete takeoffs eliminate site estimate discrepancies."}
              </p>
            </div>

            <div className="p-4 bg-white border border-[#EAE5DC] rounded-2xl space-y-1.5">
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-700 flex items-center justify-center mb-1">
                <Building className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-serif font-semibold text-charcoal">
                {currentStep === 1 || selectedPersona === "homeowner"
                  ? "Direct Studio Connect"
                  : selectedPersona === "architect"
                  ? "Vetted Client Briefs"
                  : "Milestone Escrow"}
              </h4>
              <p className="text-[11px] text-stone-500 font-sans leading-tight">
                {currentStep === 1 || selectedPersona === "homeowner"
                  ? "Consult directly with verified design studios and turnkey builders."
                  : selectedPersona === "architect"
                  ? "Receive inquiries from verified landowners with documented plot boundaries."
                  : "Secured milestone billing through the platform guarantees on-time contractor payments."}
              </p>
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
