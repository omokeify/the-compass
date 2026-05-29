// Global "saved" store — shared across feed, talent, members, bounties.
// Persists to localStorage and notifies subscribers so the Saved hub stays in sync.

const SAVE_KEY = 'compass_saved_v1';
const saveListeners = new Set();

function readSaved() {
  try { return JSON.parse(localStorage.getItem(SAVE_KEY) || '[]'); }
  catch { return []; }
}
function writeSaved(arr) {
  localStorage.setItem(SAVE_KEY, JSON.stringify(arr));
  saveListeners.forEach(fn => fn(arr));
}

// item = { id, type: 'post'|'gig'|'member'|'bounty', title, sub, hue, handle, ref }
function toggleSaved(item) {
  const arr = readSaved();
  const key = item.type + ':' + item.id;
  const idx = arr.findIndex(x => (x.type + ':' + x.id) === key);
  if (idx >= 0) arr.splice(idx, 1);
  else arr.unshift({ ...item, savedAt: Date.now() });
  writeSaved(arr);
  return idx < 0; // true if now saved
}
function isSaved(type, id) {
  return readSaved().some(x => x.type === type && x.id === id);
}

function useSaved() {
  const [items, setItems] = React.useState(readSaved);
  React.useEffect(() => {
    const fn = (arr) => setItems([...arr]);
    saveListeners.add(fn);
    return () => saveListeners.delete(fn);
  }, []);
  return items;
}

Object.assign(window, { toggleSaved, isSaved, useSaved, readSaved });
