# Valen ♡

Una aventura narrativa corta hecha por Kiara para Valen. Cuatro capítulos, mapas chicos, conversaciones, decisiones de tono y lemon pie. Valen es el personaje que controlás.

Esta primera versión incluye la historia completa y arte temporal dibujado con Canvas. Usa HTML, CSS y JavaScript sin dependencias, instalación de paquetes, backend ni compilación. No necesita Node ni npm. No carga fuentes, música ni imágenes de servicios externos.

## Cómo correrlo

Abrí una terminal dentro de la carpeta `valen-game` y ejecutá:

```bash
python -m http.server 8000
```

Después abrí **http://localhost:8000** en el navegador. Si tu instalación de Windows usa el lanzador `py`, también sirve:

```bash
py -m http.server 8000
```

También podés abrir `index.html` directamente. Los scripts son clásicos, sin módulos, `fetch` ni archivos de datos que necesiten un servidor. Según el navegador, guardar progreso o cargar audio desde `file://` puede tener restricciones; el servidor estático es la opción recomendada.

Para probar en un celular conectado a la misma red, abrí `http://IP-DE-TU-PC:8000`. El firewall del sistema debe permitir la conexión al servidor. No hace falta publicar el juego en Internet.

## Controles

| Acción | PC | Celular |
| --- | --- | --- |
| Caminar | WASD o flechas | Cruceta táctil |
| Hablar / interactuar / avanzar texto | E, Enter o Espacio | Botón de interacción |
| Elegir respuesta | Arriba / abajo y confirmar | Tocar una opción |
| Pausar | Escape o botón del menú | Botón del menú |
| Volumen y silencio | Controles en pantalla | Controles en pantalla |
| Debug | F1 | Consola de desarrollo remota, si hace falta |

Los controles táctiles aparecen al detectar un dispositivo táctil o una interacción con el dedo. Se puede jugar en vertical, aunque el formato horizontal deja más espacio. El juego evita el desplazamiento y los gestos accidentales sobre su superficie.

En los diálogos, la primera pulsación puede completar el texto que se está escribiendo; la siguiente avanza. No es necesario apretar rápidamente. Las elecciones cambian pequeñas respuestas, sin desviar la historia principal.

## Estructura del proyecto

```text
valen-game/
├── index.html              Interfaz y carga de scripts
├── style.css               Pantalla, menús, diálogo y diseño responsive
├── js/
│   ├── data.js             Personajes, capítulos y todos los diálogos
│   ├── maps.js             Dimensiones, objetos, NPCs y zonas de los mapas
│   ├── input.js            Teclado y controles táctiles
│   ├── player.js           Movimiento y colisiones
│   ├── dialogue.js         Páginas, escritura y elecciones
│   ├── audio.js            Sonidos, ambiente y pistas opcionales
│   ├── renderer.js         Cámara, dibujo pixel art y sprites
│   ├── scenes.js           Progresión y eventos de los capítulos
│   └── game.js             Bucle principal, interfaz, transiciones y guardado
├── assets/
│   ├── characters/
│   ├── maps/
│   ├── objects/
│   ├── ui/
│   ├── audio/
│   └── README.md           Convenciones para reemplazar el arte y el audio
├── tests/
│   └── map-check.cjs       Comprobación opcional de acceso a interacciones
└── README.md
```

Los archivos comparten el espacio de nombres `window.VG`. El orden de las etiquetas `<script>` en `index.html` forma parte de la configuración: los datos y componentes se cargan antes de iniciar el juego.

## Dónde cambiar los diálogos

En `js/data.js`, dentro de `VG.STORY`. Cada conversación tiene una clave y una lista de páginas. Por ejemplo:

```js
table: [
  { kind: 'narrator', text: 'Es una mesa.' },
  { speaker: 'VALEN', text: 'Confirmo.' }
]
```

Podés usar `\n` para un salto de línea. `speaker` es el nombre visible; `kind: 'thought'` muestra un pensamiento y `kind: 'narrator'` una narración. Una página puede incluir elecciones:

```js
{
  speaker: 'KIARA',
  text: '¿por dónde vamos?',
  choices: [
    {
      text: 'por donde haya sombra',
      value: 'shade',
      reply: [{ speaker: 'KIARA', text: 'criterio sólido.' }]
    },
    {
      text: 'seguimos ese camino',
      value: 'path',
      reply: [{ speaker: 'KIARA', text: 'dale.' }]
    }
  ]
}
```

**El mensaje final completo está en `VG.STORY.finalMessage`, en un solo lugar.** La conversación posterior del lemon pie está en `VG.STORY.pieFinal`. Los mensajes de Social están divididos en `instagramFollow`, `instagramHello`, `instagramLater`, `instagramInvite` y sus transiciones.

