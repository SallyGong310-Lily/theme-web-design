figma.showUI(__html__, { width: 390, height: 320 });
figma.ui.onmessage = async msg => {
  if (msg.type !== 'import') return;
  let frame;
  try {
    const fonts = await figma.listAvailableFontsAsync();
    const loaded = new Set();
    let substitutions = 0;
    frame = figma.createNodeFromSvg(msg.svg);
    frame.name = `AXIOM / ${msg.name} / editable`;
    frame.x = figma.viewport.center.x - frame.width / 2;
    frame.y = figma.viewport.center.y - frame.height / 2;
    for (const item of msg.texts) {
      const chinese = /[\u3400-\u9fff]/.test(item.text);
      const serif = item.family.startsWith('SimSun');
      const preferences = serif ? ['SimSun', 'Songti SC', 'Noto Serif SC', 'Source Han Serif SC', 'Noto Sans SC', 'Microsoft YaHei', 'Inter'] : chinese ? ['Microsoft YaHei', 'Noto Sans SC', 'PingFang SC', 'Source Han Sans SC', 'Inter'] : item.family.startsWith('Georgia') ? ['Georgia', 'Times New Roman', 'Inter'] : ['Arial', 'Inter'];
      let match;
      for (const family of preferences) {
        const options = fonts.filter(f => f.fontName.family === family);
        match = options.find(f => item.weight >= 600 ? /^(Bold|SemiBold)$/i.test(f.fontName.style) : /^(Regular|Normal|Book)$/i.test(f.fontName.style)) || options[0];
        if (match) break;
      }
      const fontName = match ? match.fontName : { family: 'Inter', style: 'Regular' };
      if (fontName.family !== preferences[0]) substitutions++;
      const key = JSON.stringify(fontName);
      if (!loaded.has(key)) { await figma.loadFontAsync(fontName); loaded.add(key); }
      const node = figma.createText();
      frame.appendChild(node);
      node.name = item.text;
      node.fontName = fontName;
      node.fontSize = item.size;
      node.characters = item.text;
      node.textAutoResize = 'WIDTH_AND_HEIGHT';
      const hex = item.fill.replace('#', '');
      node.fills = [{ type: 'SOLID', color: { r: parseInt(hex.slice(0, 2), 16) / 255, g: parseInt(hex.slice(2, 4), 16) / 255, b: parseInt(hex.slice(4, 6), 16) / 255 } }];
      node.x = item.x;
      node.y = item.y - item.size * 0.86;
    }
    figma.currentPage.selection = [frame];
    figma.viewport.scrollAndZoomIntoView([frame]);
    figma.ui.postMessage({ message: `已导入 ${msg.texts.length} 个可编辑文字层及矢量图形。${substitutions ? '部分字体已替换，请核对字距和基线。' : '请核对文字基线。'}` });
    figma.notify('AXIOM：可编辑画板已创建');
  } catch (e) {
    if (frame) frame.remove();
    figma.ui.postMessage({ message: `导入失败：${e.message || e}` });
  }
};
