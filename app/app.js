// Black Friday Deal Finder: renders the deal board, search, filters and detail
// pages from deals.js. Everything runs from local files; no network request
// is made. Routes are hash-based so a screenshot can link straight to a view:
//
//   #/                 the board (all deals)
//   #/deal/<id>        one deal, full detail
//
// window.__shotReady is false while a page renders and true once it is on
// screen, so a screenshot script knows when to capture.

import { DEALS } from './deals.js';

const app = document.getElementById('app');
const SIGNAL_LABEL = {
  'new-low': 'NEW LOW',
  strong: 'STRONG DEAL',
  routine: 'ROUTINE DEAL',
  inflated: 'INFLATED LIST',
};

const state = {
  query: '',
  category: 'All',
  store: 'All',
  discount: '0',
  sort: 'discount',
  newLowsOnly: false,
};

const money = (n) =>
  '$' + n.toLocaleString('en-US', { minimumFractionDigits: n % 1 === 0 ? 0 : 2, maximumFractionDigits: 2 });
const pctOff = (d) => Math.round((1 - d.price / d.was) * 100);
const saved = (d) => d.was - d.price;
const esc = (s) =>
  String(s).replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
const checkedAt = (iso) =>
  new Date(iso).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'UTC',
  }) + ' UTC';

const CATEGORIES = ['All', ...new Set(DEALS.map((d) => d.category))];
const STORES = ['All', ...new Set(DEALS.map((d) => d.store))];

function visibleDeals() {
  const q = state.query.trim().toLowerCase();
  let list = DEALS.filter((d) => {
    if (state.category !== 'All' && d.category !== state.category) return false;
    if (state.store !== 'All' && d.store !== state.store) return false;
    if (pctOff(d) < Number(state.discount)) return false;
    if (state.newLowsOnly && d.signal !== 'new-low') return false;
    if (q && !`${d.title} ${d.store} ${d.category}`.toLowerCase().includes(q)) return false;
    return true;
  });
  const by = {
    discount: (a, b) => pctOff(b) - pctOff(a) || saved(b) - saved(a),
    saving: (a, b) => saved(b) - saved(a),
    priceAsc: (a, b) => a.price - b.price,
    priceDesc: (a, b) => b.price - a.price,
  }[state.sort];
  return list.sort(by);
}

function card(d) {
  return `<article class="card signal-${d.signal}">
    <div class="card-top">
      <span class="store">${esc(d.store)}</span>
      <span class="cat">${esc(d.category)}</span>
      <span class="sig">${SIGNAL_LABEL[d.signal]}</span>
    </div>
    <h3><a href="#/deal/${encodeURIComponent(d.id)}">${esc(d.title)}</a></h3>
    <p class="price"><strong>${money(d.price)}</strong> <s>${money(d.was)}</s>
      <span class="off">${pctOff(d)}% off</span></p>
    <p class="save">You save ${money(saved(d))}</p>
    <p class="why">${esc(d.why)}</p>
    <p class="meta">Checked ${checkedAt(d.checked)} · ${esc(d.source)}</p>
    <p class="go"><a href="${esc(d.url)}" target="_blank" rel="noopener">View at ${esc(d.store)} &rarr;</a></p>
  </article>`;
}

function board() {
  const list = visibleDeals();
  const totalSaved = DEALS.reduce((sum, d) => sum + saved(d), 0);
  const best = Math.max(...DEALS.map(pctOff));
  const chips = CATEGORIES.map(
    (c) =>
      `<button type="button" class="chip${state.category === c ? ' on' : ''}" data-cat="${esc(c)}">${esc(c)}</button>`,
  ).join('');
  const storeOptions = STORES.map(
    (s) => `<option value="${esc(s)}"${state.store === s ? ' selected' : ''}>${esc(s)}</option>`,
  ).join('');
  return `<section class="summary">
    <div><strong>${DEALS.length}</strong> deals</div>
    <div><strong>${STORES.length - 1}</strong> stores</div>
    <div><strong>${money(totalSaved)}</strong> total savings</div>
    <div><strong>${best}%</strong> biggest cut</div>
  </section>
  <section class="controls">
    <label class="search">Search deals
      <input id="q" type="search" placeholder="Try “airpods”, “TV”, “vacuum”…" value="${esc(state.query)}">
    </label>
    <div class="chips" role="group" aria-label="Category">${chips}</div>
    <div class="selects">
      <label>Store
        <select id="store">${storeOptions}</select>
      </label>
      <label>Discount at least
        <select id="discount">
          <option value="0"${state.discount === '0' ? ' selected' : ''}>Any discount</option>
          <option value="30"${state.discount === '30' ? ' selected' : ''}>30% off</option>
          <option value="40"${state.discount === '40' ? ' selected' : ''}>40% off</option>
          <option value="50"${state.discount === '50' ? ' selected' : ''}>50% off</option>
        </select>
      </label>
      <label>Sort by
        <select id="sort">
          <option value="discount"${state.sort === 'discount' ? ' selected' : ''}>Biggest discount</option>
          <option value="saving"${state.sort === 'saving' ? ' selected' : ''}>Biggest saving ($)</option>
          <option value="priceAsc"${state.sort === 'priceAsc' ? ' selected' : ''}>Price: low to high</option>
          <option value="priceDesc"${state.sort === 'priceDesc' ? ' selected' : ''}>Price: high to low</option>
        </select>
      </label>
      <label class="check"><input id="newlows" type="checkbox"${state.newLowsOnly ? ' checked' : ''}> New lows only</label>
    </div>
  </section>
  <p class="count" id="count">${list.length} of ${DEALS.length} deals shown</p>
  <section class="grid" id="grid">
    ${list.length ? list.map(card).join('') : '<p class="empty">No deal matches. Clear the search or loosen a filter.</p>'}
  </section>`;
}

