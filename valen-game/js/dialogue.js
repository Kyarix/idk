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
  // This presentation belongs only to the final message. It deliberately has
  // no speaker label, border, choices or automatic advancement.
  class Declaration {
    constructor(game){
      this.game=game;this.active=false;this.el=document.getElementById('declaration');
      this.textEl=document.getElementById('declaration-text');
      this.el.addEventListener('click',()=>{this.game.focus();this.advance();});
    }
    open(pages,onEnd){
      this.pages=pages;this.index=0;this.onEnd=onEnd;this.active=true;
      this.el.classList.remove('hidden');document.body.classList.add('declaration-active');this.show();
    }
    show(){
      const page=this.pages[this.index];if(!page){this.close();return;}
      this.age=0;this.textEl.textContent=page.text;
      this.textEl.classList.remove('fragment-in');void this.textEl.offsetWidth;
      this.textEl.classList.add('fragment-in');
    }
    advance(){
      if(!this.active||this.game.paused||this.game.transition||this.age<.28)return;
      this.game.input.clear();this.index++;this.show();
    }
    update(dt,input){this.age+=dt;if(input.consume('interact'))this.advance();}
    close(silent=false){
      const callback=this.onEnd;this.onEnd=null;this.active=false;
      this.el.classList.add('hidden');document.body.classList.remove('declaration-active');
      if(!silent&&callback)callback();
    }
  }
  VG.Declaration=Declaration;
})(window.VG=window.VG||{});
