/* Atelier Méridien — portal core.
   Demo clock, shared state, the cross-role loop (emit), computed trip and counters, router, frame
   (demo bar, sidebar, top bar), and the shared components every page module uses: modal, drawer,
   tooltip, toasts, rolling figures, confirmation stamp, logo, downloads and printable documents.
   Everything runs in the page: no request leaves it. */
(() => {
  'use strict';

  const D = window.DATA;
  const SUN = window.SUN || null;
  const KEY = 'meridien-voyages-demo-v1';
  const OLD_KEY = 'meridien-portail-demo-v1';
  const NB = ' ';
  const MAX_ELAPSED = 6 * 3600e3;
  const app = document.getElementById('app');
  const toastsEl = document.getElementById('toasts');
  const reduced = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const clone = (x) => JSON.parse(JSON.stringify(x));
  let uidN = 0;
  const uid = (p = 'u') => `${p}${++uidN}`;

  /* ——— formatting ——— */
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  const nf = {};
  const fmtNum = (n, dec = 0) => {
    const k = String(dec);
    nf[k] = nf[k] || new Intl.NumberFormat('fr-FR', { minimumFractionDigits: dec, maximumFractionDigits: dec });
    return nf[k].format(n).replace(/[   ]/g, NB);
  };
  const fmtEur = (n) => `${fmtNum(Math.round(n))}${NB}€`;
  const fmtPct = (p, dec = 1) => `${fmtNum(p, dec)}${NB}%`;

  /* ——— dates (always Paris unless a zone is given) ——— */
  const d = (x) => {
    if (x instanceof Date) return x;
    if (typeof x === 'number') return new Date(x);
    if (/^\d{4}-\d{2}-\d{2}$/.test(String(x))) return new Date(`${x}T12:00:00Z`);
    return new Date(x);
  };
  const dtf = {};
  const parts = (x, tz = 'Europe/Paris') => {
    const k = `p${tz}`;
    dtf[k] = dtf[k] || new Intl.DateTimeFormat('fr-FR', { timeZone: tz, weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    const o = {};
    dtf[k].formatToParts(d(x)).forEach((p) => (o[p.type] = p.value));
    return o;
  };
  const SHORT_M = { janvier: 'janv.', février: 'févr.', mars: 'mars', avril: 'avr.', mai: 'mai', juin: 'juin', juillet: 'juil.', août: 'août', septembre: 'sept.', octobre: 'oct.', novembre: 'nov.', décembre: 'déc.' };
  const SHORT_W = { lundi: 'lun.', mardi: 'mar.', mercredi: 'mer.', jeudi: 'jeu.', vendredi: 'ven.', samedi: 'sam.', dimanche: 'dim.' };
  const fmtD = (x, style = 'dow', tz = 'Europe/Paris') => {
    const p = parts(x, tz);
    const day = p.day === '1' ? '1er' : p.day;
    const ms = SHORT_M[p.month] || p.month;
    switch (style) {
      case 'dow': return `${SHORT_W[p.weekday]} ${day} ${ms}`;
      case 'long': return `${p.weekday} ${day} ${p.month}`;
      case 'longY': return `${p.weekday} ${day} ${p.month} ${p.year}`;
      case 'dm': return `${day} ${ms}`;
      case 'dmy': return `${day} ${ms} ${p.year}`;
      case 'month': return `${p.month} ${p.year}`;
      case 'stamp': return `${p.day} ${ms} ${p.year}`.toUpperCase();
      case 'num': {
        const k = `n${tz}`;
        dtf[k] = dtf[k] || new Intl.DateTimeFormat('fr-FR', { timeZone: tz, day: '2-digit', month: '2-digit', year: 'numeric' });
        return dtf[k].format(d(x));
      }
      default: return `${day} ${ms}`;
    }
  };
  const fmtT = (x, tz = 'Europe/Paris') => {
    const k = `t${tz}`;
    dtf[k] = dtf[k] || new Intl.DateTimeFormat('fr-FR', { timeZone: tz, hour: 'numeric', minute: '2-digit', hourCycle: 'h23' });
    return dtf[k].format(d(x));
  };
  const fmtH = (x, tz = 'Europe/Paris') => {
    const [h, m] = fmtT(x, tz).split(':');
    return m === '00' ? `${h}${NB}h` : `${h}${NB}h${NB}${m}`;
  };
  const dayKey = (x, tz = 'Europe/Paris') => {
    const k = `k${tz}`;
    dtf[k] = dtf[k] || new Intl.DateTimeFormat('en-CA', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit' });
    return dtf[k].format(d(x));
  };
  const dayNum = (key) => Date.UTC(+key.slice(0, 4), +key.slice(5, 7) - 1, +key.slice(8, 10)) / 864e5;
  const daysTo = (iso) => dayNum(dayKey(iso)) - dayNum(dayKey(now()));
  const daysSince = (iso) => -daysTo(iso);
  const countdown = (iso) => {
    const ms = d(iso) - now();
    if (ms <= 0) return 'échéance passée';
    const days = Math.floor(ms / 864e5);
    const hours = Math.floor((ms % 864e5) / 36e5);
    if (!days) return hours ? `${hours}${NB}h` : `${Math.max(1, Math.floor(ms / 6e4))}${NB}min`;
    return `${days}${NB}j ${hours}${NB}h`;
  };
  const ago = (iso) => {
    const t = d(iso);
    const diff = now() - t;
    if (diff < 9e4) return 'à l’instant';
    if (diff < 36e5) return `il y a ${Math.round(diff / 6e4)}${NB}min`;
    const dd = daysSince(t);
    if (dd === 0) return `aujourd’hui, ${fmtT(t)}`;
    if (dd === 1) return `hier, ${fmtT(t)}`;
    return `${fmtD(t, 'dow')}, ${fmtT(t)}`;
  };

  /* ——— state ——— */
  const seed = () => ({
    v: 1,
    clock: { realStart: Date.now() },
    kyoto: { choice: null, chosenAt: null, request: null, confirmed: null },
    passport: { status: 'missing', expiry: null, fileName: null, thumb: null, receivedAt: null, verifiedAt: null },
    payments: clone(D.trip.payments),
    transfer: null,
    garnier: { status: 'open', handledAt: null },
    requests: {},
    msgs: D.trip.messages.map((m, i) => ({ ...clone(m), readClient: m.from !== 'louis' || i < D.trip.messages.length - 1, readEquipe: true })),
    notes: { client: clone(D.notes.client), equipe: clone(D.notes.equipe), admin: clone(D.notes.admin) },
    log: [],
    seen: {},
    loggedOut: false,
    ui: { itinDay: 1, analyticsReading: 'vente', period: 'ytd', destFilter: null },
  });
  const load = () => {
    try {
      localStorage.removeItem(OLD_KEY);
      const s = JSON.parse(localStorage.getItem(KEY));
      return s && s.v === 1 && s.clock ? s : null;
    } catch (e) {
      return null;
    }
  };
  let S = load() || seed();
  const save = () => {
    try {
      localStorage.setItem(KEY, JSON.stringify(S));
    } catch (e) {
      // a thumbnail can exceed the quota: drop it and retry once
      if (S.passport.thumb) {
        S.passport.thumb = null;
        try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e2) {}
      }
    }
  };
  const anchor = Date.parse(D.anchorUTC);
  function now() {
    const el = Math.min(MAX_ELAPSED, Math.max(0, Date.now() - S.clock.realStart));
    return new Date(anchor + el);
  }
  const nowISO = () => now().toISOString();
  function ui(k, ...rest) {
    if (!rest.length) return S.ui[k];
    const [v, rerender = true] = rest;
    S.ui[k] = v;
    save();
    if (rerender) render();
    return v;
  }
  const once = (k) => {
    if (S.seen[`once:${k}`]) return false;
    S.seen[`once:${k}`] = 1;
    save();
    return true;
  };

  /* ——— computed trip (single source for every amount) ——— */
  const K = D.trip.kyoto;
  function trip() {
    const k = S.kyoto;
    const confirmed = !!k.confirmed;
    const ryokanOn = confirmed && k.choice === 'ryokan';
    const opt = ryokanOn ? K.ryokan : K.machiya;
    const lines = D.trip.lines.map((l) => {
      if (l.id !== K.lineId) return { ...l };
      const kept = confirmed ? (k.choice === 'ryokan' ? K.ryokan : K.machiya) : null;
      return {
        ...l,
        kyoto: true,
        price: K.nights * opt.nightly,
        status: confirmed ? 'confirmed' : 'option',
        ref: confirmed ? k.confirmed.ref : null,
        confirmedOn: confirmed ? k.confirmed.at : null,
        label: kept ? `Kyoto · ${kept.name} · ${K.nights} nuits` : l.label,
      };
    });
    const groups = {};
    D.trip.groups.forEach((g) => (groups[g] = 0));
    lines.forEach((l) => (groups[l.group] += l.price || 0));
    const total = Object.values(groups).reduce((a, b) => a + b, 0);
    const payments = S.payments.slice();
    const paid = payments.reduce((a, p) => a + p.amount, 0);
    const deposit = payments.filter((p) => p.kind === 'acompte').reduce((a, p) => a + p.amount, 0);
    const balance = total - paid;
    const cost = Object.values(D.trip.costs).reduce((a, b) => a + b, 0) + (ryokanOn ? K.ryokan.extraCost : 0);
    const margin = total - cost;
    const air = groups.Vols;
    const marginExAir = margin - (air - D.trip.costs.Vols);
    const state = confirmed ? 'confirmed' : k.request ? 'requested' : k.choice ? 'sent' : 'open';
    const balanceState = balance <= 0 ? 'paid' : S.transfer ? 'transfer' : 'due';
    return {
      lines,
      groups,
      total,
      perPerson: total / D.trip.pax,
      deposit,
      paid,
      balance,
      balanceState,
      payments,
      confirmedCount: lines.filter((l) => l.status === 'confirmed').length,
      lineCount: lines.length,
      kyoto: {
        choice: k.choice,
        state,
        option: k.choice ? K[k.choice] : null,
        kept: opt,
        pendingDelta: k.choice === 'ryokan' && !confirmed ? K.nights * (K.ryokan.nightly - K.machiya.nightly) : 0,
        ref: confirmed ? k.confirmed.ref : null,
        confirmedAt: confirmed ? k.confirmed.at : null,
        chosenAt: k.chosenAt,
        requestedAt: k.request ? k.request.at : null,
      },
      cost,
      margin,
      marginPct: (margin / total) * 100,
      marginExAir,
      marginExAirPct: (marginExAir / (total - air)) * 100,
      nightsDetail: [
        ['Tokyo', `3 × ${fmtEur(290)}`],
        ['Hakone', fmtEur(780)],
        ['Kanazawa', `2 × ${fmtEur(240)}`],
        ['Takayama', fmtEur(520)],
        ['Kyoto', `${K.nights} × ${fmtEur(opt.nightly)}`],
        ['Naoshima', `2 × ${fmtEur(360)}`],
        ['Osaka', fmtEur(210)],
      ],
    };
  }

  const passport = () => {
    const p = S.passport;
    const covers = p.expiry ? p.expiry > D.trip.end : false;
    return { ...p, covers };
  };
  const garnier = () => ({ ...S.garnier });
  const assigned = (key) => (S.requests[key] ? S.requests[key].advisor : null);
  const messages = () => S.msgs;

  function balances() {
    const t = trip();
    const pendingRyokan = S.kyoto.choice === 'ryokan' && !S.kyoto.confirmed;
    const solde = S.payments.find((p) => p.kind === 'solde');
    return D.balances.map((b) => {
      if (b.key !== 'delorme') return { ...b, state: b.receivedOn ? 'received' : 'due' };
      const balance = t.total - t.deposit;
      const row = { ...b, total: t.total, deposit: t.deposit, balance };
      if (t.balanceState === 'paid') return { ...row, state: 'received', receivedOn: dayKey(solde ? solde.at || nowISO() : nowISO()) };
      if (t.balanceState === 'transfer') return { ...row, state: 'transfer', receivedOn: null };
      if (pendingRyokan) return { ...row, state: 'pending', pendingBalance: balance + t.kyoto.pendingDelta, receivedOn: null };
      return { ...row, state: 'due', receivedOn: null };
    });
  }

  function counts() {
    const t = trip();
    const p = S.passport;
    const unreadClient = S.msgs.filter((m) => m.from === 'louis' && !m.readClient).length;
    const unreadEquipe = S.msgs.filter((m) => m.from !== 'louis' && !m.readEquipe).length;
    const kyotoAction = S.kyoto.choice && !S.kyoto.confirmed ? 1 : 0;
    const passportAction = p.status === 'received' ? 1 : 0;
    const louisAssigned = Object.values(S.requests).filter((r) => r.advisor === 'louis').length;
    const assignedN = Object.keys(S.requests).length;
    const rows = balances();
    const due = rows.reduce((a, r) => a + r.balance, 0);
    const received = rows.filter((r) => r.state === 'received').reduce((a, r) => a + r.balance, 0);
    const checklist = [true, true, !!S.kyoto.choice, p.status === 'verified', t.balanceState === 'paid'];
    const ryokanOn = !!S.kyoto.confirmed && S.kyoto.choice === 'ryokan';
    const extra = ryokanOn ? K.nights * (K.ryokan.nightly - K.machiya.nightly) : 0;
    const octAmount = D.october.amount + extra;
    return {
      client: {
        docs: p.status === 'missing' ? 1 : 0,
        messages: unreadClient,
        confirmed: t.confirmedCount,
        lines: t.lineCount,
        checklist,
        checklistDone: checklist.filter(Boolean).length,
        checklistTotal: checklist.length,
      },
      equipe: {
        dossiers: kyotoAction + passportAction + unreadEquipe,
        kyotoAction,
        passportAction,
        unread: unreadEquipe,
        enVoyage: S.garnier.status === 'open' ? 1 : 0,
        toProcess: D.louis.toProcess.length + louisAssigned,
        proposals: D.louis.proposals.length,
        confirmed: D.louis.confirmed2026.length + D.louis.confirmed2027.length,
        confirmed2026: D.louis.confirmed2026.length,
        confirmed2027: D.louis.confirmed2027.length,
        travelling: D.travelling.filter((x) => x.advisor === 'louis').length,
      },
      admin: {
        veille: S.garnier.status === 'open' ? 1 : 0,
        alerts: S.garnier.status === 'open' ? 1 : 0,
        unassigned: D.pipeline.unassigned.length - assignedN,
        toProcess: D.pipeline.advisors.reduce((a, x) => a + x.toProcess, 0) + D.pipeline.unassigned.length,
        departures: D.departuresWeek.length,
        departuresPax: D.departuresWeek.reduce((a, x) => a + x.pax, 0),
        travelling: D.travelling.length,
        travellers: D.travelling.reduce((a, x) => a + x.pax, 0),
        balancesDue: due,
        balancesReceived: received,
        balancesRemaining: due - received,
        docsMissing: D.pipeline.docsMissing.length - (p.status === 'missing' ? 0 : 1),
        toChase: D.pipeline.toChase.length,
        october: { sold: D.october.sold, amount: octAmount, target: D.october.target, pct: (octAmount / D.october.target) * 100, extra },
      },
    };
  }

  /* ——— the cross-role loop ——— */
  const P = D.people;
  const notify = (role, t, go = null) => S.notes[role].unshift({ t, at: nowISO(), read: false, go });
  const H = {
    'kyoto.choose'({ choice, note }) {
      const k = S.kyoto;
      if (k.confirmed) return;
      k.choice = choice;
      k.chosenAt = nowISO();
      k.request = null;
      if (note && note.trim()) S.msgs.push({ from: 'camille', at: nowISO(), text: note.trim(), readClient: true, readEquipe: false });
      if (choice === 'ryokan') {
        notify('equipe', 'Camille Delorme a choisi le ryokan d’Okazaki pour Kyoto. À confirmer auprès de l’hôtel avant mer. 18 h.', '#/equipe/dossier/AM-26-0388');
        notify('admin', `Delorme : modification en attente, +${fmtEur(K.nights * (K.ryokan.nightly - K.machiya.nightly))} (Kyoto).`, '#/admin/pilotage');
      } else {
        notify('equipe', 'Camille Delorme garde la machiya d’Higashiyama. À confirmer définitivement avant mer. 18 h.', '#/equipe/dossier/AM-26-0388');
      }
      toast('Votre choix est parti chez Louis.');
    },
    'kyoto.reopen'() {
      const k = S.kyoto;
      if (k.confirmed) return;
      k.choice = null;
      k.chosenAt = null;
      k.request = null;
      notify('equipe', 'Camille Delorme a rouvert son choix pour Kyoto.', '#/equipe/dossier/AM-26-0388');
      toast('Vous pouvez de nouveau choisir.');
    },
    'kyoto.request'() {
      if (!S.kyoto.choice || S.kyoto.confirmed) return;
      S.kyoto.request = { at: nowISO() };
      toast('Demande envoyée à l’hôtel.');
    },
    'kyoto.confirm'({ ref } = {}) {
      const k = S.kyoto;
      if (!k.choice || k.confirmed) return;
      const opt = K[k.choice];
      k.confirmed = { ref: (ref || opt.ref).trim() || opt.ref, at: nowISO() };
      notify('client', `Kyoto est confirmé : ${opt.name.charAt(0).toLowerCase() + opt.name.slice(1)}, du 15 au 19 novembre. Référence ${k.confirmed.ref}.`, '#/client/reservations');
      if (k.choice === 'ryokan') notify('admin', `Delorme : Kyoto confirmé, le voyage passe à ${fmtEur(trip().total)}.`, '#/admin/pilotage');
      else notify('admin', 'Delorme : Kyoto confirmé, machiya d’Higashiyama, sans changement de prix.', '#/admin/pilotage');
      toast('Kyoto confirmé · Camille est prévenue.');
    },
    'passport.upload'({ expiry, fileName, thumb }) {
      Object.assign(S.passport, { status: 'received', expiry, fileName: fileName || null, thumb: thumb || null, receivedAt: nowISO(), verifiedAt: null });
      notify('equipe', 'Passeport d’Antoine Delorme reçu, à vérifier.', '#/equipe/dossier/AM-26-0388');
      toast('Passeport envoyé à Louis.');
    },
    'passport.verify'() {
      if (S.passport.status !== 'received') return;
      S.passport.status = 'verified';
      S.passport.verifiedAt = nowISO();
      notify('client', 'Le passeport d’Antoine a été vérifié par Louis.', '#/client/documents');
      toast('Passeport vérifié · Camille est prévenue.');
    },
    'pay.card'() {
      const t = trip();
      if (t.balance <= 0) return;
      const docs = D.trip.balanceDocs;
      S.payments.push({ id: `P${S.payments.length + 1}`, kind: 'solde', amount: t.balance, date: dayKey(now()), at: nowISO(), method: 'carte', receipt: docs.receipt, invoice: docs.invoice });
      S.transfer = null;
      notify('equipe', `Solde Delorme reçu : ${fmtEur(t.balance)} (carte).`, '#/equipe/dossier/AM-26-0388');
      notify('admin', `Solde reçu : Delorme, ${fmtEur(t.balance)}.`, '#/admin/pilotage');
      toast(`Paiement simulé : ${fmtEur(t.balance)}. Votre reçu est prêt.`);
    },
    'pay.transfer'() {
      const t = trip();
      if (t.balance <= 0 || S.transfer) return;
      S.transfer = { amount: t.balance, at: nowISO() };
      notify('admin', `Virement annoncé par Camille Delorme : ${fmtEur(t.balance)}, à rapprocher.`, '#/admin/pilotage');
      toast('Merci, nous rapprochons votre virement.');
    },
    'pay.received'() {
      if (!S.transfer) return;
      const docs = D.trip.balanceDocs;
      const amount = S.transfer.amount;
      S.payments.push({ id: `P${S.payments.length + 1}`, kind: 'solde', amount, date: dayKey(now()), at: nowISO(), method: 'virement', receipt: docs.receipt, invoice: docs.invoice });
      S.transfer = null;
      notify('client', `Votre virement de ${fmtEur(amount)} est bien arrivé. Reçu ${docs.receipt}.`, '#/client/paiements');
      notify('equipe', 'Solde Delorme reçu.', '#/equipe/dossier/AM-26-0388');
      toast(`Virement rapproché · reçu ${docs.receipt} envoyé.`);
    },
    'garnier.send'() {
      if (S.garnier.status !== 'open') return;
      S.garnier = { status: 'handled', handledAt: nowISO() };
      S.log.unshift({ at: nowISO(), text: `Louis a envoyé aux Garnier un trajet de remplacement : bus jusqu’à Nagoya, puis Shinkansen, arrivée à Kyoto ${D.garnier.newArrival}.` });
      notify('admin', 'Garnier : trajet de remplacement envoyé par Louis.', '#/admin/veille');
      toast('Envoyé aux Garnier · Mme Sato leur remet les billets ce soir.');
    },
    assign({ key, advisor }) {
      const r = D.pipeline.unassigned.find((x) => x.key === key);
      if (!r || S.requests[key]) return;
      S.requests[key] = { advisor, at: nowISO() };
      if (advisor === 'louis') notify('equipe', `Mathilde vous a attribué la demande ${r.key === 'aubert' ? 'de la famille Aubert' : `de ${r.client}`} (${r.dest}, ${r.when}, ${r.pax} personnes).`, '#/equipe/dossiers');
      toast(`Demande attribuée à ${P[advisor].short || P[advisor].name.split(' ')[0]}.`);
    },
    'msg.client'({ text }) {
      if (!text || !text.trim()) return;
      S.msgs.push({ from: 'camille', at: nowISO(), text: text.trim(), readClient: true, readEquipe: false });
      notify('equipe', 'Nouveau message de Camille Delorme.', '#/equipe/dossier/AM-26-0388');
      toast('Message envoyé à Louis.');
    },
    'msg.team'({ text }) {
      if (!text || !text.trim()) return;
      S.msgs.push({ from: 'louis', at: nowISO(), text: text.trim(), readClient: false, readEquipe: true });
      notify('client', 'Louis vous a répondu.', '#/client/messages');
      toast('Message envoyé à Camille.');
    },
    login() {
      S.loggedOut = false;
    },
    logout() {
      S.loggedOut = true;
    },
  };
  function emit(type, payload = {}) {
    const h = H[type];
    if (!h) return console.warn('Unknown event', type);
    h(payload);
    save();
    render();
  }
  const readThread = (role) => {
    let changed = false;
    S.msgs.forEach((m) => {
      if (role === 'client' && !m.readClient) (m.readClient = true), (changed = true);
      if (role === 'equipe' && !m.readEquipe) (m.readEquipe = true), (changed = true);
    });
    if (changed) save();
  };

  /* ——— icons ——— */
  const IC = {
    home: 'M3 10.5 12 3l9 7.5M5 9.5V21h14V9.5M10 21v-6h4v6',
    route: 'M6 20a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM18 8a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM8 18h8.5a3 3 0 0 0 0-6h-9a3 3 0 0 1 0-6H16',
    map: 'M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2zM9 4v14M15 6v14',
    bed: 'M3 19V5M21 19v-6a3 3 0 0 0-3-3h-7v6M3 16h18M7 13a2 2 0 1 0 0-4 2 2 0 0 0 0 4',
    passport: 'M6 3h11a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H6zM12 14a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM9.5 17.5h5',
    doc: 'M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8zM14 3v5h5M9 13h6M9 17h6',
    card: 'M3 6h18v12H3zM3 10h18M7 15h3',
    chat: 'M21 11.5a8.4 8.4 0 0 1-9 8.4 8.8 8.8 0 0 1-3.5-.7L3 21l1.9-5A8.4 8.4 0 1 1 21 11.5z',
    plane: 'M21 15.5v-1.8l-7.5-4.7V4a1.5 1.5 0 0 0-3 0v5L3 13.7v1.8l7.5-2.3V18l-2 1.5V21l3.5-1 3.5 1v-1.5l-2-1.5v-4.8z',
    train: 'M7 3h10a3 3 0 0 1 3 3v8a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3V6a3 3 0 0 1 3-3zM4 11h16M8 17l-2 4M16 17l2 4M8 14h.01M16 14h.01',
    bus: 'M5 4h14a1 1 0 0 1 1 1v12H4V5a1 1 0 0 1 1-1zM4 12h16M7 17v2.5M17 17v2.5M7.5 14.5h.01M16.5 14.5h.01',
    ferry: 'M3 18c1.5 1.3 3 1.3 4.5 0s3-1.3 4.5 0 3 1.3 4.5 0 3-1.3 4.5 0M5 15l-1-4h16l-1 4M8 11V7h8v4M12 7V4',
    car: 'M5 16v-5l2-5h10l2 5v5M3 16h18v3H3zM7 19v1.5M17 19v1.5M5 11h14M7.5 13.5h.01M16.5 13.5h.01',
    guide: 'M9 7a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zM4.5 21v-6a4.5 4.5 0 0 1 9 0v6M17 21V4l4 2-4 2',
    bag: 'M5 8h14l-1 13H6zM9 8V6a3 3 0 0 1 6 0v2',
    sim: 'M7 3h7l5 5v13H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zM9 12h6v6H9zM12 12v6',
    book: 'M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2zM4 21a2 2 0 0 1 2-2h13v2H6',
    shield: 'M12 3 5 6v6c0 4.2 2.9 7.8 7 9 4.1-1.2 7-4.8 7-9V6zM9 12l2 2 4-4',
    sun: 'M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4',
    moon: 'M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z',
    stamp: 'M9 3h6l-1 7h-4zM5 14h14v3H5zM4 21h16M12 10v4',
    clock: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 7v5l3.5 2',
    check: 'M5 12.5l4.5 4.5L19 7.5',
    x: 'M6 6l12 12M18 6 6 18',
    arrowR: 'M5 12h14m0 0-6-6m6 6-6 6',
    arrowL: 'M19 12H5m0 0 6-6m-6 6 6 6',
    down: 'M12 4v11m0 0 4-4m-4 4-4-4M4 19h16',
    up: 'M12 20V9m0 0 4 4m-4-4-4 4M4 5h16',
    plus: 'M12 5v14M5 12h14',
    search: 'M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14zM20 20l-4-4',
    bell: 'M6 16v-5a6 6 0 1 1 12 0v5l1.5 2h-15zM10 20.5a2 2 0 0 0 4 0',
    users: 'M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM2.5 20a6.5 6.5 0 0 1 13 0M16.5 3.6a4 4 0 0 1 0 7.2M18 20a6.4 6.4 0 0 0-2-4.6',
    gauge: 'M12 14l4-4M3.5 17a9 9 0 1 1 17 0',
    layers: 'M12 3 2 8l10 5 10-5zM2 13l10 5 10-5',
    chart: 'M4 20V10M10 20V4M16 20v-7M22 20H2',
    globe: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM3 12h18M12 3c2.5 2.5 3.8 5.5 3.8 9s-1.3 6.5-3.8 9c-2.5-2.5-3.8-5.5-3.8-9S9.5 5.5 12 3z',
    folder: 'M3 7a2 2 0 0 1 2-2h4l2 2.5h8a2 2 0 0 1 2 2V18a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z',
    receipt: 'M6 3h12v18l-3-2-3 2-3-2-3 2zM9 8h6M9 12h6',
    phone: 'M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2',
    mail: 'M3 6h18v12H3zM3 7l9 6 9-6',
    send: 'M21 3 10.5 13.5M21 3l-7 18-3.5-7.5L3 10.5z',
    lock: 'M7 11V8a5 5 0 0 1 10 0v3M5 11h14v10H5z',
    cal: 'M4 6h16v15H4zM4 10h16M9 3v4M15 3v4',
    list: 'M8 6h13M8 12h13M8 18h13M3.5 6h.01M3.5 12h.01M3.5 18h.01',
    eye: 'M2 12s3.8-6 10-6 10 6 10 6-3.8 6-10 6S2 12 2 12zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
    alert: 'M12 3 2 20h20zM12 10v4M12 17h.01',
    pin: 'M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21zM12 12a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z',
    filter: 'M3 5h18l-7 8v6l-4 2v-8z',
    upload: 'M12 16V4m0 0-4 4m4-4 4 4M4 20h16',
    print: 'M7 9V3h10v6M7 17H4v-7a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v7h-3M7 14h10v7H7z',
    logout: 'M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3M10 16l-4-4 4-4M6 12h11',
    info: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 11v6M12 7.5h.01',
    star: 'M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9 6.8 19.6l1-5.8L3.5 9.7l5.9-.9z',
    reset: 'M4 12a8 8 0 1 0 2.4-5.7M4 4v4h4',
    msg: 'M4 5h16v11H8l-4 4z',
    trash: 'M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3',
  };
  const ic = (n, s = 18, sw = 1.7) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${IC[n] || IC.info}"/></svg>`;

  /* ——— small components ——— */
  const badge = (text, kind = '') => `<span class="badge ${kind ? `b-${kind}` : ''}"><i></i>${esc(text)}</span>`;
  const initials = (n) => n.replace(/^(M\.|Mme|Famille|Groupe)\s+/i, '').split(/[\s-]+/).filter(Boolean).map((w) => w[0]).join('').slice(0, 2).toUpperCase();
  const av = (p, cls = '') => {
    const o = typeof p === 'string' ? P[p] : p;
    if (!o) return '';
    return `<span class="av ${cls}" style="background:${esc(o.color || '#6e6b65')}" title="${esc(o.name)}">${esc(initials(o.name))}</span>`;
  };
  const closeBtn = (kind = 'modal') => `<button class="iconbtn" data-act="${kind === 'drawer' ? 'dclose' : 'mclose'}" aria-label="Fermer">${ic('x', 16)}</button>`;

  /* ——— logo: the mean-time meridian and the analemma, with today's noon sun ——— */
  const ANALEMMA_D = 'M14.5 25.6C14 25.6 13.6 25.5 13.2 25.3C12.8 25.2 12.4 25 12 24.8C11.7 24.7 11.4 24.5 11.1 24.2C10.9 24 10.7 23.8 10.5 23.5C10.3 23.2 10.2 22.9 10.1 22.6C10 22.4 10 22 10 21.7C10 21.4 10.1 21 10.2 20.7C10.3 20.3 10.4 20 10.6 19.6C10.8 19.2 11 18.9 11.2 18.5C11.4 18.1 11.7 17.7 11.9 17.3C12.2 17 12.5 16.6 12.8 16.2C13 15.8 13.3 15.4 13.6 15C13.9 14.6 14.2 14.3 14.5 13.9C14.8 13.5 15.1 13.1 15.3 12.8C15.6 12.4 15.9 12 16.1 11.7C16.3 11.4 16.5 11 16.7 10.7C16.9 10.4 17 10.1 17.2 9.8C17.3 9.5 17.4 9.2 17.4 8.9C17.5 8.6 17.5 8.4 17.5 8.1C17.5 7.9 17.5 7.7 17.4 7.5C17.4 7.3 17.3 7.1 17.1 7C17 6.8 16.9 6.7 16.7 6.6C16.5 6.5 16.3 6.4 16.1 6.3C15.9 6.2 15.7 6.2 15.5 6.2C15.3 6.1 15.1 6.2 14.9 6.2C14.7 6.2 14.5 6.3 14.3 6.3C14.1 6.4 13.9 6.5 13.8 6.6C13.6 6.7 13.5 6.9 13.4 7C13.3 7.2 13.3 7.4 13.3 7.6C13.2 7.8 13.2 8 13.3 8.3C13.3 8.5 13.4 8.8 13.5 9C13.6 9.3 13.8 9.6 13.9 9.9C14.1 10.2 14.3 10.5 14.6 10.8C14.8 11.1 15.1 11.5 15.4 11.8C15.6 12.2 15.9 12.5 16.3 12.9C16.6 13.2 16.9 13.6 17.3 14C17.6 14.3 18 14.7 18.3 15.1C18.6 15.5 19 15.9 19.3 16.2C19.7 16.6 20 17 20.3 17.4C20.7 17.8 21 18.1 21.2 18.5C21.5 18.9 21.8 19.3 22 19.6C22.2 20 22.4 20.3 22.5 20.7C22.7 21 22.8 21.4 22.9 21.7C22.9 22 22.9 22.3 22.9 22.6C22.9 22.9 22.8 23.2 22.7 23.5C22.6 23.7 22.4 24 22.2 24.2C21.9 24.4 21.7 24.6 21.3 24.8C21 25 20.7 25.2 20.3 25.3C19.9 25.4 19.5 25.5 19 25.6C18.6 25.7 18.1 25.8 17.6 25.8C17.2 25.8 16.7 25.9 16.2 25.8C15.7 25.8 15 25.7 14.5 25.6Z';
  const dot = () => {
    try {
      if (SUN && SUN.analemmaDot) {
        const p = SUN.analemmaDot(now().getTime());
        if (isFinite(p.cx) && isFinite(p.cy)) return p;
      }
    } catch (e) {}
    return { cx: 20.86, cy: 18.03 };
  };
  const logo = {
    mark(size = 30, { light = false } = {}) {
      const p = dot();
      const line = light ? '#1f4d3f' : '#f6f5f2';
      return `<svg class="mark" viewBox="0 0 32 32" width="${size}" height="${size}" role="img" aria-label="Atelier Méridien"><title>La méridienne de temps moyen : la place du soleil à midi, chaque jour de l’année.</title>${light ? '' : '<rect width="32" height="32" rx="8.5" fill="#1f4d3f"/>'}<path d="M16 2.6V29.4" stroke="${line}" stroke-width="1.4" stroke-linecap="round"/><path d="${ANALEMMA_D}" fill="none" stroke="${line}" stroke-width="1.4" stroke-linejoin="round"/><circle cx="${p.cx.toFixed(2)}" cy="${p.cy.toFixed(2)}" r="2" fill="${light ? '#a8792f' : '#c9a063'}"/></svg>`;
    },
    lockup({ light = true, sub = '' } = {}) {
      return `<div class="lockup ${light ? 'is-light' : ''}">${logo.mark(light ? 34 : 30, { light })}<div><div class="lockup__k">Atelier</div><div class="lockup__n">Méridien</div>${sub ? `<div class="lockup__s">${esc(sub)}</div>` : ''}</div></div>`;
    },
  };

  /* ——— confirmation stamp ——— */
  const stamp = ({ at, ref, size = 34, land = false } = {}) => {
    const id = uid('arc');
    const when = at ? fmtD(at, 'stamp') : '';
    return `<svg class="stamp ${land && !reduced ? 'is-landing' : ''}" viewBox="0 0 80 80" width="${size}" height="${size}" role="img" aria-label="Confirmé le ${esc(at ? fmtD(at, 'longY') : '')}, référence ${esc(ref || '')}"><g transform="rotate(-8 40 40)"><circle cx="40" cy="40" r="36" fill="none" stroke="currentColor" stroke-width="1.6"/><circle cx="40" cy="40" r="28.5" fill="none" stroke="currentColor" stroke-width="0.8"/><path id="${id}" d="M9.8 40a30.2 30.2 0 1 1 60.4 0a30.2 30.2 0 1 1 -60.4 0" fill="none"/><text font-family="Hanken Grotesk, sans-serif" font-weight="700" font-size="5.4" fill="currentColor"><textPath href="#${id}" textLength="189" lengthAdjust="spacing">ATELIER MÉRIDIEN · CONFIRMÉ · ATELIER MÉRIDIEN · CONFIRMÉ ·</textPath></text><text x="40" y="38" text-anchor="middle" font-family="Hanken Grotesk, sans-serif" font-weight="700" font-size="7" fill="currentColor">${esc(when)}</text><path d="M25 41.5H55" stroke="currentColor" stroke-width="0.6"/><text x="40" y="48.5" text-anchor="middle" font-family="Hanken Grotesk, sans-serif" font-weight="600" font-size="6" letter-spacing="0.6" fill="currentColor">${esc(ref || '')}</text></g></svg>`;
  };

  /* ——— rolling figures ——— */
  const FMT = { eur: fmtEur, num: (n) => fmtNum(n), pct: (n) => fmtPct(n) };
  const roll = (key, value, fmt = 'eur') => {
    const seen = S.seen[`roll:${key}`];
    const shown = seen === undefined ? value : seen;
    return `<span class="roll" data-roll="${esc(key)}" data-v="${value}" data-fmt="${fmt}">${(FMT[fmt] || FMT.num)(shown)}</span>`;
  };
  function processRolls(root) {
    const done = {};
    root.querySelectorAll('[data-roll]').forEach((el) => {
      const key = el.dataset.roll;
      const to = +el.dataset.v;
      const f = FMT[el.dataset.fmt] || FMT.num;
      const sk = `roll:${key}`;
      const from = S.seen[sk];
      if (from === undefined || from === to || reduced) {
        el.textContent = f(to);
        done[sk] = to;
        return;
      }
      done[sk] = to;
      el.setAttribute('aria-live', 'polite');
      el.classList.add('is-rolling');
      const t0 = performance.now();
      const step = (t) => {
        const k = Math.min(1, (t - t0) / 600);
        const e = 1 - Math.pow(1 - k, 3);
        el.textContent = f(Math.round(from + (to - from) * e));
        if (k < 1) requestAnimationFrame(step);
        else el.classList.remove('is-rolling');
      };
      requestAnimationFrame(step);
    });
    let changed = false;
    Object.entries(done).forEach(([k, v]) => {
      if (S.seen[k] !== v) (S.seen[k] = v), (changed = true);
    });
    if (changed) save();
  }

  /* ——— toasts, tooltip ——— */
  function toast(msg) {
    const el = document.createElement('div');
    el.className = 'toast';
    el.innerHTML = `${ic('check', 16, 2.2)}<span>${esc(msg)}</span>`;
    toastsEl.append(el);
    setTimeout(() => {
      el.style.transition = 'opacity .3s';
      el.style.opacity = '0';
      setTimeout(() => el.remove(), 320);
    }, 2800);
  }
  const tipEl = document.createElement('div');
  tipEl.className = 'tip';
  tipEl.setAttribute('role', 'tooltip');
  document.body.append(tipEl);
  const tip = {
    show(html, x, y) {
      tipEl.innerHTML = html;
      tipEl.classList.add('is-on');
      const r = tipEl.getBoundingClientRect();
      const pad = 12;
      let left = x + 14;
      let top = y + 14;
      if (left + r.width > innerWidth - pad) left = Math.max(pad, x - r.width - 14);
      if (top + r.height > innerHeight - pad) top = Math.max(pad, y - r.height - 14);
      tipEl.style.transform = `translate(${Math.round(left)}px, ${Math.round(top)}px)`;
    },
    hide() {
      tipEl.classList.remove('is-on');
    },
  };

  /* ——— downloads and printable documents ——— */
  function download(name, text, mime = 'text/plain', { bom = false } = {}) {
    const blob = new Blob([bom ? '﻿' : '', text], { type: `${mime};charset=utf-8` });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    document.body.append(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
  }

  /* ——— transient UI (not persisted) ——— */
  const UI = { panel: false, modal: null, drawer: null, print: null, seen: { modal: false, drawer: false, panel: false } };
  const modal = {
    open(fn, opts = {}) {
      UI.modal = { fn, opts };
      UI.seen.modal = false;
      render();
    },
    close() {
      UI.modal = null;
      render();
    },
    isOpen: () => !!UI.modal,
  };
  const drawer = {
    open(fn, opts = {}) {
      UI.drawer = { fn, opts };
      UI.seen.drawer = false;
      render();
    },
    close() {
      UI.drawer = null;
      render();
    },
    isOpen: () => !!UI.drawer,
  };
  const print = (fn) => {
    UI.print = { fn };
    render();
    window.scrollTo(0, 0);
  };

  /* ——— pages and routes ——— */
  const PAGES = [];
  const ACTS = {};
  const CHANGES = {};
  const INPUTS = {};
  const TICKS = [];
  const page = (p) => PAGES.push(p);
  const act = (n, fn) => (ACTS[n] = fn);
  const change = (n, fn) => (CHANGES[n] = fn);
  const input = (n, fn) => (INPUTS[n] = fn);
  const onTick = (fn) => TICKS.push(fn);
  const ROLES = {
    client: { label: 'Client', home: 'voyage', sub: 'Espace voyageur', who: 'camille', whoRole: `Voyageuse · ${D.trip.id}` },
    equipe: { label: 'Équipe', home: 'dossiers', sub: 'Espace conseiller', who: 'louis', whoRole: 'Concepteur de voyages · Japon' },
    admin: { label: 'Admin', home: 'pilotage', sub: 'Direction', who: 'mathilde', whoRole: 'Fondatrice · direction' },
  };
  const route = () => {
    const parts = (location.hash || '').replace(/^#\/?/, '').split('/').filter(Boolean);
    const role = ROLES[parts[0]] ? parts[0] : 'client';
    return { role, id: parts[1] || ROLES[role].home, param: parts[2] ? decodeURIComponent(parts[2]) : undefined };
  };
  const go = (h) => {
    if (location.hash === h) render();
    else location.hash = h;
  };
  const findPage = (role, id) => PAGES.find((p) => p.role === role && p.id === id);

  /* ——— the frame ——— */
  function demobar(r) {
    return `<div class="demobar">
      <div class="demobar__label"><i class="demobar__dot"></i><b class="demobar__name"><em>Projet vitrine</em><u>Vitrine</u></b><span class="demobar__more">· conçu par Kalion Studio · données fictives</span></div>
      <div class="seg" role="tablist" aria-label="Changer d’espace">${Object.entries(ROLES).map(([k, v]) => `<button class="${r.role === k ? 'is-on' : ''}" role="tab" aria-selected="${r.role === k}" data-go="#/${k}/${v.home}">${v.label}</button>`).join('')}</div>
      <div class="demobar__right"><span class="demobar__clock" data-live="clock" title="Horloge de la démo">${esc(fmtD(now(), 'dow'))} · ${fmtT(now())}</span><button class="demobar__btn" data-act="reset" aria-label="Réinitialiser la démo">${ic('reset', 14)}<span>Réinitialiser</span></button></div>
    </div>`;
  }
  function sideFoot(role) {
    if (role === 'client') {
      return `<div class="side__foot"><div class="row">${av('louis')}<div><b>${esc(P.louis.name)}</b><div class="mini">Spécialiste du Japon depuis 2016</div></div></div><p>Lun.–ven. 9${NB}h–19${NB}h. En voyage : assistance 24${NB}h/24 au ${esc(D.company.phone)}.</p><button class="btn btn--ghost btn--sm btn--block" data-go="#/client/messages">${ic('chat', 15)}Écrire à Louis</button></div>`;
    }
    if (role === 'equipe') {
      return `<div class="side__foot"><b>Cette semaine</b><p>2 départs (Marchand mer., Caron sam.), 1 couple en voyage.</p></div>`;
    }
    const o = counts().admin.october;
    return `<div class="side__foot"><b>Octobre</b><p>${o.sold} dossiers vendus · ${roll('admin.october', o.amount)} · objectif ${fmtEur(o.target)} (${fmtNum(Math.floor(o.pct))}${NB}%)${o.extra ? `<br><span class="mini">dont +${fmtEur(o.extra)} d’avenant Delorme</span>` : ''}</p><div class="bar"><i style="width:${Math.min(100, o.pct).toFixed(1)}%"></i></div></div>`;
  }
  function nav(r, pg) {
    const active = pg.nav ? pg.id : pg.parent;
    return PAGES.filter((p) => p.role === r.role && p.nav)
      .sort((a, b) => (a.nav.order || 0) - (b.nav.order || 0))
      .map((p) => {
        let b = 0;
        try { b = p.nav.badge ? p.nav.badge() : 0; } catch (e) { b = 0; }
        const quiet = p.nav.quiet || typeof b === 'string';
        return `<button class="nav__item ${p.id === active ? 'is-on' : ''}" data-go="#/${r.role}/${p.id}">${ic(p.nav.icon || 'info')}<span>${esc(p.nav.label)}</span>${b ? `<span class="nav__count ${quiet ? 'is-quiet' : ''}">${esc(b)}</span>` : ''}</button>`;
      })
      .join('');
  }
  function panel(r) {
    const n = S.notes[r.role];
    return `<div class="panel ${UI.seen.panel ? 'is-static' : ''}" role="dialog" aria-label="Notifications" data-stop><div class="panel__head"><b class="spacer">Notifications</b><button class="btn btn--plain btn--sm" data-act="readall">Tout marquer comme lu</button></div><div class="panel__list">${
      n.length ? n.slice(0, 8).map((x, i) => `<button class="notif ${x.read ? 'is-read' : ''}" data-act="notif" data-i="${i}"><i class="notif__dot"></i><div><div class="notif__t">${esc(x.t)}</div><div class="notif__s">${esc(ago(x.at))}</div></div></button>`).join('') : '<div class="empty">Aucune notification.</div>'
    }</div></div>`;
  }
  function overlays() {
    let h = '';
    if (UI.modal) {
      const size = UI.modal.opts.size || 'md';
      h += `<div class="modal-back ${UI.seen.modal ? 'is-static' : ''}" data-act="mclose"><div class="modal modal--${size}" role="dialog" aria-modal="true" data-stop>${safe(UI.modal.fn)}</div></div>`;
    }
    if (UI.drawer) {
      h += `<div class="drawer-back ${UI.seen.drawer ? 'is-static' : ''}" data-act="dclose"><aside class="drawer" role="dialog" aria-modal="true" data-stop>${safe(UI.drawer.fn)}</aside></div>`;
    }
    if (UI.print) {
      h += `<div class="printdoc"><div class="printdoc__bar"><b class="spacer">Aperçu avant impression</b><button class="btn btn--primary btn--sm" data-act="doprint">${ic('print', 15)}Imprimer ou enregistrer en PDF</button><button class="btn btn--ghost btn--sm" data-act="pclose">Fermer</button></div><div class="printdoc__page">${safe(UI.print.fn)}</div></div>`;
    }
    return h;
  }
  const safe = (fn, arg) => {
    try {
      return fn(arg) || '';
    } catch (e) {
      console.error(e);
      return `<div class="card empty">${ic('alert', 24)}<b>Cette vue n’a pas pu s’afficher.</b><span class="mini">${esc(e.message)}</span></div>`;
    }
  };
  const legal = () => `<footer class="legal"><p class="serif">${esc(D.company.line)}</p><p>${esc(D.company.legal)}</p></footer>`;

  function frame(r, pg, body) {
    const role = ROLES[r.role];
    const who = P[role.who];
    const n = S.notes[r.role];
    const unread = n.filter((x) => !x.read).length;
    const crumbs = pg.nav || !pg.parent ? `<b>${esc(pg.title)}</b>` : `<button class="crumbs__link" data-go="#/${r.role}/${pg.parent}">${esc((findPage(r.role, pg.parent) || {}).title || '')}</button>${ic('arrowR', 13)}<b>${esc(pg.crumb ? safe(pg.crumb, r.param) : pg.title)}</b>`;
    return `${demobar(r)}
    <div class="shell">
      <aside class="side">
        <div class="brand">${logo.mark(30)}<div><div class="brand__k">Atelier</div><div class="brand__name">Méridien</div><div class="brand__sub">${esc(role.sub)}</div></div></div>
        <div class="who">${av(role.who)}<div><div class="who__name">${esc(who.name)}</div><div class="who__role">${esc(role.whoRole)}</div></div></div>
        <nav class="nav">${nav(r, pg)}</nav>
        ${sideFoot(r.role)}
      </aside>
      <div class="main">
        <header class="top">
          <span class="top__brand">${logo.mark(24)}<span class="serif">Méridien</span></span>
          <div class="crumbs">${crumbs}</div>
          <div class="top__right">
            <button class="search" data-act="search">${ic('search', 16)}<span>Rechercher</span><kbd>Ctrl K</kbd></button>
            <button class="iconbtn" data-act="panel" aria-label="Notifications${unread ? ` (${unread} non lues)` : ''}">${ic('bell')}${unread ? '<i class="iconbtn__dot"></i>' : ''}</button>
            ${r.role === 'client' ? `<details class="menu menu--right"><summary class="avbtn" aria-label="Mon compte">${av(role.who)}</summary><div class="menu__list"><div class="menu__head"><b>${esc(who.name)}</b><span class="mini">${esc(D.trip.id)}</span></div><button class="menu__item" data-act="logout">${ic('logout', 15)}Se déconnecter</button></div></details>` : av(role.who)}
          </div>
        </header>
        <main class="content" id="content">${body}${r.role === 'client' ? legal() : ''}</main>
      </div>
    </div>
    ${UI.panel ? panel(r) : ''}`;
  }

  /* ——— render ——— */
  let current = null;
  function render() {
    let r = route();
    if (r.role === 'client' && S.loggedOut && r.id !== 'connexion') {
      location.replace('#/client/connexion');
      r = route();
    }
    let pg = findPage(r.role, r.id);
    if (!pg) {
      pg = findPage(r.role, ROLES[r.role].home) || PAGES.find((p) => p.role === r.role);
      if (!pg) {
        app.innerHTML = `${demobar(r)}<div class="bare"><div class="card empty">Chargement…</div></div>`;
        return;
      }
    }
    const routeKey = `${r.role}/${pg.id}/${r.param || ''}`;
    if (current && current !== routeKey) window.scrollTo(0, 0);
    current = routeKey;
    const body = safe(pg.render, r.param);
    app.innerHTML = (pg.bare ? `${demobar(r)}<main class="bare">${body}</main>` : frame(r, pg, body)) + overlays();
    document.title = `Atelier Méridien · ${ROLES[r.role].sub}`;
    const root = app;
    try { pg.after && pg.after(root, r.param); } catch (e) { console.error(e); }
    try { UI.modal && UI.modal.opts.after && UI.modal.opts.after(root); } catch (e) { console.error(e); }
    try { UI.drawer && UI.drawer.opts.after && UI.drawer.opts.after(root); } catch (e) { console.error(e); }
    processRolls(root);
    updateLive();
    UI.seen.modal = !!UI.modal;
    UI.seen.drawer = !!UI.drawer;
    UI.seen.panel = UI.panel;
    if (UI.modal && !UI.modal.focused) {
      UI.modal.focused = true;
      const f = root.querySelector('.modal [autofocus], .modal .modal__foot .btn--primary');
      if (f) f.focus({ preventScroll: true });
    }
  }

  /* ——— live values, one ticker per minute of demo time ——— */
  function updateLive() {
    const t = now();
    app.querySelectorAll('[data-live]').forEach((el) => {
      const k = el.dataset.live;
      if (k === 'clock') el.textContent = `${fmtD(t, 'dow')} · ${fmtT(t)}`;
      else if (k === 'time') el.textContent = fmtT(t, el.dataset.tz || 'Europe/Paris');
      else if (k === 'countdown') el.textContent = countdown(el.dataset.to);
      else if (k === 'days') el.textContent = String(daysTo(el.dataset.to));
    });
  }
  let tickTimer = null;
  function scheduleTick() {
    clearTimeout(tickTimer);
    if (document.hidden) return;
    const el = Date.now() - S.clock.realStart;
    const wait = 60000 - (((el % 60000) + 60000) % 60000) + 30;
    tickTimer = setTimeout(() => {
      updateLive();
      const t = now();
      for (let i = TICKS.length - 1; i >= 0; i--) {
        let keep = true;
        try { keep = TICKS[i](t) !== false; } catch (e) { console.error(e); }
        if (!keep) TICKS.splice(i, 1);
      }
      scheduleTick();
    }, wait);
  }
  document.addEventListener('visibilitychange', scheduleTick);

  /* ——— built-in actions ——— */
  Object.assign(ACTS, {
    reset() {
      S = seed();
      UI.modal = UI.drawer = UI.print = null;
      UI.panel = false;
      save();
      scheduleTick();
      toast('La démo est revenue au lundi 5 octobre, 10:40.');
      go('#/client/voyage');
    },
    search: () => toast('La recherche porte sur les dossiers, les voyageurs et les documents.'),
    panel() {
      UI.panel = !UI.panel;
      UI.seen.panel = false;
      render();
    },
    readall() {
      S.notes[route().role].forEach((n) => (n.read = true));
      save();
      render();
    },
    notif(el) {
      const n = S.notes[route().role][+el.dataset.i];
      if (!n) return;
      n.read = true;
      UI.panel = false;
      save();
      if (n.go) go(n.go);
      else render();
    },
    mclose: () => modal.close(),
    dclose: () => drawer.close(),
    pclose() {
      UI.print = null;
      render();
    },
    doprint: () => window.print(),
    logout() {
      emit('logout');
      go('#/client/connexion');
    },
  });

  /* ——— events ——— */
  document.addEventListener('click', (e) => {
    const t = e.target;
    // close open menus that do not contain the click
    document.querySelectorAll('details.menu[open]').forEach((m) => {
      if (!m.contains(t)) m.removeAttribute('open');
    });
    if (t.closest('input, select, textarea, label, summary')) return;
    const actEl = t.closest('[data-act]');
    const goEl = t.closest('[data-go]');
    const useGo = goEl && (!actEl || actEl.contains(goEl));
    const panelWasOpen = UI.panel;
    if (UI.panel && !t.closest('.panel') && !(actEl && !useGo && actEl.dataset.act === 'panel')) UI.panel = false;
    if (useGo) {
      e.preventDefault();
      UI.modal = UI.drawer = UI.print = null;
      t.closest('details.menu')?.removeAttribute('open');
      go(goEl.dataset.go);
      return;
    }
    if (actEl) {
      // a click inside a modal or drawer, on nothing in particular, keeps it open
      if ((actEl.classList.contains('modal-back') || actEl.classList.contains('drawer-back')) && t.closest('[data-stop]')) {
        if (panelWasOpen && !UI.panel) render();
        return;
      }
      const fn = ACTS[actEl.dataset.act];
      if (fn) {
        e.preventDefault();
        t.closest('details.menu')?.removeAttribute('open');
        try { fn(actEl, e); } catch (err) { console.error(err); }
        return;
      }
    }
    if (panelWasOpen && !UI.panel) render();
  });
  document.addEventListener('change', (e) => {
    const el = e.target.closest('[data-change]');
    if (el && CHANGES[el.dataset.change]) CHANGES[el.dataset.change](el, e);
  });
  document.addEventListener('input', (e) => {
    const el = e.target.closest('[data-input]');
    if (el && INPUTS[el.dataset.input]) INPUTS[el.dataset.input](el, e);
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (UI.print) UI.print = null;
      else if (UI.modal) UI.modal = null;
      else if (UI.drawer) UI.drawer = null;
      else if (UI.panel) UI.panel = false;
      else return;
      tip.hide();
      render();
    }
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      ACTS.search();
    }
  });
  window.addEventListener('hashchange', () => {
    UI.panel = false;
    tip.hide();
    render();
  });
  window.addEventListener('scroll', () => tip.hide(), { passive: true });

  /* ——— public API ——— */
  const M = {
    esc, fmtEur, fmtNum, fmtPct, d, fmtD, fmtT, fmtH, dayKey, daysTo, daysSince, countdown, ago,
    now, nowISO, get S() { return S; }, set S(v) { S = v; },
    ui, save, render, emit, once, readThread,
    trip, counts, balances, passport, garnier, assigned, messages,
    page, act, change, input, go, onTick, route,
    modal, drawer, toast, tip, roll, stamp, badge, av, ic, closeBtn, logo,
    download, print, reduced, uid, NB,
    icons: { add: (o) => Object.assign(IC, o) },
  };
  window.M = M;

  document.addEventListener('DOMContentLoaded', () => {
    if (!location.hash || location.hash.split('/').length < 3) location.replace(`#/${route().role}/${route().id}`);
    render();
    scheduleTick();
  });
})();
