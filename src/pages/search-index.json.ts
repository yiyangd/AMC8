import { chapters, sections, questions, chapterById, chapterUrl, sectionUrl, questionUrl } from '../lib/content';
export function GET() {
  return new Response(JSON.stringify([
    ...chapters.map(c => ({ kind: 'chapter', id: `Chapter ${c.id}`, title: c.titleEn, subtitle: c.titleZh, href: chapterUrl(c.id), keywords: `chapter ${c.id} ${c.titleEn} ${c.titleZh}` })),
    ...sections.map(s => ({ kind: 'section', id: `Section ${s.id}`, title: s.titleEn, subtitle: `${s.titleZh} · ${s.questionIds.length} questions`, href: sectionUrl(s), keywords: `${s.id} ${s.code} ${s.titleEn} ${s.titleZh} ${chapterById.get(s.chapterId)!.titleEn} ${chapterById.get(s.chapterId)!.titleZh}` })),
    ...questions.map(q => { const s = sections.find(s => s.id === q.sectionId)!; const c = chapterById.get(q.chapterId)!; return { kind: 'question', id: q.id, title: `${s.id}. ${s.titleEn}`, subtitle: `${s.titleZh} · Part ${q.part} · Workbook p. ${q.workbookPage}`, href: questionUrl(q), keywords: `${q.id} ${q.year} ${s.id} ${s.code} ${s.titleEn} ${s.titleZh} ${c.titleEn} ${c.titleZh} chapter ${c.id}` }; }),
  ]), { headers: { 'Content-Type': 'application/json; charset=utf-8' } });
}
