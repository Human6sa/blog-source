const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const test = require('node:test')
const rendererDir = path.dirname(require.resolve('hexo-renderer-marked'))
const { marked } = require(require.resolve('marked', { paths: [rendererDir] }))

marked.use({ extensions: require('../lib/marked-math') })
const render = source => marked(source, { gfm: true, breaks: true, smartypants: true })

test('display equations retain subscripts, backslashes and the KL separator', () => {
  const tex = String.raw`\mathcal{L}_{\mathrm{WM}} = \mathbb{E}_{q_\phi}[p\,\|\,q]`
  const html = render(`$$\n${tex}\n$$`)
  assert.ok(html.includes(tex))
  assert.ok(html.includes('class="math-tex"'))
  assert.ok(!html.includes('<em>'))
})

test('inline math coexists with Chinese text, emphasis and multiple equations', () => {
  const html = render(String.raw`中文 $x_i$ 与 $\beta_{\mathrm{dyn}}$，**重点**。`)
  assert.equal((html.match(/class="math-tex"/g) || []).length, 2)
  assert.ok(html.includes(String.raw`\beta_{\mathrm{dyn}}`))
  assert.ok(html.includes('<strong>重点</strong>'))
})

test('code examples, escaped dollars and ordinary prices remain text', () => {
  const html = render('`$x_i$`\n\n```tex\n$$\nx_i\n$$\n```\n\n\\$5 and $10 and $20')
  assert.ok(html.includes('<code>$x_i$</code>'))
  assert.ok(html.includes('<pre><code class="language-tex">$$\nx_i\n$$'))
  assert.ok(!html.includes('class="math-tex"'))
})

test('bracket delimiters and aligned environments preserve their TeX', () => {
  const tex = String.raw`\begin{aligned} x_i &= 1 \\ y_j &= 2 \end{aligned}`
  const html = render(`\\[\n${tex}\n\\]\n\nInline \\(a_i\\).`)
  assert.ok(html.includes(tex.replaceAll('&', '&amp;')))
  assert.equal((html.match(/class="math-tex"/g) || []).length, 2)
})

test('math text cannot introduce HTML elements', () => {
  const html = render('$$\nx < y & z > 0\n$$')
  assert.ok(html.includes('x &lt; y &amp; z &gt; 0'))
})

test('every display equation in the existing DreamerV3 article survives rendering', () => {
  const source = fs.readFileSync(path.join(__dirname, '../source/_posts/一文七问-DreamerV3.md'), 'utf8')
  const html = render(source.replace(/^---[\s\S]*?---/, ''))
  const equations = [...source.matchAll(/^\$\$\n([\s\S]*?)\n\$\$/gm)]
  assert.equal(equations.length, 5)
  for (const [, tex] of equations) assert.ok(html.includes(tex), `Changed TeX: ${tex}`)
})
