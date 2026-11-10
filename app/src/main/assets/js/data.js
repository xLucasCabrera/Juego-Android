/* Datos del juego: sendas, orígenes, clases, evoluciones y enemigos. */
'use strict';

const SENDAS = {
  rect: { n: 'Rectitud', c: '#e8c66a', d: 'Honor, protección y palabra dada. La senda de las sectas ortodoxas.' },
  somb: { n: 'Sombra', c: '#d2384e', d: 'El fin justifica el filo. La senda de las artes demoníacas.' },
  mist: { n: 'Misterio', c: '#7fa8ff', d: 'Comprender antes que golpear. La senda de lo arcano.' }
};
const VIAS = {
  lazos: { n: 'Lazos', c: '#6fd0a0', d: 'La fuerza que nace de quienes caminan contigo.' },
  amb: { n: 'Ambición', c: '#c98bff', d: 'La fuerza que nace de no aceptar ningún techo.' }
};
const STATS = {
  fue: { n: 'Fuerza', d: 'Daño de armas y puños; algo de defensa.' },
  agi: { n: 'Agilidad', d: 'Golpes críticos y esquiva.' },
  esp: { n: 'Espíritu', d: 'Reserva de Qi y poder de las artes elementales.' },
  vit: { n: 'Vitalidad', d: 'Vida y defensa.' }
};
const REINOS = ['Mortal', 'Templado del Cuerpo', 'Reunión de Qi', 'Apertura de Meridianos', 'Cimiento Espiritual',
  'Núcleo Dorado', 'Núcleo Dorado Tardío', 'Alma Naciente', 'Alma Naciente Tardía', 'Unidad con el Cielo', 'Trascendencia'];

const ORIGENES = {
  huerfano: {
    n: 'Hija o hijo de la frontera', st: { vit: 2, agi: 1 },
    d: 'Creciste sin apellido en Vado de la Niebla, cargando agua y esquivando golpes. Nadie te regaló nada.',
    eff: { lazos: 1 }
  },
  clan: {
    n: 'Sangre de un clan caído', st: { fue: 2, vit: 1 },
    d: 'El clan Baek-ri ardió cuando eras pequeño. Solo te queda un sello roto y un nombre que no debes decir.',
    eff: { amb: 1 }
  },
  torre: {
    n: 'Aprendiz fugitivo de la Torre', st: { esp: 2, agi: 1 },
    d: 'Huiste de la Torre de Marfil con las manos manchadas de tinta y demasiadas preguntas sin respuesta.',
    eff: { mist: 1 }
  }
};

/* Habilidad: n nombre, c coste de Qi, d descripción y efectos:
   pow (multiplicador), hits, dot{p,t}, stun (prob.), weak (turnos), heal/shield (% vida máx.),
   buff{a,t}, drain (% del daño), pierce, crit (+%), evade (turnos), exec (remata por debajo del 40%). */
const sk = (n, c, d, fx) => Object.assign({ n, c, d }, fx);

