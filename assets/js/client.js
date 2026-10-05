/* Atelier Méridien — client space (« Espace voyageur », Camille Delorme). */
(() => {
  'use strict';
  const { esc, fmtEur, fmtD, fmtT, ic, badge, av, NB } = M;
  const D = window.DATA;
  const T = D.trip;
  const K = T.kyoto;
  const maps = (fn, ...a) => (M.maps && M.maps[fn] ? M.maps[fn](...a) : '');
  const lowerFirst = (s) => s.charAt(0).toLowerCase() + s.slice(1);

  /* ——— Connexion (magic link) ——— */
  let linkSent = false;
  M.page({
    role: 'client', id: 'connexion', title: 'Connexion', nav: null, bare: true,
    render: () => `<div class="login card">
      <div class="login__brand">${M.logo.lockup({ light: true })}</div>
      <h1 class="h1">Accéder à votre voyage</h1>
      <p class="muted">Recevez un lien de connexion par e-mail. Pas de mot de passe à retenir.</p>
      ${linkSent
        ? `<div class="callout is-info" style="margin-top:18px">${ic('mail', 18)}<div><b>Lien envoyé à c.delorme@•••.org</b><div class="hint">Valable 15 minutes.</div></div></div><button class="btn btn--primary btn--lg btn--block" style="margin-top:16px" data-act="login-open">Ouvrir le lien (démo)</button><p class="mini" style="margin-top:12px;text-align:center">Dans cette démo, aucun e-mail n’est envoyé.</p>`
        : `<div class="field" style="margin-top:18px"><label class="label" for="login-mail">Adresse e-mail</label><input class="input" id="login-mail" type="email" value="camille.delorme@example.org" autocomplete="off"></div><button class="btn btn--primary btn--lg btn--block" style="margin-top:16px" data-act="login-send">Recevoir mon lien</button>`}
    </div>`,
  });
  M.act('login-send', () => { linkSent = true; M.render(); });
  M.act('login-open', () => { linkSent = false; M.emit('login'); M.go('#/client/voyage'); });

  /* ——— Mon voyage ——— */
  const kyotoCard = () => {
    const t = M.trip();
    const k = t.kyoto;
    const head = `<div class="card__head"><span class="h2">Kyoto, du 15 au 19 novembre : à vous de choisir</span>${k.state === 'confirmed' ? badge(`Confirmé · ${k.ref}`, 'ok') : `<span class="kyo__cd">${ic('clock', 15)}Il vous reste <b data-live="countdown" data-to="${T.deadlines.kyoto}">${esc(M.countdown(T.deadlines.kyoto))}</b></span>`}</div>`;
    if (k.state === 'confirmed') {
      const o = k.kept;
      return `<div class="card kyo" id="kyoto">${head}<div class="card__body kyo__done"><div class="kyo__map">${maps('kyoto', { choice: k.choice })}</div><div><div class="row" style="align-items:flex-start;gap:14px">${M.stamp({ at: k.confirmedAt, ref: k.ref, size: 56, land: M.once('client.kyoto.done') })}<div><div class="kyo__name serif">${esc(o.name)}</div><p class="muted">Du dimanche 15 au jeudi 19 novembre · 4 nuits · référence ${esc(k.ref)}</p></div></div><dl class="kv" style="margin-top:14px">${o.facts.map(([a, b]) => `<dt>${esc(a)}</dt><dd>${esc(b)}</dd>`).join('')}</dl></div></div></div>`;
    }
    if (k.state === 'sent' || k.state === 'requested') {
      if (M.S.seen['roll:client.kyotoDelta'] === undefined) M.S.seen['roll:client.kyotoDelta'] = 0;
      return `<div class="card kyo" id="kyoto">${head}<div class="card__body kyo__wait"><div class="kyo__map">${maps('kyoto', { choice: k.choice })}</div><div><div class="kyo__name serif">${esc(k.option.name)}</div><div class="row" style="flex-wrap:wrap;margin-top:8px">${badge('En attente de l’hôtel', 'info')}${k.choice === 'ryokan' ? `<span class="chip kyo__delta">+${M.roll('client.kyotoDelta', k.pendingDelta)} si l’hôtel confirme</span>` : '<span class="chip">Rien ne change à votre budget</span>'}</div><p class="muted" style="margin-top:12px">Votre choix est parti chez Louis le ${esc(fmtD(k.chosenAt, 'dow'))} à ${fmtT(k.chosenAt)}. ${k.state === 'requested' ? 'Il a fait la demande à l’hôtel ; la réponse arrive en général dans la journée.' : 'Il le confirme auprès de l’hôtel, en général sous 24 h.'}</p><button class="btn btn--plain btn--sm" style="margin-top:8px" data-act="kyoto-reopen">Changer d’avis</button></div></div></div>`;
    }
    const panel = (o, primary) => `<div class="kyo__opt">
      <div class="kyo__name serif">${esc(o.name)}</div>
      <dl class="kv">${o.facts.map(([a, b]) => `<dt>${esc(a)}</dt><dd>${esc(b)}</dd>`).join('')}<dt>Statut</dt><dd>${esc(o.status)}</dd></dl>
      <div class="kyo__price">${o.key === 'machiya' ? 'Inclus dans votre voyage' : `+${fmtEur(K.nights * (K.ryokan.nightly - K.machiya.nightly))} pour les 4 nuits<span class="mini"> · ${fmtEur(((K.ryokan.nightly - K.machiya.nightly) / 2))} par personne et par nuit</span>`}</div>
      <button class="btn ${primary ? 'btn--primary' : 'btn--ghost'} btn--block" data-act="kyoto-pick" data-k="${o.key}">${o.key === 'machiya' ? 'Garder la machiya' : 'Choisir le ryokan'}</button>
    </div>`;
    return `<div class="card kyo" id="kyoto">${head}<div class="card__body"><div class="kyo__grid"><div class="kyo__map">${maps('kyoto', {})}<p class="mini" style="margin-top:6px">Distances à pied jusqu’à Gion, calculées sur les coordonnées réelles.</p></div>${panel(K.machiya, false)}${panel(K.ryokan, true)}</div><blockquote class="kyo__quote serif">« ${esc(K.louisLine)} »<span>Louis</span></blockquote></div></div>`;
  };
  const checklist = () => {
    const t = M.trip();
    const c = M.counts().client;
    const k = t.kyoto;
    const p = M.passport();
    const it = (done, text, go, extra = '') => `<li class="todo ${done ? 'is-done' : ''}">${done ? `<span class="todo__ic">${ic('check', 13, 2.6)}</span>` : '<span class="todo__ic"></span>'}${go && !done ? `<button class="todo__t" ${go}>${text}</button>` : `<span class="todo__t">${text}</span>`}${extra}</li>`;
    return `<div class="card"><div class="card__head"><span class="h2">Avant de partir</span>${badge(`${c.checklistDone} sur ${c.checklistTotal}`, c.checklistDone === c.checklistTotal ? 'ok' : '')}</div><ul class="todos">
      ${it(true, `Acompte réglé · ${fmtEur(t.deposit)}, le 3 juillet`)}
      ${it(true, 'Passeport de Camille reçu')}
      ${it(!!k.choice, k.choice ? `Kyoto : ${lowerFirst(k.option.name)}${k.state === 'confirmed' ? ', confirmé' : ', en attente de l’hôtel'}` : 'Choisir votre maison à Kyoto · avant mercredi 7 octobre, 18 h', 'data-act="to-kyoto"')}
      ${it(p.status === 'verified', p.status === 'missing' ? 'Envoyer le passeport d’Antoine' : p.status === 'received' ? 'Passeport d’Antoine envoyé · en vérification' : 'Passeport d’Antoine vérifié', 'data-go="#/client/documents"')}
      ${it(t.balanceState === 'paid', t.balanceState === 'paid' ? 'Solde réglé' : t.balanceState === 'transfer' ? 'Virement annoncé · en cours de rapprochement' : `Régler le solde · ${fmtEur(t.balance)} avant le jeudi 8 octobre`, 'data-go="#/client/paiements"')}
    </ul></div>`;
  };
  M.page({
    role: 'client', id: 'voyage', title: 'Mon voyage', nav: { label: 'Mon voyage', icon: 'home', order: 1 },
    render: () => {
      const t = M.trip();
      const c = M.counts().client;
      const last = [...M.messages()].reverse().find((m) => m.from === 'louis');
      return `<div class="page-head"><div><div class="eyebrow">Dossier ${esc(T.id)} · 2 voyageurs</div><h1 class="h1 trip-title">${esc(T.titleA)} <span class="serif">${esc(T.titleB)}</span></h1><p class="lead">Du samedi 7 au dimanche 22 novembre 2026 · 16 jours, 14 nuits sur place · ${M.roll('client.total', t.total)} pour deux.</p></div></div>
        <div class="grid g-main">
          <div class="card cd"><div class="cd__left"><div class="cd__n serif">J-<span data-live="days" data-to="${T.start}">${M.daysTo(T.start)}</span></div><p>Départ le samedi 7 novembre à 13:25 de Paris-Charles-de-Gaulle.</p><button class="btn btn--plain btn--sm cd__link" data-go="#/client/itineraire">Voir l’itinéraire jour par jour ${ic('arrowR', 14)}</button></div><button class="cd__map" data-go="#/client/itineraire" aria-label="Voir l’itinéraire">${maps('japanThumb')}</button></div>
          ${checklist()}
        </div>
        <div style="margin-top:16px">${kyotoCard()}</div>
        <div class="grid g-2" style="margin-top:16px">
          <div class="card"><div class="card__head"><span class="h2">Vos réservations</span><button class="btn btn--plain btn--sm" data-go="#/client/reservations">Voir le détail ${ic('arrowR', 14)}</button></div><div class="card__body"><div class="resum"><b>${c.confirmed}</b> sur ${c.lines} confirmées</div><div class="bar" style="margin:10px 0 12px"><i style="width:${((c.confirmed / c.lines) * 100).toFixed(1)}%"></i></div><p class="hint">8 réservations ouvrent entre le 11 et le 21 octobre : Mme Sato, notre correspondante à Osaka, les prend le jour de l’ouverture.</p></div></div>
          <div class="card"><div class="card__head"><span class="h2">Dernier message</span>${last && !last.readClient ? badge('Nouveau', 'accent') : ''}</div><div class="card__body"><div class="row" style="margin-bottom:8px">${av('louis', 'av--sm')}<b>Louis</b><span class="mini">${esc(M.ago(last.at))}</span></div><p class="clamp4">${esc(last.text)}</p><div class="row" style="margin-top:12px"><button class="btn btn--ghost btn--sm" data-go="#/client/messages">Répondre</button></div></div></div>
        </div>
        <p class="mini" style="margin-top:20px">Vos voyages avec nous : Écosse, mai 2024 · Japon, novembre 2026</p>`;
    },
  });
  M.act('to-kyoto', () => document.getElementById('kyoto')?.scrollIntoView({ behavior: M.reduced ? 'auto' : 'smooth', block: 'start' }));
  M.act('kyoto-pick', (el) => {
    const key = el.dataset.k;
    const t = M.trip();
    const delta = K.nights * (K.ryokan.nightly - K.machiya.nightly);
    M.modal.open(() => key === 'ryokan'
      ? `<div class="modal__head"><span class="h2">Choisir le ryokan d’Okazaki ?</span>${M.closeBtn()}</div><div class="modal__body"><p>Votre choix part chez Louis, qui le confirme auprès de l’hôtel, en général sous 24 h. La machiya reste réservée jusqu’à sa réponse.</p><div class="pay" style="margin-top:14px"><div class="pay__row"><span>Total du voyage</span><span>${fmtEur(t.total)} → <b>${fmtEur(t.total + delta)}</b> si l’hôtel confirme</span></div><div class="pay__row"><span>Solde</span><span>${fmtEur(t.balance)} → <b>${fmtEur(t.balance + delta)}</b></span></div></div><div class="field" style="margin-top:16px"><label class="label" for="kyoto-note">Un mot pour Louis</label><textarea class="textarea" id="kyoto-note" rows="3">On part sur le ryokan, le jardin nous a convaincus.</textarea></div></div><div class="modal__foot"><button class="btn btn--ghost" data-act="mclose">Annuler</button><button class="btn btn--primary" data-act="kyoto-send" data-k="ryokan">${ic('send', 15)}Envoyer mon choix à Louis</button></div>`
      : `<div class="modal__head"><span class="h2">Garder la machiya d’Higashiyama ?</span>${M.closeBtn()}</div><div class="modal__body"><p>Louis confirme définitivement la maison et libère l’option du ryokan. Rien ne change à votre budget.</p><div class="field" style="margin-top:16px"><label class="label" for="kyoto-note">Un mot pour Louis</label><textarea class="textarea" id="kyoto-note" rows="3" placeholder="Facultatif"></textarea></div></div><div class="modal__foot"><button class="btn btn--ghost" data-act="mclose">Annuler</button><button class="btn btn--primary" data-act="kyoto-send" data-k="machiya">${ic('send', 15)}Envoyer mon choix à Louis</button></div>`, { size: 'md' });
  });
  M.act('kyoto-send', (el) => {
    const note = document.getElementById('kyoto-note')?.value || '';
    M.modal.close();
    M.emit('kyoto.choose', { choice: el.dataset.k, note });
  });
  M.act('kyoto-reopen', () => M.emit('kyoto.reopen'));

  /* ——— Réservations ——— */
  const lineStatus = (l, t) => {
    if (l.kyoto) {
      if (l.status === 'confirmed') return `${badge('Confirmé', 'ok')}<span class="ref">${esc(l.ref)}</span>${M.stamp({ at: l.confirmedOn, ref: l.ref, size: 34, land: M.once('client.kyoto.stamp') })}`;
      if (t.kyoto.state === 'open') return badge('Option · votre choix est attendu avant mer. 18 h', 'warn');
      return badge('En attente de l’hôtel', 'info');
    }
    if (l.status === 'confirmed') return `${badge('Confirmé', 'ok')}<span class="ref">${esc(l.ref)}</span>${M.stamp({ at: l.confirmedOn, ref: l.ref, size: 34 })}`;
    if (l.status === 'opening') return badge(l.openNote, 'info');
    return badge('À faire');
  };
  M.page({
    role: 'client', id: 'reservations', title: 'Réservations',
    nav: { label: 'Réservations', icon: 'stamp', order: 3, quiet: true, badge: () => `${M.counts().client.confirmed}/${M.trip().lineCount}` },
    render: () => {
      const t = M.trip();
      return `<div class="page-head"><div><h1 class="h1">Réservations</h1><p class="lead">${t.confirmedCount} sur ${t.lineCount} confirmées. Chaque réservation confirmée porte notre tampon, avec sa date et la référence du partenaire.</p></div></div>
        <div class="callout is-info" style="margin-bottom:16px">${ic('info', 18)}<div>Au Japon, trains, bus, certains restaurants et musées ouvrent leurs réservations un mois avant. Mme Sato les prend le jour de l’ouverture ; vous les verrez passer en « Confirmé » entre le 11 et le 21 octobre.</div></div>
        <div class="stack">${T.groups.map((g) => {
          const ls = t.lines.filter((l) => l.group === g);
          const ok = ls.filter((l) => l.status === 'confirmed').length;
          return `<div class="card"><div class="card__head"><span class="h2">${esc(g)}</span><span class="chip">${ok}/${ls.length}</span></div><div class="list">${ls.map((l) => `<div class="li resa ${l.status}"><span class="resa__ic">${ic(l.icon, 17)}</span><div class="li__main"><div class="resa__t">${esc(l.label)}</div><div class="li__s">${esc(l.dateLabel)}</div></div><div class="resa__st">${lineStatus(l, t)}</div></div>`).join('')}</div></div>`;
        }).join('')}</div>`;
    },
  });

  /* ——— Documents ——— */
  let upload = null; // { name, thumb, pdf }
  const coverage = (iso) => {
    if (!iso) return '';
    const ok = iso > T.end;
    return ok
      ? `<div class="check is-ok">${ic('check', 15, 2.2)}Valable jusqu’au ${esc(M.fmtD(iso, 'num'))} · couvre votre retour du 22/11/2026</div>`
      : `<div class="check is-bad">${ic('alert', 15)}Ce passeport expire avant votre retour du 22/11/2026. Appelez-nous : il faudra le renouveler.</div>`;
  };
  const docRow = (icn, title, sub, right = '') => `<div class="li"><span class="resa__ic">${ic(icn, 17)}</span><div class="li__main"><div class="li__t">${title}</div><div class="li__s">${sub}</div></div>${right}</div>`;
  M.page({
    role: 'client', id: 'documents', title: 'Documents',
    nav: { label: 'Documents', icon: 'passport', order: 4, badge: () => M.counts().client.docs },
    render: () => {
      const p = M.passport();
      const t = M.trip();
      const paid = t.payments.find((x) => x.kind === 'solde');
      let send = '';
      if (p.status === 'missing') {
        send = `<div class="card"><div class="card__head"><span class="h2">À nous envoyer</span>${badge('1 document', 'warn')}</div><div class="card__body"><div class="h2" style="font-size:15px;margin-bottom:10px">Passeport d’Antoine</div>
          ${upload
            ? `<div class="upl">${upload.thumb ? `<img class="upl__thumb" src="${upload.thumb}" alt="">` : `<span class="upl__pdf">${ic('doc', 26)}</span>`}<div class="li__main"><b>${esc(upload.name)}</b><div class="hint">Prêt à envoyer</div></div><button class="btn btn--plain btn--sm" data-act="up-clear">Changer</button></div>
               <div class="field" style="margin-top:14px;max-width:280px"><label class="label" for="pp-exp">Date d’expiration</label><input class="input" id="pp-exp" type="date" data-input="pp-exp" required></div><div id="pp-check" style="margin-top:10px"></div>
               <button class="btn btn--primary" style="margin-top:14px" data-act="pp-send" id="pp-send" disabled>${ic('send', 15)}Envoyer à Louis</button>`
            : `<label class="drop"><input type="file" accept="image/*,application/pdf" data-change="pp-file" hidden>${ic('upload', 22)}<b>Déposez une photo ou un PDF de la page d’identité</b><span class="hint">Dans cette démo, rien n’est envoyé.</span></label>`}
        </div></div>`;
      }
      const received = p.status === 'missing' ? '' : p.status === 'received'
        ? docRow('passport', 'Passeport d’Antoine', `Reçu le ${esc(fmtD(p.receivedAt, 'dm'))} · en vérification`, badge('En vérification', 'info'))
        : docRow('passport', 'Passeport d’Antoine', `Vérifié par Louis · valable jusqu’au ${esc(M.fmtD(p.expiry, 'num'))}`, badge('Vérifié', 'ok'));
      return `<div class="page-head"><div><h1 class="h1">Documents</h1><p class="lead">Ce que nous attendons de vous, et tout ce que nous vous envoyons.</p></div></div>
        <div class="stack">${send}
          <div class="card"><div class="card__head"><span class="h2">Reçus</span></div><div class="list">${docRow('passport', 'Passeport de Camille', 'Reçu le 4 juil. · vérifié par Louis · valable jusqu’en mars 2031', badge('Vérifié', 'ok'))}${received}</div></div>
          <div class="card"><div class="card__head"><span class="h2">De notre part</span></div><div class="list">
            ${docRow('doc', 'Programme détaillé', '16 jours · mis à jour le 3 juillet', maps('downloadMenu', { label: 'Ouvrir' }))}
            ${docRow('book', 'Conditions particulières de vente', 'Signées le 3 juillet', `<button class="btn btn--ghost btn--sm" data-act="print-cgv">${ic('print', 14)}Voir</button>`)}
            ${docRow('receipt', 'Facture d’acompte F-2026-0231', `${fmtEur(t.deposit)} · 3 juillet`, `<button class="btn btn--ghost btn--sm" data-act="print-doc" data-doc="deposit">${ic('print', 14)}Voir</button>`)}
            ${paid ? docRow('receipt', `Reçu ${esc(paid.receipt)}`, `${fmtEur(paid.amount)} · ${esc(fmtD(paid.at, 'dm'))}`, `<button class="btn btn--ghost btn--sm" data-act="print-doc" data-doc="receipt">${ic('print', 14)}Voir</button>`) + docRow('receipt', `Facture de solde ${esc(paid.invoice)}`, `${fmtEur(paid.amount)} · ${esc(fmtD(paid.at, 'dm'))}`, `<button class="btn btn--ghost btn--sm" data-act="print-doc" data-doc="balance">${ic('print', 14)}Voir</button>`) : ''}
            <div class="li is-later"><span class="resa__ic">${ic('plane', 17)}</span><div class="li__main"><div class="li__t">Billets électroniques</div><div class="li__s">Disponibles le vendredi 23 octobre</div></div></div>
            <div class="li is-later"><span class="resa__ic">${ic('book', 17)}</span><div class="li__main"><div class="li__t">Carnet de voyage</div><div class="li__s">Le vendredi 23 octobre ; la version imprimée part à Nantes le même jour</div></div></div>
          </div><div class="card__foot"><span class="hint">${ic('info', 14)} Nous vous guiderons pour Visit Japan Web, le formulaire d’arrivée en ligne, le samedi 24 octobre.</span></div></div>
        </div>`;
    },
  });
  M.change('pp-file', (el) => {
    const f = el.files && el.files[0];
    if (!f) return;
    const pdf = f.type === 'application/pdf';
    if (pdf || !f.type.startsWith('image/')) {
      upload = { name: f.name, thumb: null, pdf: true };
      return M.render();
    }
    const fr = new FileReader();
    fr.onload = () => {
      const img = new Image();
      img.onload = () => {
        const s = Math.min(1, 160 / Math.max(img.width, img.height));
        const cv = document.createElement('canvas');
        cv.width = Math.round(img.width * s);
        cv.height = Math.round(img.height * s);
        cv.getContext('2d').drawImage(img, 0, 0, cv.width, cv.height);
        upload = { name: f.name, thumb: cv.toDataURL('image/jpeg', 0.7), pdf: false };
        M.render();
      };
      img.onerror = () => { upload = { name: f.name, thumb: null, pdf: false }; M.render(); };
      img.src = fr.result;
    };
    fr.readAsDataURL(f);
  });
  M.input('pp-exp', (el) => {
    const box = document.getElementById('pp-check');
    if (box) box.innerHTML = coverage(el.value);
    const btn = document.getElementById('pp-send');
    if (btn) btn.disabled = !(el.value && el.value > T.end);
  });
  M.act('up-clear', () => { upload = null; M.render(); });
  M.act('pp-send', () => {
    const exp = document.getElementById('pp-exp')?.value;
    if (!exp || exp <= T.end || !upload) return;
    const u = upload;
    upload = null;
    M.emit('passport.upload', { expiry: exp, fileName: u.name, thumb: u.thumb });
  });

  /* printable documents */
  const docHead = (title, ref, date) => `<div class="doc__head">${M.logo.lockup({ light: true })}<div class="doc__ref"><b>${esc(title)}</b><br>${esc(ref)}<br>${esc(date)}</div></div><p class="doc__lead" style="margin-top:0"><b style="color:var(--ink)">Camille et Antoine Delorme</b><br>Nantes · dossier ${esc(T.id)}</p>`;
  const docFoot = () => `<p class="doc__legal">Prix TTC. TVA calculée sur la marge, régime particulier des agences de voyages (art. 266-1-e et 297 A du CGI).<br>${esc(D.company.legal)}</p>`;
  M.act('print-doc', (el) => {
    const t = M.trip();
    const paid = t.payments.find((x) => x.kind === 'solde');
    const kind = el.dataset.doc;
    M.print(() => {
      if (kind === 'deposit') {
        return `<div class="doc">${docHead('Facture d’acompte', 'F-2026-0231', '3 juillet 2026')}<table class="doc__table"><tr><td>Acompte de 30 % · Japon d’automne, du 7 au 22 novembre 2026, 2 voyageurs</td><td class="num">${fmtEur(t.deposit)}</td></tr><tr class="is-total"><td>Total TTC</td><td class="num">${fmtEur(t.deposit)}</td></tr></table><p class="doc__stamp">${M.stamp({ at: '2026-07-03', ref: 'PAYÉ', size: 64 })}Réglé par virement le 3 juillet 2026.</p>${docFoot()}</div>`;
      }
      const isReceipt = kind === 'receipt';
      return `<div class="doc">${docHead(isReceipt ? 'Reçu' : 'Facture de solde', isReceipt ? paid.receipt : paid.invoice, fmtD(paid.at, 'dmy'))}<table class="doc__table">${T.groups.map((g) => `<tr><td>${esc(g)}</td><td class="num">${fmtEur(t.groups[g])}</td></tr>`).join('')}<tr class="is-total"><td>Prix du voyage, 2 voyageurs</td><td class="num">${fmtEur(t.total)}</td></tr><tr><td>Acompte versé le 3 juillet (F-2026-0231)</td><td class="num">− ${fmtEur(t.deposit)}</td></tr><tr class="is-total"><td>${isReceipt ? 'Montant reçu' : 'Solde'}</td><td class="num">${fmtEur(paid.amount)}</td></tr></table><p class="doc__stamp">${M.stamp({ at: paid.at, ref: 'PAYÉ', size: 64 })}Réglé ${paid.method === 'carte' ? 'par carte' : 'par virement'} le ${esc(fmtD(paid.at, 'longY'))}.</p>${docFoot()}</div>`;
    });
  });
  M.act('print-cgv', () => M.print(() => `<div class="doc">${docHead('Conditions particulières de vente', T.id, 'Signées le 3 juillet 2026')}
    <p class="doc__note" style="margin-bottom:14px">Document de démonstration : ces conditions sont fictives et ne valent pas contrat.</p>
    <h2 class="doc__h">1. Prix et paiement</h2><p>Le prix du voyage est ferme à la confirmation, hors modification demandée par le voyageur. Un acompte de 30 % est versé à la confirmation ; le solde est dû 30 jours avant le départ, avancé au vendredi précédent lorsque cette date tombe un week-end.</p>
    <h2 class="doc__h">2. Modifications</h2><p>Toute modification demandée après la confirmation, comme le changement d’hébergement à Kyoto, est confirmée par écrit dans l’espace voyageur avec son incidence sur le prix.</p>
    <h2 class="doc__h">3. Annulation</h2><p>Frais d’annulation : 30 % du prix jusqu’à J-60, 50 % de J-59 à J-30, 75 % de J-29 à J-8, 100 % ensuite. Les frais de dossier ne sont pas remboursables.</p>
    <h2 class="doc__h">4. Assistance</h2><p>Une assistance joignable 24 h/24 au ${esc(D.company.phone)} accompagne le voyageur du départ au retour.</p>
    ${docFoot()}</div>`));

  /* ——— Paiements ——— */
  M.page({
    role: 'client', id: 'paiements', title: 'Paiements', nav: { label: 'Paiements', icon: 'card', order: 5 },
    render: () => {
      const t = M.trip();
      const paid = t.payments.find((x) => x.kind === 'solde');
      let soldeRow;
      if (t.balanceState === 'paid') {
        soldeRow = `<div class="sched__row is-done"><span class="todo__ic">${ic('check', 13, 2.6)}</span><div class="li__main"><b>Solde · ${fmtEur(paid.amount)}</b><div class="li__s">Payé le ${esc(fmtD(paid.at, 'dm'))} ${paid.method === 'carte' ? 'par carte' : 'par virement'} · reçu ${esc(paid.receipt)}</div></div><button class="btn btn--ghost btn--sm" data-act="print-doc" data-doc="receipt">${ic('print', 14)}Reçu</button></div>`;
      } else if (t.balanceState === 'transfer') {
        soldeRow = `<div class="sched__row"><span class="todo__ic"></span><div class="li__main"><b>Solde · ${M.roll('client.balance', t.balance)}</b><div class="li__s">Virement annoncé le ${esc(fmtD(M.S.transfer.at, 'dm'))} · en cours de rapprochement</div></div>${badge('Virement annoncé', 'info')}</div>`;
      } else {
        soldeRow = `<div class="sched__row is-due"><span class="todo__ic"></span><div class="li__main"><b>${paid ? 'Complément' : 'Solde'} · ${M.roll('client.balance', t.balance)}</b><div class="li__s">${paid ? 'Suite à la confirmation du ryokan à Kyoto' : 'Avant le jeudi 8 octobre'}</div></div><div class="row" style="flex-wrap:wrap;justify-content:flex-end"><button class="btn btn--primary btn--sm" data-act="pay-card-open">${ic('card', 15)}Payer par carte</button><button class="btn btn--ghost btn--sm" data-act="pay-transfer-open">J’ai fait un virement</button></div></div>`;
      }
      return `<div class="page-head"><div><h1 class="h1">Paiements</h1><p class="lead">Pour 2 voyageurs · prix TTC.</p></div></div>
        <div class="grid g-main">
          <div class="card"><div class="card__head"><span class="h2">Détail</span></div><div class="card__body">
            <table class="paytable">${T.groups.map((g) => `<tr><td>${esc(g)}</td><td class="num">${fmtEur(t.groups[g])}</td></tr>`).join('')}<tr class="is-total"><td>Total</td><td class="num">${M.roll('client.total', t.total)}</td></tr></table>
            <p class="hint" style="margin-top:6px">soit ${fmtEur(t.perPerson)} par personne</p>
            ${t.kyoto.pendingDelta ? `<div class="check is-warn" style="margin-top:10px">${ic('clock', 15)}+${fmtEur(t.kyoto.pendingDelta)} si l’hôtel confirme le ryokan d’Okazaki</div>` : ''}
            <details class="nights"><summary>Détail des nuits</summary><dl class="kv">${t.nightsDetail.map(([a, b]) => `<dt>${esc(a)}</dt><dd>${esc(b)}</dd>`).join('')}</dl></details>
          </div></div>
          <div class="card"><div class="card__head"><span class="h2">Échéancier</span></div><div class="card__body sched">
            <div class="sched__row is-done"><span class="todo__ic">${ic('check', 13, 2.6)}</span><div class="li__main"><b>Acompte 30 % · ${fmtEur(t.deposit)}</b><div class="li__s">Payé le 3 juillet par virement · facture F-2026-0231</div></div><button class="btn btn--plain btn--sm" data-act="print-doc" data-doc="deposit">${ic('print', 14)}</button></div>
            ${soldeRow}
          </div></div>
        </div>`;
    },
  });
  M.act('pay-card-open', () => {
    const t = M.trip();
    M.modal.open(() => `<div class="modal__head"><span class="h2">Paiement par carte (simulation)</span>${M.closeBtn()}</div><div class="modal__body"><p>Dans le portail réel, vous seriez redirigé vers la page sécurisée de notre banque. Ici, aucune carte n’est demandée et rien n’est débité.</p><div class="pay" style="margin-top:14px"><div class="pay__total"><span>Solde</span><span>${fmtEur(t.balance)}</span></div></div></div><div class="modal__foot"><button class="btn btn--ghost" data-act="mclose">Annuler</button><button class="btn btn--primary" data-act="pay-card">${ic('lock', 15)}Simuler le paiement de ${fmtEur(t.balance)}</button></div>`, { size: 'sm' });
  });
  M.act('pay-card', () => {
    M.emit('pay.card');
    const p = M.trip().payments.find((x) => x.kind === 'solde');
    M.modal.open(() => `<div class="modal__head"><span class="h2">Paiement reçu</span>${M.closeBtn()}</div><div class="modal__body receipt">${M.stamp({ at: p.at, ref: 'PAYÉ', size: 72, land: true })}<div><div class="receipt__amt">${fmtEur(p.amount)}</div><p class="muted">Reçu ${esc(p.receipt)} · ${esc(fmtD(p.at, 'dmy'))} à ${fmtT(p.at)}</p><p class="hint" style="margin-top:6px">Le reçu et la facture de solde sont dans vos documents.</p></div></div><div class="modal__foot"><button class="btn btn--ghost" data-act="print-doc" data-doc="receipt">${ic('print', 15)}Voir le reçu</button><button class="btn btn--primary" data-act="mclose">Terminé</button></div>`, { size: 'sm' });
  });
  M.act('pay-transfer-open', () => {
    const t = M.trip();
    M.modal.open(() => `<div class="modal__head"><span class="h2">Virement</span>${M.closeBtn()}</div><div class="modal__body"><dl class="kv"><dt>Montant</dt><dd><b>${fmtEur(t.balance)}</b></dd><dt>Notre RIB</dt><dd class="nowrap">FR76 •••• •••• •••• •••• •••• 042 (fictif)</dd><dt>Référence</dt><dd><b>AM-26-0388-SOLDE</b></dd></dl><p class="hint" style="margin-top:14px">Dites-nous quand c’est fait : nous rapprochons le virement dès son arrivée et vous envoyons le reçu.</p></div><div class="modal__foot"><button class="btn btn--ghost" data-act="mclose">Annuler</button><button class="btn btn--primary" data-act="pay-transfer">J’ai effectué le virement</button></div>`, { size: 'sm' });
  });
  M.act('pay-transfer', () => { M.modal.close(); M.emit('pay.transfer'); });

  /* ——— Messages ——— */
  M.page({
    role: 'client', id: 'messages', title: 'Messages',
    nav: { label: 'Messages', icon: 'chat', order: 6, badge: () => M.counts().client.messages },
    render: () => {
      M.readThread('client');
      return `<div class="page-head"><div><h1 class="h1">Messages</h1><p class="lead">Avec Louis Kervella, votre concepteur de voyage. En voyage, l’assistance répond 24 h/24 au ${esc(D.company.phone)}.</p></div></div>
        <div class="card thread">${thread('client')}
          <div class="composer"><div class="chips">${['Merci Louis !', 'On en parle au téléphone ?', 'On garde la machiya.'].map((q) => `<button class="option" data-act="msg-chip" data-t="${esc(q)}">${esc(q)}</button>`).join('')}</div><textarea class="textarea" id="msg-text" rows="3" placeholder="Votre message à Louis…"></textarea><div class="row" style="justify-content:flex-end;margin-top:10px"><button class="btn btn--primary" data-act="msg-send">${ic('send', 15)}Envoyer</button></div></div>
        </div>`;
    },
  });
  // shared with the team view through M.thread
  function thread(role) {
    let lastDay = '';
    return `<div class="msgs">${M.messages().map((m) => {
      const k = M.dayKey(m.at);
      const sep = k !== lastDay ? `<div class="msgs__day">${esc(fmtD(m.at, 'long'))}</div>` : '';
      lastDay = k;
      const who = D.people[m.from];
      const mine = (role === 'client' && m.from === 'camille') || (role === 'equipe' && m.from === 'louis');
      return `${sep}<div class="msg ${mine ? 'is-mine' : ''}">${av(m.from, 'av--sm')}<div class="msg__body"><div class="msg__meta"><b>${esc(who.name)}</b><span>${fmtT(m.at)}</span></div><div class="msg__text">${esc(m.text)}</div></div></div>`;
    }).join('')}</div>`;
  }
  M.thread = thread;
  M.act('msg-chip', (el) => {
    const ta = document.getElementById('msg-text');
    if (ta) { ta.value = el.dataset.t; ta.focus(); }
  });
  M.act('msg-send', () => {
    const ta = document.getElementById('msg-text');
    if (!ta || !ta.value.trim()) return M.toast('Écrivez votre message avant de l’envoyer.');
    M.emit('msg.client', { text: ta.value });
  });
})();
