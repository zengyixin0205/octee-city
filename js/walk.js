// Walk around Octee City. A small top-down game on a canvas: WASD or arrow keys to walk, E to go in.
// The map is hand-placed and deliberately not symmetrical. Buildings are drawn with canvas shapes; nothing is a photo.
const W = 1800, H = 1200;              // world size in pixels
const VIEW_W = 960, VIEW_H = 540;      // what the canvas shows
const canvas = document.getElementById("walk");
const ctx = canvas.getContext("2d");

// Each building: id, name, box (x, y, w, h), its colours, roof style, and the door (bottom middle, drawn in front).
const B = [
  { id: "bank", name: "OCT Bank", x: 120, y: 90, w: 180, h: 130, body: "#f3e3a1", trim: "#8a6d1d", roof: "pitch" },
  { id: "hall", name: "City Hall", x: 360, y: 110, w: 150, h: 110, body: "#e8d8c4", trim: "#7a5a3a", roof: "dome" },
  { id: "clinic", name: "Clinic", x: 560, y: 80, w: 140, h: 120, body: "#ffffff", trim: "#d33", roof: "flat", cross: true },
  { id: "fire", name: "Fire Station", x: 760, y: 130, w: 130, h: 100, body: "#c94a3c", trim: "#5a1d17", roof: "flat", tower: true },
  { id: "post", name: "Post Office", x: 80, y: 300, w: 150, h: 100, body: "#e1b35a", trim: "#6b4c12", roof: "pitch" },
  { id: "bakery", name: "Bakery", x: 300, y: 300, w: 110, h: 90, body: "#f6c7a0", trim: "#8c4b1e", roof: "pitch" },
  { id: "library", name: "Library", x: 480, y: 290, w: 170, h: 120, body: "#c8d7ea", trim: "#2e4a6b", roof: "flat" },
  { id: "cinema", name: "Cinema", x: 720, y: 300, w: 180, h: 110, body: "#3d3550", trim: "#d9b43c", roof: "flat" },
  { id: "power", name: "Power Station", x: 1000, y: 320, w: 120, h: 110, body: "#9aa3ad", trim: "#444", roof: "flat", tower: true },
  { id: "radio", name: "Radio Tower", x: 1460, y: 400, w: 120, h: 100, body: "#b9c9d9", trim: "#2c3e50", roof: "flat", mast: true },
  { id: "tax", name: "Tax Office", x: 90, y: 620, w: 130, h: 100, body: "#d7e8c2", trim: "#3d5a2a", roof: "pitch" },
  { id: "car", name: "Car Park", x: 260, y: 640, w: 160, h: 90, body: "#bfc4c9", trim: "#555", roof: "flat", stripes: true },
  { id: "gym", name: "Gym", x: 460, y: 610, w: 120, h: 110, body: "#f0a6a6", trim: "#7a1f1f", roof: "flat" },
  { id: "museum", name: "Peanut Museum", x: 620, y: 640, w: 150, h: 100, body: "#e6d5b8", trim: "#6b5232", roof: "dome" },
  { id: "bus", name: "Airport Bus Stop", x: 830, y: 620, w: 130, h: 90, body: "#ffd24d", trim: "#222", roof: "flat", bus: true },
  { id: "square", name: "Town Square", x: 1010, y: 600, w: 200, h: 140, body: "#dcd6c8", trim: "#6e6758", roof: "flat", plaza: true },
  { id: "tower", name: "Game Tower", x: 1270, y: 640, w: 110, h: 170, body: "#7d8fd6", trim: "#29336b", roof: "flat", tall: true },
  { id: "lost", name: "Lost Property Office", x: 1420, y: 560, w: 120, h: 90, body: "#b7e0d8", trim: "#2b6a5f", roof: "pitch" },
  { id: "food", name: "Food Court", x: 60, y: 820, w: 140, h: 100, body: "#ffc2d4", trim: "#8a2c4d", roof: "flat" },
  { id: "harbour", name: "Harbour", x: 300, y: 860, w: 220, h: 110, body: "#a9d4e6", trim: "#1f5170", roof: "flat", crane: true },
  { id: "police", name: "Police Station", x: 600, y: 880, w: 170, h: 120, body: "#5f7fb3", trim: "#18305c", roof: "flat", flag: true },
  { id: "laundry", name: "Laundrette", x: 900, y: 900, w: 120, h: 100, body: "#e5f0ff", trim: "#3d6aa0", roof: "flat", round: true },
  { id: "pool", name: "Swimming Pool", x: 1100, y: 880, w: 190, h: 130, body: "#7fd3e8", trim: "#1b6f86", roof: "flat", water: true },
  { id: "market", name: "Night Market", x: 1380, y: 820, w: 200, h: 120, body: "#ffb36b", trim: "#7a3b00", roof: "pitch", stalls: true },
  { id: "lounge", name: "Platinum Lounge", x: 1120, y: 1040, w: 160, h: 100, body: "#d9d4ee", trim: "#4b3f7a", roof: "flat", gold: true },
];
// The airport is the big block at the top right. It is not a building you can enter, but its door sends you to Octee Airlines.
const FIA = { id: "fia", name: "FIA airport", x: 1280, y: 40, w: 440, h: 250, body: "#e8eef4", trim: "#33414e", roof: "flat", runway: true, href: "https://zengyixin0205.github.io/Octee-airline/" };
// Roads are only drawn. Walls are the buildings' boxes.
const ROADS = [
  { x: 0, y: 500, w: 1800, h: 70 },
  { x: 880, y: 0, w: 70, h: 1200 },
  { x: 1240, y: 300, w: 60, h: 900 },
  { x: 0, y: 1000, w: 900, h: 60 },
];
const SOLID = [...B, FIA];
const player = { x: 960, y: 560, dir: "down", step: 0 };
const keys = new Set();
const SPEED = 3.2;
const BODY = { w: 18, h: 14 };         // collision box at the player's feet