const CLASES = {
  espada: {
    n: 'Espada Errante', glyph: '劍', main: 'fue', st: { fue: 6, agi: 6, esp: 3, vit: 5 }, grow: ['fue', 'agi'],
    d: 'Una hoja, un camino. Equilibrio entre ataque y defensa, con golpes limpios y precisos.',
    skills: [
      sk('Corte Creciente', 6, 'Un tajo ascendente cargado de qi.', { pow: 1.6 }),
      sk('Guardia del Sauce', 5, 'Te doblas sin romperte: escudo del 25% de tu vida.', { shield: 0.25 })
    ]
  },
  puno: {
    n: 'Puño de Hierro', glyph: '拳', main: 'fue', st: { fue: 7, agi: 3, esp: 3, vit: 7 }, grow: ['fue', 'vit'],
    d: 'Tu cuerpo es el arma y el templo. Aguantas lo que otros no pueden y devuelves el doble.',
    skills: [
      sk('Puño Rompe-Rocas', 6, 'Un golpe seco que puede aturdir.', { pow: 1.5, stun: 0.25 }),
      sk('Respiración de la Montaña', 6, 'Recuperas el 25% de tu vida.', { heal: 0.25 })
    ]
  },
  voz: {
    n: 'Voz de los Elementos', glyph: '術', main: 'esp', st: { fue: 2, agi: 4, esp: 9, vit: 5 }, grow: ['esp', 'vit'],
    d: 'Donde el Murim ve qi, el Oeste ve maná. Tú hablas ambos idiomas y el fuego te responde.',
    skills: [
      sk('Lanza de Fuego', 7, 'Atraviesa y deja ardiendo al enemigo.', { pow: 1.5, dot: { p: 0.3, t: 3 } }),
      sk('Velo de Agua', 6, 'Un velo que absorbe daño: escudo del 25%.', { shield: 0.25 })
    ]
  },
  sombra: {
    n: 'Sombra Silente', glyph: '影', main: 'agi', st: { fue: 5, agi: 8, esp: 3, vit: 4 }, grow: ['agi', 'fue'],
    d: 'Nadie te oye llegar. Frágil, pero letal: críticos devastadores y un paso que nadie alcanza.',
    skills: [
      sk('Puñalada Oculta', 5, 'Golpe con gran probabilidad de crítico.', { pow: 1.4, crit: 35 }),
      sk('Polvo Cegador', 6, 'Debilita el ataque enemigo durante 3 turnos.', { pow: 0.6, weak: 3 })
    ]
  },
  jade: {
    n: 'Mano de Jade', glyph: '藥', main: 'esp', st: { fue: 3, agi: 4, esp: 7, vit: 6 }, grow: ['esp', 'vit'],
    d: 'Agujas, píldoras y venenos. La misma mano que cierra una herida sabe dónde abrirla.',
    skills: [
      sk('Aguja de Jade', 5, 'Golpea un meridiano y debilita 2 turnos.', { pow: 1.3, weak: 2 }),
      sk('Elixir Vital', 7, 'Recuperas el 35% de tu vida.', { heal: 0.35 })
    ]
  }
};

/* Evoluciones. tier 1: depende de la senda dominante. tier 2: depende de Lazos o Ambición (o de un hecho clave: alt). */
const EVOS = {};
function evo(id, from, tier, via, n, d, st, skill, alt) {
  EVOS[id] = { id, from, tier, via, n, d, st, skill, alt: alt || null };
}
const ALT = {
  pacto: 'haber devorado el Núcleo Demoníaco',
  bendicion: 'la bendición del dragón Yaoguang'
};

// ── Espada Errante ──
evo('e_loto', 'espada', 1, 'rect', 'Hoja del Loto Blanco', 'Tu espada ya no busca sangre: busca que nadie más tenga que derramarla.',
  { fue: 2, agi: 1, vit: 2 }, sk('Flor de Mil Pétalos', 12, 'Tres cortes en un solo aliento.', { pow: 0.75, hits: 3 }));
evo('e_carmesi', 'espada', 1, 'somb', 'Colmillo Carmesí', 'Cada herida que abres te alimenta. La hoja ha aprendido a tener sed.',
  { fue: 3, agi: 2 }, sk('Tajo Sediento', 10, 'Recuperas vida por la mitad del daño.', { pow: 1.5, drain: 0.5 }));
evo('e_runa', 'espada', 1, 'mist', 'Espada Rúnica', 'Has grabado en el acero palabras que el viento obedece.',
  { fue: 2, esp: 2, agi: 1 }, sk('Runa Fulgurante', 11, 'Un rayo recorre la hoja; puede aturdir.', { pow: 1.5, stun: 0.4 }));
evo('e_guarda', 'e_loto', 2, 'lazos', 'Espada que Guarda el Cielo', 'No luchas por ti. Por eso no puedes perder.',
  { fue: 3, vit: 3, agi: 2 }, sk('Juramento de Acero', 18, 'Golpe formidable que además te escuda.', { pow: 2.4, shield: 0.2 }), 'bendicion');
