import { Metadata } from "next";
import { PrivacyView } from "@/components/privacy/PrivacyView";

export const metadata: Metadata = {
  title: "Privacy Architecture | Luxor Pay",
  description:
    "Explore the global privacy framework and data sovereignty principles that govern the Luxor Pay ecosystem.",
};

export default function PrivacyPage() {
  return <PrivacyView />;
}
