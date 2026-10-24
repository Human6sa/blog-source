'use strict'

// Keep TeX out of Markdown's emphasis, escape and typography processing.
const escapeHtml = text => text.replace(/[&<>]/g, char => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;'
}[char]))

const displayPatterns = [
  /^ {0,3}\$\$[ \t]*\n([\s\S]*?)\n {0,3}\$\$[ \t]*(?:\n|$)/,
  /^ {0,3}\\\[[ \t]*\n([\s\S]*?)\n {0,3}\\\][ \t]*(?:\n|$)/,
  /^ {0,3}\$\$([^\n]+?)\$\$[ \t]*(?:\n|$)/,
  /^ {0,3}\\\[([^\n]+?)\\\][ \t]*(?:\n|$)/
]

module.exports = [
  {
    name: 'displayMath',
    level: 'block',
    start: source => source.match(/(?:^|\n) {0,3}(?:\$\$|\\\[)/)?.index,
    tokenizer (source) {
      for (const pattern of displayPatterns) {
        const match = pattern.exec(source)
        if (match) return { type: 'displayMath', raw: match[0], text: match[1] }
      }
    },
    renderer: token => `<div class="math-tex">\\[${escapeHtml(token.text)}\\]</div>\n`
  },
  {
    name: 'inlineMath',
    level: 'inline',
    start: source => source.match(/\$|\\\(/)?.index,
    tokenizer (source) {
      const match = /^\$(?![\s$])((?:\\.|[^\\$\n])+?)\$(?!\d)/.exec(source) ||
        /^\\\(([^\n]+?)\\\)/.exec(source)
      if (match && !/\s$/.test(match[1])) {
        return { type: 'inlineMath', raw: match[0], text: match[1] }
      }
    },
    renderer: token => `<span class="math-tex">\\(${escapeHtml(token.text)}\\)</span>`
  }
]
