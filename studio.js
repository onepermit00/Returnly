/* Studio: the redesigned app screens, loaded last. Home, Purchases (History), Returns, Results, Reminders, My vibe and
   Settings are drawn here; the scan and return steps, and the account pages, keep their own markup and pick up studio.css.
   Every button reuses the actions the earlier layers already handle (data-open, data-return, data-keep, data-later,
   data-add, data-view, data-tab, data-menu-go), so the data and its rules stay where they were. */
const renderBeforeStudio = render;
const STUDIO_VIEWS = ['home', 'overview', 'purchases', 'history', 'calendar', 'wallet', 'reminders', 'vibe', 'settings'];
let stWeek = 0, stMoney = 'all';

const ic = (n, cls) => `<svg class="ic${cls ? ' ' + cls : ''}" aria-hidden="true"><use href="assets/icons.svg#${n}"/></svg>`;
const stDays = i => C.days(C.due(i), today());
const stOpen = i => !['started', 'shipped', 'received', 'kept'].includes(i.status) && i.outcome !== 'final' && C.active(i, today());
const stFirst = s => s && s.length > 1 && s[1] === s[1].toLowerCase() ? s[0].toLowerCase() + s.slice(1) : s;
const stShort = d => d ? C.parseDate(d).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) : '';
const stCents = n => money(n).replace(/\.00$/, '');
const stName = () => (typeof welcomeName === 'function' && welcomeName()) || '';

/* The chip on a photo or row: coral for today, lime for three days or fewer, blue once a return is moving. */
function stChip(i) {
  const n = stDays(i);
  if (i.status === 'received') return `<span class="st-tag ok">${stCents(i.received || i.price)} back</span>`;
  if (i.status === 'kept') return '<span class="st-tag off">Kept</span>';
  if (i.status === 'shipped') return '<span class="st-tag go">On its way</span>';
  if (i.status === 'started') return '<span class="st-tag go">Started</span>';
  if (i.outcome === 'final') return '<span class="st-tag off">Final sale</span>';
  if (n === null) return '<span class="st-tag ln">Needs a date</span>';
  if (n < 0) return '<span class="st-tag off">Window closed</span>';
  if (n === 0) return '<span class="st-tag due">Today</span>';
  if (n <= 3) return `<span class="st-tag hot">${n === 1 ? 'Tomorrow' : n + ' days'}</span>`;
  return `<span class="st-tag ln">${n} days</span>`;
}

/* A product photo filling its tile. Without a photo, the store's initial on a warm tile. */
function stPhoto(i) {
  const ok = i.photo && (/^data:image\/(jpeg|png|webp);base64,/i.test(i.photo) || /^\/api\/files\/[0-9a-f-]{36}$/i.test(i.photo));
  if (ok) return `<img src="${esc(i.photo)}" alt="">`;
  if (i.demo) return photo(i);
  return `<span class="st-noimg" aria-hidden="true">${esc((i.retailer || i.name || '?').trim().slice(0, 1).toUpperCase())}</span>`;
}
const stThumb = i => `<span class="st-thumb">${stPhoto(i)}</span>`;
const stHow = i => i.channel === 'store' ? 'in store' : 'by mail';

function stHead(title, right) { return `<header class="st-head"><h1 class="st-d1">${title}</h1>${right || ''}</header>`; }
const stCirc = (icon, attrs, label, dot) => `<button class="st-circ" ${attrs} aria-label="${label}">${ic(icon)}${dot ? '<span class="st-dot"></span>' : ''}</button>`;