Los eventos que ocurren al terminar una conversación se conectan desde `scenes.js`; no hace falta agregar funciones dentro de los textos. Conservá las claves existentes si solo querés cambiar lo que se dice.

## Dónde cambiar los personajes y reemplazar sprites

En `js/data.js`, `VG.CHARACTERS` contiene cada personaje, su nombre, los colores de su placeholder y la ruta opcional `sprite`:

```js
valen: {
  name: 'VALEN',
  skin: '#f1c5a2',
  hair: '#634534',
  eyes: '#583f30',
  shirt: '#759787',
  pants: '#40536a',
  sprite: 'assets/characters/valen.png'
}
```

Los valores iniciales de `sprite` son `null`. Para usar una imagen, cambiá ese valor por su ruta y colocá allí el PNG transparente. Para Kiara, Bene y otros personajes, podés usar `kiara.png`, `bene.png`, `npc_01.png`, etc. Si `sprite` es `null` o no se puede cargar el archivo, se usa el dibujo por Canvas.

Se admiten dos formatos:

- **16 × 24 píxeles:** una imagen estática del personaje.
- **48 × 96 píxeles:** una hoja de 3 columnas y 4 filas; cada fotograma mide 16 × 24. Las columnas son reposo, paso 1 y paso 2. Las filas son abajo, izquierda, derecha y arriba.

El punto de referencia del personaje está en el centro de los pies. Mantené esa alineación entre fotogramas para evitar que parezca saltar. El escalado conserva los píxeles, sin suavizado.

## Dónde cambiar los mapas

En `js/maps.js`, dentro de `VG.MAPS`. Cada mapa declara tamaño, posición inicial, objetos, NPCs y, cuando corresponde, zonas que disparan eventos.

- Las coordenadas se miden en píxeles del mundo, antes de escalar la pantalla.
- Un NPC usa `{ x, y }` como centro de sus pies.
- Un objeto usa `{ x, y, w, h }` desde su esquina superior izquierda.
- `solid: true` bloquea el movimiento. Se puede dar una caja `collision` separada del dibujo.
- `interact: true` permite que un objeto entre en la búsqueda de interacciones cercanas.
- Los `id` enlazan objetos y zonas con sus eventos en `scenes.js`.

Mover un banco o un árbol no requiere cambiar el motor. Si movés una zona que activa una escena, revisá también las posiciones de los personajes usadas por esa escena. Los tipos de objeto se dibujan en `renderer.js`; ahí podés mejorar un placeholder o agregar un nuevo tipo de decoración.

Las carpetas `assets/maps`, `assets/objects` y `assets/ui` quedan preparadas para arte futuro. Los mapas actuales se dibujan por código; colocar un archivo allí por sí solo no reemplaza el mapa.

## Dónde agregar sonidos

El audio inicial usa Web Audio para generar una pequeña ambientación original y efectos de pasos, diálogo, selección, interacción, beso y viento. No incluye canciones comerciales. El navegador lo habilita después de la primera interacción del jugador.

Para usar música propia, agregá los archivos a `assets/audio` y cambiá `VG.AUDIO_TRACKS` al principio de `js/audio.js`:

```js
VG.AUDIO_TRACKS = {
  birthday: 'assets/audio/birthday.mp3',
  instagram: 'assets/audio/messages.mp3',
  plaza: 'assets/audio/plaza.mp3',
  flowers: 'assets/audio/flowers.mp3'
};
```

Los valores predeterminados son `null`: eso conserva el ambiente sintetizado. Si una pista no se puede reproducir, el juego vuelve a ese ambiente. Las pistas se repiten; conviene preparar archivos con un principio y un final que encajen. Los efectos se configuran también en `audio.js`.

El volumen y el silencio se recuerdan por separado del progreso. Al cambiar de pestaña se suspende el ambiente para que no siga sonando en segundo plano.

## Cómo agregar un capítulo

Usá un capítulo existente de `js/scenes.js` como modelo. El registro es `VG.SCENES`; cada entrada reúne estas partes:

```js
VG.SCENES.chapter5 = {
  map: 'chapter5',
  enter(game) {
    // Preparar el estado y el objetivo de esta escena.
  },
  update(game, dt) {
    // Revisar movimiento, zonas o eventos propios de este capítulo.
  },
  interact(game, target) {
    // Resolver objetos y conversaciones mediante target.id.
  }
};
```

