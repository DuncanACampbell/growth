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
      concept: "Evidence vs. Belief",

      objective:
        "Help the user recognise that strongly believing something negative about themselves does not necessarily make it objectively true.",

      opening:
        "What's something negative you sometimes believe about yourself that affects your confidence or the way you behave?",

      explorationGoal:
        "Understand where this belief comes from and what experiences the user sees as evidence for it.",

      beliefGoal:
        "Clarify the deeper conclusion the user has formed about themselves and how strongly they treat that conclusion as fact.",

      reframeGoal:
        "Explore evidence both supporting and contradicting the belief. Help the user develop a more complete and balanced interpretation rather than replacing it with artificial positivity.",

      applicationGoal:
        "Help the user develop a way to question or investigate similar negative beliefs before automatically accepting them.",

      anchorGoal:
        "Create a concise statement reinforcing the distinction between believing something about oneself and knowing it to be true."
    },

    {
      id: "self-esteem-03",
      day: 3,
      concept: "Comparison",

      objective:
        "Help the user recognise when comparison with other people is being used as a measurement of their own worth.",

      opening:
        "Think of a recent moment when comparing yourself with somebody else made you feel worse about yourself. What happened?",

      explorationGoal:
        "Understand what the user noticed in the other person and why that particular comparison affected them.",

      beliefGoal:
        "Identify what the comparison led the user to conclude about themselves or what they believe they lack.",

      reframeGoal:
        "Explore whether the comparison is complete or fair, including differences in circumstances, unknown information about the other person, and qualities or progress in the user that the comparison ignores.",

      applicationGoal:
        "Help the user decide how they want to respond when they notice themselves using another person as evidence of their own inadequacy.",

      anchorGoal:
        "Create a personalised statement reinforcing that recognising another person's strengths does not require diminishing one's own value."
    },

    {
      id: "self-esteem-04",
      day: 4,
      concept: "External Validation",

      objective:
        "Help the user separate their sense of personal worth from other people's approval, attention, attraction, praise, or decisions.",

      opening:
        "Think of a recent situation where somebody else's reaction to you — or lack of reaction — noticeably changed how you felt about yourself. What happened?",

      explorationGoal:
        "Understand why the other person's response mattered and what emotional significance the user attached to it.",

      beliefGoal:
        "Identify what the user believed the other person's behaviour or decision proved about them.",

      reframeGoal:
        "Explore other factors that could explain the person's behaviour or decision and whether it is reasonable to treat that single response as a broad judgment of the user's worth or ability.",

      applicationGoal:
        "Help the user decide how to evaluate similar situations without automatically turning another person's response into a verdict on themselves.",

      anchorGoal:
        "Transform the user's own insight into a memorable statement separating external outcomes from personal worth."
    },

    {
      id: "self-esteem-05",
      day: 5,
      concept: "Owning Your Strengths",

      objective:
        "Help the user recognise genuine strengths and positive qualities without immediately minimising or discounting them.",

      opening:
        "Think of something you've handled well recently, even if it seems small. What happened?",

      explorationGoal:
        "Explore what the user actually did that contributed to the positive outcome.",

      beliefGoal:
        "Notice whether the user struggles to attribute positive outcomes to their own abilities, choices, effort, character, or growth.",

      reframeGoal:
        "If the user minimises their contribution, explore what they would recognise in another person who had behaved in the same way.",

      applicationGoal:
        "Help the user identify another situation where they could deliberately rely on or develop the strength they have recognised.",

      anchorGoal:
        "Create a grounded statement based on a strength demonstrated through the user's own evidence rather than generic praise."
    },

    {
      id: "self-esteem-06",
      day: 6,
      concept: "Your Needs Matter Too",

      objective:
        "Connect self-esteem with recognising one's own needs, preferences, boundaries, and feelings as legitimate.",

      opening:
        "Think of a recent situation where you struggled to express something you wanted or needed because you were worried about another person's reaction. What happened?",

      explorationGoal:
        "Understand what the user wanted or needed and why expressing it felt difficult.",

      beliefGoal:
        "Explore what the user feared expressing the need would mean about them or what they feared would happen as a result.",

      reframeGoal:
        "Examine whether caring about another person's needs genuinely requires minimising one's own, while recognising that needs can sometimes conflict and require compromise.",

      applicationGoal:
        "Help the user identify a respectful way they could communicate or act on a similar need in the future.",

      anchorGoal:
        "Create a statement reinforcing the compatibility of respecting others and respecting oneself."
    },

    {
      id: "self-esteem-07",
      day: 7,
      concept: "Acting With Self-Respect",

      objective:
        "Help consolidate the week's learning by shifting the focus from needing to feel confident to choosing behaviours consistent with self-respect.",

      opening:
        "Where in your life right now do you think insecurity is having the biggest influence on the way you behave or the decisions you make?",

      explorationGoal:
        "Understand how insecurity currently changes the user's behaviour and what they are trying to protect themselves from.",

      beliefGoal:
        "Identify the underlying fear or belief that is driving that behaviour.",

      reframeGoal:
        "Explore how the user might understand the situation differently if they already possessed the self-esteem they are trying to develop.",

      applicationGoal:
        "Help the user choose one specific behaviour they could practise that reflects self-respect even if the feeling of confidence has not yet arrived.",

      anchorGoal:
        "Create a personalised final statement that captures the user's most important insight from the conversation and reinforces self-respect as something practised through behaviour."
    }
  ]
};