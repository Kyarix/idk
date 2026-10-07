(function(VG){
  'use strict';
  class Dialogue {
    constructor(audio){
      this.audio=audio;this.active=false;this.el=document.getElementById('dialogue');this.textEl=document.getElementById('dialogue-text');this.choicesEl=document.getElementById('choices');this.next=document.getElementById('dialogue-next');
      this.next.addEventListener('click',()=>this.advance());
    }
    open(pages,onEnd){
      this.pages=Array.isArray(pages)?pages.slice():[{text:String(pages)}];this.index=0;this.onEnd=onEnd;this.results=[];this.active=true;
      this.el.classList.remove('hidden');document.body.classList.add('dialogue-active');this.show();
    }
    show(){
      const p=this.pages[this.index];if(!p){this.close();return;}
      this.page=p;this.revealed=0;this.elapsed=0;this.selected=0;this.choiceReady=false;this.textEl.textContent='';this.choicesEl.replaceChildren();this.next.classList.remove('hidden');
      document.getElementById('speaker').textContent=p.speaker||'';document.getElementById('thought-tag').textContent=p.kind==='thought'?'· pensamiento':'';
      document.getElementById('page-number').textContent=p.kind==='narrator'?'': '· · ·';
      this.speed=window.matchMedia('(prefers-reduced-motion: reduce)').matches?0:0.018;
      if(!p.text.length)this.buildChoices();
    }
    reveal(){this.revealed=this.page.text.length;this.textEl.textContent=this.page.text;this.buildChoices();}
    buildChoices(){
      if(this.choiceReady||!this.page.choices)return;this.choiceReady=true;this.next.classList.add('hidden');
      this.page.choices.forEach((choice,i)=>{const b=document.createElement('button');b.className='choice'+(i===this.selected?' selected':'');b.textContent=choice.text;b.addEventListener('click',()=>this.choose(i));b.addEventListener('pointerenter',()=>this.select(i));this.choicesEl.appendChild(b);});
    }
    select(i){if(!this.page.choices)return;this.selected=(i+this.page.choices.length)%this.page.choices.length;Array.from(this.choicesEl.children).forEach((b,j)=>b.classList.toggle('selected',j===this.selected));}
    choose(i){if(!this.active||!this.choiceReady)return;const c=this.page.choices[i];this.results.push(c.value??c.text);this.audio.play('select');if(c.reply)this.pages.splice(this.index+1,0,...c.reply);this.index++;this.show();}
    advance(){if(!this.active)return;if(this.revealed<this.page.text.length){this.reveal();return;}if(this.page.choices){this.choose(this.selected);return;}this.audio.play('select');this.index++;this.show();}
    update(dt,input){
      if(!this.active)return;
      if(this.revealed<this.page.text.length){this.elapsed+=dt;const count=this.speed?Math.min(this.page.text.length,Math.floor(this.elapsed/this.speed)):this.page.text.length;if(count>this.revealed){if(count%3===0)this.audio.play('dialogue');this.revealed=count;this.textEl.textContent=this.page.text.slice(0,count);if(count===this.page.text.length)this.buildChoices();}}
      if(input.consume('up')&&this.choiceReady){this.select(this.selected-1);this.audio.play('select');}
      if(input.consume('down')&&this.choiceReady){this.select(this.selected+1);this.audio.play('select');}
      if(input.consume('interact'))this.advance();
    }
    close(silent=false){const callback=this.onEnd,result=this.results;this.active=false;this.onEnd=null;this.el.classList.add('hidden');document.body.classList.remove('dialogue-active');if(!silent&&callback)callback(result);}
  }
  VG.Dialogue=Dialogue;
  // The same manual-page presenter supports the final letter and private
  // thoughts. Story text stays in data.js; neither mode changes its source array.
  class Declaration {
    constructor(game){
      this.game=game;this.active=false;this.mode=null;this.age=0;this.openTime=0;
      this.el=document.getElementById('declaration');
      this.textEl=document.getElementById('declaration-text');
      this.contentEl=this.el.querySelector('.declaration-content');
      this.next=document.getElementById('declaration-next');
      this.nextLabel=document.getElementById('declaration-next-label');
      this.counter=document.getElementById('declaration-counter');
      this.el.addEventListener('click',()=>{
        if(!this.active||this.opening||this.game.paused||this.game.transition)return;
        this.game.focus();this.advance();
      });
      // A keyboard user can also press E while the native next button has focus.
      this.el.addEventListener('keydown',event=>{
        if(event.code!=='KeyE'||event.repeat)return;
        event.preventDefault();event.stopPropagation();this.advance();
      });
    }
    open(pages,onEnd,options={}){
      this.close(true);
      this.mode=options.mode==='thoughts'?'thoughts':'letter';
      this.pages=(Array.isArray(pages)?pages:[pages]).map(page=>typeof page==='string'?{text:page}:page);
      if(this.mode==='letter'&&this.pages[this.pages.length-1]?.text!=='— Kiara ♡'){
        this.pages.push({text:'— Kiara ♡',kind:'signature'});
      }
      this.index=0;this.onEnd=onEnd;this.active=true;this.openTime=0;
      this.opening=this.mode==='letter';
      this.openingDuration=window.matchMedia('(prefers-reduced-motion: reduce)').matches ? .05 : .65;
      this.el.dataset.mode=this.mode;
      this.el.setAttribute('aria-label',this.mode==='letter'?'Carta para Valen':'Pensamientos privados');
      this.el.classList.toggle('letter-opening',this.opening);
      this.el.setAttribute('aria-busy',String(this.opening));
      this.contentEl.setAttribute('aria-hidden',String(this.opening));
      this.next.disabled=this.opening;
      this.el.classList.remove('hidden');document.body.classList.add('declaration-active');
      this.game.input.clear();this.show();
    }
    show(){
      if(!this.active)return;
      const page=this.pages[this.index];if(!page){this.close();return;}
      this.age=0;this.textEl.textContent=page.text||'';
      this.el.classList.toggle('signature-page',page.kind==='signature');
      this.counter.textContent=(this.index+1)+' / '+this.pages.length;
      this.counter.setAttribute('aria-label','Fragmento '+(this.index+1)+' de '+this.pages.length);
      const last=this.index===this.pages.length-1;
      this.nextLabel.textContent=last?'terminar':'continuar';
      this.next.setAttribute('aria-label',last?(this.mode==='letter'?'Cerrar carta':'Terminar pensamientos'):'Continuar al siguiente fragmento');
      this.textEl.scrollTop=0;
      this.textEl.classList.remove('fragment-in');void this.textEl.offsetWidth;
      if(!this.opening)this.textEl.classList.add('fragment-in');
    }
    finishOpening(){
      if(!this.active||!this.opening)return;
      this.opening=false;this.el.classList.remove('letter-opening');
      this.el.setAttribute('aria-busy','false');this.contentEl.setAttribute('aria-hidden','false');
      this.next.disabled=false;this.textEl.classList.add('fragment-in');
      this.game.input.clear();
    }
    advance(){
      if(!this.active||this.opening||this.game.paused||this.game.transition||this.age<.28)return;
      this.game.input.clear();this.index++;this.show();
    }
    update(dt,input){
      if(!this.active||this.game.paused||this.game.transition)return;
      this.age+=dt;this.openTime+=dt;
      if(this.opening){
        // Consume input during the envelope so the opening gesture cannot skip
        // the first fragment. No timers or delayed callbacks survive close().
        input.consume('interact');
        if(this.openTime>=this.openingDuration)this.finishOpening();
        return;
      }
      if(input.consume('interact'))this.advance();
    }
    close(silent=false){
      const callback=this.onEnd;this.onEnd=null;this.active=false;
      this.opening=false;this.mode=null;this.openTime=0;this.age=0;
      this.el.classList.add('hidden');this.el.classList.remove('letter-opening','signature-page');
      delete this.el.dataset.mode;this.el.setAttribute('aria-busy','false');
      this.contentEl.setAttribute('aria-hidden','false');this.next.disabled=false;
      document.body.classList.remove('declaration-active');
      if(!silent&&callback)callback();
    }
  }
  VG.Declaration=Declaration;
})(window.VG=window.VG||{});
