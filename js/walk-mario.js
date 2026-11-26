// Octee Peak, Super Mario style: coins along the trail (some float over the logs), goombas that walk across the path,
// three hearts, and a flag at the top. Jump on a goomba to squash it. Touch one and you lose a heart and slip back down.
// Reach the flag and the Worker pays out (once a day, see "hike" in /api/city/play).
export function createMario(ctx) {
  const { THREE, scene, mat, PLAYER, TRAIL, TRAIL_W, HIKE, JUMPS, stage, cloudPlay, loggedIn } = ctx;
  const top = TRAIL[TRAIL.length - 1];
  const S = { lives: 3, coins: 0, stomps: 0, won: false, hurtT: 0, msgT: 0, msg: "" };
  const lerpT = (fi) => { const i = Math.max(0, Math.min(TRAIL.length - 2, Math.floor(fi))), f = Math.max(0, Math.min(1, fi - i)), a = TRAIL[i], b = TRAIL[i + 1]; return { x: a.x + (b.x - a.x) * f, y: a.y + (b.y - a.y) * f, h: a.h + (b.h - a.h) * f, a: a.a + (b.a - a.a) * f }; };

  // ---- coins ----
  const coinGeo = new THREE.CylinderGeometry(4.2, 4.2, 1.2, 14);
  const coinMat = new THREE.MeshStandardMaterial({ color: "#ffcf2e", emissive: "#a87800", emissiveIntensity: 0.6, metalness: 0.5, roughness: 0.35 });
  const coins = [];
  const addCoin = (x, y, h) => { const m = new THREE.Mesh(coinGeo, coinMat); m.rotation.z = Math.PI / 2; const g = new THREE.Group(); g.add(m); g.position.set(x, h, y); scene.add(g); coins.push({ g, x, y, h, got: false }); };
  for (let i = 40, k = 0; i < TRAIL.length - 10; i += 26, k++) {
    const t = TRAIL[i], side = ((k % 3) - 1) * 6, nx = Math.cos(t.a + Math.PI / 2) * side, ny = Math.sin(t.a + Math.PI / 2) * side;
    addCoin(t.x + nx, t.y + ny, t.h + 13);
  }
  for (const j of JUMPS) for (const [di, up] of [[-5, 20], [0, 34], [5, 20]]) { const t = TRAIL[Math.max(0, Math.min(TRAIL.length - 1, TRAIL.findIndex((q) => q.x === j.cx && q.y === j.cy) + di))]; addCoin(t.x, t.y, t.h + up + 10); }

  // ---- goombas ----
  const goombas = [];
  const bodyM = mat("#8b5a2b"), footM = mat("#2a1a0c"), eyeM = mat("#fff");
  for (const [n, i0] of [120, 235, 360, 490, 610, 730, 850].entries()) {
    const g = new THREE.Group();
    const cap = new THREE.Mesh(new THREE.SphereGeometry(7, 14, 10, 0, Math.PI * 2, 0, Math.PI / 2), bodyM); cap.position.y = 7; cap.scale.y = 0.9; g.add(cap);
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(3.6, 3.6, 5, 10), mat("#f0d3a8")); stem.position.y = 5; g.add(stem);
    for (const sx of [-3.5, 3.5]) { const f = new THREE.Mesh(new THREE.BoxGeometry(4.5, 2.5, 6), footM); f.position.set(sx, 1.2, 1); g.add(f); const e = new THREE.Mesh(new THREE.SphereGeometry(1.3, 8, 6), eyeM); e.position.set(sx * 0.8, 8.5, 5.8); g.add(e); const p = new THREE.Mesh(new THREE.SphereGeometry(0.6, 6, 4), footM); p.position.set(sx * 0.8, 8.5, 6.8); g.add(p); }
    scene.add(g);
    goombas.push({ g, i0, ph: n * 1.7, dead: 0, x: 0, y: 0, h: 0 });
  }

  // ---- HUD ----
  const hud = document.createElement("div");
  hud.style.cssText = "position:absolute;left:10px;top:10px;z-index:6;font:700 16px system-ui,sans-serif;color:#fff;background:rgba(0,0,0,.55);padding:6px 10px;border-radius:8px;pointer-events:none;display:none;line-height:1.35";
  stage.appendChild(hud);
  const note = document.createElement("div");
  note.style.cssText = "position:absolute;left:50%;top:70px;transform:translateX(-50%);z-index:6;font:700 20px system-ui,sans-serif;color:#fff;background:rgba(0,0,0,.65);padding:8px 16px;border-radius:10px;pointer-events:none;display:none;text-align:center;max-width:80%";
  stage.appendChild(note);
  const say = (t, sec = 3) => { S.msg = t; S.msgT = sec; };

  const reset = () => { S.lives = 3; S.coins = 0; S.stomps = 0; S.won = false; for (const c of coins) { c.got = false; c.g.visible = true; } for (const g of goombas) { g.dead = 0; g.g.visible = true; } };
  const toTrail = (i) => { const t = TRAIL[Math.max(0, i)]; PLAYER.x = t.x; PLAYER.y = t.y; PLAYER.hop = 0; PLAYER.vh = 0; PLAYER.gy = t.h + 1.5; };
  const nearestIdx = () => { let bi = 0, bd = 1e12; for (let i = 0; i < TRAIL.length; i += 2) { const d = (TRAIL[i].x - PLAYER.x) ** 2 + (TRAIL[i].y - PLAYER.y) ** 2; if (d < bd) { bd = d; bi = i; } } return bi; };

  async function win() {
    S.won = true;
    const score = Math.min(10, 3 + Math.min(6, Math.floor(S.coins / 5)) + (S.lives === 3 ? 1 : 0));
    say(`You made it to the flag! ${S.coins} coins, ${S.lives} hearts left.`, 6);
    if (!loggedIn()) { say(`You made it to the flag! ${S.coins} coins. Log in to Octee Cloud to win money from the hike.`, 8); return; }
    try { const r = await cloudPlay(score); say(`${r.message} (${S.coins} coins, ${S.lives} hearts left)`, 8); } catch (e) { say(e.message, 6); }
  }

  return {
    S, coins, goombas,
    update(dt, now) {
      const t = now / 1000;
      for (const c of coins) if (c.g.visible) c.g.rotation.y = t * 3;
      for (const g of goombas) {
        if (g.dead > 0) { g.dead -= dt; if (g.dead <= 0) { g.g.visible = true; g.g.scale.y = 1; } else { g.g.scale.y = 0.25; if (g.dead < 9) g.g.visible = false; } continue; }
        const fi = g.i0 + Math.sin(t * 0.7 + g.ph) * 9, p = lerpT(fi), side = Math.sin(t * 1.9 + g.ph) * (TRAIL_W - 5);
        g.x = p.x + Math.cos(p.a + Math.PI / 2) * side; g.y = p.y + Math.sin(p.a + Math.PI / 2) * side; g.h = p.h + 1.5;
        g.g.position.set(g.x, g.h, g.y);
        g.g.rotation.y = -(p.a) + (Math.cos(t * 0.7 + g.ph) > 0 ? 0 : Math.PI) + Math.PI / 2;
      }
      const dh = Math.hypot(PLAYER.x - HIKE.x, PLAYER.y - HIKE.y);
      const on = dh < HIKE.r * 1.05 && !PLAYER.riding;
      hud.style.display = on ? "block" : "none";
      if (S.msgT > 0) { S.msgT -= dt; note.textContent = S.msg; note.style.display = "block"; } else note.style.display = "none";
      if (!on) return;
      S.hurtT -= dt;
      for (const c of coins) {
        if (c.got) continue;
        if (Math.hypot(PLAYER.x - c.x, PLAYER.y - c.y) < 8 && Math.abs(PLAYER.z + 10 - c.h) < 15) { c.got = true; c.g.visible = false; S.coins++; }
      }
      for (const g of goombas) {
        if (g.dead > 0) continue;
        if (Math.hypot(PLAYER.x - g.x, PLAYER.y - g.y) > 9 || Math.abs(PLAYER.z - g.h) > 16) continue;
        if (PLAYER.vh < 0 && PLAYER.hop > 4) { g.dead = 12; S.stomps++; S.coins++; PLAYER.vh = 210; say("Squash!", 1); }
        else if (S.hurtT <= 0) {
          S.hurtT = 1.6; S.lives--;
          if (S.lives <= 0) { say("Game over. Back to the start. Try again!", 4); reset(); toTrail(0); }
          else { say("Ouch! You slid back down.", 2.5); toTrail(nearestIdx() - 30); }
        }
      }
      if (!S.won && Math.hypot(PLAYER.x - top.x, PLAYER.y - top.y) < 30 && PLAYER.gy > top.h - 12) win();
      if (S.won && Math.hypot(PLAYER.x - TRAIL[0].x, PLAYER.y - TRAIL[0].y) < 60) reset();
      hud.textContent = "";
      hud.append(document.createTextNode(("♥".repeat(S.lives) + "♡".repeat(3 - S.lives)) + "   coins " + S.coins + " / " + coins.length + "   squashed " + S.stomps));
      const sub = document.createElement("div"); sub.style.cssText = "font-weight:400;font-size:12px;opacity:.85"; sub.textContent = "Reach the flag to win money. Space to jump. Jump on goombas."; hud.append(sub);
    }
  };
}
