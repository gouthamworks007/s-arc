"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useProjects } from "@/lib/projectsContext";
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
  ExternalLink
} from "lucide-react";

export default function StudioProfileTab() {
  const { profile, updateProfile } = useProjects();

  const [studio, setStudio] = useState(profile.studio);
  const [name, setName] = useState(profile.name);
  const [coaNumber, setCoaNumber] = useState(profile.coaNumber);
  const [location, setLocation] = useState(profile.location);
  const [bio, setBio] = useState(profile.bio);
  const [email, setEmail] = useState(profile.email);
  const [phone, setPhone] = useState(profile.phone);
  const [image, setImage] = useState(profile.image);
  const [coverImage, setCoverImage] = useState(profile.coverImage);
  const [specialization, setSpecialization] = useState(profile.specialization);
  const [awards, setAwards] = useState<string[]>(profile.awards || []);
  const [newAward, setNewAward] = useState("");
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleAddAward = () => {
    if (!newAward.trim()) return;
    setAwards([...awards, newAward.trim()]);
    setNewAward("");
  };

  const handleRemoveAward = (idx: number) => {
    setAwards(awards.filter((_, i) => i !== idx));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
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
      awards
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
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
            Manage your public architectural practice profile, Council of Architecture (COA) credentials, and studio philosophy.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {savedSuccess && (
            <span className="text-xs text-emerald-600 font-medium flex items-center gap-1.5 animate-in fade-in">
              <Check className="w-4 h-4" />
              <span>Profile updated!</span>
            </span>
          )}
          <button
            type="button"
            onClick={handleSave}
            className="px-6 py-2 rounded-full bg-copper hover:bg-copper-hover text-white text-xs font-medium tracking-wide flex items-center gap-2 transition-all shadow-sm"
          >
            <Check className="w-4 h-4" />
            <span>Save Profile</span>
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
                    className="w-full px-4 py-2.5 rounded-xl border border-warm-border text-xs font-mono text-charcoal focus:outline-none focus:border-copper"
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
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-warm-border text-xs text-charcoal focus:outline-none focus:border-copper font-mono"
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
            <div className="p-6 bg-white border border-warm-border rounded-3xl space-y-4">
              <h3 className="text-base font-serif font-normal text-charcoal">
                Studio Imagery & Visual Identity
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-charcoal mb-1.5 font-sans">
                    Principal Architect Portrait (URL)
                  </label>
                  <input
                    type="text"
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-warm-border text-xs text-charcoal focus:outline-none focus:border-copper font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-charcoal mb-1.5 font-sans">
                    Studio Header Cover Photo (URL)
                  </label>
                  <input
                    type="text"
                    value={coverImage}
                    onChange={(e) => setCoverImage(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-warm-border text-xs text-charcoal focus:outline-none focus:border-copper font-mono"
                  />
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
                <Image src={coverImage} alt="Cover" fill className="object-cover opacity-80" />
              </div>

              <div className="p-6 pt-0 relative">
                {/* Avatar */}
                <div className="relative -mt-10 mb-3 w-20 h-20 rounded-2xl overflow-hidden border-4 border-white shadow-md bg-charcoal">
                  <Image src={image} alt={name} fill className="object-cover" />
                </div>

                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <h4 className="text-lg font-serif font-normal text-charcoal leading-snug">
                      {name}
                    </h4>
                    <span className="text-xs font-sans text-secondaryText block">
                      {studio}
                    </span>
                  </div>

                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-mono font-medium">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                    COA Verified
                  </span>
                </div>

                <div className="text-[11px] font-mono text-copper font-medium mb-3">
                  {coaNumber}
                </div>

                <p className="text-xs text-secondaryText font-sans leading-relaxed mb-4 line-clamp-3">
                  {bio}
                </p>

                <div className="pt-3 border-t border-warm-border/60 flex items-center justify-between text-xs font-sans">
                  <span className="flex items-center gap-1 text-secondaryText">
                    <MapPin className="w-3 h-3 text-copper" />
                    {location}
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
