'use strict'

const path = require('path')
const rendererDir = path.dirname(require.resolve('hexo-renderer-marked'))
const { marked } = require(require.resolve('marked', { paths: [rendererDir] }))

marked.use({ extensions: require('../lib/marked-math') })
