(function () {
  'use strict';
  const V = window.VG = window.VG || {};
  const FALLBACK = {
    valen: { skin: '#f0c7a4', hair: '#6b4433', shirt: '#557c90', pants: '#354251' },
    kiara: { skin: '#f1c5a0', hair: '#b95434', shirt: '#e8c785', pants: '#75604f' },
    bene: { skin: '#d6a27d', hair: '#3f3434', shirt: '#7e9470', pants: '#465055' },
    friend1: { skin: '#b98462', hair: '#3c3134', shirt: '#cb856d', pants: '#4c5168' },
    friend2: { skin: '#eac09b', hair: '#55433d', shirt: '#aa87a3', pants: '#544b6b' },
    chupe: { skin: '#e3b083', hair: '#8b613d', shirt: '#e0b46e', pants: '#59656c' }
  };
  const SPRITE_ANIMATIONS = {
    down: { idle: [0, 0], walk: [[1, 0], [2, 0], [3, 0]] },
    left: { idle: [1, 1], walk: [[1, 1], [2, 1]] },
    right: { idle: [0, 2], walk: [[0, 2], [1, 2]] },
    up: { idle: [3, 2], walk: [[2, 2], [0, 3]] }
  };
  const hash = (x, y, seed = 0) => {
    let n = Math.imul(x + seed * 67, 374761393) + Math.imul(y, 668265263);
    n = Math.imul(n ^ (n >>> 13), 1274126177);
    return ((n ^ (n >>> 16)) >>> 0) / 4294967295;
  };
  const overlaps = (a, b, pad = 0) => a.x < b.x + b.w + pad && a.x + a.w > b.x - pad && a.y < b.y + b.h + pad && a.y + a.h > b.y - pad;

  class Renderer {
    constructor(canvas) {
      this.canvas = canvas;
      this.ctx = canvas.getContext('2d', { alpha: false });
      this.ctx.imageSmoothingEnabled = false;
      this.sprites = {};
      this.ground = new Map();
      this.t = 0;
    }
    rect(x, y, w, h, color) {
      this.ctx.fillStyle = color;
      this.ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
    }
    text(s, x, y, color = '#fff0ce', size = 7, align = 'left') {
      this.ctx.font = `${size}px monospace`;
      this.ctx.textAlign = align;
      this.ctx.textBaseline = 'top';
      this.ctx.fillStyle = color;
      this.ctx.fillText(s, Math.round(x), Math.round(y));
    }
    shadow(x, y, w, h = 6) {
      this.ctx.fillStyle = 'rgba(47,57,45,.18)';
      this.ctx.fillRect(Math.round(x + 3), Math.round(y), w - 6, h);
      this.ctx.fillRect(Math.round(x), Math.round(y + 2), w, Math.max(2, h - 4));
    }
    draw(game) {
      const c = this.ctx;
      c.imageSmoothingEnabled = false;
      this.t = Number(game.time) || 0;
      const menu = !game.map || game.sceneId === 'menu';
      if (game.sceneId === 'instagram') {
        this.rect(0, 0, this.canvas.width, this.canvas.height, '#eee2c9');
        for (let y = 0; y < this.canvas.height; y += 16) for (let x = 0; x < this.canvas.width; x += 16)
          this.rect(x + 7, y + 7, 1, 1, '#ddccb5');
        return;
      }
      const map = menu ? V.MAPS.flowers : game.map;
      if (!map) return;
      const scene = menu ? 'flowers' : (map.theme || map.style || (game.sceneId === 'flowerField' ? 'flowers' : game.sceneId));
      this.night = !!map.night;
      const cam = menu ? { x: 500, y: 130 } : (game.camera || { x: 0, y: 0 });
      c.save();
      c.translate(-Math.round(cam.x), -Math.round(cam.y));
      this.background(map, scene);
      if (scene === 'flowers') this.fieldDetails(map, cam);
      // Flat objects belong underneath actors even when their rectangle is tall.
      const flatTypes = ['picnic', 'flower-bed', 'door', 'shop-door', 'patio-door','stairs','bed'];
      const isFlat=o=>o.flat || flatTypes.includes(o.type);
      for (const o of map.objects) if (!o.hidden && isFlat(o)) this.object(o, scene);
      const actors = menu ? [] : [game.player, ...(game.npcs || [])];
      if (game.companion && !actors.includes(game.companion)) actors.push(game.companion);
      const things = map.objects.filter(o => !o.hidden && !isFlat(o)).map(o => ({ y: o.depth ?? o.y + o.h, object: o }));
      for (const actor of actors) if (actor && actor.visible !== false && !actor.hidden) {
        // Seated feet rest on the bench, a little above its collision footprint.
        const seated = actor.seated || actor.pose === 'sit' || actor.pose === 'seated';
        things.push({ y: actor.y + (seated ? 8 : 0), actor });
      }
      things.sort((a, b) => a.y - b.y);
      for (const item of things) {
        if (item.object) this.object(item.object, scene);
        else this.actor(item.actor, item.actor === game.player ? (game.player.character || 'valen') : undefined);
        const entity = item.object || item.actor;
        if (!menu && entity.marker) this.marker(entity, !!item.actor);
      }
      for (const o of map.objects) if (!menu && !o.hidden && isFlat(o) && o.marker) this.marker(o, false);
      if (scene === 'birthday') this.partyLights(map);
      if (scene === 'plaza') this.birds();
      if (scene === 'flowers') this.particles(cam);
      if (!menu && game.target && !game.dialogue?.active && !game.declaration?.active && !game.cinematic) this.indicator(game.target);
      if (game.cinematic && game.cinematic.heart) {
        const p = game.player || { x: 830, y: 278 };
        const k = game.companion || (game.npcs || []).find(n => n.id === 'kiara');
        this.heart(k ? (p.x + k.x) / 2 - 4 : p.x, p.y - 37 - Math.sin(this.t * 3) * 2);
      }
      if (game.cinematic && game.cinematic.kind === 'handshake') {
        const p = game.player;
        const k = game.companion || (game.npcs || []).find(n => n.id === 'kiara');
        if (p && k && Math.hypot(k.x - p.x, k.y - p.y) < 42) {
          const left = Math.min(p.x, k.x), right = Math.max(p.x, k.x);
          this.rect(left + 5, (p.y + k.y) / 2 - 9, Math.max(3, right - left - 9), 3, '#edbd96');
        }
      }
      if(game.cinematic?.envelope){const e=game.cinematic.envelope;this.envelope(e.x,e.y);}
      if(game.cinematic?.vehicle){const v=game.cinematic.vehicle;this.object({w:v.type==='car'?77:132,h:v.type==='car'?34:44,...v},scene);}
      if(game.cinematic && typeof game.cinematic.progress==='number'){
        const pc=map.objects.find(o=>o.id==='pc')||{x:game.player.x-36,y:game.player.y-38};
        this.rect(pc.x-3,pc.y-43,91,20,'#3f534e');this.rect(pc.x-1,pc.y-41,87,16,'#f0e5c8');
        this.text(game.cinematic.label||'Un momento...',pc.x+3,pc.y-39,'#536858',6);
        this.rect(pc.x+3,pc.y-30,77,3,'#b5bea7');this.rect(pc.x+3,pc.y-30,77*Math.max(0,Math.min(1,game.cinematic.progress)),3,'#718d77');
      }
      if(map.night)this.nightLighting(map,cam);
      if (game.debug) {
        c.strokeStyle = '#ef6472';
        for (const o of map.objects) if (o.solid) c.strokeRect(o.x + .5, o.y + .5, o.w, o.h);
        c.strokeStyle = '#78bdde';
        for (const tr of map.triggers || []) c.strokeRect(tr.x + .5, tr.y + .5, tr.w, tr.h);
      }
      c.restore();
      // A gentle edge vignette keeps the world readable without blurring pixels.
      const shade = c.createRadialGradient(this.canvas.width / 2, this.canvas.height / 2, 65, this.canvas.width / 2, this.canvas.height / 2, this.canvas.width * .7);
      shade.addColorStop(0, 'rgba(37,31,43,0)'); shade.addColorStop(1, 'rgba(37,31,43,.12)');
      c.fillStyle = shade; c.fillRect(0, 0, this.canvas.width, this.canvas.height);
      if (scene === 'flowers') {
        this.rect(0, 0, this.canvas.width, this.canvas.height, 'rgba(255,208,121,.05)');
      }
    }
    background(map, scene) {
      const key = [map.id||map.title||scene,scene,map.width,map.height,!!map.night,JSON.stringify(map.paths||[])].join(':');
      if (this.ground.has(key)) { this.ctx.drawImage(this.ground.get(key), 0, 0); return; }
      const layer = document.createElement('canvas'); layer.width = map.width; layer.height = map.height;
      const original = this.ctx; this.ctx = layer.getContext('2d');
      if (scene === 'birthday' || scene === 'yogurt') this.interior(map, scene);
      else if (scene === 'birthdayPatio') this.patio(map);
      else if (['apartment','bedroom','cafe','restaurant','mamalu','kiaraBedroom'].includes(scene))this.memoryInterior(map,scene);
      else if (['street','transit'].includes(scene))this.street(map,scene);
      else if (scene==='football')this.pitch(map);
      else this.landscape(map, scene);
      this.ctx = original; this.ground.set(key, layer); original.drawImage(layer, 0, 0);
    }
    interior(map, scene) {
      const yogurt = scene === 'yogurt';
      this.rect(0, 0, map.width, map.height, yogurt ? '#eee1c2' : '#bc8c65');
      if (yogurt) {
        for (let y = 50; y < map.height; y += 24) for (let x = 0; x < map.width; x += 24) {
          if (((x + y - 50) / 24) % 2 === 0) this.rect(x, y, 24, 24, '#d9bfa8');
          this.rect(x, y, 24, 1, '#ceb79f'); this.rect(x, y, 1, 24, '#ceb79f');
        }
      } else {
        for (let y = 54; y < map.height; y += 16) {
          this.rect(16, y, map.width - 32, 1, '#a77b59');
          for (let x = ((y / 16) % 2) * 30 - 28; x < map.width; x += 60) {
            this.rect(x, y, 1, 16, '#a77b59'); this.rect(x + 8, y + 9, 28, 1, '#c3936b');
          }
        }
        this.rug(105, 184, 203, 89, '#657d72', '#bfbd92');
        this.rug(392, 86, 137, 135, '#b77b72', '#e3b994');
      }
      this.rect(0, 0, map.width, 49, yogurt ? '#829c91' : '#cdb08a');
      this.rect(0, 47, map.width, 7, '#705946'); this.rect(0, 54, map.width, 3, 'rgba(61,45,40,.14)');
      if (yogurt) {
        this.rect(129, 12, 126, 27, '#eadbc0'); this.rect(132, 15, 120, 21, '#5f7d72');
        this.text('YOGURT & COSAS', 192, 22, '#fff0d2', 9, 'center');
      } else {
        this.window(54, 12, true); this.window(433, 12, true);
        this.rect(256, 15, 64, 22, '#84654f'); this.rect(259, 18, 58, 16, '#f0d0a0');
        this.text('FELIZ CUMPLE', 288, 23, '#7b594c', 7, 'center');
        this.rect(373, 17, 18, 20, '#79614f'); this.rect(376, 20, 12, 14, '#8fa28a');
      }
    }
    rug(x, y, w, h, bg, trim) {
      this.rect(x + 2, y + 3, w, h, 'rgba(59,40,41,.1)'); this.rect(x, y, w, h, trim);
      this.rect(x + 3, y + 3, w - 6, h - 6, bg);
      for (let i = 9; i < w - 9; i += 12) { this.rect(x + i, y + 7, 4, 2, trim); this.rect(x + i, y + h - 9, 4, 2, trim); }
      for (let i = 5; i < h; i += 6) { this.rect(x - 2, y + i, 2, 2, trim); this.rect(x + w, y + i, 2, 2, trim); }
    }
    patio(map) {
      this.rect(0, 0, map.width, map.height, '#344c43');
      for(let y=75;y<map.height;y+=8)for(let x=12;x<map.width-12;x+=8){
        const n=hash(x,y,4);
        if(n>.7)this.rect(x+2,y+3,2,2,'#456051');
        else if(n<.25)this.rect(x+1,y+5,3,1,'#2b403c');
      }
      this.rect(129,70,127,188,'#58615b');
      for(let y=80;y<258;y+=18)for(let x=130;x<256;x+=24){
        this.rect(x,y,23,1,'#69716a');this.rect(x,y,1,17,'#48534d');
      }
      // Soft light from the open door; the lawn around it stays blue and dark.
      const glow=this.ctx.createRadialGradient(192,89,8,192,101,115);
      glow.addColorStop(0,'rgba(247,203,125,.34)');glow.addColorStop(1,'rgba(247,203,125,0)');
      this.ctx.fillStyle=glow;this.ctx.fillRect(70,70,244,200);
      this.rect(13,76,8,198,'#293e36');this.rect(361,76,10,198,'#293e36');
      for(let y=95;y<270;y+=22){this.rect(16,y,4,9,'#496348');this.rect(363,y+4,5,8,'#496348');}
    }
    memoryInterior(map,theme){
      const cafe=['cafe','mamalu'].includes(theme),elegant=theme==='restaurant',bedroom=['bedroom','kiaraBedroom'].includes(theme);
      const floor=elegant?'#957a64':cafe?'#c7af89':'#be9875';
      this.rect(0,0,map.width,map.height,floor);
      for(let y=54;y<map.height;y+=16)for(let x=-24+((y/16)%2)*32;x<map.width;x+=64){
        this.rect(x,y,64,1,elegant?'#826c59':'#ac896a');this.rect(x,y,1,16,elegant?'#826c59':'#ac896a');this.rect(x+9,y+9,24,1,elegant?'#9c816b':'#c8a581');
      }
      this.rect(0,0,map.width,49,elegant?'#626c61':theme==='kiaraBedroom'?'#a79794':cafe?'#a8aa86':'#c6b494');
      this.rect(0,47,map.width,7,'#775e4b');this.rect(0,54,map.width,3,'rgba(61,45,40,.14)');
      if(elegant){
        this.rug(194,119,170,128,'#8b6963','#c6a17b');
        for(const x of [42,407]){this.window(x,10,true);this.rect(x-5,8,6,40,'#715e5a');this.rect(x+46,8,6,40,'#715e5a');}
        this.rect(248,14,80,20,'#b9a281');this.text('esta noche',288,20,'#5c6053',8,'center');
      }else if(cafe){
        this.window(40,10,!!map.night);this.window(map.width-94,10,!!map.night);
        this.rect(177,12,126,28,'#786d51');this.rect(180,15,120,22,'#e0cb9f');
        this.text(theme==='mamalu'?'Mamalu':'un café',240,21,'#626c50',10,'center');
        this.rug(171,117,137,95,'#a6aa80','#d8c598');
      }else if(bedroom){
        this.window(theme==='kiaraBedroom'?120:163,10,!!map.night);
        this.rug(90,83,182,130,theme==='kiaraBedroom'?'#927982':'#798b82','#c4b591');
        this.rect(30,17,25,21,'#82705d');this.rect(33,20,19,15,'#b5ad8c');this.rect(40,24,5,7,'#7e927d');
      }else{
        this.window(70,11,!!map.night);this.window(283,11,!!map.night);
        this.rug(132,119,130,100,'#839788','#d6bc94');this.rug(20,190,103,68,'#b18b76','#d4ba8f');
        this.rect(232,17,20,20,'#82694e');this.rect(235,20,14,14,'#d5cba7');this.rect(241,23,1,6,'#77745d');this.rect(241,28,5,1,'#77745d');
      }
      if(!map.night){
        this.ctx.fillStyle='rgba(255,229,164,.12)';
        this.ctx.beginPath();this.ctx.moveTo(65,54);this.ctx.lineTo(122,54);this.ctx.lineTo(164,158);this.ctx.lineTo(91,158);this.ctx.fill();
      }
    }
    street(map,theme){
      const roadY=theme==='transit'?205:267;
      this.rect(0,0,map.width,map.height,'#9daa85');
      for(let y=0;y<roadY;y+=10)for(let x=0;x<map.width;x+=13)if(hash(x,y)>.68)this.rect(x+2,y+3,4,1,'#aeb990');
      this.rect(0,roadY-101,map.width,98,'#c0b59b');
      for(let y=roadY-97;y<roadY;y+=16)for(let x=0;x<map.width;x+=28){this.rect(x,y,27,1,'#aa9e86');this.rect(x,y,1,16,'#aa9e86');}
      this.rect(0,roadY-4,map.width,5,'#e0cda8');this.rect(0,roadY,map.width,map.height-roadY,'#7e827c');
      for(let x=4;x<map.width;x+=50)this.rect(x,roadY+59,27,2,'#c7bb94');
      this.rect(0,roadY+3,map.width,2,'#666f6b');
      for(let x=356;x<414;x+=12)this.rect(x,roadY+7,7,42,'#d7ccac');
    }
    pitch(map){
      this.rect(0,0,map.width,map.height,'#8eab78');
      for(let y=0;y<map.height;y+=9)for(let x=0;x<map.width;x+=11)if(hash(x,y)>.67)this.rect(x+2,y+3,3,1,'#a1b986');
      const p=map.pitch||{x:105,y:65,w:442,h:226};
      for(let x=p.x;x<p.x+p.w;x+=49)this.rect(x,p.y,Math.min(49,p.x+p.w-x),p.h,Math.floor((x-p.x)/49)%2?'#7e9e69':'#779663');
      const c=this.ctx;c.strokeStyle='#dfdfb5';c.lineWidth=2;
      c.strokeRect(p.x,p.y,p.w,p.h);c.beginPath();c.moveTo(p.x+p.w/2,p.y);c.lineTo(p.x+p.w/2,p.y+p.h);c.stroke();
      c.beginPath();c.arc(p.x+p.w/2,p.y+p.h/2,35,0,Math.PI*2);c.stroke();
      c.strokeRect(p.x,p.y+p.h/2-60,62,120);c.strokeRect(p.x+p.w-62,p.y+p.h/2-60,62,120);
      this.rect(p.x+p.w/2-2,p.y+p.h/2-2,4,4,'#dfdfb5');
      this.rect(64,324,237,51,'#b9b087');
    }
    nightLighting(map,cam){
      this.rect(cam.x,cam.y,this.canvas.width,this.canvas.height,'rgba(29,35,58,.22)');
      for(const o of map.objects){
        if(o.hidden||!['lamp','small-light','candle'].includes(o.type))continue;
        const x=o.x+o.w/2,y=o.y+(o.type==='lamp'?-27:0),r=o.type==='candle'?34:66;
        const glow=this.ctx.createRadialGradient(x,y,1,x,y,r);
        glow.addColorStop(0,'rgba(255,209,124,.23)');glow.addColorStop(1,'rgba(255,209,124,0)');
        this.ctx.fillStyle=glow;this.ctx.fillRect(x-r,y-r,r*2,r*2);
      }
    }
    envelope(x,y){
      this.rect(x-5,y-4,12,9,'#8c665b');this.rect(x-4,y-3,10,7,'#f2e6c6');
      this.rect(x-3,y-2,2,1,'#c6ac96');this.rect(x+3,y-2,2,1,'#c6ac96');this.rect(x-1,y-1,4,1,'#c6ac96');this.rect(x,y,2,2,'#be7f7a');
    }
    window(x, y, night=false) {
      this.rect(x, y, 47, 31, '#896951'); this.rect(x + 3, y + 3, 41, 25, '#dfbb89');
      this.rect(x + 5, y + 5, 37, 21, night?'#384d5c':'#94b1b1'); this.rect(x + 5, y + 16, 37, 10, night?'#4d6267':'#b6c4b4');
      if(night){this.rect(x+31,y+8,3,3,'#dacb9f');this.rect(x+12,y+9,1,1,'#c3c4ad');}
      this.rect(x + 22, y + 3, 3, 25, '#f2ce9c'); this.rect(x + 3, y + 14, 41, 2, '#f2ce9c');
      this.rect(x - 3, y + 1, 7, 31, '#a77169'); this.rect(x + 43, y + 1, 7, 31, '#a77169');
    }
    landscape(map, scene) {
      const field = scene === 'flowers';
      this.rect(0, 0, map.width, map.height, field ? '#8caa72' : '#92ad7d');
      for (let y = 0; y < map.height; y += 8) for (let x = 0; x < map.width; x += 8) {
        const n = hash(x, y);
        if (n < .37) this.rect(x + 2, y + 3, 3, 1, field ? '#a4b67e' : '#a9bd88');
        else if (n > .72) { this.rect(x + 1, y + 5, 1, 3, '#769766'); this.rect(x + 2, y + 6, 2, 1, '#769766'); }
      }
      for (const path of map.paths || []) {
        this.rect(path.x - 2, path.y + 2, path.w + 4, path.h, field ? '#a8b27b' : '#b4b788');
        this.rect(path.x, path.y, path.w, path.h, field ? '#c1bb86' : '#dbc795');
        for (let y = path.y + 4; y < path.y + path.h; y += 9) for (let x = path.x + 3; x < path.x + path.w; x += 12) {
          if (hash(x, y) > .53) this.rect(x, y, 2, 1, field ? '#aeb27d' : '#c5b27f');
        }
      }
      if (field) {
        this.rect(0, 0, map.width, 37, '#edd7b0'); this.rect(0, 37, map.width, 18, '#e4cba3');
        for (let x = 0; x < map.width; x += 32) {
          const h = 17 + Math.round(hash(x, 12) * 25);
          this.rect(x, 71 - h, 34, h + 12, '#b7ba88'); this.rect(x + 8, 79 - h / 2, 35, h, '#9dac7b');
        }
        for (let y = 100; y < map.height; y += 11) for (let x = 7; x < map.width; x += 11) {
          const n = hash(x, y, 3); if (n < .38) continue;
          const pos = { x: x + Math.round(n * 5), y: y + Math.round(hash(y, x) * 5), w: 7, h: 10 };
          if ((map.paths || []).some(p => overlaps(pos, p, 7))) continue;
          this.smallFlower(pos.x, pos.y, Math.floor(n * 9) % 4, false);
        }
      } else {
        for (let i = 0; i < 100; i++) {
          const x = hash(i, 23) * map.width, y = hash(i, 56) * map.height;
          if (!(map.paths || []).some(p => overlaps({ x, y, w: 6, h: 8 }, p, 4))) this.smallFlower(x, y, i % 3, true);
        }
      }
    }
    smallFlower(x, y, variant, tiny) {
      const petals = ['#f0d690', '#e3a098', '#eee6c2', '#ba91ab'][variant % 4];
      this.rect(x + 2, y + 3, 1, tiny ? 3 : 5, '#5e845b');
      if (!tiny) this.rect(x, y + 5, 2, 1, '#6c925f');
      this.rect(x + 1, y, 3, 5, petals); this.rect(x, y + 1, 5, 3, petals); this.rect(x + 2, y + 2, 1, 1, '#b97e45');
    }
    fieldDetails(map, camera) {
      // Only a few flowers move. The rest live in a cached background layer.
      for (let i = 0; i < 32; i++) {
        const x = hash(i, 140) * map.width, y = 105 + hash(i, 217) * (map.height - 105);
        if (x < camera.x - 10 || x > camera.x + this.canvas.width + 10 || y < camera.y || y > camera.y + this.canvas.height) continue;
        if ((map.paths || []).some(p => overlaps({ x, y, w: 6, h: 9 }, p, 8))) continue;
        this.smallFlower(x + Math.sin(this.t * 1.5 + i) * 1.4, y, i % 4, false);
      }
    }
    object(o, scene) {
      const { x, y, w, h } = o;
      switch (o.type) {
        case 'wall':
          if (y > 100) { this.rect(x, y, w, h, '#735d4a'); this.rect(x, y, w, 3, '#b99973'); }
          else if (w < 20) { this.rect(x, y, w, h, '#8d7156'); this.rect(x + (x ? 0 : w - 3), y, 3, h, '#d0ad7e'); }
          break;
        case 'tree': this.tree(x, y, o.variant); break;
        case 'table': case 'card-table': case 'cake-table': case 'cafe-table':
          this.shadow(x - 1, y + h - 1, w + 6, 8);
          this.rect(x + 4, y + 12, 5, h - 4, '#715044'); this.rect(x + w - 9, y + 12, 5, h - 4, '#715044');
          this.rect(x - 2, y - 6, w + 4, h - 3, '#715044'); this.rect(x, y - 8, w, h - 4, '#d1a678');
          this.rect(x + 2, y - 6, w - 4, 3, '#e3bd8d');
          if (o.type === 'card-table') {
            this.rect(x + 9, y - 2, w - 18, h - 17, '#698478');
            for (let i = 0; i < 3; i++) { this.rect(x + 19 + i * 4, y + 2 - i, 10, 13, '#f2e6c3'); this.rect(x + 21 + i * 4, y + 4 - i, 6, 9, '#b96c67'); }
          } else if (o.type === 'cake-table') {
            this.rect(x + 12, y, 35, 13, '#ecd9b4'); this.rect(x + 15, y - 4, 29, 12, '#f2d6aa');
            this.rect(x + 15, y - 4, 29, 3, '#fff0ca'); this.rect(x + 27, y - 11, 2, 7, '#ab797e'); this.rect(x + 27, y - 13, 2, 3, '#efbb68');
          } else { this.rect(x + 11, y + 2, 8, 8, '#f0dbc0'); this.rect(x + 13, y + 4, 4, 4, '#b28365'); }
          break;
        case 'chair':
          this.shadow(x, y + h - 1, w); this.rect(x + 1, y - 7, w - 2, h + 5, '#785b47');
          this.rect(x + 3, y - 5, w - 6, 7, '#c39a6b'); this.rect(x + 3, y + 5, w - 6, 6, '#b88b60');
          this.rect(x + 2, y + h - 2, 3, 5, '#654b3e'); this.rect(x + w - 5, y + h - 2, 3, 5, '#654b3e'); break;
        case 'sofa':
          this.shadow(x, y + h - 2, w + 4); this.rect(x, y - 9, w, h + 6, '#755452'); this.rect(x + 3, y - 7, w - 6, 20, '#b37c69');
          this.rect(x + 7, y + 7, w - 14, 13, '#cf957d'); this.rect(x + w / 2, y + 7, 2, 13, '#ad715f');
          this.rect(x, y + 1, 7, 24, '#a06e60'); this.rect(x + w - 7, y + 1, 7, 24, '#a06e60');
          this.rect(x + 10, y - 2, 13, 10, '#dcc092'); break;
        case 'plant':
          this.shadow(x - 1, y + h - 4, w + 2); this.rect(x + 3, y + 7, w - 6, 12, '#a96f55'); this.rect(x + 1, y + 6, w - 2, 4, '#d0976a');
          this.rect(x + 7, y - 9, 2, 18, '#57714d'); this.rect(x, y - 7, 7, 7, '#769363'); this.rect(x + 9, y - 11, 7, 9, '#839f6b'); this.rect(x + 4, y - 16, 6, 8, '#71905f'); break;
        case 'shelf':
          this.rect(x, y - 20, w, h + 20, '#755440'); this.rect(x + 3, y - 17, w - 6, h + 14, '#b58a61');
          for (let i = 0; i < 6; i++) this.rect(x + 6 + i * 5, y - 12 + i % 3, 4, 11 - i % 3, ['#7c927c', '#c08e73', '#d7b57c'][i % 3]);
          this.rect(x, y + 1, w, 3, '#755440'); break;
        case 'kitchen':
          this.rect(x, y, w, h, '#95755c'); this.rect(x + 3, y + 5, w - 6, h - 7, '#d3b58b');
          this.rect(x - 2, y - 4, w + 4, 9, '#ede0b9');
          for (let i = 0; i < 3; i++) { this.rect(x + 9 + i * 39, y + 9, 30, 22, '#c6a47b'); this.rect(x + 31 + i * 39, y + 16, 3, 2, '#795c48'); }
          this.rect(x + 16, y - 3, 26, 7, '#9caaa1'); this.rect(x + 22, y - 2, 14, 5, '#758b88'); break;
        case 'speaker':
          this.rect(x, y - 11, w, h + 7, '#494747'); this.rect(x + 2, y - 9, w - 4, h + 3, '#68625a');
          this.rect(x + 5, y - 5, 6, 6, '#343b3c'); this.rect(x + 4, y + 6, 8, 8, '#343b3c'); break;
        case 'door':
          this.rect(x - 2, y, w + 4, h, '#69584a'); this.rect(x, y + 2, w, h - 2, '#9c8263');
          this.rect(x + 6, y + 4, w - 12, 5, '#c1a17a'); break;
        case 'house-front':
          this.rect(x,y,w,h,'#655d52');this.rect(x,y,w,17,'#29383b');
          this.rect(x,y+17,w,4,'#39494a');this.rect(x,y+66,w,4,'#3c4540');
          for(let yy=25;yy<64;yy+=12)this.rect(x,yy,w,1,'#73685a');
          for(const wx of [58,284]){
            this.rect(wx,30,42,29,'#3a433d');this.rect(wx+3,33,36,23,'#dfba7c');
            this.rect(wx+6,35,30,19,'#ebcb91');this.rect(wx+20,32,2,25,'#877558');
            this.rect(wx+3,43,36,2,'#877558');
          }
          this.rect(166,34,52,36,'#3b4238');this.rect(170,38,44,32,'#dbb279');
          this.rect(175,42,34,28,'#eccb93');break;
        case 'patio-door':
          this.rect(x-2,y,w+4,h,'#62645a');this.rect(x,y+1,w,h-2,'#b6a582');
          this.rect(x+4,y+5,w-8,2,'#dbc69b');this.rect(x+4,y+13,w-8,2,'#8e8d72');break;
        case 'fence':
          this.rect(x,y,w,h,'#374740');
          if(w>h){this.rect(x,y+2,w,2,'#6f7763');for(let xx=x+6;xx<x+w;xx+=14)this.rect(xx,y,3,h,'#58634f');}
          else{this.rect(x+3,y,2,h,'#6f7763');for(let yy=y+8;yy<y+h;yy+=17)this.rect(x,yy,w,3,'#58634f');}break;
        case 'bench':
          this.shadow(x - 2, y + h - 1, w + 4, 8);
          this.rect(x + 6, y, 4, h + 2, '#5d6558'); this.rect(x + w - 10, y, 4, h + 2, '#5d6558');
          this.rect(x, y - 5, w, 5, '#9a6b4b'); this.rect(x, y + 2, w, 5, '#bb8c5a');
          this.rect(x - 1, y + 10, w + 2, 7, '#d0a16b'); this.rect(x + 3, y + 18, w - 6, 2, '#8b6347'); break;
        case 'fountain':
          this.shadow(x - 3, y + h - 4, w + 6, 12);
          this.rect(x + 8, y, w - 16, h, '#8a9784'); this.rect(x, y + 9, w, h - 18, '#8a9784');
          this.rect(x + 9, y + 3, w - 18, h - 9, '#c0c1a5'); this.rect(x + 4, y + 11, w - 8, h - 25, '#c0c1a5');
          this.rect(x + 10, y + 10, w - 20, h - 24, '#7daaad'); this.rect(x + 6, y + 15, w - 12, h - 34, '#7daaad');
          for (let i = 0; i < 5; i++) this.rect(x + 13 + i * 10, y + 17 + Math.sin(this.t * 2 + i) * 8, 7, 1, '#c6ded0');
          this.rect(x + 31, y - 10, 10, 39, '#a9b49c'); this.rect(x + 23, y - 12, 26, 8, '#d4d2ae');
          this.rect(x + 27, y - 11, 18, 3, '#93bbc0'); this.rect(x + 35, y - 19, 2, 8, '#c3e0d2'); break;
        case 'lamp':
          this.shadow(x - 3, y + 4, 18); this.rect(x + 3, y - 34, 3, 43, '#53635c'); this.rect(x, y + 5, 9, 4, '#53635c');
          this.rect(x - 2, y - 36, 13, 13, '#657363'); this.rect(x, y - 34, 9, 9, '#f1d89f');
          this.rect(x - 3, y - 38, 15, 3, '#53635c'); this.rect(x + 2, y - 41, 5, 3, '#53635c'); break;
        case 'shop':
          this.shadow(x - 4, y + h, w + 8, 10); this.rect(x, y + 16, w, h - 16, '#dbbf91');
          this.rect(x - 5, y + 3, w + 10, 20, '#8c6956'); this.rect(x, y, w, 19, '#c49172');
          for (let i = 8; i < w; i += 16) this.rect(x + i, y + 4, 1, 13, '#a67a61');
          this.rect(x + 17, y + 27, w - 34, 14, '#779485'); this.text('YOGURT', x + w / 2, y + 30, '#f5e4b9', 9, 'center');
          this.rect(x + 14, y + 49, 29, 22, '#a3b9b2'); this.rect(x + 95, y + 49, 29, 22, '#a3b9b2');
          this.rect(x + 21, y + 51, 2, 18, '#cbe0cb'); this.rect(x + 101, y + 51, 2, 18, '#cbe0cb');
          this.rect(x + 49, y + 47, 29, 31, '#656f65'); this.rect(x + 52, y + 50, 23, 27, '#8ca7a0');
          this.rect(x - 4, y + 41, w + 8, 8, '#e9d7ae');
          for (let i = 0; i < w + 8; i += 16) this.rect(x - 4 + i, y + 41, 8, 10, '#a56c62'); break;
        case 'shop-door':
          this.rect(x, y, w, 9, '#a6a087'); this.rect(x + 3, y + 2, w - 6, 4, '#d6c69f'); break;
        case 'counter':
          this.shadow(x, y + h - 2, w, 8); this.rect(x, y, w, h, '#729183'); this.rect(x + 4, y + 5, w - 8, h - 9, '#86a493');
          this.rect(x - 3, y - 7, w + 6, 11, '#e2d9b7'); this.rect(x + 10, y - 19, w - 20, 17, '#a4c3b7');
          this.rect(x + 13, y - 17, w - 26, 12, '#c5d7c3');
          for (let i = 0; i < 7; i++) { this.rect(x + 20 + i * 28, y - 13, 22, 7, ['#efe0b6', '#bb8b81', '#abb777', '#d2a68f'][i % 4]); }
          this.rect(x + 186, y - 7, 22, 5, '#5d6c65'); this.rect(x + 191, y - 22, 13, 15, '#647c70');
          this.rect(x + 193, y - 20, 9, 6, '#c2d4b7'); this.text('elegí tu caos', x + 83, y + 14, '#e8e1bd', 7); break;
        case 'flower-bed':
          this.rect(x, y, w, h, '#708d61'); for (let i = 0; i < 9; i++) this.smallFlower(x + 4 + (i % 5) * 8, y + 3 + Math.floor(i / 5) * 10, i % 4, false); break;
        case 'flower':
          this.smallFlower(x + 5 + Math.sin(this.t * 2 + x) * .7, y + 2, o.variant || 0, false);
          this.smallFlower(x + 1, y + 6, o.variant || 0, true); break;
        case 'sign': case 'plaza-sign':
          this.shadow(x + 4, y + h - 3, w - 8); this.rect(x + w / 2 - 2, y + 6, 4, h - 5, '#8b6d4d');
          this.rect(x - 2, y - 4, w + 4, 20, '#8f6c4e'); this.rect(x, y - 3, w, 17, '#ddbd88');
          if (o.type === 'sign') { this.text('< nada', x + 3, y, '#705740', 6); this.text('Kiara >', x + 2, y + 7, '#705740', 6); }
          else this.text('PLAZA', x + w / 2, y + 3, '#705740', 7, 'center'); break;
        case 'picnic':
          this.shadow(x - 2, y + h - 7, w + 4, 12);
          this.rect(x, y, w, h, '#d7aa8a');
          for (let yy = 0; yy < h; yy += 8) for (let xx = 0; xx < w; xx += 8)
            this.rect(x + xx, y + yy, Math.min(8, w - xx), Math.min(8, h - yy), (xx / 8 + yy / 8) % 2 ? '#efd4ad' : '#cc947d');
          this.rect(x, y, w, 2, '#f6ddb9'); this.rect(x, y + h - 2, w, 2, '#f6ddb9');
          this.rect(x + 69, y + 38, 17, 14, '#ac8157'); this.rect(x + 72, y + 34, 11, 4, '#a3784f');
          this.rect(x + 73, y + 36, 9, 2, '#efd4ad'); this.rect(x + 71, y + 40, 13, 2, '#d4ab74');
          this.rect(x + 60, y + 14, 7, 9, '#e8dfc0'); this.rect(x + 61, y + 15, 5, 2, '#a48062'); break;
        case 'lemon-pie':
          this.shadow(x - 2, y + h - 2, w + 4); this.rect(x - 2, y + 5, w + 4, 9, '#e7e0c4');
          this.rect(x + 1, y + 1, w - 2, 12, '#b68a51'); this.rect(x, y + 3, w, 8, '#d7b468');
          this.rect(x + 2, y, w - 4, 9, '#f5dda0'); this.rect(x + 4, y - 2, w - 8, 8, '#fff0c9');
          for (let i = 4; i < w - 3; i += 5) this.rect(x + i, y - 3, 3, 4, '#fff3d5'); break;
        case 'rock':
          this.shadow(x - 1, y + h - 2, w + 3); this.rect(x + 3, y, w - 6, h, '#83917a');
          this.rect(x, y + 4, w, h - 6, '#97a186'); this.rect(x + 5, y + 1, w - 11, 3, '#b1b799'); break;
        case 'bin':
          this.rect(x + 1, y - 5, w - 2, h + 4, '#667c6a'); this.rect(x - 1, y - 7, w + 2, 4, '#526b5b'); this.rect(x + 4, y, 2, 12, '#8ea18a'); break;
        default: this.memoryObject(o);break;
      }
    }
    memoryObject(o){
      const {x,y,w,h}=o;
      switch(o.type){
        case 'stairs':
          this.rect(x,y,w,h,'#765f4d');
          for(let i=0;i<h;i+=10){this.rect(x+3,y+i,w-6,8,'#c6ad87');this.rect(x+3,y+i+7,w-6,2,'#978164');}
          this.rect(x,y,3,h,'#977959');this.rect(x+w-3,y,3,h,'#977959');break;
        case 'bed':{
          const blanket=o.blanket||'#84958c';
          this.shadow(x-3,y+h-3,w+6,10);this.rect(x-4,y-2,w+8,h+6,'#785d4e');this.rect(x,y,w,h,'#e5d6b7');
          this.rect(x+3,y+3,w-6,h-6,'#f2e2c3');this.rect(x-5,y-5,9,h+8,'#a58869');this.rect(x-5,y-5,9,3,'#c7ac81');
          this.rect(x+13,y+11,27,29,'#d7cfb5');this.rect(x+15,y+12,25,24,'#f7ebd0');
          this.rect(x+13,y+h-41,27,29,'#d7cfb5');this.rect(x+15,y+h-40,25,24,'#f7ebd0');
          this.rect(x+47,y+3,w-51,h-6,blanket);this.rect(x+48,y+3,7,h-6,'#acb3a0');
          for(let yy=y+13;yy<y+h-8;yy+=13)this.rect(x+62,yy,w-72,1,'rgba(234,228,193,.23)');break;
        }
        case 'nightstand':
          this.rect(x,y,w,h,'#947553');this.rect(x-1,y-3,w+2,5,'#d0b386');this.rect(x+3,y+5,w-6,h-11,'#b8956a');this.rect(x+w/2-2,y+11,4,2,'#755b47');break;
        case 'wardrobe':
          this.rect(x,y-12,w,h+12,'#896d53');this.rect(x+3,y-9,w-6,h+5,'#b69672');this.rect(x+w/2,y-7,2,h+3,'#86674c');
          this.rect(x+w/2-5,y+15,2,7,'#e1c38d');this.rect(x+w/2+5,y+15,2,7,'#e1c38d');break;
        case 'small-light':
          this.rect(x+w/2-1,y-6,3,17,'#8c7458');this.rect(x+2,y+9,w-4,3,'#8c7458');this.rect(x-3,y-13,w+6,9,'#e9c183');this.rect(x-1,y-15,w+2,3,'#f2d6a1');break;
        case 'candle':
          this.rect(x,y+3,w,h-3,'#ede0b9');this.rect(x-2,y+h,w+4,2,'#c5aa77');this.rect(x+1,y-2,3,5,'#ebbf79');this.rect(x+2,y-3,1,4,'#fff0bf');break;
        case 'notebook':
          this.rect(x,y-8,w,h-5,'#59645e');this.rect(x+2,y-6,w-4,h-9,'#a6beb6');
          this.rect(x+4,y-4,w-8,3,'#c2d0b8');this.rect(x+4,y+1,w-10,2,'#95a99c');
          this.rect(x-2,y+h-13,w+4,6,'#aaa99a');this.rect(x+2,y+h-12,w-4,2,'#737e77');this.rect(x+w/2-2,y+h-9,5,1,'#dad2b8');break;
        case 'pc-desk':
          this.rect(x+4,y+12,5,h-8,'#86684f');this.rect(x+w-9,y+12,5,h-8,'#86684f');this.rect(x-2,y+1,w+4,8,'#c1a17b');
          this.rect(x+18,y-20,43,27,'#4c5a55');this.rect(x+21,y-17,37,20,'#89a9a5');this.rect(x+35,y+7,9,4,'#5c6960');
          this.rect(x+28,y+10,25,3,'#626d63');this.rect(x+19,y+15,39,6,'#cfc8b1');
          for(let xx=22;xx<x+53;xx+=5){if(xx<x+19)continue;this.rect(xx,y+17,2,1,'#89917e');}
          this.rect(x+67,y-7,12,31,'#5e6861');this.rect(x+71,y-3,4,1,'#b0bca7');
          if(o.status==='study'){for(let i=0;i<4;i++)this.rect(x+24,y-13+i*4,14+(i%2)*10,1,'#e5ebbf');}
          else if(o.status==='ready'){this.rect(x+32,y-11,7,7,'#b5d0bf');this.rect(x+41,y-11,7,7,'#c9d8bc');}
          else if(o.status==='installing'){this.rect(x+25,y-9,28,3,'#cad9bc');this.rect(x+25,y-9,Math.round((Math.sin(this.t)+1)*13),3,'#769486');}
          else this.rect(x+24,y-13,5,1,'#d4dfc0');break;
        case 'stove':
          this.object({...o,type:'kitchen'},'apartment');
          this.rect(x+w-63,y-3,51,6,'#7e8273');
          for(const xx of [x+w-51,x+w-29]){this.rect(xx,y-2,12,4,'#404f4c');this.rect(xx+3,y-1,6,2,'#afaa8c');}
          this.rect(x+w-47,y-10,20,9,'#717d6d');this.rect(x+w-44,y-12,14,2,'#aaa88c');this.rect(x+w-26,y-8,9,2,'#4a5d51');break;
        case 'meal-table':
          this.object({...o,type:'table'},'cafe');
          this.rect(x+5,y-6,w-10,h-9,o.meal==='dinner'?'#eee0ba':'#e7d2ac');
          if(o.meal==='tiramisu'||o.food==='tiramisu'){
            this.rect(x+w/2-19,y+6,38,16,'#f2e5c5');this.rect(x+w/2-12,y,24,19,'#a78965');
            for(let i=0;i<3;i++)this.rect(x+w/2-11,y+4+i*5,22,2,'#e2cca5');this.rect(x+w/2-12,y-1,24,4,'#815c41');
            for(let i=0;i<6;i++)this.rect(x+w/2-9+i*3,y,1,1,'#af8055');
            this.rect(x+12,y+9,2,12,'#a2a597');this.rect(x+w-15,y+9,2,12,'#a2a597');
          }else if(o.meal==='cafe'||o.food==='breakfast'){
            this.rect(x+10,y+5,27,20,'#f1e5c8');this.rect(x+13,y+7,22,13,'#af8453');this.rect(x+15,y+8,18,10,'#8f9f59');
            this.rect(x+19,y+9,11,8,'#f3e8c5');this.rect(x+22,y+11,4,4,'#e6bc5c');
            this.rect(x+w-38,y+6,26,18,'#dcdac0');this.rect(x+w-36,y+5,22,13,'#f7e9c8');
            for(let i=0;i<6;i++)this.rect(x+w-33+(i%3)*6,y+7+Math.floor(i/3)*5,4,3,i%2?'#b18755':'#c28678');
          }else{
            for(let i=0;i<3;i++){const xx=x+10+i*(w-25)/3;this.rect(xx,y+7,24,15,'#f3e8ca');this.rect(xx+5,y+11,13,6,'#ba976c');this.rect(xx+15,y+8,5,5,'#8b9b65');}
          }
          for(const xx of [x+3,x+w-10]){this.rect(xx,y-1,6,6,'#e5dfc4');this.rect(xx+1,y,4,2,'#967659');}break;
        case 'cafe-counter':
          this.rect(x,y,w,h,'#8c8061');this.rect(x+3,y+4,w-6,h-6,'#af9a75');this.rect(x-3,y-4,w+6,8,'#ded0ab');
          this.rect(x+w-36,y-18,25,20,'#586a62');this.rect(x+w-31,y-15,16,9,'#8eaaa0');this.rect(x+w-31,y-3,16,3,'#c8c7a9');
          for(let i=0;i<4;i++){this.rect(x+13+i*12,y-9,7,7,'#e8ddbd');this.rect(x+15+i*12,y-8,3,2,'#a08560');}break;
        case 'menu-board':
          this.rect(x,y-12,w,h+12,'#947558');this.rect(x+3,y-9,w-6,h+6,'#526d5e');
          for(let i=0;i<4;i++)this.rect(x+7,y-3+i*6,w-16-(i%2)*7,1,'#d5d3aa');break;
        case 'town-building':{
          const color=o.color||'#bd9b79';this.shadow(x-3,y+h-2,w+6,10);this.rect(x,y+13,w,h-13,color);
          this.rect(x-4,y+2,w+8,17,'#a87e65');this.rect(x+4,y-2,w-8,9,'#bb9371');
          for(let xx=x+9;xx<x+w-5;xx+=14)this.rect(xx,y+4,1,13,'#906a56');
          for(const xx of [x+13,x+w-38]){this.rect(xx,y+37,24,25,'#788b84');this.rect(xx+3,y+40,18,19,this.night?'#d8bc85':'#acc0b4');this.rect(xx+11,y+39,2,21,'#d8c39c');}
          this.rect(x+w/2-13,y+h-33,26,33,'#796d57');this.rect(x+w/2-10,y+h-30,20,28,'#b9ac87');this.rect(x+w/2+6,y+h-17,2,2,'#6f6551');
          if(o.label){this.rect(x+14,y+20,w-28,13,'#e7d5ab');this.text(o.label,x+w/2,y+22,'#647260',8,'center');}break;
        }
        case 'bus-stop':
          this.rect(x+w/2-1,y-32,3,h+30,'#67786b');this.rect(x-2,y-35,w+4,19,'#6b8c83');this.rect(x+2,y-31,w-4,11,'#d9d7b8');
          this.rect(x+5,y-29,w-10,5,'#778e7a');this.rect(x+5,y-23,3,2,'#4e6157');this.rect(x+w-8,y-23,3,2,'#4e6157');break;
        case 'bus':case 'car':{
          const bus=o.type==='bus';this.shadow(x-2,y+h-5,w+4,10);this.rect(x+7,y+h-9,12,12,'#43524d');this.rect(x+w-24,y+h-9,12,12,'#43524d');
          this.rect(x,y+9,w,h-12,bus?'#ded2aa':'#81938a');this.rect(x+5,y+1,w-10,h-7,bus?'#ded2aa':'#81938a');
          this.rect(x+6,y+10,w-12,bus?17:13,'#7b9893');
          for(let xx=x+11;xx<x+w-10;xx+=bus?23:26){this.rect(xx,y+12,bus?15:18,bus?10:8,'#acc1b0');this.rect(xx+3,y+12,2,9,'#d0d7bb');}
          this.rect(x+3,y+h-15,w-6,5,bus?'#8c9d7e':'#667e75');this.rect(x+w-7,y+h-13,5,6,'#e7c58b');this.rect(x+1,y+h-13,4,4,'#c8957b');
          if(bus){this.rect(x+12,y+2,w-24,6,'#778273');this.rect(x+18,y+4,23,1,'#dcd9b4');}break;
        }
        case 'town-sign':
          this.rect(x+7,y+7,4,h-4,'#907251');this.rect(x+w-11,y+7,4,h-4,'#907251');this.rect(x-2,y-5,w+4,20,'#8f7355');this.rect(x,y-3,w,16,'#d6c094');this.text(o.label||'',x+w/2,y+2,'#687159',7,'center');break;
        case 'gate':
          this.rect(x-4,y-13,4,h+12,'#6a7868');this.rect(x+w,y-13,4,h+12,'#6a7868');
          if(o.label){this.rect(x-5,y-17,w+10,13,'#a6b18b');this.text(o.label,x+w/2,y-15,'#576f54',7,'center');}break;
        case 'goal':
          this.rect(x,y,w,h,'rgba(213,220,189,.2)');
          for(let xx=x;xx<x+w;xx+=5)this.rect(xx,y,1,h,'#b5c3a5');for(let yy=y;yy<y+h;yy+=6)this.rect(x,yy,w,1,'#b5c3a5');
          this.rect(x,y,2,h,'#e5e4bd');this.rect(x+w-2,y,2,h,'#e5e4bd');this.rect(x,y,w,2,'#e5e4bd');this.rect(x,y+h-2,w,2,'#e5e4bd');break;
        case 'ball':
          this.shadow(x-1,y+h-2,w+2,5);this.rect(x+2,y,w-4,h,'#eee8ca');this.rect(x,y+2,w,h-4,'#eee8ca');this.rect(x+3,y+3,4,4,'#586354');this.rect(x+1,y+1,2,2,'#76816a');this.rect(x+7,y+7,2,2,'#76816a');break;
        case 'bag':
          this.rect(x,y,w,h,'#a07b59');this.rect(x+3,y-3,w-6,4,'#7d604b');this.rect(x+5,y-2,w-10,2,'#bd9b74');this.rect(x+3,y+4,w-6,2,'#bb9971');break;
        case 'phone':
          this.rect(x+3,y-4,9,16,'#57575b');this.rect(x+4,y-2,7,11,'#9db7b4');this.rect(x+6,y+1,3,4,'#dbcba4');this.rect(x+6,y+10,3,1,'#c4bda6');break;
        case 'book':
          this.rect(x,y,w,h,'#7b8b76');this.rect(x+3,y+2,w-5,h-4,'#e0d3b2');this.rect(x+w/2,y+2,1,h-4,'#b1a486');break;
        case 'water-bottles':
          for(let i=0;i<3;i++){this.rect(x+i*7,y,5,13,'#a4bdaf');this.rect(x+1+i*7,y-2,3,3,'#647f72');this.rect(x+i*7,y+5,5,3,'#d2d6b5');}break;
        default:break;
      }
    }
    tree(x, y, variant = 0) {
      const warm = variant === 2;
      const dark = warm ? '#677f59' : '#527958', mid = warm ? '#8c9d66' : '#719764', light = warm ? '#b1b879' : '#91ad72';
      this.shadow(x - 21, y + 4, 65, 14);
      this.rect(x + 7, y - 28, 9, 42, '#8b6c4d'); this.rect(x + 9, y - 26, 3, 36, '#ab8256'); this.rect(x + 3, y + 10, 18, 4, '#7b674a');
      this.rect(x - 15, y - 47, 48, 28, dark); this.rect(x - 22, y - 37, 65, 24, dark); this.rect(x - 13, y - 17, 50, 8, dark);
      this.rect(x - 11, y - 53, 40, 8, mid); this.rect(x - 19, y - 42, 52, 20, mid); this.rect(x - 16, y - 23, 51, 8, mid);
      this.rect(x - 6, y - 49, 32, 12, light); this.rect(x - 15, y - 38, 25, 10, light); this.rect(x + 17, y - 32, 18, 10, light);
      this.rect(x - 9, y - 43, 9, 3, warm ? '#ccd092' : '#b0c188'); this.rect(x + 7, y - 49, 11, 3, warm ? '#ccd092' : '#b0c188');
      for (let i = 0; i < 5; i++) this.rect(x - 14 + i * 10, y - 22 - (i % 2) * 9, 5, 3, mid);
      if (warm) { this.rect(x + 25, y - 26, 3, 3, '#d1c38a'); this.rect(x - 10, y - 35, 3, 3, '#d4ca95'); }
    }
    actor(a, override) {
      const id = override || a.character || a.id || 'friend1';
      const cfg = Object.assign({}, FALLBACK[id] || FALLBACK.friend1, (V.CHARACTERS || {})[id] || {});
      const x = Math.round(a.x), y = Math.round(a.y);
      const lying=a.lying||['lying','sleep','sleeping','movie-lying'].includes(a.pose);
      if(lying&&!a._poseRender){
        // Rotate the existing frame: custom artwork is retained in every pose.
        this.ctx.save();this.ctx.translate(x,y-6);this.ctx.rotate(-Math.PI/2);
        this.actor({...a,x:0,y:0,pose:null,lying:false,seated:false,walking:false,moving:false,hugging:false,_poseRender:true,dir:'down'},id);
        this.ctx.restore();
        this.rect(x-8,y-18,20,23,a.blanket||'#9eaa94');this.rect(x-8,y-18,3,23,'#bec3a8');
        this.rect(x-3,y-14,12,1,'rgba(234,229,195,.35)');this.rect(x-3,y-5,12,1,'rgba(234,229,195,.35)');
        if(a.hugging)this.rect(x-13,y-5,3,17,cfg.skin);
        if(['sleep','sleeping'].includes(a.pose)&&Math.sin(this.t)>.25)this.text('z',x-26,y-28,'#dedbc2',7);
        return;
      }
      const d = ['pc','cook'].includes(a.pose)?'up':typeof a.dir === 'string' ? a.dir : 'down';
      const walking = !!(a.walking || a.moving), seated = !!(a.seated || ['sit','seated','movie','pc'].includes(a.pose));
      const step = walking ? Math.floor(this.t * 9) % 2 : 0;
      const bob = walking ? step : 0;
      this.shadow(x - 8, y - 3, 17, 6);
      if (cfg.sprite) {
        if (!this.sprites[cfg.sprite]) {
          const im = new Image(); this.sprites[cfg.sprite] = im; im.src = cfg.sprite;
        }
        const im = this.sprites[cfg.sprite];
        if (im.complete && im.naturalWidth) {
          if (im.naturalWidth === 128 && im.naturalHeight === 128) {
            const animation = SPRITE_ANIMATIONS[d] || SPRITE_ANIMATIONS.down;
            const [column, row] = walking
              ? animation.walk[Math.floor(this.t * 9) % animation.walk.length]
              : animation.idle;
            this.spritePose(im,column*32,row*32,32,32,x,y,a,cfg,seated);
          } else if (im.naturalWidth === 64 && im.naturalHeight === 64) {
            const frame = walking ? Math.floor(this.t * 9) % 4 : 0;
            const sx = (frame % 2) * 32, sy = Math.floor(frame / 2) * 32;
            this.spritePose(im,sx,sy,32,32,x,y,a,cfg,seated);
          } else if (im.naturalWidth >= 48 && im.naturalHeight >= 96) {
            const row = { down: 0, left: 1, right: 2, up: 3 }[d] || 0;
            this.spritePose(im,(walking?step+1:0)*16,row*24,16,24,x,y,a,cfg,seated);
          } else this.spritePose(im,0,0,im.naturalWidth,im.naturalHeight,x,y,a,cfg,seated);
          return;
        }
      }
      const top = y - (seated ? 20 : 25) - bob;
      const skin = cfg.skin, hair = cfg.hair, shirt = cfg.shirt, pants = cfg.pants;
      const outline = '#55463d';
      if (seated) {
        this.rect(x - 5, y - 6, 12, 5, pants); this.rect(x - 4, y - 2, 4, 2, '#564e49'); this.rect(x + 4, y - 2, 4, 2, '#564e49');
      } else {
        this.rect(x - 5, y - 8, 4, 6 - step, pants); this.rect(x + 1, y - 8, 4, 5 + step, pants);
        this.rect(x - 6, y - 3 - step, 5, 3, '#554b46'); this.rect(x + 1, y - 2 + step, 5, 2, '#554b46');
      }
      this.rect(x - 6, top + 13, 12, 10, outline); this.rect(x - 5, top + 13, 10, 9, shirt);
      this.rect(x - 7, top + 14 + step, 2, 6, shirt); this.rect(x + 5, top + 14 - step, 2, 6, shirt);
      this.rect(x - 7, top + 19 + step, 2, 3, skin); this.rect(x + 5, top + 19 - step, 2, 3, skin);
      this.rect(x - 2, top + 11, 4, 3, skin);
      this.rect(x - 6, top + 2, 12, 10, outline); this.rect(x - 5, top + 3, 10, 9, skin);
      this.rect(x - 4, top, 9, 3, hair); this.rect(x - 6, top + 2, 12, 4, hair);
      if (id === 'kiara') {
        this.rect(x - 7, top + 4, 3, 13, hair); this.rect(x + 4, top + 3, 3, 15, hair);
        this.rect(x - 5, top + 1, 8, 2, '#d17745'); this.rect(x + 5, top + 7, 1, 8, '#d17745');
      } else { this.rect(x - 6, top + 4, 2, 4, hair); this.rect(x + 4, top + 4, 2, 3, hair); }
      if (d === 'up') {
        this.rect(x - 5, top + 4, 10, 7, hair); this.rect(x - 3, top + 2, 5, 1, id === 'kiara' ? '#d17745' : '#826048');
      } else {
        const eye = cfg.eyes || cfg.eye || '#694637';
        if (d !== 'left') this.rect(x + 2, top + 7, 1, 2, eye);
        if (d !== 'right') this.rect(x - 3, top + 7, 1, 2, eye);
        this.rect(x - 1, top + 10, 2, 1, '#c19075');
      }
      this.actorAccessories(a,x,y,cfg);
    }
    spritePose(im,sx,sy,sw,sh,x,y,a,cfg,seated){
      const legacy=sw===16&&sh===24,dw=legacy?16:32,dh=legacy?24:32;
      if(seated){
        // Keep the head/body at full pixel size and fold the legs under the seat.
        this.ctx.drawImage(im,sx,sy,sw,Math.round(sh*.81),x-dw/2,y-dh+7,dw,Math.round(dh*.81));
        this.rect(x-6,y-2,6,3,cfg.pants);this.rect(x+1,y-2,7,3,cfg.pants);
      }else this.ctx.drawImage(im,sx,sy,sw,sh,x-dw/2,y-dh+(legacy?0:4),dw,dh);
      this.actorAccessories(a,x,y,cfg);
    }
    actorAccessories(a,x,y,cfg){
      if(a.holdingYogurt||a.yogurt){this.rect(x+5,y-9,5,5,'#f1dec3');this.rect(x+6,y-11,3,3,'#e7b5a0');}
      if(a.hugging||a.pose==='hug')this.rect(x+5,y-10,9,3,cfg.skin);
      if(a.holdingUSB){this.rect(x+7,y-13,4,7,'#657e71');this.rect(x+7,y-16,4,3,'#cfccaf');this.rect(x+8,y-15,1,1,'#798479');}
      if(a.pose==='pc'){
        const shift=Math.floor(this.t*4)%2;this.rect(x-9,y-11-shift,4,3,cfg.skin);this.rect(x+5,y-10+shift,4,3,cfg.skin);
      }
      if(a.pose==='cook'){
        const shift=Math.round(Math.sin(this.t*3)*2);this.rect(x+5,y-13,7,3,cfg.skin);this.rect(x+10,y-16+shift,2,8,'#92775a');
        if(Math.sin(this.t*2)>.1){this.rect(x+10,y-30,1,3,'rgba(240,228,194,.65)');this.rect(x+12,y-34,1,3,'rgba(240,228,194,.5)');}
      }
    }
    indicator(entity) {
      const actor = entity.character || entity.id === 'kiara' || entity.id === 'bene';
      const x = actor ? entity.x : entity.x + (entity.w || 0) / 2;
      const y = entity.y - (actor ? 32 : 15) + Math.round(Math.sin(this.t * 3) * 1.5);
      this.rect(x - 2, y, 5, 1, '#fff0c0'); this.rect(x - 1, y + 1, 3, 1, '#fff0c0'); this.rect(x, y + 2, 1, 1, '#fff0c0');
    }
    marker(entity, actor) {
      const x = Math.round(entity.x + (actor ? 0 : (entity.w || 0) / 2));
      const y = Math.round(entity.y - (actor ? 40 : 25) + Math.sin(this.t * 2) * 1.2);
      if (entity.marker === 'card') {
        this.rect(x - 4, y, 9, 12, '#665348'); this.rect(x - 3, y + 1, 7, 10, '#fff0cc');
        this.rect(x - 1, y + 4, 3, 4, '#bd7971');
      } else {
        this.rect(x - 6, y, 13, 9, '#6a6254'); this.rect(x - 5, y + 1, 11, 7, '#f4e8c0');
        this.rect(x - 1, y + 9, 3, 2, '#6a6254'); this.rect(x - 3, y + 4, 1, 1, '#7f6854');
        this.rect(x, y + 4, 1, 1, '#7f6854'); this.rect(x + 3, y + 4, 1, 1, '#7f6854');
      }
    }
    heart(x, y) {
      this.rect(x, y, 3, 3, '#d78179'); this.rect(x + 4, y, 3, 3, '#d78179');
      this.rect(x - 1, y + 2, 9, 2, '#d78179'); this.rect(x, y + 4, 7, 1, '#d78179');
      this.rect(x + 1, y + 5, 5, 1, '#d78179'); this.rect(x + 2, y + 6, 3, 1, '#d78179'); this.rect(x + 3, y + 7, 1, 1, '#d78179');
      this.rect(x, y + 1, 2, 1, '#efb7a0');
    }
    partyLights(map) {
      for (let x = 25; x < map.width - 10; x += 25) {
        const y = 42 + Math.round(Math.sin(x / 80) * 5);
        this.rect(x - 22, y, 25, 1, '#796b51');
        this.rect(x, y + 1, 3, 4, ['#eedb9a', '#daa892', '#a5b593'][Math.floor(x / 25) % 3]);
      }
    }
    birds() {
      for (let i = 0; i < 3; i++) {
        const x = 310 + i * 15 + Math.round(Math.sin(this.t * .3 + i) * 3), y = 249 + (i % 2) * 8;
        this.rect(x, y, 5, 3, '#d3cbb3'); this.rect(x + 3, y - 2, 3, 3, '#ebe0c0'); this.rect(x + 6, y - 1, 2, 1, '#a9824f');
      }
    }
    particles(camera) {
      for (let i = 0; i < 20; i++) {
        const x = (hash(i, 719) * this.canvas.width + this.t * (2 + i % 3)) % (this.canvas.width + 12) - 6 + camera.x;
        const y = (hash(i, 312) * this.canvas.height + Math.sin(this.t * .6 + i) * 5) + camera.y;
        this.rect(x, y, i % 3 ? 1 : 2, 1, i % 2 ? 'rgba(255,231,172,.65)' : 'rgba(245,199,170,.55)');
      }
      for (let i = 0; i < 3; i++) {
        const x = 120 + i * 279 + Math.sin(this.t * .6 + i * 4) * 24;
        const y = 215 + Math.sin(this.t * .8 + i) * 20;
        const wing = Math.sin(this.t * 10) > 0 ? 3 : 1;
        this.rect(x - wing, y, wing, 3, '#f2d5a2'); this.rect(x + 1, y, wing, 3, '#e9c49c'); this.rect(x, y + 1, 1, 3, '#8c8661');
      }
    }
  }
  V.Renderer = Renderer;
})();
