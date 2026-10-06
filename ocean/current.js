/* ============================================================
   海洋 · 新版 洋流动画驱动
   为等深线路径随机分配流速/虚线/相位，形成分层流动的海流
   ============================================================ */
(() => {
  const reduced = () =>
    document.documentElement.classList.contains('reduced') ||
    (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);

  function dress(svg) {
    if (svg.dataset.flowed) return;
    svg.dataset.flowed = '1';
    svg.querySelectorAll('path').forEach(p => {
      if (p.getAttribute('fill') && p.getAttribute('fill') !== 'none') return; // 跳过实心块
      // 长线段 + 小缺口沿线游动：插画保持可见，洋流感来自移动的缺口
      const period = 180 + Math.random() * 240;                // 一个完整周期（像素）
      const gap = 12 + Math.random() * 16;                     // 游动的缺口长度
      p.style.setProperty('--dash', `${(period - gap).toFixed(0)} ${gap.toFixed(0)}`);
      p.style.setProperty('--dur', (6 + Math.random() * 10).toFixed(1) + 's');
      p.style.setProperty('--del', (-Math.random() * 12).toFixed(1) + 's');
      p.style.setProperty('--off', (-period).toFixed(0));
    });
  }

  function init() { document.querySelectorAll('.scene svg').forEach(dress); }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
