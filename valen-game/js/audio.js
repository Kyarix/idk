/* All default music and effects are synthesized locally with Web Audio. */
(function () {
  'use strict';
  const VG = window.VG = window.VG || {};

  // To use your own music, replace null with a relative file path. For example:
  // birthday: 'assets/audio/birthday.mp3'
  // Missing or unsupported files fall back to the synthesized ambience.
  VG.AUDIO_TRACKS = Object.assign({
    birthday: null,  // 'assets/audio/birthday.mp3'
    instagram: null, // 'assets/audio/messages.mp3'
    plaza: null, // 'assets/audio/plaza.mp3'
    flowers: null // 'assets/audio/flowers.mp3'
  }, VG.AUDIO_TRACKS || {});

  // MIDI pitches are just a small original ambient pattern, not a recorded song.
  const MUSIC = {
    birthday: { notes: [60, 64, 67, 71, 67, 64, 62, 67], beat: 0.48, bass: 48 },
    instagram: { notes: [67, null, 71, 74, null, 71, 69, null], beat: 0.64, bass: 43 },
    plaza: { notes: [62, 66, 69, null, 73, 69, 66, null], beat: 0.72, bass: 50 },
    flowers: { notes: [65, null, 69, 72, null, 76, 72, null], beat: 0.84, bass: 41 }
  };
  const frequency = (midi) => 440 * Math.pow(2, (midi - 69) / 12);
  const clampVolume = (value) => Number.isFinite(Number(value)) ? Math.max(0, Math.min(1, Number(value))) : 0.35;

  class AudioSystem {
    constructor(settings = {}, onChange = function () {}) {
      this.volume = clampVolume(settings.volume === undefined ? 0.35 : settings.volume);
      this.muted = Boolean(settings.muted);
      this.onChange = typeof onChange === 'function' ? onChange : function () {};
      this.context = null;
      this.master = null;
      this.musicBus = null;
      this.effectsBus = null;
      this.sceneId = null;
      this.paused = false;
      this.hidden = document.hidden;
      this.timer = null;
      this.media = null;
      this.musicNodes = new Set();
      this.effectNodes = new Set();
      this.lastEffects = {};
      this.generation = 0;
      this.nextNote = 0;
      this.step = 0;
      this.visibilityListener = () => {
        this.hidden = document.hidden;
        this.applyGain();
        if (this.hidden) this.stopMusic();
        else this.startMusic();
      };
      document.addEventListener('visibilitychange', this.visibilityListener);
    }

    get settings() { return { volume: this.volume, muted: this.muted }; }

    // Call from a click, keydown, or pointerdown. Browsers require a user gesture.
    unlock() {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return Promise.resolve(false);
      try {
        if (!this.context) {
          this.context = new AudioContext();
          this.master = this.context.createGain();
          this.musicBus = this.context.createGain();
          this.effectsBus = this.context.createGain();
          this.musicBus.gain.value = 0.28;
          this.effectsBus.gain.value = 0.38;
          this.musicBus.connect(this.master);
          this.effectsBus.connect(this.master);
          this.master.connect(this.context.destination);
          this.applyGain(true);
        }
        const resume = this.context.state === 'suspended' ? this.context.resume() : Promise.resolve();
        return resume.then(() => {
          this.startMusic();
          return true;
        }).catch(() => false);
      } catch (_) { return Promise.resolve(false); }
    }

    setVolume(value) {
      this.volume = clampVolume(value);
      this.applyGain();
      this.onChange(this.settings);
    }

    setMuted(muted) {
      this.muted = Boolean(muted);
      this.applyGain();
      this.onChange(this.settings);
    }

    toggleMute() { this.setMuted(!this.muted); }

    applyGain(immediate = false) {
      const audible = !this.muted && !this.paused && !this.hidden;
      const volume = audible ? this.volume : 0;
      if (this.master && this.context) {
        const gain = this.master.gain;
        gain.cancelScheduledValues(this.context.currentTime);
        if (immediate) gain.setValueAtTime(volume, this.context.currentTime);
        else gain.setTargetAtTime(volume, this.context.currentTime, 0.025);
      }
      if (this.media) this.media.volume = volume * 0.5;
    }

    pause(paused) {
      const next = Boolean(paused);
      if (next === this.paused) return;
      this.paused = next;
      this.applyGain();
      if (next) this.stopMusic();
      else this.startMusic();
    }

    scene(id) {
      const aliases = { flowerField: 'flowers', messages: 'instagram', yogurt: 'plaza' };
      const next = aliases[id] || id;
      if (next === this.sceneId) return;
      this.stopMusic();
      this.sceneId = next;
      this.step = 0;
      this.startMusic();
    }

    startMusic() {
      if (!this.context || this.context.state !== 'running' || this.paused || this.hidden || !MUSIC[this.sceneId]) return;
      if (this.timer !== null || this.media) return;
      const path = VG.AUDIO_TRACKS[this.sceneId];
      if (path) {
        const generation = this.generation;
        const media = new window.Audio();
        media.loop = true;
        media.preload = 'auto';
        this.media = media;
        this.applyGain();
        let failed = false;
        const fallback = () => {
          if (failed || generation !== this.generation || this.media !== media) return;
          failed = true;
          media.onerror = null;
          media.pause();
          media.removeAttribute('src');
          this.media = null;
          this.startSynth();
        };
        media.onerror = fallback;
        media.src = path;
        try {
          const playing = media.play();
          if (playing && playing.catch) playing.catch(fallback);
        } catch (_) { fallback(); }
      } else this.startSynth();
    }

    startSynth() {
      if (!this.context || this.paused || this.hidden || this.timer !== null) return;
      this.nextNote = this.context.currentTime + 0.08;
      this.tickMusic();
      this.timer = window.setInterval(() => this.tickMusic(), 240);
      if (this.sceneId === 'flowers') this.wind();
    }

    tickMusic() {
      const music = MUSIC[this.sceneId];
      if (!music || !this.context || this.context.state !== 'running') return;
      const now = this.context.currentTime;
      if (this.nextNote < now - 0.5) this.nextNote = now + 0.02;
      while (this.nextNote < now + 0.7) {
        const pitch = music.notes[this.step % music.notes.length];
        if (pitch !== null) {
          this.tone(frequency(pitch), this.nextNote, music.beat * 1.8, 0.12, 'sine', true);
          this.tone(frequency(pitch + 12), this.nextNote, music.beat * 0.7, 0.015, 'sine', true);
        }
        if (this.step % 8 === 0) {
          this.tone(frequency(music.bass), this.nextNote, music.beat * 7.7, 0.095, 'sine', true);
        }
        this.nextNote += music.beat;
        this.step += 1;
      }
    }

    tone(hz, when, length, level, type = 'sine', music = false, endHz = null) {
      if (!this.context) return;
      const oscillator = this.context.createOscillator();
      const envelope = this.context.createGain();
      const nodes = music ? this.musicNodes : this.effectNodes;
      const start = Math.max(this.context.currentTime, when);
      oscillator.type = type;
      oscillator.frequency.setValueAtTime(hz, start);
      if (endHz) oscillator.frequency.exponentialRampToValueAtTime(endHz, start + length);
      envelope.gain.setValueAtTime(0, start);
      envelope.gain.linearRampToValueAtTime(level, start + Math.min(0.035, length * 0.2));
      envelope.gain.exponentialRampToValueAtTime(0.0001, start + length);
      oscillator.connect(envelope);
      envelope.connect(music ? this.musicBus : this.effectsBus);
      nodes.add(oscillator);
      oscillator.onended = () => { nodes.delete(oscillator); oscillator.disconnect(); envelope.disconnect(); };
      oscillator.start(start);
      oscillator.stop(start + length + 0.02);
    }

    wind() {
      const context = this.context;
      const buffer = context.createBuffer(1, context.sampleRate * 3, context.sampleRate);
      const channel = buffer.getChannelData(0);
      let previous = 0;
      for (let i = 0; i < channel.length; i += 1) {
        previous = (previous + (Math.random() * 2 - 1) * 0.035) / 1.025;
        channel[i] = previous;
      }
      const source = context.createBufferSource();
      const filter = context.createBiquadFilter();
      const gain = context.createGain();
      filter.type = 'lowpass';
      filter.frequency.value = 450;
      gain.gain.value = 0.14;
      source.buffer = buffer;
      source.loop = true;
      source.connect(filter);
      filter.connect(gain);
      gain.connect(this.musicBus);
      this.musicNodes.add(source);
      source.onended = () => { this.musicNodes.delete(source); source.disconnect(); filter.disconnect(); gain.disconnect(); };
      source.start();
    }

    play(name) {
      if (!this.context || this.context.state !== 'running' || this.muted || this.paused || this.hidden) return;
      const now = this.context.currentTime;
      const minGap = name === 'footstep' ? 0.16 : name === 'dialogue' ? 0.045 : 0.045;
      if (this.lastEffects[name] !== undefined && now - this.lastEffects[name] < minGap) return;
      this.lastEffects[name] = now;
      switch (name) {
        case 'footstep': this.tone(100 + Math.random() * 30, now, 0.045, 0.055, 'triangle', false, 65); break;
        case 'dialogue': this.tone(390 + Math.random() * 70, now, 0.027, 0.038, 'triangle'); break;
        case 'select': this.tone(660, now, 0.065, 0.13, 'sine'); break;
        case 'interact':
          this.tone(440, now, 0.1, 0.1);
          this.tone(550, now + 0.055, 0.1, 0.08);
          break;
        case 'kiss':
          this.tone(659.25, now, 0.42, 0.12);
          this.tone(783.99, now + 0.075, 0.48, 0.085);
          this.tone(987.77, now + 0.12, 0.5, 0.04);
          break;
        case 'wind': break; // The flower-field ambience already contains wind.
        default: break;
      }
    }

    stopMusic() {
      this.generation += 1;
      if (this.timer !== null) { window.clearInterval(this.timer); this.timer = null; }
      if (this.media) {
        this.media.onerror = null;
        this.media.pause();
        this.media.removeAttribute('src');
        this.media = null;
      }
      this.musicNodes.forEach((node) => { try { node.stop(); } catch (_) { /* Already ended. */ } });
      this.musicNodes.clear();
    }

    destroy() {
      this.stopMusic();
      document.removeEventListener('visibilitychange', this.visibilityListener);
      this.effectNodes.forEach((node) => { try { node.stop(); } catch (_) { /* Already ended. */ } });
      this.effectNodes.clear();
      if (this.context) this.context.close().catch(function () {});
    }
  }

  VG.Audio = AudioSystem;
})();
