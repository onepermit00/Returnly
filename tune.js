/* My vibe and Reminders, redrawn: a live preview, four pill tabs, a time grid and one list of where nudges reach you. */
let stVibeTab = 0;
const ST_VIBE_TABS = ['Voice', 'Humor', 'Deadlines', 'Emoji'];
const ST_HUMOR = [['none', 'None', 'Just the facts', 0], ['little', 'A little', 'A smile, not a joke', 1], ['lots', 'Bring it', 'Make me laugh', 2]];
const ST_STYLE = [['gentle', 'Gentle', 'We’ll ease you in'], ['firm', 'Firm', 'Clear and to the point'], ['direct', 'Direct', 'No softening']];
const ST_EMOJI = [['none', 'None', '—'], ['few', 'A few', '✨'], ['lots', 'Love them', '🛍️💸']];
const ST_TIMES = ['07:00', '08:00', '09:00', '12:30', '17:00', '19:00', '20:30'];
const stClock = t => { const [h, m] = String(t || '09:00').split(':').map(Number); return `${(h % 12) || 12}:${String(m).padStart(2, '0')}`; };
const stAmPm = t => Number(String(t || '09:00').split(':')[0]) < 12 ? 'AM' : 'PM';

function stPreview(r, time) {
  return `<div class="st-prev"><span class="st-av">R.</span><p class="st-bub"><b>${esc(r ? r.title : 'Your next return, remembered.')}</b>${esc(r ? r.body : 'Add a purchase to see your nudge here.')}</p><span class="st-k st-prevk">Your next nudge · tomorrow ${esc(stClock(time))}</span></div>`;
}

stVibe = function () {
  const v = VibeN.vibeOf(settings.vibe), r = VibeN.compose(items, today(), { gentle: !!settings.gentle, examples: true, vibe: settings.vibe });
  const pick = (key, val, cls, inner, label) => `<label class="${cls}${v[key] === val ? ' on' : ''}"><input type="radio" name="vibe-${key}" value="${val}"${v[key] === val ? ' checked' : ''} aria-label="${esc(label)}">${inner}</label>`;
  const panels = [
    `<div class="st-vlist2" role="radiogroup" aria-label="Choose your voice">${vibeVoices.map(([id]) => pick('voice', id, 'st-vrow2', `<span class="st-vsw2 ${stVoiceColor[id]}">${esc(VibeN.VOICES[id].name.replace(/^The /, '').slice(0, 1))}</span><span class="st-grow"><b>${esc(VibeN.VOICES[id].name)}</b><q>${esc(stVoiceLine[id].replace(/[“”]/g, ''))}</q></span><span class="st-radio" aria-hidden="true"></span>`, VibeN.VOICES[id].name)).join('')}</div>`,
    `<div class="st-g8"><span class="st-k">How funny should it be?</span><div class="st-tiles3" role="radiogroup" aria-label="Humor">${ST_HUMOR.map(([val, n, s, l]) => pick('humor', val, 'st-tile', `<span class="st-lvl">${[0, 1, 2].map(k => `<i class="${k <= l ? 'f' : ''}"></i>`).join('')}</span><span><b>${n}</b><small>${s}</small></span>`, n)).join('')}</div></div><p class="st-m sm st-center">Jokes stay in the first line. The deadline is always plain.</p>`,
    `<div class="st-g8"><span class="st-k">When a window is about to close</span><div class="st-bigs" role="radiogroup" aria-label="Reminder style">${ST_STYLE.map(([val, n, s]) => pick('style', val, `st-bigc ${val}`, `<span><b>${n}</b><small>${s}</small></span><i class="st-chk">${ic('i-check')}</i>`, n)).join('')}</div></div>`,
    `<div class="st-g8"><span class="st-k">Emoji in your nudges</span><div class="st-tiles3 emo" role="radiogroup" aria-label="Emojis">${ST_EMOJI.map(([val, n, e]) => pick('emoji', val, 'st-tile', `<span class="st-e">${e}</span><b>${n}</b>`, n)).join('')}</div></div><p class="st-m sm st-center">Never in dates, amounts or store names.</p>`
  ];
  return `<section class="st st-vibe2">
<div class="st-sb"><h1 class="st-d1">My <em>vibe</em></h1><button class="st-circ" data-view="reminders" aria-label="Reminders">${ic('i-bell')}</button></div>
${stPreview(r, settings.time)}
<div class="st-ptabs" role="tablist" style="--i:${stVibeTab}"><i class="st-thumbp" aria-hidden="true"></i>${ST_VIBE_TABS.map((t, k) => `<button type="button" role="tab" aria-selected="${k === stVibeTab}" class="${k === stVibeTab ? 'on' : ''}" data-st-vtab="${k}">${t}</button>`).join('')}</div>
<div class="st-panels">${panels.map((p, k) => `<div class="st-panel" data-st-panel="${k}"${k === stVibeTab ? '' : ' hidden'}>${p}</div>`).join('')}</div>
<p class="st-m sm">Your voice is used for every reminder: notifications, emails and the Reminders preview. Dates, amounts and next steps never change.</p>
</section>`;
};

