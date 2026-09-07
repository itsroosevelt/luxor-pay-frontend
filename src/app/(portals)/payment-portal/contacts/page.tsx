import { Metadata } from 'next';
import { ContactsContainer } from '@/components/dashboard/contacts/ContactsContainer';

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