evo('e_milhojas', 'e_loto', 2, 'amb', 'Soberanía de las Mil Hojas', 'Una sola espada se te quedó pequeña. Ahora el cielo entero es tu vaina.',
  { fue: 4, agi: 4 }, sk('Lluvia de Diez Mil Espadas', 20, 'Cinco hojas de qi caen del cielo.', { pow: 0.7, hits: 5 }));
evo('e_asura', 'e_carmesi', 2, 'amb', 'Asura de la Hoja Roja', 'Los que te ven desenvainar ya no rezan por ganar: rezan por morir rápido.',
  { fue: 5, agi: 3 }, sk('Mar de Sangre', 20, 'Tajo devastador que te devuelve vida.', { pow: 2.6, drain: 0.4 }), 'pacto');
evo('e_penitente', 'e_carmesi', 2, 'lazos', 'Filo Penitente', 'Cargas con cada muerte. Alguien te enseñó que el peso también es fuerza.',
  { fue: 3, vit: 3, esp: 2 }, sk('Golpe de Expiación', 16, 'Castiga y debilita 3 turnos.', { pow: 2.3, weak: 3 }));
evo('e_tormenta', 'e_runa', 2, 'lazos', 'Danza de la Tormenta', 'El trueno baila contigo, y nunca bailas a solas.',
  { fue: 3, agi: 3, esp: 2 }, sk('Tempestad Compartida', 18, 'Cuatro relámpagos; cada uno puede aturdir.', { pow: 0.75, hits: 4, stun: 0.2 }));
evo('e_vacio', 'e_runa', 2, 'amb', 'Filo del Vacío', 'Cortas el espacio entre las cosas. La armadura ya no significa nada.',
  { fue: 4, esp: 3, agi: 1 }, sk('Corte que Parte el Cielo', 22, 'Ignora toda defensa.', { pow: 2.9, pierce: true }));

// ── Puño de Hierro ──
evo('p_templo', 'puno', 1, 'rect', 'Guardián del Templo', 'Te plantas entre el débil y el golpe. Siempre.',
  { vit: 3, fue: 2 }, sk('Campana Dorada', 10, 'Tu piel resuena como el bronce: escudo del 40%.', { shield: 0.4 }));
evo('p_asura', 'puno', 1, 'somb', 'Puño del Asura', 'Has aprendido dónde se rompe un cuerpo. Y te gusta saberlo.',
  { fue: 4, vit: 1 }, sk('Golpe Quiebra-Meridianos', 10, 'Daña y debilita 3 turnos.', { pow: 1.6, weak: 3 }));
evo('p_dragon', 'puno', 1, 'mist', 'Cuerpo de Dragón', 'Bajo tu piel asoman escamas de jade. Algo antiguo despierta en tu sangre.',
  { vit: 2, fue: 2, esp: 1 }, sk('Escamas de Jade', 10, 'Escudo del 30% y más ataque 3 turnos.', { shield: 0.3, buff: { a: 0.25, t: 3 } }));
evo('p_montana', 'p_templo', 2, 'lazos', 'Montaña Inamovible', 'Detrás de ti hay gente. Delante, lo que haga falta.',
  { vit: 5, fue: 3 }, sk('Muralla de los Diez Mil', 18, 'Escudo del 50% y curas un 15%.', { shield: 0.5, heal: 0.15 }), 'bendicion');
evo('p_sereno', 'p_templo', 2, 'amb', 'Puño del Cielo Sereno', 'Un solo golpe, perfecto. No hace falta un segundo.',
  { fue: 5, vit: 3 }, sk('Palma del Buda Dorado', 20, 'Golpe colosal que suele aturdir.', { pow: 2.8, stun: 0.4 }));
evo('p_devorador', 'p_asura', 2, 'amb', 'Devorador de Núcleos', 'El qi ajeno sabe mejor que el propio.',
  { fue: 5, vit: 3 }, sk('Festín de Qi', 18, 'Recuperas el 60% del daño infligido.', { pow: 2.2, drain: 0.6 }), 'pacto');
