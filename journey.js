/* Journey: the redesigned return steps, loaded after moments.js. Scan (Returnly Lens), Item ("Which ones are going back?"),
   Return and Get paid on one purchase page with a photo header, the nearest drop-off on a map, Your story (everything you've
   returned and kept) and the monthly recap. The markup is new; the ids, data attributes and form names are the ones guided.js,
   klarna.js and features.js already handle, so receipts, policies, labels and payments keep working the same way. */
const renderBeforeJourneyStudio = render;
const JOURNEY_VIEWS = ['dropoff', 'story'];
const RECAP_SEEN = 'returnly-recap-seen-v1';
let stPaid = { open: false, kind: 'refund', amount: '' }, stOpenRow = '', stDrop = { id: '', way: -1, state: '', places: [], here: null, note: '' };

const stSteps = (n, light) => `<div class="st-steps4${light ? ' lt' : ''}" aria-hidden="true">${[1, 2, 3, 4].map(k => `<i class="${k <= n ? 'on' : ''}"></i>`).join('')}</div>`;
const stStepHead = (n, label) => `<header class="st-sb st-stephead"><button class="st-circ flat" id="flow-back" aria-label="Go back">${ic('i-back')}</button><span class="st-m sm">${n} of 4 · ${label}</span><span class="st-gap"></span></header>${stSteps(n, true)}`;
const stLogo = s => { const w = (s || '?').replace(/[^A-Za-z0-9&]/g, '').toUpperCase() || '?'; return `<span class="st-lw${w.length > 4 ? ' l' : ''}">${esc(w.slice(0, 6))}</span>`; };
const stLong = d => { const x = C.parseDate(d); return `${x.toLocaleDateString('en-US', { weekday: 'long' })}, <em>${x.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}</em>`; };
const stMonthDay = d => d ? C.parseDate(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '';

/* ---------- Step 1: Scan (Returnly Lens) ---------- */
uploadPage = function () {
  return `<section class="st st-lens">
<header class="st-sb"><button class="st-circ" id="flow-back" aria-label="Close">${ic('i-x')}</button><span class="st-brand">Returnly <em>Lens</em></span><button class="st-circ dk" data-menu-go="returns-101" aria-label="How returns work">${ic('i-help')}</button></header>
<div class="st-g8">${stSteps(1)}<div class="st-sb st-lens-l"><span>1 of 4 · Scan</span><span>Item · Return · Get paid</span></div></div>
<div class="st-frame"><video id="flow-video" autoplay muted playsinline aria-label="Receipt camera preview"></video><span class="cn a"></span><span class="cn b"></span><span class="cn c"></span><span class="cn d"></span>
  <div class="st-lens-msg"><p class="camera-message" id="camera-message">Allow camera access, or upload a receipt.</p><button class="st-pill gdk sm" id="flow-camera-start">${ic('i-cam', 's')}Try the camera</button></div>
</div>
<div class="st-tips"><p>Whole receipt in view · Flat · Good light</p><span>Long receipt? Scan it in parts, up to 4 pages.</span></div>
<div class="st-shutter"><label for="flow-receipt" tabindex="0" role="button" aria-label="Upload a receipt"><span class="round">${ic('i-img')}</span><small>Upload</small></label><button class="st-shoot" id="flow-shutter" disabled aria-label="Take receipt photo"></button><button data-menu-go="email-import" aria-label="Add purchases from email"><span class="round">${ic('i-mail')}</span><small>From email</small></button></div>
<input id="flow-receipt" type="file" accept="image/jpeg,image/png,image/webp,application/pdf" multiple hidden>
<p class="flow-status" role="alert">${esc(journey.error)}</p>
</section>`;
};

/* While the receipt is read: the scan line and shimmering rows where the items will appear. */
const readingStateBefore = readingState;
readingState = function (on) {
  readingStateBefore(on);
  const lens = $('.st-lens'); if (!lens) return;
  let r = $('#st-reading');
  if (!on) { if (r) r.remove(); return; }
  if (r) return;
  lens.insertAdjacentHTML('beforeend', `<div class="st-readingpage" id="st-reading" role="status">
${stSteps(2, true)}<span class="st-m sm">2 of 4 · Item</span>
<div class="st-reading"><span class="st-scanline"></span>${[70, 54, 62, 40, 58].map(w => `<i style="width:${w}%"></i>`).join('')}</div>
<div class="st-g6 st-center"><h2 class="st-d2">Reading your <em>receipt…</em></h2><p class="st-m sm">Store, date and items. About five seconds.</p></div>
<div class="st-g12">${[70, 60].map(w => `<div class="st-r"><span class="st-skel st-skelthumb"></span><span class="st-grow st-g6"><span class="st-skel" style="width:${w}%"></span><span class="st-skel" style="width:${w - 30}%"></span></span></div>`).join('')}</div>
</div>`);
};

/* ---------- Step 2: Item ---------- */
reviewPage = function () {
  if (!draft.products.length) draft.products.push({ ...blankProduct(), intent: 'return' });
  const many = draft.products.length > 1;
  if (!many) draft.products[0].intent = 'return';
  const picked = draft.products.filter(p => p.intent === 'return').length;
  const when = draft.purchased ? C.parseDate(draft.purchased).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '';
  const meta = [draft.retailer, when, draft.orderNumber ? 'Order ' + draft.orderNumber : ''].filter(Boolean).map(esc).join(' · ');
  const store = draft.retailer ? `<p class="st-m sm">${meta}</p>` : `<div class="st-storeline"><label><span class="st-k">Store</span><input name="retailer" maxlength="80" placeholder="Where did you buy it?" value="" autocomplete="off"></label><label><span class="st-k">Bought</span><input name="purchased" type="date" max="${today()}" value="${esc(draft.purchased || today())}"></label></div>`;
  const rows = draft.products.map((p, n) => `<li class="st-found-i${p.intent === 'return' ? ' on' : ''}">
  <label class="st-thumb st-fphoto" for="flow-photo-${n}" tabindex="0" role="button" aria-label="${p.photo ? 'Change' : 'Add'} photo for item ${n + 1}">${p.photo || p.demo ? photo(p) : ic('i-cam')}</label><input type="file" id="flow-photo-${n}" data-flow-photo="${n}" accept="image/*" hidden>
  <span class="st-g2 st-grow"><textarea class="st-fname" name="name-${n}" aria-label="Item ${n + 1} name" required maxlength="100" rows="1" placeholder="Item name">${esc(p.name)}</textarea><span class="st-fprice"><span aria-hidden="true">$</span><input name="price-${n}" aria-label="Item ${n + 1} price paid" type="number" inputmode="decimal" min="0" max="100000" step="0.01" required value="${esc(p.price ?? '')}" placeholder="0.00"><small>· Qty 1</small></span></span>
  ${many ? `<button type="button" class="st-check${p.intent === 'return' ? '' : ' off'}" data-flow-choice="${n}" aria-pressed="${p.intent === 'return'}" aria-label="Send the ${esc(p.name || 'item ' + (n + 1))} back">${ic('i-check')}</button>` : `<span class="st-check" aria-hidden="true">${ic('i-check')}</span>`}
</li>`).join('');
  const noPhoto = draft.products.some(p => !p.photo && !p.demo);
  return `<section class="st st-flow st-item"><form id="flow-item-form" class="st-g20" novalidate>
${stStepHead(2, 'Item')}
<div class="st-g6"><h1 class="st-d1">${many ? 'Which ones are <em>going back?</em>' : 'Is this the one <em>going back?</em>'}</h1>${store}</div>
<ul class="st-found">${rows}<li><button type="button" class="st-found-i add" data-st-add-item><span class="st-thumb">${ic('i-plus')}</span><span class="st-g2 st-grow"><b>Add an item we missed</b><small class="st-m sm">Name and price</small></span></button></li></ul>
${noPhoto ? `<div class="st-card st-g6"><div class="st-r">${ic('i-spark')}<b>Add a photo of each item</b></div><p class="st-m sm">Tap the camera square. It’s how you’ll spot it in History later.</p></div>` : ''}
<p class="flow-status" role="alert">${esc(journey.error)}</p>
<div class="st-dock"><button class="st-pill b">${picked ? `Continue with ${picked} item${picked === 1 ? '' : 's'}` : `Keep ${many ? 'all ' + draft.products.length : 'it'} · nothing goes back`} ${ic('i-right', 's')}</button></div>
</form></section>`;
};

/* ---------- Steps 3 and 4: one page per purchase, with Return, Get paid and Details ---------- */
function stOutcome(i) { return i.outcome === 'credit' ? 'Store credit' : i.outcome === 'exchange' ? 'Exchange only' : i.outcome === 'final' ? 'Final sale' : i.outcome === 'refund' ? 'Money back' : 'Refund to confirm'; }
function stDaysTag(i) {
  const n = stDays(i);
  if (n === null) return '<span class="st-tag ln">Needs a date</span>';
  if (n < 0) return '<span class="st-tag off">Window closed</span>';
  if (n === 0) return '<span class="st-tag due">Due today</span>';
  return `<span class="st-tag ${n <= 3 ? 'hot' : 'ln'}">${n === 1 ? '1 day left' : n + ' days left'}</span>`;
}
function stPlanTab(i) {
  const sent = ['started', 'shipped', 'received'].includes(i.status);
  return planTab && planTab.id === i.id && planTab.status === i.status ? planTab.tab : sent ? 'paid' : 'return';
}
function stWay(i) {
  const g = i.returnGuide;
  if (i.demo || !g || i.policyStore !== i.retailer || i.returnable === 'no' || !g.methods.length) return null;
  return g.methods[chosenWay(i)];
}
function stReturnTab(i) {
  const due = C.due(i), base = i.basis === 'purchase' ? i.purchased : i.delivered, done = i.status === 'received' || i.status === 'kept';
  const confirmed = i.confirmed && i.requirement !== 'unknown';
  const date = due
    ? `<div class="st-dateblk"><span class="st-k">${confirmed ? 'Return by' : 'Return by · estimated'}</span><p class="st-d2">${stLong(due)}</p><p class="st-m sm">${esc(i.policyLine || (confirmed ? 'Start the return by 11:59 PM that day.' : 'We haven’t checked this store’s policy yet. Confirm the date in Details.'))}</p></div>`
    : `<div class="st-dateblk"><span class="st-k">Return by</span><p class="st-d2">Add the <em>return-by date.</em></p>${base ? `<label class="st-dateset"><input type="date" data-plan-date aria-label="Return by date" min="${esc(base)}"></label>` : '<p class="st-m sm">It’s counted from the delivery date. Add it in Details.</p>'}</div>`;
  const a = i.conditionAnswers || {};
  const qs = !i.demo && i.policyLine && i.policyStore === i.retailer && (i.policyQuestions || []).length
    ? `<div class="st-qa"><span class="st-k">${i.policyQuestions.length === 1 ? 'One quick question' : i.policyQuestions.length === 2 ? 'Two quick questions' : 'A few quick questions'}</span>${i.policyQuestions.map(q => `<div class="st-q"><span>${esc(q.label)}</span><span class="st-yn">${[['yes', 'Yes', true], ['no', 'No', false]].map(([v, l, b]) => `<button type="button" data-st-answer="${esc(q.id)}" data-v="${v}" class="${a[q.id] === b ? 'on' : ''}" aria-pressed="${a[q.id] === b}">${l}</button>`).join('')}</span></div>`).join('')}</div>` : '';
  const m = stWay(i), g = i.returnGuide;
  const way = m ? `<div class="st-g6"><div class="st-sb"><h3 class="st-d3">${esc(m.label)}</h3>${m.cost ? `<span class="st-tag ${/free/i.test(m.cost) ? 'ok' : 'ln'}">${esc(m.cost)}</span>` : ''}</div>
<div class="st-ol">${m.steps.map((s, k) => `<div><i>${k + 1}</i><p>${esc(s)}</p></div>`).join('')}</div>${m.needs ? `<p class="st-needs">${ic('i-list', 's')}${esc(m.needs)}</p>` : ''}${m.note ? `<p class="st-m sm">${esc(m.note)}</p>` : ''}${g.orderNumber ? `<p class="st-m sm">Order number: ${esc(g.orderNumber)}</p>` : ''}</div>` : '';
  const others = m ? g.methods.filter(x => x.index !== m.index) : [];
  const checks = i.packing || {}, list = m ? m.checklist : g && g.checklist || [];
  const packed = list.filter(c => checks[c.key]).length;
  const portal = /^https?:\/\//i.test(i.url || '') ? `<a class="st-li" href="${esc(i.url)}" target="_blank" rel="noopener">${ic('i-arrow')}<span class="st-grow">${esc(i.retailer)}’s return page<small>Start the return on their site</small></span>${ic('i-chev', 'chev')}</a>` : '';
  const rows = [
    done ? '' : `<button class="st-li" data-st-pass="${esc(i.id)}">${ic('i-qr')}<span class="st-grow">Return pass<small>${i.label ? 'Your QR code, ready at the counter' : 'Add the QR code or label from the store’s email'}</small></span>${ic('i-chev', 'chev')}</button>`,
    m && m.places ? `<button class="st-li" data-st-drop="${m.index}">${ic('i-pin')}<span class="st-grow">Nearest drop-off<small>${stDrop.id === i.id && stDrop.places[0] ? `${esc(stDrop.places[0].name)} · ${stDrop.places[0].miles} mi` : 'On a map, with today’s hours'}</small></span>${ic('i-chev', 'chev')}</button>` : '',
    list.length && !done ? `<button class="st-li" data-st-row="pack" aria-expanded="${stOpenRow === 'pack'}">${ic('i-list')}<span class="st-grow">Packing checklist</span><span class="st-val">${packed} of ${list.length}</span>${ic(stOpenRow === 'pack' ? 'i-chevd' : 'i-chev', 'chev')}</button>${stOpenRow === 'pack' ? `<div class="st-open">${list.map(c => `<label class="st-pack"><input type="checkbox" data-pack="${esc(c.key)}"${checks[c.key] ? ' checked' : ''}><span>${esc(c.label)}</span></label>`).join('')}</div>` : ''}` : '',
    others.length && !done ? `<button class="st-li" data-st-row="ways" aria-expanded="${stOpenRow === 'ways'}">${ic('i-truck')}<span class="st-grow">Other ways to return<small>${others.map(o => esc(o.label) + (o.cost ? ' · ' + esc(o.cost) : '')).join(' · ')}</small></span>${ic(stOpenRow === 'ways' ? 'i-chevd' : 'i-chev', 'chev')}</button>${stOpenRow === 'ways' ? `<div class="st-open">${others.map(o => `<div class="st-g6"><b>${esc(o.label)}</b><div class="st-ol">${o.steps.map((s, k) => `<div><i>${k + 1}</i><p>${esc(s)}</p></div>`).join('')}</div><button type="button" class="st-pill g sm" data-return-way="${o.index}">Return this way instead</button></div>`).join('')}</div>` : ''}` : '',
    portal,
    i.demo ? '' : reportOpen === i.id ? `<div class="st-open">${reportRow(i)}</div>` : `<button class="st-li" data-report-open>${ic('i-help')}<span class="st-grow st-m">Something wrong? Tell us</span></button>`
  ].join('');
  return `${date}${qs}${way}<div class="st-list">${rows}</div>`;
}
function stPaidTab(i) {
  const store = i.channel === 'store', sent = ['started', 'shipped', 'received'].includes(i.status), done = i.status === 'received';
  const to = i.payment ? `To your ${esc(i.payment)}` : i.outcome === 'credit' ? 'As store credit' : 'To your original payment';
  const by = i.returnedOn ? ' · by ' + stMonthDay(C.shift(i.returnedOn, 14)) : '';
  const stop = (state, title, sub, tag) => `<div class="${state}"><i>${state === 'done' ? ic('i-check') : ''}</i><div><b>${title}</b><p class="st-m sm">${sub}</p></div>${tag || '<span></span>'}</div>`;
  const s = i.status;
  const line = [
    stop(sent ? 'done' : 'now', 'Return started', sent ? (i.startedOn ? stMonthDay(i.startedOn) : 'Done') : 'Start it on the Return tab', sent ? '' : stDaysTag(i)),
    stop(['shipped', 'received'].includes(s) ? 'done' : s === 'started' ? 'now' : '', store ? `Drop off at ${esc(i.retailer)}` : 'Send it back', ['shipped', 'received'].includes(s) ? (i.returnedOn ? (store ? 'Dropped off ' : 'Sent ') + stMonthDay(i.returnedOn) : 'Done') : store ? 'Bring it and your return pass' : 'Pack it and drop it with the carrier', s === 'started' && C.due(i) ? stDaysTag(i) : ''),
    stop(s === 'received' ? 'done' : s === 'shipped' ? 'now' : '', `${esc(i.retailer)} processes it`, s === 'received' ? 'Done' : 'Usually a few days after it arrives'),
    stop(done ? 'done' : '', 'Money back', done ? `${money(i.received || 0)} · ${i.outcome === 'credit' ? 'store credit' : 'refund'}${i.returnedOn ? '' : ''}` : 'Banks can take up to 14 days')
  ].join('');
  return `<div class="st-r st-paidhead">${stThumb(i)}<span class="st-g2"><span class="st-k">${esc(i.retailer)} · ${store ? 'In store' : 'Online'}</span><b>${esc(i.name)}</b>${done ? '<span class="st-tag ok">Money back</span>' : sent ? `<span class="st-tag go">${s === 'shipped' ? (store ? 'Dropped off' : 'Sent back') : 'Return started'}</span>` : stDaysTag(i)}</span></div>
<div class="st-card st-expect"><span class="st-k">${done ? 'You got back' : 'Expected back'}</span><p class="st-n">${money(done ? i.received || 0 : i.price)}</p><p class="st-m sm">${done ? (i.outcome === 'credit' ? 'As store credit' : 'Refunded') + (i.returnedOn ? ' · returned ' + stMonthDay(i.returnedOn) : '') : to + by}</p></div>
<div class="st-timeline">${line}</div>`;
}
function stDetailsTab(i) {
  const due = C.due(i), base = i.basis === 'purchase' ? i.purchased : i.delivered, done = i.status === 'received';
  const row = (k, v) => `<div class="st-drow"><span class="st-k">${k}</span><span>${v}</span></div>`;
  return `<div class="st-g8 st-details">
<label class="st-field"><span class="st-k">Store</span><input data-plan-store aria-label="Store name" maxlength="80" placeholder="Add store name" value="${esc(i.retailer === NO_STORE ? '' : i.retailer)}"${done ? ' readonly' : ''}></label>
<label class="st-field"><span class="st-k">Return by</span>${base && !done ? `<input type="date" data-plan-date aria-label="Return by date" min="${esc(base)}" value="${esc(due || '')}">` : `<input value="${due ? esc(fmt(due)) : 'Not set'}" aria-label="Return by date" readonly>`}</label>
${row('Price', money(i.price))}${row('Bought', i.purchased ? esc(fmt(i.purchased)) + ' · ' + (i.channel === 'store' ? 'in store' : 'online') : '—')}${i.channel !== 'store' ? row('Delivered', i.delivered ? esc(fmt(i.delivered)) : 'Not yet') : ''}${i.orderNumber ? row('Order', esc(i.orderNumber)) : ''}${i.payment ? row('Paid with', esc(i.payment)) : ''}${row('Comes back as', esc(stOutcome(i)))}
${i.policySource || i.policyChecked ? `<p class="st-m sm">${i.policyUnverified ? 'Found on the store’s site, not checked by Returnly yet. ' : ''}${esc(i.policySource || '')}</p>` : ''}
${i.label ? `<div class="st-r"><button class="st-pill g sm" data-show-label>${ic('i-qr', 's')}Show label</button><button class="st-pill g sm" data-remove-label>${ic('i-trash', 's')}Remove label</button></div>` : ''}
</div>`;
}
planPage = function () {
  const i = find(selected); if (!i) return gallery();
  const tab = i.status === 'kept' ? 'return' : stPlanTab(i), store = i.channel === 'store';
  const sent = ['started', 'shipped', 'received'].includes(i.status), done = i.status === 'received';
  const bought = [money(i.price), i.purchased ? `Bought ${store ? 'in store' : 'online'} ${stMonthDay(i.purchased)}` : '', !store && i.delivered ? 'Delivered ' + stMonthDay(i.delivered) : ''].filter(Boolean).join(' · ');
  const checked = i.confirmed && i.requirement !== 'unknown' && !i.policyUnverified;
  const chips = `${done ? `<span class="st-tag ok">${stCents(i.received || 0)} back</span>` : i.status === 'kept' ? '<span class="st-tag off">Keeping it</span>' : sent ? `<span class="st-tag go">${i.status === 'shipped' ? 'Sent back' : 'Return started'}</span>` : stDaysTag(i)}<span class="st-tag ln">${esc(stOutcome(i))}</span><span class="st-tag ln">${checked ? ic('i-check', 'xs') + 'Policy checked' : 'Policy not checked'}</span>`;
  const seg = i.status === 'kept' ? '' : `<div class="st-seg">${[['return', 'Return'], ['paid', 'Get paid'], ['details', 'Details']].map(([k, l]) => `<button data-plan-tab="${k}" class="${tab === k ? 'on' : ''}">${l}</button>`).join('')}</div>`;
  const body = tab === 'paid' ? stPaidTab(i) : tab === 'details' ? stDetailsTab(i) : stReturnTab(i);
  let main;
  if (i.status === 'kept') main = `<button class="st-pill b" data-stage="deciding">Return this instead</button>`;
  else if (tab === 'paid') main = done ? `<button class="st-pill b" data-view="overview">Back to my purchases</button>` : !sent ? `<button class="st-pill b" data-start-return>Start return ${ic('i-arrow', 's')}</button>` : i.status === 'started' ? `<button class="st-pill b" data-stage="shipped">${store ? 'I dropped it off' : 'I sent it'}</button>` : `<button class="st-pill b" data-st-paid>The money came back</button>`;
  else main = done ? `<button class="st-pill b" data-plan-tab="paid">See what came back</button>` : sent ? `<button class="st-pill b" data-plan-tab="paid">${i.status === 'shipped' ? 'Waiting on the money' : store ? 'I dropped it off' : 'I sent it'} ${ic('i-right', 's')}</button>` : `<button class="st-pill b" data-start-return>Start return${i.retailer && i.retailer !== NO_STORE ? ' at ' + esc(i.retailer) : ''} ${ic('i-arrow', 's')}</button>`;
  if (i.status === 'started' && tab === 'return') main = `<button class="st-pill b" data-stage="shipped">${store ? 'I dropped it off' : 'I sent it'}</button>`;
  if (tab === 'paid') return `<section class="st st-flow st-paid"><div class="st-g20">
${stStepHead(4, 'Get paid')}
${body}
<button class="st-li" data-plan-tab="return">${ic('i-list')}<span class="st-grow">Return steps and details<small>How to return it, your pass and the drop-off</small></span>${ic('i-chev', 'chev')}</button>
<p class="flow-status" role="alert">${esc(journey.error)}</p></div>
<div class="st-dock">${main}</div>
${stPaid.open && i.status === 'shipped' ? stPaidSheet(i) : ''}
</section>`;
  return `<section class="st st-flow st-plan">
<div class="st-ihero${i.photo || i.demo ? '' : ' plain'}">${stPhoto(i)}<div class="st-tools"><button class="st-circ gl" id="flow-back" aria-label="Back to purchases">${ic('i-back')}</button><div class="st-r"><button class="st-circ gl" data-st-share-item aria-label="Share">${ic('i-share')}</button><button class="st-circ gl" data-plan-tab="details" aria-label="Edit details">${ic('i-edit')}</button></div></div></div>
<div class="st-isheet">
  <span class="st-ilogo">${stLogo(i.retailer === NO_STORE ? '?' : i.retailer)}</span>
  <div class="st-g8 st-center"><h1 class="st-d1">${esc(i.name)}</h1><p class="st-m sm">${esc(bought)}</p><div class="st-chiprow">${chips}</div></div>
  ${seg}
  ${body}
  <p class="flow-status" role="alert">${esc(journey.error)}</p>
</div>
<div class="st-dock"><button class="st-circ gl" data-view="overview" aria-label="Back to purchases">${ic('i-back')}</button>${main}</div>
${stPaid.open && i.status === 'shipped' ? stPaidSheet(i) : ''}
</section>`;
};

/* When the money arrives: how much came back, with the full refund already filled in. */
function stPaidSheet(i) {
  const amt = stPaid.amount;
  return `<div class="st-scrim" data-st-paid-close></div>
<form id="flow-received-form" class="st-sheet" role="dialog" aria-label="How much came back">
  <span class="st-grab"></span>
  <div class="st-g2 st-center"><h2 class="st-d2">How much <em>came back?</em></h2><p class="st-m sm">${i.payment ? `Check your ${esc(i.payment)} statement` : 'Check your statement or the store’s email'}</p></div>
  <label class="st-amount"><span class="st-n">$</span><input name="received" aria-label="Amount you received" type="text" inputmode="decimal" required value="${esc(amt)}" autocomplete="off"></label>
  <div class="st-r st-jc">${[['refund', `${money(i.price)} · full refund`], ['less', 'Less'], ['credit', 'Store credit']].map(([k, l]) => `<button type="button" class="st-chip${stPaid.kind === k ? ' on' : ''}" data-st-kind="${k}">${l}</button>`).join('')}</div>
  <div class="st-keys">${['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', 'del'].map(k => `<button type="button" data-st-key="${k}" aria-label="${k === 'del' ? 'Delete' : k}">${k === 'del' ? ic('i-back') : k}</button>`).join('')}</div>
  <button class="st-pill b full">Mark as paid</button>
</form>`;
}

/* ---------- Drop-off ---------- */
async function stFindDrop(i, way) {
  stDrop = { id: i.id, way, state: 'loading', places: [], here: null, note: '' };
  view = 'dropoff'; render(); window.scrollTo(0, 0);
  try {
    const c = await locate();
    const r = await Account.api('POST', '/api/places/nearest', { retailerId: i.retailerId, method: way, lat: c.latitude, lng: c.longitude });
    if (stDrop.id !== i.id || stDrop.way !== way) return;
    stDrop = { ...stDrop, here: { lat: c.latitude, lng: c.longitude }, places: r.places || [], state: r.places && r.places.length ? 'done' : 'error', note: r.places && r.places.length ? '' : r.reason ? NEARBY_FAILED[r.reason] || NEARBY_FAILED.failed : 'No drop-offs within 15 miles. Use the store’s return page instead.' };
  } catch (err) { if (stDrop.id === i.id) stDrop = { ...stDrop, state: 'error', note: err.message }; }
  if (view === 'dropoff') render();
}
function stDropoff() {
  const i = find(stDrop.id); if (!i) { view = 'overview'; return stPurchases(); }
  const g = i.returnGuide, ways = g ? g.methods.filter(m => m.places) : [];
  const where = p => { const m = /destination=(-?[\d.]+),(-?[\d.]+)/.exec(p.directions || ''); return m ? { lat: +m[1], lng: +m[2] } : null; };
  const pts = stDrop.places.map(where), here = stDrop.here;
  const span = Math.max(0.004, ...pts.filter(Boolean).map(p => Math.max(Math.abs(p.lat - here.lat), Math.abs(p.lng - here.lng) * Math.cos(here.lat * Math.PI / 180))));
  const pos = p => ({ x: 50 + 36 * (p.lng - here.lng) * Math.cos(here.lat * Math.PI / 180) / span, y: 58 - 36 * (p.lat - here.lat) / span });
  const pins = here ? stDrop.places.map((p, k) => { const w = pts[k]; if (!w) return ''; const q = pos(w); return `<a class="st-pin${k ? '' : ' sel'}" style="left:${q.x.toFixed(1)}%;top:${q.y.toFixed(1)}%" href="${esc(p.directions)}" target="_blank" rel="noopener"><b>${esc(p.name)}${k ? '' : ' · ' + p.miles + ' mi'}</b><i></i></a>`; }).join('') : '';
  const wayName = m => /mail|ship|post|carrier|ups|usps|fedex|dhl/i.test(m.label) ? 'By mail' : /store/i.test(m.label) ? `${esc(i.retailer)} stores` : esc(m.label);
  const list = stDrop.state === 'loading' ? `<p class="st-m st-none">Finding drop-offs near you…</p>` : stDrop.state === 'error' ? `<p class="st-m st-none">${esc(stDrop.note)}</p>` : stDrop.places.map((p, k) => `<a class="st-drop" href="${esc(p.directions)}" target="_blank" rel="noopener"><span class="st-lg">${stLogo(p.name.split(" ")[0])}</span><span class="st-g2 st-grow"><b>${esc(p.name)}</b><small class="st-m sm">${esc(p.address || '')}${todayHours(p) ? ' · ' + esc(todayHours(p)) : p.openNow === true ? ' · Open now' : p.openNow === false ? ' · Closed now' : ''}</small></span><span class="st-tag ${k ? 'ln' : 'go'}">${p.miles} mi</span></a>`).join('');
  const first = stDrop.places[0];
  return `<section class="st st-dropoff">
<div class="st-map"><svg class="st-mapbg" viewBox="0 0 360 330" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><rect width="360" height="330" fill="#eceee8"/><path d="M0 210 L360 150" stroke="#fff" stroke-width="16"/><path d="M120 0 L170 330" stroke="#fff" stroke-width="12"/><path d="M0 80 L360 40" stroke="#fff" stroke-width="9"/><path d="M260 0 L300 330" stroke="#fff" stroke-width="9"/><path d="M0 290 L360 260" stroke="#fff" stroke-width="7"/><path d="M40 0 L70 330" stroke="#fff" stroke-width="6"/><rect x="180" y="60" width="66" height="70" rx="10" fill="#dfe8d8"/><rect x="190" y="180" width="54" height="60" rx="8" fill="#e3e6ec"/><rect x="66" y="96" width="44" height="90" rx="8" fill="#e3e6ec"/><path d="M300 330 C 320 250, 340 200, 360 190 L360 330 Z" fill="#d6e2ee"/></svg>
  ${here ? '<span class="st-here" style="left:50%;top:58%" aria-label="You are here"></span>' : ''}${pins}
  <div class="st-tools"><button class="st-circ" data-st-drop-back aria-label="Back">${ic('i-back')}</button><button class="st-circ" data-st-drop="${stDrop.way}" aria-label="Find again">${ic('i-pin')}</button></div>
</div>
<div class="st-isheet st-dropsheet"><span class="st-grab"></span>
  <h1 class="st-d2">Drop it off <em>nearby</em></h1>
  ${ways.length > 1 ? `<div class="st-seg">${ways.map(m => `<button data-st-drop="${m.index}" class="${stDrop.way === m.index ? 'on' : ''}">${wayName(m)}</button>`).join('')}</div>` : ''}
  <div class="st-drops">${list}</div>
  ${first ? `<a class="st-pill b full" href="${esc(first.directions)}" target="_blank" rel="noopener">Directions to ${esc(first.name)}</a>` : ''}
  <p class="st-m sm st-center">Your location is used once to find these and isn’t saved.</p>
</div>
</section>`;
}

/* ---------- Your story ---------- */
function stStoryDate(i) { return i.status === 'received' ? i.returnedOn || i.delivered || i.purchased : i.keptOn || i.delivered || i.purchased; }
function stMissed() { return items.filter(i => !i.demo && i.intent === 'return' && !['started', 'shipped', 'received', 'kept'].includes(i.status) && stDays(i) !== null && stDays(i) < 0); }
function stStory() {
  const year = String(new Date().getFullYear());
  const done = items.filter(i => ['received', 'kept'].includes(i.status) || stMissed().includes(i)).sort((a, b) => String(stStoryDate(b) || '').localeCompare(String(stStoryDate(a) || '')));
  const inYear = done.filter(i => String(stStoryDate(i) || '').startsWith(year));
  const back = inYear.filter(i => i.status === 'received').reduce((n, i) => n + (Number(i.received) || 0), 0);
  const months = {};
  for (const i of done) { const k = String(stStoryDate(i) || '').slice(0, 7) || 'undated'; (months[k] = months[k] || []).push(i); }
  const label = k => k === 'undated' ? 'Earlier' : C.parseDate(k + '-01').toLocaleDateString('en-US', { month: 'long', ...(k.slice(0, 4) === year ? {} : { year: 'numeric' }) });
  const line = i => {
    const missed = !['received', 'kept'].includes(i.status), d = stStoryDate(i);
    const sub = i.status === 'received' ? `${i.outcome === 'credit' ? 'Store credit' : 'Refunded'}${d ? ' ' + stMonthDay(d) : ''}` : i.status === 'kept' ? `Kept${i.keptOn ? ' ' + stMonthDay(i.keptOn) : ''}` : `Window closed ${stMonthDay(C.due(i))}`;
    return `<button class="st-logi" data-open="${esc(i.id)}">${stThumb(i)}<span class="st-g2 st-grow"><b>${esc(i.name)}</b><small class="st-m sm">${esc(i.retailer)} · ${sub}</small></span>${i.status === 'received' ? `<span class="st-tag ok">${money(i.received || 0)}</span>` : i.status === 'kept' ? '<span class="st-tag off">Kept</span>' : '<span class="st-tag due">Missed</span>'}</button>`;
  };
  return `<section class="st st-story">
<header class="st-sb"><button class="st-circ flat" data-view="settings" aria-label="Back">${ic('i-back')}</button>${done.length ? `<button class="st-circ flat" data-st-share-story aria-label="Share">${ic('i-share')}</button>` : ''}</header>
<h1 class="st-d1">Your <em>story</em></h1>
<article class="st-yr"><span class="st-k">${year} so far</span><p class="st-n">${stCents(back)} back</p><div class="st-r"><span><b>${inYear.filter(i => i.status === 'received').length}</b> returned</span><span>·</span><span><b>${inYear.filter(i => i.status === 'kept').length}</b> kept</span><span>·</span><span><b>${inYear.filter(i => !['received', 'kept'].includes(i.status)).length}</b> missed</span></div></article>
${done.length ? Object.entries(months).map(([k, l]) => `<div><div class="st-month-h"><span class="st-k">${label(k)}</span></div>${l.map(line).join('')}</div>`).join('') : `<div class="st-emptycard"><h2 class="st-d2">Your story <em>starts with one return.</em></h2><p class="st-m">Everything you send back or decide to keep shows up here, with what came back.</p><button class="st-pill b sm" data-add>${ic('i-scan', 's')}Scan a receipt</button></div>`}
</section>`;
}

/* ---------- Monthly recap ---------- */
function stRecapData() {
  const now = C.parseDate(today()), last = new Date(now.getFullYear(), now.getMonth() - 1, 1), key = C.iso(last).slice(0, 7);
  const inMonth = d => String(d || '').slice(0, 7) === key;
  const back = items.filter(i => i.status === 'received' && inMonth(i.returnedOn));
  const kept = items.filter(i => i.status === 'kept' && inMonth(i.keptOn || i.purchased));
  const missed = items.filter(i => !i.demo && i.intent === 'return' && !['started', 'shipped', 'received', 'kept'].includes(i.status) && inMonth(C.due(i)) && stDays(i) < 0);
  const moving = items.filter(i => ['started', 'shipped'].includes(i.status));
  const end = C.iso(new Date(now.getFullYear(), now.getMonth() + 1, 0));
  const next = sorted(items.filter(i => stOpen(i) && C.due(i) && C.due(i) >= today() && C.due(i) <= end));
  return { key, name: last.toLocaleDateString('en-US', { month: 'long' }), year: last.getFullYear(), back, kept, missed, moving, next, total: back.reduce((n, i) => n + (Number(i.received) || 0), 0) };
}
const stRecapReady = () => { const d = stRecapData(); return d.back.length + d.kept.length + d.moving.length > 0 ? d : null; };
let stRecapSlide = 0;
function stRecap() {
  const d = stRecapReady(); if (!d) return;
  stRecapSlide = 0; stSet(RECAP_SEEN, d.key);
  let el = $('#st-recap'); if (el) el.remove();
  document.body.insertAdjacentHTML('beforeend', `<div id="st-recap" class="st-story-ov" role="dialog" aria-modal="true" aria-label="Your ${esc(d.name)}"></div>`);
  stRecapPaint();
}
let stRecapTimer = 0;
function stRecapPaint() {
  const d = stRecapData(), el = $('#st-recap'); if (!el) return;
  clearTimeout(stRecapTimer); stRecapTimer = setTimeout(() => { if (!$('#st-recap')) return; if (stRecapSlide < 2) { stRecapSlide++; stRecapPaint(); } }, 6000);
  const fan = list => { const p = list.filter(i => i.photo || i.demo).slice(0, 3); const src = p.length ? p : []; return `<div class="st-storyart" aria-hidden="true">${(src.length ? src : [{ demoPh: 's-sneakers' }, { demoPh: 's-cardigan' }, { demoPh: 's-loafers' }]).map((i, k, all) => `<span class="st-sph p${all.length === 1 ? 1 : all.length === 2 ? k * 2 : k}">${i.demoPh ? `<img src="assets/${i.demoPh}.jpg" alt="">` : stPhoto(i)}</span>`).join('')}</div>`; };
  const nice = n => n >= 200 ? 'That’s a weekend away.' : n >= 80 ? 'That’s a nice dinner out.' : n > 0 ? 'That’s lunch, on Returnly.' : '';
  const slides = [
    d.total ? `${fan(d.back)}<div class="st-g12"><span class="st-k dk">${esc(d.name)} ${d.year}</span><h2 class="st-d0">You got <em>${stCents(d.total)} back.</em></h2><p class="st-sm">${nice(d.total)}${d.missed.length ? '' : ' And you didn’t miss a single window.'}</p>`
      : `${fan(d.moving)}<div class="st-g12"><span class="st-k dk">${esc(d.name)} ${d.year}</span><h2 class="st-d0">${d.missed.length ? `${d.moving.length} on <em>their way back.</em>` : 'You didn’t miss <em>a single window.</em>'}</h2><p class="st-sm">${d.moving.length ? `${d.moving.length} return${d.moving.length === 1 ? ' is' : 's are'} moving. The money is next.` : 'Every return got a plan in time.'}</p>`,
    `${fan(d.kept)}<div class="st-g12"><span class="st-k dk">What you kept</span><h2 class="st-d0">${d.kept.length ? `You kept <em>${d.kept.length} thing${d.kept.length === 1 ? '' : 's'} you love.</em>` : 'Nothing kept <em>by accident.</em>'}</h2><p class="st-sm">${d.kept.length ? d.kept.slice(0, 3).map(i => esc(i.name)).join(', ') + '.' : 'Every purchase you didn’t want went back or is on its way.'}</p>`,
    `${fan(d.next)}<div class="st-g12"><span class="st-k dk">Coming up</span><h2 class="st-d0">${d.next.length ? `${d.next.length} window${d.next.length === 1 ? '' : 's'} <em>this month.</em>` : 'A quiet month <em>ahead.</em>'}</h2><p class="st-sm">${d.next.length ? d.next.slice(0, 2).map(i => `${esc(i.name)} by ${esc(stShort(C.due(i)))}`).join(' · ') : 'Scan your next receipt and we’ll watch the window.'}</p>`
  ];
  const chips = `<div class="st-r st-wrap"><span class="st-chip dkg">${d.back.length} refund${d.back.length === 1 ? '' : 's'}</span><span class="st-chip dkg">${d.moving.length} started</span><span class="st-chip lime">${d.missed.length} missed</span></div>`;
  el.innerHTML = `<div class="st-bars">${slides.map((_, k) => `<i class="${k < stRecapSlide ? 'done' : k === stRecapSlide ? 'run' : ''}"></i>`).join('')}</div>
<div class="st-sb"><div class="st-r"><span class="st-ava sm">R.</span><b class="st-t13">Your ${esc(d.name)}</b></div><button class="st-circ dk" id="st-recap-close" aria-label="Close">${ic('i-x', 's')}</button></div>
<button class="st-tap prev" data-st-slide="-1" aria-label="Previous"></button><button class="st-tap next" data-st-slide="1" aria-label="Next"></button>
${slides[stRecapSlide]}${stRecapSlide === 0 ? chips : ''}<button class="st-pill w full" id="st-recap-share">${ic('i-share', 's')}Share my month</button></div>`;
}
async function stRecapImage(d) {
  const c = document.createElement('canvas'); c.width = 1080; c.height = 1920; const g = c.getContext('2d');
  const bg = g.createLinearGradient(0, 0, 400, 1920); bg.addColorStop(0, '#1b3aa3'); bg.addColorStop(1, '#0d1830'); g.fillStyle = bg; g.fillRect(0, 0, 1080, 1920);
  try { await document.fonts.ready; } catch {}
  g.fillStyle = 'rgba(255,255,255,.7)'; g.textAlign = 'left'; g.font = '500 40px "Geist Mono", monospace'; g.fillText(`${d.name.toUpperCase()} ${d.year}`, 90, 1080);
  g.fillStyle = '#fff'; g.font = '300 120px Newsreader, Georgia, serif'; g.fillText(d.total ? 'You got' : 'No missed', 90, 1230);
  g.font = 'italic 300 120px Newsreader, Georgia, serif'; g.fillText(d.total ? `${stCents(d.total)} back.` : 'windows.', 90, 1360);
  g.font = '500 44px Geist, Arial, sans-serif'; g.fillStyle = 'rgba(255,255,255,.8)'; g.fillText(`${d.back.length} refunds · ${d.kept.length} kept · ${d.missed.length} missed`, 90, 1470);
  g.font = '800 72px Arial, Helvetica, sans-serif'; g.fillStyle = '#fff'; g.fillText('Returnly.', 90, 1780);
  return new Promise(res => c.toBlob(res, 'image/png'));
}
async function stShareBlob(blob, name, text) {
  const file = new File([blob], name, { type: 'image/png' });
  try { if (navigator.canShare && navigator.canShare({ files: [file] })) { await navigator.share({ files: [file], text }); return; } } catch (err) { if (err && err.name === 'AbortError') return; }
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 3000); toast('Saved the image.');
}

