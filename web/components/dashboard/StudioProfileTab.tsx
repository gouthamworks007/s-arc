"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useProjects } from "@/lib/projectsContext";
import { useAuth } from "@/lib/authContext";
import { 
  ShieldCheck, 
  Award, 
  MapPin, 
  Mail, 
  Phone, 
  Building2, 
  Check, 
  Sparkles,
  Plus,
  Trash2,
  AlertCircle,
  Loader2,
  Upload,
  Camera,
  FileText
} from "lucide-react";

export default function StudioProfileTab() {
  const { profile, updateProfile } = useProjects();
  const { currentUser } = useAuth();

  const [studio, setStudio] = useState(currentUser?.studioName || profile.studio || "");
  const [name, setName] = useState(currentUser?.name || profile.name || "");
  const [coaNumber, setCoaNumber] = useState(currentUser?.coaNumber || profile.coaNumber || "");
  const [location, setLocation] = useState(currentUser?.location || profile.location || "");
  const [bio, setBio] = useState(currentUser?.bio || profile.bio || "");
  const [email, setEmail] = useState(currentUser?.email || profile.email || "");
  const [phone, setPhone] = useState(currentUser?.phone || profile.phone || "");
  const [image, setImage] = useState(currentUser?.avatar || profile.image || "");
  const [coverImage, setCoverImage] = useState(profile.coverImage || "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80");
  const [specialization, setSpecialization] = useState(profile.specialization || "");
  const [awards, setAwards] = useState<string[]>(profile.awards || []);
  const [newAward, setNewAward] = useState("");
  
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Upload States
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleUpload = async (
    file: File,
    category: "avatars" | "imagery" | "documents",
    onComplete: (url: string) => void,
    setLoading: (l: boolean) => void
  ) => {
    setLoading(true);
    setUploadError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("category", category);
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      onComplete(data.url);
    } catch (e: any) {
      setUploadError(e.message || "Failed to upload file");
    } finally {
      setLoading(false);
    }
  };

  // Sync state if currentUser loads or changes, or fetch fresh profile from D1
  useEffect(() => {
    if (!currentUser?.id) return;

    let isMounted = true;
    async function loadFreshProfile() {
      try {
        const res = await fetch(`/api/users/${encodeURIComponent(currentUser!.id)}`);
        if (res.ok) {
          const data = await res.json();
          if (data.user && isMounted) {
            const u = data.user;
            if (u.studioName) setStudio(u.studioName);
            if (u.name) setName(u.name);
            if (u.coaNumber) setCoaNumber(u.coaNumber);
            if (u.location) setLocation(u.location);
            if (u.bio) setBio(u.bio);
            if (u.email) setEmail(u.email);
            if (u.phone) setPhone(u.phone);
            if (u.avatar) setImage(u.avatar);
          }
        }
      } catch (e) {
        console.warn("Could not fetch fresh user profile from D1:", e);
      }
    }

    loadFreshProfile();
    return () => {
      isMounted = false;
    };
  }, [currentUser?.id]);

  const handleAddAward = () => {
    if (!newAward.trim()) return;
    setAwards([...awards, newAward.trim()]);
    setNewAward("");
  };

  const handleRemoveAward = (idx: number) => {
    setAwards(awards.filter((_, i) => i !== idx));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setErrorMessage(null);
    setSavedSuccess(false);

    try {
      const targetUserId = currentUser?.id || "usr-arch-01";

      const res = await fetch(`/api/users/${encodeURIComponent(targetUserId)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          studio_name: studio.trim(),
          coa_number: coaNumber.trim(),
          location: location.trim(),
          bio: bio.trim(),
          phone: phone.trim(),
          avatar: image.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to update profile in Cloudflare D1.");
      }

      // Also update local context for real-time reactivity in UI components
      updateProfile({
        studio,
        name,
        coaNumber,
        location,
        bio,
        email,
        phone,
        image,
        coverImage,
        specialization,
        awards,
      });

      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err: any) {
      console.error("Profile save error:", err);
      setErrorMessage(err.message || "An unexpected error occurred while saving.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-warm-border">
        <div>
          <h2 className="text-2xl font-serif font-normal text-charcoal">
            Studio Profile & Verified Credentials
          </h2>
          <p className="text-xs text-secondaryText font-sans mt-0.5">
            Manage your public architectural practice profile, Council of Architecture (COA) credentials, and studio philosophy. Changes are synchronized directly to Cloudflare D1.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {savedSuccess && (
            <span className="text-xs text-emerald-700 font-medium flex items-center gap-1.5 animate-in fade-in bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200">
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span>Saved to D1 Database</span>
            </span>
          )}

          {errorMessage && (
            <span className="text-xs text-red-600 font-medium flex items-center gap-1.5 bg-red-50 px-3 py-1.5 rounded-full border border-red-200">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{errorMessage}</span>
            </span>
          )}

          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="px-6 py-2 rounded-full bg-copper hover:bg-copper-hover disabled:bg-copper/60 text-white text-xs font-medium tracking-wide flex items-center gap-2 transition-all shadow-sm"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving to D1...</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>Save Profile</span>
              </>
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Inputs (2 Columns) */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleSave} className="space-y-6">
            {/* Studio & Architect Name */}
            <div className="p-6 bg-white border border-warm-border rounded-3xl space-y-5">
              <h3 className="text-base font-serif font-normal text-charcoal flex items-center gap-2">
                <Building2 className="w-4 h-4 text-copper" />
                <span>Practice Identity</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-charcoal mb-1.5 font-sans">
                    Practice / Studio Name
                  </label>
                  <input
                    type="text"
                    value={studio}
                    onChange={(e) => setStudio(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-warm-border text-xs text-charcoal focus:outline-none focus:border-copper"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-charcoal mb-1.5 font-sans">
                    Principal Architect Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-warm-border text-xs text-charcoal focus:outline-none focus:border-copper"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-charcoal mb-1.5 font-sans flex items-center justify-between">
                    <span>COA Registration Number</span>
                    <span className="text-[10px] font-mono text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      ✓ Verified COA
                    </span>
                  </label>
                  <input
                    type="text"
                    value={coaNumber}
                    onChange={(e) => setCoaNumber(e.target.value)}
                    placeholder="CA/2016/XXXXX"
                    className="w-full px-4 py-2.5 rounded-xl border border-warm-border text-xs font-mono text-charcoal focus:outline-none focus:border-copper uppercase"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-charcoal mb-1.5 font-sans">
                    Primary Office Location
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Kochi, Kerala"
                    className="w-full px-4 py-2.5 rounded-xl border border-warm-border text-xs text-charcoal focus:outline-none focus:border-copper"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-charcoal mb-1.5 font-sans">
                  Design Philosophy & Bio
                </label>
                <textarea
                  rows={4}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full p-4 rounded-xl border border-warm-border text-xs text-charcoal leading-relaxed font-sans focus:outline-none focus:border-copper"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-charcoal mb-1.5 font-sans">
                  Design Specializations (comma separated)
                </label>
                <input
                  type="text"
                  value={specialization}
                  onChange={(e) => setSpecialization(e.target.value)}
                  placeholder="Tropical Modernism, Courtyards, Vastu Shastra..."
                  className="w-full px-4 py-2.5 rounded-xl border border-warm-border text-xs text-charcoal focus:outline-none focus:border-copper"
                />
              </div>
            </div>

            {/* Direct Contact Details */}
            <div className="p-6 bg-white border border-warm-border rounded-3xl space-y-4">
              <h3 className="text-base font-serif font-normal text-charcoal">
                Direct Contact & Consultation Booking
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-charcoal mb-1.5 font-sans">
                    Professional Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    disabled
                    title="Email is linked to account authentication and cannot be changed here."
                    className="w-full px-4 py-2.5 rounded-xl border border-warm-border text-xs text-secondaryText bg-warm-grey/50 cursor-not-allowed font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-charcoal mb-1.5 font-sans">
                    Studio Phone / WhatsApp Hotline
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-warm-border text-xs text-charcoal focus:outline-none focus:border-copper font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Studio Imagery */}
            <div className="p-6 bg-white border border-warm-border rounded-3xl space-y-6">
              <div>
                <h3 className="text-base font-serif font-normal text-charcoal">
                  Studio Imagery & Visual Identity
                </h3>
                <p className="text-xs text-secondaryText font-sans mt-0.5">
                  Upload your official portraits and showcase banners stored securely on Cloudflare R2.
                </p>
              </div>

              {uploadError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{uploadError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Principal Architect Portrait */}
                <div className="space-y-3">
                  <label className="block text-xs font-medium text-charcoal font-sans">
                    Principal Architect Portrait / Studio Logo
                  </label>
                  <div className="flex items-center gap-4">
                    <div className="relative w-16 h-16 rounded-full overflow-hidden bg-warm-grey border border-warm-border shrink-0">
                      {image ? (
                        <Image src={image} alt="Architect Portrait" fill className="object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-stone-400">
                          <Camera className="w-6 h-6" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 space-y-1.5">
                      <label className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-warm-border hover:border-copper text-xs font-sans font-medium text-charcoal cursor-pointer transition-colors bg-warm-card hover:bg-white">
                        {isUploadingAvatar ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-copper" />
                            <span>Uploading to R2...</span>
                          </>
                        ) : (
                          <>
                            <Upload className="w-3.5 h-3.5 text-copper" />
                            <span>Upload New Photo</span>
                          </>
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          disabled={isUploadingAvatar}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleUpload(file, "avatars", (url) => setImage(url), setIsUploadingAvatar);
                          }}
                        />
                      </label>
                      <input
                        type="text"
                        value={image}
                        onChange={(e) => setImage(e.target.value)}
                        placeholder="Or paste image URL"
                        className="w-full px-3 py-1.5 rounded-lg border border-warm-border text-[11px] text-charcoal font-mono outline-none focus:border-copper"
                      />
                    </div>
                  </div>
                </div>

                {/* Studio Header Cover Photo */}
                <div className="space-y-3">
                  <label className="block text-xs font-medium text-charcoal font-sans">
                    Studio Header Cover Photo
                  </label>
                  <div className="space-y-2">
                    <div className="relative w-full h-16 rounded-xl overflow-hidden bg-warm-grey border border-warm-border">
                      {coverImage ? (
                        <Image src={coverImage} alt="Cover Banner" fill className="object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-stone-400 text-xs">
                          No Banner Uploaded
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-warm-border hover:border-copper text-xs font-sans font-medium text-charcoal cursor-pointer transition-colors bg-warm-card hover:bg-white shrink-0">
                        {isUploadingCover ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-copper" />
                            <span>Uploading...</span>
                          </>
                        ) : (
                          <>
                            <Upload className="w-3.5 h-3.5 text-copper" />
                            <span>Upload Banner</span>
                          </>
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          disabled={isUploadingCover}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleUpload(file, "imagery", (url) => setCoverImage(url), setIsUploadingCover);
                          }}
                        />
                      </label>
                      <input
                        type="text"
                        value={coverImage}
                        onChange={(e) => setCoverImage(e.target.value)}
                        placeholder="Or paste banner URL"
                        className="w-full px-3 py-1.5 rounded-lg border border-warm-border text-[11px] text-charcoal font-mono outline-none focus:border-copper"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Awards & Honors */}
            <div className="p-6 bg-white border border-warm-border rounded-3xl space-y-4">
              <h3 className="text-base font-serif font-normal text-charcoal flex items-center gap-2">
                <Award className="w-4 h-4 text-copper" />
                <span>Awards & Institutional Recognitions</span>
              </h3>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={newAward}
                  onChange={(e) => setNewAward(e.target.value)}
                  placeholder="e.g. IIA Kerala State Architecture Award (2024)..."
                  className="flex-1 px-4 py-2.5 rounded-xl border border-warm-border text-xs text-charcoal focus:outline-none focus:border-copper"
                />
                <button
                  type="button"
                  onClick={handleAddAward}
                  className="px-4 py-2.5 rounded-xl bg-charcoal text-white text-xs font-medium hover:bg-charcoal/90 transition-colors flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add</span>
                </button>
              </div>

              <div className="space-y-2 pt-2">
                {awards.map((award, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 rounded-xl bg-warm-grey/40 border border-warm-border text-xs text-charcoal"
                  >
                    <span className="flex items-center gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-copper" />
                      {award}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveAward(idx)}
                      className="text-secondaryText hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </form>
        </div>

        {/* Live Profile Card Preview (1 Column) */}
        <div>
          <div className="sticky top-24 space-y-4">
            <span className="text-xs font-semibold text-charcoal uppercase tracking-wider font-sans block">
              Public Architect Directory Preview
            </span>

            <div className="bg-white border border-warm-border rounded-3xl overflow-hidden shadow-subtle">
              {/* Cover Banner */}
              <div className="relative h-28 w-full bg-charcoal">
                <Image 
                  src={coverImage || "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=80"} 
                  alt="Cover" 
                  fill 
                  className="object-cover opacity-80" 
                />
              </div>

              <div className="p-6 pt-0 relative">
                {/* Avatar */}
                <div className="relative -mt-10 mb-3 w-20 h-20 rounded-2xl overflow-hidden border-4 border-white shadow-md bg-charcoal">
                  <Image 
                    src={image || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80"} 
                    alt={name || "Architect"} 
                    fill 
                    className="object-cover" 
                  />
                </div>

                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <h4 className="text-lg font-serif font-normal text-charcoal leading-snug">
                      {name || "Principal Architect"}
                    </h4>
                    <span className="text-xs font-sans text-secondaryText block">
                      {studio || "Architectural Studio"}
                    </span>
                  </div>

                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-mono font-medium">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                    COA Verified
                  </span>
                </div>

                <div className="text-[11px] font-mono text-copper font-medium mb-3">
                  {coaNumber || "CA/XXXX/XXXXX"}
                </div>

                <p className="text-xs text-secondaryText font-sans leading-relaxed mb-4 line-clamp-3">
                  {bio || "Tropical minimalism and climate-responsive architecture."}
                </p>

                <div className="pt-3 border-t border-warm-border/60 flex items-center justify-between text-xs font-sans">
                  <span className="flex items-center gap-1 text-secondaryText">
                    <MapPin className="w-3 h-3 text-copper" />
                    {location || "South India"}
                  </span>
                  <span className="text-copper font-medium">View Practice →</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
