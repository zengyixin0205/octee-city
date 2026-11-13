// Walk around Octee City in 3D (Three.js). WASD or arrow keys to walk, E to go in, call the Joelmobile at a stop, or get on it.
// Everything is drawn in code: no photos. The map is hand-placed and not symmetrical.
import * as THREE from "three";

const W = 1800, H = 1200;            // the town, in world units (1 unit is roughly a metre of a very small town)

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
  { id: "lounge", name: "Platinum Lounge", x: 1120, y: 1040, w: 160, h: 100, H: 44, body: "#d9d4ee", trim: "#4b3f7a", roof: "flat", gold: true },
];
// The airport: a long terminal, a runway and a control tower. You can walk in through its door to the Octee Airlines site.
const FIA = { id: "fia", name: "FIA airport", x: 1280, y: 40, w: 440, h: 190, H: 36, body: "#e8eef4", trim: "#33414e", roof: "flat", runway: true, href: "https://zengyixin0205.github.io/Octee-airline/" };
const SOLID = [...B, FIA];

// Extra roads, as segments [x1, y1, x2, y2]. A K joins the main street, and an F joins the south street.
const ROAD_W = 22;
const SEGS = [
  [1200, 250, 1200, 504],   // K: spine, runs into the main street at its foot
  [1200, 360, 1400, 236],   // K: upper arm, runs into the airport
  [1200, 360, 1455, 458],   // K: lower arm, runs into the radio tower
  [640, 1006, 640, 1140],   // F: spine, runs into the south street at its top
  [640, 1060, 900, 1060],   // F: top bar, turns down into the laundrette
  [900, 1000, 900, 1060],   // F: short stub, runs into the laundrette
  [640, 1100, 1124, 1100],  // F: bottom bar, runs into the lounge
];
function segDist(px, py, [x1, y1, x2, y2]) {
  const dx = x2 - x1, dy = y2 - y1;
  const t = Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / (dx * dx + dy * dy)));
  return Math.hypot(px - (x1 + t * dx), py - (y1 + t * dy));
}

// Extra roads: a K shape, joined by a short link road to an F shape, and a side road from the main street down to the south street.
const ROAD_NET = [
  { a: [920, 140], b: [920, 280], w: 22 },    // K: stem
  { a: [920, 210], b: [1040, 140], w: 20 },   // K: upper arm
  { a: [920, 210], b: [1040, 280], w: 20 },   // K: lower arm
  { a: [1040, 140], b: [1150, 145], w: 20 },  // link from K to F
  { a: [1150, 145], b: [1150, 290], w: 22 },  // F: stem
  { a: [1150, 145], b: [1250, 145], w: 20 },  // F: top bar
  { a: [1150, 215], b: [1230, 215], w: 20 },  // F: middle bar
  { a: [1650, 560], b: [1650, 1000], w: 24 }, // side road to the south street
];
function distToSeg(px, py, r) {
  const [ax, ay] = r.a, [bx, by] = r.b, dx = bx - ax, dy = by - ay;
  const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy)));
  return Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
}

// The ring road goes all the way round the town, on the outside edges. Stops sit on it, and the Joelmobile drives it.
const BAND = 36, RC = 18;                       // band width, and the centre line of the ring road
const RL = W - 2 * RC, RH = H - 2 * RC;        // lengths of the top/bottom and left/right sides
const LOOP = 2 * RL + 2 * RH;                   // the whole way round
// Stops: name, a point on the sidewalk (where you stand), and its place on the ring (distance round the loop).
const STOPS = [
  { name: "North stop (Clinic side)", x: 820, y: 60, s: (820 - RC) },
  { name: "East stop (Market side)", x: 1744, y: 760, s: RL + (760 - RC) },
  { name: "South stop (Harbour side)", x: 520, y: 1140, s: RL + RH + (W - RC - 520) },
  { name: "West stop (Tax side)", x: 56, y: 560, s: RL + RH + RL + (H - RC - 560) },
];
const SPEED = 230;                              // the Joelmobile, in world units a second
const PLAYER = { x: 960, y: 580, step: 0, riding: false, face: 0 };
const keys = new Set();
const BODY = { w: 18, h: 14 };                 // the player's feet, for walls

