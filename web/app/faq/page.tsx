import type { Metadata } from "next";
import Link from "next/link";
import LegalPageShell from "@/components/LegalPageShell";

export const metadata: Metadata = {
  title: "Help Centre & FAQs | S-ARC — Southern Architecture",
  description:
    "Frequently asked questions about KMBR 2019 setback checks, Cent-to-SqFt calculations, CAD blueprint packages, and architect verification on S-ARC.",
  alternates: { canonical: "https://southernarchitecture.in/faq" },
};

const FAQS = [
  {
    q: "Are house designs on S-ARC compatible with Kerala Municipality Building Rules (KMBR 2019)?",
    a: "Designs list target plot sizes, setbacks, and floor area guidance aligned with typical KMBR 2019 / KPBR residential parameters. Because municipal road widths and site geometry vary by parcel, final statutory sign-off always requires verification with your site survey and local authority.",
  },
  {
    q: "How is plot size measured in Kerala (Cents to Sq.Ft)?",
    a: "1 Cent equals 435.6 square feet (approx. 40.468 square meters). Use S-ARC Plot Intelligence to convert Cents to Sq.Ft automatically and preview indicative setback envelopes.",
  },
  {
    q: "What is the difference between Blue-Tick and Grey-Tick architects?",
    a: "Blue-Tick studios have had their Council of Architecture (COA) registration number reviewed by S-ARC administrators. Grey-Tick badges identify independent residential designers vetted through portfolio and project-history review.",
  },
  {
    q: "Can a blueprint be modified to match my plot dimensions or Vastu requirements?",
    a: "Yes. Every design page lets you submit your plot location, dimensions, road orientation, and customization notes directly to the authoring architect studio before commissioning working drawings.",
  },
  {
    q: "How do architects or studios join S-ARC to publish designs?",
    a: "Register with an Architect role via Sign Up, provide your COA number or portfolio details, and await admin verification in your dashboard before uploading CAD/render packages.",
  },
];

export default function FaqPage() {
  return (
    <LegalPageShell
      eyebrow="Help Centre"
      title="Frequently Asked Questions"
      subtitle="Answers on blueprint packages, KMBR setback checks, architect verification badges, and customization inquiries."
    >
      <div className="space-y-4">
        {FAQS.map((item) => (
          <div key={item.q} className="p-5 sm:p-6 rounded-2xl border border-warm-border bg-warm-card space-y-2">
            <h2 className="text-lg font-serif text-charcoal font-normal">{item.q}</h2>
            <p className="text-[14px] text-secondaryText leading-relaxed">{item.a}</p>
          </div>
        ))}
      </div>

      <div className="pt-4 flex flex-wrap gap-3">
        <Link
          href="/designs"
          className="inline-flex items-center px-5 py-2.5 rounded-full bg-copper hover:bg-copper-hover text-white text-xs font-medium transition-colors"
        >
          Browse Designs
        </Link>
        <Link
          href="/plot-intelligence"
          className="inline-flex items-center px-5 py-2.5 rounded-full border border-warm-border bg-white hover:border-copper text-charcoal text-xs font-medium transition-colors"
        >
          Open Plot Intelligence
        </Link>
        <Link
          href="/contact"
          className="inline-flex items-center px-5 py-2.5 rounded-full border border-warm-border bg-white hover:border-copper text-charcoal text-xs font-medium transition-colors"
        >
          Contact Support
        </Link>
      </div>
    </LegalPageShell>
  );
}