/* ---------- wiring ---------- */
render = function () {
  if (view === 'history-log') view = 'story';
  const flow = ['upload', 'review', 'plan'].includes(view);
  document.body.classList.toggle('st-flowing', flow || view === 'dropoff');
  document.body.classList.toggle('st-lensing', view === 'upload');
  if (view !== 'plan') stPaid.open = false;
  if (!JOURNEY_VIEWS.includes(view)) { renderBeforeJourneyStudio(); if (view === 'home') stHomeRecap(); if (view === 'review') document.querySelectorAll('.st-fname').forEach(t => { t.style.height = 'auto'; t.style.height = t.scrollHeight + 'px'; }); return; }
  if (typeof stopJourneyCamera === 'function') stopJourneyCamera();
  document.body.classList.add('studio', 'st-page');
  document.body.classList.remove('flow-active', 'home-active');
  const fp = $('#flow-profile'); if (fp) fp.hidden = true;
  $('#main').innerHTML = view === 'dropoff' ? stDropoff() : stStory();
  syncHomeProfile();
  stTabs(); syncTabs();
};
/* Home: the recap opens once on the first visit of a new month, and stays one tap away for the first week. */
function stHomeRecap() {
  const d = stRecapReady(); if (!d) return;
  const day = C.parseDate(today()).getDate(), main = $('.st-home');
  if (main && day <= 7 && !$('.st-recapcard')) { const after = $('.st-3'); if (after) after.insertAdjacentHTML('afterend', `<button class="st-recapcard" data-st-recap><span class="st-ava sm">R.</span><span class="st-grow"><b>Your ${esc(d.name)}</b><small>${d.total ? stCents(d.total) + ' back' : 'No missed windows'} · tap to watch</small></span>${ic('i-chev', 'chev')}</button>`); }
  if (stGet(RECAP_SEEN, '') !== d.key && !$('#st-recap') && !$('#st-party')) stRecap();
}

