/* Moments: the screens around a return, loaded after studio.js. A first-run welcome, Alerts (the bell), Keep it or send
   it back (a swipe deck for undecided purchases), the return pass shown at the counter, and the money-back celebration
   when a refund or credit is marked as received. Each one saves through the same item fields the rest of the app uses. */
const renderBeforeMoments = render;
const MOMENT_VIEWS = ['welcome', 'alerts', 'decide', 'pass'];
const ONBOARDED = 'returnly-onboarded-v1', ALERTS_SEEN = 'returnly-alerts-seen-v1';
const WELCOME_STORES = ['Zara', 'Target', 'Amazon', 'Nike', 'Fashion Nova', 'SHEIN', 'Walmart', 'H&M'];
const WELCOME_PHOTOS = { Zara: 's-cardigan', Target: 's-loafers', Amazon: 's-shoulderbag', Nike: 's-sneakers', 'Fashion Nova': 's-dress', SHEIN: 's-dress', Walmart: 's-tote', 'H&M': 's-cardigan' };
let stWelcomeStep = 0, stAlertTab = 'all', stDeckSkip = [], stPassId = null, stPassBack = 'plan';
const stGet = (k, f) => { try { const v = localStorage.getItem(k); return v === null ? f : JSON.parse(v); } catch { return f; } };
const stSet = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };

/* ---------- welcome (first run) ---------- */
function stWelcome() {
  const steps = 3, bar = n => `<div class="st-obbar"><span class="st-k">${n} of ${steps}</span><i><b style="width:${Math.round(100 * n / steps)}%"></b></i></div>`;
  if (stWelcomeStep === 0) {
    const mine = profile.stores || [];
    return `<section class="st st-welcome">${bar(1)}
<h1 class="st-d1 st-center">Where do you <em>shop?</em></h1><p class="st-m st-center">We’ve checked the return policies of these stores. Pick yours.</p>
<div class="st-stores">${WELCOME_STORES.map((s, k) => `<button class="st-store ph${mine.includes(s) ? ' on' : ''}" data-st-store="${esc(s)}" aria-pressed="${mine.includes(s)}"><img src="assets/${WELCOME_PHOTOS[s]}.jpg" alt="" class="${k > 4 ? 'alt' : ''}"><span>${esc(s)}</span><i aria-hidden="true">${ic('i-check', 's')}</i></button>`).join('')}</div>
<div class="st-obfoot"><button class="st-pill cb full" data-st-welcome="1">Continue ${ic('i-right', 's')}</button><button class="st-link" data-st-welcome="1">Skip for now</button></div></section>`;
  }
  if (stWelcomeStep === 1) {
    const v = VibeN.vibeOf(settings.vibe);
    return `<section class="st st-welcome">${bar(2)}
<h1 class="st-d1 st-center">How should we <em>nudge you?</em></h1>
<div class="st-vlist">${vibeVoices.map(([id]) => `<button class="st-vrow${v.voice === id ? ' on' : ''}" data-st-voice="${id}"><span class="st-vsw ${stVoiceColor[id]}">${esc(VibeN.VOICES[id].name.replace(/^The /, '').slice(0, 1))}</span><span class="st-grow"><b>${esc(VibeN.VOICES[id].name)}</b><small class="q">${esc(stVoiceLine[id])}</small></span><span class="st-radio" aria-hidden="true"></span></button>`).join('')}</div>
<div class="st-obfoot"><button class="st-pill cb full" data-st-welcome="2">Continue ${ic('i-right', 's')}</button><span class="st-m sm st-center">You can change it anytime in My vibe</span></div></section>`;
  }
  if (stWelcomeStep === 2) {
    return `<section class="st st-welcome">${bar(3)}
<h1 class="st-d0 st-center">Let us nudge you <em>before a window closes.</em></h1>
<div class="st-perm"><b>Turn on notifications</b><p class="st-m sm">One reminder a day, at the time you pick, only while a return is open.</p><div class="st-acts"><button class="st-pill g" data-st-welcome="3">Not now</button><button class="st-pill el" id="enable-notifications" data-st-welcome="3">Allow</button></div></div>
<div class="st-notif sample"><span class="st-appi">R.</span><div class="st-sb"><span>Returnly</span><span>9:00 AM</span></div><b>3 days left on the cardigan</b><p>Zara · $69.90 back</p></div></section>`;
  }
  return `<section class="st st-welcome ready">
<div class="st-collage" aria-hidden="true"><span></span><span></span><span></span><b class="a">30 days left</b><b class="c">$110 back</b></div>
<div class="st-g6 st-center"><span class="st-k">${stName() ? 'Hi, ' + esc(stName()) : 'Welcome'}</span><h1 class="st-d0">You’re ready <em>to get it back.</em></h1></div>
<div class="st-obfoot"><button class="st-pill b full" data-st-finish="scan">${ic('i-scan', 's')}Scan your first receipt</button><button class="st-link" data-st-finish="email">Or forward an order email</button><button class="st-link quiet" data-st-finish="home">Look around first</button></div></section>`;
}
const stVoiceLine = { bestie: '“Bestie. Saturday.”', bro: '“Bro, send it back.”', straight: '“Due Sat, Oct 31.”', comedian: '“Still in the bag?”', supportive: '“You’ve got this.”', assistant: '“A gentle reminder.”' };
const stNeedsWelcome = () => !stGet(ONBOARDED, false) && !items.length && !!Account.user();

