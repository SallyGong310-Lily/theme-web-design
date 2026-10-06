/* ============================================================
   雨季 · 新版 页面特效脚本
   三层景深雨 / 阵风摆动 / 雨强起伏 / 溅珠 / 薄雾 / 闪电联动雷声 / 昼夜模式
   ============================================================ */
(() => {
  const stage = document.querySelector('.stage');
  if (!stage) return;

  /* ---------- 注入特效图层 ---------- */
  const layerHTML =
    '<div class="fx-nightsky" aria-hidden="true"></div>' +
    '<div class="fx-mist" aria-hidden="true"></div>' +
    '<div class="fx-ripples" aria-hidden="true"></div>' +
    '<div class="fx-splashes" aria-hidden="true"></div>' +
    '<div class="rain-layer" aria-hidden="true">' +
    '<div class="rl far"></div><div class="rl mid"></div><div class="rl near"></div>' +
    '</div>' +
    '<div class="fx-lightning" aria-hidden="true"></div>';
  stage.insertAdjacentHTML('beforeend', layerHTML);
  const rainLayer = stage.querySelector('.rain-layer');
  const rlFar = stage.querySelector('.rl.far');
  const rlMid = stage.querySelector('.rl.mid');
  const rlNear = stage.querySelector('.rl.near');
  const rippleBox = stage.querySelector('.fx-ripples');
  const splashBox = stage.querySelector('.fx-splashes');
  const mist = stage.querySelector('.fx-mist');
  const lightning = stage.querySelector('.fx-lightning');

  const isReduced = () => document.documentElement.classList.contains('reduced');
  const mobile = window.innerWidth < 640 ? 0.55 : 1; // 小屏减少粒子数

  /* ---------- 三层景深雨 ----------
     远景：细短慢淡，接近雾状；中景：主体；近景：粗长快、虚焦、稀疏
     长度∝速度（运动模糊）；wk=受风系数；perspK=透视收敛强度           */
  const LAYERS = [
    { box: rlFar,  count: 42, w: 0.9, hMin: 22, hMax: 38,  durMin: 1.7, durMax: 2.7, oMin: .16, oMax: .36, blur: 0,    wk: .6,  perspK: 5 },
    { box: rlMid,  count: 26, w: 1.5, hMin: 42, hMax: 68,  durMin: 1.0, durMax: 1.6, oMin: .30, oMax: .58, blur: 0,    wk: 1,   perspK: 8 },
    { box: rlNear, count: 6,  w: 2.8, hMin: 85, hMax: 125, durMin: .55, durMax: .85, oMin: .22, oMax: .42, blur: 1.4,  wk: 1.5, perspK: 12 },
  ];
  LAYERS.forEach(l => l.count = Math.round(l.count * mobile));

  let rainOn = true;
  function buildRain() {
    LAYERS.forEach(l => { l.box.innerHTML = ''; });
    if (!rainOn || isReduced()) return;
    LAYERS.forEach(l => {
      const frag = document.createDocumentFragment();
      for (let i = 0; i < l.count; i++) {
        const d = document.createElement('span');
        d.className = 'drop';
        const x = Math.random() * 106;                 // 横向位置（%）
        const speed = 1 / (l.durMin + Math.random() * (l.durMax - l.durMin));
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

  /* ---------- 阵风 + 雨强起伏（单一 rAF 驱动） ---------- */
  let wind = 9, windTarget = 9, nextGustAt = 0;
  function gustIntensity(t) {
    // 缓慢主周期 + 次周期扰动，模拟一阵大一阵小
    const g = 0.55 + 0.3 * Math.sin(t / 11000) + 0.15 * Math.sin(t / 3700 + 2.1);
    return Math.max(0.12, Math.min(1, g));
  }
  function tick(t) {
    if (rainOn && !isReduced()) {
      // 风：每 4~9 秒换一个目标角度，缓慢逼近（阵风感）
      if (t > nextGustAt) {
        windTarget = -4 + Math.random() * 26;          // -4° ~ 22°
        nextGustAt = t + 4000 + Math.random() * 5000;
      }
      wind += (windTarget - wind) * 0.02;
      rainLayer.style.setProperty('--wind', wind.toFixed(2) + 'deg');
      // 雨强：三层随强度起伏，远处受影响最大
      const g = gustIntensity(t);
      rlFar.style.opacity = (0.4 + 0.6 * g).toFixed(2);
      rlMid.style.opacity = (0.55 + 0.45 * g).toFixed(2);
      rlNear.style.opacity = (0.75 + 0.25 * g).toFixed(2);
      mist.style.opacity = (0.3 + 0.45 * g).toFixed(2);
    }
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);

  /* ---------- 水面涟漪 ---------- */
  function spawnRipple() {
    if (!rainOn || isReduced()) return;
    const r = document.createElement('span');
    r.className = 'ripple';
    r.style.left = 6 + Math.random() * 88 + '%';
    r.style.top = 62 + Math.random() * 30 + '%';
    r.style.animationDelay = Math.random() * 0.4 + 's';
    rippleBox.appendChild(r);
    setTimeout(() => r.remove(), 3200);
  }
  setInterval(spawnRipple, 520);

  /* ---------- 落水溅珠（2~3 粒微水珠抛起） ---------- */
  function spawnSplash() {
    if (!rainOn || isReduced()) return;
    const n = 1 + Math.floor(Math.random() * 2);
    const cx = 6 + Math.random() * 88, cy = 64 + Math.random() * 28;
    for (let i = 0; i < n; i++) {
      const s = document.createElement('span');
      s.className = 'sp';
      s.style.left = cx + '%';
      s.style.top = cy + '%';
      s.style.setProperty('--s', (2 + Math.random() * 1.5).toFixed(1) + 'px');
      s.style.setProperty('--sx', ((Math.random() - 0.5) * 28).toFixed(1) + 'px');
      s.style.setProperty('--sy', (-(6 + Math.random() * 13)).toFixed(1) + 'px');
      s.style.setProperty('--d', (0.35 + Math.random() * 0.25).toFixed(2) + 's');
      splashBox.appendChild(s);
      setTimeout(() => s.remove(), 700);
    }
  }
  setInterval(spawnSplash, 420);

  /* ---------- 闪电（随机调度，联动雷声） ---------- */
  function strike() {
    if (isReduced()) { scheduleNext(); return; }
    lightning.classList.remove('flash');
    void lightning.offsetWidth; // 重启动画
    lightning.classList.add('flash');
    stage.classList.add('flash-bright');
    setTimeout(() => stage.classList.remove('flash-bright'), 450);
    // 雷声在闪光后 1~2.4 秒到达（模拟声速距离感）
    if (typeof RainAudio !== 'undefined') {
      setTimeout(() => RainAudio.thunder(), 1000 + Math.random() * 1400);
    }
    scheduleNext();
  }
  function scheduleNext() {
    setTimeout(strike, 9000 + Math.random() * 13000); // 9~22 秒一次
  }
  setTimeout(strike, 4000 + Math.random() * 3000);

  /* ---------- 白天 / 黑夜模式 ---------- */
  const root = document.documentElement;
  const saved = localStorage.getItem('rainy-mode');
  if (saved === 'night') root.classList.add('night');
  function applyModeBtn(btn) {
    const night = root.classList.contains('night');
    btn.querySelector('.txt').textContent = night ? '白天' : '黑夜';
    btn.setAttribute('aria-pressed', String(night));
  }

  /* ---------- 控制条绑定 ---------- */
  const btnSound = document.getElementById('fx-sound');
  const btnRain = document.getElementById('fx-rain');
  const btnMode = document.getElementById('fx-mode');

  btnSound.addEventListener('click', () => {
    const on = RainAudio.toggle();
    btnSound.setAttribute('aria-pressed', String(on));
  });

  btnRain.addEventListener('click', () => {
    rainOn = !rainOn;
    btnRain.setAttribute('aria-pressed', String(rainOn));
    buildRain();
    if (!rainOn) {
      splashBox.innerHTML = '';
      mist.style.opacity = 0;
    }
  });

  btnMode.addEventListener('click', () => {
    root.classList.toggle('night');
    root.classList.toggle('day');
    localStorage.setItem('rainy-mode', root.classList.contains('night') ? 'night' : 'day');
    applyModeBtn(btnMode);
  });
  applyModeBtn(btnMode);

  buildRain();
})();
