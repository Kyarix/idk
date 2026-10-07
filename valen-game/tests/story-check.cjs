/* Browser integration test: the complete story, saves, actual keyboard/touch,
 * all choice branches, collision and mobile layouts. Node is only a QA tool. */
const {Browser,sleep}=require('./cdp.cjs');
const assert=require('node:assert/strict');
const path=require('node:path');
const os=require('node:os');
const out=path.join(os.tmpdir(),'valen-game-qa');
(async()=>{
 const b=await Browser.launch();
 try{
  await b.waitFor('!!window.VG?.game');await sleep(1600);
  await b.screenshot(path.join(out,'01-title.png'));
  await b.evaluate(`window.QA={
   settle(){const g=VG.game;for(let i=0;i<1000;i++){if(g.transition){g.update(.05);continue;}if(g.cinematic){g.update(.05);continue;}break;}},
   drain(choice=0){const g=VG.game;let count=0;while(g.dialogue.active&&count++<250){g.dialogue.reveal();if(g.dialogue.page.choices)g.dialogue.choose(Math.min(choice,g.dialogue.page.choices.length-1));else g.dialogue.advance();}if(count>=250)throw Error('dialogue loop');},
   target(id){const g=VG.game;let t=g.npcs.find(n=>n.id===id)||g.map.objects.find(o=>o.id===id);if(!t)throw Error('missing '+id);const cx=t.character?t.x:t.x+t.w/2,cy=t.character?t.y:t.y+t.h/2;for(let r=8;r<150;r+=3)for(let a=0;a<Math.PI*2;a+=Math.PI/16){let x=cx+Math.cos(a)*r,y=cy+Math.sin(a)*r;if(!g.player.canMove(x,y,g.map,g.npcs))continue;g.player.x=x;g.player.y=y;g.player.dir=Math.abs(cx-x)>Math.abs(cy-y)?(cx>x?'right':'left'):(cy>y?'down':'up');g.target=g.findTarget();if(g.target?.id===id){g.cameraToPlayer(true);return;}}throw Error('Cannot target '+id);},
   interact(id){this.target(id);VG.game.interact();},
   intertitles(){const g=VG.game;this.settle();let i=0;while(g.intertitle&&i++<10){g.intertitle.age=1;g.advanceIntertitle();this.settle();}}
  }`);
  await b.click('#play-button');await b.waitFor('VG.game.sceneId==="birthday" && !VG.game.transition');
  assert.equal(await b.evaluate('document.activeElement.id'),'game');
  // Real keys reveal, then advance the introduction.
  await b.key('e');await sleep(40);await b.key('Enter');await sleep(40);
  await b.evaluate('QA.drain()');
  const x=await b.evaluate('VG.game.player.x');await b.key('d',{duration:250});
  assert((await b.evaluate('VG.game.player.x'))>x+5,'WASD moves player');
  assert.equal(await b.evaluate(`(()=>{const g=VG.game,p=new VG.Player(25,240);p.update(1,{x:-1,y:0},g.map,[]);return p.x>=21;})()`),true,'walls prevent crossing');
  await b.evaluate(`QA.interact('bene');QA.drain(1);QA.interact('friend1');QA.drain();QA.interact('card-table');QA.drain()`);
  assert.equal(await b.evaluate('VG.game.flags.birthdayStage'),'cards');
  await b.screenshot(path.join(out,'02-birthday.png'));
  await b.evaluate(`QA.interact('bene');QA.drain();QA.interact('friend1');QA.drain();QA.interact('friend2');QA.drain()`);
  assert.deepEqual(await b.evaluate('VG.game.flags.cards'),['bene','friend1','friend2']);
  // A reload resumes the card checkpoint, with already dealt cards preserved.
  await b.navigate(b.origin+'/index.html');await b.waitFor('!!window.VG?.game');
  await b.click('#continue-button');await b.waitFor('VG.game.sceneId==="birthday" && !VG.game.transition');
  assert.equal(await b.evaluate('VG.game.flags.cards.length'),3);
  // Navigation reset the test helpers; copy them from the previous source below.
  await b.evaluate(helperSource);
  await b.evaluate(`QA.target('kiara');VG.game.update(.016);QA.drain();QA.interact('kiara');QA.drain();QA.settle()`);
  assert.equal(await b.evaluate('VG.game.sceneId'),'instagram');
  await b.evaluate('VG.game.phone.next();VG.game.phone.update(1,VG.game.input);VG.game.phone.next();VG.game.phone.next();VG.game.phone.next()');
  await b.screenshot(path.join(out,'03-phone.png'));
  await b.evaluate(`for(let i=0;i<30&&!VG.game.intertitle;i++){VG.game.phone.next();QA.drain(1);QA.settle();}QA.intertitles();QA.settle()`);
  assert.equal(await b.evaluate('VG.game.sceneId'),'plaza');
  await b.evaluate(`QA.interact('kiara');QA.drain();QA.settle();QA.drain()`);
  assert.equal(await b.evaluate('VG.game.flags.metKiara'),true);
  assert(await b.evaluate('!!VG.game.companion'));
  // Enough genuine player movement to trigger all three walk conversations.
  await b.evaluate(`const g=VG.game;g.player.x=310;g.player.y=295;g.input.held.add('KeyD');for(let i=0;i<170;i++){g.update(.05);if(g.dialogue.active){QA.drain(2);g.input.held.add('KeyD');}}g.input.clear();`);
  // If a bench stops the walk, take a second open strip.
  await b.evaluate(`if(!VG.game.flags.yogurtInvited){const g=VG.game;g.player.x=350;g.player.y=350;g.input.held.add('KeyA');for(let i=0;i<180;i++){g.update(.05);if(g.dialogue.active){QA.drain();g.input.held.add('KeyA');}}g.input.clear();}`);
  assert.equal(await b.evaluate('VG.game.flags.yogurtInvited'),true,'walk triggers yogurt invitation');
  await b.screenshot(path.join(out,'04-plaza.png'));
  await b.evaluate(`QA.interact('yogurt-door');QA.settle();QA.interact('counter');VG.game.dialogue.reveal()`);
  await b.screenshot(path.join(out,'05-yogurt.png'));
  await b.evaluate(`QA.drain(2)`);
  assert.equal(await b.evaluate('VG.game.flags.yogurt'),true);
  assert.equal((await b.evaluate('VG.game.flags.yogurtChoices')).length,2);
  await b.evaluate(`QA.interact('exit');QA.settle();QA.interact('bench');QA.drain();QA.settle()`);
  assert.equal(await b.evaluate('VG.game.dialogue.page.speaker'),'VALEN');
  assert.match(await b.evaluate('VG.game.dialogue.page.text'),/perdón/);
  await b.evaluate('VG.game.dialogue.reveal()');await b.screenshot(path.join(out,'06-after-kiss.png'));
  await b.evaluate('QA.drain();QA.settle();QA.drain();QA.settle();QA.intertitles();QA.settle()');
  assert.equal(await b.evaluate('VG.game.sceneId'),'flowers');
  assert.equal(await b.evaluate('!!VG.game.companion'),false);
  assert.equal(await b.evaluate('document.querySelector("#objective").classList.contains("hidden")'),true);
  await b.evaluate(`QA.interact('flower1');QA.drain();QA.interact('flower2');QA.drain();QA.interact('lemon-pie');QA.drain();QA.target('kiara');VG.game.renderer.draw(VG.game)`);
  await b.screenshot(path.join(out,'07-flowers.png'));
  await b.evaluate(`QA.interact('kiara');VG.game.dialogue.reveal()`);
  await b.screenshot(path.join(out,'08-final-message.png'));
  // Check every choice branch, including the final empty-text choice page.
  for(const key of ['yogurtOrder','pieFinal'])for(let option=0;option<3;option++){
   assert(await b.evaluate(`(()=>{let ended=false;const d=new VG.Dialogue(VG.game.audio);d.open(VG.STORY['${key}'],()=>ended=true);for(let n=0;n<60&&d.active;n++){d.reveal();if(d.page.choices)d.choose(${option});else d.advance();}return ended;})()`));
  }
  await b.evaluate(`VG.game.say('finalMessage',()=>VG.SCENES.flowers.interact(VG.game,VG.game.npc('kiara')));QA.drain(2);QA.settle()`);
  assert.equal(await b.evaluate('VG.game.flags.completed'),true);
  assert.equal(await b.evaluate('VG.game.completedView'),true);
  await b.screenshot(path.join(out,'09-credits.png'));
  await b.click('#return-field');await b.waitFor('!VG.game.transition');
  await b.evaluate(`QA.interact('kiara');QA.drain()`);
  assert.equal(await b.evaluate('VG.game.dialogue.active'),false);
  // Pause/volume persistence and native focus restoration.
  await b.click('#settings-button');assert.equal(await b.evaluate('VG.game.paused'),true);
  await b.evaluate('VG.game.audio.setVolume(.2);VG.game.audio.setMuted(true)');
  await b.click('#resume-button');assert.equal(await b.evaluate('document.activeElement.id'),'game');
  // Mobile controls must actually move the player and release cleanly.
  await b.viewport({width:844,height:390,mobile:true});await sleep(200);
  await b.evaluate('VG.game.player.x=700;VG.game.player.y=298;VG.game.cameraToPlayer(true)');
  const point=await b.evaluate(`(()=>{const r=document.querySelector('[data-direction="right"]').getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2};})()`);
  await b.command('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{...point,id:1}]});await sleep(250);
  await b.command('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
  assert((await b.evaluate('VG.game.player.x'))>706,'touch movement works');
  assert.deepEqual(await b.evaluate('VG.game.input.vector()'),{x:0,y:0});
  await b.screenshot(path.join(out,'10-mobile-landscape.png'));
  await b.viewport({width:390,height:844,mobile:true});await sleep(200);
  assert(await b.evaluate('document.documentElement.scrollWidth<=innerWidth'),'no horizontal page overflow');
  await b.evaluate(`QA.target('kiara');QA.interact('kiara');VG.game.dialogue.reveal()`);
  await b.screenshot(path.join(out,'11-mobile-portrait.png'));
  const audio=await b.evaluate(`JSON.parse(localStorage.getItem('valen-game.settings.v1'))`);assert.equal(audio.volume,.2);assert.equal(audio.muted,true);
  assert.equal(b.errors.length,0,b.errors.join('\n'));
  // file:// works with exactly the same scripts and placeholder assets.
  await b.navigate('file:///'+path.resolve(__dirname,'../index.html').replaceAll('\\','/'));
  await b.waitFor('!!window.VG?.game');await sleep(1600);assert.equal(await b.evaluate('VG.game.sceneId'),'menu');
  assert.equal(b.errors.length,0,b.errors.join('\n'));
  console.log('PASS: all four chapters, three endings, saves, audio preferences, keyboard, collision, touch, mobile, file://.');
  console.log('Screenshots: '+out);
 }finally{await b.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});

// Equivalent helpers restored after an intentional page reload.
const helperSource=`window.QA={
 settle(){const g=VG.game;for(let i=0;i<1000;i++){if(g.transition||g.cinematic){g.update(.05);continue;}break;}},
 drain(choice=0){const g=VG.game;let n=0;while(g.dialogue.active&&n++<250){g.dialogue.reveal();if(g.dialogue.page.choices)g.dialogue.choose(Math.min(choice,g.dialogue.page.choices.length-1));else g.dialogue.advance();}if(n>=250)throw Error('dialogue loop');},
 target(id){const g=VG.game;let t=g.npcs.find(n=>n.id===id)||g.map.objects.find(o=>o.id===id);if(!t)throw Error('missing '+id);const cx=t.character?t.x:t.x+t.w/2,cy=t.character?t.y:t.y+t.h/2;for(let r=8;r<150;r+=3)for(let a=0;a<Math.PI*2;a+=Math.PI/16){let x=cx+Math.cos(a)*r,y=cy+Math.sin(a)*r;if(!g.player.canMove(x,y,g.map,g.npcs))continue;g.player.x=x;g.player.y=y;g.player.dir=Math.abs(cx-x)>Math.abs(cy-y)?(cx>x?'right':'left'):(cy>y?'down':'up');g.target=g.findTarget();if(g.target?.id===id){g.cameraToPlayer(true);return;}}throw Error('Cannot target '+id);},
 interact(id){this.target(id);VG.game.interact();},
 intertitles(){const g=VG.game;this.settle();let i=0;while(g.intertitle&&i++<10){g.intertitle.age=1;g.advanceIntertitle();this.settle();}}
}`;
