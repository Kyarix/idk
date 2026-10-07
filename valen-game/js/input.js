/* Keyboard and touch input. No module loader is required, including on file://. */
(function () {
  'use strict';
  const VG = window.VG = window.VG || {};
  const KEY_ACTIONS = {
    ArrowUp: 'up', KeyW: 'up', ArrowDown: 'down', KeyS: 'down',
    ArrowLeft: 'left', KeyA: 'left', ArrowRight: 'right', KeyD: 'right',
    KeyE: 'interact', Enter: 'interact', Space: 'interact',
    Escape: 'pause', F1: 'debug',
    Digit1: 'digit1', Digit2: 'digit2', Digit3: 'digit3', Digit4: 'digit4'
  };
  const KEY_FALLBACK = {
    w: 'KeyW', a: 'KeyA', s: 'KeyS', d: 'KeyD', e: 'KeyE', ' ': 'Space',
    '1': 'Digit1', '2': 'Digit2', '3': 'Digit3', '4': 'Digit4'
  };

  class Input {
    constructor(root = document) {
      this.root = root;
      this.document = root.ownerDocument || root;
      this.window = this.document.defaultView || window;
      this.held = new Set();
      this.edges = new Set();
      this.pointers = new Map();
      this.listeners = [];
      this.sawTouch = false;
      this.media = this.window.matchMedia('(pointer: coarse)');
      this.touch = this.media.matches;
      this.syncTouchClass();

      this.listen(root, 'keydown', (event) => this.keyDown(event));
      this.listen(root, 'keyup', (event) => this.keyUp(event));
      this.listen(root, 'pointerdown', (event) => this.pointerDown(event), { passive: false });
      this.listen(root, 'pointerup', (event) => this.pointerUp(event));
      this.listen(root, 'pointercancel', (event) => this.pointerUp(event));
      this.listen(root, 'lostpointercapture', (event) => this.pointerUp(event));
      this.listen(this.window, 'blur', () => this.clear());
      this.listen(this.document, 'visibilitychange', () => {
        if (this.document.hidden) this.clear();
      });
      this.mediaListener = () => {
        this.touch = this.sawTouch || this.media.matches;
        this.syncTouchClass();
      };
      if (this.media.addEventListener) this.media.addEventListener('change', this.mediaListener);
      else if (this.media.addListener) this.media.addListener(this.mediaListener);
    }

    listen(target, type, listener, options) {
      target.addEventListener(type, listener, options);
      this.listeners.push(() => target.removeEventListener(type, listener, options));
    }

    syncTouchClass() {
      if (this.document.body) this.document.body.classList.toggle('touch-device', this.touch);
    }

    code(event) {
      return event.code || KEY_FALLBACK[String(event.key).toLowerCase()] || event.key;
    }

    nativeControl(target) {
      return target && target.closest && target.closest(
        'input, textarea, select, button, a[href], [contenteditable=""], [contenteditable="true"]'
      );
    }

    keyDown(event) {
      const code = this.code(event);
      const action = KEY_ACTIONS[code];
      if (!action || event.ctrlKey || event.metaKey || event.altKey) return;
      // Native controls retain their keyboard behavior (volume, menu buttons, etc.).
      if (this.nativeControl(event.target) && action !== 'pause' && action !== 'debug') return;
      event.preventDefault();
      if (!this.held.has(code) && !event.repeat) this.edges.add(action);
      this.held.add(code);
    }

    keyUp(event) {
      this.held.delete(this.code(event));
    }

    pointerDown(event) {
      if (event.pointerType === 'touch') {
        this.sawTouch = true;
        this.touch = true;
        this.syncTouchClass();
      }
      if (event.button !== 0 && event.pointerType !== 'touch') return;
      const button = event.target.closest && event.target.closest(
        '[data-direction], #action-button, [data-action="interact"]'
      );
      if (!button || button.disabled) return;
      const action = button.dataset.direction || 'interact';
      if (!['up', 'down', 'left', 'right', 'interact'].includes(action)) return;
      event.preventDefault();
      if (!this.down(action)) this.edges.add(action);
      this.pointers.set(event.pointerId, { action, button });
      button.classList.add('pressed');
      try { button.setPointerCapture(event.pointerId); } catch (_) { /* Older touch browsers. */ }
    }

    pointerUp(event) {
      const pointer = this.pointers.get(event.pointerId);
      if (!pointer) return;
      this.pointers.delete(event.pointerId);
      const stillPressed = Array.from(this.pointers.values()).some((item) => item.button === pointer.button);
      if (!stillPressed) pointer.button.classList.remove('pressed');
    }

    down(action) {
      for (const code of this.held) if (KEY_ACTIONS[code] === action) return true;
      for (const pointer of this.pointers.values()) if (pointer.action === action) return true;
      return false;
    }

    vector() {
      let x = Number(this.down('right')) - Number(this.down('left'));
      let y = Number(this.down('down')) - Number(this.down('up'));
      if (x && y) { x *= Math.SQRT1_2; y *= Math.SQRT1_2; }
      return { x, y };
    }

    consume(action) {
      const pending = this.edges.has(action);
      this.edges.delete(action);
      return pending;
    }

    clear() {
      this.held.clear();
      this.edges.clear();
      this.pointers.forEach((pointer) => pointer.button.classList.remove('pressed'));
      this.pointers.clear();
    }

    destroy() {
      this.clear();
      this.listeners.forEach((remove) => remove());
      this.listeners = [];
      if (this.media.removeEventListener) this.media.removeEventListener('change', this.mediaListener);
      else if (this.media.removeListener) this.media.removeListener(this.mediaListener);
    }
  }

  VG.Input = Input;
})();