/* ---------- Home ---------- */
function stFocusItem() { const list = homeWindows().filter(stOpen); return list.find(i => stDays(i) !== null && stDays(i) >= 0) || list[0] || null; }
function stFocus(t) {
  if (!t) return '';
  const list = homeWindows().filter(stOpen);
  const n = stDays(t), name = esc(stFirst(t.name)), week = list.filter(i => { const d = stDays(i); return d !== null && d >= 0 && d <= 7; }).length;
  const title = n === 0 ? `Send the ${name} <em>back today.</em>` : n === 1 ? `Send the ${name} <em>back tomorrow.</em>` : n === null ? `When does the ${name} <em>go back?</em>` : `${n} days left on the <em>${name}.</em>`;
  const sub = n === null ? 'Add the return window and we’ll count it down.' : `${stCents(t.price)} back · ${t.channel === 'store' ? 'take it to the store' : 'send it'} by ${esc(stShort(C.due(t)))}`;
  const dots = Math.min(Math.max(week, 1), 4);
  return `<article class="st-focus${t.photo || t.demo ? '' : ' plain'}">
  <div class="st-focus-ph">${stPhoto(t)}</div>
  <div class="st-focus-top">${stChip(t).replace('>Today<', '>Due today<')}${week > 1 ? `<span class="st-dots" aria-label="${week} due this week">${Array.from({ length: dots }, (_, k) => `<i class="${k ? '' : 'on'}"></i>`).join('')}</span>` : ''}</div>
  <div class="st-focus-panel">
    <span class="st-k dk">Today’s one thing · ${esc(t.retailer)}</span>
    <h2 class="st-d2">${title}</h2>
    <p>${sub}</p>
    <div class="st-acts"><button class="st-pill w sm" data-return="${esc(t.id)}">Start return ${ic('i-arrow', 's')}</button><button class="st-pill gdk sm" data-keep="${esc(t.id)}">Keep it</button><button class="st-pill gdk sm icon" data-later="${esc(t.id)}" aria-label="Decide later">${ic('i-clock', 's')}</button></div>
  </div>
</article>`;
}

function stHomeEmpty() {
  return `<div class="st-fan" aria-hidden="true"><span></span><span></span><span><b>30 days</b></span></div>
<div class="st-center"><h2 class="st-d1">Your first return <em>starts here.</em></h2><p class="st-m">Add one purchase. We’ll find its return window and remind you before it closes.</p></div>
<div class="st-list">
  <button class="st-li" data-add><span class="st-circ flat">${ic('i-scan')}</span><span class="st-grow">Scan a receipt<small>Paper, screenshot or PDF</small></span>${ic('i-chev', 'chev')}</button>
  <button class="st-li" data-menu-go="email-import"><span class="st-circ flat">${ic('i-mail')}</span><span class="st-grow">Forward an order email<small>We’ll add it to History for you</small></span>${ic('i-chev', 'chev')}</button>
  <button class="st-li" data-add><span class="st-circ flat">${ic('i-edit')}</span><span class="st-grow">Add it by hand<small>Store, price and date</small></span>${ic('i-chev', 'chev')}</button>
</div>`;
}

function stProd(i) {
  return `<button class="st-prod" data-open="${esc(i.id)}"><span class="st-ph">${stPhoto(i)}${stChip(i)}</span><span class="st-k">${esc(i.retailer)} · ${i.channel === 'store' ? 'In store' : 'Online'}</span><b>${esc(i.name)}</b><span class="st-p">${i.status === 'received' ? stCents(i.received || i.price) + ' back' : money(i.price)}</span></button>`;
}

function stHome() {
  const s = homeStats(), mine = items.filter(i => !i.demo).length, top = stFocusItem(), focus = stFocus(top);
  const open = homeWindows().filter(stOpen), week = open.filter(i => { const d = stDays(i); return d !== null && d >= 0 && d <= 7; }).length;
  const shipped = items.filter(i => i.status === 'shipped'), pending = shipped.reduce((n, i) => n + (Number(i.price) || 0), 0);
  const paid = items.filter(i => i.status === 'received').length;
  const rest = open.filter(i => i !== top).slice(0, 8);
  const date = new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  const head = `<header class="st-head st-homehead"><button class="st-me" data-view="settings" aria-label="Open my settings"><span class="st-ava">${avatarInner()}</span><span class="st-hi"><span class="st-k">${esc(date)}</span><b>Hi${stName() ? ', ' + esc(stName()) : ' there'}</b></span></button><div class="st-r">${stCirc('i-search', 'data-view="overview"', 'Search purchases')}${stCirc('i-bell', 'data-view="reminders"', 'Reminders', week > 0)}</div></header>`;
  if (!mine && !items.length) return `<section class="st st-home">${head}${stHomeEmpty()}</section>`;
  const missed = items.filter(i => i.intent === 'return' && !['started', 'shipped', 'received', 'kept'].includes(i.status) && stDays(i) !== null && stDays(i) < 0).length;
  const done = items.filter(i => ['shipped', 'received'].includes(i.status)).length;
  return `<section class="st st-home">${head}
${focus || `<article class="st-calm"><span class="st-k">All caught up</span><h2 class="st-d2">Nothing is due. <em>Enjoy your things.</em></h2><p class="st-m">We’ll tell you when a return window is about to close.</p><button class="st-pill b sm" data-add>${ic('i-scan', 's')}Scan a receipt</button></article>`}
<div class="st-3"><button data-view="overview"><b class="st-n">${stCents(Math.round(s.tracked))}</b><span>still in your window</span></button><button data-view="calendar"><b class="st-n">${week}</b><span>due this week</span></button><button data-view="wallet"><b class="st-n">${shipped.length}</b><span>money on its way</span></button></div>
${rest.length ? `<div class="st-sec"><h3 class="st-d2">Due <em>soonest</em></h3><button class="st-count" data-view="calendar">${open.length}</button></div><div class="st-hs">${rest.map(stProd).join('')}</div>` : ''}
<article class="st-money"><span class="st-coins" aria-hidden="true"><i></i><i></i></span><span class="st-k dk">Money back so far</span><p class="st-n">${money(s.saved)}</p><div class="st-prog"><i style="width:${s.saved + pending ? Math.round(100 * s.saved / (s.saved + pending)) : 0}%"></i></div><p class="st-sm">${paid} return${paid === 1 ? '' : 's'} paid out${pending ? ' · ' + money(pending) + ' on its way' : ''}</p><button class="st-pill w sm" data-view="wallet">See results ${ic('i-right', 's')}</button></article>
${done ? `<article class="st-card st-streak"><div class="st-sb"><span class="st-k">${missed ? 'Returns sent on time' : 'No missed windows'}</span><b>${done} in a row</b></div><div class="st-meter">${Array.from({ length: 6 }, (_, k) => `<i class="${k < Math.min(done, 6) ? 'on' : k === Math.min(done, 6) && focus ? 'hot' : ''}"></i>`).join('')}</div>${focus ? '<p class="st-m">Send today’s return to keep it going.</p>' : ''}</article>` : ''}
</section>`;
}

