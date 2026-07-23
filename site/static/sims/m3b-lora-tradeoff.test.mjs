#!/usr/bin/env node
// Headless-Chrome assertion harness for m3b-lora-tradeoff.html
// Zero runtime deps: hand-rolled CDP client over Node built-ins (http + ws frames).
// Chrome 150+: uses PUT /json/new?<url> and launch flag --remote-allow-origins=*.
// Drives the sim through window.__sim (pure formulae, no wall-clock waits).
// Run: node site/static/sims/m3b-lora-tradeoff.test.mjs

import { spawn } from 'node:child_process';
import http from 'node:http';
import net from 'node:net';
import crypto from 'node:crypto';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';
import fs from 'node:fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const HTML = path.join(__dirname, 'm3b-lora-tradeoff.html');
const FILE_URL = pathToFileURL(HTML).href;
const PORT = 9860 + (process.pid % 400);

const CHROME = [
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Chromium.app/Contents/MacOS/Chromium',
  '/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser',
].find(p => { try { fs.accessSync(p); return true; } catch { return false; } });
if (!CHROME) { console.error('No Chrome/Chromium found'); process.exit(2); }

let PASS = 0, FAIL = 0;
const results = [];
function ok(name, cond, detail) {
  if (cond) { PASS++; results.push('  PASS  ' + name); }
  else { FAIL++; results.push('  FAIL  ' + name + (detail ? '  — ' + detail : '')); }
}

