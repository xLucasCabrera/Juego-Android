/* Motor: estado, guardado, creación de personaje, narración, combate por turnos y evoluciones. */
'use strict';

const SAVE_KEY = 'sutra_cielo_roto_v1';
const app = document.getElementById('app');
const modal = document.getElementById('modal');
const toastEl = document.getElementById('toast');
let S = null;      // estado de la partida
let screen = 'title';

const rnd = (a, b) => a + Math.random() * (b - a);
const esc = t => String(t).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const val = v => (typeof v === 'function' ? v() : v);
const fmt = t => t.replace(/\{n\}/g, esc(S.name)).replace(/\{@\}/g, S.gen).replace(/\{clase\}/g, CLASES[S.cls].n);
const para = t => fmt(t).split(/\n\n+/).map(p => `<p>${p.replace(/\n/g, '<br>')}</p>`).join('');

// ───────────── Estado y guardado ─────────────
function newState() {
  return {
    name: '', gen: 'o', look: Object.assign({}, LOOK_DEFAULT), origin: 'estudiante', cls: 'espada', evo: [],
    lvl: 1, xp: 0, st: { fue: 0, agi: 0, esp: 0, vit: 0 }, karma: { rect: 0, somb: 0, mist: 0 }, lazos: 0, amb: 0,
    flags: {}, pild: 2, node: 'p1', pending: null, lvlups: 0, done: false
  };
}
function store() { try { return window.localStorage; } catch (e) { return null; } }
function save() { const s = store(); if (s && S) try { s.setItem(SAVE_KEY, JSON.stringify(S)); } catch (e) { /* sin espacio */ } }
function load() {
  const s = store(); if (!s) return null;
  try { const d = JSON.parse(s.getItem(SAVE_KEY)); return d && STORY[d.node] && CLASES[d.cls] ? d : null; } catch (e) { return null; }
}

// ───────────── Personaje ─────────────
const curClass = () => (S.evo.length ? EVOS[S.evo[S.evo.length - 1]] : CLASES[S.cls]);
const xpNeed = () => 30 * S.lvl;
const reino = () => REINOS[Math.min(S.lvl, REINOS.length - 1)];
function derive() {
  const s = S.st, m = CLASES[S.cls].main;
  return {
    maxHp: Math.round(50 + s.vit * 9 + S.lvl * 8), maxQi: Math.round(20 + s.esp * 4 + S.lvl * 2),
    atk: 6 + s[m] * 1.5 + S.lvl * 1.5, def: 2 + s.vit * 0.6 + s.fue * 0.3,
    crit: Math.min(50, 5 + s.agi * 1.5), speed: Math.min(190, 112 + s.agi * 3.2),
    atkInt: Math.max(0.45, 0.95 - s.agi * 0.02), dashCd: Math.max(1, 2.3 - s.agi * 0.06)
  };
}
function mySkills() { return CLASES[S.cls].skills.concat(S.evo.map(id => EVOS[id].skill)); }
function auraColor() {
  const k = S.karma, top = Object.keys(k).sort((a, b) => k[b] - k[a])[0];
  return k[top] > 0 ? SENDAS[top].c : '#8a7a55';
}
const myPortrait = () => portraitSVG(S.look, { aura: auraColor(), tier: S.evo.length });

function gainXp(v) {
  S.xp += v;
  while (S.xp >= xpNeed()) {
    S.xp -= xpNeed(); S.lvl++; S.lvlups++;
    const g = CLASES[S.cls].grow; S.st[g[0]]++; if (S.lvl % 2 === 0) S.st[g[1]]++;
  }
}
/* Aplica los efectos de una decisión y devuelve las etiquetas de lo ganado. */
function applyEff(e) {
  e = val(e); const out = []; if (!e) return out;
  const sign = v => (v > 0 ? '+' + v : v);
  for (const k in SENDAS) if (e[k]) { S.karma[k] = Math.max(0, S.karma[k] + e[k]); out.push([sign(e[k]) + ' ' + SENDAS[k].n, SENDAS[k].c]); }
  for (const k in VIAS) if (e[k]) { S[k] = Math.max(0, S[k] + e[k]); out.push([sign(e[k]) + ' ' + VIAS[k].n, VIAS[k].c]); }
  if (e.st) for (const k in e.st) { S.st[k] += e.st[k]; out.push(['+' + e.st[k] + ' ' + STATS[k].n, '#ddd']); }
  if (e.pild) { S.pild += e.pild; out.push(['+' + e.pild + ' Píldora', '#9be0b0']); }
  if (e.xp) { gainXp(e.xp); out.push(['+' + e.xp + ' Exp', '#bbb']); }
  if (e.flag) {
    if (typeof e.flag === 'string') S.flags[e.flag] = 1;
    else Object.assign(S.flags, e.flag);
  }
  return out;
}
const chips = list => (list.length ? `<div class="chips">${list.map(g => `<span class="chip" style="--c:${g[1]}">${esc(g[0])}</span>`).join('')}</div>` : '');

