// Walk around Octee City in 3D (Three.js). WASD or arrow keys to walk, E to go in, call the Joelmobile at a stop, or get on it.
// Everything is drawn in code: no photos. The map is hand-placed and not symmetrical.
import * as THREE from "three";
import { createInside } from "./walk-inside.js";
import { createWorld } from "./walk-world.js";
import { createMario } from "./walk-mario.js";
import { createBus } from "./walk-bus.js";
// The cloud is only needed to buy a car. The walk works without it.
let CFG = null, cloudMod = null;
try { CFG = (await import("./config.js")).CONFIG; cloudMod = await import("./cloud.js"); } catch { /* no cloud: the walk still works */ }

let inside = null, busApi = null, mario = null;                   // the shop interiors (see walk-inside.js), made once the scene exists
const W = 2600, H = 1200;            // the town, in world units (1 unit is roughly a metre of a very small town)

// Buildings: a box on the ground (x, y = top-left in plan), its height, and its colours and extras.
const B = [
  { id: "bank", name: "OCT Bank", x: 120, y: 90, w: 180, h: 130, H: 70, body: "#f3e3a1", trim: "#8a6d1d", roof: "pitch" },
  { id: "hall", name: "City Hall", x: 360, y: 110, w: 150, h: 110, H: 84, body: "#e8d8c4", trim: "#7a5a3a", roof: "dome" },
  { id: "clinic", name: "Clinic", x: 560, y: 80, w: 140, h: 120, H: 56, body: "#f4f4f4", trim: "#c62828", roof: "flat", cross: true },
  { id: "fire", name: "Fire Station", x: 760, y: 130, w: 130, h: 100, H: 52, body: "#c94a3c", trim: "#5a1d17", roof: "flat", tower: true },
  { id: "post", name: "Post Office", x: 80, y: 300, w: 150, h: 100, H: 44, body: "#e1b35a", trim: "#6b4c12", roof: "pitch" },
  { id: "bakery", name: "Bakery", x: 300, y: 300, w: 110, h: 90, H: 38, body: "#f6c7a0", trim: "#8c4b1e", roof: "pitch" },
  { id: "library", name: "Library", x: 480, y: 290, w: 170, h: 120, H: 58, body: "#c8d7ea", trim: "#2e4a6b", roof: "flat" },
  { id: "cinema", name: "Cinema", x: 720, y: 300, w: 180, h: 110, H: 60, body: "#3d3550", trim: "#d9b43c", roof: "flat" },
  { id: "power", name: "Power Station", x: 1000, y: 320, w: 120, h: 110, H: 66, body: "#9aa3ad", trim: "#444", roof: "flat", tower: true },
  { id: "radio", name: "Radio Tower", x: 1460, y: 400, w: 120, h: 100, H: 40, body: "#b9c9d9", trim: "#2c3e50", roof: "flat", mast: true },
  { id: "tax", name: "Tax Office", x: 90, y: 620, w: 130, h: 100, H: 50, body: "#d7e8c2", trim: "#3d5a2a", roof: "pitch" },
  { id: "car", name: "Car Park", x: 260, y: 640, w: 160, h: 90, H: 30, body: "#bfc4c9", trim: "#555", roof: "flat", stripes: true },
  { id: "gym", name: "Gym", x: 460, y: 610, w: 120, h: 110, H: 46, body: "#f0a6a6", trim: "#7a1f1f", roof: "flat" },
  { id: "museum", name: "Peanut Museum", x: 620, y: 640, w: 150, h: 100, H: 48, body: "#e6d5b8", trim: "#6b5232", roof: "dome" },
  { id: "bus", name: "Airport Bus Stop", x: 830, y: 620, w: 130, h: 90, H: 22, body: "#ffd24d", trim: "#222", roof: "flat", shelter: true },
  { id: "square", name: "Town Square", x: 1010, y: 600, w: 200, h: 140, H: 4, body: "#dcd6c8", trim: "#6e6758", roof: "none", plaza: true },
  { id: "tower", name: "Game Tower", x: 1270, y: 640, w: 110, h: 170, H: 120, body: "#7d8fd6", trim: "#29336b", roof: "flat", spire: true },
  { id: "lost", name: "Lost Property Office", x: 1420, y: 560, w: 120, h: 90, H: 36, body: "#b7e0d8", trim: "#2b6a5f", roof: "pitch" },
  { id: "food", name: "Food Court", x: 60, y: 820, w: 140, h: 100, H: 34, body: "#ffc2d4", trim: "#8a2c4d", roof: "flat" },
  { id: "harbour", name: "Harbour", x: 300, y: 860, w: 220, h: 110, H: 40, body: "#a9d4e6", trim: "#1f5170", roof: "flat", crane: true },
  { id: "police", name: "Police Station", x: 600, y: 880, w: 170, h: 120, H: 52, body: "#5f7fb3", trim: "#18305c", roof: "flat", flag: true },
  { id: "laundry", name: "Laundrette", x: 900, y: 900, w: 120, h: 100, H: 30, body: "#e5f0ff", trim: "#3d6aa0", roof: "flat", round: true },
  { id: "pool", name: "Swimming Pool", x: 1100, y: 880, w: 190, h: 130, H: 18, body: "#7fd3e8", trim: "#1b6f86", roof: "none", water: true },
  { id: "market", name: "Night Market", x: 1380, y: 820, w: 200, h: 120, H: 26, body: "#ffb36b", trim: "#7a3b00", roof: "pitch", stalls: true },
  { id: "grocery", name: "Grocery Store", x: 1400, y: 1050, w: 170, h: 100, H: 40, body: "#cfe8c0", trim: "#2f6b2a", roof: "flat", stripes: true },
  { id: "terminal", name: "Octee Central Bus Terminal", x: 2125, y: 765, w: 370, h: 140, H: 46, body: "#dfe6ee", trim: "#c62828", roof: "flat" },
  { id: "blk101", name: "Blk 101", x: 1760, y: 90, w: 90, h: 200, H: 118, body: "#f2d7d5", trim: "#9c4a46", roof: "flat" },
  { id: "blk102", name: "Blk 102", x: 1880, y: 90, w: 90, h: 200, H: 118, body: "#d5e8f2", trim: "#3f6f8f", roof: "flat" },
  { id: "blk103", name: "Blk 103", x: 2010, y: 120, w: 100, h: 170, H: 96, body: "#f6ecc9", trim: "#8f7a2f", roof: "flat" },
  { id: "mall", name: "Octee Mall", x: 2200, y: 90, w: 260, h: 170, H: 60, body: "#e9d9f2", trim: "#6a3f8a", roof: "flat" },
  { id: "sports", name: "East Sports Hall", x: 2200, y: 320, w: 200, h: 120, H: 44, body: "#d9f2e3", trim: "#2f8a5a", roof: "flat" },
  { id: "blk104", name: "Blk 104", x: 1780, y: 625, w: 90, h: 180, H: 104, body: "#f2e0d5", trim: "#9a5a3a", roof: "flat" },
  { id: "blk105", name: "Blk 105", x: 1900, y: 625, w: 90, h: 180, H: 104, body: "#e2f2d5", trim: "#4f8f3a", roof: "flat" },
  { id: "hotel", name: "Octee Hotel", x: 1780, y: 850, w: 230, h: 110, H: 74, body: "#d9dff2", trim: "#3a4a9a", roof: "flat" },
  { id: "lounge", name: "Platinum Lounge", x: 1120, y: 1040, w: 160, h: 100, H: 44, body: "#d9d4ee", trim: "#4b3f7a", roof: "flat", gold: true },
];
// The airport: a long terminal, a runway and a control tower. You can walk in through its door to the Octee Airlines site.
const FIA = { id: "fia", name: "FIA airport", x: 910, y: 40, w: 760, h: 200, H: 62, body: "#e8eef4", trim: "#33414e", roof: "flat", runway: true, href: "https://zengyixin0205.github.io/Octee-airline/" };
const SOLID = [...B, FIA];

// The countryside beyond the ring road: you can walk out to OUT units past the edge of town.
const OUT = 560;
const WILD = {
  hills: [
    { x: -300, y: 300, r: 150, h: 130, power: 1.5, noise: 0.04, seed: 3 },   // the hill with the waterfall
    { x: 400, y: H + 240, r: 150, h: 75, power: 1.4, noise: 0.14, seed: 5 },
    { x: W + 260, y: 380, r: 170, h: 85, power: 1.4, noise: 0.14, seed: 9 },
    { x: W + 300, y: 930, r: 130, h: 60, power: 1.4, noise: 0.14, seed: 11 },
  ],
  lakes: [{ x: -95, y: 300, r: 60 }, { x: -105, y: 790, r: 38 }, { x: 1000, y: H + 170, r: 120 }, { x: 2120, y: -40, r: 46 }, { x: 800, y: H + 40, r: 50 }],
};
const RIVER = [[-95, 360], [-100, 430], [-85, 520], [-100, 610], [-90, 700], [-105, 760]];
// Two rivers that run under the highway: the highway crosses them on bridges.
const RIVER_N = [[2150, -560], [2120, -470], [2160, -390], [2130, -300], [2150, -190], [2120, -90]];
const RIVER_S = [[800, H + 560], [830, H + 450], [790, H + 300], [820, H + 190], [800, H + 90]];
const RIVERS = [RIVER, RIVER_N, RIVER_S];
// The highway: a rounded rectangle round the whole town, up on pillars, so you can see it from the hills.
const HWY_OFF = 300, HWY_H = 40;
const HWY = (() => {
  const x0 = -HWY_OFF, x1 = W + HWY_OFF, y0 = -HWY_OFF, y1 = H + HWY_OFF, R = 190, P = [];
  const line = (a, b, c, d) => { const n = Math.max(1, Math.round(Math.hypot(c - a, d - b) / 24)); for (let i = 0; i <= n; i++) P.push([a + ((c - a) * i) / n, b + ((d - b) * i) / n]); };
  const arc = (cx, cy, a0, a1) => { for (let i = 0; i <= 14; i++) { const a = a0 + ((a1 - a0) * i) / 14; P.push([cx + R * Math.cos(a), cy + R * Math.sin(a)]); } };
  line(x0 + R, y0, x1 - R, y0); arc(x1 - R, y0 + R, -Math.PI / 2, 0); line(x1, y0 + R, x1, y1 - R); arc(x1 - R, y1 - R, 0, Math.PI / 2);
  line(x1 - R, y1, x0 + R, y1); arc(x0 + R, y1 - R, Math.PI / 2, Math.PI); line(x0, y1 - R, x0, y0 + R); arc(x0 + R, y0 + R, Math.PI, Math.PI * 1.5);
  const out = []; for (const q of P) { const l = out[out.length - 1]; if (l && Math.hypot(q[0] - l[0], q[1] - l[1]) < 1) continue; out.push(q); }
  if (Math.hypot(out[0][0] - out[out.length - 1][0], out[0][1] - out[out.length - 1][1]) < 1) out.pop();
  return out;
})();
function nearHighway(x, y, d = 34) { for (const q of HWY) if (Math.abs(q[0] - x) < d && Math.abs(q[1] - y) < d && Math.hypot(q[0] - x, q[1] - y) < d) return true; return false; }
// The hiking mountain: the biggest, to the north. A spiral trail with steps climbs it (see TRAIL below).
const HIKE = { x: 1100, y: -1280, r: 850, h: 1100, power: 2.2, noise: 0, seed: 31, snow: true, hike: true };
// The mountains: a closed ring of big peaks all the way round the town, so there are no gaps, with a second row behind.
const MOUNTAINS = (() => {
  const out = [], rr = (seed) => { let t = seed; return () => { t = (t * 16807) % 2147483647; return t / 2147483647; }; }, rnd = rr(77);
  const rect = (off, step, rMin, rMax, hMin, hMax, tag) => {
    const x0 = -off, x1 = W + off, y0 = -off, y1 = H + off, pts = [];
    for (let x = x0; x < x1; x += step) pts.push([x, y0]);
    for (let y = y0; y < y1; y += step) pts.push([x1, y]);
    for (let x = x1; x > x0; x -= step) pts.push([x, y1]);
    for (let y = y1; y > y0; y -= step) pts.push([x0, y]);
    for (const [x, y] of pts) {
      if (Math.hypot(x - HIKE.x, y - HIKE.y) < HIKE.r * 0.95) continue;
      const k = rnd();
      out.push({ x: x + (rnd() - 0.5) * 60, y: y + (rnd() - 0.5) * 60, r: rMin + k * (rMax - rMin), h: hMin + rnd() * (hMax - hMin), seed: 100 + out.length, tag });
    }
  };
  rect(780, 210, 320, 420, 300, 560, "front");
  rect(1250, 330, 430, 560, 520, 800, "back");
  return out.map((m) => ({ ...m, power: 1.05, noise: 0.5, snow: true }));
})();
// Things you cannot walk through out there: hills, mountains and lakes (the river is shallow).
const HIKE_BLOCK = { x: HIKE.x, y: HIKE.y, r: HIKE.r * 0.93 };
// Solid out to most of the slope, so you stop at the foot of a hill or mountain instead of walking into it.
const BLOCKERS = [HIKE_BLOCK, ...WILD.hills.map((h) => ({ x: h.x, y: h.y, r: h.r * 0.92 })), ...MOUNTAINS.map((m) => ({ x: m.x, y: m.y, r: m.r * 0.88 })), ...WILD.lakes];
// Tunnels: wherever the ground is higher than the highway deck, the highway goes through the hill in a tunnel.
const TUN_CROWN = HWY_H + 26;
const moundTop = (o, x, y) => { const d = Math.hypot(x - o.x, y - o.y) / o.r; return d >= 1 ? 0 : o.h * Math.pow(1 - d * d, o.power) * (1 + (o.noise || 0) * 0.6); };
const HWY_TUN = (() => {
  const n = HWY.length, all = [...WILD.hills, ...MOUNTAINS, HIKE], t = HWY.map((q, i) => {
    const a = HWY[(i + n - 1) % n], b = HWY[(i + 1) % n]; let dx = b[0] - a[0], dz = b[1] - a[1]; const l = Math.hypot(dx, dz) || 1; dx /= l; dz /= l;
    return [-26, 0, 26].some((off) => all.some((o) => moundTop(o, q[0] + dz * off, q[1] - dx * off) > HWY_H + 2));
  });
  return t.map((_, i) => [-2, -1, 0, 1, 2].some((k) => t[(i + k + n) % n]));
})();
const TUN_PTS = HWY.filter((_, i) => HWY_TUN[i]);
const TUNNEL_MESHES = [];
let tunnelXray = false;
function distSeg2(px, py, a, b) {
  const dx = b[0] - a[0], dy = b[1] - a[1], t = Math.max(0, Math.min(1, ((px - a[0]) * dx + (py - a[1]) * dy) / (dx * dx + dy * dy)));
  return Math.hypot(px - (a[0] + t * dx), py - (a[1] + t * dy));
}

