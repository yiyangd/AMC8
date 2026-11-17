import { encounters } from './monster-challenge';
import { fractionBasicEncounters } from './monster-challenge-fraction-basics';
import { fractionComparisonEncounters } from './monster-challenge-fraction-comparison';
import { divisibilityBasicEncounters } from './monster-challenge-divisibility-basics';
import { divisibilityAdvancedEncounters } from './monster-challenge-divisibility-advanced';
import { commonMultipleEncounters } from './monster-challenge-common-multiples';
import { factorPairEncounters } from './monster-challenge-factor-pairs';

const fractionsById = new Map(
  [...fractionBasicEncounters, ...fractionComparisonEncounters].map(level => [level.sourceId, level]),
);

const fractionLevels = ['2012Q4', '2024Q2', '2000Q2', '2005Q6', '2019Q3', '2012Q20'].map(id => {
  const level = fractionsById.get(id);
  if (!level) throw new Error(`Missing Monster Challenge level ${id}`);
  return level;
});

export const challengeSections = [
  { id: '1.1', levels: encounters },
  { id: '1.2', levels: fractionLevels },
  { id: '4.1', levels: [...divisibilityBasicEncounters, ...divisibilityAdvancedEncounters] },
  { id: '4.2', levels: commonMultipleEncounters },
  { id: '4.3', levels: factorPairEncounters },
] as const;
