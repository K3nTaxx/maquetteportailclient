/* Atelier Méridien — client portal mockup.
   Everything runs in the page: no server, no external call. The state lives in memory and in
   localStorage, so the three spaces (client, équipe, admin) see the same orders: a feedback sent
   by the client shows up on the designer's board, a version sent to quality control waits in the
   admin queue, and so on. « Réinitialiser » brings the demo back to its first state. */
(() => {
  'use strict';

  const KEY = 'meridien-portail-demo-v1';
  const app = document.getElementById('app');
  const toastsEl = document.getElementById('toasts');
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
  const eur = (n) => `${n.toLocaleString('fr-FR')} €`;

  /* ——— icons ——— */
  const P = {
    home: 'M3 10.5 12 3l9 7.5M5 9.5V21h14V9.5M10 21v-6h4v6',
    box: 'M3 7.5 12 3l9 4.5v9L12 21l-9-4.5zM3 7.5l9 4.5 9-4.5M12 12v9',
    doc: 'M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8zM14 3v5h5M9 13h6M9 17h6',
    folder: 'M3 7a2 2 0 0 1 2-2h4l2 2.5h8a2 2 0 0 1 2 2V18a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z',
    cart: 'M3 4h2l2.4 11.2a2 2 0 0 0 2 1.6h7.6a2 2 0 0 0 2-1.5L21 8H6M10 20.5h.01M17 20.5h.01',
    receipt: 'M6 3h12v18l-3-2-3 2-3-2-3 2zM9 8h6M9 12h6',
    chat: 'M21 11.5a8.4 8.4 0 0 1-9 8.4 8.8 8.8 0 0 1-3.5-.7L3 21l1.9-5A8.4 8.4 0 1 1 21 11.5z',
    board: 'M4 4h5v16H4zM10.5 4h5v10h-5zM17 4h3v7h-3z',
    users: 'M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM2.5 20a6.5 6.5 0 0 1 13 0M16.5 3.6a4 4 0 0 1 0 7.2M18 20a6.4 6.4 0 0 0-2-4.6',
    gauge: 'M4 20V10M10 20V4M16 20v-7M22 20H2',
    shield: 'M12 3 5 6v6c0 4.2 2.9 7.8 7 9 4.1-1.2 7-4.8 7-9V6zM9 12l2 2 4-4',
    layers: 'M12 3 2 8l10 5 10-5zM2 13l10 5 10-5',
    tag: 'M3 12V4a1 1 0 0 1 1-1h8l9 9-9 9zM7.5 7.5h.01',
    bell: 'M6 16v-5a6 6 0 1 1 12 0v5l1.5 2h-15zM10 20.5a2 2 0 0 0 4 0',
    search: 'M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14zM20 20l-4-4',
    check: 'M5 12.5l4.5 4.5L19 7.5',
    x: 'M6 6l12 12M18 6 6 18',
    arrowR: 'M5 12h14m0 0-6-6m6 6-6 6',
    arrowL: 'M19 12H5m0 0 6-6m-6 6 6 6',
    down: 'M12 4v11m0 0 4-4m-4 4-4-4M4 19h16',
    up: 'M12 20V9m0 0 4 4m-4-4-4 4M4 5h16',
    star: 'M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9 6.8 19.6l1-5.8L3.5 9.7l5.9-.9z',
    clock: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 7v5l3.5 2',
    plus: 'M12 5v14M5 12h14',
    phone: 'M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2',
    mail: 'M3 6h18v12H3zM3 7l9 6 9-6',
    eye: 'M2 12s3.8-6 10-6 10 6 10 6-3.8 6-10 6S2 12 2 12zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z',
    reset: 'M4 12a8 8 0 1 0 2.4-5.7M4 4v4h4',
    send: 'M21 3 10.5 13.5M21 3l-7 18-3.5-7.5L3 10.5z',
    file: 'M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8zM14 3v5h5',
    lock: 'M7 11V8a5 5 0 0 1 10 0v3M5 11h14v10H5z',
    cal: 'M4 6h16v15H4zM4 10h16M9 3v4M15 3v4',
    list: 'M8 6h13M8 12h13M8 18h13M3.5 6h.01M3.5 12h.01M3.5 18h.01',
    trash: 'M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3',
    msg: 'M4 5h16v11H8l-4 4z',
  };
  const ic = (n, s = 18, sw = 1.7) =>
    `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${P[n]}"/></svg>`;
  const mark = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f6f5f2" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="6.5"/><path d="M12 3v18M3 12h18"/></svg>`;

  /* ——— people ——— */
  const TEAM = {
    lea: { name: 'Léa Morel', role: 'Directrice artistique', c: '#7a5c3e' },
    hugo: { name: 'Hugo Brun', role: 'Designer graphique', c: '#3e5c7a' },
    samia: { name: 'Samia Kader', role: 'Designer packaging', c: '#6a4e7f' },
  };
  const ADMIN = { name: 'Claire Vasseur', role: 'Fondatrice · admin', c: '#1f4d3f' };
  const ME = 'lea'; // the designer whose board the « Équipe » space shows
  const CLIENTS = {
    mc: { name: 'Maison Carbone', who: 'Thomas Girard', mail: 't.girard@maisoncarbone.fr', sector: 'Torréfacteur', city: 'Lyon', plan: 'Ponctuel', since: 'mars 2026', c: '#a0522d' },
    nova: { name: 'Nova Pilates', who: 'Inès Faure', mail: 'ines@novapilates.fr', sector: 'Studio de pilates', city: 'Bordeaux', plan: 'Studio mensuel', since: 'janv. 2026', c: '#5f7f6f' },
    lu: { name: 'Fermette Lu', who: 'Lucie Arnaud', mail: 'lucie@fermettelu.fr', sector: 'Épicerie fine', city: 'Nantes', plan: 'Ponctuel', since: 'nov. 2025', c: '#b08838' },
    sauv: { name: 'Atelier Sauvage', who: 'Maël Roux', mail: 'mael@ateliersauvage.fr', sector: 'Céramiste', city: 'Marseille', plan: 'Ponctuel', since: 'oct. 2026', c: '#7f5f4f' },
    hr: { name: 'Brasserie Haute-Rive', who: 'Paul Mercier', mail: 'paul@haute-rive.beer', sector: 'Brasserie artisanale', city: 'Annecy', plan: 'Studio mensuel', since: 'févr. 2026', c: '#8a6a2f' },
    delmas: { name: 'Cabinet Delmas', who: 'Sophie Delmas', mail: 's.delmas@delmas-avocats.fr', sector: 'Avocats', city: 'Paris', plan: 'Ponctuel', since: 'juil. 2026', c: '#2f3f5f' },
    lumen: { name: 'Lumen Optique', who: 'Karim Benali', mail: 'karim@lumen-optique.fr', sector: 'Opticien', city: 'Lille', plan: 'Ponctuel', since: 'mai 2026', c: '#4f6f8f' },
    oli: { name: 'Oli & Mar', who: 'Nora Etcheverry', mail: 'nora@olietmar.fr', sector: 'Restaurant', city: 'Biarritz', plan: 'Studio mensuel', since: 'avr. 2026', c: '#2f6f7f' },
  };
  const CLIENT_ME = 'mc';
  const initials = (n) => n.split(/[\s&]+/).filter(Boolean).map((w) => w[0]).join('').slice(0, 2).toUpperCase();
  const av = (p, cls = '') => `<span class="av ${cls}" style="background:${p.c}" title="${esc(p.name)}">${initials(p.name)}</span>`;

  /* ——— the first state of the demo ——— */
  function seed() {
    const o = (id, client, pack, price, designer, status, x = {}) => ({ id, client, pack, price, designer, status, version: 1, pendingVersion: null, revUsed: 0, revMax: 2, feedback: [], chosen: null, ...x });
    return {
      v: 1,
      orders: [
        o('MC-1042', 'mc', 'Identité complète', 1490, 'lea', 'review', { created: '2 oct. · 10 h 12', due: '6 oct. · 18 h', delivered: '4 oct. · 17 h 45', kind: 'logo' }),
        o('MC-1047', 'mc', 'Kit réseaux sociaux', 290, 'lea', 'production', { created: '4 oct. · 9 h 03', due: '7 oct. · 12 h', kind: 'social' }),
        o('MC-1031', 'mc', 'Packaging · 3 étiquettes', 1170, 'samia', 'validated', { created: '12 sept.', due: '15 sept.', delivered: '15 sept. · 11 h 20', kind: 'pack', chosen: 'A', version: 2, revUsed: 1 }),
        o('LU-1041', 'lu', 'Étiquettes · gamme miel', 780, 'lea', 'review', { created: '30 sept.', due: '6 oct. · 12 h', delivered: '4 oct. · 10 h 05', kind: 'honey', version: 2, revUsed: 1 }),
        o('NV-1044', 'nova', 'Kit réseaux sociaux', 290, 'hugo', 'revision', { created: '1 oct.', due: '6 oct. · 18 h', delivered: '3 oct. · 16 h 30', kind: 'social', revUsed: 1, feedback: [
          { k: 'A', x: 0.52, y: 0.34, text: 'Le titre est trop serré, on peut l’aérer ?', version: 1 },
          { k: 'B', x: 0.5, y: 0.72, text: 'Mettre plutôt « Cours d’essai offert ».', version: 1 },
        ] }),
        o('HR-1043', 'hr', 'Étiquette bière · Ambrée', 390, 'hugo', 'control', { created: '1 oct.', due: '5 oct. · 17 h', kind: 'beer', pendingVersion: 1 }),
        o('LU-1045', 'lu', 'Packaging · coffret de Noël', 780, 'samia', 'production', { created: '3 oct.', due: '8 oct. · 18 h', kind: 'honey' }),
        o('SV-1046', 'sauv', 'Identité express', 690, 'lea', 'brief', { created: '5 oct. · 8 h 40', due: '8 oct. · 8 h', kind: 'logo2' }),
        o('OL-1048', 'oli', 'Menu & signalétique', 540, 'samia', 'production', { created: '1 oct.', due: '5 oct. · 9 h', kind: 'menu', late: true }),
        o('DL-1040', 'delmas', 'Identité complète', 1490, 'lea', 'validated', { created: '24 sept.', due: '28 sept.', delivered: '27 sept. · 15 h', kind: 'law', version: 2, revUsed: 1, chosen: 'A' }),
        o('LM-1039', 'lumen', 'Refonte logo', 690, 'hugo', 'validated', { created: '22 sept.', due: '25 sept.', delivered: '24 sept. · 11 h', kind: 'lumen', chosen: 'A' }),
        o('HR-1036', 'hr', 'Étiquette bière · Blonde', 390, 'hugo', 'validated', { created: '16 sept.', due: '18 sept.', delivered: '18 sept. · 9 h 40', kind: 'beer', chosen: 'A' }),
      ],
      drafts: {},
      uploads: {},
      notes: {
        client: [
          { t: 'Vos 3 propositions de logo sont prêtes', s: 'MC-1042 · hier à 17 h 45', go: '#/client/review/MC-1042' },
          { t: 'Léa a démarré votre kit réseaux sociaux', s: 'MC-1047 · hier à 9 h 20', go: '#/client/commande/MC-1047' },
          { t: 'Facture F-2026-121 disponible', s: '4 oct.', go: '#/client/factures', read: true },
        ],
        team: [
          { t: 'Nouveau brief : Atelier Sauvage', s: 'SV-1046 · il y a 40 min', go: '#/equipe/projet/SV-1046' },
          { t: 'Fermette Lu regarde votre V2', s: 'LU-1041 · ce matin', go: '#/equipe/projet/LU-1041' },
          { t: 'Claire a validé l’étiquette Blonde', s: 'HR-1036 · 18 sept.', read: true },
        ],
        admin: [
          { t: 'HR-1043 attend votre contrôle', s: 'Hugo Brun · il y a 25 min', go: '#/admin/controle' },
          { t: 'OL-1048 a dépassé son échéance', s: 'Samia Kader · de 3 h', go: '#/admin/projet/OL-1048' },
          { t: 'Nouvelle commande : Atelier Sauvage', s: '690 € · ce matin', go: '#/admin/projet/SV-1046' },
        ],
      },
      brief: {
        activite: 'Torréfacteur artisanal à Lyon depuis 2019 : une boutique-atelier à la Croix-Rousse et une vente en ligne. Nous torréfions chaque semaine des cafés de spécialité, en petits lots.',
        cible: '25-45 ans, amateurs de café de spécialité, plutôt urbains. Ils font attention à l’origine des grains et achètent aussi en cadeau.',
        style: ['Chaleureux', 'Artisanal', 'Épuré'],
        refs: 'Les maisons de spécialité scandinaves : sobres, beaucoup d’espace, une seule couleur forte. À éviter : le « vintage » trop vu (badges, rayures, café fumant).',
        mots: 'Grain, feu, patience, précision.',
      },
      invoices: [
        { id: 'F-2026-121', order: 'MC-1047', label: 'Kit réseaux sociaux', amount: 290, date: '4 oct. 2026' },
        { id: 'F-2026-118', order: 'MC-1042', label: 'Identité complète', amount: 1490, date: '2 oct. 2026' },
        { id: 'F-2026-097', order: 'MC-1031', label: 'Packaging · 3 étiquettes', amount: 1170, date: '12 sept. 2026' },
      ],
      offers: [
        { id: 'express', name: 'Identité express', price: 690, unit: '', delay: '72 h', desc: 'Un logo, sa palette et ses typographies, pour démarrer vite.', items: ['3 propositions de logo', '2 révisions incluses', 'Fichiers SVG, PNG et PDF'], active: true },
        { id: 'complete', name: 'Identité complète', price: 1490, unit: '', delay: '5 jours', desc: 'La marque entière, prête pour tous vos supports.', items: ['3 pistes créatives', 'Charte graphique de 12 pages', 'Papeterie et signature mail'], active: true, hl: true },
        { id: 'pack', name: 'Packaging', price: 390, unit: '/ étiquette', delay: '4 jours', desc: 'Étiquettes et emballages prêts pour l’imprimeur.', items: ['Mise au gabarit imprimeur', 'Déclinaisons de gamme', 'BAT inclus'], active: true },
        { id: 'social', name: 'Kit réseaux sociaux', price: 290, unit: '', delay: '48 h', desc: 'Les modèles de vos publications, faciles à réutiliser.', items: ['6 modèles de publication', '3 modèles de story', 'Couvertures de profil'], active: true },
        { id: 'monthly', name: 'Studio mensuel', price: 590, unit: '/ mois', delay: 'En continu', desc: 'Un studio à disposition : 8 créations par mois, sans devis.', items: ['8 créations par mois', 'Priorité sur les délais', 'Sans engagement'], active: true, monthly: true },
      ],
      checklist: [false, false, false, false, false, false],
      seq: 1049,
    };
  }
  const load = () => {
    try {
      const s = JSON.parse(localStorage.getItem(KEY));
      return s && s.v === 1 ? s : null;
    } catch (e) {
      return null;
    }
  };
  const save = () => {
    try {
      localStorage.setItem(KEY, JSON.stringify(S));
    } catch (e) {}
  };
  let S = load() || seed();
  const UI = { modal: null, viewer: null, panel: false, view: 'mine', ptab: 'all', briefStep: 0, focusDraft: false };
  const order = (id) => S.orders.find((o) => o.id === id);

  /* ——— statuses ——— */
  const ST = {
    brief: { t: 'Brief reçu', c: 'b-info', col: 'À démarrer' },
    production: { t: 'En création', c: 'b-violet', col: 'En création' },
    revision: { t: 'Révision en cours', c: 'b-violet', col: 'En révision' },
    control: { t: 'Contrôle qualité', c: 'b-warn', col: 'Au contrôle' },
    review: { t: 'Chez le client', c: 'b-accent', col: 'Chez le client' },
    validated: { t: 'Validée', c: 'b-ok', col: 'Terminé' },
  };
  const CLIENT_ST = { brief: 'Brief reçu', production: 'En création', revision: 'Modifications en cours', control: 'En vérification', review: 'Votre avis est attendu', validated: 'Validée' };
  const badge = (o, forClient = false) => {
    const s = ST[o.status];
    const t = forClient ? CLIENT_ST[o.status] : s.t;
    const c = forClient && o.status === 'review' ? 'b-warn' : o.late && o.status !== 'validated' ? 'b-bad' : s.c;
    return `<span class="badge ${c}"><i></i>${o.late && o.status !== 'validated' && !forClient ? 'En retard' : t}</span>`;
  };

  /* ——— the deliverables, drawn in SVG ——— */
  const DELIV = {
    logo: [['A', 'Proposition A · Grain'], ['B', 'Proposition B · Sceau'], ['C', 'Proposition C · Braise']],
    social: [['A', 'Publication · lancement'], ['B', 'Story · arrivage'], ['C', 'Couverture de profil']],
    pack: [['A', 'Étiquette Éthiopie'], ['B', 'Étiquette Brésil'], ['C', 'Étiquette Décaféiné']],
    honey: [['A', 'Miel de châtaignier'], ['B', 'Miel de lavande'], ['C', 'Miel toutes fleurs']],
    beer: [['A', 'Étiquette avant'], ['B', 'Collerette']],
    menu: [['A', 'Menu du midi'], ['B', 'Signalétique terrasse']],
    law: [['A', 'Logo'], ['B', 'Papeterie']],
    lumen: [['A', 'Logo'], ['B', 'Enseigne']],
    logo2: [['A', 'Piste A'], ['B', 'Piste B'], ['C', 'Piste C']],
  };
  const deliv = (o) => DELIV[o.kind] || DELIV.logo;
  const BG = { light: ['#f2ede4', '#1c1916'], dark: ['#1d1a17', '#f2ede4'], kraft: ['#c6a378', '#2a211a'] };
  let uid = 0;
  const svg = (inner, bg) => `<svg viewBox="0 0 800 600" xmlns="http://www.w3.org/2000/svg" role="img"><rect width="800" height="600" fill="${bg}"/>${inner}</svg>`;
  function art(o, k, version, bgKey = 'light') {
    const v2 = version >= 2;
    const [bg, ink] = BG[bgKey] || BG.light;
    const acc = v2 ? '#9a4526' : '#b5562e';
    const serif = `font-family="Instrument Serif, Georgia, serif"`;
    const sans = `font-family="Hanken Grotesk, Arial, sans-serif"`;
    if (o.kind === 'logo') {
      if (k === 'A') {
        const bean = `<g transform="translate(400 222) rotate(-28)"><ellipse rx="${v2 ? 30 : 34}" ry="${v2 ? 42 : 47}" fill="${acc}"/><path d="M-2 -${v2 ? 38 : 42} C 14 -14, -16 14, 2 ${v2 ? 38 : 42}" fill="none" stroke="${bg}" stroke-width="${v2 ? 5 : 6}" stroke-linecap="round"/></g>${v2 ? `<circle cx="400" cy="222" r="66" fill="none" stroke="${ink}" stroke-width="1.5"/>` : ''}`;
        return svg(`${bean}<text x="400" y="${v2 ? 352 : 345}" text-anchor="middle" ${serif} font-size="${v2 ? 60 : 64}" letter-spacing="${v2 ? 4 : 7}" fill="${ink}">MAISON CARBONE</text><text x="400" y="${v2 ? 392 : 390}" text-anchor="middle" ${sans} font-size="13" font-weight="600" letter-spacing="4.5" fill="${ink}" opacity="0.72">${v2 ? 'TORRÉFACTEUR À LYON DEPUIS 2019' : 'TORRÉFACTION ARTISANALE · LYON'}</text>`, bg);
      }
      if (k === 'B') {
        const id = `ring${++uid}`;
        return svg(`<defs><path id="${id}" d="M400 300 m-121 0 a121 121 0 1 1 242 0 a121 121 0 1 1 -242 0"/></defs><circle cx="400" cy="300" r="140" fill="none" stroke="${ink}" stroke-width="${v2 ? 2 : 3}"/><circle cx="400" cy="300" r="104" fill="none" stroke="${ink}" stroke-width="1.2" opacity="0.6"/><text ${sans} font-size="14.5" font-weight="600" fill="${ink}" textLength="744" lengthAdjust="spacing"><textPath href="#${id}">MAISON CARBONE · TORRÉFACTION ARTISANALE · LYON ·</textPath></text><text x="400" y="336" text-anchor="middle" ${serif} font-size="112" fill="${ink}">M<tspan fill="${acc}" font-style="italic">c</tspan></text>${v2 ? `<g transform="translate(400 392) rotate(-28)"><ellipse rx="7" ry="10" fill="${acc}"/></g>` : ''}`, bg);
      }
      return svg(`<path d="M${v2 ? 468 : 466} 214 c 0 -26 -14 -36 -22 -52 c -2 18 -18 26 -18 52 a 20 20 0 0 0 40 0z" fill="${acc}"/><text x="400" y="330" text-anchor="middle" ${sans} font-size="122" font-weight="${v2 ? 700 : 800}" letter-spacing="-5" fill="${ink}">carbone</text>${v2 ? `<line x1="250" x2="550" y1="364" y2="364" stroke="${ink}" stroke-width="1.2" opacity="0.5"/>` : ''}<text x="400" y="${v2 ? 404 : 392}" text-anchor="middle" ${serif} font-style="italic" font-size="30" fill="${ink}" opacity="0.8">maison de torréfaction</text>`, bg);
    }
    const c = CLIENTS[o.client];
    if (o.kind === 'social') {
      const head = o.client === 'mc' ? 'Nouvel arrivage' : 'Cours d’essai offert';
      const sub = o.client === 'mc' ? 'Colombie · Huila' : 'Pilates reformer · Bordeaux';
      const name = o.client === 'mc' ? 'MAISON CARBONE' : 'NOVA PILATES';
      const col = o.client === 'mc' ? '#b5562e' : '#5f7f6f';
      if (k === 'B') return svg(`<rect x="290" y="40" width="220" height="520" rx="18" fill="${col}"/><text x="400" y="120" text-anchor="middle" ${sans} font-size="13" font-weight="700" letter-spacing="3" fill="#f6efe6">${name}</text><text x="400" y="300" text-anchor="middle" ${serif} font-size="46" fill="#fff">${head.split(' ')[0]}</text><text x="400" y="350" text-anchor="middle" ${serif} font-style="italic" font-size="46" fill="#fff">${head.split(' ').slice(1).join(' ')}</text><text x="400" y="500" text-anchor="middle" ${sans} font-size="14" fill="#f6efe6">${sub}</text>`, '#ece7de');
      if (k === 'C') return svg(`<rect x="60" y="170" width="680" height="260" rx="10" fill="${col}"/><text x="110" y="312" ${serif} font-size="64" fill="#fff">${c.name}</text><text x="112" y="356" ${sans} font-size="16" letter-spacing="2" fill="#f6efe6">${c.sector.toUpperCase()} · ${c.city.toUpperCase()}</text>`, '#ece7de');
      return svg(`<rect x="200" y="100" width="400" height="400" rx="14" fill="#fff" stroke="#e2ddd3"/><rect x="200" y="100" width="400" height="250" rx="14" fill="${col}"/><text x="400" y="210" text-anchor="middle" ${serif} font-size="${k === 'A' && o.version >= 2 ? 50 : 54}" letter-spacing="${o.version >= 2 ? 1 : -1}" fill="#fff">${head}</text><text x="400" y="255" text-anchor="middle" ${sans} font-size="15" fill="#f6efe6">${sub}</text><text x="230" y="400" ${sans} font-size="14" font-weight="700" letter-spacing="2" fill="#1c1916">${name}</text><text x="230" y="430" ${sans} font-size="14" fill="#6e6b65">Disponible cette semaine en boutique</text>`, '#ece7de');
    }
    if (o.kind === 'pack') {
      const origin = { A: ['Éthiopie', 'Guji', 'jasmin, pêche blanche'], B: ['Brésil', 'Cerrado', 'cacao, noisette'], C: ['Décaféiné', 'Colombie', 'caramel, fruits secs'] }[k];
      return svg(`<path d="M300 90 h200 l20 40 v380 a20 20 0 0 1 -20 20 h-200 a20 20 0 0 1 -20 -20 v-380z" fill="#c6a378"/><path d="M300 90 h200 l20 40 h-240z" fill="#b59266"/><rect x="315" y="190" width="170" height="250" rx="6" fill="#f2ede4"/><text x="400" y="232" text-anchor="middle" ${serif} font-size="20" letter-spacing="2" fill="#1c1916">MAISON CARBONE</text><line x1="345" x2="455" y1="250" y2="250" stroke="#1c1916" stroke-width="1" opacity="0.4"/><text x="400" y="300" text-anchor="middle" ${serif} font-size="34" fill="#b5562e">${origin[0]}</text><text x="400" y="330" text-anchor="middle" ${sans} font-size="12" font-weight="600" letter-spacing="2" fill="#1c1916">${origin[1].toUpperCase()}</text><text x="400" y="372" text-anchor="middle" ${sans} font-size="11.5" fill="#6e6b65">${origin[2]}</text><text x="400" y="420" text-anchor="middle" ${sans} font-size="12" font-weight="700" fill="#1c1916">250 g</text>`, '#ece7de');
    }
    if (o.kind === 'honey') {
      const n = { A: ['Châtaignier', '#7a4a1e'], B: ['Lavande', '#6a5a9a'], C: ['Toutes fleurs', '#b08838'] }[k];
      return svg(`<rect x="300" y="120" width="200" height="40" rx="8" fill="#3b3229"/><rect x="285" y="160" width="230" height="330" rx="34" fill="#d99a2b" opacity="0.9"/><path d="M400 238 l70 40 v80 l-70 40 l-70 -40 v-80z" fill="#f4ecdc" stroke="${n[1]}" stroke-width="3"/><text x="400" y="292" text-anchor="middle" ${serif} font-size="26" fill="#1c1916">Fermette Lu</text><text x="400" y="326" text-anchor="middle" ${serif} font-style="italic" font-size="22" fill="${n[1]}">${n[0]}</text><text x="400" y="356" text-anchor="middle" ${sans} font-size="10.5" font-weight="700" letter-spacing="2" fill="#1c1916">MIEL DE NANTES · ${o.version >= 2 ? '250 G' : '500 G'}</text>`, '#efe7d8');
    }
    if (o.kind === 'beer') {
      if (k === 'B') return svg(`<path d="M250 280 q150 -90 300 0 v40 q-150 -90 -300 0z" fill="#8a6a2f"/><text x="400" y="290" text-anchor="middle" ${sans} font-size="16" font-weight="700" letter-spacing="4" fill="#f4ecdc">HAUTE-RIVE</text>`, '#ebe4d6');
      return svg(`<rect x="360" y="60" width="80" height="120" rx="10" fill="#4a3a22"/><path d="M350 180 h100 c40 40 50 70 50 120 v220 a20 20 0 0 1 -20 20 h-160 a20 20 0 0 1 -20 -20 v-220 c0 -50 10 -80 50 -120z" fill="#6b4a1f"/><ellipse cx="400" cy="380" rx="88" ry="104" fill="#f4ecdc"/><text x="400" y="352" text-anchor="middle" ${sans} font-size="15" font-weight="700" letter-spacing="3" fill="#8a6a2f">HAUTE-RIVE</text><text x="400" y="400" text-anchor="middle" ${serif} font-size="40" fill="#1c1916">${o.id === 'HR-1036' ? 'Blonde' : 'Ambrée'}</text><text x="400" y="432" text-anchor="middle" ${sans} font-size="12" fill="#6e6b65">${o.id === 'HR-1036' ? '4,8 %' : '6,2 %'} · 33 cl · Annecy</text>`, '#ebe4d6');
    }
    if (o.kind === 'menu') {
      if (k === 'B') return svg(`<rect x="230" y="120" width="340" height="300" rx="6" fill="#2f6f7f"/><text x="400" y="250" text-anchor="middle" ${serif} font-size="56" fill="#f4ecdc">Oli <tspan font-style="italic">&amp;</tspan> Mar</text><text x="400" y="300" text-anchor="middle" ${sans} font-size="15" letter-spacing="3" fill="#cfe1e4">TERRASSE · OUVERT DE 12 H À 23 H</text><rect x="390" y="420" width="20" height="120" fill="#24525d"/>`, '#e9e4da');
      return svg(`<rect x="240" y="60" width="320" height="480" rx="4" fill="#fbf8f2" stroke="#e2ddd3"/><text x="400" y="130" text-anchor="middle" ${serif} font-size="42" fill="#1c1916">Oli <tspan font-style="italic" fill="#2f6f7f">&amp;</tspan> Mar</text><text x="400" y="160" text-anchor="middle" ${sans} font-size="11" font-weight="700" letter-spacing="3" fill="#6e6b65">MENU DU MIDI</text>${[0, 1, 2, 3].map((i) => `<rect x="280" y="${210 + i * 72}" width="${170 - i * 18}" height="9" rx="4" fill="#1c1916" opacity="0.8"/><rect x="280" y="${228 + i * 72}" width="200" height="7" rx="3.5" fill="#1c1916" opacity="0.25"/><text x="520" y="${220 + i * 72}" text-anchor="end" ${sans} font-size="14" font-weight="600" fill="#2f6f7f">${[16, 19, 24, 9][i]} €</text>`).join('')}`, '#e9e4da');
    }
    if (o.kind === 'law') {
      if (k === 'B') return svg(`<rect x="170" y="110" width="290" height="400" fill="#fff" stroke="#e2ddd3"/><text x="200" y="160" ${serif} font-size="26" letter-spacing="4" fill="#2f3f5f">DELMAS</text><rect x="200" y="200" width="200" height="6" rx="3" fill="#2f3f5f" opacity="0.2"/><rect x="200" y="216" width="160" height="6" rx="3" fill="#2f3f5f" opacity="0.2"/><rect x="490" y="250" width="160" height="96" fill="#2f3f5f"/><text x="570" y="306" text-anchor="middle" ${serif} font-size="22" letter-spacing="3" fill="#f2ede4">DELMAS</text>`, '#ebe7e0');
      return svg(`<text x="400" y="300" text-anchor="middle" ${serif} font-size="86" letter-spacing="12" fill="#2f3f5f">DELMAS</text><line x1="300" x2="500" y1="330" y2="330" stroke="#2f3f5f" stroke-width="1.2"/><text x="400" y="364" text-anchor="middle" ${sans} font-size="14" font-weight="600" letter-spacing="5" fill="#2f3f5f">AVOCATS ASSOCIÉS · PARIS</text>`, '#f2efe9');
    }
    if (o.kind === 'lumen') {
      if (k === 'B') return svg(`<rect x="160" y="200" width="480" height="150" rx="75" fill="#1d2833"/><circle cx="270" cy="275" r="38" fill="none" stroke="#9cc3e6" stroke-width="6"/><text x="330" y="294" ${sans} font-size="56" font-weight="600" letter-spacing="-1" fill="#f2ede4">lumen</text>`, '#e8ecef');
      return svg(`<circle cx="300" cy="300" r="62" fill="none" stroke="#4f6f8f" stroke-width="10"/><circle cx="300" cy="300" r="20" fill="#4f6f8f"/><text x="390" y="325" ${sans} font-size="84" font-weight="600" letter-spacing="-3" fill="#1d2833">lumen</text>`, '#f1f3f4');
    }
    return svg(`<text x="400" y="300" text-anchor="middle" ${serif} font-size="54" fill="#7f5f4f">Atelier <tspan font-style="italic">Sauvage</tspan></text><text x="400" y="344" text-anchor="middle" ${sans} font-size="13" letter-spacing="4" fill="#7f5f4f">CÉRAMIQUE · MARSEILLE · PISTE ${k}</text>`, '#efe8df');
  }

  /* ——— helpers ——— */
  const note = (role, t, s, go) => S.notes[role].unshift({ t, s, go });
  const toast = (msg) => {
    const el = document.createElement('div');
    el.className = 'toast';
    el.innerHTML = `${ic('check', 16, 2.2)}<span>${esc(msg)}</span>`;
    toastsEl.append(el);
    setTimeout(() => {
      el.style.transition = 'opacity .3s';
      el.style.opacity = '0';
      setTimeout(() => el.remove(), 320);
    }, 2600);
  };
  const go = (h) => {
    if (location.hash === h) render();
    else location.hash = h;
  };
  const route = () => {
    const parts = (location.hash || '#/client/accueil').replace(/^#\//, '').split('/');
    const role = ['client', 'equipe', 'admin'].includes(parts[0]) ? parts[0] : 'client';
    return { role, page: parts[1] || (role === 'client' ? 'accueil' : role === 'equipe' ? 'projets' : 'pilotage'), id: parts[2] };
  };
  const roleKey = (r) => (r === 'equipe' ? 'team' : r);
  const myOrders = () => S.orders.filter((o) => o.client === CLIENT_ME);
  const inProgress = (o) => ['brief', 'production', 'revision', 'control'].includes(o.status);
  const thumbs = (o, version, onclick, opts = {}) =>
    `<div class="thumbs">${deliv(o)
      .map(([k, name]) => {
        const pins = o.feedback.filter((f) => f.k === k && f.version === o.version).length + (S.drafts[o.id] || []).filter((d) => d.k === k).length;
        return `<button class="thumb" ${onclick(k)}><div class="thumb__img">${art(o, k, version)}${pins && !opts.noPins ? `<span class="thumb__pins badge b-bad">${ic('msg', 13, 2)}${pins}</span>` : ''}${opts.chosen === k ? '<span class="thumb__pins badge b-ok"><i></i>Retenue</span>' : ''}</div><div class="thumb__meta"><span class="thumb__name">${esc(name)}</span><span class="chip">V${version}</span></div></button>`;
      })
      .join('')}</div>`;
  const stepper = (o) => {
    const steps = [
      ['Commande payée', o.created],
      ['Brief reçu', o.created],
      ['En création', o.status === 'brief' ? 'À venir' : TEAM[o.designer].name],
      ['Livraison', o.delivered || `Prévue le ${o.due}`],
      ['Révisions', `${o.revUsed} sur ${o.revMax} utilisée${o.revUsed > 1 ? 's' : ''}`],
      ['Validée', o.status === 'validated' ? 'Fichiers prêts' : 'À venir'],
    ];
    const at = { brief: 2, production: 2, control: o.delivered ? 4 : 3, review: o.revUsed ? 4 : 3, revision: 4, validated: 6 }[o.status];
    return `<div class="steps">${steps
      .map(([t, d], i) => `<div class="step ${i < at ? 'is-done' : i === at ? 'is-now' : ''}"><span class="step__dot">${i < at ? `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"><path d="${P.check}"/></svg>` : ''}</span><div class="step__t">${t}</div><div class="step__d">${esc(d)}</div></div>`)
      .join('')}</div>`;
  };

  /* ——— the frame: demo bar, sidebar, top bar ——— */
  const NAV = {
    client: [
      ['accueil', 'Accueil', 'home'],
      ['commandes', 'Mes commandes', 'box', () => myOrders().filter((o) => o.status === 'review').length],
      ['brief', 'Mon brief', 'doc'],
      ['fichiers', 'Mes fichiers', 'folder'],
      ['commander', 'Commander', 'cart'],
      ['factures', 'Factures', 'receipt'],
      ['contact', 'Nous contacter', 'chat'],
    ],
    equipe: [
      ['projets', 'Mes projets', 'board', () => S.orders.filter((o) => o.designer === ME && ['brief', 'production', 'revision'].includes(o.status)).length],
      ['tous', 'Toute l’équipe', 'users'],
      ['charte', 'Charte de production', 'list'],
    ],
    admin: [
      ['pilotage', 'Pilotage', 'gauge'],
      ['controle', 'Contrôle qualité', 'shield', () => S.orders.filter((o) => o.status === 'control').length],
      ['projets', 'Projets', 'layers'],
      ['clients', 'Clients', 'users'],
      ['equipe', 'Équipe', 'board'],
      ['offres', 'Offres', 'tag'],
    ],
  };
  const WHO = { client: { ...CLIENTS.mc, name: 'Thomas Girard', role: 'Maison Carbone' }, equipe: { ...TEAM[ME] }, admin: ADMIN };
  function frame(r, title, body) {
    const n = S.notes[roleKey(r.role)];
    const unread = n.filter((x) => !x.read).length;
    const w = WHO[r.role];
    return `
    <div class="demobar">
      <div class="demobar__label"><i class="demobar__dot"></i><b>Maquette interactive</b><span>· données fictives · tout est cliquable</span></div>
      <div class="seg" role="tablist" aria-label="Changer d’espace">
        ${[['client', 'Client', 'accueil'], ['equipe', 'Équipe', 'projets'], ['admin', 'Admin', 'pilotage']].map(([k, t, p]) => `<button class="${r.role === k ? 'is-on' : ''}" data-go="#/${k}/${p}">${t}</button>`).join('')}
      </div>
      <div class="demobar__right"><button class="demobar__btn" data-act="reset">${ic('reset', 14)} Réinitialiser</button></div>
    </div>
    <div class="shell">
      <aside class="side">
        <div class="brand"><span class="brand__mark">${mark}</span><div><div class="brand__name">Atelier Méridien</div><div class="brand__sub">${r.role === 'client' ? 'Espace client' : r.role === 'equipe' ? 'Espace équipe' : 'Administration'}</div></div></div>
        <div class="who">${av(w)}<div><div class="who__name">${esc(w.name)}</div><div class="who__role">${esc(w.role)}</div></div></div>
        ${NAV[r.role]
          .map(([p, t, icon, count]) => {
            const c = count ? count() : 0;
            return `<button class="nav__item ${r.page === p || (p === 'commandes' && ['commande', 'review'].includes(r.page)) || (p === 'projets' && r.page === 'projet') ? 'is-on' : ''}" data-go="#/${r.role}/${p}">${ic(icon)}<span>${t}</span>${c ? `<span class="nav__count">${c}</span>` : ''}</button>`;
          })
          .join('')}
        <div class="side__foot">${
          r.role === 'client'
            ? `<b>Une question ?</b><p>Votre équipe répond sur WhatsApp, en général dans l’heure.</p><button class="btn btn--ghost btn--sm btn--block" data-go="#/client/contact">${ic('chat', 15)}Nous écrire</button>`
            : r.role === 'equipe'
              ? `<b>Cette semaine</b><p>4 livraisons prévues, 1 révision à rendre demain.</p><div class="bar"><i style="width:62%"></i></div>`
              : `<b>Octobre</b><p>38 commandes · 24 860 € · objectif à 74 %.</p><div class="bar"><i style="width:74%"></i></div>`
        }</div>
      </aside>
      <div class="main">
        <header class="top">
          <div class="crumbs">${title}</div>
          <div class="top__right">
            <button class="search" data-act="search">${ic('search', 16)}<span>Rechercher</span><kbd>Ctrl K</kbd></button>
            <button class="iconbtn" data-act="panel" aria-label="Notifications">${ic('bell')}${unread ? '<i class="iconbtn__dot"></i>' : ''}</button>
            ${av(w)}
          </div>
        </header>
        <main class="content">${body}</main>
      </div>
    </div>
    ${UI.panel ? panel(r) : ''}
    ${UI.viewer ? viewer(r) : ''}
    ${UI.modal ? modal() : ''}`;
  }
  const panel = (r) => {
    const n = S.notes[roleKey(r.role)];
    return `<div class="panel ${UI.panelSeen ? 'is-static' : ''}" role="dialog" aria-label="Notifications"><div class="panel__head"><b class="spacer">Notifications</b><button class="btn btn--plain btn--sm" data-act="readall">Tout marquer comme lu</button></div>${
      n.length ? n.slice(0, 7).map((x, i) => `<button class="notif ${x.read ? 'is-read' : ''}" style="width:100%;text-align:left" data-act="notif" data-i="${i}"><i class="notif__dot"></i><div><div class="notif__t">${esc(x.t)}</div><div class="notif__s">${esc(x.s)}</div></div></button>`).join('') : '<div class="empty">Aucune notification.</div>'
    }</div>`;
  };

  /* ——— CLIENT ——— */
  function clientHome() {
    const o = order('MC-1042');
    const focus = {
      review: [o.version > 1 ? `Votre version ${o.version} est prête` : `Vos ${deliv(o).length} propositions de logo sont prêtes`, `Léa les a livrées ${o.version > 1 ? 'à l’instant' : `le ${o.delivered}`}. Ouvrez-les, cliquez directement sur le visuel pour commenter, puis validez votre préférée.`, `<button class="btn btn--primary btn--lg" data-go="#/client/review/MC-1042">Voir les propositions ${ic('arrowR', 16, 2)}</button>`],
      production: ['Léa finalise vos propositions', 'Elles vous seront livrées avant l’échéance. Vous recevrez un e-mail dès qu’elles sont prêtes.', `<button class="btn btn--ghost" data-go="#/client/commande/MC-1042">Suivre ma commande</button>`],
      revision: ['Léa travaille sur vos retours', 'La version 2 vous sera livrée demain avant 18 h. Vous recevrez un e-mail dès qu’elle est prête.', `<button class="btn btn--ghost" data-go="#/client/commande/MC-1042">Suivre ma commande</button>`],
      control: ['Votre version 2 est en vérification', 'Claire relit chaque livraison avant de vous l’envoyer. Elle arrive très vite.', `<button class="btn btn--ghost" data-go="#/client/commande/MC-1042">Suivre ma commande</button>`],
      validated: ['Votre identité est validée', 'Tous vos fichiers sont prêts : logo, palette, typographies et charte graphique.', `<button class="btn btn--primary btn--lg" data-go="#/client/fichiers">${ic('down', 16, 2)} Télécharger mes fichiers</button>`],
    }[o.status] || ['Votre commande avance', '', ''];
    const others = myOrders();
    return `
      <div class="page-head"><div><div class="eyebrow">Lundi 5 octobre</div><h1 class="h1" style="margin-top:6px">Bonjour <span class="serif">Thomas</span></h1></div></div>
      <div class="focus ${o.status === 'validated' ? 'is-ok' : ''}"><div><div class="eyebrow">MC-1042 · ${esc(o.pack)}</div><div class="focus__title">${focus[0]}</div><p>${focus[1]}</p></div><div class="row">${focus[2]}</div></div>
      <div class="card" style="margin-top:16px"><div class="card__head"><span class="h2">Suivi de votre commande</span>${badge(o, true)}</div><div class="card__body">${stepper(o)}</div></div>
      <div class="grid g-main" style="margin-top:16px">
        <div class="stack">
          <div class="card"><div class="card__head"><span class="h2">Mes commandes</span><button class="btn btn--plain btn--sm" data-go="#/client/commandes">Tout voir ${ic('arrowR', 14)}</button></div>
            <div class="list">${others.map((x) => `<button class="li" style="width:100%;text-align:left" data-go="#/client/commande/${x.id}"><div class="file__ic" style="background:#f1efea;color:var(--ink-2)">${x.id.split('-')[1]}</div><div class="li__main"><div class="li__t">${esc(x.pack)}</div><div class="li__s">${x.id} · commandée le ${esc(x.created)}</div></div>${badge(x, true)}</button>`).join('')}</div>
          </div>
          <div class="card"><div class="card__head"><span class="h2">Et ensuite ?</span><span class="muted" style="font-size:12.5px">Pour prolonger votre identité</span></div>
            <div class="card__body grid g-2">${S.offers.filter((f) => f.active && ['social', 'monthly'].includes(f.id)).map((f) => `<div class="callout"><div style="flex:1"><b>${esc(f.name)}</b><div class="hint" style="margin:2px 0 10px">${esc(f.desc)}</div><button class="btn btn--ghost btn--sm" data-act="buy" data-id="${f.id}">${eur(f.price)} ${esc(f.unit)} · Commander</button></div></div>`).join('')}</div>
          </div>
        </div>
        <div class="stack">
          <div class="card"><div class="card__head"><span class="h2">Votre équipe</span></div><div class="card__body stack" style="gap:12px">
            ${[TEAM.lea, ADMIN].map((p) => `<div class="row">${av(p)}<div><b>${esc(p.name)}</b><div class="hint">${esc(p.role)}</div></div></div>`).join('')}
            <button class="btn btn--ghost btn--block" data-go="#/client/contact">${ic('chat', 16)} Écrire à l’équipe</button>
          </div></div>
          <div class="card"><div class="card__head"><span class="h2">Activité récente</span></div><div class="card__body"><div class="timeline">
            ${[['Propositions livrées', 'MC-1042 · 4 oct. · 17 h 45', 1], ['Kit réseaux sociaux démarré', 'MC-1047 · 4 oct. · 9 h 20', 1], ['Brief reçu', 'MC-1042 · 2 oct. · 10 h 31', 1], ['Commande payée', 'MC-1042 · 2 oct. · 10 h 12', 1]].map(([t, s, d]) => `<div class="tl ${d ? 'is-done' : ''}"><i class="tl__dot"></i><div><div class="tl__t">${t}</div><div class="tl__s">${s}</div></div></div>`).join('')}
          </div></div></div>
        </div>
      </div>`;
  }
  function clientOrders() {
    return `<div class="page-head"><div><h1 class="h1">Mes commandes</h1><p class="lead">Toutes vos commandes, leur avancement et leurs fichiers, accessibles à vie.</p></div><div class="page-head__actions"><button class="btn btn--primary" data-go="#/client/commander">${ic('plus', 16, 2)} Nouvelle commande</button></div></div>
      <div class="card tablewrap"><table class="table"><thead><tr><th>Référence</th><th>Prestation</th><th>Statut</th><th>Livraison</th><th class="num">Montant</th></tr></thead><tbody>
      ${myOrders().map((o) => `<tr data-go="#/client/commande/${o.id}"><td><b>${o.id}</b></td><td>${esc(o.pack)}</td><td>${badge(o, true)}</td><td class="muted">${esc(o.delivered || `Prévue le ${o.due}`)}</td><td class="num">${eur(o.price)}</td></tr>`).join('')}
      </tbody></table></div>`;
  }
  function clientOrder(id) {
    const o = order(id);
    if (!o) return clientOrders();
    const shown = o.status === 'control' && o.pendingVersion && o.pendingVersion > o.version ? o.version : o.version;
    const hasDeliv = o.delivered || o.status === 'review' || o.status === 'validated';
    return `<div class="page-head"><div><div class="eyebrow">${o.id} · commandée le ${esc(o.created)}</div><h1 class="h1" style="margin-top:6px">${esc(o.pack)}</h1></div><div class="page-head__actions">${badge(o, true)}${o.status === 'review' ? `<button class="btn btn--primary" data-go="#/client/review/${o.id}">Donner mon avis ${ic('arrowR', 16, 2)}</button>` : ''}${o.status === 'validated' ? `<button class="btn btn--primary" data-go="#/client/fichiers">${ic('down', 16, 2)} Mes fichiers</button>` : ''}</div></div>
      <div class="card"><div class="card__body">${stepper(o)}</div></div>
      <div class="grid g-main" style="margin-top:16px">
        <div class="card"><div class="card__head"><span class="h2">Livrables</span>${hasDeliv ? `<span class="chip">Version ${shown}</span>` : ''}</div><div class="card__body">${
          hasDeliv ? thumbs(o, shown, (k) => `data-act="open" data-id="${o.id}" data-k="${k}"`, { chosen: o.chosen, noPins: o.status === 'validated' }) : `<div class="empty">${ic('clock', 28, 1.4)}<b style="color:var(--ink)">${o.status === 'brief' ? 'Votre brief a bien été reçu' : `${esc(TEAM[o.designer].name)} est sur votre projet`}</b><span>Livraison prévue le ${esc(o.due)}. Vous serez prévenu par e-mail.</span></div>`
        }</div></div>
        <div class="card"><div class="card__head"><span class="h2">Détails</span></div><div class="card__body"><dl class="kv">
          <dt>Prestation</dt><dd>${esc(o.pack)}</dd><dt>Montant</dt><dd>${eur(o.price)} · payé</dd><dt>Designer</dt><dd>${esc(TEAM[o.designer].name)}</dd><dt>Échéance</dt><dd>${esc(o.due)}</dd><dt>Révisions</dt><dd>${o.revUsed} sur ${o.revMax} incluses</dd>
        </dl><div class="divider"></div><button class="btn btn--ghost btn--block" data-go="#/client/brief">${ic('doc', 16)} Revoir mon brief</button></div></div>
      </div>`;
  }
  function clientReview(id) {
    const o = order(id);
    if (!o) return clientOrders();
    const drafts = S.drafts[o.id] || [];
    const sent = o.feedback.filter((f) => f.version === o.version);
    const canReview = o.status === 'review';
    return `<div class="page-head"><div><div class="eyebrow">${o.id} · ${esc(o.pack)} · version ${o.version}</div><h1 class="h1" style="margin-top:6px">Vos <span class="serif">propositions</span></h1><p class="lead">${canReview ? 'Ouvrez une proposition, puis cliquez directement sur le visuel pour placer un commentaire précis. Quand tout est noté, envoyez vos retours, ou validez votre préférée.' : 'Vos retours ont bien été envoyés. La prochaine version arrive bientôt.'}</p></div>
      <div class="page-head__actions"><span class="chip">Révision ${Math.min(o.revUsed + 1, o.revMax)} sur ${o.revMax} incluses</span></div></div>
      ${!canReview ? `<div class="callout is-info" style="margin-bottom:16px">${ic('clock', 18)}<div><b>${CLIENT_ST[o.status]}</b><div class="hint">${o.status === 'validated' ? 'Votre commande est validée, vos fichiers vous attendent.' : `${esc(TEAM[o.designer].name)} prépare la version suivante.`}</div></div></div>` : ''}
      ${thumbs(o, o.version, (k) => `data-act="open" data-id="${o.id}" data-k="${k}"`, { chosen: o.chosen })}
      ${canReview ? `<div class="card" style="margin-top:16px"><div class="card__body row" style="flex-wrap:wrap"><div class="spacer"><b>${drafts.length ? `${drafts.length} commentaire${drafts.length > 1 ? 's' : ''} prêt${drafts.length > 1 ? 's' : ''} à envoyer` : 'Aucun commentaire pour l’instant'}</b><div class="hint">${drafts.length ? 'Ils ne sont visibles par l’équipe qu’une fois envoyés.' : 'Vous pouvez aussi valider directement la proposition qui vous plaît.'}</div></div><button class="btn btn--primary" data-act="send" data-id="${o.id}" ${drafts.length ? '' : 'disabled'}>${ic('send', 16)} Envoyer mes retours</button></div></div>` : ''}
      ${sent.length ? `<div class="card" style="margin-top:16px"><div class="card__head"><span class="h2">Retours envoyés</span></div><div class="list">${sent.map((f, i) => `<div class="note is-old"><span class="note__n">${i + 1}</span><div><div>${esc(f.text)}</div><div class="note__who">${esc(deliv(o).find((d) => d[0] === f.k)[1])}</div></div></div>`).join('')}</div></div>` : ''}`;
  }
  function clientBrief() {
    const B = S.brief;
    const steps = [
      ['Votre activité', 'activite', 'Que faites-vous, et depuis quand ?', 'Comme vous le diriez à un nouveau client.'],
      ['Votre cible', 'cible', 'À qui parlez-vous ?', 'Âge, habitudes, ce qui les fait acheter.'],
      ['Votre style', 'style', 'Quelle impression voulez-vous laisser ?', 'Choisissez jusqu’à 3 mots.'],
      ['Vos références', 'refs', 'Ce que vous aimez, et ce que vous ne voulez surtout pas', 'Marques, sites, comptes Instagram…'],
      ['Vos fichiers', 'files', 'Vos fichiers existants', 'Ancien logo, photos, charte : tout ce qui peut aider.'],
    ];
    const st = steps[UI.briefStep];
    const STYLES = ['Chaleureux', 'Artisanal', 'Épuré', 'Audacieux', 'Classique', 'Ludique', 'Luxe', 'Naturel'];
    let field;
    if (st[1] === 'style')
      field = `<div class="options">${STYLES.map((s) => `<button class="option ${B.style.includes(s) ? 'is-on' : ''}" data-act="style" data-s="${s}">${s}</button>`).join('')}</div><div class="field"><span class="label">En quelques mots</span><input class="input" data-model="brief.mots" value="${esc(B.mots)}"></div><div class="field"><span class="label">Couleurs aimées</span><div class="swatches"><i style="background:#b5562e"></i><i style="background:#1c1916"></i><i style="background:#f2ede4"></i><i style="background:#c6a378"></i></div></div>`;
    else if (st[1] === 'files')
      field = `${[['PDF', '#f8e9e5', '#b4442f', 'ancien-logo.pdf', '240 Ko'], ['ZIP', '#e8eef7', '#2d5b9a', 'photos-boutique.zip', '18,4 Mo'], ['PDF', '#f8e9e5', '#b4442f', 'cartes-de-visite-2021.pdf', '1,1 Mo']].map(([e, b, c, n, s]) => `<div class="file"><span class="file__ic" style="background:${b};color:${c}">${e}</span><div class="li__main"><b>${n}</b><div class="hint">${s} · ajouté le 2 oct.</div></div><button class="btn btn--plain btn--sm" data-act="dl" data-f="${n}">${ic('down', 15)}</button></div>`).join('')}<button class="drop" style="margin-top:12px" data-act="upload-brief">${ic('up', 22)}<b>Ajouter des fichiers</b><span class="hint">PNG, JPG, PDF ou ZIP · 50 Mo max.</span></button>`;
    else field = `<textarea class="textarea" data-model="brief.${st[1]}" rows="6">${esc(B[st[1]])}</textarea>`;
    return `<div class="page-head"><div><h1 class="h1">Mon brief</h1><p class="lead">Envoyé le 2 octobre à 10 h 31. C’est la base de tout ce que l’équipe crée pour vous : vous pouvez le compléter à tout moment.</p></div><div class="page-head__actions"><span class="badge b-ok"><i></i>Complet</span></div></div>
      <div class="grid g-side">
        <div class="card" style="padding:8px"><div class="brief-nav">${steps.map((s, i) => `<button class="${i === UI.briefStep ? 'is-on' : ''} is-done" data-act="bstep" data-i="${i}"><span class="tick">${ic('check', 12, 3)}</span>${s[0]}</button>`).join('')}</div></div>
        <div class="card"><div class="card__head"><div class="spacer"><div class="eyebrow">Étape ${UI.briefStep + 1} sur ${steps.length}</div><div class="h2" style="margin-top:4px">${st[2]}</div><div class="hint">${st[3]}</div></div></div>
          <div class="card__body">${field}</div>
          <div class="card__foot"><button class="btn btn--ghost" data-act="bstep" data-i="${Math.max(0, UI.briefStep - 1)}" ${UI.briefStep ? '' : 'disabled'}>${ic('arrowL', 16)} Précédent</button><span class="spacer"></span><button class="btn btn--plain" data-act="briefsave">Enregistrer</button>${UI.briefStep < steps.length - 1 ? `<button class="btn btn--primary" data-act="bstep" data-i="${UI.briefStep + 1}">Suivant ${ic('arrowR', 16, 2)}</button>` : `<button class="btn btn--primary" data-act="briefsave">${ic('check', 16, 2.2)} Mettre à jour le brief</button>`}</div>
        </div>
      </div>`;
  }
  function clientFiles() {
    const done = myOrders().filter((o) => o.status === 'validated');
    const files = (o) => {
      const base = o.pack.split(' ·')[0].replace(/\s+/g, '-');
      if (o.kind === 'logo') return [['SVG', `MaisonCarbone_Logo_${o.chosen}.svg`, '18 Ko'], ['PNG', `MaisonCarbone_Logo_${o.chosen}_4000px.png`, '640 Ko'], ['PDF', 'MaisonCarbone_Charte-graphique.pdf', '4,2 Mo'], ['ZIP', 'MaisonCarbone_Identite-complete.zip', '12,8 Mo']];
      return [['PDF', `MaisonCarbone_${base}_imprimeur.pdf`, '9,6 Mo'], ['PNG', `MaisonCarbone_${base}_aperçus.png`, '2,1 Mo'], ['ZIP', `MaisonCarbone_${base}_sources.zip`, '38 Mo']];
    };
    const colors = { SVG: ['#e8efeb', '#1f4d3f'], PNG: ['#e8eef7', '#2d5b9a'], PDF: ['#f8e9e5', '#b4442f'], ZIP: ['#efede8', '#3c3a36'] };
    return `<div class="page-head"><div><h1 class="h1">Mes fichiers</h1><p class="lead">Les fichiers définitifs de vos commandes validées, dans tous les formats, quand vous voulez.</p></div></div>
      ${done.length ? done.map((o) => `<div class="card" style="margin-bottom:16px"><div class="card__head"><span class="h2">${esc(o.pack)}</span><span class="chip">${o.id}</span><button class="btn btn--ghost btn--sm" data-act="dl" data-f="${o.id}_tout.zip">${ic('down', 15)} Tout télécharger</button></div><div class="card__body grid g-file"><div class="thumb__img" style="border-radius:8px;overflow:hidden;border:1px solid var(--line)">${art(o, o.chosen || 'A', o.version)}</div><div>${files(o).map(([e, n, s]) => `<div class="file"><span class="file__ic" style="background:${colors[e][0]};color:${colors[e][1]}">${e}</span><div class="li__main"><b>${esc(n)}</b><div class="hint">${s}</div></div><button class="btn btn--ghost btn--sm" data-act="dl" data-f="${esc(n)}">${ic('down', 15)} Télécharger</button></div>`).join('')}</div></div></div>`).join('') : '<div class="card empty">Aucun fichier pour le moment.</div>'}`;
  }
  function clientOffers() {
    return `<div class="page-head"><div><h1 class="h1">Commander</h1><p class="lead">Les mêmes équipes, les mêmes délais. Payez en ligne, votre brief est pré-rempli avec ce que nous savons déjà de Maison Carbone.</p></div></div>
      <div class="grid g-2" style="margin-bottom:16px">${S.offers.filter((f) => f.active && f.monthly).map((f) => `<div class="card offer is-hl" style="grid-column:1 / -1"><div class="row" style="align-items:flex-start;flex-wrap:wrap;gap:24px"><div style="flex:1;min-width:240px"><span class="badge b-accent"><i></i>Pour aller plus loin</span><div class="h2" style="font-size:19px;margin-top:12px">${esc(f.name)}</div><p class="muted" style="margin-top:4px">${esc(f.desc)}</p></div><div><div class="offer__price">${eur(f.price)} <small>${esc(f.unit)}</small></div><button class="btn btn--primary btn--lg" style="margin-top:10px" data-act="buy" data-id="${f.id}">S’abonner</button></div></div></div>`).join('')}</div>
      <div class="grid g-4">${S.offers.filter((f) => f.active && !f.monthly).map((f) => `<div class="card offer ${f.hl ? 'is-hl' : ''}">${f.hl ? '<span class="badge b-accent" style="align-self:flex-start"><i></i>Le plus choisi</span>' : `<span class="chip" style="align-self:flex-start">${esc(f.delay)}</span>`}<div class="h2" style="margin-top:12px">${esc(f.name)}</div><p class="hint" style="margin-top:4px">${esc(f.desc)}</p><div class="offer__price">${eur(f.price)} <small>${esc(f.unit)}</small></div><ul>${f.items.map((i) => `<li>${ic('check', 15, 2.2)}<span>${esc(i)}</span></li>`).join('')}</ul><button class="btn ${f.hl ? 'btn--primary' : 'btn--ghost'} btn--block" data-act="buy" data-id="${f.id}">Commander</button></div>`).join('')}</div>`;
  }
  function clientInvoices() {
    return `<div class="page-head"><div><h1 class="h1">Factures</h1><p class="lead">Toutes vos factures, téléchargeables en PDF.</p></div></div>
      <div class="card tablewrap"><table class="table"><thead><tr><th>Facture</th><th>Commande</th><th>Date</th><th>Statut</th><th class="num">Montant</th><th></th></tr></thead><tbody>
      ${S.invoices.map((f) => `<tr data-act="dl" data-f="${f.id}.pdf"><td><b>${f.id}</b></td><td>${esc(f.label)} <span class="muted">· ${f.order}</span></td><td class="muted">${f.date}</td><td><span class="badge b-ok"><i></i>Payée</span></td><td class="num">${eur(f.amount)}</td><td class="num"><span class="btn btn--plain btn--sm">${ic('down', 15)} PDF</span></td></tr>`).join('')}
      </tbody></table></div>`;
  }
  function clientContact() {
    return `<div class="page-head"><div><h1 class="h1">Nous contacter</h1><p class="lead">Une question, une urgence, un ajustement : on vous répond vite.</p></div></div>
      <div class="grid g-main">
        <div class="card"><div class="card__head"><span class="h2">Une demande précise</span></div><div class="card__body">
          <div class="field"><span class="label">Commande concernée</span><select class="input">${myOrders().map((o) => `<option>${o.id} · ${esc(o.pack)}</option>`).join('')}<option>Autre demande</option></select></div>
          <div class="field"><span class="label">Votre message</span><textarea class="textarea" id="contactMsg" placeholder="Décrivez votre demande en quelques lignes…"></textarea></div>
        </div><div class="card__foot"><span class="hint spacer">Réponse sous 24 h ouvrées, par e-mail.</span><button class="btn btn--primary" data-act="contact">${ic('send', 16)} Envoyer</button></div></div>
        <div class="stack">
          <div class="card"><div class="card__body"><div class="row"><span class="file__ic" style="background:#e6f2eb;color:#2f7a52">${ic('phone', 18)}</span><div><b>WhatsApp</b><div class="hint">Le plus rapide · réponse moyenne en 40 min</div></div></div><div class="divider"></div><dl class="kv"><dt>Numéro</dt><dd>06 00 00 00 00</dd><dt>Disponibilité</dt><dd>Lun.–sam., 9 h–19 h</dd></dl><button class="btn btn--primary btn--block" style="margin-top:16px" data-act="whatsapp">${ic('chat', 16)} Ouvrir WhatsApp</button></div></div>
          <div class="card"><div class="card__body row">${ic('mail', 18)}<div><b>bonjour@atelier-meridien.fr</b><div class="hint">Pour les devis et la facturation</div></div></div></div>
        </div>
      </div>`;
  }

  /* ——— ÉQUIPE ——— */
  const COLS = ['brief', 'production', 'revision', 'control', 'review'];
  function teamBoard(all) {
    const list = S.orders.filter((o) => o.status !== 'validated' && (all || o.designer === ME));
    const mine = S.orders.filter((o) => o.designer === ME);
    return `<div class="page-head"><div><h1 class="h1">${all ? 'Toute l’équipe' : `Bonjour <span class="serif">Léa</span>`}</h1><p class="lead">${all ? 'Tous les projets en cours, de la commande à la validation du client.' : 'Vos projets de la semaine. Les échéances tiennent compte de la promesse faite au client.'}</p></div><div class="page-head__actions"><div class="tabs"><button class="${!all ? 'is-on' : ''}" data-go="#/equipe/projets">Mes projets</button><button class="${all ? 'is-on' : ''}" data-go="#/equipe/tous">Toute l’équipe</button></div></div></div>
      ${!all ? `<div class="grid g-4" style="margin-bottom:16px">${[
        ['À livrer aujourd’hui', mine.filter((o) => ['production', 'revision'].includes(o.status)).length, 'avant 18 h'],
        ['Chez le client', mine.filter((o) => o.status === 'review').length, 'en attente de retours'],
        ['Livrés à l’heure', '96 %', 'sur 30 jours'],
        ['Révisions moyennes', '0,8', 'par commande'],
      ].map(([l, v, s]) => `<div class="card kpi"><div class="kpi__label">${l}</div><div class="kpi__value">${v}</div><div class="kpi__delta">${s}</div></div>`).join('')}</div>` : ''}
      <div class="board">${COLS.map((c) => {
        const items = list.filter((o) => o.status === c);
        return `<div class="col"><div class="col__h"><span class="badge ${ST[c].c}"><i></i>${ST[c].col}</span><span class="chip">${items.length}</span></div>${
          items.map((o) => `<button class="task" data-go="#/equipe/projet/${o.id}"><div class="row"><span class="chip">${o.id}</span>${o.late ? '<span class="badge b-bad"><i></i>En retard</span>' : ''}</div><div class="task__t">${esc(CLIENTS[o.client].name)}</div><div class="task__s">${esc(o.pack)}</div><div class="task__foot">${ic('clock', 14)}<span class="${o.late ? 'down' : 'muted'}">${esc(o.due)}</span><span class="spacer"></span>${av(TEAM[o.designer], 'av--sm')}</div></button>`).join('') || '<div class="hint" style="padding:8px 6px">Rien ici.</div>'
        }</div>`;
      }).join('')}</div>`;
  }
  function project(id, r) {
    const o = order(id);
    if (!o) return r.role === 'admin' ? adminProjects() : teamBoard(false);
    const c = CLIENTS[o.client];
    const up = S.uploads[o.id];
    const latest = o.feedback.filter((f) => f.version === o.version);
    const nextV = o.status === 'revision' ? o.version + 1 : o.version;
    let action = '';
    if (o.status === 'brief') action = `<div class="callout is-info">${ic('doc', 18)}<div class="spacer"><b>Nouveau brief</b><div class="hint">Lisez le brief, puis démarrez : le client voit que son projet a commencé.</div></div><button class="btn btn--primary" data-act="start" data-id="${o.id}">Démarrer la création</button></div>`;
    else if (['production', 'revision'].includes(o.status)) {
      action = up
        ? `<div>${up.map((f) => `<div class="file"><span class="file__ic" style="background:#e8efeb;color:#1f4d3f">SVG</span><div class="li__main"><b>${esc(f.n)}</b><div class="bar" style="margin-top:6px"><i style="width:${f.p}%"></i></div></div><span class="hint nowrap">${f.p < 100 ? `${f.p} %` : 'Prêt'}</span></div>`).join('')}<div class="row" style="margin-top:14px"><span class="hint spacer">Claire relit chaque livraison avant l’envoi au client.</span><button class="btn btn--primary" data-act="tocontrol" data-id="${o.id}" ${up.every((f) => f.p >= 100) ? '' : 'disabled'}>${ic('send', 16)} Envoyer au contrôle qualité</button></div></div>`
        : `<button class="drop" data-act="upload" data-id="${o.id}">${ic('up', 24)}<b>Déposer la version ${nextV}</b><span class="hint">${deliv(o).length} fichiers attendus · SVG, PNG ou PDF</span></button>`;
    } else if (o.status === 'control') action = `<div class="callout is-warn">${ic('shield', 18)}<div class="spacer"><b>Version ${o.pendingVersion} en contrôle qualité</b><div class="hint">Claire la relit avant de l’envoyer au client.</div></div>${r.role === 'admin' ? `<button class="btn btn--ghost" data-act="return" data-id="${o.id}">Renvoyer au designer</button><button class="btn btn--primary" data-act="approve" data-id="${o.id}">${ic('check', 16, 2.2)} Envoyer au client</button>` : ''}</div>`;
    else if (o.status === 'review') action = `<div class="callout">${ic('eye', 18)}<div><b>Chez le client depuis le ${esc(o.delivered || 'aujourd’hui')}</b><div class="hint">Vous serez prévenu dès qu’il envoie ses retours ou qu’il valide.</div></div></div>`;
    else action = `<div class="callout">${ic('check', 18)}<div><b>Validée par le client</b><div class="hint">${o.chosen ? `Proposition ${o.chosen} retenue. ` : ''}Les fichiers définitifs sont dans son espace.</div></div></div>`;
    const viewV = o.status === 'control' ? o.pendingVersion : o.version;
    const showThumbs = o.status !== 'brief' && !(o.status === 'production' && !o.delivered && o.status !== 'control');
    return `<div class="page-head"><div><div class="eyebrow">${o.id} · ${esc(c.name)}</div><h1 class="h1" style="margin-top:6px">${esc(o.pack)}</h1></div><div class="page-head__actions">${badge(o)}${r.role === 'admin' ? `<select class="select" data-act-change="assign" data-id="${o.id}">${Object.entries(TEAM).map(([k, p]) => `<option value="${k}" ${k === o.designer ? 'selected' : ''}>${esc(p.name)}</option>`).join('')}</select>` : ''}</div></div>
      <div class="grid g-main">
        <div class="stack">
          <div class="card"><div class="card__head"><span class="h2">À faire</span><span class="muted" style="font-size:12.5px">${ic('clock', 14)}</span><span class="${o.late ? 'down' : 'muted'}" style="font-size:12.5px">Échéance ${esc(o.due)}</span></div><div class="card__body">${action}</div></div>
          ${showThumbs ? `<div class="card"><div class="card__head"><span class="h2">Livrables</span><span class="chip">Version ${viewV}</span></div><div class="card__body">${thumbs(o, viewV, (k) => `data-act="open" data-id="${o.id}" data-k="${k}" data-v="${viewV}"`, { chosen: o.chosen })}</div></div>` : ''}
          ${latest.length ? `<div class="card"><div class="card__head"><span class="h2">Retours du client · version ${o.version}</span><span class="badge b-bad"><i></i>${latest.length}</span></div><div class="list">${latest.map((f, i) => `<button class="note" style="width:100%;text-align:left" data-act="open" data-id="${o.id}" data-k="${f.k}" data-v="${o.version}"><span class="note__n">${i + 1}</span><div class="spacer"><div>${esc(f.text)}</div><div class="note__who">${esc(c.who)} · ${esc(deliv(o).find((d) => d[0] === f.k)[1])}</div></div>${ic('arrowR', 16)}</button>`).join('')}</div></div>` : ''}
        </div>
        <div class="stack">
          <div class="card"><div class="card__head"><span class="h2">Client</span></div><div class="card__body"><div class="row" style="margin-bottom:14px">${av({ name: c.name, c: c.c }, 'av--lg')}<div><b>${esc(c.name)}</b><div class="hint">${esc(c.sector)} · ${esc(c.city)}</div></div></div><dl class="kv"><dt>Contact</dt><dd>${esc(c.who)}</dd><dt>Formule</dt><dd>${esc(c.plan)}</dd><dt>Révisions</dt><dd>${o.revUsed} sur ${o.revMax}</dd><dt>Designer</dt><dd>${esc(TEAM[o.designer].name)}</dd></dl></div></div>
          <div class="card"><div class="card__head"><span class="h2">Brief</span><span class="badge b-ok"><i></i>Complet</span></div><div class="card__body" style="font-size:13.5px">${
            o.client === 'mc'
              ? `<p><b>Activité.</b> ${esc(S.brief.activite)}</p><p style="margin-top:8px"><b>Style.</b> ${esc(S.brief.style.join(', '))}. ${esc(S.brief.mots)}</p><p style="margin-top:8px"><b>À éviter.</b> Le « vintage » trop vu.</p>`
              : `<p><b>Activité.</b> ${esc(c.sector)} à ${esc(c.city)}.</p><p style="margin-top:8px"><b>Demande.</b> ${esc(o.pack)}, dans la continuité de l’identité actuelle.</p>`
          }<div class="divider"></div><div class="file"><span class="file__ic" style="background:#f8e9e5;color:#b4442f">PDF</span><div class="li__main"><b>Brief complet</b><div class="hint">Envoyé le ${esc(o.created)}</div></div><button class="btn btn--plain btn--sm" data-act="dl" data-f="${o.id}_brief.pdf">${ic('down', 15)}</button></div></div></div>
        </div>
      </div>`;
  }
  function teamGuide() {
    const items = ['Relire le brief en entier et noter les mots du client', 'Livrer chaque proposition sur fond clair, sombre et kraft', 'Nommer les fichiers : Client_Livrable_Vx', 'Vérifier les fonds perdus et les gabarits imprimeur', 'Exporter SVG, PNG 4000 px et PDF', 'Répondre à chaque commentaire du client dans la version suivante'];
    return `<div class="page-head"><div><h1 class="h1">Charte de production</h1><p class="lead">La check-list commune avant chaque envoi au contrôle qualité.</p></div></div>
      <div class="card"><div class="list">${items.map((t, i) => `<button class="li" style="width:100%;text-align:left" data-act="check" data-i="${i}"><span class="tick" style="width:22px;height:22px;border-radius:6px;display:grid;place-items:center;border:1.5px solid ${S.checklist[i] ? 'var(--accent)' : 'var(--line)'};background:${S.checklist[i] ? 'var(--accent)' : 'var(--surface)'};color:#fff">${S.checklist[i] ? ic('check', 13, 3) : ''}</span><span class="li__main" style="${S.checklist[i] ? 'color:var(--muted);text-decoration:line-through' : ''}">${t}</span></button>`).join('')}</div></div>`;
  }

  /* ——— ADMIN ——— */
  function revenueChart() {
    const data = [['mai', 14.2], ['juin', 16.8], ['juil.', 15.1], ['août', 11.9], ['sept.', 21.4], ['oct.', 24.9]];
    const max = 28;
    const W = 640;
    const H = 220;
    const bw = 56;
    const gap = (W - 60 - data.length * bw) / (data.length - 1);
    return `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Chiffre d’affaires par mois">${[0, 7, 14, 21, 28].map((v) => `<line x1="40" x2="${W}" y1="${H - 30 - (v / max) * (H - 50)}" y2="${H - 30 - (v / max) * (H - 50)}" stroke="#efede8"/><text x="32" y="${H - 26 - (v / max) * (H - 50)}" text-anchor="end" font-size="11" fill="#9b978f">${v} k€</text>`).join('')}${data
      .map(([m, v], i) => {
        const x = 60 + i * (bw + gap);
        const h = (v / max) * (H - 50);
        const last = i === data.length - 1;
        return `<rect x="${x}" y="${H - 30 - h}" width="${bw}" height="${h}" rx="6" fill="${last ? '#1f4d3f' : '#cfdcd5'}"/><text x="${x + bw / 2}" y="${H - 10}" text-anchor="middle" font-size="12" fill="#6e6b65">${m}</text><text x="${x + bw / 2}" y="${H - 38 - h}" text-anchor="middle" font-size="12" font-weight="600" fill="${last ? '#1f4d3f' : '#6e6b65'}">${v.toLocaleString('fr-FR')}</text>`;
      })
      .join('')}</svg>`;
  }
  function adminHome() {
    const q = S.orders.filter((o) => o.status === 'control');
    const late = S.orders.filter((o) => o.late && o.status !== 'validated');
    const active = S.orders.filter((o) => o.status !== 'validated');
    return `<div class="page-head"><div><div class="eyebrow">Semaine du 5 au 11 octobre</div><h1 class="h1" style="margin-top:6px">Pilotage</h1></div><div class="page-head__actions"><div class="tabs"><button class="is-on" data-act="noop">7 jours</button><button data-act="noop">30 jours</button><button data-act="noop">Année</button></div></div></div>
      <div class="grid g-4">${[
        ['Commandes en octobre', '38', '<span class="up">+12 %</span> vs septembre'],
        ['Chiffre d’affaires', '24 860 €', '<span class="up">+16 %</span> · objectif 33 600 €'],
        ['Délai moyen de livraison', '41 h', 'promesse : 48 h'],
        ['Revenu mensuel récurrent', '6 490 €', '11 abonnés · <span class="up">+2</span>'],
      ].map(([l, v, s]) => `<div class="card kpi"><div class="kpi__label">${l}</div><div class="kpi__value">${v}</div><div class="kpi__delta">${s}</div></div>`).join('')}</div>
      <div class="grid g-main" style="margin-top:16px">
        <div class="stack">
          <div class="card"><div class="card__head"><span class="h2">Chiffre d’affaires</span><div class="legend"><span><i style="background:#cfdcd5"></i>Mois passés</span><span><i style="background:#1f4d3f"></i>Octobre (en cours)</span></div></div><div class="card__body">${revenueChart()}</div></div>
          <div class="card"><div class="card__head"><span class="h2">Projets en cours</span><span class="chip">${active.length}</span><button class="btn btn--plain btn--sm" data-go="#/admin/projets">Tout voir ${ic('arrowR', 14)}</button></div><div class="tablewrap"><table class="table"><thead><tr><th>Projet</th><th>Client</th><th>Étape</th><th>Designer</th><th>Échéance</th></tr></thead><tbody>${active.slice(0, 7).map((o) => `<tr data-go="#/admin/projet/${o.id}"><td><b>${o.id}</b><div class="hint nowrap">${esc(o.pack)}</div></td><td class="nowrap">${esc(CLIENTS[o.client].name)}</td><td>${badge(o)}</td><td>${av(TEAM[o.designer], 'av--sm')}</td><td class="${o.late ? 'down' : 'muted'} nowrap">${esc(o.due)}</td></tr>`).join('')}</tbody></table></div></div>
        </div>
        <div class="stack">
          <div class="card"><div class="card__head"><span class="h2">À traiter par vous</span><span class="badge ${q.length + late.length ? 'b-warn' : 'b-ok'}"><i></i>${q.length + late.length}</span></div><div class="list">${
            q.map((o) => `<div class="li"><span class="file__ic" style="background:#fbf2e1;color:#a8701a">${ic('shield', 17)}</span><div class="li__main"><div class="li__t">${o.id} à contrôler</div><div class="li__s">${esc(CLIENTS[o.client].name)} · ${esc(TEAM[o.designer].name)}</div></div><button class="btn btn--ghost btn--sm" data-act="open" data-id="${o.id}" data-k="A" data-v="${o.pendingVersion}">Contrôler</button></div>`).join('') +
            late.map((o) => `<div class="li"><span class="file__ic" style="background:#f8e9e5;color:#b4442f">${ic('clock', 17)}</span><div class="li__main"><div class="li__t">${o.id} en retard</div><div class="li__s">${esc(CLIENTS[o.client].name)} · échéance ${esc(o.due)}</div></div><button class="btn btn--ghost btn--sm" data-go="#/admin/projet/${o.id}">Débloquer</button></div>`).join('') || '<div class="empty">Tout est à jour.</div>'
          }</div></div>
          <div class="card"><div class="card__head"><span class="h2">Charge de l’équipe</span></div><div class="card__body">${Object.entries(TEAM).map(([k, p]) => {
            const n = S.orders.filter((o) => o.designer === k && o.status !== 'validated').length;
            return `<div class="meter"><div class="row">${av(p, 'av--sm')}<span class="nowrap">${p.name.split(' ')[0]}</span></div><div class="bar"><i style="width:${Math.min(100, n * 22)}%;${n >= 4 ? 'background:var(--warn)' : ''}"></i></div><span class="muted" style="text-align:right">${n} proj.</span></div>`;
          }).join('')}</div></div>
          <div class="card"><div class="card__head"><span class="h2">Motifs de révision</span><span class="muted" style="font-size:12.5px">30 jours</span></div><div class="card__body">${[['Texte et orthographe', 38], ['Couleurs', 24], ['Taille du logo', 19], ['Mise en page', 12], ['Autre', 7]].map(([l, v]) => `<div class="meter" style="grid-template-columns:140px minmax(0,1fr) 40px"><span>${l}</span><div class="bar"><i style="width:${v * 2.4}%;background:#7d9c8e"></i></div><span class="muted" style="text-align:right">${v} %</span></div>`).join('')}</div></div>
        </div>
      </div>`;
  }
  function adminControl() {
    const q = S.orders.filter((o) => o.status === 'control');
    return `<div class="page-head"><div><h1 class="h1">Contrôle qualité</h1><p class="lead">Chaque livraison passe par ici avant d’arriver chez le client. Ouvrez-la, vérifiez, puis envoyez-la ou renvoyez-la au designer.</p></div></div>
      ${q.length ? q.map((o) => `<div class="card" style="margin-bottom:16px"><div class="card__head"><span class="h2">${o.id} · ${esc(CLIENTS[o.client].name)}</span><span class="chip">Version ${o.pendingVersion}</span><span class="muted" style="font-size:12.5px">par ${esc(TEAM[o.designer].name)}</span></div><div class="card__body">${thumbs(o, o.pendingVersion, (k) => `data-act="open" data-id="${o.id}" data-k="${k}" data-v="${o.pendingVersion}"`, { noPins: true })}</div><div class="card__foot"><span class="hint spacer">${esc(o.pack)} · échéance ${esc(o.due)}</span><button class="btn btn--ghost" data-act="return" data-id="${o.id}">Renvoyer au designer</button><button class="btn btn--primary" data-act="approve" data-id="${o.id}">${ic('check', 16, 2.2)} Envoyer au client</button></div></div>`).join('') : `<div class="card empty">${ic('shield', 28, 1.4)}<b style="color:var(--ink)">Rien à contrôler</b><span>Les prochaines livraisons apparaîtront ici.</span></div>`}`;
  }
  function adminProjects() {
    const tabs = [['all', 'Tous'], ['active', 'En cours'], ['control', 'À contrôler'], ['review', 'Chez le client'], ['validated', 'Terminés']];
    const f = UI.ptab;
    const list = S.orders.filter((o) => f === 'all' || (f === 'active' ? inProgress(o) : o.status === f));
    return `<div class="page-head"><div><h1 class="h1">Projets</h1><p class="lead">${S.orders.length} projets · ${S.orders.filter(inProgress).length} en cours · ${S.orders.filter((o) => o.late && o.status !== 'validated').length} en retard</p></div><div class="page-head__actions"><div class="tabs">${tabs.map(([k, t]) => `<button class="${f === k ? 'is-on' : ''}" data-act="ptab" data-k="${k}">${t}</button>`).join('')}</div></div></div>
      <div class="card tablewrap"><table class="table"><thead><tr><th>Projet</th><th>Client</th><th>Étape</th><th>Designer</th><th>Échéance</th><th class="num">Montant</th></tr></thead><tbody>
      ${list.map((o) => `<tr data-go="#/admin/projet/${o.id}"><td><b>${o.id}</b><div class="hint">${esc(o.pack)}</div></td><td>${esc(CLIENTS[o.client].name)}</td><td>${badge(o)}</td><td><select class="select" data-act-change="assign" data-id="${o.id}">${Object.entries(TEAM).map(([k, p]) => `<option value="${k}" ${k === o.designer ? 'selected' : ''}>${esc(p.name)}</option>`).join('')}</select></td><td class="${o.late && o.status !== 'validated' ? 'down' : 'muted'} nowrap">${esc(o.status === 'validated' ? o.delivered : o.due)}</td><td class="num">${eur(o.price)}</td></tr>`).join('') || '<tr><td colspan="6"><div class="empty">Aucun projet.</div></td></tr>'}
      </tbody></table></div>`;
  }
  function adminClients() {
    const rows = Object.entries(CLIENTS).map(([k, c]) => {
      const os = S.orders.filter((o) => o.client === k);
      return { k, c, n: os.length, total: os.reduce((s, o) => s + o.price, 0) + (c.plan === 'Studio mensuel' ? 1770 : 0) };
    });
    return `<div class="page-head"><div><h1 class="h1">Clients</h1><p class="lead">${rows.length} clients · ${rows.filter((r) => r.c.plan === 'Studio mensuel').length} abonnés au Studio mensuel</p></div><div class="page-head__actions"><button class="btn btn--ghost" data-act="export">${ic('down', 16)} Exporter</button><button class="btn btn--primary" data-act="newclient">${ic('plus', 16, 2)} Ajouter un client</button></div></div>
      <div class="card tablewrap"><table class="table"><thead><tr><th>Client</th><th>Contact</th><th>Formule</th><th class="num">Commandes</th><th class="num">Total dépensé</th><th>Client depuis</th></tr></thead><tbody>
      ${rows.sort((a, b) => b.total - a.total).map((r) => `<tr data-act="client" data-k="${r.k}"><td><div class="row">${av({ name: r.c.name, c: r.c.c }, 'av--sm')}<div><b>${esc(r.c.name)}</b><div class="hint">${esc(r.c.sector)} · ${esc(r.c.city)}</div></div></div></td><td>${esc(r.c.who)}<div class="hint">${esc(r.c.mail)}</div></td><td>${r.c.plan === 'Studio mensuel' ? '<span class="badge b-accent"><i></i>Studio mensuel</span>' : '<span class="chip">Ponctuel</span>'}</td><td class="num">${r.n}</td><td class="num"><b>${eur(r.total)}</b></td><td class="muted">${esc(r.c.since)}</td></tr>`).join('')}
      </tbody></table></div>`;
  }
  function adminTeam() {
    return `<div class="page-head"><div><h1 class="h1">Équipe</h1><p class="lead">Les designers qui produisent et livrent les projets.</p></div><div class="page-head__actions"><button class="btn btn--primary" data-act="invite">${ic('plus', 16, 2)} Inviter un membre</button></div></div>
      <div class="grid g-3">${Object.entries(TEAM).map(([k, p], i) => {
        const os = S.orders.filter((o) => o.designer === k);
        const cur = os.filter((o) => o.status !== 'validated').length;
        return `<div class="card"><div class="card__body"><div class="row">${av(p, 'av--lg')}<div><b>${esc(p.name)}</b><div class="hint">${esc(p.role)}</div></div><span class="spacer"></span><span class="badge b-ok"><i></i>Actif</span></div><div class="divider"></div><div class="grid g-3" style="gap:8px;text-align:center">${[[cur, 'en cours'], [[96, 92, 100][i] + ' %', 'à l’heure'], [['0,7', '1,1', '0,6'][i], 'révisions']].map(([v, l]) => `<div><div style="font-size:20px;font-weight:600">${v}</div><div class="hint">${l}</div></div>`).join('')}</div><div class="divider"></div><div class="hint" style="margin-bottom:8px">Projets en cours</div>${os.filter((o) => o.status !== 'validated').map((o) => `<button class="li" style="width:100%;text-align:left;padding:8px 0" data-go="#/admin/projet/${o.id}"><span class="chip">${o.id}</span><span class="li__main li__s">${esc(CLIENTS[o.client].name)}</span>${badge(o)}</button>`).join('') || '<div class="hint">Aucun.</div>'}</div></div>`;
      }).join('')}</div>`;
  }
  function adminOffers() {
    return `<div class="page-head"><div><h1 class="h1">Offres</h1><p class="lead">Ce que les clients voient dans « Commander ». Modifiez un prix ou masquez une offre : l’espace client se met à jour tout de suite.</p></div></div>
      <div class="card"><div class="list">${S.offers.map((f, i) => `<div class="li" style="flex-wrap:wrap"><div class="li__main" style="min-width:220px"><div class="li__t">${esc(f.name)} ${f.monthly ? '<span class="badge b-accent" style="margin-left:6px"><i></i>Abonnement</span>' : ''}</div><div class="li__s">${esc(f.desc)}</div></div><div class="row"><input class="input" style="width:110px;text-align:right" type="number" value="${f.price}" data-act-change="price" data-i="${i}"><span class="muted nowrap">€ ${esc(f.unit)}</span></div><button class="btn ${f.active ? 'btn--ghost' : 'btn--primary'} btn--sm" data-act="toggleoffer" data-i="${i}">${f.active ? 'Masquer' : 'Afficher'}</button></div>`).join('')}</div></div>`;
  }

  /* ——— the viewer (one deliverable, full size, with its comments) ——— */
  function viewer(r) {
    const V = UI.viewer;
    const o = order(V.id);
    const list = deliv(o);
    const name = list.find((d) => d[0] === V.k)[1];
    const clientMode = r.role === 'client' && o.status === 'review';
    const drafts = (S.drafts[o.id] || []).map((d, i) => ({ ...d, i })).filter((d) => d.k === V.k);
    const old = o.feedback.filter((f) => f.k === V.k && f.version === V.v);
    const prev = o.feedback.filter((f) => f.k === V.k && f.version < V.v);
    const bgs = o.kind === 'logo' ? `<div class="tabs">${[['light', 'Fond clair'], ['dark', 'Fond sombre'], ['kraft', 'Kraft']].map(([k, t]) => `<button class="${V.bg === k ? 'is-on' : ''}" data-act="bg" data-bg="${k}">${t}</button>`).join('')}</div>` : '';
    const idx = list.findIndex((d) => d[0] === V.k);
    const adminCtl = r.role === 'admin' && o.status === 'control';
    return `<div class="viewer" role="dialog" aria-label="${esc(name)}">
      <div class="viewer__stage">
        <div class="viewer__bar"><button class="btn btn--ghost btn--sm" data-act="close">${ic('arrowL', 15)} Retour</button><b style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(name)}</b><span class="chip" style="background:#3a3834;color:#e9e6df">V${V.v}</span><span class="spacer"></span>${bgs}<button class="btn btn--ghost btn--sm" data-act="nav" data-d="-1" ${idx > 0 ? '' : 'disabled'} aria-label="Précédent">${ic('arrowL', 15)}</button><button class="btn btn--ghost btn--sm" data-act="nav" data-d="1" ${idx < list.length - 1 ? '' : 'disabled'} aria-label="Suivant">${ic('arrowR', 15)}</button></div>
        <div class="viewer__canvas"><div class="art ${clientMode ? '' : 'is-readonly'}" data-pin="${clientMode ? 1 : 0}">${art(o, V.k, V.v, V.bg)}${old.map((f, i) => `<span class="pin is-old" style="left:${f.x * 100}%;top:${f.y * 100}%"><span>${i + 1}</span></span>`).join('')}${drafts.map((d, j) => `<span class="pin is-draft ${UI.focusDraft && j === drafts.length - 1 ? 'is-new' : ''}" style="left:${d.x * 100}%;top:${d.y * 100}%"><span>${old.length + j + 1}</span></span>`).join('')}</div></div>
      </div>
      <aside class="viewer__side">
        <div class="card__head"><span class="h2">${clientMode ? 'Vos commentaires' : adminCtl ? 'Contrôle qualité' : 'Commentaires'}</span><span class="chip">${old.length + drafts.length}</span></div>
        <div class="viewer__list">
          ${clientMode && !drafts.length && !old.length ? `<div class="empty">${ic('msg', 26, 1.4)}<b style="color:var(--ink)">Cliquez sur le visuel</b><span>pour placer un commentaire à l’endroit exact.</span></div>` : ''}
          ${old.map((f, i) => `<div class="note is-old"><span class="note__n">${i + 1}</span><div><div>${esc(f.text)}</div><div class="note__who">${esc(CLIENTS[o.client].who)} · envoyé</div></div></div>`).join('')}
          ${drafts.map((d, j) => `<div class="note"><span class="note__n">${old.length + j + 1}</span><div class="spacer"><textarea data-draft="${d.i}" placeholder="Que voulez-vous changer ici ?">${esc(d.text)}</textarea><button class="btn btn--plain btn--sm" style="margin-top:4px" data-act="deldraft" data-i="${d.i}">${ic('trash', 14)} Supprimer</button></div></div>`).join('')}
          ${prev.length ? `<div class="note" style="color:var(--muted);font-size:12.5px">${ic('check', 15)}<div>${prev.length} retour${prev.length > 1 ? 's' : ''} de la version précédente, pris en compte dans cette version.</div></div>` : ''}
          ${adminCtl ? `<div style="padding:12px 18px">${['Fichiers nommés et complets', 'Retours du client tous traités', 'Formats d’export vérifiés'].map((t) => `<label class="row" style="padding:6px 0"><input type="checkbox" checked> ${t}</label>`).join('')}</div>` : ''}
        </div>
        <div class="viewer__foot">${
          clientMode
            ? `<button class="btn btn--primary btn--block" data-act="send" data-id="${o.id}" ${(S.drafts[o.id] || []).length ? '' : 'disabled'}>${ic('send', 16)} Envoyer mes retours (${(S.drafts[o.id] || []).length})</button><button class="btn btn--ghost btn--block" data-act="choose" data-id="${o.id}" data-k="${V.k}">${ic('star', 16)} Choisir cette proposition et valider</button>`
            : adminCtl
              ? `<button class="btn btn--primary btn--block" data-act="approve" data-id="${o.id}">${ic('check', 16, 2.2)} Envoyer au client</button><button class="btn btn--ghost btn--block" data-act="return" data-id="${o.id}">Renvoyer au designer</button>`
              : `<button class="btn btn--ghost btn--block" data-act="dl" data-f="${o.id}_${V.k}_V${V.v}.svg">${ic('down', 16)} Télécharger ce fichier</button>`
        }</div>
      </aside>
    </div>`;
  }

  /* ——— modals ——— */
  function modal() {
    const M = UI.modal;
    if (M.type === 'buy') {
      const f = S.offers.find((x) => x.id === M.id);
      if (M.step === 'done')
        return `<div class="modal-back ${UI.modalSeen ? 'is-static' : ''}" data-act="mclose"><div class="modal" data-stop><div class="modal__body" style="text-align:center;padding:36px 28px"><div style="width:52px;height:52px;border-radius:50%;background:var(--ok-soft);color:var(--ok);display:grid;place-items:center;margin:0 auto 14px">${ic('check', 26, 2.4)}</div><div class="h2" style="font-size:19px">Merci, votre commande est confirmée</div><p class="muted" style="margin:8px auto 22px;max-width:40ch">${esc(f.name)} · ${M.ref}. Votre brief est pré-rempli : il ne reste qu’à le vérifier pour que l’équipe démarre.</p><div class="row" style="justify-content:center"><button class="btn btn--ghost" data-act="mclose">Plus tard</button><button class="btn btn--primary" data-act="tobrief">Vérifier mon brief ${ic('arrowR', 16, 2)}</button></div></div></div></div>`;
      return `<div class="modal-back ${UI.modalSeen ? 'is-static' : ''}" data-act="mclose"><div class="modal" data-stop><div class="modal__head"><span class="h2">${esc(f.name)}</span><button class="iconbtn" data-act="mclose" aria-label="Fermer">${ic('x', 16)}</button></div><div class="modal__body"><p class="muted" style="margin-bottom:16px">${esc(f.desc)}</p><div class="pay"><div class="pay__row"><span>${esc(f.name)}</span><span>${eur(f.price)} ${esc(f.unit)}</span></div><div class="pay__row muted"><span>Délai</span><span>${esc(f.delay)}</span></div><div class="pay__total"><span>Total</span><span>${eur(f.price)}${f.monthly ? ' / mois' : ''}</span></div></div><div class="callout" style="margin-top:14px">${ic('lock', 18)}<div><b>Paiement sécurisé</b><div class="hint">Dans le portail réel, vous êtes redirigé vers la page de paiement de la banque. Ici, le paiement est simulé.</div></div></div></div><div class="modal__foot"><button class="btn btn--ghost" data-act="mclose">Annuler</button><button class="btn btn--primary" data-act="pay" ${M.step === 'paying' ? 'disabled' : ''}>${M.step === 'paying' ? 'Paiement en cours…' : `${ic('lock', 15)} Payer ${eur(f.price)}`}</button></div></div></div>`;
    }
    if (M.type === 'choose') {
      const o = order(M.id);
      const name = deliv(o).find((d) => d[0] === M.k)[1];
      return `<div class="modal-back ${UI.modalSeen ? 'is-static' : ''}" data-act="mclose"><div class="modal" data-stop><div class="modal__head"><span class="h2">Valider « ${esc(name)} » ?</span><button class="iconbtn" data-act="mclose" aria-label="Fermer">${ic('x', 16)}</button></div><div class="modal__body"><div style="border-radius:8px;overflow:hidden;border:1px solid var(--line)">${art(o, M.k, o.version)}</div><p class="muted" style="margin-top:14px">L’équipe prépare vos fichiers définitifs (SVG, PNG, PDF) et votre charte graphique. Vous les retrouverez dans « Mes fichiers ».</p></div><div class="modal__foot"><button class="btn btn--ghost" data-act="mclose">Pas encore</button><button class="btn btn--primary" data-act="validate">${ic('check', 16, 2.2)} Valider cette proposition</button></div></div></div>`;
    }
    if (M.type === 'client') {
      const c = CLIENTS[M.k];
      const os = S.orders.filter((o) => o.client === M.k);
      return `<div class="modal-back ${UI.modalSeen ? 'is-static' : ''}" data-act="mclose"><div class="modal" data-stop><div class="modal__head">${av({ name: c.name, c: c.c })}<span class="h2">${esc(c.name)}</span><button class="iconbtn" data-act="mclose" aria-label="Fermer">${ic('x', 16)}</button></div><div class="modal__body"><dl class="kv"><dt>Contact</dt><dd>${esc(c.who)}</dd><dt>E-mail</dt><dd>${esc(c.mail)}</dd><dt>Activité</dt><dd>${esc(c.sector)} · ${esc(c.city)}</dd><dt>Formule</dt><dd>${esc(c.plan)}</dd><dt>Client depuis</dt><dd>${esc(c.since)}</dd></dl><div class="divider"></div><div class="list">${os.map((o) => `<button class="li" style="width:100%;text-align:left;padding:10px 0" data-go="#/admin/projet/${o.id}"><span class="chip">${o.id}</span><span class="li__main">${esc(o.pack)}</span>${badge(o)}</button>`).join('')}</div></div><div class="modal__foot"><button class="btn btn--ghost" data-act="toast" data-m="Lien de connexion renvoyé à ${esc(c.mail)}">${ic('mail', 15)} Renvoyer le lien d’accès</button><button class="btn btn--primary" data-act="mclose">Fermer</button></div></div></div>`;
    }
    if (M.type === 'invite' || M.type === 'newclient') {
      const t = M.type === 'invite';
      return `<div class="modal-back ${UI.modalSeen ? 'is-static' : ''}" data-act="mclose"><div class="modal" data-stop><div class="modal__head"><span class="h2">${t ? 'Inviter un membre' : 'Ajouter un client'}</span><button class="iconbtn" data-act="mclose" aria-label="Fermer">${ic('x', 16)}</button></div><div class="modal__body"><div class="field"><span class="label">${t ? 'Nom' : 'Entreprise'}</span><input class="input" placeholder="${t ? 'Prénom Nom' : 'Nom de l’entreprise'}"></div><div class="field"><span class="label">E-mail</span><input class="input" placeholder="nom@exemple.fr"></div>${t ? '<div class="field"><span class="label">Rôle</span><select class="input"><option>Designer</option><option>Admin</option></select></div>' : '<div class="field"><span class="label">Formule</span><select class="input"><option>Ponctuel</option><option>Studio mensuel</option></select></div>'}<p class="hint" style="margin-top:14px">${t ? 'Un lien de connexion lui est envoyé par e-mail : pas de mot de passe à retenir.' : 'Le client reçoit un lien vers son espace : pas de compte à créer, pas de mot de passe.'}</p></div><div class="modal__foot"><button class="btn btn--ghost" data-act="mclose">Annuler</button><button class="btn btn--primary" data-act="toast" data-m="${t ? 'Invitation envoyée' : 'Client ajouté, lien d’accès envoyé'}" data-close="1">${t ? 'Envoyer l’invitation' : 'Ajouter le client'}</button></div></div></div>`;
    }
    return '';
  }

  /* ——— render ——— */
  function render() {
    const r = route();
    const titles = {
      client: { accueil: 'Accueil', commandes: 'Mes commandes', commande: 'Mes commandes', review: 'Mes commandes', brief: 'Mon brief', fichiers: 'Mes fichiers', commander: 'Commander', factures: 'Factures', contact: 'Nous contacter' },
      equipe: { projets: 'Mes projets', tous: 'Toute l’équipe', projet: 'Projets', charte: 'Charte de production' },
      admin: { pilotage: 'Pilotage', controle: 'Contrôle qualité', projets: 'Projets', projet: 'Projets', clients: 'Clients', equipe: 'Équipe', offres: 'Offres' },
    };
    const section = titles[r.role][r.page] || '';
    const crumbs = r.id ? `<span>${section}</span>${ic('arrowR', 13)}<b>${esc(r.id)}${r.page === 'review' ? ' · propositions' : ''}</b>` : `<b>${section}</b>`;
    let body = '';
    if (r.role === 'client') body = { accueil: clientHome, commandes: clientOrders, commande: () => clientOrder(r.id), review: () => clientReview(r.id), brief: clientBrief, fichiers: clientFiles, commander: clientOffers, factures: clientInvoices, contact: clientContact }[r.page]?.() ?? clientHome();
    else if (r.role === 'equipe') body = r.page === 'projet' ? project(r.id, r) : r.page === 'tous' ? teamBoard(true) : r.page === 'charte' ? teamGuide() : teamBoard(false);
    else body = { pilotage: adminHome, controle: adminControl, projets: adminProjects, projet: () => project(r.id, r), clients: adminClients, equipe: adminTeam, offres: adminOffers }[r.page]?.() ?? adminHome();
    app.innerHTML = frame(r, crumbs, body);
    UI.modalSeen = !!UI.modal;
    UI.panelSeen = UI.panel;
    document.title = `Atelier Méridien · ${{ client: 'Espace client', equipe: 'Espace équipe', admin: 'Administration' }[r.role]}`;
    if (UI.focusDraft) {
      const t = [...document.querySelectorAll('[data-draft]')].pop();
      if (t) t.focus();
      UI.focusDraft = false;
    }
  }

  /* ——— actions ——— */
  const A = {
    reset() {
      S = seed();
      UI.viewer = UI.modal = null;
      UI.panel = false;
      save();
      toast('La démo est revenue à son état de départ');
      go('#/client/accueil');
    },
    search: () => toast('La recherche porte sur les commandes, les clients et les fichiers'),
    panel() {
      UI.panel = !UI.panel;
      render();
    },
    readall() {
      S.notes[roleKey(route().role)].forEach((n) => (n.read = true));
      save();
      render();
    },
    notif(el) {
      const n = S.notes[roleKey(route().role)][+el.dataset.i];
      n.read = true;
      UI.panel = false;
      save();
      if (n.go) go(n.go);
      else render();
    },
    open(el) {
      const o = order(el.dataset.id);
      UI.viewer = { id: o.id, k: el.dataset.k, v: +(el.dataset.v || o.version), bg: 'light' };
      render();
    },
    close() {
      UI.viewer = null;
      render();
    },
    bg(el) {
      UI.viewer.bg = el.dataset.bg;
      render();
    },
    nav(el) {
      const o = order(UI.viewer.id);
      const list = deliv(o);
      const i = list.findIndex((d) => d[0] === UI.viewer.k) + +el.dataset.d;
      if (list[i]) UI.viewer.k = list[i][0];
      render();
    },
    deldraft(el) {
      const o = UI.viewer.id;
      S.drafts[o].splice(+el.dataset.i, 1);
      save();
      render();
    },
    send(el) {
      const o = order(el.dataset.id);
      const d = S.drafts[o.id] || [];
      if (!d.length) return;
      d.forEach((x) => o.feedback.push({ k: x.k, x: x.x, y: x.y, text: x.text.trim() || 'Voir le repère sur le visuel', version: o.version }));
      S.drafts[o.id] = [];
      o.status = 'revision';
      o.revUsed = Math.min(o.revMax, o.revUsed + 1);
      note('team', `${CLIENTS[o.client].who} a envoyé ${d.length} retour${d.length > 1 ? 's' : ''}`, `${o.id} · à l’instant`, `#/equipe/projet/${o.id}`);
      note('admin', `${o.id} : ${d.length} retour${d.length > 1 ? 's' : ''} du client`, 'à l’instant', `#/admin/projet/${o.id}`);
      UI.viewer = null;
      save();
      toast(`${d.length > 1 ? `Vos ${d.length} retours sont envoyés` : 'Votre retour est envoyé'} à ${TEAM[o.designer].name.split(' ')[0]}`);
      go(`#/client/commande/${o.id}`);
    },
    choose(el) {
      UI.modal = { type: 'choose', id: el.dataset.id, k: el.dataset.k };
      render();
    },
    validate() {
      const o = order(UI.modal.id);
      o.chosen = UI.modal.k;
      o.status = 'validated';
      S.drafts[o.id] = [];
      note('team', `${CLIENTS[o.client].name} a validé la proposition ${o.chosen}`, `${o.id} · à l’instant`, `#/equipe/projet/${o.id}`);
      note('admin', `${o.id} validée par le client`, 'à l’instant', `#/admin/projet/${o.id}`);
      UI.modal = UI.viewer = null;
      save();
      toast('Proposition validée : vos fichiers sont prêts');
      go('#/client/fichiers');
    },
    start(el) {
      const o = order(el.dataset.id);
      o.status = 'production';
      note('client', `${TEAM[o.designer].name.split(' ')[0]} a démarré votre projet`, `${o.id} · à l’instant`);
      save();
      toast('Projet démarré : le client est prévenu');
      render();
    },
    upload(el) {
      const o = order(el.dataset.id);
      const v = o.status === 'revision' ? o.version + 1 : o.version;
      const slug = (s, sep) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^A-Za-z0-9]+/g, sep).replace(/^-|-$/g, '');
      S.uploads[o.id] = deliv(o).map(([, n]) => ({ n: `${slug(CLIENTS[o.client].name, '')}_${slug(n, '-')}_V${v}.svg`, p: 0 }));
      save();
      render();
      const tick = () => {
        const up = S.uploads[o.id];
        if (!up) return;
        let more = false;
        up.forEach((f, i) => {
          f.p = Math.min(100, f.p + 18 + i * 6);
          if (f.p < 100) more = true;
        });
        render();
        if (more) setTimeout(tick, 220);
        else save();
      };
      setTimeout(tick, 220);
    },
    tocontrol(el) {
      const o = order(el.dataset.id);
      o.pendingVersion = o.status === 'revision' ? o.version + 1 : o.version;
      o.status = 'control';
      delete S.uploads[o.id];
      note('admin', `${o.id} attend votre contrôle`, `${TEAM[o.designer].name} · à l’instant`, '#/admin/controle');
      save();
      toast('Envoyé au contrôle qualité');
      render();
    },
    approve(el) {
      const o = order(el.dataset.id);
      o.version = o.pendingVersion || o.version;
      o.pendingVersion = null;
      o.status = 'review';
      o.late = false;
      o.delivered = o.delivered && o.version > 1 ? 'Aujourd’hui · à l’instant' : o.delivered || 'Aujourd’hui · à l’instant';
      if (o.client === CLIENT_ME) note('client', `Votre version ${o.version} est prête`, `${o.id} · à l’instant`, `#/client/review/${o.id}`);
      note('team', `Claire a envoyé ${o.id} au client`, 'à l’instant', `#/equipe/projet/${o.id}`);
      UI.viewer = null;
      save();
      toast(`Livraison envoyée à ${CLIENTS[o.client].name}`);
      render();
    },
    return(el) {
      const o = order(el.dataset.id);
      o.status = o.version > 1 || o.revUsed ? 'revision' : 'production';
      o.pendingVersion = null;
      note('team', `Claire vous renvoie ${o.id}`, 'Vérifier les noms de fichiers et les marges · à l’instant', `#/equipe/projet/${o.id}`);
      UI.viewer = null;
      save();
      toast(`Renvoyé à ${TEAM[o.designer].name}`);
      render();
    },
    buy(el) {
      UI.modal = { type: 'buy', id: el.dataset.id, step: 'cart' };
      render();
    },
    pay() {
      UI.modal.step = 'paying';
      render();
      setTimeout(() => {
        const f = S.offers.find((x) => x.id === UI.modal.id);
        const ref = `MC-${S.seq++}`;
        S.orders.unshift({ id: ref, client: 'mc', pack: f.name, price: f.price, designer: 'lea', status: 'brief', version: 1, pendingVersion: null, revUsed: 0, revMax: 2, feedback: [], chosen: null, created: 'Aujourd’hui · à l’instant', due: f.delay === 'En continu' ? 'Chaque mois' : `Sous ${f.delay}`, kind: f.id === 'social' ? 'social' : f.id === 'pack' ? 'pack' : 'logo2' });
        S.invoices.unshift({ id: `F-2026-${121 + S.seq - 1049}`, order: ref, label: f.name, amount: f.price, date: '5 oct. 2026' });
        note('admin', `Nouvelle commande : Maison Carbone`, `${f.name} · ${eur(f.price)} · à l’instant`, `#/admin/projet/${ref}`);
        note('team', `Nouveau brief : Maison Carbone`, `${ref} · à l’instant`, `#/equipe/projet/${ref}`);
        UI.modal = { type: 'buy', id: f.id, step: 'done', ref };
        save();
        render();
      }, 1100);
    },
    tobrief() {
      UI.modal = null;
      UI.briefStep = 0;
      go('#/client/brief');
    },
    mclose() {
      UI.modal = null;
      render();
    },
    bstep(el) {
      UI.briefStep = +el.dataset.i;
      render();
    },
    style(el) {
      const s = el.dataset.s;
      const st = S.brief.style;
      if (st.includes(s)) st.splice(st.indexOf(s), 1);
      else if (st.length < 3) st.push(s);
      else toast('3 mots maximum : retirez-en un d’abord');
      save();
      render();
    },
    briefsave() {
      save();
      toast('Brief enregistré : l’équipe voit la nouvelle version');
    },
    'upload-brief': () => toast('Fichier ajouté au brief'),
    dl: (el) => toast(`Téléchargement : ${el.dataset.f}`),
    contact() {
      const t = document.getElementById('contactMsg');
      if (t && !t.value.trim()) return toast('Écrivez votre message avant de l’envoyer');
      if (t) t.value = '';
      toast('Message envoyé : réponse sous 24 h');
    },
    whatsapp: () => toast('Dans le portail réel, WhatsApp s’ouvre avec votre commande déjà rattachée'),
    check(el) {
      S.checklist[+el.dataset.i] = !S.checklist[+el.dataset.i];
      save();
      render();
    },
    ptab(el) {
      UI.ptab = el.dataset.k;
      render();
    },
    client(el) {
      UI.modal = { type: 'client', k: el.dataset.k };
      render();
    },
    invite() {
      UI.modal = { type: 'invite' };
      render();
    },
    newclient() {
      UI.modal = { type: 'newclient' };
      render();
    },
    export: () => toast('Export des clients au format CSV'),
    toggleoffer(el) {
      const f = S.offers[+el.dataset.i];
      f.active = !f.active;
      save();
      toast(f.active ? `« ${f.name} » est de nouveau visible` : `« ${f.name} » est masquée dans l’espace client`);
      render();
    },
    toast(el) {
      toast(el.dataset.m);
      if (el.dataset.close) {
        UI.modal = null;
        render();
      }
    },
    noop: () => toast('La période change dans le portail réel'),
  };
  const CHANGE = {
    assign(el) {
      const o = order(el.dataset.id);
      o.designer = el.value;
      save();
      toast(`${o.id} confié à ${TEAM[o.designer].name}`);
      render();
    },
    price(el) {
      const f = S.offers[+el.dataset.i];
      f.price = Math.max(0, Math.round(+el.value || 0));
      save();
      toast(`Nouveau prix de « ${f.name} » : ${eur(f.price)}`);
    },
  };

  /* ——— events ——— */
  document.addEventListener('click', (e) => {
    const t = e.target;
    if (t.closest('select, input, textarea, label')) return;
    // a click on the artwork places a comment (client, while reviewing)
    const artEl = t.closest('.art[data-pin="1"]');
    if (artEl && !t.closest('.pin')) {
      const b = artEl.getBoundingClientRect();
      const o = UI.viewer.id;
      (S.drafts[o] = S.drafts[o] || []).push({ k: UI.viewer.k, x: +((e.clientX - b.left) / b.width).toFixed(4), y: +((e.clientY - b.top) / b.height).toFixed(4), text: '' });
      UI.focusDraft = true;
      save();
      render();
      return;
    }
    // the innermost of [data-act] / [data-go] wins
    const act = t.closest('[data-act]');
    const goEl = t.closest('[data-go]');
    const useGo = goEl && (!act || act.contains(goEl));
    const wasOpen = UI.panel;
    if (UI.panel && !t.closest('.panel') && !(act && !useGo && act.dataset.act === 'panel')) UI.panel = false;
    if (useGo) {
      e.preventDefault();
      UI.viewer = null;
      UI.modal = null;
      go(goEl.dataset.go);
      return;
    }
    if (act) {
      // a click inside a modal, on nothing in particular, must not close it
      if (act.classList.contains('modal-back') && t.closest('[data-stop]')) return;
      const fn = A[act.dataset.act];
      if (fn) {
        e.preventDefault();
        fn(act);
        return;
      }
    }
    if (wasOpen && !UI.panel) render();
  });
  document.addEventListener('change', (e) => {
    const el = e.target.closest('[data-act-change]');
    if (el) CHANGE[el.dataset.actChange]?.(el);
  });
  document.addEventListener('input', (e) => {
    const el = e.target;
    if (el.dataset.draft !== undefined) {
      const d = S.drafts[UI.viewer.id][+el.dataset.draft];
      if (d) d.text = el.value;
      save();
    } else if (el.dataset.model) {
      const [, key] = el.dataset.model.split('.');
      S.brief[key] = el.value;
      save();
    }
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (UI.modal) UI.modal = null;
      else if (UI.viewer) UI.viewer = null;
      else UI.panel = false;
      render();
    }
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      A.search();
    }
  });
  window.addEventListener('hashchange', () => {
    const r = route();
    if (location.hash === `#/${r.role}` || !location.hash) {
      location.replace(`#/${r.role}/${r.page}`);
      return;
    }
    window.scrollTo(0, 0);
    render();
  });
  if (!location.hash || location.hash.split('/').length < 3) location.replace(`#/${route().role}/${route().page}`);
  render();
})();