// The hiking trail: a spiral that climbs the mountain 1.9 times round. Each point has its height; you walk on the steps.
const hikeH = (d) => (d >= 1 ? 0 : HIKE.h * Math.pow(1 - d * d, HIKE.power));
const TRAIL = (() => {
  const pts = [], N = 950;
  for (let i = 0; i <= N; i++) {
    const u = i / N, d = 0.945 - 0.885 * Math.pow(u, 0.92), a = Math.PI / 2 - u * Math.PI * 2 * 1.9;
    const x = HIKE.x + Math.cos(a) * d * HIKE.r, y = HIKE.y + Math.sin(a) * d * HIKE.r;
    pts.push({ x, y, h: hikeH(d), a });
  }
  return pts;
})();
const TRAIL_W = 13;                                // half the width of the path
// Ramps from the ring road up to the highway: a walkable (and drivable) slope, 40 units up over 270.
const RAMPS = [
  { x0: -6, y0: 1000, x1: -282, y1: 1000, name: "West Ramp" }, { x0: W + 6, y0: 700, x1: W + 282, y1: 700, name: "East Ramp" },
  { x0: 2000, y0: -6, x1: 2000, y1: -282, name: "North Ramp" }, { x0: 1800, y0: H + 6, x1: 1800, y1: H + 282, name: "South Ramp" },
].map((r) => {
  const pts = [], N = 36;
  for (let i = 0; i <= N; i++) { const t = i / N, e = t * t * (3 - 2 * t); pts.push({ x: r.x0 + (r.x1 - r.x0) * t, y: r.y0 + (r.y1 - r.y0) * t, h: (HWY_H - 1.5) * e }); }
  return { ...r, pts };
});
// Everything you can walk on that is not the ground: the mountain trail, the ramps and the highway deck. Each sample has the height of its top.
const WAYPTS = [];
for (const t of TRAIL) WAYPTS.push({ x: t.x, y: t.y, h: t.h, half: TRAIL_W, k: "t" });
for (const r of RAMPS) for (const q of r.pts) WAYPTS.push({ x: q.x, y: q.y, h: q.h, half: 19, k: "r" });
for (let i = 0; i < HWY.length; i++) {
  const a = HWY[i], b = HWY[(i + 1) % HWY.length], l = Math.hypot(b[0] - a[0], b[1] - a[1]), n = Math.max(1, Math.ceil(l / 8));
  for (let k = 0; k < n; k++) WAYPTS.push({ x: a[0] + ((b[0] - a[0]) * k) / n, y: a[1] + ((b[1] - a[1]) * k) / n, h: HWY_H - 1.5, half: 20, k: "h" });
}
function trailAt(px, py, gy = PLAYER.gy) {
  const nearMtn = Math.hypot(px - HIKE.x, py - HIKE.y) <= HIKE.r * 1.02;
  if (!nearMtn && px > 0 && px < W && py > 0 && py < H) return null;       // in the town you are on the ground
  let best = null, bd = 1e12;
  for (const p of WAYPTS) {
    const dx = px - p.x, dy = py - p.y;
    if (dx > 20 || dx < -20 || dy > 20 || dy < -20) continue;
    const d = dx * dx + dy * dy;
    if (d < p.half * p.half && d < bd && Math.abs(p.h + 1.5 - gy) < 16) { bd = d; best = p; }
  }
  return best ? { h: best.h, hike: best.k === "t", k: best.k } : null;
}
const groundAt = (px, py, gy = PLAYER.gy) => { const t = trailAt(px, py, gy); return t ? t.h + 1.5 : 0; };
// Logs across the trail: too high to walk through, so press Space to jump over them.
const JUMPS = [];
for (const i of [150, 300, 430, 560, 690, 800, 880]) { const t = TRAIL[i]; JUMPS.push({ x: t.x - 9, y: t.y - 9, w: 18, h: 18, hz: 12, a: t.a, cx: t.x, cy: t.y, h0: t.h }); }
// Extra roads, as segments [x1, y1, x2, y2]. A K joins the main street, and an F joins the south street.
const ROAD_W = 22;
// Our own road layout: a roundabout north-east of the main street, with three roads leading off it.
// The ring is made of short straight pieces, and the three roads are the south road to the main street,
// the north road to the airport, and the west road to the power station.
const RB = { x: 1290, y: 350, r: 80 };
const SEGS = [];
{
  const N = 16;
  for (let k = 0; k < N; k++) {
    const a1 = (k / N) * Math.PI * 2, a2 = ((k + 1) / N) * Math.PI * 2;
    SEGS.push([RB.x + RB.r * Math.cos(a1), RB.y + RB.r * Math.sin(a1), RB.x + RB.r * Math.cos(a2), RB.y + RB.r * Math.sin(a2)]);
  }
}
SEGS.push([RB.x, RB.y + RB.r, RB.x, 504]);     // south road, runs into the main street
SEGS.push([RB.x, RB.y - RB.r, RB.x, 244]);     // north road, runs into the airport
SEGS.push([RB.x - RB.r, RB.y, 1125, RB.y]);    // west road, runs into the power station
function segDist(px, py, [x1, y1, x2, y2]) {
  const dx = x2 - x1, dy = y2 - y1;
  const t = Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / (dx * dx + dy * dy)));
  return Math.hypot(px - (x1 + t * dx), py - (y1 + t * dy));
}

// Extra roads: one side road from the main street down to the south street. The K and F roads are gone.
const ROAD_NET = [
  { a: [1650, 560], b: [1650, 1000], w: 24 },
  { a: [2310, 562], b: [2310, 727], w: 26 },                       // the link road down to the bus terminal
  { a: [2087, 727], b: [2533, 727], w: 34 }, { a: [2087, 933], b: [2533, 933], w: 34 },     // the terminal's loop road
  { a: [2087, 727], b: [2087, 933], w: 34 }, { a: [2533, 727], b: [2533, 933], w: 34 },
];
function distToSeg(px, py, r) {
  const [ax, ay] = r.a, [bx, by] = r.b, dx = bx - ax, dy = by - ay;
  const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy)));
  return Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
}

// The ring road goes all the way round the town, on the outside edges. Stops sit on it, and the Joelmobile drives it.
const BAND = 36, RC = 18;                       // band width, and the centre line of the ring road
const RING = (() => {                           // the ring road's centre line, clockwise, with rounded corners (radius 42 round points 60 in)
  const P = [], R = 42, C = 60;
  const arc = (cx, cy, a0, a1) => { for (let i = 0; i <= 12; i++) { const a = a0 + ((a1 - a0) * i) / 12; P.push([cx + R * Math.cos(a), cy + R * Math.sin(a)]); } };
  const line = (x1, y1, x2, y2) => { const n = Math.max(1, Math.round(Math.hypot(x2 - x1, y2 - y1) / 20)); for (let i = 0; i <= n; i++) P.push([x1 + ((x2 - x1) * i) / n, y1 + ((y2 - y1) * i) / n]); };
  line(C, RC, W - C, RC); arc(W - C, C, -Math.PI / 2, 0);
  line(W - RC, C, W - RC, H - C); arc(W - C, H - C, 0, Math.PI / 2);
  line(W - C, H - RC, C, H - RC); arc(C, H - C, Math.PI / 2, Math.PI);
  line(RC, H - C, RC, C); arc(C, C, Math.PI, Math.PI * 1.5);
  const pts = [], cum = [];
  for (const q of P) { const l = pts[pts.length - 1]; if (l && Math.hypot(q[0] - l[0], q[1] - l[1]) < 0.5) continue; pts.push(q); }
  const f = pts[0], l = pts[pts.length - 1]; if (Math.hypot(f[0] - l[0], f[1] - l[1]) < 0.5) pts.pop();
  let tot = 0; for (let i = 0; i < pts.length; i++) { cum.push(tot); const n = pts[(i + 1) % pts.length]; tot += Math.hypot(n[0] - pts[i][0], n[1] - pts[i][1]); }
  return { pts, cum, L: tot };
})();
const LOOP = RING.L;                            // the whole way round
function ringS(x, y) { let bi = 0, bd = 1e12; RING.pts.forEach((q, i) => { const d = (q[0] - x) ** 2 + (q[1] - y) ** 2; if (d < bd) { bd = d; bi = i; } }); return RING.cum[bi]; }
// Stops: name, a point on the sidewalk (where you stand), and its place on the ring (distance round the loop).
const STOPS = [
  { name: "North stop (Clinic side)", x: 820, y: 60 },
  { name: "East stop (Market side)", x: W - 56, y: 760 },
  { name: "South stop (Harbour side)", x: 520, y: 1140 },
  { name: "West stop (Tax side)", x: 56, y: 560 },
].map((st) => ({ ...st, s: ringS(st.x, st.y) }));
const SPEED = 230;                              // the Joelmobile, in world units a second
const PLAYER = { x: 960, y: 580, step: 0, riding: false, face: 0, hop: 0, vh: 0, gy: 0, z: 0 };
const keys = new Set();
const BODY = { w: 18, h: 14 };                 // the player's feet, for walls

// ---- helpers ----
const hit = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
function free(px, py, body = BODY, gy = PLAYER.gy) {
  if (inside && inside.on) return inside.free(px, py, body);
  const box = { x: px - body.w / 2, y: py - body.h / 2, w: body.w, h: body.h };
  const tr = trailAt(px, py, gy);                 // on the hiking trail you may go beyond the edge, and past the mountain's foot
  if (!tr && gy > 12) return false;               // up on the highway or a ramp you cannot step off the edge
  if (!tr && (box.x < -OUT || box.y < -OUT || box.x + box.w > W + OUT || box.y + box.h > H + OUT)) return false;
  if (!(tr && !tr.hike)) for (const c of BLOCKERS) if (Math.hypot(px - c.x, py - c.y) < c.r + body.w / 2) { if (tr && tr.hike && c === HIKE_BLOCK) continue; return false; }
  for (const j of JUMPS) if (hit(box, j) && PLAYER.hop < j.hz) return false;
  return !SOLID.some((s) => hit(box, s));
}
function ringPoint(s) {                          // where the ring road is at distance s round the loop
  s = ((s % LOOP) + LOOP) % LOOP;
  const c = RING.cum; let lo = 0, hi = c.length - 1;
  while (lo < hi) { const m = (lo + hi + 1) >> 1; if (c[m] <= s) lo = m; else hi = m - 1; }
  const a = RING.pts[lo], b = RING.pts[(lo + 1) % RING.pts.length], len = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1, t = (s - c[lo]) / len;
  return { x: a[0] + (b[0] - a[0]) * t, y: a[1] + (b[1] - a[1]) * t, dx: (b[0] - a[0]) / len, dy: (b[1] - a[1]) / len };
}
// A lane along the ring: from s0, len long, shifted `out` to the outside (left of clockwise traffic). A negative len goes anticlockwise.
function ringLane(s0, len, out = 0) {
  const pts = [], n = Math.max(2, Math.ceil(Math.abs(len) / 14));
  for (let i = 0; i <= n; i++) { const p = ringPoint(s0 + (len * i) / n), sg = Math.sign(len) || 1; pts.push([p.x + p.dy * out * sg, p.y - p.dx * out * sg]); }
  return pts;
}
function forwardDist(from, to) { return ((to - from) % LOOP + LOOP) % LOOP; }
function nearestDoor() {
  let best = null, bestD = 50;
  for (const s of SOLID) {
    const dx = PLAYER.x - (s.x + s.w / 2), dy = PLAYER.y - (s.y + s.h + 6);
    const d = Math.hypot(dx, dy);
    if (d < bestD) { bestD = d; best = s; }
  }
  return best;
}
function nearestStop(maxD = 80) {
  let best = -1, bestD = maxD;
  STOPS.forEach((st, i) => { const d = Math.hypot(PLAYER.x - st.x, PLAYER.y - st.y); if (d < bestD) { bestD = d; best = i; } });
  return best;
}

// ---- the Three.js scene ----
const stage = document.getElementById("walk-stage");
const hud = document.getElementById("walk-hud");
const ridePanel = document.getElementById("walk-ride");
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
stage.prepend(renderer.domElement);
const scene = new THREE.Scene();
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.1;
const skyTex = (() => {
  const c = document.createElement("canvas"); c.width = 4; c.height = 256;
  const g = c.getContext("2d"), gr = g.createLinearGradient(0, 0, 0, 256);
  gr.addColorStop(0, "#3f78c4"); gr.addColorStop(0.55, "#8cc2e8"); gr.addColorStop(1, "#cfe9f6");
  g.fillStyle = gr; g.fillRect(0, 0, 4, 256);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
})();
scene.background = skyTex;
scene.fog = new THREE.Fog("#cfe3ef", 1500, 4600);
const camera = new THREE.PerspectiveCamera(46, 16 / 9, 5, 6000);

scene.add(new THREE.HemisphereLight("#eaf6ff", "#4f6b35", 0.95));
const sun = new THREE.DirectionalLight("#fff4dc", 1.15);
sun.position.set(-500, 900, 380);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
Object.assign(sun.shadow.camera, { left: -1100, right: 1100, top: 1100, bottom: -1100, near: 10, far: 2600 });
sun.shadow.bias = -0.0006;
scene.add(sun);

// Textures drawn on canvas: grass, asphalt with lines, and building walls with windows.
function canvasTex(w, h, draw, repeat = [1, 1]) {
  const c = document.createElement("canvas"); c.width = w; c.height = h;
  draw(c.getContext("2d"), w, h);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(repeat[0], repeat[1]);
  t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
  return t;
}
function rng(seed) { return () => { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const grassTex = canvasTex(256, 256, (g, w, h) => {
  const r = rng(7); g.fillStyle = "#7db45c"; g.fillRect(0, 0, w, h);
  for (let i = 0; i < 1400; i++) { g.fillStyle = r() < 0.5 ? "#6aa54c" : "#8cc46a"; g.fillRect(r() * w, r() * h, 2 + r() * 3, 2 + r() * 3); }
}, [140, 100]);
function roadTex(horizontal) {
  return canvasTex(256, 64, (g, w, h) => {
    g.fillStyle = "#4b4f55"; g.fillRect(0, 0, w, h);
    g.fillStyle = "#e9e2b5";
    if (horizontal) { for (let x = 0; x < w; x += 64) g.fillRect(x + 8, h / 2 - 2, 36, 4); }
    else { for (let y = 0; y < h; y += 64) g.fillRect(w / 2 - 2, y + 8, 4, 36); }
  }, [1, 1]);
}
const ROAD_H = roadTex(true), ROAD_V = roadTex(false);
const glowMats = [];                               // wall materials whose windows light up at night
const GLOW_BASE = canvasTex(128, 128, (g) => {
  g.fillStyle = "#000"; g.fillRect(0, 0, 128, 128);
  for (let r = 0; r < 2; r++) for (let c = 0; c < 2; c++) { g.fillStyle = (r + c) % 3 === 0 ? "#fff" : "#e8c070"; g.fillRect(18 + c * 60, 26 + r * 56, 38, 26); }
}, [1, 1]);
function litWalls(tex, roughness = 0.7) {
  const glow = GLOW_BASE.clone(); glow.needsUpdate = true; glow.repeat.copy(tex.repeat);
  const m = new THREE.MeshStandardMaterial({ map: tex, roughness, emissive: new THREE.Color("#ffcf7a"), emissiveMap: glow, emissiveIntensity: 0 });
  glowMats.push(m); return m;
}
function facadeTex(body, trim) {
  return canvasTex(128, 128, (g) => {
    g.fillStyle = body; g.fillRect(0, 0, 128, 128);
    g.fillStyle = "rgba(255,255,255,.08)"; g.fillRect(0, 0, 128, 10);
    for (let r = 0; r < 2; r++) for (let c = 0; c < 2; c++) {
      g.fillStyle = trim; g.fillRect(14 + c * 60, 22 + r * 56, 46, 34);
      g.fillStyle = "#9fc3dd"; g.fillRect(18 + c * 60, 26 + r * 56, 38, 26);
      g.fillStyle = "rgba(255,255,255,.35)"; g.fillRect(18 + c * 60, 26 + r * 56, 38, 6);
    }
  }, [1, 1]);
}
const mat = (color, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.8, metalness: 0.05, ...extra });
function label(text, { bg = "rgba(255,255,255,.94)", fg = "#222", size = 40 } = {}) {
  const c = document.createElement("canvas"); c.width = 512; c.height = 96;
  const g = c.getContext("2d");
  g.font = `bold ${size}px system-ui, sans-serif`;
  const tw = Math.min(500, g.measureText(text).width + 40);
  g.fillStyle = bg; g.beginPath(); g.roundRect(256 - tw / 2, 14, tw, 68, 18); g.fill();
  g.fillStyle = fg; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(text, 256, 49);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, depthTest: false, transparent: true }));
  s.scale.set(150, 28, 1);
  s.renderOrder = 10;
  return s;
}

