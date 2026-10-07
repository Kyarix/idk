# Arte y sonidos

Esta versión dibuja sus placeholders originales con Canvas 2D. No necesita descargar imágenes, fuentes ni música. Los mapas, muebles, flores y personajes se renderizan en `js/renderer.js`; sus posiciones están separadas en `js/maps.js`.

## Personajes

1. Guardá tu PNG transparente en `assets/characters/valen.png`, `kiara.png`, `bene.png`, etc.
2. En `js/data.js`, buscá el personaje dentro de `VG.CHARACTERS` y asigná `sprite: 'assets/characters/valen.png'`.
3. Recargá el juego. Si el archivo no carga, se usa el personaje dibujado con Canvas.

Formatos admitidos:

- **16 × 24 px:** una imagen fija, con los pies centrados en el borde inferior.
- **32 × 32 px:** una imagen fija, centrada sobre los pies. Si tiene píxeles transparentes debajo del personaje, el dibujo los tiene en cuenta para apoyarlo en el suelo.
- **64 × 64 px:** hoja de 2 × 2 cuadros de 32 × 32 px. El cuadro superior izquierdo queda quieto; al caminar, se recorren los cuatro cuadros en orden.
- **128 × 128 px:** hoja de 4 × 4 cuadros de 32 × 32 px. Las filas son abajo, izquierda, derecha y arriba; la primera columna es quieto y las restantes son cuadros de caminata. Si una fila solo tiene el cuadro quieto, el personaje conserva esa pose al caminar en esa dirección.
- **48 × 96 px:** hoja de 3 columnas × 4 filas, cada cuadro de 16 × 24 px. Columnas: quieto, paso 1, paso 2. Filas: abajo, izquierda, derecha, arriba.

Se dibujan a tamaño original, con escalado `nearest-neighbor` en todo el canvas. Exportá sin suavizado y evitá padding extra. El área que colisiona son los pies; el pelo puede superponerse con la parte superior de otros objetos.

Los colores de placeholders también pueden cambiarse en `VG.CHARACTERS`: `skin`, `hair`, `eyes`, `shirt` y `pants`. Las poses de sentarse, abrazar y sostener yogurt funcionan con los placeholders. Las hojas PNG usan por ahora las animaciones de movimiento; para añadir poses propias se puede extender `Renderer.actor()`.

## Escenarios y objetos

- `assets/maps/`: fondos o tilesets futuros.
- `assets/objects/`: árboles, mesas, lemon pie y otros objetos futuros.
- `assets/ui/`: marcos, iconos o retratos futuros.

No se usan archivos de estas carpetas todavía. Para sustituir un objeto concreto, conservá su `id`, tamaño de colisión y posición en `maps.js`; cambiá únicamente el dibujo de su `type` en `Renderer.object()`. El mapa sigue siendo editable sin modificar el motor.

Coordenadas: NPCs/jugador = centro de los pies; objetos = esquina superior izquierda. `w` y `h` describen la huella; árboles y faroles se dibujan por encima. `solid: true` bloquea el paso, `interact: true` admite interacción. Dejá corredores de al menos 24 px.

## Audio

Los sonidos de esta versión son sintéticos y originales, generados por Web Audio después de un gesto del usuario. Para música propia, usá `assets/audio/birthday.mp3`, `messages.mp3`, `plaza.mp3` y `flowers.mp3`, y activá sus rutas en `VG.AUDIO_TRACKS`, al comienzo de `js/audio.js`. La clave de `messages.mp3` es `instagram`. No se incluye música comercial.

Los archivos son opcionales. La versión inicial debe funcionar completa sin recursos adicionales.