evo('p_encadenado', 'p_asura', 2, 'lazos', 'Demonio Encadenado', 'La bestia sigue ahí. Tú sostienes la cadena, y otros te ayudan a no soltarla.',
  { fue: 4, vit: 4 }, sk('Furia Contenida', 16, 'Golpeas y tu ataque sube un 50% durante 3 turnos.', { pow: 1.5, buff: { a: 0.5, t: 3 } }));
evo('p_anciano', 'p_dragon', 2, 'lazos', 'Corazón del Dragón Anciano', 'El dragón no te posee: te acompaña.',
  { vit: 4, fue: 3, esp: 1 }, sk('Rugido Ancestral', 18, 'Aturde a menudo y debilita.', { pow: 2.0, stun: 0.5, weak: 2 }));
evo('p_titan', 'p_dragon', 2, 'amb', 'Titán de la Forja Estelar', 'Has templado tus huesos en fuego de estrellas caídas.',
  { fue: 6, vit: 2 }, sk('Puño Meteoro', 22, 'El golpe más fuerte que existe.', { pow: 3.1 }));

// ── Voz de los Elementos ──
evo('v_alba', 'voz', 1, 'rect', 'Llama del Alba', 'Tu fuego no quema: alumbra.',
  { esp: 3, vit: 2 }, sk('Sol Naciente', 12, 'Daña y te cura un 10%.', { pow: 1.8, heal: 0.1 }));
evo('v_ceniza', 'voz', 1, 'somb', 'Tejido de Ceniza', 'Aprendiste que el fuego negro no se apaga con agua.',
  { esp: 4, agi: 1 }, sk('Fuego Negro', 11, 'Una quemadura que consume durante 4 turnos.', { pow: 1.3, dot: { p: 0.5, t: 4 } }));
evo('v_marea', 'voz', 1, 'mist', 'Sabiduría de las Mareas', 'Todo fluye. Tú decides hacia dónde.',
  { esp: 3, agi: 1, vit: 1 }, sk('Prisión de Escarcha', 11, 'Suele congelar (aturdir) al enemigo.', { pow: 1.3, stun: 0.5 }));
evo('v_aurora', 'v_alba', 2, 'lazos', 'Aurora de los Cinco Cielos', 'Cinco colores, cinco elementos, un solo amanecer para todos.',
  { esp: 4, vit: 4 }, sk('Aurora', 20, 'Gran daño y curas un 20%.', { pow: 2.5, heal: 0.2 }), 'bendicion');
evo('v_juicio', 'v_alba', 2, 'amb', 'Juicio Solar', 'Decidiste que la luz también puede dictar sentencia.',
  { esp: 6, vit: 2 }, sk('Veredicto del Mediodía', 22, 'Daño enorme y quemadura.', { pow: 2.8, dot: { p: 0.4, t: 3 } }));
evo('v_pira', 'v_ceniza', 2, 'amb', 'Pira del Fin', 'Donde pisas no vuelve a crecer nada. Tampoco tus enemigos.',
  { esp: 7, agi: 1 }, sk('Infierno Carmesí', 22, 'Llamas que devoran durante 4 turnos.', { pow: 2.2, dot: { p: 0.8, t: 4 } }), 'pacto');
evo('v_protege', 'v_ceniza', 2, 'lazos', 'Ceniza que Protege', 'Usas el fuego prohibido como muralla para los tuyos.',
  { esp: 4, vit: 4 }, sk('Muro de Brasas', 16, 'Daña y levanta un escudo del 35%.', { pow: 1.7, shield: 0.35 }));
evo('v_rio', 'v_marea', 2, 'lazos', 'Río de Estrellas', 'El qi y el maná corren juntos por tus manos.',
  { esp: 5, vit: 2, agi: 1 }, sk('Corriente Estelar', 18, 'Tres oleadas; curas un 10%.', { pow: 0.95, hits: 3, heal: 0.1 }));
evo('v_ojo', 'v_marea', 2, 'amb', 'Ojo de la Tormenta Arcana', 'En el centro de todo, quieta, tu voluntad.',
  { esp: 6, agi: 2 }, sk('Silencio del Ojo', 22, 'Gran daño; casi siempre aturde.', { pow: 2.3, stun: 0.6 }));