/* The next three days you'll hear from us, and about which purchase. */
function stComing() {
  const open = items.filter(i => i.intent !== 'keep' && !['shipped', 'received', 'kept'].includes(i.status) && C.due(i) && stDays(i) !== null && stDays(i) >= 0);
  const out = [];
  if (settings.gentle) {
    open.forEach(i => {
      const d = C.due(i), w = Number(i.window) || 0;
      [Math.round(w / 2), 7, 3, 1].forEach(n => { const on = C.shift(d, -n); if (n > 0 && C.days(on, today()) > 0) out.push({ on, i, left: n }); });
    });
    out.sort((a, b) => a.on < b.on ? -1 : 1);
  } else {
    for (let k = 1; out.length < 3 && k <= 60; k++) {
      const on = C.shift(today(), k), i = open.filter(x => C.due(x) >= on).sort((a, b) => C.due(a) < C.due(b) ? -1 : 1)[0];
      if (i) out.push({ on, i, left: C.days(C.due(i), on) });
    }
  }
  const seen = new Set();
  return out.filter(x => !seen.has(x.on + x.i.id) && seen.add(x.on + x.i.id)).slice(0, 3);
}

stReminders = function () {
  const r = ReturnlyNudge.compose(items, today(), { gentle: !!settings.gentle, examples: true, vibe: settings.vibe });
  const time = settings.time || '09:00', perm = 'Notification' in window ? Notification.permission : 'unavailable';
  const on = !!settings.notifications && perm === 'granted';
  const emailOk = typeof emailPrefs !== 'undefined' && emailPrefs.available;
  const emailOn = emailOk && (emailPrefs.daily || emailPrefs.unopened);
  const custom = !ST_TIMES.includes(time);
  const qs = typeof validClock === 'function' && validClock(settings.quietStart) ? settings.quietStart : '', qe = typeof validClock === 'function' && validClock(settings.quietEnd) ? settings.quietEnd : '';
  const bars = days => `<span class="st-bars">${days.map(f => `<i class="${f ? 'f' : ''}"></i>`).join('')}</span>`;
  const status = (txt, ok) => `<span class="st-stat${ok ? ' on' : ''}">${txt}</span>`;
  const coming = stComing();
  const tag = n => n <= 1 ? `<span class="st-tag due">${n === 0 ? 'Today' : 'Tomorrow'}</span>` : `<span class="st-tag ${n <= 3 ? 'hot' : 'ln'}">${n} days</span>`;
  const voice = ReturnlyNudge.VOICES[ReturnlyNudge.vibeOf(settings.vibe).voice].name;
  return `<section class="st st-remind2">
<div class="st-rhero">
  <p class="st-rt">${esc(stClock(time))}</p><p class="st-rd">${settings.gentle ? 'Halfway, then 7, 3 and 1 day before' : 'Tomorrow · every day while a return is open'}</p>
  <div class="st-rnotif"><span class="st-appi">R.</span><div class="st-grow"><div class="st-sb"><b>${esc(r ? r.title : 'Your next return, remembered.')}</b><span>${esc(stClock(time))}</span></div><p>${esc(r ? r.body : 'Add a purchase to see your countdown here.')}</p></div>
    <div class="st-racts" aria-hidden="true"><span>Start return</span><span>Tomorrow</span><span>Keep it</span></div></div>
</div>
<div class="st-g6"><h1 class="st-d1">Your daily <em>nudge.</em></h1><p class="st-m">One a day while a return is open. It stops when it’s sent, kept or closed.</p></div>
<div class="st-g8"><span class="st-k">Remind me at</span><div class="st-tgrid">${ST_TIMES.map(t => `<button data-st-time="${t}" class="${time === t ? 'on' : ''}">${stClock(t)}<small>${stAmPm(t)}</small></button>`).join('')}<label class="${custom ? 'on' : ''}">${custom ? esc(stClock(time)) : 'Other'}<small>${custom ? stAmPm(time) : 'pick a time'}</small><input type="time" id="st-time" value="${esc(time)}" aria-label="Pick a reminder time"></label></div></div>
<div class="st-g8"><span class="st-k">How often</span><div class="st-often">
  <button class="st-tile${settings.gentle ? '' : ' on'}" data-st-often="daily">${bars([1, 1, 1, 1, 1, 1, 1])}<span><b>Every day</b><small>Until it’s sent, kept or closed</small></span></button>
  <button class="st-tile${settings.gentle ? ' on' : ''}" data-st-often="gentle">${bars([0, 1, 0, 0, 1, 1, 1])}<span><b>Fewer</b><small>Halfway, then 7, 3 and 1 day before</small></span></button>
</div></div>
<div class="st-g8"><span class="st-k">Where it reaches you</span><div class="st-list">
  <button class="st-li" id="enable-notifications">${ic('i-bell')}<span class="st-grow">Notifications<small>${on ? 'On, even when Returnly is closed' : perm === 'denied' ? 'Blocked in your browser settings' : 'Turn on to get your nudge'}</small></span><span class="st-switch${on ? ' on' : ''}" aria-hidden="true"></span></button>
  <form id="reminder-extra-form" class="st-form">
    <label class="st-li">${ic('i-mail')}<span class="st-grow">Email me too<small>${emailOk ? 'Only 3 days before, if I miss the nudge' : 'Email isn’t set up yet'}</small></span><input type="checkbox" name="email" class="st-sw" ${emailOn ? 'checked' : ''} ${emailOk ? '' : 'disabled'}></label>
    <button type="button" class="st-li" id="st-calendar-all">${ic('i-cal')}<span class="st-grow">Calendar<small>Every return date in one file</small></span>${status('Add ›')}</button>
    <button type="button" class="st-li" data-view="vibe">${ic('i-vibe')}<span class="st-grow">Voice<small>${esc(voice)}</small></span>${status('My vibe ›')}</button>
    <div class="st-g8 st-quietg"><div class="st-sb"><span class="st-k">Quiet hours</span>${status(qs && qe ? 'On' : 'Off', qs && qe)}</div>
      <div class="st-quiet2"><label><span class="st-k">From</span><input type="time" name="quietStart" value="${esc(qs)}" aria-label="Quiet hours from"></label><i>–</i><label><span class="st-k">Until</span><input type="time" name="quietEnd" value="${esc(qe)}" aria-label="Quiet hours until"></label></div></div>
  </form>
</div></div>
<div class="st-g8"><div class="st-sb"><span class="st-k">Coming up</span><span class="st-m sm">Next ${coming.length || 3} nudges</span></div>
${coming.length ? `<div class="st-coming">${coming.map(({ on, i, left }) => { const d = C.parseDate(on); return `<button class="st-cday" data-open="${esc(i.id)}"><span class="st-cdt"><span class="st-k">${d.toLocaleDateString('en-US', { weekday: 'short' })}</span><b>${d.getDate()}</b></span>${stThumb(i)}<span class="st-grow"><b>${esc(i.name)}</b><small>${esc(i.retailer || '')}${i.retailer ? ' · ' : ''}${left <= 1 ? (left ? 'due the next day' : 'due that day') : left + ' days left'}</small></span>${tag(left)}</button>`; }).join('')}</div>` : `<p class="st-m st-none">Add a purchase with a return window and your next nudges show up here.</p>`}</div>
<button class="st-pill g" data-st-test>Send me a test nudge</button>
</section>`;
};

document.addEventListener('click', e => {
  const b = e.target.closest('button');
  if (!b) return;
  if (b.dataset.stVtab !== undefined) {
    stVibeTab = Number(b.dataset.stVtab);
    const tabs = b.closest('.st-ptabs');
    tabs.style.setProperty('--i', stVibeTab);
    tabs.querySelectorAll('button').forEach(x => { const sel = x === b; x.classList.toggle('on', sel); x.setAttribute('aria-selected', sel); });
    document.querySelectorAll('[data-st-panel]').forEach(p => { p.hidden = Number(p.dataset.stPanel) !== stVibeTab; });
  }
  if (b.dataset.stOften) {
    const gentle = b.dataset.stOften === 'gentle';
    if (!!settings.gentle !== gentle) { settings.gentle = gentle; save(); render(); toast(gentle ? 'Fewer nudges: halfway, then 7, 3 and 1 days before.' : 'Every day until it’s sent, kept or closed.'); }
  }
  if (b.hasAttribute('data-st-test')) { const n = document.getElementById('enable-notifications'); if (n) n.click(); }
});
