# Sutra del Cielo Roto

Juego narrativo para Android ambientado en un mundo de **fantasía y murim**: al este, las sectas marciales y el
cultivo del qi; al oeste, torres de magos, caballeros y dragones. La noche en que la luna se tiñe de rojo, un
maestro moribundo te entrega un fragmento del Sutra del Cielo Roto… y medio mundo empieza a perseguirte.

## Qué incluye

- **Personaje personalizable**: nombre, tratamiento (él / ella / elle), rostro, piel, peinado, color de pelo y
  ojos, linaje (humano, élfico, bestia), túnica y detalles. El retrato se dibuja en tiempo real.
- **3 orígenes** y **5 clases**: Espada Errante, Puño de Hierro, Voz de los Elementos, Sombra Silente y Mano de Jade.
- **Decisiones con consecuencias**: cada elección mueve tres sendas (Rectitud, Sombra, Misterio) y dos vías
  (Lazos, Ambición), cambia qué compañeros te siguen y qué escenas ves.
- **Evoluciones de clase ligadas a tus decisiones**: cada clase evoluciona dos veces. La primera evolución depende
  de tu senda dominante; la segunda, de si te apoyas en tus lazos o en tu ambición, y de hechos clave de la
  historia (devorar el Núcleo Demoníaco, ganar la bendición del dragón). En total, 15 evoluciones intermedias y
  30 formas definitivas.
- **Historia en 6 capítulos** con tres rutas distintas en el capítulo 2 y **5 finales**.
- **Combate por turnos** con técnicas, Qi, escudos, venenos, aturdimientos y golpes cargados que conviene bloquear.
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
| `app/src/main/assets/js/engine.js` | Motor: creación, narración, combate, guardado |
| `app/src/main/assets/js/portrait.js` | Retrato del personaje |
| `app/src/main/java/.../MainActivity.java` | Envoltorio Android (WebView) |
| `tools/autoplay.js` | Prueba que juega partidas completas al azar |

El juego es HTML y JavaScript sin dependencias: también puedes abrir `app/src/main/assets/index.html` en un
navegador para probarlo.

## Pruebas

```
node tools/autoplay.js 30
```

Necesita Playwright con Chromium. Valida que todas las escenas enlazan bien y juega 30 partidas completas con
decisiones aleatorias, informando de finales alcanzados y combates perdidos.
