import { Metadata } from "next";
import { TermsView } from "@/components/terms/TermsView";

export const metadata: Metadata = {
  title: "Terms & Conditions | Luxor Pay",
  description:
    "Review the legal framework, terms of use, and operational guidelines governing the Luxor Pay ecosystem.",
};

export default function TermsPage() {
  return <TermsView />;
}
