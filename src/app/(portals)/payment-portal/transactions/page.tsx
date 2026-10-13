import { TransactionsPage } from '@/features/transactions/components/TransactionsPage';

export default function PortalTransactionsPage() {
  return (
    <TransactionsPage
      title="Transactions"
      subtitle="History of transfers and settled payments from POS Terminals and Payment Links."
      showMultisig={false}
    />
  );
}
