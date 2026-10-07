/* Actors use world coordinates at the centre of their feet. */
(function (VG) {
  'use strict';
  VG.rectOverlap = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  VG.distance = (a,b) => Math.hypot(a.x-b.x,a.y-b.y);
  class Player {
    constructor(x=0,y=0,character='valen') { this.x=x;this.y=y;this.character=character;this.dir='down';this.walking=false;this.speed=67;this.trail=[]; }
    bounds(x=this.x,y=this.y) { return {x:x-5,y:y-6,w:10,h:7}; }
    canMove(x,y,map,npcs=[]) {
      if(x<10||y<24||x>map.width-10||y>map.height-9)return false;
      const box=this.bounds(x,y);
      return !map.objects.some(o=>o.solid&&VG.rectOverlap(box,o.collision||o)) && !npcs.some(n=>n.solid!==false&&VG.rectOverlap(box,{x:n.x-5,y:n.y-5,w:10,h:6}));
    }
    update(dt,vector,map,npcs) {
      this.walking=false;
      if(!vector.x&&!vector.y)return;
      const length=Math.hypot(vector.x,vector.y);const dx=vector.x/length*this.speed*dt,dy=vector.y/length*this.speed*dt;
      if(Math.abs(vector.x)>Math.abs(vector.y))this.dir=vector.x>0?'right':'left';else this.dir=vector.y>0?'down':'up';
      // Substeps keep walls solid even at a low frame rate.
      const steps=Math.ceil(Math.max(Math.abs(dx),Math.abs(dy))/3);
      for(let i=0;i<steps;i++){
        if(this.canMove(this.x+dx/steps,this.y,map,npcs)){this.x+=dx/steps;this.walking=true;}
        if(this.canMove(this.x,this.y+dy/steps,map,npcs)){this.y+=dy/steps;this.walking=true;}
      }
      if(this.walking && (!this.trail.length||VG.distance(this,this.trail[this.trail.length-1])>3)){this.trail.push({x:this.x,y:this.y,dir:this.dir});if(this.trail.length>60)this.trail.shift();}
    }
  }
  VG.Player=Player;
})(window.VG=window.VG||{});
