# 数学公式渲染维护说明

2026-10-25 修复。继续使用 `$...$` 行内公式、`$$` 独占行的块级公式，也支持 `\(...\)` 和 `\[...\]`。文章源文件不需要增加转义符。

本次定位到三处问题：

1. Butterfly 升级后等待整个窗口的 `load` 才初始化 MathJax，可能被外部图片拖住。改为 DOM 就绪后初始化，与上游修复方向一致。
2. MathJax 4 的独立字体扩展包被拼接到 cdnjs 的错误目录。数学脚本及字体扩展改为明确的、固定 4.1.3 版本的 npm CDN 地址。
3. Marked 会把 TeX 的下划线解释成 Markdown 强调，或处理反斜线。通过它的扩展接口识别数学片段，将 TeX 原文作为 HTML 文本保留给 MathJax；普通 Markdown 和代码示例仍走原来的解析流程。

`source/js/pangu-init.js` 同时跳过原始数学片段和 MathJax 输出，防止中英文自动空格改变公式内容。

## 检查

在源码根目录执行：

```sh
node --test test/marked-math.test.cjs
npm run clean
npm run build
```

检查 DreamerV3 文章中的 5 个块级公式和 4 个行内公式，尤其是世界模型损失的下标、`\,\|\,` 与行内分箱公式。再检查从首页进入文章、切换到其他文章后返回，以及手机宽度的长公式。

本地 Hexo 服务会缓存模板。修改主题模板或新增 `scripts/` 下的构建脚本后，停止并重新启动服务，再刷新浏览器；只重新运行构建命令不一定会更新正在运行的预览。

MathJax 仍需要网络加载；更换 CDN、升级 MathJax 或主题时，需要同时核对独立字体与扩展包的地址。

本次验收：6 项解析回归测试通过，Hexo 构建通过；浏览器实际生成 9 个公式节点且无公式错误；首页进入、普通文章与公式文章往返均通过。390 像素宽度下长公式可在自身区域横向滚动，页面没有横向溢出。

参考：[上游 MathJax 初始化代码](https://github.com/jerryc127/hexo-theme-butterfly/blob/dev/layout/includes/third-party/math/mathjax.pug)、[MathJax 4 字体与路径](https://docs.mathjax.org/en/latest/output/fonts.html)、[Marked 扩展接口](https://marked.js.org/using_pro#extensions)。
