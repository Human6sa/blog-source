'use strict'

const warnedReferences = new Set()
const isMapping = value => value && typeof value === 'object' && !Array.isArray(value)

hexo.extend.helper.register('categoryNavigation', function (page, pageType) {
  const overviewPath = `${this.config.category_dir.replace(/\/+$/, '')}/`
  const settings = this.theme.category_navigation || {}
  const categories = this.site.categories.sort('name').toArray().filter(category => category.length)
  const byId = new Map(categories.map(category => [category._id, category]))
  const byParent = new Map()
  for (const category of categories) {
    if (!byParent.has(category.parent)) byParent.set(category.parent, [])
    byParent.get(category.parent).push(category)
  }
  const rootCategories = categories.filter(category => !category.parent)
  const uncategorized = this.site.posts.sort('-date').toArray()
    .filter(post => !post.categories.length)
  const uncategorizedCategory = uncategorized.length ? {
    _id: Symbol('uncategorized'),
    name: '未分类',
    path: `${overviewPath}#category-uncategorized`
  } : null

  const isPost = pageType === 'post'
  const isOverview = pageType === 'categories'
  const hasSidebar = isPost || pageType === 'category' || isOverview
  let currentCategory

  if (isPost) {
    const postCategories = page.categories.toArray()
    const parents = new Set(postCategories.map(category => category.parent))
    currentCategory = postCategories.find(category => !parents.has(category._id)) || uncategorizedCategory
  } else if (pageType === 'category') {
    // The generator uses this base on every page of a category, including nested categories.
    currentCategory = categories.find(category => category.path === page.base)
  }

  const ancestorsOf = category => {
    const ancestors = []
    for (let current = category; current; current = byId.get(current.parent)) ancestors.push(current)
    return ancestors
  }
  const activePath = ancestorsOf(currentCategory)
  const activeIds = new Set(activePath.map(category => category._id))
  const browseCategories = uncategorizedCategory ? [...rootCategories, uncategorizedCategory] : rootCategories

  const resolveCategory = reference => {
    if (typeof reference === 'string') {
      const name = reference.trim()
      const category = rootCategories.find(item => item.name === name) ||
        categories.find(item => ancestorsOf(item).reverse().map(part => part.name).join('/') === name) ||
        (name === '未分类' ? uncategorizedCategory : null)
      if (category) return category
      // The built-in 未分类 entry is optional when every post has a category.
      if (name === '未分类') return null
    }
    const key = String(reference)
    if (!warnedReferences.has(key)) {
      warnedReferences.add(key)
      hexo.log.warn(`category_navigation: unknown category "${key}"`)
    }
    return null
  }

  const configuredTabs = isMapping(settings.top)
    ? Object.entries(settings.top).flatMap(([name, reference]) => {
        const category = resolveCategory(reference)
        return category ? [{name, category}] : []
      })
    : browseCategories.map(category => ({name: category.name, category}))
  const activeTab = activePath.find(category =>
    configuredTabs.some(item => item.category._id === category._id))
  const isCurrentCategoryPage = category => pageType === 'category' &&
    currentCategory?._id === category._id && !(page.current > 1)

  const createPostLink = post => ({
    name: post.sidebar_title || post.title,
    path: post.path,
    current: isPost && post._id === page._id ? 'page' : null
  })

  // Sidebar branches organize posts without creating additional Hexo categories.
  const createPostNodes = (category, posts) => {
    const branches = new Map()
    const leaves = []
    for (const post of posts) {
      const branch = typeof post.category_branch === 'string' && post.category_branch.trim()
      if (!branch) {
        leaves.push(createPostLink(post))
        continue
      }
      if (!branches.has(branch)) branches.set(branch, [])
      branches.get(branch).push(post)
    }

    const preferred = settings.branch_order?.[category.name]
    const order = new Map((Array.isArray(preferred) ? preferred : []).map((name, i) => [name, i]))
    const defaultOrder = Number.MAX_SAFE_INTEGER
    const rank = name => order.get(name) ?? defaultOrder
    const postRank = post => Number.isFinite(post.sidebar_order) ? post.sidebar_order : defaultOrder
    const branchNodes = [...branches].sort(([a], [b]) => rank(a) - rank(b)).map(([name, articles]) => {
      const entry = articles.find(post => post.category_entry === true) || articles.at(-1)
      return {
        ...createPostLink(entry),
        name,
        active: isPost && articles.some(post => post._id === page._id),
        children: articles.filter(post => post._id !== entry._id)
          .sort((a, b) => postRank(a) - postRank(b))
          .map(createPostLink)
      }
    })
    return [...branchNodes, ...leaves]
  }

  const createCategoryNode = (category, name = category.name) => {
    const children = byParent.get(category._id) || []
    const nestedPosts = new Set(children.flatMap(child => child.posts.toArray().map(post => post._id)))
    const posts = category === uncategorizedCategory ? uncategorized : category.posts.sort('-date').toArray()
    const directPosts = posts.filter(post => !nestedPosts.has(post._id))
    // Root categories link to the archive. A nested category opens its entry article.
    const entry = category.parent
      ? directPosts.find(post => post.category_entry === true) || directPosts.at(-1) || posts.at(-1)
      : null
    return {
      name,
      path: entry ? entry.path : category.path,
      active: activeIds.has(category._id),
      current: (entry ? isPost && entry._id === page._id : isCurrentCategoryPage(category)) ? 'page' : null,
      children: [
        ...children.map(child => createCategoryNode(child)),
        ...createPostNodes(category, directPosts.filter(post => post._id !== entry?._id))
      ]
    }
  }

  const createConfiguredTree = mapping => {
    return Object.entries(mapping).flatMap(([name, value]) => {
      if (isMapping(value)) {
        const children = createConfiguredTree(value)
        return children.length ? [{name, children, active: children.some(child => child.active)}] : []
      }
      const category = resolveCategory(value)
      return category ? [createCategoryNode(category, name)] : []
    })
  }

  return {
    overviewPath,
    tabs: [
      { name: '全部分类', path: overviewPath, current: isOverview ? 'page' : null },
      ...configuredTabs.map(({name, category}) => ({
        name,
        path: category.path,
        current: category._id === activeTab?._id
          ? (isCurrentCategoryPage(category) ? 'page' : 'location')
          : null
      }))
    ],
    sidebar: hasSidebar ? {
      title: isPost ? '分类导航' : '分类索引',
      links: isMapping(settings.sidebar)
        ? createConfiguredTree(settings.sidebar)
        : browseCategories.map(category => createCategoryNode(category))
    } : null,
    uncategorized
  }
})
