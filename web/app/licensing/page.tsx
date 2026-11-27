import type { Metadata } from "next";
import Link from "next/link";
import LegalPageShell from "@/components/LegalPageShell";

export const metadata: Metadata = {
  title: "Blueprint Licensing & Deliverable Usage | S-ARC — Southern Architecture",
  description:
    "Single-plot residential construction license terms, CAD/BIM deliverable scopes, and architect intellectual property rights on S-ARC.",
  alternates: { canonical: "https://southernarchitecture.in/licensing" },
};

export default function LicensingPage() {
  return (
    <LegalPageShell
      eyebrow="Intellectual Property & Usage Rights"
      title="Blueprint Licensing Information"
      subtitle="What rights you receive when acquiring an architectural design package from an S-ARC studio, and what remains reserved by the architect."
      legalDraftNotice
    >
      <div className="space-y-3">
        <h2 className="text-xl font-serif text-charcoal font-normal">1. Single-Site Residential License</h2>
        <p>
          Each architectural package purchased or commissioned through S-ARC grants a non-exclusive, non-transferable license to construct <strong>one (1) residential building</strong> on a single specified land parcel owned or developed by the licensee.
        </p>
      </div>

      <div className="space-y-3">
        <h2 className="text-xl font-serif text-charcoal font-normal">2. Standard Deliverable Scopes</h2>
        <ul className="list-disc pl-5 space-y-1.5">
          <li><strong>Permit Set:</strong> Architectural floor plans, elevations, sections, and site orientation layouts prepared for feasibility review and local architect endorsement.</li>
          <li><strong>Working Drawing Set:</strong> Dimensioned CAD files, structural grid coordination, electrical, and plumbing schematics for contractor execution.</li>
          <li><strong>Turnkey BIM + BOQ Set:</strong> 3D model files and Bills of Quantities for material estimation and tendering.</li>
        </ul>
      </div>

      <div className="space-y-3">
        <h2 className="text-xl font-serif text-charcoal font-normal">3. Restricted Uses & Architect Copyright</h2>
        <p>
          The authoring architect or studio retains full moral rights and copyright over all designs, CAD blocks, and specifications. Buyers and contractors may not resell, redistribute, upload publicly, or reuse purchased drawings across multiple speculative plots without written studio authorization.
        </p>
      </div>

      <div className="space-y-3">
        <h2 className="text-xl font-serif text-charcoal font-normal">4. Statutory Engineer & COA Endorsement</h2>
        <p>
          Municipal/panchayat building permit filings in Kerala, Tamil Nadu, and Karnataka require formal signature/endorsement by a locally registered COA architect or licensed building engineer based on actual site soil and survey conditions. Need site-specific adaptation? Browse{" "}
          <Link href="/architects" className="text-copper hover:underline font-medium">
            verified architects
          </Link>{" "}
          or check{" "}
          <Link href="/plot-intelligence" className="text-copper hover:underline font-medium">
            Plot Intelligence
          </Link>
          .
        </p>
      </div>
    </LegalPageShell>
  );
}