// Ground and roads
grassTex.repeat.set((W + 7000) / 34, (H + 7000) / 34);
const ground = new THREE.Mesh(new THREE.PlaneGeometry(W + 7000, H + 7000), mat("#7db45c", { map: grassTex }));
ground.rotation.x = -Math.PI / 2; ground.position.set(W / 2, -0.2, H / 2); ground.receiveShadow = true;
scene.add(ground);
function road(x, y, w, h, tex) {
  const t = roadTex(tex === ROAD_H);
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat("#ffffff", { map: t }));
  m.rotation.x = -Math.PI / 2; m.position.set(x + w / 2, 0.2, y + h / 2); m.receiveShadow = true;
  if (tex === ROAD_H) t.repeat.set(w / 256, 1); else t.repeat.set(1, h / 256);
  scene.add(m);
}
// paving tiles with grout lines
function tileTex(rx, ry) {
  return canvasTex(128, 128, (g) => {
    const r = rng(11);
    g.fillStyle = "#8f8a80"; g.fillRect(0, 0, 128, 128);
    for (let y = 0; y < 4; y++) for (let x = 0; x < 4; x++) {
      const v = 200 + Math.floor(r() * 22);
      g.fillStyle = `rgb(${v},${v - 6},${v - 16})`;
      g.fillRect(x * 32 + 1, y * 32 + 1, 30, 30);
    }
  }, [rx, ry]);
}
// asphalt with speckles, edge lines and a dashed centre line
function tarmacTex(len) {
  return canvasTex(256, 64, (g, w, h) => {
    const r = rng(5);
    g.fillStyle = "#4b4f55"; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 900; i++) { g.fillStyle = r() < 0.5 ? "rgba(0,0,0,.14)" : "rgba(255,255,255,.06)"; g.fillRect(r() * w, r() * h, 1 + r() * 2, 1 + r() * 2); }
    g.fillStyle = "#e9e2b5";
    for (let x = 0; x < w; x += 64) g.fillRect(x + 8, h / 2 - 2, 36, 4);
  }, [len / 128, 1]);
}
// one straight road piece, with tiled pavements and tyre marks
function roadSeg(x1, y1, x2, y2) {
  const len = Math.hypot(x2 - x1, y2 - y1), ang = Math.atan2(y2 - y1, x2 - x1);
  const g = new THREE.Group();
  g.position.set((x1 + x2) / 2, 0, (y1 + y2) / 2);
  g.rotation.y = -ang;
  const walk = new THREE.Mesh(new THREE.PlaneGeometry(len, ROAD_W + 14), mat("#ffffff", { map: tileTex(len / 64, (ROAD_W + 14) / 64) }));
  walk.rotation.x = -Math.PI / 2; walk.position.y = 0.1; walk.receiveShadow = true; g.add(walk);
  const tar = new THREE.Mesh(new THREE.PlaneGeometry(len, ROAD_W), mat("#ffffff", { map: tarmacTex(len) }));
  tar.rotation.x = -Math.PI / 2; tar.position.y = 0.25; tar.receiveShadow = true; g.add(tar);
  // tyre marks in each lane, and an oil stain
  const tyre = new THREE.MeshBasicMaterial({ color: "#16181b", transparent: true, opacity: 0.42, depthWrite: false });
  for (const [off, a, b] of [[-5, 0.12, 0.46], [5, 0.12, 0.46], [-5, 0.56, 0.9], [5, 0.56, 0.9]]) {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(len * (b - a), 2.2), tyre);
    m.rotation.x = -Math.PI / 2; m.position.set(-len / 2 + (len * (a + b)) / 2, 0.32, off); g.add(m);
  }
  const oil = new THREE.Mesh(new THREE.CircleGeometry(4.5, 14), new THREE.MeshBasicMaterial({ color: "#0c0d0f", transparent: true, opacity: 0.35, depthWrite: false }));
  oil.rotation.x = -Math.PI / 2; oil.scale.set(1.4, 1, 0.8); oil.position.set(len * 0.3 - len / 2, 0.32, -3); g.add(oil);
  scene.add(g);
}
const RING_PIECES = 16;                       // the first 16 SEGS are the roundabout, drawn below as one smooth ring
SEGS.forEach(([x1, y1, x2, y2], i) => { if (i >= RING_PIECES) roadSeg(x1, y1, x2, y2); });
{
  const paving = new THREE.Mesh(new THREE.RingGeometry(RB.r - 18, RB.r + 18, 64), mat("#ffffff", { map: tileTex(14, 14) }));
  paving.rotation.x = -Math.PI / 2; paving.position.set(RB.x, 0.1, RB.y); paving.receiveShadow = true; scene.add(paving);
  const tar = new THREE.Mesh(new THREE.RingGeometry(RB.r - 11, RB.r + 11, 64), mat("#4b4f55", { roughness: 0.95 }));
  tar.rotation.x = -Math.PI / 2; tar.position.set(RB.x, 0.25, RB.y); tar.receiveShadow = true; scene.add(tar);
  for (let i = 0; i < 28; i++) {
    const a = (i / 28) * Math.PI * 2, dash = new THREE.Mesh(new THREE.PlaneGeometry(10, 2), mat("#e9e2b5"));
    dash.rotation.x = -Math.PI / 2; dash.rotation.z = -(a + Math.PI / 2); dash.position.set(RB.x + RB.r * Math.cos(a), 0.3, RB.y + RB.r * Math.sin(a)); scene.add(dash);
  }
}
road(0, 500, W, 70, ROAD_H);                          // main street
road(0, 1002, W, 32, ROAD_H);                         // south street
// The ring road: one smooth ribbon with rounded corners, a pavement on the inside, and dashes down the middle.
function ribbonGeo(path, half, y, closed = true) {
  const n = path.length, pos = [], nor = [], idx = [];
  for (let i = 0; i < n; i++) {
    const a = path[closed ? (i - 1 + n) % n : Math.max(0, i - 1)], b = path[closed ? (i + 1) % n : Math.min(n - 1, i + 1)];
    let dx = b[0] - a[0], dz = b[1] - a[1]; const l = Math.hypot(dx, dz) || 1; dx /= l; dz /= l;
    const nx = dz, nz = -dx;                         // to the left of the way you are going
    pos.push(path[i][0] + nx * half, y, path[i][1] + nz * half, path[i][0] - nx * half, y, path[i][1] - nz * half);
    nor.push(0, 1, 0, 0, 1, 0);
  }
  const segs = closed ? n : n - 1;
  for (let i = 0; i < segs; i++) { const j = (i + 1) % n; idx.push(i * 2, j * 2, i * 2 + 1, i * 2 + 1, j * 2, j * 2 + 1); }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); geo.setAttribute("normal", new THREE.Float32BufferAttribute(nor, 3)); geo.setIndex(idx);
  return geo;
}
function ribbon(path, half, y, color, opts = {}) {
  const m = new THREE.Mesh(ribbonGeo(path, half, y, opts.closed !== false), new THREE.MeshStandardMaterial({ color, roughness: 0.95, side: THREE.DoubleSide, ...(opts.mat || {}) }));
  m.receiveShadow = true; scene.add(m); return m;
}
function dashAlong(path, spacing, len, wid, color, y, closed = true) {
  const mm = new THREE.InstancedMesh(new THREE.PlaneGeometry(len, wid), new THREE.MeshStandardMaterial({ color, roughness: 0.9 }), Math.ceil(2200 / spacing) + 400);
  const d = new THREE.Object3D(); let cnt = 0, acc = 0;
  const n = path.length;
  for (let i = 0; i < (closed ? n : n - 1); i++) {
    const a = path[i], b = path[(i + 1) % n], sl = Math.hypot(b[0] - a[0], b[1] - a[1]);
    for (let t = acc; t < sl; t += spacing) {
      if (cnt >= mm.count) break;
      const f = t / sl; d.position.set(a[0] + (b[0] - a[0]) * f, y, a[1] + (b[1] - a[1]) * f);
      d.rotation.set(-Math.PI / 2, -Math.atan2(b[1] - a[1], b[0] - a[0]), 0, "YXZ");
      d.updateMatrix(); mm.setMatrixAt(cnt++, d.matrix);
    }
    acc = (acc + Math.ceil((sl - acc) / spacing) * spacing) - sl;
  }
  mm.count = cnt; scene.add(mm); return mm;
}
const ringIn = (off) => RING.pts.map((p, i) => { const q = RING.pts[(i + 1) % RING.pts.length], r = RING.pts[(i - 1 + RING.pts.length) % RING.pts.length]; let dx = q[0] - r[0], dy = q[1] - r[1]; const l = Math.hypot(dx, dy) || 1; dx /= l; dy /= l; return [p[0] + dy * off, p[1] - dx * off]; });
ribbon(RING.pts, BAND / 2, 0.22, "#4b4f55");
ribbon(ringIn(-(BAND / 2 + 5)), 5, 0.6, "#c9c4b8");                      // the pavement on the inner edge
ribbon(ringIn(BAND / 2 - 2.5), 0.8, 0.28, "#e9e2b5");                     // edge lines
ribbon(ringIn(-(BAND / 2 - 2.5)), 0.8, 0.28, "#e9e2b5");
dashAlong(RING.pts, 30, 14, 1.6, "#e9e2b5", 0.3);
// Fillets: the corner where a side road meets a bigger road is a curve, not a square corner.
// (cx, cz) is the corner, (sx, sz) the way the curve opens out from it.
const FILLET_MAT = new THREE.MeshStandardMaterial({ color: "#4b4f55", roughness: 0.95, side: THREE.DoubleSide });
function fillet(cx, cz, sx, sz, r = 16) {
  const pos = [0, 0.27, 0], N = 8;
  const q = [[0, r]]; for (let i = 0; i <= N; i++) { const a = Math.PI + (Math.PI / 2) * (i / N); q.push([r + r * Math.cos(a), r + r * Math.sin(a)]); }
  q.forEach(([a, b]) => pos.push(a * sx, 0.27, b * sz));
  const idx = []; for (let i = 1; i < q.length; i++) idx.push(0, i, i + 1);
  const geo = new THREE.BufferGeometry(); geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); geo.setIndex(idx.slice(0, (q.length - 1) * 3)); geo.computeVertexNormals();
  const m = new THREE.Mesh(geo, FILLET_MAT); m.position.set(cx, 0, cz); m.receiveShadow = true; scene.add(m);
}
{ // main street and south street meet the ring
  for (const [x, sx] of [[BAND, 1], [W - BAND, -1]]) { fillet(x, 500, sx, -1); fillet(x, 570, sx, 1); fillet(x, 1002, sx, -1); fillet(x, 1034, sx, 1); }
}