/* ---------- Purchases (History tab) ---------- */
function stGroups(list) {
  const g = { week: [], later: [], moving: [], done: [] };
  for (const i of list) {
    const n = stDays(i);
    if (['started', 'shipped'].includes(i.status)) g.moving.push(i);
    else if (['received', 'kept'].includes(i.status) || i.outcome === 'final' || (n !== null && n < 0)) g.done.push(i);
    else if (n !== null && n <= 7) g.week.push(i);
    else g.later.push(i);
  }
  g.week = sorted(g.week); g.later = sorted(g.later);
  g.done.sort((a, b) => String(b.returnedOn || b.purchased).localeCompare(String(a.returnedOn || a.purchased)));
  return [['Due this week', g.week], ['Later', g.later], ['In progress', g.moving], ['Done', g.done]].filter(x => x[1].length);
}

function stPurchases() {
  const q = galleryQuery.toLowerCase();
  let list = items.filter(i => galleryFilter === 'progress' ? ['started', 'shipped'].includes(i.status) : galleryFilter === 'received' ? i.status === 'received' : galleryFilter === 'kept' ? i.status === 'kept' : true);
  list = list.filter(i => (i.name + ' ' + i.retailer).toLowerCase().includes(q));
  const undecided = items.filter(i => stOpen(i) && i.intent !== 'return').length;
  const seg = [['all', 'All'], ['progress', 'In progress'], ['received', 'Returned']].map(([id, l]) => `<button data-gallery="${id}" class="${galleryFilter === id ? 'on' : ''}">${l}</button>`).join('');
  const body = !items.length
    ? `<div class="st-emptycard"><div class="st-fan sm" aria-hidden="true"><span></span><span class="plus">${ic('i-plus')}</span><span></span></div><h2 class="st-d2">Your next purchase <em>belongs here.</em></h2><p class="st-m">Scan the receipt and its photo, store and deadline fill in for you.</p><button class="st-pill b sm" data-add>${ic('i-scan', 's')}Scan a receipt</button></div>`
    : !list.length ? `<p class="st-m st-none">Nothing matches${q ? ' “' + esc(galleryQuery) + '”' : ''}.</p>`
    : stGroups(list).map(([h, l]) => `<div class="st-sec"><h3 class="st-k">${h}</h3><span class="st-m sm">${l.length} item${l.length === 1 ? '' : 's'}</span></div><div class="st-grid">${l.map(stProd).join('')}</div>`).join('');
  return `<section class="st st-purchases">
${stHead(`Purchases <span class="st-count">${items.length}</span>`, stCirc('i-plus', 'data-add', 'Add a purchase'))}
${items.length ? `<label class="st-search">${ic('i-search')}<input id="st-search" type="search" placeholder="Search stores or items" value="${esc(galleryQuery)}" autocomplete="off"></label>
<div class="st-seg">${seg}</div>
<div class="st-chips"><button class="st-chip" data-view="calendar">${ic('i-cal', 's')}Return dates</button><button class="st-chip" data-view="wallet">${ic('i-card', 's')}Money back</button><button class="st-chip" data-menu-go="history-log">${ic('i-list', 's')}Your story</button>${undecided ? `<span class="st-chip quiet">${undecided} to decide</span>` : ''}</div>` : ''}
${body}
</section>`;
}

