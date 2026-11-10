/* Combate de acción en tiempo real sobre un canvas.
   Arrastras para moverte, atacas solo al tener al enemigo a tu alcance, usas técnicas con recarga
   y esquivas los ataques enemigos, que siempre se anuncian con una zona marcada en el suelo. */
'use strict';

const Fight = (() => {
  const W = 360, DUR = 2, EATK = 1.5, ERATE = 0.55;            // ancho lógico de la arena; segundos por unidad de duración de una técnica
  let H = 420, F = null, cv = null, g = null, last = 0, scale = 1, ui = null;
  const hyp = Math.hypot, clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const dist = (a, b) => hyp(a.x - b.x, a.y - b.y);

  // ───────────── Inicio ─────────────
  function start() {
    const n = STORY[S.node], b = ENEMIGOS[n.fight], m = n.mod ? n.mod() : {}, d = derive();
    const max = Math.round(b.hp * (m.hp || 1)), ranged = CLASES[S.cls].main === 'esp';
    F = {
      t: 0, over: null, wait: n.fight === 'acolito' ? 'help' : 0.8, node: n, base: b, pild0: S.pild, d, ranged, range: ranged ? 200 : 26,
      p: { x: W / 2, y: 0, r: 14, hp: d.maxHp, qi: d.maxQi, shield: 0, buff: 0, buffT: 0, evade: 0, dot: null, dotT: 0, inv: 0,
        dashT: 0, dashCd: 0, dvx: 0, dvy: 0, atkT: 0.5, cds: mySkills().map(() => 0), flash: 0, pillCd: 0 },
      e: { n: b.n, glyph: b.glyph, x: W / 2, y: 78, r: b.r || 24, max, hp: max, atk: b.atk * EATK * (m.atk || 1), def: b.def * (m.def || 1),
        spd: b.spd || 60, rate: (b.rate || 1.7) * ERATE, sk: b.sk, stun: 0, stunCd: 0, weak: 0, dot: null, dotT: 0, cd: 1.2, act: null, far: 0, flash: 0 },
      tele: [], shots: [], fx: [], queue: [], shake: 0, in: { mx: 0, my: 0 }, joy: null, gains: [], keys: {}
    };
    build();
    F.p.y = H - 60;
    last = 0; requestAnimationFrame(loop);
  }

  function build() {
    screen = 'fight';
    const sk = mySkills(), cols = sk.length + 2 <= 4 ? 2 : 3;
    app.innerHTML = `<div class="fight">
      <section class="foe"><b>${F.e.n}</b><div class="bar hp"><i id="eHp"></i><span id="eHpT"></span></div><div class="est" id="eEst"></div></section>
      <div class="arena-w"><canvas id="arena"></canvas><div id="fOver" class="fover" hidden></div></div>
      <section class="me"><div class="bar hp"><i id="pHp"></i><span id="pHpT"></span></div>
        <div class="bar qi"><i id="pQi"></i><span id="pQiT"></span></div><div class="est" id="pEst"></div></section>
      <div class="pad" style="grid-template-columns:repeat(${cols},1fr)">
        ${sk.map((s, i) => `<button class="pb skill" data-k="${i}"><i class="cd"></i><b>${s.n}</b><small>${s.c} Qi</small></button>`).join('')}
        <button class="pb dash" data-k="dash"><i class="cd"></i><b>Paso veloz</b><small>Esquiva</small></button>
        <button class="pb pill" data-k="pill"><i class="cd"></i><b>Píldora</b><small id="pillN"></small></button>
      </div></div>`;
    const q = id => document.getElementById(id);
    ui = { eHp: q('eHp'), eHpT: q('eHpT'), eEst: q('eEst'), pHp: q('pHp'), pHpT: q('pHpT'), pQi: q('pQi'), pQiT: q('pQiT'), pEst: q('pEst'),
      pillN: q('pillN'), over: q('fOver'), btns: Array.from(app.querySelectorAll('.pb')), est: '' };
    cv = q('arena'); g = cv.getContext('2d');
    // La arena ocupa el alto que dejan libre las barras y los botones.
    const wrap = cv.parentNode, root = app.firstElementChild, cssW = wrap.clientWidth;
    let others = 22;      // relleno vertical del contenedor
    for (const c of root.children) others += c === wrap ? 8 : c.offsetHeight + 8;
    const cssH = clamp(window.innerHeight - others, 250, cssW * 1.5);
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    scale = cssW / W; H = cssH / scale;
    cv.style.height = cssH + 'px'; cv.width = Math.round(cssW * dpr); cv.height = Math.round(cssH * dpr);
    g.setTransform(dpr * scale, 0, 0, dpr * scale, 0, 0);

    const pos = ev => { const r = cv.getBoundingClientRect(); return { x: ev.clientX - r.left, y: ev.clientY - r.top }; };
    cv.onpointerdown = ev => { const o = pos(ev); F.joy = { id: ev.pointerId, ox: o.x, oy: o.y, x: o.x, y: o.y }; try { cv.setPointerCapture(ev.pointerId); } catch (e) { /* */ } ev.preventDefault(); };
    cv.onpointermove = ev => {
      if (!F || !F.joy || F.joy.id !== ev.pointerId) return;
      const o = pos(ev); F.joy.x = o.x; F.joy.y = o.y;
      const dx = o.x - F.joy.ox, dy = o.y - F.joy.oy, l = hyp(dx, dy);
      if (l < 6) { F.in.mx = F.in.my = 0; } else { const k = Math.min(1, l / 34) / l; F.in.mx = dx * k; F.in.my = dy * k; }
    };
    cv.onpointerup = cv.onpointercancel = ev => { if (F && F.joy && F.joy.id === ev.pointerId) { F.joy = null; F.in.mx = F.in.my = 0; } };
    ui.btns.forEach(b => b.onpointerdown = ev => { ev.preventDefault(); press(b.dataset.k); });
    if (F.wait === 'help') {
      overlay(`<h3>Combate</h3><p><b>Arrastra el dedo</b> sobre la arena para moverte.<br>Atacas <b>automáticamente</b> cuando el enemigo está a tu alcance.<br>
        Sal de las <b>zonas rojas</b> antes de que se llenen, o usa <b>Paso veloz</b> para atravesarlas.<br>Las <b>técnicas</b> gastan Qi y tienen recarga.</p>
        <button class="btn primary" id="bEnd">¡Luchar!</button>`);
      document.getElementById('bEnd').onclick = () => { ui.over.hidden = true; ui.over.innerHTML = ''; F.wait = 0.4; };
    }
  }
  function overlay(html) { ui.over.innerHTML = `<div class="result">${html}</div>`; ui.over.hidden = false; }
  function press(k) { if (k === 'dash') dash(); else if (k === 'pill') pill(); else use(+k); }

  // ───────────── Acciones del jugador ─────────────
  const fxNum = (o, text, color) => F.fx.push({ k: 'num', x: o.x + (Math.random() - 0.5) * 18, y: o.y - o.r - 4, t: 0, dur: 0.9, text, color });
  function healP(v) { v = Math.round(v); F.p.hp = Math.min(F.d.maxHp, F.p.hp + v); if (v > 0) fxNum(F.p, '+' + v, '#6fd0a0'); }

  function hitEnemy(s, first) {
    const p = F.p, e = F.e, d = F.d;
    if (e.hp <= 0) return;
    if (s.pow) {
      let dm = d.atk * (1 + (p.buffT > 0 ? p.buff : 0)) * s.pow * rnd(0.9, 1.1) - (s.pierce ? 0 : e.def * 0.5);
      const crit = Math.random() * 100 < d.crit + (s.crit || 0);
      if (crit) dm *= 1.6;
      if (s.exec && e.hp < e.max * 0.4) dm *= 1.8;
      dm = Math.max(1, Math.round(dm)); e.hp -= dm; e.flash = 0.12;
      fxNum(e, dm + (crit ? '!' : ''), crit ? '#ffd76a' : '#fff');
      F.fx.push(F.ranged ? { k: 'bolt', x: p.x, y: p.y, x2: e.x, y2: e.y, t: 0, dur: 0.18 } : { k: 'slash', x: e.x, y: e.y, a: Math.random() * 6.28, t: 0, dur: 0.2 });
      if (s.drain) healP(dm * s.drain);
    }
    if (!first) return;
    if (s.heal) healP(d.maxHp * s.heal);
    if (s.shield) p.shield = Math.min(Math.round(d.maxHp * 0.6), p.shield + Math.round(d.maxHp * s.shield));
    if (s.buff) { p.buff = s.buff.a; p.buffT = s.buff.t * DUR; }
    if (s.evade) p.evade = s.evade * DUR;
    if (s.weak) e.weak = s.weak * DUR;
    if (s.dot) { e.dot = { d: Math.max(1, Math.round(d.atk * s.dot.p * 0.5)), n: s.dot.t * DUR }; e.dotT = 1; }
  }
  function tryStun(s) {
    const e = F.e;
    if (!s.stun || e.hp <= 0 || e.stunCd > 0 || Math.random() >= s.stun) return;
    e.stun = 1.6; e.stunCd = 6; e.act = null; F.tele = []; fxNum(e, '¡Aturdido!', '#ffd76a');
  }

  function use(i) {
    const s = mySkills()[i], p = F.p, e = F.e;
    if (!F || F.over || F.wait || !s || p.cds[i] > 0 || p.qi < s.c) return false;
    p.qi -= s.c; p.cds[i] = cdOf(s);
    F.fx.push({ k: 'ring', x: p.x, y: p.y, t: 0, dur: 0.35, color: auraColor() });
    if (s.pow) {
      if (!F.ranged) {            // las clases cuerpo a cuerpo se lanzan sobre el enemigo
        const a = Math.atan2(p.y - e.y, p.x - e.x), gap = e.r + p.r + 8;
        if (dist(p, e) > gap + 12) { F.fx.push({ k: 'trail', x: p.x, y: p.y, x2: e.x + Math.cos(a) * gap, y2: e.y + Math.sin(a) * gap, t: 0, dur: 0.25 }); p.x = e.x + Math.cos(a) * gap; p.y = e.y + Math.sin(a) * gap; bound(p); }
        p.inv = Math.max(p.inv, 0.25);
      }
      for (let h = 0; h < (s.hits || 1); h++) F.queue.push({ t: h * 0.13, s, first: h === 0 });
    } else hitEnemy(s, true);
    fxNum(p, s.n, auraColor());
    return true;
  }
  const cdOf = s => 3.5 + s.c * 0.3;
  function dash() {
    const p = F.p;
    if (!F || F.over || F.wait || p.dashCd > 0) return false;
    let dx = F.in.mx, dy = F.in.my;
    if (!dx && !dy) { const a = Math.atan2(p.y - F.e.y, p.x - F.e.x); dx = Math.cos(a); dy = Math.sin(a); }
    const l = hyp(dx, dy); p.dvx = dx / l * 560; p.dvy = dy / l * 560;
    p.dashT = 0.2; p.inv = Math.max(p.inv, 0.36); p.dashCd = F.d.dashCd;
    return true;
  }
  function pill() {
    if (!F || F.over || F.wait || S.pild < 1 || F.p.pillCd > 0 || F.p.hp >= F.d.maxHp) return false;
    S.pild--; F.p.pillCd = 3; healP(F.d.maxHp * 0.45); return true;
  }
  function bound(o) { o.x = clamp(o.x, o.r + 4, W - o.r - 4); o.y = clamp(o.y, o.r + 4, H - o.r - 4); }

  // ───────────── Daño al jugador ─────────────
  function hurt(pow, s) {
    const p = F.p, e = F.e;
    if (p.inv > 0 || (p.evade > 0 && Math.random() < 0.6)) { fxNum(p, 'Esquivado', '#9ad0ff'); return; }
    let dm = Math.max(1, Math.round(e.atk * (e.weak > 0 ? 0.7 : 1) * pow * rnd(0.9, 1.1) - F.d.def * 0.5));
    const abs = Math.min(p.shield, dm); p.shield -= abs; dm -= abs;
    p.hp -= dm; p.flash = 0.2; F.shake = 0.25; p.inv = Math.max(p.inv, 0.35);
    fxNum(p, dm ? '-' + dm : 'Escudo', dm ? '#ff7a85' : '#9ad0ff');
    if (s.dot && dm > 0) { p.dot = { d: s.dot.d, n: s.dot.t }; p.dotT = 1; }
    if (s.drain && dm > 0) { const v = Math.round(dm * s.drain); e.hp = Math.min(e.max, e.hp + v); fxNum(e, '+' + v, '#ff7a85'); }
  }

  // ───────────── Enemigo ─────────────
  function patOf(s) { return s.pat || (s.heal ? 'heal' : s.charge ? 'slam' : s.dot ? 'bolts' : 'swipe'); }
  function shoot(s, a, speed) { F.shots.push({ x: F.e.x, y: F.e.y, vx: Math.cos(a) * speed, vy: Math.sin(a) * speed, r: 7, s, life: 4 }); }
  function begin(s, forcePat) {
    const e = F.e, p = F.p, pat = forcePat || patOf(s), big = !!s.charge;
    const a = Math.atan2(p.y - e.y, p.x - e.x);
    const T = (shape, dur) => { F.tele.push(Object.assign({ t: 0, dur, s }, shape)); e.act = { t: dur + 0.12, s }; };
    if (pat === 'swipe') T({ k: 'c', x: e.x, y: e.y, r: e.r + (big ? 78 : 52) }, big ? 1.0 : 0.62);
    else if (pat === 'slam') T({ k: 'c', x: p.x, y: p.y, r: big ? 86 : 62, leap: true }, big ? 1.15 : 0.8);
    else if (pat === 'dash' || pat === 'beam') {
      const len = pat === 'beam' ? 520 : Math.min(300, dist(p, e) + 110);
      T({ k: 'l', x: e.x, y: e.y, x2: e.x + Math.cos(a) * len, y2: e.y + Math.sin(a) * len, w: pat === 'beam' ? 64 : 44, move: pat === 'dash' }, big ? 1.1 : 0.8);
    } else if (pat === 'bolts') { const nb = s.n2 || 3; for (let i = 0; i < nb; i++) shoot(s, a + (i - (nb - 1) / 2) * 0.3, 185); e.act = { t: 0.5, s }; }
    else if (pat === 'ring') { const nb = s.n2 || 12, o = Math.random() * 6.28; for (let i = 0; i < nb; i++) shoot(s, o + i * 6.283 / nb, 150); e.act = { t: 0.6, s }; }
    else if (pat === 'heal') { const v = Math.round(e.max * s.heal); e.hp = Math.min(e.max, e.hp + v); fxNum(e, '+' + v, '#ff7a85'); e.act = { t: 0.8, s }; }
    if (pat !== 'heal') fxNum(e, s.n, big ? '#ffd76a' : '#f3c9cd');
  }
  function segDist(px, py, t) {
    const dx = t.x2 - t.x, dy = t.y2 - t.y, l2 = dx * dx + dy * dy || 1;
    const u = clamp(((px - t.x) * dx + (py - t.y) * dy) / l2, 0, 1);
    return hyp(px - (t.x + dx * u), py - (t.y + dy * u));
  }
  const inside = t => (t.k === 'c' ? hyp(F.p.x - t.x, F.p.y - t.y) < t.r + 3 : segDist(F.p.x, F.p.y, t) < t.w / 2 + 5);

  function enemyAI(dt) {
    const e = F.e, p = F.p;
    if (e.act) { e.act.t -= dt; if (e.act.t <= 0) { e.act = null; e.cd = e.rate * rnd(0.75, 1.2); } return; }
    const dd = dist(e, p), near = dd < e.r + p.r + 30;
    if (!near) { const sp = e.spd * dt / dd; e.x += (p.x - e.x) * sp; e.y += (p.y - e.y) * sp; e.far += dt; } else e.far = 0;
    e.cd -= dt; if (e.cd > 0) return;
    const tot = e.sk.reduce((a, x) => a + (x.w || 1), 0); let r = Math.random() * tot;
    const s = e.sk.find(x => (r -= (x.w || 1)) < 0) || e.sk[0];
    if (patOf(s) === 'swipe' && !near) {       // un golpe cuerpo a cuerpo no alcanza: tras perseguir un rato, embiste
      if (e.far > 1.3) { e.far = 0; begin(s, 'dash'); } else e.cd = 0.15;
      return;
    }
    begin(s);
  }

  // ───────────── Simulación ─────────────
  function step(dt) {
    if (!F || F.over) return;
    if (F.wait) { if (typeof F.wait === 'number') { F.wait -= dt; if (F.wait <= 0) F.wait = 0; } return; }
    const p = F.p, e = F.e, d = F.d;
    F.t += dt;
    // Jugador
    for (const k of ['inv', 'dashCd', 'buffT', 'evade', 'flash', 'pillCd']) if (p[k] > 0) p[k] = Math.max(0, p[k] - dt);
    for (let i = 0; i < p.cds.length; i++) if (p.cds[i] > 0) p.cds[i] = Math.max(0, p.cds[i] - dt);
    let mx = F.in.mx, my = F.in.my;
    const K = F.keys; if (K.a || K.d || K.w || K.s) { mx = (K.d ? 1 : 0) - (K.a ? 1 : 0); my = (K.s ? 1 : 0) - (K.w ? 1 : 0); const l = hyp(mx, my) || 1; mx /= l; my /= l; F.in.mx = mx; F.in.my = my; }
    if (p.dashT > 0) { p.dashT -= dt; p.x += p.dvx * dt; p.y += p.dvy * dt; } else { p.x += mx * d.speed * dt; p.y += my * d.speed * dt; }
    bound(p);
    const pe = dist(p, e), min = p.r + e.r;     // no atravesar al enemigo
    if (pe < min && pe > 0.01 && p.dashT <= 0) { p.x = e.x + (p.x - e.x) / pe * min; p.y = e.y + (p.y - e.y) / pe * min; bound(p); }
    p.qi = Math.min(d.maxQi, p.qi + d.maxQi * 0.035 * dt);
    if (p.dot) { p.dotT -= dt; if (p.dotT <= 0) { p.dotT = 1; p.hp -= p.dot.d; fxNum(p, '-' + p.dot.d, '#ff9a5a'); if (--p.dot.n <= 0) p.dot = null; } }
    p.atkT -= dt;
    if (p.atkT <= 0 && p.dashT <= 0 && dist(p, e) <= F.range + p.r + e.r) { p.atkT = d.atkInt; hitEnemy({ pow: 0.6 }, false); p.qi = Math.min(d.maxQi, p.qi + 1.5); }
    for (let i = F.queue.length - 1; i >= 0; i--) { const q = F.queue[i]; q.t -= dt; if (q.t <= 0) { F.queue.splice(i, 1); hitEnemy(q.s, q.first); tryStun(q.s); } }
    // Enemigo
    for (const k of ['weak', 'stunCd', 'flash']) if (e[k] > 0) e[k] = Math.max(0, e[k] - dt);
    if (e.dot) { e.dotT -= dt; if (e.dotT <= 0) { e.dotT = 1; e.hp -= e.dot.d; fxNum(e, e.dot.d, '#c7f08a'); if (--e.dot.n <= 0) e.dot = null; } }
    if (e.stun > 0) e.stun -= dt; else if (e.hp > 0) enemyAI(dt);
    bound(e);
    // Zonas anunciadas
    for (let i = F.tele.length - 1; i >= 0; i--) {
      const t = F.tele[i]; t.t += dt; if (t.t < t.dur) continue;
      F.tele.splice(i, 1);
      if (inside(t)) hurt(t.s.pow, t.s);
      if (t.leap) { e.x = t.x; e.y = t.y; } else if (t.move) { e.x = t.x2; e.y = t.y2; }
      bound(e); F.shake = Math.max(F.shake, 0.12);
      F.fx.push({ k: 'ring', x: t.k === 'c' ? t.x : e.x, y: t.k === 'c' ? t.y : e.y, t: 0, dur: 0.3, color: '#ff5a66', r: t.r || 40 });
    }
    // Proyectiles
    for (let i = F.shots.length - 1; i >= 0; i--) {
      const s = F.shots[i]; s.x += s.vx * dt; s.y += s.vy * dt; s.life -= dt;
      if (hyp(s.x - p.x, s.y - p.y) < s.r + p.r - 3) { hurt(s.s.pow, s.s); F.shots.splice(i, 1); }
      else if (s.life <= 0 || s.x < -20 || s.x > W + 20 || s.y < -20 || s.y > H + 20) F.shots.splice(i, 1);
    }
    for (let i = F.fx.length - 1; i >= 0; i--) { F.fx[i].t += dt; if (F.fx[i].t >= F.fx[i].dur) F.fx.splice(i, 1); }
    if (F.shake > 0) F.shake -= dt;
    if (e.hp <= 0) end(true); else if (p.hp <= 0) end(false);
  }

  function end(won) {
    F.over = won ? 'win' : 'lose'; F.tele = []; F.shots = [];
    if (won) {
      F.e.hp = 0;
      if (F.base.xp) { gainXp(F.base.xp); F.gains.push(['+' + F.base.xp + ' Exp', '#bbb']); }
      if (F.base.pild) { S.pild += F.base.pild; F.gains.push(['+' + F.base.pild + ' Píldora', '#9be0b0']); }
      S.node = val(F.node.next); S.pending = null; save();
      overlay(`<h3>Victoria</h3>${chips(F.gains)}<button class="btn primary" id="bEnd">Continuar</button>`);
      document.getElementById('bEnd').onclick = () => { F = null; showNode(); };
    } else {
      F.p.hp = 0; S.pild = F.pild0;
      overlay(`<h3>Has caído</h3><p>El fragmento late en tu pecho y se niega a apagarse. Respiras. Te levantas.</p><button class="btn primary" id="bEnd">Volver a intentarlo</button>`);
      document.getElementById('bEnd').onclick = start;
    }
    hud();
  }

  // ───────────── Dibujo ─────────────
  function hud() {
    const p = F.p, e = F.e, d = F.d;
    ui.eHp.style.width = Math.max(0, e.hp / e.max * 100) + '%'; ui.eHpT.textContent = Math.max(0, Math.round(e.hp)) + ' / ' + e.max;
    ui.pHp.style.width = Math.max(0, p.hp / d.maxHp * 100) + '%'; ui.pHpT.textContent = Math.max(0, Math.round(p.hp)) + ' / ' + d.maxHp;
    ui.pQi.style.width = p.qi / d.maxQi * 100 + '%'; ui.pQiT.textContent = Math.floor(p.qi) + ' / ' + d.maxQi + ' Qi';
    ui.pillN.textContent = 'Quedan ' + S.pild;
    const es = [e.act && e.act.s.charge ? '⚠ Concentrando' : '', e.stun > 0 ? 'Aturdido' : '', e.weak > 0 ? 'Debilitado' : '', e.dot ? 'Daño continuo' : ''];
    const ps = [p.shield ? 'Escudo ' + p.shield : '', p.buffT > 0 ? 'Ataque ↑' : '', p.evade > 0 ? 'Esquiva ↑' : '', p.dot ? 'Quemadura' : ''];
    const key = es.join('|') + '#' + ps.join('|');
    if (key !== ui.est) { ui.est = key; const h = a => a.filter(Boolean).map(x => `<span>${x}</span>`).join(''); ui.eEst.innerHTML = h(es); ui.pEst.innerHTML = h(ps); }
    const sk = mySkills();
    ui.btns.forEach(b => {
      const k = b.dataset.k; let cd = 0, mx = 1, off = false;
      if (k === 'dash') { cd = p.dashCd; mx = d.dashCd; } else if (k === 'pill') { cd = p.pillCd; mx = 3; off = S.pild < 1; }
      else { const s = sk[+k]; cd = p.cds[+k]; mx = cdOf(s); off = p.qi < s.c; }
      b.classList.toggle('off', off || cd > 0);
      b.firstElementChild.style.height = (cd / mx * 100) + '%';
    });
  }

  function draw() {
    const p = F.p, e = F.e;
    g.save();
    if (F.shake > 0) g.translate((Math.random() - 0.5) * 7, (Math.random() - 0.5) * 7);
    const a = ARTE[F.node.art] || ARTE.luna;
    const bg = g.createRadialGradient(W / 2, H / 2, 20, W / 2, H / 2, H * 0.75); bg.addColorStop(0, a[1]); bg.addColorStop(1, '#0a080e');
    g.fillStyle = bg; g.fillRect(-10, -10, W + 20, H + 20);
    g.strokeStyle = '#ffffff14'; g.lineWidth = 2;
    for (const r of [60, 120, 180]) { g.beginPath(); g.arc(W / 2, H / 2, r, 0, 6.283); g.stroke(); }
    g.fillStyle = '#ffffff0d'; g.font = '900 150px serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(a[0], W / 2, H / 2);
    // Zonas de peligro: el relleno crece hasta el momento del impacto
    for (const t of F.tele) {
      const k = t.t / t.dur;
      if (t.k === 'c') {
        g.fillStyle = '#ff3b4a22'; g.beginPath(); g.arc(t.x, t.y, t.r, 0, 6.283); g.fill();
        g.fillStyle = '#ff3b4a55'; g.beginPath(); g.arc(t.x, t.y, t.r * k, 0, 6.283); g.fill();
        g.strokeStyle = '#ff6a76'; g.lineWidth = 2; g.beginPath(); g.arc(t.x, t.y, t.r, 0, 6.283); g.stroke();
      } else {
        g.lineCap = 'round';
        g.strokeStyle = '#ff3b4a2a'; g.lineWidth = t.w; g.beginPath(); g.moveTo(t.x, t.y); g.lineTo(t.x2, t.y2); g.stroke();
        g.strokeStyle = '#ff3b4a66'; g.beginPath(); g.moveTo(t.x, t.y); g.lineTo(t.x + (t.x2 - t.x) * k, t.y + (t.y2 - t.y) * k); g.stroke();
      }
    }
    for (const s of F.shots) {
      g.fillStyle = s.s.dot ? '#ff9a3a' : '#ff5a66'; g.shadowColor = g.fillStyle; g.shadowBlur = 10;
      g.beginPath(); g.arc(s.x, s.y, s.r, 0, 6.283); g.fill();
    }
    g.shadowBlur = 0;
    // Enemigo
    const charging = e.act && e.act.s.charge;
    g.fillStyle = e.flash > 0 ? '#fff' : '#7a1a26'; g.strokeStyle = charging ? '#ffd76a' : '#e05a66'; g.lineWidth = 3;
    g.shadowColor = charging ? '#ffd76a' : '#c8323f'; g.shadowBlur = 16;
    g.beginPath(); g.arc(e.x, e.y, e.r, 0, 6.283); g.fill(); g.stroke(); g.shadowBlur = 0;
    g.fillStyle = '#f3c9cd'; g.font = `900 ${Math.round(e.r * 1.15)}px serif`; g.fillText(e.glyph, e.x, e.y + 1);
    if (e.stun > 0) { g.fillStyle = '#ffd76a'; g.font = '700 16px sans-serif'; g.fillText('✦ ✦ ✦', e.x, e.y - e.r - 10); }
    // Jugador
    const robe = LOOK.tunica.colors[S.look.tunica], au = auraColor();
    g.globalAlpha = p.inv > 0 && p.flash <= 0 ? 0.55 : 1;
    if (F.range > 60) { g.strokeStyle = '#ffffff10'; g.lineWidth = 1; g.beginPath(); g.arc(p.x, p.y, F.range + p.r + e.r, 0, 6.283); g.stroke(); }
    if (p.shield > 0) { g.strokeStyle = '#9ad0ff'; g.lineWidth = 2; g.beginPath(); g.arc(p.x, p.y, p.r + 6, 0, 6.283); g.stroke(); }
    g.fillStyle = p.flash > 0 ? '#ff7a85' : robe; g.strokeStyle = au; g.lineWidth = 3; g.shadowColor = au; g.shadowBlur = 12;
    g.beginPath(); g.arc(p.x, p.y, p.r, 0, 6.283); g.fill(); g.stroke(); g.shadowBlur = 0;
    g.fillStyle = LOOK.piel.colors[S.look.piel]; g.beginPath(); g.arc(p.x, p.y, p.r * 0.55, 0, 6.283); g.fill();
    g.fillStyle = LOOK.peloC.colors[S.look.peloC]; g.beginPath(); g.arc(p.x, p.y - 1, p.r * 0.56, 3.3, 6.12); g.fill();
    g.globalAlpha = 1;
    // Efectos
    for (const f of F.fx) {
      const k = f.t / f.dur; g.globalAlpha = 1 - k;
      if (f.k === 'num') { g.font = '800 15px sans-serif'; g.lineWidth = 3; g.strokeStyle = '#000a'; g.strokeText(f.text, f.x, f.y - k * 26); g.fillStyle = f.color; g.fillText(f.text, f.x, f.y - k * 26); }
      else if (f.k === 'slash') { g.strokeStyle = '#fff'; g.lineWidth = 3; g.beginPath(); g.arc(f.x, f.y, 22 + k * 10, f.a, f.a + 1.9); g.stroke(); }
      else if (f.k === 'bolt' || f.k === 'trail') { g.strokeStyle = f.k === 'bolt' ? au : '#ffffff88'; g.lineWidth = f.k === 'bolt' ? 4 : 10; g.lineCap = 'round'; g.beginPath(); g.moveTo(f.x, f.y); g.lineTo(f.x2, f.y2); g.stroke(); }
      else if (f.k === 'ring') { g.strokeStyle = f.color; g.lineWidth = 3; g.beginPath(); g.arc(f.x, f.y, (f.r || 18) * (0.6 + k * 0.6), 0, 6.283); g.stroke(); }
    }
    g.globalAlpha = 1;
    if (typeof F.wait === 'number' && F.wait > 0) { g.fillStyle = '#ffd76a'; g.font = '900 34px serif'; g.fillText('¡Combate!', W / 2, H / 2); }
    g.restore();
    if (F.joy) {       // palanca flotante, en píxeles de pantalla
      const j = F.joy; g.save(); g.setTransform(cv.width / cv.clientWidth, 0, 0, cv.height / cv.clientHeight, 0, 0);
      g.strokeStyle = '#ffffff44'; g.lineWidth = 2; g.beginPath(); g.arc(j.ox, j.oy, 34, 0, 6.283); g.stroke();
      const dx = j.x - j.ox, dy = j.y - j.oy, l = hyp(dx, dy) || 1, k = Math.min(1, 34 / l);
      g.fillStyle = '#ffffff55'; g.beginPath(); g.arc(j.ox + dx * k, j.oy + dy * k, 14, 0, 6.283); g.fill(); g.restore();
    }
  }

  function loop(ts) {
    if (!F || screen !== 'fight' || !cv.isConnected) return;
    const dt = last ? Math.min(0.05, (ts - last) / 1000) : 0; last = ts;
    if (!F.manual) step(dt);
    if (F) { draw(); if (!F.over) hud(); requestAnimationFrame(loop); }
  }

  // Teclado (para probar en un ordenador): WASD o flechas, espacio para esquivar, 1-4 técnicas, Q píldora.
  const KEYMAP = { ArrowLeft: 'a', ArrowRight: 'd', ArrowUp: 'w', ArrowDown: 's', a: 'a', d: 'd', w: 'w', s: 's' };
  window.addEventListener('keydown', ev => {
    if (!F || screen !== 'fight') return;
    const k = KEYMAP[ev.key]; if (k) { F.keys[k] = true; ev.preventDefault(); }
    else if (ev.key === ' ') { dash(); ev.preventDefault(); } else if (ev.key === 'q') pill(); else if (ev.key >= '1' && ev.key <= '4') use(+ev.key - 1);
  });
  window.addEventListener('keyup', ev => { if (F && KEYMAP[ev.key]) { F.keys[KEYMAP[ev.key]] = false; if (!F.keys.a && !F.keys.d && !F.keys.w && !F.keys.s) F.in.mx = F.in.my = 0; } });

  return { start, step, use, dash, pill, inside, get state() { return F; }, get size() { return { W, H }; } };
})();
