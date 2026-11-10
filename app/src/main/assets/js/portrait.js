/* Retrato del personaje dibujado en SVG a partir de sus opciones de apariencia. */
'use strict';

const LOOK = {
  rostro: { n: 'Rostro', ops: ['Ovalado', 'Anguloso', 'Redondo'] },
  piel: { n: 'Piel', colors: ['#f6dcc4', '#e9be9a', '#c98e62', '#8d5a3b', '#5a3826', '#cfd8e6'] },
  pelo: { n: 'Peinado', ops: ['Corto', 'Melena suelta', 'Moño marcial', 'Coleta alta', 'Trenzas', 'Rapado'] },
  peloC: { n: 'Color de pelo', colors: ['#15131a', '#4a2f1d', '#8a8f9c', '#e9e6df', '#a3262f', '#2f4f8f', '#3c7a5a'] },
  ojos: { n: 'Ojos', colors: ['#3b2a1a', '#1c1c22', '#3f7fc4', '#3f9a62', '#c9a227', '#b0303c', '#8a5fd0'] },
  orejas: { n: 'Linaje', ops: ['Humano', 'Sangre élfica', 'Sangre de bestia'] },
  tunica: { n: 'Túnica', colors: ['#e9e6df', '#23202b', '#8e2330', '#274b7a', '#2f6b4f', '#6a3d8a', '#b8862d'] },
  extra: { n: 'Detalle', ops: ['Ninguno', 'Cinta en la frente', 'Cicatriz', 'Velo de sombra', 'Marca del loto', 'Pendiente de jade'] }
};
const LOOK_DEFAULT = { rostro: 0, piel: 1, pelo: 2, peloC: 0, ojos: 0, orejas: 0, tunica: 3, extra: 0 };

function shade(hex, f) {
  const n = parseInt(hex.slice(1), 16);
  const ch = s => Math.max(0, Math.min(255, Math.round(((n >> s) & 255) * f)));
  return '#' + [16, 8, 0].map(s => ch(s).toString(16).padStart(2, '0')).join('');
}

