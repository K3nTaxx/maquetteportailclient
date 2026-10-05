/* sun.js: solar geometry for Atelier Méridien (spec §7.0, §7.4, §2.2).
   NOAA spreadsheet / Meeus low-precision formulas. Pure functions, no DOM.
   Every time argument accepts epoch ms, a Date or an ISO string.
   Exposes window.SUN:
     solar(t)                         -> { dec (deg), E (min) }
     riseSet('YYYY-MM-DD', lat, lon, tz) -> { rise: 'HH:MM', set: 'HH:MM', dayMinutes, noon: 'HH:MM' }
                                         (polar cases: rise/set '—', dayMinutes 0 or 1440, polar: 'night'|'day')
     subsolar(t)                      -> { lat, lon }
     elevation(t, lat, lon)           -> deg (geometric, refraction ignored)
     nightPath(t, project, w, h)      -> SVG d of the night polygon
     terminatorLine(t, project)       -> SVG d of the terminator polyline
     analemmaDot(t)                   -> { cx, cy } in the 32-unit logo frame
     haversine(lat1, lon1, lat2, lon2) -> km (R = 6371)
     greatCircle(lat1, lon1, lat2, lon2, n = 64) -> n points [[lat, lon], …], endpoints included
     localTime(t, tz)                 -> 'HH:MM' (24 h, fr-FR) */
