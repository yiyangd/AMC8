type SearchItem = { kind: string; id: string; title: string; subtitle: string; href: string; keywords: string };
const base = document.body.dataset.base!.replace(/\/$/, '');
const searchDialog = document.querySelector<HTMLDialogElement>('#search-dialog')!;
const searchInput = document.querySelector<HTMLInputElement>('#workbook-search')!;
const searchResults = document.querySelector<HTMLDivElement>('.search-results')!;
let searchIndex: SearchItem[] | null = null;
let searchPromise: Promise<SearchItem[]> | undefined;
let lastTrigger: HTMLElement | null = null;

async function loadSearch() {
  searchPromise ??= fetch(`${base}/search-index.json`).then(response => {
    if (!response.ok) throw new Error('Search unavailable');
    return response.json() as Promise<SearchItem[]>;
  }).catch(error => { searchPromise = undefined; throw error; });
  searchIndex = await searchPromise;
}
const normalize = (value: string) => value.toLowerCase().replace(/[\[\]]/g, '').replace(/\s+/g, ' ').trim();
function message(text: string) {
  const p = document.createElement('p'); p.className = 'search-empty'; p.textContent = text;
  searchResults.replaceChildren(p);
}
function renderSearch() {
  const query = normalize(searchInput.value);
  if (!query) { message('Find a question, a year, or your next topic.'); return; }
  if (!searchIndex) return;
  const terms = query.split(' ');
  const compact = query.replace(/\s/g, '');
  const found = searchIndex.filter(item => {
    const haystack = normalize(`${item.id} ${item.title} ${item.subtitle} ${item.keywords}`);
    return normalize(item.id) === compact || terms.every(term => haystack.includes(term));
  });
  found.sort((a, b) => Number(normalize(b.id) === compact) - Number(normalize(a.id) === compact));
  searchResults.replaceChildren();
  if (!found.length) { message('No matches. Try a question ID such as 2003Q9 or a topic name.'); return; }
  const count = document.createElement('p'); count.className = 'search-count';
  count.textContent = `${found.length} results${found.length > 40 ? ' · Showing the first 40' : ''}`;
  searchResults.append(count);
  for (const item of found.slice(0, 40)) {
    const link = document.createElement('a'); link.className = 'search-result'; link.href = item.href;
    const id = document.createElement('span'); id.className = 'result-id'; id.textContent = item.kind === 'question' ? `[${item.id}]` : item.id;
    const title = document.createElement('strong'); title.className = 'result-title'; title.textContent = item.title;
    const subtitle = document.createElement('span'); subtitle.className = 'result-meta'; subtitle.textContent = item.subtitle;
    link.append(id, title, subtitle);
    link.addEventListener('click', () => {
      searchDialog.close();
      const target = new URL(item.href, location.href);
      if (target.pathname === location.pathname && target.hash.startsWith('#q-')) {
        selectPart('All');
        if (target.hash === location.hash) revealAnchor();
      }
    });
    searchResults.append(link);
  }
}
async function openSearch(trigger?: HTMLElement) {
  lastTrigger = trigger || document.activeElement as HTMLElement;
  if (lastTrigger?.closest('#site-sidebar')) {
    lastTrigger = document.querySelector<HTMLElement>('.menu-toggle');
  }
  closeDrawer();
  if (!searchDialog.open) searchDialog.showModal();
  searchInput.focus();
  message('Loading search…');
  try { await loadSearch(); renderSearch(); }
  catch { message('Search could not load. Please check your connection and try again.'); }
}
document.querySelectorAll<HTMLButtonElement>('.search-trigger').forEach(button => button.addEventListener('click', () => void openSearch(button)));
searchInput.addEventListener('input', renderSearch);
searchInput.addEventListener('keydown', event => {
  if (event.key === 'ArrowDown') { event.preventDefault(); searchResults.querySelector<HTMLElement>('a')?.focus(); }
});
searchResults.addEventListener('keydown', event => {
  const links = [...searchResults.querySelectorAll<HTMLAnchorElement>('a')];
  const current = links.indexOf(document.activeElement as HTMLAnchorElement);
  if (event.key === 'ArrowDown') { event.preventDefault(); links[Math.min(current + 1, links.length - 1)]?.focus(); }
  if (event.key === 'ArrowUp') { event.preventDefault(); current <= 0 ? searchInput.focus() : links[current - 1]?.focus(); }
});
document.addEventListener('keydown', event => {
  const target = event.target as HTMLElement;
  if (event.key === 'Escape' && searchDialog.open) {
    event.preventDefault(); searchDialog.close(); return;
  }
  if ((event.key.toLowerCase() === 'k' && (event.metaKey || event.ctrlKey)) || (event.key === '/' && !target.closest('input,textarea,[contenteditable]'))) {
    event.preventDefault(); void openSearch();
  }
});
document.querySelectorAll<HTMLDialogElement>('dialog').forEach(dialog => {
  dialog.querySelectorAll('[data-close-dialog]').forEach(button => button.addEventListener('click', () => dialog.close()));
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
  });
  dialog.addEventListener('close', () => { lastTrigger?.focus({ preventScroll: true }); });
});

