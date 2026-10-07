/* Optional developer check: node tests/map-check.cjs
 * The game itself does not require Node. Uses the actual Player collision code.
 * Flood-fills each map in 4px steps from its spawn and verifies a reachable
 * position within interaction range of every interactive object and NPC.
 */
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
global.window = {};
require('../js/data.js');
require('../js/maps.js');
if(fs.existsSync(path.join(__dirname,'../js/memory-data.js')))require('../js/memory-data.js');
if(fs.existsSync(path.join(__dirname,'../js/memory-maps.js')))require('../js/memory-maps.js');
require('../js/player.js');
const VG = window.VG;
const STEP = 4;

function distanceToTarget(x, y, target) {
  if (target.character) return Math.hypot(x - target.x, y - target.y);
  const tx = Math.max(target.x, Math.min(x, target.x + target.w));
  const ty = Math.max(target.y, Math.min(y, target.y + target.h));
  return Math.hypot(x - tx, y - ty);
}

let failures = 0;
for (const [id, map] of Object.entries(VG.MAPS)) {
  const player = new VG.Player(map.spawn.x, map.spawn.y);
  const npcs = map.npcs || [];
  const targets = map.objects.filter(o => o.interact).concat(npcs.filter(n=>n.interact!==false));
  const minimum = targets.map(() => Infinity);
  const minX = 10 + ((map.spawn.x - 10) % STEP + STEP) % STEP;
  const minY = 24 + ((map.spawn.y - 24) % STEP + STEP) % STEP;
  const columns = Math.floor((map.width - 10 - minX) / STEP) + 1;
  const rows = Math.floor((map.height - 9 - minY) / STEP) + 1;
  const cells = columns * rows;
  const visited = new Uint8Array(cells);
  const queue = new Int32Array(cells);
  let read = 0, write = 0;
  const startColumn = (map.spawn.x - minX) / STEP;
  const startRow = (map.spawn.y - minY) / STEP;
  assert(Number.isInteger(startColumn) && Number.isInteger(startRow));
  assert(player.canMove(map.spawn.x, map.spawn.y, map, npcs), id + ': spawn blocked');
  for(const npc of npcs){
    // A posed actor may intentionally occupy a bed or chair. Every standing
    // actor and the playable spawn still need collision-free floor space.
    if(npc.seated||['sit','seated','lie','sleep','sleeping','hug'].includes(npc.pose))continue;
    assert(player.canMove(npc.x,npc.y,map,npcs.filter(n=>n!==npc)),id+': standing NPC inside collision '+npc.id);
  }
  const start = startRow * columns + startColumn;
  queue[write++] = start;
  visited[start] = 1;
  while (read < write) {
    const index = queue[read++];
    const col = index % columns;
    const row = Math.floor(index / columns);
    const x = minX + col * STEP;
    const y = minY + row * STEP;
    for (let t = 0; t < targets.length; t++) {
      minimum[t] = Math.min(minimum[t], distanceToTarget(x, y, targets[t]));
    }
    for (const [dc, dr] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nc = col + dc, nr = row + dr;
      if (nc < 0 || nc >= columns || nr < 0 || nr >= rows) continue;
      const next = nr * columns + nc;
      if (visited[next]) continue;
      visited[next] = 1;
      const nx = minX + nc * STEP, ny = minY + nr * STEP;
      // Also check the midpoint to avoid stepping through a thin obstacle.
      if (!player.canMove((x + nx) / 2, (y + ny) / 2, map, npcs) ||
          !player.canMove(nx, ny, map, npcs)) continue;
      queue[write++] = next;
    }
  }
  const blocked = targets.filter((target, i) => minimum[i] > (target.character?30:24));
  if(id==='birthday'){
    const group=npcs.filter(n=>n.group).concat(map.spawn);
    assert(group.length>=6&&group.length<=8,'birthday: the main group contains 6–8 people including Valen');
    assert(npcs.find(n=>n.id==='kiara')?.group,'birthday: Kiara belongs to the group');
    assert(npcs.find(n=>n.id==='bene')?.group,'birthday: Bene belongs to the group');
    const center={x:group.reduce((sum,n)=>sum+n.x,0)/group.length,y:group.reduce((sum,n)=>sum+n.y,0)/group.length};
    assert(new Set(group.map(n=>(n.x<center.x?'W':'E')+(n.y<center.y?'N':'S'))).size===4,'birthday: group surrounds an open center, not a line');
    assert(group.every(n=>Math.hypot(n.x-center.x,n.y-center.y)<115),'birthday: close friends stay in one group');
    assert(npcs.filter(n=>n.ambient).length>=12,'birthday: random guests fill the house separately');
    // These probes test connected floor inside the group, around its edges,
    // and by the patio door without depending on one particular spawn grid.
    const probes=[center,
      {x:Math.min(...group.map(n=>n.x))-24,y:center.y},
      {x:Math.max(...group.map(n=>n.x))+24,y:center.y},
      {x:center.x,y:Math.min(...group.map(n=>n.y))-24},
      {x:center.x,y:Math.min(map.height-28,Math.max(...group.map(n=>n.y))+24)},
      {x:288,y:316}];
    for(const probe of probes){
      let reachable=false;
      for(let i=0;i<write;i++){
        const x=minX+(queue[i]%columns)*STEP,y=minY+Math.floor(queue[i]/columns)*STEP;
        if(Math.hypot(x-probe.x,y-probe.y)<=10){reachable=true;break;}
      }
      assert(reachable,`birthday: group/door route blocked near ${probe.x.toFixed(0)},${probe.y.toFixed(0)}`);
    }
  }
  console.log(`${id}: ${write} reachable grid positions, ${targets.length} interactions, ${blocked.length} blocked`);
  for (const target of blocked) {
    const d = minimum[targets.indexOf(target)];
    console.error(`  BLOCKED ${target.id}: closest reachable distance ${d.toFixed(1)}px`);
    failures++;
  }
}
if (failures) process.exitCode = 1;
else console.log('All map interactions are reachable with collision enabled.');
