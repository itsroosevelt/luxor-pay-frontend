export function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}

/** @deprecated Use getErrorMessage — kept for gradual migration */
export const getFirestoreErrorMessage = getErrorMessage;
