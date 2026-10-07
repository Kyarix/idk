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
      { speaker: 'KIARA', text: 'ponemos esta?' },
      { speaker: 'VALEN', text: 'cuál' },
      { speaker: 'KIARA', text: 'How to Lose a Guy in 10 Days' },
      { speaker: 'VALEN', text: 'dale' },
      { speaker: 'KIARA', text: 'si es mala no acepto críticas' },
      { speaker: 'VALEN', text: 'la elegiste vos' },
      { speaker: 'KIARA', text: 'exactamente' },
      { speaker: 'VALEN', text: 'qué conveniente' },
      { speaker: 'KIARA', text: 'gracias' }
    ],
    memMovieNotebook: [
      { speaker: 'KIARA', text: 'quiero acostarme para verla' },
      { speaker: 'VALEN', text: 'vamos arriba entonces' }
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
      { kind: 'narrator', text: 'Se acomodan en la cama con la notebook.\nLa película sigue.' }
    ],
    memMovieSetNotebook: [
      { speaker: 'VALEN', text: 'ahí está. ¿así la ves?' },
      { speaker: 'KIARA', text: 'sí.' }
    ],
    memMovieComfort: [
      { speaker: 'KIARA', text: '¿estás cómodo?' },
      { speaker: 'VALEN', text: 'más o menos' },
      { speaker: 'KIARA', text: '¿por?' },
      { speaker: 'VALEN', text: 'estaría más cómodo si estuvieras más cerca.' }
    ],
    memMovieContinue: [
      { speaker: 'KIARA', text: 'mejor?' },
      { speaker: 'VALEN', text: 'muchísimo' },
      { speaker: 'KIARA', text: 'JAJA' },
      { speaker: 'VALEN', text: 'vos preguntaste' },
      { speaker: 'KIARA', text: 'bueno' },
      { speaker: 'KIARA', text: 'ahora mirá la peli' },
      { speaker: 'VALEN', text: 'estoy mirando' },
      { speaker: 'KIARA', text: 'no estás mirando nada' },
      { speaker: 'VALEN', text: 'estoy haciendo lo que puedo' }
    ],
    memMovieNear: [
      { speaker: 'KIARA', text: 'ahora sí estás cómodo?' },
      { speaker: 'VALEN', text: 'sí' },
      { speaker: 'VALEN', text: 'vos?' },
      { speaker: 'KIARA', text: 'también' }
    ],
    memMovieEnd: [
      { speaker: 'KIARA', text: 'me gustó' },
      { speaker: 'VALEN', text: 'la película?' },
      { speaker: 'KIARA', text: '...' },
      { speaker: 'KIARA', text: 'también' }
    ],
    memMovieAh: [
      { speaker: 'KIARA', text: 'ah' }
    ],
    memMovieConvenient: [
      { speaker: 'KIARA', text: 'qué conveniente vos también' }
    ],
    memMovieBedroomWait: [
      { speaker: 'VALEN', text: 'primero acomodemos la notebook.' }
    ],
    memBedroomWindow: [
      { kind: 'narrator', text: 'Desde acá entra un poco de luz.\nLa cama sigue siendo mejor plan.' }
    ],

    memTechArrival: [
      { speaker: 'VALEN', text: 'holaa' },
      { speaker: 'KIARA', text: 'holaa' },
      { speaker: 'KIARA', text: 'vamos?' },
      { speaker: 'VALEN', text: 'dale' }
    ],
    memTechBusWait: [
      { kind: 'narrator', text: 'Kiara viene en colectivo.\nLa parada está por acá.' }
    ],
    memTechUSBQuestion: [
      { speaker: 'KIARA', text: '¿conseguiste el pendrive?' },
      { speaker: 'VALEN', text: 'no' },
      { kind: 'narrator', text: '...' },
      { speaker: 'VALEN', text: 'qué' }
    ],
    memTechUSBReveal: [
      { speaker: 'VALEN', text: 'trajiste uno?' },
      { speaker: 'KIARA', text: 'obviamente' },
      { speaker: 'VALEN', text: 'entonces para qué me preguntaste' },
      { speaker: 'KIARA', text: 'quería confirmar que hice bien en traerlo' },
      { speaker: 'VALEN', text: 'ah' },
      { speaker: 'KIARA', text: 'y confirmé' }
    ],
    memTechPC: [
      { kind: 'narrator', text: 'Una PC sin sistema operativo.\nEstá colaborando poco.' },
      { speaker: 'VALEN', text: '¿tengo que hacer algo?', choices: [
        { text: 'puedo mirar con atención', value: 'watch', reply: [{ speaker: 'KIARA', text: 'sí, eso está permitido.' }] },
        { text: 'mejor no toco nada', value: 'handsOff', reply: [{ speaker: 'KIARA', text: 'por ahora, excelente aporte.' }] }
      ] },
      { speaker: 'VALEN', text: 'qué hacés ahora' },
      { speaker: 'KIARA', text: 'instalando Windows' },
      { speaker: 'VALEN', text: 'esa parte la entendí' },
      { speaker: 'KIARA', text: 'vas excelente entonces' }
    ],
    memTechInstallWait: [
      { speaker: 'VALEN', text: 'y ahora?' },
      { speaker: 'KIARA', text: 'esperar' },
      { speaker: 'VALEN', text: 'cuánto' },
      { speaker: 'KIARA', text: 'ni idea' },
      { speaker: 'VALEN', text: 'pero vos sabés de esto' },
      { speaker: 'KIARA', text: 'Windows no me cuenta sus planes' }
    ],
    memTechInstalled: [
      { speaker: 'VALEN', text: 'funciona' },
      { speaker: 'KIARA', text: 'obvio' },
      { speaker: 'VALEN', text: 'nunca dudé' },
      { speaker: 'KIARA', text: 'hace una hora ni tenías pendrive' },
      { speaker: 'VALEN', text: 'detalle' },
      { speaker: 'KIARA', text: 'claro' }
    ],
    memTechNotFinished: [
      { speaker: 'VALEN', text: 'falta lo de la PC.\npara eso vino el pendrive.' }
    ],
    memTechWalk: [
      { speaker: 'KIARA', text: 'qué lindo salir después de mirar una instalación de Windows' },
      { speaker: 'VALEN', text: 'una cita muy tecnológica' },
      { speaker: 'KIARA', text: 'experiencia premium' }
    ],
    memTechOrder: [
      { speaker: 'KIARA', text: 'yo, tostadas con huevo y palta.' },
      { speaker: 'VALEN', text: 'yo voy con yogurt, frutas y granola.' }
    ],
    memTechCafeTalk: [
      { speaker: 'VALEN', text: 'eso qué tiene?' },
      { speaker: 'KIARA', text: 'huevo, palta...' },
      { speaker: 'KIARA', text: 'cosas de persona responsable' },
      { speaker: 'VALEN', text: 'ah' },
      { speaker: 'KIARA', text: 'y vos pediste yogurt' },
      { speaker: 'VALEN', text: 'me gusta el yogurt' },
      { speaker: 'KIARA', text: 'ya me había dado cuenta' },
      { speaker: 'VALEN', text: 'algún problema?' },
      { speaker: 'KIARA', text: 'ninguno' },
      { speaker: 'KIARA', text: 'es tierno' },
      { speaker: 'VALEN', text: 'el yogurt?' },
      { speaker: 'KIARA', text: 'vos' },
      { speaker: 'VALEN', text: 'ah' },
      { speaker: 'KIARA', text: 'JAJA' }
    ],
    memTechCafeWait: [
      { speaker: 'VALEN', text: 'recién llegamos.\nprimero comamos algo.' }
    ],
    memTechHome: [
      { kind: 'narrator', text: 'Vuelven juntos al departamento.' }
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
      { speaker: 'VALEN', text: 'che' },
      { speaker: 'VALEN', text: 'querés venir a cenar conmigo y Bene?' },
      { speaker: 'KIARA', text: 'ahora?' },
      { speaker: 'VALEN', text: 'sí' },
      { speaker: 'KIARA', text: 'JAJAJA' },
      { speaker: 'KIARA', text: 'bueno' }
    ],
    memDinnerBus: [
      { kind: 'narrator', text: 'Planificación: inexistente.' },
      { kind: 'narrator', text: 'Kiara toma el colectivo hacia Rosario.' }
    ],
    memDinnerArrival: [
      { speaker: 'VALEN', text: 'hola. al final salió el plan.' },
      { speaker: 'KIARA', text: 'sí. con una anticipación impresionante.' },
      { speaker: 'VALEN', text: 'Bene nos lleva.' }
    ],
    memDinnerBene: [
      { speaker: 'BENE', text: 'todos con cinturón?' },
      { speaker: 'VALEN', text: 'sí papá' },
      { speaker: 'BENE', text: 'bajate' },
      { speaker: 'KIARA', text: 'recién subimos 😭' },
      { speaker: 'BENE', text: 'qué quieren comer' },
      { speaker: 'VALEN', text: 'no sé' },
      { speaker: 'BENE', text: 'excelente' },
      { speaker: 'KIARA', text: 'está muy organizado esto' },
      { speaker: 'BENE', text: 'siempre' },
      { speaker: 'VALEN', text: 'no le creas' }
    ],
    memDinnerWaitKiara: [
      { speaker: 'VALEN', text: 'primero voy a buscar a Kiara.' }
    ],
    memDinnerTable: [
      { speaker: 'KIARA', text: 'está lindo acá' },
      { speaker: 'VALEN', text: 'sí' },
      { speaker: 'BENE', text: 'vieron que sé elegir' },
      { speaker: 'VALEN', text: 'no exageres' },
      { speaker: 'BENE', text: 'dejame tener esto' }
    ],
    memDinnerAfterFood: [
      { speaker: 'KIARA', text: 'igual no esperaba terminar cenando acá hoy' },
      { speaker: 'VALEN', text: 'yo tampoco' },
      { speaker: 'BENE', text: 'nadie esperaba nada' },
      { speaker: 'KIARA', text: 'se nota' },
      { kind: 'narrator', text: 'Todos siguen cenando.' }
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
      { kind: 'narrator', text: 'De vuelta en el departamento. Bene ya se fue.' },
      { speaker: 'KIARA', text: 'estoy cansada' },
      { speaker: 'VALEN', text: 'yo también' },
      { speaker: 'KIARA', text: 'pero la pasé lindo' },
      { speaker: 'VALEN', text: 'yo también' }
    ],
    memDinnerAfterKiss: [
      { speaker: 'KIARA', text: 'me gusta estar acá con vos' },
      { speaker: 'VALEN', text: 'a mí también' }
    ],
    memDinnerSofa: [
      { kind: 'narrator', text: 'El sillón parece cómodo.\nPero ya está ganando la cama.' }
    ],
    memDinnerSleep: [
      { speaker: 'KIARA', text: 'estás cómodo?' },
      { speaker: 'VALEN', text: 'sí' },
      { speaker: 'VALEN', text: 'vos?' },
      { speaker: 'KIARA', text: 'sí' },
      { speaker: 'KIARA', text: 'buenas noches' },
      { speaker: 'VALEN', text: 'buenas noches' }
    ],
    memRestaurantLight: [
      { kind: 'narrator', text: 'Luz cálida, mesas y un ambiente bastante elegante.\nLa conversación sigue teniendo el mismo nivel.' }
    ],

    memNextMorning: [
      { speaker: 'KIARA', text: 'buen día' },
      { speaker: 'VALEN', text: 'buen día' },
      { speaker: 'KIARA', text: 'dormiste bien?' },
      { speaker: 'VALEN', text: 'sí' },
      { speaker: 'VALEN', text: 'vos?' },
      { speaker: 'KIARA', text: 'sí' },
      { speaker: 'KIARA', text: 'estaba cómoda' },
      { speaker: 'VALEN', text: 'bien' }
    ],
    memNextKitchen: [
      { speaker: 'VALEN', text: 'voy haciendo algo para comer.' },
      { speaker: 'KIARA', text: 'dale. yo estudio un rato acá.' }
    ],
    memNextStudy: [
      { speaker: 'VALEN', text: 'entendés todo eso?' },
      { speaker: 'KIARA', text: 'más o menos' },
      { speaker: 'VALEN', text: 'yo no entiendo nada' },
      { speaker: 'KIARA', text: 'mejor' },
      { speaker: 'VALEN', text: 'por?' },
      { speaker: 'KIARA', text: 'así no me discutís' },
      { speaker: 'VALEN', text: 'qué mala' },
      { speaker: 'KIARA', text: 'JAJA' }
    ],
    memNextCare: [
      { speaker: 'VALEN', text: 'estudiá tranquila' },
      { speaker: 'VALEN', text: 'yo termino esto' },
      { speaker: 'KIARA', text: 'mirá que me voy a acostumbrar' },
      { speaker: 'VALEN', text: 'bueno' }
    ],
    memNextThought: [
      { text: 'qué lindo...' }
    ],
    memNextInvite: [
      { speaker: 'KIARA', text: 'che' },
      { speaker: 'VALEN', text: 'qué' },
      { speaker: 'KIARA', text: 'querés acompañarme a mi pueblo?' },
      { speaker: 'VALEN', text: 'ahora?' },
      { speaker: 'KIARA', text: 'sisi' },
      { speaker: 'VALEN', text: 'bueno dale' },
      { speaker: 'KIARA', text: 'así de fácil?' },
      { speaker: 'VALEN', text: 'sí' },
      { speaker: 'KIARA', text: 'me sirve' }
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
      { kind: 'narrator', text: 'Pueblo Esther.' }
    ],
    memTownWalk: [
      { speaker: 'VALEN', text: 'caminamos bastante' },
      { speaker: 'KIARA', text: 'te advertí' },
      { speaker: 'VALEN', text: 'no me advertiste nada' },
      { speaker: 'KIARA', text: 'bueno' },
      { speaker: 'KIARA', text: 'te advierto ahora' },
      { speaker: 'VALEN', text: 'gracias' }
    ],
    memTownWalkAgain: [
      { speaker: 'KIARA', text: 'me gusta que estés acá' },
      { speaker: 'VALEN', text: 'me gusta estar acá' },
      { speaker: 'KIARA', text: 'bien' },
      { speaker: 'KIARA', text: 'esa era la respuesta correcta' },
      { speaker: 'VALEN', text: 'menos mal' }
    ],
    memTownMamalu: [
      { speaker: 'KIARA', text: 'ahí está Mamalu.' },
      { speaker: 'VALEN', text: '¿entramos?' },
      { speaker: 'KIARA', text: 'dale.' }
    ],
    memTiramisu: [
      { speaker: 'KIARA', text: '¿compartimos un tiramisú?' },
      { speaker: 'VALEN', text: 'dale' },
      { speaker: 'KIARA', text: 'mitad y mitad' },
      { speaker: 'VALEN', text: 'obvio' },
      { speaker: 'KIARA', text: 'te estoy vigilando' },
      { speaker: 'VALEN', text: 'por qué' },
      { speaker: 'KIARA', text: 'por mi mitad' },
      { speaker: 'VALEN', text: 'todavía ni empecé' },
      { speaker: 'KIARA', text: 'prevención' }
    ],
    memTiramisuAfter: [
      { speaker: 'VALEN', text: 'estaba bueno' },
      { speaker: 'KIARA', text: 'sí' },
      { speaker: 'KIARA', text: 'compartirlo también' }
    ],
    memMamaluWait: [
      { speaker: 'KIARA', text: 'esperá, nos falta el tiramisú.' }
    ],
    memSebiInvite: [
      { speaker: 'SEBI', text: 'eh Valen' },
      { speaker: 'VALEN', text: 'qué hacés' },
      { speaker: 'SEBI', text: 'vamos a jugar?' },
      { speaker: 'VALEN', text: 'ahora?' },
      { speaker: 'SEBI', text: 'sí' },
      { speaker: 'VALEN', text: 'te molesta?' },
      { speaker: 'KIARA', text: 'noo' },
      { speaker: 'KIARA', text: 'quiero ir' },
      { speaker: 'VALEN', text: 'segura?' },
      { speaker: 'KIARA', text: 'sisi' },
      { speaker: 'KIARA', text: 'voy a mirar' }
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
      { speaker: 'SEBI', text: 'dale, vení.' }
    ],
    memPitchBefore: [
      { speaker: 'VALEN', text: 'ya que vinimos, juego un rato.' }
    ],
    memPitchThought: [
      { text: 'me gusta verlo así' },
      { text: 'contento' },
      { text: 'qué lindo que es' }
    ],

    // Scene 05 uses thoughts(), never the RPG dialogue box or a speaker label.
    memKiaraPhone: [
      { text: 'el chat con Valen' },
      { text: 'no hay mensajes nuevos' },
      { text: 'igual lo abrí' },
      { text: 'me gusta ver su nombre ahí' }
    ],
    memKiaraWindow: [
      { text: 'me pregunto qué estará haciendo' },
      { text: 'espero que esté teniendo un lindo día' }
    ],
    memKiaraDesk: [
      { text: 'bueno. por hoy alcanza.' }
    ],
    memKiaraThoughts: [
      { text: 'me gusta mucho estar con él' },
      { text: 'me gusta cuando me abraza' },
      { text: 'me gusta cómo me trata' },
      { text: 'cuando estoy con él siento que puedo relajarme un poquito' }
    ],
    memKiaraNervous: [
      { text: 'me gusta que cuando me pongo nerviosa' },
      { text: 'no intente apurarme' },
      { text: 'me gusta sentir que puedo ir a mi ritmo' }
    ],
    memKiaraNormal: [
      { text: 'me gusta cuando hacemos cosas normales' },
      { text: 'caminar' },
      { text: 'comer algo' },
      { text: 'ver una película' },
      { text: 'estar sentados sin hacer nada' },
      { text: 'y aun así la paso re lindo' }
    ],
    memKiaraKnow: [
      { text: 'hace poquito que lo conozco' },
      { text: 'todavía hay un montón de cosas que no sé de él' },
      { text: 'cosas que le gustan' },
      { text: 'cosas que le preocupan' },
      { text: 'cosas que lo hacen feliz' },
      { text: 'quiero conocerlas' }
    ],
    memKiaraMore: [
      { text: 'quiero conocerlo cada vez un poquito más' }
    ],
    memKiaraExcited: [
      { text: 'me emociona cuando sé que lo voy a ver' },
      { text: 'y cuando estoy con él' },
      { text: 'siempre quiero quedarme un ratito más' }
    ],
    memKiaraClose: [
      { text: 'me gusta cómo me mira' },
      { text: 'me gusta cuando se acerca' },
      { text: 'me gusta cuando me besa' },
      { text: 'me gusta sentirlo cerca' }
    ],
    memKiaraUs: [
      { text: 'no sé qué va a pasar con nosotros' },
      { text: 'pero me gusta mucho lo que está pasando' }
    ],
    memKiaraDays: [
      { text: 'y quiero seguir teniendo días así con él' },
      { text: 'muchos' }
    ],
    memKiaraLast: [
      { text: 'qué lindo que es' }
    ],
    memKiaraReflect: [
      { text: 'creo que pienso bastante en él' },
      { text: 'pero no me molesta' }
    ],
    memKiaraFinal: [
      { text: 'ojalá lo vea pronto' }
    ]
  });
})(window.VG = window.VG || {});
