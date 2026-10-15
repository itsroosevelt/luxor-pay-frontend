export interface EcosystemItem {
  title: string;
  desc?: string;
  image?: string;
  icon?: 'users' | 'cpu' | 'compass' | 'github';
  href: string;
  external?: boolean;
}

export const ECOSYSTEM_ITEMS: EcosystemItem[] = [
  {
    title: 'UTILITY ASSET | $LXR',
    image: 'https://firebasestorage.googleapis.com/v0/b/landluxor.firebasestorage.app/o/Ecosystem%2Flxr_logo.png?alt=media&token=6c98c336-e417-4b75-8d5c-729233c5097b',
    href: 'https://luxorstandard.com/',
    external: true,
  },
  {
    title: 'EXCELSIOR REAL WORLD ASSET | $XLS',
    image: 'https://firebasestorage.googleapis.com/v0/b/landluxor.firebasestorage.app/o/Ecosystem%2FWhatsApp%20Image%202026-07-27%20at%209.35.45%20AM.jpeg?alt=media&token=b09d84e7-061b-45e6-972b-f02d3cbb19dc',
    href: 'https://excelsiorstandard.com/',
    external: true,
  },
  {
    title: 'STABLECOIN | $USDX',
    image: 'https://firebasestorage.googleapis.com/v0/b/landluxor.firebasestorage.app/o/Ecosystem%2FWhatsApp%20Image%202026-07-09%20at%209.44.56%20AM.jpeg?alt=media&token=531b81b9-652c-4aa0-8652-c2de6c531e6e',
    href: 'https://occidentstandard.com/',
    external: true,
  },
  {
    title: 'ROOSEVELT SUPER INTELLIGENCE',
    image: 'https://firebasestorage.googleapis.com/v0/b/landluxor.firebasestorage.app/o/Ecosystem%2Frai-logo.jpg?alt=media&token=a091e66f-596e-451b-bd46-b3672d352d9e',
    href: 'https://itsroosevelt.com/',
    external: true,
  },
  {
    title: 'ROYALTY | DIGITAL FINANCIAL INSTITUTION',
    image: 'https://firebasestorage.googleapis.com/v0/b/landluxor.firebasestorage.app/o/Ecosystem%2FWhatsApp%20Image%202026-08-23%20at%207.04.34%20AM.jpeg?alt=media&token=e577ab9e-4bde-465f-9d0c-b3f7ae93961c',
    href: 'https://itsroyalty.us/',
    external: true,
  },
  {
    title: 'STERLING | MULTISIG - TOKEN LAUNCHER - PAYMENT GATEWAY',
    image: 'https://firebasestorage.googleapis.com/v0/b/landluxor.firebasestorage.app/o/Ecosystem%2FWhatsApp%20Image%202026-07-09%20at%209.44.55%20AM%20(1).jpeg?alt=media&token=88e66557-972f-4081-8583-fd1f772d83b9',
    href: 'https://itssterling.com/',
    external: true,
  },
  {
    title: 'THE NEW GRAN COLOMBIA',
    image: 'https://firebasestorage.googleapis.com/v0/b/landluxor.firebasestorage.app/o/Ecosystem%2Fcropped_circle_image%20(2).png?alt=media&token=ca8a774d-be5d-4e3c-911a-7301f04a661d',
    href: 'https://itspormi.com/',
    external: true,
  },
  {
    title: 'POR MI | ECUADOR',
    image: 'https://firebasestorage.googleapis.com/v0/b/landluxor.firebasestorage.app/o/Ecosystem%2Fcropped_circle_image%20(5).png?alt=media&token=8552834b-7d13-4e8c-a2bc-74742055e2c1',
    href: 'https://chat.whatsapp.com/IlBVqL8K5XW76JXS23pGgt',
    external: true,
  },
  {
    title: 'POR MI | COLOMBIA',
    image: 'https://firebasestorage.googleapis.com/v0/b/landluxor.firebasestorage.app/o/Ecosystem%2Fcropped_circle_image%20(6).png?alt=media&token=d045b215-0ab1-4772-8110-6ad5e697d769',
    href: 'https://chat.whatsapp.com/DBqxD9iAT0S2xPZAMixrmk',
    external: true,
  },
  {
    title: 'POR MI | VENEZUELA',
    image: 'https://firebasestorage.googleapis.com/v0/b/landluxor.firebasestorage.app/o/Ecosystem%2Fcropped_circle_image%20(7).png?alt=media&token=792a5408-6a1c-44d9-8cab-1cd15646a299',
    href: 'https://chat.whatsapp.com/DBqxD9iAT0S2xPZAMixrmk',
    external: true,
  },
  {
    title: 'POR MI | PANAMA',
    image: 'https://firebasestorage.googleapis.com/v0/b/landluxor.firebasestorage.app/o/Ecosystem%2Fcropped_circle_image%20(4).png?alt=media&token=1eb162ea-12e5-4e62-bc16-938a8f14738c',
    href: 'https://www.itspormi.com/',
    external: true,
  },
  {
    title: 'UDREAMMS | YOUR DREAM IN AMERICA',
    image: 'https://firebasestorage.googleapis.com/v0/b/landluxor.firebasestorage.app/o/Ecosystem%2FWhatsApp%20Image%202026-07-13%20at%2010.02.08%20AM.jpeg?alt=media&token=4dc67b27-5ba1-4293-acd7-2d2895c4538f',
    href: 'https://udreamms.com/',
    external: true,
  },
  {
    title: 'POR MI | THE NEW TECHNOLOGICAL REPUBLIC',
    image: 'https://firebasestorage.googleapis.com/v0/b/landluxor.firebasestorage.app/o/Ecosystem%2Fpor-mi-america.png?alt=media&token=9a28c490-8674-4434-8dc1-67c0a9ce60db',
    href: 'https://itspormi.com/',
    external: true,
  },
  {
    title: 'POR MI | UNITED STATES',
    image: 'https://firebasestorage.googleapis.com/v0/b/landluxor.firebasestorage.app/o/Ecosystem%2FGemini_Generated_Image_m0uwrzm0uwrzm0uw.jpg?alt=media&token=5174b9f6-335f-49dd-8995-d82e6169e599',
    href: 'https://itspormi.com/',
    external: true,
  },
  {
    title: 'Our Partners',
    desc: 'Companies backing Sterling',
    icon: 'users',
    href: 'https://luxorstandard.com',
    external: true,
  },
  {
    title: 'Real Use Cases',
    desc: 'Real-world utility',
    icon: 'cpu',
    href: 'https://luxorstandard.com',
    external: true,
  },
  {
    title: 'Adoption Map',
    desc: 'Global project presence',
    icon: 'compass',
    href: 'https://luxorstandard.com',
    external: true,
  },
  {
    title: 'Github',
    desc: 'Open source code.',
    icon: 'github',
    href: 'https://github.com/admluxorsys',
    external: true,
  },
];
