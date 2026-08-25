import type { Programme } from '@/types/programme';

/** Source of truth for the Money programme (7 daily sessions). */
export const MONEY_PROGRAMME: Programme = {
  id: 'money',
  themeId: 'theme-money',
  title: 'Money',
  durationDays: 7,

  sessions: [
    {
      id: 'money-01',
      day: 1,
      concept: 'What Is Enough?',

      objective:
        'Help the user uncover what financial security actually means to them rather than assuming they simply need more money.',

      explorationGoal:
        'Understand what the user currently treats as “enough” and where that idea came from — income, savings, a feeling, a comparison, or something else.',

      beliefGoal:
        'Identify the assumption that more money is the same as more security, if that is how they currently think.',

      reframeGoal:
        'Separate wanting more money from defining what would actually make them feel financially secure.',

      applicationGoal:
        'Leave them with a clearer personal picture of enough, even if it is still approximate.',

      anchorGoal:
        'Close with a short statement of what security means to them today, so later days can build on it.',
    },

    {
      id: 'money-02',
      day: 2,
      concept: 'Your Money Story',

      objective:
        'Explore the messages, behaviours and assumptions about money the user absorbed growing up and how those beliefs still affect them.',

      explorationGoal:
        'Understand what they learned about money at home, in culture, or from early experience — spoken rules, silences, and modelled behaviour.',

      beliefGoal:
        'Identify one inherited belief that still shapes how they earn, spend, save, or worry.',

      reframeGoal:
        'Help them see that belief as a story they absorbed, not as an unchangeable fact about money or themselves.',

      applicationGoal:
        'Notice one way that story still shows up in a current money decision or feeling.',

      anchorGoal:
        'Create a short statement that names the inherited story without treating it as destiny.',
    },

    {
      id: 'money-03',
      day: 3,
      concept: 'Financial Anxiety',

      objective:
        'Identify what the user is actually afraid will happen when they worry about money, distinguish realistic financial concerns from ongoing vigilance, and understand what would help them feel safer.',

      explorationGoal:
        'Understand the worry in concrete terms: what they imagine going wrong, how often it appears, and what it does to them.',

      beliefGoal:
        'Identify whether the fear is a specific realistic risk, a vague catastrophe, or a habit of staying on alert.',

      reframeGoal:
        'Separate a genuine financial concern from vigilance that no longer matches the actual situation.',

      applicationGoal:
        'Clarify what would actually help them feel safer — information, a plan, a limit, or a calmer interpretation — without pretending worry is irrational.',

      anchorGoal:
        'Create a short statement that holds both the real concern and a more proportionate response.',
    },

    {
      id: 'money-04',
      day: 4,
      concept: 'Spending Without Guilt',

      objective:
        'Explore the emotions around spending money on enjoyment, identify when caution becomes unnecessary guilt, and help the user find a healthier balance between responsibility and enjoying life.',

      explorationGoal:
        'Understand a recent or typical spend that brought guilt, pleasure, or both, and what they told themselves afterwards.',

      beliefGoal:
        'Identify the rule they use to decide when spending on enjoyment is allowed or forbidden.',

      reframeGoal:
        'Distinguish responsible caution from guilt that punishes enjoyment even when the spend was reasonable.',

      applicationGoal:
        'Help them hold both: they can take money seriously and still spend on things that make life worth living.',

      anchorGoal:
        'Create a short statement that captures a fairer balance between care and enjoyment.',
    },

    {
      id: 'money-05',
      day: 5,
      concept: 'Money and Self-Worth',

      objective:
        'Explore whether income, savings, possessions, career success or comparison with others affects how the user evaluates themselves.',

      explorationGoal:
        'Understand which money-related measure most strongly colours how they see themselves.',

      beliefGoal:
        'Identify what they conclude about their worth when that measure is high, low, or compared with someone else.',

      reframeGoal:
        'Separate financial facts from a verdict on who they are, without pretending money does not matter.',

      applicationGoal:
        'Help them notice the moment a number or comparison becomes a statement about their value.',

      anchorGoal:
        'Create a short statement that keeps financial reality without making it the whole of self-worth.',
    },

    {
      id: 'money-06',
      day: 6,
      concept: 'Handling the Unexpected',

      objective:
        'Explore the user’s need for certainty and control around money, define what financial resilience would realistically look like, and help replace the impossible goal of eliminating risk with confidence in their ability to handle it.',

      explorationGoal:
        'Understand how they respond to financial uncertainty, surprises, or things they cannot fully plan for.',

      beliefGoal:
        'Identify whether they treat control or zero risk as the only acceptable state.',

      reframeGoal:
        'Replace the goal of eliminating uncertainty with a realistic picture of resilience — being able to handle a shock, not prevent every one.',

      applicationGoal:
        'Name one concrete capacity they already have, or could build, for dealing with the unexpected.',

      anchorGoal:
        'Create a short statement about handling risk rather than needing to erase it.',
    },

    {
      id: 'money-07',
      day: 7,
      concept: 'Your Relationship With Money',

      objective:
        'Bring together what the user has learned during the week and help them articulate a personal philosophy for using money in a way that supports security, freedom and a meaningful life.',

      explorationGoal:
        'Understand which ideas from the week actually landed and how they want money to function in their life now.',

      beliefGoal:
        'Identify the old relationship with money they are ready to loosen, and the stance they want instead.',

      reframeGoal:
        'Move from reacting to money as threat, scoreboard or forbidden pleasure toward using it in service of security, freedom and meaning.',

      applicationGoal:
        'Help them name a practical philosophy they could actually live by, not an idealised money personality.',

      anchorGoal:
        'Create one concise personalised statement that captures their emerging relationship with money.',
    },
  ],
};
