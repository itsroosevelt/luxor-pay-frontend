import LegalPage, { type LegalSection } from '@/features/legal/components/LegalPage';

export const metadata = {
    title: "Terms of Service | Sterling",
    description: "The terms that govern the use of Sterling, operated by Luxor Intelligence LLC.",
};

const sections: LegalSection[] = [
    {
        heading: "Agreement",
        body: [
            "These Terms of Service (\"Terms\") are a legal agreement between you and Luxor Intelligence LLC, 470 W 200 N, Salt Lake City, UT 84103, USA (\"Luxor Intelligence\", \"we\", \"us\", \"our\") that governs your access to and use of Sterling (itssterling.com) and related websites, applications and services (the \"Service\"). By creating an account, connecting a wallet, clicking to accept, or using the Service, you agree to these Terms and to our Privacy Policy. If you do not agree, do not use the Service. Other products in our ecosystem may have their own terms on their websites.",
        ],
    },
    {
        heading: "Eligibility and accounts",
        body: [
            "You must be at least 18 years old and able to form a binding contract, and you must not be barred from using the Service under applicable law. If you use the Service on behalf of an organization, you represent that you have authority to bind it, and \"you\" includes that organization.",
            "You must provide accurate information, keep it up to date and keep your credentials secure. You are responsible for all activity under your account and for the actions of anyone you allow to access it. Notify us promptly at support@luxorintelligence.com of any unauthorized use. You may create personal and business profiles; you are responsible for the accuracy and legality of the information in each.",
        ],
    },
    {
        heading: "The Service",
        body: [
            "Sterling is a non-custodial payment gateway, multisig treasury and token launcher built on Solana. It lets merchants and organizations accept payments, create payment links and requests, manage team members and shared treasuries, and launch tokens. We do not take custody of your funds or private keys: you control your wallets, and on-chain actions are executed by the transactions you and your co-signers approve. We may add, modify, suspend or discontinue features at any time, and some modules are provided as previews and may be incomplete or change without notice.",
        ],
    },
    {
        heading: "Third-party services and integrations",
        body: [
            "The Service works with third-party services such as wallets (for example Phantom and Solflare), the Solana network and RPC providers, multisig infrastructure, identity-verification and payment providers, and fiat on-ramp and off-ramp providers (for example MoonPay). You authorize us to interact with them as you configure. You are responsible for having the rights and permissions to use them and for complying with their terms and policies. We do not control third-party services; they may change, limit or terminate access at any time (including by suspending your accounts or declining a verification), and we are not responsible for such actions or their consequences.",
        ],
    },
    {
        heading: "Your content and data",
        body: [
            "You retain all rights in the content and data you submit, connect or generate through the Service (\"Customer Data\"), such as payment requests, catalog items, contacts and team information. You grant us a worldwide, non-exclusive license to host, store, process, transmit, display and otherwise use Customer Data solely to provide, secure, support and improve the Service as described in the Privacy Policy and as you instruct.",
            "You are solely responsible for Customer Data and for its legality, including having all notices, rights, authorizations and consents required to collect it and to process the information of your customers and team members through the Service. For Customer Data that is personal data, our data protection terms are described in the Privacy Policy, and a data processing addendum is available on request at legal@luxorintelligence.com.",
            "We may create aggregated or de-identified data that does not identify you or any individual and use it to operate and improve the Service.",
        ],
    },
    {
        heading: "Acceptable use",
        body: [
            "You agree not to, and not to allow others to:",
            [
                "violate any law or regulation, or third-party rights (including privacy, publicity and intellectual-property rights);",
                "send spam or unsolicited bulk or unlawful messages, or violate the policies of any connected service;",
                "harass, threaten, defraud, impersonate or deceive others, or distribute hateful, violent, sexually exploitative or illegal content;",
                "access, probe or attempt to access other customers' data or accounts, circumvent isolation, authentication, rate limits or other security controls, or interfere with or disrupt the Service;",
                "upload malware or use the Service to attack, scrape or overload systems or third-party platforms;",
                "reverse engineer, decompile or attempt to extract source code or models, except where law permits despite this restriction;",
                "resell, sublicense or provide the Service to third parties as a competing service without our written permission;",
                "use the Service to develop or train competing models, or for high-risk activities where failure could lead to death, injury or serious harm;",
                "use the Service in violation of sanctions or export-control laws, or for illegal gambling, illegal drugs, weapons trafficking or other prohibited business types.",
            ],
            "We may investigate violations, remove content, and suspend or terminate access without notice where we reasonably believe these rules have been broken or the Service or others are at risk.",
        ],
    },
    {
        heading: "Plans, payments, taxes and cancellation",
        body: [
            "Some features are provided under paid plans or fees shown at checkout or on the pricing page. Fees are in US dollars unless stated otherwise and exclude taxes, duties and payment-network or blockchain fees, which you are responsible for. Paid plans are billed in advance for the period shown; unless stated at purchase, subscriptions renew for the same period until cancelled. You can cancel at any time from your account or by contacting support@luxorintelligence.com; cancellation takes effect at the end of the current billing period and you keep access until then. Except where required by law or stated at purchase, fees are non-refundable and we do not provide refunds or credits for partial periods or unused features.",
            "We may change prices or plans with at least 30 days' notice for future billing periods; if you do not cancel before the change takes effect, you accept it. On-chain transactions are irreversible and you are responsible for transaction details, wallet security, co-signer approvals and applicable fees. We may suspend or limit the Service for unpaid or disputed charges, and you are responsible for chargebacks and the costs of collection. Free trials, promotions and credits (if any) are subject to their specific terms.",
        ],
    },
    {
        heading: "Intellectual property and feedback",
        body: [
            "The Service, including software, models, interfaces, content, trademarks and logos, is owned by Luxor Intelligence LLC or its licensors and is protected by intellectual-property laws. Subject to these Terms, we grant you a limited, revocable, non-exclusive, non-transferable, non-sublicensable right to access and use the Service for your internal business or personal purposes. We reserve all rights not expressly granted. If you give us feedback or suggestions, you grant us a perpetual, irrevocable, worldwide, royalty-free license to use them without obligation to you.",
        ],
    },
    {
        heading: "Copyright and takedown notices",
        body: [
            "We respect intellectual-property rights. If you believe content on the Service infringes your copyright, send a notice with the information required by 17 U.S.C. § 512(c)(3) (identification of the work, the infringing material and its location, your contact details, a good-faith statement and a statement under penalty of perjury that you are authorized to act) to legal@luxorintelligence.com. We may remove allegedly infringing content and terminate repeat infringers.",
        ],
    },
    {
        heading: "Beta features, availability and changes",
        body: [
            "We may offer features labeled beta, preview or experimental, which are provided as-is, may change or be withdrawn at any time, and may have additional limits or terms. We aim for reliable service but do not guarantee uninterrupted or error-free operation, and the Service may be unavailable due to maintenance, third-party outages or events beyond our control.",
        ],
    },
    {
        heading: "Suspension and termination",
        body: [
            "You may stop using the Service at any time and may request deletion of your account (see /data-deletion for how to do so and how your data is handled). We may suspend or terminate the Service or your access immediately if you breach these Terms, if required by law or by a third-party platform, to protect the Service or others, or for non-payment. On termination your right to use the Service ends; sections that by their nature should survive (including ownership, payment obligations, disclaimers, limitation of liability, indemnity, dispute resolution and general provisions) survive.",
        ],
    },
    {
        heading: "Digital assets and payments disclosures",
        body: [
            "Digital assets are volatile and carry risk, blockchain transactions are final, and you alone control your wallets and keys. Multisig treasuries require the approval of the configured signers: if signers lose access, disagree or act maliciously, funds may become inaccessible or be moved, and we cannot recover or reverse them.",
            "If you use the token launcher, you are solely responsible for the tokens you create and for their legality, disclosures, marketing and compliance in every jurisdiction where they are offered. We do not review, endorse or guarantee any token, project, merchant or counterparty, and the Service may be used to create tokens that lose all value.",
            "Nothing in the Service or on our websites is investment, legal, tax or financial advice or an offer to sell or a solicitation to buy any security or financial product in any jurisdiction. Fiat on-ramp and off-ramp services are provided by third parties and may require identity verification. You are responsible for compliance with the laws that apply to you, including tax, anti-money-laundering and sanctions laws.",
        ],
    },
    {
        heading: "Disclaimers",
        body: [
            "TO THE MAXIMUM EXTENT PERMITTED BY LAW, THE SERVICE IS PROVIDED \"AS IS\" AND \"AS AVAILABLE\" WITHOUT WARRANTIES OF ANY KIND, WHETHER EXPRESS, IMPLIED OR STATUTORY, INCLUDING IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, TITLE, NON-INFRINGEMENT AND ACCURACY. WE DO NOT WARRANT THAT THE SERVICE, AI OUTPUTS OR THIRD-PARTY CHANNELS WILL BE UNINTERRUPTED, SECURE, ACCURATE OR ERROR-FREE, OR THAT MESSAGES WILL BE DELIVERED. Some jurisdictions do not allow certain disclaimers, so some of these may not apply to you.",
        ],
    },
    {
        heading: "Limitation of liability",
        body: [
            "TO THE MAXIMUM EXTENT PERMITTED BY LAW, LUXOR INTELLIGENCE LLC, ITS AFFILIATES, OFFICERS, MEMBERS, EMPLOYEES AND LICENSORS WILL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, EXEMPLARY OR PUNITIVE DAMAGES, OR FOR LOSS OF PROFITS, REVENUE, DATA, BUSINESS OR GOODWILL, ARISING OUT OF OR RELATED TO THE SERVICE OR THESE TERMS, EVEN IF ADVISED OF THE POSSIBILITY. OUR TOTAL LIABILITY FOR ALL CLAIMS RELATING TO THE SERVICE WILL NOT EXCEED THE GREATER OF THE AMOUNT YOU PAID US FOR THE SERVICE IN THE 12 MONTHS BEFORE THE EVENT GIVING RISE TO THE CLAIM AND ONE HUNDRED US DOLLARS (US$100). These limits apply regardless of the legal theory and do not exclude liability that cannot be excluded by law.",
        ],
    },
    {
        heading: "Indemnification",
        body: [
            "You will defend, indemnify and hold harmless Luxor Intelligence LLC and its affiliates, officers, members, employees and agents from and against claims, damages, liabilities, losses and expenses (including reasonable attorneys' fees) arising from your Customer Data, your use of the Service, the tokens you create, your transactions with third parties, or your breach of these Terms or applicable law.",
        ],
    },
    {
        heading: "Export controls and sanctions",
        body: [
            "You represent that you are not located in, or a resident or national of, a country or region subject to comprehensive US sanctions, and are not on any US government list of prohibited or restricted parties. You will not use or export the Service in violation of US or other applicable export-control and sanctions laws.",
        ],
    },
    {
        heading: "Informal resolution, governing law and venue",
        body: [
            "Before filing a claim, you agree to contact us at legal@luxorintelligence.com and try to resolve the dispute informally for at least 30 days. These Terms and any dispute relating to them or the Service are governed by the laws of the jurisdiction in which Luxor Intelligence LLC is organized, excluding its conflict-of-laws rules, and disputes that are not resolved informally will be brought in the competent courts of that jurisdiction, to whose jurisdiction you consent, except where mandatory consumer-protection law of your place of residence gives you non-waivable rights to bring claims elsewhere.",
        ],
    },
    {
        heading: "General",
        body: [
            "These Terms and the documents they reference are the entire agreement between you and us about the Service and supersede prior agreements on the same subject. If a provision is unenforceable, the rest remains in effect. Our failure to enforce a provision is not a waiver. You may not assign these Terms without our consent; we may assign them in connection with a merger, acquisition or sale of assets. Neither party is liable for delays or failures caused by events beyond its reasonable control. We may send notices to the email associated with your account or post them in the Service; notices to us go to legal@luxorintelligence.com. These Terms are written in English, which controls over any translation. There are no third-party beneficiaries except as stated. We may update these Terms by posting the new version with a new date; material changes will be notified in advance where required, and continued use after the effective date means you accept them.",
        ],
    },
    {
        heading: "Contact",
        body: [
            "Luxor Intelligence LLC, 470 W 200 N, Salt Lake City, UT 84103, USA.",
            [
                "Legal: legal@luxorintelligence.com",
                "Support: support@luxorintelligence.com",
                "Business inquiries: business@luxorintelligence.com",
            ],
        ],
    },
];

export default function TermsPage() {
    return (
        <LegalPage
            title="Terms of Service"
            updated="October 22, 2026"
            intro="Please read these Terms carefully. They form a legal agreement between you and Luxor Intelligence LLC for the use of Sterling."
            sections={sections}
        />
    );
}
