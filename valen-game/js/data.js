/*
 * VALEN ♡ — Texto y personajes.
 * Este archivo contiene datos: cambiar diálogos no requiere tocar el motor.
 * Cada conversación es una lista de páginas: { speaker, text, kind?, choices? }.
 * choices: [{ text, value, reply: [páginas] }]. Las decisiones son de tono;
 * ninguna cambia los hechos de la historia. Los saltos de línea son opcionales.
 */
(function () {
  'use strict';
  const VG = window.VG = window.VG || {};

  // Sprites opcionales: null usa el placeholder sin pedir archivos inexistentes.
  // Para reemplazarlo, por ejemplo: sprite: 'assets/characters/valen.png'.
  // Los colores también sirven para identificar a cada personaje a simple vista.
  VG.CHARACTERS = {
    valen:   { name: 'VALEN', skin: '#f1c5a2', hair: '#634534', eyes: '#583f30', shirt: '#759787', pants: '#40536a', sprite: 'assets/characters/valen.png' },
    kiara:   { name: 'KIARA', skin: '#f0c3a1', hair: '#bc5d36', eyes: '#684a32', shirt: '#edb968', pants: '#765969', sprite: 'assets/characters/kiara.png' },
    bene:    { name: 'BENE', skin: '#dba481', hair: '#433735', eyes: '#463a32', shirt: '#8e87ad', pants: '#45465b', sprite: null },
    chupe:   { name: 'CHUPE', skin: '#e7b28e', hair: '#73523a', eyes: '#4b3930', shirt: '#d87966', pants: '#4d5b66', sprite: null },
    friend1: { name: 'AMIGO', skin: '#cf9470', hair: '#3b3033', eyes: '#463530', shirt: '#82a5bd', pants: '#5c5261', sprite: null },
    friend2: { name: 'AMIGA', skin: '#edc2a1', hair: '#a17b47', eyes: '#654b31', shirt: '#a4ac76', pants: '#66566a', sprite: null },
    friend3: { name: 'AMIGO', skin: '#ba8667', hair: '#4e352b', eyes: '#402d29', shirt: '#dba769', pants: '#56586c', sprite: null },
    friend4: { name: 'AMIGA', skin: '#e9b996', hair: '#68483b', eyes: '#50382b', shirt: '#c692a5', pants: '#535f61', sprite: null },
    vendor:  { name: 'EN EL LOCAL', skin: '#d6a17b', hair: '#4b3e36', eyes: '#4b3930', shirt: '#faf0d4', pants: '#729082', sprite: null },
    passerby:{ name: 'VECINO', skin: '#d9b091', hair: '#8c8476', eyes: '#594e42', shirt: '#a5b8a0', pants: '#667175', sprite: null }
  };

  VG.CHAPTERS = {
    birthday: { number: '01', title: 'El cumpleaños', subtitle: 'Una casa. Bastante gente.' },
    instagram: { number: '02', title: 'Un mensaje', subtitle: 'Unos días después' },
    plaza: { number: '03', title: 'La plaza', subtitle: 'Esta vez, sin repartir cartas.' },
    flowerField: { number: '04', title: 'Un mapa más', subtitle: 'Lo que sigue no pasó.' }
  };
  VG.CHAPTERS.flowers = VG.CHAPTERS.flowerField;

  const S = VG.STORY = {
    birthdayIntro: [
      { speaker: 'BENE', text: 'llegaste. hay lugar por acá.\nbueno, «lugar» es una forma de decir.' },
      { speaker: 'VALEN', text: 'veo que calcularon perfecto cuánta gente entraba.' },
      { speaker: 'BENE', text: 'sí. y después invitaron al resto.' },
      { kind: 'narrator', text: 'Es el cumpleaños de Chupe.\nPodés dar una vuelta y saludar.' }
    ],
    beneFirst: [
      { speaker: 'BENE', text: '¿vas a quedarte ahí parado?', choices: [
        { text: 'sí', value: 'stand', reply: [{ speaker: 'BENE', text: 'buena estrategia. te guardo el puesto.' }] },
        { text: 'estoy reconociendo el terreno', value: 'explore', reply: [{ speaker: 'BENE', text: 'es un living, Valen.' }] },
        { text: 'depende. ¿hay comida?', value: 'food', reply: [{ speaker: 'BENE', text: 'había. esa es toda la información que tengo.' }] }
      ] },
      { speaker: 'BENE', text: 'andá a saludar. después hacemos algo con las cartas.' },
      { speaker: 'BENE', text: 'qué hacés' },
      { speaker: 'VALEN', text: 'nada' },
      { speaker: 'BENE', text: 'excelente aporte a la conversación' },
      { speaker: 'VALEN', text: 'gracias' }
    ],
    beneAgain: [
      { speaker: 'BENE', text: 'sigo acá. mi personaje tiene un presupuesto de movimiento limitado.' },
      { speaker: 'VALEN', text: 'se nota.' },
      { speaker: 'BENE', text: 'seguís acá' },
      { speaker: 'VALEN', text: 'vos también' },
      { speaker: 'BENE', text: 'buen punto' }
    ],
    friend1: [
      { speaker: 'AMIGO', text: 'estoy cuidando esta silla.' },
      { speaker: 'VALEN', text: '¿para alguien?' },
      { speaker: 'AMIGO', text: 'por ahora para mi campera. tiene una noche difícil.' },
      { speaker: 'AMIGO', text: 'hay demasiada gente acá' },
      { speaker: 'VALEN', text: 'es una casa chica' },
      { speaker: 'AMIGO', text: 'eso no ayuda' }
    ],
    friend2: [
      { speaker: 'AMIGA', text: 'vine a buscar un vaso y me quedé charlando.' },
      { speaker: 'VALEN', text: '¿y el vaso?' },
      { speaker: 'AMIGA', text: 'no compliquemos las cosas.' },
      { speaker: 'AMIGA', text: 'yo ya perdí la noción de quién conoce a quién' },
      { speaker: 'VALEN', text: 'hacé como que conocés a todos' },
      { speaker: 'AMIGA', text: 'es exactamente lo que estoy haciendo' }
    ],
    friend3: [
      { speaker: 'AMIGO', text: '¿alguien sabe dónde se deja esto?' },
      { speaker: 'VALEN', text: '¿qué cosa?' },
      { speaker: 'AMIGO', text: 'buena pregunta. ya me olvidé.' }
    ],
    friend4: [
      { speaker: 'AMIGA', text: 'desde acá escucho tres conversaciones.' },
      { speaker: 'VALEN', text: '¿alguna buena?' },
      { speaker: 'AMIGA', text: 'no sé. me falta contexto en las tres.' }
    ],
    chupe: [
      { speaker: 'VALEN', text: 'feliz cumple, Chupe.' },
      { speaker: 'CHUPE', text: 'gracias. si encontrás un lugar para sentarte, avisame.' },
      { speaker: 'VALEN', text: '¿vos tampoco tenés?' },
      { speaker: 'CHUPE', text: 'el cumpleaños no incluye privilegios.' }
    ],
    kiaraEarly: [
      { speaker: 'KIARA', text: 'holaa.' },
      { speaker: 'VALEN', text: 'hola.' }
    ],
    kiaraThought: [
      { speaker: 'KIARA', kind: 'thought', text: 'Qué ganas de hablarle...\npero no me animo.' },
      { speaker: 'KIARA', kind: 'thought', text: 'quiero hablarle...' },
      { kind: 'narrator', text: '...' },
      { speaker: 'KIARA', kind: 'thought', text: 'pero me da vergüenza' }
    ],
    cardsIntro: [
      { speaker: 'BENE', text: 'che, juguemos al de las preguntas.' },
      { speaker: 'AMIGA', text: 'pero que alguien reparta.' },
      { speaker: 'VALEN', text: 'bueno, doy yo.' },
      { kind: 'narrator', text: 'Agarraste el mazo. Acercate a los que tienen una carta marcada y repartí.' }
    ],
    cardWait: [
      { speaker: 'BENE', text: 'primero saludá a un par.\nlas cartas no se van a ir a ningún lado.' }
    ],
    cardBene: [
      { speaker: 'VALEN', text: 'tomá.' },
      { speaker: 'BENE', text: 'gracias. espero que esta venga con la respuesta.' },
      { speaker: 'BENE', text: 'dame una buena' },
      { speaker: 'VALEN', text: 'no funciona así' },
      { speaker: 'BENE', text: 'entonces para qué repartís vos' }
    ],
    cardFriend1: [
      { speaker: 'AMIGO', text: '¿hay que decir la verdad?' },
      { speaker: 'VALEN', text: 'creo que esa es la idea.' },
      { speaker: 'AMIGO', text: 'arrancamos mal.' },
      { speaker: 'AMIGO', text: 'me tocó una horrible' },
      { speaker: 'VALEN', text: 'ni la leíste' },
      { speaker: 'AMIGO', text: 'la energía era horrible' }
    ],
    cardFriend2: [
      { speaker: 'VALEN', text: 'una para vos.' },
      { speaker: 'AMIGA', text: 'listo. ya estoy preparada para no entender las reglas.' }
    ],
    cardKiara: [
      { speaker: 'VALEN', text: 'tomá.' },
      { speaker: 'KIARA', text: 'gracias.' },
      { speaker: 'VALEN', text: 'de nada' }
    ],
    cardKiaraWait: [
      { speaker: 'VALEN', text: 'reparto por acá y te doy una.' },
      { speaker: 'KIARA', text: 'dale, gracias.' }
    ],
    cardAlready: [
      { speaker: 'BENE', text: 'ya tengo. no me des tarea extra.' }
    ],
    genericCardAlready: [
      { text: 'ya tengo, gracias.' }
    ],
    cardsDone: [
      { speaker: 'BENE', text: 'listo, estamos todos. ¿quién arranca?' },
      { speaker: 'AMIGO', text: 'el que preguntó.' },
      { speaker: 'BENE', text: 'me regalé.' },
      { kind: 'narrator', text: 'La noche siguió entre preguntas, respuestas y gente hablando al mismo tiempo.' }
    ],

    instagramFollow: [
      { speaker: 'VALEN', text: 'ah, Kiara. estaba en el cumple de Chupe.' }
    ],
    instagramNotice: [
      { kind: 'narrator', text: 'Un rato después...\nNuevo mensaje de Kiara.' }
    ],
    instagramHello: [
      { speaker: 'KIARA', text: 'holaa' },
      { speaker: 'KIARA', text: 'quién sos? 😭' },
      { speaker: 'VALEN', text: 'soy del cumple de Chupe JAJA' },
      { speaker: 'KIARA', text: 'aaah JAJA' },
      { speaker: 'KIARA', text: 'AAAA' },
      { speaker: 'KIARA', text: 'ya sé quién sos' }
    ],
    instagramLater: [
      { kind: 'narrator', text: 'unos cuantos mensajes después...' }
    ],
    instagramInvite: [
      { speaker: 'KIARA', text: 'che\npodríamos juntarnos algún día' },
      { speaker: 'VALEN', text: 'dale', choices: [
        { text: 'me copa', value: 'yes', reply: [{ speaker: 'KIARA', text: 'buenoo' }] },
        { text: 'sí, de una', value: 'sure', reply: [{ speaker: 'KIARA', text: 'dalee' }] }
      ] },
      { speaker: 'KIARA', text: 'igual hay un pequeño problema' },
      { speaker: 'VALEN', text: 'qué pasó' },
      { speaker: 'KIARA', text: 'igual ahora estoy enferma 💀\ncuando me recupere' },
      { speaker: 'VALEN', text: 'JAJA bueno, recuperate primero' }
    ],
    instagramMission: [
      { kind: 'narrator', text: 'MISIÓN ACTUALIZADA\nEsperar a que Kiara sobreviva.' },
      { kind: 'narrator', text: 'Unos días después...\nKiara sobrevivió.' }
    ],

    plazaIntro: [
      { kind: 'narrator', text: 'Kiara ya llegó.\nEncontrala en la plaza.' }
    ],
    plazaHello: [
      { speaker: 'KIARA', text: 'holaa' },
      { speaker: 'VALEN', text: 'hola' },
      { kind: 'narrator', text: 'Le das la mano.' },
      { kind: 'narrator', text: '...' },
      { kind: 'narrator', text: 'Un saludo completamente normal\ny para nada incómodo.' },
      { speaker: 'KIARA', text: '¿caminamos?' },
      { speaker: 'VALEN', text: 'dale.' }
    ],
    plazaHelloAfter: [
      { kind: 'narrator', text: 'Un comienzo impecable.' },
      { speaker: 'KIARA', text: 'JAJA' },
      { speaker: 'VALEN', text: 'qué' },
      { speaker: 'KIARA', text: 'nada' }
    ],
    walk1: [
      { speaker: 'KIARA', text: '¿por dónde vamos?', choices: [
        { text: 'por donde haya sombra', value: 'shade', reply: [{ speaker: 'KIARA', text: 'criterio sólido.' }] },
        { text: 'hago como que sé', value: 'pretend', reply: [{ speaker: 'KIARA', text: 'bueno, te sigo. con confianza moderada.' }] },
        { text: 'seguimos ese camino', value: 'path', reply: [{ speaker: 'KIARA', text: 'dale. para algo lo pusieron.' }] }
      ] }
    ],
    walk2: [
      { speaker: 'VALEN', text: '¿damos otra vuelta?' },
      { speaker: 'KIARA', text: 'sí. ya casi reconocemos todos los árboles.' },
      { speaker: 'VALEN', text: 'ese es el de recién.' },
      { speaker: 'KIARA', text: 'gran avance.' }
    ],
    walkMission: [
      { speaker: 'KIARA', text: 'menos mal que ya no estoy enferma' },
      { speaker: 'VALEN', text: 'la misión fue completada' },
      { speaker: 'KIARA', text: 'qué misión' },
      { speaker: 'VALEN', text: 'nada' }
    ],
    walkWeather: [
      { speaker: 'KIARA', text: 'está lindo el día' },
      { speaker: 'VALEN', text: 'sí' },
      { speaker: 'KIARA', text: 'qué conversación profunda' },
      { speaker: 'VALEN', text: 'recién estamos empezando' },
      { speaker: 'KIARA', text: 'bueno te perdono' }
    ],
    walkComfort: [
      { speaker: 'VALEN', text: 'estás cómoda?' },
      { speaker: 'KIARA', text: 'sisi' },
      { speaker: 'VALEN', text: 'bueno' }
    ],
    yogurtInvite: [
      { speaker: 'KIARA', text: 'vamos por yogurt?' },
      { speaker: 'VALEN', text: 'dale.' },
      { speaker: 'KIARA', text: 'el local está acá cerca.' }
    ],
    yogurtOrder: [
      { kind: 'narrator', text: 'No quedó registro del pedido real.\nEsta parte queda en tus manos.' },
      { speaker: 'EN EL LOCAL', text: '¿Qué yogurt querés?', choices: [
        { text: 'algo normal', value: 'normal', reply: [
          { speaker: 'KIARA', text: 'me encanta la precisión del pedido.' },
          { speaker: 'VALEN', text: 'saben a qué me refiero.' }
        ] },
        { text: 'algo sospechosamente dulce', value: 'sweet', reply: [
          { speaker: 'KIARA', text: 'bueno. por lo menos sabés a lo que venís.' }
        ] },
        { text: 'dejar que el destino decida', value: 'random', reply: [
          { speaker: 'EN EL LOCAL', text: 'el destino recomienda el que está más a mano.' },
          { speaker: 'KIARA', text: 'práctico el destino.' }
        ] }
      ] },
      { speaker: 'EN EL LOCAL', text: '¿Y de toppings?', choices: [
        { text: 'un poquito de algo crocante', value: 'crunch', reply: [
          { speaker: 'KIARA', text: 'ahora vamos a escuchar cada cucharada.' }
        ] },
        { text: 'lo que quepa sin derrumbarse', value: 'tower', reply: [
          { speaker: 'KIARA', text: 'eso ya necesita permiso de construcción.' },
          { speaker: 'VALEN', text: 'está calculado.' }
        ] },
        { text: 'así está bien', value: 'plain', reply: [
          { speaker: 'KIARA', text: 'una persona que sabe cuándo parar. mirá vos.' }
        ] }
      ] }
    ],
    yogurtDone: [
      { speaker: 'KIARA', text: '¿volvemos a la plaza?' },
      { speaker: 'VALEN', text: 'sí, vamos.' }
    ],
    yogurtReaction: [
      { speaker: 'KIARA', text: 'interesante elección' },
      { speaker: 'VALEN', text: 'eso sonó a crítica' },
      { speaker: 'KIARA', text: 'yo no dije nada' },
      { speaker: 'VALEN', text: 'pero lo pensaste' },
      { speaker: 'KIARA', text: 'puede ser' }
    ],
    afterYogurtWalk: [
      { speaker: 'KIARA', text: 'me gusta caminar así' },
      { speaker: 'VALEN', text: 'así cómo' },
      { speaker: 'KIARA', text: 'no sé' },
      { speaker: 'KIARA', text: 'sin hacer nada en particular' },
      { speaker: 'VALEN', text: 'está bueno' },
      { speaker: 'KIARA', text: 'sisi' }
    ],
    benchConfession: [
      { speaker: 'KIARA', text: 'igual te tengo que contar algo' },
      { speaker: 'KIARA', text: 'en el cumpleaños...\ncuando estabas repartiendo las cartas' },
      { speaker: 'KIARA', text: 'y me diste una...' },
      { speaker: 'KIARA', text: 'pensé tipo\n«fua, qué copado»' },
      { speaker: 'KIARA', text: 'y que tenía ganas de darte un beso' },
      { kind: 'narrator', text: '...' },
      { speaker: 'VALEN', text: '¿cómo así?' }
    ],
    afterKiss: [
      { speaker: 'VALEN', text: 'perdón\npensé que querías' },
      { speaker: 'KIARA', text: 'sí quería 😭\nsolo me puse nerviosa' },
      { speaker: 'VALEN', text: 'ah, está bien. tranqui.' }
    ],
    afterKissMore: [
      { speaker: 'KIARA', text: 'perdón que te corrí la cara' },
      { speaker: 'KIARA', text: 'me puse nerviosa' },
      { speaker: 'VALEN', text: 'pensé que no querías' },
      { speaker: 'KIARA', text: 'noo' },
      { speaker: 'KIARA', text: 'sí quería' },
      { speaker: 'VALEN', text: 'ah bueno' },
      { speaker: 'VALEN', text: 'me habías asustado un poquito JAJA' },
      { speaker: 'KIARA', text: 'perdón 😭' },
      { speaker: 'VALEN', text: 'eh, tranqui' },
      { speaker: 'VALEN', text: 'no pasa nada' },
      { speaker: 'KIARA', text: 'es que me pongo nerviosa' },
      { speaker: 'VALEN', text: 'está bien' },
      { speaker: 'VALEN', text: 'vamos despacio' }
    ],
    benchCheckIn: [
      { speaker: 'VALEN', text: '¿así estás bien?' },
      { speaker: 'KIARA', text: 'sí' },
      { speaker: 'VALEN', text: '¿segura?' },
      { speaker: 'KIARA', text: 'sisi' },
      { speaker: 'KIARA', text: 'estoy bien' },
      { speaker: 'VALEN', text: 'bueno' },
      { speaker: 'VALEN', text: 'entonces me quedo acá' }
    ],
    benchThanks: [
      { speaker: 'KIARA', text: 'gracias' },
      { speaker: 'VALEN', text: 'por qué' },
      { speaker: 'KIARA', text: 'por no hacer que sea raro' },
      { speaker: 'VALEN', text: 'ya dimos la mano para saludarnos' },
      { speaker: 'VALEN', text: 'más raro que eso no se puede' },
      { speaker: 'KIARA', text: 'CALLATE JAJA' }
    ],
    benchAwkward: [
      { speaker: 'KIARA', text: 'qué vergüenza' },
      { speaker: 'VALEN', text: 'por qué' },
      { speaker: 'KIARA', text: 'no sé 😭' },
      { speaker: 'VALEN', text: 'literalmente me acabás de decir que querías besarme' },
      { speaker: 'KIARA', text: 'VALEN' },
      { speaker: 'VALEN', text: 'qué' },
      { speaker: 'KIARA', text: 'callate' }
    ],
    benchConsent: [
      { speaker: 'VALEN', text: '¿puedo?' },
      { speaker: 'KIARA', text: 'sí' }
    ],
    benchComfort: [
      { speaker: 'VALEN', text: '¿nos sentamos un rato?' },
      { speaker: 'KIARA', text: 'sí.' }
    ],
    secondKiss: [
      { speaker: 'VALEN', text: '¿así estás bien?' },
      { speaker: 'KIARA', text: 'sí. así sí.' }
    ],
    fictionTransition: [
      { kind: 'narrator', text: 'Hasta acá ya conocés la historia.' },
      { kind: 'narrator', text: 'Lo que sigue no pasó.' }
    ],

    flower1: [
      { kind: 'narrator', text: 'Una flor.' },
      { kind: 'narrator', text: 'Sí, podés interactuar con todas.' },
      { kind: 'narrator', text: 'No, no escribí un diálogo distinto para cada una.' }
    ],
    flower2: [
      { kind: 'narrator', text: 'Mentira.\nEsta sí tenía otro diálogo.' }
    ],
    flower3: [
      { kind: 'narrator', text: 'Esta es diferente.\nCreo.' }
    ],
    flower4: [
      { kind: 'narrator', text: 'También es una flor.\nVas entendiendo la temática del mapa.' }
    ],
    sign: [
      { kind: 'narrator', text: '← nada\n\nKiara →' }
    ],
    lemonPie: [
      { speaker: 'VALEN', text: '¿eso es lemon pie?' },
      { speaker: 'KIARA', text: 'obviamente.' }
    ],

    // EDITAR EL MENSAJE FINAL ACÁ. Todo el discurso está en esta única lista.
    finalMessage: [
      { speaker: 'KIARA', text: 'bueno' },
      { speaker: 'KIARA', text: 'supongo que si llegaste hasta acá\nya entendiste por qué hice todo esto' },
      { speaker: 'KIARA', text: 'hace re poquito que te conozco' },
      { speaker: 'KIARA', text: 'y sé que hacerte un juego entero\ndespués de un mes' },
      { speaker: 'KIARA', text: 'es una cantidad bastante cuestionable\nde intensidad' },
      { kind: 'narrator', text: '...' },
      { speaker: 'KIARA', text: 'pero bueno\nya está hecho' },
      { speaker: 'KIARA', text: 'no sé exactamente cómo decir esto\nsin hacerlo sonar mucho más dramático de lo que quiero' },
      { speaker: 'KIARA', text: 'me gustás muchísimo' },
      { speaker: 'KIARA', text: 'me encanta verte\nme encanta pasar tiempo con vos' },
      { speaker: 'KIARA', text: 'y genuinamente me pone muy feliz\nhaberte conocido' },
      { speaker: 'KIARA', text: 'y todavía te estoy conociendo' },
      { speaker: 'KIARA', text: 'no sé qué va a pasar entre nosotros' },
      { speaker: 'KIARA', text: 'y tampoco quiero inventarme una historia\nsobre algo que recién está empezando' },
      { speaker: 'KIARA', text: 'solo sé que quiero seguir viéndote' },
      { speaker: 'KIARA', text: 'quiero seguir conociéndote\ntener más momentos boludos con vos' },
      { speaker: 'KIARA', text: 'salir\nhablar\nreírnos\ny ver qué pasa' },
      { speaker: 'KIARA', text: 'supongo que quería hacerte esto\nporque los pocos momentos que ya tuvimos' },
      { speaker: 'KIARA', text: 'significaron bastante para mí' },
      { speaker: 'KIARA', text: 'así que nada' },
      { speaker: 'KIARA', text: 'gracias por aparecer en mi Instagram\ndespués de ese cumpleaños' },
      { kind: 'narrator', text: '...' },
      { speaker: 'KIARA', text: 'y espero tener que agregar\nmás mapas a este juego ♡' }
    ],
    pieFinal: [
      { speaker: 'KIARA', text: 'ah\ny otra cosa' },
      { kind: 'narrator', text: '...' },
      { speaker: 'KIARA', text: 'hice lemon pie' },
      { speaker: 'VALEN', text: '', choices: [
        { text: 'sabía que este juego tenía recompensa', value: 'reward', reply: [
          { speaker: 'KIARA', text: 'obvio. no te iba a hacer caminar tantos píxeles gratis.' }
        ] },
        { text: '¿todo esto era para darme lemon pie?', value: 'pie', reply: [
          { speaker: 'KIARA', text: 'había maneras más cortas, sí.' }
        ] },
        { text: '♡', value: 'heart', reply: [
          { speaker: 'KIARA', text: 'bueno, vení ♡' }
        ] }
      ] }
    ],
    fieldAfter: [
      { speaker: 'KIARA', text: 'todavía queda lemon pie.' },
      { speaker: 'VALEN', text: 'dato importante.' }
    ],

    table: [
      { kind: 'narrator', text: 'Es una mesa.' },
      { kind: 'narrator', text: 'Sorprendentemente, no tiene relevancia para la trama.' }
    ],
    sofa: [
      { kind: 'narrator', text: 'El sillón está ocupado por una campera.\nTiene mejores contactos que vos.' }
    ],
    blocked: [
      { kind: 'narrator', text: 'No parece que haya nada interesante por ahí.' },
      { kind: 'narrator', text: 'Confía en mí.' },
      { kind: 'narrator', text: 'Yo hice el juego.' }
    ],
    birthdayDoor: [
      { kind: 'narrator', text: 'Todavía no terminó el cumpleaños.\nAdemás, salir no te daría más espacio en este mapa.' }
    ],
    benchEarly: [
      { kind: 'narrator', text: 'Un banco.\nHace exactamente lo que promete.' }
    ],
    benchNeedWalk: [
      { speaker: 'KIARA', text: '¿damos otra vuelta antes de sentarnos?' },
      { speaker: 'VALEN', text: 'dale.' }
    ],
    backgroundNpc: [
      { speaker: 'VECINO', text: 'lindo día para caminar.' },
      { speaker: 'VALEN', text: 'sí.' },
      { speaker: 'VECINO', text: 'no tenía mucho más para agregar.' }
    ],
    plazaLamp: [
      { kind: 'narrator', text: 'Un farol apagado.\nEstá de día. Lo banco.' }
    ],
    plazaSign: [
      { kind: 'narrator', text: 'Yogurt ↗\n\nPlaza: ya estás acá.' }
    ],
    plazaBin: [
      { kind: 'narrator', text: 'Un tacho.\nCero secretos. Bastante útil igual.' }
    ],
    fountain: [
      { kind: 'narrator', text: 'El agua hace ruido de agua.\nBuen trabajo, agua.' }
    ],
    shopClosed: [
      { kind: 'narrator', text: 'Yogurt helado.\nPrimero encontrá a Kiara.' }
    ],
    shopAfter: [
      { speaker: 'VALEN', text: 'ya tenemos yogurt.\npor ahora alcanza.' }
    ],
    picnicBlanket: [
      { kind: 'narrator', text: 'Una manta. Hay lugar para dos.\nY para el lemon pie. Prioridades.' }
    ],
    credits: [
      { kind: 'narrator', text: 'VALEN ♡\n\nhecho por Kiara\n\ncon una cantidad\ncompletamente razonable\nde tiempo y cariño' },
      { kind: 'narrator', text: 'Fin... por ahora.' }
    ]
  };

  // La versión completa también sirve para probar el diálogo sin la vista Social.
  S.instagram = [].concat(S.instagramFollow, S.instagramNotice, S.instagramHello,
    S.instagramLater, S.instagramInvite, S.instagramMission);
}());
