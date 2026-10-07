/* Optional development QA only. The game itself does not require Node.
 * Uses an installed Chrome/Edge, Python's static server and Node's native CDP
 * WebSocket client. No package installation is needed (Node 22+).
 */
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const { spawn } = require('node:child_process');
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

class Browser {
  constructor() {
    this.nextId = 0;
    this.pending = new Map();
    this.listeners = new Map();
    this.errors = [];
    this.console = [];
    this.serverOutput = '';
    this.closed = false;
  }

  static async launch(options = {}) {
    const browser = new Browser();
    try {
      await browser.launch(options);
      return browser;
    } catch (error) {
      await browser.close();
      throw error;
    }
  }

  async launch(options = {}) {
    if (typeof WebSocket !== 'function') throw new Error('QA requires Node 22+ with native WebSocket.');
    this.project = options.project || path.resolve(__dirname, '..');
    this.port = options.port || 8765;
    this.debugPort = options.debugPort || 9333;
    this.origin = `http://127.0.0.1:${this.port}`;
    this.profile = fs.mkdtempSync(path.join(os.tmpdir(), 'valen-cdp-'));
    const candidates = [
      options.executablePath, process.env.CHROME_BIN, process.env.BROWSER_BIN,
      'C:/Program Files/Google/Chrome/Application/chrome.exe',
      'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
      '/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser',
      '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
    ].filter(Boolean);
    const executable = candidates.find((candidate) => fs.existsSync(candidate));
    if (!executable) throw new Error('Installed Chrome/Edge not found. Set CHROME_BIN to its executable.');

    if (options.server !== false) {
      this.server = spawn(options.python || 'python', ['-u', '-m', 'http.server', String(this.port), '--bind', '127.0.0.1'], {
        cwd: this.project, windowsHide: true, stdio: ['ignore', 'pipe', 'pipe']
      });
      this.server.stdout.on('data', (chunk) => {
        this.serverOutput += chunk.toString();
        if (this.serverOutput.includes('Serving HTTP on')) this.serverReady = true;
      });
      this.server.stderr.on('data', (chunk) => { this.serverOutput += chunk.toString(); });
      this.server.on('error', (error) => { this.serverFailure = error; });
      const serverStart = Date.now();
      while (!this.serverReady && !this.serverFailure && this.server.exitCode === null && Date.now() - serverStart < 12000) await sleep(50);
      if (!this.serverReady || this.serverFailure || this.server.exitCode !== null) {
        throw this.serverFailure || new Error(`QA server could not start: ${this.serverOutput}`);
      }
      await this.waitHTTP(`${this.origin}/index.html`, 12000);
    }

    this.chrome = spawn(executable, [
      '--headless=new', '--disable-gpu', '--no-first-run', '--no-default-browser-check', '--enable-automation',
      '--disable-background-timer-throttling', '--disable-renderer-backgrounding',
      '--remote-debugging-address=127.0.0.1', `--remote-debugging-port=${this.debugPort}`,
      `--user-data-dir=${this.profile}`, '--window-size=1280,800', 'about:blank'
    ], { windowsHide: true, stdio: 'ignore' });
    this.chrome.on('error', (error) => { this.chromeFailure = error; });
    const pages = await this.waitHTTP(`http://127.0.0.1:${this.debugPort}/json`, 15000, true);
    const page = pages.find((candidate) => candidate.type === 'page');
    if (!page) throw new Error('CDP did not expose a browser page.');
    await this.connect(page.webSocketDebuggerUrl);
    const commandLine = await this.command('Browser.getBrowserCommandLine');
    if (!commandLine.arguments.includes(`--user-data-dir=${this.profile}`)) {
      throw new Error(`CDP port ${this.debugPort} belongs to another browser. This helper will not close it.`);
    }
    this.ownsConnection = true;
    this.on('Runtime.exceptionThrown', ({ exceptionDetails }) => {
      this.errors.push(exceptionDetails.exception?.description || exceptionDetails.text || 'Uncaught exception');
    });
    this.on('Runtime.consoleAPICalled', ({ type, args }) => {
      const line = args.map((arg) => arg.value === undefined ? arg.description : String(arg.value)).join(' ');
      this.console.push({ type, text: line });
      if (type === 'error') this.errors.push(line);
    });
    await this.command('Runtime.enable');
    await this.command('Page.enable');
    await this.viewport(options.viewport || { width: 1280, height: 800 });
    await this.navigate(options.url || `${this.origin}/index.html`);
    return this;
  }

  async waitHTTP(url, timeout = 10000, json = false) {
    const start = Date.now();
    while (Date.now() - start < timeout) {
      if (this.serverFailure || this.chromeFailure) throw this.serverFailure || this.chromeFailure;
      try {
        const response = await fetch(url, { signal: AbortSignal.timeout(1000) });
        if (response.ok) return json ? response.json() : response.text();
      } catch (_) { /* Process is still starting. */ }
      await sleep(100);
    }
    throw new Error(`Timed out waiting for ${url}. ${this.serverOutput}`);
  }

