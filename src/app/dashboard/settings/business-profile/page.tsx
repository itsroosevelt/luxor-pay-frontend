import { redirect } from 'next/navigation';

export default function BusinessProfileSettingsRedirectPage() {
  redirect('/dashboard/settings/empresa?tab=datos-empresa');
}
