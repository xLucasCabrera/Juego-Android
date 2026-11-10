/* Historia: nodos enlazados. En los textos, {n} = nombre y {@} = terminación de género (o/a/e).
   Nodo: ch capítulo, title, art, text, choices[{t, req, reqT, eff, res, go}] | fight+next | evolve+next | ending. */
'use strict';

const ARTE = {
  luna: ['月', '#3a0d16', '#120810'], camino: ['道', '#1f3a34', '#0e1216'], posada: ['宿', '#3b2a14', '#120e0c'],
  monte: ['山', '#27405e', '#0d1118'], ciudad: ['城', '#2c2c36', '#0c0b10'], torre: ['塔', '#3a2a5e', '#0f0c18'],
  nucleo: ['丹', '#5e4a14', '#141008'], torneo: ['武', '#5e1f1f', '#140c0c'], ruinas: ['墟', '#2f3a3a', '#0c1010'],
  dragon: ['龍', '#14505e', '#081014'], cielo: ['天', '#3d2a6e', '#0a0812'], fin: ['終', '#5e4a14', '#0c0a10']
};

const COMP = { comp_lin: 'Lin Xue', comp_zarza: 'Zarza', comp_kael: 'Kael' };
const F = k => S.flags[k];
const comps = () => Object.keys(COMP).filter(F).map(k => COMP[k]);
const hasComp = () => comps().length > 0;
const lista = a => a.length < 2 ? a.join('') : a.slice(0, -1).join(', ') + ' y ' + a[a.length - 1];