/* ---------- Returns (calendar) ---------- */
function stWeekStart() { const d = C.parseDate(today()); d.setDate(d.getDate() - (d.getDay() + 6) % 7 + 7 * stWeek); return C.iso(d); }
function stRow(i, lead) {
  const d = C.due(i), n = stDays(i);
  const sub = i.status === 'started' ? (i.channel === 'store' ? 'Take it to the store' : 'Drop-off planned') : i.status === 'shipped' ? 'Sent back · waiting on the money' : `${i.outcome === 'credit' ? stCents(i.price) + ' credit' : stCents(i.price) + ' back'} · ${stHow(i)}`;
  return `<button class="st-row" data-open="${esc(i.id)}">${lead === false ? '' : `<span class="st-date"><span class="st-k">${n === 0 ? 'Today' : d ? C.parseDate(d).toLocaleDateString('en-US', { weekday: 'short' }) : '—'}</span><b>${d ? C.parseDate(d).getDate() : '?'}</b></span>`}${stThumb(i)}<span class="st-grow"><span class="st-k">${esc(i.retailer)}</span><b>${esc(i.name)}</b><small>${sub}</small></span>${stChip(i)}</button>`;
}
function stCalendar() {
  const start = stWeekStart(), days = Array.from({ length: 7 }, (_, k) => C.shift(start, k)), t = today();
  const live = items.filter(i => !['received', 'kept'].includes(i.status) && i.outcome !== 'final' && C.due(i) && (i.status === 'shipped' || stDays(i) >= 0));
  const dot = d => { const l = live.filter(i => C.due(i) === d && i.status !== 'shipped'); if (!l.length) return ''; const n = C.days(d, t); return `<i class="${n === 0 ? 'd' : n <= 3 ? 'h' : ''}"></i>`; };
  const strip = days.map(d => { const x = C.parseDate(d); return `<button data-date="${d}" class="${(calendarDay || t) === d ? 'on' : ''}${d === t ? ' now' : ''}"><span class="st-k">${x.toLocaleDateString('en-US', { weekday: 'short' })}</span><b>${x.getDate()}</b><u>${dot(d)}</u></button>`; }).join('');
  const end = days[6], first = C.parseDate(start), last = C.parseDate(end);
  const range = first.getMonth() === last.getMonth() ? first.toLocaleDateString('en-US', { month: 'long' }) : `${first.toLocaleDateString('en-US', { month: 'long' })} – ${last.toLocaleDateString('en-US', { month: 'long' })}`;
  const open = sorted(live.filter(i => i.status !== 'shipped'));
  let body;
  if (calendarDay) {
    const l = open.filter(i => C.due(i) === calendarDay);
    body = `<div class="st-sec"><h3 class="st-d2">${esc(stShort(calendarDay))}</h3><button class="st-link" id="clear-calendar-day">Show all</button></div>${l.length ? `<div class="st-rows">${l.map(i => stRow(i)).join('')}</div>` : '<p class="st-m st-none">Nothing is due that day.</p>'}`;
  } else {
    const wk = open.filter(i => C.due(i) >= start && C.due(i) <= end), later = open.filter(i => C.due(i) > end);
    const total = wk.reduce((n, i) => n + (Number(i.price) || 0), 0);
    const months = {};
    for (const i of later) { const k = C.due(i).slice(0, 7); (months[k] = months[k] || []).push(i); }
    body = `<div class="st-sec"><h3 class="st-d2">${stWeek === 0 ? 'This <em>week</em>' : stWeek === 1 ? 'Next <em>week</em>' : 'That <em>week</em>'}</h3>${wk.length ? `<span class="st-count">${money(total)} to send back</span>` : ''}</div>
${wk.length ? `<div class="st-rows">${wk.map(i => stRow(i)).join('')}</div>` : '<p class="st-m st-none">Nothing is due this week.</p>'}
${Object.entries(months).map(([k, l]) => `<div class="st-sec"><h3 class="st-d2">Later in <em>${C.parseDate(k + '-01').toLocaleDateString('en-US', { month: 'long' })}</em></h3><span class="st-m sm">${l.length} item${l.length === 1 ? '' : 's'}</span></div><div class="st-rows">${l.map(i => stRow(i)).join('')}</div>`).join('')}`;
  }
  const calOk = items.some(i => C.calendar(i, t, settings.time));
  return `<section class="st st-cal">
${stHead('Time to <em>return.</em>', stCirc('i-back', 'data-tab="overview"', 'Back to purchases'))}
<div class="st-sb"><b class="st-range">${range}</b><div class="st-r"><button class="st-circ flat sm" data-st-week="-1" aria-label="Previous week">${ic('i-back', 's')}</button><button class="st-circ flat sm" data-st-week="1" aria-label="Next week">${ic('i-chev', 's')}</button></div></div>
<div class="st-week">${strip}</div>
${body}
${calOk ? `<button class="st-pill g sm" id="st-calendar-all">${ic('i-cal', 's')}Add all to my calendar</button>` : ''}
</section>`;
}

