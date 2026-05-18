/**
 * Admin new-order: classic **cash register / “cha-ching”** SFX (synthesized).
 * Inspired by typical stock cash-register effects — not copied from any recording
 * (e.g. [YouTube “cash register” clips](https://www.youtube.com/shorts/jydUjMoaOLo) cannot be embedded due to rights).
 *
 * Call `unlockOrderNotificationAudio` after a user tap/key for reliable playback.
 */

let ctx: AudioContext | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return null;
  if (!ctx) ctx = new AC();
  return ctx;
}

export function unlockOrderNotificationAudio(): void {
  const c = getCtx();
  if (c?.state === "suspended") void c.resume();
}

/** Short band-limited noise burst (latch / keys). */
function noiseTick(audioCtx: AudioContext, mix: GainNode, at: number, ms: number, peak: number, hp: number) {
  const n = Math.max(1, Math.floor((audioCtx.sampleRate * ms) / 1000));
  const buf = audioCtx.createBuffer(1, n, audioCtx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < n; i++) {
    d[i] = (Math.random() * 2 - 1) * Math.exp(-i / (n * 0.2));
  }
  const src = audioCtx.createBufferSource();
  const f = audioCtx.createBiquadFilter();
  const g = audioCtx.createGain();
  src.buffer = buf;
  f.type = "highpass";
  f.frequency.value = hp;
  src.connect(f);
  f.connect(g);
  g.connect(mix);
  const end = at + ms / 1000;
  g.gain.setValueAtTime(0.0001, at);
  g.gain.exponentialRampToValueAtTime(peak, at + 0.001);
  g.gain.exponentialRampToValueAtTime(0.0001, end);
  src.start(at);
  src.stop(end + 0.008);
}

/** Single register bell with optional harmonic for “metal till” timbre. */
function registerDing(
  audioCtx: AudioContext,
  mix: GainNode,
  at: number,
  fundamental: number,
  duration: number,
  peak: number,
  withHarmonic: boolean,
) {
  const g = audioCtx.createGain();
  g.connect(mix);

  const env = (node: GainNode, mul: number) => {
    node.gain.setValueAtTime(0.0001, at);
    node.gain.exponentialRampToValueAtTime(peak * mul, at + 0.004);
    node.gain.exponentialRampToValueAtTime(0.0001, at + duration);
  };

  const o1 = audioCtx.createOscillator();
  const g1 = audioCtx.createGain();
  o1.type = "triangle";
  o1.frequency.setValueAtTime(fundamental, at);
  o1.frequency.exponentialRampToValueAtTime(fundamental * 0.88, at + duration * 0.95);
  o1.connect(g1);
  g1.connect(g);
  env(g1, 1);

  let o2: OscillatorNode | null = null;
  if (withHarmonic) {
    o2 = audioCtx.createOscillator();
    const g2 = audioCtx.createGain();
    o2.type = "sine";
    o2.frequency.setValueAtTime(fundamental * 2.01, at);
    o2.frequency.exponentialRampToValueAtTime(fundamental * 2.01 * 0.88, at + duration * 0.9);
    o2.connect(g2);
    g2.connect(g);
    env(g2, 0.22);
  }

  o1.start(at);
  o1.stop(at + duration + 0.02);
  if (o2) {
    o2.start(at);
    o2.stop(at + duration + 0.02);
  }
}

/**
 * Stock-style **cash register** “cha-ching”: latch, low body, two rising bells.
 * @param volume linear gain 0–1
 */
export function playCashRegisterSound(volume = 0.52): void {
  const audioCtx = getCtx();
  if (!audioCtx) return;
  void audioCtx.resume();

  const v = Math.min(1, Math.max(0, volume));
  const t0 = audioCtx.currentTime;
  const mix = audioCtx.createGain();
  mix.gain.value = v * 0.6;
  mix.connect(audioCtx.destination);

  // --- Mechanical body (drawer / platen) ---
  {
    const osc = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(125, t0);
    osc.frequency.exponentialRampToValueAtTime(72, t0 + 0.04);
    osc.connect(g);
    g.connect(mix);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(0.38, t0 + 0.003);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.055);
    osc.start(t0);
    osc.stop(t0 + 0.06);
  }

  noiseTick(audioCtx, mix, t0 + 0.006, 5, 0.16, 1800);
  noiseTick(audioCtx, mix, t0 + 0.018, 4, 0.1, 2200);

  // --- “Cha” — first bell (retail register, mid-bright) ---
  registerDing(audioCtx, mix, t0 + 0.04, 830, 0.065, 0.52, true);

  // --- “Ching” — second bell, higher & longer (classic SFX spacing ~70ms) ---
  registerDing(audioCtx, mix, t0 + 0.118, 1245, 0.14, 0.68, true);

  // --- Tiny “coins” tick on top of ching ---
  noiseTick(audioCtx, mix, t0 + 0.125, 3, 0.08, 4000);
  noiseTick(audioCtx, mix, t0 + 0.152, 3, 0.06, 3800);

  // --- Optional sparkle (very short, many SFX add a tiny ring-off) ---
  registerDing(audioCtx, mix, t0 + 0.248, 2093, 0.045, 0.2, false);

  mix.gain.setValueAtTime(mix.gain.value, t0 + 0.28);
  mix.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.38);
}

export function playNewOrderChime(volume = 0.52): void {
  playCashRegisterSound(volume);
}
