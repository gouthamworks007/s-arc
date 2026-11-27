import type { Metadata } from "next";
import ContactClient from "./ContactClient";

export const metadata: Metadata = {
  title: "Contact Studio Advisory | S-ARC — Southern Architecture",
  description:
    "Reach S-ARC Architectural Advisory in Kochi for design inquiries, KMBR guidance, architect onboarding, or licensing support.",
  alternates: { canonical: "https://southernarchitecture.in/contact" },
};

export default function ContactPage() {
  return <ContactClient />;
}
