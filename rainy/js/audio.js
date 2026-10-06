/* ============================================================
   雨季 · 新版 环境音播放器（开源录音素材）
   用 HTMLAudioElement 播放，file:// 与 http:// 均可出声
   雨声 = 真实雨声录音循环（已响度归一化）
   雷声 = 两段真实雷声随机交替 + 随机变调，随闪电延迟触发
   素材来源与授权见 assets/audio/CREDITS.md
   ============================================================ */
const RainAudio = (() => {
  const RAIN_SRC = 'assets/audio/rain-loop.m4a';
  const THUNDER_SRCS = [
    'assets/audio/thunder-close.m4a',
    'assets/audio/thunder-roll.m4a',
  ];
  const MASTER_VOL = 0.85; // 总音量
  const FADE_MS = 1200;    // 淡入淡出时长

  let rain = null, on = false, fadeTimer = null;

  function init() {
    if (rain) return;
    rain = new Audio(RAIN_SRC);
    rain.loop = true;
    rain.preload = 'auto';
    rain.volume = 0;
  }

  function fade(to, done) {
    clearInterval(fadeTimer);
    const from = rain.volume;
    const t0 = performance.now();
    fadeTimer = setInterval(() => {
      const p = Math.min((performance.now() - t0) / FADE_MS, 1);
      rain.volume = from + (to - from) * p;
      if (p >= 1) { clearInterval(fadeTimer); if (done) done(); }
    }, 50);
  }

  function thunder() {
    if (!on) return;
    const a = new Audio(THUNDER_SRCS[Math.floor(Math.random() * THUNDER_SRCS.length)]);
    a.playbackRate = 0.85 + Math.random() * 0.3;      // 随机变调，避免重复感
    a.volume = MASTER_VOL * (0.75 + Math.random() * 0.25); // 随机强弱
    a.play().catch(() => { /* 浏览器拦截时静默降级 */ });
    a.addEventListener('ended', () => a.remove());
  }

  async function toggle() {
    init();
    if (on) {
      on = false;
      fade(0, () => rain.pause());
    } else {
      try { await rain.play(); } catch (e) { return on; } // 播放失败（无手势等）则不改变状态
      on = true;
      fade(MASTER_VOL);
    }
    return on;
  }

  return { toggle, thunder, get on() { return on; } };
})();