// Buildings
function addBuilding(s) {
  const g = new THREE.Group();
  const bodyH = s.H, cx = s.x + s.w / 2, cz = s.y + s.h / 2;
  if (s.roof !== "none") {
    const tex = facadeTex(s.body, s.trim);
    tex.repeat.set(Math.max(1, s.w / 120), Math.max(1, bodyH / 60));
    const walls = new THREE.Mesh(new THREE.BoxGeometry(s.w, bodyH, s.h), [mat(s.body), mat(s.body), mat(s.body), mat(s.body), litWalls(tex), mat(s.body)]);
    walls.position.set(cx, bodyH / 2, cz); walls.castShadow = true; walls.receiveShadow = true; g.add(walls);
  }
  // door on the front (the side facing you, to the south)
  const door = new THREE.Mesh(new THREE.BoxGeometry(22, 26, 3), mat(s.trim));
  door.position.set(cx, 13, s.y + s.h + 1.5); g.add(door);
  const knob = new THREE.Mesh(new THREE.SphereGeometry(1.6, 8, 6), mat("#ffe08a", { emissive: "#553300" }));
  knob.position.set(cx + 6, 13, s.y + s.h + 3.5); g.add(knob);
  // roofs
  if (s.roof === "pitch") {
    const r = Math.hypot(s.w, s.h) / 2 * 0.72, rh = 28;
    const roof = new THREE.Mesh(new THREE.ConeGeometry(r, rh, 4, 1), mat(s.trim));
    roof.rotation.y = Math.PI / 4; roof.scale.set(s.w / (r * Math.SQRT2), 1, s.h / (r * Math.SQRT2));
    roof.position.set(cx, bodyH + rh / 2, cz); roof.castShadow = true; g.add(roof);
  } else if (s.roof === "dome") {
    const dome = new THREE.Mesh(new THREE.SphereGeometry(Math.min(s.w, s.h) / 2.2, 24, 14, 0, Math.PI * 2, 0, Math.PI / 2), mat(s.trim));
    dome.position.set(cx, bodyH, cz); dome.scale.y = 0.9; dome.castShadow = true; g.add(dome);
  } else if (s.roof === "flat") {
    const slab = new THREE.Mesh(new THREE.BoxGeometry(s.w + 8, 6, s.h + 8), mat(s.trim));
    slab.position.set(cx, bodyH + 3, cz); slab.castShadow = true; g.add(slab);
  }
  if (s.tower) { const t = new THREE.Mesh(new THREE.BoxGeometry(24, 46, 24), mat(s.trim)); t.position.set(s.x + s.w - 22, bodyH + 23, s.y + 22); t.castShadow = true; g.add(t); }
  if (s.spire) { const sp = new THREE.Mesh(new THREE.CylinderGeometry(3, 4, 60, 8), mat(s.trim)); sp.position.set(cx, bodyH + 30, cz); sp.castShadow = true; g.add(sp); }
  if (s.mast) { const m = new THREE.Mesh(new THREE.CylinderGeometry(2, 4, 150, 8), mat(s.trim)); m.position.set(cx, bodyH + 75, cz); m.castShadow = true; g.add(m); const ball = new THREE.Mesh(new THREE.SphereGeometry(6, 12, 8), mat("#ff4d4d", { emissive: "#440000" })); ball.position.set(cx, bodyH + 150, cz); g.add(ball); }
  if (s.cross) { const v = new THREE.Mesh(new THREE.BoxGeometry(8, 28, 3), mat("#d32f2f")), hz = new THREE.Mesh(new THREE.BoxGeometry(28, 8, 3), mat("#d32f2f")); v.position.set(cx, bodyH - 22, s.y + s.h + 1.6); hz.position.copy(v.position); g.add(v, hz); }
  if (s.flag) { const p = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.2, 50, 6), mat("#dfe6ee")); p.position.set(s.x + 16, bodyH + 25, s.y + 16); g.add(p); const f = new THREE.Mesh(new THREE.BoxGeometry(22, 12, 1), mat("#d32f2f")); f.position.set(s.x + 28, bodyH + 42, s.y + 16); g.add(f); }
  if (s.stalls) { for (let i = 0; i < 4; i++) { const a = new THREE.Mesh(new THREE.BoxGeometry(44, 4, 26), mat(i % 2 ? "#ffffff" : "#d32f2f")); a.position.set(s.x + 26 + i * 46, 18, s.y + s.h + 12); a.castShadow = true; g.add(a); } }
  if (s.water) { const water = new THREE.Mesh(new THREE.PlaneGeometry(s.w - 30, s.h - 30), mat("#4fc3e0", { roughness: 0.2, metalness: 0.1 })); water.rotation.x = -Math.PI / 2; water.position.set(cx, bodyH + 0.5, cz); g.add(water); const rim = new THREE.Mesh(new THREE.BoxGeometry(s.w - 10, 6, s.h - 10), mat("#e8f7fb")); rim.position.set(cx, 3, cz); g.add(rim); }
  if (s.plaza) { const fountain = new THREE.Mesh(new THREE.CylinderGeometry(26, 30, 8, 24), mat("#b8b3a6")); fountain.position.set(cx, 4, cz); g.add(fountain); const water = new THREE.Mesh(new THREE.CylinderGeometry(20, 20, 2, 24), mat("#4fc3e0", { roughness: 0.2 })); water.position.set(cx, 8, cz); g.add(water); const pillar = new THREE.Mesh(new THREE.CylinderGeometry(4, 5, 40, 10), mat("#dcd6c8")); pillar.position.set(cx, 24, cz); pillar.castShadow = true; g.add(pillar); }
  if (s.round) { const dish = new THREE.Mesh(new THREE.SphereGeometry(14, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2), mat("#ffffff")); dish.position.set(s.x + s.w - 30, bodyH, s.y + 34); dish.castShadow = true; g.add(dish); }
  if (s.gold) { const strip = new THREE.Mesh(new THREE.BoxGeometry(s.w + 2, 4, 2), mat("#e0b43c", { metalness: 0.5, roughness: 0.3 })); strip.position.set(cx, bodyH - 12, s.y + s.h + 2); g.add(strip); }
  if (s.shelter) { const roof = new THREE.Mesh(new THREE.BoxGeometry(s.w - 10, 3, s.h - 10), mat("#222")); roof.position.set(cx, 20, cz); roof.castShadow = true; g.add(roof); }
  if (s.crane) { const arm = new THREE.Mesh(new THREE.BoxGeometry(6, 6, 120), mat(s.trim)); arm.position.set(s.x + s.w - 20, bodyH + 44, cz); arm.castShadow = true; g.add(arm); const post = new THREE.Mesh(new THREE.BoxGeometry(8, 90, 8), mat(s.trim)); post.position.set(s.x + s.w - 20, bodyH + 45, s.y + 10); post.castShadow = true; g.add(post); }
  if (s.stripes) { for (let i = 0; i < 5; i++) { const line = new THREE.Mesh(new THREE.BoxGeometry(14, 0.6, 3), mat("#ffffff")); line.position.set(s.x + 20 + i * 28, 0.6, s.y + s.h - 14); g.add(line); } }
  // the sign, floating above the building, facing you
  const sign = label(s.name); sign.position.set(cx, bodyH + (s.roof === "pitch" ? 58 : 46), cz); g.add(sign);
  scene.add(g);
  return g;
}
const fiaPlanes = [];
function makePlane(col, scale = 1) {
  const g = new THREE.Group();
  const fus = new THREE.Mesh(new THREE.CylinderGeometry(5, 5, 54, 14), mat(col, { roughness: 0.35 })); fus.rotation.z = Math.PI / 2; fus.position.y = 9; fus.castShadow = true; g.add(fus);
  const nose = new THREE.Mesh(new THREE.SphereGeometry(5, 12, 8), mat(col, { roughness: 0.35 })); nose.position.set(27, 9, 0); g.add(nose);
  const wing = new THREE.Mesh(new THREE.BoxGeometry(16, 1.4, 62), mat("#d7dde4")); wing.position.set(2, 8, 0); wing.castShadow = true; g.add(wing);
  const tail = new THREE.Mesh(new THREE.BoxGeometry(9, 14, 1.4), mat("#c0392b")); tail.position.set(-24, 17, 0); tail.castShadow = true; g.add(tail);
  const tailW = new THREE.Mesh(new THREE.BoxGeometry(7, 1.2, 20), mat("#d7dde4")); tailW.position.set(-24, 11, 0); g.add(tailW);
  for (const z of [-17, 17]) { const eng = new THREE.Mesh(new THREE.CylinderGeometry(2.6, 2.6, 8, 10), mat("#9aa3ad")); eng.rotation.z = Math.PI / 2; eng.position.set(7, 5, z); g.add(eng); }
  const win = new THREE.Mesh(new THREE.BoxGeometry(34, 2.2, 10.2), mat("#1d3557")); win.position.set(3, 11, 0); g.add(win);
  g.scale.setScalar(scale);
  return g;
}
function addFia(s) {
  const g = new THREE.Group();
  const cx = s.x + s.w / 2;
  // the terminal: a long hall at the back, two piers reaching towards the runway, and a glass front
  const hall = new THREE.Mesh(new THREE.BoxGeometry(s.w - 120, s.H, 100), [mat(s.body), mat(s.body), mat(s.body), mat(s.body), litWalls(facadeTex(s.body, s.trim), 0.5), mat(s.body)]);
  hall.position.set(cx, s.H / 2, s.y + 55); hall.castShadow = true; hall.receiveShadow = true; g.add(hall);
  const roof = new THREE.Mesh(new THREE.BoxGeometry(s.w - 100, 6, 112), mat(s.trim)); roof.position.set(cx, s.H + 3, s.y + 55); roof.castShadow = true; g.add(roof);
  const glass = new THREE.Mesh(new THREE.BoxGeometry(s.w - 300, s.H * 0.8, 6), mat("#8fc1e3", { roughness: 0.1, metalness: 0.5 })); glass.position.set(cx, s.H * 0.42, s.y + 107); g.add(glass);
  for (const sgn of [-1, 1]) {
    const pier = new THREE.Mesh(new THREE.BoxGeometry(60, s.H * 0.55, 90), mat(s.body)); pier.position.set(cx + sgn * (s.w / 2 - 90), s.H * 0.275, s.y + 110); pier.castShadow = true; pier.receiveShadow = true; g.add(pier);
    const pr = new THREE.Mesh(new THREE.BoxGeometry(66, 4, 96), mat(s.trim)); pr.position.set(cx + sgn * (s.w / 2 - 90), s.H * 0.55 + 2, s.y + 110); pr.castShadow = true; g.add(pr);
    const bridge = new THREE.Mesh(new THREE.BoxGeometry(8, 8, 26), mat("#aab4bd")); bridge.position.set(cx + sgn * (s.w / 2 - 90), 14, s.y + 168); g.add(bridge);
  }
  // apron, runway and taxiway
  const apron = new THREE.Mesh(new THREE.PlaneGeometry(s.w - 40, 56), mat("#6c7078")); apron.rotation.x = -Math.PI / 2; apron.position.set(cx, 0.25, s.y + 175); apron.receiveShadow = true; g.add(apron);
  const runway = new THREE.Mesh(new THREE.PlaneGeometry(s.w - 20, 34), mat("#3f4348")); runway.rotation.x = -Math.PI / 2; runway.position.set(cx, 0.3, s.y + 221); runway.receiveShadow = true; g.add(runway);
  for (let i = 0; i < 24; i++) { const dash = new THREE.Mesh(new THREE.PlaneGeometry(14, 2), mat("#ffffff")); dash.rotation.x = -Math.PI / 2; dash.position.set(s.x + 24 + i * ((s.w - 48) / 23), 0.4, s.y + 221); g.add(dash); }
  for (let i = 0; i < 16; i++) { for (const z of [s.y + 205, s.y + 237]) { const lt = new THREE.Mesh(new THREE.SphereGeometry(1.6, 6, 5), new THREE.MeshStandardMaterial({ color: "#ffe9a8", emissive: "#ffcf5c", emissiveIntensity: 0.9 })); lt.position.set(s.x + 30 + i * ((s.w - 60) / 15), 1.5, z); g.add(lt); } }
  // the control tower
  const tx = s.x + s.w - 60, tz = s.y + 60;
  const ctower = new THREE.Mesh(new THREE.CylinderGeometry(10, 16, 160, 14), mat("#e8eef4")); ctower.position.set(tx, 80, tz); ctower.castShadow = true; g.add(ctower);
  const cab = new THREE.Mesh(new THREE.CylinderGeometry(28, 18, 20, 14), mat("#2a3a4a", { roughness: 0.2, metalness: 0.4 })); cab.position.set(tx, 172, tz); cab.castShadow = true; g.add(cab);
  const cap = new THREE.Mesh(new THREE.CylinderGeometry(3, 28, 8, 14), mat("#e8eef4")); cap.position.set(tx, 186, tz); g.add(cap);
  // a second, smaller tower at the other end, and a hangar
  const hangar = new THREE.Mesh(new THREE.CylinderGeometry(34, 34, 80, 3, 1, false, 0, Math.PI), mat("#9aa3ad")); hangar.rotation.z = Math.PI / 2; hangar.rotation.y = Math.PI / 2; hangar.position.set(s.x + 90, 0, s.y + 195); hangar.scale.set(0.6, 1, 1); g.add(hangar);
  const sign = label("FIA airport", { size: 56 }); sign.scale.multiplyScalar(1.6); sign.position.set(cx, s.H + 62, s.y + 60); g.add(sign);
  // parked planes at the piers and the middle
  for (const [px, col] of [[cx - (s.w / 2 - 90), "#f4f4f4"], [cx + (s.w / 2 - 90), "#e6eef7"], [cx - 60, "#fff3d0"]]) { const pl = makePlane(col, 1.2); pl.position.set(px, 0, s.y + 180); pl.rotation.y = -Math.PI / 2; g.add(pl); }
  // one plane that takes off along the runway, again and again
  const flyer = makePlane("#ffffff", 1.4); flyer.position.set(s.x + 30, 0, s.y + 221); g.add(flyer);
  fiaPlanes.push({ m: flyer, x0: s.x + 30, x1: s.x + s.w - 30, z: s.y + 221, t: 0 });
  const lander = makePlane("#eef3f8", 1.4); g.add(lander); lander.scale.setScalar(1.4);
  fiaPlanes.push({ m: lander, x0: s.x + 30, x1: s.x + s.w - 30, z: s.y + 221, t: 9, land: true });
  scene.add(g);
  return g;
}
function updateFia(dt) {
  for (const f of fiaPlanes) {
    f.t += dt;
    if (f.land) {                                    // comes in low from the west, touches down, slows, and is gone
      const T = 24, u = (f.t % T) / T;
      if (u > 0.62) { f.m.visible = false; continue; }
      f.m.visible = true;
      const v = u / 0.62, x = f.x0 - 1500 + (1500 + (f.x1 - f.x0) * 0.82) * (1 - (1 - Math.min(1, v * 1.35)) ** 1.4) * 0.999;
      const air = Math.max(0, 1 - v * 2.2);
      f.m.position.set(Math.min(x, f.x1 - 40), air * air * 190, f.z);
      f.m.rotation.set(0, 0, -air * 0.12);
      continue;
    }
    const T = 16, u = (f.t % T) / T;             // 16 seconds a lap: wait, roll, lift off, fly away
    const wait = 0.2;
    if (u < wait) { f.m.position.set(f.x0, 0, f.z); f.m.rotation.set(0, 0, 0); continue; }
    const v = (u - wait) / (1 - wait);
    const x = f.x0 + (f.x1 - f.x0 + 160) * v * v;           // speeds up
    const lift = Math.max(0, (v - 0.55) / 0.45);
    f.m.position.set(x, lift * lift * 140, f.z);
    f.m.rotation.set(0, 0, lift * 0.45);
  }
}
const buildingMeshes = new Map();
for (const s of B) buildingMeshes.set(s.id, addBuilding(s));
addFia(FIA);

// Trees: deterministic, placed on grass away from buildings, roads and stops.
const trees = [];
{
  const r = rng(42), tries = 900;
  const clearOf = (x, y, pad) => {
    if (x < BAND + pad || x > W - BAND - pad || y < BAND + pad || y > H - BAND - pad) return false;
    if (y > 486 - pad && y < 584 + pad) return false;          // main street
    if (y > 990 - pad && y < 1040 + pad) return false;         // south street
    for (const s of SOLID) if (x > s.x - pad && x < s.x + s.w + pad && y > s.y - pad && y < s.y + s.h + pad) return false;
    for (const st of STOPS) if (Math.hypot(x - st.x, y - st.y) < 50) return false;
    for (const sg of SEGS) if (segDist(x, y, sg) < ROAD_W / 2 + pad + 14) return false;
    for (const r of ROAD_NET) if (distToSeg(x, y, r) < r.w / 2 + 16) return false;
    for (const t of trees) if (Math.hypot(x - t.x, y - t.y) < 30) return false;
    return true;
  };
  for (let i = 0; i < tries && trees.length < 150; i++) {
    const x = 40 + r() * (W - 80), y = 40 + r() * (H - 80);
    if (clearOf(x, y, 22)) trees.push({ x, y, kind: r() < 0.5 ? "round" : "pine", k: 0.85 + r() * 0.45 });
  }
  // the countryside outside the ring road: a forest, kept off the hills, lakes, river and mountains
  const inTown = (x, y) => x > -30 && x < W + 30 && y > -30 && y < H + 30;
  for (let i = 0; i < 6000 && trees.length < 800; i++) {
    const x = -OUT - 150 + r() * (W + 2 * OUT + 300), y = -OUT - 150 + r() * (H + 2 * OUT + 300);
    if (inTown(x, y)) continue;
    if (BLOCKERS.some((c) => Math.hypot(x - c.x, y - c.y) < c.r + 30)) continue;
    if (WILD.hills.some((h) => Math.hypot(x - h.x, y - h.y) < h.r * 1.05)) continue;
    if (MOUNTAINS.some((m) => Math.hypot(x - m.x, y - m.y) < m.r * 0.95)) continue;
    if (RIVERS.some((rv) => rv.some((pt, k) => k && distSeg2(x, y, rv[k - 1], pt) < 28))) continue;
    if (Math.hypot(x - HIKE.x, y - HIKE.y) < HIKE.r * 1.0) continue;
    if (nearHighway(x, y)) continue;
    if (RAMPS.some((r) => distSeg2(x, y, [r.x0, r.y0], [r.x1, r.y1]) < 44)) continue;
    if (trees.some((t) => Math.hypot(x - t.x, y - t.y) < 26)) continue;
    trees.push({ x, y, kind: r() < 0.6 ? "pine" : "round", k: 0.9 + r() * 0.8 });
  }
  for (const t of trees) {
    const g = new THREE.Group();
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(3, 4, 22 * t.k, 7), mat("#6b4a2b"));
    trunk.position.y = 11 * t.k; trunk.castShadow = true; g.add(trunk);
    if (t.kind === "round") {
      const crown = new THREE.Mesh(new THREE.IcosahedronGeometry(18 * t.k, 1), mat(r() < 0.5 ? "#3f8f3a" : "#4d9c43", { flatShading: true }));
      crown.position.y = 30 * t.k; crown.castShadow = true; g.add(crown);
    } else {
      const c1 = new THREE.Mesh(new THREE.ConeGeometry(16 * t.k, 34 * t.k, 8), mat("#2f6b3a", { flatShading: true }));
      c1.position.y = 30 * t.k; c1.castShadow = true; g.add(c1);
      const c2 = new THREE.Mesh(new THREE.ConeGeometry(11 * t.k, 26 * t.k, 8), mat("#376f41", { flatShading: true }));
      c2.position.y = 48 * t.k; c2.castShadow = true; g.add(c2);
    }
    g.position.set(t.x, 0, t.y);
    scene.add(g);
  }
}

