// Doggo Gallery
const form = document.getElementById('search-form');
const queryInput = document.getElementById('query');
const resultsEl = document.getElementById('results');

// Will hold {label, path} items, e.g., {label:'bulldog french', path:'bulldog/french'}
let BREEDS = [];

// 1) Load the full breed list at startup
window.addEventListener('DOMContentLoaded', async () => {
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

// placeholder
form.addEventListener('submit', (e) => {
  e.preventDefault();
  resultsEl.innerHTML = '<p class="hint">Breed list loaded. Hooking up search next…</p>';
});
