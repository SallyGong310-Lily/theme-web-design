/* ============================================================
   雨季 · 新版 叙事页共享脚本
   1) 全屏氛围层：三层景深雨 + 阵风 + 雨强起伏 + 溅珠 + 薄雾 + 闪电（联动雷声）
   2) 悬浮磨砂玻璃控制条：雨声 / 雨效 / 白天黑夜
   3) 滚动叙事：阅读进度条 / 章节侧导航 / 入场动画 / 轻视差
   依赖：js/audio.js（RainAudio）、css/story.css、css/effects.css（控制条样式）
   ============================================================ */
(() => {
  const reduced = () => document.documentElement.classList.contains('reduced');

  /* ============ 1. 全屏氛围层 ============ */
  const wrap = document.createElement('div');
  wrap.className = 'fx-viewport';
  wrap.setAttribute('aria-hidden', 'true');
  wrap.innerHTML +=
    '<div class="fx-nightsky"></div>' +
    
    '<div class="fx-mist"></div>' +
    '<div class="rain-layer">' +
    '<div class="rl far"></div><div class="rl mid"></div><div class="rl near"></div>' +
    '</div>' +
    '<div class="fx-splashes"></div>' +
    '<div class="fx-lightning"></div>';
  document.body.appendChild(wrap);
  const rainLayer = wrap.querySelector('.rain-layer');
  const rlFar = wrap.querySelector('.rl.far');
  const rlMid = wrap.querySelector('.rl.mid');
  const rlNear = wrap.querySelector('.rl.near');
  const splashBox = wrap.querySelector('.fx-splashes');
  const mist = wrap.querySelector('.fx-mist');
  const lightning = wrap.querySelector('.fx-lightning');

  const mobile = window.innerWidth < 640 ? 0.55 : 1;
  const LAYERS = [
    { box: rlFar,  count: 46, w: 0.9, hMin: 22, hMax: 38,  durMin: 1.7, durMax: 2.7, oMin: .14, oMax: .34, blur: 0,   wk: .6,  perspK: 5 },
    { box: rlMid,  count: 30, w: 1.5, hMin: 42, hMax: 68,  durMin: 1.0, durMax: 1.6, oMin: .26, oMax: .5,  blur: 0,   wk: 1,   perspK: 8 },
    { box: rlNear, count: 7,  w: 2.8, hMin: 85, hMax: 125, durMin: .55, durMax: .85, oMin: .18, oMax: .36, blur: 1.4, wk: 1.5, perspK: 12 },
  ];
  LAYERS.forEach(l => l.count = Math.round(l.count * mobile));

  let rainOn = true;
  function buildRain() {
    LAYERS.forEach(l => { l.box.innerHTML = ''; });
    if (!rainOn || reduced()) return;
    LAYERS.forEach(l => {
      const frag = document.createDocumentFragment();
      for (let i = 0; i < l.count; i++) {
        const d = document.createElement('span');
        d.className = 'drop';
        const x = Math.random() * 106;
        d.style.left = x + '%';
        d.style.setProperty('--w', l.w + 'px');
        d.style.setProperty('--h', Math.round(l.hMin + Math.random() * (l.hMax - l.hMin)) + 'px');
        d.style.setProperty('--o', (l.oMin + Math.random() * (l.oMax - l.oMin)).toFixed(2));
        d.style.setProperty('--d', (l.durMin + Math.random() * (l.durMax - l.durMin)).toFixed(2) + 's');
        d.style.setProperty('--dl', (-Math.random() * 3).toFixed(2) + 's');
        d.style.setProperty('--blur', l.blur + 'px');
        d.style.setProperty('--wk', l.wk);
        d.style.setProperty('--persp', ((x / 106 - 0.5) * l.perspK).toFixed(1) + 'deg');
        frag.appendChild(d);
      }
      l.box.appendChild(frag);
    });
  }

  /* 阵风 + 雨强（单一 rAF） */
  let wind = 9, windTarget = 9, nextGustAt = 0;
  function gustIntensity(t) {
    const g = 0.55 + 0.3 * Math.sin(t / 11000) + 0.15 * Math.sin(t / 3700 + 2.1);
    return Math.max(0.12, Math.min(1, g));
  }
  function tick(t) {
    if (rainOn && !reduced()) {
      if (t > nextGustAt) {
        windTarget = -4 + Math.random() * 26;
        nextGustAt = t + 4000 + Math.random() * 5000;
      }
      wind += (windTarget - wind) * 0.02;
      rainLayer.style.setProperty('--wind', wind.toFixed(2) + 'deg');
      const g = gustIntensity(t);
      rlFar.style.opacity = (0.4 + 0.6 * g).toFixed(2);
      rlMid.style.opacity = (0.55 + 0.45 * g).toFixed(2);
      rlNear.style.opacity = (0.75 + 0.25 * g).toFixed(2);
      mist.style.opacity = (0.25 + 0.4 * g).toFixed(2);
    }
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);

  function spawnSplash() {
    if (!rainOn || reduced()) return;
    const n = 1 + Math.floor(Math.random() * 2);
    for (let i = 0; i < n; i++) {
      const s = document.createElement('span');
      s.className = 'sp';
      s.style.left = 4 + Math.random() * 92 + '%';
      s.style.setProperty('--s', (2 + Math.random() * 1.5).toFixed(1) + 'px');
      s.style.setProperty('--sx', ((Math.random() - 0.5) * 26).toFixed(1) + 'px');
      s.style.setProperty('--sy', (-(5 + Math.random() * 13)).toFixed(1) + 'px');
      s.style.setProperty('--d', (0.35 + Math.random() * 0.25).toFixed(2) + 's');
      splashBox.appendChild(s);
      setTimeout(() => s.remove(), 700);
    }
  }
  setInterval(spawnSplash, 420);

  /* 闪电 → 联动雷声 */
  function strike() {
    if (reduced()) { scheduleNext(); return; }
    lightning.classList.remove('flash');
    void lightning.offsetWidth;
    lightning.classList.add('flash');
    if (typeof RainAudio !== 'undefined') {
      setTimeout(() => RainAudio.thunder(), 1000 + Math.random() * 1400);
    }
    scheduleNext();
  }
  function scheduleNext() {
    setTimeout(strike, 11000 + Math.random() * 15000);
  }
  setTimeout(strike, 5000 + Math.random() * 4000);

  /* ============ 2. 悬浮控制条（磨砂玻璃） ============ */
  document.body.insertAdjacentHTML('beforeend',
    '<div class="fx-bar" role="toolbar" aria-label="氛围控制">' +
    '<button id="fx-sound" aria-pressed="false" title="雨声与间歇雷声（白噪音）"><svg class="fx-ic" viewBox="0 0 16 16" aria-hidden="true"><path d="M2.5 6.5v3M5.5 4.5v7M8.5 3v10M11.5 5v6M14 6.5v3"/></svg><span class="txt">雨声</span></button>' +
    '<button id="fx-rain" aria-pressed="true" title="动态下雨特效开关"><svg class="fx-ic" viewBox="0 0 16 16" aria-hidden="true"><path d="M4.5 2l-2 5M9 2l-2 5M13.5 2l-2 5M4.5 11l-1 3M9 11l-1 3M13.5 11l-1 3"/></svg><span class="txt">雨效</span></button>' +
    '<button id="fx-mode" title="白天 / 黑夜模式切换"><svg class="fx-ic" viewBox="0 0 16 16" aria-hidden="true"><path d="M13.5 9.5A6 6 0 0 1 6.5 2.5a6 6 0 1 0 7 7z"/></svg><span class="txt">黑夜</span></button>' +
    '</div>');

  const btnSound = document.getElementById('fx-sound');
  const btnRain = document.getElementById('fx-rain');
  const btnMode = document.getElementById('fx-mode');

  btnSound.addEventListener('click', () => {
    btnSound.setAttribute('aria-pressed', String(RainAudio.toggle()));
  });
  btnRain.addEventListener('click', () => {
    rainOn = !rainOn;
    btnRain.setAttribute('aria-pressed', String(rainOn));
    buildRain();
    if (!rainOn) { splashBox.innerHTML = ''; mist.style.opacity = 0; }
  });
  const root = document.documentElement;
  if (localStorage.getItem('rainy-mode') === 'night') root.classList.add('night');
  function applyModeBtn() {
    const night = root.classList.contains('night');
    btnMode.querySelector('.txt').textContent = night ? '白天' : '黑夜';
    btnMode.setAttribute('aria-pressed', String(night));
  }
  btnMode.addEventListener('click', () => {
    root.classList.toggle('night');
    root.classList.toggle('day');
    localStorage.setItem('rainy-mode', root.classList.contains('night') ? 'night' : 'day');
    applyModeBtn();
  });
  applyModeBtn();
  buildRain();

  /* ============ 3. 滚动叙事 ============ */
  // 阅读进度条
  const progress = document.querySelector('.progress');
  // 章节侧导航 + 入场动画
  const ways = [...document.querySelectorAll('.chapter-way a')];
  const sections = [...document.querySelectorAll('[data-chapter]')];
  const reveals = [...document.querySelectorAll('.reveal')];

  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.18 });
  reveals.forEach(el => io.observe(el));

  let parallaxItems = [];
  function collectParallax() {
    parallaxItems = [...document.querySelectorAll('.art-wrap img')].map(img => ({
      img,
      wrap: img.closest('.art-wrap'),
    }));
  }
  collectParallax();

  function onScroll() {
    const st = window.scrollY;
    const max = document.documentElement.scrollHeight - innerHeight;
    if (progress) progress.style.width = (max > 0 ? (st / max) * 100 : 0) + '%';

    // 侧导航高亮
    let idx = -1;
    sections.forEach((s, i) => { if (s.getBoundingClientRect().top < innerHeight * 0.45) idx = i; });
    ways.forEach((a, i) => a.classList.toggle('on', i === idx));

    // 轻视差（画面在框内缓移）
    if (!reduced()) {
      parallaxItems.forEach(({ img, wrap }) => {
        const r = wrap.getBoundingClientRect();
        if (r.bottom < 0 || r.top > innerHeight) return;
        const p = (r.top + r.height / 2 - innerHeight / 2) / innerHeight; // -0.5 ~ 0.5
        img.style.transform = `scale(1.12) translateY(${(p * -22).toFixed(1)}px)`;
      });
    }
  }
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();
