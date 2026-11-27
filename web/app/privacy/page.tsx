import type { Metadata } from "next";
import LegalPageShell from "@/components/LegalPageShell";

export const metadata: Metadata = {
  title: "Privacy Policy (DPDP Aligned) | S-ARC — Southern Architecture",
  description:
    "How S-ARC collects, stores, and protects personal data, Google OAuth sessions, plot inquiries, and email notifications under India's DPDP Act.",
  alternates: { canonical: "https://southernarchitecture.in/privacy" },
};

export default function PrivacyPage() {
  return (
    <LegalPageShell
      eyebrow="Data Protection & DPDP Act 2023"
      title="Privacy Policy"
      subtitle="Transparent summary of what personal data S-ARC processes, where it is stored, and how you can access or erase your information."
      legalDraftNotice
    >
      <div className="space-y-3">
        <h2 className="text-xl font-serif text-charcoal font-normal">1. Data We Collect</h2>
        <ul className="list-disc pl-5 space-y-1.5">
          <li>
            <strong>Account Details:</strong> Name, email address, optional phone number, studio affiliation, and COA license information when you register or sign in via Google OAuth or email/password.
          </li>
          <li>
            <strong>Inquiries & Plot Preferences:</strong> Messages, plot dimensions, location, and architectural style inquiries submitted to studios or via the contact form.
          </li>
          <li>
            <strong>Newsletter & Launch Alerts:</strong> Email addresses explicitly submitted for design dispatches or maintenance launch notifications.
          </li>
        </ul>
      </div>

      <div className="space-y-3">
        <h2 className="text-xl font-serif text-charcoal font-normal">2. Infrastructure, Storage & Subprocessors</h2>
        <p>
          Application data, accounts, and inquiries are stored in Cloudflare D1; uploaded renders and drawing deliverables are stored in Cloudflare R2; authentication sessions use signed HTTP-only JWT cookies; transactional emails and launch notifications are delivered through Resend and Cloudflare Email Routing. Local browser storage (<code>localStorage</code>) is used strictly for interface state such as saved design shortlists.
        </p>
      </div>

      <div className="space-y-3">
        <h2 className="text-xl font-serif text-charcoal font-normal">3. How Your Data Is Used</h2>
        <p>
          Your information is used strictly to authenticate your session, display your saved designs or inquiries in your workspace, connect homeowners with the selected architect studio, and send service or requested launch notifications. S-ARC does not sell personal contact lists to third-party brokers.
        </p>
      </div>

      <div className="space-y-3">
        <h2 className="text-xl font-serif text-charcoal font-normal">4. Your Rights Under India&apos;s DPDP Act</h2>
        <p>
          You may request access to, correction of, or deletion of your account, plot inquiries, or newsletter subscription at any time by writing to{" "}
          <a href="mailto:contact@southernarchitecture.in" className="text-copper hover:underline font-medium">
            contact@southernarchitecture.in
          </a>{" "}
          from your registered email address.
        </p>
      </div>
    </LegalPageShell>
  );
}
