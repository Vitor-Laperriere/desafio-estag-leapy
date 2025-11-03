import { ApplicationError } from "./application-error";

export function ensureError(
  error: unknown,
  fallbackMessage = "Erro inesperado"
): Error {
  if (error instanceof Error) return error;
  return new ApplicationError(fallbackMessage, { cause: error });
}