/* ---------- Results (wallet) ---------- */
function stWallet() {
  const r = resultValues(), shipped = items.filter(i => i.status === 'shipped'), started = items.filter(i => i.status === 'started');
  const pending = shipped.reduce((n, i) => n + (Number(i.price) || 0), 0), total = r.refund + r.credit;
  const back = items.filter(i => i.status === 'received' && (stMoney === 'all' || i.outcome === stMoney)).sort((a, b) => String(b.returnedOn || '').localeCompare(String(a.returnedOn || '')));
  const moving = [...shipped, ...started];
  const stage = i => i.status === 'started' ? 2 : 3;
  const track = i => { const s = stage(i); return `<div class="st-track">${[1, 2, 3, 4].map(k => `<i class="${k <= s ? 'on' : ''}"></i>`).join('')}</div><div class="st-trackl">${['Decided', 'Started', i.channel === 'store' ? 'Dropped off' : 'Sent', 'Money back'].map((l, k) => `<span class="${k < s ? 'on' : ''}">${l}</span>`).join('')}</div>`; };
  return `<section class="st st-wallet">
${stHead('Get it <em>back.</em>', stCirc('i-back', 'data-tab="overview"', 'Back to purchases'))}
<article class="st-vault"><svg class="st-spark" viewBox="0 0 120 54" aria-hidden="true"><path d="M2 48 L26 46 L46 40 L66 30 L86 26 L106 10 L118 8 L118 54 L2 54Z" fill="rgba(217,228,75,.18)"/><path d="M2 48 L26 46 L46 40 L66 30 L86 26 L106 10 L118 8" fill="none" stroke="#d9e44b" stroke-width="2"/><circle cx="118" cy="8" r="3.5" fill="#d9e44b"/></svg>
  <div><span class="st-k dk">Money back in ${new Date().getFullYear()}</span><p class="st-n">${money(total)}</p></div>
  <div class="st-trio"><div><b>${money(r.refund)}</b><span class="st-k dk">Refunds</span></div><div><b>${money(r.credit)}</b><span class="st-k dk">Store credit</span></div><div><b>${money(pending)}</b><span class="st-k dk">On its way</span></div></div>
</article>
${moving.length ? `<div class="st-sec"><h3 class="st-d2">On its <em>way</em></h3></div>${moving.map(i => `<article class="st-card st-moving"><div class="st-rowi">${stThumb(i)}<span class="st-grow"><span class="st-k">${esc(i.retailer)} · ${i.channel === 'store' ? 'In store' : 'By mail'}</span><b>${esc(i.name)}</b><small>${money(i.price)} expected</small></span></div>${track(i)}<button class="st-pill b sm" data-open="${esc(i.id)}">${i.status === 'started' ? (i.channel === 'store' ? 'I dropped it off' : 'I sent it') : 'Mark as paid'}</button></article>`).join('')}` : ''}
<div class="st-seg">${[['all', 'All'], ['refund', 'Refunds'], ['credit', 'Credit']].map(([id, l]) => `<button data-st-money="${id}" class="${stMoney === id ? 'on' : ''}">${l}</button>`).join('')}</div>
<div class="st-sec"><h3 class="st-d2">Back in your <em>pocket</em></h3></div>
${back.length ? `<div class="st-rows">${back.map(i => `<button class="st-row money" data-open="${esc(i.id)}">${stThumb(i)}<span class="st-grow"><span class="st-k">${esc(i.retailer)}</span><b>${esc(i.name)}</b><small>${i.outcome === 'credit' ? 'Store credit' : 'Refunded'}${i.returnedOn ? ' · ' + esc(stShort(i.returnedOn)) : ''}</small></span><span class="st-n">${money(i.received || 0)}</span></button>`).join('')}</div>` : `<p class="st-m st-none">When a refund or store credit arrives, mark it paid and it shows up here.</p>`}
<button class="st-li" id="export-csv">${ic('i-down')}<span class="st-grow">Export your records<small>A spreadsheet of every purchase</small></span>${ic('i-chev', 'chev')}</button>
</section>`;
}

