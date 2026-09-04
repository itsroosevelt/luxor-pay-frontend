import { Metadata } from 'next';
import { ContactsContainer } from '@/components/dashboard/contacts/ContactsContainer';

export const metadata: Metadata = {
  title: 'Contactos & Directorio | Luxor Pay',
  description: 'Gestiona tus contactos frecuentes y transferencias en la red Luxor Pay.',
};

export default function ContactsPage() {
  return <ContactsContainer />;
}