1. Agregá los textos en `VG.STORY` y el título en `VG.CHAPTERS`, en `data.js`.
2. Declará el mapa en `VG.MAPS`, en `maps.js`, con su posición inicial y objetos. Usá la misma clave que en `map`.
3. Registrá sus eventos en `VG.SCENES`, respetando la firma de los capítulos existentes.
4. Conectá el final del capítulo anterior con `game.go('chapter5')`. Para iniciar un diálogo y hacer algo cuando termine, usá `game.say('claveDelDialogo', () => { /* evento */ })`.
5. Guardá el estado necesario para retomar el capítulo en `game.flags` y llamá a `game.checkpoint('nombre-del-momento')`. `enter(game)` debe reconstruir el objetivo y los NPCs según esas banderas. La validación de guardados admite las escenas registradas en `VG.SCENES`.
6. Si querés música propia, agregá su configuración en `audio.js`. Si querés un salto de debug adicional, agregá su tecla en `input.js` y su destino en `game.js`.

El registro evita reescribir el movimiento, las colisiones o el sistema de diálogos. Para una escena sin mapa, tomá como referencia el teléfono de Instagram.

## Guardado y cómo borrarlo

El juego guarda en `localStorage` el capítulo, los checkpoints importantes y si ya terminó. El menú ofrece continuar cuando hay una partida disponible. Reanudar puede comenzar al principio del checkpoint actual; no pretende guardar cada píxel caminado ni cada letra de una conversación.

Las claves son:

```text
valen-game.save.v1       Progreso
valen-game.settings.v1   Volumen y silencio
```

Para borrar solo el progreso durante el desarrollo, abrí la consola del navegador y ejecutá:

```js
VG.game.resetSave();
```

También podés borrar las claves manualmente y recargar:

```js
localStorage.removeItem('valen-game.save.v1');
localStorage.removeItem('valen-game.settings.v1'); // Solo si querés reiniciar el audio.
location.reload();
```

Evitá `localStorage.clear()` si compartís este origen con otros proyectos: borraría también sus datos. Cada origen conserva un guardado distinto; `localhost:8000`, otro puerto y `file://` no necesariamente comparten progreso. Si el navegador impide guardar, la partida sigue funcionando durante la sesión.

## Debug

Presioná **F1** para activar o desactivar el modo de depuración. Muestra información de la escena, coordenadas, FPS y las zonas de colisión o activación.

Con debug activo:

| Tecla | Destino |
| --- | --- |
| 1 | Cumpleaños |
| 2 | Instagram |
| 3 | Plaza |
| 4 | Campo de flores |

Estos saltos sirven para probar capítulos sin completar los anteriores. Pueden modificar el progreso guardado. Para inspeccionar el estado sin editar archivos, `window.VG.game` expone la instancia actual en la consola. `VG.STORY`, `VG.MAPS` y `VG.SCENES` permiten inspeccionar sus respectivos datos.

## Comprobación manual

No hay un paso de compilación. Después de editar, recargá el navegador; si conserva archivos viejos, usá una recarga forzada.

- **PC:** caminar en todas las direcciones, chocar con muebles, acercarse a NPCs, abrir diálogos, completar el texto y elegir respuestas con el teclado.
- **Historia:** recorrer el cumpleaños y repartir todas las cartas; seguir a Kiara antes de recibir su mensaje; encontrarla en la plaza, caminar juntos, pedir yogurt y volver al banco; completar el campo, las tres posibles respuestas del lemon pie y los créditos.
- **Guardado:** recargar después de repartir cartas, volver del yogurt y llegar al campo. Usar Continuar y confirmar que el capítulo se puede terminar. Probar Nueva partida sin perder las preferencias de audio.
- **Celular:** probar horizontal y vertical; caminar mientras se usa la interacción; soltar un dedo fuera de un botón; cambiar de pestaña y volver. Verificar que no queden teclas o direcciones activadas.
- **Audio:** habilitarlo con una interacción, ajustar volumen, silenciar, recargar y comprobar que las preferencias persisten.
- **Arte:** probar con sprites ausentes y con un PNG propio. La aventura debe seguir funcionando si falla un recurso opcional.
- **Final:** confirmar que Volver al campo permite explorar otra vez y que Rejugar inicia una nueva partida.

Si ya tenés Node instalado para desarrollar, podés ejecutar `node tests/map-check.cjs`. Este chequeo opcional recorre cada mapa desde su punto inicial, usando las colisiones reales del jugador y los NPCs, y verifica que se pueda llegar a distancia de interacción de todos los objetivos. No hace falta instalar nada para jugar y el chequeo no reemplaza la prueba visual del recorrido completo.

La duración depende de cuánto se explore y de la velocidad de lectura; no hay esperas largas para alargarla. Las conversaciones ambientales y las elecciones de yogurt son añadidos de tono, no afirmaciones sobre recuerdos reales. Los hechos centrales siguen la secuencia indicada, y el último capítulo se presenta explícitamente como ficción.
