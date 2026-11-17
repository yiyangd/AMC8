import { encounters } from './monster-challenge';
import { fractionBasicEncounters } from './monster-challenge-fraction-basics';
import { fractionComparisonEncounters } from './monster-challenge-fraction-comparison';

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
] as const;
