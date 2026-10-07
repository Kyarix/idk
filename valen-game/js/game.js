/* Small reusable engine: state, checkpoints, camera, interactions and transitions.
 * No fetch, imports, dependencies or build step: index.html also works on file://.
 */
(function(VG){
  'use strict';
  const $=id=>document.getElementById(id);
  const SAVE_KEY='valen-game.save.v1', SETTINGS_KEY='valen-game.settings.v1', UNLOCK_KEY='valen-game.unlocks.v1';
  function read(key){try{return JSON.parse(localStorage.getItem(key)||'null');}catch(_){return null;}}
  function write(key,value){try{localStorage.setItem(key,JSON.stringify(value));return true;}catch(_){return false;}}
  const clamp=(v,min,max)=>Math.min(max,Math.max(min,v));
  class Game {
    constructor(){
      this.canvas=$('game');this.input=new VG.Input();this.renderer=new VG.Renderer(this.canvas);
      const s=read(SETTINGS_KEY)||{};
      this.audio=new VG.Audio({volume:typeof s.volume==='number'?clamp(s.volume,0,1):.35,muted:!!s.muted},settings=>{write(SETTINGS_KEY,settings);this.syncAudio();});
      this.dialogue=new VG.Dialogue(this.audio);this.declaration=new VG.Declaration(this);this.phone=new VG.Phone(this);
      this.time=0;this.sceneId='menu';this.flags={};this.camera={x:0,y:0};this.npcs=[];this.map=null;this.player=new VG.Player();this.paused=false;this.debug=false;this.fps=60;this.frame=0;this.toasts=0;this.bannerTime=0;this.stepTime=0;this.transition=null;this.cinematic=null;this.intertitle=null;this.completedView=false;
      this.memoryMode=null;this.mainState=null;this.memoriesOpen=false;this.memorySelection=0;
      this.save=this.validSave(read(SAVE_KEY));this.unlocks=read(UNLOCK_KEY)||{storyCompleted:false,memoriesUnlocked:false};
      if(this.save?.finished||this.save?.flags.completed)this.unlockStory();
      this.bindUI();this.syncAudio();this.refreshMenu();this.setOverlay(true);
      this.intro=1.4;this.last=performance.now();requestAnimationFrame(t=>this.tick(t));
      // Exposed for editing / development; debug shortcuts are gated by F1.
      document.addEventListener('visibilitychange',()=>{if(document.hidden){this.input.clear();if(this.sceneId!=='menu'&&!this.completedView)this.pause(true);}});
    }
    validSave(s){return s&&s.version===1&&VG.SCENES[s.scene]&&!VG.SCENES[s.scene].memory&&s.flags&&typeof s.flags==='object'&&typeof s.checkpoint==='string'?s:null;}
    bindUI(){
      const start=(continuing)=>{this.audio.unlock();this.focus();this.newGame(continuing);};
      $('play-button').onclick=()=>start(false);$('continue-button').onclick=()=>start(true);
      $('settings-button').onclick=()=>{this.audio.unlock();this.pause(!this.paused);};
      $('resume-button').onclick=()=>this.pause(false);
      $('mute-button').onclick=()=>{this.audio.unlock();this.audio.toggleMute();this.focus();};
      $('pause-mute').onclick=()=>{this.audio.unlock();this.audio.toggleMute();};
      $('volume').oninput=e=>this.audio.setVolume(Number(e.target.value)/100);
      $('menu-button').onclick=()=>{const memory=!!this.memoryMode;this.pause(false);if(memory)this.showMemories();else this.showMenu();};
      $('memories-button').onclick=()=>{this.audio.unlock();this.showMemories();};
      $('credits-memories').onclick=()=>this.showMemories();$('credits-menu').onclick=()=>this.showMenu();
      $('memories-back').onclick=()=>{this.showMenu();this.focus();};
      for(const [id,memory] of Object.entries(VG.MEMORIES||{})){
        const button=document.createElement('button');button.className='memory-card';button.dataset.memory=id;
        for(const [className,value] of [['memory-number',memory.number],['memory-name',memory.title],['memory-detail',memory.description||'']]){const span=document.createElement('span');span.className=className;span.textContent=value;button.appendChild(span);}
        button.onclick=()=>this.startMemory(id);$('memory-list').appendChild(button);
      }
      $('memory-list').addEventListener('keydown',event=>{
        const buttons=Array.from($('memory-list').children),current=buttons.indexOf(document.activeElement);
        if(['ArrowDown','ArrowRight','ArrowUp','ArrowLeft'].includes(event.key)){
          event.preventDefault();this.selectMemory(current+(['ArrowUp','ArrowLeft'].includes(event.key)?-1:1));
        }else if(event.code==='KeyE'){event.preventDefault();buttons[Math.max(0,current)]?.click();}
      });
      $('intertitle-next').onclick=()=>{this.focus();this.advanceIntertitle();};
      $('return-field').onclick=()=>{this.completedView=false;$('credits').classList.add('hidden');this.setOverlay(false);this.focus();this.go('flowers',{position:{x:811,y:320}});};
      $('replay').onclick=()=>start(false);
      this.canvas.addEventListener('pointerdown',()=>this.focus());
      // Activation is always tied to a real gesture; audio never autoplays on load.
      document.addEventListener('pointerdown',()=>this.audio.unlock(),{passive:true});
      document.addEventListener('keydown',()=>this.audio.unlock(),{passive:true});
      // Restore game focus after dialogue buttons without suppressing accessible buttons.
      $('dialogue').addEventListener('click',()=>{if(!this.paused)this.focus();});
    }
    focus(){this.canvas.focus({preventScroll:true});}
    syncAudio(){
      if(!this.audio)return;const a=this.audio.settings;$('volume').value=Math.round(a.volume*100);$('volume-value').textContent=Math.round(a.volume*100)+'%';
      $('mute-button').textContent=a.muted?'♫̸':'♪';$('mute-button').setAttribute('aria-label',a.muted?'Activar audio':'Silenciar audio');$('mute-button').setAttribute('aria-pressed',String(a.muted));$('pause-mute').textContent=a.muted?'Activar audio':'Silenciar';
    }
    setOverlay(value){document.body.classList.toggle('overlay-active',value);}
    refreshMenu(){this.save=this.validSave(read(SAVE_KEY));$('continue-button').classList.toggle('hidden',!this.save);$('play-button').textContent=this.save?'Nueva partida':'Jugar';$('memories-button').classList.toggle('hidden',!this.unlocks.storyCompleted);}
    unlockStory(){this.unlocks={storyCompleted:true,memoriesUnlocked:true};write(UNLOCK_KEY,this.unlocks);}
    leaveMemory(){if(this.mainState){this.flags=this.mainState.flags;this.save=this.mainState.save;}this.mainState=null;this.memoryMode=null;}
    selectMemory(index){const buttons=Array.from($('memory-list').children);if(!buttons.length)return;this.memorySelection=(index+buttons.length)%buttons.length;buttons[this.memorySelection].focus({preventScroll:true});buttons[this.memorySelection].scrollIntoView({block:'nearest'});}
    showMemories(){
      if(!this.unlocks.storyCompleted)return false;
      const transition=this.transition;this.showMenu();this.transition=transition;this.memoriesOpen=true;
      $('title-screen').classList.add('hidden');$('memories-screen').classList.remove('hidden');document.body.classList.add('memories-open');
      $('chapter-label').textContent='algunos momentos más';this.audio.scene('flowers');this.selectMemory(this.memorySelection);return true;
    }
    startMemory(id){
      const memory=VG.MEMORIES[id];if(!this.unlocks.storyCompleted||!memory)return false;
      this.audio.unlock();this.leaveMemory();this.mainState={flags:this.flags,save:this.save};this.flags={};this.memoryMode=id;this.memoriesOpen=false;
      $('memories-screen').classList.add('hidden');document.body.classList.remove('memories-open');this.paused=false;this.completedView=false;this.audio.pause(false);this.focus();
      this.go(memory.startScene);return true;
    }
    finishMemory(){this.fadeTo(()=>this.showMemories(),1.8);}
    newGame(continuing=false){
      this.leaveMemory();this.memoriesOpen=false;$('memories-screen').classList.add('hidden');document.body.classList.remove('memories-open');
      this.dialogue.close(true);this.declaration.close(true);this.intertitle=null;this.cinematic=null;this.paused=false;this.completedView=false;$('pause-screen').classList.add('hidden');$('credits').classList.add('hidden');$('intertitle').classList.add('hidden');
      const save=continuing?this.validSave(read(SAVE_KEY)):null;
      this.flags=save?JSON.parse(JSON.stringify(save.flags)):{};
      this.input.clear();this.audio.pause(false);
      this.go(save?save.scene:'birthday',{position:save?.position,checkpoint:save?.checkpoint});
    }
    showMenu(){
      this.leaveMemory();this.memoriesOpen=false;$('memories-screen').classList.add('hidden');document.body.classList.remove('memories-open');
      this.dialogue.close(true);this.declaration.close(true);this.phone.hide();this.cinematic=null;this.intertitle=null;this.transition=null;this.companion=null;this.sceneId='menu';this.map=null;this.target=null;this.completedView=false;this.input.clear();this.objective('');
      $('credits').classList.add('hidden');$('intertitle').classList.add('hidden');$('title-screen').classList.remove('hidden');$('interact-hint').classList.add('hidden');$('chapter-label').textContent='una pequeña aventura';this.setOverlay(true);this.audio.scene('menu');this.refreshMenu();
    }
    loadScene(id,options={}){
      if(!VG.SCENES[id])throw new Error('Unknown chapter: '+id);
      this.dialogue.close(true);this.declaration.close(true);this.phone.hide();this.cinematic=null;this.target=null;this.companion=null;this.followTrace=[];this.sceneId=id;this.scene=VG.SCENES[id];this.sceneAge=0;
      this.map=this.scene.map?JSON.parse(JSON.stringify(VG.MAPS[this.scene.map])):null;
      const spawn=options.position||this.map?.spawn||{x:0,y:0};this.player=new VG.Player(spawn.x,spawn.y,this.scene.playerCharacter||'valen');this.player.dir=spawn.dir||'down';
      this.npcs=this.map?this.map.npcs.map(n=>({...n,dir:n.dir||'down',walking:false})):[];
      // Old or hand-edited checkpoints cannot strand the player inside a wall.
      if(this.map&&!this.player.canMove(this.player.x,this.player.y,this.map,this.npcs)){this.player.x=this.map.spawn.x;this.player.y=this.map.spawn.y;}
      this.input.clear();$('title-screen').classList.add('hidden');$('credits').classList.add('hidden');this.setOverlay(false);
      const chapter=VG.CHAPTERS[this.scene.chapter|| (id==='birthdayPatio'?'birthday':id==='yogurt'?'plaza':id)];
      const memory=this.memoryMode&&VG.MEMORIES[this.memoryMode];$('chapter-label').textContent=memory?'♡ '+memory.title:chapter?chapter.number+' / '+chapter.title:'';
      $('menu-button').textContent=this.memoryMode?'Volver a Recuerdos':'Volver al inicio';
      this.audio.scene(this.scene.audio||(id==='birthdayPatio'?'birthday':id));this.cameraToPlayer(true);this.scene.enter(this,options.checkpoint);this.checkpoint(options.checkpoint||'start');
      if(memory&&id===memory.startScene)this.banner({...memory,memory:true});
      else if(!this.scene.memory&&!options.noBanner&&!this.scene.chapter&&id!=='birthdayPatio'&&id!=='yogurt'&&id!=='instagram'&&id!=='flowers')this.banner(chapter);
    }
    go(id,options={}){this.fadeTo(()=>this.loadScene(id,options));}
    checkpoint(name){
      if(this.memoryMode||this.scene?.memory||!VG.SCENES[this.sceneId])return;
      const data={version:1,scene:this.sceneId,checkpoint:name,position:{x:Math.round(this.player.x),y:Math.round(this.player.y)},flags:JSON.parse(JSON.stringify(this.flags)),finished:!!this.flags.completed};
      if(!write(SAVE_KEY,data)&&!this.warnedStorage){this.warnedStorage=true;this.toast('El navegador no permite guardar. Podés seguir jugando.');}this.save=data;
    }
    resetSave(clearUnlocks=false){try{localStorage.removeItem(SAVE_KEY);if(clearUnlocks)localStorage.removeItem(UNLOCK_KEY);}catch(_){}if(clearUnlocks)this.unlocks={storyCompleted:false,memoriesUnlocked:false};this.save=null;this.refreshMenu();return 'Progreso borrado. Los ajustes de audio se conservaron.';}
    say(key,done){
      const pages=typeof key==='string'?VG.STORY[key]:key;if(!pages)throw new Error('Missing dialogue: '+key);
      this.declaration.close(true);
      this.input.clear();this.player.walking=false;if(this.companion)this.companion.walking=false;this.target=null;$('interact-hint').classList.add('hidden');
      this.dialogue.open(pages,result=>{this.input.clear();this.focus();if(done)done(result);});
    }
    declare(key,done){
      const pages=typeof key==='string'?VG.STORY[key]:key;if(!pages)throw new Error('Missing message: '+key);
      this.dialogue.close(true);this.input.clear();this.player.walking=false;this.target=null;$('interact-hint').classList.add('hidden');
      const k=this.npc('kiara');
      if(k){this.player.x=k.x-44;this.player.y=k.y;this.player.dir='right';k.dir='left';k.walking=false;}
      this.declaration.open(pages,()=>{this.input.clear();this.focus();if(done)done();});this.cameraToPlayer(true);this.focus();
    }
    thoughts(key,done){
      const pages=typeof key==='string'?VG.STORY[key]:key;if(!pages)throw new Error('Missing thoughts: '+key);
      this.dialogue.close(true);this.input.clear();this.player.walking=false;this.target=null;$('interact-hint').classList.add('hidden');
      this.declaration.open(pages,()=>{this.input.clear();this.focus();if(done)done();},{mode:'thoughts'});this.cameraToPlayer(true);this.focus();
    }
    objective(text){$('objective-text').textContent=text;$('objective').classList.toggle('hidden',!text);}
    banner(chapter){if(!chapter)return;$('scene-banner').innerHTML='';const small=document.createElement('small');small.textContent=(chapter.memory?'RECUERDO ':'CAPÍTULO ')+chapter.number;$('scene-banner').appendChild(small);$('scene-banner').appendChild(document.createTextNode(chapter.title));$('scene-banner').classList.remove('hidden');this.bannerTime=3.2;}
    toast(text){$('toast').textContent=text;$('toast').classList.remove('hidden');this.toasts=3;}
    object(id){return this.map?.objects.find(o=>o.id===id);}
    npc(id){return this.npcs.find(n=>n.id===id);}
    attachCompanion(){
      let k=this.npc('kiara');if(k)this.npcs=this.npcs.filter(n=>n!==k);
      const close=k&&VG.distance(k,this.player)<50;
      const comp=new VG.Player(close?k.x:this.player.x+18,close?k.y:this.player.y,'kiara');comp.id='kiara';comp.name='Kiara';comp.solid=false;comp.speed=76;
      if(this.map&&!comp.canMove(comp.x,comp.y,this.map,[])){comp.x=this.player.x;comp.y=this.player.y+17;}
      this.companion=comp;this.followTrace=[];
    }
    updateCompanion(dt){
      const c=this.companion;if(!c)return;
      if(this.player.walking){const last=this.followTrace[this.followTrace.length-1];if(!last||VG.distance(last,this.player)>3)this.followTrace.push({x:this.player.x,y:this.player.y});}
      if(this.followTrace.length>100)this.followTrace.shift();
      c.walking=false;
      if(this.followTrace.length>7){const target=this.followTrace[0],dist=VG.distance(c,target);if(dist<4){this.followTrace.shift();}else c.update(Math.min(dt,dist/c.speed),{x:target.x-c.x,y:target.y-c.y},this.map,[]);}
    }
    animate(kind,duration,update,done){this.input.clear();this.player.walking=false;if(this.companion)this.companion.walking=false;this.cinematic={kind,time:0,duration,update,done,heart:false};this.target=null;$('interact-hint').classList.add('hidden');update(0,this.cinematic);}
    fadeTo(onBlack,duration=1.25){this.input.clear();this.transition={time:0,duration,onBlack,switched:false};this.target=null;this.bannerTime=0;$('scene-banner').classList.add('hidden');$('interact-hint').classList.add('hidden');}
    intertitles(texts,onEnd){this.fadeTo(()=>{this.intertitle={texts,index:0,onEnd,age:0};this.dialogue.close(true);this.phone.hide();$('intertitle').classList.remove('hidden');$('intertitle-text').textContent=texts[0];this.setOverlay(true);this.audio.scene('menu');});}
    advanceIntertitle(){if(!this.intertitle||this.intertitle.age<.7||this.transition)return;const it=this.intertitle;it.index++;it.age=0;if(it.index<it.texts.length){$('intertitle-text').textContent=it.texts[it.index];}else{this.intertitle=null;$('intertitle').classList.add('hidden');this.setOverlay(false);it.onEnd();}}
    finish(){this.flags.completed=true;this.unlockStory();this.checkpoint('finished');this.fadeTo(()=>{this.completedView=true;this.objective('');$('credits').classList.remove('hidden');this.setOverlay(true);});}
    pause(value){
      if(this.sceneId==='menu'&&value){/* Audio settings also work on the title. */}
      this.paused=value;this.input.clear();this.audio.pause(value);$('pause-screen').classList.toggle('hidden',!value);this.setOverlay(value||this.sceneId==='menu'||!!this.intertitle||this.completedView);
      if(value)$('resume-button').focus();else if(this.memoriesOpen)this.selectMemory(this.memorySelection);else this.focus();
    }
    findTarget(){
      const p=this.player, facing={down:{x:0,y:1},up:{x:0,y:-1},left:{x:-1,y:0},right:{x:1,y:0}}[p.dir];
      const candidates=[...this.npcs.filter(n=>n.interact!==false),...((this.sceneId==='plaza'||this.scene?.companionTalk)&&this.companion?[this.companion]:[]),...this.map.objects.filter(o=>o.interact)];let nearest=null,best=Infinity;
      for(const t of candidates){
        const point=t.character?{x:t.x,y:t.y}:{x:clamp(p.x,t.x,t.x+t.w),y:clamp(p.y,t.y,t.y+t.h)};
        const d=VG.distance(p,point);if(d>(t.character?30:24))continue;
        const dot=((point.x-p.x)*facing.x+(point.y-p.y)*facing.y)/(d||1);
        const score=d-dot*5+(t.marker?-100:0)+(t.id==='picnic'?20:0)+(t===this.companion?9:0)-(t.id==='lemon-pie'?5:0);
        if(score<best){best=score;nearest=t;}
      }
      return nearest;
    }
    interact(){
      if(this.target){this.audio.play('interact');const t=this.target;if(t.character){t.dir=this.player.x<t.x?'left':'right';}this.scene.interact(this,t);return;}
      const p=this.player;if(p.x<25||p.y<32||p.x>this.map.width-25||p.y>this.map.height-22)this.say('blocked');
      else if(this.sceneId==='flowers')this.say('flower4');
    }
    cameraToPlayer(snap=false,dt=.016){
      if(!this.map)return;
      const extra=this.declaration.active?40:this.dialogue.active?30:0;
      const x=clamp(this.player.x-192,0,Math.max(0,this.map.width-384));const y=clamp(this.player.y-108+extra,0,Math.max(0,this.map.height-216));
      const alpha=snap?1:Math.min(1,dt*7);this.camera.x+=(x-this.camera.x)*alpha;this.camera.y+=(y-this.camera.y)*alpha;
    }
    debugJump(id){this.leaveMemory();this.memoriesOpen=false;$('memories-screen').classList.add('hidden');document.body.classList.remove('memories-open');this.flags={birthdayIntro:true};if(id==='plaza')this.flags={};this.completedView=false;this.intertitle=null;$('intertitle').classList.add('hidden');this.go(id);}
    update(dt){
      this.frame++;this.fps=this.fps*.95+(1/dt)*.05;
      if(this.input.consume('debug')){this.debug=!this.debug;$('debug').classList.toggle('hidden',!this.debug);}
      if(this.debug){['birthday','instagram','plaza','flowers'].forEach((id,i)=>{if(this.input.consume('digit'+(i+1)))this.debugJump(id);});}
      else ['digit1','digit2','digit3','digit4'].forEach(a=>this.input.consume(a));
      if(this.input.consume('pause'))this.pause(!this.paused);
      if(this.paused)return;
      this.time+=dt;this.sceneAge=(this.sceneAge||0)+dt;
      if(this.intro>0){this.intro=Math.max(0,this.intro-dt);$('fade').style.opacity=String(Math.min(1,this.intro/.95));}
      if(this.transition){const tr=this.transition;tr.time+=dt;let p=tr.time/tr.duration;$('fade').style.opacity=String(p<.5?p*2:Math.max(0,(1-p)*2));if(p>=.5&&!tr.switched){tr.switched=true;tr.onBlack();}if(p>=1&&this.transition===tr){this.transition=null;$('fade').style.opacity='0';this.input.clear();}return;}
      if(this.intro<=0)$('fade').style.opacity='0';
      if(this.toasts>0){this.toasts-=dt;if(this.toasts<=0)$('toast').classList.add('hidden');}
      if(this.bannerTime>0){this.bannerTime-=dt;if(this.bannerTime<=0)$('scene-banner').classList.add('hidden');}
      if(this.memoriesOpen){this.input.clear();return;}
      if(this.sceneId==='menu'){if(this.input.consume('interact'))this.newGame(!!this.save);return;}
      if(this.completedView)return;
      if(this.intertitle){this.intertitle.age+=dt;if(this.input.consume('interact'))this.advanceIntertitle();return;}
      if(this.declaration.active){this.declaration.update(dt,this.input);this.cameraToPlayer(false,dt);return;}
      if(this.cinematic){const c=this.cinematic;c.time+=dt;c.update(c.time,c);if(c.time>=c.duration){this.cinematic=null;c.done?.();}this.cameraToPlayer(false,dt);return;}
      if(this.dialogue.active){this.dialogue.update(dt,this.input);this.cameraToPlayer(false,dt);return;}
      if(this.sceneId==='instagram'||this.scene?.presentation==='phone'){this.phone.update(dt,this.input);return;}
      const before={x:this.player.x,y:this.player.y};this.player.update(dt,this.input.vector(),this.map,this.npcs);this.updateCompanion(dt);this.cameraToPlayer(false,dt);
      if(this.player.walking){this.stepTime+=dt;if(this.stepTime>.28){this.audio.play('footstep');this.stepTime=0;}}
      this.target=this.findTarget();$('interact-hint').classList.toggle('hidden',!this.target);
      if(this.target)$('interact-label').textContent=this.target.marker==='card'?'Dar carta':this.target.character?'Hablar con '+this.target.name:this.target.actionLabel|| (this.target.id==='yogurt-door'?'Entrar':this.target.id==='exit'?'Salir':this.target.type==='patio-door'||this.target.id==='door'&&this.sceneId==='birthday'?this.target.name:'Mirar');
      if(this.input.consume('interact'))this.interact();
      // Movement direction edges are only relevant during menus; never carry them into a choice.
      ['up','down','left','right'].forEach(a=>this.input.consume(a));
      if(!this.dialogue.active&&!this.transition&&!this.cinematic)this.scene.update(this,dt,before);
    }
    tick(now){
      const dt=clamp((now-this.last)/1000,.001,.05);this.last=now;
      this.update(dt);this.renderer.draw(this,dt);
      if(this.debug&&this.frame%12===0)$('debug').textContent=`F1 debug · 1/2/3/4 capítulos\n${this.sceneId} · ${Math.round(this.fps)} FPS\nx ${this.player.x.toFixed(1)} y ${this.player.y.toFixed(1)}\n${this.save?.checkpoint||'sin checkpoint'}\nrojo: colisiones · azul: zonas`;
      requestAnimationFrame(t=>this.tick(t));
    }
  }
  VG.Game=Game;VG.game=new Game();
})(window.VG=window.VG||{});