// Stop posts: a pole and a sign.
const stopMeshes = STOPS.map((st, i) => {
  const g = new THREE.Group();
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.5, 56, 8), mat("#dfe6ee")); pole.position.y = 28; pole.castShadow = true; g.add(pole);
  const plate = new THREE.Mesh(new THREE.BoxGeometry(26, 14, 2), mat("#1e63c8")); plate.position.y = 50; g.add(plate);
  const sign = label("JOELMOBILE", { bg: "#1e63c8", fg: "#fff", size: 34 }); sign.position.y = 76; sign.scale.set(124, 24, 1); g.add(sign);
  g.position.set(st.x, 0, st.y);
  scene.add(g);
  return g;
});

// The Joelmobile: a small open buggy with a canopy. It drives round the ring road.
const jm = new THREE.Group();
{
  const body = new THREE.Mesh(new THREE.BoxGeometry(24, 9, 40), mat("#f5c400", { roughness: 0.5 }));
  body.position.y = 9; body.castShadow = true; jm.add(body);
  const seat = new THREE.Mesh(new THREE.BoxGeometry(18, 8, 16), mat("#3a2d20")); seat.position.set(0, 16, -2); jm.add(seat);
  const canopy = new THREE.Mesh(new THREE.BoxGeometry(30, 2, 34), mat("#ffffff")); canopy.position.set(0, 26, 0); canopy.castShadow = true; jm.add(canopy);
  for (const [px, pz] of [[-16, -14], [16, -14], [-16, 14], [16, 14]]) { const wh = new THREE.Mesh(new THREE.CylinderGeometry(6, 6, 4, 14), mat("#1b1b1b")); wh.rotation.z = Math.PI / 2; wh.position.set(px, 6, pz); wh.castShadow = true; jm.add(wh); }
  const tag = label("JOEL", { bg: "#f5c400", fg: "#222", size: 42 }); tag.position.set(0, 36, 0); tag.scale.set(70, 18, 1); jm.add(tag);
  scene.add(jm);
}
const jmState = { s: STOPS[3].s, mode: "parked", at: 3, target: null, purpose: null };
function placeJM() {
  const p = ringPoint(jmState.s);
  jm.position.set(p.x, 0, p.y);
  jm.rotation.y = Math.atan2(p.dx, p.dy);
}
placeJM();

// The player: a simple figure with a cap, drawn in 3D.
const player3 = new THREE.Group();
{
  const legL = new THREE.Mesh(new THREE.BoxGeometry(5, 14, 5), mat("#2b2b2b")); legL.position.set(-3.5, 7, 0);
  const legR = new THREE.Mesh(new THREE.BoxGeometry(5, 14, 5), mat("#2b2b2b")); legR.position.set(3.5, 7, 0);
  const torso = new THREE.Mesh(new THREE.BoxGeometry(14, 16, 8), mat("#2f6fd1")); torso.position.y = 22;
  const head = new THREE.Mesh(new THREE.SphereGeometry(6.5, 14, 10), mat("#f2c9a0")); head.position.y = 36;
  const cap = new THREE.Mesh(new THREE.CylinderGeometry(6.5, 6.5, 3, 14), mat("#c83e2e")); cap.position.y = 40.5;
  const peak = new THREE.Mesh(new THREE.BoxGeometry(8, 1, 5), mat("#c83e2e")); peak.position.set(0, 39, 6);
  [legL, legR, torso, head, cap, peak].forEach((m) => { m.castShadow = true; player3.add(m); });
  player3.userData = { legL, legR, torso, head };
  scene.add(player3);
}

// ---- the game ----
const pos = () => ({ x: PLAYER.x, y: PLAYER.y });
function setPlayerPos(x, y) { PLAYER.x = x; PLAYER.y = y; }
let jmMsg = "";
function updateJM(dt) {
  if (jmState.mode !== "to") return;
  const st = STOPS[jmState.target];
  const dist = forwardDist(jmState.s, st.s);
  const move = Math.min(dist, SPEED * dt);
  jmState.s = (jmState.s + move) % LOOP;
  if (dist - move < 1.5) {
    jmState.s = st.s;
    jmState.mode = "parked"; jmState.at = jmState.target; jmState.target = null;
    if (jmState.purpose === "ride" && PLAYER.riding) {
      PLAYER.riding = false;
      setPlayerPos(st.x + 30, st.y);
      ridePanel.hidden = true;
      jmMsg = `You are at the ${st.name.split(" (")[0].toLowerCase()}. Mind the step.`;
    } else if (jmState.purpose === "call") {
      jmMsg = "The Joelmobile has arrived. It is only twenty minutes late. Press E to get on.";
    }
    jmState.purpose = null;
  }
  placeJM();
}
function callJM(i) {
  if (jmState.mode === "to") { jmMsg = "The Joelmobile is already on its way. It is going the long way round, as usual."; return; }
  if (jmState.mode === "parked" && jmState.at === i) { jmMsg = "The Joelmobile is already here. Press E to get on."; return; }
  jmState.mode = "to"; jmState.target = i; jmState.purpose = "call";
  jmMsg = `Called. The Joelmobile is coming to the ${STOPS[i].name.split(" (")[0].toLowerCase()}.`;
}
function boardJM() {
  PLAYER.riding = true;
  jmState.purpose = "ride";
  ridePanel.hidden = false;
  ridePanel.replaceChildren(
    Object.assign(document.createElement("strong"), { textContent: "Where to?" }),
    ...STOPS.map((st, i) => {
      if (i === jmState.at) return null;
      const b = Object.assign(document.createElement("button"), { type: "button", textContent: st.name, onclick: () => { jmState.mode = "to"; jmState.target = i; jmMsg = `Riding to the ${st.name.split(" (")[0].toLowerCase()}. Hold on.`; } });
      return b;
    }).filter(Boolean),
    Object.assign(document.createElement("p"), { className: "walk-help", textContent: "Or press 1 to 4 for a stop." })
  );
  jmMsg = "You are on the Joelmobile. Choose where to go.";
}

// ---- night, street lamps, traffic, pedestrians, minimap ----
let night = false;
const hemi = scene.children.find((o) => o.isHemisphereLight);
const lamps = [];
const lampMat = new THREE.MeshStandardMaterial({ color: "#fff2c2", emissive: "#ffd36b", emissiveIntensity: 0 });
const poolMat = new THREE.MeshBasicMaterial({ color: "#ffd98a", transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending });
const poolGeo = new THREE.CircleGeometry(38, 24);
function addLamp(x, z, y = 0) {
  const g = new THREE.Group();
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.4, 44, 8), mat("#4a4f57")); pole.position.y = 22; pole.castShadow = true; g.add(pole);
  const bulb = new THREE.Mesh(new THREE.SphereGeometry(4, 10, 8), lampMat); bulb.position.y = 45; g.add(bulb);
  g.position.set(x, y, z); scene.add(g); lamps.push(g);
  const pool = new THREE.Mesh(poolGeo, poolMat); pool.rotation.x = -Math.PI / 2; pool.position.set(x, y + 0.45, z); scene.add(pool);
}
for (let x = 70; x < W - 40; x += 150) { addLamp(x, 476); addLamp(x, 594); }
function setNight(on) {
  night = on;
  hemi.intensity = on ? 0.35 : 0.95;
  sun.intensity = on ? 0.2 : 1.15;
  lampMat.emissiveIntensity = on ? 2.4 : 0;
  poolMat.opacity = on ? 0.3 : 0;
  for (const m of glowMats) m.emissiveIntensity = on ? 1.7 : 0;
  scene.background = on ? new THREE.Color("#0c1630") : skyTex;
  scene.fog.color.set(on ? "#0c1630" : "#cfe3ef");
  jmMsg = on ? "Night mode. The street lamps are on. Press N for day." : "Day mode. Press N for night.";
}

// Traffic: cars follow set routes in the left-hand lane (as in Singapore). They keep a gap behind the car in front,
// slow for corners, and stop for you or the Joelmobile if you are in the way.
const cars = [];
const CAR_COLS = ["#d33b3b", "#2f6fd1", "#f2f2f2", "#2e8b57", "#ffb000", "#6a3fb5", "#222222"];
function makeCar(col) {
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.BoxGeometry(12, 6, 22), mat(col)); body.position.y = 5; body.castShadow = true; g.add(body);
  const cabin = new THREE.Mesh(new THREE.BoxGeometry(10, 5, 11), mat("#9fc3dd")); cabin.position.set(0, 10, -1); cabin.castShadow = true; g.add(cabin);
  scene.add(g);
  return g;
}
// A route is a closed polyline of lane-centre points. A car's place on it is its distance s along the line.
function makeRoute(pts) {
  const segs = []; let L = 0;
  for (let i = 0; i < pts.length; i++) {
    const a = pts[i], b = pts[(i + 1) % pts.length], len = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
    segs.push({ a, b, len, start: L }); L += len;
  }
  return { segs, L };
}
function routePos(r, s) {
  s = ((s % r.L) + r.L) % r.L;
  for (const g of r.segs) if (s <= g.start + g.len) {
    const t = (s - g.start) / g.len;
    return { x: g.a[0] + (g.b[0] - g.a[0]) * t, y: g.a[1] + (g.b[1] - g.a[1]) * t, hx: (g.b[0] - g.a[0]) / g.len, hy: (g.b[1] - g.a[1]) / g.len };
  }
  const g = r.segs[r.segs.length - 1];
  return { x: g.b[0], y: g.b[1], hx: 1, hy: 0 };
}
const LAN_E = 522, LAN_W = 548;   // main street lanes: eastbound in the north lane, westbound in the south lane (keep left)
// A: east along the main street, down the east ring, west along the bottom, back up the west ring.
const ROUTE_A = (() => { const sE = ringS(W - RC, LAN_E), sW = ringS(RC, LAN_E); const n = ((sW - sE) % LOOP + LOOP) % LOOP; return makeRoute([[70, LAN_E], [W - RC - 4, LAN_E], ...ringLane(sE, n, 0).slice(1, -1)]); })();
// B: west along the main street, up the west ring, east along the top, down the east ring to the main street again.
const ROUTE_B = (() => { const sW = ringS(RC, LAN_W), sE = ringS(W - RC, LAN_W); const n = ((sE - sW) % LOOP + LOOP) % LOOP; return makeRoute([[W - 70, LAN_W], [RC + 4, LAN_W], ...ringLane(sW, n, 0).slice(1, -1)]); })();
// C: up the south road to the roundabout, once round it (clockwise, keeping left), and back down the other lane.
const ROUTE_C = (() => {
  const pts = [[RB.x - 5, 520], [RB.x - 5, RB.y + RB.r + 2]];
  for (let i = 0; i <= 36; i++) { const a = Math.PI / 2 + (i / 36) * Math.PI * 2; pts.push([RB.x + RB.r * Math.cos(a), RB.y + RB.r * Math.sin(a)]); }
  pts.push([RB.x + 5, RB.y + RB.r + 2], [RB.x + 5, 520]);
  return makeRoute(pts);
})();
let carIdx = 0;
for (const [route, n, vmax] of [[ROUTE_A, 5, 95], [ROUTE_B, 5, 90], [ROUTE_C, 2, 55]]) {
  for (let i = 0; i < n; i++) cars.push({ g: makeCar(CAR_COLS[carIdx++ % CAR_COLS.length]), route, s: (i / n) * route.L, v: 0, vmax: vmax * (0.9 + (carIdx % 3) * 0.06), hd: 0 });
}
function updateCars(dt) {
  const others = (c) => [...cars.filter((o) => o !== c).map((o) => ({ x: o.g.position.x, y: o.g.position.z, e: o.elev || 0 })), ...(busApi ? busApi.buses.map((b) => ({ x: b.g.position.x, y: b.g.position.z, e: b.r.elev || 0 })) : []), { x: jm.position.x, y: jm.position.z, e: 0 }, { x: PLAYER.x, y: PLAYER.y, e: PLAYER.gy }];
  for (const c of cars) {
    const p = routePos(c.route, c.s), q = routePos(c.route, c.s + 30);
    let gap = Infinity;
    for (const o of others(c)) {
      const px = o.x - p.x, pz = o.y - p.y, ahead = px * p.hx + pz * p.hy, side = Math.abs(-px * p.hy + pz * p.hx);
      if (Math.abs(o.e - (c.elev || 0)) > 14) continue;
      if (ahead > 0 && ahead < 70 && side < 13) gap = Math.min(gap, ahead);
    }
    const bend = Math.abs(Math.atan2(p.hx * q.hy - p.hy * q.hx, p.hx * q.hx + p.hy * q.hy));
    let target = c.vmax * (bend > 0.4 ? 0.45 : 1);
    if (gap < 28) target = 0; else if (gap < 70) target = Math.min(target, (c.vmax * (gap - 28)) / 42);
    c.v += (target - c.v) * Math.min(1, dt * (target < c.v ? 5 : 1.5));
    c.s += c.v * dt;
    const np = routePos(c.route, c.s);
    c.g.position.set(np.x, c.elev || 0, np.y);
    const want = Math.atan2(np.hx, np.hy);
    let d = want - c.hd; d = Math.atan2(Math.sin(d), Math.cos(d)); c.hd += d * Math.min(1, dt * 6);
    c.g.rotation.y = c.hd;
  }
}

// Pedestrians: walking back and forth along the two pavements of the main street.
const peds = [];
const SHIRTS = ["#e4572e", "#17bebb", "#ffc914", "#76b041", "#8d6cab", "#ff7f11"];
function makeFigure(shirt) {
  const g = new THREE.Group();
  const legL = new THREE.Mesh(new THREE.BoxGeometry(5, 14, 5), mat("#2b2b2b")); legL.position.set(-3.5, 7, 0);
  const legR = new THREE.Mesh(new THREE.BoxGeometry(5, 14, 5), mat("#2b2b2b")); legR.position.set(3.5, 7, 0);
  const torso = new THREE.Mesh(new THREE.BoxGeometry(14, 16, 8), mat(shirt)); torso.position.y = 22;
  const head = new THREE.Mesh(new THREE.SphereGeometry(6.5, 14, 10), mat("#f2c9a0")); head.position.y = 36;
  [legL, legR, torso, head].forEach((m) => { m.castShadow = true; g.add(m); });
  g.userData = { legL, legR };
  scene.add(g);
  return g;
}
for (let i = 0; i < 18; i++) {
  const z = i % 2 ? 478 : 590;
  peds.push({ g: makeFigure(SHIRTS[i % SHIRTS.length]), x: 100 + ((i * 197) % (W - 200)), z, dir: i % 3 ? 1 : -1, v: 22 + ((i * 7) % 14), step: i });
}
function updatePeds(dt) {
  for (const p of peds) {
    p.x += p.dir * p.v * dt;
    if (p.x > W - 60 || p.x < 60) p.dir *= -1;
    p.step += dt * 8;
    p.g.position.set(p.x, 0, p.z);
    p.g.rotation.y = p.dir > 0 ? Math.PI / 2 : -Math.PI / 2;
    const sw = Math.sin(p.step) * 0.7;
    p.g.userData.legL.rotation.x = sw;
    p.g.userData.legR.rotation.x = -sw;
  }
}