function detail(d) {
  return `<p class="back"><a href="#/">&larr; All deals</a></p>
  <article class="detail signal-${d.signal}">
    <div class="card-top">
      <span class="store">${esc(d.store)}</span>
      <span class="cat">${esc(d.category)}</span>
      <span class="sig">${SIGNAL_LABEL[d.signal]}</span>
    </div>
    <h1>${esc(d.title)}</h1>
    <p class="price big"><strong>${money(d.price)}</strong> <s>${money(d.was)}</s>
      <span class="off">${pctOff(d)}% off</span></p>
    <p class="save">You save ${money(saved(d))} (${pctOff(d)}% off the usual price of ${money(d.was)}).</p>
    <h2>Is it really a deal?</h2>
    <p>${esc(d.why)}</p>
    <dl>
      <dt>Store</dt><dd>${esc(d.store)}</dd>
      <dt>Category</dt><dd>${esc(d.category)}</dd>
      <dt>Price checked</dt><dd>${checkedAt(d.checked)}</dd>
      <dt>Read in</dt><dd>${esc(d.source)}</dd>
    </dl>
    <p class="go"><a href="${esc(d.url)}" target="_blank" rel="noopener">View it at ${esc(d.store)} &rarr;</a></p>
  </article>`;
}

function notFound() {
  return `<h1>Not found</h1>
  <p>There is no deal at this address. <a href="#/">See all deals</a>.</p>`;
}

function bindBoard() {
  const q = document.getElementById('q');
  const grid = document.getElementById('grid');
  const count = document.getElementById('count');
  const repaint = () => {
    const list = visibleDeals();
    grid.innerHTML = list.length
      ? list.map(card).join('')
      : '<p class="empty">No deal matches. Clear the search or loosen a filter.</p>';
    count.textContent = `${list.length} of ${DEALS.length} deals shown`;
  };
  q.addEventListener('input', () => {
    state.query = q.value;
    repaint();
  });
  app.querySelectorAll('.chip').forEach((chip) => {
    chip.addEventListener('click', () => {
      state.category = chip.dataset.cat;
      app.querySelectorAll('.chip').forEach((c) => c.classList.toggle('on', c === chip));
      repaint();
    });
  });
  document.getElementById('store').addEventListener('change', (e) => {
    state.store = e.target.value;
    repaint();
  });
  document.getElementById('discount').addEventListener('change', (e) => {
    state.discount = e.target.value;
    repaint();
  });
  document.getElementById('sort').addEventListener('change', (e) => {
    state.sort = e.target.value;
    repaint();
  });
  document.getElementById('newlows').addEventListener('change', (e) => {
    state.newLowsOnly = e.target.checked;
    repaint();
  });
}

function render() {
  window.__shotReady = false;
  const match = location.hash.match(/^#\/deal\/([^/?#]+)/);
  if (match) {
    const found = DEALS.find((d) => d.id === decodeURIComponent(match[1]));
    document.title = `${found ? found.title : 'Not found'} | Black Friday Deal Finder`;
    app.innerHTML = found ? detail(found) : notFound();
  } else {
    document.title = 'Black Friday Deal Finder — 37 real deals, checked Nov 27, 2026';
    app.innerHTML = board();
    bindBoard();
  }
  window.scrollTo(0, 0);
  window.__shotReady = true;
}

window.addEventListener('hashchange', render);
render();
