/*
 * 효과음 모듈
 * config.js 의 sound.files 에 경로가 있으면 그 파일을, 없으면 내장 합성음을 재생합니다.
 */
window.SFX = (() => {
  const S = window.GAME_CONFIG.sound ?? {};
  const files = S.files ?? {};
  let actx, master;
  let muted = false;
  try { muted = localStorage.getItem("wrongimage-muted") === "1"; } catch {}

  const volume = () => (muted || S.enabled === false ? 0 : S.volume ?? 0.8);

  // 브라우저 정책상 사용자 클릭 이후에 호출해야 소리가 납니다.
  function unlock() {
    if (!actx) {
      actx = new (window.AudioContext || window.webkitAudioContext)();
      master = actx.createGain();
      master.gain.value = volume();
      master.connect(actx.destination);
    }
    if (actx.state === "suspended") actx.resume();
  }

  function playFile(src, vol = 1) {
    const a = new Audio(src);
    a.volume = Math.min(1, volume() * vol);
    a.play().catch(() => {});
    return a;
  }

  // ---------- 합성 도구 ----------
  function tone(freq, start, dur, { type = "sine", vol = 0.2, attack = 0.005, to } = {}) {
    const t = actx.currentTime + start;
    const o = actx.createOscillator();
    const g = actx.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, t);
    if (to) o.frequency.exponentialRampToValueAtTime(to, t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(master);
    o.start(t);
    o.stop(t + dur + 0.05);
  }

  function noiseBuffer(sec) {
    const buf = actx.createBuffer(1, actx.sampleRate * sec, actx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    return buf;
  }

  function noise(start, dur, { type = "bandpass", freq = 1000, to, q = 1, vol = 0.2, attack = 0.005 } = {}) {
    const t = actx.currentTime + start;
    const src = actx.createBufferSource();
    src.buffer = noiseBuffer(dur + 0.1);
    const f = actx.createBiquadFilter();
    f.type = type;
    f.Q.value = q;
    f.frequency.setValueAtTime(freq, t);
    if (to) f.frequency.exponentialRampToValueAtTime(to, t + dur);
    const g = actx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + attack);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(f).connect(g).connect(master);
    src.start(t);
    src.stop(t + dur + 0.1);
  }

  // A 단조 계열 음 (Hz)
  const N = { A3: 220, C4: 261.6, D4: 293.7, E4: 329.6, F4: 349.2, A4: 440, B4: 493.9, C5: 523.3, D5: 587.3, E5: 659.3, F5: 698.5, A5: 880 };

  // ---------- 효과음 ----------
  const synth = {
    // 시작: 낮은 종소리
    start() {
      [1, 2.4, 3.9, 5.4].forEach((m, i) => tone(110 * m, 0, 2.5 - i * 0.4, { vol: 0.18 / (i + 1), attack: 0.01 }));
      noise(0, 1.2, { freq: 400, to: 150, q: 2, vol: 0.06, attack: 0.3 });
    },
    // 정답: 반짝이는 상승음
    correct() {
      tone(N.E5, 0, 0.18, { type: "triangle", vol: 0.25 });
      tone(N.A5, 0.08, 0.3, { type: "triangle", vol: 0.25 });
      tone(N.A5 * 2, 0.14, 0.25, { vol: 0.06 });
    },
    // 오답: 낮게 떨어지는 버저
    wrong() {
      tone(180, 0, 0.3, { type: "square", vol: 0.12, to: 90 });
      tone(185, 0, 0.3, { type: "sawtooth", vol: 0.06, to: 92 });
    },
    // 남은 시간 째깍 (urgent 면 더 높고 큰 소리 + 심장 박동)
    tick(urgent) {
      noise(0, 0.04, { type: "highpass", freq: urgent ? 3500 : 2500, vol: urgent ? 0.35 : 0.2 });
      tone(urgent ? 1600 : 1200, 0, 0.05, { vol: 0.05 });
      if (urgent) {
        tone(60, 0, 0.18, { vol: 0.5, to: 40 });
        tone(55, 0.2, 0.18, { vol: 0.35, to: 38 });
      }
    },
    // 단계 클리어: 단조 아르페지오
    clear() {
      [N.A4, N.C5, N.E5, N.A5].forEach((f, i) => tone(f, i * 0.11, 0.5, { type: "triangle", vol: 0.2 }));
    },
    // 전체 클리어: 조금 더 긴 팡파르
    allClear() {
      [N.A4, N.C5, N.E5, N.A5, N.E5, N.A5].forEach((f, i) => tone(f, i * 0.12, 0.4, { type: "triangle", vol: 0.2 }));
      [N.A4, N.C5, N.E5, N.A5].forEach((f) => tone(f, 0.75, 1.6, { type: "triangle", vol: 0.12, attack: 0.02 }));
    },
    // 귀신: 비명 + 노이즈
    scream() {
      const dur = 1.6;
      noise(0, dur, { freq: 2500, to: 600, q: 3, vol: 0.5, attack: 0.03 });
      const t = actx.currentTime;
      const o = actx.createOscillator();
      o.type = "sawtooth";
      o.frequency.setValueAtTime(1100, t);
      o.frequency.linearRampToValueAtTime(1400, t + 0.15);
      o.frequency.exponentialRampToValueAtTime(250, t + dur);
      const lfo = actx.createOscillator();
      const lfoGain = actx.createGain();
      lfo.frequency.value = 18;
      lfoGain.gain.value = 60;
      lfo.connect(lfoGain).connect(o.frequency);
      const g = actx.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.35, t + 0.03);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g).connect(master);
      [o, lfo].forEach((n) => { n.start(t); n.stop(t + dur); });
      tone(45, 0, 1.2, { type: "sawtooth", vol: 0.4, to: 30 });
    },
  };

  function play(name, ...args) {
    unlock();
    if (files[name]) return playFile(files[name]);
    synth[name]?.(...args);
  }

  // ---------- 배경음 ----------
  let bgm = null;

  function startBgm() {
    if (S.bgm === false || bgm) return;
    unlock();
    if (files.bgm) {
      const a = playFile(files.bgm, 0.5);
      a.loop = true;
      bgm = { stop: () => a.pause(), el: a };
      return;
    }
    const out = actx.createGain();
    out.gain.setValueAtTime(0.0001, actx.currentTime);
    out.gain.exponentialRampToValueAtTime(0.5, actx.currentTime + 2);
    out.connect(master);

    // 낮은 드론 + 천천히 움직이는 필터
    const lp = actx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 300;
    const lfo = actx.createOscillator();
    const lfoGain = actx.createGain();
    lfo.frequency.value = 0.08;
    lfoGain.gain.value = 150;
    lfo.connect(lfoGain).connect(lp.frequency);
    const drones = [55, 55.4, 82.4].map((f) => {
      const o = actx.createOscillator();
      o.type = "sawtooth";
      o.frequency.value = f;
      const g = actx.createGain();
      g.gain.value = 0.08;
      o.connect(g).connect(lp);
      return o;
    });
    lp.connect(out);

    // 바람 소리
    const wind = actx.createBufferSource();
    wind.buffer = noiseBuffer(4);
    wind.loop = true;
    const bp = actx.createBiquadFilter();
    bp.type = "bandpass";
    bp.Q.value = 6;
    bp.frequency.value = 500;
    const windLfo = actx.createOscillator();
    const windLfoGain = actx.createGain();
    windLfo.frequency.value = 0.13;
    windLfoGain.gain.value = 300;
    windLfo.connect(windLfoGain).connect(bp.frequency);
    const windGain = actx.createGain();
    windGain.gain.value = 0.05;
    wind.connect(bp).connect(windGain).connect(out);

    const nodes = [lfo, windLfo, wind, ...drones];
    nodes.forEach((n) => n.start());

    // 가끔 들리는 오르골 음
    const scale = [N.A4, N.C5, N.D5, N.E5, N.F5, N.B4, N.A5];
    const timer = setInterval(() => {
      if (Math.random() < 0.55) {
        const f = scale[Math.floor(Math.random() * scale.length)];
        tone(f, 0, 1.8, { vol: 0.05, attack: 0.01 });
        tone(f * 2.01, 0, 1.2, { vol: 0.015 });
      }
    }, 900);

    bgm = {
      stop() {
        clearInterval(timer);
        const t = actx.currentTime;
        out.gain.cancelScheduledValues(t);
        out.gain.setValueAtTime(out.gain.value, t);
        out.gain.exponentialRampToValueAtTime(0.0001, t + 0.4);
        nodes.forEach((n) => n.stop(t + 0.5));
      },
    };
  }

  function stopBgm() {
    bgm?.stop();
    bgm = null;
  }

  // ---------- 음소거 ----------
  function setMuted(v) {
    muted = v;
    try { localStorage.setItem("wrongimage-muted", v ? "1" : "0"); } catch {}
    if (master) master.gain.setValueAtTime(volume(), actx.currentTime);
    if (bgm?.el) bgm.el.volume = Math.min(1, volume() * 0.5);
  }

  return {
    unlock,
    play,
    startBgm,
    stopBgm,
    isMuted: () => muted,
    toggleMute: () => (setMuted(!muted), muted),
  };
})();
