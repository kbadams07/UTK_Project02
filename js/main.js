// Doggo Gallery
const form = document.getElementById('search-form');
const queryInput = document.getElementById('query');
const resultsEl = document.getElementById('results');

// We'll append functionality in later commits
form.addEventListener('submit', (e) => {
  e.preventDefault();
  resultsEl.innerHTML = '<p class="hint">Searching… (functionality coming next)</p>';
});
