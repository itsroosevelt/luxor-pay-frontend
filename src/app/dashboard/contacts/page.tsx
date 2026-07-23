import { Metadata } from 'next';
import { ContactsContainer } from '@/components/dashboard/contacts/ContactsContainer';

export const metadata: Metadata = {
  title: 'Contacts | Luxor Pay',
  description: 'Manage your frequent transaction contacts on the Luxor network.',
};

export default function ContactsPage() {
  return (
    <>
      <header className="px-6 py-6 md:px-10 md:py-8 border-b border-white/5 bg-white/[0.01]">
        <div>
          <h1 className="text-2xl md:text-3xl font-medium text-white tracking-tight mb-1" style={{ fontFamily: 'Outfit, sans-serif' }}>
            Contacts
          </h1>
          <p className="text-gray-400 text-sm font-light" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            Manage your frequent transaction contacts on the Luxor network.
          </p>
        </div>
      </header>

      <ContactsContainer />
    </>
  );
}