/* ---------- alerts ---------- */
function stAlertList() {
  const t = today(), out = [];
  for (const i of items) {
    const n = stDays(i), name = esc(stFirst(i.name)), store = esc(i.retailer);
    if (stOpen(i) && n !== null && n >= 0 && n <= 7) {
      const when = n === 0 ? `<b>Due today.</b> Send the ${name} back by tonight.` : n === 1 ? `<b>Due tomorrow.</b> The ${name} goes back to ${store}.` : `<b>${n} days left</b> on the ${name} from ${store}.`;
      out.push({ kind: 'deadline', date: t, sort: n, hot: n <= 1, item: i, html: when, act: `data-open="${esc(i.id)}"` });
    }
    if (i.status === 'started') out.push({ kind: 'deadline', date: t, sort: 8, item: i, html: `<b>Next step:</b> ${i.channel === 'store' ? 'take the ' + name + ' to ' + store : 'send the ' + name + ' back to ' + store}.`, act: `data-open="${esc(i.id)}"` });
    if (i.status === 'shipped') out.push({ kind: 'money', date: i.returnedOn || t, sort: 20, item: i, html: `<b>Sent back.</b> Mark the ${name} as paid when ${store}’s refund lands.`, act: `data-open="${esc(i.id)}"` });
    if (i.status === 'received') out.push({ kind: 'money', date: i.returnedOn || i.delivered || i.purchased || t, sort: 30, item: i, money: true, html: `<b>${money(i.received || 0)} is back</b> from ${store}${i.outcome === 'credit' ? ' as store credit' : ''}.`, act: `data-open="${esc(i.id)}"` });
  }
  const undecided = items.filter(i => stOpen(i) && !['return', 'keep'].includes(i.intent)).length;
  if (undecided) out.push({ kind: 'deadline', date: t, sort: 9, html: `<b>${undecided} purchase${undecided === 1 ? '' : 's'} to decide.</b> Keep it or send it back? Swipe through them.`, act: 'data-view="decide"', icon: 'i-heart' });
  return out.sort((a, b) => a.date === b.date ? a.sort - b.sort : String(b.date).localeCompare(String(a.date)));
}
function stAlerts() {
  const t = today(), all = stAlertList(), list = all.filter(a => stAlertTab === 'all' || a.kind === stAlertTab);
  const weekAgo = C.shift(t, -7), groups = [['Today', list.filter(a => a.date >= t)], ['This week', list.filter(a => a.date < t && a.date >= weekAgo)], ['Earlier', list.filter(a => a.date < weekAgo)]];
  const row = a => `<button class="st-alert${a.hot ? ' hot' : ''}" ${a.act}>${a.item ? stThumb(a.item) : `<span class="st-thumb st-aicon">${ic(a.icon || 'i-bell')}</span>`}<span class="st-grow">${a.html}</span>${a.hot ? '<i class="st-unread" aria-label="New"></i>' : ''}</button>`;
  return `<section class="st st-alerts">
${stHead('Alerts', stCirc('i-x', 'data-tab="home"', 'Close alerts'))}
<div class="st-seg">${[['all', 'All'], ['deadline', 'Deadlines'], ['money', 'Money']].map(([id, l]) => `<button data-st-alerts="${id}" class="${stAlertTab === id ? 'on' : ''}">${l}</button>`).join('')}</div>
${list.length ? groups.filter(g => g[1].length).map(([h, l]) => `<div class="st-g8"><span class="st-k">${h}</span><div class="st-rows">${l.map(row).join('')}</div></div>`).join('') : `<div class="st-emptycard"><h2 class="st-d2">Nothing new. <em>All quiet.</em></h2><p class="st-m">Deadlines, next steps and money coming back show up here.</p></div>`}
</section>`;
}
const stAlertsNew = () => stGet(ALERTS_SEEN, '') !== today() && stAlertList().some(a => a.kind === 'deadline');