/* ---------- Reminders ---------- */
function stReminders() {
  const r = ReturnlyNudge.compose(items, today(), { gentle: !!settings.gentle, examples: true, vibe: settings.vibe });
  const time = settings.time || '09:00', perm = 'Notification' in window ? Notification.permission : 'unavailable';
  const on = !!settings.notifications && perm === 'granted';
  const emailOn = typeof emailPrefs !== 'undefined' && emailPrefs.available && (emailPrefs.daily || emailPrefs.unopened);
  const emailOk = typeof emailPrefs !== 'undefined' && emailPrefs.available;
  const clock = t => { const [h, m] = t.split(':').map(Number); return `${(h % 12) || 12}:${String(m).padStart(2, '0')}`; };
  const presets = [['09:00', 'Morning'], ['12:30', 'Lunch'], ['19:00', 'Evening']];
  const custom = !presets.some(p => p[0] === time);
  const qs = typeof validClock === 'function' && validClock(settings.quietStart) ? settings.quietStart : '', qe = typeof validClock === 'function' && validClock(settings.quietEnd) ? settings.quietEnd : '';
  return `<section class="st st-remind">
<div class="st-lock"><p class="st-lock-t">${clock(time)}</p><p class="st-lock-d">Every day at ${esc(time)}</p>
  <div class="st-notif"><span class="st-appi">R.</span><div class="st-sb"><span>Returnly</span><span>${esc(clock(time))}</span></div><b>${esc(r ? r.title : 'Your next return, remembered.')}</b><p>${esc(r ? r.body : 'Add a purchase to see your countdown here.')}</p></div>
</div>
<div class="st-g6"><h1 class="st-d1">Your daily <em>nudge.</em></h1><p class="st-m">One a day while a return is open. It stops when it’s sent, kept or closed.</p></div>
<div class="st-g8"><span class="st-k">Remind me</span><div class="st-times">${presets.map(([v, l]) => `<button data-st-time="${v}" class="${time === v ? 'on' : ''}">${l}<small>${clock(v)}</small></button>`).join('')}<label class="${custom ? 'on' : ''}">Pick<small>${custom ? clock(time) : 'a time'}</small><input type="time" id="st-time" value="${esc(time)}" aria-label="Pick a reminder time"></label></div></div>
<div class="st-list">
  <button class="st-li" id="enable-notifications">${ic('i-bell')}<span class="st-grow">Notifications<small>${on ? 'On, even when Returnly is closed · tap to test' : perm === 'denied' ? 'Blocked in your browser settings' : 'Turn on to get your nudge'}</small></span><span class="st-switch${on ? ' on' : ''}" aria-hidden="true"></span></button>
  <form id="reminder-extra-form" class="st-form">
    <label class="st-li">${ic('i-mail')}<span class="st-grow">Email me too<small>${emailOk ? 'Only 3 days before, if I miss the nudge' : 'Email isn’t set up yet'}</small></span><input type="checkbox" name="email" class="st-sw" ${emailOn ? 'checked' : ''} ${emailOk ? '' : 'disabled'}></label>
    <label class="st-li">${ic('i-flame')}<span class="st-grow">Fewer nudges<small>Halfway, then 7, 3 and 1 days before</small></span><input type="checkbox" name="gentle" class="st-sw" ${settings.gentle ? 'checked' : ''}></label>
    <div class="st-li st-quietrow">${ic('i-moon')}<span class="st-grow">Quiet hours<small>No reminders between these times</small></span><span class="st-quiet"><input type="time" name="quietStart" value="${esc(qs)}" aria-label="Quiet hours from"><i>–</i><input type="time" name="quietEnd" value="${esc(qe)}" aria-label="Quiet hours until"></span></div>
  </form>
  <button class="st-li" data-view="vibe">${ic('i-vibe')}<span class="st-grow">Voice<small>${esc(ReturnlyNudge.VOICES[ReturnlyNudge.vibeOf(settings.vibe).voice].name)}</small></span>${ic('i-chev', 'chev')}</button>
</div>
</section>`;
}

