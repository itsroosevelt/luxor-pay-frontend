import { redirect } from 'next/navigation';

export default function AdminMerchantsRedirectPage() {
  redirect('/admin/users');
}
