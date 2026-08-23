/**
 * Future LLM calls belong here — not in the mobile app.
 *
 * When an API key exists, store it with:
 *   firebase functions:secrets:set LLM_API_KEY
 * then pass `{ secrets: [llmApiKey] }` into `onCall` and read it in this module.
 *
 * Do not add a placeholder key.
 */
export async function generateSelfEsteemReply(_input: {
  message: string;
  sessionId?: string;
}): Promise<string> {
  return 'Firebase backend is working.';
}
