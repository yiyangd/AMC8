import { questionById, questionUrl, sections, sectionUrl, url } from '../lib/content';
import { challengeSections } from './monster-challenge-sections';
import { bilingual } from './monster-challenge-types';

const bossLook = { body: '#f43f5e', light: '#fecdd3', dark: '#881337', belly: '#ffe4e6', horn: '#fde047', horns: 'crown', eyes: 3, size: 1.14 };
const regularLooks = {
  '2023Q1': { body: '#4ade80', light: '#bbf7d0', dark: '#15803d', belly: '#dcfce7', horn: '#facc15', horns: 'antenna', eyes: 1, size: 0.94 },
  '2014Q1': { body: '#818cf8', light: '#c7d2fe', dark: '#3730a3', belly: '#e0e7ff', horn: '#a5b4fc', horns: 'ears', eyes: 2, size: 0.98 },
  '2005Q1': { body: '#fb923c', light: '#fed7aa', dark: '#9a3412', belly: '#ffedd5', horn: '#4ade80', horns: 'leaf', eyes: 2, size: 1 },
  '2008Q1': { body: '#94a3b8', light: '#e2e8f0', dark: '#334155', belly: '#cbd5e1', horn: '#64748b', horns: 'spike', eyes: 2, size: 1.03 },
  '2016Q8': { body: '#c084fc', light: '#e9d5ff', dark: '#6b21a8', belly: '#f3e8ff', horn: '#f0abfc', horns: 'spike', eyes: 3, size: 1.06 },
};
const fallbackLooks = Object.values(regularLooks);
const looksBySourceId = new Map(Object.entries({ ...regularLooks, '2018Q2': bossLook }));

export const shooterData = {
  stepKinds: [
    bilingual('Start here', '从这里开始'),
    bilingual('Key step', '关键一步'),
    bilingual('Finish it', '算出答案'),
  ],
  sections: challengeSections.map(({ id, levels }) => {
    const section = sections.find(item => item.id === id);
    if (!section) throw new Error(`Missing workbook section ${id} for Monster Shooter`);

    return {
      id,
      title: bilingual(section.titleEn, section.titleZh),
      url: sectionUrl(section),
      encounters: levels.map((level, index) => {
        const question = questionById.get(level.sourceId);
        if (!question || question.sectionId !== id || !/^[A-E]$/.test(question.answer.choice)) {
          throw new Error(`Missing or invalid workbook question ${level.sourceId} in Monster Shooter section ${id}`);
        }

        const boss = index === levels.length - 1;
        return {
          id: level.sourceId,
          year: question.year,
          number: question.number,
          answer: question.answer.choice,
          url: questionUrl(question),
          monster: {
            name: level.monster,
            look: looksBySourceId.get(level.sourceId) ?? (boss ? bossLook : fallbackLooks[index % fallbackLooks.length]),
            boss,
          },
          method: { title: level.title },
          stem: level.stem,
          steps: level.steps.map(({ prompt, options, correct, unlocked, explanation }) => ({
            prompt,
            options,
            correct,
            takeaway: unlocked,
            explanation,
          })),
          ...(level.figure && { figure: { src: url(level.figure.source), description: level.figure.description } }),
          ...(level.grid && { grid: level.grid }),
        };
      }),
    };
  }),
};
