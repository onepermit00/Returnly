/* Home: the first screen after signing in. A photo card with what is still in its return window, money saved so far,
   and the open return windows. The profile button (top right) opens the purchases dashboard. */
const renderBeforeHome = render;
const homeIcons = {
  coins: '<ellipse cx="12" cy="6" rx="7" ry="3"/><path d="M5 6v4c0 1.7 3.1 3 7 3s7-1.3 7-3V6"/><path d="M5 10v4c0 1.7 3.1 3 7 3s7-1.3 7-3v-4"/><path d="M5 14v4c0 1.7 3.1 3 7 3s7-1.3 7-3v-4"/>',
  bag: '<path d="M6 8h12l-1 12H7z"/><path d="M9 8V6.5a3 3 0 0 1 6 0V8"/>',
  grid: '<rect x="4" y="4" width="6.5" height="6.5" rx="1.5"/><rect x="13.5" y="4" width="6.5" height="6.5" rx="1.5"/><rect x="4" y="13.5" width="6.5" height="6.5" rx="1.5"/><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.5"/>'
};
const homeIcon = d => `<svg class="home-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;

/* Purchases still inside their return window that haven't been sent back yet, soonest deadline first. */
function homeWindows() { return openItems().filter(i => i.status !== 'shipped' && i.outcome !== 'final'); }

function homeStats() {
  const open = homeWindows(), t = today();
  return {
    tracked: open.reduce((n, i) => n + (Number(i.price) || 0), 0),
    active: items.filter(i => ['started', 'shipped'].includes(i.status) || (i.intent === 'return' && i.status === 'deciding' && C.active(i, t))).length,
    dueSoon: open.filter(i => { const d = C.days(C.due(i), t); return d !== null && d >= 0 && d <= 3; }).length,
    returned: resultValues().returned,
    saved: resultValues().refund + resultValues().credit
  };
}

function homeRow(i) {
  const d = C.days(C.due(i), today()), soon = d !== null && d >= 0 && d <= 3;
  return `<li><button class="home-row" data-open="${esc(i.id)}">${photo(i)}<span class="home-row-text"><strong>${esc(i.name)}</strong><small>${esc(i.retailer)} · ${money(i.price)}${i.demo ? ' · Example' : ''}</small></span><em class="home-due${soon ? ' soon' : ''}">${esc(daysLabel(i))}</em></button></li>`;
}

function homePage() {
  const s = homeStats(), list = homeWindows(), examples = items.some(i => i.demo);
  return `<section class="home">
<div class="home-hero">
  <p class="home-eyebrow">Still in your return window</p>
  <p class="home-value">${money(s.tracked)}</p>
  <p class="home-sub">Tracked purchase value · USD</p>
  <dl class="home-stats">
    <div><dt>Active returns</dt><dd>${s.active}</dd></div>
    <div><dt>Due within 3 days</dt><dd>${s.dueSoon}</dd></div>
    <div><dt>Returned</dt><dd>${s.returned}</dd></div>
  </dl>
</div>
<div class="home-grid">
  <div class="home-saved">
    <div><p class="home-saved-label">Saved so far</p><p class="home-saved-value">${money(s.saved)}</p></div>
    <span class="home-saved-icon">${homeIcon(homeIcons.coins)}</span>
    <p class="home-note">Refunds and store credit you've received · USD.${examples ? ' Includes example purchases.' : ''}</p>
  </div>
  <div class="home-windows">
    ${list.length ? `<ul class="home-list">${list.map(homeRow).join('')}</ul>` : `<div class="home-empty"><span class="home-empty-icon">${homeIcon(homeIcons.bag)}</span><p><strong>You haven't added any purchases yet.</strong></p><p>Add a purchase to start tracking its return window.</p><button class="primary" data-add>Add purchase</button></div>`}
  </div>
</div>
</section>`;
}

function syncHomeProfile() {
  const box = $('.global-header>div');
  if (!box) return;
  let b = $('#home-profile');
  if (!b) {
    b = document.createElement('button');
    b.id = 'home-profile'; b.className = 'flow-profile'; b.dataset.view = 'overview';
    b.title = 'Open my purchases'; b.setAttribute('aria-label', 'Open my purchases');
    box.append(b);
  }
  b.hidden = view !== 'home';
  if (!b.hidden) b.innerHTML = avatarInner();
}

render = function () {
  if (view !== 'home') { document.body.classList.remove('home-active'); renderBeforeHome(); syncHomeProfile(); return; }
  if (typeof stopJourneyCamera === 'function') stopJourneyCamera();
  document.body.classList.remove('flow-active');
  document.body.classList.add('home-active');
  const fp = $('#flow-profile'); if (fp) fp.hidden = true;
  $('#main').innerHTML = homePage();
  syncHomeProfile();
};

/* The ☰ menu gets a Home entry at the top; Your purchases moves to a grid icon so the two don't share the house. */
menuIcons.house = menuIcons.home; menuIcons.grid = homeIcons.grid;
menuItems.unshift(['home', 'Home', 'house']);
const purchasesItem = menuItems.find(m => m[0] === 'overview'); if (purchasesItem) purchasesItem[2] = 'grid';

/* Open on Home unless the page was asked for something else (e.g. #upload from sign-up). */
if (view === 'overview' && !location.hash) view = 'home';
render();