const STORY = {
  // ───────────── PRÓLOGO ─────────────
  p1: {
    ch: 'Prólogo', title: 'Una noche cualquiera', art: 'ciudad',
    text: () => `${{
      estudiante: 'Son las dos de la madrugada y la biblioteca acaba de echarte. Llevas tres cafés encima, un examen dentro de siete horas y la sensación de que tu vida es una lista de entregas.',
      repartidor: 'Último pedido de la noche: doce manzanas bajo la lluvia. La aplicación dice que vas tarde. La aplicación siempre dice que vas tarde.',
      urgencias: 'Sales de una guardia de catorce horas con el olor a desinfectante pegado a la piel. Hoy se salvaron todos menos uno, y es en ese en quien piensas.',
      gimnasio: 'Las once de la noche. Primero la oficina, después el saco. Llevas los nudillos vendados y trabajas para un jefe que no se sabe tu nombre.'
    }[S.origin]}

No eres nadie especial. No hay profecías sobre ti, ni marcas de nacimiento, ni espadas esperándote en ninguna piedra. Tienes un alquiler, un móvil al 3 % de batería y sueño atrasado.

El semáforo del paso de peatones se pone en verde.

Y el asfalto mojado, bajo tus pies, también se enciende: un círculo de caracteres que no has visto nunca gira despacio a tu alrededor. A tu lado, un chaval con auriculares cruza sin ver nada.`,
    choices: [
      { t: 'Apartar al chaval de un empujón, por si acaso', eff: { rect: 1 }, go: 'p1b',
        res: 'El chico trastabilla fuera del círculo y te suelta un insulto. Tú no llegas a oírlo entero.\n\nLa luz sube por tus piernas como agua caliente. El suelo deja de estar ahí.' },
      { t: 'Agacharte a tocar los símbolos', eff: { mist: 1 }, go: 'p1b',
        res: 'Están tibios. Y cuando los rozas, uno de ellos se reordena, como si acabara de aprender tu nombre.\n\nLa luz sube por tu brazo. El suelo deja de estar ahí.' },
      { t: 'Plantarte: sea lo que sea, no piensas echar a correr', eff: { amb: 1 }, go: 'p1b',
        res: 'Llevas toda la vida apartándote para que pasen otros. Esta vez, no.\n\nLa luz sube por tus piernas como agua caliente. El suelo deja de estar ahí.' }
    ]
  },
  p1b: {
    ch: 'Prólogo', title: 'El otro lado', art: 'cielo',
    text: `Caes hacia arriba.

Durante un instante lo ves todo desde fuera: un cielo con una grieta, y por la grieta dos ríos de luz —uno dorado, otro azul— que corren juntos sin llegar a tocarse.

Luego, piedra fría contra la mejilla. Olor a incienso y a lluvia.

Un viejo harapiento baja las manos, temblando de agotamiento.

—Ha funcionado —dice—. Cuarenta años, y ha funcionado.

Habla un idioma que no conoces, y lo entiendes igual.

—Me llamo Mu Cheon. Te he invocado desde el otro lado del cielo, y lo siento. En este mundo, todo el que nace pertenece a uno de los dos ríos: el qi de las sectas marciales del este o el maná de los reinos mágicos del oeste. Yo necesitaba a alguien que no fuera de ninguno.

—¿Puedo volver? —es lo primero que preguntas.

—La puerta por la que has caído está en el cielo. Para abrirla hacen falta tres cosas, y yo solo tengo una. —Señala la salida—. Descansa. Esta noche hay feria. Mira el mundo antes de que te pida nada.`,
    choices: [{ t: 'Salir a ver dónde has caído', go: 'p1c' }]
  },
  p1c: {
    ch: 'Prólogo', title: 'La Feria de la Niebla', art: 'camino',
    text: () => `El pueblo se llama Vado de la Niebla y es el último antes de que el mundo cambie de nombre. Al este, el Camino de Jade se adentra en el Murim: sectas en las cumbres y maestros que parten ríos con una espada. Al oeste, los Reinos: torres de magos, caballeros con grifos en el escudo, dragones dormidos bajo las colinas.

Aquí, en medio, se mezcla todo. Una elfa vende copas de cristal que cantan solas. Un orco con delantal de herrero hierra al grifo de un caballero, que le discute el precio. Dos espadachines de túnica blanca caminan por el filo de un tejado como quien pasea. Una maga enciende los farolillos chasqueando los dedos.

Tu ropa atrae miradas. Tu móvil no tiene cobertura y marca un 2 %.

Y hay algo más. Desde que cruzaste, ${{
      espada: 'cada vez que ves una espada en un puesto, tu mano sabe exactamente cómo empuñarla.',
      puno: 'sientes el cuerpo denso y firme, como si te hubieran rellenado de hierro.',
      voz: 'las llamas de los faroles se inclinan hacia ti cuando pasas, como si te reconocieran.',
      sombra: 'atraviesas el gentío sin que nadie te roce, te mire o te oiga.',
      jade: 'ves, bajo la piel de la gente, líneas tenues de luz por las que corre algo vivo.'
    }[S.cls]}`,
    choices: [{ t: 'Perderte entre los puestos', go: 'p2' }]
  },
  p2: {
    ch: 'Prólogo', title: 'El colgante de jade', art: 'camino',
    text: `—¡Ladrón! ¡Rata de alcantarilla!

Un mercader de sedas tiene agarrado por la muñeca a un crío harapiento. Alguien lo llama Tao: el huérfano que duerme bajo el puente. El mercader jura que le ha robado un colgante de jade y exige que venga la guardia. Aquí, por lo visto, a los ladrones se les corta la mano.

Tao te mira a ti, precisamente a ti, la única persona de la plaza que no es de aquí. No pide ayuda. Hace mucho que aprendió a no pedirla.`,
    choices: [
      { t: 'Interponerte y pagar el colgante con tu reloj', eff: { rect: 1, lazos: 1, flag: 'tao' }, go: 'p3',
        res: 'Tu reloj de pulsera: una máquina diminuta que mide el tiempo sola. El mercader lo acepta con ojos como platos y suelta al niño.\n\nTao no da las gracias. Te sigue un rato entre el gentío y, antes de desaparecer, te mete algo en la mano: una castaña asada, todavía caliente.' },
      { t: 'Observar con calma: algo no encaja en la manga del mercader', eff: { mist: 1, lazos: 1, flag: 'tao' }, go: 'p3',
        res: 'No miras al niño. Miras al mercader: la manga demasiado rígida, el gesto con que la protege. Has visto ese truco en mil vídeos.\n\n—Sacúdala —dices.\n\nEl colgante cae al barro delante de todos. El mercader recoge su puesto entre abucheos, y Tao te observa como quien acaba de ver magia de verdad.' },
      { t: 'Sujetar al niño hasta que llegue la guardia y cobrar la recompensa', eff: { somb: 1, amb: 1 }, go: 'p3',
        res: 'Necesitas dinero de este mundo, y lo necesitas ya. Las monedas pesan lo justo.\n\nMientras se lo llevan, Tao no grita. Solo te mira, memorizando tu cara.' },
      { t: 'No es tu mundo ni tu problema. Seguir caminando', eff: { amb: 1 }, go: 'p3',
        res: 'Tú solo quieres volver a casa. Si te paras en cada injusticia de un mundo que no es el tuyo, no llegarás nunca.\n\nA tu espalda, el griterío se apaga poco a poco.' }
    ]
  },
  p3: {
    ch: 'Prólogo', title: 'La Luna Roja', art: 'luna',
    text: `Es un niño el primero en señalarla.

La luna, redonda y blanca sobre los tejados, se está tiñendo. Primero un borde, como vino derramado. Después toda entera, roja como una herida.

La campana del santuario toca una vez y enmudece. Por el Camino de Jade bajan figuras con túnicas carmesí y máscaras sin boca. No gritan. No corren. Simplemente prenden fuego a todo lo que tocan.

—El Culto de la Luna Roja —susurra el herrero orco a tu lado, antes de echarse a su hija al hombro y correr.

Hay gente atrapada en el almacén de grano. Un enmascarado alto reparte órdenes desde la plaza. Y en el santuario de la colina, donde dejaste al viejo, late una luz azul.`,
    choices: [
      { t: 'Sacar a los aldeanos del almacén en llamas', eff: { rect: 2, lazos: 1, flag: 'aldeanos' }, go: 'p4',
        res: 'No es tu gente. Da igual. Rompes la tranca con el hombro y sacas a rastras a una anciana, a dos niños, a un caballero con la pierna abrasada. Cuando el techo se derrumba, ya no queda nadie dentro.\n\nTienes las manos en carne viva. El santuario también arde, y allí está el único que sabe cómo devolverte a casa. Corres.' },
      { t: 'Ir a por el comandante enmascarado', eff: { somb: 1, amb: 1 }, go: 'p4',
        res: 'Coges una hoz de un puesto volcado y cruzas la plaza por las sombras. Corta la cabeza y el cuerpo cae: eso dicen en tu mundo.\n\nEl comandante ni siquiera se gira. Te barre con el dorso de la mano y vuelas diez pasos. Cuando recuperas el aire, él camina ya hacia el santuario, como si allí estuviera lo único que le importa. Lo sigues, cojeando.' },
      { t: 'Correr hacia el resplandor azul del santuario', eff: { mist: 2 }, go: 'p4',
        res: 'Todos corren en dirección contraria. Tú subes la colina.\n\nLa luz late como un corazón, y con cada pulso los enmascarados giran la cabeza hacia ella, como polillas. No han venido por el pueblo. Han venido por lo mismo que te trajo a ti.' }
    ]
  },
  p4: {
    ch: 'Prólogo', title: 'El viejo del santuario', art: 'luna',
    text: `Mu Cheon está de pie entre tres cadáveres con túnica carmesí. Tiene una mano hundida en el costado, sujetándose una herida que no deja de sangrar, y con la otra sostiene una tablilla de jade que brilla azul.

—Iba a pedírtelo por las buenas —dice con media sonrisa—. El cielo tiene sentido del humor.

Te aprieta la tablilla contra el pecho. El jade se deshace como hielo en agua tibia y se hunde en tu piel. Algo se abre dentro de ti: canales que no sabías que tenías, un río que empieza a correr. Eso que notabas desde que cruzaste despierta de golpe y tiene nombre: {clase}.

Un cuarto acólito entra tras de ti con la daga en alto. El viejo ya no puede levantarse.

Solo quedas tú.`,
    fight: 'acolito', next: 'p5'
  },
  p5: {
    ch: 'Prólogo', title: 'El Sutra del Cielo Roto', art: 'nucleo',
    text: `El acólito cae. Te tiemblan las manos. Hace una hora estabas esperando un semáforo.

—Hace mucho fui maestro de dos necios —dice Mu Cheon—. Lo que llevas dentro es un fragmento del Sutra del Cielo Roto. Hay tres. Quien los reúna podrá abrir la herida del cielo, que es también tu puerta a casa… o cerrarla para siempre.

Tose sangre.

—A cualquiera de este mundo, el Sutra lo desgarra: tira de él hacia su río. A ti no. Por eso te traje. No se lo des a la Alianza. No se lo des al Culto. El segundo fragmento aparecerá en el Torneo del Dragón Durmiente.

Le queda un aliento.`,
    choices: [
      { t: '«Juro que tu muerte no será en vano.»', eff: { rect: 1, xp: 10 }, go: 'c1_1',
        res: '—Los juramentos pesan, criatura —murmura—. Pero pesan menos que la culpa. Jura, entonces.\n\nMuere con los ojos abiertos, mirando la luna roja a través del techo roto.' },
      { t: '«¿Qué poder me da esto?»', eff: { amb: 1, xp: 10 }, go: 'c1_1',
        res: 'Se ríe, y la risa lo acaba.\n\n—Todo el que quieras —dice—. Ese es justo el problema.\n\nMuere con los ojos abiertos, mirando la luna roja a través del techo roto.' },
      { t: '«¿Qué es en realidad el Cielo Roto?»', eff: { mist: 1, xp: 10 }, go: 'c1_1',
        res: '—Buena pregunta. La única buena —susurra—. El qi y la magia eran un solo río. Alguien lo partió en dos. Ve y mira la grieta con tus propios ojos antes de decidir nada.\n\nMuere con los ojos abiertos, mirando la luna roja a través del techo roto.' },
      { t: '«Yo solo quiero volver a casa.»', eff: { lazos: 1, xp: 10 }, go: 'c1_1',
        res: '—Lo sé —dice, casi con ternura—. Por eso elegí a alguien corriente y no a un héroe. Los héroes siempre quieren quedarse con el cielo.\n\nMuere con los ojos abiertos, mirando la luna roja a través del techo roto.' }
    ]
  },

  // ───────────── CAPÍTULO 1 ─────────────
  c1_1: {
    ch: 'Capítulo 1 · El Camino de Jade', title: 'La Posada del Farol Torcido', art: 'posada',
    text: () => `Al amanecer, Vado de la Niebla es ceniza y gente que cava tumbas.${F('aldeanos') ? ' La anciana a la que sacaste del almacén te llena el zurrón de tortas de arroz sin decir palabra.' : ''} Entierras a Mu Cheon bajo el ciruelo del santuario. No conoces a nadie en este mundo. Tienes un móvil apagado, un fragmento en el pecho y una sola dirección: el este.

Tres días después, en un cruce de caminos, cenas en la Posada del Farol Torcido. El fragmento te arde bajo el esternón cada vez que respiras hondo.

Una joven de túnica blanca, con una espada de vaina nevada a la espalda, va de mesa en mesa haciendo preguntas. Lleva bordado el loto de la Secta del Monte Loto Blanco, pilar de la Alianza Marcial. Cuando llega a la tuya, se detiene en seco.

—Tu qi —dice—. Hace tres días no existía, ¿verdad? Soy Lin Xue. Busco a los que quemaron un pueblo en la frontera.`,
    choices: [
      { t: 'Contarle lo que pasó en la aldea (callando lo del fragmento y de dónde vienes)', eff: { rect: 1, lazos: 1, flag: 'lin_confia' }, go: 'c1_2',
        res: 'Se lo cuentas todo, menos lo que llevas en el pecho. Lin Xue escucha sin interrumpir, con los nudillos blancos sobre la mesa.\n\n—La Alianza llegó tarde. Otra vez —dice al fin—. No volverá a pasar. Si vas hacia el este, el camino es más seguro de dos en dos.' },
      { t: 'Mentir: solo eres alguien que viaja desde muy lejos', eff: { somb: 1 }, go: 'c1_2',
        res: '—Nadie —dices—. Voy de paso.\n\nLin Xue te sostiene la mirada un segundo de más.\n\n—Los que van de paso no huelen a humo de santuario —responde, y se aleja. Pero no te quita ojo en toda la noche.' },
      { t: 'Responder con otra pregunta: ¿qué busca el Culto?', eff: { mist: 1 }, go: 'c1_2',
        res: '—Preguntas tú primero. Bien —admite, y se sienta—. Buscan tablillas antiguas. Han arrasado cuatro santuarios este año. Mi maestra dice que el Patriarca Ye Mo quiere «abrir el cielo». Nadie sabe qué significa.\n\nTú sí empiezas a saberlo. Te guardas el escalofrío.' }
    ]
  },
  c1_2: {
    ch: 'Capítulo 1 · El Camino de Jade', title: 'Dedos en la oscuridad', art: 'posada',
    text: `Te despierta un roce.

Hay alguien sentado a horcajadas en el alféizar, con una mano a un palmo de tu pecho, justo donde el fragmento brilla débilmente bajo la camisa. Atrapas la muñeca antes de pensarlo. Tus reflejos ya no son los de hace una semana.

—Ay. Vale. Vale —susurra una chica flaca, con el pelo cortado a cuchillo y una sonrisa de quien ya está calculando la huida—. Me llaman Zarza. No es personal: un encapuchado paga cien taeles de plata por «lo que brilla en el pecho del viajero». Debo trescientos a la Unión Negra. Haz tú la cuenta.

En el pasillo se oyen los pasos de Lin Xue, que hace la ronda.`,
    choices: [
      { t: 'Proponerle un trato: que trabaje contigo y no contra ti', eff: { lazos: 2, flag: { zarza: 'aliada', comp_zarza: 1 } }, go: 'c1_3',
        res: '—¿Contigo? ¿Con alguien a quien persiguen el Culto, un encapuchado y, por tu cara, medio mundo? —Zarza suelta una risa muda—. Es la peor oferta que me han hecho en mi vida.\n\nSe deja caer dentro de la habitación.\n\n—Acepto. Pero la cuenta de la posada la pagas tú.' },
      { t: 'Soltarla con una advertencia', eff: { rect: 1, flag: { zarza: 'libre' } }, go: 'c1_3',
        res: 'Abres la mano.\n\n—La próxima vez no estaré dormid{@}.\n\nZarza se frota la muñeca, desconcertada. Nadie la suelta nunca sin cobrarse algo.\n\n—Te debo una —dice desde el tejado—. Odio deber cosas.' },
      { t: 'Llamar a Lin Xue y entregarla a la justicia de la Alianza', eff: { rect: 1, flag: { zarza: 'entregada', lin_confia: 1 } }, go: 'c1_3',
        res: 'Lin Xue la ata con tres vueltas de cuerda de seda y un nudo que no habías visto nunca.\n\n—En la Alianza a los ladrones se les marca la mano —dice, sin alegría.\n\nZarza no forcejea. Solo te mira.\n\n—Tenías cara de ser distint{@} —dice—. Fallo mío.' },
      { t: 'Quitarle todo lo que lleva encima y echarla por la ventana', eff: { somb: 1, amb: 1, pild: 2, flag: { zarza: 'robada' } }, go: 'c1_3',
        res: 'Una ganzúa, dos píldoras de recuperación, un puñado de monedas. Robar a una ladrona tiene su gracia.\n\n—Esto no se hace —sisea Zarza desde el tejado, descalza—. Hay códigos.\n\n—Apúntalo en mi cuenta.' }
    ]
  },
  c1_3: {
    ch: 'Capítulo 1 · El Camino de Jade', title: 'Emboscada en el desfiladero', art: 'camino',
    text: () => `El encapuchado no contrató solo a una ladrona.

Dos días después, en el Desfiladero del Mono Blanco, una docena de mercenarios cierra el camino por delante y por detrás. Su jefe es un orco de colmillos limados y hombros como vigas: Gorrak. Señala tu pecho con un hacha ancha como un remo.

—Vivo o muerto pagan lo mismo. Tú eliges.

${F('comp_zarza') ? 'Zarza ya ha desaparecido entre las rocas. Un momento después, dos mercenarios caen de la cornisa sin un grito. —¡Los de arriba son míos! —oyes.' : 'Lin Xue, que seguía tu mismo camino a cierta distancia, desenvaina y se ocupa de los de retaguardia sin pedir permiso.'}

El orco es tuyo.`,
    fight: 'bandido', next: 'c1_4'
  },
  c1_4: {
    ch: 'Capítulo 1 · El Camino de Jade', title: 'Tres caminos', art: 'camino',
    text: () => `En el cinto del orco encuentras la carta del encargo. No lleva firma, pero el lacre tiene marcado un sello que Lin Xue reconoce al instante, y palidece.

—Es un sello de la Alianza Marcial. De alguien del Consejo.

Así que quien te quiere muerto no es solo el Culto.

El camino se divide en tres más allá del desfiladero. Necesitas hacerte fuerte, y deprisa. El Torneo del Dragón Durmiente se celebra dentro de tres lunas.

Al norte, el Monte Loto Blanco: la secta de Lin Xue, disciplina y espada. Al sur, la Ciudad de Hierro Negro: guarida de la Unión Negra, donde todo se sabe y todo se vende. Al oeste, cruzando la frontera, la Torre de Marfil: allí los magos estudian lo que el Murim solo intuye.`,
    choices: [
      { t: 'Al norte: el Monte Loto Blanco', eff: { flag: { ruta: 'loto' }, xp: 20 }, go: 'l1' },
      { t: 'Al sur: la Ciudad de Hierro Negro', eff: { flag: { ruta: 'hierro' }, xp: 20 }, go: 'h1' },
      { t: 'Al oeste: la Torre de Marfil', eff: { flag: { ruta: 'torre' }, xp: 20 }, go: 't1' }
    ]
  },

  // ───────────── CAPÍTULO 2 · LOTO BLANCO ─────────────
  l1: {
    ch: 'Capítulo 2 · El Monte Loto Blanco', title: 'Los diez mil peldaños', art: 'monte',
    text: `Diez mil peldaños de piedra, y al final una puerta sin muros: quien llega arriba ya ha pasado la primera prueba.

La segunda la pone el Anciano Baek, un hombre seco como una raíz. Te sienta bajo la Cascada del Loto, en pleno deshielo, en la postura de los novicios.

—Hasta que se consuma la varilla de incienso. Si te levantas, bajas los peldaños.

El agua cae como un martillo. A la mitad de la varilla ya no sientes las piernas. El fragmento, en tu pecho, late tibio, ofreciéndose.`,
    choices: [
      { t: 'Aguantar a pura voluntad', eff: { rect: 1, xp: 30 }, go: 'l2',
        res: 'Cuentas respiraciones. Luego latidos. Luego ya no cuentas nada.\n\nCuando Baek te saca del agua, tienes los labios azules.\n\n—Terc{@} —dictamina—. Sirve.' },
      { t: 'Dejar que el fragmento te caliente en secreto', eff: { somb: 1, amb: 1, xp: 30 }, go: 'l2',
        res: 'El calor se extiende por tus meridianos y el agua helada se vuelve un baño tibio. Aguantas la varilla entera sin pestañear.\n\nBaek te mira largo rato, entornando los ojos. No dice nada. Pero lo ha notado.' },
      { t: 'Dejar de resistir: sentir el ritmo del agua', eff: { mist: 1, xp: 30 }, go: 'l2',
        res: 'El agua no es un martillo. Es un pulso: cae, se abre, respira. Dejas que tu qi siga ese mismo compás y, por un instante, la cascada pasa a través de ti sin tocarte.\n\n—Hmm —dice Baek—. Eso no se lo enseñé yo a nadie.' }
    ]
  },
  l2: {
    ch: 'Capítulo 2 · El Monte Loto Blanco', title: 'Lo que baja de noche', art: 'monte',
    text: `Pasan las semanas. Barres patios, repites mil veces el mismo movimiento, cruzas la espada de madera con Lin Xue cada amanecer. Pierdes siempre. Cada día por menos.

Una noche sin luna ves luz en el Pabellón de la Disciplina. El Anciano Gwak, guardián de los castigos, entrega a tres novicios atados y amordazados a unas figuras encapuchadas. Bajo una de las capas asoma tela carmesí.

Los «desertores» de los que tanto se habla en la secta no desertaron.`,
    choices: [
      { t: 'Denunciarlo al amanecer ante toda la secta', eff: { rect: 2, flag: 'gwak_expuesto' }, go: 'l3a',
        res: 'En el Patio de las Mil Espadas, ante trescientos discípulos, señalas al Anciano Gwak y cuentas lo que viste.\n\nEl silencio dura tres respiraciones.\n\n—Un perro de la frontera ladrando a un anciano —dice Gwak con suavidad, y se arremanga—. Permitidme que le enseñe modales.' },
      { t: 'Chantajearlo: tu silencio a cambio de sus técnicas secretas', eff: { somb: 2, amb: 2, xp: 100, pild: 2, flag: 'gwak_chantaje' }, go: 'l4',
        res: 'Gwak te escucha sin mover un músculo. Luego sonríe, casi con aprecio.\n\n—Por fin alguien práctico en esta montaña.\n\nDurante un mes te enseña de noche lo que la secta prohíbe de día: dónde presionar para que un brazo no vuelva a levantarse, cómo robar el aliento ajeno. Aprendes rápido. Los novicios siguen desapareciendo.' },
      { t: 'Seguir a los encapuchados montaña abajo', eff: { mist: 2, lazos: 1, flag: 'gwak_expuesto' }, go: 'l3b',
        res: 'Los sigues hasta una cueva tras la cascada. Dentro, una docena de novicios yacen en círculo alrededor de una piedra roja que late. Con cada latido, sus rostros se hunden un poco más.\n\nLa están alimentando con su qi. Una semilla de Núcleo Demoníaco.\n\nUn acólito de máscara dorada se vuelve hacia ti.' }
    ]
  },
  l3a: { ch: 'Capítulo 2 · El Monte Loto Blanco', title: 'El Patio de las Mil Espadas', art: 'monte',
    text: 'Trescientos discípulos forman un círculo. Lin Xue aprieta la empuñadura, pero la ley de la secta es clara: quien acusa a un anciano lo sostiene con el cuerpo.\n\nGwak avanza con las manos a la espalda.', fight: 'gwak', next: 'l4' },
  l3b: { ch: 'Capítulo 2 · El Monte Loto Blanco', title: 'La cueva tras la cascada', art: 'luna',
    text: 'El acólito mayor se interpone entre tú y los novicios. La piedra roja late más deprisa, como si tuviera hambre.', fight: 'acolito_mayor', next: 'l4' },
  l4: {
    ch: 'Capítulo 2 · El Monte Loto Blanco', title: 'La Matriarca', art: 'monte',
    text: () => F('gwak_chantaje')
      ? `La Matriarca Seol te recibe en su pabellón. Es ciega, y aun así sientes que te ve mejor que nadie.

—Has crecido deprisa. Demasiado, y en direcciones que mis ancianos no enseñan —dice—. No preguntaré. Representarás al Loto Blanco en el Torneo del Dragón Durmiente junto a Lin Xue.

Lin Xue te espera fuera. Ha visto tus nuevas técnicas en el entrenamiento, y ya no te mira igual.

—Eso que haces no es nuestro —dice—. No sé qué has pagado por ello. Espero que valiera la pena.`
      : `Gwak ha confesado. La Matriarca Seol, ciega y serena, te recibe en su pabellón con los novicios rescatados durmiendo en la sala contigua.

—El sello de la carta que traías era el de Gwak. Pero él solo obedecía —dice—. Alguien por encima de mí, en el Consejo de la Alianza, vende a nuestros hijos al Culto. Ve al Torneo del Dragón Durmiente. Representa al Loto Blanco y mantén los ojos abiertos.

Fuera te espera Lin Xue, con el hatillo ya hecho.

—No pienso dejar que vayas sol{@} —dice—. Además, alguien tiene que seguir ganándote por las mañanas.`,
    choices: [{ t: 'Bajar la montaña', eff: () => F('gwak_chantaje') ? {} : { lazos: 1, flag: { comp_lin: 1 } }, go: 'evo1' }]
  },

  // ───────────── CAPÍTULO 2 · HIERRO NEGRO ─────────────
  h1: {
    ch: 'Capítulo 2 · La Ciudad de Hierro Negro', title: 'El Foso', art: 'ciudad',
    text: () => `Hierro Negro no está construida: está excavada. Una ciudad entera dentro de una mina muerta, iluminada por diez mil farolillos, donde la única ley es la de la Unión Negra.

${F('comp_zarza') ? 'Zarza te guía por pasadizos que no figuran en ningún mapa. —Si alguien sabe quién es tu encapuchado, es la Dama Cuervo. Pero no recibe a nadie que no haya sangrado en el Foso.' : 'Un chiquillo te cobra tres monedas por un consejo: —Quien quiere saber algo, pregunta a la Dama Cuervo. Y la Dama Cuervo solo recibe a quien gana en el Foso.'}

El Foso es un pozo de arena negra rodeado de gradas. El campeón actual es un orco de las estepas al que llaman Colmillo de Hierro: lleva cuarenta combates sin perder y se limpia los dientes con una astilla de la clavícula del último aspirante.

Tienes tres noches antes de tu turno.`,
    choices: [
      { t: 'Entrenar y pelear limpio', eff: { rect: 1, xp: 30 }, go: 'h2',
        res: 'En Hierro Negro, pelear limpio es tan raro que las apuestas contra ti se disparan. Mejor. Menos ojos encima.' },
      { t: 'Untar tu arma con veneno paralizante', eff: { somb: 2, xp: 30, flag: 'foso_veneno' }, go: 'h2',
        res: 'Una boticaria tuerta te vende resina de loto negro. «Un rasguño y sus brazos pesarán como plomo», promete.\n\nNadie en las gradas se escandalizará. Aquí lo raro es no hacerlo.' },
      { t: 'Estudiar al campeón desde las gradas las tres noches', eff: { mist: 1, xp: 30, pild: 1, flag: 'foso_estudio' }, go: 'h2',
        res: 'Tres combates. Colmillo de Hierro siempre baja el hombro izquierdo antes de su gran agarre, y siempre respira dos veces antes de bajarlo.\n\nUn viejo apostador, divertido al verte tomar notas, te regala una píldora «por el espectáculo que vas a dar».' }
    ]
  },
  h2: { ch: 'Capítulo 2 · La Ciudad de Hierro Negro', title: 'Arena negra', art: 'ciudad',
    text: 'Las gradas rugen. Colmillo de Hierro escupe la astilla y abre los brazos, enormes, cubiertos de cicatrices.\n\n—Otro del camino —gruñe—. Seré rápido.',
    fight: 'campeon', mod: () => F('foso_veneno') ? { atk: 0.75, hp: 0.9 } : F('foso_estudio') ? { atk: 0.9 } : {}, next: 'h3' },
  h3: {
    ch: 'Capítulo 2 · La Ciudad de Hierro Negro', title: 'La Dama Cuervo', art: 'ciudad',
    text: `La Dama Cuervo te recibe en un salón forrado de libros de cuentas. Tiene el pelo blanco, las uñas lacadas en negro y la mirada de quien ha tasado ya tu vida al céntimo.

—Tu encapuchado llevaba un anillo del Consejo de la Alianza Marcial. Los muy justos también compran en mi ciudad —dice—. Te daré algo mejor que un nombre: una prueba. Mañana cruza el paso una caravana de «tributo» de la Alianza. Oro en los carros de delante. En los de atrás, gente encadenada, rumbo al Culto.

Te tiende una daga con el pomo en forma de cuervo.

—Asáltala con mis hombres. Lo que hagas con lo que encuentres dirá quién eres.`,
    choices: [
      { t: 'Liberar a los prisioneros; que la Unión se quede con el oro', eff: { rect: 2, lazos: 1, xp: 50, flag: 'caravana_libres' }, go: 'h4',
        res: 'Rompes las cadenas una a una. Campesinos, discípulos jóvenes de sectas pequeñas, una niña que no suelta tu manga.\n\nLos hombres de la Unión cargan el oro, encantados con el reparto. El capitán de la caravana, antes de huir, deja caer un estandarte: el del propio Gran Maestre de la Alianza.' },
      { t: 'Quedarte con una parte del oro y dejar a los prisioneros a su suerte', eff: { somb: 2, amb: 2, xp: 50, pild: 2 }, go: 'h4',
        res: 'El oro pesa. Las cadenas de los carros de atrás no son problema tuyo: alguien las abrirá, o no.\n\nNo miras atrás cuando la caravana queda abandonada en el paso. Casi no oyes las voces.' },
      { t: 'Capturar al capitán e interrogarlo hasta entender toda la red', eff: { mist: 2, xp: 50, flag: 'sospecha' }, go: 'h4',
        res: 'El capitán habla antes de que termines la primera pregunta. Las órdenes vienen selladas por el Gran Maestre Jin Tae-san en persona. Los prisioneros alimentan «semillas» del Culto. Y el Torneo del Dragón Durmiente, dice, «es donde todo se cierra».\n\nLos hombres de la Unión liberan a los cautivos por su cuenta: también tienen familia.' }
    ]
  },
  h4: {
    ch: 'Capítulo 2 · La Ciudad de Hierro Negro', title: 'Una invitación falsa', art: 'ciudad',
    text: () => `La Dama Cuervo desliza sobre la mesa una invitación al Torneo del Dragón Durmiente. El sello es perfecto. Es falso.

—Alguien del Consejo quiere lo que llevas en el pecho. Ve y averigua por qué. La Unión Negra cobra sus favores, pero hoy invita la casa.

${F('comp_zarza') ? 'Zarza te espera en la salida, con las deudas saldadas por primera vez en su vida y sin saber muy bien qué hacer con tanta libertad.\n\n—Sigo contigo —dice—. Alguien tiene que vigilarte la espalda. Y los bolsillos.'
        : F('zarza') === 'libre' ? 'En la salida, apoyada en un farol, te espera una cara conocida.\n\n—Te debía una —dice Zarza—. He saldado mis cuentas con la Unión, y resulta que no sé estarme quieta. ¿Hay sitio?' : 'Sales de Hierro Negro como entraste: sin nadie a tu lado. Pero con un nombre entre los dientes.'}`,
    choices: [
      { t: 'Aceptar a Zarza a tu lado', req: () => F('zarza') === 'libre', reqT: 'Solo si dejaste ir a Zarza', eff: { lazos: 2, flag: { comp_zarza: 1 } }, go: 'evo1' },
      { t: 'Partir hacia el torneo', go: 'evo1' }
    ]
  },

  // ───────────── CAPÍTULO 2 · TORRE DE MARFIL ─────────────
  t1: {
    ch: 'Capítulo 2 · La Torre de Marfil', title: 'El Espejo del Umbral', art: 'torre',
    text: () => `La Torre de Marfil se alza en el centro de un lago, rodeada de anillos de piedra que flotan girando despacio. Los magos del Oeste no admiten a «bárbaros del qi».

Te cuela por una poterna un aprendiz semielfo de orejas puntiagudas y túnica remendada.

—Kael. Caído en desgracia, a tu servicio —se presenta—. Me expulsan el mes que viene por hacer preguntas. Tú hueles a una respuesta enorme. Y a otro mundo, si la nariz no me engaña.

Para subir hay que cruzar el Espejo del Umbral. Tu reflejo sale del cristal, idéntico a ti, y habla con tu voz:

—¿Qué quieres de verdad?`,
    choices: [
      { t: '«Que nadie vuelva a arder como ardió aquella aldea.»', eff: { rect: 1, xp: 30 }, go: 't2', res: 'El reflejo asiente despacio.\n\n—Entonces demuéstrame que puedes proteger algo. Empieza por ti.' },
      { t: '«Poder. Suficiente para no volver a temer a nadie.»', eff: { somb: 1, amb: 1, xp: 30 }, go: 't2', res: 'El reflejo sonríe con tu boca.\n\n—Al menos eres sincer{@}. Ven a cogerlo.' },
      { t: '«Entender qué es lo que llevo dentro.»', eff: { mist: 1, xp: 30 }, go: 't2', res: 'El reflejo ladea la cabeza, curioso.\n\n—Entonces mírame bien. Soy lo primero que tienes que entender.' },
      { t: '«Volver a casa. Nada más.»', eff: { lazos: 1, xp: 30 }, go: 't2', res: 'El reflejo te mira con algo parecido a la pena.\n\n—¿Y si cuando por fin puedas volver ya no quieres? Ven. Vamos a averiguarlo.' }
    ]
  },
  t2: { ch: 'Capítulo 2 · La Torre de Marfil', title: 'Contra ti', art: 'torre',
    text: 'El reflejo adopta tu guardia. Conoce cada uno de tus movimientos. Kael, pegado a la pared, toma notas a toda prisa.', fight: 'reflejo', next: 't3' },
  t3: {
    ch: 'Capítulo 2 · La Torre de Marfil', title: 'La Archimaga', art: 'torre',
    text: `La Archimaga Selwyn examina tu pecho con una lente de cristal negro. No pide permiso.

—Fascinante. Vuestro qi y nuestro maná son la misma agua. Algo, hace mil años, partió el río en dos, y este fragmento es un trozo del dique. —Deja la lente—. Se quedará aquí. Contigo, naturalmente. En una sala cómoda.

Esa noche, Kael te lleva a los sótanos. Tras una reja de plata, una criatura de agua y luz, del tamaño de un niño, gira encadenada a una rueda de runas. Con cada vuelta, las lámparas de la Torre brillan un poco más.

—Espíritus elementales —susurra Kael—. Así se alimenta toda nuestra magia. Por preguntar por esto me expulsan.`,
    choices: [
      { t: 'Romper las cadenas del espíritu, aunque la Torre te declare su enemigo', eff: { rect: 2, lazos: 1, xp: 50, flag: { espiritu_libre: 1, comp_kael: 1 } }, go: 't4',
        res: 'Las runas estallan una a una. El espíritu te rodea una vez, te roza la frente con algo que no es exactamente una mano, y se disuelve hacia el lago. Media Torre se queda a oscuras.\n\n—Ya no me expulsan —jadea Kael mientras corréis—. Ahora me ejecutan. ¡Lo mejor que he hecho en mi vida!' },
      { t: 'Aprovechar el apagón para robar el grimorio prohibido', eff: { somb: 1, amb: 2, xp: 50, pild: 1, flag: 'grimorio' }, go: 't4',
        res: 'Haces saltar una sola runa: la justa para que parpadeen las luces. Mientras los magos corren al sótano, tú subes a la biblioteca sellada.\n\nEl grimorio pesa como una lápida. Kael te ve salir con él bajo el brazo y con el espíritu aún encadenado a tu espalda.\n\n—No eres mejor que ellos —dice. No te sigue.' },
      { t: 'Negociar con Selwyn: estudiar juntos, sin jaulas para nadie', eff: { mist: 2, xp: 50, flag: { selwyn_trato: 1, comp_kael: 1, sospecha: 1 } }, go: 't4',
        res: 'Hablas durante horas. De ríos partidos, de diques, de que una torre que encadena espíritus se parece demasiado a un culto que devora novicios.\n\nSelwyn no libera al espíritu. Pero te deja marchar, y te da algo a cambio de lo que ha aprendido: sus espías dicen que el Gran Maestre de la Alianza reúne tablillas en secreto.\n\n—Llévate a Kael —añade—. Aquí solo sabe hacer preguntas incómodas.' }
    ]
  },
  t4: {
    ch: 'Capítulo 2 · La Torre de Marfil', title: 'El lago a la espalda', art: 'torre',
    text: () => `Dejas atrás el lago y sus anillos de piedra.

${F('comp_kael') ? 'Kael camina a tu lado con un zurrón lleno de libros «tomados en préstamo» y la sonrisa de quien por fin ha cambiado un techo por un horizonte.\n\n—El Torneo del Dragón Durmiente —lee en un pasquín—. El premio de este año es «una tablilla de jade de gran antigüedad». Qué casualidad tan poco casual.'
        : 'Viajas sol{@}, con el grimorio envuelto en tela. Algunas páginas susurran por la noche.\n\nEn un cruce, un pasquín anuncia el Torneo del Dragón Durmiente. El premio: «una tablilla de jade de gran antigüedad».'}`,
    choices: [{ t: 'Poner rumbo al torneo', go: 'evo1' }]
  },

  // ───────────── PRIMERA EVOLUCIÓN ─────────────
  evo1: {
    ch: 'Despertar', title: 'El Despertar del Núcleo', art: 'nucleo',
    text: `Una noche, en mitad del camino, el fragmento despierta.

El qi que has ido reuniendo gira sobre sí mismo, se aprieta, se enciende. En tu vientre se forma un núcleo. Y un núcleo no miente: toma la forma de lo que has hecho, no de lo que dices ser.

Cada decisión que tomaste desde la noche de la Luna Roja está ahí, trazando el camino.`,
    evolve: 1, next: 'c3_1'
  },

  // ───────────── CAPÍTULO 3 ─────────────
  c3_1: {
    ch: 'Capítulo 3 · El Torneo del Dragón Durmiente', title: 'Longmen, la Puerta del Dragón', art: 'torneo',
    text: () => `Longmen hierve. Cien sectas, mil estandartes y, este año, invitados «en señal de amistad»: caballeros del Oeste, arqueros elfos del Bosque de Cristal, campeones de los clanes orcos de la estepa. En el palco de honor, vestido de blanco inmaculado, el Gran Maestre Jin Tae-san saluda a la multitud: el hombre más respetado del Murim.

A su lado, sobre un cojín de seda, la tablilla de jade. El segundo fragmento. El tuyo late al verla.

${hasComp() ? lista(comps()) + (comps().length > 1 ? ' te acompañan' : ' te acompaña') + ' entre el gentío.' : 'Estás sol{@} entre el gentío. Nadie te cubre la espalda.'}

Queda una noche antes de la primera ronda.`,
    choices: [
      { t: 'Entrenar hasta el alba con los tuyos', req: hasComp, reqT: 'Necesitas al menos un compañero', eff: { lazos: 2, xp: 40 }, go: 'c3_2',
        res: () => `${comps()[0]} no te deja ganar ni un asalto. Al amanecer estás molid{@}, y más preparad{@} que nunca.\n\nHay cosas que solo se aprenden cuando alguien se molesta en golpearte con cariño.` },
      { t: 'Meditar a solas y repasar cada movimiento', eff: { rect: 1, xp: 40 }, go: 'c3_2',
        res: 'Respiras. Repites. Corriges. La disciplina es aburrida hasta el día en que te salva la vida.' },
      { t: 'Colarte en el pabellón del premio para examinar la tablilla', eff: { mist: 2, xp: 40, flag: 'sospecha' }, go: 'c3_2',
        res: 'La tablilla es auténtica: tu fragmento casi te arranca el pecho al acercarte.\n\nPero ves algo más. Bajo las túnicas blancas, los guardias de Jin llevan al cuello un talismán con una luna roja.\n\nSales sin hacer ruido, con el estómago helado.' },
      { t: 'Sabotear la montura y las correas de tu primer rival', eff: { somb: 1, amb: 1, xp: 40, flag: 'sabotaje' }, go: 'c3_2',
        res: 'Un corte a medias en la correa del escudo. Unas hierbas en el heno del grifo. Nada que pueda probarse.\n\nGanar es ganar.' }
    ]
  },
  c3_2: { ch: 'Capítulo 3 · El Torneo del Dragón Durmiente', title: 'Primera ronda', art: 'torneo',
    text: () => `Tu primer rival viene del otro lado del mundo: Sir Aldric, caballero de los Reinos del Oeste, con armadura de placas y una lanza bendecida.${F('sabotaje') ? ' Ha llegado a pie, de mal humor, y la correa de su escudo cuelga floja.' : ''}\n\n—En mi tierra decimos que el acero no miente —dice, bajando la visera—. Veamos qué dice el tuyo.`,
    fight: 'aldric', mod: () => F('sabotaje') ? { def: 0.5, atk: 0.85 } : {}, next: 'c3_3' },
  c3_3: {
    ch: 'Capítulo 3 · El Torneo del Dragón Durmiente', title: 'Semifinal: nieve y acero', art: 'torneo',
    text: () => `En la semifinal, al otro lado de la arena, hay una túnica blanca y una vaina nevada.

Lin Xue.

${F('comp_lin') ? '—No te atrevas a contenerte —dice, y casi sonríe—. Llevo meses esperando esto.' : F('gwak_chantaje') ? '—He visto lo que te enseñó Gwak —dice con frialdad—. Vamos a comprobar si valió el precio.' : '—Quien viaja de paso ha llegado lejos —dice—. Enséñame cómo.'}

Sabes una cosa que el público ignora: ${F('ruta') === 'loto' ? 'de tanto entrenar con ella' : 'por cómo la viste pelear en el desfiladero'}, conoces la vieja lesión de su hombro derecho.`,
    choices: [
      { t: 'Combate honorable, sin guardarte nada', eff: { rect: 2, lazos: 1, flag: 'lin_respeto' }, go: 'c3_3f' },
      { t: 'Ir a por su hombro herido desde el primer golpe', eff: { somb: 2, amb: 1, flag: 'lin_rencor' }, go: 'c3_3f',
        res: 'El primer golpe es al hombro. El segundo también. Lin Xue aprieta los dientes, y ves en sus ojos el momento exacto en que entiende que lo sabías.' },
      { t: 'Susurrarle la verdad en el primer cruce: este torneo es una trampa', req: () => F('sospecha') || F('comp_lin') || F('lin_confia'), reqT: 'Necesitas sospechas fundadas o su confianza',
        eff: { mist: 1, lazos: 2, xp: 130, flag: { lin_plan: 1, lin_respeto: 1 } }, go: 'c3_4',
        res: 'Las espadas se traban y vuestras caras quedan a un palmo.\n\n—Los guardias de Jin sirven al Culto. El sello de la carta era del Consejo. Algo va a pasar en la final.\n\nLin Xue no cambia el gesto. Tres intercambios después, su espada «resbala» y sale volando de la arena.\n\n—Me rindo —anuncia, y al cruzarse contigo añade en voz baja—: Estaré en la grada norte, con la mano en la empuñadura.' }
    ]
  },
  c3_3f: { ch: 'Capítulo 3 · El Torneo del Dragón Durmiente', title: 'Nieve sobre el Loto', art: 'torneo',
    text: 'La espada de Lin Xue sale de la vaina con un sonido de hielo que se quiebra. La arena entera contiene el aliento.',
    fight: 'linxue', mod: () => F('lin_rencor') ? { atk: 0.8, hp: 0.85 } : {}, next: 'c3_4' },
  c3_4: {
    ch: 'Capítulo 3 · El Torneo del Dragón Durmiente', title: 'El cielo se tiñe', art: 'luna',
    text: `No hay final.

Cuando subes al estrado a recibir la tablilla, el mediodía se oscurece. La luna, que no debería estar ahí, cuelga roja sobre Longmen.

Las puertas de la arena se abren. Desde dentro. Los guardias de Jin Tae-san se quitan las túnicas blancas: debajo, carmesí. El Culto entra como una marea, y el Gran Maestre, el hombre más respetado del Murim, recoge la tablilla del cojín con toda calma y se dirige hacia la salida.

En la puerta le espera una figura alta, de cabello blanco y ojos como brasas. El Patriarca Ye Mo le pone una mano en el hombro, como a un hermano.

Gradas en llamas. Gente atrapada. La tablilla alejándose. Jin dándote la espalda.`,
    choices: [
      { t: 'Proteger a los heridos y abrir una salida para el público', eff: { rect: 2, lazos: 2, flag: 'longmen_salvado' }, go: 'c3_5',
        res: 'La tablilla puede esperar. La gente no.\n\nDerribas un portón, sostienes una viga, cargas a hombros a un rival de la primera ronda. Cientos escapan por la brecha que abres. Jin y Ye Mo desaparecen con el fragmento.\n\nEntonces algo cae del cielo frente a ti, envuelto en niebla roja.' },
      { t: 'Lanzarte a por la tablilla antes de que crucen la puerta', eff: { amb: 2, somb: 1, flag: 'frag2' }, go: 'c3_5',
        res: 'Corres sobre las cabezas de la multitud. Jin se vuelve un instante tarde: tus dedos se cierran sobre el jade y tiras.\n\nEl segundo fragmento se funde en tu pecho junto al primero. El mundo se vuelve nítido, afilado, pequeño. A tu espalda, las gradas se derrumban con gente dentro.\n\nYe Mo te mira con interés y hace un gesto. Algo cae del cielo frente a ti.' },
      { t: 'Perseguir a Jin Tae-san y arrancarle la verdad', eff: { mist: 2, flag: 'verdad' }, go: 'c3_5',
        res: 'Lo alcanzas en el túnel.\n\n—¿Por qué? —es todo lo que dices.\n\nJin se detiene. Por un momento parece solo un viejo cansado.\n\n—Porque el maestro Mu Cheon nos crio a Ye Mo y a mí como a hermanos, y luego nos escondió el Sutra a los dos. Uno fundó un culto. El otro, una alianza. Queremos lo mismo: abrir el cielo y arreglar lo que él no se atrevió a arreglar.\n\nSe va. Y lo que guardaba su retirada cae frente a ti.' }
    ]
  },
  c3_5: { ch: 'Capítulo 3 · El Torneo del Dragón Durmiente', title: 'El Heraldo', art: 'luna',
    text: () => `Un Heraldo de la Luna Roja: uno de los siete discípulos directos del Patriarca. Su máscara sí tiene boca, y sonríe.

—El portador —dice—. Mi señor quiere saber cuánto has crecido.${F('lin_plan') ? '\n\nDesde la grada norte llega un destello blanco: Lin Xue cae sobre la escolta del Heraldo y te deja el camino libre.' : ''}`,
    fight: 'heraldo', mod: () => F('lin_plan') ? { hp: 0.85 } : {}, next: 'c3_6' },
  c3_6: {
    ch: 'Capítulo 3 · El Torneo del Dragón Durmiente', title: 'Cenizas de Longmen', art: 'torneo',
    text: () => `El Heraldo se deshace en niebla roja. Longmen humea.

La Alianza Marcial ha muerto hoy: la mitad de las sectas no cree que su Gran Maestre sea un traidor, y la otra mitad no cree en nada. ${F('frag2') ? 'Llevas dos fragmentos en el pecho, y a veces oyes una voz que no es la tuya.' : 'Jin y Ye Mo tienen el segundo fragmento. Tú, el primero.'}

Queda el tercero. Todas las leyendas lo sitúan en el mismo lugar: las Ruinas del Cielo Roto, en el Yermo de Ceniza, donde duerme el último dragón.

${F('lin_rencor') ? 'Lin Xue te encuentra entre los escombros, con el hombro vendado.\n\n—Hoy has salvado gente o la has dejado morir, ya no lo sé. Pero sé cómo ganaste nuestro combate —dice—. Cuando esto acabe, tú y yo tenemos una cuenta.\n\nSe marcha sola hacia el norte.'
        : F('comp_lin') ? 'Lin Xue limpia su espada a tu lado. —Al norte, entonces —dice—. Sigo contigo.'
          : 'Lin Xue te encuentra entre los escombros. Se ha arrancado de la túnica el bordado de la Alianza.\n\n—Todo en lo que creía tenía un precio —dice—. Tú, al menos, vas de frente. Voy contigo al norte, si me dejas.'}`,
    choices: [
      { t: 'Aceptar la espada de Lin Xue a tu lado', req: () => !F('lin_rencor') && !F('comp_lin'), reqT: 'Lin Xue no te sigue', eff: { lazos: 2, flag: { comp_lin: 1 } }, go: 'c4_1' },
      { t: 'Partir hacia el Yermo de Ceniza', go: 'c4_1' }
    ]
  },

  // ───────────── CAPÍTULO 4 ─────────────
  c4_1: {
    ch: 'Capítulo 4 · Las Ruinas del Cielo Roto', title: 'Hoguera en el Yermo', art: 'ruinas',
    text: () => `El Yermo de Ceniza es una llanura gris donde no canta ningún pájaro. En el horizonte, el cielo tiene una cicatriz: una línea pálida, torcida, que no se mueve con las nubes.

Acampáis al abrigo de una columna caída, más vieja que cualquier reino.

${hasComp() ? lista(comps()) + (comps().length > 1 ? ' se sientan' : ' se sienta') + ' al otro lado del fuego.' : 'El fuego crepita para ti sol{@}.'} Mañana, las ruinas.`,
    choices: [
      { t: 'Compartir la guardia y hablar hasta tarde', req: hasComp, reqT: 'Necesitas al menos un compañero', eff: { lazos: 3, xp: 30 }, go: 'c4_2',
        res: () => ({
          'Lin Xue': 'Lin Xue te habla de su hermana pequeña, que ingresó en la secta el mismo año que ella y «desertó» una noche de invierno. Nunca había atado cabos hasta lo de Gwak.\n\n—Cuando esto acabe —dice—, quiero fundar algo donde los ancianos también rindan cuentas.',
          'Zarza': 'Zarza te enseña a abrir un candado con una horquilla, y luego, sin venir a cuento, te dice que nunca ha tenido un sitio al que volver.\n\n—No te pongas sentimental —avisa—. Solo digo que este fuego no está mal.',
          'Kael': 'Kael dibuja en la ceniza dos ríos que nacen de uno solo.\n\n—Si el qi y el maná vuelven a juntarse, la Torre no necesitará jaulas. Ni vuestras sectas, píldoras hechas con gente. Solo hay que convencer al cielo.'
        }[comps()[0]]) + '\n\nTe duermes con la sensación, rara y nueva, de no estar sol{@}.' },
      { t: 'Meditar bajo la cicatriz del cielo', eff: { mist: 2, xp: 30 }, go: 'c4_2',
        res: 'Cierras los ojos y escuchas. La grieta emite algo: no un sonido, sino un tirón, como el de una marea. Dos mareas, en realidad, que tiran en direcciones opuestas.\n\nPor un instante entiendes que el mundo lleva mil años en tensión, como una cuerda de arco.' },
      { t: 'Entrenar hasta sangrar: nadie volverá a ser más fuerte que tú', eff: { amb: 3, xp: 50 }, go: 'c4_2',
        res: 'Mil golpes contra la columna caída. Luego otros mil. La piedra, más vieja que los reinos, acaba agrietándose.\n\nTú no.' }
    ]
  },
  c4_2: {
    ch: 'Capítulo 4 · Las Ruinas del Cielo Roto', title: 'El regalo del Patriarca', art: 'luna',
    text: `A medianoche hay un hombre sentado junto a tu fuego, abanicándose. No lo oíste llegar.

—Traigo un presente de mi señor Ye Mo, y ninguna mala intención —dice el Emisario, y abre un cofre de laca.

Dentro late una esfera roja, del tamaño de un corazón. Un Núcleo Demoníaco: el qi destilado de cientos de vidas.

—Cómetelo y alcanzarás en una noche lo que a otros les cuesta cuarenta años. Mi señor no te pide nada a cambio. Dice que, cuando llegue el momento, tú sol{@} comprenderás quién tiene razón.

El núcleo huele a hierro y a lluvia.`,
    choices: [
      { t: 'Devorar el Núcleo Demoníaco', eff: { somb: 3, amb: 2, xp: 160, st: { fue: 2, agi: 2, esp: 2 }, flag: 'pacto' }, go: 'c4_3',
        res: 'Sabe a tormenta. Cien voces gritan dentro de ti durante un instante eterno, y luego callan, y lo que queda es fuerza. Limpia, inmensa, tuya.\n\nEl Emisario hace una reverencia profunda.\n\n—Bienvenid{@} —dice, y se deshace en la noche.\n\nTardas un rato en darte cuenta de que tu sombra ya no se mueve exactamente cuando tú te mueves.' },
      { t: 'Destruirlo: ahí dentro hay gente', eff: { rect: 3, flag: 'nucleo_destruido' }, go: 'c4_2f',
        res: 'Lo aplastas contra la piedra. Al romperse no estalla: suspira. Cientos de luces pequeñas suben hacia la cicatriz del cielo y se pierden.\n\nEl Emisario cierra el abanico con un chasquido.\n\n—Qué desperdicio —dice—. Y qué descortesía.' },
      { t: 'Sellarlo y guardarlo para estudiarlo', eff: { mist: 2, amb: 1, flag: 'nucleo_sellado' }, go: 'c4_2f',
        res: 'Trazas sobre el cofre el sello que aprendiste observando tu propio fragmento. El latido rojo se apaga hasta ser un rescoldo.\n\n—Mi señor lo ofrecía para ser usado, no archivado —dice el Emisario, y el abanico se abre con filo de acero—. Tendré que recuperarlo.' }
    ]
  },
  c4_2f: { ch: 'Capítulo 4 · Las Ruinas del Cielo Roto', title: 'Abanico de acero', art: 'luna',
    text: 'El Emisario se levanta sin prisa. Las varillas de su abanico son cuchillas, y cada una gotea algo oscuro.', fight: 'emisario', next: 'c4_3' },
  c4_3: {
    ch: 'Capítulo 4 · Las Ruinas del Cielo Roto', title: 'Yaoguang', art: 'dragon',
    text: () => `Las ruinas son un anfiteatro de columnas rotas bajo la grieta. En el centro, enroscado alrededor de un altar, hay un esqueleto de dragón tan grande que al principio lo tomas por una colina.

Luego los huesos se llenan de luz, y la colina abre los ojos.

—Un invocado —dice una voz que hace vibrar el suelo—. Hueles a otro cielo. Soy Yaoguang. Vi cómo el Primer Emperador partía el cielo para quedarse con el qi y la magia a la vez. Vi cómo el cielo lo partía a él. Guardo el último fragmento desde entonces.${F('pacto') ? '\n\nSus ojos se entornan.\n\n—Hueles a cientos de muertos, criatura.' : ''}

La cabeza inmensa desciende hasta quedar frente a ti.

—Dime: ¿qué harás con el cielo cuando lo tengas en las manos?`,
    choices: [
      { t: '«Cerrar la herida, aunque me cueste todo lo que soy.»', eff: { rect: 2 }, go: 'c4_3f' },
      { t: '«Gobernarlo. Alguien tiene que hacerlo bien por una vez.»', eff: { amb: 3 }, go: 'c4_3f' },
      { t: '«Antes de hacer nada, preguntarle por qué se rompió.»', eff: { mist: 2 }, go: 'c4_3f' },
      { t: '«No lo sostendré sol{@}. Lo compartiré con quienes caminan conmigo.»', req: hasComp, reqT: 'Necesitas al menos un compañero', eff: { lazos: 3 }, go: 'c4_3f' }
    ]
  },
  c4_3f: { ch: 'Capítulo 4 · Las Ruinas del Cielo Roto', title: 'La prueba del dragón', art: 'dragon',
    text: '—Palabras —retumba Yaoguang, y se alza, y sus huesos de luz tapan la grieta—. Mil portadores me dieron palabras hermosas. Ahora enséñame de qué estás hech{@}.',
    fight: 'dragon', next: 'c4_4' },
  c4_4: {
    ch: 'Capítulo 4 · Las Ruinas del Cielo Roto', title: 'El último fragmento', art: 'dragon',
    text: () => `El eco del dragón se pliega sobre sí mismo, satisfecho.

—Suficiente.

El tercer fragmento desciende del altar y se hunde en tu pecho. ${F('frag2') ? 'Tres. Estás complet{@}.' : 'Dos de tres. El último lo tienen Jin y Ye Mo.'}

—Escucha lo que el viejo no tuvo tiempo de decirte —dice Yaoguang—. La grieta es la puerta por la que caíste, sí. Pero el Sutra no es un sello ni una llave. Es una pregunta, y quien lo reúne debe responderla en la Cumbre del Cielo Roto: cerrar la herida, quedarse con ella o dejar que los dos ríos vuelvan a ser uno. Mu Cheon lo supo, y tuvo miedo de que sus dos discípulos respondieran mal. Por eso huyó.

${F('pacto') ? 'El dragón te observa un largo rato.\n\n—No puedo bendecir a quien lleva tantas vidas en el vientre. Pero no te detendré. Hasta los devoradores pueden elegir bien al final.'
        : 'Te roza la frente con el hocico, y algo fresco y antiguo te recorre los meridianos.\n\n—Llevas mi bendición. No te hará más fuerte. Te hará más difícil de torcer.'}

Los huesos se apagan. La colina vuelve a ser colina.`,
    choices: [{ t: 'Sentir cómo el núcleo vuelve a cambiar', eff: () => F('pacto') ? { xp: 30 } : { xp: 30, flag: 'bendicion' }, go: 'evo2' }]
  },

  // ───────────── SEGUNDA EVOLUCIÓN ─────────────
  evo2: {
    ch: 'Trascendencia', title: 'El Alma Naciente', art: 'nucleo',
    text: `Con el poder de los fragmentos, tu núcleo se resquebraja como un huevo. Lo que nace dentro es tu forma definitiva.

La primera vez, el núcleo preguntó qué habías hecho. Esta vez pregunta otra cosa: para qué. ¿Por quienes caminan a tu lado? ¿O por la cumbre, y nada más que la cumbre?`,
    evolve: 2, next: 'c5_1'
  },

  // ───────────── CAPÍTULO 5 ─────────────
  c5_1: {
    ch: 'Capítulo 5 · La Cumbre del Cielo Roto', title: 'Bajo la grieta', art: 'cielo',
    text: () => `La Cumbre es una aguja de roca negra clavada justo debajo de la grieta. Aquí arriba el cielo no es azul ni negro: es una herida abierta por la que se ven estrellas que no son de este mundo.

El ejército carmesí del Culto y los estandartes blancos de los leales a Jin cubren la ladera, juntos por primera vez. ${hasComp() ? lista(comps()) + (comps().length > 1 ? ' se plantan' : ' se planta') + ' en el único sendero.\n\n—Sube —te dicen—. De aquí no pasa nadie.' : 'Te abres paso sol{@}, peldaño a peldaño, dejando un rastro que nadie se atreve a seguir.'}

En la cima te esperan dos hombres, espalda con espalda, como debieron de entrenar de niños: Jin Tae-san, de blanco, y Ye Mo, de rojo.

—El invocado de nuestro maestro —dice Ye Mo, casi con afecto—. Llegas a tiempo. ${F('frag2') ? 'Tienes los tres fragmentos. Nosotros, cuarenta años de preparación.' : 'Tú tienes dos fragmentos. Nosotros, uno, y cuarenta años de preparación.'} Entrégalos y verás nacer un mundo nuevo.`,
    choices: [
      { t: 'Desenvainar. No habrá mundo nuevo sobre tantos muertos', eff: { rect: 1 }, go: 'c5_jin' },
      { t: 'Decirles las últimas palabras de su maestro', req: () => F('verdad') || S.karma.mist >= 7, reqT: 'Requiere conocer su pasado o Misterio 7', eff: { mist: 2, flag: 'jin_duda' }, go: 'c5_duda' },
      { t: 'Arrodillarte ante Ye Mo y ofrecerle tu fuerza', req: () => F('pacto') || S.karma.somb >= 7, reqT: 'Requiere el Núcleo Demoníaco o Sombra 7', eff: { somb: 2, flag: 'culto_aliado' }, go: 'c5_culto' }
    ]
  },
  c5_duda: {
    ch: 'Capítulo 5 · La Cumbre del Cielo Roto', title: 'Dos discípulos', art: 'cielo',
    text: `—Mu Cheon murió en mis brazos —dices—. Dijo: «Fui maestro de dos necios». Y sonreía al decirlo.

El viento silba entre los dos hombres.

—También dijo que el Sutra no es una llave. Es una pregunta. Os lo escondió porque temía que respondierais mal. Y mirad a vuestro alrededor: sectas que venden novicios, píldoras hechas con gente. Tenía razón.

Jin Tae-san baja la espada. Le tiembla la mano.

—Cuarenta años —murmura—. Hermano… ¿cuántos niños han sido?

—Los necesarios —responde Ye Mo, y le hunde la palma en la espalda.

Jin cae de rodillas. Con el último aliento, arroja hacia ti lo que guardaba en la manga: una píldora dorada, y el anillo del Consejo.`,
    choices: [{ t: 'Enfrentarte al Patriarca', eff: { pild: 2, xp: 250 }, go: 'c5_yemo' }]
  },
  c5_culto: {
    ch: 'Capítulo 5 · La Cumbre del Cielo Roto', title: 'La rodilla en tierra', art: 'luna',
    text: `Hincas la rodilla en la roca negra.

Ye Mo ríe, encantado. Jin Tae-san frunce el ceño.

—Hermano, no necesitamos a esta criatura. Solo lo que lleva dentro.

—Te equivocas, como siempre —dice el Patriarca—. Mira sus ojos. Entiende el hambre mejor que tú. —Se vuelve hacia ti—. Demuéstrame tu lealtad. Mi hermano lleva cuarenta años creyendo que al final compartiré el cielo con él.

Jin palidece y alza la espada.`,
    choices: [{ t: 'Atacar al Gran Maestre', go: 'c5_jin' }]
  },
  c5_jin: { ch: 'Capítulo 5 · La Cumbre del Cielo Roto', title: 'El Gran Maestre', art: 'cielo',
    text: () => F('culto_aliado')
      ? 'Jin Tae-san se pone en guardia: la postura perfecta que imitan mil discípulos.\n\n—Traicionado por mi hermano y por un cachorro del camino —dice—. Sea. Moriré como Gran Maestre.'
      : 'Ye Mo se aparta con un gesto cortés.\n\n—Tú primero, hermano. Yo vigilaré la grieta.\n\nJin Tae-san avanza. Su espada ha presidido cuarenta años de paz comprada.\n\n—No lo entiendes —dice—. Todo lo que hice fue para que nadie volviera a necesitar un torneo, una secta, una guerra.',
    fight: 'jin', next: () => F('culto_aliado') ? 'c5_traicion' : 'c5_yemo_pre' },
  c5_yemo_pre: {
    ch: 'Capítulo 5 · La Cumbre del Cielo Roto', title: 'El hermano que queda', art: 'cielo',
    text: `Jin Tae-san cae sobre una rodilla, con la espada rota.

—Hermano… —llama.

Ye Mo ni siquiera lo mira. Recoge del suelo el fragmento que Jin custodiaba y lo sopesa en la palma.

—Cuarenta años creyendo que lo compartiríamos —dice con suavidad—. Siempre fuiste el más ingenuo de los dos.

El Gran Maestre te mira, y en sus ojos solo queda vergüenza. Te lanza una píldora dorada.

—Acaba con lo que yo empecé —susurra.`,
    choices: [{ t: 'Enfrentarte al Patriarca', eff: { pild: 1 }, go: 'c5_yemo' }]
  },
  c5_traicion: {
    ch: 'Capítulo 5 · La Cumbre del Cielo Roto', title: 'Heraldo o soberano', art: 'luna',
    text: `Jin Tae-san yace a tus pies. Ye Mo aplaude despacio.

—Magnífico. Ahora, los fragmentos. —Extiende la mano—. Te nombraré Heraldo, por encima de los otros siete. Reinarás sobre lo que quede del Murim, bajo mi cielo.

Bajo su cielo.

Los fragmentos laten en tu pecho. Su mano sigue extendida. Está confiado: es la primera vez que le ves bajar la guardia.`,
    choices: [
      { t: 'Entregarle los fragmentos y servir', eff: { somb: 2 }, go: 'fin_heraldo' },
      { t: 'Hundirle la mano en el pecho: no has llegado hasta aquí para arrodillarte', eff: { amb: 3, flag: 'traicion_yemo' }, go: 'c5_yemo' }
    ]
  },
  c5_yemo: { ch: 'Capítulo 5 · La Cumbre del Cielo Roto', title: 'El Patriarca de la Luna Roja', art: 'luna',
    text: () => `${F('traicion_yemo') ? 'Ye Mo retrocede con tu marca sangrando en el pecho, y por primera vez ves su rostro sin sonrisa.\n\n—Bien —dice—. Así es como se hereda un cielo.' : 'Ye Mo se quita la capa. La grieta, sobre su cabeza, se tiñe de rojo.\n\n—Mi maestro tuvo miedo. Mi hermano tuvo escrúpulos —dice—. Yo solo tengo hambre. Ven.'}${F('longmen_salvado') ? '\n\nDesde la ladera sube un clamor: los que salvaste en Longmen han venido, y sostienen el sendero junto a los tuyos.' : ''}`,
    fight: 'yemo', mod: () => (F('traicion_yemo') || F('jin_duda')) ? { hp: 0.88 } : {}, next: 'c5_fin' },
  c5_fin: {
    ch: 'Capítulo 5 · La Cumbre del Cielo Roto', title: 'La pregunta', art: 'cielo',
    text: () => `Ye Mo cae. ${F('frag2') ? 'Los tres fragmentos arden a la vez en tu pecho y se funden.' : 'El último fragmento rueda hasta tus pies y, al tocarlo, los tres se funden.'}

El Sutra del Cielo Roto se abre dentro de ti como un libro. No contiene técnicas. Contiene una sola página, y en ella una sola pregunta.

La grieta desciende hasta rozarte la frente. A un lado ruge el río del qi. Al otro, el río del maná. Ninguno de los dos consigue arrastrarte: no eres de aquí.

Y al fondo de la grieta, pequeña y nítida, ves una calle mojada, un semáforo en verde, las luces de tu ciudad.

${hasComp() ? lista(comps()) + (comps().length > 1 ? ' llegan' : ' llega') + ' a la cima, sangrando y en pie.' : 'Estás sol{@} en la cima del mundo.'}

Nadie puede responder por ti.`,
    choices: [
      { t: 'Cruzar y cerrar la herida desde el otro lado: reparar el cielo y volver a casa', go: 'fin_sello' },
      { t: 'Unir los dos ríos: que el qi y la magia vuelvan a ser uno, y la puerta quede abierta', req: () => F('bendicion') || S.karma.mist >= 8, reqT: 'Requiere la bendición del dragón o Misterio 8', go: 'fin_rio' },
      { t: 'Quedarte y repartir la carga: sostener el cielo entre todos', req: () => hasComp() && S.lazos >= 8, reqT: 'Requiere compañeros y Lazos 8', go: 'fin_lazos' },
      { t: 'Beberte la grieta entera: el cielo tendrá un soberano', req: () => F('pacto') || S.amb >= 8, reqT: 'Requiere el Núcleo Demoníaco o Ambición 8', go: 'fin_soberano' }
    ]
  },

  // ───────────── FINALES ─────────────
  fin_sello: { ch: 'Final', title: 'El Cielo Reparado', art: 'fin', ending: true,
    text: () => `${hasComp() ? 'Te despides. Es lo más difícil que has hecho en este mundo, y eso que has peleado con un dragón.\n\n' : ''}Das un paso dentro de la grieta, te vuelves y tiras de los bordes. No con los brazos: con todo lo que has sido desde aquella noche de feria.

Los labios de la herida se acercan, se tocan, se sueldan con un sonido de campana lejana. El Sutra arde en tu pecho y se consume. Con él se van tu núcleo, tus meridianos abiertos, el río que corría dentro de ti.

Lo último que ves de aquel mundo es un cielo azul. Solo azul.

El semáforo sigue en verde. Llueve. Un chaval con auriculares te esquiva y sigue su camino. Tu móvil marca un 3 %.

Podría haber sido un sueño, si no fuera porque en el bolsillo, donde nunca hubo nada, hay una tablilla de jade lisa${F('tao') ? ' y una castaña asada, todavía caliente' : ''}.

Cruzas la calle. Mañana tienes cosas que hacer. Pero ya no caminas como antes: caminas como alguien que una vez sostuvo el cielo.` },
  fin_rio: { ch: 'Final', title: 'El Río Único', art: 'fin', ending: true,
    text: `No cierras la grieta. No la bebes. Haces lo que nadie intentó en mil años: te quedas quiet{@} en medio y dejas que los dos ríos pasen a través de ti.

Duele como nacer. El qi y el maná chocan, se enredan, se reconocen. Y entonces dejan de ser dos.

La grieta deja de ser una herida y se convierte en un puente: ya no hay nada que separar, ni aquí ni entre los mundos.

Esa primavera, un niño del Murim enciende una vela con una palabra del Oeste. Una maga de la Torre parte una roca con una palma. Los espíritus encadenados se sueltan solos, porque la magia ya no necesita jaulas, y las píldoras hechas con vidas ajenas se vuelven polvo en sus cofres.

Vuelves a casa un martes, a abrazar a quien te daba por desaparecid{@}, y regresas el jueves, porque tienes amigos a los dos lados del cielo.

Hay quien te llama Sabi{@} del Río. Tú prefieres tu nombre: {n}.` },
  fin_lazos: { ch: 'Final', title: 'Los que Sostienen el Cielo', art: 'fin', ending: true,
    text: () => `—No puedo sol{@} —dices en voz alta. Es lo más difícil que has dicho en tu vida.

${lista(comps())} ${comps().length > 1 ? 'ponen' : 'pone'} una mano sobre tu hombro. El Sutra, que nació para un solo portador, duda… y se parte. No en tres fragmentos: en tantos como manos hay.

La grieta no desaparece. Se queda ahí, pequeña y vigilada, como una ventana por la que de vez en cuando cruzas a por café de verdad. A un lado y a otro, los dos ríos fluyen con calma, porque por primera vez no hay un solo guardián al que corromper.

Con los años os llaman los Pilares. Fundáis algo que no es secta ni torre ni gremio, donde los ancianos rinden cuentas y los novicios pueden hacer preguntas incómodas.

Cuando alguien pregunta quién sostiene el cielo, la respuesta correcta es: «Depende del día. Hoy le toca a {n}».` },
  fin_soberano: { ch: 'Final', title: 'Soberanía del Cielo Roto', art: 'fin', ending: true,
    text: () => `Abres la boca, y los meridianos, y el alma. Y bebes.

El río del qi. El río del maná. La grieta entera. El Primer Emperador lo intentó y el cielo lo partió en dos; pero él no llevaba dentro lo que llevas tú.

Cuando terminas, no queda herida en el cielo. Está en ti.

Tu calle, tu ciudad, tu nombre de antes: no recuerdas haberlos perdido.

Las sectas se arrodillan. Las torres se arrodillan. Lo que queda del Culto te erige templos, y lo que queda de la Alianza los custodia. Hay paz: la paz perfecta de un mundo con un solo dueño.

${hasComp() ? 'Quienes caminaron contigo te miran desde abajo, cada año desde un poco más lejos.' : 'No hay nadie a tu lado. Nunca lo hubo, y ahora ya no puede haberlo.'}

Algunas noches, a solas en el trono de roca negra, te parece oír la risa de un viejo vagabundo: «Todo el que quieras. Ese es justo el problema».` },
  fin_heraldo: { ch: 'Final', title: 'Heraldo de la Luna Roja', art: 'fin', ending: true,
    text: `Los fragmentos abandonan tu pecho uno a uno. Duele menos de lo que esperabas. Lo que duele es el hueco.

Ye Mo se bebe el cielo. La luna queda roja para siempre, y la grieta se cierra tras él: tu calle, tu semáforo, tu vida, todo queda al otro lado.

Te da una máscara con boca y un séptimo del mundo. Gobiernas el viejo Murim desde las ruinas de Longmen, y nadie se atreve a mirarte a los ojos. Eres fuerte. Eres temid{@}. Tienes todo lo que pediste aquella noche.

A veces, en los caminos, encuentras niños harapientos que no piden ayuda porque hace mucho que aprendieron a no pedirla.

Ninguno te mete ya una castaña caliente en la mano.` }
};
