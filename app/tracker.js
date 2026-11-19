// The checklist: rows, the guide detail panel, progress bars. One row per trophy;
// clicking a row opens its guide beside the list. Spoiler mode masks hidden
// trophies (name, description and guide) until they are earned.
import { kindLabel, persist, setSub, subValue, toggleEarned } from './state.js';

const GRADE_ORDER = { platinum: 0, gold: 1, silver: 2, bronze: 3 };

function el(tag, cls, text) {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (text !== undefined) n.textContent = text;
  return n;
}

function trophyHidden(trophy, state) {
  return state.spoiler && trophy.hidden && !state.earned.has(trophy.id);
}

function visibleTrophies(state, trophies) {
  let list = [...trophies];
  if (state.kind === 'missable') list = list.filter((t) => t.missable);
  else if (state.kind !== 'all') list = list.filter((t) => t.kind === state.kind);
  if (state.grade !== 'all') list = list.filter((t) => t.grade === state.grade);
  if (state.search) {
    const q = state.search.toLowerCase();
    list = list.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.guide.toLowerCase().includes(q),
    );
  }
  if (state.sort === 'name') list.sort((a, b) => a.name.localeCompare(b.name));
  else if (state.sort === 'grade') list.sort((a, b) => GRADE_ORDER[a.grade] - GRADE_ORDER[b.grade] || a.stage - b.stage || a.id - b.id);
  else list.sort((a, b) => a.stage - b.stage || a.id - b.id);
  return list;
}

export function renderOverall(state, trophies, nodes) {
  const total = trophies.length;
  const done = state.earned.size;
  const pct = Math.round((done / total) * 100);
  nodes.pct.textContent = pct + '%';
  nodes.fill.style.width = pct + '%';
  nodes.text.textContent = done + ' of ' + total + ' trophies earned';
  const byGrade = {};
  for (const t of trophies) {
    byGrade[t.grade] = byGrade[t.grade] || [0, 0];
    byGrade[t.grade][1] += 1;
    if (state.earned.has(t.id)) byGrade[t.grade][0] += 1;
  }
  nodes.grades.textContent = ['platinum', 'gold', 'silver', 'bronze']
    .map((g) => byGrade[g][0] + '/' + byGrade[g][1] + ' ' + g)
    .join(' · ');
}

export function renderKindBars(state, trophies, container) {
  container.replaceChildren();
  const groups = [
    ['story', 'Story'],
    ['side', 'Side quests'],
    ['collectibles', 'Collectibles'],
    ['activities', 'Activities'],
    ['robbery', 'Robberies'],
    ['misc', 'One-offs'],
  ];
  for (const [kind, label] of groups) {
    const inKind = trophies.filter((t) => t.kind === kind);
    const done = inKind.filter((t) => state.earned.has(t.id)).length;
    const box = el('div', 'kind-bar');
    const top = el('div', 'kb-top');
    top.append(el('span', '', label), el('span', '', done + '/' + inKind.length));
    const track = el('div', 'kb-track');
    const fill = el('div');
    fill.style.width = inKind.length ? Math.round((done / inKind.length) * 100) + '%' : '0';
    track.append(fill);
    box.append(top, track);
    container.append(box);
  }
}

function subLine(state, trophy) {
  if (!trophy.sub) return null;
  const value = subValue(state, trophy);
  const unit = trophy.sub.unit || '';
  const shown = unit === '$' ? '$' + value.toLocaleString('en-US') : value;
  const total = unit === '$' ? '$' + trophy.sub.total.toLocaleString('en-US') : trophy.sub.total;
  return el('span', 't-sub', trophy.sub.label + ': ' + shown + ' / ' + total);
}

export function renderList(state, trophies, nodes, rerender) {
  const list = visibleTrophies(state, trophies);
  nodes.count.textContent =
    list.length + ' of ' + trophies.length + ' trophies shown' +
    (state.earned.size ? ' · ' + state.earned.size + ' earned' : '');
  nodes.list.replaceChildren();
  for (const t of list) {
    const earned = state.earned.has(t.id);
    const masked = trophyHidden(t, state);
    const row = el('li');
    const btn = el('button', 'trophy-row' + (earned ? ' earned' : '') + (state.selectedId === t.id ? ' selected' : ''));
    btn.type = 'button';
    const box = document.createElement('input');
    box.type = 'checkbox';
    box.checked = earned;
    box.setAttribute('aria-label', 'Mark ' + t.name + ' earned');
    box.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleEarned(state, t.id);
      rerender();
    });
    const main = el('div');
    main.append(el('div', 't-name', masked ? 'Hidden trophy — earn it to reveal' : t.name));
    main.append(el('div', 't-desc', masked ? 'A hidden trophy. Its name and description stay hidden while spoilers are on.' : t.description));
    const meta = el('div', 't-meta');
    meta.append(el('span', 'tag ' + (t.kind === 'story' ? 'story' : ''), kindLabel(t.kind)));
    if (t.missable) meta.append(el('span', 'tag missable', 'Missable'));
    if (t.confirmed === false) meta.append(el('span', 'tag unconfirmed', 'Unconfirmed'));
    const sub = subLine(state, t);
    if (sub) meta.append(sub);
    main.append(meta);
    const grade = el('div');
    grade.append(el('span', 'grade-dot ' + t.grade));
    grade.append(document.createElement('br'));
    grade.append(el('span', 'grade-label ' + t.grade, t.grade));
    btn.append(box, main, grade);
    btn.addEventListener('click', () => {
      state.selectedId = t.id;
      rerender();
    });
    row.append(btn);
    nodes.list.append(row);
  }
}

