在 Figma Desktop 中选择 Plugins → Development → Import plugin from manifest，选择本目录 manifest.json，然后运行 ONEIRA 梦境 · 可编辑导入。
导入器把 SVG 矢量保留为原生矢量节点，并重新创建原生 TextNode，确保文字可编辑。
优先使用 Windows 宋体、微软雅黑及 Georgia；缺少字体时自动使用可用字体，需检查中文字形。
SVG 也能直接拖入 Figma；不同 Figma 版本对 SVG text 的导入行为不同，需文字编辑时请使用本导入器。
本工具不连接网络、不上传数据。