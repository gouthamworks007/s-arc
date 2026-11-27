import type { Metadata } from "next";
import Link from "next/link";
import LegalPageShell from "@/components/LegalPageShell";

export const metadata: Metadata = {
  title: "Refund & Cancellation Policy | S-ARC — Southern Architecture",
  description:
    "Refund, cancellation, and deliverable dispute terms for digital CAD, BIM, and architectural drawing packages on S-ARC.",
  alternates: { canonical: "https://southernarchitecture.in/refund-policy" },
};

export default function RefundPolicyPage() {
  return (
    <LegalPageShell
      eyebrow="Buyer Protection"
      title="Refund & Cancellation Policy"
      subtitle="Clear rules covering instant digital CAD/BIM drawing downloads, pre-download cancellations, and custom studio adaptations."
      legalDraftNotice
    >
      <div className="space-y-3">
        <h2 className="text-xl font-serif text-charcoal font-normal">1. Digital Drawing Packages (CAD, BIM, PDF, BOQ)</h2>
        <p>
          Because architectural blueprints, AutoCAD (<code>.dwg</code>), Revit/BIM files, and construction drawing sets are non-returnable digital intellectual property, orders become non-refundable once the licensed package archive has been accessed or downloaded.
        </p>
      </div>

      <div className="space-y-3">
        <h2 className="text-xl font-serif text-charcoal font-normal">2. Eligible Refund Cases</h2>
        <ul className="list-disc pl-5 space-y-1.5">
          <li>Duplicate charges caused by a payment gateway or network retry error.</li>
          <li>Cancellation requested prior to download release or studio fulfillment initiation.</li>
          <li>Materially corrupted, incomplete, or mismatched drawing deliverables that the authoring studio fails to rectify within 5 business days of a reported defect.</li>
        </ul>
      </div>

      <div className="space-y-3">
        <h2 className="text-xl font-serif text-charcoal font-normal">3. Custom Modifications & Studio Revisions</h2>
        <p>
          Custom plot adaptations, facade changes, or KMBR/municipal sanction modifications arranged with an architect follow milestone terms agreed with that studio. To raise a deliverable dispute or refund request, email{" "}
          <a href="mailto:contact@southernarchitecture.in" className="text-copper hover:underline font-medium">
            contact@southernarchitecture.in
          </a>{" "}
          or submit details via the{" "}
          <Link href="/contact" className="text-copper hover:underline font-medium">
            Contact page
          </Link>
          .
        </p>
      </div>
    </LegalPageShell>
  );
}
