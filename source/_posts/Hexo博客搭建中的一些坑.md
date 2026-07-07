---
title: Hexo博客搭建中的一些坑
date: 2022-08-04 16:26:24
description: 搭博客时遇到的一些常见问题
categories: Blog
top_img: img/Bing/AcadiaSunrise.webp
cover: https://cdn.jsdelivr.net/gh/Human6sa/blog-source@main/themes/butterfly/source/img/Bing/AcadiaSunrise.webp
---

## css无法加载

解决方法：修改_config.yml配置文件
```yaml
url: https://username.github.io/
root: /
```

## 博客语言为英文

解决方法：修改_config.yml配置文件

```yaml
language: zh-CN
```

## 报错 Spawn failed

解决办法：依次输入以下命令
```yaml
rm -rf .deploy_git/

git config --global core.autocrlf false

hexo clean && hexo g && hexo d


```

## 修改字体后无法显示css

解决办法：用hexo clean清空缓存后hexo g -d