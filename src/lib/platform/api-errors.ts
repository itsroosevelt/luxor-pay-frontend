export function parseApiError(json: Record<string, unknown>, fallback: string): string {
  const { message, error } = json;
  if (Array.isArray(message)) {
    return message.map(String).join(', ');
  }
  if (typeof message === 'string' && message) {
    return message;
  }
  if (typeof error === 'string' && error) {
    return error;
  }
  return fallback;
}

/** Maps common backend/network errors to user-friendly Spanish messages. */
export function localizeApiError(message: string): string {
  if (message.includes('Could not reach the API') || message.includes('Failed to fetch')) {
    return 'No se pudo conectar al backend. Verifica que luxor-pay-be-solana esté corriendo en el puerto 3008.';
  }
  if (message.includes('Invalid session token') || message.includes('Invalid authentication token')) {
    return 'Sesión inválida. Verifica que Firebase coincida con el backend.';
  }
  if (message.includes('Failed to create merchant profile')) {
    return 'No se pudo crear el perfil del comercio. Revisa los logs del backend.';
  }
  if (message.includes('Merchant profile not found')) {
    return 'Perfil de comercio no encontrado.';
  }
  return message;
}

export function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message) {
    return localizeApiError(error.message);
  }
  return fallback;
}

/** Alias used across dashboard pages. */
export const apiErrorMessage = getErrorMessage;
