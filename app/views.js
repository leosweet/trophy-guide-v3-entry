// The Roadmap to Platinum and the Missable Timeline views. Both are built from the
// same trophy data as the tracker, so a stage or a deadline can never drift from it.
import { kindLabel } from './state.js';

const STAGES = [
  { n: 1, title: 'Play the story — Chapters 1–5', note: 'Just play. The 12 story trophies pop as you finish chapters and named missions. The story takes 60–80 hours (PowerPyx).' },
  { n: 2, title: 'Side characters & strangers', note: 'Do each character questline as it appears; all of it stays available after the story. 8 stranger strands for the silver.' },
  { n: 3, title: 'Collect while you explore', note: 'Cards, meditation spots, WAiNK scans, vehicles and the map — most of it counts toward 100% too.' },
  { n: 4, title: 'Skill grind', note: 'Shooting ranges, drone races, races, stunts and challenges. The longest pure grind after the story.' },
  { n: 5, title: 'Crime & money', note: 'Robberies with your partner, bank vaults, gangs, laundering and spending. Buy the garages as you earn.' },
  { n: 6, title: 'One-off stunts & secrets', note: 'Single-moment trophies: the plane, the tank, the cocktail, the Banshee, the bowling alley, the UFO — plus the two nobody has solved yet.' },
  { n: 7, title: '100% cleanup & platinum', note: 'Finish the checklist under Progress > Stats > 100% Completion, then the platinum pops.' },
];

function el(tag, cls, text) {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (text !== undefined) n.textContent = text;
  return n;
}

export function renderRoadmap(state, trophies, container) {
  container.replaceChildren();
  for (const stage of STAGES) {
    const box = el('div', 'stage');
    const h = el('h3');
    h.append(el('span', 'stage-num', 'Stage ' + stage.n + ' — '), document.createTextNode(stage.title));
    box.append(h, el('p', '', stage.note));
    const ul = document.createElement('ul');
    const inStage = trophies.filter((t) => t.stage === stage.n).sort((a, b) => a.id - b.id);
    for (const t of inStage) {
      const li = el('li', state.earned.has(t.id) ? 'earned' : '');
      li.append(el('span', 'g ' + t.grade, t.grade[0].toUpperCase()));
      li.append(document.createTextNode(t.name + (t.missable ? ' ⚠' : '')));
      ul.append(li);
    }
    box.append(ul);
    container.append(box);
  }
}

const TIMELINE = [
  {
    when: 'Chapter 1 — the morning after Down to Earth',
    title: 'Positive Mental Attitude: the first meditation',
    body: 'After the mission Down to Earth, talk to Lucia in the kitchen in the morning. She says she is going to meditate and walks to the balcony — follow her and choose Accept. This is the ONLY trophy that can be missed: the Chapter 1 meditation becomes permanently unavailable after Chapter 1, and it is still unconfirmed whether it is required. Do it now and stop worrying.',
  },
  {
    when: 'Chapter 2 — after Coffee Break',
    title: 'Everything opens up for two players',
    body: 'From Coffee Break you can free-roam as Jason and Lucia together. Partner trophies (Hot Together, Retail Therapy), the final meditation, Personal Best and the side-character questlines all unlock from here. Nothing here is missable — it all stays open.',
  },
  {
    when: 'Chapter 3 — after Clonin’ Keys, Makin’ Gs',
    title: 'Key Cloner: two trophies depend on it',
    body: 'The Key Cloner unlocks with this mission. You need it for Capital Offense (steal the blue Banshee) and for Randy’s 16-car wishlist. Do the mission, then the showroom and the wishlist are yours whenever you like.',
  },
  {
    when: 'Chapter 4 — after That’s Where The Money Is…',
    title: 'Bank vaults open',
    body: 'The optional mission teaches bank vault robbery. After it, buy security-van tips from Yasmani ($10,000 each) and rob the 8 large bank vaults — 5 for Maximum Withdrawal, all 8 for 100%. Nothing here is missable.',
  },
  {
    when: 'After the credits',
    title: 'Free roam: nothing left to miss',
    body: 'The 100% checklist opens (Progress > Stats > 100% Completion). Every trophy except the Chapter 1 meditation is still earnable. Work the checklist, finish the 8 stranger strands, and clean up the one-offs.',
  },
];

export function renderMissable(state, trophies, container) {
  container.replaceChildren();
  const timeline = el('div', 'timeline');
  for (const item of TIMELINE) {
    const block = el('div', 'tl-item');
    block.append(el('div', 'tl-when', item.when));
    block.append(el('h3', '', item.title));
    block.append(el('p', '', item.body));
    timeline.append(block);
  }
  container.append(timeline);
  const note = el('p', 'section-intro', 'Missable trophies in this guide: 1 of 55. The other 54 can all be earned after the story.');
  container.append(note);
}
