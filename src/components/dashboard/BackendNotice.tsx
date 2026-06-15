'use client';

interface BackendNoticeProps {
  unavailable?: boolean;
  notImplemented?: boolean;
}

export function BackendNotice({ unavailable, notImplemented }: BackendNoticeProps) {
  if (!unavailable && !notImplemented) return null;

  return (
    <div className="dash-card p-4 text-sm text-[var(--dash-muted)] border-[var(--dash-border)]">
      {unavailable ? (
        <p>
          <strong className="text-[var(--dash-text)]">Modo demo (solo frontend).</strong> No hay
          backend conectado — facturación, radar, disputas y pantallas similares muestran estados
          vacíos. Pagos, enlaces, productos, clientes y ajustes del comercio usan localStorage del
          navegador.
        </p>
      ) : (
        <p>
          <strong className="text-[var(--dash-text)]">No disponible en modo demo.</strong> Esta
          interfaz estará lista cuando conectes un servidor backend.
        </p>
      )}
    </div>
  );
}