document.addEventListener('click', async e => {
  const b = e.target.closest('button,label');
  if (!b) return;
  if (b.hasAttribute('data-st-add-item')) { retainReview(); draft.products.push({ ...blankProduct(), intent: 'return' }); render(); const n = draft.products.length - 1; $(`[name="name-${n}"]`)?.focus(); return; }
  if (b.dataset.stAnswer) {
    const i = find(selected); if (!i) return;
    const a = { ...(i.conditionAnswers || {}) }, v = b.dataset.v === 'yes';
    if (a[b.dataset.stAnswer] === v) delete a[b.dataset.stAnswer]; else a[b.dataset.stAnswer] = v;
    i.conditionAnswers = a; save(); render(); checkPolicy(i); return;
  }
  if (b.dataset.stRow) { stOpenRow = stOpenRow === b.dataset.stRow ? '' : b.dataset.stRow; render(); return; }
  if (b.dataset.stDrop !== undefined) { const i = find(view === 'dropoff' ? stDrop.id : selected); if (i) await stFindDrop(i, Number(b.dataset.stDrop)); return; }
  if (b.hasAttribute('data-st-drop-back')) { showDetail(stDrop.id); return; }
  if (b.hasAttribute('data-st-paid')) { const i = find(selected); if (!i) return; stPaid = { open: true, kind: i.outcome === 'credit' ? 'credit' : 'refund', amount: String(Number(i.price) || '') }; render(); return; }
  if (b.hasAttribute('data-st-paid-close')) { stPaid.open = false; render(); return; }
  if (b.dataset.stKind) {
    const i = find(selected), input = $('#flow-received-form [name=received]'); if (!i || !input) return;
    stPaid.kind = b.dataset.stKind; stPaid.amount = b.dataset.stKind === 'less' ? '' : b.dataset.stKind === 'refund' ? String(Number(i.price) || '') : input.value;
    document.querySelectorAll('[data-st-kind]').forEach(x => x.classList.toggle('on', x === b)); input.value = stPaid.amount; if (b.dataset.stKind === 'less') input.focus(); return;
  }
  if (b.dataset.stKey) {
    const input = $('#flow-received-form [name=received]'); if (!input) return;
    let v = input.value, k = b.dataset.stKey;
    if (k === 'del') v = v.slice(0, -1); else if (k === '.') { if (!v.includes('.')) v = (v || '0') + '.'; } else if (!/\.\d\d$/.test(v)) v = (v === '0' ? '' : v) + k;
    input.value = stPaid.amount = v; return;
  }
  if (b.hasAttribute('data-st-share-item')) {
    const i = find(selected); if (!i) return;
    const text = `Returning the ${i.name} to ${i.retailer}${C.due(i) ? ' by ' + stShort(C.due(i)) : ''}. Tracking it with Returnly.`;
    try { if (navigator.share) { await navigator.share({ text }); return; } } catch (err) { if (err && err.name === 'AbortError') return; }
    try { await navigator.clipboard.writeText(text); toast('Copied.'); } catch { toast(text); }
    return;
  }
  if (b.hasAttribute('data-st-share-story')) {
    const d = { ...stRecapData(), name: 'My', year: new Date().getFullYear() };
    const year = String(d.year), got = items.filter(i => i.status === 'received' && String(i.returnedOn || '').startsWith(year));
    d.back = got; d.total = got.reduce((n, i) => n + (Number(i.received) || 0), 0); d.kept = items.filter(i => i.status === 'kept'); d.missed = stMissed();
    await stShareBlob(await stRecapImage(d), 'returnly-my-year.png', `${money(d.total)} back this year with Returnly.`); return;
  }
  if (b.hasAttribute('data-st-recap')) { stRecap(); return; }
  if (b.dataset.stSlide) { const n = stRecapSlide + Number(b.dataset.stSlide); if (n > 2) { $('#st-recap')?.remove(); return; } stRecapSlide = Math.max(0, n); stRecapPaint(); return; }
  if (b.id === 'st-recap-close') { $('#st-recap')?.remove(); return; }
  if (b.id === 'st-recap-share') { const d = stRecapData(); await stShareBlob(await stRecapImage(d), `returnly-${d.key}.png`, `My ${d.name} with Returnly: ${money(d.total)} back.`); return; }
});
/* Start return: remember the day, and open the store's return page when there is one. Kept: remember the day for Your story. */
document.addEventListener('click', e => {
  const b = e.target.closest('button'); if (!b) return;
  const i = find(selected);
  if (b.hasAttribute('data-start-return') && i) { i.startedOn = today(); if (/^https?:\/\//i.test(i.url || '') && view === 'plan') window.open(i.url, '_blank', 'noopener'); }
  const kept = b.dataset.keep ? find(b.dataset.keep) : b.dataset.stDecide === 'keep' && $('[data-st-card]') ? find($('[data-st-card]').dataset.stCard) : null;
  if (kept) kept.keptOn = today();
}, true);
/* Mark as paid: store credit is saved as the outcome before the step records the amount. */
document.addEventListener('submit', e => {
  if (e.target.id !== 'flow-received-form') return;
  const i = find(selected), input = e.target.elements.received;
  if (input) input.value = String(input.value).replace(/[^\d.]/g, '');
  if (i && stPaid.kind === 'credit') i.outcome = 'credit';
  else if (i && i.outcome === 'unknown') i.outcome = 'refund';
  stPaid.open = false;
}, true);
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && $('#st-recap')) $('#st-recap').remove();
  if (e.key === 'Escape' && stPaid.open) { stPaid.open = false; render(); }
});
/* The item name grows with its text, so a long name never hides behind a scrollbar. */
document.addEventListener('input', e => { if (e.target.classList && e.target.classList.contains('st-fname')) { e.target.style.height = 'auto'; e.target.style.height = e.target.scrollHeight + 'px'; } });

render();