function sourceList(sources) {
  const wrap = el('div', 'sources');
  wrap.append(el('h4', '', 'Sources — where each fact comes from'));
  const ul = document.createElement('ul');
  for (const s of sources) {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.href = s.url;
    a.target = '_blank';
    a.rel = 'noopener';
    a.textContent = s.name;
    li.append(a);
    ul.append(li);
  }
  wrap.append(ul);
  return wrap;
}

export function renderDetail(state, trophies, detail, rerender) {
  detail.replaceChildren();
  const t = trophies.find((x) => x.id === state.selectedId) || null;
  if (!t) {
    detail.append(el('p', 'detail-empty', 'Pick a trophy on the left to read its guide — what to do, where and how, when it can be missed, and the sources behind each step.'));
    return;
  }
  const earned = state.earned.has(t.id);
  const masked = trophyHidden(t, state);
  detail.append(el('h3', '', masked ? 'Hidden trophy' : t.name));
  detail.append(el('p', 'd-desc', masked ? 'Hidden until earned.' : t.description));
  const tags = el('div', 'd-tags');
  tags.append(el('span', 'grade-label ' + t.grade, t.grade + (t.points ? ' · ' + t.points + 'G' : '')));
  tags.append(el('span', 'tag', kindLabel(t.kind)));
  tags.append(el('span', 'tag', 'Effort: ' + t.effort));
  if (t.missable) tags.append(el('span', 'tag missable', 'Missable'));
  if (t.confirmed === false) tags.append(el('span', 'tag unconfirmed', 'Unconfirmed'));
  detail.append(tags);

  const earnRow = el('div', 'earn-row');
  const earnBtn = el('button', earned ? 'earned' : '', earned ? '✓ Earned — click to unmark' : 'Mark as earned');
  earnBtn.type = 'button';
  earnBtn.addEventListener('click', () => {
    toggleEarned(state, t.id);
    rerender();
  });
  earnRow.append(earnBtn);
  detail.append(earnRow);

  if (t.missable && t.missableNote) {
    const miss = el('p', 'd-miss');
    miss.innerHTML = '';
    miss.append(el('strong', '', 'Missable — '), document.createTextNode(t.missableNote));
    detail.append(miss);
  }
  if (t.confirmed === false) {
    const warn = el('p', 'd-unconfirmed');
    warn.append(el('strong', '', 'Not yet confirmed — '), document.createTextNode('no guide had solved this trophy by 2026-11-20. The guide below gives the best lead available instead of guessing.'));
    detail.append(warn);
  }
  if (!masked) {
    detail.append(el('p', 'd-guide', t.guide));
    if (t.sub) {
      const value = subValue(state, t);
      const step = t.sub.step || 1;
      const box = el('div', 'sub-box');
      const top = el('div', 'sub-top');
      const unit = t.sub.unit || '';
      const shown = unit === '$' ? '$' + value.toLocaleString('en-US') : value;
      const total = unit === '$' ? '$' + t.sub.total.toLocaleString('en-US') : t.sub.total;
      top.append(el('span', '', t.sub.label), el('span', 'sub-count', shown + ' / ' + total));
      const track = el('div', 'sub-track');
      const fill = el('div');
      fill.style.width = Math.round((value / t.sub.total) * 100) + '%';
      track.append(fill);
      const stepper = el('div', 'stepper');
      const minus = el('button', '', '−');
      minus.type = 'button';
      minus.setAttribute('aria-label', 'Decrease ' + t.sub.label);
      minus.addEventListener('click', () => {
        setSub(state, t.id, value - step, t.sub.total);
        rerender();
      });
      const plus = el('button', '', '+');
      plus.type = 'button';
      plus.setAttribute('aria-label', 'Increase ' + t.sub.label);
      plus.addEventListener('click', () => {
        setSub(state, t.id, value + step, t.sub.total);
        rerender();
      });
      stepper.append(minus, plus);
      if (value >= t.sub.total) stepper.append(el('span', 'sub-done', 'Target reached — tick the trophy when it pops.'));
      box.append(top, track, stepper);
      detail.append(box);
    }
    detail.append(sourceList(t.sources));
  } else {
    detail.append(el('p', 'detail-empty', 'Spoilers are on: the guide for this hidden trophy stays masked until you mark it earned.'));
  }
}