/* ---------- keep it or send it back ---------- */
const stDeckList = () => sorted(items.filter(i => stOpen(i) && !['return', 'keep'].includes(i.intent) && !stDeckSkip.includes(i.id)));
function stDeck() {
  const list = stDeckList(), total = list.length + stDeckSkip.length;
  if (!list.length) return `<section class="st st-decide">
${stHead('Keep it or <em>send it back?</em>', stCirc('i-x', 'data-tab="overview"', 'Close'))}
<div class="st-emptycard"><h2 class="st-d2">All decided. <em>Nice.</em></h2><p class="st-m">${stDeckSkip.length ? `You’re sleeping on ${stDeckSkip.length}. We’ll ask again tomorrow.` : 'Every open purchase has a plan.'}</p><button class="st-pill b sm" data-tab="overview">Back to purchases</button></div></section>`;
  const [top, ...rest] = list, n = stDays(top);
  return `<section class="st st-decide">
<header class="st-head"><button class="st-circ" data-tab="overview" aria-label="Close">${ic('i-x')}</button><span class="st-k">${total - list.length + 1} of ${total} to decide</span><span style="width:42px"></span></header>
<h1 class="st-d1 st-center">Keep it or <em>send it back?</em></h1>
<div class="st-deck">${rest.slice(0, 2).reverse().map((i, k) => `<div class="st-cardx b${rest.length > 1 ? 3 - k : 2}">${stPhoto(i)}</div>`).join('')}
  <div class="st-cardx front" data-st-card="${esc(top.id)}">${stPhoto(top)}<span class="st-stamp ret">RETURN</span><span class="st-stamp keep">KEEP</span>
    <div class="st-meta"><div class="st-sb"><span class="st-k">${esc(top.retailer)} · ${stCents(top.price)} back</span>${stChip(top)}</div><p class="st-d2">${esc(top.name)}</p><p class="st-m sm">${n === null ? 'Add the return window to know how long you have.' : n <= 3 ? 'Its window closes soon. Decide today.' : `You have ${n} days to decide.`}</p></div>
  </div>
</div>
<div class="st-decidebar"><button data-st-decide="return"><span class="st-circ">${ic('i-undo')}</span><small>Return</small></button><button data-st-decide="later" class="mid"><span class="st-circ b">${ic('i-clock')}</span><small>Sleep on it</small></button><button data-st-decide="keep"><span class="st-circ">${ic('i-heart')}</span><small>Keep</small></button></div>
<p class="st-m sm st-center">Swipe left to return, right to keep.</p>
</section>`;
}
function stDecide(id, how) {
  const i = find(id); if (!i) return;
  if (how === 'return') { i.intent = 'return'; save(); toast(`Sending the ${stFirst(i.name)} back. It’s on your Home now.`); }
  else if (how === 'keep') { i.status = 'kept'; i.intent = 'keep'; save(); toast(`Keeping the ${stFirst(i.name)}. Reminders stop for it.`); }
  else { i.intent = 'later'; stDeckSkip.push(i.id); save(); toast('Sleeping on it. Its deadline stays the same.'); }
  render();
}

