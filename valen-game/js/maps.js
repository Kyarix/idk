(function () {
  'use strict';
  const V = window.VG = window.VG || {};
  // Coordinates are in world pixels. Actors use the center of their feet;
  // objects use their top-left corner. Only `solid` objects block movement.
  const tree = (id, x, y, variant = 0) => ({ id, type: 'tree', x, y, w: 20, h: 15, solid: true, variant });
  const flower = (id, x, y, variant = 0) => ({ id, type: 'flower', x, y, w: 16, h: 14, interact: true, variant });
  const wall = (id, x, y, w, h) => ({ id, type: 'wall', x, y, w, h, solid: true });
  V.MAPS = {
    birthday: {
      title: 'El cumpleaños', width: 576, height: 352, spawn: { x: 220, y: 284, dir: 'up' },
      objects: [
        wall('wall-top', 0, 0, 576, 54), wall('wall-left', 0, 0, 16, 352), wall('wall-right', 560, 0, 16, 352),
        wall('wall-bottom-left', 0, 338, 266, 14), wall('wall-bottom-right', 310, 338, 266, 14),
        { id: 'sofa', type: 'sofa', x: 28, y: 160, w: 64, h: 29, solid: true, interact: true },
        { id: 'table', type: 'table', x: 70, y: 100, w: 66, h: 30, solid: true, interact: true },
        { id: 'chair-a', type: 'chair', x: 82, y: 78, w: 18, h: 16, solid: true },
        { id: 'chair-b', type: 'chair', x: 110, y: 142, w: 18, h: 16, solid: true },
        { id: 'card-table', type: 'card-table', x: 248, y: 140, w: 62, h: 30, solid: true, interact: true },
        { id: 'chair-c', type: 'chair', x: 228, y: 145, w: 16, h: 18, solid: true },
        { id: 'cake', type: 'cake-table', x: 336, y: 67, w: 63, h: 25, solid: true, interact: true },
        { id: 'shelf', type: 'shelf', x: 492, y: 57, w: 45, h: 22, solid: true },
        { id: 'plant-1', type: 'plant', x: 25, y: 62, w: 16, h: 20, solid: true },
        { id: 'plant-2', type: 'plant', x: 530, y: 295, w: 16, h: 20, solid: true },
        { id: 'kitchen', type: 'kitchen', x: 423, y: 265, w: 126, h: 38, solid: true },
        { id: 'speaker', type: 'speaker', x: 191, y: 68, w: 16, h: 24, solid: true, interact: true },
        { id: 'door', type: 'door', name: 'Salir al patio', x: 268, y: 326, w: 40, h: 16, interact: true }
      ],
      npcs: [
        // The close friends face an open, irregular semicircle. Valen starts at its edge.
        { id: 'bene', character: 'bene', name: 'Bene', x: 240, y: 207, dir: 'left', group: true },
        { id: 'chupe', character: 'chupe', name: 'Chupe', x: 315, y: 116 },
        { id: 'friend1', character: 'friend1', name: 'Un amigo', x: 190, y: 188, dir: 'down', group: true },
        { id: 'friend2', character: 'friend2', name: 'Una amiga', x: 118, y: 247, dir: 'right', group: true },
        { id: 'close-friend3', character: 'friend3', name: 'Un amigo', x: 140, y: 209, dir: 'right', group: true },
        { id: 'close-friend4', character: 'friend4', name: 'Una amiga', x: 267, y: 247, dir: 'left', group: true },
        { id: 'kiara', character: 'kiara', name: 'Kiara', x: 157, y: 286, dir: 'right', group: true },
        { id: 'close-friend5', character: 'friend1', name: 'Un amigo', x: 206, y: 317, dir: 'up', group: true },
        // Most guests are scenery with collision, rather than extra conversations.
        { id: 'guest1', character: 'friend4', name: 'Una invitada', x: 171, y: 119, dir: 'left', ambient: true, interact: false },
        { id: 'guest2', character: 'friend3', name: 'Un invitado', x: 368, y: 213, dir: 'left', ambient: true, dialogue: 'guestCup' },
        { id: 'guest3', character: 'friend3', name: 'Un invitado', x: 504, y: 191, dir: 'up', ambient: true, interact: false },
        { id: 'guest4', character: 'friend4', name: 'Una invitada', x: 71, y: 292, dir: 'right', ambient: true, dialogue: 'guestFiveMinutes' },
        { id: 'guest5', character: 'friend2', name: 'Una invitada', x: 349, y: 302, dir: 'left', ambient: true, interact: false },
        { id: 'guest6', character: 'friend1', name: 'Un invitado', x: 279, y: 92, dir: 'right', ambient: true, interact: false },
        { id: 'guest7', character: 'friend3', name: 'Un invitado', x: 143, y: 117, dir: 'right', ambient: true, dialogue: 'guestHalf' },
        { id: 'guest8', character: 'friend2', name: 'Una invitada', x: 327, y: 195, dir: 'right', ambient: true, interact: false },
        { id: 'guest9', character: 'friend4', name: 'Una invitada', x: 336, y: 243, dir: 'up', ambient: true, interact: false },
        { id: 'guest10', character: 'friend1', name: 'Un invitado', x: 518, y: 333, dir: 'left', ambient: true, interact: false },
        { id: 'guest11', character: 'friend3', name: 'Un invitado', x: 322, y: 301, dir: 'right', ambient: true, interact: false },
        { id: 'guest12', character: 'friend2', name: 'Una invitada', x: 98, y: 313, dir: 'left', ambient: true, interact: false },
        { id: 'guest13', character: 'friend4', name: 'Una invitada', x: 508, y: 135, dir: 'right', ambient: true, interact: false },
        { id: 'guest14', character: 'friend1', name: 'Un invitado', x: 543, y: 123, dir: 'left', ambient: true, interact: false },
        { id: 'guest15', character: 'friend2', name: 'Una invitada', x: 430, y: 233, dir: 'right', ambient: true, interact: false },
        { id: 'guest16', character: 'friend3', name: 'Un invitado', x: 462, y: 235, dir: 'left', ambient: true, interact: false },
        { id: 'guest17', character: 'friend4', name: 'Una invitada', x: 385, y: 321, dir: 'left', ambient: true, interact: false }
      ],
      triggers: [{ id: 'kiara-thought', x: 125, y: 249, w: 65, h: 62 }]
    },
    birthdayPatio: {
      title: 'El patio', width: 384, height: 288, spawn: { x: 192, y: 115 },
      objects: [
        { id: 'house-front', type: 'house-front', x: 0, y: 0, w: 384, h: 70, solid: true },
        { id: 'house-door', type: 'patio-door', name: 'Volver a la casa', x: 168, y: 68, w: 48, h: 22, interact: true },
        { id: 'fence-left', type: 'fence', x: 0, y: 70, w: 12, h: 218, solid: true },
        { id: 'fence-right', type: 'fence', x: 372, y: 70, w: 12, h: 218, solid: true },
        { id: 'fence-bottom', type: 'fence', x: 0, y: 277, w: 384, h: 11, solid: true },
        { id: 'patio-table', type: 'table', x: 43, y: 204, w: 58, h: 22, solid: true, interact: true },
        { id: 'patio-chair1', type: 'chair', x: 34, y: 240, w: 16, h: 16, solid: true },
        { id: 'patio-chair2', type: 'chair', x: 110, y: 202, w: 16, h: 16, solid: true },
        { id: 'patio-plant1', type: 'plant', x: 25, y: 100, w: 16, h: 20, solid: true },
        { id: 'patio-plant2', type: 'plant', x: 340, y: 92, w: 16, h: 20, solid: true },
        { id: 'patio-lamp', type: 'lamp', x: 314, y: 136, w: 9, h: 10, solid: true, interact: true }
      ],
      npcs: [
        { id: 'patio-guest1', character: 'friend1', name: 'Un invitado', x: 70, y: 168, dir: 'right', ambient: true, dialogue: 'guestStanding' },
        { id: 'patio-guest2', character: 'friend4', name: 'Una invitada', x: 105, y: 162, dir: 'left', ambient: true, interact: false },
        { id: 'patio-guest3', character: 'friend3', name: 'Un invitado', x: 271, y: 205, dir: 'right', ambient: true, interact: false },
        { id: 'patio-guest4', character: 'friend2', name: 'Una invitada', x: 306, y: 223, dir: 'up', ambient: true, interact: false },
        { id: 'patio-guest5', character: 'friend4', name: 'Una invitada', x: 340, y: 203, dir: 'left', ambient: true, interact: false },
        { id: 'patio-guest6', character: 'friend1', name: 'Un invitado', x: 226, y: 247, dir: 'up', ambient: true, interact: false }
      ], triggers: []
    },
    plaza: {
      title: 'La plaza', width: 768, height: 480, spawn: { x: 60, y: 390 },
      paths: [
        { x: 0, y: 355, w: 240, h: 52 }, { x: 202, y: 263, w: 49, h: 144 },
        { x: 200, y: 263, w: 346, h: 50 }, { x: 494, y: 286, w: 50, h: 194 },
        { x: 510, y: 163, w: 54, h: 136 }, { x: 510, y: 144, w: 159, h: 49 },
        { x: 624, y: 91, w: 45, h: 102 }, { x: 301, y: 117, w: 149, h: 113 }
      ],
      objects: [
        { id: 'yogurt-shop', type: 'shop', x: 584, y: 11, w: 140, h: 78, solid: true },
        { id: 'yogurt-door', type: 'shop-door', x: 622, y: 88, w: 40, h: 30, interact: true },
        { id: 'bench', type: 'bench', x: 478, y: 252, w: 64, h: 24, solid: true, interact: true },
        { id: 'bench-west', type: 'bench', x: 80, y: 242, w: 62, h: 24, solid: true, interact: true },
        { id: 'fountain', type: 'fountain', x: 340, y: 132, w: 72, h: 64, solid: true, interact: true },
        { id: 'flowers', type: 'flower-bed', x: 144, y: 136, w: 48, h: 26, interact: true },
        { id: 'plaza-sign', type: 'plaza-sign', x: 250, y: 345, w: 30, h: 24, solid: true, interact: true },
        { id: 'lamp1', type: 'lamp', x: 173, y: 320, w: 9, h: 10, solid: true, interact: true },
        { id: 'lamp2', type: 'lamp', x: 565, y: 220, w: 9, h: 10, solid: true, interact: true },
        { id: 'lamp3', type: 'lamp', x: 466, y: 396, w: 9, h: 10, solid: true, interact: true },
        tree('tree1', 45, 115), tree('tree2', 245, 110, 1), tree('tree3', 475, 114),
        tree('tree4', 704, 201, 1), tree('tree5', 685, 372), tree('tree6', 99, 451, 1),
        tree('tree7', 325, 426), tree('tree8', 52, 216), tree('tree9', 650, 472),
        { id: 'bin', type: 'bin', x: 566, y: 315, w: 16, h: 20, solid: true, interact: true },
        { id: 'walk-exit', type: 'plaza-sign', label: 'PASEO', actionLabel: 'Seguir el sendero', x: 504, y: 431, w: 32, h: 22, solid: true, interact: true },
        { id: 'quiet-exit', type: 'plaza-sign', label: 'SENDERO', actionLabel: 'Ir a la zona tranquila', x: 714, y: 306, w: 40, h: 22, solid: true, interact: true }
      ],
      npcs: [
        { id: 'kiara', character: 'kiara', name: 'Kiara', x: 264, y: 286 },
        { id: 'walker', character: 'friend1', name: 'Alguien paseando', x: 161, y: 382 },
        { id: 'reader', character: 'friend2', name: 'Una persona', x: 115, y: 272 }
      ],
      triggers: [{ id: 'walk-west', x: 165, y: 269, w: 67, h: 65 }, { id: 'walk-east', x: 389, y: 260, w: 75, h: 84 }]
    },
    plazaWalk: {
      title: 'El paseo', theme: 'plaza', width: 704, height: 432, spawn: { x: 48, y: 328 },
      paths: [
        {x:0,y:302,w:205,h:44},{x:168,y:165,w:44,h:176},{x:183,y:164,w:310,h:43},
        {x:450,y:171,w:46,h:130},{x:466,y:258,w:169,h:44},{x:596,y:84,w:46,h:201},{x:621,y:76,w:83,h:40}
      ],
      objects: [
        {id:'back',type:'plaza-sign',label:'PLAZA',actionLabel:'Volver a la plaza',x:26,y:362,w:34,h:22,solid:true,interact:true},
        {id:'walk-end',type:'plaza-sign',label:'PLAZA',actionLabel:'Seguir hasta el local',x:659,y:67,w:34,h:22,solid:true,interact:true},
        {id:'walk-bench',type:'bench',x:245,y:208,w:64,h:24,solid:true,interact:true},
        {id:'walk-fountain',type:'fountain',x:309,y:65,w:72,h:64,solid:true,interact:true},
        {id:'walk-lamp',type:'lamp',x:570,y:264,w:9,h:10,solid:true,interact:true},
        tree('w-tree1',65,177),tree('w-tree2',126,93),tree('w-tree3',289,360),tree('w-tree4',393,272),
        tree('w-tree5',514,90),tree('w-tree6',651,355),tree('w-tree7',55,418),tree('w-tree8',691,188),
        {id:'walk-flowers',type:'flower-bed',x:208,y:128,w:45,h:24,interact:true}
      ],
      npcs:[{id:'walker',character:'passerby',name:'Un vecino',x:133,y:311},{id:'reader',character:'friend4',name:'Alguien descansando',x:306,y:252,interact:false}],
      triggers:[{id:'walk-chat1',x:149,y:169,w:68,h:148},{id:'walk-chat2',x:441,y:234,w:182,h:87}]
    },
    plazaQuiet: {
      title: 'Un poco más allá', theme:'plaza',width:640,height:400,spawn:{x:43,y:310},
      paths:[{x:0,y:284,w:242,h:42},{x:212,y:172,w:46,h:151},{x:222,y:162,w:222,h:44},{x:411,y:127,w:47,h:72},{x:433,y:118,w:178,h:44}],
      objects:[
        {id:'back',type:'plaza-sign',label:'PLAZA',actionLabel:'Volver a la plaza',x:39,y:346,w:34,h:22,solid:true,interact:true},
        {id:'bench',type:'bench',x:502,y:119,w:64,h:24,solid:true,interact:true},
        {id:'quiet-lamp',type:'lamp',x:472,y:168,w:9,h:10,solid:true},
        {id:'quiet-flowers',type:'flower-bed',x:302,y:132,w:48,h:24,interact:true},
        tree('q-tree1',73,175),tree('q-tree2',162,92),tree('q-tree3',319,294),tree('q-tree4',385,86),
        tree('q-tree5',603,211),tree('q-tree6',493,360),tree('q-tree7',138,392),tree('q-tree8',22,258),
        {id:'quiet-rock',type:'rock',x:439,y:301,w:24,h:14,solid:true}
      ],npcs:[{id:'quiet-reader',character:'passerby',name:'Una persona',x:125,y:192,interact:false}],
      triggers:[{id:'quiet-chat1',x:190,y:172,w:90,h:144},{id:'quiet-chat2',x:400,y:119,w:90,h:94}]
    },
    yogurt: {
      title: 'Algo de yogurt', width: 384, height: 288, spawn: { x: 194, y: 243 },
      objects: [
        wall('wall-top', 0, 0, 384, 51), wall('wall-left', 0, 0, 16, 288), wall('wall-right', 368, 0, 16, 288),
        wall('wall-bottom-left', 0, 277, 160, 11), wall('wall-bottom-right', 224, 277, 160, 11),
        { id: 'counter', type: 'counter', x: 72, y: 75, w: 240, h: 34, solid: true, interact: true },
        { id: 'table-y1', type: 'cafe-table', x: 44, y: 168, w: 46, h: 28, solid: true, interact: true },
        { id: 'table-y2', type: 'cafe-table', x: 283, y: 168, w: 46, h: 28, solid: true },
        { id: 'plant-y1', type: 'plant', x: 30, y: 81, w: 16, h: 20, solid: true },
        { id: 'plant-y2', type: 'plant', x: 339, y: 81, w: 16, h: 20, solid: true },
        { id: 'exit', type: 'door', x: 168, y: 264, w: 48, h: 16, interact: true }
      ],
      npcs: [{ id: 'server', character: 'vendor', name: 'En el mostrador', x: 194, y: 69 }], triggers: []
    },
    flowers: {
      title: 'Un mapa más', width: 960, height: 440, spawn: { x: 65, y: 296 },
      paths: [
        { x: 0, y: 280, w: 197, h: 34 }, { x: 166, y: 258, w: 169, h: 36 },
        { x: 306, y: 235, w: 165, h: 37 }, { x: 444, y: 266, w: 194, h: 35 },
        { x: 610, y: 240, w: 209, h: 36 }, { x: 777, y: 230, w: 121, h: 97 }
      ],
      objects: [
        { id: 'distant-hills', type: 'horizon-boundary', x: 0, y: 0, w: 960, h: 94, solid: true },
        flower('flower1', 151, 294, 0), flower('flower2', 401, 228, 1), flower('flower3', 648, 281, 2),
        { id: 'sign', type: 'sign', x: 472, y: 241, w: 36, h: 29, solid: true, interact: true },
        { id: 'picnic', type: 'picnic', x: 798, y: 248, w: 94, h: 62, interact: true },
        { id: 'lemon-pie', type: 'lemon-pie', x: 850, y: 252, w: 22, h: 16, interact: true },
        tree('tree-f1', 56, 191, 2), tree('tree-f2', 256, 136, 2), tree('tree-f3', 556, 155, 2),
        tree('tree-f4', 753, 141, 2), tree('tree-f5', 926, 206, 2), tree('tree-f6', 918, 406, 2),
        { id: 'rock1', type: 'rock', x: 304, y: 362, w: 24, h: 14, solid: true },
        { id: 'rock2', type: 'rock', x: 684, y: 345, w: 20, h: 12, solid: true }
      ],
      npcs: [{ id: 'kiara', character: 'kiara', name: 'Kiara', x: 836, y: 230 }], triggers: []
    }
  };
})();
