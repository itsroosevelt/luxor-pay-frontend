import { notFound, redirect } from 'next/navigation';

const LEGACY_SLUG_REDIRECTS: Record<string, string> = {
  pricing: '/dashboard/settings/planes',
  'team-security': '/dashboard/settings/equipo',
  'luxor-profile': '/dashboard/settings/perfil',
  features: '/dashboard/settings/funcionalidades',
  perks: '/dashboard/settings/ventajas',
};

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function SettingsLegacySlugPage({ params }: PageProps) {
  const { slug } = await params;
  const destination = LEGACY_SLUG_REDIRECTS[slug];
  if (destination) redirect(destination);
  notFound();
}
