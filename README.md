# Sutra del Cielo Roto

Juego de rol narrativo y de acción para Android. Eres una persona corriente que, una noche cualquiera, es
**invocada a otro mundo** donde conviven la **fantasía** (magos, caballeros, orcos, elfos, dragones) y el
**murim** (sectas marciales, cultivo del qi, cultos demoníacos). El viejo que te invocó muere esa misma noche,
te deja en el pecho un fragmento del Sutra del Cielo Roto… y medio mundo empieza a perseguirte. La grieta del
cielo es también tu única puerta de vuelta a casa.

## Qué incluye

- **Personaje personalizable**: nombre, tratamiento (él / ella / elle), rostro, piel, peinado, color de pelo y
  ojos, linaje (humano, élfico, bestia), túnica y detalles. El retrato se dibuja en tiempo real.
- **4 vidas anteriores** (quién eras en la Tierra) y **5 clases**: Espada Errante, Puño de Hierro, Voz de los Elementos, Sombra Silente y Mano de Jade.
- **Decisiones con consecuencias**: cada elección mueve tres sendas (Rectitud, Sombra, Misterio) y dos vías
  (Lazos, Ambición), cambia qué compañeros te siguen y qué escenas ves.
- **Evoluciones de clase ligadas a tus decisiones**: cada clase evoluciona dos veces. La primera evolución depende
  de tu senda dominante; la segunda, de si te apoyas en tus lazos o en tu ambición, y de hechos clave de la
  historia (devorar el Núcleo Demoníaco, ganar la bendición del dragón). En total, 15 evoluciones intermedias y
  30 formas definitivas.
- **Historia en 6 capítulos** con tres rutas distintas en el capítulo 2 y **5 finales**.
- **Combate de acción en tiempo real**: arrastras el dedo para moverte, atacas automáticamente al tener al enemigo
  a tu alcance, lanzas técnicas con recarga y esquivas con «Paso veloz». Cada ataque enemigo se anuncia con una
  zona roja en el suelo: embestidas, saltos, rayos y lluvias de proyectiles.
- Guardado automático.

## Cómo conseguir el APK

Cada vez que se sube código, GitHub Actions compila el juego (pestaña **Actions → Compilar APK**). Al terminar,
descarga el artefacto `SutraDelCieloRoto-apk`, descomprímelo y abre `app-debug.apk` en el móvil (hay que permitir
la instalación desde orígenes desconocidos).

Para compilarlo en tu ordenador, abre la carpeta en Android Studio o ejecuta:

```
./gradlew assembleDebug
```

El APK queda en `app/build/outputs/apk/debug/`. Requiere JDK 17 y el SDK de Android (API 35). Funciona en
Android 8.0 o superior.

## Estructura

| Ruta | Contenido |
| --- | --- |
| `app/src/main/assets/js/story.js` | La historia: escenas, decisiones y finales |
| `app/src/main/assets/js/data.js` | Clases, evoluciones, técnicas y enemigos |
| `app/src/main/assets/js/engine.js` | Motor: creación, narración, evoluciones, guardado |
| `app/src/main/assets/js/fight.js` | Combate en tiempo real |
| `app/src/main/assets/js/portrait.js` | Retrato del personaje |
| `app/src/main/java/.../MainActivity.java` | Envoltorio Android (WebView) |
| `tools/autoplay.js` | Prueba que juega partidas completas al azar |

El juego es HTML y JavaScript sin dependencias: también puedes abrir `app/src/main/assets/index.html` en un
navegador para probarlo (en combate: WASD o flechas para moverte, espacio para esquivar, 1-4 técnicas, Q píldora).

## Pruebas

```
node tools/autoplay.js 10 --skill 0.6
```

Necesita Playwright con Chromium. Valida que todas las escenas enlazan bien y juega partidas completas con
decisiones aleatorias; los combates los resuelve un jugador artificial (`--skill` es la probabilidad de que
esquive cada ataque anunciado), lo que sirve para medir la dificultad de cada enemigo.
