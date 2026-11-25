/**
 * Extrae el mensaje legible de un error HTTP de Spring Boot.
 * Cubre los formatos más comunes: campo `mensaje`/`message`, lista de `errors` de @Valid,
 * campo `error`, mapa { campo: mensaje } y cadena plana.
 */
export function extraerMensajeError(err: any, fallback = 'Ocurrió un error. Inténtalo de nuevo.'): string {
  const body = err?.error;
  if (!body) return err?.message ?? fallback;

  if (typeof body === 'string') return body;

  if (body.mensaje) return body.mensaje;   // formato propio del backend
  if (body.message) return body.message;

  if (Array.isArray(body.errors) && body.errors.length > 0) {
    return body.errors
      .map((e: any) => e.defaultMessage ?? e.mensaje ?? e.message ?? e)
      .join(' | ');
  }

  if (body.error) return body.error;

  // Mapa { campo: mensaje } que devuelve el handler de MethodArgumentNotValidException
  const mensajesCampo = Object.values(body).filter((v): v is string => typeof v === 'string');
  if (mensajesCampo.length > 0) return mensajesCampo.join(' | ');

  return fallback;
}
