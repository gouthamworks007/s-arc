"use client";

import React, { useState } from "react";
import LegalPageShell from "@/components/LegalPageShell";
import { CheckCircle2, Mail, MapPin, MessageSquare, Send } from "lucide-react";

export default function ContactClient() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("Design Inquiry / Plot Fit");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      setError("Please fill in your name, email, and message.");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          subject,
          message: message.trim(),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || "Unable to send your message right now.");
      }
      setSubmitted(true);
      setMessage("");
    } catch (err: any) {
      setError(err?.message || "Failed to send message. Please try again or reach out via WhatsApp.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <LegalPageShell
      eyebrow="Advisory & Studio Desk"
      title="Contact S-ARC"
      subtitle="Questions about matching a blueprint to your land, onboarding your architectural studio, or deliverable licensing? Write to us directly."
    >
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        <div className="md:col-span-5 space-y-4">
          <div className="p-5 rounded-2xl border border-warm-border bg-warm-card space-y-2">
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-copper">
              <MapPin className="w-3.5 h-3.5" />
              <span>Regional Desk</span>
            </div>
            <p className="text-sm font-medium text-charcoal">Kochi, Kerala, India</p>
            <p className="text-xs text-mutedText">Serving Kerala, Tamil Nadu, and Karnataka</p>
          </div>

          <div className="p-5 rounded-2xl border border-warm-border bg-warm-card space-y-2">
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-copper">
              <Mail className="w-3.5 h-3.5" />
              <span>Email</span>
            </div>
            <a
              href="mailto:contact@southernarchitecture.in"
              className="text-sm font-medium text-charcoal hover:text-copper transition-colors break-all"
            >
              contact@southernarchitecture.in
            </a>
          </div>

          <a
            href="https://wa.me/919446077889?text=Hi%20S-ARC%2C%20I%20would%20like%20help%20choosing%20an%20architectural%20plan."
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-between p-5 rounded-2xl border border-emerald-600/30 bg-emerald-50 text-emerald-900 hover:bg-emerald-100 transition-colors"
          >
            <div>
              <div className="text-xs font-mono uppercase tracking-wider text-emerald-700">Instant Chat</div>
              <div className="text-sm font-medium mt-0.5">WhatsApp Studio Desk</div>
            </div>
            <MessageSquare className="w-5 h-5 text-emerald-700" />
          </a>
        </div>

        <div className="md:col-span-7 p-6 rounded-2xl border border-warm-border bg-white shadow-subtle">
          {submitted ? (
            <div className="py-6 space-y-3 text-center">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
              <h2 className="text-xl font-serif text-charcoal font-normal">Message Received</h2>
              <p className="text-xs text-secondaryText max-w-md mx-auto">
                Thank you for contacting S-ARC. Our advisory team will reply via email shortly.
              </p>
              <button
                type="button"
                onClick={() => setSubmitted(false)}
                className="text-xs text-copper underline underline-offset-4"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="contact-name" className="block text-xs font-medium text-charcoal mb-1.5">
                    Your Name
                  </label>
                  <input
                    id="contact-name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Anoop Menon"
                    className="w-full rounded-xl border border-warm-border bg-warm-card px-3.5 py-2.5 text-sm text-charcoal outline-none focus:border-copper"
                  />
                </div>
                <div>
                  <label htmlFor="contact-email" className="block text-xs font-medium text-charcoal mb-1.5">
                    Email Address
                  </label>
                  <input
                    id="contact-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full rounded-xl border border-warm-border bg-warm-card px-3.5 py-2.5 text-sm text-charcoal outline-none focus:border-copper"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="contact-subject" className="block text-xs font-medium text-charcoal mb-1.5">
                  Topic
                </label>
                <select
                  id="contact-subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full rounded-xl border border-warm-border bg-warm-card px-3.5 py-2.5 text-sm text-charcoal outline-none focus:border-copper"
                >
                  <option value="Design Inquiry / Plot Fit">Design Inquiry / Plot Fit</option>
                  <option value="Architect / Studio Onboarding">Architect / Studio Onboarding</option>
                  <option value="Licensing & Refund Support">Licensing & Refund Support</option>
                  <option value="Privacy / DPDP Request">Privacy / DPDP Request</option>
                </select>
              </div>

              <div>
                <label htmlFor="contact-message" className="block text-xs font-medium text-charcoal mb-1.5">
                  Message
                </label>
                <textarea
                  id="contact-message"
                  rows={4}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Share your plot size (cents), district, or studio question..."
                  className="w-full rounded-xl border border-warm-border bg-warm-card px-3.5 py-2.5 text-sm text-charcoal outline-none focus:border-copper"
                />
              </div>

              {error && <p className="text-xs text-red-600">{error}</p>}

              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-copper hover:bg-copper-hover text-white text-xs font-medium transition-colors disabled:opacity-60"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{submitting ? "Sending..." : "Send Message"}</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </LegalPageShell>
  );
}
