import raw from '../data/workbook.json';

export interface Chapter {
  id: number; titleEn: string; titleZh: string; questionCount: number; sectionCount: number;
}
export interface Section {
  id: string; slug: string; chapterId: number; code: string; titleEn: string; titleZh: string;
  questionIds: string[]; partCounts: Record<Part, number>;
}
export type Part = 'A' | 'B' | 'C';
export interface Question {
  id: string; year: number; number: number; chapterId: number; sectionId: string; part: Part;
  workbookPage: number;
  image: { src: string; width: number; height: number; displayWidth: number };
  answer: { choice: string; value: string; steps: string[] };
}
export const chapters: Chapter[] = raw.chapters;
export const sections: Section[] = raw.sections;
export const questions: Question[] = raw.questions as Question[];
export const chapterById = new Map(chapters.map(chapter => [chapter.id, chapter]));
export const questionById = new Map(questions.map(question => [question.id, question]));
export const sectionQuestions = (section: Section) => section.questionIds.map(id => questionById.get(id)!);
export const url = (path = '') => `${import.meta.env.BASE_URL.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
export const sectionUrl = (section: Section) => url(`sections/${section.slug}/`);
export const chapterUrl = (id: number) => url(`chapters/${id}/`);
export const questionUrl = (question: Question) => {
  const section = sections.find(item => item.id === question.sectionId)!;
  return `${sectionUrl(section)}#q-${question.id.toLowerCase()}`;
};
