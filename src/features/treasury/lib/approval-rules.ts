/** Pure helpers for the multisig's approval rules (how many signers must approve a transaction). */

export type AdviceTone = 'ok' | 'warn';

export interface ThresholdAdvice {
  tone: AdviceTone;
  text: string;
}

/** The thresholds that can be chosen: from 1 up to the number of signers that can vote. */
export function thresholdOptions(voters: number): number[] {
  return Array.from({ length: Math.max(1, voters) }, (_, i) => i + 1);
}

/** "2 of 3" in a sentence. */
export function describeThreshold(threshold: number, voters: number): string {
  if (voters <= 1) return 'Hay un solo firmante: aprueba y ejecuta por su cuenta.';
  if (threshold === 1) return `Basta 1 de ${voters} firmantes para aprobar y ejecutar una transacción.`;
  return `Hacen falta ${threshold} de ${voters} firmantes distintos para aprobar una transacción antes de ejecutarla.`;
}

/** How many "no" votes end a proposal for good: once the threshold can no longer be reached. */
export function rejectionCutoff(threshold: number, voters: number): number {
  return Math.max(1, voters - threshold + 1);
}

/** A caution about the chosen rule, or null when there is nothing to say. */
export function thresholdAdvice(threshold: number, voters: number): ThresholdAdvice | null {
  if (voters <= 1) return null;
  if (threshold === 1) {
    return { tone: 'warn', text: 'Cualquier firmante puede mover los fondos por sí solo, sin que otro lo apruebe.' };
  }
  if (threshold === voters) {
    return {
      tone: 'warn',
      text: 'Hacen falta TODOS los firmantes: si uno pierde el acceso a su wallet, nadie podrá aprobar nada. Deja al menos uno de margen.',
    };
  }
  return { tone: 'ok', text: 'Buen equilibrio: ningún firmante mueve fondos solo y se puede operar si falta alguno.' };
}

/** The time lock is stored in seconds. */
export function formatTimeLock(seconds: number): string {
  if (!seconds || seconds <= 0) return 'Sin espera: se ejecuta apenas se aprueba';
  const units: [number, string, string][] = [
    [86_400, 'día', 'días'],
    [3_600, 'hora', 'horas'],
    [60, 'minuto', 'minutos'],
  ];
  for (const [size, one, many] of units) {
    if (seconds >= size && seconds % size === 0) {
      const n = seconds / size;
      return `${n} ${n === 1 ? one : many} de espera tras la aprobación`;
    }
  }
  return `${seconds} segundos de espera tras la aprobación`;
}