/* ---------- My vibe ---------- */
const stVoiceColor = { bestie: 'v1', bro: 'v2', straight: 'v3', comedian: 'v4', supportive: 'v5', assistant: 'v6' };
function stVibe() {
  const v = VibeN.vibeOf(settings.vibe), r = VibeN.compose(items, today(), { gentle: !!settings.gentle, examples: true, vibe: settings.vibe });
  const short = { none: 'None', little: 'A little', lots: 'Bring it', gentle: 'Gentle', firm: 'Firm', direct: 'Direct', few: 'A few' };
  const emojiShort = { none: 'None', few: 'A few', lots: 'Love them' };
  return `<section class="st st-vibe">
<div class="st-g6"><h1 class="st-d1">Pick your <em>voice.</em></h1><p class="st-m">Tap one. Change it whenever your mood does.</p></div>
<div class="st-vlist" role="radiogroup" aria-label="Choose your voice">${vibeVoices.map(([id, desc]) => `<label class="st-vrow${v.voice === id ? ' on' : ''}"><input type="radio" name="vibe-voice" value="${id}"${v.voice === id ? ' checked' : ''}><span class="st-vsw ${stVoiceColor[id]}">${esc(VibeN.VOICES[id].name.replace(/^The /, '').slice(0, 1))}</span><span class="st-grow"><b>${esc(VibeN.VOICES[id].name)}</b><small>${esc(desc.replace(/\.$/, ''))}</small></span><span class="st-radio" aria-hidden="true"></span></label>`).join('')}</div>
<div class="st-g8"><span class="st-k">Your next nudge will say</span><p class="st-bubble"><b>${esc(r ? r.title : 'Your next return, remembered.')}</b> ${esc(r ? r.body : '')}</p></div>
${vibeTunes.map(([key, label, opts]) => `<div class="st-g8"><span class="st-k">${key === 'style' ? 'Close to a deadline' : label}</span><div class="st-seg" role="radiogroup" aria-label="${label}">${opts.map(([val, text]) => `<label class="${v[key] === val ? 'on' : ''}"><input type="radio" name="vibe-${key}" value="${val}"${v[key] === val ? ' checked' : ''} aria-label="${esc(text)}">${key === 'emoji' ? emojiShort[val] : short[val]}</label>`).join('')}</div></div>`).join('')}
<p class="st-m sm">Your voice is used for every reminder: notifications, emails and the Reminders preview. Dates, amounts and next steps never change.</p>
</section>`;
}

/* ---------- Settings ---------- */
function stSettings() {
  const r = resultValues(), user = Account.user();
  const done = items.filter(i => ['shipped', 'received'].includes(i.status));
  const missed = items.filter(i => i.intent === 'return' && !['started', 'shipped', 'received', 'kept'].includes(i.status) && stDays(i) !== null && stDays(i) < 0).length;
  const onTime = done.length + missed ? Math.round(100 * done.length / (done.length + missed)) + '%' : '—';
  const row = (icon, label, attrs, val) => `<button class="st-li" ${attrs}>${ic(icon)}<span class="st-grow">${label}</span>${val ? `<span class="st-val">${val}</span>` : ''}${ic('i-chev', 'chev')}</button>`;
  return `<section class="st st-settings">
<div class="st-prof">${editableAvatar()}<h1 class="st-d1">${esc(stName() || 'You')}</h1>${user ? `<p class="st-m sm">${esc(user.email)}</p>` : ''}</div>
<div class="st-stats3"><div><b>${r.returned}</b><span class="st-k">Returned</span></div><div><b>${stCents(Math.round(r.refund + r.credit))}</b><span class="st-k">Back</span></div><div><b>${onTime}</b><span class="st-k">On time</span></div></div>
<button class="st-promo" data-menu-go="email-import"><span class="st-k dk">Add purchases from email</span><span class="st-d2">Forward a receipt. <em>We’ll do the rest.</em></span><span class="st-pill w sm">${ic('i-mail', 's')}Set it up</span><span class="st-env" aria-hidden="true"></span></button>
<div class="st-grp"><span class="st-k">Preferences</span><div class="st-list">${row('i-bell', 'Reminders', 'data-view="reminders"', esc(settings.time || '09:00'))}${row('i-vibe', 'My vibe', 'data-view="vibe"', esc(VibeN.VOICES[VibeN.vibeOf(settings.vibe).voice].name))}</div></div>
<div class="st-grp"><span class="st-k">Account</span><div class="st-list">${row('i-user', 'My profile', 'data-menu-go="my-profile"')}${row('i-shield', 'Security and privacy', 'data-menu-go="privacy"')}${row('i-doc', 'Terms of service', 'data-menu-go="terms"')}${user && user.admin ? row('i-list', 'Policy review', 'data-menu-go="policy-review"') : ''}</div></div>
<div class="st-grp"><span class="st-k">Help</span><div class="st-list">${row('i-chat', 'Support', 'data-menu-go="support"')}${menuPages['returns-101'] ? row('i-help', 'Returns 101', 'data-menu-go="returns-101"') : ''}</div></div>
<a class="sign-out st-signout" href="index.html">${ic('i-out', 's')}Sign out</a>
<p class="st-m sm st-center">Your purchases stay saved in your account.</p>
</section>`;
}

