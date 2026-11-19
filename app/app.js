// Leonida Legend — entry point. Loads the trophy data, builds the state, and wires
// the tracker, the roadmap, the missable timeline and export/import together.
import { createState, persist, readParams } from './state.js';
import { renderDetail, renderKindBars, renderList, renderOverall } from './tracker.js';
import { renderMissable, renderRoadmap } from './views.js';
import { exportProgress, importProgress } from './export.js';

const data = await (await fetch('data/trophies.json')).json();
const trophies = data.trophies;
const params = readParams();
const state = createState(params);

const nodes = {
  pct: document.getElementById('overall-pct'),
  fill: document.getElementById('overall-fill'),
  text: document.getElementById('overall-text'),
  grades: document.getElementById('overall-grades'),
  kindBars: document.getElementById('kind-bars'),
  count: document.getElementById('list-count'),
  list: document.getElementById('list'),
  detail: document.getElementById('detail'),
  search: document.getElementById('search'),
  kindFilter: document.getElementById('kind-filter'),
  gradeFilter: document.getElementById('grade-filter'),
  sort: document.getElementById('sort'),
  spoiler: document.getElementById('spoiler'),
  exportBtn: document.getElementById('export-btn'),
  importFile: document.getElementById('import-file'),
  importStatus: document.getElementById('import-status'),
  roadmap: document.getElementById('roadmap'),
  missable: document.getElementById('missable-timeline'),
};

function rerender() {
  renderOverall(state, trophies, nodes);
  renderKindBars(state, trophies, nodes.kindBars);
  renderList(state, trophies, nodes, rerender);
  renderDetail(state, trophies, nodes.detail, rerender);
  renderRoadmap(state, trophies, nodes.roadmap);
  renderMissable(state, trophies, nodes.missable);
}

function showView(view) {
  state.view = view;
  for (const tab of document.querySelectorAll('.tab')) {
    tab.classList.toggle('active', tab.dataset.view === view);
  }
  for (const section of document.querySelectorAll('.view')) {
    section.classList.toggle('active', section.id === 'view-' + view);
  }
}

for (const tab of document.querySelectorAll('.tab')) {
  tab.addEventListener('click', () => showView(tab.dataset.view));
}

nodes.search.addEventListener('input', () => {
  state.search = nodes.search.value.trim();
  renderList(state, trophies, nodes, rerender);
  renderDetail(state, trophies, nodes.detail, rerender);
});
nodes.kindFilter.addEventListener('change', () => {
  state.kind = nodes.kindFilter.value;
  renderList(state, trophies, nodes, rerender);
});
nodes.gradeFilter.addEventListener('change', () => {
  state.grade = nodes.gradeFilter.value;
  renderList(state, trophies, nodes, rerender);
});
nodes.sort.addEventListener('change', () => {
  state.sort = nodes.sort.value;
  renderList(state, trophies, nodes, rerender);
});
nodes.spoiler.addEventListener('change', () => {
  state.spoiler = nodes.spoiler.checked;
  persist(state);
  renderList(state, trophies, nodes, rerender);
  renderDetail(state, trophies, nodes.detail, rerender);
});
nodes.exportBtn.addEventListener('click', () => exportProgress(state));
nodes.importFile.addEventListener('change', async (event) => {
  const file = event.target.files[0];
  if (!file) return;
  try {
    const result = await importProgress(state, file);
    nodes.importStatus.textContent = 'Imported ' + result.earned + ' earned trophies and ' + result.subs + ' counters.';
    rerender();
  } catch (err) {
    nodes.importStatus.textContent = 'Import failed: ' + err.message;
  }
  event.target.value = '';
});

// Start on the view the URL asked for, with the spoiler setting as saved.
nodes.spoiler.checked = state.spoiler;
if (state.selectedId === null) {
  // Open the newly solved trophy first: it is the guide's best story this week.
  state.selectedId = 44;
}
showView(state.view);
rerender();
