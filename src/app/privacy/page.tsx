import { Metadata } from "next";
import { PrivacyView } from "@/features/legal/components/PrivacyView";

export const metadata: Metadata = {
  title: "Privacy Architecture | Sterling",
  description:
    "Explore the global privacy framework and data sovereignty principles that govern the Sterling ecosystem.",
};

export default function PrivacyPage() {
  return <PrivacyView />;
}
