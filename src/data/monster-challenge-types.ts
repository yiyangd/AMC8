type Locale = 'en' | 'zh';
export type Localized = Record<Locale, string>;
export type ChoiceKey = 'A' | 'B' | 'C';

export const choiceKeys = ['A', 'B', 'C'] as const;
export const bilingual = (en: string, zh: string): Localized => ({ en, zh });

export interface ChallengeOption {
  text: Localized;
  hint?: Localized;
}

export interface ChallengeStep {
  prompt: Localized;
  options: Record<ChoiceKey, ChallengeOption>;
  correct: ChoiceKey;
  explanation: Localized;
  unlocked: Localized;
}

export interface ChallengeEncounter {
  sourceId: string;
  monster: Localized;
  title: Localized;
  stem: Localized;
  steps: readonly [ChallengeStep, ChallengeStep, ChallengeStep, ...ChallengeStep[]];
  figure?: { source: string; description: Localized };
  grid?: readonly (readonly number[])[];
}
