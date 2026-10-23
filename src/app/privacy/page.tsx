import LegalPage, { type LegalSection } from '@/features/legal/components/LegalPage';

export const metadata = {
    title: "Privacy Policy | Sterling",
    description: "How Luxor Intelligence LLC collects, uses, shares and protects personal data in Sterling, and your privacy rights.",
};

const sections: LegalSection[] = [
    {
        heading: "Who we are and scope",
        body: [
            "Luxor Intelligence LLC (\"Luxor Intelligence\", \"we\", \"us\", \"our\"), 470 W 200 N, Salt Lake City, UT 84103, USA, operates Sterling (itssterling.com), a non-custodial payment gateway, multisig treasury and token launcher built on Solana, which is part of the Luxor Intelligence ecosystem (luxorintelligence.com) alongside Roosevelt (itsroosevelt.com) and Royalty (itsroyalty.us).",
            "This Privacy Policy applies to the Sterling website and application, including merchant dashboards, checkout and payment links, treasury and member management, the token launcher and related services (together, the \"Service\"), and describes how we collect, use, disclose and protect personal data in them. Other products in our ecosystem may publish their own notices describing practices specific to them.",
            "Contact for privacy matters: legal@luxorintelligence.com.",
        ],
    },
    {
        heading: "Our role: controller and processor",
        body: [
            "Depending on the data, we act in different roles:",
            [
                "Controller (or \"business\" under US state laws): for the account, identity-verification status, security, usage and website data we collect about you as a user or visitor of the Service.",
                "Processor (or \"service provider\"): for the information a merchant or organization loads into Sterling about its own customers, contacts, team members and payments (\"Customer Data\"), such as contact lists, payment requests and invoices. In that case the merchant or organization is the controller and decides why and how that data is processed; we process it on its instructions to provide the Service.",
            ],
            "If you use Sterling to collect payments or manage a team, you are responsible for having a lawful basis, providing the required notices and obtaining the consents needed to process the data of your customers and members through the Service. A data processing addendum is available on request at legal@luxorintelligence.com.",
        ],
    },
    {
        heading: "Information we collect",
        body: [
            [
                "Account and profile data: name, email address, profile picture, sign-in identifiers and authentication provider (email and password or Google), language and account settings.",
                "Identity verification (KYC) data: where verification is required, for example to use fiat on-ramp or off-ramp features, you submit identity information and documents to our verification provider. We receive the result and status of the verification and limited related details; the documents are processed by the provider under its own terms.",
                "Wallet and blockchain data: public wallet addresses, transaction signatures, token and treasury balances, and multisig membership and approvals. This information is public on the blockchain. We never receive or store your private keys or recovery phrases.",
                "Payment and treasury records: payment links, payment requests, invoices, catalog items, transaction history, contacts and customers you add, and team members and roles you assign.",
                "Billing data: plan and subscription status and payment identifiers. We do not store full card numbers.",
                "Technical and usage data: IP address, device, browser and operating-system information, log and diagnostic data, timestamps, referring pages and security events.",
                "Communications with us: messages you send to support, legal, business or careers mailboxes, and information in job applications.",
                "Cookies and local storage: described below.",
            ],
            "We receive this information directly from you, from the services you connect (such as your wallet, sign-in provider and verification provider), and automatically through your use of the Service. We do not knowingly collect sensitive personal data as a feature of the Service, other than identity-verification data submitted to our verification provider for the purposes described above.",
        ],
    },
    {
        heading: "How we use information and our legal bases",
        body: [
            "We use personal data for the following purposes. Where the GDPR or UK GDPR applies, the legal basis is shown in brackets.",
            [
                "To provide, operate, maintain and secure the Service, authenticate you and process your instructions [performance of a contract].",
                "To process payments, operate treasuries, manage subscriptions, verify identity where required and prevent fraud [performance of a contract; legal obligation; legitimate interests].",
                "To provide customer support and communicate with you about your account, security and changes to the Service [performance of a contract; legitimate interests].",
                "To monitor, debug and improve the Service, develop new features and keep the Service safe, including detecting abuse and enforcing our terms [legitimate interests].",
                "To comply with legal obligations, respond to lawful requests and establish or defend legal claims [legal obligation; legitimate interests].",
                "To send you product or marketing communications where permitted, with an easy way to opt out [consent or legitimate interests, as applicable].",
            ],
            "Each merchant's data is logically isolated: Customer Data is stored under your own account and is not made visible to other merchants.",
        ],
    },
    {
        heading: "Cookies, local storage and similar technologies",
        body: [
            "We use cookies, browser storage and similar technologies on the Sterling website and application:",
            [
                "Strictly necessary: authentication and session storage (Firebase Authentication), wallet-connection state, security, and keeping your session working.",
                "Preferences in your browser: we store small settings in your browser's local and session storage, such as whether the sidebar is collapsed, your recently visited pages, your selected treasury and merchant profile for the current session, and whether you dismissed a verification reminder. This information stays in your browser and is not used for advertising.",
                "Fonts: the website loads fonts from Google Fonts, which means your browser makes a request to Google's servers (and shares your IP address and browser details) when pages load.",
                "Embedded videos: some pages show YouTube videos. Preview images are requested from YouTube's servers, and videos play in YouTube's enhanced privacy mode (youtube-nocookie.com), which limits cookies until you play one. When you play a video, YouTube may still collect data under Google's own privacy policy.",
                "Third-party wallet and payment components: your wallet extension or app (for example Phantom or Solflare) and our verification and payment providers may set their own cookies or storage when you use those features.",
            ],
            "We do not use advertising cookies or analytics tracking on the Sterling website at this time. If we introduce analytics or other non-essential cookies, we will update this policy and, where the law requires your consent (for example in the EEA, UK or certain US states), we will ask for it first. You can block or delete cookies and clear site data in your browser, but parts of the Service may not work without the necessary ones.",
        ],
    },
    {
        heading: "Who we share data with",
        body: [
            "We do not sell your personal data, and we do not share it for cross-context behavioral advertising. We disclose personal data only in these situations:",
            [
                "Service providers (sub-processors) that process data on our behalf under written agreements, listed below.",
                "The services you choose to use, when needed to carry out your instructions (for example your wallet, the Solana network, or a fiat on-ramp or off-ramp provider).",
                "Professional advisers, insurers and auditors bound by confidentiality.",
                "Authorities or other parties where we believe disclosure is required by law, legal process or to protect rights, safety and security.",
                "A successor entity in a merger, acquisition, financing or sale of assets, with notice to you where required.",
                "Any other party with your consent or at your direction.",
            ],
            "Current categories of sub-processors:",
            [
                "Google Cloud / Firebase: authentication, database and file storage (United States and other Google Cloud regions).",
                "Vercel: application hosting and delivery (United States and global edge network).",
                "Stripe: identity verification and payment processing, where those features are used (United States and other countries where Stripe operates).",
                "MoonPay: fiat off-ramp services, when you choose to use them (provider acting under its own terms and privacy policy).",
                "Solana network participants and RPC providers: on-chain payments, treasuries and wallet interactions (public blockchain).",
                "Email and communication tools we use to respond to support, legal, business and careers requests.",
            ],
            "We will provide an up-to-date list of sub-processors on request at legal@luxorintelligence.com.",
        ],
    },
    {
        heading: "International transfers",
        body: [
            "We are based in the United States and our providers may process data in the United States and other countries that may not offer the same level of data protection as your country. Where required, we rely on appropriate safeguards for transfers of personal data from the EEA, UK or Switzerland, such as the European Commission's Standard Contractual Clauses (and the UK Addendum), adequacy decisions or the EU-US Data Privacy Framework certification of our providers.",
        ],
    },
    {
        heading: "Data retention",
        body: [
            [
                "Account data: kept while your account is active and until you delete it or ask us to.",
                "Payment, treasury and transaction records: kept while your account is active and for the period required by applicable law afterwards.",
                "Identity-verification results: kept for as long as needed to meet our legal and compliance obligations and then deleted or anonymized; documents held by our verification provider follow that provider's retention rules.",
                "After account deletion or a verified deletion request: personal data is deleted or irreversibly anonymized within a reasonable period, generally within 30 days, except where we must keep it (see below), and remaining copies in backups are overwritten in the ordinary course of backup rotation.",
                "Security and access logs: retained for a limited period unless needed longer to investigate abuse or comply with law.",
                "Legal holds and disputes: data may be retained as needed to establish, exercise or defend legal claims.",
                "Public blockchain data: cannot be altered or deleted by us.",
            ],
        ],
    },
    {
        heading: "Security",
        body: [
            "We use technical and organizational measures designed to protect personal data, including per-customer data isolation enforced by database security rules and server-side authorization, encrypted connections (TLS), encryption at rest provided by our infrastructure providers, and access controls for our personnel. No method of transmission or storage is completely secure, and we cannot guarantee absolute security. Please protect your credentials and tell us immediately at support@luxorintelligence.com if you suspect unauthorized access.",
            "If we become aware of a personal-data breach affecting you, we will notify you and the relevant authorities as required by applicable law, including without undue delay and, where the GDPR applies to us as controller, within 72 hours where feasible. As a processor, we will notify the affected customer without undue delay.",
        ],
    },
    {
        heading: "Your rights (EEA, UK and Switzerland)",
        body: [
            "Subject to conditions and exceptions in the GDPR and UK GDPR, you may have the right to: access your personal data; correct inaccurate data; delete your data; restrict or object to processing (including processing based on legitimate interests and direct marketing); data portability; withdraw consent at any time (without affecting earlier processing); and not to be subject to certain solely automated decisions. You also have the right to lodge a complaint with your local data protection authority.",
            "To exercise these rights, email legal@luxorintelligence.com. We may need to verify your identity. If your data is Customer Data processed on behalf of a business that uses Luxor Intelligence, we may refer your request to that business.",
        ],
    },
    {
        heading: "Your rights (California and other US states)",
        body: [
            "Under the California Consumer Privacy Act as amended (CCPA/CPRA) and similar laws in other US states (for example Colorado, Connecticut, Virginia, Utah and Texas), residents may have the right to know what personal information we collect, use and disclose; to access and obtain a portable copy; to correct inaccurate information; to delete personal information; to opt out of the sale or sharing of personal information and of targeted advertising and certain profiling; to limit the use of sensitive personal information; and not to be discriminated against for exercising these rights.",
            [
                "Categories collected in the last 12 months: identifiers (name, email address, wallet addresses, IP address); customer records and commercial information (plan, billing status and payment history); identity-verification status; internet and device activity; communications you send us; and professional or employment information in job applications. See \"Information we collect\" for details and sources.",
                "Purposes and disclosures: as described in \"How we use information\" and \"Who we share data with\". We disclose these categories to the service providers listed above for business purposes.",
                "Sale and sharing: we do not sell personal information and do not share it for cross-context behavioral advertising, and we have no actual knowledge of selling or sharing the personal information of anyone under 16.",
                "Sensitive personal information: we do not use or disclose sensitive personal information for purposes other than those permitted by law.",
            ],
            "To exercise your rights, email legal@luxorintelligence.com with the subject \"Privacy request\". We will verify your identity (for example by matching the email associated with your account) and respond within 45 days (extendable once by 45 days where permitted). You may use an authorized agent, who must provide proof of authorization. If we deny a request, you may appeal by replying to our decision, and you may also contact your state attorney general. California residents may also request information about disclosures of personal information to third parties for their direct marketing purposes (California \"Shine the Light\" law); we do not make such disclosures.",
        ],
    },
    {
        heading: "Children",
        body: [
            "The Service is not directed to children under 18 and we do not knowingly collect personal data from them. If you believe a child has provided us with personal data, contact us at legal@luxorintelligence.com and we will delete it.",
        ],
    },
    {
        heading: "Third-party links and services",
        body: [
            "The Service may link to or integrate third-party websites and services that we do not control. Their privacy practices are governed by their own policies, and we encourage you to read them.",
        ],
    },
    {
        heading: "Changes to this policy",
        body: [
            "We may update this policy from time to time. We will post the new version here with a new \"last updated\" date and, for material changes, notify you through the Service or by email before they take effect where required.",
        ],
    },
    {
        heading: "Contact us",
        body: [
            "Luxor Intelligence LLC, 470 W 200 N, Salt Lake City, UT 84103, USA.",
            [
                "Privacy and legal requests (including our contact for data protection matters): legal@luxorintelligence.com",
                "Support: support@luxorintelligence.com",
                "Business inquiries: business@luxorintelligence.com",
                "Careers: careers@luxorintelligence.com",
            ],
            "If we appoint a representative in the European Union or the United Kingdom, their details will be published on this page.",
        ],
    },
];

export default function PrivacyPage() {
    return (
        <LegalPage
            title="Privacy Policy"
            updated="October 22, 2026"
            intro="Your privacy matters to us. This Privacy Policy describes what personal data Luxor Intelligence LLC collects through Sterling, how we use and protect it, who we share it with, and the choices and rights you have."
            sections={sections}
        />
    );
}
