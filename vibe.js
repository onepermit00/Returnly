/* My vibe: choose the voice your return reminders speak in, and fine-tune humor, reminder style and emojis.
   nudge.js applies the choice to every reminder (push, email and the app). */
const renderBeforeVibe = render;
const VibeN = ReturnlyNudge;
let vibeOpenRow = '';
const vibeIcons = {
  bestie: '<path d="M10 3.5 11.6 8 16 9.6 11.6 11.2 10 15.7 8.4 11.2 4 9.6 8.4 8z"/><path d="M17.5 13.5 18.3 15.7 20.5 16.5 18.3 17.3 17.5 19.5 16.7 17.3 14.5 16.5 16.7 15.7z"/><path d="M17.5 3.5 18 5 19.5 5.5 18 6 17.5 7.5 17 6 15.5 5.5 17 5z"/>',
  bro: '<path d="M7 11V7.5a1.5 1.5 0 0 1 3 0V11"/><path d="M10 10V6.5a1.5 1.5 0 0 1 3 0V10"/><path d="M13 10V7.5a1.5 1.5 0 0 1 3 0V12"/><path d="M7 10.5 5.8 9.6a1.6 1.6 0 0 0-2.2 2.3L7.5 17a5 5 0 0 0 4 2H13a4 4 0 0 0 4-4V12"/>',
  straight: '<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.5"/><circle cx="12" cy="12" r="1" fill="currentColor"/>',
  comedian: '<circle cx="12" cy="12" r="8.5"/><path d="M8 14.5a4.5 4.5 0 0 0 8 0z"/><path d="M8.5 10h.01M15.5 10h.01"/>',
  supportive: '<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/>',
  assistant: '<rect x="3.5" y="7.5" width="17" height="12" rx="2"/><path d="M9 7.5V6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v1.5"/><path d="M3.5 12.5h17"/>',
  humor: '<circle cx="12" cy="12" r="8.5"/><path d="M8.5 14a4 4 0 0 0 7 0"/><path d="M9 9.8h.01M15 9.8h.01"/>',
  style: '<path d="M4 7h10M18 7h2M4 12h4M12 12h8M4 17h12"/><circle cx="16" cy="7" r="2"/><circle cx="10" cy="12" r="2"/><circle cx="18" cy="17" r="2"/>',
  emoji: '<circle cx="12" cy="12" r="8.5"/><path d="M8 13.5a4.5 4.5 0 0 0 8 0"/><circle cx="9" cy="9.8" r=".8" fill="currentColor"/><circle cx="15" cy="9.8" r=".8" fill="currentColor"/>',
  bell: '<path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15z"/><path d="M10 20.5a2 2 0 0 0 4 0"/>',
  chevron: '<path d="m9 6 6 6-6 6"/>'
};
const vibeVoices = [
  ['bestie', 'Playful, dramatic and always on your side.'],
  ['bro', 'Casual, confident, with a little roasting.'],
  ['straight', 'Just the facts and the deadline.'],
  ['comedian', 'Clever jokes and a little light sarcasm.'],
  ['supportive', 'Warm, encouraging and judgment-free.'],
  ['assistant', 'Polished, discreet and professional.']
];
const vibeTunes = [
  ['humor', 'Humor', [['none', 'No humor'], ['little', 'A little humor is fine'], ['lots', 'Bring the jokes']]],
  ['style', 'Reminder style', [['gentle', 'Keep it gentle'], ['firm', 'Be firm when needed'], ['direct', 'Always direct']]],
  ['emoji', 'Emojis', [['none', 'No emojis'], ['few', 'A few are fine'], ['lots', 'Love them']]]
];
const vibeIcon = d => `<svg class="vibe-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;

function vibePage() {
  const v = VibeN.vibeOf(settings.vibe);
  return `<section class="vibe">
<p class="vibe-eyebrow">Your reminders. Your personality.</p>
<h1 class="vibe-title">My vibe.</h1>
<p class="vibe-intro">A different mood? Change your voice whenever you like.</p>
<h2 class="vibe-label">Choose your voice</h2>
<div class="vibe-voices" role="radiogroup" aria-label="Choose your voice">${vibeVoices.map(([id, desc]) => `<label class="vibe-voice${v.voice === id ? ' selected' : ''}"><input type="radio" name="vibe-voice" value="${id}"${v.voice === id ? ' checked' : ''}>${vibeIcon(vibeIcons[id])}<span><strong>${esc(VibeN.VOICES[id].name)}</strong><small>${esc(desc)}</small></span><i class="vibe-radio" aria-hidden="true"></i></label>`).join('')}</div>
<h2 class="vibe-label">Fine-tune your vibe</h2>
<div class="vibe-tunes">${vibeTunes.map(([key, label, opts]) => `<details class="vibe-tune" data-tune="${key}"${vibeOpenRow === key ? ' open' : ''}><summary>${vibeIcon(vibeIcons[key])}<span><strong>${label}</strong><small>${esc(opts.find(o => o[0] === v[key])[1])}</small></span>${vibeIcon(vibeIcons.chevron)}</summary><div class="vibe-options" role="radiogroup" aria-label="${label}">${opts.map(([val, text]) => `<label class="${v[key] === val ? 'selected' : ''}"><input type="radio" name="vibe-${key}" value="${val}"${v[key] === val ? ' checked' : ''}>${text}</label>`).join('')}</div></details>`).join('')}</div>
<p class="vibe-note">Your voice is used for every reminder: notifications, emails and the Reminders preview. The dates, amounts and next steps stay the same.</p>
</section>`;
}

render = function () {
  if (view !== 'vibe') { renderBeforeVibe(); return; }
  if (typeof stopJourneyCamera === 'function') stopJourneyCamera();
  document.body.classList.remove('flow-active', 'home-active');
  if (typeof ensureMenuChrome === 'function') ensureMenuChrome();
  const fp = $('#flow-profile'); if (fp) fp.hidden = true;
  $('#main').innerHTML = vibePage();
  syncHomeProfile();
  syncTabs();
};

document.addEventListener('change', e => {
  const t = e.target;
  if (!t.name || !t.name.startsWith('vibe-')) return;
  const key = t.name === 'vibe-voice' ? 'voice' : t.name.slice(5);
  settings.vibe = { ...VibeN.vibeOf(settings.vibe), [key]: t.value };
  vibeOpenRow = key === 'voice' ? '' : key;
  save(); render();
  toast(key === 'voice' ? `${VibeN.VOICES[t.value].name} it is. Your reminders will sound like this.` : 'Your vibe is saved.');
});
document.addEventListener('toggle', e => { if (e.target.matches?.('.vibe-tune') && e.target.open) vibeOpenRow = e.target.dataset.tune; }, true);
