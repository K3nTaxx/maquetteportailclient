/* Atelier Méridien — admin space (« Direction », Mathilde Arnoux): Pilotage, Veille, Clients. */
(() => {
  'use strict';
  const { esc, fmtEur, fmtNum, fmtD, fmtT, ic, badge, av, NB } = M;
  const D = window.DATA;
  const maps = (fn, ...a) => (M.maps && M.maps[fn] ? M.maps[fn](...a) : '');
  const P = D.people;
  const kpi = (label, value, sub) => `<div class="card kpi"><div class="kpi__label">${label}</div><div class="kpi__value">${value}</div><div class="kpi__delta">${sub}</div></div>`;

  /* ——— Pilotage ——— */
  const balanceState = (b) => {
    if (b.state === 'received') return badge(`reçu le ${fmtD(b.receivedOn, 'dm')}`, 'ok');
    if (b.state === 'transfer') return `<span class="row" style="justify-content:flex-end;flex-wrap:wrap;gap:6px">${badge('Virement annoncé · à rapprocher', 'info')}<button class="btn btn--primary btn--sm" data-act="ad-received">Marquer comme reçu</button></span>`;
    if (b.state === 'pending') return badge(`modification en attente : ${fmtEur(b.pendingBalance)} si l’hôtel confirme`, 'warn');
    return badge(`dû le ${fmtD(b.due, 'dow')}`, M.daysTo(b.due) <= 1 ? 'warn' : '');
  };
  M.page({
    role: 'admin', id: 'pilotage', title: 'Pilotage', nav: { label: 'Pilotage', icon: 'gauge', order: 1 },
    render: () => {
      const c = M.counts().admin;
      const rows = M.balances();
      const t = M.trip();
      const pp = M.passport();
      const docs = D.pipeline.docsMissing.filter((d) => d.key !== 'delorme' || pp.status === 'missing');
      return `<div class="page-head"><div><div class="eyebrow">Semaine du 5 au 11 octobre</div><h1 class="h1" style="margin-top:6px">Pilotage</h1></div></div>
        <div class="grid g-4 kpis">
          ${kpi('Départs', c.departures, `${c.departuresPax} voyageurs cette semaine`)}
          ${kpi('En voyage', c.travelling, `${c.travellers} voyageurs · ${c.alerts ? '<span class="down">1 alerte</span>' : 'RAS'}`)}
          ${kpi('Soldes J-30', fmtEur(c.balancesDue), `dont ${fmtEur(c.balancesReceived)} reçus`)}
          ${kpi('Demandes à attribuer', c.unassigned, c.unassigned ? 'reçues depuis samedi' : 'tout est attribué')}
        </div>
        <div class="grid g-main" style="margin-top:16px">
          <div class="stack">
            <div class="card"><div class="card__head"><span class="h2">Soldes à encaisser</span><span class="chip">J-30</span></div><div class="tablewrap"><table class="table"><thead><tr><th>Client</th><th>Départ</th><th class="num">Solde</th><th class="num">État</th></tr></thead><tbody>${rows.map((b) => `<tr class="${b.key === 'delorme' ? 'is-hl' : ''}"><td><b>${esc(b.client)}</b><div class="mini">${esc(b.dest)}</div></td><td class="nowrap">${esc(fmtD(b.depart, 'dow'))}</td><td class="num">${fmtEur(b.balance)}</td><td class="num">${balanceState(b)}</td></tr>`).join('')}</tbody></table></div><div class="card__foot"><span class="spacer hint">Échéance à J-30, avancée au vendredi quand elle tombe un week-end.</span><span>Reste à encaisser : <b>${M.roll('admin.remaining', c.balancesRemaining)}</b></span></div></div>
            <div class="card"><div class="card__head"><span class="h2">Demandes à attribuer</span><span class="chip">${c.unassigned}</span></div><div class="list">${D.pipeline.unassigned.map((r) => {
              const a = M.S.requests[r.key];
              if (a) return `<div class="li is-muted"><span class="resa__ic">${ic('check', 16)}</span><div class="li__main"><div class="li__t">${esc(r.client)} · ${esc(r.dest)}, ${esc(r.when)}</div><div class="li__s">Attribuée à ${esc(P[a.advisor].short)} · ${fmtT(a.at)}</div></div></div>`;
              return `<div class="li ad-req"><div class="li__main"><div class="li__t">${esc(r.client)} · ${esc(r.dest)}, ${esc(r.when)}, ${r.pax} pers.</div><div class="li__s">${r.note ? `${esc(r.note)} · ` : ''}${esc(r.source)} · reçue ${M.daysSince(r.receivedOn) === 0 ? 'ce matin' : `il y a ${M.daysSince(r.receivedOn)}${NB}j`}</div></div><div class="row"><select class="select" id="as-${r.key}" aria-label="Conseiller">${['louis', 'ines', 'baptiste', 'agathe', 'yasmine'].map((k) => `<option value="${k}" ${k === r.suggested ? 'selected' : ''}>${esc(P[k].short)}</option>`).join('')}</select><button class="btn btn--primary btn--sm" data-act="ad-assign" data-k="${r.key}">Attribuer</button></div></div>`;
            }).join('')}</div></div>
            <div class="card"><div class="card__head"><span class="h2">Envois programmés</span></div><div class="list">${D.scheduled.map((s) => {
              const del = s.key === 'delorme-reminder';
              const cancelled = del && t.balanceState === 'paid';
              const other = D.balances.find((b) => `${b.key}-reminder` === s.key);
              const what = del ? `${s.what} · ${fmtEur(t.balance > 0 ? t.balance : t.payments.find((x) => x.kind === 'solde').amount)}` : other ? `${s.what} · ${fmtEur(other.balance)}` : s.what;
              return `<div class="li sched2 ${cancelled ? 'is-cancel' : ''}"><div class="sched2__when"><b>${esc(fmtD(s.at, 'dow'))}</b><span>${fmtT(s.at)}</span></div><div class="li__main"><div class="li__t">${esc(what)} ${s.badge ? badge(s.badge, 'warn') : ''}${cancelled ? badge('Annulé · solde reçu', '') : ''}</div><div class="li__s">${esc(s.who)}</div><details class="why"><summary>Pourquoi cette date ?</summary><p>${esc(s.rule)}</p></details></div></div>`;
            }).join('')}</div><div class="card__foot"><span class="mini">Les envois déjà partis ne changent pas.</span></div></div>
          </div>
          <div class="stack">
            <div class="card"><div class="card__head"><span class="h2">Qui est où, maintenant</span><button class="btn btn--plain btn--sm" data-go="#/admin/veille">Ouvrir la veille ${ic('arrowR', 14)}</button></div><div class="card__body">${maps('world', { mini: true })}</div></div>
            <div class="card"><div class="card__head"><span class="h2">Départs de la semaine</span><span class="chip">${c.departures}</span></div><div class="list">${D.departuresWeek.map((d) => `<div class="li"><div class="sched2__when"><b>${esc(fmtD(d.date, 'dow').split(' ')[0])}</b><span>${esc(fmtD(d.date, 'dm'))}</span></div><div class="li__main"><div class="li__t">${esc(d.client)}</div><div class="li__s">${esc(d.dest)} · ${d.pax} pers. · ${esc(P[d.advisor].short)}</div></div>${d.docs === 'ok' ? `<span class="ok-ic" title="${esc(d.note)}">${ic('check', 15, 2.2)}</span>` : `<span title="${esc(d.note)}">${badge('Billets à rééditer', 'warn')}</span>`}</div>`).join('')}</div></div>
            <div class="card"><div class="card__head"><span class="h2">Documents manquants</span><span class="chip">${docs.length}</span></div><div class="list">${docs.map((d) => `<div class="li"><div class="li__main"><div class="li__t">${esc(d.client)} · ${esc(d.what)}</div><div class="li__s">${esc(d.dest)} · départ dans ${M.daysTo(d.depart)}${NB}j · ${esc(P[d.advisor].short)}</div></div>${M.daysTo(d.depart) < 30 ? badge('Urgent', 'bad') : ''}</div>`).join('')}</div><div class="card__foot"><span class="mini">Départs à moins de 45 jours.</span></div></div>
            <div class="card"><div class="card__head"><span class="h2">Propositions à relancer</span><span class="chip">${c.toChase}</span></div><div class="list">${D.pipeline.toChase.map((x) => `<div class="li"><div class="li__main"><div class="li__t">${esc(x.client)}</div><div class="li__s">${esc(P[x.advisor].short)} · envoyée le ${esc(fmtD(x.sentOn, 'dm'))}</div></div><span class="down mini-strong">${M.daysSince(x.sentOn)}${NB}j</span></div>`).join('')}</div></div>
          </div>
        </div>`;
    },
  });
  M.act('ad-assign', (el) => {
    const key = el.dataset.k;
    const advisor = document.getElementById(`as-${key}`)?.value || 'louis';
    M.emit('assign', { key, advisor });
  });
  M.act('ad-received', () => M.emit('pay.received'));

  /* ——— Veille ——— */
  const oncallNow = () => {
    const t = M.now();
    return D.oncall.find((w) => t >= new Date(`${w.from}T09:00:00+02:00`) && t < new Date(`${w.to}T09:00:00+02:00`)) || D.oncall[1];
  };
  M.page({
    role: 'admin', id: 'veille', title: 'Veille', nav: { label: 'Veille', icon: 'globe', order: 2, badge: () => M.counts().admin.veille },
    render: () => {
      const g = M.garnier();
      const oc = oncallNow();
      const journal = [...M.S.log, ...D.garnier.journal].sort((a, b) => (a.at < b.at ? 1 : -1));
      const countries = new Set(D.travelling.map((x) => x.country)).size;
      return `<div class="page-head"><div><h1 class="h1">Veille</h1><p class="lead">${D.travelling.length} dossiers en voyage, ${M.counts().admin.travellers} voyageurs, en ce moment. La zone grisée est la nuit, recalculée chaque minute.</p></div></div>
        <div class="card"><div class="card__body veille__map">${maps('world', {})}</div></div>
        <div class="grid g-main" style="margin-top:16px">
          <div class="card"><div class="card__head"><span class="h2">En voyage</span><span class="chip">${D.travelling.length}</span></div><div class="tablewrap"><table class="table veille__t"><thead><tr><th>Client</th><th>Lieu</th><th>Jour</th><th>Heure locale</th><th>Conseiller</th><th>État</th></tr></thead><tbody>${D.travelling.map((x) => {
            const alert = x.id === 'garnier' && g.status === 'open';
            const st = x.id === 'garnier' ? (alert ? badge('Alerte', 'warn') : badge('RAS · remplacement envoyé', 'ok')) : badge('RAS', 'ok');
            return `<tr class="${alert ? 'is-hl' : ''}"><td><b>${esc(x.client)}</b><div class="mini">${esc(x.lastContact)}</div></td><td>${esc(x.place)}<div class="mini">${esc(x.country)}</div></td><td class="nowrap">J${x.day}/${x.of}</td><td class="nowrap"><b data-live="time" data-tz="${esc(x.tz)}">${fmtT(M.now(), x.tz)}</b></td><td>${av(x.advisor, 'av--sm')}</td><td>${st}</td></tr>`;
          }).join('')}</tbody></table></div><div class="card__foot"><span class="mini">${countries} pays · heures locales mises à jour chaque minute.</span></div></div>
          <div class="stack">
            <div class="card"><div class="card__head"><span class="h2">Astreinte</span></div><div class="card__body"><div class="row">${av(oc.who)}<div><b>${esc(P[oc.who].name)}</b><div class="hint">du lundi ${esc(fmtD(oc.from, 'dm'))} 9${NB}h au lundi ${esc(fmtD(oc.to, 'dm'))} 9${NB}h</div></div></div><div class="ad-phone">${ic('phone', 15)}${esc(D.company.phone)}</div></div></div>
            <div class="card"><div class="card__head"><span class="h2">Journal</span></div><div class="card__body"><div class="timeline">${journal.map((j) => `<div class="tl is-done"><i class="tl__dot"></i><div><div class="tl__t">${esc(j.text)}</div><div class="tl__s">${esc(fmtD(j.at, 'dow'))} · ${fmtT(j.at)}</div></div></div>`).join('')}</div></div></div>
          </div>
        </div>`;
    },
  });

  /* ——— Clients ——— */
  const C = D.clients;
  const segLabel = { nouveau: 'Nouveau', recommande: 'Recommandé', fidele: 'Fidèle', grand: 'Grand voyageur' };
  const segKind = { nouveau: '', recommande: 'info', fidele: 'accent', grand: 'ok' };
  const total = (c) => c.trips.reduce((a, x) => a + x[2], 0);
  M.page({
    role: 'admin', id: 'clients', title: 'Clients', nav: { label: 'Clients', icon: 'users', order: 4 },
    render: () => {
      const f = M.ui('clientsSegment') || null;
      const list = C.named.filter((c) => !f || c.seg === f).sort((a, b) => total(b) - total(a));
      return `<div class="page-head"><div><h1 class="h1">Clients</h1><p class="lead">Dossiers de janvier à septembre 2026, par segment. Cliquez un segment pour filtrer.</p></div></div>
        <div class="grid g-4 kpis">${C.segments.map((s) => `<button class="card kpi seg-tile ${f === s.key ? 'is-on' : ''}" data-act="ad-seg" data-k="${s.key}"><div class="kpi__label">${esc(s.label)}</div><div class="kpi__value">${s.dossiers}</div><div class="kpi__delta">${fmtEur(s.ca)} · panier ${fmtEur(s.ca / s.dossiers)}</div><div class="mini" style="margin-top:6px">${esc(C.rules[s.key])}</div></button>`).join('')}</div>
        ${f ? `<div class="row" style="margin-top:12px"><button class="chip chip--x" data-act="ad-seg" data-k="">${esc(segLabel[f])} ${ic('x', 12)}</button></div>` : ''}
        <div class="card" style="margin-top:16px"><div class="tablewrap"><table class="table"><thead><tr><th>Client</th><th>Segment</th><th class="num">Voyages</th><th class="num">CA cumulé</th><th>Dernier voyage</th><th>Prochain / état</th></tr></thead><tbody>${list.map((c) => { const i = C.named.indexOf(c); const last = c.trips[c.trips.length - 1]; return `<tr data-act="ad-client" data-i="${i}" class="${c.delorme ? 'is-hl' : ''}"><td><b>${esc(c.name)}</b><div class="mini">${esc(c.city)}</div></td><td>${badge(segLabel[c.seg], segKind[c.seg])}</td><td class="num">${c.trips.length}</td><td class="num">${fmtEur(total(c))}</td><td>${esc(last[1])} · ${last[0]}</td><td>${esc(c.next)}</td></tr>`; }).join('')}</tbody></table></div></div>`;
    },
  });
  M.act('ad-seg', (el) => M.ui('clientsSegment', el.dataset.k || null));
  M.act('ad-client', (el) => {
    const c = C.named[+el.dataset.i];
    const years = [];
    for (let y = 2018; y <= 2026; y++) years.push([y, c.trips.filter((x) => x[0] === y).reduce((a, x) => a + x[2], 0)]);
    const max = Math.max(...years.map((y) => y[1]), 1);
    const bars = years.map(([y, v], i) => { const h = v ? Math.max(3, (v / max) * 90) : 0; const x = 8 + i * 34; return `${v ? `<rect x="${x}" y="${100 - h}" width="22" height="${h}" rx="3" class="cy__bar" data-tipv="${y} : ${fmtEur(v)}"/>` : `<line x1="${x}" x2="${x + 22}" y1="100" y2="100" class="cy__zero"/>`}<text x="${x + 11}" y="114" text-anchor="middle" class="cy__y">${String(y).slice(2)}</text>`; }).join('');
    M.drawer.open(() => `<div class="modal__head"><span class="h2">${esc(c.name)}</span>${M.closeBtn('drawer')}</div><div class="modal__body">
      <div class="row" style="flex-wrap:wrap">${badge(segLabel[c.seg], segKind[c.seg])}<span class="hint">${esc(c.city)} · ${c.trips.length} voyage${c.trips.length > 1 ? 's' : ''} · ${fmtEur(total(c))}</span></div>
      <div class="h2" style="font-size:14px;margin:20px 0 6px">CA par année</div><svg class="cy" viewBox="0 0 320 120" role="img" aria-label="Chiffre d’affaires par année">${bars}</svg>
      <div class="h2" style="font-size:14px;margin:18px 0 6px">Voyages</div><div class="list cy__trips">${c.trips.slice().reverse().map(([y, d, v]) => `<div class="li"><div class="li__main"><div class="li__t">${esc(d)}</div><div class="li__s">${y}</div></div><b>${fmtEur(v)}</b></div>`).join('')}</div>
      <div class="h2" style="font-size:14px;margin:18px 0 6px">Note</div><p class="${c.note ? '' : 'muted'}">${esc(c.note || '—')}</p>
    </div>${c.delorme ? `<div class="modal__foot"><button class="btn btn--ghost" data-go="#/equipe/dossier/AM-26-0388">Ouvrir côté conseiller</button><button class="btn btn--primary" data-go="#/client/voyage">${ic('eye', 15)}Voir comme le client</button></div>` : ''}`);
  });
  document.addEventListener('mouseover', (e) => { const el = e.target.closest && e.target.closest('[data-tipv]'); if (el) M.tip.show(`<b>${esc(el.dataset.tipv)}</b>`, e.clientX, e.clientY); });
  document.addEventListener('mouseout', (e) => { if (e.target.closest && e.target.closest('[data-tipv]')) M.tip.hide(); });
})();