// ── Sombra Silente ──
evo('s_viento', 'sombra', 1, 'rect', 'Viento Justiciero', 'Golpeas desde la oscuridad a quienes la ley no alcanza.',
  { agi: 3, fue: 1, vit: 1 }, sk('Golpe Certero', 10, 'Encuentra el hueco: ignora la defensa.', { pow: 1.7, pierce: true }));
evo('s_colmillo', 'sombra', 1, 'somb', 'Colmillo de Medianoche', 'El veneno hace el trabajo. Tú solo tienes que rozar.',
  { agi: 3, fue: 2 }, sk('Veneno de Siete Pasos', 10, 'Veneno feroz durante 4 turnos.', { pow: 1.0, dot: { p: 0.55, t: 4 } }));
evo('s_espejismo', 'sombra', 1, 'mist', 'Espejismo Lunar', '¿Cuál de tus reflejos es el verdadero? Ni tú estás ya del todo seguro.',
  { agi: 3, esp: 2 }, sk('Paso Fantasma', 9, 'Golpeas y te vuelves casi intocable 2 turnos.', { pow: 1.3, evade: 2 }));
evo('s_brisa', 's_viento', 2, 'lazos', 'Brisa que Vela', 'Nadie te ve, pero todos los tuyos duermen tranquilos.',
  { agi: 4, vit: 3, fue: 1 }, sk('Guardia Invisible', 16, 'Golpe preciso y escudo del 25%.', { pow: 2.0, shield: 0.25, pierce: true }), 'bendicion');
evo('s_relampago', 's_viento', 2, 'amb', 'Relámpago Blanco', 'Para cuando oyen el trueno, ya has envainado.',
  { agi: 6, fue: 2 }, sk('Seis Destellos', 20, 'Seis cortes imposibles de seguir.', { pow: 0.55, hits: 6, crit: 15 }));
evo('s_segador', 's_colmillo', 2, 'amb', 'Segador sin Rostro', 'Ya no tienes nombre. Solo una lista.',
  { agi: 5, fue: 3 }, sk('Ejecución', 20, 'Mucho más daño si el enemigo está por debajo del 40%.', { pow: 2.1, exec: true }), 'pacto');
evo('s_daga', 's_colmillo', 2, 'lazos', 'Daga Arrepentida', 'Sigues matando en silencio, pero ahora eliges por quién.',
  { agi: 4, vit: 2, fue: 2 }, sk('Última Advertencia', 16, 'Debilita y puede aturdir.', { pow: 2.0, weak: 3, stun: 0.3 }));
evo('s_reflejos', 's_espejismo', 2, 'lazos', 'Luna de Mil Reflejos', 'Cada reflejo lleva el rostro de alguien que confía en ti.',
  { agi: 4, esp: 2, vit: 2 }, sk('Danza de Reflejos', 18, 'Cuatro golpes y esquiva 2 turnos.', { pow: 0.75, hits: 4, evade: 2 }));
evo('s_eclipse', 's_espejismo', 2, 'amb', 'Eclipse', 'Cuando actúas, hasta la luna aparta la mirada.',
  { agi: 5, esp: 3 }, sk('Hora sin Luz', 22, 'Golpe brutal; puede aturdir.', { pow: 2.9, stun: 0.4 }));

// ── Mano de Jade ──
evo('j_manantial', 'jade', 1, 'rect', 'Manantial Sereno', 'Curas a quien llega, sin preguntar bandera.',
  { esp: 2, vit: 3 }, sk('Lluvia Curativa', 12, 'Curas un 30% y te escudas un 20%.', { heal: 0.3, shield: 0.2 }));
evo('j_flor', 'jade', 1, 'somb', 'Flor Venenosa', 'Hermosa de lejos. De cerca, lo último que se ve.',
  { esp: 4, agi: 1 }, sk('Miasma', 10, 'Veneno 4 turnos y debilita 2.', { pow: 0.9, dot: { p: 0.5, t: 4 }, weak: 2 }));
