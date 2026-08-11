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
  const ADULT_PACKING = [
    ['15', 'Unterhosen'], ['15 Paar', 'Socken'], ['15', 'T-Shirts'], ['3', 'Langarmshirts'], ['3', 'Pullover oder Fleecejacken'],
    ['4', 'lange Hosen'], ['3', 'kurze Hosen'], ['2', 'Schlafanzüge'], ['2', 'Badeoutfits'], ['1', 'Regenjacke'],
    ['1', 'Regenhose'], ['1', 'leichte warme Jacke'], ['1', 'Sonnenhut oder Cap'], ['1', 'dünne Mütze'],
    ['1 Paar', 'wasserdichte Schuhe'], ['1 Paar', 'Sneaker'], ['1 Paar', 'Sandalen oder Wasserschuhe']
  ];
  const BABY_PACKING = [
    ['18', 'Bodys – 12 kurz, 6 lang (15 Tage + 3 Ersatz)'], ['15 Paar', 'Socken'], ['10', 'weiche Hosen oder Leggings'],
    ['4', 'kurze Hosen oder Bloomers'], ['3', 'Pullover oder Cardigans'], ['3', 'Schlafanzüge'], ['2', 'Schlafsäcke in unterschiedlicher Wärme'],
    ['1', 'Fleece- oder Wollanzug'], ['1', 'wasserdichter Matschanzug'], ['2', 'Sonnenhüte'], ['1', 'dünne Mütze'],
    ['2', 'UV-Badeanzüge'], ['2', 'wiederverwendbare Schwimmwindeln'], ['10', 'Einweg-Schwimmwindeln'],
    ['1 Paar', 'Wasserschuhe'], ['1 Paar', 'weiche geschlossene Schuhe'], ['100', 'Windeln – ca. 6 pro Tag plus 10 Reserve'],
    ['6 Packungen', 'Feuchttücher'], ['3', 'Lätzchen'], ['2', 'Flaschen oder Trinklernbecher'], ['1', 'Babybesteck mit Schale'],
    ['1', 'Wickelunterlage'], ['1 Tube', 'Wundschutzcreme'], ['2', 'Spannbettlaken'], ['1', 'Reisebett – nur falls von Airbnb nicht bestätigt'],
    ['1', 'Babyphone'], ['1', 'kleines Nachtlicht'], ['1', 'vertrautes Kuscheltier oder Schmusetuch']
  ];
  const TODDLER_PACKING = [
    ['18', 'Unterhosen – 15 Tage + 3 Ersatz'], ['18', 'T-Shirts – 15 Tage + 3 Ersatz'], ['15 Paar', 'Socken'],
    ['6', 'Langarmshirts'], ['10', 'Hosen oder Leggings'], ['5', 'kurze Hosen'], ['3', 'Pullover oder Fleecejacken'],
    ['3', 'Schlafanzüge'], ['2', 'Badeoutfits mit UV-Shirt'], ['1', 'Regenjacke'], ['1', 'Regenhose'],
    ['1', 'leichte warme Jacke'], ['2', 'Sonnenhüte oder Caps'], ['1', 'dünne Mütze'], ['1 Paar', 'Gummistiefel'],
    ['1 Paar', 'Sneaker'], ['1 Paar', 'Sandalen oder Wasserschuhe'], ['15', 'Nacht-Windelhosen, falls noch benötigt']
  ];
  const FAMILY_PACKING = [
    ['5', 'Tagesrucksäcke – einer pro Person'], ['5', 'Trinkflaschen – eine pro Person'], ['2', 'Kinder-Rettungswesten in passender Größe'],
    ['1', 'Kinderwagen'], ['1', 'Kinderwagen-Regenhülle'], ['1', 'Kinderwagen-Mückennetz'], ['1', 'Kinderwagen-Sonnenschutz'], ['1', 'Babytrage'],
    ['2 Flaschen', 'Sonnencreme LSF 50 für die Kinder'], ['1', 'altersgerechter Mücken- und Zeckenschutz'], ['1', 'Zeckenzange oder Zeckenkarte'],
    ['1', 'Reiseapotheke mit Fieberthermometer und gewohnten Medikamenten'], ['1', 'Erste-Hilfe-Set'], ['2', 'Powerbanks'],
    ['1 Satz', 'Reisedokumente, Versicherungskarten und Buchungsunterlagen'], ['1', 'Auto-Ladekabel plus Ladekarten'],
    ['1', 'Picknickdecke'], ['5', 'schnelltrocknende Badehandtücher'], ['1', 'Waschmittel für mindestens zwei Wäschen']
  ];
  const ESSENTIALS_PACKING = [
    ['5', 'Zahnbürsten'], ['2 Tuben', 'Zahnpasta – Erwachsene und Kinder'], ['1', 'Shampoo'], ['1', 'Duschgel'],
    ['1', 'Haarbürste oder Kamm'], ['1 Set', 'Nagelschere und Nagelfeile'], ['30', 'Windel- und Müllbeutel'], ['1', 'Kulturbeutel mit persönlichen Pflegeprodukten'],
    ['15 Tage + 3 Dosen', 'persönliche Dauermedikamente als Reserve'], ['1', 'Fieber- und Schmerzmittel für Erwachsene'],
    ['2 (1 je Kind)', 'vom Kinderarzt bekannte Fieber-/Schmerzmittel mit Dosierhilfe'], ['1', 'kleine Kühltasche mit zwei Kühlakkus'],
    ['1 Tagesration', 'Babyessen, Milch und Familiensnacks für Anreise/ersten Abend'], ['5 Sets', 'wiederverwendbares Reisebesteck'],
    ['1 je Gerät', 'Ladekabel für Handys, Uhren und Babyphone'], ['1', 'USB-Mehrfachladegerät'], ['1', 'Kamera oder genügend freier Handyspeicher'],
    ['3', 'Sonnenbrillen für Erwachsene'], ['2', 'kindgerechte Sonnenbrillen'], ['1', 'Wäschebeutel für nasse und schmutzige Kleidung']
  ];
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
      .featurebar{display:flex;gap:8px;flex-wrap:wrap;margin:12px 0}.movebtn{border:1px solid var(--line);background:white;border-radius:12px;padding:9px 11px;font-weight:750;color:var(--ink)}.movebtn:disabled{opacity:.35}.liveweather{margin:11px 0;padding:12px;border-radius:16px;background:linear-gradient(135deg,#eef7fb,#fffdf8);border:1px solid #cbdde4}.liveweather strong{display:block}.weatherchoice{font-size:.78rem;font-weight:800;color:var(--forest)}.hourswarn{margin:10px 0;padding:11px;border-radius:14px;background:#fff1b9}.hourswarn.closed{background:#efd8d2}.hourswarn.open{background:#dfe9df}.votearea{margin:12px 0;padding:13px;border-radius:17px;background:#f4f7f4}.votebuttons{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin:9px 0}.votebtn{border:1px solid var(--line);background:white;border-radius:12px;padding:9px 5px;font-size:.78rem}.votebtn.active{background:var(--forest);color:white}.votesummary{font-size:.79rem;color:var(--muted)}.syncgrid{display:grid;gap:10px}.syncgrid label{display:grid;gap:4px;font-weight:750}.syncgrid input{border:1px solid var(--line);background:#fffdf8;border-radius:13px;padding:11px;font:inherit;width:100%}.syncstatus{padding:10px 12px;border-radius:13px;background:var(--sage);margin:10px 0}.syncstatus.error{background:var(--rose)}.syncstatus.busy{background:var(--sky)}.emergencygrid{display:grid;gap:12px}.emergencycard h3{margin:4px 0;font:1.35rem Georgia,serif}.call{display:inline-flex;align-items:center;justify-content:center;text-decoration:none;background:var(--forest);color:white;border-radius:13px;padding:10px 12px;font-weight:800;margin:4px 4px 4px 0}.call.alt{background:var(--sage);color:var(--ink)}.tiny{font-size:.76rem}.shopstatus{display:inline-block;margin:4px 0 8px;padding:6px 9px;border-radius:999px;background:var(--sage);font-size:.78rem;font-weight:800}.shopstatus.closed{background:var(--rose)}.shopstatus.soon{background:#fff1b9}details.setup{margin-top:12px}details.setup summary{cursor:pointer;font-weight:800}.packingintro{background:linear-gradient(135deg,#dbeaf1,#fffdf8)}.packingweather{padding:12px;border-radius:15px;background:#fff1b9;margin:12px 0}.packprogress{height:10px;border-radius:999px;background:#e4e8e5;overflow:hidden;margin:8px 0}.packprogress span{display:block;height:100%;background:var(--forest);transition:width .2s}.packgrid{display:grid;gap:12px;margin-top:12px}.packgroup h3{font:1.35rem Georgia,serif;margin:3px 0}.packitem{display:grid;grid-template-columns:25px 74px 1fr;gap:8px;align-items:start;padding:8px 0;border-bottom:1px solid var(--line)}.packitem:last-child{border-bottom:0}.packitem input{width:21px;height:21px;margin:1px 0}.packqty{font-size:.76rem;font-weight:850;color:var(--forest);background:var(--sage);border-radius:9px;padding:3px 6px;text-align:center}.packitem:has(input:checked){opacity:.55;text-decoration:line-through}.annikaonly{border:2px solid #d9aeca}@media(min-width:760px){.emergencygrid{grid-template-columns:1fr 1fr}.syncgrid{grid-template-columns:1fr 1fr}.syncgrid .wide{grid-column:1/-1}.packgrid{grid-template-columns:1fr 1fr}}
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
    if (!document.getElementById('packing')) {
      document.getElementById('stays').insertAdjacentHTML('beforebegin', `
        <section id="packing"><h2>Was kommt mit?</h2><p class="muted">Wettergerechte Familien-Packliste für 15 Reisetage. Häkchen werden lokal gespeichert und bei eingerichteter Synchronisierung mit der Familie geteilt.</p><div id="tripPacking"></div></section>`);
    }
    const forecastPanel = document.querySelector('#forecast .panel');
    if (forecastPanel && !document.getElementById('liveWeatherStatus')) forecastPanel.insertAdjacentHTML('beforeend', '<p class="muted" id="liveWeatherStatus">Live-Wetter wird geladen …</p>');
    decorateShopCards(); fillSyncForm(); bindSyncControls();
  }

  function visiblePackingGroups() {
    const adultTitle = VOTERS.includes(profile) ? `Kleidung für ${profile}` : 'Kleidung je erwachsene Person';
    const adultNote = VOTERS.includes(profile) ? '15 tägliche Garnituren, dazu wenige kombinierbare Wärmeschichten.' : 'Diese Menge gilt jeweils für Annika, Julian und Anna Lena.';
    const groups = [
      { id: 'adult', title: adultTitle, note: adultNote, items: ADULT_PACKING },
      { id: 'family', title: 'Für alle & unterwegs', note: 'See, Wald, Autofahrt, Sonne, Regen und medizinische Basics.', items: FAMILY_PACKING },
      { id: 'essentials', title: 'Pflege, Essen & Technik', note: 'Die Dinge, die zwischen Kleidung und Ausflügen leicht vergessen werden.', items: ESSENTIALS_PACKING }
    ];
    if (profile === 'Annika' || profile === 'Familie') {
      groups.push(
        { id: 'baby', title: 'Annikas Kinder · Baby, 11 Monate', note: 'Drei Ersatzgarnituren für Spucken, Essen und nasse Seetage.', items: BABY_PACKING, annika: true },
        { id: 'toddler', title: 'Annikas Kinder · fast 3 Jahre', note: 'Drei Ersatz-Basics und mehr Hosen für Wald, Spielplatz und Matsch.', items: TODDLER_PACKING, annika: true }
      );
    }
    return groups;
  }
  function packingWeatherText() {
    const forecast = BASE_IDS.map(weatherForDate).filter(Boolean);
    if (!forecast.length) return 'Småland im August kann warme Badetage, kühle Abende und kräftige Schauer in derselben Woche bringen. Deshalb bleiben Sonne, Regen und eine warme Schicht gleichzeitig auf der Liste.';
    const hot = forecast.filter(day => Number(day.max) >= 25).length;
    const rainy = forecast.filter(day => Number(day.probability) >= 50 || Number(day.precipitation) >= 2).length;
    const cool = forecast.filter(day => Number(day.min) <= 12).length;
    const hotText = hot === 1 ? '1 heißer Tag' : `${hot} heiße Tage`, rainyText = rainy === 1 ? '1 deutlich nasser Tag' : `${rainy} deutlich nasse Tage`, coolText = cool === 1 ? '1 kühle Nacht' : `${cool} kühle Nächte`;
    return `Aktuell verfügbarer Live-Trend: ${forecast.length} Urlaubstage · ${hotText} ab 25 °C · ${rainyText} · ${coolText} bis 12 °C. Darum: Badesachen und LSF 50 genauso einpacken wie Regenzeug, Fleece und wasserdichte Schuhe.`;
  }
  function packingKey(group, index) { return `trip_${group.id}_${index}`; }
  function updatePackingProgress(groups = visiblePackingGroups()) {
    const keys = groups.flatMap(group => group.items.map((item, index) => packingKey(group, index)));
    const checked = keys.filter(key => packs[key]).length, percent = keys.length ? Math.round(checked / keys.length * 100) : 0;
    const text = document.getElementById('packingProgressText'), bar = document.querySelector('#packingProgress span');
    if (text) text.textContent = `${checked} von ${keys.length} Punkten gepackt`;
    if (bar) bar.style.width = `${percent}%`;
  }
  function renderPackingList() {
    const root = document.getElementById('tripPacking'); if (!root) return;
    const groups = visiblePackingGroups();
    const childHint = profile === 'Annika' ? 'Die beiden Kinderlisten werden in Annikas Profil zusätzlich angezeigt.' : profile === 'Familie' ? 'In der Familienansicht sind auch Annikas beide Kinderlisten sichtbar.' : 'Die beiden Kinderlisten erscheinen zusätzlich im Profil Annika und in der Familienansicht.';
    root.innerHTML = `<article class="panel packingintro"><div class="eyebrow">Berechnet für 14.–28. August 2026</div><p><b>15 Tage · 3 Erwachsene · ein Baby mit 11 Monaten · ein Kind mit fast 3 Jahren</b></p><p>Unterwäsche, Socken und T-Shirts sind für jeden Tag eingeplant. Bei den Kindern kommen drei Ersatz-Basics dazu. Nur die kombinierbaren Außenschichten bleiben bewusst knapp: drei Pullover, eine Regenjacke und eine Regenhose pro Person.</p><div class="packingweather"><b>🌦 Wetter-Abgleich</b><br>${escapeHtml(packingWeatherText())}</div><p class="muted">Beide Häuser haben eine Waschmaschine. Die Mengen funktionieren trotzdem ohne Pflichtwäsche; Waschen ist nur Reserve für Matsch, Eis und Windelunfälle. ${escapeHtml(childHint)}</p><b id="packingProgressText"></b><div class="packprogress" aria-hidden="true"><span></span></div></article><div class="packgrid">${groups.map(group => `<article class="panel packgroup ${group.annika ? 'annikaonly' : ''}"><div class="eyebrow">${group.annika ? 'Nur Annika & Familie' : 'Gemeinsam abhaken'}</div><h3>${escapeHtml(group.title)}</h3><p class="muted">${escapeHtml(group.note)}</p>${group.items.map((item, index) => { const key = packingKey(group, index); return `<label class="packitem"><input type="checkbox" data-trip-pack="${key}" ${packs[key] ? 'checked' : ''}><span class="packqty">${escapeHtml(item[0])}</span><span>${escapeHtml(item[1])}</span></label>`; }).join('')}</article>`).join('')}</div>`;
    document.querySelectorAll('[data-trip-pack]').forEach(input => input.onchange = () => { packs[input.dataset.tripPack] = input.checked; localStorage.setItem('swedenPacks', JSON.stringify(packs)); updatePackingProgress(groups); scheduleSync(); });
    updatePackingProgress(groups);
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
    enhancedRecs(document.querySelector('.filter.active')?.dataset.f || 'all'); openDates.forEach(date => document.querySelector(`[data-date="${date}"]`)?.classList.add('open')); decorateShopCards(); renderPackingList();
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