// ───────────── Evoluciones ─────────────
function evoMeta(e) {
  if (e.tier === 1) {
    const v = S.karma[e.via];
    return { ok: v >= 4, score: v, color: SENDAS[e.via].c, tag: 'Senda de ' + SENDAS[e.via].n, req: `${SENDAS[e.via].n} 4 (tienes ${v})` };
  }
  const v = S[e.via], alt = e.alt && S.flags[e.alt];
  return {
    ok: v >= 5 || !!alt, score: v + (alt ? 100 : 0), color: VIAS[e.via].c, tag: 'Vía de ' + VIAS[e.via].n,
    req: `${VIAS[e.via].n} 5 (tienes ${v})` + (e.alt ? ` o ${ALT[e.alt]}` : '')
  };
}
/* Opciones desde la clase actual. Si ninguna cumple el requisito, se abre la más afín: siempre hay camino. */
function evoOptions(fromId) {
  const ops = Object.values(EVOS).filter(e => e.from === fromId).map(e => Object.assign({ e }, evoMeta(e)));
  if (ops.length && !ops.some(o => o.ok)) ops.slice().sort((a, b) => b.score - a.score)[0].ok = true;
  return ops;
}
const stLine = st => Object.keys(st).map(k => `+${st[k]} ${STATS[k].n}`).join(' · ');

// ───────────── Pantalla de título ─────────────
function showTitle() {
  screen = 'title'; closeModal();
  const sv = load();
  app.innerHTML = `<div class="title-screen">
    <div class="title-moon"></div>
    <div class="title-hanzi">破天經</div>
    <h1>Sutra del<br>Cielo Roto</h1>
    <p class="subtitle">Te invocaron a un mundo de magia, caballeros, orcos, elfos y sectas marciales. Cada decisión forja tu camino</p>
    <div class="title-btns">
      ${sv ? `<button class="btn primary" id="bCont">Continuar<small>${esc(sv.name)} · ${esc((sv.evo.length ? EVOS[sv.evo[sv.evo.length - 1]] : CLASES[sv.cls]).n)}</small></button>` : ''}
      <button class="btn ${sv ? '' : 'primary'}" id="bNew">Nueva partida</button>
    </div>
  </div>`;
  if (sv) document.getElementById('bCont').onclick = () => { S = sv; showNode(); };
  document.getElementById('bNew').onclick = () => {
    if (sv && !sv.done && !window.confirm('Ya hay una partida guardada. ¿Empezar de nuevo y sobrescribirla?')) return;
    S = newState(); showCreate(0);
  };
}