(() => {
  'use strict';

  const RAD = Math.PI / 180;
  const DEG = 180 / Math.PI;
  const MIN_MS = 60000;
  const HOUR_MS = 3600000;
  const DAY_MS = 86400000;
  const R_EARTH = 6371; // km, mean radius
  const HORIZON = -0.833; // deg, sunrise/sunset altitude (refraction + half disc)

  const sin = (d) => Math.sin(d * RAD);
  const cos = (d) => Math.cos(d * RAD);
  const tan = (d) => Math.tan(d * RAD);
  const mod = (a, n) => ((a % n) + n) % n;
  const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
  const wrapLon = (l) => mod(l + 180, 360) - 180;
  const r2 = (v) => Math.round(v * 100) / 100;
  const roundMin = (ms) => Math.round(ms / MIN_MS) * MIN_MS;
  const toMs = (t) => (typeof t === 'string' ? Date.parse(t) : +t);

  // ---- Time zone helpers (Intl only) ----

  const hmCache = {};
  const partsCache = {};

  // 'HH:MM' in tz, 24 h, fr-FR
  function hm(ms, tz) {
    const zone = tz || 'UTC';
    let f = hmCache[zone];
    if (!f) {
      f = hmCache[zone] = new Intl.DateTimeFormat('fr-FR', {
        timeZone: zone, hour: '2-digit', minute: '2-digit', hourCycle: 'h23'
      });
    }
    let h = '00';
    let m = '00';
    for (const p of f.formatToParts(new Date(ms))) {
      if (p.type === 'hour') h = p.value;
      else if (p.type === 'minute') m = p.value;
    }
    if (h === '24') h = '00'; // old engines without hourCycle support
    return h.padStart(2, '0') + ':' + m.padStart(2, '0');
  }

  // Wall-clock fields of an instant in tz
  function wall(ms, tz) {
    let f = partsCache[tz];
    if (!f) {
      f = partsCache[tz] = new Intl.DateTimeFormat('en-US', {
        timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit',
        hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23'
      });
    }
    const o = {};
    for (const p of f.formatToParts(new Date(ms))) {
      if (p.type !== 'literal') o[p.type] = +p.value;
    }
    if (o.hour === 24) o.hour = 0;
    return o;
  }

  // UTC offset of tz at an instant, in minutes (Paris summer = +120)
  function offsetMin(ms, tz) {
    const w = wall(ms, tz);
    const asUTC = Date.UTC(w.year, w.month - 1, w.day, w.hour, w.minute, w.second);
    return Math.round((asUTC - Math.floor(ms / 1000) * 1000) / MIN_MS);
  }

  // 00:00 UTC of a 'YYYY-MM-DD' date
  function dayUTC(iso) {
    const [y, m, d] = String(iso).slice(0, 10).split('-').map(Number);
    return Date.UTC(y, m - 1, d);
  }

  // ---- Solar position (NOAA spreadsheet / Meeus) ----

  function solar(t) {
    const ms = toMs(t);
    const jd = ms / DAY_MS + 2440587.5;
    const T = (jd - 2451545) / 36525; // Julian centuries since J2000.0
    const L0 = mod(280.46646 + T * (36000.76983 + T * 0.0003032), 360); // mean longitude
    const M = 357.52911 + T * (35999.05029 - 0.0001537 * T); // mean anomaly
    const e = 0.016708634 - T * (0.000042037 + 0.0000001267 * T); // orbit eccentricity
    const C = sin(M) * (1.914602 - T * (0.004817 + 0.000014 * T)) +
      sin(2 * M) * (0.019993 - 0.000101 * T) +
      sin(3 * M) * 0.000289; // equation of centre
    const trueLon = L0 + C;
    const omega = 125.04 - 1934.136 * T; // ascending node of the Moon
    const appLon = trueLon - 0.00569 - 0.00478 * sin(omega); // apparent longitude
    const eps0 = 23 + (26 + (21.448 - T * (46.815 + T * (0.00059 - T * 0.001813))) / 60) / 60;
    const eps = eps0 + 0.00256 * cos(omega); // corrected obliquity
    const dec = Math.asin(clamp(sin(eps) * sin(appLon), -1, 1)) * DEG;
    const y = tan(eps / 2) ** 2;
    const E = 4 * DEG * (
      y * sin(2 * L0) -
      2 * e * sin(M) +
      4 * e * y * sin(M) * cos(2 * L0) -
      0.5 * y * y * sin(4 * L0) -
      1.25 * e * e * sin(2 * M)
    ); // equation of time, minutes
    return { dec, E };
  }

  // ---- Sunrise / sunset ----

  function riseSet(dateISO, lat, lon, tz = 'Europe/Paris') {
    const day0 = dayUTC(dateISO);
    // First guess at 12:00 local mean time, then one pass at the solar-noon instant
    let s = solar(day0 + (720 - 4 * lon) * MIN_MS);
    let noon = 720 - 4 * lon - s.E; // UTC minutes from day0
    s = solar(day0 + noon * MIN_MS);
    noon = 720 - 4 * lon - s.E;
    const noonMs = roundMin(day0 + noon * MIN_MS);
    const cosH = (sin(HORIZON) - sin(lat) * sin(s.dec)) / (cos(lat) * cos(s.dec));
    if (cosH >= 1) return { rise: '—', set: '—', dayMinutes: 0, noon: hm(noonMs, tz), polar: 'night' };
    if (cosH <= -1) return { rise: '—', set: '—', dayMinutes: 1440, noon: hm(noonMs, tz), polar: 'day' };
    const H = Math.acos(cosH) * DEG; // half day arc, degrees
    const riseMs = roundMin(day0 + (noon - 4 * H) * MIN_MS);
    const setMs = roundMin(day0 + (noon + 4 * H) * MIN_MS);
    return {
      rise: hm(riseMs, tz),
      set: hm(setMs, tz),
      dayMinutes: Math.round((setMs - riseMs) / MIN_MS), // matches the displayed times
      noon: hm(noonMs, tz)
    };
  }

  // ---- Subsolar point and elevation ----

  function subsolar(t) {
    const ms = toMs(t);
    const { dec, E } = solar(ms);
    const utcH = mod(ms, DAY_MS) / HOUR_MS;
    // E in minutes x 0.25 gives degrees
    return { lat: dec, lon: wrapLon(-15 * (utcH - 12) - E * 0.25) };
  }

  function elevation(t, lat, lon) {
    const s = subsolar(t);
    const H = lon - s.lon; // hour angle, degrees
    const sinEl = sin(lat) * sin(s.lat) + cos(lat) * cos(s.lat) * cos(H);
    return Math.asin(clamp(sinEl, -1, 1)) * DEG;
  }

  // ---- Night layer (spec §7.4 steps 1-3) ----

  // 73 terminator points, lon -180..180 step 5, projected
  function terminator(t, project) {
    const s = subsolar(t);
    let dec = s.lat;
    if (Math.abs(dec) < 0.1) dec = dec < 0 ? -0.1 : 0.1; // avoid tan(0)
    const td = tan(dec);
    const pts = [];
    for (let i = 0; i <= 72; i++) {
      const l = -180 + i * 5;
      const phi = Math.atan(-cos(l - s.lon) / td) * DEG;
      pts.push(project(phi, l));
    }
    return { pts, dec };
  }

  const pt = (p) => r2(p[0]) + ',' + r2(p[1]);
  const polyline = (pts) => 'M' + pts.map(pt).join('L');

  function terminatorLine(t, project) {
    return polyline(terminator(t, project).pts);
  }

  // w is kept for the contract signature; the polygon closes at the projected x of lon ±180
  function nightPath(t, project, w, h) {
    const { pts, dec } = terminator(t, project);
    const poleY = dec < 0 ? 0 : h; // δ < 0: North Pole in night, close along the top
    const first = pts[0];
    const last = pts[pts.length - 1];
    return polyline(pts) + 'L' + r2(last[0]) + ',' + r2(poleY) + 'L' + r2(first[0]) + ',' + r2(poleY) + 'Z';
  }

  // ---- Logo day dot (spec §2.2) ----

  // 12:00 Europe/Paris on the Paris date of t
  function parisNoon(t) {
    const w = wall(toMs(t), 'Europe/Paris');
    const guess = Date.UTC(w.year, w.month - 1, w.day, 12);
    return guess - offsetMin(guess, 'Europe/Paris') * MIN_MS;
  }

  function analemmaDot(t) {
    const { dec, E } = solar(parisNoon(t));
    return { cx: r2(16 + 0.42 * E), cy: r2(16 - 0.42 * dec) };
  }

  // ---- Distances and arcs ----

  function haversine(lat1, lon1, lat2, lon2) {
    const dLat = (lat2 - lat1) * RAD;
    const dLon = (lon2 - lon1) * RAD;
    const a = Math.sin(dLat / 2) ** 2 + cos(lat1) * cos(lat2) * Math.sin(dLon / 2) ** 2;
    return 2 * R_EARTH * Math.asin(Math.min(1, Math.sqrt(a)));
  }

  const vec = (lat, lon) => [cos(lat) * cos(lon), cos(lat) * sin(lon), sin(lat)];

  // Slerp of 3D unit vectors; n points including both endpoints
  function greatCircle(lat1, lon1, lat2, lon2, n = 64) {
    const count = Math.max(2, Math.round(n));
    const a = vec(lat1, lon1);
    const b = vec(lat2, lon2);
    const om = Math.acos(clamp(a[0] * b[0] + a[1] * b[1] + a[2] * b[2], -1, 1));
    const so = Math.sin(om);
    const out = [];
    for (let i = 0; i < count; i++) {
      if (i === 0) { out.push([lat1, lon1]); continue; }
      if (i === count - 1) { out.push([lat2, lon2]); continue; }
      const f = i / (count - 1);
      const k1 = so < 1e-9 ? 1 - f : Math.sin((1 - f) * om) / so;
      const k2 = so < 1e-9 ? f : Math.sin(f * om) / so;
      const x = k1 * a[0] + k2 * b[0];
      const y = k1 * a[1] + k2 * b[1];
      const z = k1 * a[2] + k2 * b[2];
      out.push([Math.atan2(z, Math.hypot(x, y)) * DEG, Math.atan2(y, x) * DEG]);
    }
    return out;
  }

  // ---- Clock ----

  function localTime(t, tz) {
    return hm(toMs(t), tz);
  }

  window.SUN = Object.freeze({
    solar, riseSet, subsolar, elevation, nightPath, terminatorLine,
    analemmaDot, haversine, greatCircle, localTime
  });
})();
