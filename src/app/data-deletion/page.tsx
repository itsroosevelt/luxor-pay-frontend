import LegalPage, { type LegalSection } from '@/features/legal/components/LegalPage';

export const metadata = {
    title: "Data Deletion Instructions | Sterling",
    description: "How to request deletion of your Sterling account and personal data held by Luxor Intelligence LLC.",
};

const sections: LegalSection[] = [
    {
        heading: "Quick options",
        body: [
            "You can control your data in three ways, from least to most complete:",
            [
                "Disconnect your wallet from Sterling and remove the site's access in your wallet's settings.",
                "Remove information you added (contacts, payment requests, catalog items, team members) from inside your account.",
                "Ask us to delete your account and all associated data.",
            ],
        ],
    },
    {
        heading: "Delete your account and data",
        body: [
            "To request deletion of your Sterling account and the personal data associated with it, email us:",
            [
                "To: legal@luxorintelligence.com",
                "Subject: \"Data deletion request\"",
                "From: the email address of your Sterling account (so we can verify the request).",
                "Include (if applicable): the wallet addresses linked to your account and the name of your business, so we can locate the right records.",
            ],
            "We will confirm receipt within a few business days, verify that the request comes from you, and complete the deletion within 30 days. If we need more time or information we will tell you. When finished we will send you a confirmation message.",
        ],
    },
    {
        heading: "Identity verification and fiat providers",
        body: [
            "If you completed identity verification or used a fiat on-ramp or off-ramp, some data is held by those third-party providers (for example Stripe or MoonPay) under their own terms and privacy policies. We will ask our verification provider to delete the verification data we are permitted to delete, and you can contact those providers directly about the data they hold.",
        ],
    },
    {
        heading: "What is deleted and what may be kept",
        body: [
            [
                "Deleted or irreversibly anonymized: profile and account data, contacts, customers, payment requests, catalog items, team and member records and other Customer Data associated with your account.",
                "Overwritten in the ordinary course of backup rotation: copies in backups.",
                "Retained for a limited time where required: records we must keep for legal, tax, accounting, anti-money-laundering, fraud-prevention or security reasons (for example payment, invoice and verification records), and data needed to establish or defend legal claims.",
                "Not deletable by us: public blockchain data such as wallet addresses, token balances, multisig membership and transaction records, and data held by the third-party services you use, which you control through those services.",
            ],
        ],
    },
    {
        heading: "If you are a customer of a business that uses Sterling",
        body: [
            "If you only paid or were invoiced by a business that uses Sterling, that business decides how your data is used and is responsible for answering your request. You can ask the business to delete your data. You can also contact us at legal@luxorintelligence.com with the business name and the wallet address or email used, and we will help route or process the request.",
        ],
    },
    {
        heading: "Questions",
        body: [
            "Email legal@luxorintelligence.com for privacy and deletion requests, or support@luxorintelligence.com for help using Sterling. Luxor Intelligence LLC, 470 W 200 N, Salt Lake City, UT 84103, USA.",
        ],
    },
];

export default function DataDeletionPage() {
    return (
        <LegalPage
            title="Data Deletion Instructions"
            updated="October 22, 2026"
            intro="You are in control of your data. Here is how to disconnect Sterling and how to have your data deleted by Luxor Intelligence LLC."
            sections={sections}
        />
    );
}
