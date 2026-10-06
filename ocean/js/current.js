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
      const period = 60 + Math.random() * 160;                 // 虚线周期
      const dash = (3 + Math.random() * 9).toFixed(1) + ' ' + period.toFixed(0);
      p.style.setProperty('--dash', dash);
      p.style.setProperty('--dur', (7 + Math.random() * 13).toFixed(1) + 's');
      p.style.setProperty('--del', (-Math.random() * 16).toFixed(1) + 's');
      p.style.setProperty('--off', -(200 + Math.random() * 500).toFixed(0));
    });
  }

  function init() { document.querySelectorAll('.scene svg').forEach(dress); }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
