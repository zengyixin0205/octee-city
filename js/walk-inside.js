// Inside the shops: a small room for each building that you can walk around, like a game.
// Shelves sell things (groceries, buns, lanterns), and the counter is where you clock in.
// The rooms are built far off to the side of the town in the same scene, and you are moved there when you go in.
import { JOBS, EXTRA_STEPS, PAY, HARD_PAY, payOf } from "./jobs.js";

// What each shop sells. Keep the ids and prices in step with SHOP_ITEMS in cloud/index.js (the Worker has the last word).
export const GOODS = {
  apple: { name: "Apple", price: 1, col: "#d6382c" }, peanuts: { name: "Bag of peanuts", price: 2, col: "#c99a55" }, milk: { name: "Milk", price: 3, col: "#f4f4f4" },
  rice: { name: "Rice", price: 5, col: "#efe6cf" }, noodles: { name: "Noodles", price: 4, col: "#e8c04a" }, eggs: { name: "Eggs", price: 4, col: "#e9d9b8" },
  tea: { name: "Tea", price: 3, col: "#4f8a4b" }, cola: { name: "Cola", price: 2, col: "#8c1b1b" },
  bun: { name: "Bun", price: 2, col: "#d9a15f" }, loaf: { name: "Loaf", price: 3, col: "#b9824a" }, cake: { name: "Slice of the cake with no name", price: 5, col: "#f2c4d8" },
  hatburger: { name: "Peanut burger in a hat", price: 6, col: "#c4793a" }, soup: { name: "Soup of the day", price: 4, col: "#e07b39" }, juice: { name: "Juice", price: 3, col: "#f4a21e" },
  lantern: { name: "Paper lantern", price: 8, col: "#e63946" }, snack: { name: "Night market skewer", price: 4, col: "#b5651d" }, souvenir: { name: "Souvenir with no town on it", price: 10, col: "#4a7fb5" }
};
export const SHELVES = {
  grocery: [["Fruit and snacks", ["apple", "peanuts", "cola"]], ["Dairy and eggs", ["milk", "eggs", "tea"]], ["Dry goods", ["rice", "noodles", "peanuts"]]],
  bakery: [["The bread shelf", ["bun", "loaf"]], ["The cake with no name", ["cake"]]],
  food: [["The hot counter", ["hatburger", "soup"]], ["The drinks fridge", ["juice", "cola"]]],
  market: [["Lantern stall", ["lantern"]], ["Skewer stall", ["snack", "juice"]], ["Souvenir stall", ["souvenir"]]]
};
// Buildings you cannot go inside: open ground.
const NO_ROOM = new Set(["square", "pool", "fia"]);

