/* Replayable chapters. Each run receives isolated game.flags from Game.
 * Uses existing movement, dialogue, followers, camera, sound and transitions.
 * No localStorage writes: finishMemory() returns to the memories menu.
 */
(function (VG) {
  'use strict';
  const ease = v => Math.max(0, Math.min(1, v));
  const lerp = (a, b, t) => a + (b - a) * ease(t);
  const titles = { movie: 'Una película', tech: 'Servicio técnico', dinner: 'Plan de último momento', nextDay: 'Al día siguiente', kiara: 'Kiara' };
  function scene(memory, map, actions, audio = 'plaza') {
    return Object.assign({ memory: true, map, title: titles[memory], chapter: { number: VG.MEMORIES[memory].number, title: titles[memory] }, audio, update() {} }, actions);
  }
  function goal(g, text, ids = []) {
    g.objective(text);
    [...(g.map?.objects || []), ...g.npcs].forEach(t => { t.marker = ids.includes(t.id) ? 'talk' : null; });
  }
  function withKiara(g) { if (!g.companion) g.attachCompanion(); return g.companion; }
  function clearPose(actor) { if (actor) { actor.pose = null; actor.seated = false; actor.hugging = false; actor.walking = false; } }
  function stand(g, x, y) {
    clearPose(g.player); clearPose(g.companion);
    if (x !== undefined) { g.player.x = x; g.player.y = y; if (g.companion) { g.companion.x = x + 23; g.companion.y = y; } }
    g.followTrace = [];
  }
  function pair(g, x, y, kx, ky, pose = 'seated') {
    const k = withKiara(g);
    Object.assign(g.player, { x, y, pose, seated: pose === 'seated', dir: 'up', walking: false });
    Object.assign(k, { x: kx, y: ky, pose, seated: pose === 'seated', dir: 'up', walking: false });
    return k;
  }
  function bedPair(g, pose = 'lying') { return pair(g, 173, 132, 175, 153, pose); }
  function closeAndKiss(g, done, options = {}) {
    const secondKiss = options.secondKiss !== false;
    const hug = options.hug !== false;
    const k = g.companion;
    const startY = k.y;
    const targetY = options.targetY ?? 147;
    g.animate('memory-kisses', secondKiss ? 5.8 : 2.6, (time, c) => {
      k.y = lerp(startY, targetY, time / 1.1);
      g.player.dir = 'right'; k.dir = 'left';
      c.heart = (time > 1.25 && time < 2.15) || (secondKiss && time > 3.05 && time < 3.9);
      c.heartAt = { x: 176, y: 131 };
      if (time > 1.25 && !c.firstKiss) { c.firstKiss = true; g.audio.play('kiss'); }
      if (secondKiss && time > 3.05 && !c.secondKiss) { c.secondKiss = true; g.audio.play('kiss'); }
      if (hug && time > 4.1) g.player.hugging = true;
    }, done);
  }
  function smallKiss(g, done) {
    g.animate('memory-small-kiss', 1.35, (time, c) => {
      c.heart = time > .2 && time < 1.1;
      c.heartAt = { x: (g.player.x + g.companion.x) / 2, y: g.player.y - 18 };
      if (time > .2 && !c.kiss) { c.kiss = true; g.audio.play('kiss'); }
    }, done);
  }
  function thoughtsSequence(g, keys, done) {
    if (!keys.length) { if (done) done(); return; }
    g.thoughts(keys[0], () => thoughtsSequence(g, keys.slice(1), done));
  }
  function walkComment(g, dt, flag, distance, dialogue) {
    if (!g.player.walking || g.flags[flag]) return;
    const meter = flag + 'Distance'; g.flags[meter] = (g.flags[meter] || 0) + dt * g.player.speed;
    if (g.flags[meter] >= distance) { g.flags[flag] = true; g.say(dialogue); }
  }
  function arriveBus(g, done) {
    const bus = g.object('bus'), k = g.npc('kiara');
    const destination = bus ? bus.x : 180, y = bus ? bus.y : 215;
    if (bus) bus.hidden = true;
    if (k) { k.hidden = true; k.interact = false; k.solid = false; }
    g.animate('bus-arrival', 3.3, (time, c) => {
      c.vehicle = { type: 'bus', x: lerp(-140, destination, time / 2.6), y, w: 132, h: 44 };
    }, () => {
      if (bus) bus.hidden = false;
      if (k) { k.hidden = false; k.interact = true; }
      done();
    });
  }
  function ride(g, type, done) {
    const vehicle = g.object(type);
    if (vehicle) vehicle.hidden = true;
    g.player.hidden = true; if (g.companion) g.companion.hidden = true;
    g.npcs.forEach(n => { n.hidden = true; });
    const start = type === 'car' ? 390 : 150;
    g.animate('travel', 3.6, (time, c) => {
      const x = start + time * 68;
      c.vehicle = { type, x, y: 216, w: type === 'car' ? 77 : 132, h: type === 'car' ? 34 : 44 };
      g.player.x = Math.min(g.map.width - 75, x + 45); g.player.y = 213;
    }, done);
  }
  function cafeSeat(g, tableId, food) {
    const table = g.object(tableId); if (table) table.food = food;
    pair(g, 216, 188, 253, 188);
  }
  function quietMeal(g, done) { g.animate('meal', 3.5, () => {}, done); }

  Object.assign(VG.SCENES, {
    memMovieLiving: scene('movie', 'memoryApartment', {
      enter(g) {
        g.map.night = false; pair(g, 174, 187, 212, 187);
        goal(g, '');
        g.animate('movie', 2.7, () => {}, () => g.say('memMovieStart', () => {
          stand(g, 174, 199); goal(g, 'Seguí la película en la notebook', ['notebook']);
        }));
      },
      interact(g, t) {
        if (t.id === 'notebook') {
          if (g.flags.movieStarted) { g.say('memMovieUpstairs'); return; }
          pair(g, 174, 187, 212, 187);
          g.animate('movie', 3.2, () => {}, () => g.say('memMovieNotebook', () => {
            g.flags.movieStarted = true; stand(g, 236, 198); goal(g, 'Suban a la habitación', ['stairs']);
          })); return;
        }
        if (t.id === 'stairs') { if (g.flags.movieStarted) g.go('memMovieBedroom'); else g.say('memMovieWait'); return; }
        g.say(t.id === 'kitchen' ? 'memMovieKitchen' : t.id === 'kiara' ? 'memMovieWait' : 'memMovieTable');
      }
    }, 'flowers'),

    memMovieBedroom: scene('movie', 'memoryBedroom', {
      enter(g) { g.map.night = false; withKiara(g); g.say('memMovieUpstairs', () => goal(g, 'Acomodá la notebook al lado de la cama', ['notebook'])); },
      interact(g, t) {
        if (t.id === 'notebook') {
          g.say('memMovieSetNotebook', () => { g.flags.movieNotebookReady = true; goal(g, 'Acomodate con Kiara en la cama', ['bed']); }); return;
        }
        if (t.id === 'bed') {
          if (!g.flags.movieNotebookReady) { g.say('memMovieBedroomWait'); return; }
          bedPair(g); goal(g, '');
          g.animate('movie', 4, () => {}, () => g.say('memMovieComfort', () =>
            g.animate('movie-pause', .75, () => {}, () => g.say('memMovieAh', () =>
              g.animate('movie-pause', .55, () => {}, () => g.say('memMovieConvenient', () =>
                closeAndKiss(g, () => g.say('memMovieContinue', () => smallKiss(g, () =>
                  g.animate('movie', 1.8, () => {}, () => g.say('memMovieNear', () =>
                    g.animate('movie', 4.5, () => {}, () => g.say('memMovieEnd', () =>
                      g.animate('movie-heart', 1.4, (time, c) => {
                        c.heart = time < 1.1; c.heartAt = { x: 181, y: 126 };
                      }, () => g.finishMemory())
                    ))
                  ))
                )), { secondKiss: false, hug: false })
              ))
            ))
          )); return;
        }
        g.say('memBedroomWindow');
      }
    }, 'flowers'),

    memTechStop: scene('tech', 'memoryBusStop', {
      enter(g) {
        const k = g.npc('kiara'); if (k) { k.hidden = true; k.interact = false; k.solid = false; }
        const bus = g.object('bus'); if (bus) bus.hidden = true;
        goal(g, 'Buscá a Kiara en la parada', ['bus-stop']);
      },
      interact(g, t) {
        if (t.id === 'bus-stop' || t.id === 'bus') {
          if (g.flags.techPickedUp) { g.say('memStreetSign'); return; }
          goal(g, ''); arriveBus(g, () => g.say('memTechArrival', () => {
            g.flags.techPickedUp = true; withKiara(g); goal(g, 'Vayan juntos al departamento', ['apartment-door']);
          })); return;
        }
        if (t.id === 'apartment-door') { if (g.flags.techPickedUp) g.go('memTechApartment'); else g.say('memTechBusWait'); return; }
        g.say(g.flags.techPickedUp ? 'memStreetBench' : 'memTechBusWait');
      }
    }),

    memTechApartment: scene('tech', 'memoryApartment', {
      enter(g) {
        withKiara(g); goal(g, '');
        g.say('memTechUSBQuestion', () => g.animate('usb', 2.5, (time, c) => {
          c.usb = time > 1; g.companion.holdingUSB = time > 1;
        }, () => g.say('memTechUSBReveal', () => goal(g, 'Acercate a la PC con Kiara', ['pc']))));
      },
      interact(g, t) {
        if (t.id === 'pc') {
          if (g.flags.techInstalled) { g.say('memTechInstalled'); return; }
          g.say('memTechPC', () => {
            const pc = g.object('pc'); if (pc) pc.status = 'installing';
            Object.assign(g.companion, { x: 212, y: 187, pose: 'pc', seated: true, dir: 'up', holdingUSB: false });
            Object.assign(g.player, { x: 174, y: 187, pose: 'seated', seated: true, dir: 'right' });
            goal(g, '');
            g.animate('installation', 3, (time, c) => {
              c.progress = ease(time / 5.4); c.label = 'Instalando Windows';
            }, () => g.say('memTechInstallWait', () => g.animate('installation', 3, (time, c) => {
              c.progress = .5 + ease(time / 5.4); c.label = 'Instalando Windows';
            }, () => {
              if (pc) pc.status = 'ready'; g.flags.techInstalled = true;
              g.say('memTechInstalled', () => { stand(g, 236, 198); goal(g, 'Salgan a caminar', ['exit']); });
            })));
          }); return;
        }
        if (t.id === 'exit') { if (g.flags.techInstalled) g.go('memTechWalk', { position: { x: 529, y: 167 } }); else g.say('memTechNotFinished'); return; }
        g.say('memMovieTable');
      }
    }),

    memTechWalk: scene('tech', 'memoryBusStop', {
      enter(g) { withKiara(g); goal(g, g.flags.techAte ? 'Vuelvan caminando al departamento' : 'Caminen hasta la cafetería', [g.flags.techAte ? 'apartment-door' : 'cafe-door']); },
      update(g, dt) { if (!g.flags.techAte) walkComment(g, dt, 'techWalkTalk', 100, 'memTechWalk'); },
      interact(g, t) {
        if (t.id === 'cafe-door' && !g.flags.techAte) { g.go('memTechCafe'); return; }
        if (t.id === 'apartment-door') { if (g.flags.techAte) g.go('memTechHome'); else g.say('memTechWalk'); return; }
        g.say('memStreetBench');
      }
    }),

    memTechCafe: scene('tech', 'memoryCafe', {
      enter(g) { withKiara(g); goal(g, 'Busquen una mesa', ['meal-table']); },
      interact(g, t) {
        if (t.id === 'meal-table') {
          if (g.flags.techAte) { g.say('memTechCafeTalk'); return; }
          cafeSeat(g, 'meal-table', 'breakfast'); goal(g, '');
          g.say('memTechOrder', () => quietMeal(g, () => g.say('memTechCafeTalk', () => {
            g.flags.techAte = true; stand(g, 216, 201); goal(g, 'Salgan para volver al departamento', ['exit']);
          }))); return;
        }
        if (t.id === 'exit') { if (g.flags.techAte) g.go('memTechWalk', { position: { x: 349, y: 169 } }); else g.say('memTechCafeWait'); return; }
        g.say('memCafeMenu');
      }
    }),

    memTechHome: scene('tech', 'memoryApartment', {
      enter(g) {
        withKiara(g); const pc = g.object('pc'); if (pc) pc.status = 'ready'; goal(g, '');
        g.say('memTechHome', () => g.animate('home', 3.5, () => {}, () => g.finishMemory()));
      },
      interact() {}
    }),

    memDinnerChat: scene('dinner', null, {
      presentation: 'phone',
      enter(g) { goal(g, ''); g.phone.startConversation(VG.STORY.memDinnerChat, () => g.go('memDinnerTransit'), { name: 'Kiara', subtitle: 'un plan bastante improvisado' }); },
      interact() {}
    }),

    memDinnerTransit: scene('dinner', 'memoryTransit', {
      enter(g) {
        g.map.night = true; goal(g, '');
        const k = g.npc('kiara'); if (k) { k.hidden = true; k.interact = false; }
        g.say('memDinnerBus', () => arriveBus(g, () => goal(g, 'Kiara llegó. Acercate a saludarla', ['kiara'])));
      },
      interact(g, t) {
        if (t.id === 'kiara' && !g.flags.dinnerPickedUp) {
          g.say('memDinnerArrival', () => { g.flags.dinnerPickedUp = true; withKiara(g); goal(g, 'Bene los lleva. Vayan al auto', ['car', 'bene']); }); return;
        }
        if (t.id === 'bene' || t.id === 'car') {
          if (!g.flags.dinnerPickedUp) { g.say('memDinnerWaitKiara'); return; }
          g.say('memDinnerBene', () => ride(g, 'car', () => g.go('memDinnerRestaurant'))); return;
        }
        g.say('memStreetSign');
      }
    }, 'birthday'),

    memDinnerRestaurant: scene('dinner', 'memoryRestaurant', {
      enter(g) { g.map.night = true; withKiara(g); goal(g, 'Sentate con Kiara y Bene', ['dinner-table']); },
      interact(g, t) {
        if (t.id === 'dinner-table') {
          if (g.flags.dinnerAte) { g.say('memDinnerBanter'); return; }
          pair(g, 241, 206, 273, 206);
          const b = g.npc('bene'); if (b) Object.assign(b, { x: 315, y: 206, pose: 'seated', seated: true, dir: 'up' });
          const table = g.object('dinner-table'); if (table) table.food = 'dinner'; goal(g, '');
          g.say('memDinnerTable', () => quietMeal(g, () => g.say('memDinnerAfterFood', () => {
            g.flags.dinnerAte = true; stand(g, 241, 221); goal(g, 'Cuando quieran, vuelvan al departamento', ['exit']);
          }))); return;
        }
        if (t.id === 'exit') {
          if (!g.flags.dinnerAte) { g.say('memDinnerBeforeMeal'); return; }
          g.say('memDinnerGoHome', () => g.go('memDinnerApartment')); return;
        }
        g.say(t.id === 'bene' ? g.flags.dinnerAte ? 'memDinnerBanter' : 'memDinnerBeforeMeal' : 'memRestaurantLight');
      }
    }, 'birthday'),

    memDinnerApartment: scene('dinner', 'memoryApartment', {
      enter(g) {
        g.map.night = true; pair(g, 174, 187, 196, 187, 'standing');
        g.say('memDinnerApartment', () => closeAndKiss(g, () => g.say('memDinnerAfterKiss', () => goal(g, 'Suban a la habitación', ['stairs'])), { hug: false, targetY: 187 }));
      },
      interact(g, t) { if (t.id === 'stairs') g.go('memDinnerBedroom'); else g.say('memDinnerRoom'); }
    }, 'flowers'),

    memDinnerBedroom: scene('dinner', 'memoryBedroom', {
      enter(g) { g.map.night = true; withKiara(g); goal(g, 'Acostate con Kiara', ['bed']); },
      interact(g, t) {
        if (t.id !== 'bed') { g.say('memBedroomWindow'); return; }
        goal(g, ''); bedPair(g);
        closeAndKiss(g, () => g.say('memDinnerSleep', () => g.animate('sleep', 5.5, () => {
          g.player.pose = g.companion.pose = 'sleep'; g.player.hugging = true;
        }, () => g.finishMemory())));
      }
    }, 'flowers'),

    memNextMorning: scene('nextDay', 'memoryBedroom', {
      enter(g) {
        g.map.night = false; bedPair(g); g.player.hugging = false; g.companion.hugging = false; goal(g, '');
        closeAndKiss(g, () => g.say('memNextMorning', () => {
          stand(g, 275, 204); goal(g, 'Bajen al living', ['stairs']);
        }), { hug: false });
      },
      interact(g, t) { if (t.id === 'stairs') g.go('memNextApartment'); else g.say('memBedroomWindow'); }
    }, 'flowers'),

    memNextApartment: scene('nextDay', 'memoryApartment', {
      enter(g) {
        g.map.night = false;
        const k = g.npc('kiara'); if (k) Object.assign(k, { x: 212, y: 187, pose: 'pc', seated: true, dir: 'up', solid: false });
        const pc = g.object('pc'); if (pc) pc.status = 'study';
        goal(g, 'Prepará algo en la cocina', ['kitchen']);
      },
      interact(g, t) {
        if (t.id === 'kitchen' && !g.flags.nextCooked) {
          const k = g.npc('kiara');
          g.say('memNextKitchen', () => {
            Object.assign(g.player, { x: 134, y: 125, pose: 'cook', dir: 'up' }); goal(g, '');
            g.animate('morning', 6, () => { if (k) k.pose = 'pc'; }, () => g.say('memNextStudy', () =>
              g.say('memNextCare', () => g.thoughts('memNextThought', () => g.say('memNextInvite', () => {
                g.flags.nextCooked = true; clearPose(g.player); if (k) { clearPose(k); k.dir = 'left'; }
                g.animate('leave-desk', 2.2, time => {
                  if (!k) return;
                  const route = [{ x: 212, y: 187 }, { x: 118, y: 187 }, { x: 118, y: 125 }, { x: 158, y: 125 }];
                  const progress = ease(time / 2) * 3, index = Math.min(2, Math.floor(progress));
                  const from = route[index], to = route[index + 1];
                  k.x = lerp(from.x, to.x, progress - index); k.y = lerp(from.y, to.y, progress - index);
                  k.dir = to.x !== from.x ? (to.x > from.x ? 'right' : 'left') : 'up'; k.walking = time < 2;
                }, () => {
                  withKiara(g); stand(g); goal(g, 'Salgan para tomar el colectivo', ['exit']);
                });
              })))));
          }); return;
        }
        if (t.id === 'exit') { if (g.flags.nextCooked) g.go('memNextTransit'); else g.say('memNextBeforeCook'); return; }
        g.say(t.id === 'pc' || t.id === 'kiara' ? 'memNextPC' : 'memMovieTable');
      }
    }),

    memNextTransit: scene('nextDay', 'memoryTransit', {
      enter(g) {
        g.map.night = false; g.npcs = g.npcs.filter(n => n.id !== 'bene'); const car = g.object('car'); if (car) car.hidden = true;
        withKiara(g); goal(g, 'Tomen el colectivo a Pueblo Esther', ['bus-stop', 'bus']);
      },
      interact(g, t) {
        if (t.id === 'bus' || t.id === 'bus-stop') { g.say('memNextBus', () => ride(g, 'bus', () => g.go('memNextTown'))); return; }
        g.say('memStreetSign');
      }
    }),

    memNextTown: scene('nextDay', 'memoryTown', {
      enter(g) {
        withKiara(g); const s = g.npc('sebi');
        if (s) { s.hidden = !g.flags.tiramisuShared; s.interact = !!g.flags.tiramisuShared; s.solid = false; }
        if (!g.flags.townArrived) { g.flags.townArrived = true; g.say('memTownArrive'); }
        goal(g, g.flags.sebiInvited ? 'Vayan con Sebi hasta la cancha' : g.flags.tiramisuShared ? 'Sigan paseando por Pueblo Esther' : 'Caminen por el pueblo hasta Mamalu', [g.flags.sebiInvited ? 'pitch-door' : g.flags.tiramisuShared ? 'sebi' : 'mamalu-door']);
      },
      update(g, dt) {
        if (!g.flags.tiramisuShared) walkComment(g, dt, 'townWalkTalk', 160, 'memTownWalk');
        if (!g.flags.tiramisuShared) walkComment(g, dt, 'townWalkTalkAgain', 430, 'memTownWalkAgain');
        if (g.flags.sebiInvited) {
          const s = g.npc('sebi'); if (s && s.x < 806) { s.x = Math.min(806, s.x + dt * 38); s.walking = true; s.dir = 'right'; } else if (s) s.walking = false;
        }
      },
      interact(g, t) {
        if (t.id === 'mamalu-door') {
          if (g.flags.tiramisuShared) { g.say('memTiramisuAfter'); return; }
          g.say('memTownMamalu', () => g.go('memNextMamalu')); return;
        }
        if (t.id === 'sebi') {
          if (g.flags.sebiInvited) { g.say('memSebiAgain'); return; }
          g.player.dir = 'right';
          const k = g.npc('kiara'); if (k) k.dir = 'left';
          g.say('memSebiInvite', () => { g.flags.sebiInvited = true; goal(g, 'Vayan con Sebi hasta la cancha', ['pitch-door']); }); return;
        }
        if (t.id === 'pitch-door') { if (g.flags.sebiInvited) g.go('memNextPitch'); else g.say('memTownKeepWalking'); return; }
        g.say('memTownTree');
      }
    }),

    memNextMamalu: scene('nextDay', 'memoryMamalu', {
      enter(g) { withKiara(g); goal(g, 'Compartan un tiramisú', ['tiramisu-table']); },
      interact(g, t) {
        if (t.id === 'tiramisu-table') {
          if (g.flags.tiramisuShared) { g.say('memTiramisuAfter'); return; }
          cafeSeat(g, 'tiramisu-table', 'tiramisu'); goal(g, '');
          g.say('memTiramisu', () => quietMeal(g, () => g.say('memTiramisuAfter', () => g.animate('tiramisu-heart', 1.5, (time, c) => {
            c.heart = time < 1.2; c.heartAt = { x: 241, y: 168 };
          }, () => {
            g.flags.tiramisuShared = true; stand(g, 215, 204); goal(g, 'Vuelvan a pasear por el pueblo', ['exit']);
          })))); return;
        }
        if (t.id === 'exit') { if (g.flags.tiramisuShared) g.go('memNextTown', { position: { x: 448, y: 190 } }); else g.say('memMamaluWait'); return; }
        g.say('memCafeMenu');
      }
    }),

    memNextPitch: scene('nextDay', 'memoryPitch', {
      enter(g) {
        const k = g.npc('kiara'); if (k) Object.assign(k, { x: 167, y: 338, dir: 'up', solid: false });
        g.say('memPitchStart', () => goal(g, 'Acercate a la pelota para jugar', ['ball']));
      },
      interact(g, t) {
        if (t.id !== 'ball') { g.say(t.id === 'sebi' ? 'memSebiAgain' : 'memPitchBefore'); return; }
        const s = g.npc('sebi'), k = g.npc('kiara'), ball = g.object('ball');
        goal(g, '');
        g.animate('football', 7.5, (time, c) => {
          const phase = time * 1.4;
          g.player.x = 282 + Math.sin(phase) * 33; g.player.y = 235 + Math.cos(phase) * 13; g.player.walking = true; g.player.dir = 'up';
          if (s) { s.x = 368 + Math.cos(phase) * 31; s.y = 146 + Math.sin(phase) * 15; s.walking = true; s.dir = 'down'; }
          if (ball) { const pass = (Math.sin(time * 2.5) + 1) / 2; ball.x = lerp(g.player.x, s ? s.x : 368, pass); ball.y = lerp(g.player.y, s ? s.y : 146, pass); }
          for (const n of g.npcs) if (n !== k && n !== s) { n.x += Math.sin(time * 2 + n.y) * .18; n.walking = true; }
          if (k) { k.dir = 'up'; k.walking = false; }
          c.phase = 'playing';
        }, () => {
          g.player.walking = false; g.npcs.forEach(n => { n.walking = false; });
          g.thoughts('memPitchThought', () => g.animate('watching', 2.5, (time, c) => {
            c.heart = time > .3 && time < 2.2; c.heartAt = k ? { x: k.x, y: k.y } : { x: 167, y: 338 };
          }, () => g.finishMemory()));
        });
      }
    }),

    memKiaraRoom: scene('kiara', 'memoryKiaraRoom', {
      playerCharacter: 'kiara',
      enter(g) { g.map.night = true; g.npcs = []; g.player.character = 'kiara'; goal(g, ''); },
      interact(g, t) {
        if (t.id === 'phone') { g.thoughts('memKiaraPhone'); return; }
        if (t.id === 'desk') { g.thoughts('memKiaraDesk'); return; }
        if (t.id === 'window') { g.thoughts('memKiaraWindow'); return; }
        if (t.id !== 'bed') return;
        const from = { x: g.player.x, y: g.player.y };
        g.animate('lie-down', 2.4, time => {
          g.player.x = lerp(from.x, 173, time / 1.7); g.player.y = lerp(from.y, 150, time / 1.7);
          if (time > 1.7) g.player.pose = 'lying';
        }, () => thoughtsSequence(g, [
          'memKiaraThoughts', 'memKiaraNervous', 'memKiaraNormal', 'memKiaraKnow',
          'memKiaraMore', 'memKiaraExcited', 'memKiaraClose', 'memKiaraUs', 'memKiaraDays'
        ], () => g.animate('long-thought-pause', 1.8, () => {}, () => g.thoughts('memKiaraLast', () =>
          g.thoughts('memKiaraReflect', () => g.thoughts('memKiaraFinal', () => g.animate('settle', 2.5, time => {
            g.player.y = 150 + Math.min(time, 1.5); g.player.pose = 'lying'; g.player.dir = 'left';
          }, () => g.finishMemory())))
        ))));
      }
    }, 'flowers')
  });
})(window.VG = window.VG || {});
