/* Prueba automática: juega partidas completas en Chromium (Playwright) con decisiones aleatorias.
   Uso: node tools/autoplay.js [partidas] [--shots carpeta] [--skill 0..1]
   Comprueba que ninguna rama se rompe, y resume finales, evoluciones y reintentos por combate. */
const { chromium } = require('playwright');
const path = require('path');

const RUNS = parseInt(process.argv[2] || '40', 10);
const si = process.argv.indexOf('--shots');
const SHOTS = si > 0 ? process.argv[si + 1] : null;
const URL = 'file://' + path.resolve(__dirname, '../app/src/main/assets/index.html');
const pick = a => a[Math.floor(Math.random() * a.length)];
const ki = process.argv.indexOf('--skill');
const SKILL = ki > 0 ? parseFloat(process.argv[ki + 1]) : 0.6;

(async () => {
  const browser = await chromium.launch();
  const stats = { endings: {}, evos: {}, fights: {}, levels: [], errors: [] };

  // Validación estática del grafo de la historia.
  {
    const page = await browser.newPage();
    await page.goto(URL);
    const bad = await page.evaluate(() => {
      const out = [];
      S = newState(); S.name = 'x';
      for (const id in STORY) {
        const n = STORY[id];
        if (!ARTE[n.art]) out.push(id + ': arte ' + n.art);
        if (n.fight && !ENEMIGOS[n.fight]) out.push(id + ': enemigo ' + n.fight);
        if (!n.fight && !n.evolve && !n.ending && !(n.choices && n.choices.length)) out.push(id + ': sin salida');
        const tg = [];
        if (n.next) tg.push(n.next);
        (n.choices || []).forEach(c => tg.push(c.go));
        tg.forEach(t => { if (typeof t === 'string' && !STORY[t]) out.push(id + ' -> ' + t); });
      }
      for (const k in CLASES) {
        const t1 = Object.values(EVOS).filter(e => e.from === k);
        if (t1.length !== 3) out.push(k + ': evoluciones ' + t1.length);
        t1.forEach(e => { if (Object.values(EVOS).filter(x => x.from === e.id).length !== 2) out.push(e.id + ': finales'); });
      }
      return out;
    });
    if (bad.length) { console.log('GRAFO ROTO:\n' + bad.join('\n')); process.exit(1); }
    await page.close();
  }

  for (let r = 0; r < RUNS; r++) {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 800 }, deviceScaleFactor: SHOTS ? 2 : 1 });
    const page = await ctx.newPage();
    const shot = async name => { if (SHOTS && r === 0) await page.screenshot({ path: path.join(SHOTS, name + '.png'), fullPage: true }); };
    page.on('pageerror', e => stats.errors.push(`run ${r}: ${e.message}`));
    page.on('dialog', d => d.accept());
    await page.goto(URL);
    await shot('01-titulo');
    await page.click('#bNew');
    await page.fill('#iName', 'Ren');
    await page.click(pick(['[data-gen=o]', '[data-gen=a]', '[data-gen=e]']));
    await page.click('#bNext');
    for (const k of ['rostro', 'piel', 'pelo', 'peloC', 'ojos', 'orejas', 'tunica', 'extra']) {
      const n = await page.locator(`[data-k=${k}]`).count();
      await page.click(`[data-k=${k}][data-i="${Math.floor(Math.random() * n)}"]`);
    }
    await shot('02-apariencia');
    await page.click('#bNext');
    await page.locator('[data-origin]').nth(Math.floor(Math.random() * 4)).click();
    await page.click('#bNext');
    await page.locator('[data-cls]').nth(r % 5).click();
    await shot('03-clase');
    await page.click('#bNext');

    let seen = {}, steps = 0, ending = null;
    while (steps++ < 3000) {
      const st = await page.evaluate(() => ({
        screen, node: S.node, ending: !!STORY[S.node].ending && !S.pending && !S.lvlups
      }));
      if (st.screen === 'fight') {
        if (await page.locator('#bEnd').count()) { await page.click('#bEnd'); continue; }   // ayuda inicial, victoria o derrota
        if (!seen.fight) { seen.fight = 1; await page.waitForTimeout(2600); await shot('05-combate'); }
        // Simula el combate a cámara rápida con un jugador artificial de habilidad SKILL (0 = no esquiva nada).
        // Tras 4 derrotas seguidas en el mismo combate, se da por perdido y se salta para medir los siguientes.
        const res = await page.evaluate(([SKILL, skip]) => {
          const F = Fight.state, { W, H } = Fight.size; F.manual = true; if (skip) F.e.hp = 1;
          let react = null, t = 0;
          while (!F.over && t < 400) {
            const p = F.p, e = F.e, dx = e.x - p.x, dy = e.y - p.y, dd = Math.hypot(dx, dy) || 1;
            const danger = F.tele.find(Fight.inside);
            let mx = 0, my = 0;
            if (danger && react !== danger) { if (!danger.seen) { danger.seen = 1; danger.dodge = Math.random() < SKILL; } react = danger; }
            if (danger && danger.dodge && danger.t > 0.2) {
              if (danger.k === 'c') { const ax = p.x - danger.x, ay = p.y - danger.y, l = Math.hypot(ax, ay) || 1; mx = ax / l; my = ay / l; if (l < 4) { mx = p.x < W / 2 ? 1 : -1; my = 0; } }
              else { const lx = danger.x2 - danger.x, ly = danger.y2 - danger.y, l = Math.hypot(lx, ly) || 1; const side = ((p.x - danger.x) * ly - (p.y - danger.y) * lx) > 0 ? 1 : -1; mx = ly / l * side; my = -lx / l * side; }
              F.in.mx = mx; F.in.my = my;
              if (danger.dur - danger.t < 0.3) Fight.dash();
            } else {
              const want = F.ranged ? 150 : 0;
              if (dd > F.range + p.r + e.r - 4) { mx = dx / dd; my = dy / dd; } else if (F.ranged && dd < want) { mx = -dx / dd; my = -dy / dd; }
              F.in.mx = mx; F.in.my = my;
              if (Math.random() < 0.05) Fight.use(Math.floor(Math.random() * p.cds.length));
              if (p.hp < F.d.maxHp * 0.4) Fight.pill();
            }
            Fight.step(1 / 30); t += 1 / 30;
          }
          return { over: F.over, t, node: F.node.fight, hp: F.p.hp / F.d.maxHp };
        }, [SKILL, (seen['l' + st.node] || 0) >= 4]);
        if (res.over === 'lose') seen['l' + st.node] = (seen['l' + st.node] || 0) + 1;
        if (!res.over) { stats.errors.push(`run ${r}: combate sin fin en ${st.node}`); break; }
        const k = res.node; stats.fights[k] = stats.fights[k] || { n: 0, lose: 0, t: 0, hp: 0 };
        stats.fights[k].n++; if (res.over === 'lose') stats.fights[k].lose++; else if (res.t > 1) { stats.fights[k].t += res.t; stats.fights[k].hp += res.hp; }
        continue;
      }
      if (st.ending) {
        ending = st.node; await shot('08-final');
        const info = await page.evaluate(() => ({ evo: S.evo, lvl: S.lvl }));
        stats.endings[ending] = (stats.endings[ending] || 0) + 1;
        info.evo.forEach(e => { stats.evos[e] = (stats.evos[e] || 0) + 1; });
        stats.levels.push(info.lvl);
        // Volver al título debe ofrecer «Continuar» con la partida terminada.
        await page.click('#bGo');
        break;
      }
      if (await page.locator('[data-evo]').count()) {
        if (!seen['evo' + st.node]) { seen['evo' + st.node] = 1; await shot('06-evolucion-' + st.node); }
        const b = page.locator('[data-evo]'); await b.nth(Math.floor(Math.random() * await b.count())).click(); continue;
      }
      if (await page.locator('[data-s]').count()) { await page.locator('[data-s]').nth(Math.floor(Math.random() * 4)).click(); continue; }
      if (!seen.story && st.node === 'p2') { seen.story = 1; await shot('04-historia'); }
      if (!seen.sheet && st.node === 'c3_1') {
        seen.sheet = 1; await page.click('#bSheet'); await shot('07-ficha');
        if (!(await page.evaluate(() => window.gameBack()))) stats.errors.push('gameBack no cerró la ficha');
      }
      const b = page.locator('.story .btn:not([disabled])');
      const n = await b.count();
      if (!n) { stats.errors.push(`run ${r}: sin botones en ${st.node}`); break; }
      await b.nth(Math.floor(Math.random() * n)).click();
    }
    if (!ending) stats.errors.push(`run ${r}: no llegó a un final (nodo ${await page.evaluate(() => S.node)})`);
    await ctx.close();
  }
  await browser.close();
  const avg = stats.levels.reduce((a, b) => a + b, 0) / (stats.levels.length || 1);
  console.log('Partidas:', RUNS, '| nivel final medio:', avg.toFixed(1));
  console.log('Finales:', stats.endings);
  console.log('Evoluciones distintas alcanzadas:', Object.keys(stats.evos).length, 'de 45');
  console.log('Combates (habilidad ' + SKILL + '): derrotas/total · duración media · vida restante');
  for (const k in stats.fights) { const f = stats.fights[k], w = Math.max(1, f.n - f.lose - Math.floor(f.lose / 4)); console.log(`  ${k.padEnd(14)} ${f.lose}/${f.n} · ${(f.t / w).toFixed(0)} s · ${(f.hp / w * 100).toFixed(0)} %`); }
  console.log(stats.errors.length ? 'ERRORES:\n' + stats.errors.join('\n') : 'Sin errores.');
  process.exit(stats.errors.length ? 1 : 0);
})();
