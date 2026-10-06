雨季 / THE RAIN ARCHIVE
概念：雨境档案馆 · 2026-10-02

1. 打开原型
双击 index.html，使用新版 Edge、Chrome、Firefox 或 Safari。HTML 内含全部 CSS、JavaScript 和 SVG 图片，不需要服务器、安装依赖或网络。此交付在 Windows Edge 中实测。

2. 操作
左右按钮或底部三张目录卡切换“听雨 / 入林 / 留白”。将焦点置于体验区后，← / → 切换，Home / End 到首幕或末幕；Tab 依序访问控件，Enter / 空格激活按钮。手机在画面上左右滑动。
画面使用 900ms 自下而上的遮罩揭幕；鼠标移动控制远景、近景植物、雨线三层视差。没有自动轮播。点击“减少动态”立即停用动效；系统 prefers-reduced-motion 为 reduce 时自动关闭遮罩和视差，系统设置优先。
“收下这场雨”打开明信片窗口，填写最多 36 字，保存为本地可编辑 SVG。Esc 关闭窗口，焦点返回原按钮。文字只在当前页面内处理；未接入账号、服务器或收集服务。默认没有音频，“听雨”为视觉章节名称。

3. Figma 与可编辑性
design-desktop-01/02/03.svg：1440×1060，分别为三幕桌面设计稿。
design-mobile.svg：390×1210，移动端设计稿。
将 SVG 拖入 Figma。源文件全部保留 <text>，未将文字转轮廓；图形全部是路径、矩形、椭圆和渐变，未嵌入整张位图。assets 下的 3 张 SVG 可单独编辑。字体使用系统宋体 SimSun、微软雅黑 Microsoft YaHei，不附带字体文件。
部分 Figma 导入流程会把 SVG 文字转轮廓。如需可靠的原生 Text 层，使用附带的 figma-editable-import：在 Figma 桌面版的 Plugins > Development > Import plugin from manifest 选择 manifest.json，再运行“雨季 · 原生文本导入”。如 Figma 要求有效插件 ID，请先用 Create new plugin 创建本地插件，将其自动生成的 id 填入本包 manifest 后再导入。辅助脚本从相同设计数据生成 4 张画板，图形保持矢量，文字单独建立原生 Text 层。入口文件 code.txt 是 UTF-8 JavaScript 源码，manifest 指向它；如你的编辑器要求 .js 后缀，将 code.txt 复制为 code.js 并把 manifest 的 main 改为 code.js。
优先匹配宋体/微软雅黑；缺少时尝试 Noto/思源系列，最后回退 Inter。请在 Figma 中替换缺失的中文字体并检查行高；替换字体可能改变排版。辅助脚本已通过 JavaScript 语法检查，但本次没有登录 Figma 实测，不能声称已完成 Figma 内验证。
Figma 官方原生文字 API 参考：https://developers.figma.com/docs/plugins/working-with-text/

4. 图片与使用范围
assets/rain-01.svg、rain-02.svg、rain-03.svg 为本次从零绘制的原创矢量插画，无第三方图片、远程链接或素材授权依赖；可随本概念稿继续编辑和使用。PNG 为实际原型截图。不存在生成式图片提示词或外部摄影素材。

5. 文件
index.html — 单文件离线交互原型
design-*.svg — 4 张可编辑设计稿
assets/ — 3 张原创本地矢量风景
preview-desktop.png / preview-mobile.png — 浏览器预览
sample-postcard.svg — 下载功能生成示例
figma-editable-import/ — 原生文字导入辅助
DESIGN-NOTES.txt — 设计理念与交互规格
verification.json — 浏览器测试结果
CHECKSUMS.txt — 文件 SHA-256 校验值

原型为品牌概念演示，不含预约、支付、真实营销数据或后台。交付目录中 work/ 为制作过程文件，不包含在交付 ZIP 中。