/* ---------- return pass ---------- */
function stPass() {
  const i = find(stPassId);
  if (!i) { view = 'overview'; return stPurchases(); }
  const n = stDays(i), d = C.due(i), store = i.channel === 'store';
  const code = i.label && i.labelKind !== 'pdf' ? `<img class="st-code" src="${esc(i.label)}" alt="Your QR code or return label">` : i.label ? `<button class="st-pill b" data-st-label="${esc(i.id)}">${ic('i-doc', 's')}Open your label</button>` : `<label class="st-addcode" for="st-pass-label"><span class="st-circ flat">${ic('i-qr')}</span><b>Add your QR code or label</b><small>A screenshot or PDF from ${esc(i.retailer)}’s email</small></label><input type="file" id="st-pass-label" data-plan-label accept="image/jpeg,image/png,image/webp,application/pdf" hidden>`;
  return `<section class="st st-pass">
<header class="st-head"><button class="st-circ" data-st-pass-back aria-label="Close">${ic('i-x')}</button><b class="st-t15">Return pass</b><span style="width:42px"></span></header>
<article class="st-ticket">
  <div class="st-ticket-top">
    <div class="st-sb"><div class="st-r"><span class="st-logo">${esc((i.retailer || '?').slice(0, 4).toUpperCase())}</span><span class="st-g2"><span class="st-k dk">${store ? 'In-store return' : 'Mail return'}</span><b>${esc(i.retailer)}</b></span></div>${n !== null && n >= 0 ? `<span class="st-tag hot">${n === 0 ? 'Today' : n === 1 ? 'Tomorrow' : n + ' days'}</span>` : ''}</div>
    <div class="st-r st-pass-item">${stThumb(i)}<span class="st-g2"><b>${esc(i.name)}</b><small>${money(i.price)}${i.orderNumber ? ' · Order ' + esc(i.orderNumber) : ''}</small></span></div>
    <div class="st-sb"><span class="st-g2"><span class="st-k dk">Return by</span><b>${d ? esc(stShort(d)) : 'Add a date'}</b></span><span class="st-g2 st-right"><span class="st-k dk">Money back as</span><b>${i.outcome === 'credit' ? 'Store credit' : i.outcome === 'refund' ? 'Refund' : 'To confirm'}</b></span></div>
  </div>
  <div class="st-ticket-bottom">${code}<p class="st-m sm st-center">${i.label ? 'Show this at the counter. Turn your screen brightness up if it won’t scan.' : 'Once it’s added, it opens here, ready to scan.'}</p></div>
</article>
${i.label && i.labelKind !== 'pdf' ? `<button class="st-pill b full" data-st-label="${esc(i.id)}">${ic('i-eye', 's')}Show it full screen</button>` : ''}
</section>`;
}
function stOpenPass(id, back) { stPassId = id; stPassBack = back || view; selected = id; view = 'pass'; render(); window.scrollTo(0, 0); }

