/* ============================================================
   海洋 · 新版 海景页共享脚本
   1) 氛围层：海面波光（全部）+ 暴风雨雨丝闪电 / 深海气泡（按页）
   2) 悬浮玻璃控制条：海声 / 浪效 / 昼夜
   3) 场景配乐（body[data-audio] 指定）、滚动入场动画、进度条
   ============================================================ */
(() => {
  const reduced = () => document.documentElement.classList.contains('reduced') ||
    (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
  const weather = document.body.dataset.weather || 'calm';

  /* ============ 1. 氛围层 ============ */
  const wrap = document.createElement('div');
  wrap.className = 'fx-ocean';
  wrap.setAttribute('aria-hidden', 'true');
  let inner = '<div class="shimmer"></div><div class="rain"></div><div class="flash"></div><div class="bubbles"></div>';
  wrap.innerHTML = inner;
  document.body.appendChild(wrap);

  // 暴风雨雨丝
  const rain = wrap.querySelector('.rain');
  function buildRain() {
    if (weather !== 'storm' || reduced()) return;
    for (let i = 0; i < 46; i++) {
      const r = document.createElement('i');
      r.style.left = Math.random() * 104 + '%';
      r.style.height = 34 + Math.random() * 40 + 'px';
      r.style.opacity = 0.25 + Math.random() * 0.5;
      r.style.animationDuration = 0.75 + Math.random() * 0.7 + 's';
      r.style.animationDelay = -Math.random() * 2 + 's';
      rain.appendChild(r);
    }
  }
  buildRain();

  // 深海气泡
  const bubbles = wrap.querySelector('.bubbles');
  function spawnBubble() {
    if (weather !== 'deep' || reduced()) return;
    const b = document.createElement('i');
    const s = 2 + Math.random() * 7;
    b.style.left = Math.random() * 98 + '%';
    b.style.width = s.toFixed(1) + 'px';
    b.style.height = s.toFixed(1) + 'px';
    b.style.animationDuration = 6 + Math.random() * 8 + 's';
    b.style.opacity = 0.25 + Math.random() * 0.5;
    bubbles.appendChild(b);
    setTimeout(() => b.remove(), 15000);
  }
  if (weather === 'deep') setInterval(spawnBubble, 420);

  // 暴风雨闪电 → 随机调度
  const flash = wrap.querySelector('.flash');
  function strike() {
    if (!reduced()) {
      flash.classList.remove('flash');
      void flash.offsetWidth;
      flash.classList.add('flash');
    }
    setTimeout(strike, 10000 + Math.random() * 14000);
  }
  if (weather === 'storm') setTimeout(strike, 4000 + Math.random() * 4000);

  /* ============ 2. 场景配乐 ============ */
  const SRC = document.body.dataset.audio;
  let audio = null, on = false, fadeTimer = null;
  function initAudio() {
    if (audio || !SRC) return;
    audio = new Audio(SRC);
    audio.loop = true;
    audio.preload = 'auto';
    audio.volume = 0;
  }
  function fade(to, done) {
    clearInterval(fadeTimer);
    const from = audio.volume, t0 = performance.now();
    fadeTimer = setInterval(() => {
      const p = Math.min((performance.now() - t0) / 900, 1);
      audio.volume = from + (to - from) * p;
      if (p >= 1) { clearInterval(fadeTimer); if (done) done(); }
    }, 50);
  }
  const OceanAudio = {
    toggle() {
      initAudio();
      if (!audio) return false;
      if (on) { on = false; fade(0, () => audio.pause()); }
      else {
        audio.play().catch(() => {});
        on = true;
        fade(0.8);
      }
      return on;
    },
    get on() { return on; },
  };

  /* ============ 3. 悬浮控制条 ============ */
  document.body.insertAdjacentHTML('beforeend',
    '<div class="fx-bar" role="toolbar" aria-label="氛围控制">' +
    '<button id="fx-sound" aria-pressed="false" title="这一片海的白噪音"><svg class="fx-ic" viewBox="0 0 16 16" aria-hidden="true"><path d="M2 9.5q1.5-2 3 0t3 0 3 0 3 0"/><path d="M2 6.5q1.5-2 3 0t3 0 3 0 3 0"/></svg><span class="txt">海声</span></button>' +
    '<button id="fx-waves" aria-pressed="true" title="海面氛围特效开关"><svg class="fx-ic" viewBox="0 0 16 16" aria-hidden="true"><path d="M2.5 11q3-5 5.5-1t5.5-1"/><circle cx="4" cy="4.5" r="1.2"/><circle cx="11.5" cy="3.5" r="0.9"/></svg><span class="txt">浪效</span></button>' +
    '<button id="fx-mode" title="白天 / 黑夜模式切换"><svg class="fx-ic" viewBox="0 0 16 16" aria-hidden="true"><path d="M13.5 9.5A6 6 0 0 1 6.5 2.5a6 6 0 1 0 7 7z"/></svg><span class="txt">黑夜</span></button>' +
    '</div>');

  const btnSound = document.getElementById('fx-sound');
  const btnWaves = document.getElementById('fx-waves');
  const btnMode = document.getElementById('fx-mode');
  const playBtn = document.querySelector('.listen-card .play');
  const playCard = document.querySelector('.listen-card');

  function syncSoundUI() {
    btnSound.setAttribute('aria-pressed', String(OceanAudio.on));
    if (playCard) playCard.classList.toggle('playing', OceanAudio.on);
    if (playBtn) playBtn.setAttribute('aria-pressed', String(OceanAudio.on));
  }
  btnSound.addEventListener('click', () => { OceanAudio.toggle(); syncSoundUI(); });
  if (playBtn) playBtn.addEventListener('click', () => { OceanAudio.toggle(); syncSoundUI(); });

  let fxOn = true;
  btnWaves.addEventListener('click', () => {
    fxOn = !fxOn;
    btnWaves.setAttribute('aria-pressed', String(fxOn));
    wrap.style.display = fxOn ? '' : 'none';
  });

  const root = document.documentElement;
  if (localStorage.getItem('ocean-mode') === 'night') root.classList.add('night');
  function applyModeBtn() {
    const night = root.classList.contains('night');
    btnMode.querySelector('.txt').textContent = night ? '白天' : '黑夜';
    btnMode.setAttribute('aria-pressed', String(night));
  }
  btnMode.addEventListener('click', () => {
    root.classList.toggle('night');
    localStorage.setItem('ocean-mode', root.classList.contains('night') ? 'night' : 'day');
    applyModeBtn();
  });
  applyModeBtn();

  /* ============ 4. 滚动入场 + 进度条 ============ */
  const progress = document.querySelector('.progress');
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); }
  }), { threshold: 0.16 });
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));
  addEventListener('scroll', () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    if (progress) progress.style.width = (max > 0 ? (scrollY / max) * 100 : 0) + '%';
  }, { passive: true });
})();
