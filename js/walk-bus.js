// The Octee bus network: six loop routes that start and end at the Octee Central Bus Terminal, lots of bus stops,
// buses built to look like the single-deckers on Singapore's roads (a low-floor MAN A22-style with a destination board,
// two doors on the kerb side and an air-conditioning pod on the roof), arrival times (B) and a route map (K).
// Nothing here is a real bus company: the colours are just colours.
export function createBus(ctx) {
  const { THREE, scene, mat, label, PLAYER, stage, W, H, RB, SOLID, HWY, HWY_H, RAMPS, makeFigure, routePos, ringS, ringLane, LOOP, cars, jm, setMsg } = ctx;

  // ---- the road lanes the routes use (left-hand traffic: keep left) ----
  const LAN_E = 522, LAN_W = 548;          // main street, eastbound (north lane) and westbound (south lane)
  const SO_E = 1010, SO_W = 1026;          // south street
  const SIDE_S = 1656, SIDE_N = 1644;      // the side road at x=1650, southbound and northbound
  const NR_N = RB.x - 9, NR_S = RB.x + 9;  // the roads north of the roundabout... and the one south of it
  const LK_N = 2301, LK_S = 2319;          // the link road to the terminal
  const term = { in: [[LK_S, 575], [LK_S, 735]], loop: [[2095, 735], [2095, 925], [2525, 925], [2525, 735]], out: [[LK_N, 735], [LK_N, 575]] };
  const bayAt = [[2255, 735], [2165, 735], [2095, 835], [2210, 925], [2340, 925], [2460, 925]];   // where each route's bus waits
  const TERM_KERB = 14;
  const circle = (a0, a1, r = 84) => { const out = [], n = Math.max(6, Math.round(Math.abs(a1 - a0) / 10)); for (let i = 0; i <= n; i++) { const a = ((a0 + ((a1 - a0) * i) / n) * Math.PI) / 180; out.push([RB.x + r * Math.cos(a), RB.y + r * Math.sin(a)]); } return out; };

  // a route is a list of legs; a leg is some lane points and how far the stop is to the left of the lane (or null: no stops here)
  const leg = (kerb, ...pts) => ({ kerb, pts });
const named = (l, name) => Object.assign(l, { name });
  const HEAD = [leg(null, ...term.in), leg(null, ...term.loop), leg(null, ...term.out)];
  const ROUTES = [
    { no: "10", name: "Town Circle", col: "#d7282f", col2: "#7a1c1f", bay: 0, n: 3,
      legs: [...HEAD, leg(30, [LK_N, 548], [27 + 60, 548], [27, 548]), leg(20, [27, 548], [27, 1010]), leg(18, [27, SO_E], [SIDE_N, SO_E]), leg(16, [SIDE_N, SO_E], [SIDE_N, 530]), leg(30, [SIDE_N, LAN_E], [LK_S, LAN_E])] },
    { no: "36", name: "FIA Express", col: "#1f6fd1", col2: "#10407a", bay: 1, n: 3,
      legs: [...HEAD, leg(30, [LK_N, 548], [NR_N, 548]), leg(16, [NR_N, 548], [NR_N, 440]), leg(null, ...circle(95, 265)), named(leg(14, [NR_N, 270], [NR_N, 252]), 'FIA Airport'), leg(null, [NR_N, 252], [NR_S, 252]), leg(14, [NR_S, 252], [NR_S, 266]), leg(null, ...circle(275, 445)), leg(16, [NR_S, 440], [NR_S, 530]), leg(30, [NR_S, LAN_E], [LK_S, LAN_E])] },
    { no: "61", name: "Power Station Link", col: "#2e9b4f", col2: "#17572b", bay: 2, n: 2,
      legs: [...HEAD, leg(30, [LK_N, 548], [NR_N, 548]), leg(16, [NR_N, 548], [NR_N, 440]), leg(null, ...circle(95, 175)), named(leg(14, [1196, 359], [1132, 359]), 'Power Station'), leg(null, [1132, 359], [1132, 341]), leg(14, [1132, 341], [1196, 341]), leg(null, ...circle(185, 445)), leg(16, [NR_S, 440], [NR_S, 530]), leg(30, [NR_S, LAN_E], [LK_S, LAN_E])] },
    { no: "88", name: "East Side Loop", col: "#f0a30a", col2: "#8a5a00", bay: 3, n: 3,
      legs: [...HEAD, leg(30, [LK_N, 548], [SIDE_S, 548]), leg(16, [SIDE_S, 548], [SIDE_S, SO_E]), leg(18, [SIDE_S, SO_E], [W - 27, SO_E]), leg(20, [W - 27, SO_E], [W - 27, 548]), leg(30, [W - 27, 548], [LK_S, 548])] },
    { no: "123", name: "Ring Road Express", col: "#7a3fb5", col2: "#43206b", bay: 4, n: 3,
      legs: [...HEAD, leg(30, [LK_N, LAN_E], [W - 9, LAN_E]), leg(14, ...ringLane(ringS(W - 18, 522), LOOP, 9)), leg(30, [W - 9, 548], [LK_S, 548])] },
    { no: "190", name: "Harbour Line", col: "#13a3a8", col2: "#0a5d60", bay: 5, n: 2,
      legs: [...HEAD, leg(30, [LK_N, 548], [SIDE_S, 548]), leg(16, [SIDE_S, 548], [SIDE_S, SO_W]), leg(18, [SIDE_S, SO_W], [9, SO_W]), leg(14, [9, SO_W], [9, LAN_E]), leg(30, [9, LAN_E], [LK_S, LAN_E])] }
  ];

  // ---- the highway express buses: they stay on the highway and stop only at the four ramps ----
  const hwLane = (off, rev) => { const P = HWY, out = P.map((q, i) => { const a = P[(i - 1 + P.length) % P.length], b = P[(i + 1) % P.length]; let dx = b[0] - a[0], dz = b[1] - a[1]; const l = Math.hypot(dx, dz) || 1; dx /= l; dz /= l; return [q[0] + dz * off, q[1] - dx * off]; }); return rev ? out.reverse() : out; };
  ROUTES.push({ no: "506", name: "Highway Express (clockwise)", col: "#c2185b", col2: "#6d0f35", hw: true, elev: HWY_H, vmax: 150, n: 3, legs: [], poly: hwLane(11, false), dir: 1 });
  ROUTES.push({ no: "518", name: "Highway Express (anticlockwise)", col: "#455a64", col2: "#222f35", hw: true, elev: HWY_H, vmax: 150, n: 3, legs: [], poly: hwLane(-11, true), dir: -1 });

  // ---- smooth the corners of a closed route ----
  function roundPoly(P, r) {
    const n = P.length, out = [];
    for (let i = 0; i < n; i++) {
      const pr = P[(i - 1 + n) % n], cu = P[i], nx = P[(i + 1) % n];
      const v1 = [pr[0] - cu[0], pr[1] - cu[1]], v2 = [nx[0] - cu[0], nx[1] - cu[1]], l1 = Math.hypot(...v1), l2 = Math.hypot(...v2);
      if (l1 < 0.01 || l2 < 0.01) continue;
      const u1 = [v1[0] / l1, v1[1] / l1], u2 = [v2[0] / l2, v2[1] / l2], c = u1[0] * u2[0] + u1[1] * u2[1];
      if (c < -0.97) { out.push(cu); continue; }
      const cut = Math.min(r, l1 * 0.45, l2 * 0.45), a = [cu[0] + u1[0] * cut, cu[1] + u1[1] * cut], b = [cu[0] + u2[0] * cut, cu[1] + u2[1] * cut];
      for (let k = 0; k <= 6; k++) { const t = k / 6, m = 1 - t; out.push([m * m * a[0] + 2 * m * t * cu[0] + t * t * b[0], m * m * a[1] + 2 * m * t * cu[1] + t * t * b[1]]); }
    }
    return out;
  }
  const nearest = (poly, x, y) => {                       // distance along a closed polyline to the point nearest (x, y)
    let best = 1e12, bs = 0, acc = 0;
    for (let i = 0; i < poly.length; i++) {
      const a = poly[i], b = poly[(i + 1) % poly.length], dx = b[0] - a[0], dy = b[1] - a[1], l2 = dx * dx + dy * dy || 1;
      const t = Math.max(0, Math.min(1, ((x - a[0]) * dx + (y - a[1]) * dy) / l2)), px = a[0] + dx * t, py = a[1] + dy * t, d = (px - x) ** 2 + (py - y) ** 2;
      if (d < best) { best = d; bs = acc + Math.sqrt(l2) * t; }
      acc += Math.sqrt(l2);
    }
    return bs;
  };

  // ---- the stops ----
  const stops = [];
  const names = new Map();
  const buildingName = (x, y) => { let best = null, bd = 1e12; for (const s of SOLID) { const d = Math.hypot(x - (s.x + s.w / 2), y - (s.y + s.h / 2)) - Math.max(s.w, s.h) / 2; if (d < bd) { bd = d; best = s; } } return best ? best.name : "Octee City"; };
  function stopAt(x, y, hx, hy, kerb, fixedName, elev = 0) {
    for (const s of stops) if (!fixedName && Math.hypot(s.lx - x, s.ly - y) < 50 && s.hx * hx + s.hy * hy > 0.5) return s;
    const px = x + hy * kerb, py = y - hx * kerb;           // to the left of the lane
    let name = fixedName;
    if (!name) { const base = buildingName(px, py), k = names.get(base) || 0; names.set(base, k + 1); name = k === 0 ? base : k === 1 ? "Opp " + base : `${base} ${k}`; }
    const code = String(10000 + ((stops.length * 7919 + 1301) % 89999)).padStart(5, "0");
    const st = { x: px, y: py, lx: x, ly: y, hx, hy, name, code, routes: [], elev };
    stops.push(st); return st;
  }
  for (const r of ROUTES) {
    if (r.hw) {                                   // express: smooth already, a stop at each ramp
      r.route = ctx.makeRoute(r.poly); r.stops = [];
      for (const rp of RAMPS) {
        let bi = 0, bd = 1e12; HWY.forEach((q, i) => { const d = (q[0] - rp.x1) ** 2 + (q[1] - rp.y1) ** 2; if (d < bd) { bd = d; bi = i; } });
        const i = (bi + r.dir * 5 + HWY.length * 2) % HWY.length, j = (i + 1) % HWY.length, k = (i - 1 + HWY.length) % HWY.length;
        let hx = HWY[j][0] - HWY[k][0], hy = HWY[j][1] - HWY[k][1]; const hl = Math.hypot(hx, hy) || 1; hx = (hx / hl) * r.dir; hy = (hy / hl) * r.dir;
        const lane = r.dir > 0 ? r.poly[i] : r.poly[HWY.length - 1 - i];
        const st = stopAt(lane[0], lane[1], hx, hy, 11, "Highway, " + rp.name, HWY_H);
        st.routes.push(r); r.stops.push({ stop: st, s: nearest(r.poly, st.lx, st.ly) });
      }
      r.stops.sort((a, b) => a.s - b.s);
      continue;
    }
    const raw = [].concat(...r.legs.map((l) => l.pts));
    r.poly = roundPoly(raw, 22);
    r.route = ctx.makeRoute(r.poly);
    r.stops = [];
    r.legs.forEach((l, li) => {
      if (l.kerb == null) return;
      let total = 0; const seg = [];
      for (let i = 0; i + 1 < l.pts.length; i++) { const len = Math.hypot(l.pts[i + 1][0] - l.pts[i][0], l.pts[i + 1][1] - l.pts[i][1]); seg.push([l.pts[i], l.pts[i + 1], len, total]); total += len; }
      if (total < 50) return;
      const spots = l.name ? [total / 2] : total < 240 ? [total / 2] : (() => { const a = []; for (let t = 120; t < total - 110; t += 230) a.push(t); return a; })();
      for (const t of spots) {
        const g = seg.find((s) => t <= s[3] + s[2]) || seg[seg.length - 1], f = (t - g[3]) / g[2], x = g[0][0] + (g[1][0] - g[0][0]) * f, y = g[0][1] + (g[1][1] - g[0][1]) * f;
        const hx = (g[1][0] - g[0][0]) / g[2], hy = (g[1][1] - g[0][1]) / g[2];
        const st = stopAt(x, y, hx, hy, l.kerb, l.name);
        if (!st.routes.includes(r)) { st.routes.push(r); r.stops.push({ stop: st, s: nearest(r.poly, st.lx, st.ly) }); }
      }
    });
    // this route's own bay in the terminal
    const [bx, by] = bayAt[r.bay];
    const hd = r.bay < 2 ? [-1, 0] : r.bay === 2 ? [0, 1] : [1, 0];
    const bst = stopAt(bx, by, hd[0], hd[1], TERM_KERB, `Octee Central Bus Terminal, Bay ${r.bay + 1}`);
    bst.bay = true; bst.routes.push(r); r.stops.push({ stop: bst, s: nearest(r.poly, bst.lx, bst.ly) });
    r.stops.sort((a, b) => a.s - b.s);
  }

  // ---- what a stop looks like: a pole with a sign, a shelter, a bench, and sometimes someone waiting ----
  const signMat = (txt) => { const m = label(txt, { size: 30, bg: "rgba(20,60,150,.96)", fg: "#fff" }); return m; };
  for (const [i, st] of stops.entries()) {
    const g = new THREE.Group();
    g.position.set(st.x, st.elev || 0, st.y); g.rotation.y = Math.atan2(st.hx, st.hy);
    const roof = new THREE.Mesh(new THREE.BoxGeometry(8, 1.6, 26), mat(st.bay ? "#c62828" : "#2b4b8a")); roof.position.set(4, 24, -2); roof.castShadow = true; g.add(roof);
    const back = new THREE.Mesh(new THREE.BoxGeometry(0.8, 18, 24), mat("#a9d4ee", { transparent: true, opacity: 0.55 })); back.position.set(8, 14, -2); g.add(back);
    for (const z of [-13, 9]) { const p = new THREE.Mesh(new THREE.BoxGeometry(1.4, 24, 1.4), mat("#444")); p.position.set(0.5, 12, z); g.add(p); }
    const bench = new THREE.Mesh(new THREE.BoxGeometry(4, 1.6, 14), mat("#8b5a2b")); bench.position.set(5.5, 6, -3); bench.castShadow = true; g.add(bench);
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.9, 40, 8), mat("#cfd3d8")); pole.position.set(-3, 20, 13); pole.castShadow = true; g.add(pole);
    const plate = new THREE.Mesh(new THREE.BoxGeometry(1.2, 9, 7), mat("#1f4fa8")); plate.position.set(-3, 38, 13); g.add(plate);
    const lbl = label(st.name, { size: 28, bg: "rgba(255,255,255,.96)" }); lbl.scale.multiplyScalar(0.28); lbl.position.set(2, 33, 2); g.add(lbl);
    scene.add(g);
    st.g = g;
    if (i % 3 === 0 && !st.bay && !st.elev) { const f = makeFigure(["#e4572e", "#17bebb", "#ffc914", "#76b041"][i % 4]); const c = Math.cos(g.rotation.y), s = Math.sin(g.rotation.y); f.position.set(st.x + (5 * c + 2 * s), 0, st.y + (-5 * s + 2 * c)); f.rotation.y = g.rotation.y - Math.PI / 2; }
  }

  // ---- the bus: a single-decker, low floor, two doors on the left (kerb) side ----
  const ledTex = (txt, col) => { const c = document.createElement("canvas"); c.width = 256; c.height = 64; const g = c.getContext("2d"); g.fillStyle = "#101214"; g.fillRect(0, 0, 256, 64); g.fillStyle = col; g.font = "bold 40px monospace"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(txt, 128, 34); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; };
  const glass = mat("#27343f", { roughness: 0.15, metalness: 0.5 }), dark = mat("#1b1d20"), wheelM = mat("#17181a");
  function buildBus(r) {
    const g = new THREE.Group();
    const box = (w, h, d, x, y, z, m, cast = true) => { const o = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); o.position.set(x, y, z); o.castShadow = cast; g.add(o); return o; };
    box(12.4, 12.2, 50, 0, 9.4, 0, mat("#f4f6f8", { roughness: 0.4 }));                 // white body
    box(12.6, 2.6, 50.2, 0, 5.1, 0, mat(r.col, { roughness: 0.4 }), false);              // the coloured band low down
    box(12.6, 1.1, 50.2, 0, 14.5, 0, mat(r.col2, { roughness: 0.4 }), false);            // and a darker line under the roof
    box(12.55, 4.8, 36, 0, 10.8, -3, glass, false);                                      // side windows (both sides)
    box(11.4, 6.4, 0.6, 0, 10.2, 25.1, glass, false);                                    // big windscreen
    box(10, 2.7, 0.5, 0, 14.4, 25.2, new THREE.MeshBasicMaterial({ map: ledTex(r.no + " " + r.name.toUpperCase().slice(0, 9), "#ffb000") }), false);   // destination board
    box(5, 2.7, 0.5, 0, 14.4, -25.2, new THREE.MeshBasicMaterial({ map: ledTex(r.no, "#ffb000") }), false);                                           // rear number
    const side = new THREE.Mesh(new THREE.PlaneGeometry(6, 1.6), new THREE.MeshBasicMaterial({ map: ledTex(r.no, "#ffb000") })); side.position.set(6.31, 13.1, 19); side.rotation.y = Math.PI / 2; g.add(side);
    for (const z of [15, -4]) box(0.5, 8.2, 5.4, 6.25, 8.2, z, mat("#35607f", { roughness: 0.2, metalness: 0.4 }), false);   // two doors on the left side
    box(8, 2.2, 22, 0, 16.6, -12, mat("#dfe3e8"));                                       // air-conditioning pod on the roof
    box(12.8, 2.2, 1.2, 0, 3.6, 25.3, dark); box(12.8, 2.2, 1.2, 0, 3.6, -25.3, dark);    // bumpers
    for (const x of [-4.6, 4.6]) { box(2, 1.4, 0.4, x, 5.6, 25.4, new THREE.MeshStandardMaterial({ color: "#fff6c8", emissive: "#ffe9a0", emissiveIntensity: 1.1 }), false); box(2, 1.4, 0.4, x, 5.6, -25.4, new THREE.MeshStandardMaterial({ color: "#a00", emissive: "#f00", emissiveIntensity: 0.9 }), false); }
    for (const z of [16, -15]) for (const x of [-6.2, 6.2]) { const w = new THREE.Mesh(new THREE.CylinderGeometry(3.7, 3.7, 2.2, 14), wheelM); w.rotation.z = Math.PI / 2; w.position.set(x, 3.7, z); w.castShadow = true; g.add(w); }
    scene.add(g); return g;
  }

  // ---- the buses ----
  const buses = [];
  for (const r of ROUTES) for (let i = 0; i < r.n; i++) {
    const s0 = (i / r.n) * r.route.L + (ROUTES.indexOf(r) * 97) % 200;
    const b = { r, route: r.route, g: buildBus(r), s: s0, v: 0, vmax: r.vmax || 62, hd: 0, state: "go", t: 0, si: 0 };
    let bi = 0, bd = 1e12; r.stops.forEach((q, k) => { const d = (q.s - s0 + r.route.L) % r.route.L; if (d < bd) { bd = d; bi = k; } }); b.si = bi;
    buses.push(b);
  }

  // ---- driving ----
  function update(dt) {
    const pts = [...cars.map((o) => ({ x: o.g.position.x, y: o.g.position.z, e: o.elev || 0, o })), { x: jm.position.x, y: jm.position.z, e: 0 }, ...(PLAYER.riding || S.ride ? [] : [{ x: PLAYER.x, y: PLAYER.y, e: PLAYER.gy }])];
    for (const b of buses) {
      const r = b.r, L = r.route.L, st = r.stops[b.si], p = routePos(r.route, b.s), q = routePos(r.route, b.s + 40);
      let d = (st.s - b.s + L) % L; if (d > L - 4) d = 0;
      if (b.state === "dwell") { b.t -= dt; b.v = 0; if (b.t <= 0) { b.state = "go"; b.si = (b.si + 1) % r.stops.length; b.leftAt = b.s; } }
      else {
        let target = b.vmax;
        if (d < 110) target = Math.min(target, Math.max(7, d * 0.55));
        const bend = Math.abs(Math.atan2(p.hx * q.hy - p.hy * q.hx, p.hx * q.hx + p.hy * q.hy));
        if (bend > 0.5) target = Math.min(target, 22);
        let gap = Infinity;
        for (const o of pts) { if (o.o && o.o.g === b.g) continue; if (Math.abs((o.e || 0) - (r.elev || 0)) > 14) continue; const px = o.x - p.x, pz = o.y - p.y, ahead = px * p.hx + pz * p.hy, side = Math.abs(-px * p.hy + pz * p.hx); if (ahead > 0 && ahead < 90 && side < 14) gap = Math.min(gap, ahead); }
        for (const o of buses) { if (o === b || Math.abs((o.r.elev || 0) - (r.elev || 0)) > 14) continue; const px = o.g.position.x - p.x, pz = o.g.position.z - p.y, ahead = px * p.hx + pz * p.hy, side = Math.abs(-px * p.hy + pz * p.hx); if (ahead > 0 && ahead < 90 && side < 14) gap = Math.min(gap, ahead); }
        if (gap < 44) target = 0; else if (gap < 90) target = Math.min(target, (b.vmax * (gap - 44)) / 46);
        b.v += (target - b.v) * Math.min(1, dt * (target < b.v ? 4.5 : 1.2));
        b.s += b.v * dt;
        const d2 = (st.s - b.s + L) % L;
        if ((d2 < 3 || d2 > L - 4) && b.v < 14 && !(b.leftAt != null && Math.abs(b.s - b.leftAt) < 20)) { b.state = "dwell"; b.t = 7 + (b.si % 3) * 1.5; b.v = 0; b.s = st.s; }
      }
      const np = routePos(r.route, b.s);
      b.g.position.set(np.x, r.elev || 0, np.y);
      const want = Math.atan2(np.hx, np.hy); let dd = want - b.hd; dd = Math.atan2(Math.sin(dd), Math.cos(dd)); b.hd += dd * Math.min(1, dt * 5); b.g.rotation.y = b.hd;
    }
    if (S.ride) { PLAYER.x = S.ride.g.position.x; PLAYER.y = S.ride.g.position.z; PLAYER.gy = S.ride.r.elev || 0; PLAYER.hop = 0; PLAYER.vh = 0; }
  }

  // ---- timings ----
  const dwellNow = (b) => b.state === "dwell" ? r2stop(b) : null;
  const r2stop = (b) => b.r.stops[b.si].stop;
  function etaTo(b, stop) {
    const r = b.r, L = r.route.L, ent = r.stops.find((q) => q.stop === stop); if (!ent) return null;
    if (b.state === "dwell" && r.stops[b.si].stop === stop) return 0;
    const dist = (ent.s - b.s + L) % L; let between = 0;
    for (const q of r.stops) { const dq = (q.s - b.s + L) % L; if (dq > 1 && dq < dist - 1) between++; }
    return dist / 34 + between * 7.5;
  }
  const fmt = (t) => (t < 12 ? "Arr" : t < 60 ? "<1 min" : Math.round(t / 60) + " min");
  function stopNear(maxD = 62) { let best = null, bd = maxD; for (const s of stops) { if (Math.abs(PLAYER.gy - (s.elev || 0)) > 22) continue; const d = Math.hypot(PLAYER.x - s.x, PLAYER.y - s.y); if (d < bd) { bd = d; best = s; } } return best; }

  // ---- panels ----
  const panel = document.createElement("div");
  panel.hidden = true;
  panel.style.cssText = "position:absolute;left:12px;top:12px;background:#fff;color:#222;padding:10px 12px;border-radius:10px;max-width:340px;max-height:88%;overflow:auto;box-shadow:0 4px 16px rgba(0,0,0,.25);font:14px/1.35 system-ui,sans-serif;z-index:6";
  stage.appendChild(panel);
  const mk = (tag, props = {}, ...kids) => { const e = Object.assign(document.createElement(tag), props); for (const k of kids) e.append(k); return e; };
  let panelKind = null, panelStop = null, tick = 0;
  const close = () => { panel.hidden = true; panelKind = null; };
  function drawArrivals() {
    const st = panelStop; if (!st) return close();
    const kids = [mk("strong", { textContent: st.name }), mk("div", { textContent: `Stop ${st.code}`, style: "color:#666;font-size:12px;margin-bottom:6px" })];
    const rows = [];
    for (const r of st.routes) {
      const ts = buses.filter((b) => b.r === r).map((b) => etaTo(b, st)).filter((t) => t != null).sort((a, b) => a - b);
      rows.push([r, ts]);
    }
    rows.sort((a, b) => (a[1][0] ?? 1e9) - (b[1][0] ?? 1e9));
    for (const [r, ts] of rows) {
      const row = mk("div", { style: "display:flex;align-items:center;gap:8px;margin:5px 0;padding:5px 6px;border-radius:6px;background:#f3f5f7" });
      row.append(mk("span", { textContent: r.no, style: `background:${r.col};color:#fff;font-weight:700;border-radius:5px;padding:2px 7px;min-width:34px;text-align:center` }), mk("span", { textContent: r.name, style: "flex:1" }), mk("span", { textContent: ts.slice(0, 2).map(fmt).join("  "), style: "font-weight:700;font-variant-numeric:tabular-nums" }));
      kids.push(row);
    }
    kids.push(mk("p", { textContent: "Times are estimates. A bus that is at the stop shows Arr. Press E to board when it is here.", style: "margin:8px 0 0;color:#666;font-size:12px" }), mk("p", { textContent: "Press B or Esc to close.", style: "margin:2px 0 0;color:#666;font-size:12px" }));
    panel.replaceChildren(...kids); panel.hidden = false;
  }
  function showArrivals() {
    if (panelKind === "arr") return close();
    const st = stopNear(); if (!st) { setMsg("Walk to a bus stop and press B to see when the buses come."); return; }
    panelKind = "arr"; panelStop = st; drawArrivals();
  }
  function showRoutes() {
    if (panelKind === "routes") return close();
    panelKind = "routes";
    const kids = [mk("strong", { textContent: "Octee bus routes" }), mk("p", { textContent: "Every route is a loop that starts and ends at the Octee Central Bus Terminal. Buses wait at every stop, so you must wait for one.", style: "margin:6px 0;color:#444;font-size:13px" })];
    for (const r of ROUTES) {
      const names = r.stops.filter((q) => !q.stop.bay).map((q) => q.stop.name);
      const d = mk("details", { style: "margin:5px 0" });
      d.append(mk("summary", { textContent: `${r.no}  ${r.name}  (${r.hw ? names.length : names.length + 1} stops)`, style: `cursor:pointer;font-weight:700;border-left:8px solid ${r.col};padding-left:6px` }), mk("div", { textContent: (r.hw ? "Express on the highway, stopping only at the ramps: " + names.join(" → ") : "Terminal Bay " + (r.bay + 1) + " → " + names.join(" → ") + " → back to the terminal"), style: "font-size:12.5px;color:#444;margin:4px 0 4px 14px" }));
      kids.push(d);
    }
    kids.push(mk("p", { textContent: "Press K or Esc to close. Press B at a stop for arrival times.", style: "margin:8px 0 0;color:#666;font-size:12px" }));
    panel.replaceChildren(...kids); panel.hidden = false;
  }

  // ---- getting on and off ----
  const S = { ride: null };
  function board() {
    const st = stopNear(70); if (!st) return false;
    const b = buses.find((x) => x.state === "dwell" && r2stop(x) === st);
    if (!b) { setMsg("No bus is here yet. Press B to see when they come."); return true; }
    S.ride = b; close(); setMsg(`You got on the ${b.r.no}. It goes round the loop and stops at every stop. Press E to get off when it is stopped.`); return true;
  }
  function alight() {
    const b = S.ride; if (!b) return false;
    if (b.state !== "dwell") { setMsg("Wait until the bus has stopped."); return true; }
    const st = r2stop(b); S.ride = null;
    PLAYER.x = st.x + st.hy * 4; PLAYER.y = st.y - st.hx * 4; PLAYER.gy = st.elev || 0;
    setMsg("You got off at " + st.name + ".");
    return true;
  }
  return {
    ROUTES, stops, buses, S,
    get riding() { return !!S.ride; },
    update(dt) { update(dt); tick += dt; if (panelKind === "arr" && tick > 1) { tick = 0; drawArrivals(); } },
    action() { if (!panel.hidden && panelKind) { close(); return true; } if (S.ride) return alight(); return board(); },
    showArrivals, showRoutes, close,
    get panelOpen() { return !panel.hidden; },
    boardable() { if (S.ride) return true; const st = stopNear(70); return !!st && buses.some((x) => x.state === "dwell" && r2stop(x) === st); },
    nearStop: () => !!stopNear(70),
    prompt() {
      if (S.ride) { const b = S.ride; return b.state === "dwell" ? `Bus ${b.r.no}: stopped at ${r2stop(b).name}. Press E to get off.` : `Bus ${b.r.no} ${b.r.name}. Next stop: ${b.r.stops[b.si].stop.name}`; }
      const st = stopNear(70); if (!st) return "";
      const b = buses.find((x) => x.state === "dwell" && r2stop(x) === st);
      return b ? `Bus ${b.r.no} is here. Press E to get on. B times, K routes.` : `${st.name}. Wait for a bus. B arrival times, K routes.`;
    }
  };
}