/* ---------- money back ---------- */
function stCelebrate(i) {
  const year = stBack(), amt = Number(i.received) || 0;
  let el = $('#st-party'); if (el) el.remove();
  const colors = ['#d9e44b', '#ffffff', '#2a5cff'];
  const bits = Array.from({ length: 28 }, (_, k) => `<i style="left:${(k * 37) % 100}%;background:${colors[k % 3]};animation-delay:-${((k * 0.29) % 3.6).toFixed(2)}s;transform:rotate(${(k * 47) % 90}deg)"></i>`).join('');
  document.body.insertAdjacentHTML('beforeend', `<div id="st-party" class="st-party" role="dialog" aria-modal="true" aria-label="Money back">
<div class="st-confetti" aria-hidden="true">${bits}</div>
<span class="st-k dk">${esc(i.retailer)} · ${esc(i.name)}</span>
<div class="st-party-mid"><h2 class="st-d0">Money <em>back.</em></h2><p class="st-n">${money(amt)}</p><p class="st-sm">${year > amt ? `That’s ${money(year)} back this year.` : 'Your first one. Many more to come.'}</p></div>
<div class="st-sharecard">${stThumb(i)}<span class="st-g2"><span class="st-k">${i.outcome === 'credit' ? 'Store credit' : 'Returned on time'}</span><b>${money(amt)} back from ${esc(i.retailer)}</b><small>via Returnly</small></span></div>
<div class="st-party-acts"><button class="st-pill w full" id="st-share">${ic('i-share', 's')}Share it</button><button class="st-link light" id="st-party-done">Done</button></div>
</div>`);
  $('#st-party-done').focus();
  if (navigator.vibrate) try { navigator.vibrate(30); } catch {}
}
/* A share image for Stories (1080 × 1920), drawn on a canvas so it needs nothing from outside the app. */
async function stShareImage(i) {
  const c = document.createElement('canvas'); c.width = 1080; c.height = 1920; const g = c.getContext('2d');
  const bg = g.createRadialGradient(900, 200, 50, 540, 960, 1500); bg.addColorStop(0, '#2b4fbf'); bg.addColorStop(.6, '#15284b'); bg.addColorStop(1, '#0d1830');
  g.fillStyle = bg; g.fillRect(0, 0, 1080, 1920);
  try { await document.fonts.ready; } catch {}
  g.fillStyle = '#fff'; g.textAlign = 'center';
  g.font = 'italic 300 120px Newsreader, Georgia, serif'; g.fillText('Money back.', 540, 700);
  g.font = '700 220px Arial, Helvetica, sans-serif'; g.fillText(money(i.received || 0), 540, 950);
  g.font = '500 44px Geist, Arial, sans-serif'; g.fillStyle = 'rgba(255,255,255,.75)'; g.fillText(`from ${i.retailer}`, 540, 1050);
  g.font = '800 72px Arial, Helvetica, sans-serif'; g.fillStyle = '#fff'; g.fillText('Returnly.', 540, 1760);
  return new Promise(res => c.toBlob(res, 'image/png'));
}

/* ---------- wiring ---------- */
render = function () {
  if (view === 'home' && stNeedsWelcome()) view = 'welcome';
  const ours = MOMENT_VIEWS.includes(view);
  document.body.classList.toggle('st-welcoming', view === 'welcome');
  if (!ours) {
    renderBeforeMoments();
    if (view === 'plan') { const i = find(selected), card = $('.plan-card'); if (i && card && i.status !== 'received' && !$('.st-passlink')) card.insertAdjacentHTML('afterbegin', `<button class="st-passlink" data-st-pass="${esc(i.id)}">${ic('i-qr', 's')}<span class="st-grow">${i.label ? 'Show my return pass' : 'Your return pass'}<small>${i.label ? 'Ready to scan at the counter' : 'Add the QR code or label from the store’s email'}</small></span>${ic('i-chev', 'chev')}</button>`); }
    return;
  }
  if (typeof stopJourneyCamera === 'function') stopJourneyCamera();
  document.body.classList.add('studio', 'st-page');
  document.body.classList.remove('flow-active', 'home-active');
  const fp = $('#flow-profile'); if (fp) fp.hidden = true;
  if (view === 'alerts') stSet(ALERTS_SEEN, today());
  $('#main').innerHTML = view === 'welcome' ? stWelcome() : view === 'alerts' ? stAlerts() : view === 'decide' ? stDeck() : stPass();
  syncHomeProfile();
  stTabs(); syncTabs();
  if (view === 'decide') stSwipe();
};

