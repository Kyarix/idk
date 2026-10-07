/* Chapter controllers. Dialogue lives in data.js; geometry lives in maps.js.
 * Add a chapter by registering { map, enter(game), update(game, dt), interact(game, target) }.
 */
(function(VG){
  'use strict';
  const cardPeople=['bene','friend1','friend2'];
  const cardDialogue={bene:'cardBene',friend1:'cardFriend1',friend2:'cardFriend2',kiara:'cardKiara'};
  function birthdayGoal(g){
    if(g.flags.birthdayStage==='cards'){
      const dealt=g.flags.cards||[];g.objective(dealt.length<3?`Repartí las cartas · ${dealt.length}/4`:'Dale la última carta a Kiara · 3/4');
      g.npcs.forEach(n=>n.marker=(cardPeople.includes(n.id)&&!dealt.includes(n.id))||(n.id==='kiara'&&dealt.length===3)?'card':null);
      g.object('card-table').marker=null;
    }else{const count=(g.flags.greeted||[]).length;g.objective(count>=2?'Buscá el mazo sobre la mesa':`Saludá a los amigos · ${Math.min(count,2)}/2`);g.object('card-table').marker=count>=2?'talk':null;}
  }
  function plazaGoal(g){
    if(!g.flags.metKiara){g.objective('Encontrá a Kiara');const n=g.npc('kiara');if(n)n.marker='talk';}
    else if(!g.flags.yogurtInvited)g.objective('Dén una vuelta por la plaza');
    else if(!g.flags.yogurt)g.objective('Vayan por yogurt · local al noreste');
    else g.objective('Caminen hasta el banco de la plaza');
    const shop=g.object('yogurt-door');if(shop)shop.marker=g.flags.yogurtInvited&&!g.flags.yogurt?'talk':null;
    const bench=g.object('bench');if(bench)bench.marker=g.flags.yogurt?'talk':null;
  }
  function startKiss(g){
    g.flags.beforeKiss=true;g.checkpoint('before-kiss');g.objective('');
    const k=g.companion;
    const finishMemoryTransition=()=>g.intertitles(VG.STORY.fictionTransition.map(p=>p.text),()=>g.go('flowers'));
    const pauseAfterSecondKiss=()=>g.animate('quiet-bench',4.5,()=>{},finishMemoryTransition);
    const secondKiss=()=>g.animate('second-kiss',1.6,(t,c)=>{
      c.heart=t>.2&&t<1.25;
      if(t>.2&&!c.secondKissSounded){g.audio.play('kiss');c.secondKissSounded=true;}
    },pauseAfterSecondKiss);
    const afterBenchAwkwardness=()=>g.say('secondKiss',()=>g.say('benchConsent',secondKiss));
    const afterBenchThanks=()=>g.say('benchAwkward',afterBenchAwkwardness);
    const afterCheckIn=()=>g.animate('bench-approach',.7, t=>{k.x=512-3*Math.min(t/.55,1);},()=>g.say('benchThanks',afterBenchThanks));
    const afterSitting=()=>g.say('benchCheckIn',afterCheckIn);
    const sitTogether=()=>{
      const a={x:g.player.x,y:g.player.y},b={x:k.x,y:k.y};
      g.animate('bench',2.4,t=>{
        const f=Math.min(t/1.7,1);
        g.player.x=a.x+(500-a.x)*f;g.player.y=a.y+(273-a.y)*f;
        k.x=b.x+(512-b.x)*f;k.y=b.y+(273-b.y)*f;
        g.player.dir=k.dir='down';g.player.seated=k.seated=f===1;g.player.hugging=f===1;
      },afterSitting);
    };
    const afterFirstKiss=()=>g.say('afterKiss',()=>g.say('afterKissMore',()=>g.say('benchComfort',sitTogether)));
    // Valen kisses Kiara briefly, then she turns away. Hold the pose long
    // enough to read the movement before either character says anything.
    g.say('benchConfession',()=>g.animate('kiss',4.8,(t,c)=>{
      const retreat=Math.max(0,Math.min((t-1.1)/.7,1));
      g.player.x=506+8*Math.min(t/1.1,1);g.player.y=295;g.player.dir='right';
      k.x=526+8*retreat;k.y=295-5*retreat;k.dir=t<1.1?'left':'up';
      c.heart=t>.7&&t<1.1;
      if(t>.7&&!c.firstKissSounded){g.audio.play('kiss');c.firstKissSounded=true;}
      c.phase=t<1.1?'approach':'turned-away';
    },afterFirstKiss));
  }
  VG.SCENES={
    birthday:{
      map:'birthday',
      enter(g){
        g.flags.greeted=g.flags.greeted||[];g.flags.cards=g.flags.cards||[];birthdayGoal(g);
        if(!g.flags.birthdayIntro)g.say('birthdayIntro',()=>{g.flags.birthdayIntro=true;g.checkpoint('arrived');});
      },
      update(g){
        const k=g.npc('kiara');
        if(!g.flags.kiaraThought&&k&&VG.distance(g.player,k)<100){g.flags.kiaraThought=true;g.say('kiaraThought',()=>g.checkpoint('party'));}
      },
      interact(g,t){
        if(t.id==='door'){g.go('birthdayPatio');return;}
        if(t.ambient){if(t.dialogue)g.say(t.dialogue);return;}
        if(t.id==='card-table'){
          if(g.flags.birthdayStage==='cards'){birthdayGoal(g);g.toast('Quedan '+(4-g.flags.cards.length)+' cartas.');return;}
          if(g.flags.greeted.length<2){g.say('cardWait');return;}
          g.say('cardsIntro',()=>{g.flags.birthdayStage='cards';birthdayGoal(g);g.checkpoint('dealing');});return;
        }
        if(t.character){
          if(g.flags.birthdayStage==='cards'&&cardDialogue[t.id]){
            if(g.flags.cards.includes(t.id)){g.say(t.id==='bene'?'cardAlready':VG.STORY.genericCardAlready.map(p=>({...p,speaker:VG.CHARACTERS[t.character].name})));return;}
            if(t.id==='kiara'&&g.flags.cards.length<3){g.say('cardKiaraWait');return;}
            const pages=VG.STORY[cardDialogue[t.id]];
            g.say(t.id==='kiara'?pages.concat(VG.STORY.cardsDone):pages,()=>{
              g.flags.cards.push(t.id);birthdayGoal(g);
              if(t.id==='kiara')g.go('instagram');else g.checkpoint('dealing');
            });return;
          }
          let key=t.id==='bene'?(g.flags.greeted.includes('bene')?'beneAgain':'beneFirst'):t.id==='kiara'?'kiaraEarly':VG.STORY[t.character]?t.character:'friend3';
          g.say(key,()=>{if(t.id!=='kiara'&&!g.flags.greeted.includes(t.id))g.flags.greeted.push(t.id);birthdayGoal(g);g.checkpoint('party');});return;
        }
        g.say(t.id==='door'?'birthdayDoor':t.type==='sofa'?'sofa':'table');
      }
    },
    birthdayPatio:{
      map:'birthdayPatio',
      enter(g){g.objective('');},
      update(){},
      interact(g,t){
        if(t.id==='house-door'){g.go('birthday',{position:{x:288,y:315},noBanner:true});return;}
        if(t.ambient){if(t.dialogue)g.say(t.dialogue);return;}
        g.say(t.id==='patio-lamp'?'patioNight':'table');
      }
    },
    instagram:{
      map:null,
      enter(g){g.objective('');g.phone.start();},
      update(){},interact(){}
    },
    plaza:{
      map:'plaza',
      enter(g){
        if(g.flags.metKiara)g.attachCompanion();
        g.flags.walkDistance=g.flags.walkDistance||0;plazaGoal(g);
      },
      update(g,dt){
        if(!g.flags.metKiara)return;
        if(g.player.walking)g.flags.walkDistance+=g.player.speed*dt;
        if(g.flags.yogurt&&g.player.walking){
          g.flags.walkAfterYogurtDistance=(g.flags.walkAfterYogurtDistance||0)+g.player.speed*dt;
          if(!g.flags.walkAfterYogurt&&g.flags.walkAfterYogurtDistance>65){g.flags.walkAfterYogurt=true;g.say('afterYogurtWalk');return;}
        }
        const distance=g.flags.walkDistance;
        if(!g.flags.walk1&&distance>95){g.flags.walk1=true;g.say('walk1',()=>g.checkpoint('walking'));}
        else if(!g.flags.walk2&&distance>235){g.flags.walk2=true;g.say('walk2',()=>g.checkpoint('walking'));}
        else if(!g.flags.walkMission&&distance>310){g.flags.walkMission=true;g.say('walkMission');}
        else if(!g.flags.walkWeather&&distance>420){g.flags.walkWeather=true;g.say('walkWeather');}
        else if(!g.flags.walkComfort&&distance>530){g.flags.walkComfort=true;g.say('walkComfort');}
        else if(!g.flags.yogurtInvited&&distance>640){g.say('yogurtInvite',()=>{g.flags.yogurtInvited=true;plazaGoal(g);g.checkpoint('yogurt-invitation');});}
      },
      interact(g,t){
        if(t.id==='kiara'){
          if(g.flags.metKiara){g.say(g.flags.yogurt?'yogurtDone':'walk2');return;}
          // The greeting itself pauses for a small, deliberately stiff handshake.
          g.say(VG.STORY.plazaHello.slice(0,2),()=>{
            const k=g.npc('kiara');const x=k.x,y=k.y;
            g.animate('handshake',1.8,(time)=>{g.player.x=x-17;g.player.y=y;g.player.dir='right';k.dir='left';},()=>
              g.say(VG.STORY.plazaHello.slice(2),()=>g.say('plazaHelloAfter',()=>{g.flags.metKiara=true;g.attachCompanion();plazaGoal(g);g.checkpoint('together');})));
          });return;
        }
        if(t.id==='yogurt-door'){
          if(!g.flags.metKiara){g.say('shopClosed');return;}
          if(g.flags.yogurt){g.say('shopAfter');return;}
          if(!g.flags.yogurtInvited){g.say('yogurtInvite',()=>{g.flags.yogurtInvited=true;g.go('yogurt');});return;}
          g.go('yogurt');return;
        }
        if(t.id==='bench'){
          if(g.flags.yogurt){startKiss(g);return;}g.say('benchEarly');return;
        }
        g.say(t.character?'backgroundNpc':t.id==='fountain'?'fountain':t.type==='lamp'?'plazaLamp':t.type==='bench'?'benchEarly':t.id==='plaza-sign'?'plazaSign':t.id==='bin'?'plazaBin':'flower4');
      }
    },
    yogurt:{
      map:'yogurt',
      enter(g){g.attachCompanion();g.objective(g.flags.yogurt?'Vuelvan juntos a la plaza':'Elegí tu yogurt en el mostrador');g.object('counter').marker=g.flags.yogurt?null:'talk';},
      update(){},
      interact(g,t){
        if(t.id==='exit'){g.go('plaza',{position:{x:642,y:134}});return;}
        if(t.id==='counter'||t.character==='vendor'){
          if(g.flags.yogurt){g.say('shopAfter');return;}
          g.say('yogurtOrder',(choices)=>{g.flags.yogurt=true;g.flags.yogurtChoices=choices;g.object('counter').marker=null;g.say('yogurtReaction',()=>g.say('yogurtDone',()=>{g.objective('Vuelvan juntos a la plaza');g.checkpoint('yogurt-bought');}));});return;
        }
        g.say('table');
      }
    },
    flowers:{
      map:'flowers',
      enter(g){g.objective('');g.flags.fieldVisited=true;},
      update(){},
      interact(g,t){
        if(t.id==='kiara'){
          if(g.flags.completed){g.say('fieldAfter');return;}
          g.checkpoint('before-message');
          g.declare('finalMessage',()=>{g.flags.finalRead=true;g.say('pieFinal',choices=>{g.flags.pieChoice=choices[0];
            const k=g.npc('kiara');const a={x:g.player.x,y:g.player.y},b={x:k.x,y:k.y};
            g.animate('picnic',6.5,(time,c)=>{const t=Math.min(time/2,1);g.player.x=a.x+(826-a.x)*t;g.player.y=a.y+(276-a.y)*t;k.x=b.x+(840-b.x)*t;k.y=b.y+(276-b.y)*t;g.player.dir=k.dir='down';g.player.seated=k.seated=t===1;g.player.hugging=t===1;c.heart=time>2.5&&time<4;},()=>g.finish());
          });});return;
        }
        g.say(t.id==='lemon-pie'?'lemonPie':t.id==='sign'?'sign':t.id==='picnic'?'picnicBlanket':VG.STORY[t.id]?t.id:'flower4');
      }
    }
  };
  // The phone shares data with the dialogue system but has its own presentation.
  class Phone {
    constructor(g){this.g=g;this.el=document.getElementById('phone-screen');this.feed=document.getElementById('phone-feed');this.button=document.getElementById('phone-next');this.button.addEventListener('click',()=>{this.g.focus();this.next();});}
    start(){
      this.mode='instagram';this.onDone=null;
      this.el.classList.remove('hidden');this.feed.replaceChildren();this.step=0;this.queue=[];this.wait=0;this.finished=false;
      document.getElementById('phone-name').textContent='Social';document.getElementById('phone-subtitle').textContent='gente que quizás conocés';
      const profile=document.createElement('div');profile.className='profile';profile.innerHTML='<span class="profile-face">k</span><strong>kiara</strong><small>Del cumple de Chupe.</small>';
      this.feed.appendChild(profile);this.button.textContent='Seguir a Kiara ＋';
    }
    startConversation(messages,onDone,contact){
      this.mode='conversation';this.onDone=onDone;this.queue=messages.slice();this.wait=0;this.finished=false;
      this.el.classList.remove('hidden');this.feed.replaceChildren();
      document.getElementById('phone-name').textContent=contact.name;
      document.getElementById('phone-subtitle').textContent=contact.subtitle;
      this.button.disabled=false;
      this.showConversationMessage();
    }
    append(p){const e=document.createElement('div');e.className=p.kind==='narrator'?'message-note':'bubble'+(p.speaker==='VALEN'?' valen':'');e.textContent=p.text;this.feed.appendChild(e);this.feed.scrollTop=this.feed.scrollHeight;this.g.audio.play(p.kind==='narrator'?'select':'interact');}
    showConversationMessage(){
      const message=this.queue.shift();
      if(message){
        this.append(message);
        this.finished=this.queue.length===0;
        this.button.textContent=this.finished?'Continuar ↵':'Leer mensaje ↵';
      }else{
        const onDone=this.onDone;this.hide();
        if(onDone)onDone();
      }
    }
    next(){
      if(this.wait>0||this.g.dialogue.active||this.g.transition||this.g.paused)return;
      if(this.mode==='conversation'){
        this.showConversationMessage();
        return;
      }
      if(this.step===0){
        this.append({kind:'narrator',text:'Seguiste a Kiara ✓'});this.button.textContent='Ver mensaje ↵';this.step=1;this.wait=.8;this.button.disabled=true;
      }else if(this.step===1){
        this.append(VG.STORY.instagramNotice[0]);document.getElementById('phone-name').textContent='Kiara';document.getElementById('phone-subtitle').textContent='mensajes';
        this.queue=VG.STORY.instagramHello.concat(VG.STORY.instagramLater,VG.STORY.instagramInvite).slice();this.step=2;this.button.textContent='Leer mensaje ↵';
      }else if(this.step===2){
        const p=this.queue.shift();if(p){
          this.append(p);
          if(p.choices){this.g.say([{speaker:'VALEN',text:'¿Qué respondés?',choices:p.choices.map(c=>({text:c.text,value:c.value,reply:[]}))}],results=>{const c=p.choices.find(c=>c.value===results[0]);this.append({speaker:'VALEN',text:c.text});if(c.reply)this.queue.unshift(...c.reply);this.g.focus();});}
          if(!this.queue.length){this.step=3;this.button.textContent='Continuar ↵';}
        }
      }else if(this.step===3){this.append(VG.STORY.instagramMission[0]);this.step=4;this.button.textContent='Unos días después… ↵';}
      else if(this.step===4){this.g.intertitles([VG.STORY.instagramMission[1].text],()=>this.g.go('plaza'));this.finished=true;}
    }
    update(dt,input){if(this.wait>0){this.wait=Math.max(0,this.wait-dt);if(this.wait===0)this.button.disabled=false;}if(input.consume('interact'))this.next();}
    hide(){this.el.classList.add('hidden');this.button.disabled=false;this.mode=null;this.onDone=null;this.queue=[];}
  }
  VG.Phone=Phone;
})(window.VG=window.VG||{});
