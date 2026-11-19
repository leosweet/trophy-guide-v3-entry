// Export progress to a file and import it back. The file holds only the earned
// trophy ids and the sub-checklist counters — nothing else about the reader.
import { persist } from './state.js';

export function exportProgress(state) {
  const payload = {
    app: 'leonida-legend',
    version: 3,
    exportedAt: new Date().toISOString(),
    earned: [...state.earned].sort((a, b) => a - b),
    subs: state.subs,
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'gta6-trophy-progress.json';
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 5000);
}

export async function importProgress(state, file) {
  const text = await file.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error('That file is not valid JSON.');
  }
  if (!data || typeof data !== 'object') throw new Error('That file does not hold progress.');
  const earned = Array.isArray(data.earned) ? data.earned : [];
  const subs = data.subs && typeof data.subs === 'object' ? data.subs : {};
  const validEarned = earned.filter((id) => Number.isInteger(id) && id >= 1 && id <= 55);
  const validSubs = {};
  for (const [key, value] of Object.entries(subs)) {
    const id = Number(key);
    if (Number.isInteger(id) && id >= 1 && id <= 55 && Number.isFinite(value) && value > 0) {
      validSubs[id] = Math.floor(value);
    }
  }
  state.earned = new Set(validEarned);
  state.subs = validSubs;
  persist(state);
  return { earned: validEarned.length, subs: Object.keys(validSubs).length };
}
