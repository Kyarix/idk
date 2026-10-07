/* Additional locations reuse the same renderer, collisions and interaction API.
 * These are suggestive layouts, not reconstructions of real addresses.
 * Actor coordinates mark feet; object rectangles mark their physical footprint.
 */
(function(VG){
  'use strict';
  const obj=(id,type,x,y,w,h,extra={})=>({id,type,x,y,w,h,...extra});
  const solid=(id,type,x,y,w,h,extra={})=>obj(id,type,x,y,w,h,{solid:true,...extra});
  const use=(id,type,x,y,w,h,extra={})=>obj(id,type,x,y,w,h,{interact:true,...extra});
  const person=(id,character,x,y,name,dir='down')=>({id,character,x,y,name,dir});
  const tree=(id,x,y)=>solid(id,'tree',x,y,20,15,{variant:1});
  const roomWalls=(w,h,doorX)=>[
    solid('wall-top','wall',0,0,w,53),solid('wall-left','wall',0,0,14,h),solid('wall-right','wall',w-14,0,14,h),
    solid('wall-bottom-left','wall',0,h-11,doorX,11),solid('wall-bottom-right','wall',doorX+48,h-11,w-doorX-48,11)
  ];
  const M={
    memoryApartment:{
      title:'El departamento',theme:'apartment',width:480,height:320,spawn:{x:231,y:258},
      objects:[...roomWalls(480,320,216),
        use('kitchen','stove',40,66,164,38,{solid:true}),
        solid('notebook-table','table',136,137,128,36),
        use('notebook','notebook',150,143,24,18,{depth:174}),
        use('pc','pc',173,136,82,29,{depth:174}),
        use('stairs','stairs',399,165,52,76),
        use('exit','door',216,294,48,16),
        solid('plant-apartment','plant',440,70,16,20),
        solid('bookcase','shelf',272,62,36,22),
        obj('valen-chair','chair',165,183,18,15,{flat:true}),
        obj('kiara-chair','chair',203,183,18,15,{flat:true}),
        use('bag','bag',282,212,16,12),
        use('window','window-point',72,54,35,7)
      ],npcs:[person('kiara','kiara',212,187,'Kiara','up')],triggers:[]
    },
    memoryBedroom:{
      title:'Arriba',theme:'bedroom',width:384,height:288,spawn:{x:288,y:233},
      objects:[...roomWalls(384,288,290),
        use('bed','bed',112,94,144,100,{solid:true}),
        use('notebook','notebook',221,142,24,18,{depth:195}),
        use('stairs','stairs',290,212,58,50),
        solid('nightstand','nightstand',75,107,26,27),
        obj('bedside-light','small-light',81,108,12,12),
        solid('wardrobe','wardrobe',285,58,68,51),
        solid('bedroom-plant','plant',30,77,16,20),
        use('book','book',59,207,21,13),
        use('window','window-point',163,54,42,7)
      ],npcs:[person('kiara','kiara',270,161,'Kiara','left')],triggers:[]
    },
    memoryBusStop:{
      title:'La parada',theme:'street',width:640,height:360,spawn:{x:92,y:230},
      paths:[],
      objects:[
        solid('cafe-building','town-building',283,30,126,85,{label:'CAFÉ',color:'#9f9d79'}),
        solid('apartment-building','town-building',461,16,139,99,{label:'',color:'#bd9a7b'}),
        use('apartment-door','shop-door',507,115,44,20),
        use('cafe-door','shop-door',327,115,44,20),
        use('bus-stop','bus-stop',155,184,24,24,{solid:true}),
        obj('bus','bus',166,272,130,45),
        solid('bus-bench','bench',67,189,60,24),
        tree('street-tree1',42,104),tree('street-tree2',236,150),tree('street-tree3',565,203),
        use('street-lamp','lamp',376,211,9,10,{solid:true}),
        use('street-sign','town-sign',27,160,60,25,{label:'la parada'})
      ],npcs:[person('kiara','kiara',199,224,'Kiara','left')],triggers:[]
    },
    memoryCafe:{
      title:'Un rato en el café',theme:'cafe',width:480,height:288,spawn:{x:235,y:242},
      objects:[...roomWalls(480,288,216),
        use('meal-table','meal-table',195,131,91,41,{solid:true,meal:'cafe'}),
        use('exit','door',216,265,48,16),
        solid('cafe-counter','cafe-counter',313,63,130,35),
        solid('cafe-table1','cafe-table',43,128,58,34),solid('cafe-table2','cafe-table',351,181,58,34),
        solid('cafe-plant1','plant',27,80,16,20),solid('cafe-plant2','plant',431,234,16,20),
        use('menu','menu-board',102,62,43,31,{solid:true}),
        solid('shelf-cafe','shelf',222,58,46,22)
      ],npcs:[person('kiara','kiara',253,189,'Kiara','up'),person('barista','vendor',354,111,'En el café','down'),person('cafe-guest','friend4',83,179,'Una persona','up')],triggers:[]
    },
    memoryRestaurant:{
      title:'Cena de último momento',theme:'restaurant',night:true,width:576,height:336,spawn:{x:275,y:289},
      objects:[...roomWalls(576,336,264),
        use('dinner-table','meal-table',215,138,130,52,{solid:true,meal:'dinner'}),
        use('exit','door',264,313,48,16),
        solid('dinner-table2','meal-table',63,88,76,42,{meal:'dinner'}),
        solid('dinner-table3','meal-table',414,98,79,43,{meal:'dinner'}),
        solid('dinner-table4','meal-table',64,243,82,40,{meal:'dinner'}),
        solid('restaurant-counter','cafe-counter',349,61,178,26),
        solid('restaurant-plant1','plant',24,66,16,20),solid('restaurant-plant2','plant',532,258,16,20),
        obj('candle-main','candle',277,143,5,14,{depth:191}),
        obj('warm-light1','small-light',57,183,12,12),obj('warm-light2','small-light',505,215,12,12),
        use('menu','menu-board',160,63,37,33,{solid:true})
      ],npcs:[person('kiara','kiara',273,210,'Kiara','up'),person('bene','bene',315,211,'Bene','up'),person('restaurant-guest','friend3',103,145,'Una persona','up'),person('waiter','vendor',435,220,'Una persona','left')],triggers:[]
    },
    memoryTown:{
      title:'Pueblo Esther',theme:'town',width:896,height:448,spawn:{x:64,y:355},
      paths:[{x:0,y:274,w:896,h:51},{x:208,y:116,w:47,h:282},{x:228,y:185,w:241,h:43},{x:427,y:145,w:43,h:142},{x:631,y:227,w:44,h:188}],
      objects:[
        solid('mamalu-building','town-building',389,46,131,98,{label:'Mamalu',color:'#b99c7d'}),
        use('mamalu-door','shop-door',427,143,44,20),
        use('pitch-door','gate',815,267,44,40,{label:'CANCHA'}),
        use('bus-stop','bus-stop',72,300,24,24,{solid:true}),
        solid('house-town1','town-building',43,77,101,73,{color:'#c4ab84'}),
        solid('house-town2','town-building',283,73,81,68,{color:'#bd9478'}),
        solid('house-town3','town-building',611,86,114,82,{color:'#b5b087'}),
        solid('house-town4','town-building',737,103,99,71,{color:'#c1a381'}),
        solid('town-bench','bench',482,233,65,23),
        use('town-sign','town-sign',127,344,73,29,{label:'Pueblo Esther',solid:true}),
        tree('town-tree1',171,174),tree('town-tree2',293,244),tree('town-tree3',570,170),tree('town-tree4',750,251),
        tree('town-tree5',548,410),tree('town-tree6',792,408),
        use('town-flowers','flower-bed',302,350,83,32),
        solid('town-lamp','lamp',399,251,9,10)
      ],npcs:[person('sebi','sebi',682,290,'Sebi','left'),person('town-person1','friend3',180,253,'Un vecino','right'),person('town-person2','friend4',565,326,'Una vecina','left')],triggers:[]
    },
    memoryMamalu:{
      title:'Mamalu',theme:'mamalu',width:480,height:288,spawn:{x:235,y:242},
      objects:[...roomWalls(480,288,216),
        use('tiramisu-table','meal-table',195,131,91,41,{solid:true,meal:'tiramisu'}),
        use('exit','door',216,265,48,16),
        solid('mamalu-counter','cafe-counter',298,65,148,34),
        solid('mamalu-table1','cafe-table',46,130,58,33),
        solid('mamalu-table2','cafe-table',346,190,58,33),
        solid('mamalu-plant1','plant',30,74,16,20),solid('mamalu-plant2','plant',432,229,16,20),
        use('menu','menu-board',130,61,42,31,{solid:true})
      ],npcs:[person('kiara','kiara',253,189,'Kiara','up'),person('mamalu-server','vendor',347,113,'En Mamalu','down')],triggers:[]
    },
    memoryPitch:{
      title:'Un rato de fútbol',theme:'football',width:640,height:400,spawn:{x:115,y:329},
      pitch:{x:105,y:65,w:442,h:226},
      objects:[
        use('exit','gate',82,309,40,18),use('ball','ball',316,192,10,10),
        obj('goal-left','goal',88,144,18,64),obj('goal-right','goal',546,144,18,64),
        solid('pitch-bench','bench',129,355,89,22),
        solid('pitch-fence-top','fence',79,36,487,8),solid('pitch-fence-right','fence',577,37,9,280),
        solid('pitch-fence-bottom','fence',229,316,357,8),
        tree('pitch-tree1',30,148),tree('pitch-tree2',604,329),
        use('water','water-bottles',297,346,20,16)
      ],npcs:[person('kiara','kiara',167,338,'Kiara','up'),person('sebi','sebi',359,160,'Sebi','left'),person('football1','friend1',433,218,'Un amigo','left'),person('football2','friend3',201,135,'Un amigo','right')],triggers:[]
    },
    memoryKiaraRoom:{
      title:'Kiara',theme:'kiaraBedroom',night:true,width:384,height:288,spawn:{x:277,y:230},
      objects:[...roomWalls(384,288,280),
        use('bed','bed',105,99,150,99,{solid:true,blanket:'#ad8788'}),
        solid('nightstand','nightstand',73,111,25,35),use('phone','phone',82,126,16,14,{depth:148}),
        use('desk','pc-desk',275,72,78,35,{solid:true}),
        obj('room-light','small-light',51,178,13,13),
        solid('kiara-plant','plant',28,68,16,20),solid('kiara-books','shelf',284,179,48,24),
        use('window','window-point',121,53,40,7),use('exit','door',280,266,48,14)
      ],npcs:[],triggers:[]
    },
    memoryTransit:{
      title:'En camino',theme:'transit',night:true,width:640,height:320,spawn:{x:143,y:176},
      objects:[
        use('bus-stop','bus-stop',100,130,22,24,{solid:true}),
        use('bus','bus',180,215,132,44),use('car','car',422,206,77,34),
        solid('transit-building1','town-building',235,30,97,76,{color:'#b4a484'}),
        solid('transit-building2','town-building',405,22,139,84,{color:'#ae9880'}),
        tree('transit-tree1',53,122),tree('transit-tree2',568,151),
        solid('transit-light','lamp',356,158,9,10),
        use('exit','shop-door',583,166,30,20)
      ],npcs:[person('kiara','kiara',198,176,'Kiara','left'),person('bene','bene',439,188,'Bene','down')],triggers:[]
    }
  };
  // A stable key keeps cached scenery distinct when two locations share a theme.
  for(const [key,map] of Object.entries(M))map.id=key;
  Object.assign(VG.MAPS,M);
})(window.VG=window.VG||{});
