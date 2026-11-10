/* Prueba automática: juega partidas completas en Chromium (Playwright) con decisiones aleatorias.
   Uso: node tools/autoplay.js [partidas] [--shots carpeta]
   Comprueba que ninguna rama se rompe, y resume finales, evoluciones y reintentos por combate. */
const { chromium } = require('playwright');
const path = require('path');

const RUNS = parseInt(process.argv[2] || '40', 10);
const si = process.argv.indexOf('--shots');
const SHOTS = si > 0 ? process.argv[si + 1] : null;
const URL = 'file://' + path.resolve(__dirname, '../app/src/main/assets/index.html');
const pick = a => a[Math.floor(Math.random() * a.length)];

(async () => {
  const browser = await chromium.launch();
  const stats = { endings: {}, evos: {}, retries: {}, levels: [], errors: [] };

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
    await page.locator('[data-origin]').nth(Math.floor(Math.random() * 3)).click();
    await page.click('#bNext');
    await page.locator('[data-cls]').nth(r % 5).click();
    await shot('03-clase');
    await page.click('#bNext');

    let seen = {}, fightNode = null, steps = 0, ending = null;
    while (steps++ < 3000) {
      const st = await page.evaluate(() => ({
        screen, node: S.node, over: C && C.over, ending: !!STORY[S.node].ending && !S.pending && !S.lvlups,
        charge: !!(C && C.e.charge), hp: C ? C.p.hp / derive().maxHp : 1
      }));
      if (st.screen === 'fight') {
        if (!seen.fight) { seen.fight = 1; await shot('05-combate'); }
        if (st.over) {
          if (st.over === 'lose') stats.retries[fightNode] = (stats.retries[fightNode] || 0) + 1;
          await page.click('#bEnd');
          continue;
        }
        fightNode = st.node;
        // Política sencilla: píldora si queda poca vida, meditar ante un golpe cargado, si no una técnica al azar.
        const acts = await page.evaluate(() => actions().map((a, i) => ({ i, kind: a.kind, ok: !a.off && a.c <= C.p.qi })).filter(a => a.ok));
        let a;
        if (st.hp < 0.35 && acts.find(x => x.kind === 'pill')) a = acts.find(x => x.kind === 'pill');
        else if (st.charge && Math.random() < 0.7) a = acts.find(x => x.kind === 'med');
        else a = pick(acts.filter(x => x.kind === 'skill').concat(acts.filter(x => x.kind === 'atk')));
        await page.click(`[data-a="${a.i}"]`);
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
  console.log('Derrotas por combate:', stats.retries);
  console.log(stats.errors.length ? 'ERRORES:\n' + stats.errors.join('\n') : 'Sin errores.');
  process.exit(stats.errors.length ? 1 : 0);
})();
