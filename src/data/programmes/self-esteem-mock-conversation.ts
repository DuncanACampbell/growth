/**
 * Disposable prototype transcripts. A future LLM should ignore this file
 * and use DailySession goals instead. Turns are 3-5 beats, not one per milestone.
 */
export type MockSessionConversation = {
  turns: { guideText: string; userReply: string }[];
  exampleStatement: string;
};

export const SELF_ESTEEM_MOCK_CONVERSATIONS: Record<string, MockSessionConversation> = {
  'self-esteem-01': {
    turns: [
      {
        guideText:
          'Think of a recent moment when you felt disappointed in yourself, embarrassed, inadequate, rejected, or not good enough. What happened?',
        userReply:
          'I snapped at a colleague in a meeting and then replayed it all afternoon.',
      },
      {
        guideText: 'What did that moment make you believe about yourself?',
        userReply: 'That I cannot keep it together when it counts.',
      },
      {
        guideText:
          'If you separate what happened from what you made it mean about you, what is left?',
        userReply:
          'I made a sharp comment. That is disappointing. It does not mean I am incompetent.',
      },
      {
        guideText: 'When that critic shows up again, how do you want to meet it?',
        userReply: 'Pause and ask whether I am describing the event or attacking myself.',
      },
    ],
    exampleStatement: 'A harsh moment is not a verdict on who I am.',
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