/* ---------- Tab bar ---------- */
function stTabs() {
  const bar = $('#tab-bar');
  if (!bar || bar.dataset.studio) return;
  bar.dataset.studio = '1';
  bar.className = 'tab-bar st-tabbar';
  const t = (v, label, i, f) => `<button type="button" data-tab="${v}" aria-label="${label}">${ic(i, 'off-i')}${ic(f, 'on-i')}<span>${label}</span></button>`;
  bar.innerHTML = `<div class="st-bar">${t('home', 'Home', 'i-home', 'f-home')}${t('overview', 'History', 'i-hist', 'f-hist')}<button type="button" data-tab="scan" class="st-scan" aria-label="Scan a receipt">${ic('i-scan')}</button>${t('reminders', 'Reminders', 'i-bell', 'f-bell')}${t('vibe', 'My vibe', 'i-vibe', 'f-vibe')}</div>`;
}

render = function () {
  const studio = STUDIO_VIEWS.includes(view);
  document.body.classList.add('studio');
  document.body.classList.toggle('st-page', studio);
  if (!studio) { renderBeforeStudio(); stTabs(); syncTabs(); return; }
  if (typeof stopJourneyCamera === 'function') stopJourneyCamera();
  document.body.classList.remove('flow-active', 'home-active');
  if (typeof ensureMenuChrome === 'function') ensureMenuChrome();
  const fp = $('#flow-profile'); if (fp) fp.hidden = true;
  const page = view === 'home' ? stHome() : view === 'calendar' ? stCalendar() : view === 'wallet' ? stWallet() : view === 'reminders' ? stReminders() : view === 'vibe' ? stVibe() : view === 'settings' ? stSettings() : stPurchases();
  $('#main').innerHTML = page;
  syncHomeProfile();
  stTabs(); syncTabs();
};

document.addEventListener('click', e => {
  const b = e.target.closest('button');
  if (!b) return;
  if (b.dataset.stWeek) { stWeek += Number(b.dataset.stWeek); calendarDay = null; render(); }
  if (b.dataset.stMoney) { stMoney = b.dataset.stMoney; render(); }
  if (b.dataset.stTime) { settings.time = b.dataset.stTime; save(); render(); toast(`Your nudge comes at ${b.dataset.stTime}.`); }
  if (b.id === 'st-calendar-all') {
    const parts = items.map(i => C.calendar(i, today(), settings.time)).filter(Boolean);
    if (!parts.length) { toast('Confirm a return window first.'); return; }
    const events = parts.map(s => s.slice(s.indexOf('BEGIN:VEVENT'), s.lastIndexOf('END:VCALENDAR'))).join('');
    download('returnly-returns.ics', 'BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//Returnly//Return reminders//EN\r\nCALSCALE:GREGORIAN\r\n' + events + 'END:VCALENDAR\r\n', 'text/calendar');
    toast('Every return date is in one calendar file.');
  }
});
document.addEventListener('change', e => {
  if (e.target.id !== 'st-time') return;
  const v = e.target.value;
  if (!/^\d{2}:\d{2}$/.test(v)) return;
  settings.time = v; save(); render(); toast(`Your nudge comes at ${v}.`);
});
// Search keeps the keyboard up: only the results are redrawn, then the caret goes back where it was.
document.addEventListener('input', e => {
  if (e.target.id !== 'st-search') return;
  galleryQuery = e.target.value;
  const pos = e.target.selectionStart;
  render();
  const s = $('#st-search'); if (s) { s.focus(); try { s.setSelectionRange(pos, pos); } catch {} }
});

render();