// The map, top-right: the town and the countryside around it. Press M for a big map with names.
// You are red, the Joelmobile is yellow, your car is orange, and the stops are blue.
const MAPM = 560;                                   // margin around the town that the map shows
const MW = W + 2 * MAPM, MH = H + 2 * MAPM;
const mini = document.createElement("canvas");
mini.width = 760; mini.height = Math.round(760 * MH / MW);
mini.setAttribute("aria-hidden", "true");
let bigMap = false, mapHidden = false;
function sizeMap() {
  mini.style.cssText = `position:absolute;right:10px;top:10px;width:${bigMap ? "auto" : "300px"};height:${bigMap ? "calc(100% - 20px)" : "auto"};max-width:94%;aspect-ratio:${MW}/${MH};border:2px solid #fff;border-radius:8px;background:#4f8a3c;pointer-events:none;box-shadow:0 2px 10px rgba(0,0,0,.4);z-index:${bigMap ? 4 : 1};`;
}
function toggleBigMap() { mapHidden = false; bigMap = !bigMap; sizeMap(); miniAt = 0; }
function toggleMapHidden() { mapHidden = !mapHidden; miniAt = 0; jmMsg = mapHidden ? "Map hidden. Press H to show it." : "Map shown. Press H to hide it."; }
sizeMap();
stage.style.position = "relative";
stage.appendChild(mini);
const mctx = mini.getContext("2d");
let miniAt = 0;
function drawMini(now) {
  mini.style.display = inside.on || mapHidden ? "none" : "";
  if (inside.on || mapHidden || now - miniAt < 100) return;
  miniAt = now;
  const g = mctx, w = mini.width, h = mini.height, sc = w / MW;
  const X = (x) => (x + MAPM) * sc, Y = (y) => (y + MAPM) * sc, L = (v) => v * sc;
  g.clearRect(0, 0, w, h);
  g.fillStyle = "#4f8a3c"; g.fillRect(0, 0, w, h);                       // the countryside
  g.fillStyle = "#6fae52"; g.fillRect(X(0), Y(0), L(W), L(H));           // the town
  // hills and mountains
  for (const hl of WILD.hills) { g.fillStyle = "#8a7a52"; g.beginPath(); g.arc(X(hl.x), Y(hl.y), L(hl.r * 0.8), 0, 7); g.fill(); g.fillStyle = "#a5946a"; g.beginPath(); g.arc(X(hl.x), Y(hl.y), L(hl.r * 0.4), 0, 7); g.fill(); }
  for (const m of MOUNTAINS) { g.fillStyle = "#8d949b"; g.beginPath(); g.moveTo(X(m.x - m.r * 0.8), Y(m.y + m.r * 0.5)); g.lineTo(X(m.x), Y(m.y - m.r * 0.6)); g.lineTo(X(m.x + m.r * 0.8), Y(m.y + m.r * 0.5)); g.closePath(); g.fill(); g.fillStyle = "#fff"; g.beginPath(); g.moveTo(X(m.x - m.r * 0.22), Y(m.y - m.r * 0.28)); g.lineTo(X(m.x), Y(m.y - m.r * 0.6)); g.lineTo(X(m.x + m.r * 0.22), Y(m.y - m.r * 0.28)); g.closePath(); g.fill(); }
  // water
  g.strokeStyle = "#4da3d9"; g.lineWidth = Math.max(2, L(14)); g.lineJoin = "round"; for (const RV of RIVERS) { g.beginPath(); RV.forEach(([x, y], k) => (k ? g.lineTo(X(x), Y(y)) : g.moveTo(X(x), Y(y)))); g.stroke(); }
  g.fillStyle = "#4da3d9"; for (const l of WILD.lakes) { g.beginPath(); g.arc(X(l.x), Y(l.y), L(l.r), 0, 7); g.fill(); }
  // trees, as dots
  g.fillStyle = "#2f6f2a"; for (const t of trees) g.fillRect(X(t.x) - 1, Y(t.y) - 1, 2.2, 2.2);
  // roads
  g.fillStyle = "#4b4f55";
  g.fillRect(X(0), Y(500), L(W), L(70)); g.fillRect(X(0), Y(1002), L(W), L(32));
  g.strokeStyle = "#4b4f55"; g.lineWidth = L(BAND); g.lineJoin = "round"; g.beginPath(); RING.pts.forEach((q, i) => (i ? g.lineTo(X(q[0]), Y(q[1])) : g.moveTo(X(q[0]), Y(q[1])))); g.closePath(); g.stroke();
  g.strokeStyle = "#c2a86b"; g.lineWidth = Math.max(2, L(30)); g.beginPath(); HWY.forEach((q, i) => (i ? g.lineTo(X(q[0]), Y(q[1])) : g.moveTo(X(q[0]), Y(q[1])))); g.closePath(); g.stroke();   // the highway
  g.strokeStyle = "#4b4f55"; g.lineCap = "butt";
  for (const r of ROAD_NET) { g.lineWidth = Math.max(2, L(r.w)); g.beginPath(); g.moveTo(X(r.a[0]), Y(r.a[1])); g.lineTo(X(r.b[0]), Y(r.b[1])); g.stroke(); }
  g.lineWidth = L(ROAD_W);
  for (const [x1, y1, x2, y2] of SEGS) { g.beginPath(); g.moveTo(X(x1), Y(y1)); g.lineTo(X(x2), Y(y2)); g.stroke(); }
  g.strokeStyle = "#e9e2b5"; g.lineWidth = 1; g.setLineDash([5, 5]);
  g.beginPath(); g.moveTo(X(0), Y(535)); g.lineTo(X(W), Y(535)); g.moveTo(X(0), Y(1018)); g.lineTo(X(W), Y(1018)); g.stroke(); g.setLineDash([]);
  // buildings, with their names on the big map
  g.textAlign = "center"; g.textBaseline = "middle";
  for (const s of SOLID) {
    g.fillStyle = s.body; g.fillRect(X(s.x), Y(s.y), L(s.w), L(s.h));
    g.strokeStyle = s.trim; g.lineWidth = 1.2; g.strokeRect(X(s.x), Y(s.y), L(s.w), L(s.h));
    if (bigMap || s.w > 330) { g.fillStyle = "#1a1a1a"; g.font = `${bigMap ? 12 : 11}px system-ui, sans-serif`; g.fillText(s.name.replace("Peanut ", "").replace(" Office", ""), X(s.x + s.w / 2), Y(s.y + s.h / 2)); }
  }
  // the bus routes (on the big map), the bus stops and the buses
  if (bigMap) { g.lineWidth = 2.2; g.globalAlpha = 0.7; for (const r of busApi.ROUTES) { g.strokeStyle = r.col; g.beginPath(); r.poly.forEach((q, i) => (i ? g.lineTo(X(q[0]), Y(q[1])) : g.moveTo(X(q[0]), Y(q[1])))); g.closePath(); g.stroke(); } g.globalAlpha = 1; }
  g.fillStyle = "#fff"; g.strokeStyle = "#0b3b8f"; g.lineWidth = 1.4;
  for (const st of busApi.stops) { g.beginPath(); g.rect(X(st.x) - 2.5, Y(st.y) - 2.5, 5, 5); g.fill(); g.stroke(); }
  for (const b of busApi.buses) { g.fillStyle = b.r.col; g.beginPath(); g.arc(X(b.g.position.x), Y(b.g.position.z), bigMap ? 4.5 : 3.5, 0, 7); g.fill(); g.strokeStyle = "#fff"; g.lineWidth = 1; g.stroke(); }
  // stops, the Joelmobile, your car and you
  for (const st of STOPS) { g.fillStyle = "#1e63c8"; g.beginPath(); g.arc(X(st.x), Y(st.y), 4.5, 0, 7); g.fill(); g.strokeStyle = "#fff"; g.lineWidth = 1.5; g.stroke(); }
  g.fillStyle = "#ffd400"; g.beginPath(); g.arc(X(jm.position.x), Y(jm.position.z), 5, 0, 7); g.fill();
  if (drive.mesh && !drive.on) { g.fillStyle = "#ff8a00"; g.beginPath(); g.arc(X(drive.x), Y(drive.y), 4, 0, 7); g.fill(); }
  g.fillStyle = "#e0245e"; g.beginPath(); g.arc(X(PLAYER.x), Y(PLAYER.y), 6, 0, 7); g.fill(); g.strokeStyle = "#fff"; g.lineWidth = 2; g.stroke();
  // a compass and the title
  g.fillStyle = "#fff"; g.font = "bold 16px system-ui, sans-serif"; g.textAlign = "left"; g.fillText("N ↑", 10, 18);
  g.font = "13px system-ui, sans-serif"; g.textAlign = "right"; g.fillText(bigMap ? "Octee City (press M to shrink)" : "Octee City (M: big map)", w - 10, h - 12);
}

// ---- extra roads: asphalt, edge lines, kerbs, centre dashes, lamps and a zebra crossing ----
function addRoad(r) {
  const [ax, ay] = r.a, [bx, by] = r.b;
  const dx = bx - ax, dy = by - ay, L = Math.hypot(dx, dy), th = Math.atan2(dy, dx);
  const g = new THREE.Group();
  const asph = new THREE.Mesh(new THREE.PlaneGeometry(L, r.w), mat("#4b4f55"));
  asph.rotation.x = -Math.PI / 2; asph.receiveShadow = true; g.add(asph);
  for (const side of [-1, 1]) {
    const edge = new THREE.Mesh(new THREE.PlaneGeometry(L, 1.6), mat("#e9e2b5"));
    edge.rotation.x = -Math.PI / 2; edge.position.set(0, 0.05, side * (r.w / 2 - 2.5)); g.add(edge);
    const kerb = new THREE.Mesh(new THREE.BoxGeometry(L, 1.4, 3), mat("#d8d2c4"));
    kerb.position.set(0, 0.7, side * (r.w / 2 + 1.5)); kerb.castShadow = true; g.add(kerb);
  }
  for (let t = -L / 2 + 14; t < L / 2 - 10; t += 36) {
    const dash = new THREE.Mesh(new THREE.PlaneGeometry(18, 2.4), mat("#e9e2b5"));
    dash.rotation.x = -Math.PI / 2; dash.position.set(t, 0.06, 0); g.add(dash);
  }
  g.position.set((ax + bx) / 2, 0.2, (ay + by) / 2);
  g.rotation.y = -th;
  scene.add(g);
  // lamps along one side, a little off the kerb
  const nx = -dy / L, ny = dx / L, off = r.w / 2 + 7;
  for (let t = 40; t < L - 20; t += 120) {
    const px = ax + (dx * t) / L + nx * off, py = ay + (dy * t) / L + ny * off;
    addLamp(px, py);
  }
}
for (const r of ROAD_NET) addRoad(r);
fillet(RB.x - ROAD_W / 2, 500, -1, -1); fillet(RB.x + ROAD_W / 2, 500, 1, -1);          // the south road joins the main street
fillet(1650 - 12, 570, -1, 1); fillet(1650 + 12, 570, 1, 1);                              // the side road joins the main street...
fillet(1650 - 12, 1002, -1, -1); fillet(1650 + 12, 1002, 1, -1);                          // ...and the south street
fillet(2310 - 13, 570, -1, 1); fillet(2310 + 13, 570, 1, 1);                              // the terminal link joins the main street
fillet(2310 - 13, 710, -1, -1, 12); fillet(2310 + 13, 710, 1, -1, 12);
for (const [x, z] of [[2087, 727], [2533, 727], [2087, 933], [2533, 933]]) { const c = new THREE.Mesh(new THREE.CircleGeometry(17, 20), FILLET_MAT); c.rotation.x = -Math.PI / 2; c.position.set(x, 0.27, z); scene.add(c); }   // round corners on the loop

// A zebra crossing spans the whole width of a road: bars run along the road, in a row across it.
function crossing(cx, zTop, zBottom) {
  for (let z = zTop + 4; z < zBottom - 2; z += 8) {
    const bar = new THREE.Mesh(new THREE.PlaneGeometry(18, 4), mat("#f4f4f0"));
    bar.rotation.x = -Math.PI / 2; bar.position.set(cx, 0.34, z); bar.receiveShadow = true; scene.add(bar);
  }
}


// ---- more detail: crosswalk, awnings, benches, bins, lamps on the new roads, parked cars ----
// Crossings only where people actually cross: by the town square, east of the south-road junction, east of the side-road junction,
// and across the south street by the grocery store.
crossing(1110, 500, 570); crossing(1322, 500, 570); crossing(1624, 500, 570); crossing(1475, 1002, 1034);
// Awning, bench and bin at each building's door.
for (const s of B) {
  if (s.roof === "none") continue;
  const cx = s.x + s.w / 2, dz = s.y + s.h + 10;
  const awning = new THREE.Mesh(new THREE.BoxGeometry(38, 2.5, 10), mat(s.trim)); awning.position.set(cx, 30, s.y + s.h + 6); awning.castShadow = true; scene.add(awning);
  const bench = new THREE.Mesh(new THREE.BoxGeometry(14, 4, 4), mat("#8b5a2b")); bench.position.set(cx - 34, 3, dz); bench.castShadow = true; scene.add(bench);
  const bin = new THREE.Mesh(new THREE.CylinderGeometry(3, 3, 7, 10), mat("#2f5d3a")); bin.position.set(cx + 34, 3.5, dz); bin.castShadow = true; scene.add(bin);
  const lantern = new THREE.Mesh(new THREE.SphereGeometry(2.6, 8, 6), lampMat); lantern.position.set(cx, 26, s.y + s.h + 8); scene.add(lantern);
}
// Lamps along the new roads, on one side.
SEGS.forEach(([x1, y1, x2, y2], k) => {
  const ring = k < RING_PIECES;
  if (ring && k % 4 !== 0) return;
  const len = Math.hypot(x2 - x1, y2 - y1), n = Math.max(1, Math.floor(len / 80));
  const nx = (ring ? 1 : -1) * -(y2 - y1) / len, ny = (ring ? 1 : -1) * (x2 - x1) / len;
  for (let i = 0; i < n; i++) {
    const t = (i + 0.5) / n;
    addLamp(x1 + (x2 - x1) * t + nx * (ROAD_W / 2 + 8), y1 + (y2 - y1) * t + ny * (ROAD_W / 2 + 8));
  }
});
// Main street: tiled pavements on both sides, and tyre marks in the lanes.
for (const z of [493, 577]) {
  const pv = new THREE.Mesh(new THREE.PlaneGeometry(W, 14), mat("#ffffff", { map: tileTex(W / 64, 14 / 64) }));
  pv.rotation.x = -Math.PI / 2; pv.position.set(W / 2, 0.15, z); pv.receiveShadow = true; scene.add(pv);
}
const laneTyre = new THREE.MeshBasicMaterial({ color: "#16181b", transparent: true, opacity: 0.4, depthWrite: false });
for (const [x0, x1] of [[300, 430], [980, 1110]]) for (const z of [520, 546]) for (const o of [-3.5, 3.5]) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(x1 - x0, 2), laneTyre);
  m.rotation.x = -Math.PI / 2; m.position.set((x0 + x1) / 2, 0.32, z + o); scene.add(m);
}
// Junction squares: fill the corners where two roads meet, so the joins are clean.
const JUNCTIONS = [];
for (const [x1, y1, x2, y2] of SEGS.slice(RING_PIECES)) JUNCTIONS.push([x1, y1], [x2, y2]);
for (const [x, y] of JUNCTIONS) {
  const sq = new THREE.Mesh(new THREE.PlaneGeometry(ROAD_W, ROAD_W), mat("#4b4f55", { roughness: 0.95 }));
  sq.rotation.x = -Math.PI / 2; sq.position.set(x, 0.27, y); sq.receiveShadow = true; scene.add(sq);
}
// Footpaths: from each building's door straight to the nearest road, where the straight line is clear.
const ROAD_EDGES = [500, 570, 1002, 1034];
for (const b of B) {
  if (b.roof === "none" || b.id === "square" || b.id === "pool") continue;
  const cx = b.x + b.w / 2, d = b.y + b.h + 4;
  const above = ROAD_EDGES.filter((e) => e >= d), below = ROAD_EDGES.filter((e) => e <= d);
  const t = above.length ? Math.min(...above) - 2 : Math.max(...below) + 2;
  const lo = Math.min(d, t), hi = Math.max(d, t);
  const blocked = SOLID.some((o) => o !== b && cx + 5 > o.x && cx - 5 < o.x + o.w && lo < o.y + o.h && hi > o.y);
  if (blocked) continue;
  const path = new THREE.Mesh(new THREE.PlaneGeometry(9, hi - lo), mat("#ffffff", { map: tileTex(1, (hi - lo) / 64) }));
  path.rotation.x = -Math.PI / 2; path.position.set(cx, 0.3, (lo + hi) / 2); path.receiveShadow = true; scene.add(path);
}