const hit = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
function free(px, py) {
  const box = { x: px - BODY.w / 2, y: py - BODY.h / 2, ...BODY };
  if (box.x < 0 || box.y < 0 || box.x + box.w > W || box.y + box.h > H) return false;
  return !SOLID.some((s) => hit(box, s));
}
function nearDoor() {
  // The door is the bottom middle of each building. You are near it if your feet are within 46px.
  let best = null, bestD = 46;
  for (const s of SOLID) {
    const dx = player.x - (s.x + s.w / 2), dy = player.y - (s.y + s.h + 6);
    const d = Math.hypot(dx, dy);
    if (d < bestD) { bestD = d; best = s; }
  }
  return best;
}

// ---- drawing ----
function roundRect(x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }
function drawBuilding(s) {
  const { x, y, w, h } = s;
  // shadow
  ctx.fillStyle = "rgba(0,0,0,.18)"; ctx.fillRect(x + 6, y + h - 2, w, 10);
  // body
  ctx.fillStyle = s.body; ctx.fillRect(x, y, w, h);
  ctx.strokeStyle = s.trim; ctx.lineWidth = 3; ctx.strokeRect(x + 1.5, y + 1.5, w - 3, h - 3);
  // windows
  ctx.fillStyle = "rgba(40,60,90,.55)";
  const cols = Math.max(2, Math.floor(w / 42));
  for (let i = 0; i < cols; i++) { const wx = x + 14 + i * ((w - 28) / cols); ctx.fillRect(wx, y + 18, 16, 14); }
  // roof
  if (s.roof === "pitch") { ctx.fillStyle = s.trim; ctx.beginPath(); ctx.moveTo(x - 8, y + 4); ctx.lineTo(x + w / 2, y - 26); ctx.lineTo(x + w + 8, y + 4); ctx.closePath(); ctx.fill(); }
  if (s.roof === "dome") { ctx.fillStyle = s.trim; ctx.beginPath(); ctx.arc(x + w / 2, y + 6, w / 2.6, Math.PI, 0); ctx.fill(); }
  if (s.roof === "flat") { ctx.fillStyle = s.trim; ctx.fillRect(x - 4, y - 6, w + 8, 8); }
  if (s.tower) { ctx.fillStyle = s.trim; ctx.fillRect(x + w - 26, y - 40, 22, 40); }
  if (s.tall) { ctx.fillStyle = s.trim; ctx.fillRect(x + w / 2 - 4, y - 50, 8, 50); ctx.beginPath(); ctx.arc(x + w / 2, y - 52, 6, 0, 7); ctx.fill(); }
  if (s.mast) { ctx.strokeStyle = s.trim; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x + w / 2, y); ctx.lineTo(x + w / 2, y - 80); ctx.stroke(); ctx.beginPath(); ctx.arc(x + w / 2, y - 82, 7, 0, 7); ctx.fillStyle = s.trim; ctx.fill(); }
  if (s.cross) { ctx.fillStyle = "#d33"; ctx.fillRect(x + w / 2 - 4, y + 34, 8, 26); ctx.fillRect(x + w / 2 - 13, y + 43, 26, 8); }
  if (s.flag) { ctx.fillStyle = s.trim; ctx.fillRect(x + 18, y - 52, 3, 52); ctx.fillStyle = "#d33"; ctx.fillRect(x + 21, y - 52, 18, 10); }
  if (s.stripes) { ctx.fillStyle = "#fff"; for (let i = 0; i < 5; i++) ctx.fillRect(x + 12 + i * 28, y + h - 24, 12, 6); }
  if (s.stalls) { for (let i = 0; i < 3; i++) { ctx.fillStyle = i % 2 ? "#fff" : "#d33"; ctx.fillRect(x + 10 + i * 62, y + h - 28, 54, 12); } }
  if (s.water) { ctx.fillStyle = "#bfeaf6"; ctx.fillRect(x + 20, y + 52, w - 40, h - 70); }
  if (s.round) { ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(x + w - 30, y + 46, 16, 0, 7); ctx.fill(); ctx.strokeStyle = s.trim; ctx.stroke(); }
  if (s.gold) { ctx.fillStyle = "#e0b43c"; ctx.fillRect(x + 12, y + h - 40, w - 24, 6); }
  if (s.bus) { ctx.fillStyle = "#222"; ctx.fillRect(x + 20, y + h - 30, 90, 4); }
  if (s.crane) { ctx.strokeStyle = s.trim; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(x + w - 20, y); ctx.lineTo(x + w - 20, y - 80); ctx.lineTo(x + w - 90, y - 80); ctx.stroke(); }
  // door
  ctx.fillStyle = s.trim; ctx.fillRect(x + w / 2 - 12, y + h - 30, 24, 30);
  ctx.fillStyle = "#ffe08a"; ctx.fillRect(x + w / 2 - 8, y + h - 24, 6, 6);
  // sign
  ctx.font = "bold 15px sans-serif"; ctx.textAlign = "center"; ctx.textBaseline = "bottom";
  const tw = ctx.measureText(s.name).width + 12;
  ctx.fillStyle = "rgba(255,255,255,.92)"; roundRect(x + w / 2 - tw / 2, y - 62, tw, 20, 6); ctx.fill();
  ctx.fillStyle = "#222"; ctx.fillText(s.name, x + w / 2, y - 45);
}
function drawFia(s) {
  ctx.fillStyle = "#c8d3dc"; ctx.fillRect(s.x, s.y + 170, s.w, 84);     // apron
  ctx.fillStyle = "#4a5661"; ctx.fillRect(s.x + 30, s.y + 210, s.w - 60, 26); // runway strip
  for (let i = 0; i < 8; i++) { ctx.fillStyle = "#fff"; ctx.fillRect(s.x + 60 + i * 44, s.y + 220, 22, 5); }
  drawBuilding({ ...s, name: "FIA airport", tower: false, stripes: false });
  ctx.fillStyle = "#33414e"; ctx.fillRect(s.x + s.w - 60, s.y - 70, 26, 70); ctx.fillStyle = "#d33"; ctx.fillRect(s.x + s.w - 62, s.y - 74, 30, 8); // control tower
}
function drawRoads() {
  ctx.fillStyle = "#a9a39a";
  for (const r of ROADS) ctx.fillRect(r.x, r.y, r.w, r.h);
  ctx.fillStyle = "#f5f0c8";
  for (const r of ROADS) { if (r.w > r.h) for (let x = r.x + 10; x < r.x + r.w; x += 60) ctx.fillRect(x, r.y + r.h / 2 - 2, 30, 4); else for (let y = r.y + 10; y < r.y + r.h; y += 60) ctx.fillRect(r.x + r.w / 2 - 2, y, 4, 30); }
}
function drawPlayer() {
  const bob = player.step ? Math.sin(player.step) * 2 : 0;
  const x = player.x, y = player.y + bob;
  ctx.fillStyle = "rgba(0,0,0,.25)"; ctx.beginPath(); ctx.ellipse(player.x, player.y + 8, 11, 4, 0, 0, 7); ctx.fill();
  // legs
  ctx.fillStyle = "#333";
  const s = player.step ? Math.sin(player.step) * 3 : 0;
  ctx.fillRect(x - 7 + s, y - 10, 5, 12); ctx.fillRect(x + 2 - s, y - 10, 5, 12);
  // body
  ctx.fillStyle = "#2f6fd1"; roundRect(x - 9, y - 26, 18, 18, 4); ctx.fill();
  // head and cap, a plain icon
  ctx.fillStyle = "#f2c9a0"; ctx.beginPath(); ctx.arc(x, y - 33, 8, 0, 7); ctx.fill();
  ctx.fillStyle = "#c83e2e"; ctx.fillRect(x - 9, y - 41, 18, 5); ctx.fillRect(x - 6, y - 45, 12, 5);
}

