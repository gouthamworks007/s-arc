import type { Metadata } from "next";
import Link from "next/link";
import LegalPageShell from "@/components/LegalPageShell";

export const metadata: Metadata = {
  title: "Terms & Conditions | S-ARC — Southern Architecture",
  description:
    "Platform Terms and Conditions governing homeowner inquiries, architect seller accounts, drawing packages, and site usage on S-ARC.",
  alternates: { canonical: "https://southernarchitecture.in/terms" },
};

export default function TermsPage() {
  return (
    <LegalPageShell
      eyebrow="Platform Governance"
      title="Terms & Conditions"
      subtitle="Rules and responsibilities for homeowners, independent builders, and Council of Architecture (COA) studios using S-ARC."
      legalDraftNotice
    >
      <div className="space-y-3">
        <h2 className="text-xl font-serif text-charcoal font-normal">1. Nature of the Marketplace</h2>
        <p>
          S-ARC (Southern Architecture, <code>southernarchitecture.in</code>) operates an architectural design directory and plan marketplace connecting prospective homeowners with participating architects and independent residential designers across South India. S-ARC itself does not provide structural execution, site supervision, or municipal permit sign-offs unless explicitly contracted through a licensed studio.
        </p>
      </div>

      <div className="space-y-3">
        <h2 className="text-xl font-serif text-charcoal font-normal">2. Plot Intelligence & Statutory Approvals</h2>
        <p>
          Dimension calculators, Cent-to-SqFt conversions, and Kerala Municipality Building Rules (KMBR 2019) / KPBR setback projections shown in Plot Intelligence are indicative planning estimates only. Final construction requires an on-site topographical survey, structural soil engineering, and formal sanction approval from your local municipal or panchayat authority.
        </p>
      </div>

      <div className="space-y-3">
        <h2 className="text-xl font-serif text-charcoal font-normal">3. Accounts, Verification & Seller Submissions</h2>
        <p>
          Architect seller profiles may hold a verified COA registration review badge (Blue) or curated portfolio credential (Grey) granted by platform administrators. Studios uploading plans represent that they hold full copyright and licensing authority over uploaded renders, CAD/DWG drawings, and documentation, and that pricing meets marketplace guidelines.
        </p>
      </div>

      <div className="space-y-3">
        <h2 className="text-xl font-serif text-charcoal font-normal">4. Inquiries, Pricing & Payouts</h2>
        <p>
          Listed blueprint package prices are displayed inclusive of stated architectural package scope in Indian Rupees (INR). Custom site adaptations, municipal sanction coordination, or turnkey supervision quoted directly between you and an architect studio are governed by your bilateral studio agreement. Platform commission deductions and escrow hold windows for commercial seller settlements are administered per active platform settings.
        </p>
      </div>

      <div className="space-y-3">
        <h2 className="text-xl font-serif text-charcoal font-normal">5. Intellectual Property & Restrictions</h2>
        <p>
          All platform branding, UI layouts, and architect-authored blueprints remain protected under Indian copyright law. Use of purchased drawings is strictly bounded by the{" "}
          <Link href="/licensing" className="text-copper hover:underline font-medium">
            Licensing Terms
          </Link>{" "}
          and{" "}
          <Link href="/refund-policy" className="text-copper hover:underline font-medium">
            Refund Policy
          </Link>
          .
        </p>
      </div>
    </LegalPageShell>
  );
}
