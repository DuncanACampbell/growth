import type { Programme } from '@/types/programme';

/** Source of truth for the Building Self-Esteem programme (7 daily sessions). */
export const SELF_ESTEEM_PROGRAMME: Programme = {
  id: 'self-esteem',
  themeId: 'theme-presence',
  title: "Building Self-Esteem",
  durationDays: 7,

  sessions: [
    {
      id: "self-esteem-01",
      day: 1,
      concept: "The Harsher Judge",

      objective:
        "Identify one part of yourself that you judge particularly harshly and begin recognising that this judgment is a perspective, not an objective fact.",

      explorationGoal:
        "Learn how the user currently feels about themselves and the situations where confidence or self-worth tends to drop. Notice whether other people's opinions, comparison, achievement, appearance, relationships, work, or something else has a strong influence.",

      beliefGoal:
        "Identify one recurring thought or belief that may be affecting their self-esteem.",

      reframeGoal:
        "Gently challenge an assumption if it helps, without arguing or replacing it with artificial positivity. The aim is slightly more clarity, not a solved self-image.",

      applicationGoal:
        "Leave the user with one very small observation exercise: a single concise, memorable phrase they can use as a mantra for the rest of the day. It should take little or no extra time.",

      anchorGoal:
        "Close naturally so tomorrow's conversation can continue from today, rather than starting again from scratch.",
    },

    {
      id: "self-esteem-02",
      day: 2,
      concept: "Your Inner Voice",

      objective:
        "Notice how you speak to yourself after a mistake and distinguish useful evaluation from self-attack.",

      explorationGoal:
        "Understand the mistake and the actual message the user gave themselves afterwards.",

      beliefGoal:
        "Notice whether the criticism stayed on the behaviour or expanded into a judgment about who they are.",

      reframeGoal:
        "Explore a fair but constructive response that still allows responsibility, without replacing criticism with artificial positivity.",

      applicationGoal:
        "Help the user see that they can acknowledge what went wrong without turning against themselves.",

      anchorGoal:
        "Create a short statement based on the user's own fairer inner response.",
    },

    {
      id: "self-esteem-03",
      day: 3,
      concept: "Comparison",

      objective:
        "Identify one comparison that makes you feel worse about yourself, and notice when someone else's strength is being used as evidence against you.",

      explorationGoal:
        "Understand who they compare themselves with and which quality gets to them.",

      beliefGoal:
        "Identify the conclusion they draw about themselves because the other person has that quality.",

      reframeGoal:
        "Separate what the other person has from what the user is making that mean about themselves.",

      applicationGoal:
        "Help the user notice comparison without automatically treating the other person as evidence against them.",

      anchorGoal:
        "Create a personalised statement grounded in the specific comparison.",
    },

    {
      id: "self-esteem-04",
      day: 4,
      concept: "Whose Opinion Counts?",

      objective:
        "Identify whose opinion has too much power over how you feel about yourself, without having to stop caring what they think.",

      explorationGoal:
        "Understand whose opinion carries extra weight and what kind of approval the user seeks.",

      beliefGoal:
        "Identify what they conclude about themselves when that person's response is negative or absent.",

      reframeGoal:
        "Explore what it would mean for that opinion to have a vote rather than the only vote.",

      applicationGoal:
        "Help the user keep wanting approval while maintaining their own opinion of themselves.",

      anchorGoal:
        "Create a personalised statement that keeps both their care for the other person and their own vote.",
    },

    {
      id: "self-esteem-05",
      day: 5,
      concept: "More Than Your Achievements",

      objective:
        "Look at one milestone you thought you should have reached, and separate that outcome from what it supposedly says about who you are.",

      explorationGoal:
        "Understand the unmet achievement and what the user believes it would have proved.",

      beliefGoal:
        "Identify what not achieving it currently makes them believe about themselves.",

      reframeGoal:
        "Separate not having achieved X from being X kind of person, without minimising the goal.",

      applicationGoal:
        "Allow them to want more from life without treating today's results as a complete verdict.",

      anchorGoal:
        "Create a statement using the user's wording about timeline, achievement and identity.",
    },

    {
      id: "self-esteem-06",
      day: 6,
      concept: "What You Respect About Yourself",

      objective:
        "Name something you genuinely respect in yourself that does not depend mainly on achievement, praise or being useful to others.",

      explorationGoal:
        "Identify the quality and why the user values it, looking underneath achievements for the characteristic they demonstrate.",

      beliefGoal:
        "Clarify whether the quality remains meaningful without praise, notice or external reward.",

      reframeGoal:
        "Help the user experience the quality as internally grounded rather than as generic positive affirmation.",

      applicationGoal:
        "Let the internally valued quality land as a more stable source of self-respect.",

      anchorGoal:
        "Build a short statement directly from the quality the user discovered.",
    },

    {
      id: "self-esteem-07",
      day: 7,
      concept: "Your Own Measure",

      objective:
        "Bring the week together and name a more internally grounded standard for self-respect going forward.",

      explorationGoal:
        "Understand what the user thinks they have been getting wrong about how they evaluate themselves.",

      beliefGoal:
        "Identify which external measures have had too much power and which internal standards now feel more important.",

      reframeGoal:
        "Move from what proves they are good enough toward the standards they actually want to use.",

      applicationGoal:
        "Help them name a practical shift in how they want to respond when self-judgment appears again.",

      anchorGoal:
        "Create one concise personalised statement that captures their emerging philosophy of self-respect.",
    },
  ]
};