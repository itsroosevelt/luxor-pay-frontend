import { Metadata } from 'next';
import { ContactsContainer } from '@/components/dashboard/contacts/ContactsContainer';

export const metadata: Metadata = {
  title: 'Clientes & Directorio | Luxor POS Portal',
  description: 'Directorio de clientes y contactos para cobros en el portal POS.',
};

export default function PortalCustomersPage() {
  return (
    <div className="w-full min-w-0">
      <ContactsContainer />
    </div>
  );
}