function draw() {
  // camera: follow the player, stay inside the world
  const cx = Math.max(0, Math.min(W - VIEW_W, player.x - VIEW_W / 2));
  const cy = Math.max(0, Math.min(H - VIEW_H, player.y - VIEW_H / 2));
  ctx.save();
  ctx.setTransform(canvas.width / VIEW_W, 0, 0, canvas.height / VIEW_H, 0, 0);
  ctx.fillStyle = "#9ccf8a"; ctx.fillRect(0, 0, VIEW_W, VIEW_H);
  ctx.translate(-cx, -cy);
  ctx.fillStyle = "#86bd76"; ctx.fillRect(0, 0, W, H);      // grass
  drawRoads();
  // draw from back to front: buildings whose bottom edge is above your feet first, then you, then the rest
  const order = [...SOLID].sort((a, b) => (a.y + a.h) - (b.y + b.h));
  const drawOne = (s) => (s.runway ? drawFia(s) : drawBuilding(s));
  let drawnPlayer = false;
  for (const s of order) {
    if (!drawnPlayer && s.y + s.h > player.y) { drawPlayer(); drawnPlayer = true; }
    drawOne(s);
  }
  if (!drawnPlayer) drawPlayer();
  ctx.restore();
  // prompt
  const near = nearDoor();
  if (near) {
    ctx.setTransform(canvas.width / VIEW_W, 0, 0, canvas.height / VIEW_H, 0, 0);
    ctx.font = "bold 16px sans-serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    const text = near.runway ? "Press E to visit Octee Airlines" : `Press E to go into ${near.name}`;
    const tw = ctx.measureText(text).width + 20;
    ctx.fillStyle = "rgba(20,20,20,.82)"; roundRect(VIEW_W / 2 - tw / 2, 14, tw, 30, 8); ctx.fill();
    ctx.fillStyle = "#fff"; ctx.fillText(text, VIEW_W / 2, 29);
  }
}