// ---- helpers ----
const hit = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
function free(px, py) {
  const box = { x: px - BODY.w / 2, y: py - BODY.h / 2, ...BODY };
  if (box.x < 0 || box.y < 0 || box.x + box.w > W || box.y + box.h > H) return false;
  return !SOLID.some((s) => hit(box, s));
}
function ringPoint(s) {                          // where the ring road is at distance s round the loop
  s = ((s % LOOP) + LOOP) % LOOP;
  if (s < RL) return { x: RC + s, y: RC, dx: 1, dy: 0 };
  if (s < RL + RH) return { x: W - RC, y: RC + (s - RL), dx: 0, dy: 1 };
  if (s < 2 * RL + RH) return { x: W - RC - (s - RL - RH), y: H - RC, dx: -1, dy: 0 };
  return { x: RC, y: H - RC - (s - 2 * RL - RH), dx: 0, dy: -1 };
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
scene.background = new THREE.Color("#9fd3f0");
scene.fog = new THREE.Fog("#c9e8f7", 1400, 3200);
const camera = new THREE.PerspectiveCamera(46, 16 / 9, 5, 4000);

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
}, [60, 40]);
function roadTex(horizontal) {
  return canvasTex(256, 64, (g, w, h) => {
    g.fillStyle = "#4b4f55"; g.fillRect(0, 0, w, h);
    g.fillStyle = "#e9e2b5";
    if (horizontal) { for (let x = 0; x < w; x += 64) g.fillRect(x + 8, h / 2 - 2, 36, 4); }
    else { for (let y = 0; y < h; y += 64) g.fillRect(w / 2 - 2, y + 8, 4, 36); }
  }, [1, 1]);
}
const ROAD_H = roadTex(true), ROAD_V = roadTex(false);
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
const ground = new THREE.Mesh(new THREE.PlaneGeometry(W + 600, H + 600), mat("#7db45c", { map: grassTex }));
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
    g.fillStyle = "#f4f1e6"; g.fillRect(0, 3, w, 3); g.fillRect(0, h - 6, w, 3);
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
for (const [x1, y1, x2, y2] of SEGS) roadSeg(x1, y1, x2, y2);
road(0, 500, W, 70, ROAD_H);                          // main street
road(0, 1002, W, 32, ROAD_H);                         // south street
road(0, 0, W, BAND, ROAD_H); road(0, H - BAND, W, BAND, ROAD_H);   // ring, top and bottom
road(0, 0, BAND, H, ROAD_V); road(W - BAND, 0, BAND, H, ROAD_V);   // ring, left and right
// pavements on the ring's inner edge
for (const [x, y, w, h] of [[BAND, BAND, W - 2 * BAND, 10], [BAND, H - BAND - 10, W - 2 * BAND, 10], [BAND, BAND, 10, H - 2 * BAND], [W - BAND - 10, BAND, 10, H - 2 * BAND]]) {
  const p = new THREE.Mesh(new THREE.BoxGeometry(w, 1.2, h), mat("#c9c4b8"));
  p.position.set(x + w / 2, 0.6, y + h / 2); p.receiveShadow = true; scene.add(p);
}

