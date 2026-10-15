export interface NavLink {
  name: string;
  desc?: string;
  href: string;
  external?: boolean;
}

export interface NavColumn {
  title?: string;
  links: NavLink[];
}

export interface NavGroup {
  key: string;
  label: string;
  /** Tailwind width class of the desktop panel. */
  panelWidth: string;
  columns: NavColumn[];
}

/** Anchor ids rendered on the landing page (see app/page.tsx). */
export const SECTION_IDS = {
  innovation: 'innovation',
  philosophy: 'philosophy',
  architecture: 'architecture',
  solutions: 'solutions',
  showcase: 'showcase',
  pillars: 'pillars',
  join: 'join',
  reviews: 'reviews',
} as const;

const WHITEPAPER = 'https://github.com/admluxorsys/luxor/blob/main/Whitepaper.md';
const GITHUB_REPO = 'https://github.com/admluxorsys/luxor';
const SUPPORT_MAIL = 'https://mail.google.com/mail/?view=cm&fs=1&to=support@luxorintelligence.com';

/** Tools that need a session: send through login and land on the tool afterwards. */
const afterLogin = (path: string) => `/login?redirect=${encodeURIComponent(path)}`;

export const NAV_GROUPS: NavGroup[] = [
  {
    key: 'products',
    label: 'Products',
    panelWidth: 'w-[34rem]',
    columns: [
      {
        title: 'Accept payments',
        links: [
          { name: 'Web Gateway (eCommerce)', desc: 'Integrate API, Shopify or WooCommerce checkout.', href: `/#${SECTION_IDS.innovation}` },
          { name: 'Payment Links & QR', desc: 'Share checkout links and Solana Pay QR codes.', href: afterLogin('/dashboard/links') },
          { name: 'Point of Sale (POS)', desc: 'Smart physical POS terminals & mobile apps.', href: afterLogin('/dashboard/pos') },
          { name: 'Payment Requests', desc: 'Invoice customers and track every payment.', href: afterLogin('/dashboard/requests') },
        ],
      },
      {
        title: 'Manage & grow',
        links: [
          { name: 'Multisig Treasury', desc: 'Shared vaults with member approvals.', href: afterLogin('/dashboard/treasury') },
          { name: 'Swap & Onramp', desc: 'Convert and fund balances on Solana.', href: afterLogin('/dashboard/swap') },
          { name: 'Token Launcher', desc: 'Create and explore tokens on-chain.', href: afterLogin('/token-launcher') },
          { name: 'Ecosystem & Tokenization', desc: 'Hybrid Web3 payments & asset support.', href: `/#${SECTION_IDS.philosophy}` },
        ],
      },
    ],
  },
  {
    key: 'solutions',
    label: 'Solutions',
    panelWidth: 'w-[30rem]',
    columns: [
      {
        title: 'By Size',
        links: [
          { name: 'Startups', href: `/#${SECTION_IDS.solutions}` },
          { name: 'SMBs', href: `/#${SECTION_IDS.solutions}` },
          { name: 'Enterprises', href: `/#${SECTION_IDS.solutions}` },
        ],
      },
      {
        title: 'By Industry',
        links: [
          { name: 'Retail & Physical Stores', href: afterLogin('/dashboard/pos') },
          { name: 'eCommerce & Digital', href: `/#${SECTION_IDS.innovation}` },
          { name: 'Marketplaces', href: `/#${SECTION_IDS.showcase}` },
          { name: 'Local Businesses', href: afterLogin('/dashboard/links') },
        ],
      },
    ],
  },
  {
    key: 'developers',
    label: 'Developers',
    panelWidth: 'w-80',
    columns: [
      {
        links: [
          { name: 'Documentation & API', desc: 'Full API Reference and developer integration guides.', href: WHITEPAPER, external: true },
          { name: 'Smart Programs & SDKs', desc: 'Prebuilt modules and Solana on-chain programs.', href: GITHUB_REPO, external: true },
          { name: 'Transaction Builder (Tx Builder)', desc: 'Sandbox environment for risk-free simulation.', href: afterLogin('/dashboard/developers/tx-builder') },
          { name: 'Token Manager (SPL)', desc: 'Configure accepted payment assets and token mints.', href: afterLogin('/dashboard/developers/token-manager') },
        ],
      },
    ],
  },
  {
    key: 'resources',
    label: 'Resources',
    panelWidth: 'w-80',
    columns: [
      {
        links: [
          { name: 'Blog', desc: 'Insights on Web3 commerce and platform updates.', href: 'https://luxorintelligence.com', external: true },
          { name: 'Help Center', desc: '24/7 customer support and docs.', href: SUPPORT_MAIL, external: true },
          { name: 'Privacy Policy', desc: 'How we handle your data.', href: '/privacy' },
          { name: 'Terms of Use', desc: 'The rules of using Sterling.', href: '/terms' },
          { name: 'Governance / DAO', desc: 'Active proposal voting and tokenomics.', href: `/#${SECTION_IDS.pillars}` },
        ],
      },
    ],
  },
];