evo('j_horno', 'jade', 1, 'mist', 'Horno de los Nueve Soles', 'La alquimia es paciencia… hasta que deja de serlo.',
  { esp: 3, vit: 1, agi: 1 }, sk('Píldora Explosiva', 10, 'Estalla y deja ardiendo.', { pow: 1.8, dot: { p: 0.3, t: 3 } }));
evo('j_loto', 'j_manantial', 2, 'lazos', 'Loto de la Vida Eterna', 'Mientras tú respires, nadie a tu lado caerá.',
  { esp: 4, vit: 4 }, sk('Florecer', 20, 'Curas un 55% y tu ataque sube 3 turnos.', { heal: 0.55, buff: { a: 0.4, t: 3 } }), 'bendicion');
evo('j_destino', 'j_manantial', 2, 'amb', 'Mano que Corrige el Destino', 'Si puedes curar la muerte, ¿por qué no reescribir la vida?',
  { esp: 6, vit: 2 }, sk('Aguja del Destino', 20, 'Gran daño y curas un 20%.', { pow: 2.6, heal: 0.2 }));
evo('j_plaga', 'j_flor', 2, 'amb', 'Plaga Carmesí', 'Un jardín entero de cosas que nadie debería cultivar.',
  { esp: 7, agi: 1 }, sk('Jardín del Fin', 20, 'Veneno atroz y robas vida.', { pow: 1.6, dot: { p: 0.8, t: 4 }, drain: 0.5 }), 'pacto');
evo('j_misericordia', 'j_flor', 2, 'lazos', 'Veneno Misericordioso', 'Duermes al enemigo en lugar de matarlo. Casi siempre.',
  { esp: 4, vit: 3, agi: 1 }, sk('Sueño de Amapola', 16, 'Daña y aturde a menudo.', { pow: 1.8, stun: 0.5 }));
evo('j_caldero', 'j_horno', 2, 'lazos', 'Caldero del Dragón', 'Cocinas milagros para una mesa llena.',
  { esp: 4, vit: 3, fue: 1 }, sk('Banquete de los Nueve Soles', 18, 'Daña, cura un 25% y escuda un 20%.', { pow: 1.9, heal: 0.25, shield: 0.2 }));
evo('j_prohibida', 'j_horno', 2, 'amb', 'Alquimia Prohibida', 'Convertiste tu propio núcleo en horno. No hay vuelta atrás.',
  { esp: 7, vit: 1 }, sk('Transmutación Final', 22, 'Daño enorme; tu ataque sube 3 turnos.', { pow: 2.8, buff: { a: 0.35, t: 3 } }));