// ───────────── Creación de personaje ─────────────
const GENS = [['o', 'Él'], ['a', 'Ella'], ['e', 'Elle']];
function showCreate(step) {
  screen = 'create';
  const steps = ['Identidad', 'Apariencia', 'Tu vida anterior', 'Don de la invocación'];
  let body = '';
  if (step === 0) {
    body = `<label class="field">¿Cómo te llamas?<input id="iName" maxlength="16" placeholder="Tu nombre" value="${esc(S.name)}" autocomplete="off"></label>
      <div class="field">¿Cómo hablará de ti la historia?
        <div class="seg">${GENS.map(g => `<button class="seg-b ${S.gen === g[0] ? 'on' : ''}" data-gen="${g[0]}">${g[1]}</button>`).join('')}</div>
      </div>`;
  } else if (step === 1) {
    body = `<div class="look"><div class="look-portrait" id="pv">${portraitSVG(S.look)}</div><div class="look-opts">` +
      Object.keys(LOOK).map(k => {
        const o = LOOK[k];
        return `<div class="look-row"><span>${o.n}</span><div class="look-vals">` + (o.colors
          ? o.colors.map((c, i) => `<button class="sw ${S.look[k] === i ? 'on' : ''}" style="background:${c}" data-k="${k}" data-i="${i}" aria-label="${o.n} ${i + 1}"></button>`).join('')
          : o.ops.map((t, i) => `<button class="tag ${S.look[k] === i ? 'on' : ''}" data-k="${k}" data-i="${i}">${t}</button>`).join('')) + `</div></div>`;
      }).join('') + `</div></div>`;
  } else if (step === 2) {
    body = Object.keys(ORIGENES).map(k => {
      const o = ORIGENES[k];
      return `<button class="card ${S.origin === k ? 'on' : ''}" data-origin="${k}"><b>${o.n}</b><span>${o.d}</span><em>${stLine(o.st)}</em></button>`;
    }).join('');
  } else {
    body = Object.keys(CLASES).map(k => {
      const c = CLASES[k];
      return `<button class="card cls ${S.cls === k ? 'on' : ''}" data-cls="${k}"><i class="glyph">${c.glyph}</i><div><b>${c.n}</b><span>${c.d}</span>
        <em>${Object.keys(c.st).map(s => `${STATS[s].n.slice(0, 3)} ${c.st[s]}`).join(' · ')}</em>
        <em>${c.skills.map(s => s.n).join(' · ')}</em></div></button>`;
    }).join('') + `<p class="hint">Al cruzar entre mundos, algo despierta en ti. Cada don evoluciona dos veces, y a qué evolución llegues dependerá de tus decisiones.</p>`;
  }
  app.innerHTML = `<div class="create">
    <div class="steps">${steps.map((s, i) => `<span class="${i === step ? 'on' : i < step ? 'ok' : ''}">${i + 1}</span>`).join('')}</div>
    <h2>${steps[step]}</h2>
    <div class="create-body">${body}</div>
    <div class="nav"><button class="btn" id="bBack">${step ? 'Atrás' : 'Salir'}</button>
    <button class="btn primary" id="bNext">${step === 3 ? 'Comenzar la historia' : 'Siguiente'}</button></div></div>`;

  const grab = () => { const i = document.getElementById('iName'); if (i) S.name = i.value.replace(/[<>&{}]/g, '').trim(); };
  app.querySelectorAll('[data-gen]').forEach(b => b.onclick = () => { grab(); S.gen = b.dataset.gen; showCreate(step); });
  app.querySelectorAll('[data-k]').forEach(b => b.onclick = () => {
    S.look[b.dataset.k] = +b.dataset.i;
    document.getElementById('pv').innerHTML = portraitSVG(S.look);
    b.parentNode.querySelectorAll('.on').forEach(x => x.classList.remove('on')); b.classList.add('on');
  });
  app.querySelectorAll('[data-origin]').forEach(b => b.onclick = () => { S.origin = b.dataset.origin; showCreate(step); });
  app.querySelectorAll('[data-cls]').forEach(b => b.onclick = () => { S.cls = b.dataset.cls; showCreate(step); });
  document.getElementById('bBack').onclick = () => { grab(); step ? showCreate(step - 1) : showTitle(); };
  document.getElementById('bNext').onclick = () => {
    grab();
    if (step === 0 && !S.name) { toast([['Escribe un nombre', '#e8c66a']]); return; }
    if (step < 3) return showCreate(step + 1);
    const c = CLASES[S.cls], o = ORIGENES[S.origin];
    for (const k in S.st) S.st[k] = c.st[k] + (o.st[k] || 0);
    applyEff(o.eff); save(); showNode();
  };
  window.scrollTo(0, 0);
}

// ───────────── Narración ─────────────
function hud() {
  const d = derive(), c = curClass();
  return `<header class="hud"><button class="hud-p" id="bSheet" aria-label="Ver personaje">${myPortrait()}</button>
    <div class="hud-i"><b>${esc(S.name)}</b><span>${c.n}</span><span class="dim">Nv ${S.lvl} · ${reino()}</span>
    <div class="bar xp"><i style="width:${Math.min(100, S.xp / xpNeed() * 100)}%"></i></div></div>
    <div class="hud-r"><span>❤ ${d.maxHp}</span><span>☯ ${d.maxQi}</span><span>◈ ${S.pild}</span></div></header>`;
}
function banner(n) {
  const a = ARTE[n.art] || ARTE.camino;
  return `<div class="banner" style="--a:${a[1]};--b:${a[2]}"><span class="banner-g">${a[0]}</span><small>${n.ch}</small><h2>${n.title}</h2></div>`;
}
function frame(n, inner) {
  screen = 'game';
  app.innerHTML = `<div class="game">${hud()}${banner(n)}<main class="story">${inner}</main></div>`;
  document.getElementById('bSheet').onclick = showSheet;
  window.scrollTo(0, 0);
}
function goNode(id) { S.node = val(id); S.pending = null; save(); showNode(); }

