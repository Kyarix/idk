/* Optional developer check: node tests/map-check.cjs
 * The game itself does not require Node. Uses the actual Player collision code.
 * Flood-fills each map in 4px steps from its spawn and verifies a reachable
 * position within interaction range of every interactive object and NPC.
 */
'use strict';
const assert = require('node:assert/strict');
global.window = {};
require('../js/data.js');
require('../js/maps.js');
require('../js/player.js');
const VG = window.VG;
const STEP = 4;
const RANGE = 25;

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
  const targets = map.objects.filter(o => o.interact).concat(npcs);
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
  for(const npc of npcs)assert(player.canMove(npc.x,npc.y,map,npcs.filter(n=>n!==npc)),id+': NPC inside collision '+npc.id);
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
  const blocked = targets.filter((target, i) => minimum[i] > RANGE);
  if(id==='birthday'){
    // Inside the group and four routes around it must remain connected.
    for(const [x,y] of [[194,234],[98,242],[194,182],[282,250],[194,306],[286,314]]){
      const col=(x-minX)/STEP,row=(y-minY)/STEP;
      assert(player.canMove(x,y,map,npcs)&&queue.subarray(0,write).includes(row*columns+col),`birthday: group/door route blocked at ${x},${y}`);
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