// ---- the countryside: hills, mountains, lakes, a river, a waterfall, rocks and flowers ----
function hash2(x, y) { const v = Math.sin(x * 127.1 + y * 311.7) * 43758.5453; return v - Math.floor(v); }
function vnoise(x, y) {
  const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi, u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
  const a = hash2(xi, yi), b = hash2(xi + 1, yi), c = hash2(xi, yi + 1), d = hash2(xi + 1, yi + 1);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}
const moundH = (o, d) => (d >= 1 ? 0 : o.h * Math.pow(1 - d * d, o.power));
// A hill or mountain is a round heightfield, coloured by height: grass, scrub, rock and (for mountains) snow.
function mound(o) {
  const segs = o.hike ? 170 : o.h > 200 ? 56 : 44;
  const geo = new THREE.PlaneGeometry(2 * o.r, 2 * o.r, segs, segs);
  geo.rotateX(-Math.PI / 2);
  const pos = geo.attributes.position, col = new Float32Array(pos.count * 3);
  const carve = o.h > TUN_CROWN && TUN_PTS.some((q) => Math.hypot(q[0] - o.x, q[1] - o.y) < o.r + 80);
  for (let i = 0; i < pos.count; i++) {
    const px = pos.getX(i), pz = pos.getZ(i), d = Math.hypot(px, pz) / o.r;
    let hh = -0.6;
    if (d < 1) {
      const n = (vnoise(px / 45 + o.seed, pz / 45 + o.seed) - 0.5) * o.noise * 2 + (vnoise(px / 14 + o.seed, pz / 14) - 0.5) * o.noise * 0.6;
      hh = Math.max(-0.6, moundH(o, d) * (1 + n));
      if (carve && hh > TUN_CROWN) {                                   // bore the highway through: the ground over the tunnel is flattened to the roof
        let dm = 1e9; for (const q of TUN_PTS) { const dd = Math.hypot(o.x + px - q[0], o.y + pz - q[1]); if (dd < dm) dm = dd; }
        if (dm < 72) { const w = Math.min(1, Math.max(0, (dm - 34) / 38)); hh = Math.min(hh, TUN_CROWN + (hh - TUN_CROWN) * w); }
      }
    }
    pos.setY(i, hh);
    const t = o.h ? Math.max(0, hh) / o.h : 0;
    const c = o.snow && t > 0.72 ? [0.95, 0.97, 1.0] : t > 0.52 ? [0.5, 0.47, 0.42] : t > 0.26 ? [0.4, 0.52, 0.32] : [0.34, 0.56, 0.27];
    const j = 0.92 + hash2(i, 7) * 0.14;
    col[i * 3] = c[0] * j * 0.72; col[i * 3 + 1] = c[1] * j * 0.72; col[i * 3 + 2] = c[2] * j * 0.72;
  }
  geo.setAttribute("color", new THREE.BufferAttribute(col, 3));
  geo.computeVertexNormals();
  const m = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ vertexColors: true, flatShading: true, roughness: 0.95 }));
  m.position.set(o.x, 0, o.y); m.castShadow = true; m.receiveShadow = true; scene.add(m);
  if (carve) TUNNEL_MESHES.push(m);
}
for (const h of WILD.hills) mound(h);
for (const m of MOUNTAINS) mound(m);
mound(HIKE);

// Water: lakes with a sandy shore, a river, and ripples that drift.
const waterTex = canvasTex(128, 128, (g) => {
  const r = rng(21); g.fillStyle = "#3d8fb8"; g.fillRect(0, 0, 128, 128);
  for (let i = 0; i < 160; i++) { g.strokeStyle = r() < 0.5 ? "rgba(255,255,255,.22)" : "rgba(10,60,90,.18)"; g.lineWidth = 1 + r() * 1.5; g.beginPath(); const x = r() * 128, y = r() * 128; g.moveTo(x, y); g.quadraticCurveTo(x + 8, y - 3, x + 18, y); g.stroke(); }
}, [1, 1]);
const waters = [];
function waterMat(rx, ry) {
  const t = waterTex.clone(); t.needsUpdate = true; t.repeat.set(rx, ry); waters.push(t);
  return new THREE.MeshStandardMaterial({ map: t, roughness: 0.22, metalness: 0.15, transparent: true, opacity: 0.94 });
}
for (const l of WILD.lakes) {
  const shore = new THREE.Mesh(new THREE.CircleGeometry(l.r + 11, 48), mat("#d6c595"));
  shore.rotation.x = -Math.PI / 2; shore.position.set(l.x, 0.3, l.y); shore.receiveShadow = true; scene.add(shore);
  const lake = new THREE.Mesh(new THREE.CircleGeometry(l.r, 48), waterMat(l.r / 22, l.r / 22));
  lake.rotation.x = -Math.PI / 2; lake.position.set(l.x, 0.55, l.y); lake.receiveShadow = true; scene.add(lake);
}
for (const RV of RIVERS) for (let k = 1; k < RV.length; k++) {
  const [x1, y1] = RV[k - 1], [x2, y2] = RV[k], len = Math.hypot(x2 - x1, y2 - y1), ang = Math.atan2(y2 - y1, x2 - x1);
  const g = new THREE.Group(); g.position.set((x1 + x2) / 2, 0, (y1 + y2) / 2); g.rotation.y = -ang;
  const bank = new THREE.Mesh(new THREE.PlaneGeometry(len + 14, 30), mat("#d6c595")); bank.rotation.x = -Math.PI / 2; bank.position.y = 0.3; g.add(bank);
  const flow = new THREE.Mesh(new THREE.PlaneGeometry(len + 14, 18), waterMat(len / 36, 0.5)); flow.rotation.x = -Math.PI / 2; flow.position.y = 0.5; g.add(flow);
  scene.add(g);
}
// The waterfall pours down the east face of the big hill into the lake. It follows the hill's curve, a little above it.
const WA = WILD.hills[0];
const fallTex = canvasTex(64, 128, (g) => {
  const r = rng(33); g.fillStyle = "#bfe6f7"; g.fillRect(0, 0, 64, 128);
  for (let i = 0; i < 40; i++) { g.fillStyle = r() < 0.5 ? "rgba(255,255,255,.9)" : "rgba(80,160,200,.55)"; g.fillRect(r() * 64, r() * 128, 2 + r() * 4, 14 + r() * 34); }
}, [1, 3]);
const fall = (() => {
  const steps = 14, d0 = 0.5, d1 = 1.0, pos = [], uv = [], idx = [];
  for (let i = 0; i <= steps; i++) {
    const d = d0 + ((d1 - d0) * i) / steps, x = WA.x + WA.r * d, y = i === steps ? 0.9 : moundH(WA, d) + 3.5;
    pos.push(x, y, WA.y - 11, x, y, WA.y + 11); uv.push(0, i / steps, 1, i / steps);
    if (i < steps) { const a = i * 2; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); geo.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2)); geo.setIndex(idx);
  const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ map: fallTex, transparent: true, opacity: 0.9, side: THREE.DoubleSide }));
  scene.add(m);
  return m;
})();
const foam = [];
for (let i = 0; i < 7; i++) {
  const f = new THREE.Mesh(new THREE.SphereGeometry(6 + (i % 3) * 2, 8, 6), new THREE.MeshBasicMaterial({ color: "#ffffff", transparent: true, opacity: 0.55 }));
  f.position.set(WA.x + WA.r * 1.0 + 4, 3, WA.y - 15 + i * 5); f.scale.y = 0.5; scene.add(f); foam.push(f);
}
function updateLandscape(dt, now) {
  fallTex.offset.y -= dt * 1.4;
  waters.forEach((t, i) => { t.offset.x += dt * 0.012; t.offset.y += dt * 0.006 * (1 + (i % 3)); });
  foam.forEach((f, i) => { const k = 1 + Math.sin(now / 280 + i) * 0.18; f.scale.set(k, 0.5 * k, k); });
}
// Rocks round the foot of the waterfall and along the lake shores.
{
  const r = rng(55);
  for (const [cx, cy, spread, n] of [[WA.x + WA.r + 10, WA.y, 50, 12], [1000, 1350, 150, 10], [-95, 300, 80, 8]]) {
    for (let i = 0; i < n; i++) {
      const a = r() * Math.PI * 2, d = 30 + r() * spread, k = 3 + r() * 6;
      const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(k, 0), mat(r() < 0.5 ? "#8a8579" : "#6f6a60", { flatShading: true }));
      rock.position.set(cx + Math.cos(a) * d, k * 0.4, cy + Math.sin(a) * d); rock.rotation.set(r() * 3, r() * 3, r() * 3); rock.castShadow = true; scene.add(rock);
    }
  }
}
// Flowers dotted over the grass in town.
{
  const r = rng(9), spots = [];
  const okSpot = (x, y) => {
    if (x < BAND + 14 || x > W - BAND - 14 || y < BAND + 14 || y > H - BAND - 14) return false;
    if ((y > 478 && y < 592) || (y > 986 && y < 1040)) return false;
    for (const b of SOLID) if (x > b.x - 12 && x < b.x + b.w + 12 && y > b.y - 12 && y < b.y + b.h + 24) return false;
    for (const sg of SEGS) if (segDist(x, y, sg) < ROAD_W / 2 + 22) return false;
    for (const rn of ROAD_NET) if (distToSeg(x, y, rn) < rn.w / 2 + 22) return false;
    return true;
  };
  for (let i = 0; i < 1800 && spots.length < 260; i++) { const x = r() * W, y = r() * H; if (okSpot(x, y)) spots.push([x, y]); }
  const fl = new THREE.InstancedMesh(new THREE.SphereGeometry(2.2, 6, 5), new THREE.MeshStandardMaterial({ roughness: 0.8 }), spots.length);
  const dummy = new THREE.Object3D(), pal = ["#ffd23f", "#ff6b9d", "#ffffff", "#b388ff", "#ff8c42"];
  spots.forEach(([x, y], i) => { dummy.position.set(x, 2, y); dummy.updateMatrix(); fl.setMatrixAt(i, dummy.matrix); fl.setColorAt(i, new THREE.Color(pal[i % pal.length])); });
  fl.instanceMatrix.needsUpdate = true; if (fl.instanceColor) fl.instanceColor.needsUpdate = true;
  scene.add(fl);
}