function showNode() {
  const n = STORY[S.node];
  if (S.lvlups > 0) return showLevelUp(n);
  if (S.pending) {
    frame(n, `<div class="text">${para(S.pending.t)}</div>${chips(S.pending.g)}<div class="choices"><button class="btn primary" id="bGo">Continuar</button></div>`);
    document.getElementById('bGo').onclick = () => { S.pending = null; save(); showNode(); };
    return;
  }
  const text = `<div class="text">${para(val(n.text))}</div>`;
  if (n.fight) {
    frame(n, text + `<div class="choices"><button class="btn danger" id="bGo">⚔ Combatir</button></div>`);
    document.getElementById('bGo').onclick = Fight.start;
  } else if (n.evolve) {
    frame(n, text + `<div class="choices"><button class="btn primary" id="bGo">Contemplar tu núcleo</button></div>`);
    document.getElementById('bGo').onclick = () => showEvolve(n);
  } else if (n.ending) {
    S.done = true; save(); showEnding(n);
  } else {
    frame(n, text + `<div class="choices">` + n.choices.map((c, i) => {
      const ok = !c.req || c.req();
      return `<button class="btn choice" data-i="${i}" ${ok ? '' : 'disabled'}>${fmt(c.t)}${c.req ? `<small>${ok ? '✦ ' : '🔒 '}${c.reqT}</small>` : ''}</button>`;
    }).join('') + `</div>`);
    app.querySelectorAll('.choice').forEach(b => b.onclick = () => choose(n.choices[+b.dataset.i]));
  }
}
function choose(c) {
  const gains = applyEff(c.eff), res = val(c.res);
  S.node = val(c.go);
  S.pending = res ? { t: res, g: gains } : null;
  if (!res && gains.length) toast(gains);
  save(); showNode();
}

function showLevelUp(n) {
  frame(n, `<div class="levelup"><h3>¡Avance de cultivo!</h3><p>Alcanzas el nivel <b>${S.lvl - S.lvlups + 1}</b>. Tu cuerpo y tu qi se fortalecen. Elige en qué centrar este avance:</p>
    <div class="choices">${Object.keys(STATS).map(k => `<button class="btn choice" data-s="${k}">+2 ${STATS[k].n} <small>${STATS[k].d} (actual: ${S.st[k]})</small></button>`).join('')}</div></div>`);
  app.querySelectorAll('[data-s]').forEach(b => b.onclick = () => { S.st[b.dataset.s] += 2; S.lvlups--; save(); showNode(); });
}

function showEvolve(n) {
  const from = S.evo.length ? S.evo[S.evo.length - 1] : S.cls;
  const ops = evoOptions(from);
  frame(n, `<p class="hint">Tus decisiones han abierto unos caminos y cerrado otros.</p>` + ops.map(o => {
    const e = o.e;
    return `<div class="evo ${o.ok ? '' : 'locked'}" style="--c:${o.color}"><div class="evo-h"><b>${e.n}</b><span>${o.tag}</span></div>
      <p>${e.d}</p><em>${stLine(e.st)}</em><em>Nueva técnica: <b>${e.skill.n}</b> — ${e.skill.d}</em>
      ${o.ok ? `<button class="btn primary" data-evo="${e.id}">Seguir este camino</button>` : `<div class="lock">🔒 Requiere ${o.req}</div>`}</div>`;
  }).join(''));
  app.querySelectorAll('[data-evo]').forEach(b => b.onclick = () => {
    const e = EVOS[b.dataset.evo];
    S.evo.push(e.id); for (const k in e.st) S.st[k] += e.st[k];
    toast([['Evolución: ' + e.n, evoMeta(e).color]]);
    goNode(n.next);
  });
}

