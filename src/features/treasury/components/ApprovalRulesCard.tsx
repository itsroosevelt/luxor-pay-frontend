'use client';

import { useMemo, useState } from 'react';
import { AlertTriangle, CheckCircle2, Clock, Info, Loader2, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import type { Member } from '@/features/treasury/api/members-api';
import { useProposals } from '@/features/treasury/hooks/useProposals';
import { useTreasury } from '@/features/treasury/hooks/useTreasury';
import { describeThreshold, formatTimeLock, rejectionCutoff, thresholdAdvice, thresholdOptions } from '@/features/treasury/lib/approval-rules';

interface ApprovalRulesCardProps {
  members: Member[];
  /** Whether the person looking at the page may change rules (a proposer, not a read-only preview). */
  canEdit: boolean;
  /** Same gate the rest of the Members page uses (wallet connected, role allowed); toasts when it says no. */
  guard: () => boolean;
}

/**
 * "How many signers must approve a transaction?": shows the rule in force, lets a proposer pick another one
 * and explains what each choice means. On an on-chain multisig the change is itself a proposal, approved with
 * the rule that is in force now.
 */
export function ApprovalRulesCard({ members, canEdit, guard }: ApprovalRulesCardProps) {
  const { config, setThreshold } = useTreasury();
  const { data: proposals } = useProposals();

  // Only members that can really vote count: on-chain, those the multisig lists.
  const voters = useMemo(
    () => Math.max(1, members.filter((m) => m.roles.signer && (!config?.onChain || m.onChain !== false)).length),
    [members, config?.onChain],
  );
  const current = config?.threshold ?? 1;
  // What the proposer picked; until they pick something it follows the rule in force.
  const [picked, setPicked] = useState<number | null>(null);
  const next = Math.min(picked ?? current, voters);
  const setNext = (n: number) => setPicked(n);
  const [busy, setBusy] = useState(false);

  const pending = useMemo(
    () => proposals.find((p) => p.type === 'config' && p.title.startsWith('Cambiar umbral') && ['draft', 'active', 'approved'].includes(p.status)),
    [proposals],
  );

  if (!config) return null;

  const advice = thresholdAdvice(next, voters);
  const unchanged = next === current;
  const needsProposal = !!config.onChain;

  const apply = async () => {
    if (!guard() || unchanged) return;
    setBusy(true);
    try {
      const { proposalIndex, executed } = await setThreshold(next);
      setPicked(null);
      toast.success(
        executed
          ? `Regla actualizada: ahora hacen falta ${next} de ${voters} firmantes.`
          : `Propuesta #${proposalIndex} creada · la regla cambiará cuando se apruebe con la regla actual (${current} de ${voters}).`,
      );
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'No se pudo cambiar la regla');
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 md:p-6 space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-semibold tracking-tight text-white">
            <ShieldCheck size={18} className="text-white/70" /> Reglas de aprobación
          </h2>
          <p className="mt-1 text-[13px] text-white/55">Cuántos firmantes deben aprobar una transacción antes de que se ejecute.</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-black/30 px-4 py-2 text-right">
          <div className="text-[11px] uppercase tracking-[0.2em] text-white/45">Regla actual</div>
          <div className="text-xl font-semibold text-white">{current} <span className="text-white/45">de {voters}</span></div>
        </div>
      </div>

      <div className="space-y-2">
        <div className="text-[11px] font-bold tracking-[0.25em] uppercase text-white/50">Firmas necesarias</div>
        <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Firmas necesarias">
          {thresholdOptions(voters).map((n) => {
            const selected = n === next;
            return (
              <button
                key={n}
                type="button"
                role="radio"
                aria-checked={selected}
                disabled={!canEdit || busy || !!pending}
                onClick={() => setNext(n)}
                title={n === current ? 'Regla actual' : `Pedir ${n} de ${voters} firmas`}
                className="min-w-[56px] rounded-full px-4 py-2 text-sm font-semibold transition-all disabled:opacity-40"
                style={{
                  background: selected ? '#FFFFFF' : 'rgba(255,255,255,0.04)',
                  color: selected ? '#000000' : 'rgba(255,255,255,0.7)',
                  border: n === current ? '1px solid rgba(255,255,255,0.55)' : '1px solid rgba(255,255,255,0.12)',
                }}
              >
                {n}
              </button>
            );
          })}
          <span className="self-center text-[13px] text-white/45">de {voters} firmantes</span>
        </div>
      </div>

      <div className="space-y-2 text-[13px] leading-relaxed text-white/75">
        <p>{describeThreshold(next, voters)}</p>
        {voters > 1 && (
          <p className="text-white/55">
            Una propuesta se rechaza definitivamente con {rejectionCutoff(next, voters)} {rejectionCutoff(next, voters) === 1 ? 'voto en contra' : 'votos en contra'}.
          </p>
        )}
        {advice && (
          <p className={`flex items-start gap-2 rounded-xl px-3 py-2 ${advice.tone === 'warn' ? 'bg-amber-500/10 text-amber-200' : 'bg-emerald-500/10 text-emerald-200'}`}>
            {advice.tone === 'warn' ? <AlertTriangle size={15} className="mt-0.5 flex-shrink-0" /> : <CheckCircle2 size={15} className="mt-0.5 flex-shrink-0" />}
            <span>{advice.text}</span>
          </p>
        )}
      </div>

      {pending && (
        <p className="flex items-start gap-2 rounded-xl bg-sky-500/10 px-3 py-2 text-[13px] text-sky-200">
          <Info size={15} className="mt-0.5 flex-shrink-0" />
          <span>Hay un cambio de regla pendiente: propuesta #{pending.index} ({pending.title.replace('Cambiar umbral a ', 'pasar a ')}). Hasta que se ejecute no se puede proponer otro.</span>
        </p>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="max-w-xl text-[12px] text-white/45">
          {needsProposal
            ? 'Cualquier Proposer puede proponer el cambio, y se aprueba con la regla que está vigente ahora. Si la regla actual es 1 de N, se aplica al instante.'
            : 'Este multisig aún no está activado: el cambio se guarda en Luxor y se aplicará al activarlo.'}
        </p>
        <button
          type="button"
          onClick={apply}
          disabled={!canEdit || busy || unchanged || !!pending}
          className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-black transition-colors hover:bg-neutral-200 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {busy && <Loader2 size={15} className="animate-spin" />}
          {needsProposal ? `Proponer ${next} de ${voters}` : `Guardar ${next} de ${voters}`}
        </button>
      </div>

      <div className="flex items-start gap-3 border-t border-white/10 pt-4 text-[13px] text-white/65">
        <Clock size={15} className="mt-0.5 flex-shrink-0 text-white/45" />
        <div>
          <span className="font-semibold text-white/85">Tiempo de espera: </span>
          {formatTimeLock(config.timeLock)}
          <p className="mt-0.5 text-[12px] text-white/40">Se fija al crear el multisig. Si hay espera, una propuesta aprobada solo puede ejecutarse pasado ese tiempo.</p>
        </div>
      </div>
    </section>
  );
}
