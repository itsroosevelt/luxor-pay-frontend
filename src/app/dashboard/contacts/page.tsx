import { Metadata } from 'next';
import { ContactsContainer } from '@/components/dashboard/contacts/ContactsContainer';

export const metadata: Metadata = {
  title: 'Contacts | Luxor Pay',
  description: 'Manage your frequent transaction contacts on the Luxor network.',
};

export default function ContactsPage() {
  return (
    <>
      <header className="lx-page-header">
        <div>
          <h1 className="lx-page-title">
            Contacts
          </h1>
          <p className="lx-page-subtitle">
            Manage your frequent transaction contacts on the Luxor network.
          </p>
        </div>
      </header>

      <ContactsContainer />
    </>
  );
}
