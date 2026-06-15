import { AdminShell } from '@/components/admin/AdminShell';
import { Toaster } from 'sonner';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminShell>
      <Toaster theme="dark" position="top-right" />
      {children}
    </AdminShell>
  );
}
