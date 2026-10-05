/* Atelier Méridien — maps (Japan route, Kyoto micro-map, world « qui est où »), the client page
   « Itinéraire » and the trip downloads (.ics, .csv, printable programme).
   Land: Natural Earth (public domain). Every point is a real coordinate; nothing is traced by hand. */
(() => {
  'use strict';
  const { esc, fmtEur, fmtD, fmtT, fmtNum, ic, NB } = M;
  const D = window.DATA;
  const T = D.trip;
  const G = window.GEO || null;
  const SUN = window.SUN || null;
  const r1 = (n) => Math.round(n * 10) / 10;

  /* ——— Japan frame (viewBox 0 0 800 468) ——— */
  const jp = (lat, lon) => (G ? G.japan(lat, lon) : [(lon - 132.8) * Math.cos((35.6 * Math.PI) / 180) * 120, (37.6 - lat) * 120]);
  const pathOf = (pts, proj) => pts.map(([la, lo], i) => { const [x, y] = proj(la, lo); return `${i ? 'L' : 'M'}${r1(x)} ${r1(y)}`; }).join('');
  const stopById = (id) => T.stops.find((s) => s.id === id);
  const dayOf = (j) => T.days[j - 1];

  // where the brass marker sits for a given day
  function markerAt(j) {
    const segs = T.segments.filter((s) => s.day === j);
    if (segs.length) {
      const last = segs[segs.length - 1].pts;
      return jp(...last[last.length - 1]);
    }
    const dd = dayOf(j);
    const s = stopById(dd.stop) || stopById('tokyo');
    return jp(s.lat, s.lon);
  }

  function grid() {
    let g = '';
    for (let lon = 133; lon <= 140; lon++) {
      const [x] = jp(36, lon);
      g += `<line x1="${r1(x)}" x2="${r1(x)}" y1="0" y2="468" class="jm__grid"/>`;
      if (lon !== 135) g += `<text x="${r1(x) + 3}" y="461" class="jm__tick">${lon}° E</text>`;
    }
    for (let lat = 34; lat <= 37; lat++) {
      const [, y] = jp(lat, 136);
      g += `<line x1="0" x2="800" y1="${r1(y)}" y2="${r1(y)}" class="jm__grid"/><text x="4" y="${r1(y) - 3}" class="jm__tick">${lat}° N</text>`;
    }
    return g;
  }
  function meridian135() {
    const [x] = jp(36, 135);
    return `<line x1="${r1(x)}" x2="${r1(x)}" y1="0" y2="468" class="jm__m135"/><text class="jm__m135t" transform="translate(${r1(x) - 5} 300) rotate(-90)" text-anchor="middle">135° E · méridien de l’heure japonaise (UTC+9)</text>`;
  }
  function seaLabels() {
    const L = (G && G.JAPAN_SEA_LABELS) || [
      { text: 'Mer du Japon', x: 175.6, y: 48, anchor: 'middle' },
      { text: 'Océan Pacifique', x: 634.2, y: 414, anchor: 'middle' },
      { text: 'Mer intérieure de Seto', x: 48.8, y: 402, anchor: 'middle' },
    ];
    // keep each label inside the frame (≈ 6.4 units per character at 14 px italic)
    return L.map((l) => {
      const half = (l.text.length * 6.4) / 2;
      const x = Math.min(800 - half - 6, Math.max(half + 6, l.x));
      return `<text x="${r1(x)}" y="${l.y}" text-anchor="middle" class="jm__sea">${esc(l.text)}</text>`;
    }).join('');
  }
  function scaleBar() {
    const w = 107.9; // 100 km = 0.899° of latitude
    return `<g transform="translate(${780 - w} 444)"><line x1="0" x2="${w}" y1="0" y2="0" class="jm__scale"/><line x1="0" x2="0" y1="-4" y2="4" class="jm__scale"/><line x1="${w}" x2="${w}" y1="-4" y2="4" class="jm__scale"/><text x="${w / 2}" y="-6" text-anchor="middle" class="jm__tick">100 km</text></g><g transform="translate(772 30)"><path d="M0 -12 4 0H-4z" class="jm__north"/><text y="12" text-anchor="middle" class="jm__tick">N</text></g>`;
  }
  const segClass = (s, day) => `jm__seg jm__seg--${s.mode} ${s.day < day ? 'is-past' : s.day === day ? 'is-on' : 'is-next'}`;
  function segments(day) {
    return T.segments.map((s, i) => `<path d="${pathOf(s.pts, jp)}" class="${segClass(s, day)}" data-day="${s.day}" data-i="${i}"/>`).join('');
  }
  function stopsSvg(day, { labels = true, only = null } = {}) {
    const cur = dayOf(day);
    return T.stops
      .filter((s) => !only || only.includes(s.id))
      .map((s, i) => {
        const [x, y] = jp(s.lat, s.lon);
        const on = cur && cur.stop === s.id;
        const label = labels ? `<text x="${r1(x + s.dx)}" y="${r1(y + s.dy)}" text-anchor="${s.anchor}" class="jm__label ${on ? 'is-on' : ''}" data-stop-label="${s.id}">${esc(s.name)}${s.nights ? `<tspan class="jm__n" dx="4">${esc(s.nights)}</tspan>` : ''}</text>` : '';
        return `<g class="jm__stop ${on ? 'is-on' : ''}" data-stop="${s.id}"><circle cx="${r1(x)}" cy="${r1(y)}" r="4.5"/><text x="${r1(x)}" y="${r1(y) + 3.2}" text-anchor="middle" class="jm__num">${i + 1}</text></g>${label}`;
      })
      .join('');
  }
  const land = (cls = 'jm__land') => (G ? `<path d="${G.JAPAN_LAND_D}" class="${cls}"/>` : '');

  function japan({ day = 1, labels = true } = {}) {
    const [mx, my] = markerAt(day);
    return `<svg class="jm" viewBox="0 0 800 468" role="img" aria-label="Carte de l’itinéraire au Japon, jour ${day}"><rect width="800" height="468" class="jm__bg"/>${land()}${grid()}${meridian135()}${seaLabels()}${scaleBar()}<g class="jm__segs">${segments(day)}</g>${stopsSvg(day, { labels })}<g class="jm__marker" transform="translate(${r1(mx)} ${r1(my)})"><circle r="14" class="jm__halo"/><circle r="6" class="jm__dot"/></g></svg>`;
  }

  function japanThumb() {
    const keep = ['tokyo', 'osaka'];
    const pts = T.stops.map((s) => { const [x, y] = jp(s.lat, s.lon); return `<circle cx="${r1(x)}" cy="${r1(y)}" r="5" class="jt__dot"/>`; }).join('');
    const lbl = T.stops.filter((s) => keep.includes(s.id)).map((s) => { const [x, y] = jp(s.lat, s.lon); return `<text x="${r1(x + (s.id === 'tokyo' ? 12 : 12))}" y="${r1(y + (s.id === 'tokyo' ? -10 : 22))}" class="jt__label">${esc(s.name)}</text>`; }).join('');
    return `<svg class="jt" viewBox="20 20 760 430" role="img" aria-label="Aperçu de l’itinéraire, de Tokyo à Osaka"><rect x="20" y="20" width="760" height="430" class="jm__bg"/>${land('jm__land')}${T.segments.map((s) => `<path d="${pathOf(s.pts, jp)}" class="jt__seg jm__seg--${s.mode}"/>`).join('')}${pts}${lbl}</svg>`;
  }

  /* ——— Kyoto micro-map (320 × 180) ——— */
  const KB = { lon0: 135.734, lon1: 135.808, lat0: 34.982, lat1: 35.016, w: 320, h: 180 };
  const kp = (lat, lon) => [((lon - KB.lon0) / (KB.lon1 - KB.lon0)) * KB.w, ((KB.lat1 - lat) / (KB.lat1 - KB.lat0)) * KB.h];
  const dist = (a, b) => (SUN ? SUN.haversine(a.lat, a.lon, b.lat, b.lon) : 0);
  const distLabel = (km) => (km < 1 ? `≈${NB}${Math.round((km * 1000) / 50) * 50}${NB}m` : `≈${NB}${fmtNum(Math.round(km * 10) / 10, 1)}${NB}km`);
  function kyoto({ choice = null } = {}) {
    const K = T.kyoto;
    let g = '';
    for (let lon = 135.74; lon <= 135.801; lon += 0.01) {
      const [x] = kp(35, lon);
      g += `<line x1="${r1(x)}" x2="${r1(x)}" y1="0" y2="180" class="km__grid"/><text x="${r1(x) + 2}" y="176" class="km__tick">${fmtNum(lon, 2)}° E</text>`;
    }
    for (let lat = 34.99; lat <= 35.011; lat += 0.01) {
      const [, y] = kp(lat, 135.75);
      g += `<line x1="0" x2="320" y1="${r1(y)}" y2="${r1(y)}" class="km__grid"/><text x="3" y="${r1(y) - 2}" class="km__tick">${fmtNum(lat, 2)}° N</text>`;
    }
    const river = [[35.016, 135.7722], [35.0085, 135.7716], [35.0035, 135.7712], [34.9955, 135.7688], [34.9885, 135.7676], [34.982, 135.7662]];
    const rv = `<path d="${pathOf(river, kp)}" class="km__river"/><text class="km__rivert" transform="translate(${r1(kp(35.012, 135.7716)[0]) - 4} ${r1(kp(35.012, 135.7716)[1])}) rotate(-88)" text-anchor="middle">Kamo-gawa</text>`;
    const [gx, gy] = kp(K.gion.lat, K.gion.lon);
    const [sx, sy] = kp(K.station.lat, K.station.lon);
    const house = (o, dxl) => {
      const [x, y] = kp(o.lat, o.lon);
      const on = choice === o.key;
      const mid = [(x + gx) / 2, (y + gy) / 2];
      return `<line x1="${r1(x)}" y1="${r1(y)}" x2="${r1(gx)}" y2="${r1(gy)}" class="km__link ${on ? 'is-on' : ''}"/><text x="${r1(mid[0] + 6)}" y="${r1(mid[1] + 3)}" class="km__dist">${distLabel(dist(o, K.gion))}</text><circle cx="${r1(x)}" cy="${r1(y)}" r="${on ? 5.5 : 4.5}" class="km__house ${on ? 'is-on' : ''}"/><text x="${r1(x + dxl)}" y="${r1(y + 4)}" text-anchor="${dxl < 0 ? 'end' : 'start'}" class="km__label">${esc(o.key === 'machiya' ? 'Machiya' : 'Ryokan')}</text>`;
    };
    return `<svg class="km" viewBox="0 0 320 180" role="img" aria-label="Plan de situation à Kyoto"><rect width="320" height="180" class="jm__bg"/>${g}${rv}${house(K.machiya, -9)}${house(K.ryokan, 9)}<circle cx="${r1(gx)}" cy="${r1(gy)}" r="5" class="km__gion"/><text x="${r1(gx + 8)}" y="${r1(gy + 4)}" class="km__label">Gion</text><rect x="${r1(sx - 3.5)}" y="${r1(sy - 3.5)}" width="7" height="7" class="km__station"/><text x="${r1(sx + 8)}" y="${r1(sy + 4)}" class="km__label km__label--s">Gare de Kyoto</text></svg>`;
  }

  /* ——— world map (720 × 360) with the night of right now ——— */
  const wp = (lat, lon) => (G ? G.world(lat, lon) : [(lon + 180) * 2, (90 - lat) * 2]);
  const nightD = (t) => (SUN ? SUN.nightPath(t.getTime(), wp, 720, 360) : '');
  const termD = (t) => (SUN && SUN.terminatorLine ? SUN.terminatorLine(t.getTime(), wp) : '');
  function clusters(threshold) {
    const pts = D.travelling.map((x) => ({ ...x, xy: wp(x.lat, x.lon) }));
    const out = [];
    pts.forEach((p) => {
      const c = out.find((c) => Math.hypot(c.xy[0] - p.xy[0], c.xy[1] - p.xy[1]) < threshold);
      if (c) {
        c.items.push(p);
        c.xy = [(c.xy[0] * (c.items.length - 1) + p.xy[0]) / c.items.length, (c.xy[1] * (c.items.length - 1) + p.xy[1]) / c.items.length];
      } else out.push({ xy: p.xy.slice(), items: [p] });
    });
    return out;
  }
  function world({ mini = false } = {}) {
    const t = M.now();
    const alertOpen = M.garnier().status === 'open';
    let g = '';
    for (let lon = -150; lon <= 150; lon += 30) g += `<line x1="${(lon + 180) * 2}" x2="${(lon + 180) * 2}" y1="0" y2="360" class="wm__grid"/>`;
    for (let lat = -60; lat <= 60; lat += 30) if (lat) g += `<line x1="0" x2="720" y1="${(90 - lat) * 2}" y2="${(90 - lat) * 2}" class="wm__grid"/>`;
    const tro = [[0, 'Équateur'], [23.44, 'Tropique du Cancer'], [-23.44, 'Tropique du Capricorne']].map(([lat, n]) => `<line x1="0" x2="720" y1="${r1((90 - lat) * 2)}" y2="${r1((90 - lat) * 2)}" class="wm__trop"/>${mini ? '' : `<text x="6" y="${r1((90 - lat) * 2) - 3}" class="wm__tick">${n}</text>`}`).join('');
    const cl = clusters(mini ? 30 : 13);
    const pts = cl
      .map((c) => {
        const ids = c.items.map((x) => x.id).join(',');
        const alert = c.items.some((x) => x.id === 'garnier') && alertOpen;
        const [x, y] = c.xy;
        const n = c.items.length;
        const label = n > 1 ? `${c.items[0].country === c.items[1].country ? c.items[0].country : `${n} dossiers`} · ${n}` : null;
        const timeLbl = !mini && n === 1 ? `<text x="${r1(x + 8)}" y="${r1(y + 4)}" class="wm__time" data-live="time" data-tz="${esc(c.items[0].tz)}">${fmtT(t, c.items[0].tz)}</text>` : '';
        const countLbl = n > 1 ? `<text x="${r1(x + 9)}" y="${r1(y + 4)}" class="wm__time">${esc(mini ? `${n}` : label)}</text>` : '';
        return `<g class="wm__pt ${alert ? 'is-alert' : ''}" tabindex="0" role="button" aria-label="${esc(c.items.map((x) => `${x.client}, ${x.place}`).join(' ; '))}" data-wpt="${ids}">${alert ? `<circle cx="${r1(x)}" cy="${r1(y)}" r="10" class="wm__ring"/>` : ''}<circle cx="${r1(x)}" cy="${r1(y)}" r="${n > 1 ? 6.5 : 5}" class="wm__dot"/>${n > 1 ? `<text x="${r1(x)}" y="${r1(y) + 3}" text-anchor="middle" class="wm__n">${n}</text>` : ''}${timeLbl}${countLbl}</g>`;
      })
      .join('');
    return `<div class="wmap ${mini ? 'wmap--mini' : ''}"><svg class="wm" viewBox="0 0 720 360" role="img" aria-label="Carte du monde : les voyageurs en ce moment et la nuit"><rect width="720" height="360" class="wm__bg"/>${G ? `<path d="${G.WORLD_LAND_D}" class="wm__land"/>` : ''}${g}${tro}<path class="wm__night" d="${nightD(t)}"/><path class="wm__term" d="${termD(t)}"/>${pts}</svg>${mini ? '<div class="wmap__legend"><i></i>Nuit en ce moment</div>' : ''}</div>`;
  }
  function pointCard(ids) {
    const t = M.now();
    return ids
      .split(',')
      .map((id) => {
        const x = D.travelling.find((y) => y.id === id);
        if (!x) return '';
        const night = SUN ? SUN.elevation(t.getTime(), x.lat, x.lon) < -0.833 : false;
        const state = x.id === 'garnier' ? (M.garnier().status === 'open' ? 'Alerte' : 'RAS · trajet de remplacement envoyé') : 'RAS';
        return `<div class="wcard"><b>${esc(x.client)}</b><div>${esc(x.place)}, ${esc(x.country)} · J${x.day}/${x.of}</div><div>Heure locale ${fmtT(t, x.tz)} · ${night ? 'nuit' : 'jour'}</div><div class="mini">Conseiller : ${esc(D.people[x.advisor].short)} · dernier contact : ${esc(x.lastContact)}</div><div>État : ${esc(state)}</div></div>`;
      })
      .join('<hr class="wcard__sep">');
  }
  const showCard = (el, ev) => {
    const r = el.getBoundingClientRect();
    const x = ev && ev.clientX ? ev.clientX : r.left + r.width / 2;
    const y = ev && ev.clientY ? ev.clientY : r.top + r.height / 2;
    M.tip.show(pointCard(el.dataset.wpt), x, y);
  };
  document.addEventListener('mouseover', (e) => { const el = e.target.closest('[data-wpt]'); if (el) showCard(el, e); });
  document.addEventListener('mouseout', (e) => { if (e.target.closest('[data-wpt]') && !e.relatedTarget?.closest?.('[data-wpt]')) M.tip.hide(); });
  document.addEventListener('focusin', (e) => { const el = e.target.closest('[data-wpt]'); if (el) showCard(el); });
  document.addEventListener('focusout', (e) => { if (e.target.closest('[data-wpt]')) M.tip.hide(); });
  document.addEventListener('click', (e) => { const el = e.target.closest('[data-wpt]'); if (el) showCard(el, e); });
  M.onTick((t) => {
    document.querySelectorAll('.wm__night').forEach((p) => p.setAttribute('d', nightD(t)));
    document.querySelectorAll('.wm__term').forEach((p) => p.setAttribute('d', termD(t)));
  });

  /* ——— Garnier crop (Takayama → Nagoya → Kyoto) ——— */
  function garnier() {
    const open = M.garnier().status === 'open';
    const P = { takayama: [36.141, 137.258], gero: [35.806, 137.245], nagoya: [35.171, 136.882], kyoto: [34.985, 135.759], gifu: [35.409, 136.757] };
    const dot = (k, name, dx, dy, anchor = 'start') => { const [x, y] = jp(...P[k]); return `<circle cx="${r1(x)}" cy="${r1(y)}" r="3.5" class="gm__stop"/><text x="${r1(x + dx)}" y="${r1(y + dy)}" text-anchor="${anchor}" class="jm__label">${name}</text>`; };
    const [tx, ty] = jp(...P.takayama);
    const cut = [[35.95, 137.25], [35.86, 137.24]];
    return `<svg class="gm" viewBox="215 140 320 187" role="img" aria-label="Takayama, Nagoya et Kyoto"><rect x="215" y="140" width="320" height="187" class="jm__bg"/>${land()}<path d="${pathOf([P.takayama, P.gero, P.gifu, P.nagoya], jp)}" class="gm__line gm__line--off"/><path d="${pathOf(cut, jp)}" class="gm__cut"/><path d="${pathOf([P.takayama, [35.6, 137.05], P.nagoya], jp)}" class="gm__line gm__line--bus ${open ? '' : 'is-sent'}"/><path d="${pathOf([P.nagoya, [35.05, 136.25], P.kyoto], jp)}" class="gm__line gm__line--train ${open ? '' : 'is-sent'}"/>${dot('nagoya', 'Nagoya', 8, 4)}${dot('kyoto', 'Kyoto', -8, 4, 'end')}<circle cx="${r1(tx)}" cy="${r1(ty)}" r="10" class="gm__ring ${open ? 'is-alert' : 'is-ok'}"/><circle cx="${r1(tx)}" cy="${r1(ty)}" r="5" class="gm__dot ${open ? 'is-alert' : 'is-ok'}"/><text x="${r1(tx + 12)}" y="${r1(ty + 4)}" class="jm__label">Takayama</text></svg>`;
  }

  /* ——— Paris–Tokyo inset (J1, J16) ——— */
  function inset() {
    const paris = [48.8566, 2.3522];
    const tok = stopById('tokyo');
    const pts = SUN ? SUN.greatCircle(paris[0], paris[1], tok.lat, tok.lon, 64) : [paris, [tok.lat, tok.lon]];
    const km = SUN ? Math.round(SUN.haversine(paris[0], paris[1], tok.lat, tok.lon) / 10) * 10 : 9710;
    const [px, py] = wp(...paris);
    const [qx, qy] = wp(tok.lat, tok.lon);
    return `<figure class="inset"><svg viewBox="330 40 330 165" role="img" aria-label="Paris – Tokyo"><rect x="330" y="40" width="330" height="165" class="wm__bg"/>${G ? `<path d="${G.WORLD_LAND_D}" class="wm__land"/>` : ''}<path d="${pathOf(pts, wp)}" class="inset__arc"/><circle cx="${r1(px)}" cy="${r1(py)}" r="3" class="inset__end"/><circle cx="${r1(qx)}" cy="${r1(qy)}" r="3" class="inset__end"/><text x="${r1(px)}" y="${r1(py) + 13}" text-anchor="middle" class="wm__tick">Paris</text><text x="${r1(qx)}" y="${r1(qy) + 13}" text-anchor="middle" class="wm__tick">Tokyo</text></svg><figcaption><b>Paris – Tokyo · ≈${NB}${fmtNum(km)}${NB}km à vol d’oiseau</b><span class="mini">Arc du plus court chemin, pas la route de l’avion.</span></figcaption></figure>`;
  }

  /* ——— downloads ——— */
  const downloadMenu = ({ label = 'Télécharger' } = {}) => `<details class="menu menu--right"><summary class="btn btn--ghost">${ic('down', 16)}${esc(label)}</summary><div class="menu__list"><button class="menu__item" data-act="dl-programme">${ic('print', 15)}<span>Programme imprimable (PDF)<small>À imprimer ou enregistrer en PDF</small></span></button><button class="menu__item" data-act="dl-ics">${ic('cal', 15)}<span>Agenda (.ics)<small>Les 16 jours et vos deux vols</small></span></button><button class="menu__item" data-act="dl-csv">${ic('list', 15)}<span>Tableau (.csv)<small>Pour Excel ou Numbers</small></span></button></div></details>`;
  const kyotoPlace = () => {
    const k = M.trip().kyoto;
    if (k.state === 'confirmed') return k.kept.name + (k.choice === 'ryokan' ? ', petits-déjeuners japonais' : '');
    if (k.choice === 'ryokan') return 'Ryokan d’Okazaki · en attente de confirmation';
    return T.kyoto.machiya.name;
  };
  const nightPlace = (dd) => (dd.night ? (dd.night.place === 'kyoto' ? kyotoPlace() : dd.night.place) : '');
  const transport = (dd) => dd.modes.map((m) => ({ plane: 'avion', train: 'train', bus: 'bus', ferry: 'ferry', car: 'voiture privée', guide: 'guide', bag: 'bagages' })[m]).filter(Boolean).join(', ');
  const icsEsc = (s) => String(s).replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');
  const ymd = (iso) => iso.replace(/-/g, '');
  const nextDay = (iso) => { const t = new Date(`${iso}T12:00:00Z`); t.setUTCDate(t.getUTCDate() + 1); return t.toISOString().slice(0, 10); };
  M.act('dl-ics', () => {
    const L = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Atelier Meridien//Portail//FR', 'CALSCALE:GREGORIAN', 'X-WR-CALNAME:Japon d’automne · Atelier Méridien'];
    T.days.forEach((dd) => {
      L.push('BEGIN:VEVENT', `UID:${T.id}-j${dd.j}@atelier-meridien.example`, 'DTSTAMP:20261005T084000Z', `DTSTART;VALUE=DATE:${ymd(dd.date)}`, `DTEND;VALUE=DATE:${ymd(nextDay(dd.date))}`, `SUMMARY:${icsEsc(`J${dd.j} · ${dd.title}`)}`, `DESCRIPTION:${icsEsc(dd.text + (dd.note ? `\n${dd.note}` : ''))}`, 'END:VEVENT');
    });
    [['20261107T122500Z', '20261108T020500Z', 'Vol Paris-CDG → Tokyo-Haneda'], ['20261122T014000Z', '20261122T161000Z', 'Vol Osaka-Kansai → Paris-CDG']].forEach(([a, b, s], i) => {
      L.push('BEGIN:VEVENT', `UID:${T.id}-vol${i + 1}@atelier-meridien.example`, 'DTSTAMP:20261005T084000Z', `DTSTART:${a}`, `DTEND:${b}`, `SUMMARY:${icsEsc(s)}`, 'END:VEVENT');
    });
    L.push('END:VCALENDAR');
    M.download('meridien-japon-2026.ics', L.join('\r\n') + '\r\n', 'text/calendar');
    M.toast('Agenda téléchargé : 16 jours et 2 vols.');
  });
  M.act('dl-csv', () => {
    const q = (s) => (/[;"\n]/.test(String(s)) ? `"${String(s).replace(/"/g, '""')}"` : String(s ?? ''));
    const rows = [['Jour', 'Date', 'Étape', 'Nuit à', 'Hébergement', 'Trajet', 'Note']];
    T.days.forEach((dd) => rows.push([`J${dd.j}`, M.fmtD(dd.date, 'num'), dd.title, dd.night ? stopById(dd.stop).name : '', nightPlace(dd), transport(dd), dd.note || '']));
    M.download('meridien-japon-2026.csv', rows.map((r) => r.map(q).join(';')).join('\r\n'), 'text/csv', { bom: true });
    M.toast('Tableau téléchargé.');
  });
  M.act('dl-programme', () => {
    const t = M.trip();
    M.print(() => `<div class="doc">
      <div class="doc__head">${M.logo.lockup({ light: true })}<div class="doc__ref">Programme détaillé<br>${esc(T.id)} · ${esc(fmtD(M.now(), 'dmy'))}</div></div>
      <h1 class="doc__title">${esc(T.titleA)} <span class="serif">${esc(T.titleB)}</span></h1>
      <p class="doc__lead">Camille et Antoine Delorme · du samedi 7 au dimanche 22 novembre 2026 · 16 jours, 14 nuits sur place.</p>
      <table class="doc__days">${T.days.map((dd) => `<tr><td class="doc__j">J${dd.j}<br><span>${esc(fmtD(dd.date, 'dow'))}</span></td><td><b>${esc(dd.title)}</b><p>${esc(dd.text)}</p>${dd.note ? `<p class="doc__note">${esc(dd.note)}</p>` : ''}${dd.night ? `<p class="doc__night">Nuit : ${esc(nightPlace(dd))}</p>` : ''}</td></tr>`).join('')}</table>
      <h2 class="doc__h">Votre voyage</h2>
      <table class="doc__table">${D.trip.groups.map((g) => `<tr><td>${esc(g)}</td><td class="num">${fmtEur(t.groups[g])}</td></tr>`).join('')}<tr class="is-total"><td>Total pour 2 voyageurs</td><td class="num">${fmtEur(t.total)}</td></tr></table>
      <p class="doc__legal">${esc(D.company.legal)}</p>
    </div>`);
  });

  /* ——— the « Itinéraire » page ——— */
  const sunRow = (dd) => {
    const s = stopById(dd.stop) || stopById('tokyo');
    if (!SUN) return '';
    const rs = SUN.riseSet(dd.date, s.lat, s.lon, 'Asia/Tokyo');
    const h = Math.floor(rs.dayMinutes / 60);
    const m = rs.dayMinutes % 60;
    return `<div class="itin__sun"><span>${ic('sun', 16)}Lever ≈${NB}${rs.rise}</span><span>${ic('moon', 16)}Coucher ≈${NB}${rs.set}</span><span class="itin__daylen"><i style="width:${((rs.dayMinutes / 1440) * 100).toFixed(1)}%"></i></span><span class="mini">${h}${NB}h${NB}${String(m).padStart(2, '0')} de jour à ${esc(s.name)}</span></div>`;
  };
  const timeEq = (dd) => {
    const [y, mo, da] = dd.date.split('-').map(Number);
    const s = stopById(dd.stop) || stopById('tokyo');
    if (dd.j === 1) {
      const t = new Date(Date.UTC(y, mo - 1, da, 13 - 1, 25));
      return `13:25 à Paris = ${fmtT(t, 'Asia/Tokyo')} à Tokyo`;
    }
    const [hh, mm] = (dd.firstTime || '9:00').split(':').map(Number);
    const t = new Date(Date.UTC(y, mo - 1, da, hh - 9, mm));
    return `${fmtT(t, 'Asia/Tokyo')} à ${esc(s.name)} = ${fmtT(t, 'Europe/Paris')} à Paris`;
  };
  function sheet(j) {
    const dd = dayOf(j);
    const s = stopById(dd.stop);
    const night = dd.night ? `<div class="itin__night">${ic('bed', 15)}Nuit ${dd.night.n} sur ${dd.night.of} à ${esc(s.name)} · ${esc(nightPlace(dd))}</div>` : `<div class="itin__night">${ic('plane', 15)}${j === 1 ? 'Nuit en vol' : 'Retour à Paris le soir même'}</div>`;
    return `<div class="itin__eyebrow">J${j} · ${esc(fmtD(dd.date, 'long'))}</div>
      <h3 class="itin__title serif">${esc(dd.title)}</h3>
      ${night}
      <p class="itin__text">${esc(dd.text)}</p>
      ${dd.note ? `<div class="itin__note">${ic(j === 9 ? 'alert' : 'info', 15)}<span>${esc(dd.note)}</span></div>` : ''}
      <div class="itin__facts"><span>${ic('clock', 16)}${timeEq(dd)}</span>${sunRow(dd)}</div>
      ${j === 1 || j === 16 ? inset() : ''}`;
  }
  const modeIcons = (dd) => dd.modes.filter((m) => m !== 'guide' && m !== 'bag').map((m) => ic(m, 15)).join('');
  function render() {
    const j = Math.min(16, Math.max(1, +M.ui('itinDay') || 1));
    const ticks = T.days.map((dd) => `<span class="${dd.j % 2 ? '' : 'is-even'}">${dd.j}</span>`).join('');
    return `<div class="page-head"><div><div class="eyebrow">16 jours · 7 étapes · 9 trajets</div><h1 class="h1" style="margin-top:6px">Itinéraire</h1></div><div class="page-head__actions">${downloadMenu()}</div></div>
      <div class="card itin">
        <div class="itin__map">${japan({ day: j })}<p class="mini itin__foot">Tracés simplifiés de gare en gare. Coordonnées réelles.</p></div>
        <div class="itin__slider">
          <input type="range" min="1" max="16" step="1" value="${j}" data-input="itin-day" aria-label="Jour du voyage" aria-valuetext="Jour ${j} sur 16, ${esc(fmtD(dayOf(j).date, 'long'))}" style="--p:${((j - 1) / 15) * 100}%">
          <div class="itin__ticks">${ticks}</div>
        </div>
        <div class="itin__sheet" aria-live="polite">${sheet(j)}</div>
      </div>
      <div class="card" style="margin-top:16px"><div class="card__head"><span class="h2">Jour par jour</span></div><div class="list itin__days">${T.days.map((dd) => `<button class="li itin__row ${dd.j === j ? 'is-on' : ''}" data-act="itin-go" data-j="${dd.j}"><span class="itin__j">J${dd.j}</span><span class="li__main"><span class="li__t">${esc(dd.title)}</span><span class="li__s">${esc(fmtD(dd.date, 'dow'))}${dd.night ? ` · ${esc(nightPlace(dd))}` : ''}</span></span><span class="itin__modes">${modeIcons(dd)}</span></button>`).join('')}</div></div>`;
  }

  // slider moves update the DOM in place (no full re-render) and walk the marker along the day's route
  let anim = 0;
  function setDay(j, animate = true) {
    const root = document.querySelector('.itin');
    if (!root) return;
    const prev = +M.ui('itinDay') || 1;
    M.ui('itinDay', j, false);
    const range = root.querySelector('input[type=range]');
    range.value = j;
    range.style.setProperty('--p', `${((j - 1) / 15) * 100}%`);
    range.setAttribute('aria-valuetext', `Jour ${j} sur 16, ${fmtD(dayOf(j).date, 'long')}`);
    root.querySelectorAll('.jm__seg').forEach((p) => {
      const d = +p.dataset.day;
      p.classList.toggle('is-past', d < j);
      p.classList.toggle('is-on', d === j);
      p.classList.toggle('is-next', d > j);
    });
    const cur = dayOf(j).stop;
    root.querySelectorAll('[data-stop]').forEach((g) => g.classList.toggle('is-on', g.dataset.stop === cur));
    root.querySelectorAll('[data-stop-label]').forEach((g) => g.classList.toggle('is-on', g.dataset.stopLabel === cur));
    root.querySelector('.itin__sheet').innerHTML = sheet(j);
    document.querySelectorAll('.itin__row').forEach((r) => r.classList.toggle('is-on', +r.dataset.j === j));
    moveMarker(root, j, animate && j !== prev);
  }
  function moveMarker(root, j, animate) {
    const marker = root.querySelector('.jm__marker');
    const [ex, ey] = markerAt(j);
    const paths = [...root.querySelectorAll(`.jm__seg[data-day="${j}"]`)];
    cancelAnimationFrame(anim);
    marker.classList.remove('is-pulse');
    if (!animate || M.reduced || !paths.length) {
      marker.setAttribute('transform', `translate(${r1(ex)} ${r1(ey)})`);
      if (animate && !paths.length && !M.reduced) requestAnimationFrame(() => marker.classList.add('is-pulse'));
      return;
    }
    const lens = paths.map((p) => p.getTotalLength());
    const total = lens.reduce((a, b) => a + b, 0);
    const t0 = performance.now();
    const step = (t) => {
      const k = Math.min(1, (t - t0) / 700);
      const e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
      let at = e * total;
      let i = 0;
      while (i < lens.length - 1 && at > lens[i]) at -= lens[i++];
      const pt = paths[i].getPointAtLength(Math.min(at, lens[i]));
      marker.setAttribute('transform', `translate(${r1(pt.x)} ${r1(pt.y)})`);
      if (k < 1) anim = requestAnimationFrame(step);
    };
    anim = requestAnimationFrame(step);
  }
  M.input('itin-day', (el) => setDay(+el.value));
  M.act('itin-go', (el) => {
    setDay(+el.dataset.j);
    document.querySelector('.itin')?.scrollIntoView({ behavior: M.reduced ? 'auto' : 'smooth', block: 'start' });
  });

  M.page({ role: 'client', id: 'itineraire', title: 'Itinéraire', nav: { label: 'Itinéraire', icon: 'route', order: 2 }, render });

  M.maps = { japan, japanThumb, kyoto, world, garnier, inset, downloadMenu, kyotoPlace };
})();
