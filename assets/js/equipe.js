/* Atelier Méridien — team space (« Espace conseiller », Louis Kervella). */
(() => {
  'use strict';
  const { esc, fmtEur, fmtPct, fmtD, fmtT, ic, badge, av, NB } = M;
  const D = window.DATA;
  const T = D.trip;
  const K = T.kyoto;
  const SUN = window.SUN || null;
  const lowerFirst = (s) => s.charAt(0).toLowerCase() + s.slice(1);
  const maps = (fn, ...a) => (M.maps && M.maps[fn] ? M.maps[fn](...a) : '');

  // J-30, moved back to Friday when it falls on a weekend
  const balanceDue = (start) => {
    const t = new Date(`${start}T12:00:00Z`);
    t.setUTCDate(t.getUTCDate() - 30);
    const wd = t.getUTCDay();
    if (wd === 6) t.setUTCDate(t.getUTCDate() - 1);
    if (wd === 0) t.setUTCDate(t.getUTCDate() - 2);
    return t.toISOString().slice(0, 10);
  };

  const delormeActions = () => {
    const t = M.trip();
    const k = t.kyoto;
    const p = M.passport();
    const a = [];
    if (k.state === 'open') a.push(['Choix pour Kyoto attendu mer. 18 h', '']);
    else if (k.state !== 'confirmed') a.push([k.choice === 'ryokan' ? 'Camille a choisi le ryokan : à confirmer' : 'Camille garde la machiya : à confirmer', 'warn']);
    else a.push([`Kyoto confirmé · ${k.ref}`, 'ok']);
    if (p.status === 'missing') a.push(['Passeport d’Antoine manquant', '']);
    if (p.status === 'received') a.push(['Passeport d’Antoine à vérifier', 'warn']);
    if (t.balanceState === 'paid') a.push(['Solde reçu', 'ok']);
    else if (t.balanceState === 'transfer') a.push(['Virement annoncé', 'info']);
    return a;
  };

  /* ——— Mes dossiers ——— */
  M.page({
    role: 'equipe', id: 'dossiers', title: 'Mes dossiers',
    nav: { label: 'Mes dossiers', icon: 'folder', order: 1, badge: () => M.counts().equipe.dossiers },
    render: () => {
      const c = M.counts().equipe;
      const t = M.trip();
      const g = M.garnier();
      const assigned = D.pipeline.unassigned.filter((r) => M.assigned(r.key) === 'louis');
      const req = [
        ...assigned.map((r) => ({ id: r.id, client: r.client, request: `${r.dest}, ${r.when}, ${r.pax} pers.`, receivedOn: r.receivedOn, isNew: true, note: r.source })),
        ...D.louis.toProcess,
      ];
      const week = [
        { id: 'AM-26-0214', client: 'Marchand', what: 'Japon, 7 → 21 oct.', step: 'Départ mercredi', acts: [['Carnet et billets envoyés le 22 sept. · rien à faire', '']], amount: 10480 },
        { id: T.id, client: 'Delorme', what: 'Japon, 7 → 22 nov.', step: 'Solde jeudi', acts: delormeActions(), amount: t.total },
        { id: 'garnier', client: 'Garnier', what: 'Japon, J9/15', step: 'En voyage', acts: [[g.status === 'open' ? 'Alerte train : trajet de demain' : 'Trajet de remplacement envoyé', g.status === 'open' ? 'warn' : 'ok']], amount: 12940, go: '#/equipe/en-voyage' },
        { id: 'AM-26-0251', client: 'Caron', what: 'Japon, 10 → 25 oct.', step: 'Départ samedi', acts: [['Carnet envoyé le 25 sept.', '']], amount: 12260 },
      ];
      return `<div class="page-head"><div><h1 class="h1">Mes dossiers</h1><p class="lead">${esc(fmtD(M.now(), 'long'))} · semaine 41</p></div></div>
        <div class="grid g-4 kpis">
          <div class="card kpi"><div class="kpi__label">À traiter</div><div class="kpi__value">${c.toProcess}</div><div class="kpi__delta">demandes à rappeler</div></div>
          <div class="card kpi"><div class="kpi__label">Propositions</div><div class="kpi__value">${c.proposals}</div><div class="kpi__delta">en attente de réponse</div></div>
          <div class="card kpi"><div class="kpi__label">Confirmés à venir</div><div class="kpi__value">${c.confirmed}</div><div class="kpi__delta">${c.confirmed2026} en 2026 · ${c.confirmed2027} en 2027</div></div>
          <div class="card kpi"><div class="kpi__label">En voyage</div><div class="kpi__value">${c.travelling}</div><div class="kpi__delta">${g.status === 'open' ? '<span class="down">1 alerte</span>' : 'RAS'}</div></div>
        </div>
        <div class="card" style="margin-top:16px"><div class="card__head"><span class="h2">Cette semaine</span></div><div class="list">${week.map((w) => `<button class="li wk" data-go="${w.go || `#/equipe/dossier/${w.id}`}"><div class="wk__who"><b>${esc(w.client)}</b><span class="li__s">${esc(w.what)}</span></div><span class="chip">${esc(w.step)}</span><div class="wk__acts">${w.acts.map(([a, k]) => (k ? badge(a, k) : `<span class="hint">${esc(a)}</span>`)).join('')}</div><span class="wk__amt">${fmtEur(w.amount)}</span></button>`).join('')}</div></div>
        <div class="grid g-2" style="margin-top:16px">
          <div class="card"><div class="card__head"><span class="h2">À traiter</span><span class="chip">${req.length}</span></div><div class="list">${req.map((r) => { const n = M.daysSince(r.receivedOn); return `<div class="li"><div class="li__main"><div class="li__t">${esc(r.client)} ${r.isNew ? badge('Nouveau', 'accent') : ''}</div><div class="li__s">${esc(r.request)}${r.note ? ` · ${esc(r.note)}` : ''}</div></div><span class="${n > 3 ? 'down' : 'muted'} nowrap mini-strong">${n === 0 ? 'reçue aujourd’hui' : `reçue il y a ${n}${NB}j`}</span></div>`; }).join('')}</div></div>
          <div class="card"><div class="card__head"><span class="h2">Propositions</span><span class="chip">${D.louis.proposals.length}</span></div><div class="list">${D.louis.proposals.map((p) => { const n = M.daysSince(p.sentOn); return `<div class="li"><div class="li__main"><div class="li__t">${esc(p.client)}</div><div class="li__s">Japon · départ ${esc(p.departure)} · envoyée le ${esc(fmtD(p.sentOn, 'dm'))}</div></div>${n > 10 ? badge(`À relancer · ${n}${NB}j`, 'warn') : `<span class="muted mini-strong">${n}${NB}j</span>`}</div>`; }).join('')}</div></div>
        </div>`;
    },
  });

  /* ——— Dossier ——— */
  const kyotoActions = (t) => {
    const k = t.kyoto;
    if (k.state === 'confirmed') return `<div class="eqk__done">${M.stamp({ at: k.confirmedAt, ref: k.ref, size: 96, land: M.once('equipe.kyoto.stamp') })}</div>`;
    if (k.state === 'open') return `<button class="btn btn--ghost btn--sm" disabled>En attente du choix client</button>`;
    if (k.state === 'sent') return `<button class="btn btn--primary btn--sm" data-act="eq-kyoto-request">${ic('send', 14)}Demander à l’hôtel</button>`;
    return `<span class="mini">Demande envoyée à l’hôtel · ${fmtT(k.requestedAt)}</span><button class="btn btn--primary btn--sm" data-act="eq-kyoto-confirm-open">${ic('stamp', 14)}Marquer confirmé</button>`;
  };
  const banner = (t) => {
    const k = t.kyoto;
    if (k.state === 'confirmed') return `<div class="callout eq-ok">${ic('check', 18)}<div><b>Kyoto confirmé · ${esc(k.ref)}</b><div class="hint">${esc(k.kept.name)}, du 15 au 19 novembre.</div></div></div>`;
    if (k.state === 'open') return `<div class="callout is-warn">${ic('clock', 18)}<div><b>Choix pour Kyoto attendu avant mercredi 18 h</b><div class="hint">Machiya réservée, ryokan en option. Il reste <span data-live="countdown" data-to="${T.deadlines.kyoto}">${esc(M.countdown(T.deadlines.kyoto))}</span>.</div></div></div>`;
    const txt = k.choice === 'ryokan' ? 'Camille a choisi le ryokan d’Okazaki, à confirmer auprès de l’hôtel avant mer. 18 h.' : 'Camille garde la machiya d’Higashiyama, à confirmer définitivement avant mer. 18 h.';
    return `<div class="callout is-warn">${ic('alert', 18)}<div><b>${esc(txt)}</b><div class="hint">${k.state === 'requested' ? `Demande envoyée à l’hôtel à ${fmtT(k.requestedAt)}.` : 'Onglet Prestations › Kyoto : demander à l’hôtel, puis marquer confirmé.'}</div></div></div>`;
  };
  function tabPrestations(t) {
    return T.groups.map((g) => `<div class="card eqp"><div class="card__head"><span class="h2">${esc(g)}</span><span class="muted">${fmtEur(t.groups[g])}</span></div><div class="list">${t.lines.filter((l) => l.group === g).map((l) => {
      let right;
      if (l.kyoto) right = kyotoActions(t);
      else if (l.status === 'confirmed') right = `${badge('Confirmé', 'ok')}<span class="ref">${esc(l.ref)}</span>`;
      else right = `${badge(l.openNote, 'info')}<span class="mini">Mme Sato réserve à l’ouverture · ${esc(fmtD(l.opensOn, 'dm'))}</span>`;
      return `<div class="li eqp__row ${l.kyoto ? 'is-kyoto' : ''}"><span class="resa__ic">${ic(l.icon, 16)}</span><div class="li__main"><div class="resa__t">${esc(l.label)}</div><div class="li__s">${esc(l.dateLabel)} · ${fmtEur(l.price)}</div></div><div class="eqp__st">${right}</div></div>`;
    }).join('')}</div></div>`).join('');
  }
  function tabClient(t) {
    M.readThread('equipe');
    const p = M.passport();
    const paid = t.payments.find((x) => x.kind === 'solde');
    const pRow = p.status === 'missing'
      ? `<div class="li"><span class="resa__ic">${ic('passport', 16)}</span><div class="li__main"><div class="li__t">Passeport d’Antoine</div><div class="li__s">Manquant · départ dans ${M.daysTo(T.start)}${NB}j</div></div>${badge('Manquant', 'bad')}</div>`
      : p.status === 'received'
        ? `<div class="li"><span class="resa__ic">${ic('passport', 16)}</span><div class="li__main"><div class="li__t">Passeport d’Antoine</div><div class="li__s">Reçu ${esc(M.ago(p.receivedAt))}${p.fileName ? ` · ${esc(p.fileName)}` : ''}</div></div><button class="btn btn--primary btn--sm" data-act="eq-pp-open">Vérifier</button></div>`
        : `<div class="li"><span class="resa__ic">${ic('passport', 16)}</span><div class="li__main"><div class="li__t">Passeport d’Antoine</div><div class="li__s">Vérifié · valable jusqu’au ${esc(M.fmtD(p.expiry, 'num'))}</div></div>${badge('Vérifié', 'ok')}</div>`;
    const solde = t.balanceState === 'paid' ? badge(`Reçu · ${paid.method}`, 'ok') : t.balanceState === 'transfer' ? badge('Virement annoncé', 'info') : badge(`Dû le ${fmtD(T.deadlines.balance, 'dm')}`, 'warn');
    const prepared = t.kyoto.state === 'confirmed' ? 'C’est confirmé pour Kyoto, vous avez la référence dans votre espace. Bonne fin de journée,\nLouis' : t.kyoto.choice === 'ryokan' ? 'Bien noté pour le ryokan. Je demande la confirmation à l’hôtel ce matin et je vous écris dès que c’est fait.\nLouis' : 'Bien reçu, merci. Je reviens vers vous dans la journée.\nLouis';
    return `<div class="grid g-2">
      <div class="card"><div class="card__head"><span class="h2">Documents</span></div><div class="list"><div class="li"><span class="resa__ic">${ic('passport', 16)}</span><div class="li__main"><div class="li__t">Passeport de Camille</div><div class="li__s">Vérifié le 4 juil. · valable jusqu’en mars 2031</div></div>${badge('Vérifié', 'ok')}</div>${pRow}</div></div>
      <div class="card"><div class="card__head"><span class="h2">Paiements</span></div><div class="list"><div class="li"><div class="li__main"><div class="li__t">Acompte · ${fmtEur(t.deposit)}</div><div class="li__s">Reçu le 3 juil. par virement</div></div>${badge('Reçu', 'ok')}</div><div class="li"><div class="li__main"><div class="li__t">Solde · ${fmtEur(paid && t.balanceState === 'paid' ? paid.amount : t.balance)}</div><div class="li__s">Échéance jeu. 8 oct. (J-30)</div></div>${solde}</div></div></div>
    </div>
    <div class="card thread" style="margin-top:16px"><div class="card__head"><span class="h2">Messages avec Camille</span></div>${M.thread ? M.thread('equipe') : ''}<div class="composer"><div class="chips"><button class="option" data-act="eq-prepared" data-t="${esc(prepared)}">${ic('star', 13)} Réponse préparée</button></div><textarea class="textarea" id="eq-msg" rows="3" placeholder="Votre réponse à Camille…"></textarea><div class="row" style="justify-content:flex-end;margin-top:10px"><button class="btn btn--primary" data-act="eq-send">${ic('send', 15)}Envoyer</button></div></div></div>`;
  }
  function figures(choice) {
    const ryo = choice === 'ryokan';
    const extra = ryo ? K.nights * (K.ryokan.nightly - K.machiya.nightly) : 0;
    const rows = T.groups.map((g) => {
      let sale = T.lines.filter((l) => l.group === g).reduce((a, l) => a + (l.price || K.nights * K.machiya.nightly), 0);
      let cost = T.costs[g];
      if (g === 'Hébergements' && ryo) { sale += extra; cost += K.ryokan.extraCost; }
      return { g, sale, cost, margin: sale - cost };
    });
    const sale = rows.reduce((a, r) => a + r.sale, 0);
    const cost = rows.reduce((a, r) => a + r.cost, 0);
    const air = rows.find((r) => r.g === 'Vols');
    const exAir = sale - cost - air.margin;
    return { rows, sale, cost, margin: sale - cost, pct: ((sale - cost) / sale) * 100, exAir, exAirPct: (exAir / (sale - air.sale)) * 100 };
  }
  function tabChiffres(t) {
    const cur = t.kyoto.state === 'confirmed' && t.kyoto.choice === 'ryokan' ? 'ryokan' : 'machiya';
    const f = figures(cur);
    const a = figures('machiya');
    const b = figures('ryokan');
    const col = (x, key, label) => `<div class="cmp__col ${key === cur ? 'is-on' : ''}"><div class="cmp__h">${label}${key === cur ? badge('Actuel', 'accent') : ''}</div><dl class="kv"><dt>Vente</dt><dd>${fmtEur(x.sale)}</dd><dt>Coût partenaires</dt><dd>${fmtEur(x.cost)}</dd><dt>Marge</dt><dd><b>${fmtEur(x.margin)}</b> · ${fmtPct(x.pct)}</dd><dt>Hors aérien</dt><dd>${fmtEur(x.exAir)} · ${fmtPct(x.exAirPct)}</dd></dl></div>`;
    return `<div class="grid g-main"><div class="card"><div class="card__head"><span class="h2">Vente, coût et marge par poste</span></div><div class="tablewrap"><table class="table"><thead><tr><th>Poste</th><th class="num">Vente</th><th class="num">Coût</th><th class="num">Marge</th></tr></thead><tbody>${f.rows.map((r) => `<tr><td>${esc(r.g)}</td><td class="num">${fmtEur(r.sale)}</td><td class="num">${fmtEur(r.cost)}</td><td class="num">${fmtEur(r.margin)} <span class="mini">${fmtPct((r.margin / r.sale) * 100)}</span></td></tr>`).join('')}<tr class="is-total"><td>Total</td><td class="num">${fmtEur(f.sale)}</td><td class="num">${fmtEur(f.cost)}</td><td class="num">${fmtEur(f.margin)} <span class="mini">${fmtPct(f.pct)}</span></td></tr></tbody></table></div><div class="card__foot"><span class="hint">Marge hors aérien : <b>${fmtEur(f.exAir)}</b> sur ${fmtEur(f.sale - f.rows[0].sale)}, soit ${fmtPct(f.exAirPct)}.</span></div></div>
      <div class="card"><div class="card__head"><span class="h2">Kyoto : les deux options</span></div><div class="card__body cmp">${col(a, 'machiya', 'Avec la machiya')}${col(b, 'ryokan', 'Avec le ryokan')}</div><div class="card__foot"><span class="mini">Visible par l’équipe et la direction uniquement.</span></div></div></div>`;
  }
  M.page({
    role: 'equipe', id: 'dossier', title: 'Dossier', nav: null, parent: 'dossiers', crumb: (id) => id || '',
    render: (id) => {
      if (id && id !== T.id) {
        const r = [...D.louis.confirmed2026, ...D.louis.confirmed2027].find((x) => x.id === id);
        return `<div class="page-head"><div><div class="eyebrow">${esc(id)}</div><h1 class="h1" style="margin-top:6px">${esc(r ? r.client : 'Dossier')}</h1>${r ? `<p class="lead">Japon · ${esc(fmtD(r.start, 'dm'))} → ${esc(fmtD(r.end, 'dmy'))} · ${r.pax} voyageurs · ${fmtEur(r.total)}</p>` : ''}</div></div><div class="card empty">${ic('folder', 26)}<b>Détail non repris dans cette maquette</b><span>Le dossier Delorme est entièrement détaillé.</span><button class="btn btn--ghost btn--sm" data-go="#/equipe/dossier/${T.id}">Ouvrir le dossier Delorme</button></div>`;
      }
      const t = M.trip();
      const tab = M.ui('dossierTab') || 'prestations';
      const c = M.counts().equipe;
      const tabs = [['prestations', 'Prestations'], ['client', `Client${c.passportAction + c.unread ? ` · ${c.passportAction + c.unread}` : ''}`], ['chiffres', 'Chiffres']];
      return `<div class="page-head"><div><div class="eyebrow">${esc(T.id)} · Delorme</div><h1 class="h1" style="margin-top:6px">Japon d’automne</h1><p class="lead">7 → 22 nov. · 2 voyageurs · ${fmtEur(t.total)} · ${t.confirmedCount}/${t.lineCount} prestations confirmées</p></div><div class="page-head__actions"><button class="btn btn--ghost" data-go="#/client/voyage">${ic('eye', 15)}Voir comme le client</button><button class="btn btn--ghost" data-act="eq-tab" data-t="client">${ic('chat', 15)}Écrire</button></div></div>
        ${banner(t)}
        <div class="tabs eq-tabs" role="tablist">${tabs.map(([k, l]) => `<button class="${tab === k ? 'is-on' : ''}" role="tab" data-act="eq-tab" data-t="${k}">${esc(l)}</button>`).join('')}</div>
        <div class="stack" style="margin-top:16px">${tab === 'client' ? tabClient(t) : tab === 'chiffres' ? tabChiffres(t) : tabPrestations(t)}</div>`;
    },
  });
  M.act('eq-tab', (el) => M.ui('dossierTab', el.dataset.t));
  M.act('eq-kyoto-request', () => M.emit('kyoto.request'));
  M.act('eq-kyoto-confirm-open', () => {
    const o = K[M.S.kyoto.choice];
    const recv = new Date(M.now().getTime() - 3 * 6e4);
    M.modal.open(() => `<div class="modal__head"><span class="h2">Confirmer Kyoto · ${esc(lowerFirst(o.name))}</span>${M.closeBtn()}</div><div class="modal__body"><div class="field"><label class="label" for="kyo-ref">Référence de l’hôtel</label><input class="input" id="kyo-ref" value="${esc(o.ref)}" autocomplete="off"></div><p class="hint" style="margin-top:12px">Reçue par e-mail de l’hôtel, aujourd’hui à ${fmtT(recv)}.</p><p class="mini" style="margin-top:4px">Démo : la réponse de l’hôtel est simulée.</p></div><div class="modal__foot"><button class="btn btn--ghost" data-act="mclose">Annuler</button><button class="btn btn--primary" data-act="eq-kyoto-confirm">${ic('stamp', 15)}Confirmer et prévenir Camille</button></div>`, { size: 'sm' });
  });
  M.act('eq-kyoto-confirm', () => {
    const ref = document.getElementById('kyo-ref')?.value || '';
    M.modal.close();
    M.emit('kyoto.confirm', { ref });
  });
  M.act('eq-pp-open', () => {
    const p = M.passport();
    M.modal.open(() => `<div class="modal__head"><span class="h2">Passeport d’Antoine Delorme</span>${M.closeBtn()}</div><div class="modal__body">${p.thumb ? `<img src="${p.thumb}" alt="" class="eq-pp">` : `<div class="eq-pp eq-pp--none">${ic('doc', 28)}<span>${esc(p.fileName || 'Document reçu')}</span></div>`}<dl class="kv" style="margin-top:14px"><dt>Expire le</dt><dd>${esc(M.fmtD(p.expiry, 'num'))}</dd><dt>Retour</dt><dd>22/11/2026</dd><dt>Contrôle</dt><dd>${p.covers ? badge('OK : couvre le retour', 'ok') : badge('Expire avant le retour', 'bad')}</dd></dl></div><div class="modal__foot"><button class="btn btn--ghost" data-act="mclose">Refuser</button><button class="btn btn--primary" data-act="eq-pp-verify">${ic('check', 15)}Marquer vérifié</button></div>`, { size: 'sm' });
  });
  M.act('eq-pp-verify', () => { M.modal.close(); M.emit('passport.verify'); });
  M.act('eq-prepared', (el) => { const ta = document.getElementById('eq-msg'); if (ta) { ta.value = el.dataset.t; ta.focus(); } });
  M.act('eq-send', () => {
    const ta = document.getElementById('eq-msg');
    if (!ta || !ta.value.trim()) return M.toast('Écrivez votre message avant de l’envoyer.');
    M.emit('msg.team', { text: ta.value });
  });

  /* ——— Départs (timeline) ——— */
  M.page({
    role: 'equipe', id: 'departs', title: 'Départs', nav: { label: 'Départs', icon: 'cal', order: 2 },
    render: () => {
      const x0 = Date.UTC(2026, 9, 1);
      const x1 = Date.UTC(2027, 0, 10);
      const W = 900; const L = 170; const RH = 28;
      const X = (iso) => L + ((Date.parse(`${iso}T00:00:00Z`) - x0) / (x1 - x0)) * (W - L - 10);
      const now = M.now();
      const t = M.trip();
      const p = M.passport();
      const rows = [{ id: 'garnier', client: 'Garnier', start: '2026-09-27', end: '2026-10-11', state: 'travel' }, ...D.louis.confirmed2026.map((r) => {
        let paid = r.balance === 'reçu';
        let doc = r.doc !== 'ok';
        if (r.id === T.id) { paid = t.balanceState === 'paid'; doc = p.status === 'missing'; }
        const due = balanceDue(r.start);
        const soon = !paid && M.daysTo(due) <= 14;
        return { ...r, state: paid ? 'paid' : soon ? 'soon' : 'later', doc, due };
      })];
      const H = rows.length * RH + 40;
      const ticks = [['2026-10-01', 'oct.'], ['2026-11-01', 'nov.'], ['2026-12-01', 'déc.'], ['2027-01-01', 'janv.']].map(([d, l]) => `<line x1="${X(d)}" x2="${X(d)}" y1="20" y2="${H}" class="dtl__grid"/><text x="${X(d) + 4}" y="14" class="dtl__tick">${l}</text>`).join('');
      const todayX = X(M.dayKey(now));
      const bars = rows.map((r, i) => {
        const y = 26 + i * RH;
        const xs = Math.max(L, X(r.start));
        const xe = X(r.end);
        const go = r.id === 'garnier' ? '#/equipe/en-voyage' : `#/equipe/dossier/${r.id}`;
        return `<g class="dtl__row" data-go="${go}" tabindex="0" role="link" aria-label="${esc(r.client)}"><rect x="0" y="${y - 4}" width="${W}" height="${RH}" class="dtl__hit"/><text x="10" y="${y + 13}" class="dtl__name">${esc(r.client)}</text><rect x="${xs.toFixed(1)}" y="${y + 2}" width="${Math.max(4, xe - xs).toFixed(1)}" height="14" rx="4" class="dtl__bar is-${r.state}"/>${r.doc ? `<circle cx="${(xs + 1).toFixed(1)}" cy="${y + 9}" r="3.5" class="dtl__doc"/>` : ''}</g>`;
      }).join('');
      return `<div class="page-head"><div><h1 class="h1">Départs</h1><p class="lead">D’octobre à décembre : ${rows.length - 1} départs confirmés et 1 couple en voyage.</p></div></div>
        <div class="card"><div class="card__head"><span class="h2">Octobre à décembre</span></div><div class="tablewrap"><svg class="dtl" viewBox="0 0 ${W} ${H}" style="min-width:${W}px" role="img" aria-label="Frise des départs">${ticks}<line x1="${todayX}" x2="${todayX}" y1="20" y2="${H}" class="dtl__today"/><text x="${todayX + 4}" y="${H - 4}" class="dtl__todayt">Aujourd’hui</text>${bars}</svg></div>
        <div class="card__foot dtl__legend"><span><i class="is-travel"></i>En voyage</span><span><i class="is-paid"></i>Solde reçu</span><span><i class="is-soon"></i>Solde dû sous 14 jours</span><span><i class="is-later"></i>Solde dû plus tard</span><span><i class="is-doc"></i>Document manquant</span></div></div>`;
    },
  });

  /* ——— En voyage ——— */
  M.page({
    role: 'equipe', id: 'en-voyage', title: 'En voyage',
    nav: { label: 'En voyage', icon: 'globe', order: 3, badge: () => M.counts().equipe.enVoyage },
    render: () => {
      const g = M.garnier();
      const G = D.garnier;
      const sunset = SUN ? SUN.riseSet(M.dayKey(M.now(), 'Asia/Tokyo'), 36.141, 137.258, 'Asia/Tokyo').set : '17:30';
      const journal = G.journal.slice().reverse().slice(0, 3);
      const state = g.status === 'open'
        ? `<div class="callout is-warn">${ic('alert', 18)}<div><b>Alerte transmise par Mme Sato · 06:12 heure locale (23:12 à Paris, dimanche)</b><div style="margin-top:4px">${esc(G.sato)}</div></div></div><div class="row" style="margin-top:16px;flex-wrap:wrap"><button class="btn btn--primary" data-act="eq-garnier-open">${ic('route', 15)}Proposer le trajet de remplacement</button><span class="hint">Bus express de 8:50 pour Nagoya, puis Shinkansen : arrivée à Kyoto à ${G.newArrival}.</span></div>`
        : `<div class="callout eq-ok">${ic('check', 18)}<div><b>Trajet de remplacement envoyé à ${fmtT(g.handledAt)} (Paris) · ${fmtT(g.handledAt, 'Asia/Tokyo')} à Takayama</b><div class="hint">Bus express de 8:50 pour Nagoya, puis Shinkansen : arrivée à Kyoto à ${G.newArrival} au lieu de ${G.oldArrival}. Mme Sato remet les billets ce soir.</div></div></div>`;
      return `<div class="page-head"><div><h1 class="h1">En voyage</h1><p class="lead">Vos clients sur place en ce moment.</p></div></div>
        <div class="card"><div class="card__head"><span class="h2">M. et Mme Garnier · Takayama · J9/15</span>${g.status === 'open' ? badge('Alerte', 'warn') : badge('RAS', 'ok')}</div>
          <div class="card__body ev">
            <div class="ev__map">${maps('garnier')}<p class="mini" style="margin-top:6px">En tirets : demain, en bus jusqu’à Nagoya puis en Shinkansen jusqu’à Kyoto. En rouge : la section coupée.</p></div>
            <div><div class="ev__live"><span class="livedot"></span>Heure locale <b data-live="time" data-tz="Asia/Tokyo">${fmtT(M.now(), 'Asia/Tokyo')}</b> · soleil couché à ≈${NB}${sunset}</div>
              ${state}
              <div class="timeline" style="margin-top:18px">${journal.map((j) => `<div class="tl is-done"><i class="tl__dot"></i><div><div class="tl__t">${esc(j.text)}</div><div class="tl__s">${esc(fmtD(j.at, 'dow'))} · ${fmtT(j.at)} à Paris</div></div></div>`).join('')}</div>
            </div>
          </div>
        </div>`;
    },
  });
  M.act('eq-garnier-open', () => {
    M.modal.open(() => `<div class="modal__head"><span class="h2">Trajet de remplacement</span>${M.closeBtn()}</div><div class="modal__body"><p class="hint">Message envoyé aux Garnier sur leur téléphone et dans leur espace :</p><div class="eq-preview">${esc(D.garnier.replacementMessage)}</div></div><div class="modal__foot"><button class="btn btn--ghost" data-act="mclose">Annuler</button><button class="btn btn--primary" data-act="eq-garnier-send">${ic('send', 15)}Envoyer aux Garnier</button></div>`, { size: 'md' });
  });
  M.act('eq-garnier-send', () => { M.modal.close(); M.emit('garnier.send'); });
})();