  async connect(url) {
    this.socket = new WebSocket(url);
    this.socket.addEventListener('message', (event) => {
      const data = JSON.parse(event.data);
      if (data.id) {
        const pending = this.pending.get(data.id);
        if (!pending) return;
        clearTimeout(pending.timer);
        this.pending.delete(data.id);
        if (data.error) pending.reject(new Error(`${pending.method}: ${data.error.message}`));
        else pending.resolve(data.result);
      } else if (data.method) {
        (this.listeners.get(data.method) || []).forEach((listener) => listener(data.params));
      }
    });
    this.socket.addEventListener('close', () => {
      this.pending.forEach((pending) => { clearTimeout(pending.timer); pending.reject(new Error('CDP connection closed')); });
      this.pending.clear();
    });
    await new Promise((resolve, reject) => {
      this.socket.addEventListener('open', resolve, { once: true });
      this.socket.addEventListener('error', reject, { once: true });
    });
  }

  on(method, callback) {
    if (!this.listeners.has(method)) this.listeners.set(method, []);
    this.listeners.get(method).push(callback);
    return () => this.listeners.set(method, this.listeners.get(method).filter((item) => item !== callback));
  }

  command(method, params = {}, timeout = 15000) {
    const id = ++this.nextId;
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => { this.pending.delete(id); reject(new Error(`CDP timeout: ${method}`)); }, timeout);
      this.pending.set(id, { resolve, reject, timer, method });
      this.socket.send(JSON.stringify({ id, method, params }));
    });
  }

  async evaluate(expression, options = {}) {
    const source = typeof expression === 'function' ? `(${expression.toString()})()` : expression;
    const result = await this.command('Runtime.evaluate', {
      expression: source, returnByValue: true, awaitPromise: true,
      userGesture: Boolean(options.userGesture), ...options
    });
    if (result.exceptionDetails) throw new Error(result.exceptionDetails.exception?.description || result.exceptionDetails.text);
    return result.result.value;
  }

  async waitFor(expression, timeout = 10000) {
    const start = Date.now();
    while (Date.now() - start < timeout) {
      if (await this.evaluate(expression)) return true;
      await sleep(50);
    }
    throw new Error(`Timed out waiting for: ${expression}`);
  }

  async navigate(url) {
    await this.command('Page.navigate', { url });
    await this.waitFor('document.readyState === "complete"');
  }

  async viewport({ width, height, mobile = false, touch = mobile, deviceScaleFactor = 1 }) {
    await this.command('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor, mobile });
    await this.command('Emulation.setTouchEmulationEnabled', { enabled: touch, maxTouchPoints: touch ? 5 : 1 });
  }

  async key(key, options = {}) {
    if (typeof options === 'string') options = { type: options };
    const aliases = { Space: ' ', Esc: 'Escape' };
    key = aliases[key] || key;
    const codes = { Enter: 13, Escape: 27, ' ': 32, ArrowLeft: 37, ArrowUp: 38, ArrowRight: 39, ArrowDown: 40, F1: 112 };
    const code = options.code || (key === ' ' ? 'Space' : /^[a-z]$/i.test(key) ? `Key${key.toUpperCase()}` : /^\d$/.test(key) ? `Digit${key}` : key);
    const keyCode = codes[key] || key.toUpperCase().charCodeAt(0);
    const type = options.type || 'press';
    const params = { key, code, windowsVirtualKeyCode: keyCode, nativeVirtualKeyCode: keyCode };
    if (type === 'press' || type === 'down' || type === 'keyDown') await this.command('Input.dispatchKeyEvent', { ...params, type: 'keyDown' });
    if (options.duration) await sleep(options.duration);
    if (type === 'press' || type === 'up' || type === 'keyUp') await this.command('Input.dispatchKeyEvent', { ...params, type: 'keyUp' });
  }

  async click(selector) {
    const point = await this.evaluate(`(() => { const e = document.querySelector(${JSON.stringify(selector)}); if (!e) throw new Error('Missing element'); const r = e.getBoundingClientRect(); return {x:r.x+r.width/2,y:r.y+r.height/2}; })()`);
    await this.command('Input.dispatchMouseEvent', { type: 'mousePressed', ...point, button: 'left', clickCount: 1 });
    await this.command('Input.dispatchMouseEvent', { type: 'mouseReleased', ...point, button: 'left', clickCount: 1 });
  }

  async screenshot(file) {
    const { data } = await this.command('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
    fs.mkdirSync(path.dirname(path.resolve(file)), { recursive: true });
    fs.writeFileSync(file, Buffer.from(data, 'base64'));
    return path.resolve(file);
  }

  async close() {
    if (this.closed) return;
    this.closed = true;
    if (this.socket && this.socket.readyState === 1) {
      if (this.ownsConnection) await this.command('Browser.close', {}, 1500).catch(() => {});
      this.socket.close();
    }
    // Only the child processes started by this helper are stopped.
    if (this.server && this.server.exitCode === null) this.server.kill();
    if (this.chrome && this.chrome.exitCode === null) this.chrome.kill();
    // Keep the temporary browser profile. The helper never recursively deletes paths.
  }
}

module.exports = { Browser, sleep };

if (require.main === module) {
  (async () => {
    const browser = await Browser.launch();
    try {
      await browser.waitFor('Boolean(window.VG && VG.game)');
      const output = path.join(os.tmpdir(), 'valen-game-qa');
      await browser.screenshot(path.join(output, 'desktop.png'));
      await browser.viewport({ width: 844, height: 390, mobile: true });
      await sleep(300);
      await browser.screenshot(path.join(output, 'mobile-landscape.png'));
      if (browser.errors.length) throw new Error(browser.errors.join('\n'));
      console.log(`Smoke OK. Screenshots: ${output}`);
    } finally { await browser.close(); }
  })().catch((error) => { console.error(error); process.exitCode = 1; });
}
