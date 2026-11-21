'use strict'

const { escapeHTML, full_url_for, url_for } = require('hexo-util')

hexo.extend.generator.register('legacy-redirects', function (locals) {
  const categories = locals.categories.toArray()
  const routes = new Set([
    ...locals.posts.map(post => this.route.format(post.path)),
    ...locals.pages.map(page => this.route.format(page.path)),
    ...categories.filter(category => category.length).map(category => this.route.format(category.path))
  ])

  const addRedirect = (alias, destination) => {
    const path = this.route.format(alias)
    if (routes.has(path)) return []
    routes.add(path)

    const target = escapeHTML(url_for.call(this, destination))
    const canonical = escapeHTML(full_url_for.call(this, destination))
    const data = `<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="utf-8">
    <link rel="canonical" href="${canonical}">
    <meta http-equiv="refresh" content="0; url=${target}">
    <title>页面已移动</title>
  </head>
  <body>
    <p><a href="${target}">前往新地址</a></p>
  </body>
</html>`

    return [{path, data}]
  }

  const posts = locals.posts.toArray().flatMap(post =>
    [post.redirect_from].flat().flatMap(alias =>
      typeof alias === 'string' && alias.endsWith('.html') ? addRedirect(alias, post.path) : []))
  const legacyArchives = this.theme.config.category_navigation?.legacy_archives || {}
  const categoryDir = this.config.category_dir.replace(/\/+$/, '')
  const archives = Object.entries(legacyArchives).flatMap(([slug, name]) => {
    const category = categories.find(item => !item.parent && item.name === name && item.length)
    return category ? addRedirect(`${categoryDir}/${slug}/`, category.path) : []
  })
  return [...posts, ...archives]
})