/* Enemigos. sk: n nombre, pow, w peso, dot{d,t}, charge (avisa y golpea al turno siguiente), heal (%). */
const ENEMIGOS = {
  acolito: { n: 'Acólito de la Luna Roja', glyph: '月', hp: 62, atk: 12, def: 3, xp: 30,
    sk: [{ n: 'Daga ritual', pow: 1 }, { n: 'Tajo frenético', pow: 1.3, w: 0.5 }] },
  bandido: { n: 'Jefe de bandidos', glyph: '匪', hp: 115, atk: 19, def: 4, xp: 50, pild: 1,
    sk: [{ n: 'Sablazo', pow: 1 }, { n: 'Patada sucia', pow: 1.2, w: 0.6 }, { n: 'Golpe de sable a dos manos', pow: 1.9, charge: true, w: 0.4 }] },
  gwak: { n: 'Anciano Gwak', glyph: '老', hp: 190, atk: 25, def: 6, xp: 100,
    sk: [{ n: 'Palma del Loto Marchito', pow: 1 }, { n: 'Dedo que Sella', pow: 1.25, w: 0.6 }, { n: 'Loto Invertido', pow: 2, charge: true, w: 0.45 }] },
  acolito_mayor: { n: 'Acólito Mayor', glyph: '月', hp: 180, atk: 26, def: 5, xp: 100,
    sk: [{ n: 'Hoz carmesí', pow: 1 }, { n: 'Llama de sangre', pow: 1.1, dot: { d: 5, t: 3 }, w: 0.6 }, { n: 'Media luna', pow: 1.9, charge: true, w: 0.4 }] },
  campeon: { n: 'Colmillo de Hierro, campeón del Foso', glyph: '鬥', hp: 200, atk: 26, def: 6, xp: 100,
    sk: [{ n: 'Gancho', pow: 1 }, { n: 'Cabezazo', pow: 1.3, w: 0.6 }, { n: 'Abrazo del oso', pow: 2, charge: true, w: 0.45 }] },
  reflejo: { n: 'Tu Reflejo', glyph: '鏡', hp: 185, atk: 26, def: 5, xp: 100,
    sk: [{ n: 'Tu propio golpe', pow: 1 }, { n: 'Lo que callas', pow: 1.25, w: 0.6 }, { n: 'Lo que temes', pow: 1.9, charge: true, w: 0.45 }] },
  aldric: { n: 'Sir Aldric, lanza de los Reinos del Oeste', glyph: '騎', hp: 265, atk: 34, def: 9, xp: 110,
    sk: [{ n: 'Estocada', pow: 1 }, { n: 'Golpe de escudo', pow: 1.2, w: 0.6 }, { n: 'Carga del grifo', pow: 2, charge: true, w: 0.5 }] },
  linxue: { n: 'Lin Xue, Nieve del Loto Blanco', glyph: '雪', hp: 310, atk: 38, def: 9, xp: 130,
    sk: [{ n: 'Corte de escarcha', pow: 1 }, { n: 'Pétalo que cae', pow: 1.3, w: 0.7 }, { n: 'Nieve sobre el Loto', pow: 2.1, charge: true, w: 0.5 }] },
  heraldo: { n: 'Heraldo de la Luna Roja', glyph: '血', hp: 370, atk: 40, def: 10, xp: 150, pild: 1,
    sk: [{ n: 'Garra carmesí', pow: 1 }, { n: 'Marea de sangre', pow: 1.1, dot: { d: 8, t: 3 }, w: 0.6 }, { n: 'Eclipse menor', pow: 2.1, charge: true, w: 0.5 }] },
  emisario: { n: 'Emisario del Patriarca', glyph: '使', hp: 425, atk: 46, def: 11, xp: 160, pild: 1,
    sk: [{ n: 'Abanico de acero', pow: 1 }, { n: 'Susurro venenoso', pow: 1, dot: { d: 10, t: 3 }, w: 0.6 }, { n: 'Mil agujas rojas', pow: 2.1, charge: true, w: 0.5 }] },
  dragon: { n: 'Yaoguang, eco del dragón', glyph: '龍', hp: 575, atk: 51, def: 13, xp: 220, pild: 1,
    sk: [{ n: 'Zarpa de luz', pow: 1 }, { n: 'Coletazo', pow: 1.25, w: 0.6 }, { n: 'Aliento de estrellas', pow: 2.2, charge: true, w: 0.55 }, { n: 'Escamas que se cierran', pow: 0, heal: 0.07, w: 0.25 }] },
  jin: { n: 'Gran Maestre Jin Tae-san', glyph: '盟', hp: 690, atk: 59, def: 15, xp: 250, pild: 1,
    sk: [{ n: 'Espada de la Alianza', pow: 1 }, { n: 'Nueve Sellos', pow: 1.3, w: 0.7 }, { n: 'Mandato del Cielo', pow: 2.2, charge: true, w: 0.55 }] },
  yemo: { n: 'Patriarca Ye Mo', glyph: '魔', hp: 875, atk: 64, def: 16, xp: 0,
    sk: [{ n: 'Palma de la Luna Roja', pow: 1 }, { n: 'Sangre que arde', pow: 1.1, dot: { d: 14, t: 3 }, w: 0.6 }, { n: 'Cielo Carmesí', pow: 2.3, charge: true, w: 0.55 }, { n: 'Devorar', pow: 0.9, drain: 1, w: 0.35 }] }
};