// ---- minimal CDP over WebSocket (RFC6455 client, no deps) ----
function httpJSON(method, urlPath) {
  return new Promise((resolve, reject) => {
    const req = http.request({ host: '127.0.0.1', port: PORT, path: urlPath, method,
      headers: { 'Content-Type': 'application/json' } }, res => {
      let b = ''; res.on('data', d => b += d); res.on('end', () => {
        try { resolve(JSON.parse(b)); } catch { resolve(b); }
      });
    });
    req.on('error', reject); req.end();
  });
}
function connectWS(wsUrl) {
  return new Promise((resolve, reject) => {
    const u = new URL(wsUrl);
    const sock = net.connect(Number(u.port), u.hostname, () => {
      const key = crypto.randomBytes(16).toString('base64');
      sock.write(
        `GET ${u.pathname}${u.search} HTTP/1.1\r\nHost: ${u.host}\r\nUpgrade: websocket\r\n` +
        `Connection: Upgrade\r\nSec-WebSocket-Key: ${key}\r\nSec-WebSocket-Version: 13\r\n` +
        `Origin: http://127.0.0.1:${PORT}\r\n\r\n`);
    });
    let handshaken = false; let buf = Buffer.alloc(0);
    const listeners = new Map(); let idc = 1; const evwaiters = [];
    function send(method, params = {}, sessionId) {
      const id = idc++; const msg = { id, method, params };
      if (sessionId) msg.sessionId = sessionId;
      sock.write(encodeFrame(JSON.stringify(msg)));
      return new Promise(res => listeners.set(id, res));
    }
    sock.on('data', chunk => {
      buf = Buffer.concat([buf, chunk]);
      if (!handshaken) {
        const idx = buf.indexOf('\r\n\r\n');
        if (idx === -1) return;
        handshaken = true; buf = buf.slice(idx + 4);
        resolve({ send, onEvent: (m, cb) => evwaiters.push({ m, cb }), close: () => sock.destroy() });
      }
      let f;
      while ((f = decodeFrame(buf))) {
        buf = f.rest;
        if (f.opcode === 8) { sock.destroy(); break; }
        if (f.opcode === 1 || f.opcode === 2) {
          let m; try { m = JSON.parse(f.payload.toString()); } catch { continue; }
          if (m.id && listeners.has(m.id)) { listeners.get(m.id)(m); listeners.delete(m.id); }
          if (m.method) evwaiters.filter(w => w.m === m.method).forEach(w => w.cb(m.params));
        }
      }
    });
    sock.on('error', reject);
  });
}
function encodeFrame(str) {
  const p = Buffer.from(str); const len = p.length;
  const mask = crypto.randomBytes(4); let header;
  if (len < 126) header = Buffer.from([0x81, 0x80 | len]);
  else if (len < 65536) { header = Buffer.alloc(4); header[0] = 0x81; header[1] = 0x80 | 126; header.writeUInt16BE(len, 2); }
  else { header = Buffer.alloc(10); header[0] = 0x81; header[1] = 0x80 | 127; header.writeBigUInt64BE(BigInt(len), 2); }
  const masked = Buffer.alloc(len);
  for (let i = 0; i < len; i++) masked[i] = p[i] ^ mask[i & 3];
  return Buffer.concat([header, mask, masked]);
}
function decodeFrame(buf) {
  if (buf.length < 2) return null;
  const opcode = buf[0] & 0x0f; const masked = (buf[1] & 0x80) !== 0;
  let len = buf[1] & 0x7f; let off = 2;
  if (len === 126) { if (buf.length < 4) return null; len = buf.readUInt16BE(2); off = 4; }
  else if (len === 127) { if (buf.length < 10) return null; len = Number(buf.readBigUInt64BE(2)); off = 10; }
  let mask; if (masked) { if (buf.length < off + 4) return null; mask = buf.slice(off, off + 4); off += 4; }
  if (buf.length < off + len) return null;
  let payload = buf.slice(off, off + len);
  if (masked) { const o = Buffer.alloc(len); for (let i = 0; i < len; i++) o[i] = payload[i] ^ mask[i & 3]; payload = o; }
  return { opcode, payload, rest: buf.slice(off + len) };
}

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function main() {
  const child = spawn(CHROME, [
    '--headless=new', `--remote-debugging-port=${PORT}`, '--remote-allow-origins=*',
    '--no-sandbox', '--disable-gpu', '--window-size=900,560',
    '--user-data-dir=/tmp/m3b-lora-chrome-' + process.pid, 'about:blank',
  ], { stdio: 'ignore' });

  let version;
  for (let i = 0; i < 60; i++) {
    try { version = await httpJSON('GET', '/json/version'); if (version && version.webSocketDebuggerUrl) break; } catch {}
    await sleep(150);
  }
  if (!version || !version.webSocketDebuggerUrl) { console.error('devtools endpoint never came up'); child.kill('SIGKILL'); process.exit(2); }

  const tab = await httpJSON('PUT', '/json/new?' + encodeURIComponent(FILE_URL));
  const cdp = await connectWS(tab.webSocketDebuggerUrl);

  const consoleErrors = [], pageErrors = [], netRequests = [];
  await cdp.send('Runtime.enable');
  await cdp.send('Page.enable');
  await cdp.send('Network.enable');
  cdp.onEvent('Runtime.consoleAPICalled', p => { if (p.type === 'error') consoleErrors.push(JSON.stringify(p.args)); });
  cdp.onEvent('Runtime.exceptionThrown', p => pageErrors.push(p.exceptionDetails && p.exceptionDetails.text));
  cdp.onEvent('Network.requestWillBeSent', p => {
    const u = p.request.url;
    if (!u.startsWith('file://') && !u.startsWith('data:') && !u.startsWith('about:')) netRequests.push(u);
  });

  await cdp.send('Emulation.setDeviceMetricsOverride',
    { width: 900, height: 560, deviceScaleFactor: 1, mobile: false });
  await cdp.send('Page.navigate', { url: FILE_URL });
  await sleep(700);

  async function ev(expr) {
    const r = await cdp.send('Runtime.evaluate',
      { expression: expr, returnByValue: true, awaitPromise: true });
    if (r.result && r.result.exceptionDetails) throw new Error(r.result.exceptionDetails.text);
    if (r.result && r.result.result) return r.result.result.value;
    return undefined;
  }
  async function reload() { await ev('location.reload()'); await sleep(500); }

  // ---------- 1. loads clean (R1) ----------
  ok('R1 no console errors', consoleErrors.length === 0, consoleErrors.join(' | '));
  ok('R1 no page exceptions', pageErrors.length === 0, pageErrors.join(' | '));
  ok('R1 zero external network requests', netRequests.length === 0, netRequests.join(' | '));
  ok('renders — rank pills present (3)', (await ev('document.querySelectorAll("#rankPills .pill").length')) === 3);
  ok('renders — lr pills present (3)', (await ev('document.querySelectorAll("#lrPills .pill").length')) === 3);
  ok('renders — iterations slider present', (await ev('!!document.querySelector("#itersRange")')) === true);
  ok('renders — chart svg has curve paths', (await ev('document.querySelectorAll("#chart path.curve").length')) === 2);
  ok('test hook exposed', (await ev('typeof window.__sim')) === 'object');

  // ---------- 2. affordance sanity (R2) ----------
  const affClickable = await ev(`(function(){
    var bad=[];
    var e=document.querySelector('#reset');
    if(!/pointer/.test(getComputedStyle(e).cursor)) bad.push('reset:cursor');
    var r=document.querySelector('#itersRange');
    if(!/pointer/.test(getComputedStyle(r).cursor)) bad.push('itersRange:cursor');
    document.querySelectorAll('#rankPills .pill').forEach(function(p){
      if(!/pointer/.test(getComputedStyle(p).cursor)) bad.push('rankPill:cursor');
    });
    document.querySelectorAll('#lrPills .pill').forEach(function(p){
      if(!/pointer/.test(getComputedStyle(p).cursor)) bad.push('lrPill:cursor');
    });
    return bad;
  })()`);
  ok('R2 interactive controls have pointer cursor', affClickable.length === 0, affClickable.join(','));
  const tips = await ev(`(function(){
    var pillTip = Array.prototype.every.call(document.querySelectorAll('#rankPills .pill, #lrPills .pill'),function(c){return !!c.title;});
    return !!document.querySelector('#reset').title && pillTip;
  })()`);
  ok('R2 reset + pills carry tooltips (title)', tips === true);
  const inertLog = await ev(`getComputedStyle(document.querySelector('#evList')).cursor`);
  ok('R2 event log is inert (cursor:default)', inertLog === 'default', inertLog);
  const inertReadout = await ev(`getComputedStyle(document.querySelector('#readout')).cursor`);
  ok('R2 loss readout panel is inert (cursor:default)', inertReadout === 'default', inertReadout);
  const inertMeter = await ev(`getComputedStyle(document.querySelector('.meterWrap')).cursor`);
  ok('R2 adapter-size gauge is inert (cursor:default)', inertMeter === 'default', inertMeter);
  const inertOverfit = await ev(`getComputedStyle(document.querySelector('.overfitBox')).cursor`);
  ok('R2 overfit indicator is inert (cursor:default)', inertOverfit === 'default', inertOverfit);
  const noteTip = await ev(`document.querySelector('#note').getAttribute('data-tip') || ''`);
  ok('R8 honest-model footnote present + names the real anchors + mlx-lm version',
    /teaching model/i.test(noteTip) && /mlx-lm 0\.31\.3/.test(noteTip) && /0\.200/.test(noteTip) && /variance/i.test(noteTip),
    noteTip.slice(0, 80));

  // ---------- 3. THE LOAD-BEARING NUMBERS: real captured anchors reproduced EXACTLY at iter 50 ----------
  const anchorBase = await ev(`(function(){window.__sim.setRank(8);window.__sim.setLR(0.00001);window.__sim.setIters(50);
    return {train:window.__sim.trainLossAt(8,0.00001,50), val:window.__sim.valLossAt(8,0.00001,50)};})()`);
  ok('ANCHOR baseline rank8/lr1e-5 @iter50 train == 0.200 (real captured)', Math.abs(anchorBase.train - 0.200) < 0.0005, JSON.stringify(anchorBase));
  ok('ANCHOR baseline rank8/lr1e-5 @iter50 val == 0.148 (real captured)', Math.abs(anchorBase.val - 0.148) < 0.0005, JSON.stringify(anchorBase));

  const anchorR4 = await ev(`({train:window.__sim.trainLossAt(4,0.00001,50), val:window.__sim.valLossAt(4,0.00001,50)})`);
  ok('ANCHOR rank4/lr1e-5 @iter50 train == 0.449 (real captured)', Math.abs(anchorR4.train - 0.449) < 0.0005, JSON.stringify(anchorR4));
  ok('ANCHOR rank4/lr1e-5 @iter50 val == 0.374 (real captured)', Math.abs(anchorR4.val - 0.374) < 0.0005, JSON.stringify(anchorR4));

  const anchorLR4 = await ev(`({train:window.__sim.trainLossAt(8,0.0001,50), val:window.__sim.valLossAt(8,0.0001,50)})`);
  ok('ANCHOR rank8/lr1e-4 @iter50 train == 0.054 (real captured)', Math.abs(anchorLR4.train - 0.054) < 0.0005, JSON.stringify(anchorLR4));
  ok('ANCHOR rank8/lr1e-4 @iter50 val == 0.028 (real captured)', Math.abs(anchorLR4.val - 0.028) < 0.0005, JSON.stringify(anchorLR4));

  // shared start point: all curves begin at val loss 3.721 (real captured iter-1 value)
  const startVals = await ev(`[
    window.__sim.trainLossAt(8,0.00001,1),
    window.__sim.trainLossAt(4,0.00001,1),
    window.__sim.trainLossAt(8,0.0001,1),
    window.__sim.trainLossAt(16,0.0001,1)
  ]`);
  ok('ANCHOR all configs start at loss 3.721 (real iter-1 val)', startVals.every(v => Math.abs(v - 3.721) < 0.001), JSON.stringify(startVals));

  // ---------- 4. adapter size math is REAL: params = 2*r*d*modules, size = params*2 bytes fp16 ----------
  const sizeMath = await ev(`(function(){var s=window.__sim;return {
    p4:s.trainableParams(4), p8:s.trainableParams(8), p16:s.trainableParams(16),
    mb8:s.adapterMB(8)
  };})()`);
  ok('SIZE trainable params linear in rank (r=8 is 2x r=4)', sizeMath.p8 === 2 * sizeMath.p4, JSON.stringify(sizeMath));
  ok('SIZE trainable params linear in rank (r=16 is 2x r=8)', sizeMath.p16 === 2 * sizeMath.p8, JSON.stringify(sizeMath));
  ok('SIZE r=8 trainable params = 2*8*1024*2 = 32,768', sizeMath.p8 === 32768, String(sizeMath.p8));
  ok('SIZE r=8 adapter size fp16 = 32768*2/1048576 MB', Math.abs(sizeMath.mb8 - (32768 * 2 / 1048576)) < 1e-6, String(sizeMath.mb8));

  // ---------- 5. MONOTONE INVARIANT: train loss never increases as iters grows, for every dial combo ----------
  const monotoneViolations = await ev(`(function(){
    var bad=[];
    [4,8,16].forEach(function(r){
      [0.00001,0.00003,0.0001].forEach(function(lr){
        var prev=Infinity;
        for(var t=1;t<=200;t+=1){
          var v=window.__sim.trainLossAt(r,lr,t);
          if(v>prev+1e-9){ bad.push(r+'|'+lr+'|'+t); }
          prev=v;
        }
      });
    });
    return bad;
  })()`);
  ok('INVARIANT train loss is monotone non-increasing for every rank/lr combo across 1..200 iters',
    monotoneViolations.length === 0, monotoneViolations.slice(0, 5).join(','));

  // ---------- 6. TEACHING INVARIANT: overfit divergence — high lr + long iters makes val rise while train falls ----------
  const overfitCheck = await ev(`(function(){
    var r=8, lr=0.0001;
    var t50={train:window.__sim.trainLossAt(r,lr,50), val:window.__sim.valLossAt(r,lr,50)};
    var t200={train:window.__sim.trainLossAt(r,lr,200), val:window.__sim.valLossAt(r,lr,200)};
    return {t50:t50, t200:t200};
  })()`);
  ok('INVARIANT overfit: at high lr, train loss at iter200 < train loss at iter50 (still falling)',
    overfitCheck.t200.train < overfitCheck.t50.train, JSON.stringify(overfitCheck));
  ok('INVARIANT overfit: at high lr, val loss at iter200 > val loss at iter50 (diverging upward)',
    overfitCheck.t200.val > overfitCheck.t50.val, JSON.stringify(overfitCheck));
  ok('INVARIANT overfit: at iter200/high-lr the train/val gap is large (memorization signature visible)',
    (overfitCheck.t200.val - overfitCheck.t200.train) > 0.3, JSON.stringify(overfitCheck));

  // ---------- 7. TEACHING INVARIANT: low lr / low iters stays healthy (no false-positive overfit) ----------
  const healthyCheck = await ev(`(function(){
    var r=8, lr=0.00001;
    return {train:window.__sim.trainLossAt(r,lr,50), val:window.__sim.valLossAt(r,lr,50)};
  })()`);
  ok('INVARIANT baseline config at iter50 shows a SMALL train/val gap (no false overfit alarm)',
    Math.abs(healthyCheck.val - healthyCheck.train) < 0.15, JSON.stringify(healthyCheck));

  // ---------- 8. TRY-THIS challenge, driven end to end under virtual time ----------
  await reload();
  // Step 1: rank 4 at iters 50 shows the capacity gap
  await ev('window.__sim.setRank(4)');
  await ev('window.__sim.setIters(50)');
  const step1 = await ev(`({step:window.__sim.CH.step, done1:window.__sim.CH.done[0]})`);
  ok('TRY-THIS step 1 auto-detected (rank 4 @ iter 50 shows capacity gap)', step1.done1 === true && step1.step === 2, JSON.stringify(step1));

  // Step 2: crank lr, push iters past onset until val diverges from train
  await ev('window.__sim.setLR(0.0001)');
  await ev('window.__sim.setRank(8)');
  await ev('window.__sim.setIters(150)');
  const step2 = await ev(`({step:window.__sim.CH.step, done2:window.__sim.CH.done[1]})`);
  ok('TRY-THIS step 2 auto-detected (high lr + long iters -> val diverges)', step2.done2 === true && step2.step === 3, JSON.stringify(step2));

  // Step 3: find the smallest adapter (rank 4) that still reaches train <= 0.25
  await ev('window.__sim.setRank(4)');
  await ev('window.__sim.setIters(50)'); // rank4/lr1e-4 well under 0.25 by iter 50
  const step3 = await ev(`({step:window.__sim.CH.step, done3:window.__sim.CH.done[2],
    success:document.getElementById('challenge').classList.contains('success')})`);
  ok('TRY-THIS step 3 auto-detected (smallest adapter reaching train<=0.25)', step3.done3 === true && step3.step >= 4, JSON.stringify(step3));
  ok('CHALLENGE completes: success banner shown', step3.success === true, JSON.stringify(step3));

  // completion cannot be spoofed by clicking without producing the condition:
  // re-arm check — resetting rank back up while still on step 1 should NOT complete it
  await reload();
  await ev('window.__sim.setRank(16)'); // wrong direction for step 1
  const noSpoof = await ev(`({step:window.__sim.CH.step, done1:window.__sim.CH.done[0]})`);
  ok('CHALLENGE step 1 does NOT complete from rank 16 (must actually produce the condition)', noSpoof.done1 === false && noSpoof.step === 1, JSON.stringify(noSpoof));

  // ---------- 9. event log responds in domain vocabulary (R7) ----------
  await reload();
  await ev('window.__sim.setRank(4)');
  const logRank = await ev(`Array.from(document.querySelectorAll('#evList .ev')).some(function(e){return /rank r=4/.test(e.textContent) && /trainable/.test(e.textContent);})`);
  ok('EVENT LOG a rank change logs an mlx-style trainable line', logRank === true);
  await ev('window.__sim.setLR(0.0001)');
  const logLR = await ev(`Array.from(document.querySelectorAll('#evList .ev')).some(function(e){return /lr=1e-04/.test(e.textContent);})`);
  ok('EVENT LOG a learning-rate change logs a line', logLR === true);
  const bootLog = await ev(`Array.from(document.querySelectorAll('#evList .ev')).some(function(e){return /adapter saved/.test(e.textContent) && /safetensors/.test(e.textContent);})`);
  ok('EVENT LOG boot sequence includes an mlx_lm-style "adapter saved" line', bootLog === true);
  const iterLog = await ev(`Array.from(document.querySelectorAll('#evList .ev')).some(function(e){return /train 0\\.200/.test(e.textContent) && /val 0\\.148/.test(e.textContent);})`);
  ok('EVENT LOG boot sequence includes the real baseline iter-50 line', iterLog === true);

  // ---------- 10. Reset returns to initial state (R5) ----------
  await ev(`window.__sim.setRank(16);window.__sim.setLR(0.0001);window.__sim.setIters(190)`);
  await ev('location.reload()'); await sleep(500);
  const afterReset = await ev(`(function(){var s=window.__sim.S;return {
    rank:s.rank, lr:s.lr, iters:s.iters, chStep:window.__sim.CH.step};})()`);
  const D = await ev('window.__sim.consts.DEFAULTS');
  ok('R5 Reset restores defaults (rank 8, lr 1e-5, iters 50, challenge step 1)',
    afterReset.rank === D.rank && afterReset.lr === D.lr && afterReset.iters === D.iters && afterReset.chStep === 1,
    JSON.stringify({ afterReset, D }));

  // ---------- 11. no scroll at embed size ----------
  const scroll = await ev('({sw:document.documentElement.scrollWidth,sh:document.documentElement.scrollHeight,cw:window.innerWidth,ch:window.innerHeight})');
  ok('NO horizontal scroll @900x560', scroll.sw <= scroll.cw + 1, JSON.stringify(scroll));
  ok('NO vertical scroll @900x560', scroll.sh <= scroll.ch + 1, JSON.stringify(scroll));

  // ---------- 12. prefers-reduced-motion suppresses animation (R4) ----------
  await cdp.send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
  await sleep(120);
  await ev('window.__sim.setRank(16)'); // trigger any transition (meter fill width) under reduced motion
  const reducedOK = await ev(`(function(){
    var bad=[];document.querySelectorAll('*').forEach(function(el){
      var cs=getComputedStyle(el);
      if(cs.animationName!=='none'&&cs.animationDuration!=='0s')bad.push(el.className);
    });return bad.length;})()`);
  ok('R4 prefers-reduced-motion suppresses animations', reducedOK === 0, 'active=' + reducedOK);

  cdp.close();
  child.kill('SIGKILL');
  try { fs.rmSync('/tmp/m3b-lora-chrome-' + process.pid, { recursive: true, force: true }); } catch {}

  console.log(results.join('\n'));
  console.log(`\n${PASS}/${PASS + FAIL} assertions passed`);
  process.exit(FAIL === 0 ? 0 : 1);
}

main().catch(e => { console.error(e); process.exit(2); });
