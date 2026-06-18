import { Metadata } from 'next';
import { ContactsContainer } from '@/components/dashboard/contacts/ContactsContainer';

export const metadata: Metadata = {
  title: 'Contacts | Luxor Pay',
  description: 'Manage your frequent transaction contacts on the Luxor network.',
};

export default function ContactsPage() {
  return <ContactsContainer />;
}