const imageDialog = document.querySelector<HTMLDialogElement>('#image-dialog')!;
const zoomImage = imageDialog.querySelector<HTMLImageElement>('.zoom-image')!;
document.querySelectorAll<HTMLButtonElement>('.question-image-button').forEach(button => {
  button.addEventListener('click', () => {
    lastTrigger = button;
    zoomImage.src = button.dataset.image!;
    zoomImage.alt = `AMC 8 question ${button.dataset.question}, enlarged`;
    document.querySelector('#image-title')!.textContent = `[${button.dataset.question}]`;
    imageDialog.showModal();
  });
});

const filters = [...document.querySelectorAll<HTMLButtonElement>('[data-filter]')];
function selectPart(part: string, announce = true) {
  filters.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.filter === part)));
  document.querySelectorAll<HTMLElement>('[data-part-group]').forEach(group => { group.hidden = part !== 'All' && group.dataset.partGroup !== part; });
  const shown = [...document.querySelectorAll<HTMLElement>('.question-card')].filter(card => part === 'All' || card.dataset.part === part).length;
  if (announce) {
    const status = document.querySelector('.filter-status');
    if (status) status.textContent = `Showing ${shown} questions${part === 'All' ? ' across all parts' : ` in Part ${part}`}`;
  }
}
filters.forEach(button => button.addEventListener('click', () => selectPart(button.dataset.filter!)));
function revealAnchor() {
  if (!location.hash.startsWith('#q-')) return;
  const card = document.getElementById(decodeURIComponent(location.hash.slice(1)));
  if (!card) return;
  selectPart('All');
  requestAnimationFrame(() => card.scrollIntoView({ block: 'start' }));
}
window.addEventListener('hashchange', revealAnchor);
revealAnchor();

const menu = document.querySelector<HTMLButtonElement>('.menu-toggle');
const sidebar = document.querySelector<HTMLElement>('#site-sidebar');
const overlay = document.querySelector<HTMLButtonElement>('.drawer-overlay');
function closeDrawer() {
  document.body.classList.remove('drawer-open');
  menu?.setAttribute('aria-expanded', 'false');
  if (overlay) overlay.hidden = true;
}
function openDrawer() {
  document.body.classList.add('drawer-open');
  menu?.setAttribute('aria-expanded', 'true');
  if (overlay) overlay.hidden = false;
  sidebar?.querySelector<HTMLElement>('a')?.focus();
}
menu?.addEventListener('click', () => document.body.classList.contains('drawer-open') ? closeDrawer() : openDrawer());
overlay?.addEventListener('click', () => { closeDrawer(); menu?.focus(); });
sidebar?.querySelectorAll('a').forEach(link => link.addEventListener('click', closeDrawer));
document.addEventListener('keydown', event => {
  if (!document.body.classList.contains('drawer-open') || !sidebar) return;
  if (event.key === 'Escape') { closeDrawer(); menu?.focus(); }
  if (event.key === 'Tab') {
    const focusable = [...sidebar.querySelectorAll<HTMLElement>('a,summary')].filter(el => el.getClientRects().length);
    const first = focusable[0]; const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  }
});
window.matchMedia('(min-width: 851px)').addEventListener('change', event => { if (event.matches) closeDrawer(); });
