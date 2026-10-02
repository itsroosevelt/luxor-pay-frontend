import { Metadata } from "next";
import { TermsView } from "@/features/legal/components/TermsView";

export const metadata: Metadata = {
  title: "Terms & Conditions | Sterling",
  description:
    "Review the legal framework, terms of use, and operational guidelines governing the Sterling ecosystem.",
};

export default function TermsPage() {
  return <TermsView />;
}