// Buildings
function addBuilding(s) {
  const g = new THREE.Group();
  const bodyH = s.H, cx = s.x + s.w / 2, cz = s.y + s.h / 2;
  if (s.roof !== "none") {
    const tex = facadeTex(s.body, s.trim);
    tex.repeat.set(Math.max(1, s.w / 120), Math.max(1, bodyH / 60));
    const walls = new THREE.Mesh(new THREE.BoxGeometry(s.w, bodyH, s.h), [mat(s.body), mat(s.body), mat(s.body), mat(s.body), new THREE.MeshStandardMaterial({ map: tex, roughness: 0.7 }), mat(s.body)]);
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
function addFia(s) {
  const g = new THREE.Group();
  const term = new THREE.Mesh(new THREE.BoxGeometry(s.w - 60, s.H, 120), [mat(s.body), mat(s.body), mat(s.body), mat(s.body), new THREE.MeshStandardMaterial({ map: facadeTex(s.body, s.trim), roughness: 0.6 }), mat(s.body)]);
  term.position.set(s.x + s.w / 2 - 30, s.H / 2, s.y + 60); term.castShadow = true; term.receiveShadow = true; g.add(term);
  const roof = new THREE.Mesh(new THREE.BoxGeometry(s.w - 50, 6, 130), mat(s.trim)); roof.position.set(s.x + s.w / 2 - 30, s.H + 3, s.y + 60); roof.castShadow = true; g.add(roof);
  const runway = new THREE.Mesh(new THREE.PlaneGeometry(s.w - 60, 50), mat("#4b4f55")); runway.rotation.x = -Math.PI / 2; runway.position.set(s.x + s.w / 2 - 30, 0.3, s.y + 220); runway.receiveShadow = true; g.add(runway);
  for (let i = 0; i < 9; i++) { const dash = new THREE.Mesh(new THREE.PlaneGeometry(12, 2), mat("#ffffff")); dash.rotation.x = -Math.PI / 2; dash.position.set(s.x + 40 + i * 44, 0.4, s.y + 220); g.add(dash); }
  const ctower = new THREE.Mesh(new THREE.CylinderGeometry(10, 14, 110, 14), mat("#e8eef4")); ctower.position.set(s.x + s.w - 40, 55, s.y + 40); ctower.castShadow = true; g.add(ctower);
  const cab = new THREE.Mesh(new THREE.CylinderGeometry(22, 16, 16, 14), mat("#33414e")); cab.position.set(s.x + s.w - 40, 118, s.y + 40); cab.castShadow = true; g.add(cab);
  const sign = label("FIA airport", { size: 44 }); sign.position.set(s.x + s.w / 2 - 30, s.H + 40, s.y + 60); g.add(sign);
  scene.add(g);
  return g;
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
function addLamp(x, z) {
  const g = new THREE.Group();
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(1.2, 1.4, 44, 8), mat("#4a4f57")); pole.position.y = 22; pole.castShadow = true; g.add(pole);
  const bulb = new THREE.Mesh(new THREE.SphereGeometry(4, 10, 8), lampMat); bulb.position.y = 45; g.add(bulb);
  g.position.set(x, 0, z); scene.add(g); lamps.push(g);
}
for (let x = 70; x < W - 40; x += 150) { addLamp(x, 476); addLamp(x, 594); }
function setNight(on) {
  night = on;
  hemi.intensity = on ? 0.35 : 0.95;
  sun.intensity = on ? 0.2 : 1.15;
  lampMat.emissiveIntensity = on ? 2.4 : 0;
  scene.background = new THREE.Color(on ? "#0c1630" : "#9fd3f0");
  scene.fog.color.set(on ? "#0c1630" : "#c9e8f7");
  jmMsg = on ? "Night mode. The street lamps are on. Press N for day." : "Day mode. Press N for night.";
}

// Traffic: cars on the two lanes of the main street, and cars going round the ring road.
const cars = [];
const CAR_COLS = ["#d33b3b", "#2f6fd1", "#f2f2f2", "#2e8b57", "#ffb000", "#6a3fb5", "#222222"];
function makeCar(col) {
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.BoxGeometry(12, 6, 22), mat(col)); body.position.y = 5; body.castShadow = true; g.add(body);
  const cabin = new THREE.Mesh(new THREE.BoxGeometry(10, 5, 11), mat("#9fc3dd")); cabin.position.set(0, 10, -1); cabin.castShadow = true; g.add(cabin);
  scene.add(g);
  return g;
}
for (let i = 0; i < 10; i++) {
  const east = i % 2 === 0;
  cars.push({ g: makeCar(CAR_COLS[i % CAR_COLS.length]), kind: "street", x: 80 + ((i * 173) % 1640), lane: east ? 522 : 548, dir: east ? 1 : -1, v: 60 + ((i * 17) % 40) });
}
for (let i = 0; i < 6; i++) cars.push({ g: makeCar(CAR_COLS[(i + 3) % CAR_COLS.length]), kind: "ring", s: (i * LOOP) / 6, v: 90 + i * 8 });
function updateCars(dt) {
  for (const c of cars) {
    if (c.kind === "street") {
      c.x += c.dir * c.v * dt;
      if (c.x > W + 40) c.x = -40;
      if (c.x < -40) c.x = W + 40;
      c.g.position.set(c.x, 0, c.lane);
      c.g.rotation.y = c.dir > 0 ? Math.PI / 2 : -Math.PI / 2;
    } else {
      c.s = (c.s + c.v * dt) % LOOP;
      const p = ringPoint(c.s);
      c.g.position.set(p.x, 0, p.y);
      c.g.rotation.y = Math.atan2(p.dx, p.dy);
    }
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
for (let i = 0; i < 12; i++) {
  const z = i % 2 ? 478 : 590;
  peds.push({ g: makeFigure(SHIRTS[i % SHIRTS.length]), x: 100 + ((i * 131) % 1600), z, dir: i % 3 ? 1 : -1, v: 22 + ((i * 7) % 14), step: i });
}
function updatePeds(dt) {
  for (const p of peds) {
    p.x += p.dir * p.v * dt;
    if (p.x > 1740 || p.x < 60) p.dir *= -1;
    p.step += dt * 8;
    p.g.position.set(p.x, 0, p.z);
    p.g.rotation.y = p.dir > 0 ? Math.PI / 2 : -Math.PI / 2;
    const sw = Math.sin(p.step) * 0.7;
    p.g.userData.legL.rotation.x = sw;
    p.g.userData.legR.rotation.x = -sw;
  }
}

// Mini-map in the top-right corner: the town, you (red), the Joelmobile (yellow) and its stops (blue).
const mini = document.createElement("canvas");
mini.width = 240; mini.height = 160;
mini.setAttribute("aria-hidden", "true");
mini.style.cssText = "position:absolute;right:10px;top:10px;width:180px;height:120px;border:2px solid #fff;border-radius:8px;background:#5d9a48;pointer-events:none;";
stage.style.position = "relative";
stage.appendChild(mini);
const mctx = mini.getContext("2d");
let miniAt = 0;
function drawMini(now) {
  if (now - miniAt < 100) return;
  miniAt = now;
  const g = mctx, w = mini.width, h = mini.height, sx = (w - 16) / W, sy = (h - 16) / H;
  const X = (x) => 8 + x * sx, Y = (y) => 8 + y * sy;
  g.clearRect(0, 0, w, h);
  g.fillStyle = "#5d9a48"; g.fillRect(0, 0, w, h);
  g.fillStyle = "#4b4f55";
  g.fillRect(X(0), Y(500), W * sx, 70 * sy);
  g.fillRect(X(0), Y(0), W * sx, BAND * sy); g.fillRect(X(0), Y(H - BAND), W * sx, BAND * sy);
  g.fillRect(X(0), Y(0), BAND * sx, H * sy); g.fillRect(X(W - BAND), Y(0), BAND * sx, H * sy);
  g.strokeStyle = "#4b4f55";
  for (const r of ROAD_NET) { g.lineWidth = Math.max(2, r.w * sx); g.beginPath(); g.moveTo(X(r.a[0]), Y(r.a[1])); g.lineTo(X(r.b[0]), Y(r.b[1])); g.stroke(); }
  for (const s of SOLID) { g.fillStyle = s.body; g.fillRect(X(s.x), Y(s.y), s.w * sx, s.h * sy); }
  g.strokeStyle = "#4b4f55"; g.lineCap = "butt"; g.lineWidth = ROAD_W * sx;
  for (const [x1, y1, x2, y2] of SEGS) { g.beginPath(); g.moveTo(X(x1), Y(y1)); g.lineTo(X(x2), Y(y2)); g.stroke(); }
  g.fillStyle = "#1e63c8";
  for (const st of STOPS) { g.beginPath(); g.arc(X(st.x), Y(st.y), 3, 0, 7); g.fill(); }
  g.fillStyle = "#ffd400"; g.beginPath(); g.arc(X(jm.position.x), Y(jm.position.z), 4, 0, 7); g.fill();
  g.fillStyle = "#e0245e"; g.beginPath(); g.arc(X(PLAYER.x), Y(PLAYER.y), 4, 0, 7); g.fill();
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
function zebra(cx, cz, w, vertical) {
  for (let i = -2; i <= 2; i++) {
    const st = new THREE.Mesh(new THREE.PlaneGeometry(vertical ? w - 6 : 4, vertical ? 4 : w - 6), mat("#f4f4f4"));
    st.rotation.x = -Math.PI / 2; st.position.set(cx + (vertical ? 0 : i * 7), 0.08, cz + (vertical ? i * 7 : 0)); st.receiveShadow = true;
    scene.add(st);
  }
}
zebra(1650, 586, 24, true);

// ---- more detail: crosswalk, awnings, benches, bins, lamps on the new roads, parked cars ----
// Crosswalk across the main street, just west of the bus stop.
for (let i = 0; i < 8; i++) {
  const stripe = new THREE.Mesh(new THREE.PlaneGeometry(5, 18), mat("#f4f4f0"));
  stripe.rotation.x = -Math.PI / 2; stripe.position.set(410 + i * 9, 0.32, 535); scene.add(stripe);
}
// Awning, bench and bin at each building's door.
for (const s of B) {
  if (s.roof === "none") continue;
  const cx = s.x + s.w / 2, dz = s.y + s.h + 10;
  const awning = new THREE.Mesh(new THREE.BoxGeometry(38, 2.5, 10), mat(s.trim)); awning.position.set(cx, 30, s.y + s.h + 6); awning.castShadow = true; scene.add(awning);
  const bench = new THREE.Mesh(new THREE.BoxGeometry(14, 4, 4), mat("#8b5a2b")); bench.position.set(cx - 34, 3, dz); bench.castShadow = true; scene.add(bench);
  const bin = new THREE.Mesh(new THREE.CylinderGeometry(3, 3, 7, 10), mat("#2f5d3a")); bin.position.set(cx + 34, 3.5, dz); bin.castShadow = true; scene.add(bin);
}
// Lamps along the new roads, on one side.
for (const [x1, y1, x2, y2] of SEGS) {
  const len = Math.hypot(x2 - x1, y2 - y1), n = Math.max(1, Math.floor(len / 80));
  const nx = -(y2 - y1) / len, ny = (x2 - x1) / len;
  for (let i = 0; i < n; i++) {
    const t = (i + 0.5) / n;
    addLamp(x1 + (x2 - x1) * t + nx * (ROAD_W / 2 + 8), y1 + (y2 - y1) * t + ny * (ROAD_W / 2 + 8));
  }
}
// A few parked cars: two on the K spine, one on the F top bar.
for (const [x, z, rot] of [[1176, 300, 0], [1176, 330, 0], [760, 1047, Math.PI / 2]]) {
  const c = makeCar(CAR_COLS[(x + z) % CAR_COLS.length]);
  c.position.set(x, 0, z); c.rotation.y = rot;
}

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
// Input
const KEYMAP = { w: "up", arrowup: "up", s: "down", arrowdown: "down", a: "left", arrowleft: "left", d: "right", arrowright: "right" };
function action() {
  if (PLAYER.riding) return;
  const s = nearestStop();
  if (s >= 0) {
    if (jmState.mode === "parked" && jmState.at === s && Math.hypot(PLAYER.x - jm.position.x, PLAYER.y - jm.position.z) < 90) { boardJM(); return; }
    callJM(s); return;
  }
  const door = nearestDoor();
  if (door) { location.href = door.href ? door.href : "index.html#" + door.id; }
}
window.addEventListener("keydown", (e) => {
  const k = e.key.toLowerCase();
  if (KEYMAP[k]) { keys.add(KEYMAP[k]); e.preventDefault(); }
  if (k === "e") action();
  if (k === "n") setNight(!night);
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
const cam = { x: PLAYER.x, y: PLAYER.y };
function resize() {
  const w = stage.clientWidth, h = stage.clientHeight;
  renderer.setSize(w, h, false);
  camera.aspect = w / h; camera.updateProjectionMatrix();
}
window.addEventListener("resize", resize);
resize();

let last = performance.now();
function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000); last = now;
  // walking
  if (!PLAYER.riding) {
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
  updateJM(dt);
  updateCars(dt);
  updatePeds(dt);
  drawMini(now);
  // draw the player
  player3.position.set(PLAYER.x, 0, PLAYER.y);
  player3.rotation.y = PLAYER.face;
  const sw = Math.sin(PLAYER.step) * 0.7, u = player3.userData;
  if (u.legL) { u.legL.rotation.x = sw; u.legR.rotation.x = -sw; }
  if (PLAYER.riding) { player3.visible = false; } else player3.visible = true;
  // camera
  cam.x += (PLAYER.x - cam.x) * Math.min(1, dt * 8);
  cam.y += (PLAYER.y - cam.y) * Math.min(1, dt * 8);
  camera.position.set(cam.x - 60, 330, cam.y + 300);
  camera.lookAt(cam.x, 20, cam.y);
  sun.position.set(cam.x - 500, 900, cam.y + 380);
  sun.target.position.set(cam.x, 0, cam.y);
  if (!sun.target.parent) scene.add(sun.target);
  renderer.render(scene, camera);
  // the prompt
  let text = jmMsg;
  if (!text) {
    const s = nearestStop();
    const door = nearestDoor();
    if (PLAYER.riding) text = "Riding the Joelmobile.";
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
window.__walk = { PLAYER, jmState, nearestDoor, nearestStop, STOPS, callJM, boardJM, ringPoint, get jmPos() { return { x: jm.position.x, z: jm.position.z }; } };
