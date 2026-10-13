import { Metadata } from 'next';
import { TransactionsPage } from '@/features/transactions/components/TransactionsPage';

export const metadata: Metadata = {
  title: 'Transactions | Sterling',
  description: 'Squads multisig transaction history, approvals, and settled transfers.',
};

export default function DashboardTransactionsPage() {
  return (
    <TransactionsPage
      title="Transactions"
      subtitle="Squads multisig transaction history, approvals, and settled transfers."
      showMultisig={true}
    />
  );
}