// ---- buy a car at the Car Park, and drive it ----
const CAR_SPEEDS = { scooter: 1.5, hatch: 2.0, sports: 2.8, limo: 2.3 };
const CARBODY = { w: 22, h: 22 };
const garage = { cars: [], mine: null, wallet: null, msg: "" };
const drive = { on: false, x: 0, y: 0, a: 0, v: 0, speed: 1, mesh: null, id: null };
function buildCarMesh(id) {
  const [col, w, h, len] = { scooter: ["#e86a2d", 9, 5, 15], hatch: ["#2f9ed8", 13, 7, 22], sports: ["#d91e2b", 14, 5, 26], limo: ["#15151a", 13, 8, 38] }[id] || ["#888888", 12, 6, 22];
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.BoxGeometry(w, h, len), mat(col, { roughness: 0.35, metalness: 0.3 })); body.position.y = 4 + h / 2; body.castShadow = true; g.add(body);
  if (id === "scooter") {
    const bar = new THREE.Mesh(new THREE.BoxGeometry(12, 1.5, 1.5), mat("#222222")); bar.position.set(0, 4 + h + 4, len / 2 - 3); g.add(bar);
    const seat = new THREE.Mesh(new THREE.BoxGeometry(6, 2, 6), mat("#222222")); seat.position.set(0, 4 + h + 1, -2); g.add(seat);
  } else {
    const cabin = new THREE.Mesh(new THREE.BoxGeometry(w - 2, h * 0.8, len * 0.42), mat("#a8d4ee", { roughness: 0.15, metalness: 0.4 })); cabin.position.set(0, 4 + h + h * 0.4, -len * 0.05); cabin.castShadow = true; g.add(cabin);
  }
  if (id === "sports") { const sp = new THREE.Mesh(new THREE.BoxGeometry(w, 1.2, 4), mat("#222222")); sp.position.set(0, 4 + h + 4, -len / 2 + 2); g.add(sp); }
  for (const [px, pz] of [[-1, -0.32], [1, -0.32], [-1, 0.32], [1, 0.32]]) { const wh = new THREE.Mesh(new THREE.CylinderGeometry(4, 4, 3, 12), mat("#1b1b1b")); wh.rotation.z = Math.PI / 2; wh.position.set((px * (w + 2)) / 2, 4, pz * len); g.add(wh); }
  for (const px of [-1, 1]) { const hl = new THREE.Mesh(new THREE.BoxGeometry(2.5, 1.8, 0.8), new THREE.MeshStandardMaterial({ color: "#fff3b0", emissive: "#ffe27a", emissiveIntensity: 1.2 })); hl.position.set(px * (w / 2 - 2.5), 4 + h * 0.6, len / 2 + 0.3); g.add(hl); }
  scene.add(g);
  return g;
}
function spawnMyCar(id) {
  if (drive.mesh) scene.remove(drive.mesh);
  drive.mesh = buildCarMesh(id); drive.id = id; drive.speed = CAR_SPEEDS[id] || 1.5;
  if (!drive.x && !drive.y) { drive.x = 392; drive.y = 770; drive.a = Math.PI / 2; }
  drive.mesh.position.set(drive.x, PLAYER.gy, drive.y); drive.mesh.rotation.y = drive.a;
}
async function carApi(method, path, body) {
  if (!CFG || !cloudMod || !cloudMod.cloudLinked()) throw new Error("login");
  const res = await fetch(CFG.CLOUD_URL + path, { method, headers: { ...(body ? { "content-type": "application/json" } : {}), authorization: "Bearer " + cloudMod.cloudState().token }, body: body ? JSON.stringify(body) : undefined });
  const j = await res.json().catch(() => ({}));
  if (res.status === 404) throw new Error("That shop is not open yet: the Octee Cloud has not been updated with it. (Deploy the latest cloud/index.js.)");
  if (res.status === 401) throw new Error("Log in to Octee Cloud first.");
  if (!res.ok) throw new Error(j.message || "Nothing was changed.");
  return j;
}
async function loadGarage() {
  try { const j = await carApi("GET", "/api/city/cars"); garage.cars = j.cars; garage.mine = j.mine; garage.wallet = j.wallet; if (j.mine) spawnMyCar(j.mine); } catch { /* not logged in, or the cloud is away */ }
  renderGarage();
}
const garagePanel = document.createElement("div");
garagePanel.hidden = true;
garagePanel.style.cssText = "position:absolute;left:12px;top:12px;background:#fff;color:#222;padding:10px 12px;border-radius:10px;max-width:290px;box-shadow:0 4px 16px rgba(0,0,0,.25);font:14px/1.35 system-ui,sans-serif;z-index:5";
stage.appendChild(garagePanel);
function renderGarage() {
  const kids = [Object.assign(document.createElement("strong"), { textContent: "The Car Park: cars for sale" })];
  const note = (t) => kids.push(Object.assign(document.createElement("p"), { textContent: t, style: "margin:6px 0" }));
  if (!cloudMod || !cloudMod.cloudLinked()) {
    note("Log in to Octee Cloud to buy a car. Walking and looking are still free.");
    const a = Object.assign(document.createElement("a"), { href: "https://zengyixin0205.github.io/Octee-airline/login.html", textContent: "Log in" }); kids.push(a);
  } else if (!garage.cars.length) note("The cars are being polished. Try again in a moment.");
  else {
    note(`Wallet: ${garage.wallet} CCT. One car each; a new one replaces the old one, with no refund.`);
    for (const c of garage.cars) {
      const b = Object.assign(document.createElement("button"), { type: "button", textContent: garage.mine === c.id ? `${c.name}: yours` : `${c.name}: ${c.price} CCT (speed x${c.speed})`, disabled: garage.mine === c.id });
      b.style.cssText = "display:block;width:100%;margin:6px 0;padding:6px 8px;border:1px solid #888;border-radius:6px;background:#f6f6f6;cursor:pointer;text-align:left";
      b.onclick = async () => { try { const j = await carApi("POST", "/api/city/car/buy", { model: c.id }); garage.mine = j.mine; garage.wallet = j.wallet; garage.msg = j.message; spawnMyCar(j.mine); } catch (e) { garage.msg = e.message; } renderGarage(); };
      kids.push(b);
    }
  }
  if (garage.msg) note(garage.msg);
  note("Press G to close.");
  garagePanel.replaceChildren(...kids);
}
const nearCarPark = () => Math.hypot(PLAYER.x - 340, PLAYER.y - 745) < 150;
function showGarage() { garagePanel.hidden = false; garage.msg = ""; renderGarage(); loadGarage(); }
function toggleGarage() {
  if (inside.on) { if (inside.state.b && inside.state.b.id === "car") showGarage(); return; }
  if (busApi.riding) return;
  if (!garagePanel.hidden) { garagePanel.hidden = true; return; }
  if (!nearCarPark() || drive.on) { jmMsg = "The Car Park sells the cars. Walk to it on foot and press G."; return; }
  garagePanel.hidden = false; garage.msg = ""; renderGarage(); loadGarage();
}
function toggleCar() {
  if (inside.on || busApi.riding) return;
  if (!drive.mesh) { jmMsg = "You do not own a car yet. Buy one at the Car Park (press G there)."; return; }
  if (drive.on) {
    drive.on = false; drive.v = 0;
    for (const [ox, oy] of [[34, 0], [-34, 0], [0, 34], [0, -34]]) if (free(drive.x + ox, drive.y + oy)) { PLAYER.x = drive.x + ox; PLAYER.y = drive.y + oy; break; }
    jmMsg = "You got out. Press V next to the car to get back in."; return;
  }
  if (PLAYER.riding) return;
  if (Math.hypot(PLAYER.x - drive.x, PLAYER.y - drive.y) > 80) { jmMsg = "Walk to your car and press V."; return; }
  drive.on = true; garagePanel.hidden = true; jmMsg = "Driving. W go, S brake or reverse, A and D steer. V gets you out.";
}
function driveStep(dt) {
  const acc = keys.has("up") ? 1 : keys.has("down") ? -0.7 : 0, top = 130 * drive.speed;
  drive.v += acc * 260 * dt;
  if (!acc) drive.v *= Math.pow(0.35, dt);
  drive.v = Math.max(-top * 0.4, Math.min(top, drive.v));
  const steer = (keys.has("left") ? 1 : 0) - (keys.has("right") ? 1 : 0);
  drive.a += steer * 2.4 * Math.min(1, Math.abs(drive.v) / 60) * Math.sign(drive.v) * dt;
  const nx = drive.x + Math.sin(drive.a) * drive.v * dt, ny = drive.y + Math.cos(drive.a) * drive.v * dt;
  if (free(nx, ny, CARBODY)) { drive.x = nx; drive.y = ny; } else drive.v *= -0.2;
  PLAYER.x = drive.x; PLAYER.y = drive.y;
  drive.mesh.position.set(drive.x, PLAYER.gy, drive.y); drive.mesh.rotation.y = drive.a;
}
loadGarage();

// The trail up the big mountain, the highway round the town, and its bridges (walk-world.js)
createWorld({ HWY_TUN, TUN_CROWN, THREE, scene, mat, label, addLamp, ribbon, ribbonGeo, dashAlong, HIKE, TRAIL, TRAIL_W, JUMPS, HWY, HWY_H, RAMPS, RIVER_N, RIVER_S, cars, makeCar, makeRoute, W, H });

// The buses (walk-bus.js)
mario = createMario({ THREE, scene, mat, PLAYER, TRAIL, TRAIL_W, HIKE, JUMPS, stage, loggedIn: () => !!(cloudMod && cloudMod.cloudLinked()), cloudPlay: (score) => carApi("POST", "/api/city/play", { game: "hike", score }) });
busApi = createBus({ THREE, scene, mat, label, PLAYER, stage, W, H, RB, SOLID, HWY, HWY_H, RAMPS, makeFigure, routePos, makeRoute, ringS, ringLane, LOOP, cars, jm, setMsg: (t) => { jmMsg = t; } });

// Inside the shops (walk-inside.js)
inside = createInside({ THREE, scene, mat, label, makeFigure, PLAYER, stage, B, tileTex, carApi, loggedIn: () => !!(cloudMod && cloudMod.cloudLinked()), free, openRoutes: () => busApi.showRoutes(), openGarage: () => showGarage() });

// Input
const KEYMAP = { w: "up", arrowup: "up", s: "down", arrowdown: "down", a: "left", arrowleft: "left", d: "right", arrowright: "right" };
function action() {
  if (inside.on) { inside.action(); return; }
  if ((busApi.panelOpen || busApi.boardable()) && busApi.action()) return;
  if (PLAYER.riding || drive.on) return;
  const s = nearestStop();
  if (s >= 0) {
    if (jmState.mode === "parked" && jmState.at === s && Math.hypot(PLAYER.x - jm.position.x, PLAYER.y - jm.position.z) < 90) { boardJM(); return; }
    callJM(s); return;
  }
  const door = nearestDoor();
  if (!door && busApi.nearStop()) { busApi.action(); return; }
  if (door) { if (inside.canEnter(door)) inside.enter(door); else location.href = door.href ? door.href : "index.html#" + door.id; }
}
window.addEventListener("keydown", (e) => {
  const k = e.key.toLowerCase();
  if (KEYMAP[k]) { keys.add(KEYMAP[k]); e.preventDefault(); }
  if (k === "e") action();
  if (k === "n") setNight(!night);
  if (k === "f") toggleFull();
  if (k === "b") busApi.showArrivals();
  if (k === "k") busApi.showRoutes();
  if (e.code === "Space") { e.preventDefault(); if (!PLAYER.riding && !drive.on && PLAYER.hop === 0 && !e.repeat) PLAYER.vh = 190; }
  if (k === "m") toggleBigMap();
  if (k === "h") toggleMapHidden();
  if (k === "i") { if (inside.panelOpen) inside.close(); else inside.openBag(); }
  if (k === "v") toggleCar();
  if (k === "g") toggleGarage();
  if (k === "escape") { garagePanel.hidden = true; inside.close(); busApi.close(); }
  if (PLAYER.riding && k >= "1" && k <= "4") { const b = ridePanel.querySelectorAll("button")[Number(k) - 1]; if (b) b.click(); }
});
window.addEventListener("keyup", (e) => { const k = e.key.toLowerCase(); if (KEYMAP[k]) keys.delete(KEYMAP[k]); });
window.addEventListener("blur", () => keys.clear());
for (const b of document.querySelectorAll("#walk-buttons button, button[data-k]")) {
  const k = b.dataset.k;
  if (k === "action") { b.addEventListener("click", action); continue; }
  const on = () => keys.add(k), off = () => keys.delete(k);
  b.addEventListener("pointerdown", on); b.addEventListener("pointerup", off); b.addEventListener("pointerleave", off);
}

// Camera: a third-person view from behind and above, which follows you.
const cam = { x: PLAYER.x, y: PLAYER.y, h: 0 };
function resize() {
  const w = stage.clientWidth, h = stage.clientHeight;
  renderer.setSize(w, h, false);
  camera.aspect = w / h; camera.updateProjectionMatrix();
}
window.addEventListener("resize", resize);
document.addEventListener("fullscreenchange", () => { resize(); setTimeout(resize, 120); });
function toggleFull() {
  if (document.fullscreenElement) { document.exitFullscreen && document.exitFullscreen(); return; }
  if (stage.requestFullscreen) stage.requestFullscreen().catch(() => { jmMsg = "Your browser would not go full screen."; });
  else jmMsg = "This browser has no full screen.";
}
resize();

let last = performance.now();
function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000); last = now;
  // driving, or walking
  if (busApi.riding) { /* the bus carries you */ }
  else if (drive.on) driveStep(dt);
  else if (!PLAYER.riding) {
    let dx = 0, dy = 0;
    if (keys.has("left")) dx -= 1;
    if (keys.has("right")) dx += 1;
    if (keys.has("up")) dy -= 1;
    if (keys.has("down")) dy += 1;
    if (dx && dy) { dx *= Math.SQRT1_2; dy *= Math.SQRT1_2; }
    if (dx || dy) {
      const sp = 150 * dt;
      PLAYER.face = Math.atan2(dx, dy);
      PLAYER.step += dt * 9;
      if (free(PLAYER.x + dx * sp, PLAYER.y)) PLAYER.x += dx * sp;
      if (free(PLAYER.x, PLAYER.y + dy * sp)) PLAYER.y += dy * sp;
    } else PLAYER.step = 0;
  } else {
    const p = ringPoint(jmState.s);
    setPlayerPos(p.x + 8, p.y + 8);
  }
  // height: you stand on the trail's steps, and Space hops
  { const gy = groundAt(PLAYER.x, PLAYER.y); PLAYER.gy += (gy - PLAYER.gy) * Math.min(1, dt * 16);
    if (PLAYER.hop > 0 || PLAYER.vh) { PLAYER.vh -= 520 * dt; PLAYER.hop += PLAYER.vh * dt; if (PLAYER.hop <= 0) { PLAYER.hop = 0; PLAYER.vh = 0; } }
    PLAYER.z = PLAYER.gy + PLAYER.hop; }
  busApi.update(dt);
  mario.update(dt, now);
  { const inTun = PLAYER.gy > 30 && TUN_PTS.some((q) => Math.hypot(PLAYER.x - q[0], PLAYER.y - q[1]) < 44);
    if (inTun !== tunnelXray) { tunnelXray = inTun; for (const m of TUNNEL_MESHES) { m.material.transparent = inTun; m.material.opacity = inTun ? 0.2 : 1; m.material.depthWrite = !inTun; m.material.needsUpdate = true; } } }
  updateJM(dt);
  updateCars(dt);
  updatePeds(dt);
  updateLandscape(dt, now);
  updateFia(dt);
  drawMini(now);
  // draw the player
  player3.position.set(PLAYER.x, PLAYER.z, PLAYER.y);
  player3.rotation.y = PLAYER.face;
  const sw = Math.sin(PLAYER.step) * 0.7, u = player3.userData;
  if (u.legL) { u.legL.rotation.x = sw; u.legR.rotation.x = -sw; }
  player3.visible = !(PLAYER.riding || drive.on || busApi.riding);
  // camera
  cam.x += (PLAYER.x - cam.x) * Math.min(1, dt * 8);
  cam.y += (PLAYER.y - cam.y) * Math.min(1, dt * 8);
  const co = inside.on ? inside.camOffset : { x: -60, y: 330, z: 300 };
  cam.h += (PLAYER.gy - cam.h) * Math.min(1, dt * 5);
  camera.position.set(cam.x + co.x, co.y + cam.h, cam.y + co.z);
  camera.lookAt(cam.x, 20 + cam.h, cam.y);
  sun.position.set(cam.x - 500, 900 + cam.h, cam.y + 380);
  sun.target.position.set(cam.x, cam.h, cam.y);
  if (!sun.target.parent) scene.add(sun.target);
  renderer.render(scene, camera);
  // the prompt
  let text = jmMsg;
  if (!text && inside.on) text = inside.prompt();
  else if (!text && busApi.prompt() && (busApi.boardable() || !nearestDoor())) text = busApi.prompt();
  else if (!text) {
    const s = nearestStop();
    const door = nearestDoor();
    if (drive.on) text = "Driving. V to get out.";
    else if (PLAYER.riding) text = "Riding the Joelmobile.";
    else if (drive.mesh && Math.hypot(PLAYER.x - drive.x, PLAYER.y - drive.y) < 80) text = "Press V to get in your car";
    else if (nearCarPark() && !door) text = "Press G to see the cars for sale";
    else if (s >= 0 && jmState.mode === "parked" && jmState.at === s && Math.hypot(PLAYER.x - jm.position.x, PLAYER.y - jm.position.z) < 90) text = "Press E to get on the Joelmobile";
    else if (s >= 0) text = `Press E to call the Joelmobile to the ${STOPS[s].name.split(" (")[0].toLowerCase()}`;
    else if (door) text = door.runway ? "Press E to visit Octee Airlines" : `Press E to go into ${door.name}`;
  }
  if (hud.textContent !== text) hud.textContent = text;
  if (jmMsg && !PLAYER.riding && now - (frame.msgAt || 0) > 4000) { frame.msgAt = now; jmMsg = ""; }
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

// For tests: lets a script read where you are and what the Joelmobile is doing.
window.__walk = { HWY_TUN, TUN_PTS, TUNNEL_MESHES, mario, busApi, TRAIL, groundAt, inside, free, drive, garage, ownCar: (id) => { garage.mine = id; spawnMyCar(id); }, PLAYER, jmState, nearestDoor, nearestStop, STOPS, callJM, boardJM, ringPoint, get jmPos() { return { x: jm.position.x, z: jm.position.z }; } };
