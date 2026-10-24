# Segoe Print 站名图片

首页大标题和导航站名使用 `source/img/site-title-segoe-print.png`。
它是用 Segoe Print Regular 实际字体排版生成的白字透明 PNG，1693 × 251 像素，约 34 KB。
访客直接加载图片，不依赖系统字体；仓库中不包含字体文件。

首页保留 `<h1>`，图片的 `alt` 使用 Hexo 的站名。导航使用同一张图片的透明度作为 CSS 遮罩，让文字颜色随导航的浅色、深色和悬停状态变化。

配置位于 `_config.butterfly.yml` 的 `blog_title_image`。将 `path` 留空即可恢复普通文字标题。
文章标题、栏目名称和正文仍使用原来的文字配置。

## 重新制作

需要 Python 和 Pillow，以及本机可使用的 Segoe Print Regular 字体。图片已提交到源码中后，其他电脑和 GitHub Actions 的正常构建均不需要 Python、Pillow 或此字体。

从博客源码目录执行，按实际字体位置修改 `--font`：

```sh
python3 tools/render-site-title.py --font /path/to/segoepr.ttf
```

修改站名时同时修改 `_config.yml` 的 `title`，并重新制作：

```sh
python3 tools/render-site-title.py --font /path/to/segoepr.ttf --text "新的站名"
```

脚本会打印图片尺寸；同步修改 `blog_title_image.width` 与 `blog_title_image.height`。然后执行 `npm run build`，在本地检查。

只将输出的固定文字图片放进站点，不将字体文件放进公开仓库。
