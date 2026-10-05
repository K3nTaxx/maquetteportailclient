/* Atelier Méridien — admin « Analytique ». Every figure is computed from DATA.analytics. */
(() => {
  'use strict';
  const { esc, fmtEur, fmtNum, fmtPct, ic, NB } = M;
  const A = window.DATA.analytics;
  const sum = (a) => a.reduce((x, y) => x + y, 0);
  const pct = (a, b) => (b ? (a / b) * 100 : 0);
  const delta = (a, b) => {
    const d = pct(a - b, b);
    return `<span class="${d >= 0 ? 'up' : 'down'}">${d >= 0 ? '+' : '−'}${fmtNum(Math.abs(d), 1)}${NB}%</span>`;
  };
  const PERIODS = { sept: { label: 'Septembre', idx: [8] }, q3: { label: '3e trimestre', idx: [6, 7, 8] }, ytd: { label: 'Janv.–sept.', idx: [0, 1, 2, 3, 4, 5, 6, 7, 8] } };
  const margin25 = (idx) => (idx.length === 9 ? A.margins2025.h1 + A.margins2025[6] + A.margins2025[7] + A.margins2025[8] : sum(idx.map((i) => A.margins2025[i] || 0)));
  function periodFigures(key) {
    const idx = PERIODS[key].idx;
    const ms = idx.map((i) => A.months[i]);
    const f = { ca: sum(ms.map((m) => m.ca)), marge: sum(ms.map((m) => m.marge)), dossiers: sum(ms.map((m) => m.dossiers)), pax: sum(ms.map((m) => m.pax)), ca25: sum(ms.map((m) => m.ca25)), d25: sum(ms.map((m) => m.d25)), marge25: margin25(idx) };
    f.panier = f.ca / f.dossiers;
    f.panier25 = f.ca25 / f.d25;
    return f;
  }
  const tile = (label, value, sub) => `<div class="card kpi"><div class="kpi__label">${label}</div><div class="kpi__value">${value}</div><div class="kpi__delta">${sub}</div></div>`;
  const totals = () => ({ ca: sum(A.destinations.map((d) => d.ca)), dossiers: sum(A.destinations.map((d) => d.dossiers)) });

  /* ——— reading « par date de vente » ——— */
  function tilesVente(period, dest) {
    if (dest) {
      const d = A.destinations.find((x) => x.name === dest);
      const T = totals();
      return `${tile('Voyages vendus', fmtEur(d.ca), `${fmtPct(pct(d.ca, T.ca))} du total`)}${tile('Marge brute', fmtEur(d.marge), `${fmtPct(pct(d.marge, d.ca))} du chiffre d’affaires`)}${tile('Dossiers confirmés', d.dossiers, `${d.pax} voyageurs · ${fmtPct(pct(d.dossiers, T.dossiers))} du total`)}${tile('Panier moyen', fmtEur(d.ca / d.dossiers), `moyenne générale ${fmtEur(T.ca / T.dossiers)}`)}`;
    }
    const f = periodFigures(period);
    return `${tile('Voyages vendus', fmtEur(f.ca), `2025 : ${fmtEur(f.ca25)} · ${delta(f.ca, f.ca25)}`)}${tile('Marge brute', `${fmtEur(f.marge)} <small>${fmtPct(pct(f.marge, f.ca))}</small>`, `2025 : ${fmtEur(f.marge25)} · ${delta(f.marge, f.marge25)}`)}${tile('Dossiers confirmés', `${f.dossiers} <small>${f.pax} voyageurs</small>`, `2025 : ${f.d25} · ${delta(f.dossiers, f.d25)}`)}${tile('Panier moyen', fmtEur(f.panier), `2025 : ${fmtEur(f.panier25)} · ${delta(f.panier, f.panier25)}`)}`;
  }
  function monthlyBars(period) {
    const idx = PERIODS[period].idx;
    const W = 720; const H = 230; const L = 46; const B = 30;
    const max = 320000;
    const y = (v) => H - B - (v / max) * (H - B - 16);
    const bw = (W - L - 10) / 9;
    let g = '';
    [100000, 200000, 300000].forEach((v) => (g += `<line x1="${L}" x2="${W}" y1="${y(v).toFixed(1)}" y2="${y(v).toFixed(1)}" class="ch__grid"/><text x="${L - 6}" y="${(y(v) + 4).toFixed(1)}" text-anchor="end" class="ch__ax">${v / 1000}${NB}k€</text>`));
    const bars = A.months.map((m, i) => {
      const x = L + i * bw;
      const on = idx.includes(i);
      return `<g class="ch__m ${on ? '' : 'is-off'}"><rect x="${(x + bw * 0.22).toFixed(1)}" y="${y(m.ca25).toFixed(1)}" width="${(bw * 0.42).toFixed(1)}" height="${(H - B - y(m.ca25)).toFixed(1)}" rx="3" class="ch__ghost"/><rect x="${(x + bw * 0.3).toFixed(1)}" y="${y(m.ca).toFixed(1)}" width="${(bw * 0.42).toFixed(1)}" height="${(H - B - y(m.ca)).toFixed(1)}" rx="3" class="ch__bar"/><text x="${(x + bw / 2).toFixed(1)}" y="${H - 10}" text-anchor="middle" class="ch__ax">${esc(m.m)}</text><rect x="${x.toFixed(1)}" y="0" width="${bw.toFixed(1)}" height="${H - B}" class="ch__hit" data-am="${i}" tabindex="0"/></g>`;
    }).join('');
    return `<svg class="ch" viewBox="0 0 ${W} ${H}" role="img" aria-label="Ventes par mois, 2026 et 2025">${g}${bars}</svg>`;
  }
  const lectureVente = (period) => {
    if (period === 'sept') {
      const m = A.months[8];
      return `Septembre est le meilleur mois de l’année : ${m.dossiers} dossiers, ${fmtEur(m.ca)}, contre ${m.d25} en septembre 2025.`;
    }
    if (period === 'q3') {
      const f = periodFigures('q3');
      return `L’été est creux comme chaque année, septembre rattrape : ${f.dossiers} dossiers sur le trimestre, ${pct(f.dossiers - f.d25, f.d25) >= 0 ? '+' : '−'}${fmtNum(Math.abs(pct(f.dossiers - f.d25, f.d25)), 1)}${NB}%.`;
    }
    const best = A.months.reduce((a, b) => (b.ca > a.ca ? b : a));
    return `${best.long.charAt(0).toUpperCase() + best.long.slice(1)} est le meilleur mois de l’année : ${best.dossiers} dossiers, ${fmtEur(best.ca)}.`;
  };
  function funnel() {
    const top = A.funnel[0][1];
    const rows = A.funnel.map(([l, n], i) => `<div class="fn__row"><span class="fn__l">${esc(l)}</span><span class="fn__bar"><i style="width:${pct(n, top).toFixed(1)}%"></i></span><b>${n}</b><span class="mini">${i ? fmtPct(pct(n, A.funnel[i - 1][1])) : ''}</span></div>`).join('');
    const S = A.sources;
    const tr = sum(S.map((s) => s[1]));
    const tv = sum(S.map((s) => s[2]));
    const insta = S.find((s) => s[0] === 'Instagram');
    const rate = pct(A.funnel[3][1], top);
    const rate25 = pct(A.funnel2025.trips, A.funnel2025.requests);
    return {
      lecture: `Instagram apporte ${fmtNum(Math.round(pct(insta[1], tr)))}${NB}% des demandes et ${fmtNum(Math.round(pct(insta[2], tv)))}${NB}% des voyages.`,
      html: `<div class="an-fun"><div><div class="fn">${rows}</div><p class="hint" style="margin-top:12px">Transformation ${fmtPct(rate)}, contre ${fmtPct(rate25)} en 2025 (${A.funnel2025.trips} sur ${A.funnel2025.requests}) · première proposition en ${fmtNum(A.firstProposalDays, 1)} jours ouvrés (médiane).</p></div>
        <div class="tablewrap"><table class="table an-src"><thead><tr><th>Source</th><th class="num">Demandes</th><th class="num">Voyages</th><th>Taux</th></tr></thead><tbody>${S.map(([n, r, v]) => `<tr data-tipv="${esc(`${n} : ${fmtNum(Math.round(pct(r, tr)))} % des demandes, ${fmtNum(Math.round(pct(v, tv)))} % des voyages`)}"><td>${esc(n)}</td><td class="num">${r}</td><td class="num">${v}</td><td><span class="an-rate"><i style="width:${Math.min(100, pct(v, r) * 2).toFixed(1)}%"></i></span>${fmtPct(pct(v, r))}</td></tr>`).join('')}<tr class="is-total"><td>Total</td><td class="num">${tr}</td><td class="num">${tv}</td><td>${fmtPct(pct(tv, tr))}</td></tr></tbody></table></div></div>`,
    };
  }
  function destTable(dest) {
    const T = totals();
    const tm = sum(A.destinations.map((d) => d.marge));
    const tp = sum(A.destinations.map((d) => d.pax));
    const jp = A.destinations[0];
    return {
      lecture: `Le Japon fait ${fmtPct(pct(jp.ca, T.ca))} du chiffre d’affaires pour ${fmtNum(Math.round(pct(jp.dossiers, T.dossiers)))}${NB}% des dossiers.`,
      html: `<div class="tablewrap"><table class="table an-dest"><thead><tr><th>Destination</th><th class="num">Dossiers</th><th class="num">Voyageurs</th><th class="num">CA</th><th class="num">Part</th><th class="num">Marge</th><th class="num">Panier</th></tr></thead><tbody>${A.destinations.map((d) => `<tr class="${dest === d.name ? 'is-sel' : ''}" data-act="an-dest" data-d="${esc(d.name)}"><td><b>${esc(d.name)}</b></td><td class="num">${d.dossiers}</td><td class="num">${d.pax}</td><td class="num">${fmtEur(d.ca)}</td><td class="num">${fmtPct(pct(d.ca, T.ca))}</td><td class="num">${fmtEur(d.marge)} <span class="mini">${fmtPct(pct(d.marge, d.ca))}</span></td><td class="num">${fmtEur(d.ca / d.dossiers)}</td></tr>`).join('')}<tr class="is-total"><td>Total</td><td class="num">${T.dossiers}</td><td class="num">${tp}</td><td class="num">${fmtEur(T.ca)}</td><td class="num">${fmtPct(100, 0)}</td><td class="num">${fmtEur(tm)} <span class="mini">${fmtPct(pct(tm, T.ca))}</span></td><td class="num">${fmtEur(T.ca / T.dossiers)}</td></tr></tbody></table></div>`,
    };
  }

  /* ——— reading « par date de départ » ——— */
  const MONTHS = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];
  const MONTHS_LONG = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
  const inSeason = (r) => sum(r.n.filter((_, i) => r.season.includes(i + 1)));
  const travellingSept = () => window.DATA.travelling.filter((x) => x.depart < '2026-10-01').length;
  function departFigures() {
    const all = sum(A.matrix.map((r) => sum(r.n)));
    const past = sum(A.matrix.map((r) => sum(r.n.slice(0, 9))));
    const octDep = sum(Object.values(A.octDeparted));
    const travelling = travellingSept() + octDep;
    const back = past - travellingSept();
    return { all, back, travelling, toCome: all - back - travelling };
  }
  function matrix(rowSel) {
    const L = 150; const CW = 44; const RH = 34; const TOP = 26; const RIGHT = 70;
    const W = L + CW * 12 + RIGHT;
    const H = TOP + RH * (A.matrix.length + 1) + 6;
    const colTot = MONTHS.map((_, j) => sum(A.matrix.map((r) => r.n[j])));
    let s = `<rect x="${L + 9 * CW}" y="${TOP - 18}" width="${CW}" height="${H - TOP + 14}" class="mx__today"/><text x="${L + 9 * CW + CW / 2}" y="${H - 1}" text-anchor="middle" class="mx__todayt">aujourd’hui</text>`;
    s += MONTHS.map((m, j) => `<text x="${L + j * CW + CW / 2}" y="${TOP - 6}" text-anchor="middle" class="mx__h" data-mx-col="${j}">${m}</text>`).join('');
    s += `<text x="${L + 12 * CW + 12}" y="${TOP - 6}" class="mx__h">en saison</text>`;
    A.matrix.forEach((r, i) => {
      const y = TOP + i * RH;
      const dim = rowSel && rowSel !== r.name;
      s += `<g class="mx__row ${dim ? 'is-dim' : ''} ${rowSel === r.name ? 'is-sel' : ''}" data-act="an-row" data-r="${esc(r.name)}" tabindex="0" role="button" aria-label="${esc(r.name)}">`;
      s += `<rect x="0" y="${y}" width="${W}" height="${RH}" class="mx__hit"/>`;
      r.season.forEach((mo) => (s += `<rect x="${L + (mo - 1) * CW + 2}" y="${y + 3}" width="${CW - 4}" height="${RH - 6}" rx="4" class="mx__band"/>`));
      s += `<text x="${L - 10}" y="${y + RH / 2 + 4}" text-anchor="end" class="mx__name">${esc(r.name)}</text>`;
      r.n.forEach((n, j) => {
        const cx = L + j * CW + CW / 2;
        const cy = y + RH / 2;
        const rr = 4.2 * Math.sqrt(n);
        let dot;
        if (!n) dot = `<line x1="${cx - 3}" x2="${cx + 3}" y1="${cy}" y2="${cy}" class="mx__zero"/>`;
        else if (j < 9) dot = `<circle cx="${cx}" cy="${cy}" r="${rr.toFixed(2)}" class="mx__past"/>`;
        else if (j === 9) { const dep = A.octDeparted[r.name] || 0; dot = `${dep ? `<circle cx="${cx}" cy="${cy}" r="${(4.2 * Math.sqrt(dep)).toFixed(2)}" class="mx__past"/>` : ''}<circle cx="${cx}" cy="${cy}" r="${rr.toFixed(2)}" class="mx__next"/>`; }
        else dot = `<circle cx="${cx}" cy="${cy}" r="${rr.toFixed(2)}" class="mx__next"/>`;
        const tipTxt = `${r.name} · ${MONTHS_LONG[j]} : ${n} départ${n > 1 ? 's' : ''}${j > 9 ? ' prévus' : j === 9 ? ` (${A.octDeparted[r.name] || 0} déjà parti${(A.octDeparted[r.name] || 0) > 1 ? 's' : ''})` : ''}`;
        s += `<g data-tipv="${esc(tipTxt)}"><rect x="${L + j * CW}" y="${y}" width="${CW}" height="${RH}" class="mx__cell"/>${dot}</g>`;
      });
      const tot = sum(r.n);
      s += `<text x="${L + 12 * CW + 12}" y="${y + RH / 2 + 4}" class="mx__in">${r.season.length ? `${inSeason(r)} / ${tot}` : `— / ${tot}`}</text></g>`;
    });
    const yt = TOP + A.matrix.length * RH;
    s += `<line x1="${L}" x2="${L + 12 * CW}" y1="${yt + 2}" y2="${yt + 2}" class="mx__sep"/><text x="${L - 10}" y="${yt + 22}" text-anchor="end" class="mx__name mx__name--t">Total</text>${colTot.map((n, j) => `<text x="${L + j * CW + CW / 2}" y="${yt + 22}" text-anchor="middle" class="mx__tot">${n}</text>`).join('')}<text x="${L + 12 * CW + 12}" y="${yt + 22}" class="mx__tot">${sum(colTot)}</text>`;
    return `<svg class="mx" viewBox="0 0 ${W} ${H}" style="min-width:${W}px" role="img" aria-label="Saisonnalité des départs 2026, par destination et par mois">${s}</svg>`;
  }
  function forward(withProps) {
    const F = A.forward;
    const rate = A.funnel[3][1] / A.funnel[2][1];
    const W = 620; const H = 220; const L = 30; const B = 28;
    const max = 22;
    const y = (v) => H - B - (v / max) * (H - B - 12);
    const bw = (W - L) / F.length;
    let g = `<defs><pattern id="hatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="6" height="6" fill="var(--g5)"/><line x1="0" y1="0" x2="0" y2="6" stroke="var(--g3)" stroke-width="2.4"/></pattern></defs>`;
    [5, 10, 15, 20].forEach((v) => (g += `<line x1="${L}" x2="${W}" y1="${y(v)}" y2="${y(v)}" class="ch__grid"/><text x="${L - 6}" y="${y(v) + 4}" text-anchor="end" class="ch__ax">${v}</text>`));
    const bars = F.map(([m, c, ly, props], i) => {
      const x = L + i * bw;
      const exp = props * rate;
      const tipTxt = `${m} · ${c} confirmés · ${props} propositions ouvertes, ≈${fmtNum(exp, 1)} départs attendus · l’an dernier à la même date : ${ly}`;
      return `<g data-tipv="${esc(tipTxt)}"><rect x="${x}" y="0" width="${bw}" height="${H - B}" class="ch__hit"/><rect x="${(x + bw * 0.18).toFixed(1)}" y="${y(ly).toFixed(1)}" width="${(bw * 0.28).toFixed(1)}" height="${(H - B - y(ly)).toFixed(1)}" rx="3" class="ch__ghost"/><rect x="${(x + bw * 0.5).toFixed(1)}" y="${y(c).toFixed(1)}" width="${(bw * 0.3).toFixed(1)}" height="${(H - B - y(c)).toFixed(1)}" rx="3" class="ch__bar"/>${withProps ? `<rect x="${(x + bw * 0.5).toFixed(1)}" y="${y(c + exp).toFixed(1)}" width="${(bw * 0.3).toFixed(1)}" height="${(y(c) - y(c + exp)).toFixed(1)}" rx="3" fill="url(#hatch)"/>` : ''}<text x="${(x + bw / 2).toFixed(1)}" y="${H - 8}" text-anchor="middle" class="ch__ax">${esc(m)}</text></g>`;
    }).join('');
    const conf = sum(F.map((f) => f[1]));
    const ly = sum(F.map((f) => f[2]));
    const exp = sum(F.map((f) => f[3])) * rate;
    const lecture = `De novembre à mai, ${conf} départs sont déjà confirmés, contre ${ly} à la même date l’an dernier (+${fmtNum(Math.round(pct(conf - ly, ly)))}${NB}%)${withProps ? `, et avec les propositions en cours, on peut en attendre environ ${fmtNum(Math.round(conf + exp))}.` : '.'}`;
    return { lecture, html: `<svg class="ch" viewBox="0 0 ${W} ${H}" role="img" aria-label="Départs confirmés à venir">${g}${bars}</svg>`, rate };
  }

  /* ——— page ——— */
  const card = (title, chip, lecture, body, extra = '') => `<div class="card an-card"><div class="card__head"><span class="h2">${esc(title)}</span>${extra}${chip ? `<span class="chip">${esc(chip)}</span>` : ''}</div><div class="card__body">${lecture ? `<p class="an-lecture serif">${lecture}</p>` : ''}${body}</div></div>`;
  M.page({
    role: 'admin', id: 'analytique', title: 'Analytique', nav: { label: 'Analytique', icon: 'chart', order: 6 },
    render: () => {
      const reading = M.ui('analyticsReading') || 'vente';
      const period = M.ui('period') || 'ytd';
      const dest = M.ui('destFilter') || null;
      const row = M.ui('matrixRow') || null;
      const props = !!M.ui('forwardProposals');
      const head = `<div class="page-head"><div><div class="eyebrow">Rapport d’activité</div><h1 class="h1" style="margin-top:6px">Analytique</h1><p class="lead">Données arrêtées au 30 septembre 2026 · comparées à la même période 2025.</p></div><div class="page-head__actions"><div class="tabs" role="tablist"><button class="${reading === 'vente' ? 'is-on' : ''}" data-act="an-reading" data-r="vente">Par date de vente</button><button class="${reading === 'depart' ? 'is-on' : ''}" data-act="an-reading" data-r="depart">Par date de départ</button></div><button class="btn btn--ghost" data-act="an-csv">${ic('down', 15)}Exporter (CSV)</button></div></div>`;
      if (reading === 'vente') {
        const fn = funnel();
        const dt = destTable(dest);
        const switcher = `<div class="tabs an-period ${dest ? 'is-locked' : ''}" title="${dest ? 'Le détail par destination est disponible sur janvier–septembre' : ''}">${Object.entries(PERIODS).map(([k, p]) => `<button class="${(dest ? 'ytd' : period) === k ? 'is-on' : ''}" data-act="an-period" data-p="${k}" ${dest ? 'disabled' : ''}>${p.label}</button>`).join('')}</div>`;
        return `${head}<div class="row an-bar">${switcher}${dest ? `<button class="chip chip--x" data-act="an-dest" data-d="">${esc(dest)} ${ic('x', 12)}</button>` : ''}</div>
          <div class="grid g-4 kpis">${tilesVente(period, dest)}</div>
          <div class="stack" style="margin-top:16px">
            ${card('Ventes par mois', dest ? 'Toutes destinations' : '', lectureVente(dest ? 'ytd' : period), `${monthlyBars(dest ? 'ytd' : period)}<div class="legend" style="margin-top:8px"><span><i style="background:var(--accent)"></i>2026</span><span><i style="background:var(--ghost)"></i>2025</span></div>`)}
            ${card('Destinations', 'Janv.–sept.', dt.lecture, `${dt.html}<p class="mini" style="margin-top:8px">Cliquez une destination pour filtrer les indicateurs.</p>`)}
            ${card('Des demandes aux voyages', 'Janv.–sept.', fn.lecture, fn.html)}
          </div>`;
      }
      const f = departFigures();
      const sel = row ? A.matrix.find((r) => r.name === row) : null;
      const sat = A.satisfaction;
      const fw = forward(props);
      const tiles = sel
        ? `${tile(`Départs 2026 · ${esc(sel.name)}`, sum(sel.n), sel.season.length ? `${inSeason(sel)} en saison` : 'pas de saison marquée')}`
        : tile('Départs 2026', f.all, `${f.back} rentrés · ${f.travelling} en voyage · ${f.toCome} à venir`);
      return `${head}${sel ? `<div class="row an-bar"><button class="chip chip--x" data-act="an-row" data-r="">${esc(sel.name)} ${ic('x', 12)}</button></div>` : ''}
        <div class="grid g-3 kpis an-dtiles">${tiles}${tile('Satisfaction', `${fmtNum(sat.score, 1)} <small>/ 5</small>`, `${sat.answers} questionnaires de retour, ${fmtNum(Math.round(pct(sat.answers, sat.returned)))}${NB}% des ${sat.returned} voyages rentrés`)}${tile('Confirmation → départ', `${sat.leadDays}${NB}j`, 'en moyenne, voyages partis en 2026')}</div>
        <div class="an-quotes">${A.quotes.map(([q, w]) => `<blockquote class="serif">« ${esc(q)} »<span>${esc(w)}</span></blockquote>`).join('')}</div>
        <div class="stack" style="margin-top:16px">
          ${card('Saisonnalité des départs', '2026', 'Novembre est plein pour le Japon : 8 départs. Décembre est le mois le plus calme : 10 départs, toutes destinations.', `<div class="tablewrap mx__wrap">${matrix(row)}</div><div class="legend mx__legend"><span><i class="lg-past"></i>Partis</span><span><i class="lg-next"></i>Prévus</span><span><i class="lg-band"></i>Haute saison</span><span><i class="lg-today"></i>Mois en cours</span></div>`)}
          ${card('Départs confirmés à venir', 'nov. → mai', fw.lecture, `${fw.html}<div class="row" style="justify-content:space-between;flex-wrap:wrap;margin-top:8px"><div class="legend"><span><i style="background:var(--accent)"></i>Confirmés au 5 oct.</span><span><i style="background:var(--ghost)"></i>À la même date en 2025</span>${props ? '<span><i class="lg-hatch"></i>Propositions pondérées</span>' : ''}</div><label class="an-toggle"><input type="checkbox" data-change="an-props" ${props ? 'checked' : ''}> Inclure les ${sum(A.forward.map((x) => x[3]))} propositions en cours, pondérées à ${fmtPct(fw.rate * 100)}</label></div>`)}
        </div>`;
    },
  });
  M.act('an-reading', (el) => M.ui('analyticsReading', el.dataset.r));
  M.act('an-period', (el) => M.ui('period', el.dataset.p));
  M.act('an-dest', (el) => M.ui('destFilter', el.dataset.d && el.dataset.d !== M.ui('destFilter') ? el.dataset.d : null));
  M.act('an-row', (el) => M.ui('matrixRow', el.dataset.r && el.dataset.r !== M.ui('matrixRow') ? el.dataset.r : null));
  M.change('an-props', (el) => M.ui('forwardProposals', el.checked));

  // month tooltip on the sales chart
  const monthTip = (i) => { const m = A.months[i]; return `<b>${esc(m.long.charAt(0).toUpperCase() + m.long.slice(1))} 2026</b><br>${m.dossiers} dossiers · ${fmtEur(m.ca)} · panier ${fmtEur(m.ca / m.dossiers)}<br><span class="mini">2025 : ${fmtEur(m.ca25)} (${m.d25} dossiers)</span>`; };
  document.addEventListener('mouseover', (e) => { const el = e.target.closest && e.target.closest('[data-am]'); if (el) M.tip.show(monthTip(+el.dataset.am), e.clientX, e.clientY); });
  document.addEventListener('mousemove', (e) => { const el = e.target.closest && e.target.closest('[data-am], [data-tipv]'); if (el) M.tip.show(el.dataset.am !== undefined ? monthTip(+el.dataset.am) : `<b>${esc(el.dataset.tipv)}</b>`, e.clientX, e.clientY); });
  document.addEventListener('mouseout', (e) => { if (e.target.closest && e.target.closest('[data-am]')) M.tip.hide(); });
  document.addEventListener('focusin', (e) => { const el = e.target.closest && e.target.closest('[data-am]'); if (el) { const r = el.getBoundingClientRect(); M.tip.show(monthTip(+el.dataset.am), r.left + r.width / 2, r.top + 20); } });
  document.addEventListener('focusout', (e) => { if (e.target.closest && e.target.closest('[data-am]')) M.tip.hide(); });

  // CSV export (« ; », BOM, decimal comma)
  M.act('an-csv', () => {
    const reading = M.ui('analyticsReading') || 'vente';
    const n = (v, d = 0) => fmtNum(v, d).replace(/ /g, '');
    let rows = [];
    let name;
    if (reading === 'vente') {
      const period = M.ui('period') || 'ytd';
      name = `meridien-ventes-${{ sept: 'septembre', q3: 't3', ytd: 'janv-sept' }[period]}-2026.csv`;
      rows.push(['Mois', 'Dossiers 2026', 'CA 2026', 'Marge 2026', 'Dossiers 2025', 'CA 2025']);
      A.months.forEach((m) => rows.push([m.long, m.dossiers, m.ca, m.marge, m.d25, m.ca25]));
      rows.push([], ['Source', 'Demandes', 'Voyages', 'Taux %']);
      A.sources.forEach(([s, r, v]) => rows.push([s, r, v, n(pct(v, r), 1)]));
      rows.push([], ['Destination', 'Dossiers', 'Voyageurs', 'CA', 'Marge']);
      A.destinations.forEach((d) => rows.push([d.name, d.dossiers, d.pax, d.ca, d.marge]));
    } else {
      name = 'meridien-departs-2026.csv';
      rows.push(['Destination', ...MONTHS_LONG, 'Total']);
      A.matrix.forEach((r) => rows.push([r.name, ...r.n, sum(r.n)]));
      rows.push([], ['Mois', 'Confirmés au 5 oct. 2026', 'Même date 2025', 'Propositions ouvertes']);
      A.forward.forEach((f) => rows.push(f));
    }
    M.download(name, rows.map((r) => r.join(';')).join('\r\n'), 'text/csv', { bom: true });
    M.toast('Fichier CSV téléchargé.');
  });
})();
