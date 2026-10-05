/* Atelier Méridien — the fictional data of the showcase (projet vitrine, données fictives).
   Amounts are TTC in euros. Totals are never stored when they can be computed. */
window.DATA = (() => {
  'use strict';

  const people = {
    mathilde: { name: 'Mathilde Arnoux', short: 'Mathilde', role: 'Fondatrice · direction', color: '#1f4d3f' },
    louis: { name: 'Louis Kervella', short: 'Louis', role: 'Concepteur de voyages · Japon', color: '#3e5c7a' },
    ines: { name: 'Inès Benhamou', short: 'Inès', role: 'Afrique australe et océan Indien', color: '#7a5c3e' },
    baptiste: { name: 'Baptiste Roussel', short: 'Baptiste', role: 'Amériques', color: '#5f6f4a' },
    agathe: { name: 'Agathe Leclerc', short: 'Agathe', role: 'Europe et Grand Nord', color: '#8a5a44' },
    yasmine: { name: 'Yasmine Haddad', short: 'Yasmine', role: 'Orient et Asie centrale', color: '#5d5f7a' },
    theo: { name: 'Théo Lambert', short: 'Théo', role: 'Opérations et billetterie', color: '#4f6f8f' },
    camille: { name: 'Camille Delorme', short: 'Camille', role: 'Voyageuse', color: '#a0522d' },
    antoine: { name: 'Antoine Delorme', short: 'Antoine', role: 'Co-voyageur', color: '#8a6a2f' },
  };

  // [id, group, label, date, dateLabel, price, status, ref, confirmedOn, opensOn, icon]
  const L = [
    ['V1', 'Vols', 'Vol Paris-CDG → Tokyo-Haneda, classe économique, sièges choisis', '2026-11-07', 'sam. 7 nov.', 1390, 'confirmed', 'JQ4T8W', '2026-07-03', null, 'plane'],
    ['V2', 'Vols', 'Vol Osaka-Kansai → Paris-CDG', '2026-11-22', 'dim. 22 nov.', 1390, 'confirmed', 'JQ4T8W', '2026-07-03', null, 'plane'],
    ['H1', 'Hébergements', 'Tokyo, Kuramae · hôtel de 24 chambres au bord de la Sumida · 3 nuits', '2026-11-08', '8–11 nov.', 870, 'confirmed', 'KRM-20931', '2026-07-06', null, 'bed'],
    ['H2', 'Hébergements', 'Hakone · ryokan, dîner et petit-déjeuner · 1 nuit', '2026-11-11', '11–12 nov.', 780, 'confirmed', 'HKN-118', '2026-07-07', null, 'bed'],
    ['H3', 'Hébergements', 'Kanazawa, Higashi Chaya · maison d’hôtes · 2 nuits', '2026-11-12', '12–14 nov.', 480, 'confirmed', 'KNZ-5528', '2026-07-06', null, 'bed'],
    ['H4', 'Hébergements', 'Takayama · ryokan, dîner et petit-déjeuner · 1 nuit', '2026-11-14', '14–15 nov.', 520, 'confirmed', 'TKM-2240', '2026-07-08', null, 'bed'],
    ['H5', 'Hébergements', 'Kyoto · 4 nuits · machiya réservée, ryokan en option', '2026-11-15', '15–19 nov.', null, 'option', null, null, null, 'bed'],
    ['H6', 'Hébergements', 'Naoshima · hôtel-musée · 2 nuits', '2026-11-19', '19–21 nov.', 720, 'confirmed', 'NSM-317', '2026-07-09', null, 'bed'],
    ['H7', 'Hébergements', 'Osaka, Nakanoshima · hôtel · 1 nuit', '2026-11-21', '21–22 nov.', 210, 'confirmed', 'OSK-88204', '2026-07-06', null, 'bed'],
    ['T1', 'Trajets', 'Transfert privé Haneda → Kuramae', '2026-11-08', 'dim. 8 nov.', 160, 'confirmed', 'MS-T1108', '2026-07-10', null, 'car'],
    ['T2', 'Trajets', 'Romancecar Shinjuku → Hakone-Yumoto, places réservées', '2026-11-11', 'mer. 11 nov.', 40, 'opening', null, null, '2026-10-11', 'train'],
    ['T3', 'Trajets', 'Trains Hakone → Kanazawa (3 trains, via Odawara et Tokyo)', '2026-11-12', 'jeu. 12 nov.', 240, 'opening', null, null, '2026-10-12', 'train'],
    ['T4', 'Trajets', 'Bus Kanazawa → Shirakawa-go → Takayama', '2026-11-14', 'sam. 14 nov.', 60, 'opening', null, null, '2026-10-14', 'bus'],
    ['T5', 'Trajets', 'Trains Takayama → Kyoto (express jusqu’à Nagoya, puis Shinkansen)', '2026-11-15', 'dim. 15 nov.', 200, 'opening', null, null, '2026-10-15', 'train'],
    ['T6', 'Trajets', 'Kyoto → Naoshima (Shinkansen, train pour Uno, ferry)', '2026-11-19', 'jeu. 19 nov.', 140, 'opening', null, null, '2026-10-19', 'ferry'],
    ['T7', 'Trajets', 'Naoshima → Osaka (ferry, train, Shinkansen)', '2026-11-21', 'sam. 21 nov.', 140, 'opening', null, null, '2026-10-21', 'ferry'],
    ['T8', 'Trajets', 'Transfert privé Osaka → Kansai', '2026-11-22', 'dim. 22 nov.', 120, 'confirmed', 'MS-T2211', '2026-07-10', null, 'car'],
    ['T9', 'Trajets', 'Bagages expédiés Tokyo → Kyoto (2 valises, envoi le 11, livraison le 15)', '2026-11-11', 'mer. 11 nov.', 40, 'confirmed', 'MS-B1115', '2026-07-10', null, 'bag'],
    ['E1', 'Expériences', 'Guide francophone, demi-journée Yanaka et Ueno', '2026-11-09', 'lun. 9 nov.', 240, 'confirmed', 'MS-G0911', '2026-07-12', null, 'guide'],
    ['E2', 'Expériences', 'Atelier de feuille d’or, Kanazawa', '2026-11-13', 'ven. 13 nov.', 110, 'confirmed', 'KNZ-W213', '2026-07-12', null, 'guide'],
    ['E3', 'Expériences', 'Guide francophone, journée Higashiyama', '2026-11-16', 'lun. 16 nov.', 510, 'confirmed', 'MS-G1611', '2026-07-12', null, 'guide'],
    ['E4', 'Expériences', 'Dîner kaiseki à Gion', '2026-11-17', 'mar. 17 nov.', 400, 'opening', null, null, '2026-10-17', 'guide'],
    ['E5', 'Expériences', 'Musées de Naoshima, billets horodatés', '2026-11-20', 'ven. 20 nov.', 60, 'opening', null, null, '2026-10-20', 'guide'],
    ['S1', 'Services', 'eSIM 15 jours, 2 lignes', null, '—', 40, 'confirmed', 'ESIM-2207', '2026-07-03', null, 'sim'],
    ['S2', 'Services', 'Carnet de voyage imprimé, envoyé à Nantes', '2026-10-23', '23 oct.', 40, 'confirmed', 'CV-0388', '2026-07-03', null, 'book'],
    ['S3', 'Services', 'Assistance 24 h/24 et frais de dossier', null, '—', 300, 'confirmed', 'AM-0388', '2026-07-03', null, 'shield'],
  ];
  const openNotes = { E4: 'Le restaurant ouvre ses réservations le 17 octobre', E5: 'Billets horodatés ouverts le 20 octobre' };
  const lines = L.map(([id, group, label, date, dateLabel, price, status, ref, confirmedOn, opensOn, icon]) => ({
    id, group, label, date, dateLabel, price, status, ref, confirmedOn, opensOn, icon,
    openNote: opensOn ? openNotes[id] || `Ouverture le ${+opensOn.slice(8)} oct.` : null,
  }));

  const stops = [
    { id: 'tokyo', name: 'Tokyo', sub: 'Kuramae', lat: 35.704, lon: 139.791, dx: 10, dy: -8, anchor: 'start', nights: '3 n.' },
    { id: 'hakone', name: 'Hakone', lat: 35.233, lon: 139.106, dx: 10, dy: 16, anchor: 'start', nights: '1 n.' },
    { id: 'kanazawa', name: 'Kanazawa', lat: 36.572, lon: 136.666, dx: -10, dy: -8, anchor: 'end', nights: '2 n.' },
    { id: 'shirakawa', name: 'Shirakawa-go', lat: 36.257, lon: 136.906, dx: -10, dy: -2, anchor: 'end', nights: null },
    { id: 'takayama', name: 'Takayama', lat: 36.141, lon: 137.258, dx: 10, dy: 14, anchor: 'start', nights: '1 n.' },
    { id: 'kyoto', name: 'Kyoto', lat: 35.011, lon: 135.768, dx: 10, dy: -6, anchor: 'start', nights: '4 n.' },
    { id: 'naoshima', name: 'Naoshima', lat: 34.459, lon: 133.995, dx: -10, dy: -8, anchor: 'end', nights: '2 n.' },
    { id: 'osaka', name: 'Osaka', sub: 'Nakanoshima', lat: 34.693, lon: 135.493, dx: 10, dy: 14, anchor: 'start', nights: '1 n.' },
    { id: 'kansai', name: 'Kansai', sub: 'aéroport', lat: 34.434, lon: 135.244, dx: -10, dy: 14, anchor: 'end', nights: null },
  ];
  const P = {
    haneda: [35.549, 139.780], kuramae: [35.704, 139.791], shinjuku: [35.690, 139.700], odawara: [35.256, 139.155], hakone: [35.233, 139.106],
    tokyoSt: [35.681, 139.767], takasaki: [36.322, 139.013], nagano: [36.643, 138.189], toyama: [36.701, 137.213], kanazawa: [36.578, 136.648],
    shirakawa: [36.257, 136.906], takayama: [36.141, 137.258], gero: [35.806, 137.245], gifu: [35.409, 136.757], nagoya: [35.171, 136.882],
    kyotoSt: [34.985, 135.759], kyoto: [35.011, 135.768], shinOsaka: [34.733, 135.500], shinKobe: [34.707, 135.196], nishiAkashi: [34.666, 134.960],
    himeji: [34.827, 134.691], okayama: [34.666, 133.918], uno: [34.490, 133.953], naoshima: [34.459, 133.973], osaka: [34.693, 135.493], kansai: [34.434, 135.244],
  };
  const seg = (day, mode, ...k) => ({ day, mode, pts: k.map((x) => P[x]) });
  const segments = [
    seg(2, 'car', 'haneda', 'kuramae'),
    seg(5, 'train', 'kuramae', 'shinjuku', 'odawara', 'hakone'),
    seg(6, 'train', 'hakone', 'odawara', 'tokyoSt', 'takasaki', 'nagano', 'toyama', 'kanazawa'),
    seg(8, 'bus', 'kanazawa', 'shirakawa', 'takayama'),
    seg(9, 'train', 'takayama', 'gero', 'gifu', 'nagoya', 'kyotoSt', 'kyoto'),
    seg(13, 'train', 'kyoto', 'kyotoSt', 'shinOsaka', 'shinKobe', 'nishiAkashi', 'himeji', 'okayama', 'uno'),
    seg(13, 'ferry', 'uno', 'naoshima'),
    seg(15, 'ferry', 'naoshima', 'uno'),
    seg(15, 'train', 'uno', 'okayama', 'himeji', 'nishiAkashi', 'shinKobe', 'shinOsaka', 'osaka'),
    seg(16, 'car', 'osaka', 'kansai'),
  ];

  const day = (j, date, title, text, note, stop, night, modes, firstTime) => ({ j, date, title, text, note, stop, night, modes, firstTime });
  const days = [
    day(1, '2026-11-07', 'Paris → Tokyo', 'Départ de Paris-Charles-de-Gaulle à 13:25, arrivée à Haneda le lendemain à 11:05, heure de Tokyo. 13 h 40 de vol.', 'Décalage : +8 h. Aujourd’hui l’écart est de 7 h ; la France passe à l’heure d’hiver le dimanche 25 octobre.', 'tokyo', null, ['plane'], '13:25'),
    day(2, '2026-11-08', 'Tokyo', 'Transfert privé jusqu’à votre hôtel de Kuramae, au bord de la Sumida. Chambre disponible dès 14 h.', null, 'tokyo', { n: 1, of: 3, place: 'Hôtel de Kuramae, au bord de la Sumida' }, ['car'], '11:05'),
    day(3, '2026-11-09', 'Tokyo', 'Avec votre guide, de 9:30 à 13:00 : Yanaka, ses temples et ses ateliers, puis le parc d’Ueno. Après-midi libre.', null, 'tokyo', { n: 2, of: 3, place: 'Hôtel de Kuramae, au bord de la Sumida' }, ['guide'], '9:30'),
    day(4, '2026-11-10', 'Tokyo', 'Journée libre. Nos adresses sont dans votre carnet : Kiyosumi, Nihonbashi, Shimokitazawa.', null, 'tokyo', { n: 3, of: 3, place: 'Hôtel de Kuramae, au bord de la Sumida' }, [], null),
    day(5, '2026-11-11', 'Tokyo → Hakone', 'Romancecar depuis Shinjuku vers 10:30, arrivée à Hakone-Yumoto 1 h 25 plus tard. Ryokan avec dîner et petit-déjeuner.', 'Gardez un petit sac pour quatre nuits : vos valises partent ce matin de l’hôtel et vous attendront à Kyoto le 15.', 'hakone', { n: 1, of: 1, place: 'Ryokan, dîner et petit-déjeuner' }, ['train', 'bag'], '10:30'),
    day(6, '2026-11-12', 'Hakone → Kanazawa', 'Trois trains : Hakone-Yumoto → Odawara, Shinkansen jusqu’à Tokyo, puis Shinkansen jusqu’à Kanazawa. Environ 4 h 20.', 'Horaires définitifs à l’ouverture des réservations, le 12 octobre.', 'kanazawa', { n: 1, of: 2, place: 'Maison d’hôtes, Higashi Chaya' }, ['train'], null),
    day(7, '2026-11-13', 'Kanazawa', 'Le jardin Kenroku-en tôt le matin, puis l’atelier de feuille d’or à 14:00.', null, 'kanazawa', { n: 2, of: 2, place: 'Maison d’hôtes, Higashi Chaya' }, ['guide'], null),
    day(8, '2026-11-14', 'Kanazawa → Takayama', 'Bus jusqu’à Shirakawa-go (1 h 15), deux heures sur place, puis bus pour Takayama (50 min). Ryokan avec dîner.', null, 'takayama', { n: 1, of: 1, place: 'Ryokan, dîner et petit-déjeuner' }, ['bus'], null),
    day(9, '2026-11-15', 'Takayama → Kyoto', 'Marché du matin, puis express jusqu’à Nagoya et Shinkansen pour Kyoto : 3 h 40. Vos valises vous attendent.', 'La ligne JR Takayama est coupée depuis le 4 octobre (pluies). Si elle n’a pas rouvert, vous partirez en bus express jusqu’à Nagoya, puis Shinkansen : vous arriverez à Kyoto à peu près à la même heure. Nous vous le dirons à J-15.', 'kyoto', { n: 1, of: 4, place: 'kyoto' }, ['train'], null),
    day(10, '2026-11-16', 'Kyoto', 'Guide à la journée dans Higashiyama, en pleine saison des érables. Départ à 8:30, avant la foule.', null, 'kyoto', { n: 2, of: 4, place: 'kyoto' }, ['guide'], '8:30'),
    day(11, '2026-11-17', 'Kyoto', 'Matinée libre. Dîner kaiseki à Gion à 18:30.', 'Le restaurant ouvre ses réservations le 17 octobre.', 'kyoto', { n: 3, of: 4, place: 'kyoto' }, [], '18:30'),
    day(12, '2026-11-18', 'Kyoto', 'Journée libre : Ohara en bus, ou Arashiyama tôt le matin.', null, 'kyoto', { n: 4, of: 4, place: 'kyoto' }, [], null),
    day(13, '2026-11-19', 'Kyoto → Naoshima', 'Shinkansen jusqu’à Okayama, train pour Uno, puis ferry de 20 min. Environ 2 h 30.', 'Entre Shin-Kobe et Nishi-Akashi, vous passez le 135e méridien.', 'naoshima', { n: 1, of: 2, place: 'Hôtel-musée' }, ['train', 'ferry'], null),
    day(14, '2026-11-20', 'Naoshima', 'Les musées de l’île, sur créneaux horaires.', 'Billets horodatés ouverts le 20 octobre.', 'naoshima', { n: 2, of: 2, place: 'Hôtel-musée' }, ['guide'], null),
    day(15, '2026-11-21', 'Naoshima → Osaka', 'Ferry, train, puis Shinkansen jusqu’à Shin-Osaka. Environ 2 h 15. Dernière nuit à Nakanoshima.', 'Peu après Nishi-Akashi, le Shinkansen croise le 135e méridien, celui qui donne l’heure à tout le Japon.', 'osaka', { n: 1, of: 1, place: 'Hôtel à Nakanoshima' }, ['ferry', 'train'], null),
    day(16, '2026-11-22', 'Osaka → Paris', 'Transfert privé à 7:30 vers Kansai. Vol à 10:40, arrivée à Paris-Charles-de-Gaulle à 17:10. 14 h 30 de vol.', null, 'kansai', null, ['car', 'plane'], '7:30'),
  ];

  const trip = {
    id: 'AM-26-0388',
    titleA: 'Japon d’automne,',
    titleB: 'de Tokyo à la mer intérieure',
    pax: 2,
    start: '2026-11-07',
    end: '2026-11-22',
    departAt: '2026-11-07T13:25:00+01:00',
    timeline: { request: '2026-05-26', proposal: '2026-06-05', confirmed: '2026-07-03' },
    deadlines: { kyoto: '2026-10-07T18:00:00+02:00', balance: '2026-10-08', book: '2026-10-23T08:00:00+02:00', vjw: '2026-10-24', survey: '2026-11-23' },
    depositRate: 0.3,
    payments: [{ id: 'P1', kind: 'acompte', amount: 3336, date: '2026-07-03', method: 'virement', invoice: 'F-2026-0231' }],
    balanceDocs: { receipt: 'R-26-0349', invoice: 'F-2026-0479' },
    groups: ['Vols', 'Hébergements', 'Trajets', 'Expériences', 'Services'],
    lines,
    costs: { Vols: 2640, Hébergements: 4460, Trajets: 980, Expériences: 1000, Services: 50 },
    kyoto: {
      nights: 4,
      lineId: 'H5',
      machiya: {
        key: 'machiya', name: 'Machiya d’Higashiyama', nightly: 480, extraCost: 0, ref: 'HGY-2207', lat: 34.999, lon: 135.777, walk: '8 min',
        facts: [['Type', 'Maison de ville de 1920'], ['Espace', '2 chambres, cuisine, petit jardin intérieur'], ['Repas', 'Aucun, cuisine à disposition'], ['À pied de Gion', '8 min']],
        status: 'Réservée depuis le 3 juillet, annulable sans frais jusqu’au mer. 18 h',
      },
      ryokan: {
        key: 'ryokan', name: 'Ryokan d’Okazaki', nightly: 680, extraCost: 660, ref: 'OKZ-4471', lat: 35.0125, lon: 135.783, walk: '15 min',
        facts: [['Type', 'Chambre côté jardin'], ['Espace', 'Bain privatif'], ['Repas', 'Petits-déjeuners japonais'], ['À pied de Gion', '15 min']],
        status: 'Libérée le 1er octobre, en option jusqu’au mer. 18 h',
      },
      gion: { lat: 35.0037, lon: 135.7785, label: 'Gion' },
      station: { lat: 34.9858, lon: 135.7588, label: 'Gare de Kyoto' },
      louisLine: 'Si vous comptez dîner dehors tous les soirs à Gion, la machiya fait aussi bien.',
    },
    passports: { camille: { receivedOn: '2026-07-04', verifiedBy: 'louis', validUntil: 'mars 2031' } },
    messages: [
      { from: 'camille', at: '2026-09-25T18:42:00+02:00', text: 'Bonsoir Louis, on a bien reçu le rappel pour le solde, c’est noté. Petite question : on peut garder nos valises jusqu’à Hakone, ou c’est vraiment mieux de les envoyer ?' },
      { from: 'louis', at: '2026-09-28T09:15:00+02:00', text: 'Bonjour Camille, envoyez-les : le Romancecar a peu de place pour les grandes valises, et les ryokans de Hakone et de Takayama sont dans des rues en pente. Un petit sac pour quatre nuits suffit. Elles vous attendront à Kyoto le 15.\nLouis' },
      { from: 'louis', at: '2026-10-02T16:20:00+02:00', text: 'Bonjour Camille, bonjour Antoine. Une chambre côté jardin vient de se libérer au ryokan d’Okazaki dont je vous avais parlé, pour vos quatre nuits à Kyoto. Je l’ai mise en option jusqu’à mercredi 18 h. La machiya d’Higashiyama reste réservée : c’est ce qui est prévu, et c’est très bien.\n\nLe ryokan coûte 800 € de plus pour les 4 nuits ; vous y gagnez le jardin en pleine saison des érables, un bain privatif et les petits-déjeuners. Si vous comptez dîner dehors tous les soirs à Gion, la machiya fait aussi bien.\n\nDites-moi ce que vous préférez, directement depuis votre espace.\nLouis' },
    ],
    pastTrips: [{ label: 'Écosse, mai 2024', amount: 6480 }],
    days,
    stops,
    segments,
  };

  const travelling = [
    { id: 'roche', client: 'M. et Mme Roche et leurs fils', pax: 4, place: 'Sossusvlei', country: 'Namibie', lat: -24.73, lon: 15.34, tz: 'Africa/Windhoek', day: 12, of: 16, depart: '2026-09-24', ret: '2026-10-09', advisor: 'ines', lastContact: 'Message hier, 18:30' },
    { id: 'lefebvre', client: 'M. et Mme Lefebvre', pax: 2, place: 'Boukhara', country: 'Ouzbékistan', lat: 39.77, lon: 64.42, tz: 'Asia/Samarkand', day: 8, of: 12, depart: '2026-09-28', ret: '2026-10-09', advisor: 'yasmine', lastContact: 'sam. 3 oct.' },
    { id: 'vidal', client: 'M. et Mme Vidal', pax: 2, place: 'Wadi Rum', country: 'Jordanie', lat: 29.57, lon: 35.42, tz: 'Asia/Amman', day: 4, of: 10, depart: '2026-10-02', ret: '2026-10-11', advisor: 'yasmine', lastContact: 'Aujourd’hui, 8:10 (guide)' },
    { id: 'perrin', client: 'Mme Perrin et sa sœur', pax: 2, place: 'Lecce', country: 'Pouilles', lat: 40.35, lon: 18.17, tz: 'Europe/Rome', day: 7, of: 9, depart: '2026-09-29', ret: '2026-10-07', advisor: 'agathe', lastContact: 'dim. 4 oct.' },
    { id: 'hamel', client: 'M. et Mme Hamel', pax: 2, place: 'Oaxaca', country: 'Mexique', lat: 17.06, lon: -96.73, tz: 'America/Mexico_City', day: 10, of: 15, depart: '2026-09-26', ret: '2026-10-10', advisor: 'baptiste', lastContact: 'Hier, 19:05 heure locale' },
    { id: 'garnier', client: 'M. et Mme Garnier', pax: 2, place: 'Takayama', country: 'Japon', lat: 36.14, lon: 137.25, tz: 'Asia/Tokyo', day: 9, of: 15, depart: '2026-09-27', ret: '2026-10-11', advisor: 'louis', lastContact: 'Aujourd’hui, 0:34 (Mme Sato)', value: 12940 },
    { id: 'dumas', client: 'M. Dumas et ses fils', pax: 3, place: 'Lofoten', country: 'Norvège', lat: 67.93, lon: 13.09, tz: 'Europe/Oslo', day: 6, of: 9, depart: '2026-09-30', ret: '2026-10-08', advisor: 'agathe', lastContact: 'sam. 3 oct.' },
    { id: 'lenoir', client: 'M. et Mme Lenoir', pax: 2, place: 'Delta de l’Okavango', country: 'Botswana', lat: -19.4, lon: 22.9, tz: 'Africa/Gaborone', day: 5, of: 14, depart: '2026-10-01', ret: '2026-10-14', advisor: 'ines', lastContact: 'Hier, depuis le camp' },
    { id: 'fabre', client: 'Groupe Fabre (4 amis)', pax: 4, place: 'Samarcande', country: 'Ouzbékistan', lat: 39.65, lon: 66.96, tz: 'Asia/Samarkand', day: 3, of: 11, depart: '2026-10-03', ret: '2026-10-13', advisor: 'yasmine', lastContact: 'Aujourd’hui, 7:50' },
  ];

  const garnier = {
    alertAt: '2026-10-04T23:12:00+02:00',
    localAlert: '06:12',
    sato: 'Ligne JR Takayama coupée entre Hida-Hagiwara et Gero depuis dimanche soir (pluies). Votre train de demain 9:52 est supprimé.',
    replacementMessage: 'Bonsoir Hélène, bonsoir Marc. Votre train de demain est supprimé. Nous vous avons réservé le bus express de 8:50 pour Nagoya (2 h 40), puis le Shinkansen de 11:58 : arrivée à Kyoto à 12:33, au lieu de 13:21. Mme Sato passera vous remettre les billets ce soir au ryokan. Bonne soirée,\nLouis',
    newArrival: '12:33',
    oldArrival: '13:21',
    journal: [
      { at: '2026-10-05T09:40:00+02:00', text: 'Hamel (Oaxaca) : RAS, dernier message hier à 19:05, heure locale.' },
      { at: '2026-10-05T09:10:00+02:00', text: 'Dossier Garnier transmis à Louis.' },
      { at: '2026-10-05T09:00:00+02:00', text: 'Astreinte : Agathe passe le relais à Baptiste.' },
      { at: '2026-10-05T00:34:00+02:00', text: 'Mme Sato a vu les Garnier au petit-déjeuner (7:34 à Takayama). Ils restent à Takayama aujourd’hui, comme prévu ; le trajet de demain est à revoir.' },
      { at: '2026-10-04T23:19:00+02:00', text: 'Agathe (astreinte) accuse réception et demande à Mme Sato de prévenir les Garnier au réveil.' },
      { at: '2026-10-04T23:12:00+02:00', text: 'Mme Sato signale la coupure de la ligne JR Takayama · Garnier (Japon), J9/15.' },
    ],
  };

  const departuresWeek = [
    { date: '2026-10-07', client: 'M. et Mme Marchand', dest: 'Japon', pax: 2, advisor: 'louis', docs: 'ok', note: 'Carnet et billets envoyés le 22 sept.' },
    { date: '2026-10-08', client: 'M. et Mme Besson', dest: 'Oman', pax: 2, advisor: 'yasmine', docs: 'ok', note: 'Carnet et billets envoyés' },
    { date: '2026-10-09', client: 'M. et Mme Royer', dest: 'Italie, Sicile', pax: 2, advisor: 'agathe', docs: 'ok', note: 'Carnet et billets envoyés' },
    { date: '2026-10-10', client: 'M. et Mme Caron', dest: 'Japon', pax: 2, advisor: 'louis', docs: 'ok', note: 'Carnet envoyé le 25 sept.' },
    { date: '2026-10-10', client: 'Joly (deux couples amis)', dest: 'Namibie', pax: 4, advisor: 'ines', docs: 'warn', note: 'Vol intérieur Windhoek : billets à rééditer (changement d’horaire) · Théo' },
    { date: '2026-10-11', client: 'M. et Mme Petit-Renaud', dest: 'Ouzbékistan', pax: 2, advisor: 'yasmine', docs: 'ok', note: 'Carnet et billets envoyés' },
  ];

  const balances = [
    { key: 'girard', client: 'Girard', dest: 'Mexique', depart: '2026-11-05', total: 8990, deposit: 2697, balance: 6293, due: '2026-10-06', dueNote: null, receivedOn: '2026-10-02' },
    { key: 'morel', client: 'Morel', dest: 'Patagonie', depart: '2026-11-06', total: 14100, deposit: 4230, balance: 9870, due: '2026-10-07', dueNote: null, receivedOn: '2026-09-30' },
    { key: 'delorme', client: 'Delorme', dest: 'Japon', depart: '2026-11-07', total: 11120, deposit: 3336, balance: 7784, due: '2026-10-08', dueNote: null, receivedOn: null },
    { key: 'lucas', client: 'Lucas', dest: 'Oman', depart: '2026-11-09', total: 7800, deposit: 2340, balance: 5460, due: '2026-10-09', dueNote: 'J-30 tombe un samedi, avancé au vendredi', receivedOn: null },
    { key: 'fontaine', client: 'Fontaine', dest: 'Japon', depart: '2026-11-10', total: 12300, deposit: 3690, balance: 8610, due: '2026-10-09', dueNote: 'J-30 tombe un dimanche, avancé au vendredi', receivedOn: null },
  ];

  const louis = {
    confirmed2026: [
      { id: 'AM-26-0214', client: 'Marchand', start: '2026-10-07', end: '2026-10-21', pax: 2, total: 10480, balance: 'reçu', doc: 'ok' },
      { id: 'AM-26-0251', client: 'Caron', start: '2026-10-10', end: '2026-10-25', pax: 2, total: 12260, balance: 'reçu', doc: 'ok' },
      { id: 'AM-26-0262', client: 'Pons', start: '2026-10-14', end: '2026-10-28', pax: 2, total: 9940, balance: 'reçu', doc: 'ok' },
      { id: 'AM-26-0279', client: 'Rivière (et leurs filles)', start: '2026-10-17', end: '2026-10-31', pax: 4, total: 21360, balance: 'reçu', doc: 'ok' },
      { id: 'AM-26-0290', client: 'Blanchard', start: '2026-10-21', end: '2026-11-04', pax: 2, total: 11870, balance: 'reçu', doc: 'ok' },
      { id: 'AM-26-0301', client: 'Meyer', start: '2026-10-24', end: '2026-11-08', pax: 2, total: 13150, balance: 'reçu', doc: 'passeport de Mme Meyer manquant' },
      { id: 'AM-26-0388', client: 'Delorme', start: '2026-11-07', end: '2026-11-22', pax: 2, total: 11120, balance: 'dû 8 oct.', doc: 'passeport d’Antoine manquant' },
      { id: 'AM-26-0342', client: 'Fontaine', start: '2026-11-10', end: '2026-11-24', pax: 2, total: 12300, balance: 'dû 9 oct.', doc: '2 passeports manquants' },
      { id: 'AM-26-0355', client: 'Lemaire', start: '2026-11-13', end: '2026-11-27', pax: 2, total: 11640, balance: 'dû 14 oct.', doc: 'ok' },
      { id: 'AM-26-0361', client: 'Chevalier', start: '2026-11-14', end: '2026-11-28', pax: 3, total: 15980, balance: 'dû 15 oct.', doc: 'ok' },
      { id: 'AM-26-0372', client: 'Barbier', start: '2026-11-18', end: '2026-12-02', pax: 2, total: 12100, balance: 'dû 19 oct.', doc: 'ok' },
      { id: 'AM-26-0379', client: 'Gauthier', start: '2026-11-21', end: '2026-12-05', pax: 2, total: 10920, balance: 'dû 22 oct.', doc: 'ok' },
      { id: 'AM-26-0394', client: 'Perret', start: '2026-11-24', end: '2026-12-06', pax: 2, total: 9860, balance: 'dû 23 oct.', doc: 'ok' },
      { id: 'AM-26-0401', client: 'Renaud', start: '2026-11-26', end: '2026-12-09', pax: 2, total: 12480, balance: 'dû 27 oct.', doc: 'ok' },
      { id: 'AM-26-0433', client: 'Masson (et leurs enfants)', start: '2026-12-19', end: '2027-01-03', pax: 4, total: 19760, balance: 'dû 19 nov.', doc: 'ok' },
    ],
    confirmed2027: [
      { id: 'AM-26-0571', client: 'Hubert', start: '2027-03-20', end: '2027-04-03', pax: 2, total: 12400 },
      { id: 'AM-26-0578', client: 'Robin', start: '2027-03-27', end: '2027-04-10', pax: 2, total: 12900 },
      { id: 'AM-26-0583', client: 'Collin', start: '2027-04-03', end: '2027-04-17', pax: 2, total: 12150 },
      { id: 'AM-26-0590', client: 'Vincent', start: '2027-04-10', end: '2027-04-24', pax: 2, total: 12700 },
      { id: 'AM-26-0594', client: 'Muller', start: '2027-04-17', end: '2027-05-01', pax: 2, total: 12450 },
      { id: 'AM-26-0522', client: 'Lacroix', start: '2027-04-24', end: '2027-05-08', pax: 2, total: 11980 },
    ],
    toProcess: [
      { id: 'AM-26-0612', client: 'Leroy', request: 'Japon, avril 2027, 2 pers.', receivedOn: '2026-10-01' },
      { id: 'AM-26-0614', client: 'Bonnet', request: 'Japon, mars 2027, 2 pers.', receivedOn: '2026-10-02' },
      { id: 'AM-26-0616', client: 'Guérin', request: 'Japon, novembre 2027, 2 pers.', receivedOn: '2026-10-03' },
      { id: 'AM-26-0617', client: 'Hervé', request: 'Japon et Corée, mai 2027, 2 pers.', receivedOn: '2026-10-04' },
    ],
    proposals: [
      { client: 'Lambert', sentOn: '2026-09-18', departure: 'mars 2027' },
      { client: 'Picard', sentOn: '2026-09-22', departure: 'avril 2027' },
      { client: 'Roux', sentOn: '2026-09-25', departure: 'novembre 2026' },
      { client: 'Dupuis', sentOn: '2026-09-28', departure: 'mars 2027' },
      { client: 'Mercier', sentOn: '2026-09-29', departure: 'avril 2027' },
      { client: 'Blanc', sentOn: '2026-09-30', departure: 'avril 2027' },
      { client: 'Gaillard', sentOn: '2026-10-01', departure: 'mars 2027' },
      { client: 'Brunet', sentOn: '2026-10-02', departure: 'avril 2027' },
      { client: 'Moulin', sentOn: '2026-10-02', departure: 'mai 2027' },
    ],
  };

  const pipeline = {
    advisors: [
      { id: 'louis', toProcess: 4, proposals: 9, confirmed: 21, c2026: 15, c2027: 6, travelling: 1 },
      { id: 'ines', toProcess: 4, proposals: 8, confirmed: 11, c2026: 7, c2027: 4, travelling: 2 },
      { id: 'baptiste', toProcess: 5, proposals: 7, confirmed: 16, c2026: 10, c2027: 6, travelling: 1 },
      { id: 'agathe', toProcess: 4, proposals: 10, confirmed: 6, c2026: 4, c2027: 2, travelling: 2 },
      { id: 'yasmine', toProcess: 3, proposals: 7, confirmed: 16, c2026: 12, c2027: 4, travelling: 3 },
    ],
    unassigned: [
      { key: 'aubert', id: 'AM-26-0618', client: 'Famille Aubert', dest: 'Japon', when: 'avril 2027', pax: 4, note: 'enfants de 9 et 12 ans, vacances de printemps', receivedOn: '2026-10-03', source: 'Recommandation (M. et Mme Bertin)', suggested: 'louis' },
      { key: 'collet', id: 'AM-26-0620', client: 'M. et Mme Collet', dest: 'Namibie', when: 'août 2027', pax: 2, note: '', receivedOn: '2026-10-04', source: 'Recherche Google', suggested: 'ines' },
      { key: 'simon', id: 'AM-26-0623', client: 'M. et Mme Simon', dest: 'Patagonie', when: 'février 2027', pax: 2, note: '', receivedOn: '2026-10-05', source: 'Instagram', suggested: 'baptiste' },
    ],
    docsMissing: [
      { key: 'delorme', client: 'Delorme', dest: 'Japon', advisor: 'louis', what: 'passeport d’Antoine', depart: '2026-11-07' },
      { key: 'meyer', client: 'Meyer', dest: 'Japon', advisor: 'louis', what: 'passeport de Mme Meyer', depart: '2026-10-24' },
      { key: 'fontaine', client: 'Fontaine', dest: 'Japon', advisor: 'louis', what: '2 passeports', depart: '2026-11-10' },
      { key: 'girard', client: 'Girard', dest: 'Mexique', advisor: 'baptiste', what: 'attestation d’assurance', depart: '2026-11-05' },
    ],
    toChase: [
      { client: 'Navarro', advisor: 'baptiste', sentOn: '2026-09-19' },
      { client: 'Lambert', advisor: 'louis', sentOn: '2026-09-18' },
      { client: 'Lebrun', advisor: 'agathe', sentOn: '2026-09-20' },
      { client: 'Texier', advisor: 'ines', sentOn: '2026-09-21' },
      { client: 'Rolland', advisor: 'yasmine', sentOn: '2026-09-22' },
      { client: 'Picard', advisor: 'louis', sentOn: '2026-09-22' },
      { client: 'Weber', advisor: 'baptiste', sentOn: '2026-09-23' },
    ],
  };

  const scheduled = [
    { key: 'blanchard-book', at: '2026-10-06T08:00:00+02:00', what: 'Carnet de voyage numérique', who: 'Blanchard · Japon, départ le 21 oct.', rule: 'J-15 à 8 h. Le carnet a été relu par Théo le 5 oct. : un carnet non relu ne part pas.', badge: null },
    { key: 'delorme-reminder', at: '2026-10-07T09:00:00+02:00', what: 'Rappel de solde (J-1)', who: 'Delorme · Japon', rule: 'Rappels à J-7 et J-1 à 9 h, annulés dès que le solde est reçu. Échéance jeu. 8 oct. (J-30).', badge: null },
    { key: 'lucas-reminder', at: '2026-10-08T09:00:00+02:00', what: 'Rappel de solde (J-1)', who: 'Lucas · Oman', rule: 'Échéance J-30 le sam. 10 oct., avancée au vendredi 9. Rappel la veille à 9 h.', badge: null },
    { key: 'fontaine-reminder', at: '2026-10-08T09:00:00+02:00', what: 'Rappel de solde (J-1)', who: 'Fontaine · Japon', rule: 'Échéance J-30 le dim. 11 oct., avancée au vendredi 9.', badge: null },
    { key: 'perrin-survey', at: '2026-10-08T10:00:00+02:00', what: 'Questionnaire de retour', who: 'Perrin · rentrées le mer. 7', rule: 'J+1 à 10 h, une fois rentrés.', badge: null },
    { key: 'meyer-book', at: '2026-10-09T08:00:00+02:00', what: 'Carnet de voyage numérique', who: 'Meyer · départ le 24 oct.', rule: 'J-15 à 8 h. À relire par Théo avant jeudi 18 h.', badge: 'À relire' },
  ];

  const notes = {
    client: [
      { t: 'Louis vous a écrit au sujet de Kyoto.', at: '2026-10-02T16:20:00+02:00', read: false, go: '#/client/messages' },
      { t: 'Rappel : solde de 7 784 € à régler avant le jeudi 8 octobre.', at: '2026-10-01T09:00:00+02:00', read: true, go: '#/client/paiements' },
    ],
    equipe: [
      { t: 'Alerte de Mme Sato : ligne JR Takayama coupée, Garnier (J9/15).', at: '2026-10-04T23:12:00+02:00', read: false, go: '#/equipe/en-voyage' },
      { t: 'Mathilde vous a attribué la demande Hervé (Japon et Corée, mai 2027).', at: '2026-10-05T09:12:00+02:00', read: true, go: '#/equipe/dossiers' },
    ],
    admin: [
      { t: 'Alerte en cours : Garnier (Japon), train supprimé demain.', at: '2026-10-05T09:10:00+02:00', read: false, go: '#/admin/veille' },
      { t: '3 demandes à attribuer.', at: '2026-10-05T08:50:00+02:00', read: true, go: '#/admin/pilotage' },
    ],
  };

  const clients = {
    rules: { nouveau: 'Premier voyage, venu par un autre canal', recommande: 'Premier voyage, recommandé par un client', fidele: '2e voyage', grand: '3 voyages ou plus' },
    segments: [
      { key: 'nouveau', label: 'Nouveaux', dossiers: 48, ca: 452000 },
      { key: 'recommande', label: 'Recommandés', dossiers: 76, ca: 790400 },
      { key: 'fidele', label: 'Fidèles', dossiers: 35, ca: 371000 },
      { key: 'grand', label: 'Grands voyageurs', dossiers: 12, ca: 168000 },
    ],
    named: [
      { name: 'Camille et Antoine Delorme', city: 'Nantes', seg: 'fidele', trips: [[2024, 'Écosse', 6480], [2026, 'Japon', 11120]], next: '7 nov. 2026', note: 'Préfère être appelée après 18 h.', delorme: true },
      { name: 'Hélène et Marc Garnier', city: 'Rennes', seg: 'grand', trips: [[2019, 'Namibie', 9860], [2023, 'Patagonie', 14200], [2026, 'Japon', 12940]], next: 'En voyage' },
      { name: 'Famille Morel', city: 'Paris 7e', seg: 'grand', trips: [[2018, 'Japon', 11400], [2021, 'Islande', 7900], [2024, 'Sri Lanka', 8600], [2026, 'Patagonie', 14100]], next: '6 nov. 2026', note: 'Toujours une chambre au calme, côté cour.' },
      { name: 'Roche', city: 'Lyon', seg: 'recommande', trips: [[2026, 'Namibie', 26400]], next: 'En voyage' },
      { name: 'Lefebvre', city: 'Bordeaux', seg: 'fidele', trips: [[2022, 'Oman', 8300], [2026, 'Ouzbékistan', 9120]], next: 'En voyage' },
      { name: 'Hamel', city: 'Paris 15e', seg: 'nouveau', trips: [[2026, 'Mexique', 10260]], next: 'En voyage' },
      { name: 'Girard', city: 'Lille', seg: 'recommande', trips: [[2026, 'Mexique', 8990]], next: '5 nov. 2026' },
      { name: 'Fontaine', city: 'Versailles', seg: 'fidele', trips: [[2023, 'Italie', 6200], [2026, 'Japon', 12300]], next: '10 nov. 2026' },
      { name: 'Marchand', city: 'Toulouse', seg: 'nouveau', trips: [[2026, 'Japon', 10480]], next: '7 oct. 2026' },
      { name: 'Caron', city: 'Paris 6e', seg: 'fidele', trips: [[2024, 'Norvège', 8450], [2026, 'Japon', 12260]], next: '10 oct. 2026' },
      { name: 'Bertin', city: 'Annecy', seg: 'fidele', trips: [[2025, 'Italie', 5900], [2026, 'Japon', 11740]], next: 'Rentrés (avril)' },
      { name: 'Lenoir', city: 'Strasbourg', seg: 'recommande', trips: [[2026, 'Botswana', 16820]], next: 'En voyage' },
      { name: 'Vidal', city: 'Marseille', seg: 'nouveau', trips: [[2026, 'Jordanie', 6940]], next: 'En voyage' },
    ],
  };

  // Analytics, frozen at 30 September 2026
  const M9 = ['Janv.', 'Févr.', 'Mars', 'Avr.', 'Mai', 'Juin', 'Juil.', 'Août', 'Sept.'];
  const MLONG = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre'];
  const months = [
    [24, 252600, 46226, 22, 231000, 58], [22, 228400, 42254, 21, 214500, 52], [23, 241800, 44491, 21, 219800, 56],
    [18, 186300, 34652, 17, 171200, 43], [17, 172500, 32258, 16, 158900, 41], [15, 151200, 27972, 14, 139400, 36],
    [13, 128700, 24196, 12, 117300, 31], [12, 119600, 22246, 11, 104800, 28], [27, 300300, 53814, 24, 237100, 63],
  ].map(([dossiers, ca, marge, d25, ca25, pax], i) => ({ m: M9[i], long: MLONG[i], dossiers, ca, marge, d25, ca25, pax }));
  const analytics = {
    months,
    margins2025: { 6: 21349, 7: 18864, 8: 42915, h1: 205386 }, // keys = month index (juil. = 6)
    funnel: [['Demandes', 612], ['Appels découverte', 448], ['Propositions', 402], ['Voyages confirmés', 171]],
    funnel2025: { requests: 583, trips: 158 },
    firstProposalDays: 3.2,
    sources: [['Recommandation', 214, 76], ['Clients fidèles', 98, 47], ['Recherche Google', 147, 22], ['Instagram', 61, 7], ['Presse et salons', 49, 9], ['Partenaires', 43, 10]],
    destinations: [
      ['Japon', 38, 84, 471200, 82460], ['Namibie et Botswana', 21, 52, 310800, 60606], ['Italie', 24, 56, 151200, 31752],
      ['Norvège et Islande', 19, 47, 172900, 31122], ['Patagonie', 14, 32, 194600, 33082], ['Oman et Jordanie', 17, 38, 147900, 28101],
      ['Ouzbékistan', 11, 26, 81400, 16280], ['Sri Lanka', 12, 29, 98400, 18696], ['Mexique et Pérou', 15, 44, 153000, 26010],
    ].map(([name, dossiers, pax, ca, marge]) => ({ name, dossiers, pax, ca, marge })),
    matrix: [
      ['Japon', [0, 1, 6, 9, 4, 1, 1, 1, 2, 6, 8, 1], [3, 4, 5, 10, 11]],
      ['Namibie et Botswana', [0, 0, 0, 1, 2, 3, 5, 5, 3, 3, 1, 1], [5, 6, 7, 8, 9, 10]],
      ['Italie', [0, 0, 1, 4, 6, 5, 1, 1, 5, 3, 0, 0], [4, 5, 6, 9, 10]],
      ['Norvège et Islande', [2, 3, 2, 0, 0, 4, 4, 3, 1, 1, 0, 0], [1, 2, 3, 6, 7, 8]],
      ['Patagonie', [4, 3, 2, 0, 0, 0, 0, 0, 0, 1, 3, 2], [1, 2, 3, 11, 12]],
      ['Oman et Jordanie', [2, 3, 3, 2, 0, 0, 0, 0, 0, 3, 4, 3], [1, 2, 3, 4, 10, 11, 12]],
      ['Ouzbékistan', [0, 0, 0, 2, 3, 0, 0, 0, 3, 4, 0, 0], [4, 5, 9, 10]],
      ['Sri Lanka', [3, 3, 2, 1, 0, 0, 1, 1, 0, 0, 1, 2], [1, 2, 3, 12]],
      ['Mexique et Pérou', [2, 2, 3, 2, 3, 2, 3, 3, 1, 1, 2, 1], []],
    ].map(([name, n, season]) => ({ name, n, season })),
    octDeparted: { 'Namibie et Botswana': 1, 'Oman et Jordanie': 1, Ouzbékistan: 1 },
    forward: [['Nov.', 19, 17, 2], ['Déc.', 10, 9, 3], ['Janv.', 4, 3, 6], ['Févr.', 6, 4, 8], ['Mars', 6, 4, 9], ['Avr.', 5, 3, 10], ['Mai', 1, 1, 3]],
    satisfaction: { score: 4.7, answers: 97, returned: 139, leadDays: 142 },
    quotes: [
      ['Louis avait tout prévu, jusqu’à nos valises qui nous attendaient à Kyoto.', 'M. et Mme Bertin, Japon, avril'],
      ['Inès a déplacé notre vol intérieur en une heure, un dimanche.', 'Famille Tessier, Namibie, juillet'],
    ],
  };

  return {
    anchorUTC: '2026-10-05T08:40:00Z',
    company: {
      legal: 'Atelier Méridien SAS · Paris 6e · Immatriculation Atout France IM075 000 000 · Garantie financière et assurance RCP : informations fictives, projet vitrine.',
      phone: '+33 1 99 00 42 17',
      line: 'Des voyages dessinés jour par jour, et quelqu’un au bout du fil jusqu’au retour.',
    },
    people,
    oncall: [
      { from: '2026-09-28', to: '2026-10-05', who: 'agathe' },
      { from: '2026-10-05', to: '2026-10-12', who: 'baptiste' },
      { from: '2026-10-12', to: '2026-10-19', who: 'ines' },
      { from: '2026-10-19', to: '2026-10-26', who: 'louis' },
      { from: '2026-10-26', to: '2026-11-02', who: 'yasmine' },
    ],
    trip,
    travelling,
    garnier,
    departuresWeek,
    balances,
    louis,
    pipeline,
    scheduled,
    october: { sold: 4, amount: 46300, target: 230000 },
    notes,
    clients,
    analytics,
  };
})();
