/* Additional, replayable memories. Their dialogue is an approximation, not a
 * transcript. The places and central events come from Kiara's descriptions.
 * The main story remains in data.js; no existing text is replaced here.
 */
(function (VG) {
  'use strict';
  VG.MEMORIES = {
    movie: { number: '01', title: 'Una película', startScene: 'memMovieLiving', description: 'Una notebook y un cambio de ubicación.' },
    tech: { number: '02', title: 'Servicio técnico', startScene: 'memTechStop', description: 'Un pendrive bastante oportuno.' },
    dinner: { number: '03', title: 'Plan de último momento', startScene: 'memDinnerChat', description: 'Una cena con Kiara y Bene.' },
    nextDay: { number: '04', title: 'Al día siguiente', startScene: 'memNextMorning', description: 'Cocinar, salir y terminar en una cancha.' },
    kiara: { number: '05', title: 'Kiara', startScene: 'memKiaraRoom', description: 'Una escena aparte. Ella sola, de noche.' }
  };
  VG.CHARACTERS.sebi = { name: 'SEBI', skin: '#dda27b', hair: '#493a32', eyes: '#5c4435', shirt: '#a5baca', pants: '#414f62', sprite: null };

  Object.assign(VG.STORY, {
    memMovieStart: [
      { kind: 'narrator', text: 'En la notebook de Valen:\nHow to Lose a Guy in 10 Days.' },
      { speaker: 'VALEN', text: '¿se ve bien desde ahí?' },
      { speaker: 'KIARA', text: 'sí, dale.' }
    ],
    memMovieNotebook: [
      { speaker: 'VALEN', text: 'listo. ahí sigue.' },
      { speaker: 'KIARA', text: 'pará, quiero acostarme para verla.' },
      { speaker: 'VALEN', text: 'vamos arriba.' }
    ],
    memMovieTable: [
      { kind: 'narrator', text: 'La mesa frente a la cocina.\nPor ahora también hace de cine.' }
    ],
    memMovieKitchen: [
      { speaker: 'VALEN', text: 'la película está para el otro lado.' }
    ],
    memMovieWait: [
      { speaker: 'KIARA', text: '¿le damos play?' }
    ],
    memMovieUpstairs: [
      { speaker: 'KIARA', text: 'mucho mejor acá.' },
      { speaker: 'VALEN', text: 'acomodo la notebook y seguimos.' }
    ],
    memMovieSetNotebook: [
      { speaker: 'VALEN', text: 'ahí está. ¿así la ves?' },
      { speaker: 'KIARA', text: 'sí.' }
    ],
    memMovieComfort: [
      { speaker: 'KIARA', text: '¿estás cómodo?' },
      { speaker: 'VALEN', text: 'estaría más cómodo si estuvieras más cerca.' }
    ],
    memMovieContinue: [
      { speaker: 'VALEN', text: '¿seguimos viendo?' },
      { speaker: 'KIARA', text: 'sí. así.' }
    ],
    memMovieBedroomWait: [
      { speaker: 'VALEN', text: 'primero acomodemos la notebook.' }
    ],
    memBedroomWindow: [
      { kind: 'narrator', text: 'Desde acá entra un poco de luz.\nLa cama sigue siendo mejor plan.' }
    ],

    memTechArrival: [
      { speaker: 'KIARA', text: 'holaa.' },
      { speaker: 'VALEN', text: 'hola. ¿vamos?' },
      { speaker: 'KIARA', text: 'dale.' }
    ],
    memTechBusWait: [
      { kind: 'narrator', text: 'Kiara viene en colectivo.\nLa parada está por acá.' }
    ],
    memTechUSBQuestion: [
      { speaker: 'KIARA', text: '¿conseguiste el pendrive?' },
      { speaker: 'VALEN', text: 'no.' },
      { kind: 'narrator', text: '...' }
    ],
    memTechUSBReveal: [
      { speaker: 'KIARA', text: 'traje uno. ya tiene Windows preparado.' },
      { speaker: 'VALEN', text: 'viniste con todo resuelto.' },
      { speaker: 'KIARA', text: 'con un pendrive, por lo menos.' }
    ],
    memTechPC: [
      { kind: 'narrator', text: 'Una PC sin sistema operativo.\nEstá colaborando poco.' },
      { speaker: 'VALEN', text: '¿tengo que hacer algo?', choices: [
        { text: 'puedo mirar con atención', value: 'watch', reply: [{ speaker: 'KIARA', text: 'sí, eso está permitido.' }] },
        { text: 'mejor no toco nada', value: 'handsOff', reply: [{ speaker: 'KIARA', text: 'por ahora, excelente aporte.' }] }
      ] },
      { speaker: 'KIARA', text: 'ahí empieza a instalar.' }
    ],
    memTechInstalled: [
      { speaker: 'KIARA', text: 'listo.' },
      { speaker: 'VALEN', text: 'ahora sí parece una computadora.' },
      { speaker: 'KIARA', text: 'bastante mejor, sí.' },
      { speaker: 'VALEN', text: '¿salimos a caminar?' },
      { speaker: 'KIARA', text: 'dale.' }
    ],
    memTechNotFinished: [
      { speaker: 'VALEN', text: 'falta lo de la PC.\npara eso vino el pendrive.' }
    ],
    memTechWalk: [
      { speaker: 'VALEN', text: '¿vamos a tomar algo?' },
      { speaker: 'KIARA', text: 'sí, me copa.' }
    ],
    memTechOrder: [
      { speaker: 'KIARA', text: 'yo, tostadas con huevo y palta.' },
      { speaker: 'VALEN', text: 'yo voy con yogurt, frutas y granola.' },
      { speaker: 'KIARA', text: 'bueno. ahora sí, sin mirar una instalación.' }
    ],
    memTechCafeTalk: [
      { speaker: 'VALEN', text: 'el plan mejoró bastante.' },
      { speaker: 'KIARA', text: 'la comida ayuda.' },
      { speaker: 'VALEN', text: '¿después volvemos caminando?' },
      { speaker: 'KIARA', text: 'sí.' }
    ],
    memTechCafeWait: [
      { speaker: 'VALEN', text: 'recién llegamos.\nprimero comamos algo.' }
    ],
    memTechHome: [
      { speaker: 'VALEN', text: 'bueno. PC funcionando y salida incluida.' },
      { speaker: 'KIARA', text: 'bastante productivo.' }
    ],
    memStreetSign: [
      { kind: 'narrator', text: 'La parada, el departamento y una cafetería.\nPor acá alcanza con ir caminando.' }
    ],
    memStreetBench: [
      { kind: 'narrator', text: 'Un banco a la sombra.\nBuen lugar para no hacer mucho.' }
    ],
    memCafeMenu: [
      { kind: 'narrator', text: 'Hay cosas para comer y cosas para tomar.\nUna cafetería cumpliendo su función.' }
    ],

    memDinnerChat: [
      { speaker: 'VALEN', text: 'che, vamos a cenar con Bene' },
      { speaker: 'VALEN', text: '¿querés venir?' },
      { speaker: 'KIARA', text: '¿hoy?' },
      { speaker: 'VALEN', text: 'sí JAJA' },
      { speaker: 'KIARA', text: 'buenoo, voy' },
      { speaker: 'VALEN', text: 'dale, avisame cuando llegues' }
    ],
    memDinnerBus: [
      { kind: 'narrator', text: 'Kiara tomó un colectivo hacia Rosario.' }
    ],
    memDinnerArrival: [
      { speaker: 'VALEN', text: 'hola. al final salió el plan.' },
      { speaker: 'KIARA', text: 'sí. con una anticipación impresionante.' },
      { speaker: 'VALEN', text: 'Bene nos lleva.' }
    ],
    memDinnerBene: [
      { speaker: 'BENE', text: '¿estamos?' },
      { speaker: 'VALEN', text: 'sí, vamos.' },
      { speaker: 'KIARA', text: 'vamos.' }
    ],
    memDinnerWaitKiara: [
      { speaker: 'VALEN', text: 'primero voy a buscar a Kiara.' }
    ],
    memDinnerTable: [
      { speaker: 'BENE', text: 'bueno, nos salió bastante bien el plan.' },
      { speaker: 'VALEN', text: 'lo decís como si hubiéramos organizado mucho.' },
      { speaker: 'BENE', text: 'justamente.' },
      { speaker: 'KIARA', text: 'igual llegamos los tres. ya es algo.' },
      { speaker: 'VALEN', text: 'objetivo cumplido.', choices: [
        { text: 'ahora falta elegir qué comer', value: 'food', reply: [{ speaker: 'BENE', text: 'la parte difícil.' }] },
        { text: 'buen nivel de organización', value: 'plan', reply: [{ speaker: 'KIARA', text: 'no se agranden tanto.' }] }
      ] }
    ],
    memDinnerAfterFood: [
      { speaker: 'BENE', text: '¿todo bien?' },
      { speaker: 'VALEN', text: 'sí, re bien.' },
      { speaker: 'KIARA', text: 'sí.' },
      { kind: 'narrator', text: 'La cena siguió entre charla y alguna cargada.\nSin grandes acontecimientos. Un buen rato.' }
    ],
    memDinnerBanter: [
      { speaker: 'VALEN', text: 'al final ni hizo falta planear tanto.' },
      { speaker: 'BENE', text: 'no lo tomes como consejo para todo.' }
    ],
    memDinnerBeforeMeal: [
      { speaker: 'BENE', text: 'vení, sentate acá.' }
    ],
    memDinnerGoHome: [
      { speaker: 'VALEN', text: '¿volvemos?' },
      { speaker: 'KIARA', text: 'dale.' }
    ],
    memDinnerApartment: [
      { kind: 'narrator', text: 'De vuelta en el departamento.\nKiara se queda a dormir.' },
      { speaker: 'KIARA', text: '¿subimos?' },
      { speaker: 'VALEN', text: 'sí.' }
    ],
    memDinnerSofa: [
      { kind: 'narrator', text: 'El sillón parece cómodo.\nPero ya está ganando la cama.' }
    ],
    memDinnerSleep: [
      { speaker: 'KIARA', text: 'me está dando sueño.' },
      { speaker: 'VALEN', text: 'vení.' }
    ],
    memRestaurantLight: [
      { kind: 'narrator', text: 'Luz cálida, mesas y un ambiente bastante elegante.\nLa conversación sigue teniendo el mismo nivel.' }
    ],

    memNextMorning: [
      { speaker: 'KIARA', text: 'buen día.' },
      { speaker: 'VALEN', text: 'buen día.' }
    ],
    memNextKitchen: [
      { speaker: 'VALEN', text: 'voy haciendo algo para comer.' },
      { speaker: 'KIARA', text: 'dale. yo estudio un rato acá.' }
    ],
    memNextStudy: [
      { speaker: 'VALEN', text: '¿qué estás estudiando?' },
      { speaker: 'KIARA', text: 'ciberseguridad.' },
      { speaker: 'VALEN', text: 'bueno. yo sigo con lo mío.' }
    ],
    memNextInvite: [
      { speaker: 'KIARA', text: '¿querés acompañarme a mi pueblo?' },
      { speaker: 'VALEN', text: 'sí, vamos.' }
    ],
    memNextPC: [
      { kind: 'narrator', text: 'Kiara está estudiando ciberseguridad.\nValen tiene otro frente abierto en la cocina.' }
    ],
    memNextBeforeCook: [
      { speaker: 'VALEN', text: 'primero preparo algo acá.' }
    ],
    memNextBus: [
      { kind: 'narrator', text: 'Próximo destino: Pueblo Esther.' },
      { speaker: 'KIARA', text: 'es este.' },
      { speaker: 'VALEN', text: 'dale.' }
    ],
    memTownArrive: [
      { kind: 'narrator', text: 'Pueblo Esther.' },
      { speaker: 'KIARA', text: '¿caminamos un rato?' },
      { speaker: 'VALEN', text: 'sí. vos guiás.' }
    ],
    memTownWalk: [
      { speaker: 'VALEN', text: '¿por acá?' },
      { speaker: 'KIARA', text: 'sí. sigamos un poco más.' }
    ],
    memTownMamalu: [
      { speaker: 'KIARA', text: 'ahí está Mamalu.' },
      { speaker: 'VALEN', text: '¿entramos?' },
      { speaker: 'KIARA', text: 'dale.' }
    ],
    memTiramisu: [
      { speaker: 'KIARA', text: '¿compartimos un tiramisú?' },
      { speaker: 'VALEN', text: 'sí.' }
    ],
    memTiramisuAfter: [
      { speaker: 'VALEN', text: 'buena idea entrar.' },
      { speaker: 'KIARA', text: 'sí. muy buena.' },
      { speaker: 'VALEN', text: '¿seguimos caminando?' },
      { speaker: 'KIARA', text: 'vamos.' }
    ],
    memMamaluWait: [
      { speaker: 'KIARA', text: 'esperá, nos falta el tiramisú.' }
    ],
    memSebiInvite: [
      { speaker: 'SEBI', text: 'che, ¿te venís a jugar al fútbol?' },
      { speaker: 'VALEN', text: 'sí, me sumo.' },
      { speaker: 'KIARA', text: 'voy con ustedes.' }
    ],
    memSebiAgain: [
      { speaker: 'SEBI', text: 'es por acá.' }
    ],
    memTownKeepWalking: [
      { speaker: 'KIARA', text: 'demos una vuelta por el centro primero.' }
    ],
    memTownTree: [
      { kind: 'narrator', text: 'Una calle tranquila, un poco de sombra.\nSe puede seguir caminando.' }
    ],
    memPitchStart: [
      { speaker: 'SEBI', text: 'dale, vení.' },
      { speaker: 'KIARA', text: 'yo me quedo acá mirando.' }
    ],
    memPitchBefore: [
      { speaker: 'VALEN', text: 'ya que vinimos, juego un rato.' }
    ],
    memPitchThought: [
      { text: 'miralo al boludo ♡' }
    ],

    // Scene 05 uses thoughts(), never the RPG dialogue box or a speaker label.
    memKiaraPhone: [
      { text: 'después le hablo' }
    ],
    memKiaraDesk: [
      { text: 'bueno. por hoy alcanza.' }
    ],
    memKiaraThoughts: [
      { text: 'me gusta mucho este boludo' },
      { text: 'me gusta mucho verlo' },
      { text: 'me gusta que cuando estoy nerviosa\nno intente apurarme' },
      { text: 'con él hasta hacer cosas normales\nse siente lindo' },
      { text: 'hace re poco que lo conozco' },
      { text: 'y todavía hay un montón de cosas\nque no sé de él' },
      { text: 'pero quiero saberlas' },
      { text: 'no quiero imaginarme veinte años\nen el futuro' },
      { text: 'ni hacerme una película' },
      { text: 'solo quiero volver a verlo' },
      { text: 'hacerle un videojuego es\ncompletamente normal' },
      { text: 'creo' }
    ],
    memKiaraLast: [
      { text: 'qué lindo que es' }
    ]
  });
})(window.VG = window.VG || {});