function showEnding(n) {
  const k = S.karma, top = Object.keys(k).sort((a, b) => k[b] - k[a])[0];
  const cs = comps();
  frame(n, `<div class="text">${para(val(n.text))}</div>
    <div class="ending"><div class="ending-p">${myPortrait()}</div><h3>${esc(S.name)}</h3>
    <p>${CLASES[S.cls].n}${S.evo.map(id => ' → ' + EVOS[id].n).join('')}</p>
    <p>Senda dominante: <b style="color:${SENDAS[top].c}">${SENDAS[top].n}</b> · Nivel ${S.lvl}</p>
    <p>${cs.length ? 'Caminaron contigo: ' + lista(cs) : 'Recorriste el camino en soledad'}</p>
    <p class="hint">Hay cinco finales, quince evoluciones intermedias y treinta formas definitivas. Otras decisiones llevan a otros destinos.</p></div>
    <div class="choices"><button class="btn primary" id="bGo">Volver al título</button></div>`);
  document.getElementById('bGo').onclick = showTitle;
}

// ───────────── Ficha de personaje ─────────────
function meter(label, v, color, max) {
  return `<div class="meter"><span>${label}</span><div class="bar"><i style="width:${Math.min(100, v / max * 100)}%;background:${color}"></i></div><b>${v}</b></div>`;
}
function showSheet() {
  const d = derive(), cs = comps();
  const from = S.evo.length ? S.evo[S.evo.length - 1] : S.cls;
  const next = S.evo.length < 2 ? evoOptions(from) : [];
  modal.innerHTML = `<div class="sheet"><button class="x" id="bX" aria-label="Cerrar">✕</button>
    <div class="sheet-top"><div class="sheet-p">${myPortrait()}</div><div><h3>${esc(S.name)}</h3><p>${curClass().n}</p>
      <p class="dim">Nivel ${S.lvl} · ${reino()}</p><p class="dim">${ORIGENES[S.origin].n}</p></div></div>
    <h4>Atributos</h4>
    <div class="grid2">${Object.keys(STATS).map(k => `<span>${STATS[k].n} <b>${S.st[k]}</b></span>`).join('')}
      <span>Vida <b>${d.maxHp}</b></span><span>Qi <b>${d.maxQi}</b></span><span>Ataque <b>${Math.round(d.atk)}</b></span><span>Defensa <b>${Math.round(d.def)}</b></span>
      <span>Crítico <b>${Math.round(d.crit)}%</b></span><span>Velocidad <b>${Math.round(d.speed)}</b></span></div>
    <h4>Tus decisiones</h4>
    ${Object.keys(SENDAS).map(k => meter(SENDAS[k].n, S.karma[k], SENDAS[k].c, 12)).join('')}
    ${Object.keys(VIAS).map(k => meter(VIAS[k].n, S[k], VIAS[k].c, 12)).join('')}
    <h4>Camino de evolución</h4>
    <p class="path">${CLASES[S.cls].n}${S.evo.map(id => ' → ' + EVOS[id].n).join('')}${S.evo.length < 2 ? ' → ?' : ''}</p>
    ${next.map(o => `<div class="nextevo" style="--c:${o.color}"><b>${o.e.n}</b><span>${o.ok ? '✦ Camino abierto' : '🔒 ' + o.req}</span></div>`).join('')}
    <h4>Técnicas</h4>
    ${mySkills().map(s => `<div class="skl"><b>${s.n}</b> <span class="dim">${s.c} Qi</span><br><span>${s.d}</span></div>`).join('')}
    <h4>Compañeros</h4><p>${cs.length ? lista(cs) : 'Nadie camina a tu lado… todavía.'}</p>
    <button class="btn" id="bTitle">Guardar y volver al título</button></div>`;
  modal.hidden = false;
  document.getElementById('bX').onclick = closeModal;
  document.getElementById('bTitle').onclick = () => { save(); showTitle(); };
  modal.onclick = e => { if (e.target === modal) closeModal(); };
}
function closeModal() { modal.hidden = true; modal.innerHTML = ''; }

let toastT = 0;
function toast(list) {
  toastEl.innerHTML = list.map(g => `<span class="chip" style="--c:${g[1]}">${esc(g[0])}</span>`).join('');
  toastEl.hidden = false; clearTimeout(toastT); toastT = setTimeout(() => { toastEl.hidden = true; }, 2600);
}

// ───────────── Botón «atrás» de Android ─────────────
window.gameBack = function () {
  if (!modal.hidden) { closeModal(); return true; }
  if (screen === 'game') { save(); showTitle(); return true; }
  if (screen === 'create') { showTitle(); return true; }
  return screen === 'fight'; // en combate, «atrás» no hace nada
};

showTitle();
