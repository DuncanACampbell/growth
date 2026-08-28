import { logger } from 'firebase-functions';
import { HttpsError } from 'firebase-functions/v2/https';

export const OPENING_LOAD_FAILED =
  'Couldn’t load today’s opening. Please try again.';

export function isFunctionsEmulator(): boolean {
  return process.env.FUNCTIONS_EMULATOR === 'true';
}

function readOpenAiMetadata(error: unknown): Record<string, unknown> | undefined {
  if (!error || typeof error !== 'object') {
    return undefined;
  }
  const record = error as Record<string, unknown>;
  const metadata: Record<string, unknown> = {};
  for (const key of [
    'name',
    'message',
    'status',
    'code',
    'type',
    'request_id',
    'requestID',
  ] as const) {
    if (record[key] !== undefined) {
      metadata[key] = record[key];
    }
  }
  if (record.error && typeof record.error === 'object') {
    const nested = record.error as Record<string, unknown>;
    if (typeof nested.message === 'string' && metadata.message == null) {
      metadata.message = nested.message;
    }
    if (nested.code != null && metadata.code == null) {
      metadata.code = nested.code;
    }
    if (nested.type != null && metadata.type == null) {
      metadata.type = nested.type;
    }
  }
  if (metadata.requestID != null && metadata.request_id == null) {
    metadata.request_id = metadata.requestID;
  }
  return Object.keys(metadata).length > 0 ? metadata : undefined;
}

/** Logs the original exception for Cloud Logging / the emulator console. Never logs API keys. */
export function logCallableFailure(
  scope: string,
  error: unknown,
  extra?: Record<string, unknown>,
): void {
  logger.error(`${scope} failed`, {
    ...extra,
    error,
    message: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
    openai: readOpenAiMetadata(error),
  });
}

/**
 * Rethrows HttpsError unchanged. Other failures become `internal`,
 * with the original message only while the Functions emulator is running.
 */
export function rethrowCallableError(
  error: unknown,
  productionMessage: string,
  emulatorPrefix: string,
): never {
  if (error instanceof HttpsError) {
    throw error;
  }
  const original = error instanceof Error ? error.message : String(error);
  throw new HttpsError(
    'internal',
    isFunctionsEmulator()
      ? `${emulatorPrefix}: ${original}`
      : productionMessage,
  );
}
