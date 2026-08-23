import type { SessionNotes } from '@/types/models';

/**
 * Disposable prototype transcripts. A future LLM should ignore this file
 * and use DailySession goals instead. Turns are 3-5 beats, not one per milestone.
 */
export type MockSessionConversation = {
  turns: { guideText: string; userReply: string }[];
  exampleStatement: string;
  sessionNotes?: SessionNotes;
};

export const SELF_ESTEEM_MOCK_CONVERSATIONS: Record<string, MockSessionConversation> = {
  'self-esteem-01': {
    turns: [
      {
        guideText:
          'When you think about your self-esteem lately, does it generally feel pretty solid, or does it get knocked around quite easily?',
        userReply:
          'Knocked around, honestly. A good morning can fall apart after one awkward conversation.',
      },
      {
        guideText:
          'So it can turn quite quickly. When it drops, what tends to be happening — work, other people, how you look, how you measure yourself against someone else?',
        userReply:
          'Mostly other people. If someone seems unimpressed, or I see a colleague handling something better than I would, I shrink.',
      },
      {
        guideText:
          'Other people and comparison. When you shrink, is there a thought that shows up almost on cue?',
        userReply:
          "That I'm behind. That they can tell I don't quite belong at this level.",
      },
      {
        guideText:
          '“I don’t belong at this level” is a heavy sentence to carry into a meeting. Is there anything about yourself you still quietly trust, even on those days?',
        userReply:
          "I'm reliable. I do the work. People can count on me even when I feel like a fraud.",
      },
      {
        guideText:
          'So the drop often comes after other people’s reactions or a comparison, and the story is that you are behind — even though you already know you are someone people can count on. For the rest of today: notice the drop. Don’t fix it. Just catch what happened immediately before.',
        userReply: 'I can do that. Just notice the moment before I shrink.',
      },
      {
        guideText:
          'That’s enough for Day 1. Tomorrow we can look more closely at that “I’m behind” thought — where it came from, and what it leaves out.',
        userReply: 'Okay. I’ll see you tomorrow.',
      },
    ],
    exampleStatement: 'Notice the drop — and what happened just before.',
    sessionNotes: {
      sessionSummary:
        'Self-esteem feels unstable and can collapse after one awkward interaction. It is strongly tied to other people’s reactions and comparison with colleagues. A recurring belief is that they are behind and do not belong at this level, even while they recognise they are reliable and people can count on them.',
      selfEsteemTriggers: [
        'Awkward conversations',
        'Feeling unimpressed reactions from others',
        'Comparing with colleagues who seem more capable',
      ],
      recurringBeliefs: [
        "I'm behind",
        "They can tell I don't quite belong at this level",
      ],
      strengths: ['Reliability', 'People can count on them', 'They still show up and do the work'],
      dailyExercise: 'Notice the drop — and what happened just before.',
      tomorrowFocus:
        'The belief of being behind / not belonging, and what evidence that story leaves out.',
      importantMemory:
        'Confidence often falls after other people or comparison; they already value being reliable.',
    },
  },
  'self-esteem-02': {
    turns: [
      {
        guideText:
          "What's something negative you sometimes believe about yourself that affects your confidence or the way you behave?",
        userReply: "That I'm not actually good at my job, just lucky.",
      },
      {
        guideText: 'What experiences do you treat as proof of that?',
        userReply: 'Any time I need help, I take it as evidence I do not belong.',
      },
      {
        guideText: 'What else is true that this belief leaves out?',
        userReply: 'People ask me for help too. I have shipped work that held up.',
      },
      {
        guideText:
          'Next time that belief shows up, what do you want to check before you swallow it?',
        userReply: 'Whether I am looking at the whole picture or just the miss.',
      },
    ],
    exampleStatement: 'A strong belief about me is not the same as a fact.',
  },
  'self-esteem-03': {
    turns: [
      {
        guideText:
          'Think of a recent moment when comparing yourself with somebody else made you feel worse about yourself. What happened?',
        userReply: 'I saw a colleague present and felt small afterwards.',
      },
      {
        guideText: 'What did you notice in them that landed on you?',
        userReply: 'They seemed natural. I decided that means I am behind.',
      },
      {
        guideText: 'What does that comparison leave out about you, or about them?',
        userReply:
          'I do not see their prep or their off days. I have improved my own presenting this year.',
      },
      {
        guideText: 'When you catch that comparison next time, how do you want to meet it?',
        userReply: 'Notice it, then name one thing I am building that is not in the snapshot.',
      },
    ],
    exampleStatement: "Someone else's strength does not cancel mine.",
  },
  'self-esteem-04': {
    turns: [
      {
        guideText:
          "Think of a recent situation where somebody else's reaction to you — or lack of reaction — noticeably changed how you felt about yourself. What happened?",
        userReply: "I sent work I'm proud of and got a short reply. I felt disposable.",
      },
      {
        guideText: 'What did you take that reply to mean about you?',
        userReply: 'That the work, and I, were not worth more attention.',
      },
      {
        guideText: 'What else could that reply have been about?',
        userReply: 'They might have been busy. One short message is not a verdict.',
      },
      {
        guideText:
          'How do you want to judge similar moments without using their reaction as the score?',
        userReply: 'Look at the work I stand behind, not the temperature of one reply.',
      },
    ],
    exampleStatement: 'Their response is data. It is not my worth.',
  },
  'self-esteem-05': {
    turns: [
      {
        guideText:
          "Think of something you've handled well recently, even if it seems small. What happened?",
        userReply: 'I talked a nervous teammate through a messy problem.',
      },
      {
        guideText: 'What did you actually do?',
        userReply: 'I stayed patient and broke it into steps they could take.',
      },
      {
        guideText: 'If a friend had done that, what would you say they showed?',
        userReply: 'That they can stay steady and useful when someone else is spinning.',
      },
      {
        guideText: 'Where else this week could you rely on that same steadiness?',
        userReply: 'In the Thursday review, instead of shrinking.',
      },
    ],
    exampleStatement: 'I can stay steady when things get messy.',
  },
  'self-esteem-06': {
    turns: [
      {
        guideText:
          'Think of a recent situation where you struggled to express something you wanted or needed because you were worried about another person’s reaction. What happened?',
        userReply: 'I wanted to leave on time and said yes to extra work instead.',
      },
      {
        guideText: 'What did you need, and what made saying it feel risky?',
        userReply: 'Rest. I was afraid I would seem uncommitted.',
      },
      {
        guideText: "Does caring about them require treating your need as optional?",
        userReply: 'No. I can care and still name a limit.',
      },
      {
        guideText: 'What would a respectful version of that look like next time?',
        userReply: 'I can take this tomorrow morning, not tonight.',
      },
    ],
    exampleStatement: 'I can respect them without abandoning myself.',
  },
  'self-esteem-07': {
    turns: [
      {
        guideText:
          'Where in your life right now do you think insecurity is having the biggest influence on the way you behave or the decisions you make?',
        userReply: 'I stay quiet in meetings even when I have a view.',
      },
      {
        guideText: 'What are you protecting yourself from?',
        userReply: 'Looking foolish if I am wrong.',
      },
      {
        guideText:
          'If you already had the self-respect you are building, how would you see that moment?',
        userReply: 'Speaking would be practice, not a test of whether I belong.',
      },
      {
        guideText:
          'What is one specific behaviour you could practise this week, even before confidence arrives?',
        userReply: 'Offer one point in the next meeting.',
      },
    ],
    exampleStatement: 'Self-respect is a behaviour I can practise before I feel ready.',
  },
};

export function getMockSessionNotes(challengeId: string | null | undefined): SessionNotes | null {
  if (!challengeId) {
    return null;
  }
  return SELF_ESTEEM_MOCK_CONVERSATIONS[challengeId]?.sessionNotes ?? null;
}