function portraitSVG(look, opt) {
  opt = opt || {};
  const L = Object.assign({}, LOOK_DEFAULT, look);
  const skin = LOOK.piel.colors[L.piel], skinD = shade(skin, 0.82);
  const hair = LOOK.peloC.colors[L.peloC], hairD = shade(hair, 0.7);
  const eye = LOOK.ojos.colors[L.ojos];
  const robe = LOOK.tunica.colors[L.tunica], robeD = shade(robe, 0.65), trim = shade(robe, 1.35);
  const aura = opt.aura || '#8a7a55';
  const tier = opt.tier || 0;
  const uid = 'p' + Math.random().toString(36).slice(2, 8);

  const face = [
    'M62 98 Q62 58 100 58 Q138 58 138 98 Q138 132 118 148 Q100 160 82 148 Q62 132 62 98Z',
    'M63 96 Q63 58 100 58 Q137 58 137 96 Q136 124 120 142 L100 158 L80 142 Q64 124 63 96Z',
    'M60 100 Q60 58 100 58 Q140 58 140 100 Q140 136 118 150 Q100 158 82 150 Q60 136 60 100Z'
  ][L.rostro];

  let back = '', front = '', ears = '';
  const cap = `<path d="M58 104 Q52 50 100 46 Q148 50 142 104 Q136 76 116 70 Q100 82 78 72 Q64 80 58 104Z" fill="${hair}"/>`;
  const sheen = `<path d="M76 62 Q96 50 122 60" stroke="${shade(hair, 1.6)}" stroke-width="2" fill="none" opacity=".35"/>`;
  switch (L.pelo) {
    case 0: front = cap + sheen; break;
    case 1:
      back = `<path d="M56 100 Q46 52 100 44 Q154 52 144 100 L154 206 Q126 192 100 196 Q74 192 46 206Z" fill="${hairD}"/>`;
      front = cap + sheen; break;
    case 2:
      back = `<circle cx="100" cy="36" r="15" fill="${hair}"/><rect x="76" y="33" width="48" height="3.5" rx="1.5" fill="#e8c66a"/>`;
      front = cap + sheen; break;
    case 3:
      back = `<path d="M118 44 Q168 40 166 110 Q164 160 150 188 Q152 140 140 104 Q138 70 118 44Z" fill="${hairD}"/><circle cx="122" cy="46" r="9" fill="${hair}"/>`;
      front = cap + sheen; break;
    case 4: {
      let br = '';
      for (let i = 0; i < 6; i++) {
        br += `<ellipse cx="${55 - i * 0.5}" cy="${112 + i * 15}" rx="7.5" ry="9" fill="${i % 2 ? hair : hairD}"/>`;
        br += `<ellipse cx="${145 + i * 0.5}" cy="${112 + i * 15}" rx="7.5" ry="9" fill="${i % 2 ? hair : hairD}"/>`;
      }
      front = cap + sheen + br + `<circle cx="54" cy="203" r="4" fill="#e8c66a"/><circle cx="146" cy="203" r="4" fill="#e8c66a"/>`;
      break;
    }
    case 5:
      front = `<path d="M63 92 Q62 58 100 58 Q138 58 137 92 Q130 66 100 64 Q70 66 63 92Z" fill="${hair}" opacity=".28"/>`; break;
  }

  if (L.orejas === 1) {
    ears = `<path d="M64 98 L40 78 L62 116Z" fill="${skin}" stroke="${skinD}" stroke-width="1"/><path d="M136 98 L160 78 L138 116Z" fill="${skin}" stroke="${skinD}" stroke-width="1"/>`;
  } else if (L.orejas === 2) {
    ears = `<path d="M66 62 L60 26 L90 50Z" fill="${hair}"/><path d="M70 56 L66 36 L84 50Z" fill="${skinD}"/>` +
      `<path d="M134 62 L140 26 L110 50Z" fill="${hair}"/><path d="M130 56 L134 36 L116 50Z" fill="${skinD}"/>`;
  } else {
    ears = `<ellipse cx="62" cy="106" rx="6" ry="10" fill="${skin}"/><ellipse cx="138" cy="106" rx="6" ry="10" fill="${skin}"/>`;
  }
  const earsBehind = L.orejas !== 2 ? ears : '';
  const earsFront = L.orejas === 2 ? ears : '';

  let extra = '';
  switch (L.extra) {
    case 1: extra = `<path d="M60 82 Q100 70 140 82 L140 90 Q100 78 60 90Z" fill="#b0303c"/><path d="M138 84 L162 96 L158 102 L138 90Z" fill="#8e2330"/>`; break;
    case 2: extra = `<path d="M112 90 L124 126" stroke="#9c4a4a" stroke-width="2.5" stroke-linecap="round"/><path d="M112 100 l8 -3 M115 110 l8 -3" stroke="#9c4a4a" stroke-width="1.5"/>`; break;
    case 3: extra = `<path d="M63 114 Q100 106 137 114 Q136 136 118 150 Q100 160 82 150 Q64 136 63 114Z" fill="#16131d" opacity=".93"/>`; break;
    case 4: extra = `<path d="M100 72 q-5 7 0 13 q5 -6 0 -13Z M92 80 q8 0 8 6 q-7 1 -8 -6Z M108 80 q-8 0 -8 6 q7 1 8 -6Z" fill="#c8323f"/>`; break;
    case 5: extra = `<line x1="62" y1="114" x2="62" y2="124" stroke="#e8c66a" stroke-width="1.5"/><circle cx="62" cy="128" r="4.5" fill="#3fae7c" stroke="#e8c66a" stroke-width="1"/>`; break;
  }

  let rings = '';
  for (let i = 0; i < tier; i++) {
    rings += `<circle cx="100" cy="112" r="${90 - i * 9}" fill="none" stroke="${aura}" stroke-width="1.5" opacity="${0.75 - i * 0.2}" stroke-dasharray="${i ? '3 7' : '14 6'}"/>`;
  }

  return `<svg viewBox="0 0 200 240" xmlns="http://www.w3.org/2000/svg" class="portrait" role="img" aria-label="Retrato del personaje">
<defs>
  <radialGradient id="${uid}a" cx="50%" cy="45%" r="60%"><stop offset="0" stop-color="${aura}" stop-opacity="${0.55 + tier * 0.15}"/><stop offset="1" stop-color="${aura}" stop-opacity="0"/></radialGradient>
  <clipPath id="${uid}c"><rect width="200" height="240" rx="14"/></clipPath>
</defs>
<g clip-path="url(#${uid}c)">
<rect width="200" height="240" fill="#14111c"/>
<rect width="200" height="240" fill="url(#${uid}a)"/>
${rings}
${back}
<path d="M18 240 Q22 178 78 168 L100 176 L122 168 Q178 178 182 240Z" fill="${robe}"/>
<path d="M18 240 Q22 200 44 184 L52 240Z" fill="${robeD}" opacity=".55"/><path d="M182 240 Q178 200 156 184 L148 240Z" fill="${robeD}" opacity=".55"/>
<rect x="87" y="140" width="26" height="34" fill="${skinD}"/>
<path d="M76 167 L100 214 L124 167 L114 164 L100 192 L86 164Z" fill="${trim}"/>
<path d="M86 164 L100 192 L114 164 L100 172Z" fill="${skin}"/>
${earsBehind}
<path d="${face}" fill="${skin}"/>
<path d="M72 96 q11 -7 22 -1" stroke="${hairD}" stroke-width="3" fill="none" stroke-linecap="round"/>
<path d="M106 95 q11 -6 22 1" stroke="${hairD}" stroke-width="3" fill="none" stroke-linecap="round"/>
<path d="M72 108 q11 -9 22 0 q-11 6 -22 0Z" fill="#fbfaf6"/><path d="M106 108 q11 -9 22 0 q-11 6 -22 0Z" fill="#fbfaf6"/>
<circle cx="83" cy="107" r="4.6" fill="${eye}"/><circle cx="117" cy="107" r="4.6" fill="${eye}"/>
<circle cx="83" cy="107" r="2" fill="#0b0a10"/><circle cx="117" cy="107" r="2" fill="#0b0a10"/>
<circle cx="84.5" cy="105.5" r="1" fill="#fff"/><circle cx="118.5" cy="105.5" r="1" fill="#fff"/>
<path d="M72 108 q11 -9 22 0" stroke="#1a1418" stroke-width="1.6" fill="none"/><path d="M106 108 q11 -9 22 0" stroke="#1a1418" stroke-width="1.6" fill="none"/>
<path d="M100 112 q-4 12 1 16" stroke="${skinD}" stroke-width="1.8" fill="none" stroke-linecap="round"/>
<path d="M90 138 q10 5 20 0" stroke="${shade(skin, 0.6)}" stroke-width="2.2" fill="none" stroke-linecap="round"/>
${front}
${earsFront}
${extra}
</g></svg>`;
}
