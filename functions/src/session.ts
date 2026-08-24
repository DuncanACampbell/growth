import {
  fallbackProgrammeMemory,
  type ProgrammeMemoryFields,
} from './guides/programme-memory';
import type { ConversationPhase } from './guides/types';
import type { LlmChatTurn } from './llm';

export const MAX_USER_TURNS = 9;

export type GuidedSessionTurn = {
  reply: string;
  phase: ConversationPhase;
  isComplete: boolean;
  finalStatement: string | null;
  memory: ProgrammeMemoryFields | null;
};

export function countUserTurns(history: LlmChatTurn[]): number {
  return history.filter((turn) => turn.role === 'user').length;
}

export function pacingInstructions(
  userTurnNumber: number,
  mustComplete: boolean,
): string {
  const ceiling = `This is user reply ${userTurnNumber} of a hard maximum of ${MAX_USER_TURNS}. Nine is a ceiling, not a target. Finish earlier if today's insight has already been reached.`;

  if (mustComplete) {
    return `${ceiling}

This is the FINAL user reply. You MUST close the session now.
Set isComplete to true and phase to complete.
Write a personalised finalStatement distilled from the user's own reframe and wording.
Fill memory with topic, pattern, reframe, and memoryNote from this conversation.
Do not ask a question.
Do not introduce another issue.
Summarise the useful shift, then close.`;
  }

  if (userTurnNumber <= 5) {
    return `${ceiling}

Pacing for turns 1–5: understand, support, interpret, and begin reframing if you have enough. Do not rush, but do not keep exploring if the insight is already clear.`;
  }

  if (userTurnNumber <= 7) {
    return `${ceiling}

Pacing for turns 6–7: actively guide toward today's desired insight if it has not already been reached. Do not open a new topic.`;
  }

  return `${ceiling}

Pacing for turn 8: consolidate the emerging reframe. Prepare to close on the next turn. Do not start a new line of inquiry.`;
}

const QUESTION_MARK = /\?/;

export function stripQuestionSentences(text: string): string {
  return text
    .split('\n')
    .map((line) =>
      line
        .split(/(?<=[.!?])\s+/)
        .filter((sentence) => !QUESTION_MARK.test(sentence))
        .join(' ')
        .trim(),
    )
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export function applyCompletionOverride(
  turn: GuidedSessionTurn,
  mustComplete: boolean,
): GuidedSessionTurn {
  if (!mustComplete) {
    return turn;
  }

  const replyWithoutQuestions = stripQuestionSentences(turn.reply);
  const finalStatement =
    turn.finalStatement?.trim() ||
    extractFinalStatement(replyWithoutQuestions) ||
    'I can judge a situation without turning it into a verdict on who I am.';

  let reply = replyWithoutQuestions;
  if (!reply.includes(finalStatement)) {
    reply = `${reply}

**Your thought for today**

👉 **${finalStatement}**

That’s it for today. Come back tomorrow.`.trim();
  }

  return {
    reply,
    phase: 'complete',
    isComplete: true,
    finalStatement,
    memory: turn.memory ?? fallbackProgrammeMemory(finalStatement),
  };
}

function extractFinalStatement(reply: string): string | null {
  const marked = reply.match(/👉\s*\**(.+?)\**\s*$/m);
  if (marked?.[1]) {
    return marked[1].replace(/\*/g, '').trim();
  }
  return null;
}
