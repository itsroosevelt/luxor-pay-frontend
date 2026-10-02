import { Metadata } from 'next';
import { ContactsContainer } from '@/features/contacts/components/ContactsContainer';

export const metadata: Metadata = {
  title: 'Contacts & Customers | Luxor POS Portal',
  description: 'Manage contacts and customer directory for POS payments.',
};

export default function PortalContactsPage() {
  return (
    <div className="w-full min-w-0">
      <ContactsContainer />
    </div>
  );
}
