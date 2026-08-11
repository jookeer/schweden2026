(() => {
  const DATE_YEAR = 2026;
  const BASE_IDS = D.map(day => day[0]);
  const BASE_BY_ID = Object.fromEntries(D.map((day, index) => [day[0], { day, index }]));
  const VOTERS = ['Annika', 'Julian', 'Anna Lena'];
  const VOTE_OPTIONS = [['must', '🔥 Unbedingt'], ['maybe', '🙂 Vielleicht'], ['no', '🙅 Keine Lust']];
  const WEATHER_LABELS = { sun: ['☀️', 'Sonne'], mixed: ['🌦', 'Wechselhaft'], rain: ['🌧', 'Regen'] };
  const ERIK_HOURS = [null, null, [11, 18], [11, 16], [11, 18], [11, 16], [10, 15]];
  const EMMAUS_HOURS = [null, [12, 18], [12, 18], [12, 18], [12, 18], [12, 18], [12, 15]];
  const OPENING_ACTIVITY_IDS = new Set(['16', '17', '18', '21', '23', '25', '26']);
  const WEATHER_CACHE_MS = 30 * 60 * 1000;
  const parseStored = (key, fallback) => { try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; } };
  const escapeHtml = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
  const makeTripCode = () => `family-${crypto.randomUUID().slice(0, 8)}`;
  const sameMembers = order => Array.isArray(order) && order.length === BASE_IDS.length && BASE_IDS.every(id => order.includes(id));
  let activityOrder = parseStored('swedenActivityOrder', BASE_IDS.slice());
  if (!sameMembers(activityOrder)) activityOrder = BASE_IDS.slice();
  let votes = parseStored('swedenVotes', {});
  let liveWeather = parseStored('swedenWeatherCache', { fetchedAt: 0, h1: {}, h2: {} });
  let syncConfig = parseStored('swedenSyncConfig', { url: '', key: '', tripCode: makeTripCode() });
  let localUpdated = Number(localStorage.getItem('swedenSharedUpdated') || 0);
  let syncTimer = null;
  let activeEdit = null;

  const phaseForDate = date => Number(date) <= 20 ? 'h1' : Number(date) === 21 ? 'move' : 'h2';
  const orderedDays = () => BASE_IDS.map((slotId, slotIndex) => {
    const activityId = activityOrder[slotIndex];
    const base = BASE_BY_ID[activityId] || BASE_BY_ID[slotId];
    const slot = BASE_BY_ID[slotId].day;
    const result = [...base.day];
    result[0] = slot[0]; result[1] = slot[1]; result._activityId = activityId; result._baseIndex = base.index;
    return result;
  });
  const activityTitle = day => edits[day._activityId]?.title?.trim() || day[2];
  const activityDetails = day => edits[day._activityId]?.details?.trim() || day[9];
  const weatherForDate = date => liveWeather[phaseForDate(date) === 'h2' ? 'h2' : 'h1']?.[date];

  function installStyles() {
    if (document.getElementById('featureStyles')) return;
    document.head.insertAdjacentHTML('beforeend', `<style id="featureStyles">
      .featurebar{display:flex;gap:8px;flex-wrap:wrap;margin:12px 0}.movebtn{border:1px solid var(--line);background:white;border-radius:12px;padding:9px 11px;font-weight:750;color:var(--ink)}.movebtn:disabled{opacity:.35}.liveweather{margin:11px 0;padding:12px;border-radius:16px;background:linear-gradient(135deg,#eef7fb,#fffdf8);border:1px solid #cbdde4}.liveweather strong{display:block}.weatherchoice{font-size:.78rem;font-weight:800;color:var(--forest)}.hourswarn{margin:10px 0;padding:11px;border-radius:14px;background:#fff1b9}.hourswarn.closed{background:#efd8d2}.hourswarn.open{background:#dfe9df}.votearea{margin:12px 0;padding:13px;border-radius:17px;background:#f4f7f4}.votebuttons{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin:9px 0}.votebtn{border:1px solid var(--line);background:white;border-radius:12px;padding:9px 5px;font-size:.78rem}.votebtn.active{background:var(--forest);color:white}.votesummary{font-size:.79rem;color:var(--muted)}.syncgrid{display:grid;gap:10px}.syncgrid label{display:grid;gap:4px;font-weight:750}.syncgrid input{border:1px solid var(--line);background:#fffdf8;border-radius:13px;padding:11px;font:inherit;width:100%}.syncstatus{padding:10px 12px;border-radius:13px;background:var(--sage);margin:10px 0}.syncstatus.error{background:var(--rose)}.syncstatus.busy{background:var(--sky)}.emergencygrid{display:grid;gap:12px}.emergencycard h3{margin:4px 0;font:1.35rem Georgia,serif}.call{display:inline-flex;align-items:center;justify-content:center;text-decoration:none;background:var(--forest);color:white;border-radius:13px;padding:10px 12px;font-weight:800;margin:4px 4px 4px 0}.call.alt{background:var(--sage);color:var(--ink)}.tiny{font-size:.76rem}.shopstatus{display:inline-block;margin:4px 0 8px;padding:6px 9px;border-radius:999px;background:var(--sage);font-size:.78rem;font-weight:800}.shopstatus.closed{background:var(--rose)}.shopstatus.soon{background:#fff1b9}details.setup{margin-top:12px}details.setup summary{cursor:pointer;font-weight:800}@media(min-width:760px){.emergencygrid{grid-template-columns:1fr 1fr}.syncgrid{grid-template-columns:1fr 1fr}.syncgrid .wide{grid-column:1/-1}}
    </style>`);
  }

  function installSections() {
    if (!document.getElementById('sync')) {
      document.getElementById('charging').insertAdjacentHTML('beforebegin', `
        <section id="sync"><h2>Familien-Synchronisierung</h2><div class="panel"><p>Pläne, Reihenfolge, Abstimmungen, Packlisten und erledigte Tage können über Supabase auf allen Handys gleich gehalten werden. Ohne Zugangsdaten arbeitet die App weiter lokal und offline.</p><div class="syncstatus" id="syncStatus">Nur lokal gespeichert</div><form id="syncForm" class="syncgrid"><label>Supabase-Projekt-URL<input id="syncUrl" type="url" placeholder="https://projekt.supabase.co" autocomplete="off"></label><label>Öffentlicher Publishable-/Anon-Key<input id="syncKey" type="password" placeholder="sb_publishable_… oder eyJ…" autocomplete="off"></label><label class="wide">Familien-Code<input id="syncCode" minlength="12" maxlength="80" autocomplete="off"></label><div class="actions wide"><button class="btn" type="submit">Verbindung speichern</button><button class="btn alt" type="button" id="syncNow">Jetzt synchronisieren</button></div></form><div class="featurebar"><button class="movebtn" id="copySyncCode" type="button">Familien-Code kopieren</button><a class="movebtn" href="https://supabase.com/dashboard" target="_blank" rel="noopener">Supabase öffnen</a></div><p class="muted">Projekt-URL und öffentlicher Schlüssel bleiben auf dem Gerät. Niemals einen Secret- oder Service-Role-Key eintragen. Der gleiche Familien-Code muss auf allen Geräten verwendet werden.</p><details class="setup"><summary>Einmalige Datenbank-Einrichtung</summary><p class="muted">Den Inhalt von <b>supabase-setup.sql</b> einmal im Supabase SQL Editor ausführen. Die Reisedaten enthalten keine privaten Angaben.</p></details></div></section>
        <section id="emergency"><h2>Notfall & wichtige Infos</h2><p class="muted">Alle Angaben sind öffentlich und offline in der App gespeichert. Bei Lebensgefahr immer 112.</p><div class="emergencygrid">
          <article class="panel emergencycard"><div class="eyebrow">Soforthilfe in Schweden</div><h3>Wichtige Nummern</h3><a class="call" href="tel:112">🚨 112 Notruf</a><a class="call alt" href="tel:1177">🩺 1177 Gesundheitsberatung</a><a class="call alt" href="tel:11414">👮 114 14 Polizei</a><a class="call alt" href="tel:11313">ℹ️ 113 13 Unfallinformationen</a><p class="tiny">112 bei akuter Gefahr. 1177 berät medizinisch rund um die Uhr. Mit ausländischer SIM: 1177 über +46 771 11 77 00, Polizei über +46 77 114 14 00 und 113 13 über +46 77 33 113 13.</p></article>
          <article class="panel emergencycard"><div class="eyebrow">Panne & Abschleppen</div><h3>Assistancekåren, landesweit</h3><a class="call" href="tel:+46771912912">🚐 +46 771 912 912</a><p>24 Stunden, Englisch und Schwedisch. Standort in Google Maps und Kennzeichen bereithalten. Bei Gefahr zuerst 112.</p><a class="btn alt" href="https://assistancekaren.se/other-languages/" target="_blank" rel="noopener">Öffentliche Informationen</a></article>
          <article class="panel emergencycard"><div class="eyebrow">Nahe Haus 1</div><h3>Centrallasarettet Växjö</h3><p>Akutmottagning · Strandvägen 8, Växjö<br>Växel: 0470-58 80 00</p><div class="actions"><a class="btn" href="tel:+46470588000">Anrufen</a><a class="btn alt" href="https://www.google.com/maps/search/?api=1&amp;query=Centrallasarettet+Växjö+Strandvägen+8" target="_blank" rel="noopener">Navigation</a></div><p class="muted">Apotek Hjärtat ICA Maxi, Hejaregatan – laut Region Kronoberg täglich 7–22 Uhr. Öffnung online prüfen.</p></article>
          <article class="panel emergencycard"><div class="eyebrow">Nahe Haus 2</div><h3>Akutmottagningen Ljungby</h3><p>Ljungby sjukhus · Kyrkogatan 2, Ljungby<br>0372-58 51 00 · rund um die Uhr</p><div class="actions"><a class="btn" href="tel:+46372585100">Anrufen</a><a class="btn alt" href="https://www.google.com/maps/search/?api=1&amp;query=Akutmottagningen+Ljungby+Kyrkogatan+2" target="_blank" rel="noopener">Navigation</a></div><p class="muted">Nähere Apotheke: Apotek Hjärtat Ryd, Hantverkaregatan 6. Werktags geöffnet; aktuelle Zeiten online prüfen.</p></article>
          <article class="panel emergencycard"><div class="eyebrow">Airbnb · öffentliche Angaben</div><h3>Unterkünfte</h3><p><b>Haus 1:</b> Gastgeber Björn · Check-in ab 15 Uhr · Check-out vor 11 Uhr</p><p><b>Haus 2:</b> Gastgeberin Caroline · Check-in ab 15 Uhr · Check-out vor 10 Uhr</p><div class="actions"><a class="btn alt" href="https://www.airbnb.de/rooms/47854840" target="_blank" rel="noopener">Haus 1 bei Airbnb</a><a class="btn alt" href="https://www.airbnb.de/rooms/824554793746367330" target="_blank" rel="noopener">Haus 2 bei Airbnb</a></div><p class="muted">Beide Unterkünfte bieten laut Inserat WLAN. Zugangsdaten stehen nur in Airbnb oder vor Ort. Nachrichten ausschließlich über Airbnb senden; private Telefonnummern sind nicht gespeichert.</p></article>
          <article class="panel emergencycard"><div class="eyebrow">Apotheke finden</div><h3>Öffnungszeiten prüfen</h3><p>Für Medikamente außerhalb der genannten Zeiten zuerst 1177 fragen oder die aktuell geöffnete Apotheke suchen.</p><div class="actions"><a class="btn" href="https://www.google.com/maps/search/?api=1&amp;query=Apotek+near+Växjö" target="_blank" rel="noopener">Bei Haus 1</a><a class="btn alt" href="https://www.google.com/maps/search/?api=1&amp;query=Apotek+near+Hulevik" target="_blank" rel="noopener">Bei Haus 2</a></div></article>
        </div></section>`);
    }
    const forecastPanel = document.querySelector('#forecast .panel');
    if (forecastPanel && !document.getElementById('liveWeatherStatus')) forecastPanel.insertAdjacentHTML('beforeend', '<p class="muted" id="liveWeatherStatus">Live-Wetter wird geladen …</p>');
    decorateShopCards(); fillSyncForm(); bindSyncControls();
  }

  function swedenClock() {
    const parts = Object.fromEntries(new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Stockholm', weekday: 'short', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false }).formatToParts(new Date()).filter(part => part.type !== 'literal').map(part => [part.type, part.value]));
    return { weekday: { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 }[parts.weekday], minutes: Number(parts.hour) * 60 + Number(parts.minute), date: `${parts.year}-${parts.month}-${parts.day}` };
  }
  function shopStatus(name, schedule) {
    const now = swedenClock(), hours = schedule[now.weekday];
    if (!hours) return { cls: 'closed', text: `${name}: heute geschlossen` };
    const open = hours[0] * 60, close = hours[1] * 60;
    if (now.minutes < open) return { cls: 'soon', text: `${name}: öffnet heute um ${hours[0]}:00 Uhr` };
    if (now.minutes >= close) return { cls: 'closed', text: `${name}: heute bereits geschlossen` };
    if (close - now.minutes <= 90) return { cls: 'soon', text: `${name}: schließt in ${close - now.minutes} Minuten` };
    return { cls: '', text: `${name}: heute geöffnet bis ${hours[1]}:00 Uhr` };
  }
  function decorateShopCards() {
    [...document.querySelectorAll('#secondhand .place')].forEach(card => {
      const title = card.querySelector('h3')?.textContent;
      const status = title === 'Erikshjälpen' ? shopStatus(title, ERIK_HOURS) : title === 'Emmaus' ? shopStatus(title, EMMAUS_HOURS) : null;
      if (!status) return;
      let badge = card.querySelector('.shopstatus');
      if (!badge) { badge = document.createElement('div'); card.querySelector('h3').insertAdjacentElement('afterend', badge); }
      badge.className = `shopstatus ${status.cls}`; badge.textContent = status.text;
    });
  }
  function openingWarning(day) {
    if (!OPENING_ACTIVITY_IDS.has(day._activityId)) return '';
    const tripDate = `${DATE_YEAR}-08-${day[0].padStart(2, '0')}`;
    if (day._activityId === '18' && swedenClock().date === tripDate) {
      const erik = shopStatus('Erikshjälpen', ERIK_HOURS), emmaus = shopStatus('Emmaus', EMMAUS_HOURS);
      const cls = erik.cls === 'closed' && emmaus.cls === 'closed' ? 'closed' : erik.cls === 'soon' || emmaus.cls === 'soon' ? '' : 'open';
      return `<div class="hourswarn ${cls}"><b>🕒 Öffnungszeiten heute</b><br>${escapeHtml(erik.text)} · ${escapeHtml(emmaus.text)}</div>`;
    }
    return '<div class="hourswarn"><b>🕒 Vor der Abfahrt</b><br>Öffnungszeiten auf der offiziellen Seite prüfen – Ferien- und Saisonzeiten können abweichen.</div>';
  }

  const classifyWeather = (code, probability) => Number(probability) >= 55 || Number(code) >= 51 ? 'rain' : Number(probability) <= 25 && [0, 1, 2].includes(Number(code)) ? 'sun' : 'mixed';
  function weatherMarkup(day) {
    const weather = weatherForDate(day[0]);
    if (!weather) return '<div class="liveweather"><strong>🌐 Live-Wetter</strong><span class="muted">Für diesen Tag liegt im 16-Tage-Fenster noch keine Prognose vor.</span></div>';
    const [icon, label] = WEATHER_LABELS[weather.category];
    return `<div class="liveweather"><strong>${icon} ${Math.round(weather.max)} °C / ${Math.round(weather.min)} °C</strong><span>${weather.probability}% Regenrisiko · ${Math.round(weather.precipitation * 10) / 10} mm</span><div class="weatherchoice">Empfehlung: ${label}-Variante</div></div>`;
  }
  async function fetchHouseWeather(latitude, longitude) {
    const params = new URLSearchParams({ latitude, longitude, daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max', timezone: 'Europe/Stockholm', forecast_days: '16' });
    const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`);
    if (!response.ok) throw new Error(`Wetterdienst: ${response.status}`);
    const data = await response.json(), result = {};
    (data.daily?.time || []).forEach((date, index) => { const day = date.slice(-2); result[day] = { code: data.daily.weather_code[index], max: data.daily.temperature_2m_max[index], min: data.daily.temperature_2m_min[index], precipitation: data.daily.precipitation_sum[index], probability: data.daily.precipitation_probability_max[index], category: classifyWeather(data.daily.weather_code[index], data.daily.precipitation_probability_max[index]) }; });
    return result;
  }
  async function refreshWeather(force = false) {
    const status = document.getElementById('liveWeatherStatus');
    if (!force && Date.now() - Number(liveWeather.fetchedAt || 0) < WEATHER_CACHE_MS) { updateWeatherStatus(); enhancedRender(); return; }
    if (status) status.textContent = 'Live-Wetter wird über Open-Meteo aktualisiert …';
    try {
      const [h1, h2] = await Promise.all([fetchHouseWeather('57.107665', '15.099936'), fetchHouseWeather('56.623444', '14.614194')]);
      liveWeather = { fetchedAt: Date.now(), h1, h2 }; localStorage.setItem('swedenWeatherCache', JSON.stringify(liveWeather)); updateWeatherStatus(); enhancedRender();
    } catch { if (status) status.textContent = liveWeather.fetchedAt ? 'Offline: letzte gespeicherte Wetterprognose wird verwendet.' : 'Live-Wetter gerade nicht erreichbar. Die festen Wettervarianten bleiben verfügbar.'; }
  }
  function updateWeatherStatus() {
    const status = document.getElementById('liveWeatherStatus'); if (!status) return;
    if (!liveWeather.fetchedAt) { status.textContent = 'Noch keine Live-Prognose gespeichert.'; return; }
    status.innerHTML = `Live-Daten von <a href="https://open-meteo.com/" target="_blank" rel="noopener">Open-Meteo</a> · aktualisiert ${new Intl.DateTimeFormat('de-DE', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(liveWeather.fetchedAt))} · <button class="movebtn" id="weatherRefresh" type="button">Neu laden</button>`;
    document.getElementById('weatherRefresh').onclick = () => refreshWeather(true);
  }

  function voteMarkup(day) {
    const activityVotes = votes[day._activityId] || {}, current = VOTERS.includes(profile) ? activityVotes[profile] : null;
    const buttons = VOTE_OPTIONS.map(([value, label]) => `<button class="votebtn ${current === value ? 'active' : ''}" type="button" data-vote="${value}" data-activity="${day._activityId}" ${VOTERS.includes(profile) ? '' : 'disabled'}>${label}</button>`).join('');
    const summaries = VOTE_OPTIONS.map(([value, label]) => { const names = VOTERS.filter(name => activityVotes[name] === value); return names.length ? `${label}: ${names.join(', ')}` : ''; }).filter(Boolean).join(' · ') || 'Noch keine Stimmen';
    const hint = profile === 'Familie' ? 'Gemeinsame Ansicht – ohne eigene Stimme.' : VOTERS.includes(profile) ? `Deine Stimme als ${profile}.` : 'Zuerst oben ein Profil auswählen.';
    return `<div class="votearea"><b>👨‍👩‍👧 Familien-Abstimmung</b><div class="votebuttons">${buttons}</div><div class="votesummary">${escapeHtml(hint)}<br>${escapeHtml(summaries)}</div></div>`;
  }
  function moveMarkup(day, index) {
    const days = orderedDays(), previousAllowed = index > 0 && phaseForDate(days[index - 1][0]) === phaseForDate(day[0]), nextAllowed = index < days.length - 1 && phaseForDate(days[index + 1][0]) === phaseForDate(day[0]);
    return `<div class="featurebar"><button class="movebtn" type="button" data-move="-1" data-slot="${day[0]}" ${previousAllowed ? '' : 'disabled'}>↑ Einen Tag früher</button><button class="movebtn" type="button" data-move="1" data-slot="${day[0]}" ${nextAllowed ? '' : 'disabled'}>↓ Einen Tag später</button></div>`;
  }

  function enhancedRecs(filter = 'all') {
    const days = orderedDays(), available = filter === 'all' ? days.filter(day => !done[day._baseIndex]).slice(0, 4) : days.filter(day => day[6].split(' ').includes(filter)).slice(0, 6);
    document.getElementById('recs').innerHTML = available.map(day => { const weather = weatherForDate(day[0]), weatherText = weather ? ` · ${WEATHER_LABELS[weather.category][0]} ${Math.round(weather.max)} °C` : ''; return `<button class="rec" data-open="${day[0]}"><img src="${I[day[5]]}" alt=""><div><b>${escapeHtml(activityTitle(day))}</b><br><small>${day[4]} · ${day[8]}${weatherText}</small></div></button>`; }).join('') || '<p>Kein eigener Programmtag – ein Haus- und Seetag passt immer.</p>';
    document.querySelectorAll('[data-open]').forEach(button => button.onclick = () => { document.getElementById('days').scrollIntoView(); const card = document.querySelector(`[data-date="${button.dataset.open}"]`); card?.classList.add('open'); setTimeout(() => card?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 200); });
  }
  function enhancedRender() {
    const openDates = [...document.querySelectorAll('.card.open')].map(card => card.dataset.date), days = orderedDays();
    document.getElementById('name').textContent = profile || 'ihr'; document.getElementById('profileBtn').textContent = profile || 'Profil'; document.getElementById('progress').textContent = Object.values(done).filter(Boolean).length + ' von ' + D.length + ' Tagen erlebt';
    document.getElementById('rows').innerHTML = days.map(day => `<tr><td>${day[0]}.08. ${day[1]}</td><td>${day[3]}</td><td>${escapeHtml(activityTitle(day))}${edits[day._activityId] ? ' <span class="editmark">geändert</span>' : ''}${day[19] ? ' <b>(optional)</b>' : ''}</td><td>${day[4]}</td><td>${day[7]}</td><td>${day[8]}</td></tr>`).join('');
    document.getElementById('schedule').innerHTML = days.map((day, index) => {
      const baseIndex = day._baseIndex, packlist = day[16].split('|').map((item, itemIndex) => `<label><input type="checkbox" data-p="${baseIndex}_${itemIndex}" ${packs[baseIndex + '_' + itemIndex] ? 'checked' : ''}>${escapeHtml(item)}</label>`).join(''), auntTip = profile === 'Anna Lena' && aunt[day._activityId] ? `<div class="aunt"><b>🌸 Nur für Anna Lena</b><br>${aunt[day._activityId]}</div>` : '';
      return `<article class="card ${done[baseIndex] ? 'done' : ''}" data-date="${day[0]}" data-activity="${day._activityId}" data-i="${baseIndex}"><div class="daytop"><div class="date">${day[0]}<small>${day[1]}</small></div><button class="titlebtn"><b>${escapeHtml(activityTitle(day))}</b><span class="muted">${day[3]} · ${day[4]}${edits[day._activityId] ? ' · eigener Plan' : ''}</span></button><button class="check">${done[baseIndex] ? '✓' : '○'}</button></div><div class="detail"><img class="cover" src="${I[day[5]]}" alt=""><div class="body"><div class="badges">${day[19] ? '<span class="badge optional">Optional</span>' : ''}<span class="badge">${day[4]}</span>${day[7] !== '–' ? '<span class="badge">⚡ ' + day[7] + '</span>' : ''}</div>${weatherMarkup(day)}${openingWarning(day)}<p>${escapeHtml(activityDetails(day))}</p><div class="weather"><div><b>☀️ Sonne</b><span>${day[10]}</span></div><div><b>🌦 Wechselhaft</b><span>${day[11]}</span></div><div><b>🌧 Regen</b><span>${day[12]}</span></div></div>${moveMarkup(day, index)}<div class="actions"><a class="btn" href="${day[17]}" target="_blank" rel="noopener">🗺 Route ansehen</a><a class="btn alt" href="${day[18]}" target="_blank" rel="noopener">➤ Navigation starten</a><button class="btn editday" type="button" data-edit="${day[0]}">✏️ Tagesaktion ändern</button></div>${voteMarkup(day)}<div class="super"><b>⭐ Heute lohnt sich</b><br>${day[13]}</div><div class="super blue"><b>😴 Wenn alle müde sind</b><br>${day[14]}</div>${auntTip}<div class="list"><b>💡 Insider-Tipp</b><br>${day[15]}</div><div class="list pack"><b>🎒 Packliste</b>${packlist}</div><p class="muted"><b>Kosten:</b> ${day[8]}</p></div></div></article>`;
    }).join('');
    document.querySelectorAll('.titlebtn').forEach(button => button.onclick = () => button.closest('.card').classList.toggle('open'));
    document.querySelectorAll('.check').forEach(button => button.onclick = () => { const key = button.closest('.card').dataset.i; done[key] = !done[key]; localStorage.setItem('swedenDone', JSON.stringify(done)); enhancedRender(); scheduleSync(); });
    document.querySelectorAll('[data-p]').forEach(input => input.onchange = () => { packs[input.dataset.p] = input.checked; localStorage.setItem('swedenPacks', JSON.stringify(packs)); scheduleSync(); });
    document.querySelectorAll('[data-edit]').forEach(button => button.onclick = () => enhancedOpenEditor(button.dataset.edit));
    document.querySelectorAll('[data-move]').forEach(button => button.onclick = () => moveActivity(button.dataset.slot, Number(button.dataset.move)));
    document.querySelectorAll('[data-vote]').forEach(button => button.onclick = () => castVote(button.dataset.activity, button.dataset.vote, button.closest('.card').dataset.date));
    enhancedRecs(document.querySelector('.filter.active')?.dataset.f || 'all'); openDates.forEach(date => document.querySelector(`[data-date="${date}"]`)?.classList.add('open')); decorateShopCards();
  }
  function moveActivity(slotId, direction) {
    const slotIndex = BASE_IDS.indexOf(slotId), targetIndex = slotIndex + direction;
    if (targetIndex < 0 || targetIndex >= BASE_IDS.length || phaseForDate(BASE_IDS[slotIndex]) !== phaseForDate(BASE_IDS[targetIndex])) return;
    [activityOrder[slotIndex], activityOrder[targetIndex]] = [activityOrder[targetIndex], activityOrder[slotIndex]]; localStorage.setItem('swedenActivityOrder', JSON.stringify(activityOrder)); enhancedRender(); document.querySelector(`[data-date="${BASE_IDS[targetIndex]}"]`)?.classList.add('open'); scheduleSync();
  }
  function castVote(activityId, value, slotDate) {
    if (!VOTERS.includes(profile)) return; votes[activityId] ||= {}; if (votes[activityId][profile] === value) delete votes[activityId][profile]; else votes[activityId][profile] = value; localStorage.setItem('swedenVotes', JSON.stringify(votes)); enhancedRender(); document.querySelector(`[data-date="${slotDate}"]`)?.classList.add('open'); scheduleSync();
  }
  function enhancedOpenEditor(slotDate) {
    const day = orderedDays().find(item => item[0] === slotDate); if (!day) return; activeEdit = { slotDate, activityId: day._activityId }; document.getElementById('editDate').textContent = slotDate + '. August · ' + day[1]; document.getElementById('editTitle').value = activityTitle(day); document.getElementById('editDetails').value = activityDetails(day); document.getElementById('editReset').hidden = !edits[day._activityId]; editModal.classList.add('show'); setTimeout(() => document.getElementById('editTitle').focus(), 50);
  }
  function closeEnhancedEditor() { editModal.classList.remove('show'); activeEdit = null; }
  function bindEditor() {
    openEditor = enhancedOpenEditor; document.getElementById('editCancel').onclick = closeEnhancedEditor;
    document.getElementById('editForm').onsubmit = event => { event.preventDefault(); if (!activeEdit) return; edits[activeEdit.activityId] = { title: document.getElementById('editTitle').value.trim(), details: document.getElementById('editDetails').value.trim() }; localStorage.setItem('swedenDayEdits', JSON.stringify(edits)); const slotDate = activeEdit.slotDate; closeEnhancedEditor(); enhancedRender(); document.querySelector(`[data-date="${slotDate}"]`)?.classList.add('open'); scheduleSync(); };
    document.getElementById('editReset').onclick = () => { if (!activeEdit) return; const slotDate = activeEdit.slotDate; delete edits[activeEdit.activityId]; localStorage.setItem('swedenDayEdits', JSON.stringify(edits)); closeEnhancedEditor(); enhancedRender(); document.querySelector(`[data-date="${slotDate}"]`)?.classList.add('open'); scheduleSync(); };
    editModal.onclick = event => { if (event.target === editModal) closeEnhancedEditor(); };
  }

  const validSyncConfig = () => /^https:\/\/.+\.supabase\.co\/?$/i.test(syncConfig.url || '') && (syncConfig.key || '').length > 20 && (syncConfig.tripCode || '').length >= 12;
  function fillSyncForm() { if (!document.getElementById('syncUrl')) return; document.getElementById('syncUrl').value = syncConfig.url || ''; document.getElementById('syncKey').value = syncConfig.key || ''; document.getElementById('syncCode').value = syncConfig.tripCode || makeTripCode(); setSyncStatus(validSyncConfig() ? 'Verbindung gespeichert · bereit zum Synchronisieren' : 'Nur lokal gespeichert'); }
  function setSyncStatus(message, kind = '') { const element = document.getElementById('syncStatus'); if (element) { element.className = `syncstatus ${kind}`; element.textContent = message; } }
  function bindSyncControls() {
    const form = document.getElementById('syncForm'); if (!form || form.dataset.bound) return; form.dataset.bound = '1';
    form.onsubmit = event => { event.preventDefault(); syncConfig = { url: document.getElementById('syncUrl').value.trim().replace(/\/$/, ''), key: document.getElementById('syncKey').value.trim(), tripCode: document.getElementById('syncCode').value.trim() }; localStorage.setItem('swedenSyncConfig', JSON.stringify(syncConfig)); if (!validSyncConfig()) { setSyncStatus('Bitte gültige Projekt-URL, öffentlichen Schlüssel und Familien-Code eintragen.', 'error'); return; } pullRemote(); };
    document.getElementById('syncNow').onclick = () => pullRemote();
    document.getElementById('copySyncCode').onclick = async () => { const input = document.getElementById('syncCode'); try { await navigator.clipboard.writeText(input.value); setSyncStatus('Familien-Code kopiert. Auf den anderen Geräten denselben Code eintragen.'); } catch { input.select(); setSyncStatus('Familien-Code markiert – jetzt kopieren.'); } };
  }
  function syncHeaders(write = false) { const headers = { apikey: syncConfig.key }; if (syncConfig.key.startsWith('eyJ')) headers.Authorization = `Bearer ${syncConfig.key}`; if (write) { headers['Content-Type'] = 'application/json'; headers.Prefer = 'resolution=merge-duplicates,return=minimal'; } return headers; }
  const sharedPayload = () => ({ version: 1, updatedAt: localUpdated, activityOrder, votes, edits, done, packs });
  async function pushRemote(initial = false) {
    if (!validSyncConfig()) return; if (!initial) setSyncStatus('Synchronisierung läuft …', 'busy');
    try { const response = await fetch(`${syncConfig.url}/rest/v1/trip_state?on_conflict=trip_code`, { method: 'POST', headers: syncHeaders(true), body: JSON.stringify({ trip_code: syncConfig.tripCode, payload: sharedPayload(), updated_at: new Date().toISOString() }) }); if (!response.ok) throw new Error(await response.text() || `HTTP ${response.status}`); setSyncStatus(`Synchronisiert · ${new Intl.DateTimeFormat('de-DE', { timeStyle: 'short' }).format(new Date())}`); } catch (error) { setSyncStatus(`Synchronisierung fehlgeschlagen: ${String(error.message || error).slice(0, 120)}`, 'error'); }
  }
  async function pullRemote() {
    if (!validSyncConfig()) { setSyncStatus('Nur lokal gespeichert – Supabase noch nicht eingerichtet.'); return; } setSyncStatus('Gemeinsamen Stand laden …', 'busy');
    try { const response = await fetch(`${syncConfig.url}/rest/v1/trip_state?trip_code=eq.${encodeURIComponent(syncConfig.tripCode)}&select=payload,updated_at`, { headers: syncHeaders() }); if (!response.ok) throw new Error(await response.text() || `HTTP ${response.status}`); const rows = await response.json(); if (!rows.length) { if (!localUpdated) localUpdated = Date.now(); localStorage.setItem('swedenSharedUpdated', String(localUpdated)); await pushRemote(true); return; } const payload = rows[0].payload || {}; if (Number(payload.updatedAt || 0) + 1000 < localUpdated) { await pushRemote(true); return; } applySharedPayload(payload); setSyncStatus(`Gemeinsamer Stand geladen · ${new Intl.DateTimeFormat('de-DE', { timeStyle: 'short' }).format(new Date())}`); } catch (error) { setSyncStatus(`Verbindung fehlgeschlagen: ${String(error.message || error).slice(0, 120)}`, 'error'); }
  }
  function applySharedPayload(payload) {
    if (sameMembers(payload.activityOrder)) activityOrder = payload.activityOrder; if (payload.votes && typeof payload.votes === 'object') votes = payload.votes; if (payload.edits && typeof payload.edits === 'object') edits = payload.edits; if (payload.done && typeof payload.done === 'object') done = payload.done; if (payload.packs && typeof payload.packs === 'object') packs = payload.packs; localUpdated = Number(payload.updatedAt || Date.now());
    localStorage.setItem('swedenActivityOrder', JSON.stringify(activityOrder)); localStorage.setItem('swedenVotes', JSON.stringify(votes)); localStorage.setItem('swedenDayEdits', JSON.stringify(edits)); localStorage.setItem('swedenDone', JSON.stringify(done)); localStorage.setItem('swedenPacks', JSON.stringify(packs)); localStorage.setItem('swedenSharedUpdated', String(localUpdated)); enhancedRender();
  }
  function scheduleSync() { localUpdated = Date.now(); localStorage.setItem('swedenSharedUpdated', String(localUpdated)); if (!validSyncConfig()) { setSyncStatus('Lokal gespeichert · Supabase noch nicht verbunden'); return; } setSyncStatus('Änderung gespeichert · Synchronisierung folgt …', 'busy'); clearTimeout(syncTimer); syncTimer = setTimeout(() => pushRemote(), 700); }

  installStyles(); installSections(); bindEditor(); render = enhancedRender; recs = enhancedRecs; enhancedRender(); updateWeatherStatus(); refreshWeather(); if (validSyncConfig()) pullRemote();
  setInterval(() => { if (document.visibilityState === 'visible' && validSyncConfig()) pullRemote(); }, 60000);
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') { refreshWeather(); if (validSyncConfig()) pullRemote(); } });
})();
