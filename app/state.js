// Progress + settings state for the tracker. Progress lives in localStorage; a ?demo=1
// run keeps everything in memory instead, so screenshots never pollute a real save.
const STORE_KEY = 'leonida-legend-progress-v3';
const SETTINGS_KEY = 'leonida-legend-settings-v3';

// A fixed demo save: 14 trophies earned, a few counters part-way, for screenshots.
const DEMO_EARNED = [2, 3, 4, 5, 8, 9, 15, 16, 20, 21, 35, 42, 44, 50];
const DEMO_SUBS = { 15: 120, 31: 40, 28: 6, 35: 55, 32: 20, 30: 1 };

export function readParams() {
  const q = new URLSearchParams(window.location.search);
  return {
    view: q.get('view') || 'tracker',
    open: q.get('open') ? Number(q.get('open')) : null,
    demo: q.get('demo') === '1',
    spoiler: q.get('spoiler') === '1',
  };
}

export function createState(params) {
  const state = {
    demo: params.demo,
    earned: new Set(),
    subs: {},
    spoiler: false,
    search: '',
    kind: 'all',
    grade: 'all',
    sort: 'roadmap',
    selectedId: params.open || null,
    view: ['tracker', 'roadmap', 'missable'].includes(params.view) ? params.view : 'tracker',
  };
  if (params.demo) {
    state.earned = new Set(DEMO_EARNED);
    state.subs = { ...DEMO_SUBS };
    state.spoiler = params.spoiler;
    return state;
  }
  try {
    const saved = JSON.parse(localStorage.getItem(STORE_KEY) || 'null');
    if (saved) {
      state.earned = new Set(Array.isArray(saved.earned) ? saved.earned : []);
      state.subs = saved.subs && typeof saved.subs === 'object' ? saved.subs : {};
    }
    const settings = JSON.parse(localStorage.getItem(SETTINGS_KEY) || 'null');
    if (settings) state.spoiler = settings.spoiler === true;
  } catch {
    state.earned = new Set();
    state.subs = {};
  }
  if (params.spoiler) state.spoiler = true;
  return state;
}

export function persist(state) {
  if (state.demo) return;
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify({ earned: [...state.earned], subs: state.subs }));
    localStorage.setItem(SETTINGS_KEY, JSON.stringify({ spoiler: state.spoiler }));
  } catch {
    // Private mode or full storage: the tracker still works for this session.
  }
}

export function toggleEarned(state, id) {
  if (state.earned.has(id)) state.earned.delete(id);
  else state.earned.add(id);
  persist(state);
}

export function setSub(state, id, value, total) {
  const clamped = Math.max(0, Math.min(total, value));
  if (clamped === 0) delete state.subs[id];
  else state.subs[id] = clamped;
  persist(state);
}

export function subValue(state, trophy) {
  if (!trophy.sub) return 0;
  return Math.min(trophy.sub.total, state.subs[trophy.id] || 0);
}

// Progress helpers shared by every view.
export function earnedCount(state) {
  return state.earned.size;
}

export function kindLabel(kind) {
  return {
    story: 'Story',
    side: 'Side quest',
    collectibles: 'Collectible',
    activities: 'Activity',
    robbery: 'Robbery',
    misc: 'One-off',
    platinum: 'Platinum',
  }[kind] || kind;
}
