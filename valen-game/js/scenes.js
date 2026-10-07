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
    // Two small movements, a heart, then Kiara takes a nervous step back.
    g.say('benchConfession',()=>{
      g.animate('kiss',4.4,(t,c)=>{
        g.player.x=506+10*Math.min(t/1.4,1);g.player.y=295;g.player.dir='right';
        k.x=526+7*Math.max(0,Math.min((t-2.8)/.8,1));k.y=295;k.dir='left';
        c.heart=t>1.4&&t<2.7;if(t>1.5&&!c.sounded){g.audio.play('kiss');c.sounded=true;}
      },()=>g.say('afterKiss',()=>g.say('benchComfort',()=>{
        const a={x:g.player.x,y:g.player.y},b={x:k.x,y:k.y};
        g.animate('bench',2.4,(t)=>{const f=Math.min(t/1.7,1);g.player.x=a.x+(500-a.x)*f;g.player.y=a.y+(273-a.y)*f;k.x=b.x+(512-b.x)*f;k.y=b.y+(273-b.y)*f;g.player.dir=k.dir='down';g.player.seated=k.seated=f===1;g.player.hugging=f===1;},()=>
          g.say('secondKiss',()=>g.animate('bench',5,(t,c)=>{g.player.hugging=true;c.heart=t>1&&t<2.6;if(t>1&&!c.sounded){g.audio.play('kiss');c.sounded=true;}},()=>
            g.intertitles(VG.STORY.fictionTransition.map(p=>p.text),()=>g.go('flowers'))
          )));
      })));
    });
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
        const distance=g.flags.walkDistance;
        if(!g.flags.walk1&&distance>95){g.flags.walk1=true;g.say('walk1',()=>g.checkpoint('walking'));}
        else if(!g.flags.walk2&&distance>235){g.flags.walk2=true;g.say('walk2',()=>g.checkpoint('walking'));}
        else if(!g.flags.yogurtInvited&&distance>350){g.say('yogurtInvite',()=>{g.flags.yogurtInvited=true;plazaGoal(g);g.checkpoint('yogurt-invitation');});}
      },
      interact(g,t){
        if(t.id==='kiara'){
          if(g.flags.metKiara){g.say(g.flags.yogurt?'yogurtDone':'walk2');return;}
          // The greeting itself pauses for a small, deliberately stiff handshake.
          g.say(VG.STORY.plazaHello.slice(0,2),()=>{
            const k=g.npc('kiara');const x=k.x,y=k.y;
            g.animate('handshake',1.8,(time)=>{g.player.x=x-17;g.player.y=y;g.player.dir='right';k.dir='left';},()=>
              g.say(VG.STORY.plazaHello.slice(2),()=>{g.flags.metKiara=true;g.attachCompanion();plazaGoal(g);g.checkpoint('together');}));
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
          g.say('yogurtOrder',(choices)=>{g.flags.yogurt=true;g.flags.yogurtChoices=choices;g.object('counter').marker=null;g.say('yogurtDone',()=>{g.objective('Vuelvan juntos a la plaza');g.checkpoint('yogurt-bought');});});return;
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
          g.say('finalMessage',()=>{g.flags.finalRead=true;g.say('pieFinal',choices=>{g.flags.pieChoice=choices[0];
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
      this.el.classList.remove('hidden');this.feed.replaceChildren();this.step=0;this.queue=[];this.wait=0;this.finished=false;
      document.getElementById('phone-name').textContent='Social';document.getElementById('phone-subtitle').textContent='gente que quizás conocés';
      const profile=document.createElement('div');profile.className='profile';profile.innerHTML='<span class="profile-face">k</span><strong>kiara</strong><small>Del cumple de Chupe.</small>';
      this.feed.appendChild(profile);this.button.textContent='Seguir a Kiara ＋';
    }
    append(p){const e=document.createElement('div');e.className=p.kind==='narrator'?'message-note':'bubble'+(p.speaker==='VALEN'?' valen':'');e.textContent=p.text;this.feed.appendChild(e);this.feed.scrollTop=this.feed.scrollHeight;this.g.audio.play(p.kind==='narrator'?'select':'interact');}
    next(){
      if(this.wait>0||this.g.dialogue.active||this.g.transition||this.g.paused)return;
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
    hide(){this.el.classList.add('hidden');this.button.disabled=false;}
  }
  VG.Phone=Phone;
})(window.VG=window.VG||{});