export function createInside(ctx) {
  const { THREE, scene, mat, label, makeFigure, PLAYER, stage, B, tileTex, carApi, loggedIn } = ctx;
  // The room: x from 6000 to 6360, y (depth) from 6000 to 6240. The door is in the middle of the south wall.
  const R = { x: 6000, y: 6000, w: 360, h: 240 };
  const DOOR = { x: R.x + R.w / 2, y: R.y + R.h - 4 };
  const S = { on: false, b: null, group: null, solids: [], spots: [], from: null, bag: null, wallet: null, msg: "", panelFor: null };

  // A light for the room, so the shops are bright even at night.
  const l1 = new THREE.PointLight("#fff1d6", 1.6, 520, 1.4); l1.position.set(R.x + 110, 110, R.y + 90); scene.add(l1);
  const l2 = new THREE.PointLight("#fff1d6", 1.6, 520, 1.4); l2.position.set(R.x + 250, 110, R.y + 150); scene.add(l2);

  const panel = document.createElement("div");
  panel.hidden = true;
  panel.style.cssText = "position:absolute;left:12px;top:12px;background:#fff;color:#222;padding:10px 12px;border-radius:10px;max-width:310px;max-height:86%;overflow:auto;box-shadow:0 4px 16px rgba(0,0,0,.25);font:14px/1.35 system-ui,sans-serif;z-index:5";
  stage.appendChild(panel);
  const mk = (tag, props = {}, ...kids) => { const e = Object.assign(document.createElement(tag), props); for (const k of kids) e.append(k); return e; };
  const btn = (text, on, style = "") => mk("button", { type: "button", textContent: text, onclick: on, style: "display:block;width:100%;margin:5px 0;padding:6px 8px;border:1px solid #888;border-radius:6px;background:#f6f6f6;cursor:pointer;text-align:left;" + style });
  const close = () => { panel.hidden = true; S.panelFor = null; };
  const show = (...kids) => { panel.replaceChildren(...kids, mk("p", { textContent: "Press Esc to close.", style: "margin:6px 0 0;color:#666;font-size:12px" })); panel.hidden = false; };

  // ---- build a room for a building ----
  const box = (g, w, h, d, x, y, z, color, extra = {}) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat(color, extra)); m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; g.add(m); return m; };
  const solid = (x, y, w, h) => S.solids.push({ x, y, w, h });
  function shelfUnit(g, x, y, w, ids, name) {
    // a shelf stands against the back wall: a frame, three boards and coloured boxes of goods
    box(g, w, 52, 14, x + w / 2, 26, y + 7, "#8b6b45");
    for (let row = 0; row < 3; row++) {
      for (let i = 0; i < Math.floor(w / 12); i++) {
        const id = ids[(i + row) % ids.length];
        box(g, 8, 8, 8, x + 8 + i * 12, 10 + row * 16, y + 14, GOODS[id].col);
      }
    }
    solid(x, y, w, 16);
    S.spots.push({ x: x + w / 2, y: y + 34, r: 34, text: `Press E to look at: ${name}`, run: () => openShelf(name, ids) });
    const sign = label(name, { size: 30 }); sign.scale.multiplyScalar(0.35); sign.position.set(x + w / 2, 66, y + 12); g.add(sign);
  }
  function decor(g, id) {
    const RX = R.x, RY = R.y;
    if (id === "library") { for (const i of [0, 1, 2, 3]) { box(g, 12, 50, 70, RX + 70 + i * 60, 25, RY + 90, "#7a5230"); for (let k = 0; k < 6; k++) box(g, 8, 10, 8, RX + 70 + i * 60, 12 + (k % 3) * 14, RY + 66 + k * 11, ["#c0392b", "#2e86c1", "#27ae60", "#f1c40f"][k % 4]); solid(RX + 64 + i * 60, RY + 52, 12, 76); } }
    else if (id === "cinema") { box(g, 200, 70, 4, RX + 180, 45, RY + 6, "#f2f2f2"); for (let r = 0; r < 3; r++) for (let c = 0; c < 6; c++) { box(g, 18, 12, 18, RX + 90 + c * 30, 7, RY + 100 + r * 32, "#9b1c2e"); } solid(RX + 76, RY + 90, 190, 100); }
    else if (id === "laundry") { for (let i = 0; i < 4; i++) { const m = box(g, 30, 34, 26, RX + 60 + i * 44, 17, RY + 26, "#f4f4f4"); const d = new THREE.Mesh(new THREE.CylinderGeometry(9, 9, 2, 16), mat("#4a7fb5")); d.rotation.x = Math.PI / 2; d.position.set(RX + 60 + i * 44, 18, RY + 40); g.add(d); } solid(RX + 40, RY + 10, 190, 34); }
    else if (id === "clinic") { for (let i = 0; i < 3; i++) { box(g, 40, 10, 22, RX + 70 + i * 70, 8, RY + 32, "#f4f4f4"); box(g, 40, 3, 22, RX + 70 + i * 70, 14, RY + 32, "#c62828"); solid(RX + 50 + i * 70, RY + 20, 40, 24); } }
    else if (id === "gym") { for (let i = 0; i < 3; i++) { box(g, 18, 14, 40, RX + 80 + i * 60, 9, RY + 40, "#333"); box(g, 4, 30, 4, RX + 80 + i * 60, 24, RY + 24, "#999"); solid(RX + 70 + i * 60, RY + 20, 22, 44); } box(g, 70, 6, 10, RX + 280, 12, RY + 40, "#444"); box(g, 6, 10, 10, RX + 248, 12, RY + 40, "#222"); box(g, 6, 10, 10, RX + 312, 12, RY + 40, "#222"); }
    else if (id === "bank") { box(g, 80, 70, 8, RX + 280, 36, RY + 8, "#8f9aa5", { metalness: 0.6, roughness: 0.3 }); const w = new THREE.Mesh(new THREE.CylinderGeometry(14, 14, 3, 20), mat("#d9b43c", { metalness: 0.7 })); w.rotation.x = Math.PI / 2; w.position.set(RX + 280, 36, RY + 14); g.add(w); solid(RX + 240, RY + 0, 80, 16); }
    else if (id === "fire") { box(g, 90, 30, 40, RX + 80, 15, RY + 40, "#c94a3c"); box(g, 6, 6, 40, RX + 150, 30, RY + 40, "#ccc"); solid(RX + 35, RY + 20, 100, 44); }
    else if (id === "police") { for (const dx of [0, 52, 104]) { box(g, 2, 50, 40, RX + 40 + dx, 25, RY + 40, "#aab"); box(g, 40, 50, 2, RX + 60 + dx, 25, RY + 60, "#aab"); } solid(RX + 30, RY + 20, 140, 46); }
    else if (id === "museum") { for (const dx of [0, 1, 2]) { box(g, 20, 20, 20, RX + 70 + dx * 80, 10, RY + 60, "#e6d5b8"); const p = new THREE.Mesh(new THREE.SphereGeometry(7, 12, 8), mat("#c99a55")); p.scale.set(1, 1.3, 1); p.position.set(RX + 70 + dx * 80, 28, RY + 60); g.add(p); solid(RX + 60 + dx * 80, RY + 50, 20, 20); } }
    else if (id !== "grocery" && !SHELVES[id]) { for (const dx of [0, 1]) { box(g, 26, 10, 8, RX + 80 + dx * 170, 5, RY + 150, "#8b5a2b"); const pot = new THREE.Mesh(new THREE.CylinderGeometry(6, 5, 10, 10), mat("#a0522d")); pot.position.set(RX + 40 + dx * 250, 5, RY + 36); g.add(pot); const lv = new THREE.Mesh(new THREE.SphereGeometry(10, 10, 8), mat("#3c8d40")); lv.position.set(RX + 40 + dx * 250, 20, RY + 36); g.add(lv); solid(RX + 33 + dx * 250, RY + 29, 14, 14); } }
  }
  function buildRoom(b) {
    const g = new THREE.Group();
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(1600, 1600), mat("#2b2f36"));   // so there is no sky under the room
    ground.rotation.x = -Math.PI / 2; ground.position.set(R.x + R.w / 2, 0.2, R.y + R.h / 2 + 300); g.add(ground);
    const grid = tileTex(R.w / 32, R.h / 32);
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(R.w, R.h), new THREE.MeshStandardMaterial({ map: grid, color: b.body, roughness: 0.9 }));
    floor.rotation.x = -Math.PI / 2; floor.position.set(R.x + R.w / 2, 0.5, R.y + R.h / 2); floor.receiveShadow = true; g.add(floor);
    const wallH = 78, wallCol = b.body;
    box(g, R.w, wallH, 6, R.x + R.w / 2, wallH / 2, R.y - 3, wallCol);                 // back wall
    box(g, 6, wallH, R.h, R.x - 3, wallH / 2, R.y + R.h / 2, wallCol);                 // west wall
    box(g, 6, wallH, R.h, R.x + R.w + 3, wallH / 2, R.y + R.h / 2, wallCol);           // east wall
    box(g, R.w, 3, 6, R.x + R.w / 2, wallH + 1, R.y - 3, b.trim);                      // trim along the back wall top
    const half = (R.w - 56) / 2;
    box(g, half, 10, 6, R.x + half / 2, 5, R.y + R.h + 3, b.trim);                     // low front wall, either side of the door
    box(g, half, 10, 6, R.x + R.w - half / 2, 5, R.y + R.h + 3, b.trim);
    const mat1 = box(g, 56, 1, 28, DOOR.x, 0.9, R.y + R.h - 10, "#8a2c2c"); mat1.receiveShadow = true;   // the door mat
    const sign = label(b.name, { size: 44 }); sign.position.set(R.x + R.w / 2, wallH - 14, R.y + 6); g.add(sign);
    S.solids.push({ x: R.x - 20, y: R.y - 20, w: R.w + 40, h: 20 });                   // walls as blockers
    S.solids.push({ x: R.x - 20, y: R.y - 20, w: 20, h: R.h + 20 + 14 });
    S.solids.push({ x: R.x + R.w, y: R.y - 20, w: 20, h: R.h + 20 + 14 });
    S.solids.push({ x: R.x - 20, y: R.y + R.h + 2, w: R.w + 40, h: 20 });                // the south wall, with the door mat as the way out (press E)
    S.spots.push({ x: DOOR.x, y: DOOR.y - 10, r: 34, text: `Press E to go outside`, run: () => leave() });

    // the counter, with someone behind it
    const jobs = Object.entries(JOBS).filter(([, j]) => j.b === b.id).map(([k]) => k);
    const cx = R.x + R.w - 90, cy = R.y + 36;
    box(g, 90, 24, 22, cx, 12, cy, "#7a5a3a"); box(g, 94, 3, 26, cx, 25, cy, "#d8c8a8");
    solid(cx - 47, cy - 13, 94, 26);
    const clerk = makeFigure("#2a7de1"); clerk.position.set(cx, 0, cy - 22); clerk.rotation.y = 0;
    S.clerk = clerk;
    const cl = label(jobs.length ? "Clock in here" : "Information", { size: 34 }); cl.scale.multiplyScalar(0.4); cl.position.set(cx, 60, cy); g.add(cl);
    S.spots.push({ x: cx, y: cy + 30, r: 42, text: jobs.length ? "Press E to clock in at the counter" : "Press E to talk to the counter", run: () => openCounter(b, jobs) });

    // shelves, if this is a shop
    const sh = SHELVES[b.id];
    if (sh) { let x = R.x + 24; const w = Math.min(96, Math.floor((R.w - 150) / sh.length) - 8); for (const [name, ids] of sh) { shelfUnit(g, x, R.y + 6, w, ids, name); x += w + 8; } }
    decor(g, b.id);
    // a few things on the floor of every shop: a plant by the door
    const pot = new THREE.Mesh(new THREE.CylinderGeometry(7, 6, 12, 10), mat("#a0522d")); pot.position.set(R.x + 22, 6, R.y + R.h - 20); g.add(pot);
    const lv = new THREE.Mesh(new THREE.SphereGeometry(12, 10, 8), mat("#3c8d40")); lv.position.set(R.x + 22, 22, R.y + R.h - 20); g.add(lv);
    solid(R.x + 14, R.y + R.h - 28, 16, 16);
    scene.add(g);
    return g;
  }

  // ---- panels ----
  async function refreshBag() {
    if (!loggedIn()) { S.bag = null; return; }
    try { const j = await carApi("GET", "/api/city/bag"); S.bag = j.items; S.wallet = j.wallet; } catch { /* the cloud may be down */ }
  }
  function openShelf(name, ids) {
    S.panelFor = "shelf";
    const draw = () => {
      const kids = [mk("strong", { textContent: name })];
      if (!loggedIn()) { kids.push(mk("p", { textContent: "Log in to Octee Cloud to buy things. Looking is free.", style: "margin:6px 0" }), mk("a", { href: "https://zengyixin0205.github.io/Octee-airline/login.html", textContent: "Log in" })); }
      else if (S.wallet != null) kids.push(mk("p", { textContent: `Your wallet: ${S.wallet} CCT`, style: "margin:6px 0" }));
      for (const id of ids) {
        const it = GOODS[id];
        kids.push(btn(`${it.name}: ${it.price} CCT`, async () => {
          if (!loggedIn()) { S.msg = "Log in first."; return draw(); }
          try { const j = await carApi("POST", "/api/city/shop/buy", { item: id, qty: 1 }); S.msg = j.message; S.wallet = j.wallet; await refreshBag(); }
          catch (e) { S.msg = e.message; }
          draw();
        }));
      }
      if (S.msg) kids.push(mk("p", { textContent: S.msg, style: "margin:6px 0;font-weight:600" }));
      show(...kids);
    };
    S.msg = ""; draw();
  }
  function openBag() {
    S.panelFor = "bag";
    const kids = [mk("strong", { textContent: "Your bag" })];
    if (!loggedIn()) kids.push(mk("p", { textContent: "Log in to Octee Cloud to keep things in a bag.", style: "margin:6px 0" }));
    else if (!S.bag || !S.bag.length) kids.push(mk("p", { textContent: "Empty. Shelves in the shops sell things.", style: "margin:6px 0" }));
    else for (const it of S.bag) kids.push(mk("p", { textContent: `${it.name} x ${it.qty}`, style: "margin:3px 0" }));
    if (S.wallet != null) kids.push(mk("p", { textContent: `Wallet: ${S.wallet} CCT`, style: "margin:6px 0" }));
    show(...kids);
  }
  function openCounter(b, jobs) {
    S.panelFor = "counter";
    const kids = [mk("strong", { textContent: b.name })];
    if (!jobs.length) {
      kids.push(mk("p", { textContent: "Nobody here is hiring today. They would like you to look around, which is also work, of a kind.", style: "margin:6px 0" }));
    } else {
      kids.push(mk("p", { textContent: `Pick a job and clock in. Pays ${PAY} CCT, or ${HARD_PAY} for the hard jobs. One shift per job a day. Clocking in twice is a crime.`, style: "margin:6px 0" }));
      if (!loggedIn()) kids.push(mk("p", { textContent: "Log in to Octee Cloud first. You can look for free, but not clock in." }), mk("a", { href: "https://zengyixin0205.github.io/Octee-airline/login.html", textContent: "Log in" }));
      for (const id of jobs) kids.push(btn(`${JOBS[id].title} (${payOf(id)} CCT)`, () => quiz(b, jobs, id)));
    }
    if (b.id !== "grocery") kids.push(mk("a", { href: "index.html#" + b.id, textContent: "The town page for this building (reviews, owners, news)", style: "display:block;margin-top:8px" }));
    show(...kids);
  }
  function quiz(b, jobs, jobId) {
    const j = JOBS[jobId];
    const steps = [[j.prompt, j.right, j.wrong]];
    if (j.prompt2) steps.push([j.prompt2, j.right2, j.wrong2]);
    const extra = EXTRA_STEPS[jobId] || [];
    for (const x of (j.prompt2 ? extra.slice(1) : extra)) steps.push([x[0], x[1], x[2]]);
    const step = (i, note) => {
      const [q, right, wrong] = steps[i];
      const kids = [mk("strong", { textContent: j.title }), mk("p", { textContent: (steps.length > 1 ? `Question ${i + 1} of ${steps.length}: ` : "") + q, style: "margin:6px 0" })];
      if (note) kids.push(mk("p", { textContent: note, style: "margin:4px 0;font-weight:600" }));
      [right, ...wrong].sort(() => Math.random() - 0.5).forEach((o) => kids.push(btn(o, async () => {
        if (o !== right) return step(i, "Wrong answer. Nobody is paid for a wrong answer.");
        if (i + 1 < steps.length) return step(i + 1, "Right. Next question.");
        show(mk("strong", { textContent: j.title }), mk("p", { textContent: "Checking the shift…" }));
        try {
          const r = await carApi("POST", "/api/city/shift", { job: jobId });
          let text = r.message || "Done.";
          if (r.paid != null) { text = `Shift done. You earned ${r.paid} CCT${r.bonus ? ` (${r.bonus} is the streak bonus, day ${r.streak})` : ""}.`; if (r.spot) text += r.spot.failed ? ` Spot check failed: "${r.spot.rule}" Fine: ${r.spot.fine} CCT.` : ` Spot check passed: "${r.spot.rule}"`; }
          show(mk("strong", { textContent: j.title }), mk("p", { textContent: text, style: "margin:6px 0" }), btn("Back to the counter", () => openCounter(b, jobs)));
        } catch (e) { show(mk("strong", { textContent: j.title }), mk("p", { textContent: e.message, style: "margin:6px 0" }), btn("Back to the counter", () => openCounter(b, jobs))); }
      })));
      kids.push(btn("Back", () => openCounter(b, jobs), "color:#555"));
      show(...kids);
    };
    if (!loggedIn()) { openCounter(b, jobs); return; }
    step(0);
  }

  // ---- going in and out ----
  function enter(b) {
    if (S.group) { scene.remove(S.group); S.group = null; }
    if (S.clerk) { scene.remove(S.clerk); S.clerk = null; }
    S.solids = []; S.spots = []; S.b = b;
    S.group = buildRoom(b);
    S.from = { x: PLAYER.x, y: PLAYER.y };
    S.on = true; close();
    PLAYER.x = DOOR.x; PLAYER.y = DOOR.y - 24; PLAYER.face = Math.PI;
    refreshBag();
  }
  function leave() {
    S.on = false; close();
    const b = S.b;
    PLAYER.x = b.x + b.w / 2; PLAYER.y = b.y + b.h + 22; PLAYER.face = 0;
    if (!ctx.free(PLAYER.x, PLAYER.y) && S.from) { PLAYER.x = S.from.x; PLAYER.y = S.from.y; }
    if (S.group) { scene.remove(S.group); S.group = null; }
    if (S.clerk) { scene.remove(S.clerk); S.clerk = null; }
  }
  const hitR = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  function spotNear() { let best = null, bd = 1e9; for (const s of S.spots) { const d = Math.hypot(PLAYER.x - s.x, PLAYER.y - s.y); if (d < s.r && d < bd) { bd = d; best = s; } } return best; }
  return {
    get on() { return S.on; },
    get panelOpen() { return !panel.hidden; },
    canEnter: (b) => !!b && !b.href && !NO_ROOM.has(b.id),
    enter, leave,
    free(px, py, body) {
      const box = { x: px - body.w / 2, y: py - body.h / 2, w: body.w, h: body.h };
      return !S.solids.some((s) => hitR(box, s));
    },
    action() { if (!panel.hidden) { close(); return; } const s = spotNear(); if (s) s.run(); },
    prompt() { if (!panel.hidden) return ""; const s = spotNear(); return s ? s.text : "Walk around. I opens your bag. Esc closes panels."; },
    close, openBag,
    camOffset: { x: -20, y: 230, z: 190 },
    state: S
  };
}
