// Doggo Gallery
const form = document.getElementById('search-form');
const queryInput = document.getElementById('query');
const resultsEl = document.getElementById('results');

// === THEME: initialization helpers ===
const THEME_KEY = "theme"; // "light" | "dark"

function getPreferredTheme(){
  const saved = localStorage.getItem(THEME_KEY);
  if (saved === "light" || saved === "dark") return saved;
  // fall back to OS preference
  return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
}

function applyTheme(theme){
  const t = theme === "light" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", t);
  updateToggleUI(t);
}

function updateToggleUI(theme){
  const btn = document.getElementById("theme-toggle");
  if (!btn) return;
  // Icon: show opposite action
  if (theme === "light"){
    btn.textContent = "🌙";
    btn.title = "Switch to dark";
    btn.setAttribute("aria-pressed", "true");
  } else {
    btn.textContent = "☀️";
    btn.title = "Switch to light";
    btn.setAttribute("aria-pressed", "false");
  }
}


// Will hold {label, path} items, e.g., {label:'bulldog french', path:'bulldog/french'}
let BREEDS = [];

// 1) Load the full breed list at startup
window.addEventListener('DOMContentLoaded', async () => {
  // 1) Initialize theme
  const initial = getPreferredTheme();
  applyTheme(initial);

  // 2) Load Dog CEO breed list
  try {
    const res = await fetch('https://dog.ceo/api/breeds/list/all');
    if (!res.ok) throw new Error('Failed to load breed list');
    const data = await res.json();
    const mapping = data?.message || {};

    const list = [];
    Object.keys(mapping).forEach((breed) => {
      const subs = mapping[breed] || [];
      if (subs.length === 0) {
        list.push({ label: breed, path: breed });
      } else {
        subs.forEach((sub) => list.push({ label: `${breed} ${sub}`, path: `${breed}/${sub}` }));
      }
    });
    BREEDS = list;
  } catch (err) {
    console.error(err);
    // Non-fatal: can still try the raw term the user types
  }
});


form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const term = queryInput.value.trim().toLowerCase();
  if (!term) return;

  resultsEl.innerHTML = ''; // clear previous

  // Find matching breeds by substring; fallback to raw term if list failed
  const matches = BREEDS.length
    ? BREEDS.filter(b => b.label.includes(term))
    : [{ label: term, path: term }];

  if (matches.length === 0) {
    resultsEl.innerHTML = `<p class="hint">No matching breeds. Try another word (e.g., "shep", "retr", "bull").</p>`;
    return;
  }

  // small fan-out to not spam the API
  const MAX_RESULTS = 24;
  const MAX_BREEDS = 6;
  const picks = matches.slice(0, MAX_BREEDS);
  const perBreed = Math.max(3, Math.floor(MAX_RESULTS / picks.length));

  try {
    const frag = document.createDocumentFragment();

    for (const b of picks) {
      const url = `https://dog.ceo/api/breed/${b.path}/images/random/${perBreed}`;
      const res = await fetch(url);
      if (!res.ok) continue;
      const data = await res.json();
      const images = Array.isArray(data?.message) ? data.message : [];

      images.forEach((src) => {
        const col = document.createElement('div');
        col.className = 'col';

        const card = document.createElement('article');
        card.className = 'card';

        const img = document.createElement('img');
        img.loading = 'lazy';
        img.alt = b.label + ' dog';
        img.src = src;

        const meta = document.createElement('div');
        meta.className = 'meta';
        meta.innerHTML = `<span>${b.label}</span><span>Random</span>`;

        card.appendChild(img);
        card.appendChild(meta);
        col.appendChild(card);
        frag.appendChild(col);
      });
    }

    if (!frag.childNodes.length) {
      resultsEl.innerHTML = `<p class="hint">No images returned. Try a different breed.</p>`;
      return;
    }

    resultsEl.appendChild(frag);
  } catch (err) {
    console.error(err);
    resultsEl.innerHTML = `<p class="hint">Something went wrong. Check your internet connection and try again.</p>`;
  }
});

// === THEME: toggle behavior and persistence ===
document.addEventListener("click", (e) => {
  const btn = e.target.closest("#theme-toggle");
  if (!btn) return;
  const current = document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark";
  const next = current === "light" ? "dark" : "light";
  applyTheme(next);
  try { localStorage.setItem(THEME_KEY, next); } catch(_) {}
});
