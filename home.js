/* Home: the first screen after signing in, and the bottom tabs on every page. A photo card with what is still in its return window, money saved so far,
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
    b.id = 'home-profile'; b.className = 'flow-profile'; b.dataset.view = 'settings';
    b.title = 'Open my settings'; b.setAttribute('aria-label', 'Open my settings');
    box.append(b);
  }
  b.hidden = view !== 'home';
  if (!b.hidden) b.innerHTML = avatarInner();
}

/* Bottom tabs: Home, History, Scan (raised, opens the scanner), Reminders and My vibe (reminder voice). Hidden during the scan steps. */
const tabIcons = {
  home: '<path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-4.5v-6h-5v6H5a1 1 0 0 1-1-1z"/>',
  history: '<path d="M3.5 12a8.5 8.5 0 1 0 2.5-6"/><path d="M3.5 4.5V9H8"/><path d="M12 7.5V12l3 2"/>',
  scan: '<path d="M4 8V6a2 2 0 0 1 2-2h2M16 4h2a2 2 0 0 1 2 2v2M20 16v2a2 2 0 0 1-2 2h-2M8 20H6a2 2 0 0 1-2-2v-2"/><rect x="8" y="7.5" width="8" height="9" rx="1"/><path d="M10 10.5h4M10 13.5h4"/>',
  reminders: '<path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15z"/><path d="M10 20.5a2 2 0 0 0 4 0"/>',
  vibe: '<path d="M4 7h10M18 7h2M4 12h4M12 12h8M4 17h12M20 17h0"/><circle cx="16" cy="7" r="2"/><circle cx="10" cy="12" r="2"/><circle cx="18" cy="17" r="2"/>'
};
const tabs = [['home', 'Home', 'home'], ['overview', 'History', 'history'], ['scan', 'Scan', 'scan'], ['reminders', 'Reminders', 'reminders'], ['vibe', 'My vibe', 'vibe']];
// History opens the purchases page (photo grid and its tabs); the menu's History list lights it too.
const tabFor = v => v === 'home' ? 'home' : ['overview', 'purchases', 'history', 'history-log', 'calendar', 'wallet'].includes(v) ? 'overview' : v === 'reminders' ? 'reminders' : v === 'vibe' ? 'vibe' : '';
function syncTabs() {
  let bar = $('#tab-bar');
  if (!bar) {
    const tab = ([v, label, ic]) => v === 'scan' ? `<button type="button" data-tab="scan" class="tab-scan" aria-label="Scan">${homeIcon(tabIcons[ic])}</button>` : `<button type="button" data-tab="${v}" aria-label="${label}">${homeIcon(tabIcons[ic])}<span>${label}</span></button>`;
    // One bar whose top edge dips into a pocket in the middle; the Scan button rests in the pocket.
    document.body.insertAdjacentHTML('beforeend', `<nav id="tab-bar" class="tab-bar" aria-label="Main"><span class="tab-surface" aria-hidden="true"></span>${tabs.map(tab).join('')}</nav>`);
    bar = $('#tab-bar');
  }
  const current = tabFor(view);
  bar.querySelectorAll('[data-tab]').forEach(b => { const on = b.dataset.tab === current; b.classList.toggle('active', on); if (on) b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current'); });
}
document.addEventListener('click', e => {
  const b = e.target.closest('[data-tab]');
  if (!b) return;
  if (b.dataset.tab === 'scan') { showAdd(); return; }
  view = b.dataset.tab; render(); window.scrollTo(0, 0);
});

render = function () {
  if (view !== 'home') { document.body.classList.remove('home-active'); renderBeforeHome(); syncHomeProfile(); syncTabs(); return; }
  if (typeof stopJourneyCamera === 'function') stopJourneyCamera();
  document.body.classList.remove('flow-active');
  document.body.classList.add('home-active');
  const fp = $('#flow-profile'); if (fp) fp.hidden = true;
  $('#main').innerHTML = homePage();
  syncHomeProfile();
  syncTabs();
};

/* The bottom tabs now cover Home, purchases, returns and results, so the ☰ menu keeps only Reminders, History, Settings
   and Support, without the totals at the top. */
for (const v of ['overview', 'calendar', 'wallet']) { const n = menuItems.findIndex(m => m[0] === v); if (n >= 0) menuItems.splice(n, 1); }
menuStats = () => '';

/* Open on Home unless the page was asked for something else (e.g. #upload from sign-up). */
if (view === 'overview' && !location.hash) view = 'home';
render();
