import { redirect } from 'next/navigation';

export default function PaymentsHubPage() {
  redirect('/dashboard/payments/checkout');
}