/* Drag the top card: left sends it back, right keeps it. Buttons do the same for anyone who can't swipe. */
function stSwipe() {
  const card = $('[data-st-card]'); if (!card) return;
  let x0 = null, dx = 0;
  card.addEventListener('pointerdown', e => { x0 = e.clientX; dx = 0; card.setPointerCapture(e.pointerId); card.style.transition = 'none'; });
  card.addEventListener('pointermove', e => { if (x0 === null) return; dx = e.clientX - x0; card.style.transform = `translateX(${dx}px) rotate(${dx / 18}deg)`; card.classList.toggle('to-ret', dx < -40); card.classList.toggle('to-keep', dx > 40); });
  const end = () => { if (x0 === null) return; x0 = null; card.style.transition = ''; if (Math.abs(dx) > 110) { card.style.transform = `translateX(${dx > 0 ? 600 : -600}px) rotate(${dx > 0 ? 25 : -25}deg)`; setTimeout(() => stDecide(card.dataset.stCard, dx > 0 ? 'keep' : 'return'), 180); } else { card.style.transform = ''; card.classList.remove('to-ret', 'to-keep'); } };
  card.addEventListener('pointerup', end); card.addEventListener('pointercancel', end);
}

document.addEventListener('click', async e => {
  const b = e.target.closest('button,label[for="st-pass-label"]');
  if (!b) return;
  if (b.dataset.stStore) { const s = b.dataset.stStore, l = profile.stores || []; profile.stores = l.includes(s) ? l.filter(x => x !== s) : [...l, s]; saveProfile(); render(); return; }
  if (b.dataset.stVoice) { settings.vibe = { ...VibeN.vibeOf(settings.vibe), voice: b.dataset.stVoice }; save(); render(); return; }
  if (b.dataset.stWelcome) { const next = Number(b.dataset.stWelcome); setTimeout(() => { stWelcomeStep = next; render(); window.scrollTo(0, 0); }, b.id === 'enable-notifications' ? 900 : 0); return; }
  if (b.dataset.stFinish) { stSet(ONBOARDED, true); const f = b.dataset.stFinish; view = f === 'email' ? 'email-import' : 'home'; if (f === 'email' && typeof loadInbox === 'function') loadInbox(); render(); if (f === 'scan') showAdd(); return; }
  if (b.dataset.stAlerts) { stAlertTab = b.dataset.stAlerts; render(); return; }
  if (b.dataset.stDecide) { const c = $('[data-st-card]'); if (c) stDecide(c.dataset.stCard, b.dataset.stDecide); return; }
  if (b.dataset.stPass) { stOpenPass(b.dataset.stPass, view); return; }
  if (b.hasAttribute('data-st-pass-back')) { const id = stPassId; if (stPassBack === 'plan') showDetail(id); else { view = stPassBack; render(); } return; }
  if (b.dataset.stLabel) { const i = find(b.dataset.stLabel); if (i) showLabel(i); return; }
  if (b.id === 'st-party-done') { $('#st-party')?.remove(); return; }
  if (b.id === 'st-share') {
    const i = find(b.closest('#st-party').dataset.item); if (!i) return;
    const blob = await stShareImage(i), file = new File([blob], 'returnly-money-back.png', { type: 'image/png' });
    try { if (navigator.canShare && navigator.canShare({ files: [file] })) { await navigator.share({ files: [file], text: `${money(i.received || 0)} back from ${i.retailer}, thanks to Returnly.` }); return; } } catch (err) { if (err && err.name === 'AbortError') return; }
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'returnly-money-back.png'; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 3000); toast('Saved the image. Add it to your story.');
  }
});
document.addEventListener('keydown', e => { if (e.key === 'Escape' && $('#st-party')) $('#st-party').remove(); });
/* Marking a return as paid: the step saves first, then the celebration covers the screen. */
document.addEventListener('submit', e => {
  if (e.target.id !== 'flow-received-form') return;
  const id = selected, before = find(id) && find(id).status;
  setTimeout(() => { const i = find(id); if (i && i.status === 'received' && before !== 'received') { stCelebrate(i); $('#st-party').dataset.item = i.id; } }, 0);
}, true);

render();