// ---- game loop ----
function step() {
  let dx = 0, dy = 0;
  if (keys.has("a") || keys.has("arrowleft") || keys.has("left")) dx -= 1;
  if (keys.has("d") || keys.has("arrowright") || keys.has("right")) dx += 1;
  if (keys.has("w") || keys.has("arrowup") || keys.has("up")) dy -= 1;
  if (keys.has("s") || keys.has("arrowdown") || keys.has("down")) dy += 1;
  if (dx && dy) { dx *= Math.SQRT1_2; dy *= Math.SQRT1_2; }
  if (dx || dy) {
    player.dir = dy > 0 ? "down" : dy < 0 ? "up" : dx < 0 ? "left" : "right";
    player.step += 0.35;
    // try each axis separately so you slide along walls
    if (free(player.x + dx * SPEED, player.y)) player.x += dx * SPEED;
    if (free(player.x, player.y + dy * SPEED)) player.y += dy * SPEED;
  } else player.step = 0;
  draw();
  requestAnimationFrame(step);
}
function enter() {
  const s = nearDoor();
  if (!s) return;
  location.href = s.href ? s.href : "index.html#" + s.id;
}
const KEYMAP = { w: "w", a: "a", s: "s", d: "d", arrowup: "arrowup", arrowleft: "arrowleft", arrowdown: "arrowdown", arrowright: "arrowright" };
window.addEventListener("keydown", (e) => {
  const k = e.key.toLowerCase();
  if (KEYMAP[k]) { keys.add(KEYMAP[k]); e.preventDefault(); }
  if (k === "e") enter();
});
window.addEventListener("keyup", (e) => { const k = e.key.toLowerCase(); if (KEYMAP[k]) keys.delete(KEYMAP[k]); });
window.addEventListener("blur", () => keys.clear());
for (const b of document.querySelectorAll("#walk-buttons button, button[data-k]")) {
  const k = b.dataset.k;
  const map = { up: "up", down: "down", left: "left", right: "right" };
  if (k === "enter") { b.addEventListener("click", enter); continue; }
  const on = () => keys.add(map[k]), off = () => keys.delete(map[k]);
  b.addEventListener("pointerdown", on); b.addEventListener("pointerup", off); b.addEventListener("pointerleave", off);
}
canvas.width = VIEW_W * 2; canvas.height = VIEW_H * 2;
window.__walk = { player, nearDoor };   // for testing only: lets a script read where you are
step();
