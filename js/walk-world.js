// The big outdoors: the hiking trail up the biggest mountain (steps, lights, logs to jump over, a summit), and the highway
// that goes all the way round the town on pillars, with cars on it and arched bridges where it crosses the rivers.
export function createWorld(ctx) {
  const { THREE, scene, mat, label, addLamp, ribbon, ribbonGeo, dashAlong, HIKE, TRAIL, TRAIL_W, JUMPS, HWY, HWY_H, RAMPS, RIVER_N, RIVER_S, cars, makeCar, makeRoute, W, H, HWY_TUN, TUN_CROWN } = ctx;

  // ---- the hiking trail ----
  {
    const stepGeo = new THREE.BoxGeometry(TRAIL_W * 2 + 2, 7, 5.4);
    const steps = new THREE.InstancedMesh(stepGeo, new THREE.MeshStandardMaterial({ color: "#a89a82", roughness: 0.9 }), TRAIL.length);
    const edge = new THREE.InstancedMesh(new THREE.BoxGeometry(3, 5, 5.6), new THREE.MeshStandardMaterial({ color: "#5c4a33", roughness: 0.9 }), TRAIL.length * 2);
    const d = new THREE.Object3D(); let ne = 0;
    TRAIL.forEach((t, i) => {
      const n = TRAIL[Math.min(TRAIL.length - 1, i + 1)], p = TRAIL[Math.max(0, i - 1)];
      const ang = Math.atan2(n.y - p.y, n.x - p.x);
      // each step is a slab whose top is the ground you stand on: successive steps rise a little, so it climbs like a stair
      d.position.set(t.x, t.h + 1.5 - 3.5 + 0.1, t.y); d.rotation.set(0, -ang + Math.PI / 2, 0); d.scale.set(1, 1, 1); d.updateMatrix(); steps.setMatrixAt(i, d.matrix);
      for (const sg of [-1, 1]) { const ox = Math.cos(ang + Math.PI / 2) * (TRAIL_W + 1) * sg, oz = Math.sin(ang + Math.PI / 2) * (TRAIL_W + 1) * sg; d.position.set(t.x + ox, t.h + 3, t.y + oz); d.rotation.set(0, -ang + Math.PI / 2, 0); d.updateMatrix(); edge.setMatrixAt(ne++, d.matrix); }
    });
    steps.castShadow = true; steps.receiveShadow = true; edge.castShadow = true; edge.count = ne;
    scene.add(steps, edge);
    // lights along the trail: a lamp every 60 steps or so, alternating sides. They glow at night (see N).
    for (let i = 20; i < TRAIL.length - 6; i += 22) {
      const t = TRAIL[i], n = TRAIL[Math.min(TRAIL.length - 1, i + 1)], p = TRAIL[i - 1];
      const ang = Math.atan2(n.y - p.y, n.x - p.x), sg = (i / 22) % 2 ? 1 : -1;
      addLamp(t.x + Math.cos(ang + Math.PI / 2) * (TRAIL_W + 5) * sg, t.y + Math.sin(ang + Math.PI / 2) * (TRAIL_W + 5) * sg, t.h);
    }
    // logs across the path
    for (const j of JUMPS) {
      const log = new THREE.Mesh(new THREE.CylinderGeometry(5, 5, TRAIL_W * 2 + 8, 10), mat("#6b4a2b"));
      log.rotation.z = Math.PI / 2; log.rotation.y = -j.a + Math.PI / 2; log.rotation.order = "YXZ";
      log.position.set(j.cx, j.h0 + 6, j.cy); log.castShadow = true; scene.add(log);
    }
    // the gate at the start, with a sign, and a flag at the top
    const t0 = TRAIL[0];
    for (const sg of [-1, 1]) { const post = new THREE.Mesh(new THREE.BoxGeometry(5, 42, 5), mat("#5c4a33")); post.position.set(t0.x + sg * 24, t0.h + 21, t0.y); post.castShadow = true; scene.add(post); }
    const beam = new THREE.Mesh(new THREE.BoxGeometry(56, 6, 5), mat("#5c4a33")); beam.position.set(t0.x, t0.h + 42, t0.y); scene.add(beam);
    const sign = label("Octee Peak trail", { size: 40 }); sign.position.set(t0.x, t0.h + 62, t0.y); scene.add(sign);
    const sign2 = label("Space to jump", { size: 36, bg: "rgba(255,240,170,.95)" }); sign2.scale.multiplyScalar(0.8); sign2.position.set(t0.x, t0.h + 38, t0.y + 8); scene.add(sign2);
    const top = TRAIL[TRAIL.length - 1];
    const plat = new THREE.Mesh(new THREE.CylinderGeometry(30, 34, 6, 20), mat("#c9c4b8")); plat.position.set(top.x, top.h + 1, top.y); plat.castShadow = true; plat.receiveShadow = true; scene.add(plat);
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(1.3, 1.3, 70, 8), mat("#ddd")); pole.position.set(top.x, top.h + 38, top.y); scene.add(pole);
    const flag = new THREE.Mesh(new THREE.PlaneGeometry(30, 18), new THREE.MeshStandardMaterial({ color: "#e0245e", side: THREE.DoubleSide })); flag.position.set(top.x + 16, top.h + 62, top.y); scene.add(flag);
    const top2 = label("Summit. Well done.", { size: 40 }); top2.position.set(top.x, top.h + 100, top.y); scene.add(top2);
  }

  // ---- the highway ----
  {
    const up = (path, off) => path.map((q, i) => { const a = path[(i - 1 + path.length) % path.length], b = path[(i + 1) % path.length]; let dx = b[0] - a[0], dz = b[1] - a[1]; const l = Math.hypot(dx, dz) || 1; dx /= l; dz /= l; return [q[0] + dz * off, q[1] - dx * off]; });
    ribbon(HWY, 24, HWY_H, "#3f4348");                                         // the road itself
    ribbon(HWY, 24.2, HWY_H - 7, "#9a9a94", { mat: { roughness: 1 } });         // the underside of the deck
    for (const sg of [-1, 1]) {
      ribbon(up(HWY, 23 * sg), 1.4, HWY_H + 0.1, "#c9c4b8");                  // kerbs
      // a low wall along each side
      const wallPts = up(HWY, 24.5 * sg), pos = [], idx = [];
      wallPts.forEach((q, i) => { pos.push(q[0], HWY_H - 7, q[1], q[0], HWY_H + 6, q[1]); });
      for (let i = 0; i < wallPts.length; i++) {
        const j = (i + 1) % wallPts.length, mx = (wallPts[i][0] + wallPts[j][0]) / 2, mz = (wallPts[i][1] + wallPts[j][1]) / 2;
        if (RAMPS.some((r) => Math.hypot(mx - r.x1, mz - r.y1) < 34)) continue;       // a gap in the wall where a ramp joins
        idx.push(i * 2, j * 2, i * 2 + 1, i * 2 + 1, j * 2, j * 2 + 1);
      }
      const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals();
      const m = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ color: "#b9b4a6", roughness: 0.9, side: THREE.DoubleSide })); m.castShadow = true; scene.add(m);
    }
    dashAlong(HWY, 36, 16, 1.6, "#ffffff", HWY_H + 0.15);                   // lane line down the middle
    ribbon(up(HWY, 21), 0.5, HWY_H + 0.12, "#ffd24d"); ribbon(up(HWY, -21), 0.5, HWY_H + 0.12, "#ffd24d");
    // pillars every 56 units, and a lamp every other one
    const pil = new THREE.InstancedMesh(new THREE.BoxGeometry(9, HWY_H - 6, 26), new THREE.MeshStandardMaterial({ color: "#a9a59a", roughness: 0.95 }), Math.ceil(HWY.length / 2) + 40);
    const dm = new THREE.Object3D(); let np = 0, acc = 0, lampN = 0;
    for (let i = 0; i < HWY.length; i++) {
      const a = HWY[i], b = HWY[(i + 1) % HWY.length], sl = Math.hypot(b[0] - a[0], b[1] - a[1]);
      acc += sl;
      if (acc >= 56 && HWY_TUN[i]) acc = 0;                                    // no pillars or lamps inside a tunnel
      else if (acc >= 56) {
        acc = 0; if (np < pil.count) { dm.position.set(a[0], (HWY_H - 6) / 2 - 0.5, a[1]); dm.rotation.set(0, Math.atan2(b[0] - a[0], b[1] - a[1]) - Math.PI / 2 + Math.PI / 2, 0); dm.scale.set(1, 1, 1); dm.updateMatrix(); pil.setMatrixAt(np++, dm.matrix); }
        if (lampN++ % 2 === 0) { const dx = b[0] - a[0], dz = b[1] - a[1], l = Math.hypot(dx, dz) || 1; addLamp(a[0] + (dz / l) * 20, a[1] - (dx / l) * 20, HWY_H + 6); }
      }
    }
    pil.count = np; pil.castShadow = true; scene.add(pil);
    // cars: clockwise in the outer lane, anticlockwise in the inner lane (keeping left)
    const lane = (off) => up(HWY, off);
    const cw = makeRoute(lane(11)), acw = makeRoute(lane(-11).reverse());
    const cols = ["#d33b3b", "#2f6fd1", "#f2f2f2", "#2e8b57", "#ffb000", "#6a3fb5", "#222222", "#ff7a00"];
    for (const [route, n, vmax] of [[cw, 9, 180], [acw, 9, 165]]) for (let i = 0; i < n; i++) {
      const g = makeCar(cols[(i * 3 + n) % cols.length]);
      if (i % 4 === 3) g.scale.set(1.15, 1.6, 2.1);                             // a lorry
      cars.push({ g, route, s: (i / n) * route.L, v: 0, vmax: vmax * (0.9 + (i % 3) * 0.06), hd: 0, elev: HWY_H + 0.2, hw: true });
    }
    // tunnels: an arched concrete tube round the deck wherever the highway goes through a hill, with a lit roof and a frame at each mouth
    {
      const n = HWY.length, hd = (i) => { const a = HWY[(i + n - 1) % n], b = HWY[(i + 1) % n]; let dx = b[0] - a[0], dz = b[1] - a[1]; const l = Math.hypot(dx, dz) || 1; return [dx / l, dz / l]; };
      const AR = 26, AH = TUN_CROWN - HWY_H - 4, K = 10;
      const concrete = new THREE.MeshStandardMaterial({ color: "#8d8a82", roughness: 0.95, side: THREE.DoubleSide });
      const lightM = new THREE.MeshBasicMaterial({ color: "#ffe6a0" });
      let count = 0;
      for (let st = 0; st < n; st++) {
        if (!HWY_TUN[st] || HWY_TUN[(st + n - 1) % n]) continue;               // the first sample of a tunnel
        const idxs = []; for (let k = 0; k < n && HWY_TUN[(st + k) % n]; k++) idxs.push((st + k) % n);
        const pos = [], idx = [];
        idxs.forEach((i) => { const [dx, dz] = hd(i), q = HWY[i]; for (let j = 0; j <= K; j++) { const th = (j / K) * Math.PI; pos.push(q[0] + dz * Math.cos(th) * AR, HWY_H + 1 + Math.sin(th) * AH, q[1] - dx * Math.cos(th) * AR); } });
        for (let r = 0; r + 1 < idxs.length; r++) for (let j = 0; j < K; j++) { const a = r * (K + 1) + j, b = (r + 1) * (K + 1) + j; idx.push(a, b, a + 1, a + 1, b, b + 1); }
        const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals();
        const tube = new THREE.Mesh(g, concrete); tube.receiveShadow = true; scene.add(tube);
        for (let r = 1; r + 1 < idxs.length; r += 2) { const [dx, dz] = hd(idxs[r]), q = HWY[idxs[r]]; const lm = new THREE.Mesh(new THREE.BoxGeometry(14, 1, 3), lightM); lm.position.set(q[0], HWY_H + 1 + AH - 1.5, q[1]); lm.rotation.y = Math.atan2(dx, dz) + Math.PI / 2; scene.add(lm); }
        for (const ei of [idxs[0], idxs[idxs.length - 1]]) {
          const [dx, dz] = hd(ei), q = HWY[ei];
          const ring = new THREE.Mesh(new THREE.TorusGeometry(AR + 1, 3, 8, 28, Math.PI), mat("#b9b4a6")); ring.scale.y = AH / AR; ring.position.set(q[0], HWY_H + 1, q[1]); ring.rotation.y = Math.atan2(dx, dz); ring.castShadow = true; scene.add(ring);
        }
        const mid = HWY[idxs[0]], sl = label("Tunnel " + (++count), { size: 36 }); sl.position.set(mid[0], HWY_H + AH + 18, mid[1]); scene.add(sl);
      }
    }
    // the ramps: a slope up from the ring road to the highway, with walls on both sides and a sign at the bottom
    for (const r of RAMPS) {
      const P = r.pts, pos = [], idx = [], wpos = [], widx = [];
      P.forEach((q, i) => {
        const a = P[Math.max(0, i - 1)], b = P[Math.min(P.length - 1, i + 1)]; let dx = b.x - a.x, dz = b.y - a.y; const l = Math.hypot(dx, dz) || 1; dx /= l; dz /= l;
        const nx = dz, nz = -dx, y = q.h + 1.5;
        pos.push(q.x + nx * 20, y, q.y + nz * 20, q.x - nx * 20, y, q.y - nz * 20);
        for (const sg of [1, -1]) wpos.push(q.x + nx * 21 * sg, y + 4, q.y + nz * 21 * sg, q.x + nx * 21 * sg, 0, q.y + nz * 21 * sg);
      });
      for (let i = 0; i + 1 < P.length; i++) { idx.push(i * 2, (i + 1) * 2, i * 2 + 1, i * 2 + 1, (i + 1) * 2, (i + 1) * 2 + 1); }
      const n = P.length;
      for (let side = 0; side < 2; side++) for (let i = 0; i + 1 < n; i++) { const a = (side * n + i) * 2, b = (side * n + i + 1) * 2; widx.push(a, b, a + 1, a + 1, b, b + 1); }
      const nor = []; for (let i = 0; i < pos.length / 3; i++) nor.push(0, 1, 0);
      const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute("normal", new THREE.Float32BufferAttribute(nor, 3)); g.setIndex(idx);
      const road = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ color: "#3f4348", roughness: 0.95, side: THREE.DoubleSide })); road.receiveShadow = true; scene.add(road);
      const wg = new THREE.BufferGeometry(); wg.setAttribute("position", new THREE.Float32BufferAttribute(wpos, 3)); wg.setIndex(widx); wg.computeVertexNormals();
      const walls = new THREE.Mesh(wg, new THREE.MeshStandardMaterial({ color: "#b9b4a6", roughness: 0.9, side: THREE.DoubleSide })); walls.castShadow = true; scene.add(walls);
      for (let i = 2; i < P.length - 2; i += 3) { const q = P[i], hz = r.y1 === r.y0 ? 1 : 0; const d = new THREE.Mesh(new THREE.BoxGeometry(hz ? 9 : 1.6, 0.3, hz ? 1.6 : 9), mat("#e9e2b5")); d.position.set(q.x, q.h + 1.75, q.y); scene.add(d); }
      const lbl = label("Up to the highway", { size: 36 }); lbl.position.set(r.x0 + (r.x1 - r.x0) * 0.06, 34, r.y0 + (r.y1 - r.y0) * 0.06); scene.add(lbl);
      for (let k = 0; k < 4; k++) { const t = P[Math.floor(4 + k * 9)], dx = r.x1 - r.x0, dz = r.y1 - r.y0, l = Math.hypot(dx, dz); addLamp(t.x + (dz / l) * 24, t.y - (dx / l) * 24, t.h + 1.5); }
    }

    // bridges: where the highway crosses a river, two arches over the deck and piers in the water
    for (const [river, name] of [[RIVER_N, "Octee Bridge"], [RIVER_S, "South Bridge"]]) {
      const ys = river.find((q, i) => i && ((river[i - 1][1] <= (river === RIVER_N ? -300 : H + 300)) !== (q[1] <= (river === RIVER_N ? -300 : H + 300))));
      const cx = ys ? ys[0] : river[2][0], cz = river === RIVER_N ? -300 : H + 300;
      for (const dz of [-27, 27]) {
        const arch = new THREE.Mesh(new THREE.TorusGeometry(62, 2.6, 8, 36, Math.PI), mat("#d9433a", { metalness: 0.4, roughness: 0.4 }));
        arch.position.set(cx, HWY_H, cz + dz); arch.castShadow = true; scene.add(arch);
        for (let k = -5; k <= 5; k++) { const hx = cx + (k / 5.4) * 60, hh = Math.sqrt(Math.max(0, 62 * 62 - (hx - cx) ** 2)); const h = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, hh, 5), mat("#cfd3d8")); h.position.set(hx, HWY_H + hh / 2, cz + dz); scene.add(h); }
      }
      const sn = label(name, { size: 40 }); sn.position.set(cx, HWY_H + 90, cz); scene.add(sn);
      for (const dx of [-24, 24]) { const pier = new THREE.Mesh(new THREE.BoxGeometry(12, HWY_H + 2, 40), mat("#a9a59a")); pier.position.set(cx + dx * 1.4, (HWY_H + 2) / 2 - 1, cz); pier.castShadow = true; scene.add(pier); }
    }
  }
}
